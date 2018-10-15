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
            In this game,{" "}
            <strong>your correlation guess can range from 0 to 1</strong>, and
            the closer the points fit to a straight line, the closer the
            correlation will be to 1. No calculations are necessary, just make
            your best estimate.
          </p>

          <div align="center">
            <img src="/instructions/correlation-examples.png" width="650px" />
          </div>

          <p>
            Note that{" "}
            <strong>
              different scatter plots may have the same correlation value
            </strong>
            . Plots can vary in number of points and shape, which can make them
            easier or harder to guess. For example, both plots in the first row
            below have a correlation of 0.89, and both plots in the second row a
            correlation of .55
          </p>

          <div align="center">
            <img src="/instructions/same-correlation.png" width="650px" />
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
