import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "@/shared/api/config";
import { ApiError, type ApiErrorDetail } from "@/shared/api/errors";
import { tokenStorage } from "@/shared/api/tokenStorage";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | null | undefined>;
  headers?: HeadersInit;
  auth?: boolean;
  signal?: AbortSignal;
};

function buildUrl(path: string, params?: ApiRequestOptions["params"]) {
  const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const rawUrl = `${cleanBaseUrl}${cleanPath}`;

  const url = rawUrl.startsWith("http")
    ? new URL(rawUrl)
    : new URL(rawUrl, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

function getErrorPayloadMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const detail = (payload as { detail?: unknown }).detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (detail && typeof detail === "object") {
    const typedDetail = detail as ApiErrorDetail;

    if (typeof typedDetail.message === "string") {
      return typedDetail.message;
    }
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return "Проверьте корректность заполненных данных";
  }

  return fallback;
}

function getErrorPayloadCode(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const detail = (payload as { detail?: unknown }).detail;

  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const typedDetail = detail as ApiErrorDetail;

    if (typeof typedDetail.code === "string") {
      return typedDetail.code;
    }
  }

  return undefined;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get("content-type");

  if (response.status === 204) {
    return null;
  }

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  try {
    const response = await fetch(buildUrl(path, options.params), {
      method: options.method ?? "GET",
      headers,
      body:
        options.body instanceof FormData
          ? options.body
          : options.body !== undefined
            ? JSON.stringify(options.body)
            : undefined,
      signal: options.signal ?? controller.signal,
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
      throw new ApiError({
        status: response.status,
        message: getErrorPayloadMessage(payload, "Не удалось выполнить запрос"),
        code: getErrorPayloadCode(payload),
        detail: payload,
      });
    }

    return payload as TResponse;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get<TResponse>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return apiRequest<TResponse>(path, {
      ...options,
      method: "GET",
    });
  },

  post<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return apiRequest<TResponse>(path, {
      ...options,
      method: "POST",
      body,
    });
  },

  patch<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return apiRequest<TResponse>(path, {
      ...options,
      method: "PATCH",
      body,
    });
  },

  put<TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return apiRequest<TResponse>(path, {
      ...options,
      method: "PUT",
      body,
    });
  },

  delete<TResponse>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return apiRequest<TResponse>(path, {
      ...options,
      method: "DELETE",
    });
  },
};
