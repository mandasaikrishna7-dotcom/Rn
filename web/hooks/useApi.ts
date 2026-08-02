"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ItemAction, Profile } from "@/lib/types";

export function useBootstrap() {
  return useQuery({ queryKey: ["bootstrap"], queryFn: api.bootstrap, staleTime: 60_000 });
}

export function useFeed(limit = 12, offset = 0, mediaFilter?: string[]) {
  return useQuery({
    queryKey: ["feed", limit, offset, mediaFilter],
    queryFn: () => api.feed(limit, offset, mediaFilter),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ["item", id],
    queryFn: () => api.item(id),
    enabled: Boolean(id),
  });
}

export function useJourney() {
  return useQuery({ queryKey: ["journey"], queryFn: api.journey });
}

export function useMentors() {
  return useQuery({ queryKey: ["mentors"], queryFn: api.mentors });
}

export function useProgress() {
  return useQuery({ queryKey: ["progress"], queryFn: api.progress });
}

export function useSettings() {
  return useQuery({ queryKey: ["settings"], queryFn: api.settings });
}

export function useDigestInfo() {
  return useQuery({ queryKey: ["digest"], queryFn: api.digest });
}

export function useRunStatus(enabled = true) {
  return useQuery({ queryKey: ["run-status"], queryFn: api.runStatus, enabled, refetchInterval: 4000 });
}

export function useOnboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: Profile) => api.onboard(profile),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["bootstrap"] });
      void qc.invalidateQueries({ queryKey: ["journey"] });
      void qc.invalidateQueries({ queryKey: ["mentors"] });
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: Partial<Profile>) => api.updateProfile(profile),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["bootstrap"] });
      void qc.invalidateQueries({ queryKey: ["journey"] });
      void qc.invalidateQueries({ queryKey: ["settings"] });
      void qc.invalidateQueries({ queryKey: ["mentors"] });
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateSettings,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["bootstrap"] });
      void qc.invalidateQueries({ queryKey: ["settings"] });
      void qc.invalidateQueries({ queryKey: ["journey"] });
    },
  });
}

export function useItemAction(itemId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (action: ItemAction) => api.itemAction(itemId, action),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["progress"] });
      void qc.invalidateQueries({ queryKey: ["item", itemId] });
    },
  });
}

export function useStartRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.startRun(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["run-status"] });
      void qc.invalidateQueries({ queryKey: ["digest"] });
    },
  });
}
