import fs from "fs";

class AppFileConfig {
  static configName = "surveygen-config.json";

  static loadAppStateFromFile() {
    try {
      const app = require("electron").remote.app;
      const configFile = app.getPath("userData") + "/" + this.configName;
      const rawData = fs.readFileSync(configFile);
      const appStateJSON = JSON.parse(rawData);
      return appStateJSON;
    } catch (err) {
      console.log("Could not load old application data");
      console.log(err);
      return {
        currentPage: 0,
        apiAccessID: "",
        apiSecretKey: ""
      };
    }
  }

  static saveAppStateToFile(state) {
    try {
      const app = require("electron").remote.app;
      const configFile = app.getPath("userData") + "/" + this.configName;
      const data = JSON.stringify(state);
      fs.writeFileSync(configFile, data);
    } catch (err) {
      console.error(err);
    }
  }
}

export default AppFileConfig;
