class Util {
  /**
   * Asynchronous timeout
   * @param {number} time The time in ms to wait
   * @returns {Promise<unknown>}
   */
  static wait(time) {
    return new Promise((r) => setTimeout(r, time).unref());
  }
}

module.exports = { Util };
