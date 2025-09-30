"use client";
import { useEffect } from "react"
export default function PWARegister(){
  useEffect(() => {
    if (typeof window === "undefined") return
    if ('serviceWorker' in navigator) {
      const register = async () => {
        try { await navigator.serviceWorker.register('/sw.js', { scope: '/' }) } 
        catch (e) { console.error('[PWA] SW registration failed', e) }
      }
      if (document.readyState === 'complete') register()
      else window.addEventListener('load', register, { once: true })
    }
  }, [])
  return null
}
