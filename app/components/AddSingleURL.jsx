import React, { Component } from "react";
import Utils from "../Utils";

/**
 * React component that defines the "Add single URL" functionality to the Create page.
 */
class AddSingleURL extends Component {
  state = {
    /** User inputted field for inputting the URL */
    combinedURLInputValue: "",
    /**
     * User inputted bool from the checkbox that defines which side the "control"
     * is on for the URL video/image
     */
    isControlLeft: true,
    /** Boolean defines whether or not the user inputted URL is valid or not. */
    isInvalidInput: false,
    /** String that gives the reason for why the inputted URL is invalid */
    invalidReason: ""
  };

  /**
   * Event handler for when the "Add" button is pressed. Will pass that functionality
   * to the parrent component.
   */
  handleAddURL = e => {
    if (this.state.combinedURLInputValue.length <= 0) {
      this.setState({
        isInvalidInput: true,
        invalidReason: "URL cannot be empty"
      });
      return;
    }

    if (!Utils.isValidURL(this.state.combinedURLInputValue)) {
      this.setState({
        isInvalidInput: true,
        invalidReason: "Invalid URL"
      });
      return;
    }

    this.props.onAddURLQuestion(
      this.state.combinedURLInputValue,
      this.state.isControlLeft
    );
    this.setState({ isInvalidInput: false, combinedURLInputValue: "" });
  };

  /**
   * Event handler for when the "Control is on left" switch/button is clicked.
   */
  handleControlOnLeftChange = e => {
    this.setState({ isControlLeft: true });
  };

  /**
   * Event handler for when the "Control is on right" switch/button is clicked
   */
  handleControlOnRightChange = e => {
    this.setState({ isControlLeft: false });
  };

  /**
   * Event handler for when the user inputted URL field is changed.
   */
  handleCombinedURLInputChange = e => {
    this.setState({ combinedURLInputValue: e.target.value });
  };

  /**
   * Render function for React.Component. Will display all of the HTML content for the
   * AddSingleURL component.
   */
  render() {
    return (
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">Enter URL</span>
        </div>
        <input
          type="text"
          className={
            this.props.invalidCombinedURLInput
              ? "form-control is-invalid"
              : "form-control"
          }
          name="combinedURL"
          placeholder="Combined control/experimental URL"
          value={this.state.combinedURLInputValue}
          onChange={this.handleCombinedURLInputChange}
        />

        <div className="input-group-append">
          <button
            className={
              this.state.isControlLeft
                ? "btn btn-outline-secondary active"
                : "btn btn-outline-secondary"
            }
            onClick={this.handleControlOnLeftChange}
          >
            Control on left
          </button>
          <button
            className={
              !this.state.isControlLeft
                ? "btn btn-outline-secondary active"
                : "btn btn-outline-secondary"
            }
            onClick={this.handleControlOnRightChange}
          >
            Control on right
          </button>
          <button
            className="btn btn-outline-success"
            onClick={this.handleAddURL}
          >
            Add
          </button>
        </div>
        {this.state.isInvalidInput && (
          <div className="invalid-tooltip d-block">
            {this.state.invalidReason}
          </div>
        )}
      </div>
    );
  }
}

export default AddSingleURL;
