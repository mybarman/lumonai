import { codaUtils } from "@/lib/connectors/coda/utils";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const docId = params.id;
    const pages = await codaUtils.pages.fetchForDocumentId(docId);
    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching Coda pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch Coda pages" },
      { status: 500 }
    );
  }
}
