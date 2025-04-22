import { inngest } from "../client";
import { codaUtils, CodaPage } from "../../connectors/coda/utils";
import { ragiePageSync } from "./ragie-page-sync";

export const ragieDocumentSync = inngest.createFunction(
  {
    name: "Ragie Document Sync",
    id: "ragie-document-sync",
  },
  { event: "ragie/document-sync.requested" },
  async ({ step, event }) => {
    const { docId } = event.data as { docId: string };
    // Fetch all documents using the utility function
    const pages = (await step.run("Fetch Pages", async () => {
      return await codaUtils.pages.fetchForDocumentId(docId);
    })) as CodaPage[];

    for (const page of pages) {
      await step.invoke("ragie-page-sync", {
        function: ragiePageSync,
        data: { docId, pageId: page.id },
      });
    }
    return {
      success: true,
      pages: pages,
    };
  }
);
