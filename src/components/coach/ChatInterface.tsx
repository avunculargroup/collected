"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useState } from "react";
import { Send, Plus } from "lucide-react";
import { createMoment } from "@/lib/actions/moments";
import type { MomentType } from "@/lib/schema";

const CONVERSATION_STARTERS = [
  "Help me create moments for my child",
  "Mornings are really hard right now",
  "My child seems more peer-oriented lately",
  "I feel disconnected from my child",
  "Bedtimes are a battle every night",
];

type SuggestedMoment = {
  type: MomentType;
  title: string;
  description: string;
  rationale: string;
};

const transport = new DefaultChatTransport({ api: "/api/chat" });

export function ChatInterface() {
  const { messages, sendMessage, status } = useChat({ transport });
  const [inputText, setInputText] = useState("");
  const [addedMoments, setAddedMoments] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function handleAddMoment(moment: SuggestedMoment) {
    const key = moment.title;
    if (addedMoments.has(key)) return;
    await createMoment({
      type: moment.type,
      title: moment.title,
      description: moment.description,
      source: "ai",
    });
    setAddedMoments((prev) => new Set([...prev, key]));
  }

  function handleStarterClick(starter: string) {
    sendMessage({ text: starter });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage({ text: inputText.trim() });
    setInputText("");
  }

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100dvh - 130px)",
      }}
    >
      {/* Messages area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }}>
        {messages.length === 0 ? (
          <div>
            {/* Welcome */}
            <div
              style={{
                backgroundColor: "#F8E8DA",
                borderRadius: 16,
                padding: "20px",
                marginBottom: 20,
                border: "1px solid rgba(168, 92, 58, 0.15)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-alegreya), Georgia, serif",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#3D2B1F",
                  margin: "0 0 8px",
                }}
              >
                Your Collection Coach
              </p>
              <p
                style={{
                  fontFamily: "var(--font-source-sans), sans-serif",
                  fontSize: 14,
                  color: "#8C4A2F",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                I&apos;m here to help you build daily connection rituals rooted
                in attachment science. Ask me anything about collection moments,
                or try one of these:
              </p>
            </div>

            {/* Conversation starters */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CONVERSATION_STARTERS.map((starter) => (
                <button
                  key={starter}
                  onClick={() => handleStarterClick(starter)}
                  style={{
                    backgroundColor: "#FFFCF7",
                    border: "1px solid #E8DCC8",
                    borderRadius: 12,
                    padding: "12px 16px",
                    textAlign: "left",
                    cursor: "pointer",
                    fontFamily: "var(--font-source-sans), sans-serif",
                    fontSize: 14,
                    color: "#5C4033",
                    lineHeight: 1.4,
                  }}
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((message) => {
              // Extract text content from parts
              const textContent = message.parts
                .filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map((p) => p.text)
                .join("");

              return (
                <div key={message.id}>
                  {message.role === "user" ? (
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div
                        style={{
                          backgroundColor: "#3D2B1F",
                          borderRadius: "16px 16px 4px 16px",
                          padding: "12px 16px",
                          maxWidth: "80%",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--font-source-sans), sans-serif",
                            fontSize: 14,
                            color: "#FFF5E6",
                            margin: 0,
                            lineHeight: 1.5,
                          }}
                        >
                          {textContent}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {textContent && (
                        <div
                          style={{
                            backgroundColor: "#FFFCF7",
                            border: "1px solid #E8DCC8",
                            borderRadius: "4px 16px 16px 16px",
                            padding: "14px 16px",
                            maxWidth: "92%",
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "var(--font-source-sans), sans-serif",
                              fontSize: 14,
                              color: "#3D2B1F",
                              margin: 0,
                              lineHeight: 1.6,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {textContent}
                          </p>
                        </div>
                      )}

                      {/* Render suggest-moments tool results */}
                      {message.parts.map((part, i) => {
                        if (
                          part.type === "tool-invocation" &&
                          "state" in part &&
                          part.state === "output-available" &&
                          "output" in part
                        ) {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const output = (part as any).output as {
                            suggestions?: SuggestedMoment[];
                          } | null;
                          if (!output?.suggestions) return null;

                          return (
                            <div
                              key={i}
                              style={{
                                marginTop: 12,
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {output.suggestions.map((suggestion) => (
                                <SuggestionCard
                                  key={suggestion.title}
                                  suggestion={suggestion}
                                  added={addedMoments.has(suggestion.title)}
                                  onAdd={() => handleAddMoment(suggestion)}
                                />
                              ))}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div
                style={{
                  backgroundColor: "#FFFCF7",
                  border: "1px solid #E8DCC8",
                  borderRadius: "4px 16px 16px 16px",
                  padding: "14px 16px",
                  maxWidth: "92%",
                }}
              >
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "#A6895D",
                        animation: `streak-pulse 1s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div
        style={{
          padding: "12px 20px 20px",
          borderTop: "1px solid #E8DCC8",
          backgroundColor: "#FFFCF7",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your collection coach..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent);
              }
            }}
            style={{
              flex: 1,
              border: "1.5px solid #E8DCC8",
              borderRadius: 10,
              padding: "12px 14px",
              fontFamily: "var(--font-source-sans), sans-serif",
              fontSize: 15,
              color: "#3D2B1F",
              backgroundColor: "#FFFCF7",
              resize: "none",
              outline: "none",
              lineHeight: 1.5,
              maxHeight: 120,
              overflowY: "auto",
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "linear-gradient(135deg, #3D2B1F, #5C4033, #8B7355)",
              border: "none",
              cursor: isLoading || !inputText.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isLoading || !inputText.trim() ? 0.5 : 1,
              flexShrink: 0,
            }}
          >
            <Send size={16} strokeWidth={1.5} color="#FFF5E6" />
          </button>
        </form>
      </div>
    </div>
  );
}

function SuggestionCard({
  suggestion,
  added,
  onAdd,
}: {
  suggestion: SuggestedMoment;
  added: boolean;
  onAdd: () => void;
}) {
  return (
    <div
      style={{
        backgroundColor: "#F8E8DA",
        border: "1px solid rgba(168, 92, 58, 0.15)",
        borderRadius: 12,
        padding: "14px 16px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-alegreya), Georgia, serif",
          fontSize: 15,
          fontWeight: 600,
          color: "#3D2B1F",
          margin: "0 0 4px",
        }}
      >
        {suggestion.title}
      </p>
      <p
        style={{
          fontFamily: "var(--font-source-sans), sans-serif",
          fontSize: 13,
          color: "#6E5240",
          margin: "0 0 6px",
          lineHeight: 1.5,
        }}
      >
        {suggestion.description}
      </p>
      <p
        style={{
          fontFamily: "var(--font-source-sans), sans-serif",
          fontStyle: "italic",
          fontSize: 12,
          color: "#A85C3A",
          margin: "0 0 12px",
          lineHeight: 1.4,
        }}
      >
        {suggestion.rationale}
      </p>
      <button
        onClick={onAdd}
        disabled={added}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          backgroundColor: added ? "#E8F0E2" : "#3D2B1F",
          color: added ? "#4A6741" : "#FFF5E6",
          border: "none",
          borderRadius: 8,
          padding: "8px 14px",
          fontFamily: "var(--font-source-sans), sans-serif",
          fontSize: 13,
          fontWeight: 600,
          cursor: added ? "default" : "pointer",
        }}
      >
        <Plus size={14} strokeWidth={1.5} />
        {added ? "Added to practice" : "Add to my practice"}
      </button>
    </div>
  );
}
