import React, { Component } from "react";

class AddTwoURLs extends Component {
  state = {
    controlInputValue: "",
    experimentalInputValue: ""
  };

  handleExperimentalInputChange = e => {
    this.setState({ experimentalInputValue: e.target.value });
  };

  handleControlInputChange = e => {
    this.setState({ controlInputValue: e.target.value });
  };

  render() {
    return (
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">Enter URLs</span>
        </div>
        <input
          type="text"
          className={
            this.props.invalidControlURLInput
              ? "form-control is-invalid"
              : "form-control"
          }
          name="controlURL"
          placeholder="Control"
          value={this.state.controlInputValue}
          onChange={this.handleControlInputChange}
        />
        <input
          className={
            this.props.invalidExperimentalURLInput
              ? "form-control is-invalid"
              : "form-control"
          }
          type="text"
          name="experimentalURL"
          placeholder="Experimental"
          value={this.state.experimentalInputValue}
          onChange={this.handleExperimentalInputChange}
        />
        <div className="input-group-append">
          <button
            className="btn btn-outline-success"
            onClick={() => {
              const success = this.props.onAddTwoURLQuestion(
                this.state.controlInputValue,
                this.state.experimentalInputValue
              );
              if (success) {
                this.setState({
                  controlInputValue: "",
                  experimentalInputValue: ""
                });
              }
            }}
          >
            Add
          </button>
        </div>
        {(this.props.invalidControlURLInput ||
          this.props.invalidExperimentalURLInput) && (
          <div className="invalid-tooltip d-block">Must enter valid URL</div>
        )}
      </div>
    );
  }
}

export default AddTwoURLs;
