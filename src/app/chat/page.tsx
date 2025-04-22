"use client";

import { useChat } from "@ai-sdk/react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { DefaultMarkdownRenderer } from "@/components/ReactMarkdown";
import { useEffect, useRef } from "react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll when messages change

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-900">
      {messages.length === 0 ? (
        // Centered layout for empty state
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <h1 className="text-4xl font-medium text-zinc-800 dark:text-zinc-100 mb-8">
            What do you want to know?
          </h1>
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  className="w-full p-4 pr-12 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all duration-200"
                  value={input}
                  placeholder="Ask anything..."
                  onChange={handleInputChange}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors duration-200"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </main>
      ) : (
        // Expanded layout with messages
        <>
          <main className="flex-1 w-full max-w-4xl mx-auto px-4 pt-8 pb-32">
            {/* Messages container */}
            <div className="space-y-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "prose dark:prose-invert max-w-none",
                    "animate-in fade-in-50 slide-in-from-bottom-5 duration-300"
                  )}
                >
                  <div className="font-medium mb-2">
                    {message.role === "user" ? "You" : "AI"}:
                  </div>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <div
                            key={`${message.id}-${i}`}
                            className="prose dark:prose-invert prose-zinc max-w-none [&_hr]:my-4"
                          >
                            <DefaultMarkdownRenderer text={part.text} />
                          </div>
                        );
                    }
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </main>

          {/* Floating input form */}
          <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 w-full pl-[260px] pr-4">
            <div className="mx-auto max-w-4xl">
              <form
                onSubmit={handleSubmit}
                className="pointer-events-auto relative"
              >
                <div className="relative overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-200">
                  <input
                    className="w-full p-4 pr-12 bg-transparent text-zinc-800 dark:text-zinc-100 focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                    value={input}
                    placeholder="Ask anything..."
                    onChange={handleInputChange}
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors duration-200"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
