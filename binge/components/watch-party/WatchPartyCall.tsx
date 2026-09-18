"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  RefreshCw,
  User,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getWatchPartySocket } from "@/lib/watchPartySocket";

type Participant = {
  userId: string;
  socketId: string;
  name?: string;
  avatar?: string;
  muted?: boolean;
  cameraOff?: boolean;
  isScreenSharing?: boolean;
  streamVersion?: number;
  connectionState?: "connected" | "disconnected" | "connecting";
};

interface WatchPartyStateParticipant {
  user: {
    _id: string;
    name?: string;
    username?: string;
    avatar?: string;
  };
  joinedAt?: string;
  socketId?: string;
}

interface ReconnectRequest {
  requesterSocketId: string;
  requesterUserId: string;
  requesterName?: string;
  requesterAvatar?: string;
}

interface ReconnectResponse {
  accepted?: boolean;
  targetSocketId?: string;
  responderSocketId?: string;
  responderUserId?: string;
}

interface WatchPartyCallProps {
  partyCode: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "stun:stun1.l.google.com:19302",
    },
  ],
};

const WatchPartyCall = ({
  partyCode,
  userId,
  userName = "You",
  userAvatar = "",
}: WatchPartyCallProps) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);

  const screenStreamRef = useRef<MediaStream | null>(null);

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(
    new Map(),
  );

  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());

  const screenSendersRef = useRef<Map<string, RTCRtpSender>>(new Map());

  const pendingIceCandidatesRef = useRef<
    Map<string, RTCIceCandidateInit[]>
  >(new Map());

  const makingOfferRef = useRef<Set<string>>(new Set());

  const participantsRef = useRef<Participant[]>([]);

  const userIdRef = useRef(userId);

  const reconnectingRef = useRef<Set<string>>(new Set());

  const reconnectTargetRef = useRef<string | null>(null);

  const [participants, setParticipants] = useState<Participant[]>([]);

  const [muted, setMuted] = useState(false);

  const [cameraOff, setCameraOff] = useState(false);

  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [callStarted, setCallStarted] = useState(false);

  const [mediaError, setMediaError] = useState("");

  const [reconnecting, setReconnecting] = useState(false);

  const [reconnectPending, setReconnectPending] = useState(false);

  const [reconnectRequest, setReconnectRequest] =
    useState<ReconnectRequest | null>(null);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    const video = localVideoRef.current;

    const stream = localStreamRef.current;

    if (!video || !stream) {
      return;
    }

    if (video.srcObject !== stream) {
      video.srcObject = stream;
    }

    void video.play().catch(() => {});
  }, [callStarted, cameraOff]);

  const closePeerConnection = useCallback(
    (socketId: string, markDisconnected = true) => {
      const peerConnection =
        peerConnectionsRef.current.get(socketId);

      if (peerConnection) {
        peerConnection.onicecandidate = null;
        peerConnection.ontrack = null;
        peerConnection.onnegotiationneeded = null;
        peerConnection.onconnectionstatechange = null;

        try {
          peerConnection.close();
        } catch {
          // Ignore already closed connections.
        }
      }

      peerConnectionsRef.current.delete(socketId);
      remoteStreamsRef.current.delete(socketId);
      screenSendersRef.current.delete(socketId);
      pendingIceCandidatesRef.current.delete(socketId);
      makingOfferRef.current.delete(socketId);

      if (markDisconnected) {
        setParticipants((currentParticipants) =>
          currentParticipants.map((participant) =>
            participant.socketId === socketId
              ? {
                  ...participant,
                  connectionState: "disconnected",
                  streamVersion:
                    (participant.streamVersion || 0) + 1,
                }
              : participant,
          ),
        );
      }
    },
    [],
  );

  const removePeer = useCallback(
    (socketId: string) => {
      closePeerConnection(socketId, false);

      setParticipants((currentParticipants) =>
        currentParticipants.filter(
          (participant) =>
            participant.socketId !== socketId,
        ),
      );
    },
    [closePeerConnection],
  );

  const createPeerConnection = useCallback(
    (socketId: string, remoteUserId?: string) => {
      const existingConnection =
        peerConnectionsRef.current.get(socketId);

      if (existingConnection) {
        const connectionWithUser =
          existingConnection as RTCPeerConnection & {
            remoteUserId?: string;
          };

        if (
          remoteUserId &&
          !connectionWithUser.remoteUserId
        ) {
          connectionWithUser.remoteUserId =
            remoteUserId;
        }

        return existingConnection;
      }

      const socket = getWatchPartySocket();

      const peerConnection =
        new RTCPeerConnection(ICE_SERVERS);

      const connectionWithUser =
        peerConnection as RTCPeerConnection & {
          remoteUserId?: string;
        };

      connectionWithUser.remoteUserId =
        remoteUserId;

      const localStream =
        localStreamRef.current;

      if (localStream) {
        localStream
          .getTracks()
          .forEach((track) => {
            const alreadyAdded =
              peerConnection
                .getSenders()
                .some(
                  (sender) =>
                    sender.track?.id ===
                    track.id,
                );

            if (!alreadyAdded) {
              peerConnection.addTrack(
                track,
                localStream,
              );
            }
          });
      }

      peerConnection.onicecandidate = (
        event,
      ) => {
        if (!event.candidate) {
          return;
        }

        socket.emit(
          "watch-party:ice-candidate",
          {
            targetSocketId: socketId,
            candidate: event.candidate,
          },
        );
      };

      peerConnection.ontrack = (event) => {
        let remoteStream =
          remoteStreamsRef.current.get(
            socketId,
          );

        if (!remoteStream) {
          remoteStream =
            new MediaStream();

          remoteStreamsRef.current.set(
            socketId,
            remoteStream,
          );
        }

        const alreadyExists =
          remoteStream
            .getTracks()
            .some(
              (track) =>
                track.id ===
                event.track.id,
            );

        if (!alreadyExists) {
          remoteStream.addTrack(
            event.track,
          );
        }

        const remoteUserIdFromConnection =
          connectionWithUser.remoteUserId;

        setParticipants(
          (currentParticipants) => {
            const existing =
              currentParticipants.find(
                (participant) =>
                  participant.socketId ===
                  socketId,
              );

            if (!existing) {
              return [
                ...currentParticipants,
                {
                  userId:
                    remoteUserIdFromConnection ||
                    socketId,
                  socketId,
                  name: "Participant",
                  avatar: "",
                  streamVersion: 1,
                  connectionState:
                    "connected",
                },
              ];
            }

            return currentParticipants.map(
              (participant) =>
                participant.socketId ===
                socketId
                  ? {
                      ...participant,
                      connectionState:
                        "connected",
                      streamVersion:
                        (participant.streamVersion ||
                          0) + 1,
                    }
                  : participant,
            );
          },
        );
      };

      peerConnection.onnegotiationneeded =
        async () => {
          try {
            if (
              peerConnection.signalingState !==
              "stable"
            ) {
              return;
            }

            if (
              makingOfferRef.current.has(
                socketId,
              )
            ) {
              return;
            }

            makingOfferRef.current.add(
              socketId,
            );

            const offer =
              await peerConnection.createOffer();

            if (
              peerConnection.signalingState !==
              "stable"
            ) {
              return;
            }

            await peerConnection.setLocalDescription(
              offer,
            );

            socket.emit(
              "watch-party:webrtc-offer",
              {
                targetSocketId:
                  socketId,
                offer:
                  peerConnection.localDescription,
              },
            );
          } catch (error) {
            console.error(
              "WebRTC negotiation error:",
              error,
            );
          } finally {
            makingOfferRef.current.delete(
              socketId,
            );
          }
        };

      peerConnection.onconnectionstatechange =
        () => {
          const state =
            peerConnection.connectionState;

          console.log(
            "[Watch Party] Peer connection:",
            socketId,
            state,
          );

          if (state === "connected") {
            setParticipants(
              (currentParticipants) =>
                currentParticipants.map(
                  (participant) =>
                    participant.socketId ===
                    socketId
                      ? {
                          ...participant,
                          connectionState:
                            "connected",
                        }
                      : participant,
                ),
            );

            reconnectingRef.current.delete(
              socketId,
            );

            if (
              reconnectTargetRef.current ===
              socketId
            ) {
              reconnectTargetRef.current =
                null;

              setReconnecting(false);
              setReconnectPending(false);

              toast.success(
                "Video call reconnected.",
              );
            }
          }

          if (
            state === "failed" ||
            state === "disconnected"
          ) {
            closePeerConnection(
              socketId,
              true,
            );

            toast.info(
              "Call connection lost. You can request to reconnect.",
            );
          }

          if (state === "closed") {
            closePeerConnection(
              socketId,
              true,
            );
          }
        };

      peerConnectionsRef.current.set(
        socketId,
        peerConnection,
      );

      return peerConnection;
    },
    [closePeerConnection],
  );

  const addLocalTracksToPeer =
    useCallback(
      (
        peerConnection: RTCPeerConnection,
      ) => {
        const localStream =
          localStreamRef.current;

        if (!localStream) {
          return;
        }

        localStream
          .getTracks()
          .forEach((track) => {
            const alreadyAdded =
              peerConnection
                .getSenders()
                .some(
                  (sender) =>
                    sender.track?.id ===
                    track.id,
                );

            if (!alreadyAdded) {
              peerConnection.addTrack(
                track,
                localStream,
              );
            }
          });
      },
      [],
    );

  const createOffer = useCallback(
    async (
      socketId: string,
      remoteUserId?: string,
    ) => {
      const peerConnection =
        createPeerConnection(
          socketId,
          remoteUserId,
        );

      if (
        peerConnection.signalingState !==
        "stable"
      ) {
        return;
      }

      if (
        makingOfferRef.current.has(
          socketId,
        )
      ) {
        return;
      }

      try {
        const socket =
          getWatchPartySocket();

        makingOfferRef.current.add(
          socketId,
        );

        addLocalTracksToPeer(
          peerConnection,
        );

        const offer =
          await peerConnection.createOffer();

        if (
          peerConnection.signalingState !==
          "stable"
        ) {
          return;
        }

        await peerConnection.setLocalDescription(
          offer,
        );

        socket.emit(
          "watch-party:webrtc-offer",
          {
            targetSocketId: socketId,
            offer:
              peerConnection.localDescription,
          },
        );
      } catch (error) {
        console.error(
          "Failed to create WebRTC offer:",
          error,
        );
      } finally {
        makingOfferRef.current.delete(
          socketId,
        );
      }
    },
    [
      addLocalTracksToPeer,
      createPeerConnection,
    ],
  );

  /*
   * ANY participant can request another
   * participant to reconnect.
   *
   * This includes:
   *
   * Participant -> Host
   * Host -> Participant
   * Participant -> Participant
   */
  const requestReconnect = useCallback(
    (participant: Participant) => {
      const socket =
        getWatchPartySocket();

      if (!socket.connected) {
        toast.error(
          "You are not connected to the Watch Party.",
        );

        return;
      }

      if (
        reconnectPending ||
        reconnecting
      ) {
        return;
      }

      reconnectTargetRef.current =
        participant.socketId;

      setReconnectPending(true);

      socket.emit(
        "watch-party:reconnect-request",
        {
          targetSocketId:
            participant.socketId,
          requesterUserId: userId,
          requesterName: userName,
          requesterAvatar: userAvatar,
        },
      );

      toast.info(
        `Reconnect request sent to ${
          participant.name ||
          "participant"
        }.`,
      );
    },
    [
      reconnectPending,
      reconnecting,
      userId,
      userName,
      userAvatar,
    ],
  );

  /*
   * ACCEPT a reconnect request.
   *
   * The receiver can be the host OR another
   * participant.
   */
  const acceptReconnect = useCallback(
    async (
      request: ReconnectRequest,
    ) => {
      const socket =
        getWatchPartySocket();

      if (!socket.connected) {
        return;
      }

      const requesterSocketId =
        request.requesterSocketId;

      const requesterUserId =
        request.requesterUserId;

      setReconnectRequest(null);

      socket.emit(
        "watch-party:reconnect-response",
        {
          targetSocketId:
            requesterSocketId,
          accepted: true,
        },
      );

      /*
       * Close stale WebRTC connection
       * on the receiver side.
       */
      closePeerConnection(
        requesterSocketId,
        true,
      );

      setParticipants(
        (currentParticipants) =>
          currentParticipants.map(
            (participant) =>
              participant.socketId ===
              requesterSocketId
                ? {
                    ...participant,
                    userId:
                      requesterUserId ||
                      participant.userId,
                    name:
                      request.requesterName ||
                      participant.name,
                    avatar:
                      request.requesterAvatar ||
                      participant.avatar,
                    connectionState:
                      "connecting",
                    streamVersion:
                      (participant.streamVersion ||
                        0) + 1,
                  }
                : participant,
          ),
      );

      /*
       * Deterministic initiator:
       *
       * The user with the lower userId
       * creates the offer.
       */
      if (
        userId.localeCompare(
          requesterUserId,
        ) < 0
      ) {
        await createOffer(
          requesterSocketId,
          requesterUserId,
        );
      } else {
        createPeerConnection(
          requesterSocketId,
          requesterUserId,
        );
      }

      toast.success(
        `${
          request.requesterName ||
          "Participant"
        } can reconnect now.`,
      );
    },
    [
      closePeerConnection,
      createOffer,
      createPeerConnection,
      userId,
    ],
  );

  const rejectReconnect = useCallback(
    (request: ReconnectRequest) => {
      const socket =
        getWatchPartySocket();

      socket.emit(
        "watch-party:reconnect-response",
        {
          targetSocketId:
            request.requesterSocketId,
          accepted: false,
        },
      );

      setReconnectRequest(null);

      toast.info(
        "Reconnect request declined.",
      );
    },
    [],
  );

  const reconnectToParticipant =
    useCallback(
      async (
        socketId: string,
        remoteUserId: string,
      ) => {
        if (
          reconnectingRef.current.has(
            socketId,
          )
        ) {
          return;
        }

        reconnectingRef.current.add(
          socketId,
        );

        reconnectTargetRef.current =
          socketId;

        setReconnectPending(false);
        setReconnecting(true);

        closePeerConnection(
          socketId,
          true,
        );

        await new Promise(
          (resolve) =>
            setTimeout(resolve, 250),
        );

        try {
          if (
            userId.localeCompare(
              remoteUserId,
            ) < 0
          ) {
            await createOffer(
              socketId,
              remoteUserId,
            );
          } else {
            createPeerConnection(
              socketId,
              remoteUserId,
            );
          }
        } catch (error) {
          console.error(
            "Reconnect failed:",
            error,
          );

          reconnectingRef.current.delete(
            socketId,
          );

          if (
            reconnectTargetRef.current ===
            socketId
          ) {
            reconnectTargetRef.current =
              null;
          }

          setReconnecting(false);

          toast.error(
            "Unable to reconnect the video call.",
          );
        }
      },
      [
        closePeerConnection,
        createOffer,
        createPeerConnection,
        userId,
      ],
    );

  useEffect(() => {
    if (!partyCode || !userId) {
      return;
    }

    const socket =
      getWatchPartySocket();

    const handlePartyState = (data: {
      party?: {
        participants?: WatchPartyStateParticipant[];
      };
    }) => {
      const partyParticipants =
        data?.party?.participants;

      if (!partyParticipants) {
        return;
      }

      const remoteParticipants: Participant[] =
        partyParticipants
          .filter(
            (participant) =>
              participant?.user?._id &&
              participant.user._id !==
                userId &&
              participant.socketId,
          )
          .map(
            (
              participant,
            ): Participant => ({
              userId:
                participant.user._id,
              socketId:
                participant.socketId!,
              name:
                participant.user.name ||
                "Participant",
              avatar:
                participant.user.avatar ||
                "",
              streamVersion: 0,
              connectionState:
                peerConnectionsRef.current.has(
                  participant.socketId!,
                )
                  ? "connected"
                  : "disconnected",
            }),
          );

      setParticipants(
        (currentParticipants) => {
          const currentBySocket =
            new Map(
              currentParticipants.map(
                (participant) => [
                  participant.socketId,
                  participant,
                ],
              ),
            );

          return remoteParticipants.map(
            (
              participant,
            ): Participant => {
              const existing =
                currentBySocket.get(
                  participant.socketId,
                );

              return {
                ...participant,
                muted:
                  existing?.muted ||
                  false,
                cameraOff:
                  existing?.cameraOff ||
                  false,
                isScreenSharing:
                  existing?.isScreenSharing ||
                  false,
                streamVersion:
                  existing?.streamVersion ||
                  0,
                connectionState:
                  existing?.connectionState ||
                  participant.connectionState,
              };
            },
          );
        },
      );

      for (const participant of remoteParticipants) {
        if (
          userId.localeCompare(
            participant.userId,
          ) < 0 &&
          !peerConnectionsRef.current.has(
            participant.socketId,
          )
        ) {
          void createOffer(
            participant.socketId,
            participant.userId,
          );
        }
      }
    };

    const handleUserJoined = ({
      userId: joinedUserId,
      socketId,
      name,
      avatar,
    }: {
      userId: string;
      socketId: string;
      name?: string;
      avatar?: string;
    }) => {
      if (
        !socketId ||
        !joinedUserId ||
        joinedUserId === userId
      ) {
        return;
      }

      setParticipants(
        (currentParticipants) => {
          const existing =
            currentParticipants.find(
              (participant) =>
                participant.socketId ===
                socketId,
            );

          if (existing) {
            return currentParticipants;
          }

          return [
            ...currentParticipants,
            {
              userId: joinedUserId,
              socketId,
              name:
                name ||
                "Participant",
              avatar:
                avatar || "",
              streamVersion: 0,
              connectionState:
                "connecting",
            },
          ];
        },
      );

      if (
        userId.localeCompare(
          joinedUserId,
        ) < 0
      ) {
        void createOffer(
          socketId,
          joinedUserId,
        );
      }
    };

    const handleUserLeft = ({
      socketId,
    }: {
      socketId: string;
    }) => {
      if (!socketId) {
        return;
      }

      removePeer(socketId);
    };

    const handleOffer = async ({
      senderSocketId,
      offer,
    }: {
      senderSocketId: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      try {
        if (
          !senderSocketId ||
          !offer ||
          senderSocketId === socket.id
        ) {
          return;
        }

        const remoteParticipant =
          participantsRef.current.find(
            (participant) =>
              participant.socketId ===
              senderSocketId,
          );

        const remoteUserId =
          remoteParticipant?.userId;

        const peerConnection =
          createPeerConnection(
            senderSocketId,
            remoteUserId,
          );

        const isPolite =
          remoteUserId
            ? userId.localeCompare(
                remoteUserId,
              ) > 0
            : true;

        const offerCollision =
          makingOfferRef.current.has(
            senderSocketId,
          ) ||
          peerConnection.signalingState !==
            "stable";

        if (
          offerCollision &&
          !isPolite
        ) {
          return;
        }

        if (
          offerCollision &&
          isPolite
        ) {
          try {
            await peerConnection.setLocalDescription(
              {
                type: "rollback",
              },
            );
          } catch (error) {
            console.warn(
              "[Watch Party] WebRTC rollback failed:",
              error,
            );
          }
        }

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(
            offer,
          ),
        );

        const pendingCandidates =
          pendingIceCandidatesRef.current.get(
            senderSocketId,
          ) || [];

        for (const candidate of pendingCandidates) {
          try {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(
                candidate,
              ),
            );
          } catch (error) {
            console.warn(
              "[Watch Party] Failed to apply pending ICE candidate:",
              error,
            );
          }
        }

        pendingIceCandidatesRef.current.delete(
          senderSocketId,
        );

        addLocalTracksToPeer(
          peerConnection,
        );

        const answer =
          await peerConnection.createAnswer();

        await peerConnection.setLocalDescription(
          answer,
        );

        socket.emit(
          "watch-party:webrtc-answer",
          {
            targetSocketId:
              senderSocketId,
            answer:
              peerConnection.localDescription,
          },
        );
      } catch (error) {
        console.error(
          "Failed to handle WebRTC offer:",
          error,
        );
      }
    };

    const handleAnswer = async ({
      senderSocketId,
      answer,
    }: {
      senderSocketId: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      try {
        if (
          !senderSocketId ||
          !answer
        ) {
          return;
        }

        const peerConnection =
          peerConnectionsRef.current.get(
            senderSocketId,
          );

        if (!peerConnection) {
          return;
        }

        if (
          peerConnection.signalingState !==
          "have-local-offer"
        ) {
          return;
        }

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(
            answer,
          ),
        );

        const pendingCandidates =
          pendingIceCandidatesRef.current.get(
            senderSocketId,
          ) || [];

        for (const candidate of pendingCandidates) {
          try {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(
                candidate,
              ),
            );
          } catch (error) {
            console.warn(
              "[Watch Party] Failed to apply pending ICE candidate:",
              error,
            );
          }
        }

        pendingIceCandidatesRef.current.delete(
          senderSocketId,
        );
      } catch (error) {
        console.error(
          "Failed to handle WebRTC answer:",
          error,
        );
      }
    };

    const handleIceCandidate = async ({
      senderSocketId,
      candidate,
    }: {
      senderSocketId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      try {
        if (
          !senderSocketId ||
          !candidate
        ) {
          return;
        }

        const peerConnection =
          peerConnectionsRef.current.get(
            senderSocketId,
          );

        if (
          !peerConnection ||
          !peerConnection.remoteDescription
        ) {
          const pending =
            pendingIceCandidatesRef.current.get(
              senderSocketId,
            ) || [];

          pending.push(candidate);

          pendingIceCandidatesRef.current.set(
            senderSocketId,
            pending,
          );

          return;
        }

        await peerConnection.addIceCandidate(
          new RTCIceCandidate(
            candidate,
          ),
        );
      } catch (error) {
        console.error(
          "Failed to add ICE candidate:",
          error,
        );
      }
    };

    const handleMediaState = ({
      userId: remoteUserId,
      socketId,
      muted: remoteMuted,
      cameraOff: remoteCameraOff,
    }: {
      userId: string;
      socketId: string;
      muted: boolean;
      cameraOff: boolean;
    }) => {
      if (
        !socketId ||
        socketId === socket.id ||
        remoteUserId === userId
      ) {
        return;
      }

      setParticipants(
        (currentParticipants) => {
          const existing =
            currentParticipants.find(
              (participant) =>
                participant.socketId ===
                socketId,
            );

          if (!existing) {
            return [
              ...currentParticipants,
              {
                userId: remoteUserId,
                socketId,
                name: "Participant",
                avatar: "",
                muted: remoteMuted,
                cameraOff:
                  remoteCameraOff,
                streamVersion: 0,
                connectionState:
                  "connected",
              },
            ];
          }

          return currentParticipants.map(
            (participant) =>
              participant.socketId ===
              socketId
                ? {
                    ...participant,
                    userId:
                      remoteUserId ||
                      participant.userId,
                    muted: remoteMuted,
                    cameraOff:
                      remoteCameraOff,
                  }
                : participant,
          );
        },
      );
    };

    const handleScreenShare = ({
      userId: remoteUserId,
      socketId,
      isSharing:
        remoteIsSharing,
    }: {
      userId: string;
      socketId: string;
      isSharing: boolean;
    }) => {
      if (
        !socketId ||
        socketId === socket.id
      ) {
        return;
      }

      setParticipants(
        (currentParticipants) =>
          currentParticipants.map(
            (participant) =>
              participant.socketId ===
              socketId
                ? {
                    ...participant,
                    userId:
                      remoteUserId ||
                      participant.userId,
                    isScreenSharing:
                      remoteIsSharing,
                  }
                : participant,
          ),
      );
    };

    /*
     * ANY participant can receive a
     * reconnect request.
     */
    const handleReconnectRequest = (
      request: ReconnectRequest,
    ) => {
      if (
        !request?.requesterSocketId ||
        !request?.requesterUserId
      ) {
        return;
      }

      setReconnectRequest(request);

      toast.info(
        `${
          request.requesterName ||
          "A participant"
        } wants to reconnect.`,
      );
    };

    /*
     * The requester receives the response
     * from whoever they requested.
     *
     * This can be:
     *
     * Host -> Participant
     * Participant -> Host
     * Participant -> Participant
     */
    const handleReconnectResponse = (
      data: ReconnectResponse,
    ) => {
      const currentSocket =
        getWatchPartySocket();

      if (
        !data ||
        data.targetSocketId !==
          currentSocket.id
      ) {
        return;
      }

      setReconnectPending(false);

      if (!data.accepted) {
        reconnectTargetRef.current =
          null;

        toast.error(
          "The reconnect request was declined.",
        );

        return;
      }

      toast.success(
        "Reconnect request accepted.",
      );

      const targetSocketId =
        reconnectTargetRef.current ||
        data.responderSocketId;

      if (!targetSocketId) {
        toast.error(
          "Reconnect target was lost. Please request again.",
        );

        return;
      }

      const targetParticipant =
        participantsRef.current.find(
          (participant) =>
            participant.socketId ===
            targetSocketId,
        );

      const remoteUserId =
        data.responderUserId ||
        targetParticipant?.userId;

      if (!remoteUserId) {
        toast.error(
          "Participant information was lost. Please request again.",
        );

        reconnectTargetRef.current =
          null;

        return;
      }

      void reconnectToParticipant(
        targetSocketId,
        remoteUserId,
      );
    };

    socket.on(
      "watch-party:state",
      handlePartyState,
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
      "watch-party:webrtc-offer",
      handleOffer,
    );

    socket.on(
      "watch-party:webrtc-answer",
      handleAnswer,
    );

    socket.on(
      "watch-party:ice-candidate",
      handleIceCandidate,
    );

    socket.on(
      "watch-party:media-state",
      handleMediaState,
    );

    socket.on(
      "watch-party:screen-share",
      handleScreenShare,
    );

    socket.on(
      "watch-party:reconnect-request",
      handleReconnectRequest,
    );

    socket.on(
      "watch-party:reconnect-response",
      handleReconnectResponse,
    );

    return () => {
      socket.off(
        "watch-party:state",
        handlePartyState,
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
        "watch-party:webrtc-offer",
        handleOffer,
      );

      socket.off(
        "watch-party:webrtc-answer",
        handleAnswer,
      );

      socket.off(
        "watch-party:ice-candidate",
        handleIceCandidate,
      );

      socket.off(
        "watch-party:media-state",
        handleMediaState,
      );

      socket.off(
        "watch-party:screen-share",
        handleScreenShare,
      );

      socket.off(
        "watch-party:reconnect-request",
        handleReconnectRequest,
      );

      socket.off(
        "watch-party:reconnect-response",
        handleReconnectResponse,
      );
    };
  }, [
    partyCode,
    userId,
    createOffer,
    createPeerConnection,
    addLocalTracksToPeer,
    removePeer,
    reconnectToParticipant,
  ]);

  /*
   * Acquire camera and microphone.
   */
  useEffect(() => {
    if (!partyCode || !userId) {
      return;
    }

    let mounted = true;

    const startMedia = async () => {
      try {
        setMediaError("");

        if (
          !navigator.mediaDevices?.getUserMedia
        ) {
          throw new Error(
            "Media devices are not supported.",
          );
        }

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: {
                width: {
                  ideal: 1280,
                },
                height: {
                  ideal: 720,
                },
                facingMode: "user",
              },
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            },
          );

        if (!mounted) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop(),
            );

          return;
        }

        localStreamRef.current =
          stream;

        setCallStarted(true);

        for (const [
          socketId,
          peerConnection,
        ] of peerConnectionsRef.current) {
          addLocalTracksToPeer(
            peerConnection,
          );

          if (
            peerConnection.signalingState ===
            "stable"
          ) {
            void createOffer(
              socketId,
              (
                peerConnection as RTCPeerConnection & {
                  remoteUserId?: string;
                }
              ).remoteUserId,
            );
          }
        }

        getWatchPartySocket().emit(
          "watch-party:media-state",
          {
            muted: false,
            cameraOff: false,
          },
        );
      } catch (error) {
        console.error(
          "Unable to access camera/microphone:",
          error,
        );

        if (!mounted) {
          return;
        }

        setMediaError(
          "Camera or microphone permission was not granted.",
        );

        setCallStarted(true);

        toast.error(
          "Camera or microphone permission is required for video calling.",
        );
      }
    };

    startMedia();

    return () => {
      mounted = false;

      screenStreamRef.current
        ?.getTracks()
        .forEach((track) =>
          track.stop(),
        );

      localStreamRef.current
        ?.getTracks()
        .forEach((track) =>
          track.stop(),
        );

      localStreamRef.current = null;
      screenStreamRef.current = null;

      peerConnectionsRef.current.forEach(
        (connection) =>
          connection.close(),
      );

      peerConnectionsRef.current.clear();
      remoteStreamsRef.current.clear();
      screenSendersRef.current.clear();
      pendingIceCandidatesRef.current.clear();
      makingOfferRef.current.clear();
    };
  }, [
    partyCode,
    userId,
    addLocalTracksToPeer,
    createOffer,
  ]);

  const handleMute = () => {
    const stream =
      localStreamRef.current;

    const audioTrack =
      stream?.getAudioTracks()[0];

    if (!audioTrack) {
      toast.error(
        "Microphone is unavailable",
      );

      return;
    }

    const nextMuted = !muted;

    audioTrack.enabled =
      !nextMuted;

    setMuted(nextMuted);

    getWatchPartySocket().emit(
      "watch-party:media-state",
      {
        muted: nextMuted,
        cameraOff,
      },
    );
  };

  const handleCamera = () => {
    const stream =
      localStreamRef.current;

    const videoTrack =
      stream?.getVideoTracks()[0];

    if (!videoTrack) {
      toast.error(
        "Camera is unavailable",
      );

      return;
    }

    const nextCameraOff =
      !cameraOff;

    videoTrack.enabled =
      !nextCameraOff;

    setCameraOff(nextCameraOff);

    getWatchPartySocket().emit(
      "watch-party:media-state",
      {
        muted,
        cameraOff: nextCameraOff,
      },
    );
  };

  const addScreenTrackToPeers =
    useCallback(
      async (
        screenTrack: MediaStreamTrack,
      ) => {
        for (const [
          socketId,
          peerConnection,
        ] of peerConnectionsRef.current) {
          try {
            if (
              peerConnection.signalingState !==
              "stable"
            ) {
              continue;
            }

            const existingSender =
              peerConnection
                .getSenders()
                .find(
                  (sender) =>
                    sender.track?.kind ===
                      "video" &&
                    screenSendersRef.current.get(
                      socketId,
                    ) === sender,
                );

            if (existingSender) {
              continue;
            }

            const sender =
              peerConnection.addTrack(
                screenTrack,
                new MediaStream([
                  screenTrack,
                ]),
              );

            screenSendersRef.current.set(
              socketId,
              sender,
            );
          } catch (error) {
            console.error(
              "Failed to add screen track:",
              error,
            );
          }
        }
      },
      [],
    );

  const removeScreenTrackFromPeers =
    useCallback(async () => {
      for (const [
        socketId,
        peerConnection,
      ] of peerConnectionsRef.current) {
        const sender =
          screenSendersRef.current.get(
            socketId,
          );

        if (!sender) {
          continue;
        }

        try {
          peerConnection.removeTrack(
            sender,
          );

          screenSendersRef.current.delete(
            socketId,
          );
        } catch (error) {
          console.error(
            "Failed to remove screen track:",
            error,
          );
        }
      }
    }, []);

  const stopScreenShare =
    useCallback(async () => {
      await removeScreenTrackFromPeers();

      screenStreamRef.current
        ?.getTracks()
        .forEach((track) =>
          track.stop(),
        );

      screenStreamRef.current =
        null;

      setIsScreenSharing(false);

      getWatchPartySocket().emit(
        "watch-party:screen-share",
        {
          isSharing: false,
        },
      );
    }, [removeScreenTrackFromPeers]);

  const handleScreenShare =
    async () => {
      if (isScreenSharing) {
        await stopScreenShare();
        return;
      }

      if (
        !navigator.mediaDevices
          ?.getDisplayMedia
      ) {
        toast.error(
          "Screen sharing is not supported in this browser.",
        );

        return;
      }

      try {
        const stream =
          await navigator.mediaDevices.getDisplayMedia(
            {
              video: true,
              audio: false,
            },
          );

        const screenTrack =
          stream.getVideoTracks()[0];

        if (!screenTrack) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop(),
            );

          return;
        }

        screenStreamRef.current =
          stream;

        setIsScreenSharing(true);

        await addScreenTrackToPeers(
          screenTrack,
        );

        getWatchPartySocket().emit(
          "watch-party:screen-share",
          {
            isSharing: true,
          },
        );

        screenTrack.onended = () => {
          if (
            screenStreamRef.current
          ) {
            void stopScreenShare();
          }
        };

        toast.success(
          "Screen sharing started",
        );
      } catch (error: any) {
        if (
          error?.name ===
          "NotAllowedError"
        ) {
          toast.info(
            "Screen sharing was cancelled.",
          );

          return;
        }

        console.error(
          "Failed to start screen sharing:",
          error,
        );

        toast.error(
          "Unable to start screen sharing.",
        );
      }
    };

  /*
   * HANG UP VIDEO CALL ONLY.
   *
   * Socket.IO stays connected.
   * Participant stays inside Watch Party.
   */
  const handleLeaveCall = () => {
    screenStreamRef.current
      ?.getTracks()
      .forEach((track) =>
        track.stop(),
      );

    screenStreamRef.current =
      null;

    for (const socketId of peerConnectionsRef.current.keys()) {
      closePeerConnection(
        socketId,
        true,
      );
    }

    setIsScreenSharing(false);
    setReconnectPending(false);
    setReconnecting(false);

    reconnectTargetRef.current =
      null;

    toast.info(
      "You left the video call. You can request to reconnect.",
    );
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">
            Video Call
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            {participants.length + 1}{" "}
            {participants.length + 1 ===
            1
              ? "participant"
              : "participants"}
          </p>
        </div>

        <div className="flex h-8 items-center rounded-full bg-muted px-3 text-xs text-muted-foreground">
          {reconnectPending
            ? "Waiting for response..."
            : reconnecting
              ? "Reconnecting..."
              : callStarted
                ? "Live"
                : "Connecting..."}
        </div>
      </div>

      {mediaError && (
        <div className="mb-4 rounded-xl border border-border bg-muted p-3 text-sm text-muted-foreground">
          {mediaError}
        </div>
      )}

      {reconnectRequest && (
        <div className="mb-4 rounded-xl border border-border bg-muted p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background">
              {reconnectRequest.requesterAvatar ? (
                <img
                  src={
                    reconnectRequest.requesterAvatar
                  }
                  alt={
                    reconnectRequest.requesterName ||
                    "Participant"
                  }
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {reconnectRequest.requesterName ||
                  "A participant"}{" "}
                wants to reconnect
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Allow this participant to
                reconnect to the video call?
              </p>

              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    void acceptReconnect(
                      reconnectRequest,
                    )
                  }
                  className="gap-1.5 bg-red-500 text-white hover:bg-red-600"
                >
                  <Check className="h-4 w-4" />
                  Accept
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    rejectReconnect(
                      reconnectRequest,
                    )
                  }
                  className="gap-1.5 border-border"
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
          {cameraOff ||
          !localStreamRef.current ? (
            <div className="flex h-full flex-col items-center justify-center">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background">
                  <User className="h-7 w-7 text-muted-foreground" />
                </div>
              )}

              <p className="mt-2 text-sm font-medium text-foreground">
                {userName}{" "}
                <span className="text-muted-foreground">
                  (You)
                </span>
              </p>
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
          )}

          <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
            {userName} (You)
          </div>

          {muted && (
            <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70">
              <MicOff className="h-4 w-4 text-white" />
            </div>
          )}

          {isScreenSharing && (
            <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
              <MonitorUp className="h-3.5 w-3.5" />
              Sharing
            </div>
          )}
        </div>

        {participants.map(
          (participant) => (
            <div
              key={
                participant.socketId
              }
              className="relative aspect-video overflow-hidden rounded-xl bg-muted"
            >
              <RemoteParticipant
                participant={
                  participant
                }
                stream={remoteStreamsRef.current.get(
                  participant.socketId,
                )}
                streamVersion={
                  participant.streamVersion ||
                  0
                }
              />

              {participant.connectionState ===
                "disconnected" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 p-4 text-center">
                  <RefreshCw className="mb-2 h-6 w-6 text-muted-foreground" />

                  <p className="text-sm font-medium text-foreground">
                    Call disconnected
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Request permission from{" "}
                    {participant.name ||
                      "this participant"}{" "}
                    to reconnect.
                  </p>

                  <Button
                    type="button"
                    size="sm"
                    disabled={
                      reconnectPending ||
                      reconnecting
                    }
                    onClick={() =>
                      requestReconnect(
                        participant,
                      )
                    }
                    className="mt-3 gap-1.5 bg-red-500 text-white hover:bg-red-600"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        reconnectPending ||
                        reconnecting
                          ? "animate-spin"
                          : ""
                      }`}
                    />

                    {reconnectPending
                      ? "Request Sent"
                      : reconnecting
                        ? "Reconnecting..."
                        : "Reconnect Call"}
                  </Button>
                </div>
              )}
            </div>
          ),
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleMute}
          disabled={!callStarted}
          className="h-11 w-11 rounded-full border-border"
          title={
            muted
              ? "Unmute"
              : "Mute"
          }
        >
          {muted ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleCamera}
          disabled={!callStarted}
          className="h-11 w-11 rounded-full border-border"
          title={
            cameraOff
              ? "Turn camera on"
              : "Turn camera off"
          }
        >
          {cameraOff ? (
            <CameraOff className="h-5 w-5" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
        </Button>

        <Button
          type="button"
          variant={
            isScreenSharing
              ? "default"
              : "outline"
          }
          size="icon"
          onClick={
            handleScreenShare
          }
          disabled={!callStarted}
          className={`h-11 w-11 rounded-full ${
            isScreenSharing
              ? "bg-red-500 text-white hover:bg-red-600"
              : "border-border"
          }`}
          title={
            isScreenSharing
              ? "Stop sharing"
              : "Share screen"
          }
        >
          <MonitorUp className="h-5 w-5" />
        </Button>

        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={
            handleLeaveCall
          }
          disabled={!callStarted}
          className="h-11 w-11 rounded-full"
          title="Leave video call"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>

      {reconnectPending && (
        <div className="mt-3 text-center text-xs text-muted-foreground">
          Waiting for the participant to
          accept your reconnect request...
        </div>
      )}
    </div>
  );
};

interface RemoteParticipantProps {
  participant: Participant;
  stream?: MediaStream;
  streamVersion: number;
}

const RemoteParticipant = ({
  participant,
  stream,
  streamVersion,
}: RemoteParticipantProps) => {
  const videoRef =
    useRef<HTMLVideoElement | null>(
      null,
    );

  const [hasVideo, setHasVideo] =
    useState(false);

  useEffect(() => {
    const video =
      videoRef.current;

    if (!video || !stream) {
      setHasVideo(false);
      return;
    }

    video.srcObject = stream;
    video.muted = false;

    const updateVideoState =
      () => {
        const videoTracks =
          stream.getVideoTracks();

        const activeVideo =
          videoTracks.some(
            (track) =>
              track.readyState ===
                "live" &&
              track.enabled !==
                false,
          );

        setHasVideo(
          activeVideo,
        );
      };

    const playRemoteMedia =
      () => {
        void video
          .play()
          .catch((error) => {
            console.warn(
              "[Watch Party] Remote media autoplay was blocked:",
              error,
            );
          });
      };

    video.onloadedmetadata = () => {
      updateVideoState();
      playRemoteMedia();
    };

    video.oncanplay = () => {
      updateVideoState();
      playRemoteMedia();
    };

    stream
      .getTracks()
      .forEach((track) => {
        track.onended =
          updateVideoState;

        track.onmute =
          updateVideoState;

        track.onunmute =
          updateVideoState;
      });

    updateVideoState();
    playRemoteMedia();

    return () => {
      video.onloadedmetadata =
        null;

      video.oncanplay = null;

      stream
        .getTracks()
        .forEach((track) => {
          track.onended = null;
          track.onmute = null;
          track.onunmute = null;
        });
    };
  }, [stream, streamVersion]);

  const showVideoElement =
    Boolean(stream);

  const showAvatar =
    !stream ||
    !hasVideo ||
    participant.cameraOff;

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl bg-muted">
      {showVideoElement && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={false}
          controls={false}
          className={`absolute inset-0 h-full w-full object-cover ${
            showAvatar
              ? "opacity-0"
              : "opacity-100"
          }`}
        />
      )}

      {showAvatar && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {participant.avatar ? (
            <img
              src={participant.avatar}
              alt={
                participant.name ||
                "Participant"
              }
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background">
              <User className="h-7 w-7 text-muted-foreground" />
            </div>
          )}

          <p className="mt-2 text-sm font-medium text-foreground">
            {participant.name ||
              "Participant"}
          </p>
        </div>
      )}

      <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
        {participant.name ||
          "Participant"}
      </div>

      {participant.muted && (
        <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70">
          <MicOff className="h-4 w-4 text-white" />
        </div>
      )}

      {participant.isScreenSharing && (
        <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
          <MonitorUp className="h-3.5 w-3.5" />
          Sharing screen
        </div>
      )}
    </div>
  );
};

export default WatchPartyCall;