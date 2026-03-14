import { supabase } from "@/integrations/supabase/client";

type EventName =
  | "OFERTA_CREATED"
  | "OFERTA_UPDATED"
  | "OFERTA_DELETED"
  | "CREATIVE_UPLOADED"
  | "CREATIVE_DELETED"
  | "COMPETITOR_ADDED"
  | "AVATAR_EXTRACTED"
  | "PAGE_CREATED"
  | "CAMPAIGN_LAUNCHED"
  | "PROMPT_EXECUTED";

interface TrackEventParams {
  event: EventName;
  properties?: Record<string, unknown>;
  workspaceId?: string;
}

class Analytics {
  async track({ event, properties, workspaceId }: TrackEventParams) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await (supabase as any).from("analytics_events").insert({
        user_id: user?.id || null,
        workspace_id: workspaceId || null,
        event_name: event,
        properties: properties || null,
      });

      if (import.meta.env.DEV) {
        console.log(`[ANALYTICS] ${event}`, properties);
      }
    } catch (error) {
      console.error("Analytics tracking failed:", error);
    }
  }
}

export const analytics = new Analytics();
