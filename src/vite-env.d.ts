/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_SOLANA_RPC_URL: string;
    readonly VITE_BONK_TOKEN_ADDRESS: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}