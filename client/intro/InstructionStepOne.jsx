import React from "react";

import { Centered } from "meteor/empirica:core";
import { Button, ButtonGroup } from "@blueprintjs/core";

export default class InstructionStepOne extends React.Component {
  render() {
    const { hasPrev, hasNext, onNext, onPrev, game } = this.props;

    return (
      <Centered>
        <div className="instructions">
          <h1> Instructions 1 </h1>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Optio,
            animi? Quae autem asperiores officiis voluptatum fuga recusandae
            minima! Animi pariatur ex sapiente laborum. Ipsa quo quia ab,
            veritatis et labore.
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
              alignText={'right'}
            >
              Next
            </Button>
          </ButtonGroup>
        </div>
      </Centered>
    );
  }
}
