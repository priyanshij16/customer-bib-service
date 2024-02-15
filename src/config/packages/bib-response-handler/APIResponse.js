const { STATUS_CODE } = require("./constants");

class APIResponse {
  constructor(sc, result) {
    this.sc = sc;
    if (sc == STATUS_CODE.SUCCESS) {
      result ? this.result = result : {};
    }
    else {
      result ? this.error = result : {};
    }
    this.time = new Date().getTime();
  }
}

module.exports = APIResponse;