import { openai } from "@ai-sdk/openai";
import { streamText, generateText, CoreMessage } from "ai";
import ragie from "@/lib/raggie/client";
import { ScoredChunk } from "ragie/models/components";

export async function getRetrievals(query: string) {
  return await ragie.retrievals.retrieve({ query });
}

export function formatRetrievalsText(retrievals: {
  scoredChunks: ScoredChunk[];
}) {
  return retrievals.scoredChunks
    .map((retrieval: ScoredChunk) =>
      JSON.stringify({
        text: retrieval.text,
        page_name: retrieval.documentMetadata.page_name,
        created_by: retrieval.documentMetadata.created_by,
        updated_at: retrieval.documentMetadata.coda_updated_at,
        document_name: retrieval.documentName,
        source_url: retrieval.documentMetadata.source_url,
      })
    )
    .join("\n\n\n");
}

export function formatPrompt(
  history: CoreMessage[],
  query: string,
  retrievalsText: string
) {
  return `
    ### Conversation History:
    ${history
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n")}
    ### User Query:
    ${query}
    ### Context:
    ${retrievalsText}
    ### Instructions:
    Along with the answer please return the source URL of the document you have used to answer the question. Use the source_url field and document_name like [document_name](source_url)
  `;
}

export function getSystemPrompt() {
  return `You are a user assistant that answers user queries based on the provided context for a company
    called ZenEducate. 
    
    Today's date is ${new Date().toLocaleDateString()}.

    The questions are related to the company and its operations. The end user is an internal user of Zen educate.
    You should only use the information provided in the context to answer the questions.
    These contexts are from internal Coda documents and are not publicly available.
    Please link all the sources (URL) you have used in your answer.
    You are not allowed to make up information or provide any personal opinions.
    Your responses should be concise and relevant to the query. 
    Use Markdown for your answers. 
    Also the end user knows you are a bot, so you don't need to pretend you are not. You can answer documents in the style of "According to [document_name](source_url) by author/email on date" or "Accroding to [authoer] here" or "ACcording to the docuemnt written on [date]
    If you are unsure what is the status of a document because if the document is old, then you can say that accoding to this document, this is the progress. For more upto date information ask [user name]/[email] or team. If names are pesent on the doc, do refer them.
    Do not repeat information if it's already present in the Conversation history. Like if you have already asked to refer to a document in the past don't repeat it again.
    We DONT want all answers to start with "According to [document_name](source_url)" or "According to [author](source_url)" or "According to [date](source_url)". Only maybe the first one in the conversation history.
    `;
}

export async function generateChatResponse(
  messages: CoreMessage[],
  stream = true
) {
  const history = messages.slice(0, -1);
  const query = messages[messages.length - 1].content as string;

  const retrievals = await getRetrievals(query);
  const retrievalsText = formatRetrievalsText(retrievals);
  const prompt = formatPrompt(history, query, retrievalsText);

  const messagesAll = [
    {
      role: "system",
      content: getSystemPrompt(),
    },
    { role: "user", content: prompt },
  ] as CoreMessage[];

  if (stream) {
    return streamText({
      model: openai("gpt-4.1-2025-04-14"),
      messages: messagesAll,
    });
  } else {
    return generateText({
      model: openai("gpt-4.1-2025-04-14"),
      messages: messagesAll,
    });
  }
}
