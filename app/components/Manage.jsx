import React, { Component } from "react";
import ErrorModal from "./ErrorModal";
import { MTurk } from "aws-sdk";
import Utils from "../Utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
  ResponsiveContainer
} from "recharts";

class Manage extends Component {
  state = {
    surveyData: [],
    cachedSurveyResults: {},
    selectedSurveyID: "",
    errorModalVisible: false,
    errorModalBody: ""
  };

  handleSurveyRowSelect = hitID => {
    if (!(hitID in this.state.cachedSurveyResults)) {
      const mturk = this.props.getAPIInstance();
      mturk.listAssignmentsForHIT({ HITId: hitID }, (err, data) => {
        if (err) {
          this.setState({
            errorModalVisible: true,
            errorModalBody: (
              <div>
                <strong className="text-center">
                  There was problem gathering survey information:
                </strong>
                <p>{err.message}</p>
              </div>
            )
          });
        } else {
          let newCachedSurveyResults = JSON.parse(
            JSON.stringify(this.state.cachedSurveyResults)
          );
          newCachedSurveyResults[hitID] = data.Assignments;
          this.setState({
            cachedSurveyResults: newCachedSurveyResults
          });

          let selectedHit;
          for (let i = 0; i < this.state.surveyData.length; i++) {
            if (this.state.surveyData[i].HITId == this.state.selectedSurveyID) {
              selectedHit = this.state.surveyData[i];
            }
          }

          for (let i = 0; i < this.state.surveyData.length; i++) {
            let otherHit = this.state.surveyData[i];
            if (
              otherHit.HITId != selectedHit.HITId &&
              otherHit.HITTypeId == selectedHit.HITTypeId
            ) {
              if (selectedHit.CreationTime < otherHit.CreationTime) {
                mturk.listAssignmentsForHIT(
                  { HITId: otherHit.HITId },
                  (err, data) => {
                    if (err) {
                      this.setState({
                        errorModalVisible: true,
                        errorModalBody: (
                          <div>
                            <strong className="text-center">
                              There was problem gathering survey information:
                            </strong>
                            <p>{err.message}</p>
                          </div>
                        )
                      });
                    } else {
                      let newCachedSurveyResults = JSON.parse(
                        JSON.stringify(this.state.cachedSurveyResults)
                      );
                      newCachedSurveyResults[otherHit.HITId] = data.Assignments;
                      this.setState({
                        cachedSurveyResults: newCachedSurveyResults
                      });
                    }
                  }
                );
              } else {
                console.error("Impossible condition reached.");
              }
            }
          }
        }
      });
    }
    this.setState({ selectedSurveyID: hitID });
  };

  getResultsFromCachedAssignment(surveyID, reversedAssignment, globalResults) {
    const surveyAssignments = this.state.cachedSurveyResults[surveyID];
    if (surveyAssignments != null) {
      let xmlParser = new DOMParser();

      for (let i = 0; i < surveyAssignments.length; i++) {
        const assignment = surveyAssignments[i];
        const answerDoc = xmlParser.parseFromString(
          assignment.Answer,
          "text/xml"
        );

        const answers = answerDoc.getElementsByTagName("Answer");
        if (reversedAssignment) {
          answers.reverse();
        }
        for (let a = 0; a < answers.length; a++) {
          const answerElement = answers[a];
          const identifier = answerElement.getElementsByTagName(
            "QuestionIdentifier"
          )[0].firstChild.nodeValue;
          const answer = answerElement.getElementsByTagName("FreeText")[0]
            .firstChild.nodeValue;
          const identRegMatch = identifier.match(/([a-zA-Z]+)(\d+)/);
          const formattedIdentifier =
            identRegMatch[1].charAt(0).toUpperCase() +
            identRegMatch[1].substring(1) +
            " " +
            (parseInt(identRegMatch[2]) + 1);
          let controlVal = 0;
          let experimentalVal = 0;
          if (answer == "c") {
            controlVal = 1;
          } else if (answer == "e") {
            experimentalVal = 1;
          }

          let newQuestionFound = true;
          for (let n = 0; n < globalResults.length; n++) {
            if (globalResults[n].name == formattedIdentifier) {
              globalResults[n].Control += controlVal;
              globalResults[n].Experimental += experimentalVal;
              newQuestionFound = false;
            }
          }
          if (newQuestionFound) {
            globalResults.push({
              name: formattedIdentifier,
              Control: controlVal,
              Experimental: experimentalVal
            });
          }
        }
      }
      return true;
    } else {
      return false;
    }
  }

