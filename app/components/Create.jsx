import React, { Component } from "react";
import AddTwoURLs from "./AddTwoURLs";
import SurveyGenerator from "../SurveyGenerator";
import AddSingleURL from "./AddSingleURL";
import AssignmentReward from "./AssignmentReward";
import SecureConfirmationModal from "./SecureConfirmationModal";
import ErrorModal from "./ErrorModal";
import SuccessModal from "./SuccessModal";
import DurationPicker from "./DurationPicker";
import AppFileConfig from "../AppFileConfig";

let window;

/**
 * This react component represents the Create survey page.
 */
class Create extends Component {
  /** Default value of assinments per HIT to reset to if the user input is invalid. */
  defaultAssignmentsPerHIT = 9;

  surveyLifetimeDuration = 28800;

  state = {
    /** List containing every question added to survey creation table. */
    questions: [],
    /** Index of currently selected question on table. */
    selectedQuestions: -1,
    /** String containing the user inputted title of the survey. */
    hitTitleInputValue: "",
    /** String containing the user inputted description of the survey. */

    hitDescriptionInputValue: "",
    /** String containing the user inputted question description. */
    questionDescriptionInputValue: "",
    /**
     * User inputted bool/checkbox value of whether the survey should
     * contain a duplicated, yet reversed, hit.
     */
    reverseAssignment: false,
    /**
     * User inputted bool decides whether the control/experimental order of each
     * question should be randomized.
     */
    randomizeControlOrder: true,
    /** User inputted decimal string giving the monetary reward for completing an assignment. */
    assignmentReward: "0.01",
    /** User inputted number of assignments to be available for a hit. */
    assignmentsPerHIT: this.defaultAssignmentsPerHIT,
    hitApprovalRatingQualificationValue: "0%",
    hitCompletionAmountQualificationValue: "0",
    /** Bool decides whether the error modal component should be visible or not. */
    errorModalVisible: false,
    /** String/react content that is to be displayed in the error modal component. */
    errorModalBody: "",
    /** Bool decides whether the secure confirmation modal component should be visible or not. */
    secureConfirmModalVisible: false,
    /** String/react content that is to be displayed in the secure confirmation modal component. */
    secureConfirmModalBody: "",
    /** Bool decides whether the success modal component should be visible or not. */
    successModalVisible: false,
    /** String/react content that is to be displayed in the success modal component. */
    successModalBody: "",
    surveyDuration: 300
  };

  getCommissionPercentage = () => {
    return this.state.assignmentsPerHIT > 9 ? 0.4 : 0.2;
  };

  getCommission = () => {
    let commissionPercentage = this.getCommissionPercentage();
    let commissionCost = this.state.assignmentReward * commissionPercentage;
    if (commissionCost < 0.01) {
      commissionCost = 0.01;
    }
    return commissionCost;
  };

  /**
   * Returns the total cost of the survey (string).
   * @returns {string} the total cost of the survey rounded to the hundredths
   */
  getTotalCost = () => {
    return (
      this.state.assignmentsPerHIT *
      (parseFloat(this.state.assignmentReward) + this.getCommission()) *
      (this.state.reverseAssignment ? 2 : 1)
    ).toFixed(2);
  };

  /**
   * The React element of each table row. There exists a row for each question
   * added to the creation page. If there are no questions currently added, then it
   * will return a single, unselectable row that says "No questions added"
   *
   * @returns {React.ReactElement}
   */
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

  /**
   * Validates all of the user inputs needed to preview the survey.
   */
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

  /**
   * Event handler for when a question row is selected
   */
  handleOnQuestionClick = index => {
    this.setState({ selectedQuestions: index });
  };

  /**
   * Event handler for adding a new question defined by a single URL
   */
  handleAddURLQuestion = (combinedURLInputValue, isControlLeft) => {
    const urls = [combinedURLInputValue];
    const questions = [...this.state.questions];
    questions.push({ urls, isControlLeft });
    this.setState({
      questions
    });
  };

