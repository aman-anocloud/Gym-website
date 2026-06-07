import { Injectable } from "@nestjs/common";
import { Storage } from "@google-cloud/storage";

@Injectable()
export class UploadsService {
  private readonly storage = new Storage();

  async saveDataUrl(kind: "photo" | "signature", body: { filename: string; dataUrl: string }) {
    const bucketName = process.env.GCS_BUCKET_NAME;
    if (!bucketName) return { url: body.dataUrl, storage: "inline-dev" };
    const match = body.dataUrl.match(/^data:image\/([^;]+);base64,(.+)$/);
    if (!match) throw new Error("Invalid image dataUrl");
    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    const filename = `${kind}/${Date.now()}-${body.filename.replace(/[^a-z0-9_.-]/gi, "_")}.${ext}`;
    const file = this.storage.bucket(bucketName).file(filename);
    await file.save(Buffer.from(match[2], "base64"), { contentType: `image/${match[1]}` });
    const [url] = await file.getSignedUrl({ action: "read", expires: Date.now() + 60 * 60 * 1000 });
    return { url, storage: "gcs", object: filename };
  }
}
