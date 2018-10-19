import React, { Component } from "react";

class ErrorModal extends Component {
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
                className="modal-header bg-danger"
                style={{
                  borderTopLeftRadius: ".2rem",
                  borderTopRightRadius: ".2rem"
                }}
              >
                <h5 className="modal-title">
                  <i className="fas fa-exclamation-triangle mr-5" />
                  Error
                </h5>
                <button
                  type="button"
                  className="close"
                  onClick={this.props.onModalClose}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">{this.props.modalBody}</div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={this.props.onModalClose}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default ErrorModal;
