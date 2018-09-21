import React, { Component } from "react";
import Create from "./Create";
import Account from "./Account";
import Manage from "./Manage";
import NavBar from "./NavBar";

class App extends Component {
  state = {
    pages: [{ name: "Create" }, { name: "Manage" }, { name: "Account" }],
    currentPage: 0
  };

  handlePageSwitch = currentPage => {
    if (currentPage != this.state.currentPage) {
      this.setState({ currentPage });
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
          <Create hidden={this.state.currentPage != 0} />
          <Manage hidden={this.state.currentPage != 1} />
          <Account hidden={this.state.currentPage != 2} />
        </div>
      </React.Fragment>
    );
  }
}

export default App;
