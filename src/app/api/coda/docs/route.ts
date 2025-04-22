import { codaUtils } from "@/lib/connectors/coda/utils";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const docs = await codaUtils.docs.fetchAll();
    return NextResponse.json(docs);
  } catch (error) {
    console.error("Error fetching Coda documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch Coda documents" },
      { status: 500 }
    );
  }
}
