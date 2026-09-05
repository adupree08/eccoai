"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Linkedin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Status {
  connected: boolean;
  memberName?: string | null;
  expiresAt?: string | null;
  expired?: boolean;
  notConfigured?: boolean;
}

export function LinkedInConnect() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/linkedin/status");
      setStatus(await r.json());
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Surface the OAuth redirect result once on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = new URLSearchParams(window.location.search).get("linkedin");
    if (s === "connected") toast.success("LinkedIn connected");
    else if (s === "error") toast.error("Could not connect LinkedIn. Please try again.");
    else if (s === "notconfigured") toast.error("LinkedIn isn't configured yet. Add the API keys first.");
  }, []);

  const disconnect = async () => {
    setDisconnecting(true);
    try {
      await fetch("/api/linkedin/disconnect", { method: "POST" });
      toast.success("LinkedIn disconnected");
      load();
    } catch {
      toast.error("Could not disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-ecco-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking connection…
      </div>
    );
  }

  if (status?.connected) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5 text-ecco-success" />
          <span className="font-medium text-ecco-primary">
            Connected{status.memberName ? ` as ${status.memberName}` : ""}
          </span>
        </div>
        {status.expired && (
          <p className="flex items-center gap-1.5 text-xs text-ecco-error">
            <AlertCircle className="h-3.5 w-3.5" /> Session expired. Reconnect to keep auto-posting.
          </p>
        )}
        <div className="flex gap-2">
          {status.expired && (
            <a href="/api/linkedin/connect">
              <Button size="sm" className="bg-ecco-navy hover:bg-ecco-navy-light">Reconnect</Button>
            </a>
          )}
          <Button size="sm" variant="outline" onClick={disconnect} disabled={disconnecting}>
            {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disconnect"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <a href="/api/linkedin/connect">
        <Button className="bg-ecco-navy hover:bg-ecco-navy-light">
          <Linkedin className="mr-2 h-4 w-4" /> Connect LinkedIn
        </Button>
      </a>
      <p className="text-xs text-ecco-muted">
        Authorize eccoai to publish posts to your LinkedIn feed at their scheduled time.
      </p>
    </div>
  );
}
