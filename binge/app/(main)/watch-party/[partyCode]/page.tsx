"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  LogOut,
  MessageCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import WatchPartyCall from "@/components/watch-party/WatchPartyCall";
import WatchPartyChat from "@/components/watch-party/WatchPartyChat";
import WatchPartyVideo from "@/components/watch-party/WatchPartyVideo";
import { Button } from "@/components/ui/button";
import {
  getWatchParty,
  type WatchParty,
} from "@/services/watchParty.service";
import {
  connectWatchPartySocket,
  disconnectWatchPartySocket,
  getWatchPartySocket,
} from "@/lib/watchPartySocket";
import { useAuthStore } from "@/store/authStore";

export default function WatchPartyRoomPage() {
  const params = useParams();
  const router = useRouter();

  const partyCode = String(
    params.partyCode || "",
  ).toUpperCase();

  const { user } = useAuthStore();

  const [party, setParty] =
    useState<WatchParty | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [showParticipants, setShowParticipants] =
    useState(true);

  const [showChat, setShowChat] =
    useState(true);

  useEffect(() => {
    if (!partyCode) {
      return;
    }

    let mounted = true;

    const loadParty = async () => {
      try {
        setLoading(true);

        const response =
          await getWatchParty(partyCode);

        if (mounted) {
          setParty(
            response.data ?? null,
          );
        }
      } catch (error: any) {
        console.error(
          "Failed to load watch party:",
          error,
        );

        if (mounted) {
          toast.error(
            error?.response?.data?.message ||
              "Unable to load Watch Party",
          );

          router.push(
            "/watch-party",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadParty();

    return () => {
      mounted = false;
    };
  }, [partyCode, router]);

  useEffect(() => {
    if (!partyCode || !user?._id) {
      return;
    }

    const socket =
      getWatchPartySocket();

    let joined = false;

    let joinTimeout:
      | ReturnType<typeof setTimeout>
      | null = null;

    const joinParty = () => {
      if (joined) {
        return;
      }

      joined = true;

      socket.emit(
        "watch-party:join",
        {
          partyCode,
        },
      );
    };

    const connectAndJoin = () => {
      const connectedSocket =
        connectWatchPartySocket();

      if (connectedSocket.connected) {
        joinParty();
      } else {
        connectedSocket.once(
          "connect",
          joinParty,
        );
      }
    };

    const handleState = (data: {
      party?: WatchParty;
    }) => {
      if (data?.party) {
        setParty(data.party);
      }
    };

    const handleUserJoined = (
      data?: {
        userId?: string;
        socketId?: string;
        name?: string;
        avatar?: string;
      },
    ) => {
      const joinedUserId =
        data?.userId;

      if (
        !joinedUserId ||
        joinedUserId === user._id
      ) {
        return;
      }

      toast.success(
        data.name
          ? `${data.name} joined the Watch Party`
          : "Someone joined the Watch Party",
      );

      setParty(
        (currentParty) => {
          if (!currentParty) {
            return currentParty;
          }

          const alreadyExists =
            currentParty.participants.some(
              (participant) =>
                participant.user._id ===
                joinedUserId,
            );

          if (alreadyExists) {
            return currentParty;
          }

          return {
            ...currentParty,
            participants: [
              ...currentParty.participants,
              {
                user: {
                  _id: joinedUserId,
                  name:
                    data.name ||
                    "Participant",
                  username: "",
                  avatar:
                    data.avatar || "",
                },
                joinedAt:
                  new Date().toISOString(),
              },
            ],
          };
        },
      );
    };

    const handleUserLeft = (
      data?: {
        userId?: string;
        socketId?: string;
      },
    ) => {
      if (!data?.userId) {
        return;
      }

      toast.info(
        "Someone left the Watch Party",
      );

      setParty(
        (currentParty) => {
          if (!currentParty) {
            return currentParty;
          }

          return {
            ...currentParty,
            participants:
              currentParty.participants.filter(
                (participant) =>
                  participant.user._id !==
                  data.userId,
              ),
          };
        },
      );
    };

    const handlePartyEnded =
      () => {
        toast.info(
          "The host ended the Watch Party",
        );

        router.push(
          "/watch-party",
        );
      };

    const handleError = (
      data: {
        message?: string;
      },
    ) => {
      if (data?.message) {
        toast.error(
          data.message,
        );
      }
    };

    const handleConnectError =
      (error: Error) => {
        console.error(
          "Watch Party socket connection error:",
          error,
        );

        toast.error(
          error.message ||
            "Unable to connect to Watch Party",
        );
      };

    socket.on(
      "watch-party:state",
      handleState,
    );

    socket.on(
      "watch-party:user-joined",
      handleUserJoined,
    );

    socket.on(
      "watch-party:user-left",
      handleUserLeft,
    );

    socket.on(
      "watch-party:ended",
      handlePartyEnded,
    );

    socket.on(
      "watch-party:error",
      handleError,
    );

    socket.on(
      "connect_error",
      handleConnectError,
    );

    /*
     * Give WatchPartyCall time to mount and register
     * WebRTC listeners before joining the room.
     */
    joinTimeout = setTimeout(
      connectAndJoin,
      150,
    );

    return () => {
      if (joinTimeout) {
        clearTimeout(joinTimeout);
      }

      socket.off(
        "watch-party:state",
        handleState,
      );

      socket.off(
        "watch-party:user-joined",
        handleUserJoined,
      );

      socket.off(
        "watch-party:user-left",
        handleUserLeft,
      );

      socket.off(
        "watch-party:ended",
        handlePartyEnded,
      );

      socket.off(
        "watch-party:error",
        handleError,
      );

      socket.off(
        "connect_error",
        handleConnectError,
      );

      socket.off(
        "connect",
        joinParty,
      );

      /*
       * This is a REAL Watch Party exit.
       *
       * Video-call hangup inside WatchPartyCall does
       * NOT execute this code, so reconnect remains
       * possible.
       */
      socket.emit(
        "watch-party:leave",
      );

      disconnectWatchPartySocket();
    };
  }, [
    partyCode,
    router,
    user?._id,
  ]);

  const handleCopyCode =
    async () => {
      try {
        await navigator.clipboard.writeText(
          partyCode,
        );

        toast.success(
          "Party code copied",
        );
      } catch (error) {
        console.error(
          "Failed to copy party code:",
          error,
        );

        toast.error(
          "Failed to copy party code",
        );
      }
    };

  const handleLeave = () => {
    getWatchPartySocket().emit(
      "watch-party:leave",
    );

    disconnectWatchPartySocket();

    router.push(
      "/watch-party",
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />

            <p className="text-sm text-muted-foreground">
              Loading Watch Party...
            </p>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (!party) {
    return null;
  }

  if (!user?._id) {
    return (
      <ProtectedRoute>
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">
            Loading your account...
          </p>
        </main>
      </ProtectedRoute>
    );
  }

  const isHost =
    party.host?._id ===
    user._id;

  return (
    <ProtectedRoute>
      <main className="min-h-[calc(100vh-4rem)] bg-background">
        <div className="mx-auto max-w-[1800px] p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  router.back()
                }
                className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-foreground sm:text-xl">
                  Watch Party
                </h1>

                <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                  <span>
                    Code:{" "}
                    {party.partyCode}
                  </span>

                  <button
                    type="button"
                    onClick={
                      handleCopyCode
                    }
                    className="rounded-full p-1 transition-colors hover:bg-muted hover:text-red-500"
                    title="Copy party code"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={
                handleLeave
              }
              className="h-9 rounded-full border-border px-4 text-sm text-foreground hover:bg-muted hover:text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Leave
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="min-w-0 space-y-4">
              <div className="overflow-hidden rounded-2xl border border-border bg-black">
                <WatchPartyVideo
                  videoUrl={
                    party.video
                      .videoUrl
                  }
                  thumbnailUrl={
                    party.video
                      .thumbnailUrl
                  }
                  partyCode={
                    partyCode
                  }
                  isHost={isHost}
                  initialCurrentTime={
                    party.playback
                      .currentTime
                  }
                  initialIsPlaying={
                    party.playback
                      .isPlaying
                  }
                />
              </div>

              <WatchPartyCall
                partyCode={
                  partyCode
                }
                userId={
                  user._id
                }
                userName={
                  user.name ||
                  "You"
                }
                userAvatar={
                  user.avatar ||
                  ""
                }
              />

              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {
                    party.video
                      .title
                  }
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Watching together on Binge
                </p>
              </div>
            </section>

            <aside className="space-y-4">
              {showParticipants && (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-red-500" />

                      <h2 className="font-semibold text-foreground">
                        Participants
                      </h2>
                    </div>

                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      {
                        party
                          .participants
                          .length
                      }
                    </span>
                  </div>

                  <div className="space-y-3">
                    {party.participants.map(
                      (
                        participant,
                      ) => (
                        <div
                          key={
                            participant
                              .user
                              ._id
                          }
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                            {participant
                              .user
                              .avatar ? (
                              <img
                                src={
                                  participant
                                    .user
                                    .avatar
                                }
                                alt={
                                  participant
                                    .user
                                    .name
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-muted-foreground">
                                {participant.user.name
                                  ?.charAt(
                                    0,
                                  )
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {
                                participant
                                  .user
                                  .name
                              }
                            </p>

                            {participant
                              .user
                              ._id ===
                              party
                                .host
                                ._id && (
                              <p className="text-xs text-red-500">
                                Host
                              </p>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {showChat && (
                <WatchPartyChat
                  partyCode={
                    partyCode
                  }
                  userId={
                    user._id
                  }
                  userName={
                    user.name ||
                    "You"
                  }
                  userAvatar={
                    user.avatar ||
                    ""
                  }
                />
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setShowParticipants(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                  className="flex-1 rounded-full border-border"
                >
                  <Users className="mr-2 h-4 w-4" />
                  {showParticipants
                    ? "Hide"
                    : "Show"}{" "}
                  Participants
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setShowChat(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                  className="flex-1 rounded-full border-border"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {showChat
                    ? "Hide"
                    : "Show"}{" "}
                  Chat
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}