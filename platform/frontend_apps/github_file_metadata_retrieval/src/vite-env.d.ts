/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_BASE_URL?: string;
  readonly VITE_GITHUB_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface TrustedTypePolicy {
  createHTML(input: string): unknown;
}

interface TrustedTypePolicyFactory {
  defaultPolicy: TrustedTypePolicy | null;
  createPolicy(name: string, rules: { createHTML: (s: string) => string }): TrustedTypePolicy;
}

interface Window {
  trustedTypes?: TrustedTypePolicyFactory;
}
