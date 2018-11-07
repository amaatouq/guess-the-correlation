import React from "react";

import { Centered } from "meteor/empirica:core";
import {
  Button,
  ButtonGroup,
  Card,
  Elevation,
  FormGroup,
  Icon,
  Label
} from "@blueprintjs/core";
import Slider from "meteor/empirica:slider";

const avatarNames = "abcdefghijklmnopqrstuvwxyz".split("");

export default class InteractiveGuessStage extends React.Component {
  handleChange = num => {
    const { player } = this.props;

    const value = Math.round(num * 100) / 100;
    player.set("instructionsGuess", value);
  };

  constructor(props) {
    super(props);
    const { game } = this.props;

    let fakePlayers = {};
    for (let i = 0; i < game.treatment.altersCount; i++) {
      fakePlayers[i] = {
        _id: i,
        avatar: `/avatars/jdenticon/${avatarNames[i]}`,
        initialGuess: 0.7 + Math.random() / 5,
        submitted: false
      };
    }

    this.state = {
      fakePlayers: fakePlayers,
      submitted: false,
      time: {},
      seconds: game.treatment.stageDuration
    };

    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.countDown.bind(this);
  }

  static secondsToTime(secs) {
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    let obj = {
      h: hours,
      m: minutes,
      s: seconds
    };
    return obj;
  }

  componentDidMount() {
    let timeLeftVar = InteractiveGuessStage.secondsToTime(this.state.seconds);
    this.setState({ time: timeLeftVar });
    this.startTimer();
  }
  
  //prevents memory leak: https://egghead.io/lessons/react-stop-memory-leaks-with-componentwillunmount-lifecycle-method-in-react
  componentWillUnmount(){
    clearInterval(this.timer);
    clearInterval(this.countDown);
  }

  startTimer() {
    if (this.timer === 0 && this.state.seconds > 0) {
      this.timer = setInterval(this.countDown, 1000);
    }
  }

  countDown() {
    let seconds = this.state.seconds - 1;

    if (!this.state.submitted) {
      // Remove one second, set state so a re-render happens.
      this.setState({
        time: InteractiveGuessStage.secondsToTime(seconds),
        seconds: seconds
      });
    }

    // Check if we're at zero.
    if (seconds === 0) {
      this.setState({ submitted: true });
    }
  }

  static renderTimer(remainingSeconds) {
    const classes = ["timer"];
    if (remainingSeconds <= 5) {
      classes.push("lessThan5");
    } else if (remainingSeconds <= 10) {
      classes.push("lessThan10");
    }

    return (
      <div className={classes.join(" ")}>
        <h4 className="bp3-heading">Timer</h4>
        <span className="seconds">{remainingSeconds}</span>
      </div>
    );
  }

  handleReset = event => {
    const { game } = this.props;

    event.preventDefault();
    this.setState({ submitted: false });

    for (const [_id, fakePlayer] of Object.entries(this.state.fakePlayers)) {
      fakePlayer.submitted = false;
    }
    this.setState({ seconds: game.treatment.stageDuration });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.setState({ submitted: true });
  };

  componentDidUpdate() {
    //TODO: decided not to make the mockup fake players change values so workers wouldn't think the actual game is with bots
    //check if we want to update or not .. most of the times, we don't want to
    // if (Math.random() > 0.8) {
    //   for (const [_id, fakePlayer] of Object.entries(this.state.fakePlayers)) {
    //     //not everyone updates
    //     if (Math.random() > 0.5 && !fakePlayer.submitted) {
    //       let change = Math.random() / 10.0;
    //       change *= Math.random() * 2 === 1 ? 1 : -1; //make the change + or -
    //       if (fakePlayer.initialGuess + change > 0.99) {
    //         fakePlayer.initialGuess -= 10 * change;
    //       } else if (fakePlayer.initialGuess + change < 0) {
    //         fakePlayer.initialGuess -= 10 * change;
    //       } else {
    //         fakePlayer.initialGuess += change;
    //       }
    //     }
    //   }
    // }
    //
    // if (Math.random() > 0.9) {
    //   for (const [_id, fakePlayer] of Object.entries(this.state.fakePlayers)) {
    //     //not everyone updates
    //     if (Math.random() > 0.8) {
    //       fakePlayer.submitted = true;
    //     }
    //   }
    // }
  }

  renderAlters = () => {
    let altersList = [];

    for (const [_id, fakePlayer] of Object.entries(this.state.fakePlayers)) {
      altersList.push(
        <Card
          className={"alter"}
          elevation={Elevation.TWO}
          key={fakePlayer._id}
        >
          <span className="image">
            <span
              className={`satisfied bp3-tag bp3-round ${
                fakePlayer.submitted
                  ? "bp3-intent-success"
                  : "bp3-intent-primary"
              }`}
            >
              <span
                className={`bp3-icon-standard ${
                  fakePlayer.submitted ? "bp3-icon-tick" : "bp3-icon-refresh"
                }`}
              />
            </span>

            <img src={fakePlayer.avatar} />
          </span>

          <Slider
            min={0}
            max={1}
            stepSize={0.01}
            value={fakePlayer.initialGuess}
            showTrackFill={false}
            disabled
            hideHandleOnEmpty
          />
        </Card>
      );
    }
    return altersList;
  };

