import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { codaExport } from "@/lib/inngest/functions/coda-export";
import { listCodaDocuments } from "@/lib/inngest/functions/list-documents";
import { listPages } from "@/lib/inngest/functions/list-pages";
import { getPage } from "@/lib/inngest/functions/get-page";
import { ragiePageSync } from "@/lib/inngest/functions/ragie-page-sync";
import { ragieDocumentSync } from "@/lib/inngest/functions/ragie-document-sync";
import { slackReplyToThread } from "@/lib/inngest/functions/slack-reply-to-thread";
// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    codaExport,
    listCodaDocuments,
    listPages,
    getPage,
    ragiePageSync,
    ragieDocumentSync,
    slackReplyToThread,
  ],
});
