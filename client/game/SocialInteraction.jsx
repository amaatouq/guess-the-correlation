import React from "react";

import { AlertToaster } from "meteor/empirica:core";
import { Icon, Button, Card, Elevation } from "@blueprintjs/core";
import { shuffle } from "shuffle-seed";

export default class SocialInteraction extends React.Component {
  handleUnfollow = (alterId, event) => {
    event.preventDefault();
    const { player } = this.props;
    const alterIds = _.without(player.get("alterIds"), alterId);
    throttled(10000, player.set("alterIds", alterIds)); //this will slow down the update
  };

  handleFollow = (alterId, event) => {
    event.preventDefault();
    const { player, game } = this.props;
    const { altersCount } = game.treatment;
    const alterIds = player.get("alterIds");
    if (altersCount <= alterIds.length) {
      AlertToaster.show({
        message: "You are already following the maximum number of people"
      });
      return;
    }

    //only add the alter to the list if it is not already in the list.
    if (!alterIds.includes(alterId)) {
      alterIds.push(alterId);
      throttled(10000, player.set("alterIds", alterIds)); //this will slow down the update
    }
  };

  renderUnfollow(alterId) {
    const { player } = this.props;

    return (
      //if they did not submit, they can unfollow, otherwise, the button is inactive
      <Button
        fill={true}
        intent={"primary"}
        onClick={this.handleUnfollow.bind(this, alterId)}
        disabled={player.stage.submitted}
      >
        Unfollow
      </Button>
    );
  }

  renderAlter(otherPlayer) {
    const { round, game } = this.props;
    const cumulativeScore = otherPlayer.get("cumulativeScore") || 0;
    const roundScore = otherPlayer.round.get("score") || 0;

    const feedbackTime = round.get("displayFeedback");
    const peersFeedback = game.treatment.peersFeedback;

    return (
      <Card className={"alter"} elevation={Elevation.TWO} key={otherPlayer._id}>
        <div className="info">
          <img src={otherPlayer.get("avatar")} className="profile-avatar" />
          {/*only show the scores of the alters if feedback is allowed*/}
          {feedbackTime && peersFeedback ? (
            <div>
              <Icon icon={"dollar"} />
              <span>{cumulativeScore} </span>
              <span style={{ color: otherPlayer.round.get("scoreColor") }}>
                <strong>
                  (+
                  {roundScore})
                </strong>
              </span>
            </div>
          ) : null}
        </div>
        {game.treatment.rewiring ? this.renderUnfollow(otherPlayer._id) : null}
      </Card>
    );
  }

  renderAltersList(alterIds) {
    return alterIds.map(alterId => this.renderAlter(alterId));
  }

  renderLeftColumn(player, alterIds, feedbackTime) {
    const { game } = this.props;
    const cumulativeScore = player.get("cumulativeScore") || 0;
    const roundScore = player.round.get("score") || 0;
    const peersFeedback = game.treatment.peersFeedback;

    return (
      <div className="right" key="left" style={{ minWidth: "18rem" }}>
        {feedbackTime && peersFeedback ? (
          <div>
            <p className="bp3-ui-text">
              <strong>Score:</strong> Total (+increment)
            </p>
            <Icon icon={"dollar"} />
            <span>{cumulativeScore}</span>
            <span
              style={{
                color: peersFeedback ? player.round.get("scoreColor") : "black"
              }}
            >
              <strong>
                {" "}
                (+
                {roundScore})
              </strong>
            </span>
          </div>
        ) : null}

        <p>
          <strong>You are following:</strong>
        </p>
        {this.renderAltersList(alterIds)}
      </div>
    );
  }

  renderNonAlter(otherPlayer) {
    const { game, player, round } = this.props;
    const cumulativeScore = otherPlayer.get("cumulativeScore") || 0;
    const roundScore = otherPlayer.round.get("score") || 0;
    const feedbackTime = round.get("displayFeedback");
    const peersFeedback = game.treatment.peersFeedback;

    return (
      <div className="non-alter" key={otherPlayer._id}>
        <Button
          intent={"primary"}
          minimal={true}
          icon={"add"}
          onClick={this.handleFollow.bind(this, otherPlayer._id)}
          disabled={player.stage.submitted}
        />
        <img src={otherPlayer.get("avatar")} className="profile-avatar" />
        {feedbackTime && peersFeedback ? (
          <div>
            <Icon icon={"dollar"} />
            <span>{cumulativeScore} </span>
            <span style={{ color: otherPlayer.round.get("scoreColor") }}>
              <strong>
                {" "}
                (+
                {roundScore})
              </strong>
            </span>
          </div>
        ) : null}
      </div>
    );
  }
  renderNonAltersList(nonAlterIds) {
    return nonAlterIds.map(alterId => this.renderNonAlter(alterId));
  }

  renderRightColumn(nonAlterIds) {
    return (
      <div className="right" key="right">
        <p>
          <strong>You can follow:</strong>
        </p>
        {this.renderNonAltersList(nonAlterIds)}
      </div>
    );
  }

  render() {
    const { game, player, round } = this.props;

    const feedbackTime = round.get("displayFeedback");

    const rewiring = game.treatment.rewiring;

    //get the ids of the followers and the people that they could follow
    const allPlayersIds = _.pluck(game.players, "_id");
    const alterIds = Array.from(new Set(player.get("alterIds"))); //this protect us from double clicking that might cause follwoing the same player twice
    const nonAlterIds = _.without(
      _.difference(allPlayersIds, alterIds),
      player._id
    );

    //actual Player objects and not only Ids for alters and nonAlters

    //all players sorted by performance in descending order if feedback, otherwise, shuffle them
    const allPlayers =
      feedbackTime && game.treatment.peersFeedback
        ? _.sortBy(game.players, p => p.get("cumulativeScore")).reverse()
        : shuffle(game.players, player._id);

    const alters = allPlayers.filter(p => alterIds.includes(p._id));
    const nonAlters = allPlayers.filter(p => nonAlterIds.includes(p._id));

    return (
      <div className="social-interaction">
        {rewiring
          ? [
              this.renderLeftColumn(player, alters, feedbackTime),
              this.renderRightColumn(nonAlters)
            ]
          : this.renderLeftColumn(player, alters, feedbackTime)}
      </div>
    );
  }
}

// ES6 code to reduce the rat of calling a function
function throttled(delay, fn) {
  _.throttle(fn, delay);
}
