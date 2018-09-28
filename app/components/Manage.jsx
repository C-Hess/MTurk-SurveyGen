import React, { Component } from "react";

class Manage extends Component {
  render() {
    return (
      <div className={this.props.hidden ? "card d-none" : "card d-block"}>
        <div className="card-body">
          <h3 className="card-title text-center">Manage Hits</h3>
        </div>
      </div>
    );
  }
}

export default Manage;
