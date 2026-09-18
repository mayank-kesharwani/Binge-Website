import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import WatchParty from "../models/WatchParty.js";
import User from "../models/User.js";

const watchPartySocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token;

      if (!token) {
        return next(
          new Error(
            "Authentication required",
          ),
        );
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
      );

      if (
        !decoded?.id ||
        !mongoose.Types.ObjectId.isValid(
          decoded.id,
        )
      ) {
        return next(
          new Error(
            "Invalid authentication token",
          ),
        );
      }

      const user =
        await User.findById(
          decoded.id,
        ).select(
          "_id name avatar",
        );

      if (!user) {
        return next(
          new Error(
            "User not found",
          ),
        );
      }

      socket.userId =
        user._id.toString();

      socket.userName =
        user.name;

      socket.userAvatar =
        user.avatar || "";

      /*
       * Socket IDs of users who have sent this
       * socket a reconnect request.
       *
       * This lets BOTH host and participants
       * approve/reject requests securely.
       */
      socket.pendingReconnectRequests =
        new Set();

      next();
    } catch (error) {
      console.error(
        "Watch Party socket authentication error:",
        error.message,
      );

      next(
        new Error(
          "Invalid or expired token",
        ),
      );
    }
  });

  io.on(
    "connection",
    (socket) => {
      console.log(
        `🔌 Watch Party socket connected: ${socket.id}`,
      );

      socket.on(
        "watch-party:join",
        async ({
          partyCode,
        } = {}) => {
          try {
            if (!partyCode) {
              return emitError(
                socket,
                "Watch Party code is required",
              );
            }

            const normalizedCode =
              String(partyCode)
                .trim()
                .toUpperCase();

            const party =
              await WatchParty.findOne(
                {
                  partyCode:
                    normalizedCode,
                  status: "active",
                },
              );

            if (!party) {
              return emitError(
                socket,
                "Watch Party not found or has ended",
              );
            }

            const userId =
              socket.userId;

            if (!userId) {
              return emitError(
                socket,
                "Authentication required",
              );
            }

            const user =
              await User.findById(
                userId,
              ).select(
                "_id name username avatar",
              );

            if (!user) {
              return emitError(
                socket,
                "User not found",
              );
            }

            const room =
              `watch-party:${normalizedCode}`;

            if (
              socket.watchPartyRoom &&
              socket.watchPartyRoom !==
                room
            ) {
              await removeParticipant(
                io,
                socket,
              );
            }

            socket.join(room);

            socket.watchPartyCode =
              normalizedCode;

            socket.watchPartyUserId =
              user._id.toString();

            socket.watchPartyRoom =
              room;

            /*
             * Clear reconnect requests whenever
             * the socket joins a Watch Party again.
             */
            socket.pendingReconnectRequests =
              new Set();

            const existingParticipant =
              party.participants.find(
                (participant) =>
                  participant.user.toString() ===
                  user._id.toString(),
              );

            if (
              !existingParticipant
            ) {
              party.participants.push(
                {
                  user: user._id,
                  joinedAt:
                    new Date(),
                },
              );

              await party.save();
            }

            const populatedParty =
              await getPopulatedParty(
                party._id,
              );

            const partyWithSockets =
              attachSocketIdsToParty(
                populatedParty,
                io,
                room,
              );

            socket.emit(
              "watch-party:state",
              {
                party:
                  partyWithSockets,
              },
            );

            socket
              .to(room)
              .emit(
                "watch-party:user-joined",
                {
                  userId:
                    user._id.toString(),
                  socketId:
                    socket.id,
                  name:
                    user.name,
                  avatar:
                    user.avatar ||
                    "",
                },
              );

            console.log(
              `👤 ${user.name} joined Watch Party ${normalizedCode}`,
            );
          } catch (error) {
            console.error(
              "Watch Party join error:",
              error,
            );

            emitError(
              socket,
              "Unable to join Watch Party",
            );
          }
        },
      );

      socket.on(
        "watch-party:leave",
        async () => {
          await removeParticipant(
            io,
            socket,
          );
        },
      );

      socket.on(
        "watch-party:chat",
        ({
          message,
        } = {}) => {
          if (
            !socket.watchPartyRoom ||
            typeof message !==
              "string" ||
            !message.trim()
          ) {
            return;
          }

          const chatMessage = {
            id: `${socket.id}-${Date.now()}`,
            message:
              message
                .trim()
                .slice(0, 1000),
            userId:
              socket.watchPartyUserId,
            user: {
              _id:
                socket.watchPartyUserId,
              name:
                socket.userName ||
                "Participant",
              avatar:
                socket.userAvatar ||
                "",
            },
            socketId:
              socket.id,
            createdAt:
              new Date().toISOString(),
          };

          io.to(
            socket.watchPartyRoom,
          ).emit(
            "watch-party:chat",
            chatMessage,
          );
        },
      );

      socket.on(
        "watch-party:media-state",
        ({
          muted,
          cameraOff,
        } = {}) => {
          if (
            !isPartyMember(socket)
          ) {
            return;
          }

          socket
            .to(
              socket.watchPartyRoom,
            )
            .emit(
              "watch-party:media-state",
              {
                userId:
                  socket.watchPartyUserId,
                socketId:
                  socket.id,
                muted: Boolean(
                  muted,
                ),
                cameraOff:
                  Boolean(
                    cameraOff,
                  ),
              },
            );
        },
      );

      socket.on(
        "watch-party:screen-share",
        ({
          isSharing,
        } = {}) => {
          if (
            !isPartyMember(socket)
          ) {
            return;
          }

          socket
            .to(
              socket.watchPartyRoom,
            )
            .emit(
              "watch-party:screen-share",
              {
                userId:
                  socket.watchPartyUserId,
                socketId:
                  socket.id,
                isSharing:
                  Boolean(
                    isSharing,
                  ),
              },
            );
        },
      );

      socket.on(
        "watch-party:play",
        async ({
          currentTime,
        } = {}) => {
          await handlePlaybackEvent(
            io,
            socket,
            "watch-party:play",
            currentTime,
          );
        },
      );

      socket.on(
        "watch-party:pause",
        async ({
          currentTime,
        } = {}) => {
          await handlePlaybackEvent(
            io,
            socket,
            "watch-party:pause",
            currentTime,
          );
        },
      );

      socket.on(
        "watch-party:seek",
        async ({
          currentTime,
        } = {}) => {
          await handlePlaybackEvent(
            io,
            socket,
            "watch-party:seek",
            currentTime,
          );
        },
      );

      /*
       * --------------------------------------------------
       * RECONNECT REQUEST
       * --------------------------------------------------
       *
       * Reconnect requests work in BOTH directions:
       *
       * Participant -> Host
       * Host        -> Participant
       *
       * The target is allowed to be any active
       * participant in the Watch Party.
       */
      socket.on(
        "watch-party:reconnect-request",
        async ({
          targetSocketId,
          requesterUserId,
          requesterName,
          requesterAvatar,
        } = {}) => {
          try {
            if (
              !isPartyMember(socket)
            ) {
              return emitError(
                socket,
                "You are not a member of this Watch Party",
              );
            }

            if (!targetSocketId) {
              return emitError(
                socket,
                "Participant connection not found",
              );
            }

            /*
             * Never trust the requester identity
             * supplied by the browser.
             */
            if (
              requesterUserId &&
              requesterUserId !==
                socket.watchPartyUserId
            ) {
              return emitError(
                socket,
                "Invalid reconnect request",
              );
            }

            const party =
              await WatchParty.findOne(
                {
                  partyCode:
                    socket.watchPartyCode,
                  status: "active",
                },
              ).select(
                "host participants",
              );

            if (!party) {
              return emitError(
                socket,
                "Watch Party not found or has ended",
              );
            }

            /*
             * Target must be an active socket in
             * the same Watch Party room.
             */
            const targetSocket =
              io.sockets.sockets.get(
                targetSocketId,
              );

            if (
              !targetSocket ||
              targetSocket.watchPartyRoom !==
                socket.watchPartyRoom
            ) {
              return emitError(
                socket,
                "Participant is no longer connected",
              );
            }

            /*
             * Requester must be a real participant.
             */
            const requesterIsParticipant =
              party.participants.some(
                (participant) =>
                  participant.user.toString() ===
                  socket.watchPartyUserId,
              );

            if (
              !requesterIsParticipant
            ) {
              return emitError(
                socket,
                "You are not a participant in this Watch Party",
              );
            }

            /*
             * Target must also be a real
             * Watch Party participant.
             */
            const targetIsParticipant =
              party.participants.some(
                (participant) =>
                  participant.user.toString() ===
                  targetSocket.watchPartyUserId,
              );

            if (
              !targetIsParticipant
            ) {
              return emitError(
                socket,
                "Target is not part of this Watch Party",
              );
            }

            /*
             * Do not allow requesting yourself.
             */
            if (
              targetSocket.id ===
              socket.id
            ) {
              return emitError(
                socket,
                "You cannot request yourself",
              );
            }

            /*
             * Store the requester on the TARGET
             * socket.
             *
             * This is later used to ensure that
             * only the intended receiver can
             * accept/reject this request.
             */
            targetSocket.pendingReconnectRequests.add(
              socket.id,
            );

            /*
             * Send the request ONLY to the
             * intended receiver.
             */
            targetSocket.emit(
              "watch-party:reconnect-request",
              {
                requesterSocketId:
                  socket.id,
                requesterUserId:
                  socket.watchPartyUserId,
                requesterName:
                  socket.userName ||
                  requesterName ||
                  "Participant",
                requesterAvatar:
                  socket.userAvatar ||
                  requesterAvatar ||
                  "",
              },
            );

            console.log(
              `🔄 Reconnect request: ${socket.userName} -> ${targetSocket.userName}`,
            );
          } catch (error) {
            console.error(
              "Watch Party reconnect request error:",
              error,
            );

            emitError(
              socket,
              "Unable to send reconnect request",
            );
          }
        },
      );

      /*
       * --------------------------------------------------
       * RECONNECT RESPONSE
       * --------------------------------------------------
       *
       * The RECEIVER of the request can respond.
       *
       * Therefore:
       *
       * Participant requested Host
       * -> Host can accept/reject
       *
       * Host requested Participant
       * -> Participant can accept/reject
       */
      socket.on(
        "watch-party:reconnect-response",
        async ({
          targetSocketId,
          accepted,
        } = {}) => {
          try {
            if (
              !isPartyMember(socket)
            ) {
              return emitError(
                socket,
                "You are not a member of this Watch Party",
              );
            }

            if (!targetSocketId) {
              return emitError(
                socket,
                "Requester connection not found",
              );
            }

            const party =
              await WatchParty.findOne(
                {
                  partyCode:
                    socket.watchPartyCode,
                  status: "active",
                },
              ).select(
                "host participants",
              );

            if (!party) {
              return emitError(
                socket,
                "Watch Party not found or has ended",
              );
            }

            const targetSocket =
              io.sockets.sockets.get(
                targetSocketId,
              );

            if (
              !targetSocket ||
              targetSocket.watchPartyRoom !==
                socket.watchPartyRoom
            ) {
              return emitError(
                socket,
                "Requester is no longer connected",
              );
            }

            /*
             * CRITICAL SECURITY CHECK:
             *
             * The target socket must have actually
             * sent a reconnect request to this socket.
             *
             * This means a random participant cannot
             * accept/reject somebody else's request.
             */
            if (
              !socket.pendingReconnectRequests?.has(
                targetSocket.id,
              )
            ) {
              return emitError(
                socket,
                "No pending reconnect request from this participant",
              );
            }

            /*
             * Remove the request immediately so
             * it cannot be accepted/rejected twice.
             */
            socket.pendingReconnectRequests.delete(
              targetSocket.id,
            );

            /*
             * Verify requester is still a party
             * participant.
             */
            const targetIsParticipant =
              party.participants.some(
                (participant) =>
                  participant.user.toString() ===
                  targetSocket.watchPartyUserId,
              );

            if (
              !targetIsParticipant
            ) {
              return emitError(
                socket,
                "Requester is not part of this Watch Party",
              );
            }

            /*
             * Send response ONLY to requester.
             */
            targetSocket.emit(
              "watch-party:reconnect-response",
              {
                accepted:
                  Boolean(
                    accepted,
                  ),
                targetSocketId:
                  targetSocket.id,
                responderSocketId:
                  socket.id,
                responderUserId:
                  socket.watchPartyUserId,
              },
            );

            console.log(
              `🔄 Reconnect response from ${socket.userName}: ${
                accepted
                  ? "accepted"
                  : "rejected"
              } -> ${targetSocket.userName}`,
            );
          } catch (error) {
            console.error(
              "Watch Party reconnect response error:",
              error,
            );

            emitError(
              socket,
              "Unable to process reconnect response",
            );
          }
        },
      );

      socket.on(
        "watch-party:webrtc-offer",
        ({
          targetSocketId,
          offer,
        } = {}) => {
          relayWebRTCSignal(
            io,
            socket,
            targetSocketId,
            "watch-party:webrtc-offer",
            {
              senderSocketId:
                socket.id,
              offer,
            },
          );
        },
      );

      socket.on(
        "watch-party:webrtc-answer",
        ({
          targetSocketId,
          answer,
        } = {}) => {
          relayWebRTCSignal(
            io,
            socket,
            targetSocketId,
            "watch-party:webrtc-answer",
            {
              senderSocketId:
                socket.id,
              answer,
            },
          );
        },
      );

      socket.on(
        "watch-party:ice-candidate",
        ({
          targetSocketId,
          candidate,
        } = {}) => {
          relayWebRTCSignal(
            io,
            socket,
            targetSocketId,
            "watch-party:ice-candidate",
            {
              senderSocketId:
                socket.id,
              candidate,
            },
          );
        },
      );

      socket.on(
        "disconnect",
        async () => {
          console.log(
            `🔌 Watch Party socket disconnected: ${socket.id}`,
          );

          await removeParticipant(
            io,
            socket,
          );
        },
      );
    },
  );
};

