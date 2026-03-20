import { Storage } from "@google-cloud/storage";
import { NextResponse } from "next/server";

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY || "{}"),
});
const bucket = storage.bucket(process.env.GCP_VOICE_BUCKET || "");

export async function POST(req: Request) {
  try {
    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json({ error: "Missing fileName or contentType" }, { status: 400 });
    }

    const file = bucket.file(fileName);
    const [uploadUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
    });

    const publicUrl = `https://storage.googleapis.com/${process.env.GCP_VOICE_BUCKET}/${fileName}`;
    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (err) {
    console.error("Failed to generate signed URL:", err);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
