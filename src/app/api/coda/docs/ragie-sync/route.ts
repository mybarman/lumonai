import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { z } from "zod";

// Schema for request validation
const syncRequestSchema = z.object({
  docId: z.string(),
  pageIds: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const { docId, pageIds } = syncRequestSchema.parse(body);

    if (pageIds && pageIds.length > 0) {
      // Sync specific pages
      await Promise.all(
        pageIds.map((pageId) =>
          inngest.send({
            name: "ragie/page-sync.requested",
            data: { docId, pageId },
          })
        )
      );

      return NextResponse.json({
        success: true,
        message: `Syncing ${pageIds.length} pages from document ${docId}. It might take a while before showing up in the table.`,
      });
    } else {
      // Sync entire document
      await inngest.send({
        name: "ragie/document-sync.requested",
        data: { docId },
      });

      return NextResponse.json({
        success: true,
        message: `Syncing entire document ${docId}. It might take a while before showing up in the table.`,
      });
    }
  } catch (error) {
    console.error("Error in ragie-sync route:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
