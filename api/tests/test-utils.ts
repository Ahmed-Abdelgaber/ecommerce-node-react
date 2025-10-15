import type { Request, Response } from "express";

type MockRequestInit = {
  body?: any;
  params?: Record<string, any>;
  query?: Record<string, any>;
  headers?: Record<string, string | string[]>;
  cookies?: Record<string, any>;
  user?: any;
  method?: string;
  originalUrl?: string;
};

export function createMockRequest(init: MockRequestInit = {}): Request {
  return {
    body: init.body ?? {},
    params: init.params ?? {},
    query: init.query ?? {},
    headers: init.headers ?? {},
    cookies: init.cookies ?? {},
    method: init.method ?? "GET",
    originalUrl: init.originalUrl ?? "/",
    ...init,
  } as unknown as Request;
}

export function createMockResponse() {
  const headers = new Map<string, string | string[]>();
  const cookies = new Map<
    string,
    { value: any; options?: Record<string, any> | undefined }
  >();

  const res: Partial<Response> & {
    statusCode: number;
    body: any;
    headers: Map<string, string | string[]>;
    cookies: typeof cookies;
  } = {
    statusCode: 200,
    body: undefined,
    headers,
    cookies,
    status(code: number) {
      this.statusCode = code;
      return this as Response;
    },
    json(payload: any) {
      this.body = payload;
      return this as Response;
    },
    header(name: string, value: string | string[]) {
      headers.set(name.toLowerCase(), value);
      return this as Response;
    },
    set(name: string, value: string | string[]) {
      return this.header(name, value);
    },
    cookie(name: string, value: any, options?: Record<string, any>) {
      cookies.set(name, { value, options });
      return this as Response;
    },
    clearCookie(name: string, options?: Record<string, any>) {
      cookies.set(name, { value: "", options: { ...(options ?? {}), maxAge: 0 } });
      return this as Response;
    },
  };

  return res as Response & {
    statusCode: number;
    body: any;
    headers: Map<string, string | string[]>;
    cookies: typeof cookies;
  };
}