  /**
   * Event handler for adding a new question defined by two seperate URLs
   */
  handleAddTwoURLQuestion = (controlInputValue, experimentalInputValue) => {
    const urls = [controlInputValue, experimentalInputValue];
    const isControlLeft = null;
    const questions = [...this.state.questions];
    questions.push({ urls, isControlLeft });
    this.setState({
      questions
    });
  };

  /**
   * Event handler for when the user clicks on the preview survey button. It will first validate
   * every input required by the preview functionality. Then, it will open a new electron
   * window containing a preview of the autogeneratedsurvey.
   */
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

  /**
   * Event handler for when the user clicks on the "Publish" button. It will first validate
   * every input required by the publish functionality. Then, it will check if the user has the
   * neccessary funds to purchase the survey. Finally, it will open up a secure confirmation
   * modal to confirm the transaction
   */
  handlePublishButton = e => {
    const validationInfo = this.validatePreview();

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

    if (this.surveyLifetimeDuration < this.state.surveyDuration * 2 + 60) {
      validationInfo.isValid = false;
      validationInfo.reason =
        "The survey lifetime must be at least one minute longer than double the survey duration.";
    }

    if (!validationInfo.isValid) {
      this.setState({
        errorModalBody: validationInfo.reason,
        errorModalVisible: true
      });
      return;
    }

    let mturk = null;
    try {
      mturk = this.props.getAPIInstance();
    } catch (err) {
      this.setState({ errorModalBody: err.message, errorModalVisible: true });
      return;
    }

    mturk.getAccountBalance((err, data) => {
      if (err) {
        this.setState({
          errorModalBody: (
            <div>
              There was an error getting the account balance: {err.message}
            </div>
          ),
          errorModalVisible: true
        });
        return;
      } else {
        if (
          parseFloat("" + data.AvailableBalance) <
          parseFloat("" + this.getTotalCost)
        ) {
          validationInfo.isValid = false;
          validationInfo.reason =
            "Insufficient account balance (" + data.AvailableBalance + ")";
        }

        if (validationInfo.isValid) {
          this.setState({
            secureConfirmModalBody: (
              <div>
                Are you sure you want to publish this survey? It will cost $
                {this.getTotalCost()}
              </div>
            ),
            secureConfirmModalVisible: true
          });
        } else {
          this.setState({
            errorModalVisible: true,
            errorModalBody: validationInfo.reason
          });
        }
      }
    });
  };

  /**
   * Event handler for the "Delete" question button that is enabled when a question is selected.
   */
  handleDeleteQuestion = e => {
    const questions = this.state.questions.filter((question, index) => {
      return index !== this.state.selectedQuestions;
    });
    let selectedQuestions = -1;
    this.setState({ questions, selectedQuestions });
  };

  /**
   * Event handler for when the survey title field is updated.
   */
  handleTitleChange = e => {
    this.setState({ hitTitleInputValue: e.target.value });
  };

  /**
   * Event handler for when the survey description field is updated.
   */
  handleDescriptionChange = e => {
    this.setState({ hitDescriptionInputValue: e.target.value });
  };

  /**
   * Event handler for when the question description field is updated.
   */
  handleQuestionDescriptionChange = e => {
    this.setState({ questionDescriptionInputValue: e.target.value });
  };

  /**
   * Event handler for when the reverse assignment checkbox is changed.
   */
  handleReverseAssignmentChange = e => {
    this.setState({ reverseAssignment: e.target.checked });
  };

  /**
   * Event handler for when the success modal is closed.
   */
  handleSuccessModalClose = e => {
    this.setState({ successModalVisible: false });
  };

  /**
   * Event handler for when the error modal is closed.
   */
  handleErrorModalClose = e => {
    this.setState({ errorModalVisible: false, errorModalBody: "" });
  };

  /**
   * Event handler for when the assignment reward field from the AssignmentReward component is updated.
   */
  handleRewardChange = assignmentReward => {
    this.setState({ assignmentReward });
  };

  /**
   * Event handler for when the number of assignments per hit field is changed.
   */
  handleAssignmentsPerHITChange = e => {
    this.setState({ assignmentsPerHIT: e.target.value });
  };

