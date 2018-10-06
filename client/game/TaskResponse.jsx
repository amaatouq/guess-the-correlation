import React from "react";
import Slider from "meteor/empirica:slider";

export default class TaskResponse extends React.Component {
  handleChange = num => {
    const { stage, player } = this.props;
    if (stage.name !== "outcome") {
      const value = Math.round(num * 100) / 100;
      player.stage.set("guess", value);
      player.round.set("guess", value);
    }
  };

  handleSubmit = event => {
    event.preventDefault();
    this.props.player.stage.submit();
  };

  renderSubmitted = () => {
    return (
      <div className="task-response">
        <div className="pt-callout pt-icon-automatic-updates">
          <h5>Waiting on other players...</h5>
          Please wait until all players are ready
        </div>
      </div>
    );
  };

  renderCurrentGuess = player => {
    return (
      <label className="pt-label">
        Your current guess of the correlation is: {player.round.get("guess")}
      </label>
    );
  };

  renderSlider(player, isOutcome) {
    const guess = player.round.get("guess");
    return (
      <div className="pt-form-content">
        <Slider
          min={0}
          max={1}
          stepSize={0.01}
          labelStepSize={0.25}
          onChange={this.handleChange}
          value={value}
          hideHandleOnEmpty
        />
      </div>
    );
  }

  renderFeedback = (player, round) => {
    return (
      <table className="pt-table  pt-html-table pt-html-table-bordered">
        <thead>
          <tr>
            <th>Your guess</th>
            <th>Actual correlation</th>
            <th>Score increment</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td align="center">
              {player.round.get("guess") || "No guess given"}
            </td>
            <td>{round.get("task").correctAnswer}</td>
            <td>
              <strong style={{ color: player.round.get("scoreColor") }}>
                +{player.round.get("score")}
              </strong>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  render() {
    const { stage, round, player } = this.props;
    const feedbackTime = round.get("displayFeedback");

    //if the player already submitted, don't show the slider or submit button
    if (player.stage.submitted) {
      return this.renderSubmitted();
    }

    const isOutcome = stage.name === "outcome";

    return (
      <div className="task-response">
        <form onSubmit={this.handleSubmit}>
          <div className="pt-form-group">
            {!isOutcome ? this.renderCurrentGuess(player) : null}
            {this.renderSlider(player, isOutcome)}
          </div>

          {isOutcome && feedbackTime
            ? this.renderFeedback(player, round)
            : null}

          <div className="pt-form-group">
            <button type="submit" className="pt-button pt-icon-tick pt-large">
              {isOutcome ? "Next" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    );
  }
}
