import { errorResponseSchema } from "./schemas";

export class CosineError extends Error {
  readonly code: string;
  readonly status: number;
  readonly requestId?: string;
  readonly retryAfter?: number;

  constructor(
    code: string,
    message: string,
    status: number,
    options?: { requestId?: string; retryAfter?: number; cause?: unknown },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "CosineError";
    this.code = code;
    this.status = status;
    this.requestId = options?.requestId;
    this.retryAfter = options?.retryAfter;
  }
}

const STATUS_CODE: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  429: "RATE_LIMITED",
  500: "UPSTREAM_ERROR",
  502: "UPSTREAM_ERROR",
  503: "UPSTREAM_UNAVAILABLE",
};

const STATUS_MESSAGE: Record<number, string> = {
  400: "La solicitud es inválida.",
  401: "Clave de API inválida o ausente.",
  403: "No tenés permiso para esta acción.",
  404: "No se encontró lo que buscás.",
  429: "Se alcanzó el límite de solicitudes. Probá de nuevo en un momento.",
  500: "Error del servicio de música. Probá de nuevo.",
  503: "El servicio de música no está disponible.",
};

export function errorFromUpstream(
  status: number,
  body: unknown,
  retryAfter?: number,
): CosineError {
  const parsed = errorResponseSchema.safeParse(body);
  const code = parsed.success && parsed.data.code ? parsed.data.code : STATUS_CODE[status] ?? "UPSTREAM_ERROR";
  const message =
    (parsed.success && (parsed.data.message || parsed.data.error)) ||
    STATUS_MESSAGE[status] ||
    "Ocurrió un error inesperado.";
  const requestId = parsed.success ? parsed.data.request_id : undefined;
  return new CosineError(code, message, status, { requestId, retryAfter });
}

export function isCosineError(e: unknown): e is CosineError {
  return e instanceof CosineError;
}
