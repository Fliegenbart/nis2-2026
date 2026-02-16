"use client";

import { useState, useEffect, useCallback } from "react";

interface ConsultantUser {
  id: string;
  email: string;
  name: string;
  role: string;
  companyName: string | null;
  logoUrl: string | null;
}

interface AuditSummary {
  id: string;
  clientName: string | null;
  companyName: string | null;
  industry: string | null;
  overallScore: number;
  answeredCount: number;
  totalQuestions: number;
  openActions: number;
  doneActions: number;
  updatedAt: string;
  createdAt: string;
}

export function useConsultant() {
  const [user, setUser] = useState<ConsultantUser | null>(null);
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const res = await fetch("/api/consultant/auth/me");
        if (!res.ok) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        setUser(data.user);
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/consultant/dashboard");
      if (!res.ok) return;

      const data = await res.json();
      setAudits(data.audits);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const res = await fetch("/api/consultant/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) return false;

        const data = await res.json();
        setUser(data.user);
        setIsAuthenticated(true);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      name: string;
      companyName?: string;
    }): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/consultant/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();
        if (!res.ok) {
          return { success: false, error: result.error };
        }

        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true };
      } catch {
        return { success: false, error: "Verbindungsfehler" };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/consultant/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    setIsAuthenticated(false);
    setAudits([]);
  }, []);

  const createAudit = useCallback(
    async (data: {
      clientName: string;
      companyName?: string;
      industry?: string;
    }): Promise<string | null> => {
      try {
        const res = await fetch("/api/consultant/audits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) return null;

        const result = await res.json();
        return result.audit.id;
      } catch {
        return null;
      }
    },
    []
  );

  return {
    user,
    audits,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    loadDashboard,
    createAudit,
  };
}