  render() {
    const { hasPrev, hasNext, onNext, onPrev, game, player } = this.props;
    const remainingSeconds = this.state.time.s;

    //every game will have at least 1 stage
    let nStages = 1;
    //if there are more than 1 alter, then the game has social interaction
    if (game.treatment.altersCount > 0) {
      nStages += 1;
    }
    //if the game has feedback or is social with either feedback or rewiring (or both) then there will be another stage
    if (
      (game.treatment.altersCount > 0 &&
        (game.treatment.feedbackRate > 0 || game.treatment.rewiring)) ||
      (game.treatment.altersCount === 0 && game.treatment.feedbackRate > 0)
    ) {
      nStages += 1;
    }

    const guess = player.get("instructionsGuess");

    return (
      <Centered>
        <div className="instructions">
          <h1 className={"bp3-heading"}> Round overview </h1>

          <p>
            You will play <strong>{game.treatment.nRounds} rounds</strong> total
            {nStages > 1
              ? " and each round will consist of " + nStages + " stages."
              : "."}
          </p>

          <h3 className="bp3-heading">2. Interactive Response Stage</h3>

          <p>
            In the <strong>Interactive Response</strong> stage, you will see the
            guesses of{" "}
            <strong>{game.treatment.altersCount} other players</strong>. You can
            change your guess by using the slider, and see how other players
            change their guesses in real-time. You can take maximum{" "}
            <strong>{game.treatment.stageDuration}</strong> seconds to submit
            your answer. The <strong>tick mark</strong> by the avatar indicates
            whether a final answer has been submitted for this stage.
          </p>

          <div className="round">
            <div className="content">
              {/*Here is the playerProfile*/}
              <Card className={"player-profile"} style={{ width: "15rem" }}>
                <aside>
                  <div className="profile-score">
                    <h3 className="bp3-heading">Your Profile</h3>
                    <span className="image" style={{ width: "3rem" }}>
                      <span
                        className={`satisfied bp3-tag bp3-round ${
                          this.state.submitted
                            ? "bp3-intent-success"
                            : "bp3-intent-primary"
                        }`}
                      >
                        <span
                          className={`bp3-icon-standard ${
                            this.state.submitted
                              ? "bp3-icon-tick"
                              : "bp3-icon-refresh"
                          }`}
                        />
                      </span>

                      <img
                        className="profile-avatar"
                        src={`/avatars/jdenticon/${player._id}`}
                      />
                    </span>
                  </div>
                  {/*We show individual level feedback only in some cases*/}
                  {game.treatment.feedbackRate > 0 &&
                  game.treatment.selfFeedback ? (
                    <div className="profile-score">
                      <h4 className="bp3-heading">Total score</h4>
                      <Icon icon="dollar" iconSize={20} title={"dollar-sign"} />
                      <span>{player.get("instructionsCumulativeScore")}</span>
                    </div>
                  ) : null}
                  {InteractiveGuessStage.renderTimer(remainingSeconds)}
                </aside>
              </Card>

              <div className="task">
                <div className="task-stimulus">
                  <img src="/instructions/task.png" className="task-image" />
                </div>

                <div className="task-response">
                  <form onSubmit={this.handleSubmit}>
                    <FormGroup>
                      <Label>
                        Your current guess of the correlation is: {guess}
                      </Label>

                      <Slider
                        min={0}
                        max={1}
                        stepSize={0.01}
                        labelStepSize={0.25}
                        onChange={this.handleChange}
                        value={guess}
                        hideHandleOnEmpty
                        disabled={this.state.submitted}
                      />
                    </FormGroup>

                    {this.state.submitted ? (
                      <FormGroup>
                        <Button
                          icon={"refresh"}
                          minimal={true}
                          intent={"primary"}
                          large={true}
                          fill={true}
                          onClick={this.handleReset}
                        >
                          <span>
                            try again (will not be available in the game)
                          </span>
                        </Button>
                      </FormGroup>
                    ) : (
                      <FormGroup>
                        <Button
                          type="submit"
                          icon={"tick"}
                          large={true}
                          fill={true}
                        >
                          Submit
                        </Button>
                      </FormGroup>
                    )}
                  </form>
                </div>
              </div>

              <div className="social-exposure">
                <p>
                  <strong>You are following:</strong>
                </p>

                {this.renderAlters()}
              </div>
            </div>
          </div>

          <ButtonGroup className={"button-group"}>
            <Button
              type="button"
              onClick={onPrev}
              disabled={!hasPrev}
              icon="arrow-left"
            >
              Previous
            </Button>
            <Button
              type="button"
              onClick={onNext}
              disabled={!hasNext}
              rightIcon="arrow-right"
              intent="primary"
              alignText={"right"}
            >
              Next
            </Button>
          </ButtonGroup>
        </div>
      </Centered>
    );
  }
}
