import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { getSession, isManager } from "@/lib/auth";

/**
 * Emite o token para o navegador subir a imagem direto no Vercel Blob (sem passar pelo
 * limite de corpo das funções). Só gestor/master, só imagem, até 15 MB, na pasta da loja.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await getSession();
        if (!session || !isManager(session)) throw new Error("Sem permissão para enviar arquivos.");
        if (!pathname.startsWith(`lojas/${session.tenantId}/`)) throw new Error("Pasta inválida.");
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/avif", "image/gif"],
          maximumSizeInBytes: 15 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
