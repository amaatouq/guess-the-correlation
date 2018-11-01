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
  constructor(props) {
    super(props);

    // console.log("player.round._id", this.props.player.round._id);
    //
    // const { player } = this.props;
    //
    // this.throttledGuessUpdate = _.throttle(value => {
    //   player.round.set("guess", value);
    // }, 50);
    //
    // this.state = { guess: null };
  }

  handleChange = num => {
    const { stage,player } = this.props;
    if (stage.name !== "outcome") {
      const value = Math.round(num * 100) / 100;
      //this.setState({ guess: value });
      // this.throttledGuessUpdate(value);
      player.round.set("guess", value)
    }
  };

  handleRelease = num => {
    const { stage, player } = this.props;
    if (stage.name !== "outcome") {
      const value = Math.round(num * 100) / 100;
      //this.setState({ guess: value });
      player.round.set("guess", value);
      player.stage.append("guess", value);
    }
  };

  handleSubmit = event => {
    event.preventDefault();
    this.props.player.stage.submit();
  };

  renderSubmitted = () => {
    return (
      <div className={"task-response"}>
        <Callout
          className={"call-out"}
          title={"Waiting on other players..."}
          icon={"automatic-updates"}
        >
          Please wait until all players are ready
        </Callout>
      </div>
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
    const feedbackTime = round.get("displayFeedback");
    const correctAnswer = round.get("task").correctAnswer;
    return (
      <FormGroup>
        {isOutcome && feedbackTime ? (
          <RangeSlider
            className={"range-slider"}
            disabled={true}
            min={0}
            max={1}
            stepSize={0.01}
            labelStepSize={0.25}
            value={
              player.round.get("guess") === null
                ? [correctAnswer, correctAnswer]
                : [player.round.get("guess"), correctAnswer].sort()
            }
          />
        ) : (
          <Slider
            min={0}
            max={1}
            stepSize={0.01}
            labelStepSize={0.25}
            onChange={this.handleChange}
            onRelease={this.handleRelease}
            value={player.round.get("guess") || undefined}
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
        <HTMLTable>
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
                {player.round.get("guess") === undefined ||
                player.round.get("guess") === null
                  ? "No guess given"
                  : player.round.get("guess")}
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
    //todo: add this back after the experiment
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

          {isOutcome ? this.renderFeedback(player, round) : null}

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
