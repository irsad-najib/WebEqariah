import { useEffect, useRef, useState } from "react";

interface Message {
  type: string;
  data: unknown;
  mosque_id?: string;
  user_id?: string;
}

interface WebSocketHook {
  socket: WebSocket | null;
  connectionStatus: "Connecting" | "Open" | "Closing" | "Closed";
  lastMessage: Message | null;
  sendMessage: (message: Message) => void;
}

export const useWebSocket = (url: string, userId?: string): WebSocketHook => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "Connecting" | "Open" | "Closing" | "Closed"
  >("Closed");
  const [lastMessage, setLastMessage] = useState<Message | null>(null);

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>(null);
  const shouldReconnect = useRef(true);
  const wsref = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket;

    const connect = () => {
      try {
        // Use userId instead of mosqueId for personal chat rooms
        const wsUrl = userId ? `${url}?userId=${userId}` : url;
        wsref.current = new WebSocket(wsUrl);
        ws = wsref.current;
        setSocket(ws);
        setConnectionStatus("Connecting");

        ws.onopen = () => {
          setConnectionStatus("Open");
          console.log("[Chat WebSocket] connected");
          // Join personal room for direct messages
          if (userId) {
            ws.send(
              JSON.stringify({
                type: "join_room",
                room: `user_${userId}`,
              })
            );
            console.log("[Chat WebSocket] Joined room:", `user_${userId}`);
          }
        };

        ws.onmessage = (event) => {
          try {
            console.log("[Chat WebSocket] message received:", event.data);
            const message: Message = JSON.parse(event.data);
            setLastMessage(message);
          } catch (error) {
            console.error("[Chat WebSocket] Error parsing message:", error);
          }
        };

        ws.onclose = () => {
          setConnectionStatus("Closed");
          setSocket(null);
          console.log("[Chat WebSocket] disconnected");

          if (shouldReconnect.current) {
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
          }
        };

        ws.onerror = (error) => {
          console.error("[Chat WebSocket] error:", error);
          setConnectionStatus("Closed");
        };
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        setConnectionStatus("Closed");
      }
    };

    if (userId) {
      connect();
    }

    return () => {
      shouldReconnect.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [url, userId]);

  const sendMessage = (message: Message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  };

  return {
    socket,
    connectionStatus,
    lastMessage,
    sendMessage,
  };
};
