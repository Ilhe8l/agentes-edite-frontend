/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DJANGO_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}