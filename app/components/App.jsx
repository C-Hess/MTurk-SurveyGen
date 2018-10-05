import React, { Component } from "react";
import Create from "./Create";
import Account from "./Account";
import Manage from "./Manage";
import NavBar from "./NavBar";

class App extends Component {
  state = {
    pages: [{ name: "Create" }, { name: "Manage" }, { name: "Account" }],
    currentPage: 0,
    apiAccessID: "",
    apiSecretKey: ""
  };

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

  render() {
    return (
      <React.Fragment>
        <NavBar
          pages={this.state.pages}
          currentPage={this.state.currentPage}
          onPageSwitch={this.handlePageSwitch}
        >
          <span className="navbar-brand mb-0 h1">M-Turk Survey Manager</span>
        </NavBar>
        <div className="mx-3 mt-2">
          <Create
            hidden={this.state.currentPage != 0}
            apiAccessID={this.state.apiAccessID}
            apiSecretKey={this.state.apiSecretKey}
          />
          <Manage
            hidden={this.state.currentPage != 1}
            apiAccessID={this.state.apiAccessID}
            apiSecretKey={this.state.apiSecretKey}
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
