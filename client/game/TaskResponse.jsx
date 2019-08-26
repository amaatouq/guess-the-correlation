import React from "react";
import Slider from "meteor/empirica:slider";
import {
  HTMLTable,
  Button,
  Callout,
  FormGroup,
  Label,
  Toaster,
  Position,
  RangeSlider
} from "@blueprintjs/core";
import { StageTimeWrapper } from "meteor/empirica:core";

const WarningToaster = Toaster.create({
  className: "warning-toaster",
  position: Position.TOP
});

//timed button
const TimedButton = StageTimeWrapper(props => {
  const { onClick, activateAt, remainingSeconds, stage } = props;

  const disabled = remainingSeconds > activateAt;
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      intent={disabled ? "danger" : "primary"}
      small={false}
      type={"button"}
      fill={true}
    >
      {disabled
        ? "Wait for " +
          Math.abs(remainingSeconds - activateAt) +
          "s at least before submitting"
        : stage.name === "outcome"
        ? "Next"
        : "Submit"}
    </Button>
  );
});

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
    const { stage, player } = this.props;
    if (stage.name !== "outcome") {
      const value = Math.round(num * 100) / 100;
      //this.setState({ guess: value });
      // this.throttledGuessUpdate(value);
      player.round.set("guess", value);
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
    const { stage, player } = this.props;
    const guess = player.round.get("guess");

    if (stage.name === "outcome") {
      player.stage.submit();
      return;
    }
    if (guess === null) {
      WarningToaster.show({
        message: "Please make a guess first using the slider."
      });
    } else {
      this.props.player.stage.submit();
    }
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
            value={player.round.get("guess")}
            disabled={isOutcome}
            hideHandleOnEmpty
          />
        )}
      </FormGroup>
    );
  }

  renderFeedback = (player, round) => {
    const { game } = this.props;
    const peersFeedback = game.treatment.peersFeedback;

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
                {player.round.get("guess") === null
                  ? "No guess given"
                  : player.round.get("guess")}
              </td>
              <td>{round.get("task").correctAnswer}</td>
              <td>
                <strong
                  style={{
                    color: peersFeedback
                      ? player.round.get("scoreColor")
                      : "black"
                  }}
                >
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
    const { game, stage, round, player } = this.props;
    //todo: add this back after the experiment

    //if the player already submitted, don't show the slider or submit button
    if (player.stage.submitted) {
      return this.renderSubmitted();
    }
    const feedbackTime = round.get("displayFeedback");
    const isOutcome = stage.name === "outcome";
    const selfFeedback = game.treatment.selfFeedback;

    return (
      <div className="task-response">
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            {!isOutcome ? this.renderCurrentGuess(player) : null}
            {this.renderSlider(player, round, isOutcome)}
          </FormGroup>

          {/*We only show self feedback if it is feedback time & we show individual feedback & it is outcome*/}
          {isOutcome && feedbackTime && selfFeedback
            ? this.renderFeedback(player, round)
            : null}

          <FormGroup>
            <TimedButton
              stage={stage}
              player={player}
              activateAt={26}
              onClick={this.handleSubmit}
            />

            {/*<Button type="submit" icon={"tick"} large={true} fill={true}>*/}
            {/*  {isOutcome ? "Next" : "Submit"}*/}
            {/*</Button>*/}
          </FormGroup>
        </form>
      </div>
    );
  }
}
