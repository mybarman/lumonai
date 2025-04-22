import { listDocuments } from "@/lib/raggie/list-documents";
import { NextResponse } from "next/server";
import { deleteDocument } from "@/lib/raggie/delete-document";

export async function GET(request: Request) {
  try {
    const pageSize = 100;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") || undefined;

    const result = await listDocuments(pageSize, cursor);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const success = await deleteDocument(documentId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete document" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
