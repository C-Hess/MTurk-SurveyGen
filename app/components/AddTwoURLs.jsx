import React, { Component } from "react";
import Utils from "../Utils";

class AddTwoURLs extends Component {
  state = {
    controlInputValue: "",
    experimentalInputValue: "",
    isControlURLInvalid: false,
    isExperimentalURLInvalid: false,
    invalidReason: ""
  };

  handleAddURLS = e => {
    const controlVal = this.state.controlInputValue;
    const experimentalVal = this.state.experimentalInputValue;

    let invalidReason = "";
    let controlInvalid = controlVal <= 0;
    let experimentalInvalid = experimentalVal <= 0;

    if (controlInvalid || experimentalInvalid) {
      invalidReason = "URLs cannot be empty";
    }

    const invalidControlURL = !Utils.isValidURL(controlVal);
    const invalidExperimentalURL = !Utils.isValidURL(experimentalVal);
    controlInvalid = controlInvalid || invalidControlURL;
    experimentalInvalid = experimentalInvalid || invalidExperimentalURL;

    if (invalidControlURL || invalidExperimentalURL) {
      invalidReason = "Invalid URLs";
    }

    if (controlInvalid || experimentalInvalid) {
      this.setState({
        isControlURLInvalid: controlInvalid,
        isExperimentalURLInvalid: experimentalInvalid,
        invalidReason
      });
      return;
    }

    this.props.onAddTwoURLQuestion(controlVal, experimentalVal);
    this.setState({
      isControlURLInvalid: false,
      isExperimentalURLInvalid: false,
      controlInputValue: "",
      experimentalInputValue: ""
    });
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
            this.state.isControlURLInvalid
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
            this.state.isExperimentalURLInvalid
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
            onClick={this.handleAddURLS}
          >
            Add
          </button>
        </div>
        {(this.state.isControlURLInvalid ||
          this.state.isExperimentalURLInvalid) && (
          <div className="invalid-tooltip d-block">
            {this.state.invalidReason}
          </div>
        )}
      </div>
    );
  }
}

export default AddTwoURLs;
