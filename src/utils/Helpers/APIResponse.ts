const { STATUS_CODE } = require('./constants')

export class APIResponse {
  status: string
  result: any
  error: any
  time: number
  constructor(sc: number, result: any) {
    this.status = sc ? 'success' : 'error'
    if (sc == STATUS_CODE.SUCCESS) {
      result ? (this.result = result) : {}
    } else {
      result ? (this.error = result) : {}
    }
    this.time = new Date().getTime()
  }
}
