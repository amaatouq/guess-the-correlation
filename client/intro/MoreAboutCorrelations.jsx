import React from "react";

import { Centered } from "meteor/empirica:core";
import { Button, ButtonGroup } from "@blueprintjs/core";

export default class MoreAboutCorrelations extends React.Component {
  render() {
    const { hasPrev, hasNext, onNext, onPrev } = this.props;
    return (
      <Centered>
        <div className="instructions">
          <h1 className="bp3-heading"> More about correlations </h1>
          <p>
            We will only look at positive correlation, so your answer will
            always be between <strong>0 and 1</strong>. When two variables are
            not at all related, their correlation is 0. When two variables are
            perfectly related, their correlation is 1.
          </p>

          <div align="center">
            <img src="/instructions/correlation-examples.png" width="650px" />
          </div>

          <p>
            Many different scatter plots may have the same correlation
            value. All 4 of the scatter plots below have a correlation of 0.82.
          </p>

          <div align="center">
            <img src="/instructions/same-correlation.png" width="650px" />
          </div>
          <p>
            In this HIT, no calculations are necessary, just make your best
            estimate.{" "}
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
