class Utils {
  static isValidURL = url => {
    const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    return urlRegex.exec(url) != null;
  };

  static asPercentString(value) {
    return (Math.round(value * 10000) / 100).toFixed(2) + "%";
  }
}

export default Utils;
