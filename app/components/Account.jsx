import React, { Component } from "react";

class Account extends Component {
  render() {
    return (
      <React.Fragment>
        <div className={this.props.hidden ? "card d-none" : "card d-block"}>
          <div className="card-body">
            <h3 className="card-title text-center">Mechanical Turk Account</h3>
            <div className="form-group">
              <label>API Account ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="Account ID"
                value={this.props.apiAccessID}
                onChange={e => this.props.onAccountChange(e.target.value, null)}
              />
            </div>
            <div className="form-group">
              <label>API Secret Key</label>
              <input
                type="password"
                className="form-control"
                placeholder="Secret Key"
                value={this.props.apiSecretKey}
                onChange={e => this.props.onAccountChange(null, e.target.value)}
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
export default Account;
