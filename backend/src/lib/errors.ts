export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: unknown[] = [],
  ) {
    super(message);
  }
}
export const notFound = (message = "The requested resource was not found.") =>
  new AppError(404, "RESOURCE_NOT_FOUND", message);
