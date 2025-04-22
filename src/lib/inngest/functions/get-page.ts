import { inngest } from "../client";
import { codaUtils } from "../../connectors/coda/utils";

export const getPage = inngest.createFunction(
  {
    name: "Get Page",
    id: "coda-get-page",
  },
  { event: "coda/page.requested" },
  async ({ event }) => {
    const { docId, pageId } = event.data as {
      docId: string;
      pageId: string;
    };
    return await codaUtils.pages.fetchForDocumentIdAndPageId(docId, pageId);
  }
);
