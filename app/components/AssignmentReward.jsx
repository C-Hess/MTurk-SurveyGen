import React, { Component } from "react";

class AssignmentReward extends Component {
  state = {
    recommendReward: true,
    cachedNumOfQuestions: 0
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      prevState.cachedNumOfQuestions != nextProps.numOfQuestions &&
      prevState.recommendReward
    ) {
      const calculatedReward = AssignmentReward.calculateAssignmentReward(
        nextProps.numOfQuestions
      );
      nextProps.onRewardChange(calculatedReward);
      return {
        cachedNumOfQuestions: nextProps.numOfQuestions
      };
    }
    return null;
  }

  static calculateAssignmentReward = numOfQuestions => {
    return (
      Math.round(numOfQuestions * 1.5 * 0.108333333 * 1.25 * 100) / 100
    ).toFixed(2);
  };

  handleRewardChange = e => {
    this.props.onRewardChange(e.target.value);
  };

  handleRecommendCheckboxChange = e => {
    this.setState({ recommendReward: e.target.checked });
    if (e.target.checked) {
      const newReward = AssignmentReward.calculateAssignmentReward(
        this.props.numOfQuestions
      );
      this.setState({
        inputFieldVal: newReward,
        recommendReward: e.target.checked
      });
      this.props.onRewardChange(newReward);
    }
  };

  handleRewardBlur = e => {
    let rewardString = e.target.value;
    rewardString = rewardString.replace(/[^.\d]/g, "");
    if (rewardString.startsWith(".")) {
      rewardString = "0" + rewardString;
    }
    if (rewardString.endsWith(".")) {
      rewardString = rewardString.substring(0, rewardString.length - 2);
    }

    if (rewardString == "") {
      rewardString = 0.0;
    }

    let rewardFloat = parseFloat(rewardString);
    if (isNaN(rewardFloat)) {
      rewardFloat = 0;
    }

    rewardFloat = Math.min(100, rewardFloat);

    rewardFloat = (Math.round(rewardFloat * 100) / 100).toFixed(2);
    this.props.onRewardChange(rewardFloat);
  };

  render() {
    return (
      <div className="form-group">
        <label>Assignment reward</label>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">$</span>
          </div>
          <input
            type="text"
            className="form-control"
            value={this.props.assignmentReward}
            onChange={this.handleRewardChange}
            onBlur={this.handleRewardBlur}
            readOnly={this.state.recommendReward}
          />
        </div>
        <div className="form-group">
          <div className="form-check">
            <label className="form-check-label">
              <input
                className="form-check-input"
                type="checkbox"
                checked={this.state.recommendReward}
                onChange={this.handleRecommendCheckboxChange}
              />
              Use recommended reward
            </label>
          </div>
        </div>
      </div>
    );
  }
}

export default AssignmentReward;
