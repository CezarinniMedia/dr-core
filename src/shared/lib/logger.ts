import { supabase } from "@/integrations/supabase/client";

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

interface LogParams {
  message: string;
  level?: LogLevel;
  metadata?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private async log({ message, level = "INFO", metadata, error }: LogParams) {
    const logFn =
      level === "ERROR" ? console.error : level === "WARN" ? console.warn : console.log;

    if (import.meta.env.DEV) {
      logFn(`[${level}] ${message}`, metadata || "");
      if (error) console.error(error);
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await (supabase as any).from("app_logs").insert({
        user_id: user?.id || null,
        level,
        message,
        metadata: metadata || null,
        stack_trace: error?.stack || null,
        user_agent: navigator.userAgent,
      });
    } catch (err) {
      console.error("Failed to log to database:", err);
    }
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.log({ message, level: "INFO", metadata });
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.log({ message, level: "WARN", metadata });
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>) {
    this.log({ message, level: "ERROR", metadata, error });
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      this.log({ message, level: "DEBUG", metadata });
    }
  }
}

export const logger = new Logger();
