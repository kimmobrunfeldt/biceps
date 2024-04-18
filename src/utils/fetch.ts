// Simple wrapper for fetch to allow mocking it more easily
export const fetchWrapper = (url: string, opts?: RequestInit) =>
  fetch(url, opts)

export class ApiHttpError extends Error {
  readonly status: number

  constructor(httpStatus: number, message: string) {
    super(message)
    this.name = this.constructor.name
    this.status = httpStatus
  }
}