const handlePlaybackEvent = async (
  io,
  socket,
  eventName,
  currentTime,
) => {
  try {
    if (
      !isPartyMember(socket)
    ) {
      return;
    }

    const party =
      await WatchParty.findOne(
        {
          partyCode:
            socket.watchPartyCode,
          status: "active",
        },
      ).select(
        "host playback participants",
      );

    if (!party) {
      return;
    }

    if (
      party.host.toString() !==
      socket.watchPartyUserId
    ) {
      socket.emit(
        "watch-party:error",
        {
          message:
            "Only the host can control playback",
        },
      );

      return;
    }

    const time = Math.max(
      0,
      Number(currentTime) || 0,
    );

    party.playback.currentTime =
      time;

    if (
      eventName ===
      "watch-party:play"
    ) {
      party.playback.isPlaying =
        true;
    }

    if (
      eventName ===
      "watch-party:pause"
    ) {
      party.playback.isPlaying =
        false;
    }

    await party.save();

    socket
      .to(
        socket.watchPartyRoom,
      )
      .emit(
        eventName,
        {
          currentTime: time,
          userId:
            socket.watchPartyUserId,
        },
      );
  } catch (error) {
    console.error(
      "Watch Party playback error:",
      error,
    );
  }
};

const removeParticipant = async (
  io,
  socket,
) => {
  try {
    if (
      socket.watchPartyRemoving
    ) {
      return;
    }

    socket.watchPartyRemoving =
      true;

    const partyCode =
      socket.watchPartyCode;

    const userId =
      socket.watchPartyUserId;

    const room =
      socket.watchPartyRoom;

    if (!partyCode || !userId) {
      socket.watchPartyRemoving =
        false;

      return;
    }

    const party =
      await WatchParty.findOne(
        {
          partyCode,
          status: "active",
        },
      );

    if (party) {
      const isHost =
        party.host.toString() ===
        userId.toString();

      party.participants =
        party.participants.filter(
          (participant) =>
            participant.user.toString() !==
            userId.toString(),
        );

      if (isHost) {
        party.status = "ended";

        party.endedAt =
          new Date();

        await party.save();

        io.to(room).emit(
          "watch-party:ended",
          {
            message:
              "The host has left the Watch Party",
          },
        );
      } else {
        await party.save();

        socket
          .to(room)
          .emit(
            "watch-party:user-left",
            {
              userId,
              socketId:
                socket.id,
            },
          );
      }
    }

    if (room) {
      socket.leave(room);
    }

    socket.watchPartyCode =
      undefined;

    socket.watchPartyUserId =
      undefined;

    socket.watchPartyRoom =
      undefined;

    socket.pendingReconnectRequests =
      new Set();

    socket.watchPartyRemoving =
      false;
  } catch (error) {
    socket.watchPartyRemoving =
      false;

    console.error(
      "Watch Party leave error:",
      error,
    );
  }
};

