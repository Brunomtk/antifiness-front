export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://localhost:44394/api",
    timeout: 10000,
  },
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif"],
  },
  app: {
    name: "Anti-Fitness",
    version: "1.0.0",
  },
}
