import Empirica from "meteor/empirica:core";
import { difficulties } from "./constants";

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

// onGameStart is triggered once per game before the game starts, and before
// the first onRoundStart. It receives the game and list of all the players in
// the game.
Empirica.onGameStart((game, players) => {
  game.set("justStarted", true); // I use this to play the sound on the UI when the game starts

  console.log("game", game._id, "started");

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
    //equal number of difficulties .. this can be changed to change the fraction of easy/medium/hard
    player.set("difficulty", difficulties[i % difficulties.length]);
    player.set("alterIds", alterIds);
    player.set("cumulativeScore", 0);
    player.set("bonus", 0);
  });
});

// onRoundStart is triggered before each round starts, and before onStageStart.
// It receives the same options as onGameStart, and the round that is starting.
Empirica.onRoundStart((game, round, players) => {
  console.log("round", round.index, "started");
  players.forEach(player => {
    player.round.set("alterIds", player.get("alterIds"));
  });

  const feedbackTime =
    game.treatment.feedbackRate > 0 &&
    (round.index + 1) %
      Math.round(
        game.treatment.nRounds /
          (game.treatment.feedbackRate * game.treatment.nRounds)
      ) ===
      0;
  round.set("displayFeedback", feedbackTime);
  console.log("display feedback at round", round.index, "?", feedbackTime);
});

// onRoundStart is triggered before each stage starts.
// It receives the same options as onRoundStart, and the stage that is starting.
Empirica.onStageStart((game, round, stage, players) => {
  console.log("stage", stage.name, "started");
});

// It receives the same options as onRoundEnd, and the stage that just ended.
Empirica.onStageEnd((game, round, stage, players) => {
  console.log("stage", stage.name, "ended");
  if (stage.name === "response") {
    computeScore(players, round);
  } else if (stage.name === "interactive") {
    //after the 'interactive' stage, we compute the score and color it
    computeScore(players, round);
    colorScores(players);
  }
});

// onRoundEnd is triggered after each round.
// It receives the same options as onGameEnd, and the round that just ended.
Empirica.onRoundEnd((game, round, players) => {
  console.log("round", round.index, "ended");
  players.forEach(player => {
    const currentScore = player.get("cumulativeScore");
    const roundScore = player.round.get("score");
    player.set("cumulativeScore", Math.round(currentScore + roundScore));
  });

  //checking whether the game contains shock and whether it is time for it!
  //currentRoundNumber % nRounds/shockRate * nRounds => whether it is time!
  const shockTime =
    game.treatment.shockRate > 0 &&
    (round.index + 1) %
      Math.round(
        game.treatment.nRounds /
          (game.treatment.shockRate * game.treatment.nRounds)
      ) ===
      0;
  //if it is time for a shock to arrive, then shock the players
  // i.e., change the difficulty of the task for them.
  shockTime ? shock(players) : null;
  console.log("round:", round.index, ", is it shock time?", shockTime);
});

// onRoundEnd is triggered when the game ends.
// It receives the same options as onGameStart.
Empirica.onGameEnd((game, players) => {
  console.log("The game", game._id, "has ended");
  const conversionRate = game.treatment.conversionRate;
  players.forEach(player => {
    const bonus = Math.round(player.get("cumulativeScore") * conversionRate);
    player.set("bonus", bonus);
  });
});

// These are just some helper functions for the Guess the Correlation Game
// compute score.
function computeScore(players, round) {
  const correctAnswer = round.get("task").correctAnswer;

  players.forEach(player => {
    const guess = player.round.get("guess");
    // If no guess given, score is 0
    const score = !guess
      ? 0
      : Math.round((1 - Math.abs(correctAnswer - guess)) * 100);

    player.round.set("score", score);
  });
}

