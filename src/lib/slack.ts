import { WebClient } from "@slack/web-api";

export function markdownToSlack(md: string): string {
  let text = md;

  // ```code blocks```
  text = text.replace(/```(.+?)```/gs, (_, code) => {
    return `\`\`\`${code.trim()}\`\`\``;
  });

  // `inline code`
  text = text.replace(/`([^`\r\n]+)`/g, "`$1`");

  // **bold**
  text = text.replace(/\*\*(.+?)\*\*/g, "*$1*");

  // _italic_ or *italic*
  text = text.replace(/_(.+?)_/g, "_$1_");
  text = text.replace(/\*(.+?)\*/g, "_$1_"); // fallback for single-star italics

  // ~~strikethrough~~
  text = text.replace(/~~(.+?)~~/g, "~$1~");

  // Headings: #, ##, ### → *heading*
  text = text.replace(/^\s*#{1,6}\s*(.+)$/gm, "*$1*");

  // > Blockquotes
  text = text.replace(/^\s*>\s*(.+)$/gm, "> $1");

  // - unordered list → • item
  text = text.replace(/^\s*-\s+(.+)$/gm, "• $1");

  // 1. ordered list → 1. item (keep as is)
  text = text.replace(/^\s*(\d+)\.\s+(.+)$/gm, "$1. $2");

  // [label](url) → <url|label>
  text = text.replace(
    /$begin:math:display$([^$end:math:display$]+)\]$begin:math:text$\\s*([^)]+?)\\s*$end:math:text$/g,
    "<$2|$1>"
  );

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<$2|$1>");

  return text;
}

/**
 * Replies to a thread in Slack
 * @param client - Slack WebClient instance
 * @param channel - Channel ID where the thread exists
 * @param threadTs - Timestamp of the parent message to reply to
 * @param text - Text content of the reply
 */
export async function replyToThread(
  client: WebClient,
  channel: string,
  threadTs: string,
  text: string
) {
  try {
    await client.chat.postMessage({
      channel,
      thread_ts: threadTs,
      text: markdownToSlack(text),
      mrkdwn: true,
    });
  } catch (error) {
    console.error("Error replying to thread:", error);
    throw error;
  }
}

/**
 * Adds a reaction to a message in Slack
 * @param client - Slack WebClient instance
 * @param channel - Channel ID where the message exists
 * @param timestamp - Timestamp of the message to react to
 * @param reaction - Name of the emoji reaction (without colons)
 */
export async function addReaction(
  client: WebClient,
  channel: string,
  timestamp: string,
  reaction: string
) {
  try {
    await client.reactions.add({
      channel,
      timestamp,
      name: reaction, // e.g., "thumbsup", "heart", etc.
    });
  } catch (error) {
    console.error("Error adding reaction:", error);
    throw error;
  }
}

export async function getThreadMessages(
  client: WebClient,
  channel: string,
  threadTs: string
) {
  try {
    const result = await client.conversations.replies({
      channel,
      ts: threadTs,
      inclusive: true, // Include the parent message
    });

    return result.messages || [];
  } catch (error) {
    console.error("Error getting thread messages:", error);
    throw error;
  }
}
