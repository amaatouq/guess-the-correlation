import React from "react";
import Slider from "meteor/empirica:slider";
import { Card, Elevation } from "@blueprintjs/core";

export default class SocialExposure extends React.Component {
  renderSocialInteraction = otherPlayer => {
    // "or 0" here if the user hasn't submitted a guess, defaulting to 0
    const guess = otherPlayer.round.get("guess");
    return (
      <Card className={"alter"} elevation={Elevation.TWO} key={otherPlayer._id}>
        <span className="image">
          <span
            className={`satisfied bp3-tag bp3-round ${
              otherPlayer.stage.submitted
                ? "bp3-intent-success"
                : "bp3-intent-primary"
            }`}
          >
            <span
              className={`bp3-icon-standard ${
                otherPlayer.stage.submitted ? "bp3-icon-tick" : "bp3-icon-refresh"
              }`}
            />
          </span>

          <img src={otherPlayer.get("avatar")} />
        </span>

        <Slider
          min={0}
          max={1}
          stepSize={0.01}
          value={guess}
          showTrackFill={false}
          disabled
          hideHandleOnEmpty
        />
      </Card>
    );
  };

  render() {
    const { game, player } = this.props;

    const alterIds = player.get("alterIds");

    const allPlayers = _.sortBy(game.players, p =>
      p.get("cumulativeScore")
    ).reverse();
    const alters = allPlayers.filter(p => alterIds.includes(p._id));

    return (
      <div className="social-exposure">
        <p>
          <strong>You are following:</strong>
        </p>
        {!_.isEmpty(alters)
          ? alters.map(alter => this.renderSocialInteraction(alter))
          : "You are currently NOT following anyone"}
      </div>
    );
  }
}
