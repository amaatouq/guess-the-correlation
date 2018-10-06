import React from "react";

export default class TaskStimulus extends React.Component {
  render() {
    const { round, stage, player } = this.props;

    //make the image transparent if it is round outcome
    const classes = ["task-image"];
    if (stage.name === "outcome") {
      classes.push("transparent");
    }

    console.log("task",round);
    const taskDifficulty = round.get("task").difficultyPath; //getting the task data
    const taskPath = taskDifficulty[player.get("difficulty")];

    return (
      <div className="task-stimulus">
        <img src={taskPath} className={classes.join(" ")} />
      </div>
    );
  }
}
