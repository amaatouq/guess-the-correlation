import Empirica from "meteor/empirica:core";
import { difficulties, taskData } from "./constants";

import "./callbacks.js";
import "./bots.js";

//this only works if we have 12 participants
const initial_network = {
  0: [2, 4, 9],
  1: [4, 8, 2],
  2: [4, 10, 3],
  3: [6, 10, 0],
  4: [0, 6, 8],
  5: [6, 9, 11],
  6: [5, 11, 10],
  7: [1, 5, 0],
  8: [3, 1, 7],
  9: [7, 2, 5],
  10: [1, 3, 11],
  11: [9, 7, 8]
};

function getAlters(player, playerIndex, playerIds, alterCount) {
  //using the initial network structure to create the network, otherwise, a random network

  let alterIds = [];
  if (playerIds.length === 12) {
    alterIds = playerIds.filter(
      (elt, i) => initial_network[playerIndex].indexOf(i) > -1
    );
    console.log(
      "player ",
      playerIndex,
      "got: ",
      initial_network[playerIndex],
      "actual alters: ",
      alterIds
    );
  } else {
    alterIds = _.sample(_.without(playerIds, player._id), alterCount);
  }

  return alterIds;
}

function getAvatar(player, i) {
  return i > 16 ? `/avatars/jdenticon/${player._id}` : `/avatars/${i}.png`;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// gameInit is where the structure of a game is defined.
// Just before every game starts, once all the players needed are ready, this
// function is called with the treatment and the list of players.
// You must then add rounds and stages to the game, depending on the treatment
// and the players. You can also get/set initial values on your game, players,
// rounds and stages (with get/set methods), that will be able to use later in
// the game.

//TODO: return to this once Nicolas fixes this problem
Empirica.gameInit((game, treatment, players) => {
  const tasks = game.treatment.randomizeTask ? _.shuffle(taskData) : taskData;

  //prepare players by creating the network
  const playerIds = _.pluck(players, "_id");
  players.forEach((player, i) => {
    const alterIds = getAlters(
      player,
      i,
      playerIds,
      game.treatment.altersCount
    );

    player.set("avatar", getAvatar(player, i));
    if (game.treatment.playerCount > 1) {
      //equal number of difficulties .. this can be changed to change the fraction of easy/medium/hard
      player.set("difficulty", difficulties[(i + 1) % difficulties.length]);
      console.log(
        "my difficulty is ",
        difficulties[(i + 1) % difficulties.length]
      );
    } else {
      //if we only have one player, we randomly choose a difficulty
      player.set("difficulty", randomChoice(difficulties));
    }

    player.set("alterIds", alterIds);
    player.set("cumulativeScore", 0);
    player.set("bonus", 0);
  });
  

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
