import { io, type Socket } from "socket.io-client";

import { useAuthStore } from "@/store/authStore";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "http://localhost:8000";

let socket: Socket | null = null;

export const getWatchPartySocket = () => {
  const { token } = useAuthStore.getState();

  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: {
        token,
      },
    });
  } else {
    socket.auth = {
      token,
    };
  }

  return socket;
};

export const connectWatchPartySocket = () => {
  const watchPartySocket = getWatchPartySocket();

  if (!watchPartySocket.connected) {
    watchPartySocket.connect();
  }

  return watchPartySocket;
};

export const disconnectWatchPartySocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export default getWatchPartySocket;