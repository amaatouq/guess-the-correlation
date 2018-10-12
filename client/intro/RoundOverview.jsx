import React from "react";

import { Centered } from "meteor/empirica:core";
import { Button, ButtonGroup, FormGroup, Label } from "@blueprintjs/core";
import Slider from "meteor/empirica:slider";

export default class RoundOverview extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: 0 };
  }

  handleChange = num => {
    const value = Math.round(num * 100) / 100;
    this.setState({ value: value });
  };

  render() {
    const { hasPrev, hasNext, onNext, onPrev, game } = this.props;

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

          <h3 className="bp3-heading">1. The Response Stage</h3>

          <p>
            in the <strong>Response</strong> stage you will be shown a
            correlation like the one shown below. You will be able to use the
            slider to pick a value, and then click <strong>Submit</strong> when
            you are ready. You can take maximum{" "}
            <strong>{game.treatment.stageDuration}</strong> seconds to submit.
          </p>

          <div className="task" align="center">
            <div className="task-stimulus">
              <img src="/instructions/task.png" className="task-image" />
            </div>

            <div className="task-response">
              <form onSubmit={() => {}}>
                <FormGroup>
                  <Label>
                    Your current guess of the correlation is: {this.state.value}
                  </Label>

                  <Slider
                    min={0}
                    max={1}
                    stepSize={0.01}
                    labelStepSize={0.25}
                    onChange={this.handleChange}
                    value={this.state.value}
                    hideHandleOnEmpty
                  />
                </FormGroup>
              </form>
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
