import { NextResponse } from "next/server";
import ragie from "@/lib/raggie/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const documentContent = await ragie.documents.getContent({
      documentId: params.id,
    });

    return NextResponse.json({ content: documentContent });
  } catch (error) {
    console.error("Error fetching document content:", error);
    return NextResponse.json(
      { error: "Failed to fetch document content" },
      { status: 500 }
    );
  }
}
