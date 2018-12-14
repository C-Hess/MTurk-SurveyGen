import React, { Component } from "react";

class DurationPicker extends Component {
  state = {
    userInputSeconds: this.getSeconds(this.props.initialDurationInSeconds),
    userInputMinutes: this.getMinutes(this.props.initialDurationInSeconds),
    userInputHours: this.getHours(this.props.initialDurationInSeconds)
  };

  getSeconds(durationInSeconds) {
    if (durationInSeconds && !isNaN(durationInSeconds)) {
      return ("" + ((durationInSeconds % 3600) % 60)).padStart(2, "0");
    } else {
      return "00";
    }
  }

  getMinutes(durationInSeconds) {
    if (durationInSeconds && !isNaN(durationInSeconds)) {
      return ("" + (Math.floor(durationInSeconds / 60) % 60)).padStart(2, "0");
    } else {
      return "00";
    }
  }

  getHours(durationInSeconds) {
    if (durationInSeconds && !isNaN(durationInSeconds)) {
      return ("" + Math.floor(durationInSeconds / 3600)).padStart(2, "0");
    } else {
      return "00";
    }
  }

  handleHourChange = e => {
    this.setState({ userInputHours: e.target.value });
  };

  handleMinuteChange = e => {
    this.setState({ userInputMinutes: e.target.value });
  };

  handleSecondChange = e => {
    this.setState({ userInputSeconds: e.target.value });
  };

  handleDurationBlur = e => {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (
      !isNaN(parseFloat(this.state.userInputHours)) &&
      parseFloat(this.state.userInputHours) >= 0
    ) {
      hours = parseFloat(this.state.userInputHours);
    }

    if (
      !isNaN(parseFloat(this.state.userInputMinutes)) &&
      parseFloat(this.state.userInputMinutes) >= 0
    ) {
      minutes = parseFloat(this.state.userInputMinutes);
    }

    if (
      !isNaN(parseFloat(this.state.userInputSeconds)) &&
      parseFloat(this.state.userInputSeconds) >= 0
    ) {
      seconds = parseFloat(this.state.userInputSeconds);
    }

    let durationInSeconds = Math.round(hours * 3600 + minutes * 60 + seconds);

    if (this.props.maxDurationInSeconds) {
      durationInSeconds = Math.min(
        durationInSeconds,
        this.props.maxDurationInSeconds
      );
    }

    if (this.props.minDurationInSeconds) {
      durationInSeconds = Math.max(
        durationInSeconds,
        this.props.minDurationInSeconds
      );
    }

    this.setState({
      userInputSeconds: this.getSeconds(durationInSeconds),
      userInputMinutes: this.getMinutes(durationInSeconds),
      userInputHours: this.getHours(durationInSeconds)
    });

    this.props.onDurationChange(durationInSeconds);
  };

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-2">
            <input
              type="text"
              className="form-control text-center"
              value={this.state.userInputHours}
              onChange={this.handleHourChange}
              onBlur={this.handleDurationBlur}
            />
          </div>
          <div className="col-sm-2">
            <input
              type="text"
              className="form-control text-center"
              value={this.state.userInputMinutes}
              onChange={this.handleMinuteChange}
              onBlur={this.handleDurationBlur}
            />
          </div>
          <div className="col-sm-2">
            <input
              type="text"
              className="form-control text-center"
              value={this.state.userInputSeconds}
              onChange={this.handleSecondChange}
              onBlur={this.handleDurationBlur}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-2">
            <div className="form-text text-center">hours</div>
          </div>
          <div className="col-sm-2">
            <div className="form-text text-center">minutes</div>
          </div>
          <div className="col-sm-2">
            <div className="form-text text-center">seconds</div>
          </div>
        </div>
      </div>
    );
  }
}

export default DurationPicker;
