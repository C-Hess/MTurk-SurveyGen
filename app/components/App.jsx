import React, { Component } from "react";
import Create from "./Create";
import Account from "./Account";
import Manage from "./Manage";
import NavBar from "./NavBar";
import AppFileConfig from "../AppFileConfig";
import { error } from "util";

class App extends Component {
  pages = [{ name: "Create" }, { name: "Manage" }, { name: "Account" }];

  state = AppFileConfig.loadAppStateFromFile({
    currentPage: 0,
    apiAccessID: "",
    apiSecretKey: ""
  });

  handlePageSwitch = currentPage => {
    if (currentPage != this.state.currentPage) {
      this.setState({ currentPage });
    }
  };

  handleAccountChange = (apiAccessID, apiSecretKey) => {
    if (apiAccessID != null) {
      this.setState({ apiAccessID });
    }

    if (apiSecretKey != null) {
      this.setState({ apiSecretKey });
    }
  };

  getAPIInstance = () => {
    if (
      this.state.apiAccessID.length <= 0 ||
      this.state.apiSecretKey.length <= 0
    ) {
      throw new Error("Account information not set");
    }
    const AWS = require("aws-sdk");
    AWS.config.update({
      credentials: new AWS.Credentials({
        accessKeyId: this.state.apiAccessID,
        secretAccessKey: this.state.apiSecretKey
      }),
      region: "us-east-1"
    });
    const endpoint = "https://mturk-requester-sandbox.us-east-1.amazonaws.com";

    return new AWS.MTurk({ endpoint: endpoint });
  };

  componentDidUpdate() {
    AppFileConfig.saveAppStateToFile(this.state);
  }

  render() {
    return (
      <React.Fragment>
        <NavBar
          pages={this.pages}
          currentPage={this.state.currentPage}
          onPageSwitch={this.handlePageSwitch}
        >
          <span className="navbar-brand mb-0 h1">M-Turk Survey Manager</span>
        </NavBar>
        <div className="mx-3 mt-2">
          <Create
            hidden={this.state.currentPage != 0}
            getAPIInstance={this.getAPIInstance}
          />
          <Manage
            hidden={this.state.currentPage != 1}
            getAPIInstance={this.getAPIInstance}
          />
          <Account
            hidden={this.state.currentPage != 2}
            apiAccessID={this.state.apiAccessID}
            apiSecretKey={this.state.apiSecretKey}
            onAccountChange={(newAPIAccessID, newAPISecretKey) =>
              this.handleAccountChange(newAPIAccessID, newAPISecretKey)
            }
          />
        </div>
      </React.Fragment>
    );
  }
}

export default App;