  /**
   * Event handler for when the number of assignments per hit field is finalized.
   */
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

    assignPerHITInt = Math.max(0, Math.min(1000, assignPerHITInt));

    this.setState({ assignmentsPerHIT: assignPerHITInt });
  };

  /**
   * Event handler for when the randomized control order checkbox is changed.
   */
  handleRandomizeControlOrderChange = e => {
    this.setState({ randomizeControlOrder: e.target.checked });
  };

  handleSurveyDurationChange = newDuration => {
    this.setState({ surveyDuration: newDuration });
  };

  handleSurveyLifetimeChange = newDuration => {
    this.surveyLifetimeDuration = newDuration;
  };

  /**
   * Event handler for when the secure confirmation modal is canceled
   */
  handlePublishCancel = id => {
    this.setState({
      secureConfirmModalBody: "",
      secureConfirmModalVisible: false
    });
  };

  /**
   * Event handler for when the secure confirmation modal is confirmed. Because there
   * is only one purpose for the secure confirmation modal for the creation page
   * (when the "Publish" survey button is pressed), it will attempt to publish the survey.
   *
   * If an error occured while publishing the survey, then an error modal will display the
   * problem. Otherwise, it will publish the survey and display the Success modal.
   */
  handleConfirmPublish = id => {
    this.setState({
      secureConfirmModalBody: "",
      secureConfirmModalVisible: false
    });

    const surveyGen = new SurveyGenerator();

    let mturk = null;
    try {
      mturk = this.props.getAPIInstance();
    } catch (err) {
      this.setState({ errorModalBody: err.message, errorModalVisible: true });
      return;
    }

    const generatedSurvey = surveyGen.getDocument(
      this.state.questions,
      this.state.questionDescriptionInputValue,
      this.state.randomizeControlOrder
    );

    const surveyHIT = {
      Title: this.state.hitTitleInputValue,
      Description: this.state.hitDescriptionInputValue,
      MaxAssignments: this.state.assignmentsPerHIT,
      LifetimeInSeconds: this.surveyLifetimeDuration,
      AssignmentDurationInSeconds: this.state.surveyDuration * 2,
      AutoApprovalDelayInSeconds: 30,
      Reward: this.state.assignmentReward,
      Question: generatedSurvey
    };

    const qualificationRequirementsArray = [];
    const approvalRateQualificationInt = parseInt(this.state.hitApprovalRatingQualificationValue.replace('[^\d]'));
    if(approvalRateQualificationInt > 0) {
      qualificationRequirementsArray.push({
        QualificationTypeId: '000000000000000000L0',
        Comparator: 'GreaterThan',
        ActionsGuarded: 'DiscoverPreviewAndAccept',
        IntegerValues: [approvalRateQualificationInt],
        RequiredToPreview: false
      });
    }

    const completedAssignmentsInt = parseInt(this.state.hitCompletionAmountQualificationValue);
    if(completedAssignmentsInt > 0) {
      qualificationRequirementsArray.push({
        QualificationTypeId: '00000000000000000040',
        Comparator: 'GreaterThan',
        ActionsGuarded: 'DiscoverPreviewAndAccept',
        IntegerValues: [completedAssignmentsInt],
        RequiredToPreview: false
      });
    }

    if(qualificationRequirementsArray.length > 0) {
      surveyHIT.QualificationRequirements = qualificationRequirementsArray;
    }

    mturk.createHIT(surveyHIT, (err, data) => {
      if (err) {
        this.setState({
          errorModalVisible: true,
          errorModalBody: (
            <div>
              <strong className="text-center">
                There was problem submitting the survey:
              </strong>
              <p>{err.message}</p>
            </div>
          )
        });
      } else {
        if (this.state.reverseAssignment) {
          let hitQuestions = JSON.parse(JSON.stringify(this.state.questions));
          hitQuestions.reverse();
          const generatedSurvey = surveyGen.getDocument(
            hitQuestions,
            this.state.questionDescriptionInputValue,
            this.state.randomizeControlOrder
          );

          const surveyHIT = {
            Title: this.state.hitTitleInputValue,
            Description: this.state.hitDescriptionInputValue,
            MaxAssignments: this.state.assignmentsPerHIT,
            LifetimeInSeconds: this.surveyLifetimeDuration,
            AssignmentDurationInSeconds: this.state.surveyDuration * 2,
            AutoApprovalDelayInSeconds: 30,
            Reward: this.state.assignmentReward,
            Question: generatedSurvey
          };
          const qualificationRequirementsArray = [];
          const approvalRateQualificationInt = parseInt(this.state.hitApprovalRatingQualificationValue.replace('[^\d]'));
          if(approvalRateQualificationInt > 0) {
            qualificationRequirementsArray.push({
              QualificationTypeId: '000000000000000000L0',
              Comparator: 'GreaterThan',
              ActionsGuarded: 'DiscoverPreviewAndAccept',
              IntegerValues: [approvalRateQualificationInt],
              RequiredToPreview: false
            });
          }
      
          const completedAssignmentsInt = parseInt(this.state.hitCompletionAmountQualificationValue);
          if(completedAssignmentsInt > 0) {
            qualificationRequirementsArray.push({
              QualificationTypeId: '00000000000000000040',
              Comparator: 'GreaterThan',
              ActionsGuarded: 'DiscoverPreviewAndAccept',
              IntegerValues: [completedAssignmentsInt],
              RequiredToPreview: false
            });
          }
      
          if(qualificationRequirementsArray.length > 0) {
            surveyHIT.QualificationRequirements = qualificationRequirementsArray;
          }

          setTimeout(() => {
            mturk.createHIT(surveyHIT, (err, data) => {
              if (err) {
                this.setState({
                  errorModalVisible: true,
                  errorModalBody: (
                    <div>
                      <strong className="text-center">
                        There was problem submitting the survey:
                      </strong>
                      <p>{err.message}</p>
                    </div>
                  )
                });
              } else {
                this.setState({
                  successModalVisible: true,
                  successModalBody: "Survey has been successfully published"
                });
              }
            });
          }, 1000);
        } else {
          this.setState({
            successModalVisible: true,
            successModalBody: "Survey has been successfully published"
          });
        }
      }
    });
  };

  displayAssignmentRewardWarning = () => {
    if (
      !isNaN(parseFloat(this.state.assignmentReward)) &&
      parseFloat(this.state.assignmentReward) >= 0.01 &&
      parseFloat(this.state.assignmentReward) * this.getCommissionPercentage() <
        0.01
    ) {
      return (
        <div className="alert alert-info">
          <strong>Important:</strong> The commission amount for this assignment
          reward would be less than $0.01. However, Amazon takes a minimum
          commission fee of $0.01. You could save money if you combine multiple
          surveys with low assignment rewards into one large survey with a
          higher assignment reward.
        </div>
      );
    }
  };

  displayAssignmentsPerHITWarning = () => {
    if (this.state.assignmentsPerHIT > 9) {
      return (
        <div className="alert alert-warning">
          <strong>Warning:</strong> Amazon Mechanical Turk will take an
          additional 40% commision fee instead of the usual 20% on surveys with
          10 or more assignments.
        </div>
      );
    }
  };

  handleApprovalRatingInputFocus = e => {
    this.setState({
      hitApprovalRatingQualificationValue: this.state.hitApprovalRatingQualificationValue.replace(
        "%",
        ""
      )
    });
  };

  handleApprovalRatingInputChange = e => {
    this.setState({ hitApprovalRatingQualificationValue: e.target.value });
  };

  handleApprovalRatingInputBlur = e => {
    //Convert string into int for bounds/NaN checking
    let intVal = parseInt(
      this.state.hitApprovalRatingQualificationValue.replace(/[^-.\d]/g, "")
    );

    if (isNaN(intVal)) {
      intVal = 0;
    }

    intVal = Math.min(100, Math.max(0, intVal));
    //Convert float back into string for better readibility
    let strVal = intVal + "%";
    this.setState({ hitApprovalRatingQualificationValue: strVal });
  };

  handleHITCompletionAmountChange = e => {
    this.setState({ hitCompletionAmountQualificationValue: e.target.value });
  };

  handleHITCompletionAmountBlur = e => {
    let intVal = parseInt(
      this.state.hitCompletionAmountQualificationValue.replace(/[^-.\d]/g, "")
    );

    if (isNaN(intVal)) {
      intVal = 0;
    }

    intVal = Math.min(200, Math.max(0, intVal));

    this.setState({ hitCompletionAmountQualificationValue: intVal.toString() });
  };

  /**
   * Render function from React.Component. Displays the "Create" page.
   */
  render() {
    return (
      <div
        className={this.props.hidden ? "card mb-2 d-none" : "card mb-2 d-block"}
      >
        <div className="card-body">
          <ErrorModal
            isVisible={this.state.errorModalVisible}
            onModalClose={this.handleErrorModalClose}
          >
            {this.state.errorModalBody}
          </ErrorModal>
          <SecureConfirmationModal
            isVisible={this.state.secureConfirmModalVisible}
            onModalCancel={this.handlePublishCancel}
            onModalConfirm={this.handleConfirmPublish}
          >
            {this.state.secureConfirmModalBody}
          </SecureConfirmationModal>
          <SuccessModal
            isVisible={this.state.successModalVisible}
            onModalClose={this.handleSuccessModalClose}
          >
            {this.state.successModalBody}
          </SuccessModal>
          <h3 className="card-title text-center">Create a New HIT</h3>
          <div className="mt-2">
            <h4 className="border-bottom my-3">Description</h4>
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
            <h4 className="border-bottom my-3">Questions</h4>
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
            <h4 className="border-bottom my-3">General Survey Configuration</h4>
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
                reverse order to remove some bias. It will double the cost of
                the survey.
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
            <div className="form-group">
              <label>Estimated survey duration</label>
              <DurationPicker
                initialDurationInSeconds={this.state.surveyDuration}
                minDurationInSeconds={30}
                maxDurationInSeconds={Math.floor(86399)}
                onDurationChange={this.handleSurveyDurationChange}
              />
              <small className="form-text text-muted">
                The estimated time the assignment should take. The time is
                doubled to produce the maximum time until a survey is considered
                abandoned and is able to be taken by another worker.
              </small>
            </div>
            <div className="form-group">
              <label>Survey lifetime</label>
              <DurationPicker
                initialDurationInSeconds={this.surveyLifetimeDuration}
                minDurationInSeconds={70}
                onDurationChange={this.handleSurveyLifetimeChange}
              />
              <small className="form-text text-muted">
                The time in which the survey has reached its deadline and no
                more workers can be assigned to it.
              </small>
            </div>
            <AssignmentReward
              surveyDuration={this.state.surveyDuration}
              assignmentReward={this.state.assignmentReward}
              onRewardChange={this.handleRewardChange}
            />
            {this.displayAssignmentRewardWarning()}
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
            {this.displayAssignmentsPerHITWarning()}
            <h4 className="border-bottom my-3">Survey Qualifications</h4>
            <div className="form-group">
              <label>HIT Approval Rating</label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">Greater than</span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  value={this.state.hitApprovalRatingQualificationValue}
                  onFocus={this.handleApprovalRatingInputFocus}
                  onChange={this.handleApprovalRatingInputChange}
                  onBlur={this.handleApprovalRatingInputBlur}
                />
              </div>
              <small className="form-text text-muted">
                This qualification restricts the survey to workers who meet a
                certain HIT approval rating threshold. Note that the approval
                rating of workers who submitted less than 100 assignments is
                defaulted to 100%.
              </small>
            </div>
            <div className="form-group">
              <label>Number of completed HITs</label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">Greater than</span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  value={this.state.hitCompletionAmountQualificationValue}
                  onChange={this.handleHITCompletionAmountChange}
                  onBlur={this.handleHITCompletionAmountBlur}
                />
              </div>
              <small className="form-text text-muted">
                This qualification restricts the survey to workers who have
                completed a certain amount of HITs.
              </small>
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
