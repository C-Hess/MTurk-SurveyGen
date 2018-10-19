import React, { Component } from "react";

class SecureConfirmationModal extends Component {
  state = {
    confirmationText: "",
    invalidConfirmation: false
  };

  handleConfirmButton = e => {
    if (this.state.confirmationText.toLowerCase() == "yes") {
      this.setState({ invalidConfirmation: false, confirmationText: "" });
      this.props.onModalConfirm(this.props.id);
    } else {
      this.setState({ invalidConfirmation: true });
    }
  };

  handleCancel = e => {
    this.props.onModalCancel(this.props.id);
  };

  handleTextChange = e => {
    this.setState({ confirmationText: e.target.value });
  };

  render() {
    return (
      <React.Fragment>
        <div
          className={this.props.isVisible ? "d-inline" : "d-none"}
          style={{
            position: "fixed" /* Sit on top of the page content */,
            width: "100%" /* Full width (cover the whole page) */,
            height: "100%" /* Full height (cover the whole page) */,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor:
              "rgba(0,0,0,0.2)" /* Black background with opacity */,
            zIndex: 2 /* Specify a stack order in case you're using a different order for other elements */
          }}
        />
        <div
          className={this.props.isVisible ? "modal d-inline " : "modal d-none "}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="shadow modal-content">
              <div
                className="modal-header bg-warning"
                style={{
                  borderTopLeftRadius: ".2rem",
                  borderTopRightRadius: ".2rem"
                }}
              >
                <h5 className="modal-title">
                  <i className="fas fa-exclamation mr-5" />
                  Warning
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={this.handleCancel}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div>{this.props.modalBody}</div>
                <br />
                <div className="align-text-bottom text-center">
                  Type "<strong>yes</strong>" below to confirm
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={this.handleCancel}
                >
                  Cancel
                </button>
                <div className="input-group pull-right">
                  <input
                    className={
                      this.state.invalidConfirmation
                        ? "form-control is-invalid"
                        : "form-control"
                    }
                    type="text"
                    maxLength="3"
                    style={{ width: "48px" }}
                    value={this.state.confirmationText}
                    onChange={this.handleTextChange}
                  />
                  <div className="input-group-append">
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={this.handleConfirmButton}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default SecureConfirmationModal;