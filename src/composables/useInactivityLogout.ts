import { onMounted, onUnmounted } from "vue"
import { supabase } from "@/plugins/supabase"
import { useAuthenticationStore } from "@/stores/authStore"

export function useInactivityLogout(limitMs = 15 * 60 * 1000) {
  let inactivityTimer: number | undefined
  const STORAGE_LAST_ACTIVITY = "lastActivity"
  const authStore = useAuthenticationStore()

  // Reset inactivity timer and broadcast "activity"
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer)
    inactivityTimer = window.setTimeout(async () => {
      await logout()
    }, limitMs)
  }

  function broadcastActivity() {
    localStorage.setItem(STORAGE_LAST_ACTIVITY, Date.now().toString())
    resetInactivityTimer()
  }

  async function logout() {
    await authStore.signOut()
    localStorage.setItem("forceLogout", Date.now().toString()) // sync logout
  }

  // Watch for storage events from other tabs
  function handleStorage(e: StorageEvent) {
    if (e.key === STORAGE_LAST_ACTIVITY) {
      resetInactivityTimer()
    }
    if (e.key === "forceLogout") {
      // another tab logged out
      supabase.auth.signOut()
    }
  }

  onMounted(async () => {
    // On load: check if last activity is stale
    const lastActivity = parseInt(localStorage.getItem(STORAGE_LAST_ACTIVITY) || "0", 10)
    if (lastActivity && Date.now() - lastActivity > limitMs) {
      await logout()
      return
    }

    // user activity listeners
    ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(event =>
      window.addEventListener(event, broadcastActivity)
    )

    // listen for cross-tab events
    window.addEventListener("storage", handleStorage)

    // start timer
    resetInactivityTimer()
  })

  onUnmounted(() => {
    clearTimeout(inactivityTimer);
    ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(event =>
      window.removeEventListener(event, broadcastActivity)
    )
    window.removeEventListener("storage", handleStorage)
  })

  return { resetInactivityTimer, logout }
}