import React from "react";

import { AlertToaster, Centered } from "meteor/empirica:core";
import {
  Button,
  ButtonGroup,
  Card,
  Elevation,
  FormGroup,
  HTMLTable,
  Icon,
  Label
} from "@blueprintjs/core";
import Slider from "meteor/empirica:slider";

const avatarNames = "abcdefghijklmnopqrstuvwxyz".split("");

export default class OutcomeStage extends React.Component {
  handleChange = num => {
    const { player } = this.props;

    const value = Math.round(num * 100) / 100;
    player.set("instructionsGuess", value);
  };

  constructor(props) {
    super(props);
    const { game, player } = this.props;

    let fakePlayers = {};

    //adding the current real player
    player.set(
      "instructionsCumulativeScore",
      Math.round(
        Math.round(
          (1 - Math.abs(0.89 - player.get("instructionsGuess"))) * 100
        ) +
          Math.random() * 100
      )
    );
    player.set(
      "instructionsScore",
      Math.round((1 - Math.abs(0.89 - player.get("instructionsGuess"))) * 100)
    );

    fakePlayers[player._id] = {
      _id: player._id,
      avatar: `/avatars/jdenticon/${player._id}`,
      cumulativeScore: player.get("instructionsCumulativeScore"),
      score: player.get("instructionsScore"),
      scoreColor: null
    };

    //adding fake players
    for (let i = 0; i < game.treatment.playerCount; i++) {
      const score = Math.round(Math.random() * 100);
      fakePlayers[i] = {
        _id: i,
        avatar: `/avatars/jdenticon/${avatarNames[i]}`,
        cumulativeScore: Math.round(score + Math.random() * 100),
        score: score,
        scoreColor: null
      };
    }

    this.state = {
      fakePlayers: fakePlayers,
      feedbackTime: game.treatment.feedbackRate > 0,
      feedbackRate: game.treatment.feedbackRate,
      rewiring: game.treatment.rewiring,
      social: game.treatment.playerCount === 0
    };

    const alterIds = _.sample(
      _.without(_.pluck(fakePlayers, "_id"), player._id),
      game.treatment.altersCount
    );

    player.set("instructionsAlterIds", alterIds);
  }

  componentDidMount() {
    this.colorScores(this.state.fakePlayers);
  }

  renderAltersList(alterIds) {
    return alterIds.map(alterId => this.renderAlter(alterId));
  }

  handleUnfollow = (alterId, event) => {
    event.preventDefault();
    const { player } = this.props;
    const alterIds = _.without(player.get("instructionsAlterIds"), alterId);
    player.set("instructionsAlterIds", alterIds);
  };

  handleFollow = (alterId, event) => {
    event.preventDefault();
    const { player, game } = this.props;
    const { altersCount } = game.treatment;
    const alterIds = player.get("instructionsAlterIds");
    if (altersCount <= alterIds.length) {
      AlertToaster.show({
        message: "You are already following the maximum number of people"
      });
      return;
    }

    alterIds.push(alterId);
    player.set("instructionsAlterIds", alterIds);
  };

  renderUnfollow(alterId) {
    return (
      //if they did not submit, they can unfollow, otherwise, the button is inactive
      <Button
        fill={true}
        intent={"primary"}
        onClick={this.handleUnfollow.bind(this, alterId)}
      >
        Unfollow
      </Button>
    );
  }

  renderAlter(otherPlayer) {
    const { game } = this.props;
    const cumulativeScore = otherPlayer.cumulativeScore || 0;
    const roundScore = otherPlayer.score || 0;

    const feedbackTime = true;

    return (
      <Card className={"alter"} elevation={Elevation.TWO} key={otherPlayer._id}>
        <div className="info">
          <img src={otherPlayer.avatar} className="profile-avatar" />
          {/*only show the scores of the alters if feedback is allowed*/}
          {feedbackTime ? <Icon icon={"dollar"} /> : null}
          {feedbackTime ? <span>{cumulativeScore} </span> : null}
          {feedbackTime ? (
            <span style={{ color: otherPlayer.scoreColor }}>
              <strong>
                (+
                {roundScore})
              </strong>
            </span>
          ) : null}
        </div>
        {game.treatment.rewiring ? this.renderUnfollow(otherPlayer._id) : null}
      </Card>
    );
  }

