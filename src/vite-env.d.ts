/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VIEW_PASSWORD: string;
  readonly VITE_SUPER_ADMIN_USER: string;
  readonly VITE_SUPER_ADMIN_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
