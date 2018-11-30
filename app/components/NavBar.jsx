import React, { Component } from "react";

/**
 * This component handles the bootstrap navigation bar.
 */
class NavBar extends Component {
  /**
   * This function returns nav-item elements for every navigation page given from this
   * components properties (this.props.pages)
   */
  getNavItems = () => {
    return this.props.pages.map((page, index) => (
      <a
        key={page.name}
        className={
          index == this.props.currentPage
            ? "nav-item nav-link active"
            : "nav-item nav-link"
        }
        onClick={() => this.props.onPageSwitch(index)}
      >
        {page.name}
      </a>
    ));
  };

  /**
   * Render function for React.Component. Returns the HTML elements that make up the navigation bar of the
   * survey generator application.
   */
  render() {
    return (
      <nav className="navbar navbar-expand-sm navbar-dark bg-primary">
        {this.props.children}
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNavAltMarkup"
          aria-controls="navbarNavAltMarkup"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
          <div className="navbar-nav">{this.getNavItems()}</div>
        </div>
      </nav>
    );
  }
}

export default NavBar;
