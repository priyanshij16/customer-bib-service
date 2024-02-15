export class Exception extends Error {
  errorType: any
  message: string
  err?: Error
  constructor(errorType: any, msg: string, errStackTrace?: Error) {
    super()
    this.errorType = errorType
    this.message = msg
    if (errStackTrace) {
      this.err = errStackTrace
    }
  }
}
