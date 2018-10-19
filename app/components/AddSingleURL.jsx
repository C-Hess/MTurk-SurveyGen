import React, { Component } from "react";
import Utils from "../Utils";

class AddSingleURL extends Component {
  state = {
    combinedURLInputValue: "",
    isControlLeft: true,
    isInvalidInput: false,
    invalidReason: ""
  };

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

  handleControlOnLeftChange = e => {
    this.setState({ isControlLeft: true });
  };

  handleControlOnRightChange = e => {
    this.setState({ isControlLeft: false });
  };

  handleCombinedURLInputChange = e => {
    this.setState({ combinedURLInputValue: e.target.value });
  };

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
