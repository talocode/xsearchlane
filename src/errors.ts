export class XSearchLaneError extends Error {
  code?: string
  status?: number

  constructor(message: string, options?: { code?: string; status?: number }) {
    super(message)
    this.name = 'XSearchLaneError'
    this.code = options?.code
    this.status = options?.status
  }
}