  renderLeftColumn(player, alterIds) {
    const cumulativeScore = player.get("instructionsCumulativeScore") || 0;
    const roundScore = player.get("instructionsScore") || 0;

    const feedbackTime = true;

    return (
      <div className="right" key="left">
        {feedbackTime ? (
          <p>
            <strong>Score:</strong> Total (+increment)
          </p>
        ) : null}

        {feedbackTime ? (
          <p style={{ textIndent: "1em" }}>
            <Icon icon={"dollar"} />
            <span>{cumulativeScore}</span>
            <span style={{ color: player.get("instructionsScoreColor") }}>
              <strong>
                {" "}
                (+
                {roundScore})
              </strong>
            </span>
          </p>
        ) : null}

        <p>
          <strong>You are following:</strong>
        </p>
        {this.renderAltersList(alterIds)}
      </div>
    );
  }

  renderNonAlter(otherPlayer) {
    const cumulativeScore = otherPlayer.cumulativeScore || 0;
    const roundScore = otherPlayer.score || 0;
    const feedbackTime = true;
    return (
      <div className="non-alter" key={otherPlayer._id}>
        <Button
          intent={"primary"}
          minimal={true}
          icon={"add"}
          onClick={this.handleFollow.bind(this, otherPlayer._id)}
        />
        <img src={otherPlayer.avatar} className="profile-avatar" />
        {feedbackTime ? <Icon icon={"dollar"} /> : null}
        {feedbackTime ? <span>{cumulativeScore} </span> : null}
        {feedbackTime ? (
          <span style={{ color: otherPlayer.scoreColor }}>
            <strong>
              {" "}
              (+
              {roundScore})
            </strong>
          </span>
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
    const { hasPrev, hasNext, onNext, onPrev, game, player } = this.props;

    //every game will have at least 1 stage
    let nStages = 1;
    //if there are more than 1 alter, then the game has social interaction
    if (game.treatment.altersCount > 0) {
      nStages += 1;
    }
    //if the game has feedback or is social with either feedback or rewiring (or both) then there will be another stage
    if (
      (game.treatment.altersCount > 0 &&
        (game.treatment.feedbackRate > 0 || game.treatment.rewiring)) ||
      (game.treatment.altersCount === 0 && game.treatment.feedbackRate > 0)
    ) {
      nStages += 1;
    }

    const guess = player.get("instructionsGuess");

    const rewiring = game.treatment.rewiring;

    const allPlayersIds = _.pluck(this.state.fakePlayers, "_id");
    const alterIds = player.get("instructionsAlterIds");
    const nonAlterIds = _.without(
      _.difference(allPlayersIds, alterIds),
      player._id
    );

    //actual Player objects and not only Ids for alters and nonAlters

    //all players sorted by performance in descending order
    const allPlayers = _.sortBy(
      this.state.fakePlayers,
      p => p.cumulativeScore
    ).reverse();
    console.log(allPlayers);
    const alters = allPlayers.filter(p => alterIds.includes(p._id));
    const nonAlters = allPlayers.filter(p => nonAlterIds.includes(p._id));

    console.log("alters", alters);

    return (
      <Centered>
        <div className="round bp3-ui-text">
          <h1 className={"bp3-heading"}> Round overview </h1>

          <div className="instructions-text">
            <p>
              You will play <strong>{game.treatment.nRounds} rounds</strong>{" "}
              total
              {nStages > 1
                ? " and each round will consist of " + nStages + " stages."
                : "."}
            </p>

            <h3 className="bp3-heading">3. The Outcome Stage</h3>

            <p>
              in the <strong>Outcome</strong> stage, you will see your{" "}
              <strong>
                final guess (in this case it is{" "}
                {player.get("instructionsGuess")})
              </strong>{" "}
              vs. the actual correlation value{" "}
              <strong>(in this case 0.89)</strong>, and the score you have{" "}
              <strong>
                accumulated so far from previous rounds (e.g., total of{" "}
                {player.get("instructionsCumulativeScore")})
              </strong>{" "}
              and the additional score you have earned from this{" "}
              <strong style={{ color: player.get("instructionsScoreColor") }}>
                particular round (e.g., {player.get("instructionsScore")} )
              </strong>
              . You will also see the scores of all players, and you can choose
              who you want to follow in the next round. Use the unfollow and
              follow buttons to{" "}
              <strong>
                choose a maximum of {game.treatment.altersCount} players
              </strong>
              . You can take maximum{" "}
              <strong>{game.treatment.stageDuration}</strong> seconds to make
              your decisions.
            </p>
          </div>

          <div className="content">
            <div className="task">
              <div className="task-stimulus">
                <img src="/instructions/task.png" className="task-image" />
              </div>

              <div className="task-response">
                <form onSubmit={() => {}}>
                  <FormGroup>
                    <Label>Your guess of the correlation is: {guess}</Label>

                    <Slider
                      min={0}
                      max={1}
                      stepSize={0.01}
                      labelStepSize={0.25}
                      onChange={this.handleChange}
                      value={guess}
                      hideHandleOnEmpty
                      disabled
                    />
                  </FormGroup>
                  <div>
                    <HTMLTable>
                      <thead>
                        <tr>
                          <th>Your guess</th>
                          <th>Actual correlation</th>
                          <th>Score increment</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td align="center">
                            {player.get("instructionsGuess") ||
                              "No guess given"}
                          </td>
                          <td>{0.89}</td>
                          <td>
                            <strong
                              style={{
                                color: player.get("instructionsScoreColor")
                              }}
                            >
                              +{player.get("instructionsScore")}
                            </strong>
                          </td>
                        </tr>
                      </tbody>
                    </HTMLTable>
                  </div>
                </form>
              </div>
            </div>

            <div className="social-interaction revert">
              {rewiring
                ? [
                    this.renderLeftColumn(player, alters),
                    this.renderRightColumn(nonAlters)
                  ]
                : this.renderLeftColumn(player, alters)}
            </div>
          </div>

          <div className="instructions">
            <ButtonGroup className={"button-group"}>
              <Button
                type="button"
                onClick={onPrev}
                disabled={!hasPrev}
                icon="arrow-left"
              >
                Previous
              </Button>
              <Button
                type="button"
                onClick={onNext}
                disabled={!hasNext}
                rightIcon="arrow-right"
                intent="primary"
                alignText={"right"}
              >
                Next
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </Centered>
    );
  }

  // We sort the players based on their score in this round in order to color code
  // how we display their scores.
  // The highest 1/3 players are green, the lowest 1/3 are red, and the rest are orange.
  colorScores(players) {
    const playersList = Object.values(players);
    const sortedPlayers = playersList.sort(this.compareScores);
    const top3rd = Math.floor(playersList.length / 3);
    const bottom3rd = Math.floor(playersList.length - playersList.length / 3);
    console.log("sortedPlayers", sortedPlayers);
    sortedPlayers.forEach((player, i) => {
      console.log("one player", player);
      console.log("fake players", this.state.fakePlayers);
      if (i < top3rd) {
        this.state.fakePlayers[player._id].scoreColor = "green";
      } else if (i >= bottom3rd) {
        this.state.fakePlayers[player._id].scoreColor = "red";
      } else {
        this.state.fakePlayers[player._id].scoreColor = "orange";
      }
      this.forceUpdate();
      console.log("player._id", player._id);
      if (this.props.player._id === player._id) {
        console.log("I am inside");
        this.props.player.set(
          "instructionsScoreColor",
          this.state.fakePlayers[player._id].scoreColor
        );
      }
    });
  }

  // Helper function to sort players objects based on their score in the current round.
  compareScores(firstPlayer, secondPlayer) {
    const scoreA = firstPlayer.score;
    const scoreB = secondPlayer.score;

    let comparison = 0;
    if (scoreA > scoreB) {
      comparison = -1;
    } else if (scoreA < scoreB) {
      comparison = 1;
    }
    return comparison;
  }
}
