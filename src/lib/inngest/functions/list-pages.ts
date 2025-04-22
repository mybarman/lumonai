import { inngest } from "../client";
import { codaUtils } from "../../connectors/coda/utils";

export const listPages = inngest.createFunction(
  {
    name: "List Pages",
    id: "coda-list-pages",
  },
  { event: "coda/pages.requested" },
  async ({ step, event }) => {
    const { docId } = event.data as { docId: string };
    // Fetch all documents using the utility function
    const pages = await step.run("Fetch Pages", async () => {
      return await codaUtils.pages.fetchForDocumentId(docId);
    });

    return {
      success: true,
      pages: pages,
    };
  }
);
