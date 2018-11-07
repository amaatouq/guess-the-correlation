import { render } from "react-dom";

import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/core/lib/css/blueprint.css";

import Empirica from "meteor/empirica:core";

import Round from "./game/Round";
import Consent from "./intro/Consent";
import Overview from "./intro/Overview";
import MoreAboutCorrelations from "./intro/MoreAboutCorrelations";
import YourGuessStage from "./intro/YourGuessStage";

import Quiz from "./intro/Quiz";
import ExitSurvey from "./exit/ExitSurvey";
import Thanks from "./exit/Thanks";
import Sorry from "./exit/Sorry";
import InteractiveGuessStage from "./intro/InteractiveGuessStage";
import OutcomeStage from "./intro/OutcomeStage";

// Set the Consent Component you want to present players (optional).
Empirica.consent(Consent);

// Introduction pages to show before they play the game (optional).
// At this point they have been assigned a treatment. You can return
// different instruction steps depending on the assigned treatment.
Empirica.introSteps(game => {
  const steps = [Overview, YourGuessStage];

  if (game.treatment.altersCount > 1) {
    steps.push(InteractiveGuessStage);
  }
  if (game.treatment.feedbackRate > 0 || game.treatment.altersCount > 1) {
    steps.push(OutcomeStage);
  }
  steps.push(MoreAboutCorrelations);
  steps.push(Quiz);
  return steps;
});

// The Round component containing the game UI logic.
// This is where you will be doing the most development.
// See client/game/Round.jsx to learn more.
Empirica.round(Round);

// End of Game pages. These may vary depending on player or game information.
// For example we can show the score of the user, or we can show them a
// different message if they actually could not participate the game (timed
// out), etc.
// The last step will be the last page shown to user and will be shown to the
// user if they come back to the website.
// If you don't return anything, or do not define this function, a default
// exit screen will be shown.
Empirica.exitSteps((game, player) => {
  return player.exitStatus !== "finished"
    ? [Sorry, Thanks]
    : [ExitSurvey, Thanks];
});

// Start the app render tree.
// NB: This must be called after any other Empirica calls (Empirica.round(),
// Empirica.introSteps(), ...).
// It is required and usually does not need changing.
Meteor.startup(() => {
  render(Empirica.routes(), document.getElementById("app"));
});
