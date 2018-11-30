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

/**
 * This major component handles the management aspect of the SurveyGenerator. It can list infromation about
 * existing surveys, as well as delete expired ones. It can also display the results of the survey on
 * a bar chart.
 */
class Manage extends Component {
  state = {
    /**
     * Array containing every HIT object returned from the mturk.listHITs(..) function. It may
     * contain two array elements for one survey (in the case of "reverse assignment" surveys); however,
     * the two array elements will have the same HITTypeId's.
     */
    surveyData: [],
    /**
     * Dictionary whose key is a hit ID and whose value is the data object returned from
     * mturk.listAssignmentsForHIT(..). The values are cached so that it does not have to
     * use up API credits for pointlessly repeated operations.
     */
    cachedSurveyResults: {},
    /** String that defines the survey ID that the user has selected from the listed surveys table */
    selectedSurveyID: "",
    /** Bool that toggles the visiblity of the error modal. This is set to true when some sort of
     * error occurs.
     */
    errorModalVisible: false,
    /** The content of the error modal. This is changed to some sort of error message when an error
     * occurs
     */
    errorModalBody: ""
  };

  /**
   * Event handler for when a survey is selected from the surveys table. It will load the results of the HIT
   * by either calling the mturk API (mturk.listAssignmentsForHIT()) or by using a cached result of it if
   * available.
   *
   * @param {string} hitID the HIT ID that the user has selected.
   */
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

  /**
   * This function will add the results of a given HIT to the global results parameter. It is done in this
   * way so that "reversed assignment" surveys can be added to some "global results" field/parameter so
   * that the results of both HITs can be merged together for data visualization.
   *
   * @param {string} surveyID the hit ID of the survey whose assignments are to be proccessed and
   * merged with the globalResults parameter
   * @param {boolean} reversedAssignment a boolean that tells the function whether the given surveyID is from
   * a reversed HIT for a reversed assignment survey. This is needed so that the function knows how the
   * HIT results can be merged into the global results parameter
   * @param {*} globalResults A list of objects that currently contains, or will eventually contain,
   * every question of the survey. The class of the objects in this list is the same that is used for
   * Recharts for visualizing the results in a bar chart.
   */
  getResultsFromCachedAssignment = (
    surveyID,
    reversedAssignment,
    globalResults
  ) => {
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
          // If it is the reversed assignment, then iterate through the array backwards
          for (let a = answers.length - 1; a >= 0; a--) {
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
        } else {
          // If it is not the reversed assignment, then iterate through the array normally
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
      }
      return true;
    } else {
      return false;
    }
  };

  /**
   * Returns the HTML elements of the currently selected survey. It will typically contain a bar chart.
   * If no surveys are selected from the survey table or if the survey does not yet have results, then
   * it will return a bootstrap alert box saying so. If the results of the currently selected hit are still
   * being loaded, then it will return a font-awesome loading spinner.
   */
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

  /**
   * Returns the React HTML elements associated with the table that lists every survey/HIT.
   */
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

  /**
   * Event handler for when the user clicks the "Refresh" button. It will clear the survey data cache and
   * will make another call to mturk.listHITs function to refresh the manage page.
   */
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

  /**
   * Event handler for when the user has selected a survey from the survey table and then clicked the
   * delete button. It will call mturk.deleteHIT for the currently selected survey hit ID as well has
   * any other survey with the same HITTypeId as the on selected (this is to ensure that both HITs are deleted
   * for reversed assignment surveys).
   */
  handleDeleteSurvey = () => {
    try {
      const mturk = this.props.getAPIInstance();
      mturk.deleteHIT({ HITId: this.state.selectedSurveyID }, err => {
        if (err) {
          this.setState({
            errorModalBody: (
              <div>
                <strong className="text-center">
                  There was problem deleting the survey:
                </strong>
                <p>{err.message}</p>
              </div>
            ),
            errorModalVisible: true
          });
        } else {
          let newSurveyData = JSON.parse(JSON.stringify(this.state.surveyData));

          //Delete the second survey of a reversed survey if it exists
          for (let i = 0; i < newSurveyData.length; i++) {
            if (newSurveyData[i].HITId == this.state.selectedSurveyID) {
              let hitTypeId = newSurveyData[i].HITTypeId;
              for (let n = 0; n < newSurveyData.length; n++) {
                if (newSurveyData[i].HITTypeId == hitTypeId) {
                  mturk.deleteHIT(
                    { HITId: this.state.selectedSurveyID },
                    err => {
                      if (err) {
                        this.setState({
                          errorModalBody: (
                            <div>
                              <strong className="text-center">
                                There was problem deleting the 2nd hit of a
                                reversed survey (Recommend refreshing the survey
                                list):
                              </strong>
                              <p>{err.message}</p>
                            </div>
                          ),
                          errorModalVisible: true
                        });
                      } else {
                        newSurveyData.splice(n, 1);
                        this.setState({
                          surveyData: newSurveyData
                        });
                      }
                    }
                  );
                  break;
                }
              }
              break;
            }
          }

          //Remove the selected survey from the list
          for (let i = 0; i < newSurveyData.length; i++) {
            if (newSurveyData[i].HITId == this.state.selectedSurveyID) {
              this.splice(i, 1);
              break;
            }
          }
          this.setState({
            selectedSurveyID: "",
            surveyData: newSurveyData
          });
        }
      });
    } catch (err) {
      this.setState({
        errorModalBody: (
          <div>
            <strong className="text-center">
              There was problem deleting the survey:
            </strong>
            <p>{err.message}</p>
          </div>
        ),
        errorModalVisible: true
      });
    }
  };

  /**
   * Event handler for when the error modal component is closed.
   */
  handleErrorModalClose = () => {
    this.setState({ errorModalVisible: false, errorModalBody: "" });
  };

  /**
   * Render function for React.Component. Returns the HTML elements that represent the Manage component.
   */
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
          <button
            className="btn btn-danger"
            disabled={
              this.state.selectedSurveyID == "" ||
              this.state.surveyData.filter(hitData => {
                hitData.HITId == this.state.selectedSurveyID;
              }).length > 0
            }
            onClick={this.handleDeleteSurvey}
          >
            Delete
          </button>
          <h5 className="border-bottom my-3">Selected Survey</h5>
          {this.getSelectedSurveyData()}
        </div>
      </div>
    );
  }
}

export default Manage;
