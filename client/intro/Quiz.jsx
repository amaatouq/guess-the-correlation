import React from "react";

import { Centered } from "meteor/empirica:core";
import {
  Button,
  ButtonGroup,
  Callout,
  Classes,
  FormGroup,
  Label
} from "@blueprintjs/core";

export default class Quiz extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = { value1: "", value2: "", quizMistake: false };
  }

  handleChange = event => {
    const el = event.currentTarget;
    this.setState({ [el.name]: el.value.trim().toLowerCase() });
  };

  handleSubmit = event => {
    event.preventDefault();

    if (this.state.value1 !== "4" || this.state.value2 !== "white") {
      this.setState({ quizMistake: true });
    } else {
      this.props.onNext();
    }
  };

  render() {
    const { hasPrev, onPrev } = this.props;
    const { value1, value2, quizMistake } = this.state;
    return (
      <Centered>
        <div className="quiz instructions">
          <h1> Quiz </h1>

          <form onSubmit={this.handleSubmit}>
            <FormGroup
              label={"What is 2+2?"}
              labelFor={"value1"}
              helperText={"(enter a number)"}
            >
              <div className="pt-form-content">
                <input
                  id="example-form-group-input-a"
                  className={Classes.INPUT}
                  placeholder="e.g. 3"
                  type="text"
                  dir="auto"
                  name="value1"
                  value={value1}
                  onChange={this.handleChange}
                  required
                />
              </div>
            </FormGroup>

            <FormGroup
              label={"What color was Napoleon's white horse?"}
              labelFor={"value2"}
              helperText={"(enter a color name)"}
            >
              <div className="pt-form-content">
                <input
                  className={Classes.INPUT}
                  placeholder="e.g. brown"
                  type="text"
                  dir="auto"
                  name="value2"
                  value={value2}
                  onChange={this.handleChange}
                  required
                />
              </div>
            </FormGroup>

            {quizMistake ? (
              <Callout
                className={"call-out"}
                intent={"danger"}
                title={"You have one or more mistake(s)"}
              >
                Please ensure that you answer the questions correctly, or go
                back to the instructions.
              </Callout>
            ) : (
              <div className="call-out" />
            )}

            <ButtonGroup minimal={true} className={"button-group"}>
              <Button
                type="button"
                onClick={onPrev}
                disabled={!hasPrev}
                icon="double-chevron-left"
              >
                Instructions
              </Button>
              <Button type="submit" intent="success" rightIcon={"confirm"}>
                Submit
              </Button>
            </ButtonGroup>
          </form>
        </div>
      </Centered>
    );
  }
}
