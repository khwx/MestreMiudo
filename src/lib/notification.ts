"use client"

import {
  REVIEW_REMINDER_STORAGE_KEY,
  buildReviewReminder,
  shouldShowReviewReminder,
} from "./review-reminder"

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window
}

export function notificationsGranted(): boolean {
  return isNotificationSupported() && Notification.permission === "granted"
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied"
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission
  }
  try {
    return await Notification.requestPermission()
  } catch {
    return "denied"
  }
}

export function getLastNotifiedAt(): number | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(REVIEW_REMINDER_STORAGE_KEY)
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

export function setLastNotifiedAt(now: number): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(REVIEW_REMINDER_STORAGE_KEY, String(now))
}

function showViaServiceWorker(title: string, body: string): boolean {
  const sw = (navigator as Navigator & { serviceWorker?: ServiceWorkerContainer }).serviceWorker
  if (sw && sw.controller) {
    sw.controller.postMessage({ type: "REVIEW_REMINDER", title, body })
    return true
  }
  return false
}

function showNotification(title: string, body: string): void {
  if (!notificationsGranted()) return

  if (showViaServiceWorker(title, body)) return

  try {
    new Notification(title, { body })
  } catch {
    // Best-effort: some browsers block the constructor without a SW.
  }
}

export function maybeNotifyReviewReminder(dueCount: number): void {
  if (dueCount <= 0) return
  if (!notificationsGranted()) return

  const now = Date.now()
  const lastNotifiedAt = getLastNotifiedAt()

  if (!shouldShowReviewReminder({ dueCount, lastNotifiedAt, now })) return

  const { title, body } = buildReviewReminder(dueCount)
  if (!title) return

  showNotification(title, body)
  setLastNotifiedAt(now)
}