  getSelectedSurveyData = () => {
    if (this.state.selectedSurveyID.length > 0) {
      let globalResults = [];
      if (
        !this.getResultsFromCachedAssignment(
          this.state.selectedSurveyID,
          false,
          globalResults
        )
      ) {
        // Loading data
        return (
          <div className="text-center">
            <i className="fas fa-sync fa-spin" />
          </div>
        );
      }
      let selectedHit;
      for (let i = 0; i < this.state.surveyData.length; i++) {
        if (this.state.surveyData[i].HITId == this.state.selectedSurveyID) {
          selectedHit = this.state.surveyData[i];
        }
      }

      for (let i = 0; i < this.state.surveyData.length; i++) {
        let otherHit = this.state.surveyData[i];
        if (
          otherHit.HITId != selectedHit.HITId &&
          otherHit.HITTypeId == selectedHit.HITTypeId
        ) {
          if (
            !this.getResultsFromCachedAssignment(
              otherHit.HITId,
              true,
              globalResults
            )
          ) {
            // Loading data
            return (
              <div className="text-center">
                <i className="fas fa-sync fa-spin" />
              </div>
            );
          }
        }
      }

      if (globalResults.length == 0) {
        return <div className="alert alert-warning">No responses yet</div>;
      }

      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={globalResults}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false}>
              <Label
                value="# of Responses"
                position="insideLeft"
                style={{ textAnchor: "middle" }}
                angle={-90}
              />
            </YAxis>
            <Tooltip />
            <Legend />
            <Bar dataKey="Control" stackId="a" fill="#2196F3" />
            <Bar dataKey="Experimental" stackId="a" fill="#FF5722" />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return <div className="alert alert-secondary">No survey selected</div>;
    }
  };

  getSurveyTable = () => {
    if (this.state.surveyData.length <= 0) {
      return (
        <tr>
          <td className="table-secondary text-center" colSpan="4">
            No surveys found. Try refreshing.
          </td>
        </tr>
      );
    } else {
      return this.state.surveyData.map(hit => {
        let pending = hit.NumberOfAssignmentsPending;
        let completed = hit.NumberOfAssignmentsCompleted;
        let remaining = hit.NumberOfAssignmentsAvailable;
        let total = hit.MaxAssignments;

        let addRow = true;

        for (let i = 0; i < this.state.surveyData.length; i++) {
          let otherHit = this.state.surveyData[i];
          if (
            otherHit.HITId != hit.HITId &&
            otherHit.HITTypeId == hit.HITTypeId
          ) {
            if (hit.CreationTime < otherHit.CreationTime) {
              pending += otherHit.NumberOfAssignmentsPending;
              completed += otherHit.NumberOfAssignmentsCompleted;
              remaining += otherHit.NumberOfAssignmentsAvailable;
              total += otherHit.MaxAssignments;
            } else {
              addRow = false;
            }
          }
        }
        if (addRow) {
          return (
            <tr
              key={hit.HITId}
              className={
                hit.HITId == this.state.selectedSurveyID ? "table-active" : ""
              }
              onClick={() => this.handleSurveyRowSelect(hit.HITId)}
            >
              <td>{hit.Title}</td>
              <td>{hit.Description}</td>
              <td>
                {hit.CreationTime.toLocaleString("en-US", {
                  month: "short",
                  year: "numeric",
                  day: "numeric"
                }) +
                  " " +
                  hit.CreationTime.toLocaleTimeString()}
              </td>
              <td>
                <div className="progress">
                  <div
                    className="progress-bar bg-warning"
                    style={{
                      width: Utils.asPercentString(remaining / total)
                    }}
                  >
                    {remaining > 0 && remaining}
                  </div>
                  <div
                    className="progress-bar"
                    style={{
                      width: Utils.asPercentString(pending / total)
                    }}
                  >
                    {pending > 0 && pending}
                  </div>
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: Utils.asPercentString(completed / total)
                    }}
                  >
                    {completed > 0 && completed}
                  </div>
                </div>
                <div className="text-right text-nowrap">
                  Completed: <strong>{completed}</strong>
                </div>
                <div className="text-right text-nowrap">
                  Pending: <strong>{pending}</strong>
                </div>
                <div className="text-right text-nowrap">
                  Remaining: <strong>{remaining}</strong>
                </div>
              </td>
            </tr>
          );
        }
      });
    }
  };

  handleRefresh = () => {
    try {
      const mturk = this.props.getAPIInstance();
      mturk.listHITs({}, (err, data) => {
        if (err) {
          this.setState({
            errorModalBody: (
              <div>
                <strong className="text-center">
                  There was problem refreshing:
                </strong>
                <p>{err.message}</p>
              </div>
            ),
            errorModalVisible: true
          });
        } else {
          let selectedSurveyIDExists = false;
          for (let i = 0; i < data.HITs.length; i++) {
            if (data.HITs[i].HITId == this.state.selectedSurveyID) {
              selectedSurveyIDExists = true;
            }
          }
          this.setState({
            surveyData: data.HITs,
            cachedSurveyResults: {}
          });
          if (selectedSurveyIDExists) {
            this.handleSurveyRowSelect(this.state.selectedSurveyID);
          }
        }
      });
    } catch (err) {
      this.setState({
        errorModalBody: (
          <div>
            <strong className="text-center">
              There was problem refreshing:
            </strong>
            <p>{err.message}</p>
          </div>
        ),
        errorModalVisible: true
      });
    }
  };

  handleErrorModalClose = () => {
    this.setState({ errorModalVisible: false, errorModalBody: "" });
  };

  render() {
    return (
      <div className={this.props.hidden ? "card d-none" : "card d-block mb-2"}>
        <div className="card-body">
          <ErrorModal
            isVisible={this.state.errorModalVisible}
            onModalClose={this.handleErrorModalClose}
          >
            {this.state.errorModalBody}
          </ErrorModal>
          <h3 className="card-title text-center">Manage Surveys</h3>
          <h5 className="border-bottom my-3">All Surveys</h5>
          <button className="btn btn-primary" onClick={this.handleRefresh}>
            Refresh
            <i className="fas fa-sync-alt ml-3" />
          </button>
          <table
            className={
              this.state.surveyData.length <= 0
                ? "table table-bordered mt-2"
                : "table table-hover table-bordered mt-2"
            }
          >
            <thead className="thead-dark">
              <tr>
                <th scope="col">Survey Title</th>
                <th scope="col">Description</th>
                <th scope="col">Created On</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>{this.getSurveyTable()}</tbody>
          </table>
          <h5 className="border-bottom my-3">Selected Survey</h5>
          {this.getSelectedSurveyData()}
        </div>
      </div>
    );
  }
}

export default Manage;
