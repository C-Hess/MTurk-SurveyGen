class Utils {
  /**
   * This static function validates a given URL with a regex.
   *
   * @param {string} url the URL to validate.
   * @returns {boolean} true if the URL is valid, false if otherwise.
   */
  static isValidURL = url => {
    const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    return urlRegex.exec(url) != null;
  };

  /**
   * Converts a given decimal value from 0-1 to a percent string.
   *
   * @param {number} value the decimal value from 0-1 to be converted to a percent string
   * @returns {string} the decimal value represented as a percent string.
   */
  static asPercentString(value) {
    return (Math.round(value * 10000) / 100).toFixed(2) + "%";
  }
}

export default Utils;
