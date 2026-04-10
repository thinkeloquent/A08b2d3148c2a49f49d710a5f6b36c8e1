import { useCallback, useState } from "react";
import { sendChatMessage } from "../services/api";

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  const send = useCallback(async (text) => {
    if (!text.trim() || sending) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const reply = await sendChatMessage(text.trim());
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [sending]);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, sending, send, clear };
}
