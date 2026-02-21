"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";

interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
}

export function SupportCenter() {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState("");
  const [showNew, setShowNew] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      setTickets((data as Ticket[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }
    const load = async () => {
      const { data } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", selected)
        .order("created_at", { ascending: true });
      setMessages((data ?? []) as any[]);
    };
    load();

    const sub = supabase
      .channel(`ticket:${selected}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages", filter: `ticket_id=eq.${selected}` },
        () => { void load(); }
      )
      .subscribe();
    return () => { void sub.unsubscribe(); };
  }, [selected]);

  const handleCreateTicket = async () => {
    if (!newSubject.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("support_tickets")
      .insert({ user_id: user.id, subject: newSubject.trim() })
      .select()
      .single();
    if (data) {
      setTickets((prev) => [data, ...prev]);
      setSelected(data.id);
      setNewSubject("");
      setShowNew(false);
    }
  };

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const isStaff = profile?.role === "admin" || profile?.role === "staff";
    await supabase.from("support_messages").insert({
      ticket_id: selected,
      sender_id: user.id,
      message: reply.trim(),
      is_staff_reply: isStaff,
    });
    setReply("");
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold">Technical Support Center</h3>
        <p className="text-sm text-muted-foreground">
          3-way support: Admin/Staff chat with Riders and Drivers.
        </p>
      </CardHeader>
      <CardContent>
        {showNew ? (
          <div className="flex gap-2 mb-4">
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Subject"
            />
            <Button onClick={handleCreateTicket}>Create</Button>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        ) : (
          <Button className="mb-4" onClick={() => setShowNew(true)}>
            New Ticket
          </Button>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : tickets.length === 0 ? (
              <p className="text-muted-foreground">No tickets yet.</p>
            ) : (
              tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={`w-full text-left p-3 rounded-lg border ${
                    selected === t.id ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <p className="font-medium">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">{t.status}</p>
                </button>
              ))
            )}
          </div>
          <div className="space-y-2">
            {selected ? (
              <>
                <div className="h-48 overflow-y-auto space-y-2 border rounded p-2">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`text-sm ${m.is_staff_reply ? "text-primary" : ""}`}
                    >
                      {m.message}
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(m.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Reply..."
                  />
                  <Button onClick={handleReply}>Send</Button>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Select a ticket to view and reply.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
