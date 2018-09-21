import React, { Component } from "react";
import Create from "./Create";
import Account from "./Account";
import NavBar from "./NavBar";

class App extends Component {
  state = {
    pages: [
      { name: "Create", view: <Create /> },
      { name: "Manage", view: <h1>Test Manage</h1> },
      { name: "Account", view: <Account /> }
    ],
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
          {this.state.pages[this.state.currentPage].view}
        </div>
      </React.Fragment>
    );
  }
}

export default App;
