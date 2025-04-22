import { inngest } from "../client";
import { WebClient } from "@slack/web-api";
import { addReaction, replyToThread, getThreadMessages } from "@/lib/slack";
import { generateChatResponse } from "@/lib/chat/utils";
import { CoreMessage } from "ai";

export const slackReplyToThread = inngest.createFunction(
  { name: "Slack Reply to Thread", id: "slack-reply-to-thread", retries: 0 },
  { event: "slack/reply-to-thread" },
  async ({ event }) => {
    const { channel, timestamp, thread_ts } = event.data;
    const client = new WebClient(process.env.SLACK_BOT_TOKEN);
    let messages: CoreMessage[] = [];
    const messageTs = thread_ts || timestamp;
    const threadMessages = await getThreadMessages(client, channel, messageTs);
    messages = threadMessages.map(
      (msg) =>
        ({
          role: msg.bot_id ? "assistant" : "user",
          content: msg.text,
        } as CoreMessage)
    );

    const message = await generateChatResponse(messages, false);
    const text = await message.text;

    await replyToThread(client, channel, timestamp, text);
    await addReaction(client, channel, timestamp, "speech_balloon");

    return { success: true };
  }
);
