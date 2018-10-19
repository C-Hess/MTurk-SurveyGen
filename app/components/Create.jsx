import React, { Component } from "react";
import ErrorModal from "./ErrorModal";
import AddTwoURLs from "./AddTwoURLs";
import SurveyGenerator from "../SurveyGenerator";
import AddSingleURL from "./AddSingleURL";
import AssignmentReward from "./AssignmentReward";
import SecureConfirmationModal from "./SecureConfirmationModal";

let window;

class Create extends Component {
  assignmentReward = "0.00";
  defaultAssignmentsPerHIT = 10;

  state = {
    questions: [],
    selectedQuestions: -1,
    hitTitleInputValue: "",
    hitDescriptionInputValue: "",
    questionDescriptionInputValue: "",
    reverseAssignment: true,
    errorModalVisible: false,
    randomizeControlOrder: true,
    assignmentsPerHIT: this.defaultAssignmentsPerHIT,
    errorModalBody: "",
    secureConfirmModalVisible: false,
    secureConfirmModalBody: ""
  };

  getTotalCost = () => {
    return (this.state.assignmentsPerHIT * this.assignmentReward).toFixed(2);
  };

  getQuestionRows = () => {
    if (this.state.questions.length == 0) {
      return (
        <tr>
          <td className="table-secondary text-center" colSpan="3">
            No questions added
          </td>
        </tr>
      );
    } else {
      return this.state.questions.map((question, index) => {
        let controlVal = question.urls[0];
        let experimentalVal;
        if (question.urls.length == 1) {
          if (question.isControlLeft) {
            experimentalVal = (
              <td
                className="align-middle text-center text-white bg-info"
                style={{ wordWrap: "break-word", maxWidth: "10px" }}
              >
                Right of control URL
              </td>
            );
          } else {
            experimentalVal = (
              <td
                className="align-middle text-center text-white bg-info"
                style={{ wordWrap: "break-word", maxWidth: "10px" }}
              >
                Left of control URL
              </td>
            );
          }
        } else {
          experimentalVal = (
            <td style={{ wordWrap: "break-word", maxWidth: "10px" }}>
              {question.urls[1]}
            </td>
          );
        }

        return (
          <tr
            key={index}
            className={
              index == this.state.selectedQuestions ? "table-active" : ""
            }
            onClick={() => this.handleOnQuestionClick(index)}
          >
            <th scope="row">{index + 1}</th>

            <td style={{ wordWrap: "break-word", maxWidth: "10px" }}>
              {controlVal}
            </td>
            {experimentalVal}
          </tr>
        );
      });
    }
  };

  validateAll = () => {
    const validationInfo = this.validatePreview();
    if (!validationInfo.isValid) {
      return validationInfo;
    }

    if (this.state.assignmentReward <= 0) {
      validationInfo.isValid = false;
      validationInfo.reason = "Survey must have an assignment reward > 0";
    }

    if (this.state.hitTitleInputValue <= 0) {
      validationInfo.isValid = false;
      validationInfo.reason = "Survey must have a title";
    }

    if (this.state.hitDescriptionInputValue <= 0) {
      validationInfo.isValid = false;
      validationInfo.reason = "Survey must have a description";
    }

    if (
      this.props.apiAccessID.length <= 0 ||
      this.props.apiSecretKey.length <= 0
    ) {
      validationInfo.isValid = false;
      validationInfo.reason =
        "Account information not set. Cannot publish survey";
    }

    return validationInfo;
  };

  validatePreview = () => {
    const validationInfo = { isValid: true, reason: "" };
    if (this.state.questions <= 0) {
      validationInfo.isValid = false;
      validationInfo.reason =
        "Survey have more than one question pair in the survey";
    }

    if (this.state.questionDescriptionInputValue <= 0) {
      validationInfo.isValid = false;
      validationInfo.reason = "Survey must have a question description";
    }
    return validationInfo;
  };

  handleOnQuestionClick = index => {
    this.setState({ selectedQuestions: index });
  };

  handleAddURLQuestion = (combinedURLInputValue, isControlLeft) => {
    const urls = [combinedURLInputValue];
    const questions = [...this.state.questions];
    questions.push({ urls, isControlLeft });
    this.setState({
      questions
    });
  };

