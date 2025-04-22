import { Inngest } from "inngest";

// Initialize the Inngest client
export const inngest = new Inngest({
  id: "coda-integration",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
