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

export const useWebSocket = (url: string, mosqueId?: string): WebSocketHook => {
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
        const wsUrl = mosqueId ? `${url}?mosqueId=${mosqueId}` : url;
        wsref.current = new WebSocket(wsUrl);
        ws = wsref.current;
        setSocket(ws);
        setConnectionStatus("Connecting");

        ws.onopen = () => {
          setConnectionStatus("Open");
          console.log("[fe jembut ] WebSocket connected");
          // Kirim join room jika mosqueId ada
          if (mosqueId) {
            ws.send(
              JSON.stringify({
                type: "join_room",
                room: `${mosqueId}`,
              })
            );
            console.log("[fe jembut ] Sent join_room:", `${mosqueId}`);
          }
        };

        ws.onmessage = (event) => {
          try {
            console.log("[fe jembut ] WebSocket message received:", event.data);
            const message: Message = JSON.parse(event.data);
            setLastMessage(message);
          } catch (error) {
            console.error(
              "[fe jembut ] Error parsing WebSocket message:",
              error
            );
          }
        };

        ws.onclose = () => {
          setConnectionStatus("Closed");
          setSocket(null);
          console.log("WebSocket disconnected");

          // Reconnect after 3 seconds if should reconnect
          if (shouldReconnect.current) {
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          setConnectionStatus("Closed");
        };
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        setConnectionStatus("Closed");
      }
    };

    connect();

    return () => {
      shouldReconnect.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [url, mosqueId]);

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
