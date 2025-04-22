import { inngest } from "../client";
import { coda } from "../../connectors/coda/client"; // Adjust this import based on your actual coda client setup

export const codaExport = inngest.createFunction(
  {
    name: "Handle Coda Export",
    id: "coda-export",
    retries: 0,
  },
  { event: "coda/export.requested" },
  async ({ event, step }) => {
    const { docId, pageId } = event.data;

    // Initial export request
    const exportResponse = await step.run(
      "Initial Export Request",
      async () => {
        return await coda.API.request(
          `https://coda.io/apis/v1/docs/${docId}/pages/${pageId}/export`,
          { outputFormat: "markdown" },
          "POST"
        );
      }
    );

    const exportUrl = exportResponse.data.href;
    if (!exportUrl) {
      throw new Error("No export URL received");
    }

    let pollResponse = null;
    // Each polling attempt is a separate step
    for (let i = 0; i < 5; i++) {
      pollResponse = await step.run(
        `Poll Export Status - Attempt ${i + 1}`,
        async () => {
          const response = await coda.API.request(exportUrl, {}, "GET");
          return response.data;
        }
      );

      await step.sleep("wait-for-next-poll", "1s");

      console.log("pollResponse", pollResponse);

      if (pollResponse.status === "complete") {
        break;
      }
    }

    if (pollResponse?.status !== "complete") {
      throw new Error(`Timeout exporting page ${pageId}`);
    }

    // Fetch the final content in a separate step
    const markdownContent = await step.run("Fetch Export Content", async () => {
      const response = await fetch(pollResponse.downloadLink);
      return await response.text();
    });

    return { success: true, content: markdownContent };
  }
);