// We sort the players based on their score in this round in order to color code
// how we display their scores.
// The highest 1/3 players are green, the lowest 1/3 are red, and the rest are orange.
function colorScores(players) {
  const sortedPlayers = players.sort(compareScores);
  const top3rd = Math.floor(players.length / 3);
  const bottom3rd = Math.floor(players.length - players.length / 3);

  sortedPlayers.forEach((player, i) => {
    if (i < top3rd) {
      player.round.set("scoreColor", "green");
    } else if (i >= bottom3rd) {
      player.round.set("scoreColor", "red");
    } else {
      player.round.set("scoreColor", "orange");
    }
  });
}

// Helper function to sort players objects based on their score in the current round.
function compareScores(firstPlayer, secondPlayer) {
  const scoreA = firstPlayer.round.get("score");
  const scoreB = secondPlayer.round.get("score");

  let comparison = 0;
  if (scoreA > scoreB) {
    comparison = -1;
  } else if (scoreA < scoreB) {
    comparison = 1;
  }
  return comparison;
}

// Shocking the players by changing the difficulty of the problem that they see
// -1 permutation: easy => hard; medium => easy; hard => medium.
function shock(players) {
  console.log("time for shock");
  players.forEach(player => {
    const currentDifficulty = player.get("difficulty");
    if (currentDifficulty === "easy") {
      player.set("difficulty", "hard");
    } else if (currentDifficulty === "medium") {
      player.set("difficulty", "easy");
    } else {
      player.set("difficulty", "medium");
    }
  });
}

// ===========================================================================
// => onSet, onAppend and onChanged ==========================================
// ===========================================================================

// onSet, onAppend and onChanged are called on every single update made by all
// players in each game, so they can rapidly become quite expensive and have
// the potential to slow down the app. Use wisely.
//
// It is very useful to be able to react to each update a user makes. Try
// nontheless to limit the amount of computations and database saves (.set)
// done in these callbacks. You can also try to limit the amount of calls to
// set() and append() you make (avoid calling them on a continuous drag of a
// slider for example) and inside these callbacks use the `key` argument at the
// very beginning of the callback to filter out which keys your need to run
// logic against.
//
// If you are not using these callbacks, comment them out so the system does
// not call them for nothing.

// // onSet is called when the experiment code call the .set() method
// // on games, rounds, stages, players, playerRounds or playerStages.
// Empirica.onSet((
//   game,
//   round,
//   stage,
//   players,
//   player, // Player who made the change
//   target, // Object on which the change was made (eg. player.set() => player)
//   targetType, // Type of object on which the change was made (eg. player.set() => "player")
//   key, // Key of changed value (e.g. player.set("score", 1) => "score")
//   value, // New value
//   prevValue // Previous value
// ) => {
//   // // Example filtering
//   // if (key !== "value") {
//   //   return;
//   // }
// });

// // onSet is called when the experiment code call the `.append()` method
// // on games, rounds, stages, players, playerRounds or playerStages.
// Empirica.onAppend((
//   game,
//   round,
//   stage,
//   players,
//   player, // Player who made the change
//   target, // Object on which the change was made (eg. player.set() => player)
//   targetType, // Type of object on which the change was made (eg. player.set() => "player")
//   key, // Key of changed value (e.g. player.set("score", 1) => "score")
//   value, // New value
//   prevValue // Previous value
// ) => {
//   // Note: `value` is the single last value (e.g 0.2), while `prevValue` will
//   //       be an array of the previsous valued (e.g. [0.3, 0.4, 0.65]).
// });

// // onChange is called when the experiment code call the `.set()` or the
// // `.append()` method on games, rounds, stages, players, playerRounds or
// // playerStages.
// Empirica.onChange((
//   game,
//   round,
//   stage,
//   players,
//   player, // Player who made the change
//   target, // Object on which the change was made (eg. player.set() => player)
//   targetType, // Type of object on which the change was made (eg. player.set() => "player")
//   key, // Key of changed value (e.g. player.set("score", 1) => "score")
//   value, // New value
//   prevValue, // Previous value
//   isAppend // True if the change was an append, false if it was a set
// ) => {
//   // `onChange` is useful to run server-side logic for any user interaction.
//   // Note the extra isAppend boolean that will allow to differenciate sets and
//   // appends.
// });
