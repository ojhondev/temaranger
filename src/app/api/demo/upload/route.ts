import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { readDemoLead } from "@/lib/sandbox";

/** Upload do logo no formulário da demonstração: só quem passou pela captação, só imagem, até 5 MB. */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const lead = await readDemoLead();
        if (!lead) throw new Error("Comece pelo formulário da demonstração.");
        if (!pathname.startsWith(`demo/${lead}/`)) throw new Error("Pasta inválida.");
        return { allowedContentTypes: ["image/jpeg", "image/png", "image/webp"], maximumSizeInBytes: 5 * 1024 * 1024, addRandomSuffix: true };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
