import { inngest } from "../client";
import { codaUtils } from "../../connectors/coda/utils";

export const listCodaDocuments = inngest.createFunction(
  {
    name: "List Documents",
    id: "coda-list-documents",
  },
  { event: "coda/documents.requested" },
  async ({ step }) => {
    // Fetch all documents using the utility function
    const documents = await step.run("Fetch Documents", async () => {
      return await codaUtils.docs.fetchAll();
    });

    return {
      success: true,
      documents: documents,
    };
  }
);
