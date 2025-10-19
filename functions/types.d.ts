/// <reference types="@cloudflare/workers-types" />
// Minimal ambient type shims to satisfy TypeScript in this repo for D1 and EventContext

type D1Database = any;

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  run(): Promise<any>;
  all<T = any>(): Promise<{ results?: T[] }>;
  first<T = any>(): Promise<T>;
}

interface D1Result<T = any> {
  results?: T[];
}

interface D1Response {
  success: boolean;
  meta?: { changes?: number; last_row_id?: number };
}

type EventContext<B = any, P = any, D = any> = {
  request: Request;
  env: B;
  params?: P;
  data?: D;
};
