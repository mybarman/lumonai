import { generateChatResponse } from "@/lib/chat/utils";

// Allow streaming responses up to 30 seconds
export const maxDuration = 120;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = await generateChatResponse(messages);
  return result.toDataStreamResponse();
}
