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
     * Cached field containing the estimated survey duration. It
     * is used to see if survey duration has changed changed, and if the assignment reward should
     * be updated accordingly.
     */
    cachedSurveyDuration: 0
  };

  /**
   * Function from React.Component that derives the state of the AssignmentReward component from the props
   * it has received from the parent component (in this case, the Create component). It
   * is used to determine if the survey duration has changed and if the assignment reward should
   * be updated accordingly.
   *
   * @param {*} nextProps the new properties that are about to be passed to this component.
   * @param {*} prevState the previous state of this component.
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      prevState.cachedSurveyDuration != nextProps.surveyDuration &&
      prevState.recommendReward
    ) {
      const calculatedReward = AssignmentReward.calculateAssignmentReward(
        nextProps.surveyDuration
      );
      nextProps.onRewardChange(calculatedReward);
      return {
        cachedSurveyDuration: nextProps.surveyDuration
      };
    }
    return null;
  }

  /**
   * Static method that calculates the assignment reward automatically using an equation.
   * Currently, it uses the user estimated survey duration time in seconds and calculates
   * the reward at a rate of $4.50 an hour.
   *
   * @param {number} surveyDuration the estimated duration of the survey in seconds.
   * @returns {string} Decimal string containing the automatically calculated assignment reward
   * rounded to the nearest hundredths.
   */
  static calculateAssignmentReward = surveyDuration => {
    return (Math.round(surveyDuration * (4.5 / 3600) * 100) / 100).toFixed(2);
  };

  /**
   * Event handler for when the "Recommend reward" checkbox has been changed.
   */
  handleRecommendCheckboxChange = e => {
    this.setState({ recommendReward: e.target.checked });
    if (e.target.checked) {
      const newReward = AssignmentReward.calculateAssignmentReward(
        this.props.surveyDuration
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
    rewardString = rewardString.replace(/[^.-\d]/g, "");
    if (rewardString.startsWith(".")) {
      rewardString = "0" + rewardString;
    }
    if (rewardString.endsWith(".")) {
      rewardString = rewardString.substring(0, rewardString.length - 2);
    }

    if (rewardString == "" || isNaN(parseFloat(rewardString)) || parseFloat(rewardString) < 0.01) {
      rewardString = 0.01;
    }

    let rewardFloat = parseFloat(rewardString);

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
        <label>Assignment reward per worker</label>
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
