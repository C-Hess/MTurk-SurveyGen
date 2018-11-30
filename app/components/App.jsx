import React, { Component } from "react";
import Create from "./Create";
import Account from "./Account";
import Manage from "./Manage";
import NavBar from "./NavBar";
import AppFileConfig from "../AppFileConfig";
import { error } from "util";

/**
 * Main component of the Survey Generator app. Contains the navigation bar and the three main
 * components of the program. It also handles providing subcomponents access to the MTurk API.
 */
class App extends Component {
  /** Static list that contains the name of each page for the navigation bar */
  pages = [{ name: "Create" }, { name: "Manage" }, { name: "Account" }];

  /** The app state is saved and loaded from a JSON file for persistance. */
  state = AppFileConfig.loadAppStateFromFile({
    /** The current page the user has chosen to display. */
    currentPage: 0,
    /** The Amazon Web Service API Access ID for accessing the MTurk API */
    apiAccessID: "",
    /** The Amazon Web Service API Secret Key for accessing the MTurk API */
    apiSecretKey: "",
    /** Boolean that tells which API endpoint to use (either sandbox or production) */
    useSandbox: false
  });

  /**
   * Event handler for when the user chooses to display a different page from the navigation bar.
   */
  handlePageSwitch = currentPage => {
    if (currentPage != this.state.currentPage) {
      this.setState({ currentPage });
    }
  };

  /**
   * Event handler for when the user changes either the AWS API Access ID or the AWS API Secret Key
   * in the Account component.
   */
  handleAccountChange = (apiAccessID, apiSecretKey) => {
    if (apiAccessID != null) {
      this.setState({ apiAccessID });
    }

    if (apiSecretKey != null) {
      this.setState({ apiSecretKey });
    }
  };

  handleUseSandboxChange = e => {
    this.setState({ useSandbox: e.target.checked });
  };

  /**
   * Returns the instance of a new MTurk API object that is created from the API access ID and key.
   * This function is given to subcomponents for their use.
   *
   * @returns {AWS.MTurk} A Mechanical Turk API instance.
   */
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

    let endpoint = "";
    if (this.state.useSandbox) {
      endpoint = "https://mturk-requester-sandbox.us-east-1.amazonaws.com";
    } else {
      endpoint = "https://mturk-requester.us-east-1.amazonaws.com";
    }

    return new AWS.MTurk({ endpoint: endpoint });
  };

  /** React.Component function that will be called every time the App component's state is changed  */
  componentDidUpdate() {
    AppFileConfig.saveAppStateToFile(this.state);
  }

  /**
   * Render function for React.Component. Returns the HTML content for the main App component.
   */
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
            useSandbox={this.state.useSandbox}
            onAccountChange={(newAPIAccessID, newAPISecretKey) =>
              this.handleAccountChange(newAPIAccessID, newAPISecretKey)
            }
            onUseSandboxChange={e => this.handleUseSandboxChange(e)}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default App;
