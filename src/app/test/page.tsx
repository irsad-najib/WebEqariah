"use client";
import { useEffect, useRef, useState } from "react";

export default function TestWebSocketPage() {
  const socketRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000/api/ws"); // Ganti port sesuai BE lo

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      socket.send("Hello from Next.js!");
    };

    socket.onmessage = (event) => {
      console.log("Received:", event.data);
      setMessages((prev) => [...prev, event.data]);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (socketRef.current && input.trim() !== "") {
      socketRef.current.send(input);
      setInput("");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">WebSocket Test</h1>

      <div className="mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border px-2 py-1 mr-2"
          placeholder="Type message"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Send
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Messages:</h2>
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx} className="mb-1">
              {msg}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
