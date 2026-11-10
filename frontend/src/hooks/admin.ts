"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { query } from "./query";
import type { AdminQualityIssue, AdminReport, AdminSource } from "@/types/api";

export function useAdminQualityIssues() {
  return query<AdminQualityIssue[]>(["admin-quality-issues"], "/admin/quality-issues");
}

export function useAdminReports() {
  return query<AdminReport[]>(["admin-reports"], "/admin/reports");
}

export function useAdminSources() {
  return query<AdminSource[]>(["admin-sources"], "/admin/sources");
}

export function useUpdateAdminReport() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { reportId: string; status: "OPEN" | "IN_REVIEW" | "RESOLVED" }) => apiFetch<AdminReport>(`/admin/reports/${input.reportId}`, { method: "PATCH", body: JSON.stringify({ status: input.status }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-reports"] })
  });
}
