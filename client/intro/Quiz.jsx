import React from "react";

import { Centered } from "meteor/empirica:core";
import {
  Button,
  ButtonGroup,
  Callout,
  Classes,
  FormGroup,
  Label,
  Radio,
  RadioGroup
} from "@blueprintjs/core";

export default class Quiz extends React.Component {
  constructor(props) {
    super(props);
    const { game } = this.props;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleRadioChange = this.handleRadioChange.bind(this);
    this.state = {
      nParticipants: !game.treatment.altersCount
        ? game.treatment.altersCount.toString()
        : "",
      goal: "",
      color: "",
      quizMistake: false
    };
  }

  handleChange = event => {
    const el = event.currentTarget;
    this.setState({ [el.name]: el.value.trim().toLowerCase() });
  };

  handleRadioChange = event => {
    const el = event.currentTarget;
    console.log("el", el);
    console.log("ev", event);
    this.setState({ [el.name]: el.value });
  };

  handleSubmit = event => {
    const { game } = this.props;
    event.preventDefault();

    if (
      this.state.nParticipants !== game.treatment.altersCount.toString() ||
      this.state.goal !== "estimate" ||
      this.state.color !== "white"
    ) {
      this.setState({ quizMistake: true });
    } else {
      this.props.onNext();
    }
  };

  render() {
    const { hasPrev, onPrev, game } = this.props;
    const { nParticipants, goal, color, quizMistake } = this.state;
    return (
      <Centered>
        <div className="quiz instructions">
          <h1 className="bp3-heading"> Quiz </h1>

          <form onSubmit={this.handleSubmit}>
            {game.treatment.altersCount > 1 ? (
              <FormGroup
                label={"What is the maximum number of people you can follow?"}
                labelFor={"nParticipants"}
                helperText={"(enter a number)"}
              >
                <div className="pt-form-content">
                  <input
                    id="example-form-group-input-a"
                    className={Classes.INPUT}
                    placeholder="e.g. 2"
                    type="text"
                    dir="auto"
                    name="nParticipants"
                    value={nParticipants}
                    onChange={this.handleChange}
                    required
                  />
                </div>
              </FormGroup>
            ) : null}

            <FormGroup>
              <RadioGroup
                label="Select the true statement about the goal of the task:"
                onChange={this.handleRadioChange}
                selectedValue={goal}
                name="goal"
                required
              >
                <Radio
                  label="Determine the direction of the moving dots"
                  value="estimate"
                />
                <Radio
                  label="Count the number of points in a picture."
                  value="count"
                />
              </RadioGroup>
            </FormGroup>

            <FormGroup
              label={"What color was Napoleon's white horse?"}
              labelFor={"color"}
              helperText={"(enter a color name)"}
            >
              <div className="pt-form-content">
                <input
                  className={Classes.INPUT}
                  placeholder="e.g. brown"
                  type="text"
                  dir="auto"
                  name="color"
                  value={color}
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
