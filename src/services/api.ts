import { useAuthStore } from '../stores/authStore';
import type { ApiError } from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
    method?: RequestMethod;
    body?: unknown;
    headers?: Record<string, string>;
    auth?: boolean;
}

class ApiClient {
    private baseUrl: string;
    private refreshPromise: Promise<boolean> | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getAuthHeader(): Record<string, string> {
        const token = useAuthStore.getState().accessToken;
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private async refreshToken(): Promise<boolean> {
        const { refreshToken, setTokens, logout } = useAuthStore.getState();
        if (!refreshToken) return false;

        try {
            const res = await fetch(`${this.baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!res.ok) {
                logout();
                return false;
            }

            const data = await res.json();
            setTokens(data.accessToken, data.refreshToken);
            return true;
        } catch {
            logout();
            return false;
        }
    }

    private async handleUnauthorized(): Promise<boolean> {
        // Prevent multiple refresh calls
        if (!this.refreshPromise) {
            this.refreshPromise = this.refreshToken().finally(() => {
                this.refreshPromise = null;
            });
        }
        return this.refreshPromise;
    }

    async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', body, headers = {}, auth = true } = options;

        const url = `${this.baseUrl}${endpoint}`;
        const reqHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...headers,
            ...(auth ? this.getAuthHeader() : {}),
        };

        const config: RequestInit = {
            method,
            headers: reqHeaders,
            ...(body ? { body: JSON.stringify(body) } : {}),
        };

        let res = await fetch(url, config);

        // Handle 401 - try refresh once
        if (res.status === 401 && auth) {
            const refreshed = await this.handleUnauthorized();
            if (refreshed) {
                config.headers = {
                    ...reqHeaders,
                    ...this.getAuthHeader(),
                };
                res = await fetch(url, config);
            }
        }

        if (!res.ok) {
            const error: ApiError = await res.json().catch(() => ({
                statusCode: res.status,
                message: res.statusText,
            }));
            throw error;
        }

        // Handle empty responses
        const text = await res.text();
        return text ? JSON.parse(text) : ({} as T);
    }

    // Convenience methods
    get<T>(endpoint: string, auth = true) {
        return this.request<T>(endpoint, { method: 'GET', auth });
    }

    post<T>(endpoint: string, body?: unknown, auth = true) {
        return this.request<T>(endpoint, { method: 'POST', body, auth });
    }

    put<T>(endpoint: string, body?: unknown, auth = true) {
        return this.request<T>(endpoint, { method: 'PUT', body, auth });
    }

    delete<T>(endpoint: string, auth = true) {
        return this.request<T>(endpoint, { method: 'DELETE', auth });
    }

    // File upload with progress
    async upload(
        endpoint: string,
        file: File,
        onProgress?: (percent: number) => void
    ): Promise<{ url: string; key: string }> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const formData = new FormData();
            formData.append('file', file);

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject({ statusCode: xhr.status, message: xhr.statusText });
                }
            });

            xhr.addEventListener('error', () => {
                reject({ statusCode: 0, message: 'Network error' });
            });

            xhr.open('POST', `${this.baseUrl}${endpoint}`);

            const token = useAuthStore.getState().accessToken;
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            xhr.send(formData);
        });
    }
}

export const api = new ApiClient(API_BASE);