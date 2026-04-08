export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "gambeta-y-gol/productos",
              resource_type: "image",
              transformation: [{ quality: "auto", fetch_format: "auto" }],
            },
            (error, result) => {
              if (error || !result) reject(error ?? new Error("Upload failed"));
              else resolve(result as { secure_url: string; public_id: string });
            }
          )
          .end(buffer);
      }
    );

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    console.error("[upload]", error);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}
