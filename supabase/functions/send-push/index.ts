import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT")!,
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!
);

serve(async (req) => {
  try {
    const payload = await req.json();
    const { type, table, record } = payload;

    // Only handle INSERTs
    if (type !== "INSERT") {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    // Determine who performed the action
    const actor = getActor(table, record);
    if (!actor) {
      return new Response(JSON.stringify({ error: "no actor" }), {
        status: 200,
      });
    }

    // Notify the other person
    const recipient = actor === "michael" ? "chloe" : "michael";

    // Build notification
    const notification = buildNotification(table, record, actor);

    // Get recipient's push subscriptions
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { db: { schema: "chloesvault" } }
    );

    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_role", recipient);

    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
    }

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub: any) => {
        const pushSub = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys_p256dh,
            auth: sub.keys_auth,
          },
        };

        try {
          await webpush.sendNotification(
            pushSub,
            JSON.stringify(notification)
          );
          return 201;
        } catch (err: any) {
          return err.statusCode || 500;
        }
      })
    );

    // Clean up expired subscriptions (410 Gone)
    const goneEndpoints = subscriptions
      .filter((_: any, i: number) => {
        const result = results[i];
        return (
          result.status === "fulfilled" &&
          (result.value === 410 || result.value === 404)
        );
      })
      .map((s: any) => s.endpoint);

    if (goneEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", goneEndpoints);
    }

    return new Response(
      JSON.stringify({
        sent: results.filter((r) => r.status === "fulfilled").length,
        cleaned: goneEndpoints.length,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("send-push error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
    });
  }
});

function getActor(
  table: string,
  record: any
): "michael" | "chloe" | null {
  switch (table) {
    case "messages":
    case "recommendations":
    case "poems":
      return record.from_user;
    case "moments":
    case "topics":
    case "quotes":
    case "icks":
    case "vault_notes":
    case "nightmares":
      return record.added_by;
    default:
      return null;
  }
}

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function buildNotification(table: string, record: any, actor: string) {
  const name = capitalize(actor);

  switch (table) {
    case "messages":
      if (record.type === "voice")
        return { title: name, body: "Sent a voice note", url: "/chat", tag: "message" };
      if (record.type === "image")
        return { title: name, body: "Sent a photo", url: "/chat", tag: "message" };
      if (record.type === "gif")
        return { title: name, body: "Sent a GIF", url: "/chat", tag: "message" };
      return {
        title: name,
        body: record.text?.slice(0, 100) || "Sent a message",
        url: "/chat",
        tag: "message",
      };
    case "moments":
      return { title: name, body: `Added a moment: ${record.title}`, url: "/vault/moments", tag: "vault" };
    case "recommendations":
      return { title: name, body: `Recommended: ${record.title}`, url: "/vault/recommendations", tag: "vault" };
    case "topics":
      return { title: name, body: `Added a topic: ${record.text?.slice(0, 80)}`, url: "/vault/topics", tag: "vault" };
    case "quotes":
      return { title: name, body: `"${record.text?.slice(0, 80)}"`, url: "/vault/quotes", tag: "vault" };
    case "icks":
      return { title: name, body: `Added an ick: ${record.text?.slice(0, 80)}`, url: `/vault/icks/${record.about}`, tag: "vault" };
    case "poems":
      return { title: name, body: `Wrote you a poem: ${record.title}`, url: "/vault/poems", tag: "vault" };
    case "vault_notes":
      return { title: name, body: `Added a note: ${record.text?.slice(0, 80)}`, url: "/vault/notes", tag: "vault" };
    case "nightmares":
      return { title: name, body: `Added a nightmare: ${record.text?.slice(0, 80)}`, url: `/vault/nightmares/${record.about}`, tag: "vault" };
    default:
      return { title: name, body: "Did something new", url: "/", tag: "default" };
  }
}
