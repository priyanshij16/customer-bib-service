class Exception {
    constructor(errorType, msg, errStackTrace) {
      this.errorType = errorType;
      this.message = msg;
      if (errStackTrace) {
        this.err = errStackTrace;
      }
    }
  }

module.exports = Exception  