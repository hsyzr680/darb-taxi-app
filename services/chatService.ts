import { createClient } from "@/lib/supabase/client";

export async function sendChatMessage(
  rideId: string,
  senderId: string,
  message: string
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ ride_id: rideId, sender_id: senderId, message })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToChat(rideId: string, onMessage: (payload: unknown) => void) {
  const supabase = createClient();
  return supabase
    .channel(`chat:${rideId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat_messages", filter: `ride_id=eq.${rideId}` },
      onMessage
    )
    .subscribe();
}
