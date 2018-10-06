import Empirica from "meteor/empirica:core";
import { difficulties, taskData } from "./constants";
import * as _ from "meteor/underscore";

import "./callbacks.js";
import "./bots.js";

// gameInit is where the structure of a game is defined.
// Just before every game starts, once all the players needed are ready, this
// function is called with the treatment and the list of players.
// You must then add rounds and stages to the game, depending on the treatment
// and the players. You can also get/set initial values on your game, players,
// rounds and stages (with get/set methods), that will be able to use later in
// the game.
Empirica.gameInit((game, treatment, players) => {
  const tasks = game.treatment.randomizeTask ? _.shuffle(taskData) : taskData;

  _.times(game.treatment.nRounds, i => {
    const round = game.addRound();

    //we set the round with the task data for that round
    round.set("task", tasks[i]);

    //always add the "response stage" which is the independent guess one
    round.addStage({
      name: "response",
      displayName: "Response",
      durationInSeconds: game.treatment.stageDuration
    });

    //only add the interactive stage if it is NOT the solo condition
    if (game.treatment.altersCount > 0) {
      round.addStage({
        name: "interactive",
        displayName: "Interactive Response",
        durationInSeconds: game.treatment.stageDuration
      });
    }

    // adding "outcome" might look complicated but basically what we are checking is this:
    // when interactive with others, show the round outcome if there is feedback or rewiring
    // when no interactions with others only show the outcome stage when feedback is given
    if (
      (game.treatment.altersCount > 0 &&
        (game.treatment.feedbackRate > 0 || game.treatment.rewiring)) ||
      (game.treatment.altersCount === 0 && game.treatment.feedbackRate > 0)
    ) {
      round.addStage({
        name: "outcome",
        displayName: "Round Outcome",
        durationInSeconds: treatment.stageDuration
      });
    }
  });
});
