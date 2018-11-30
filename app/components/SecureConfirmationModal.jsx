import React, { Component } from "react";

/**
 * This component defines a secure confirmation modal. It is useful to prevent the accidential
 * authorization of a given action. The modal requires that text be entered to an input field to confirm
 * the action.
 */
class SecureConfirmationModal extends Component {
  state = {
    /**
     * The user inputted text field to confirm that the user authorizes a given action.
     */
    confirmationText: ""
  };

  /**
   * Event handler for when the confirm button is clicked. Will pass confirmation functionality to
   * parent component (this.props.onModalConfirm). This will only be called if the confirm button is
   * enabled, which only happens when the user has succesfully typed "yes" to confirm the action.
   */
  handleConfirmButton = e => {
    this.setState({ confirmationText: "" });
    this.props.onModalConfirm(this.props.id);
  };

  /**
   * Event handler for when either one of the two cancel buttons are clicked. Will pass "cancellation"
   * functionality to the parent component (this.props.onModalClose)
   */
  handleCancel = e => {
    this.setState({ confirmationText: "" });
    this.props.onModalCancel(this.props.id);
  };

  /**
   * Event handler for when the user changes the confirmation input text field
   */
  handleTextChange = e => {
    this.setState({ confirmationText: e.target.value });
  };

  /**
   * Render function used by React.Component. It will return all of the elements used to display the
   * SecureConfirmationModal
   */
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
                <div>{this.props.children}</div>
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
                    className="form-control"
                    type="text"
                    style={{ width: "48px" }}
                    value={this.state.confirmationText}
                    onChange={this.handleTextChange}
                    placeholder="Type 'yes' to confirm"
                  />
                  <div className="input-group-append">
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={this.handleConfirmButton}
                      disabled={
                        this.state.confirmationText.toLowerCase() != "yes"
                      }
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
