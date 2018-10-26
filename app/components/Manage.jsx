import React, { Component } from "react";
import ErrorModal from "./ErrorModal";
import { MTurk } from "aws-sdk";
import { Chart, Axis, Series, Cursor, Tooltip, Bar } from "react-charts";
import Utils from "../Utils";

class Manage extends Component {
  state = {
    surveyData: {},
    cachedSurveyResults: [],
    selectedSurveyID: "",
    errorModalVisible: false,
    errorModalBody: ""
  };

  handleSurveyRowSelect = hitID => {
    if (!(hitID in this.state.cachedSurveyResults)) {
      try {
        const mturk = this.props.getAPIInstance();
        mturk.ListAssignmentsForHIT({ HITId: hitID }, (err, data) => {
          if (err) {
            // TODO add error box instead of modal for the survey data
            console.log("err" + err.message);
          } else {
            let newSurveyData = JSON.parse(
              JSON.stringify(this.state.surveyData)
            );
            newSurveyData[hitID] = data.Assignments;
            this.setState({
              surveyData: newSurveyData
            });
          }
        });
      } catch (err) {
        console.log("error: " + err.message);
      }
    }
    this.setState({ selectedSurveyID: hitID });
  };

  getSelectedSurveyData = () => {
    if (this.state.selectedSurveyID.length > 0) {
      selectedSurveyAssignments = this.state.cachedSurveyResults[
        selectedSurveyID
      ];

      return (
        <Chart
          data={[
            {
              label: "Question 1",
              data: [[15], [5]]
            },
            {
              label: "Question 2",
              data: [[5], [15]]
            },
            {
              label: "Question 3",
              data: [[3], [17]]
            },
            {
              label: "Question 4",
              data: [[7], [13]]
            },
            {
              label: "Question 5",
              data: [[4], [16]]
            }
          ]}
        >
          <Axis primary type="ordinal" position="left" />
          <Axis type="linear" stacked position="bottom" />
          <Series type={Bar} />
          <Cursor primary />
          <Cursor />
          <Tooltip />
        </Chart>
      );
    } else {
      return null;
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
      return this.state.surveyData.map((hit, index) => {
        const pending = hit.NumberOfAssignmentsPending;
        const completed = hit.NumberOfAssignmentsCompleted;
        const remaining = hit.NumberOfAssignmentsAvailable;
        const total = hit.MaxAssignments;

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
              <div className="text-right">
                Completed: <strong>{completed}</strong>
              </div>
              <div className="text-right">
                Pending: <strong>{pending}</strong>
              </div>
              <div className="text-right">
                Remaining: <strong>{remaining}</strong>
              </div>
            </td>
          </tr>
        );
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
          this.setState({
            surveyData: data.HITs,
            selectedSurveyID: "",
            cachedSurveyResults: {}
          });
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
      <div className={this.props.hidden ? "card d-none" : "card d-block"}>
        <div className="card-body">
          <ErrorModal
            isVisible={this.state.errorModalVisible}
            onModalClose={this.handleErrorModalClose}
          >
            {this.state.errorModalBody}
          </ErrorModal>
          <h3 className="card-title text-center">Manage Surveys</h3>
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
          {getSelectedSurveyData()}
        </div>
      </div>
    );
  }
}

export default Manage;
