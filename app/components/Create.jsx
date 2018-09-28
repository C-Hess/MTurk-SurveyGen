import React, { Component } from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import ErrorModal from "./ErrorModal";

class Create extends Component {
  state = {
    questionPairs: [],
    selectedQuestionPair: -1,
    invalidQuestionInput: false,
    hitTitleInputValue: "",
    questionDescriptionInputValue: "",
    controlInputValue: "",
    experimentalInputValue: "",
    assignmentReward: 0,
    recommendedReward: true,
    errorModalVisible: false,
    errorModalBody: ""
  };

  getAssignmentRewardValue = () => {
    if (this.state.recommendedReward) {
      const calculatedReward =
        Math.round(this.state.questionPairs.length * 0.108333333 * 100) / 100;
      if (calculatedReward != this.state.assignmentReward) {
        this.setState({ assignmentReward: calculatedReward });
      }
    }
    return this.state.assignmentReward;
  };

  getQuestionPairRows = () => {
    if (this.state.questionPairs.length == 0) {
      return (
        <tr>
          <td className="table-secondary text-center" colSpan="3">
            No questions added
          </td>
        </tr>
      );
    } else {
      return this.state.questionPairs.map((questionPair, index) => (
        <tr
          key={index}
          className={
            index == this.state.selectedQuestionPair ? "table-active" : ""
          }
          onClick={() => this.handleOnQuestionClick(index)}
        >
          <th scope="row">{index + 1}</th>

          <td style={{ wordWrap: "break-word", maxWidth: "10px" }}>
            {questionPair.controlURL}
          </td>
          <td style={{ wordWrap: "break-word", maxWidth: "10px" }}>
            {questionPair.experimentalURL}
          </td>
        </tr>
      ));
    }
  };

  validateAll = () => {
    const validationInfo = this.validatePreview();
    if (validationInfo.isValid) {
      return validationInfo;
    }

    if (this.state.assignmentReward <= 0) {
      return false, "Survey must have an assignment reward > 0";
    }
  };

  validatePreview = () => {
    const validationInfo = { isValid: true, reason: "" };
    if (this.state.questionPairs <= 0) {
      validationInfo.isValid = false;
      validationInfo.reason =
        "Survey have more than one question pair in the survey";
    }

    if (this.state.hitTitleInputValue <= 0) {
      validationInfo.isValid = false;
      validationInfo.reason = "Survey must have a title";
    }

    if (this.state.questionDescriptionInputValue <= 0) {
      validationInfo.isValid = false;
      validationInfo.reason = "Survey must have a question description";
    }
    return validationInfo;
  };

  handleOnQuestionClick = index => {
    this.setState({ selectedQuestionPair: index });
  };

  handleAddQuestionPair = e => {
    if (
      this.state.controlInputValue.length > 0 &&
      this.state.experimentalInputValue.length > 0
    ) {
      const questions = [...this.state.questionPairs];
      questions.push({
        controlURL: this.state.controlInputValue,
        experimentalURL: this.state.experimentalInputValue
      });
      this.setState({
        questionPairs: questions,
        invalidQuestionInput: false,
        controlInputValue: "",
        experimentalInputValue: ""
      });
    } else {
      this.setState({ invalidQuestionInput: true });
    }
  };

  handlePreviewButton = e => {
    const validationInfo = this.validatePreview();
    if (validationInfo.isValid) {
      // Preview;
    } else {
      this.setState({
        errorModalVisible: true,
        errorModalBody: validationInfo.reason
      });
    }
  };

  handlePublishButton = e => {
    const validationInfo = this.validateAll();
    if (validationInfo.isValid) {
      // Publish;
    } else {
      this.setState({
        errorModalVisible: true,
        errorModalBody: validationInfo.reason
      });
    }
  };

