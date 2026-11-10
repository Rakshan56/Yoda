"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export const query = <T>(key: readonly unknown[], path: string, enabled = true) =>
  useQuery({ queryKey: key, queryFn: () => apiFetch<T>(path), enabled });
