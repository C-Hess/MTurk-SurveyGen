import React, { Component } from "react";

class AddSingleURL extends Component {
  state = {
    combinedURLInputValue: "",
    isControlLeft: true
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
            onClick={() => {
              const success = this.props.onAddURLQuestion(
                this.state.combinedURLInputValue,
                this.state.isControlLeft
              );
              if (success) {
                this.setState({
                  combinedURLInputValue: ""
                });
              }
            }}
          >
            Add
          </button>
        </div>
        {this.props.invalidCombinedURLInput && (
          <div className="invalid-tooltip d-block">Must enter valid URL</div>
        )}
      </div>
    );
  }
}

export default AddSingleURL;
