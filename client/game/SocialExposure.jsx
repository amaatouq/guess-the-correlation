import React from "react";
import Slider from "meteor/empirica:slider";
import { Card, Elevation } from "@blueprintjs/core";

export default class SocialExposure extends React.Component {
  renderSocialInteraction = otherPlayer => {
    // "or 0" here if the user hasn't submitted a guess, defaulting to 0
    const guess = otherPlayer.round.get("guess");
    return (
      <Card className={"alter"} elevation={Elevation.TWO} key={otherPlayer._id}>
        <img
          src={otherPlayer.get("avatar")}
          className="profile-avatar"
          title={otherPlayer._id}
        />
        <Slider
          min={0}
          max={1}
          stepSize={0.01}
          value={guess}
          showTrackFill={false}
          disabled
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
