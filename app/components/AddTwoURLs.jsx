import React, { Component } from "react";
import Utils from "../Utils";

/**
 * React component that defines the "Add two URLs" functionality to the Create page.
 */
class AddTwoURLs extends Component {
  state = {
    /** User inputted string that is the URL of the control video/image */
    controlInputValue: "",
    /** User inputted string that is the URL of the experimental video/image */
    experimentalInputValue: "",
    /** Boolean used to show the user if the control URL field is invalid */
    isControlURLInvalid: false,
    /** Boolean used to show the user if the experimental URL field is invalid */
    isExperimentalURLInvalid: false,
    /** String that tells the user why the inputted URL fields are invalid */
    invalidReason: ""
  };

  /**
   * Event handler for when the "Add" two URL button is clicked. Will divert the functionality of what to do
   * to the parent component.
   */
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

  /**
   * Event handler for when the experimental URL text field is changed
   */
  handleExperimentalInputChange = e => {
    this.setState({ experimentalInputValue: e.target.value });
  };

  /** Event handler for when the control URL text field is changed */
  handleControlInputChange = e => {
    this.setState({ controlInputValue: e.target.value });
  };

  /**
   * Render function for React.Component. Provides the HTML for the AddTwoURLs component.
   */
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
