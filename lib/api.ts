import axios, { AxiosError } from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://68.183.154.14:5000/api"

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
})

// Request: add token only in browser
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response: handle 401 only in browser
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = (error.response?.status ?? 0) as number
    if (typeof window !== "undefined" && status === 401) {
      try {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      } catch {}
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)