const getPopulatedParty = async (
  partyId,
) => {
  return WatchParty.findById(
    partyId,
  ).populate([
    {
      path: "host",
      select:
        "name username avatar",
    },
    {
      path: "participants.user",
      select:
        "name username avatar",
    },
    {
      path: "video",
      select:
        "title description videoUrl thumbnailUrl duration views channel",
    },
  ]);
};

const attachSocketIdsToParty = (
  party,
  io,
  room,
) => {
  if (!party) {
    return party;
  }

  const roomSockets =
    io.sockets.adapter.rooms.get(
      room,
    );

  if (!roomSockets) {
    return party;
  }

  const socketsByUserId =
    new Map();

  for (const socketId of roomSockets) {
    const roomSocket =
      io.sockets.sockets.get(
        socketId,
      );

    if (
      !roomSocket?.watchPartyUserId
    ) {
      continue;
    }

    /*
     * Keep the first active socket for
     * a user.
     */
    if (
      !socketsByUserId.has(
        roomSocket.watchPartyUserId,
      )
    ) {
      socketsByUserId.set(
        roomSocket.watchPartyUserId,
        socketId,
      );
    }
  }

  const plainParty =
    party.toObject
      ? party.toObject()
      : party;

  plainParty.participants =
    (
      plainParty.participants ||
      []
    ).map(
      (participant) => {
        const participantUserId =
          participant?.user?._id?.toString();

        return {
          ...participant,
          socketId:
            participantUserId
              ? socketsByUserId.get(
                  participantUserId,
                )
              : "",
        };
      },
    );

  return plainParty;
};

const isPartyMember = (
  socket,
) => {
  return Boolean(
    socket.watchPartyRoom &&
      socket.watchPartyCode &&
      socket.watchPartyUserId,
  );
};

const emitError = (
  socket,
  message,
) => {
  socket.emit(
    "watch-party:error",
    {
      message,
    },
  );
};

const relayWebRTCSignal = (
  io,
  socket,
  targetSocketId,
  eventName,
  payload,
) => {
  if (
    !isPartyMember(socket) ||
    !targetSocketId
  ) {
    return;
  }

  const targetSocket =
    io.sockets.sockets.get(
      targetSocketId,
    );

  if (
    !targetSocket ||
    targetSocket.watchPartyRoom !==
      socket.watchPartyRoom
  ) {
    return;
  }

  io.to(targetSocketId).emit(
    eventName,
    payload,
  );
};

export default watchPartySocket;