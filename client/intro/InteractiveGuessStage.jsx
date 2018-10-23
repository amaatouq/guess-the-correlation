import React from "react";

import { Centered } from "meteor/empirica:core";
import {
  Button,
  ButtonGroup,
  Card,
  Elevation,
  FormGroup,
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
        initialGuess: 0.7 + Math.random() / 5
      };
    }

    this.state = { fakePlayers: fakePlayers };
  }

  componentDidUpdate() {
    //check if we want to update or not .. most of the times, we don't want to
    if (Math.random() > 0.9) {
      for (const [_id, fakePlayer] of Object.entries(this.state.fakePlayers)) {
        //not everyone updates
        if (Math.random() > 0.5) {
          let change = Math.random() / 10.0;
          change *= Math.random() * 2 === 1 ? 1 : -1; //make the change + or -
          if (fakePlayer.initialGuess + change > 0.99) {
            fakePlayer.initialGuess -= 10 * change;
          } else if (fakePlayer.initialGuess + change < 0) {
            fakePlayer.initialGuess -= 10 * change;
          } else {
            fakePlayer.initialGuess += change;
          }
        }
      }
    }
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
          <img
            src={fakePlayer.avatar}
            className="profile-avatar"
            title={fakePlayer._id}
          />
          <Slider
            min={0}
            max={1}
            stepSize={0.01}
            value={fakePlayer.initialGuess}
            showTrackFill={false}
            disabled
          />
        </Card>
      );
    }
    return altersList;
  };

  render() {
    const { hasPrev, hasNext, onNext, onPrev, game, player } = this.props;

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
              ? "and each round will consist of " + nStages + " stages."
              : "."}
          </p>

          <h3 className="bp3-heading">2. Interactive Response Stage</h3>

          <p>
            in the <strong>Interactive Response</strong> stage, you will see the guesses
            of <strong>{game.treatment.altersCount} other players</strong>. You
            can change your guess by using the slider, and see how other players
            change their guesses in real-time. You can take maximum{" "}
            <strong>{game.treatment.stageDuration}</strong> seconds to submit
            your answer.
          </p>

          <div className="round">
            <div className="content">
              <div className="task">
                <div className="task-stimulus">
                  <img src="/instructions/task.png" className="task-image" />
                </div>

                <div className="task-response">
                  <form onSubmit={() => {}}>
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
                      />
                    </FormGroup>
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
