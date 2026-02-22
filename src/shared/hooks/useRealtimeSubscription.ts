import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type PostgresEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeSubscriptionOptions<T extends Record<string, unknown>> {
  table: string;
  schema?: string;
  event?: PostgresEvent;
  filter?: string;
  onInsert?: (payload: T) => void;
  onUpdate?: (payload: { old: T; new: T }) => void;
  onDelete?: (payload: T) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
  enabled?: boolean;
}

export function useRealtimeSubscription<T extends Record<string, unknown>>({
  table,
  schema = "public",
  event = "*",
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
  enabled = true,
}: UseRealtimeSubscriptionOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const channelName = `realtime-${table}-${Date.now()}`;

    const channelConfig: Record<string, string> = {
      event,
      schema,
      table,
    };
    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes" as any,
        channelConfig,
        (payload: RealtimePostgresChangesPayload<T>) => {
          onChange?.(payload);

          if (payload.eventType === "INSERT" && onInsert) {
            onInsert(payload.new as T);
          } else if (payload.eventType === "UPDATE" && onUpdate) {
            onUpdate({
              old: payload.old as T,
              new: payload.new as T,
            });
          } else if (payload.eventType === "DELETE" && onDelete) {
            onDelete(payload.old as T);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, schema, event, filter, enabled]);

  return channelRef;
}
