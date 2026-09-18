"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  MessageCircle,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWatchPartySocket } from "@/lib/watchPartySocket";

type ChatMessage = {
  id?: string;
  message: string;
  user?: {
    _id?: string;
    name?: string;
    avatar?: string;
  };
  userId?: string;
  socketId?: string;
  createdAt?: string;
};

interface WatchPartyChatProps {
  partyCode: string;
  userId: string;
  userName: string;
  userAvatar?: string;
};

const getStorageKey = (
  partyCode: string,
) => `binge-watch-party-chat-${partyCode}`;

const loadStoredMessages = (
  partyCode: string,
): ChatMessage[] => {
  if (
    typeof window === "undefined" ||
    !partyCode
  ) {
    return [];
  }

  try {
    const stored =
      sessionStorage.getItem(
        getStorageKey(partyCode),
      );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Failed to load Watch Party chat:",
      error,
    );

    return [];
  }
};

const WatchPartyChat = ({
  partyCode,
  userId,
  userName,
  userAvatar,
}: WatchPartyChatProps) => {
  const [messages, setMessages] =
    useState<ChatMessage[]>(() =>
      loadStoredMessages(partyCode),
    );

  const [message, setMessage] =
    useState("");

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  /*
   * Save messages so hiding/showing the Chat component
   * does not clear the conversation.
   */
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !partyCode
    ) {
      return;
    }

    try {
      sessionStorage.setItem(
        getStorageKey(partyCode),
        JSON.stringify(messages),
      );
    } catch (error) {
      console.error(
        "Failed to save Watch Party chat:",
        error,
      );
    }
  }, [messages, partyCode]);

  /*
   * Listen for new chat messages while the Chat
   * component is mounted.
   */
  useEffect(() => {
    if (!partyCode) {
      return;
    }

    const socket =
      getWatchPartySocket();

    const handleMessage = (
      chatMessage: ChatMessage,
    ) => {
      if (!chatMessage?.message) {
        return;
      }

      setMessages((current) => {
        const newMessage: ChatMessage = {
          ...chatMessage,
          id:
            chatMessage.id ||
            `${Date.now()}-${Math.random()}`,
          createdAt:
            chatMessage.createdAt ||
            new Date().toISOString(),
        };

        return [
          ...current,
          newMessage,
        ];
      });
    };

    socket.on(
      "watch-party:chat",
      handleMessage,
    );

    return () => {
      socket.off(
        "watch-party:chat",
        handleMessage,
      );
    };
  }, [partyCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedMessage =
      message.trim();

    if (!trimmedMessage) {
      return;
    }

    const socket =
      getWatchPartySocket();

    if (!socket.connected) {
      return;
    }

    socket.emit(
      "watch-party:chat",
      {
        message:
          trimmedMessage.slice(
            0,
            1000,
          ),
      },
    );

    setMessage("");
  };

  return (
    <div className="flex h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex shrink-0 items-center gap-2 border-b border-border p-4">
        <MessageCircle className="h-4 w-4 text-red-500" />

        <h2 className="font-semibold text-foreground">
          Party Chat
        </h2>

        <span className="ml-auto text-xs text-muted-foreground">
          {messages.length}{" "}
          {messages.length === 1
            ? "message"
            : "messages"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="text-sm font-medium text-foreground">
              No messages yet
            </p>

            <p className="mt-1 max-w-[220px] text-xs leading-5 text-muted-foreground">
              Start a conversation with everyone in the Watch Party.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(
              (chatMessage, index) => {
                const senderId =
                  chatMessage.userId ||
                  chatMessage.user?._id;

                const isOwnMessage =
                  senderId === userId;

                const senderName =
                  chatMessage.user?.name ||
                  (isOwnMessage
                    ? userName
                    : "Participant");

                const avatar =
                  chatMessage.user?.avatar ||
                  (isOwnMessage
                    ? userAvatar
                    : undefined);

                return (
                  <div
                    key={
                      chatMessage.id ||
                      `${index}-${chatMessage.createdAt}`
                    }
                    className={`flex gap-2.5 ${
                      isOwnMessage
                        ? "flex-row-reverse"
                        : ""
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={senderName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground">
                          {senderName
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div
                      className={`min-w-0 max-w-[80%] ${
                        isOwnMessage
                          ? "items-end text-right"
                          : ""
                      }`}
                    >
                      <p className="mb-1 text-[11px] font-medium text-muted-foreground">
                        {isOwnMessage
                          ? "You"
                          : senderName}
                      </p>

                      <div
                        className={`rounded-2xl px-3 py-2 text-sm leading-5 ${
                          isOwnMessage
                            ? "rounded-tr-sm bg-red-500 text-white"
                            : "rounded-tl-sm bg-muted text-foreground"
                        }`}
                      >
                        {chatMessage.message}
                      </div>

                      {chatMessage.createdAt && (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(
                            chatMessage.createdAt,
                          ).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                );
              },
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 gap-2 border-t border-border p-3"
      >
        <Input
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          placeholder="Type a message..."
          maxLength={1000}
          className="h-10 min-w-0 flex-1 rounded-full border-border bg-background text-foreground"
        />

        <Button
          type="submit"
          size="icon"
          disabled={!message.trim()}
          className="h-10 w-10 shrink-0 rounded-full bg-red-500 text-white hover:bg-red-600"
          title="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default WatchPartyChat;