  handleAddTwoURLQuestion = (controlInputValue, experimentalInputValue) => {
    const urls = [controlInputValue, experimentalInputValue];
    const isControlLeft = null;
    const questions = [...this.state.questions];
    questions.push({ urls, isControlLeft });
    this.setState({
      questions
    });
  };

  handlePreviewButton = e => {
    const validationInfo = this.validatePreview();
    if (validationInfo.isValid) {
      const surveyGen = new SurveyGenerator();
      const generatedSurvey = surveyGen.getPreviewDocument(
        this.state.questions,
        this.state.questionDescriptionInputValue,
        this.state.randomizeControlOrder
      );

      // Modules to control application and create native browser window
      const { BrowserWindow } = require("electron").remote;
      const tmp = require("tmp");
      const fs = require("fs");

      const tmpFile = tmp.fileSync({ postfix: ".html" });
      fs.writeFileSync(tmpFile.name, generatedSurvey);

      window = new BrowserWindow({ width: 800, height: 450 });
      window.setTitle("Survey Preview");
      window.loadURL("file://" + tmpFile.name);
      window.on("closed", () => {
        window = null;
        tmp.setGracefulCleanup();
      });
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
      this.setState({
        secureConfirmModalBody:
          "Are you sure you want to publish this survey? It will cost $" +
          this.getTotalCost(),
        secureConfirmModalVisible: true
      });
    } else {
      this.setState({
        errorModalVisible: true,
        errorModalBody: validationInfo.reason
      });
    }
  };

  handleDeleteQuestion = e => {
    const questions = this.state.questions.filter((question, index) => {
      return index !== this.state.selectedQuestions;
    });
    let selectedQuestions = -1;
    this.setState({ questions, selectedQuestions });
  };

  handleTitleChange = e => {
    this.setState({ hitTitleInputValue: e.target.value });
  };

  handleDescriptionChange = e => {
    this.setState({ hitDescriptionInputValue: e.target.value });
  };

  handleQuestionDescriptionChange = e => {
    this.setState({ questionDescriptionInputValue: e.target.value });
  };

  handleReverseAssignmentChange = e => {
    this.setState({ reverseAssignment: e.target.checked });
  };

  handleErrorModalClose = e => {
    this.setState({ errorModalVisible: false });
  };

  handleRewardChange = assignmentReward => {
    this.assignmentReward = assignmentReward;
  };

  handleAssignmentsPerHITChange = e => {
    this.setState({ assignmentsPerHIT: e.target.value });
  };

  handleRandomizeControlOrderChange = e => {
    this.setState({ randomizeControlOrder: e.target.checked });
  };

  handleAssignmentsPerHITBlur = e => {
    let assignmentsPerHIT = e.target.value;
    assignmentsPerHIT = assignmentsPerHIT.replace(/[^.\d]/g, "");

    if (assignmentsPerHIT.startsWith(".")) {
      assignmentsPerHIT = "0" + assignmentsPerHIT;
    }

    if (assignmentsPerHIT.endsWith(".")) {
      assignmentsPerHIT = assignmentsPerHIT.substring(
        0,
        assignmentsPerHIT.length - 2
      );
    }

    if (assignmentsPerHIT == "") {
      assignmentsPerHIT = this.defaultAssignmentsPerHIT;
    }

    let assignPerHITInt = parseInt(assignmentsPerHIT);
    if (isNaN(assignPerHITInt)) {
      assignPerHITInt = this.defaultAssignmentsPerHIT;
    }

    assignPerHITInt = Math.max(0, Math.min(1000, rewardFloat));

    this.setState({ assignmentsPerHIT: assignPerHITInt });
  };

  handlePublishCancel = id => {
    this.setState({
      secureConfirmModalBody: "",
      secureConfirmModalVisible: false
    });
  };

