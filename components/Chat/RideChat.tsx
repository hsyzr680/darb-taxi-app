"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { sendChatMessage, subscribeToChat } from "@/services/chatService";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/types/database";
import { useLanguage } from "@/context/LanguageContext";

interface RideChatProps {
  rideId: string;
  userId: string;
}

export function RideChat({ rideId, userId }: RideChatProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("ride_id", rideId)
        .order("created_at", { ascending: true });
      setMessages((data as ChatMessage[]) ?? []);
    };
    load();
  }, [rideId]);

  useEffect(() => {
    const channel = subscribeToChat(rideId, (payload) => {
      const newMsg = (payload as { new: ChatMessage }).new;
      if (newMsg) setMessages((prev) => [...prev, newMsg]);
    });
    return () => { void channel.unsubscribe(); };
  }, [rideId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      await sendChatMessage(rideId, userId, input.trim());
      setInput("");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <h3 className="font-semibold">{t("chat")}</h3>
      </CardHeader>
      <CardContent>
        <div className="h-48 overflow-y-auto space-y-2 mb-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender_id === userId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  m.sender_id === userId
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {m.message}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
          />
          <Button onClick={handleSend} disabled={loading}>
            {t("send")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
