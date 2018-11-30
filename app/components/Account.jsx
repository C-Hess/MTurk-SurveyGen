import React, { Component } from "react";

/**
 * This react component represents the "Account" page. It contains fields for
 * inputting the required AWS API keys for the survey generator to work.
 */
class Account extends Component {
  /**
   * Render function for React.Component. Displays the "Account" page.
   */
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
            <div className="form-group form-check">
              <input
                class="form-check-input"
                type="checkbox"
                checked={this.props.useSandbox}
                onChange={this.props.onUseSandboxChange}
              />
              <label class="form-check-label">Use sandbox</label>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
export default Account;