  handleConfirmPublish = id => {
    this.setState({
      secureConfirmModalBody: "",
      secureConfirmModalVisible: false
    });

    const surveyGen = new SurveyGenerator();
    const generatedSurvey = surveyGen.getDocument(
      this.state.questions,
      this.state.questionDescriptionInputValue,
      this.state.randomizeControlOrder
    );

    const AWS = require("aws-sdk");
    AWS.config.update({
      credentials: new AWS.Credentials({
        accessKeyId: this.props.apiAccessID,
        secretAccessKey: this.props.apiSecretKey
      }),
      region: "us-east-1"
    });
    const endpoint = "https://mturk-requester-sandbox.us-east-1.amazonaws.com";
    // Uncomment this line to use in production
    // endpoint = 'https://mturk-requester.us-east-1.amazonaws.com';

    const mturk = new AWS.MTurk({ endpoint: endpoint });

    // Test your ability to connect to MTurk by checking your account balance
    mturk.getAccountBalance(function(err, data) {
      if (err) {
        console.log(err.message);
      } else {
        // Sandbox balance check will always return $10,000
        console.log("I have " + data.AvailableBalance + " in my account.");
      }
    });

    /*
      Publish a new HIT to the Sandbox marketplace start by reading in the HTML markup specifying your task from a seperate file (my_question.xml). To learn more about the HTML question type, see here: http://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_HTMLQuestionArticle.html
      */

    // Construct the HIT object below
    const myHIT = {
      Title: this.state.hitTitleInputValue,
      Description: this.state.hitDescriptionInputValue,
      MaxAssignments: this.state.assignmentsPerHIT,
      LifetimeInSeconds: 3600,
      AssignmentDurationInSeconds: 600,
      Reward: this.assignmentReward,
      Question: generatedSurvey
    };

    mturk.createHIT(myHIT, function(err, data) {
      if (err) {
        console.log(err.message);
      } else {
        console.log(data);
        // Save the HITId printed by data.HIT.HITId and use it in the RetrieveAndApproveResults.js code sample
        console.log(
          "HIT has been successfully published here: https://workersandbox.mturk.com/mturk/preview?groupId=" +
            data.HIT.HITTypeId +
            " with this HITId: " +
            data.HIT.HITId
        );
      }
    });
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
          <SecureConfirmationModal
            modalBody={this.state.secureConfirmModalBody}
            isVisible={this.state.secureConfirmModalVisible}
            onModalCancel={this.handlePublishCancel}
            onModalConfirm={this.handleConfirmPublish}
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
              <label>Survey description</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter survey description"
                onChange={this.handleDescriptionChange}
                value={this.state.hitDescriptionInputValue}
              />
            </div>
            <div className="form-group">
              <label>Question description</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter question description"
                onChange={this.handleQuestionDescriptionChange}
                value={this.state.questionDescriptionInputValue}
              />
              <small className="form-text text-muted">
                Example: Which &#60;image/video> do you prefer?
              </small>
            </div>
            <h5 className="border-bottom my-3">Questions</h5>
            <AddSingleURL onAddURLQuestion={this.handleAddURLQuestion} />
            <div className="text-center my-1">
              <strong>OR</strong>
            </div>
            <AddTwoURLs onAddTwoURLQuestion={this.handleAddTwoURLQuestion} />
            <table
              className={
                this.state.questions.length <= 0
                  ? "table table-bordered mt-2"
                  : "table table-hover table-bordered mt-2"
              }
            >
              <thead className="thead-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Control URL</th>
                  <th scope="col">Experimental URL</th>
                </tr>
              </thead>
              <tbody>{this.getQuestionRows()}</tbody>
            </table>
            <button
              className="btn btn-danger"
              disabled={
                this.state.questions[this.state.selectedQuestions] === void 0
              }
              onClick={this.handleDeleteQuestion}
            >
              Delete
            </button>
            <h5 className="border-bottom my-3">HIT Configuration</h5>
            <div className="form-group form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={this.state.reverseAssignment}
                onChange={this.handleReverseAssignmentChange}
              />
              <label className="form-check-label">
                Create reverse assignment
              </label>
              <small className="form-text text-muted">
                This will create another HIT with all of the questions in
                reverse order to remove some bias
              </small>
            </div>
            <div className="form-group form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={this.state.randomizeControlOrder}
                onChange={this.handleRandomizeControlOrderChange}
              />
              <label className="form-check-label">
                Randomize control order
              </label>
              <small className="form-text text-muted">
                This will randomize the placement of the control URL to the left
                or right. Has no effect on questions with one URL.
              </small>
            </div>
            <AssignmentReward
              numOfQuestions={this.state.questions.length}
              onRewardChange={this.handleRewardChange}
            />
            <div className="form-group">
              <label>Assignments per HIT</label>
              <input
                type="text"
                className="form-control"
                value={this.state.assignmentsPerHIT}
                onChange={this.handleAssignmentsPerHITChange}
                onBlur={this.handleAssignmentsPerHITBlur}
              />
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
                Publish ($
                {this.getTotalCost()})
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Create;
