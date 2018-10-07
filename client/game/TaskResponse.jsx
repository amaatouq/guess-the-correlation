import React from "react";
import Slider from "meteor/empirica:slider";
import {
  HTMLTable,
  Button,
  Callout,
  FormGroup,
  Label,
  RangeSlider
} from "@blueprintjs/core";

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
      <Callout title={"Waiting on other players..."} icon={"automatic-updates"}>
        Please wait until all players are ready
      </Callout>
    );
  };

  renderCurrentGuess = player => {
    return (
      <Label>
        Your current guess of the correlation is: {player.round.get("guess")}
      </Label>
    );
  };

  renderSlider(player, round, isOutcome) {
    const guess = player.round.get("guess");
    const correctAnswer = round.get("task").correctAnswer;
    return (
      <FormGroup>
        {isOutcome ? (
          <RangeSlider
            className={"range-slider"}
            disabled={true}
            min={0}
            max={1}
            stepSize={0.01}
            labelStepSize={0.25}
            value={[guess, correctAnswer].sort()}
          />
        ) : (
          <Slider
            min={0}
            max={1}
            stepSize={0.01}
            labelStepSize={0.25}
            onChange={this.handleChange}
            value={guess}
            disabled={isOutcome}
            hideHandleOnEmpty
          />
        )}
      </FormGroup>
    );
  }

  renderFeedback = (player, round) => {
    return (
      <div>
        <HTMLTable className="pt-table  pt-html-table pt-html-table-bordered">
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
        </HTMLTable>
      </div>
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
          <FormGroup>
            {!isOutcome ? this.renderCurrentGuess(player) : null}
            {this.renderSlider(player, round, isOutcome)}
          </FormGroup>

          {isOutcome && feedbackTime
            ? this.renderFeedback(player, round)
            : null}

          <FormGroup>
            <Button type="submit" icon={"tick"} large={true} fill={true}>
              {isOutcome ? "Next" : "Submit"}
            </Button>
          </FormGroup>
        </form>
      </div>
    );
  }
}
