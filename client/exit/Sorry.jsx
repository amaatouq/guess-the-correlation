import React from "react";

import { Centered } from "meteor/empirica:core";

export default class Sorry extends React.Component {
  static stepName = "Sorry";
  render() {
    const { player, hasNext, onSubmit } = this.props;
    
    let msg;
    switch (player.exitStatus) {
      case "gameFull":
        msg = "Games filled up too fast...";
        break;
      // case "gameLobbyTimedOut":
      //   msg = "???";
      //   break;
      // case "playerLobbyTimedOut":
      //   msg = "???";
      //   break;
      case "playerEndedLobbyWait":
        msg =
          "You decided to stop waiting, we are sorry it was too long a wait.";
        break;
      default:
        msg = "Unfortunately the Game was cancelled...";
        break;
    }
    
    return (
      <Centered>
        <div className="score">
          <h1>Sorry!</h1>
          
          <p>Sorry, you were not able to play today! {msg}</p>
          
          <p>
            Please submit{" "}
            <strong>
              <em>{player._id}</em>
            </strong>{" "}
            in order to receive the base payment for your attempt.
          </p>
          
          <p>Feel free to come back for the next scheduled game.</p>
          
          <p>
            {hasNext ? (
              <button
                className="pt-button pt-intent-primary"
                type="button"
                onClick={() => onSubmit()}
              >
                Done
              </button>
            ) : (
              ""
            )}
          </p>
        </div>
      </Centered>
    );
  }
}
