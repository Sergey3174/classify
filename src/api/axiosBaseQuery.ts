import axios, { type AxiosRequestConfig } from "axios";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";

type QueryArgs =
  | string
  | Pick<AxiosRequestConfig, "url" | "method" | "data" | "params" | "headers">;
export interface QueryError {
  code?: string;
  status:
    | number
    | "NETWORK_ERROR"
    | "TIMEOUT_ERROR"
    | "CANCELED"
    | "UNKNOWN_ERROR";
  message: string;
}

/** Keep Axios objects out of Redux; pass RTK Query cancellation to the request. */
export function axiosBaseQuery(
  config: AxiosRequestConfig,
  client = axios.create(config),
): BaseQueryFn<QueryArgs, unknown, QueryError> {
  return async (args, { signal }) => {
    try {
      const response = await client.request({
        ...(typeof args === "string" ? { url: args } : args),
        signal,
      });
      return { data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status =
          error.response?.status ??
          (axios.isCancel(error)
            ? "CANCELED"
            : error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
              ? "TIMEOUT_ERROR"
              : "NETWORK_ERROR");
        const body: unknown = error.response?.data;
        const details =
          body && typeof body === "object"
            ? (body as Record<string, unknown>)
            : undefined;
        return {
          error: {
            status,
            message:
              typeof details?.message === "string"
                ? details.message
                : error.message,
            ...(typeof details?.code === "string"
              ? { code: details.code }
              : {}),
          },
        };
      }
      return {
        error: {
          status: "UNKNOWN_ERROR",
          message: error instanceof Error ? error.message : "Request failed",
        },
      };
    }
  };
}
