import React, { Component } from "react";

class Account extends Component {
  render() {
    return (
      <React.Fragment>
        <div className={this.props.hidden ? "card d-none" : "card d-block"}>
          <div className="card-body">
            <h3 className="card-title text-center">Mechanical Turk Account</h3>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
export default Account;