  handleDeleteQuestionPair = e => {
    const questionPairs = this.state.questionPairs.filter((question, index) => {
      return index !== this.state.selectedQuestionPair;
    });
    let selectedQuestionPair = -1;
    this.setState({ questionPairs, selectedQuestionPair });
  };

  handleExperimentalInputChange = e => {
    this.setState({ experimentalInputValue: e.target.value });
  };

  handleControlInputChange = e => {
    this.setState({ controlInputValue: e.target.value });
  };

  handleTitleChange = e => {
    this.setState({ hitTitleInputValue: e.target.value });
  };

  handleDescriptionChange = e => {
    this.setState({ questionDescriptionInputValue: e.target.value });
  };

  handleRecommendCheckboxChange = e => {
    this.setState({ recommendedReward: e.target.checked });
  };

  handleRewardChange = e => {
    this.setState({ assignmentReward: e.target.value });
  };

  handleErrorModalClose = e => {
    this.setState({ errorModalVisible: false });
  };

  render() {
    return (
      <div
        className={this.props.hidden ? "card mb-2 d-none" : "card mb-2 d-block"}
      >
        <div className="card-body">
          <ErrorModal
            modalBody={this.state.errorModalBody}
            isVisible={this.state.errorModalVisible}
            onModalClose={this.handleErrorModalClose}
          />
          <h3 className="card-title text-center">Create a New HIT</h3>
          <div className="mt-2">
            <h5 className="border-bottom my-3">Description</h5>
            <div className="form-group">
              <label>Survey title</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter survey title"
                onChange={this.handleTitleChange}
                value={this.state.hitTitleInputValue}
              />
            </div>
            <div className="form-group">
              <label>Question description</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter question description"
                onChange={this.handleDescriptionChange}
                value={this.state.questionDescriptionInputValue}
              />
              <small className="form-text text-muted">
                Example: Which &#60;image/video> do you prefer?
              </small>
            </div>
            <h5 className="border-bottom my-3">Questions</h5>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">Enter URLs</span>
              </div>
              <input
                type="text"
                className={
                  this.state.invalidQuestionInput &&
                  this.state.controlInputValue.length <= 0
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
                  this.state.invalidQuestionInput &&
                  this.state.experimentalInputValue.length <= 0
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
                  onClick={this.handleAddQuestionPair}
                >
                  Add
                </button>
              </div>
              {this.state.invalidQuestionInput && (
                <div className="invalid-tooltip d-block">
                  Must enter valid URL
                </div>
              )}
            </div>
          </div>
          <table
            className={
              this.state.questionPairs.length <= 0
                ? "table table-bordered mt-2"
                : "table table-hover table-bordered mt-2"
            }
          >
            <thead className="thead-dark">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Control</th>
                <th scope="col">Experimental</th>
              </tr>
            </thead>
            <tbody>{this.getQuestionPairRows()}</tbody>
          </table>
          <button
            className="btn btn-danger"
            disabled={
              this.state.questionPairs[this.state.selectedQuestionPair] ===
              void 0
            }
            onClick={this.handleDeleteQuestionPair}
          >
            Delete
          </button>
          <h5 className="border-bottom my-3">HIT Configuration</h5>
          <div className="form-group">
            <label>Assignment reward</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <span className="input-group-text">$</span>
              </div>
              <input
                type="text"
                className="form-control"
                value={this.getAssignmentRewardValue()}
                onChange={this.handleRewardChange}
                readOnly={this.state.recommendedReward}
              />
            </div>
            <div className="form-group">
              <div className="form-check">
                <label className="form-check-label">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={this.state.recommendedReward}
                    onChange={this.handleRecommendCheckboxChange}
                  />
                  Use recommended reward
                </label>
              </div>
            </div>
          </div>
          <div className="d-flex">
            <button
              className="btn btn-info btn-block w-75 mr-2"
              onClick={this.handlePreviewButton}
            >
              Preview
            </button>
            <button
              className="btn btn-success w-25"
              onClick={this.handlePublishButton}
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Create;
