import React from "react";

import { Centered } from "meteor/empirica:core";
import { Button, ButtonGroup } from "@blueprintjs/core";

export default class Overview extends React.Component {
  constructor(props) {
    super(props);
    const { player } = this.props;
    player.set("instructionsCumulativeScore", 11);
  }
  render() {
    const { hasPrev, hasNext, onNext, onPrev, game } = this.props;

    return (
      <Centered>
        <div className="instructions">
          <h1 className={"bp3-heading"}> Game overview </h1>
          <p>
            After completing the instructions and comprehension check, you will
            begin the game.
          </p>
          <p>
            The game consists of{" "}
            <strong>{game.treatment.nRounds} rounds</strong>{" "}
            {game.treatment.playerCount > 1 ? (
              <span>
                and you will play simultaneously{" "}
                <strong>
                  {" "}
                  with {game.treatment.playerCount} other MTurk workers
                </strong>
              </span>
            ) : null}
            . At each round you will see a scatter plot and be asked to{" "}
            <strong>estimate the correlation of the X and Y variables</strong>.
          </p>
          <div align="center">
            <img src="/instructions/height-age.png" width="500px" />
          </div>
          <p>
            <strong>What is a correlation?</strong>
            <br />
            <a href="https://en.wikipedia.org/wiki/Pearson_product-moment_correlation_coefficient">
              Correlation{" "}
            </a>{" "}
            measures how closely related two variables are. For the example
            above, if tall kids tend to be heavy, and short kids tend to be
            light, we would say that height and weight are correlated.
          </p>

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
