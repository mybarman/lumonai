import { coda } from "./client";
import { Doc, Page } from "coda-js/build/models/index";

interface CodaPerson {
  "@context": "http://schema.org/";
  "@type": "Person";
  email: string;
  name: string;
}

export interface CodaPage {
  authors: CodaPerson[];
  browserLink: string;
  children: unknown[];
  contentType: string;
  createdAt: string;
  createdBy: CodaPerson;
  docId: string;
  href: string;
  id: string;
  isEffectivelyHidden: boolean;
  isHidden: boolean;
  name: string;
  subtitle: string;
  type: string;
  updatedAt: string;
  updatedBy: CodaPerson;
}

export const codaUtils = {
  docs: {
    async fetchAll(): Promise<Doc[]> {
      const docs = await coda.listDocs();
      return docs;
    },

    async fetch(docId: string): Promise<Doc> {
      const doc = await coda.getDoc(docId);
      return doc;
    },
  },

  pages: {
    async fetchForDocumentId(docId: string): Promise<Page[]> {
      const pages = await coda.listPages(docId, {});
      return pages as Page[];
    },

    async fetchForDocumentIdAndPageId(
      docId: string,
      pageId: string
    ): Promise<Page | null> {
      return coda.getPage(docId, pageId);
    },

    async export(docId: string, pageId: string): Promise<string | null> {
      const exportResponse = await coda.API.request(
        `https://coda.io/apis/v1/docs/${docId}/pages/${pageId}/export`,
        { outputFormat: "markdown" },
        "POST"
      );
      const exportUrl = exportResponse.href;
      if (!exportUrl) return null;

      for (let i = 0; i < 10; i++) {
        const pollResponse = await coda.API.request(exportUrl, {}, "GET");

        if (pollResponse.status === "complete") {
          const response = await fetch(pollResponse.downloadLink);
          return await response.text();
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      console.error(`Timeout exporting page ${pageId}`);
      return null;
    },
  },
};
