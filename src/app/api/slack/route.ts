import crypto from "crypto";

import { WebClient } from "@slack/web-api";
import { addReaction, replyToThread } from "@/lib/slack";
import { inngest } from "@/lib/inngest/client";
export const config = {
  maxDuration: 30,
};

async function isValidSlackRequest(request: Request, body: unknown) {
  const signingSecret = process.env.SLACK_SIGNING_SECRET!;
  const timestamp = request.headers.get("X-Slack-Request-Timestamp")!;
  const slackSignature = request.headers.get("X-Slack-Signature")!;
  const base = `v0:${timestamp}:${JSON.stringify(body)}`;
  const hmac = crypto
    .createHmac("sha256", signingSecret)
    .update(base)
    .digest("hex");
  const computedSignature = `v0=${hmac}`;
  return computedSignature === slackSignature;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const body = JSON.parse(rawBody);
  const requestType = body.type;
  const client = new WebClient(process.env.SLACK_BOT_TOKEN);

  if (requestType === "url_verification") {
    return new Response(body.challenge, { status: 200 });
  }

  if (await isValidSlackRequest(request, body)) {
    if (requestType === "event_callback") {
      const event = body.event;
      const eventType = body.event.type;
      if (eventType === "app_mention") {
        await addReaction(client, event.channel, event.ts, "eyes");
        await inngest.send({
          name: "slack/reply-to-thread",
          data: {
            channel: event.channel,
            timestamp: event.ts,
            thread_ts: event.thread_ts,
            message: "👋 Hello! I received your mention!",
          },
        });
        return new Response("Success!", { status: 200 });
      }
    }
  }

  return new Response("OK", { status: 200 });
}
