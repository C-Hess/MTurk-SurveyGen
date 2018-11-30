import React, { Component } from "react";

/**
 * Subcomponent that handles the assignment reward field for the Create component.
 */
class AssignmentReward extends Component {
  state = {
    /**
     * User inputted bool/checkbox that tells whether or not the assignment reward should be generated
     * automatically, or if it should be defined by the user's custom input instead.
     */
    recommendReward: false,
    /**
     * Cached field containing the number of questions that have been added to the Create component. It
     * is used to see if the number of questions has been changed, and if the assignment reward should
     * be updated accordingly.
     */
    cachedNumOfQuestions: 0
  };

  /**
   * Function from React.Component that derives the state of the AssignmentReward component from the props
   * it has received from the parent component (in this case, the Create component).
   *
   * @param {*} nextProps the new properties that are about to be passed to this component.
   * @param {*} prevState the previous state of this component.
   */
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

  /**
   * Static method that calculates the assignment reward automatically using an equation.
   * Currently, it assumes every question would take 1 and a half minutes long at a rate of
   * $6.50 an hour.
   *
   * @param {number} numOfQuestions the number of questions that are in the HIT.
   * @returns {string} Decimal string containing the automatically calculated assignment reward
   * rounded to the nearest hundredths.
   */
  static calculateAssignmentReward = numOfQuestions => {
    return (Math.round(numOfQuestions * 16.25) / 100).toFixed(2);
  };

  /**
   * Event handler for when the "Recommend reward" checkbox has been changed.
   */
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

  /**
   * Event handler for when the assignment reward field has been changed by the user.
   */
  handleRewardChange = e => {
    this.props.onRewardChange(e.target.value);
  };

  /**
   * Event handler for when the assignment reward field has been "finalized" by the user (in other words,
   * when the field is unfocused).
   */
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

  /**
   * Render function for React.Component. Returns the HTML elements that define the assignment
   * reward component.
   */
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
