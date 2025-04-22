import { inngest } from "../client";
import ragie from "@/lib/raggie/client";
import { codaExport } from "./coda-export";
import { codaUtils, CodaPage } from "@/lib/connectors/coda/utils";
export const ragiePageSync = inngest.createFunction(
  {
    name: "Ragie Page Sync",
    id: "ragie-page-sync",
  },
  { event: "ragie/page-sync.requested" },
  async ({ step, event }) => {
    const { docId, pageId } = event.data as {
      docId: string;
      pageId: string;
    };

    const page = await step.run("Fetch Page", async () => {
      const res = await codaUtils.pages.fetchForDocumentIdAndPageId(
        docId,
        pageId
      );
      return res as CodaPage;
    });

    const markdown = await step.invoke("coda-export", {
      function: codaExport,
      data: {
        docId,
        pageId,
      },
    });

    await step.run("Sync Page", async () => {
      await ragie.documents.createRaw({
        name: page.name,
        data: markdown.content,
        metadata: {
          coda_doc_id: docId,
          coda_page_id: page.id,
          page_name: page.name,
          source_url: page.browserLink,
          created_by: page.createdBy?.email ?? "",
          updated_by: page.updatedBy?.email ?? "",
          coda_updated_at: page.updatedAt,
        },
      });
    });
  }
);
