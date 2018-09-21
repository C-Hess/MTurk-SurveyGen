import React, { Component } from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

class Create extends Component {
  state = {
    questionPairs: [],
    selectedQuestionPair: -1,
    invalidQuestionInput: false,
    controlInputValue: "",
    experimentalInputValue: ""
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
          <td>{questionPair.controlURL}</td>
          <td>{questionPair.experimentalURL}</td>
        </tr>
      ));
    }
  };

  handleOnQuestionClick = index => {
    this.setState({ selectedQuestionPair: index });
  };

  handleAddQuestionPair = e => {
    e.preventDefault();
    e.stopPropagation();
    if (
      this.state.controlInputValue.length > 0 &&
      this.state.experimentalInputValue.length > 0
    ) {
      const questions = [...this.state.questionPairs];
      questions.push({
        controlURL: this.state.controlInputValue,
        experimentalURL: this.state.experimentalInputValue
      });
      this.setState({ questionPairs: questions, invalidQuestionInput: false });
    } else {
      this.setState({ invalidQuestionInput: true });
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

  render() {
    return (
      <div className="card">
        <div className="card-body">
          <div className="mt-2">
            <form
              className="position-relative"
              onSubmit={this.handleAddQuestionPair}
            >
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text">Enter URLs</span>
                </div>
                <input
                  type="text"
                  className="form-control"
                  name="controlURL"
                  placeholder="Control"
                  value={this.state.controlInputValue}
                  onChange={this.handleControlInputChange}
                />
                <input
                  className="form-control"
                  type="text"
                  name="experimentalURL"
                  placeholder="Experimental"
                  value={this.state.experimentalInputValue}
                  onChange={this.handleExperimentalInputChange}
                />
                <div className="input-group-append">
                  <button className="btn btn-outline-success">Add</button>
                </div>
                {this.state.invalidQuestionInput && (
                  <div className="invalid-tooltip d-block">
                    Must enter valid URL
                  </div>
                )}
              </div>
            </form>
          </div>
          <table className="table table-hover table-bordered mt-2">
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
        </div>
      </div>
    );
  }
}

export default Create;
