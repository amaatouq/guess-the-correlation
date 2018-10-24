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
  Label,
  RangeSlider
} from "@blueprintjs/core";

const avatarNames = "abcdefghijklmnopqrstuvwxyz".split("");

export default class OutcomeStage extends React.Component {
  handleReset = event => {
    const { game } = this.props;

    event.preventDefault();
    this.setState({ submitted: false });

    for (const [_id, fakePlayer] of Object.entries(this.state.fakePlayers)) {
      fakePlayer.submitted = false;
    }
    this.setState({ seconds: game.treatment.stageDuration });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.setState({ submitted: true });
  };

  constructor(props) {
    super(props);
    const { game, player } = this.props;

    let fakePlayers = {};

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
    for (let i = 0; i < game.treatment.playerCount - 1; i++) {
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
      social: game.treatment.playerCount === 0,
      submitted: false,
      time: {},
      seconds: game.treatment.stageDuration
    };

    this.timer = 0;
    this.startTimer = this.startTimer.bind(this);
    this.countDown = this.countDown.bind(this);

    const alterIds = _.sample(
      _.without(_.pluck(fakePlayers, "_id"), player._id),
      game.treatment.altersCount
    );

    player.set("instructionsAlterIds", alterIds);
  }

  componentDidMount() {
    this.colorScores(this.state.fakePlayers);
    let timeLeftVar = OutcomeStage.secondsToTime(this.state.seconds);
    this.setState({ time: timeLeftVar });
    this.startTimer();
  }

  static secondsToTime(secs) {
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    let obj = {
      h: hours,
      m: minutes,
      s: seconds
    };
    return obj;
  }

  startTimer() {
    if (this.timer === 0 && this.state.seconds > 0) {
      this.timer = setInterval(this.countDown, 1000);
    }
  }

  countDown() {
    let seconds = this.state.seconds - 1;

    if (!this.state.submitted) {
      // Remove one second, set state so a re-render happens.
      this.setState({
        time: OutcomeStage.secondsToTime(seconds),
        seconds: seconds
      });
    }

    // Check if we're at zero.
    if (seconds === 0) {
      this.setState({ submitted: true });
    }
  }

  static renderTimer(remainingSeconds) {
    const classes = ["timer"];
    if (remainingSeconds <= 5) {
      classes.push("lessThan5");
    } else if (remainingSeconds <= 10) {
      classes.push("lessThan10");
    }

    return (
      <div className={classes.join(" ")}>
        <h4 className="bp3-heading">Timer</h4>
        <span className="seconds">{remainingSeconds}</span>
      </div>
    );
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
        disabled={this.state.submitted}
      >
        Unfollow
      </Button>
    );
  }

  renderAlter(otherPlayer) {
    const { game } = this.props;
    const cumulativeScore = otherPlayer.cumulativeScore || 0;
    const roundScore = otherPlayer.score || 0;

    const feedbackTime = this.state.feedbackTime;

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

    const feedbackTime = this.state.feedbackTime;

    return (
      <div className="right" key="right" style={{ minWidth: "18rem" }}>
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
    const feedbackTime = this.state.feedbackTime;
    return (
      <div className="non-alter" key={otherPlayer._id}>
        <Button
          intent={"primary"}
          minimal={true}
          icon={"add"}
          onClick={this.handleFollow.bind(this, otherPlayer._id)}
          disabled={this.state.submitted}
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
      <div className="right" key="right" style={{ minWidth: "12rem" }}>
        <p>
          <strong>You can follow:</strong>
        </p>
        {this.renderNonAltersList(nonAlterIds)}
      </div>
    );
  }

  render() {
    const { hasPrev, hasNext, onNext, onPrev, game, player } = this.props;
    const remainingSeconds = this.state.time.s;

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
    const alters = allPlayers.filter(p => alterIds.includes(p._id));
    const nonAlters = allPlayers.filter(p => nonAlterIds.includes(p._id));

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

            <h3 className="bp3-heading">{nStages}. The Outcome Stage</h3>

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
              {game.treatment.altersCount > 1 ? (
                <span>
                  . You will also see the scores of all players, and you can
                  choose who you want to follow in the next round. Use the
                  unfollow and follow buttons to{" "}
                  <strong>
                    choose a maximum of {game.treatment.altersCount} players
                  </strong>
                </span>
              ) : null}
              . You can take maximum{" "}
              <strong>{game.treatment.stageDuration}</strong> seconds before
              moving to the next round.
            </p>
          </div>

          <div className="round">
            <div className="content">
              {/*Here is the playerProfile*/}
              <Card className={"player-profile"} style={{ width: "15rem" }}>
                <aside>
                  <div className="profile-score">
                    <h3 className="bp3-heading">Your Profile</h3>
                    <span className="image" style={{ width: "3rem" }}>
                      <span
                        className={`satisfied bp3-tag bp3-round ${
                          this.state.submitted
                            ? "bp3-intent-success"
                            : "bp3-intent-primary"
                        }`}
                      >
                        <span
                          className={`bp3-icon-standard ${
                            this.state.submitted
                              ? "bp3-icon-tick"
                              : "bp3-icon-refresh"
                          }`}
                        />
                      </span>

                      <img
                        className="profile-avatar"
                        src={`/avatars/jdenticon/${player._id}`}
                      />
                    </span>
                  </div>
                  {/*We always show individual level feedback*/}
                  <div className="profile-score">
                    <h4 className="bp3-heading">Total score</h4>
                    <Icon icon="dollar" iconSize={20} title={"dollar-sign"} />
                    <span>{player.get("instructionsCumulativeScore")}</span>
                  </div>
                  {OutcomeStage.renderTimer(remainingSeconds)}
                </aside>
              </Card>

              <div className="task">
                <div className="task-stimulus">
                  <img src="/instructions/task.png" className="task-image" />
                </div>

                <div className="task-response">
                  <form onSubmit={this.handleSubmit}>
                    <FormGroup>
                      <Label>Your guess of the correlation is: {guess}</Label>

                      <RangeSlider
                        className={"range-slider"}
                        disabled={true}
                        min={0}
                        max={1}
                        stepSize={0.01}
                        labelStepSize={0.25}
                        value={guess ? [guess, 0.89].sort() : [0.89, 0.89]}
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
                    {this.state.submitted ? (
                      <FormGroup>
                        <Button
                          icon={"refresh"}
                          minimal={true}
                          intent={"primary"}
                          large={true}
                          fill={true}
                          onClick={this.handleReset}
                        >
                          <span>
                            try again (will not be available in the game)
                          </span>
                        </Button>
                      </FormGroup>
                    ) : (
                      <FormGroup>
                        <Button
                          type="submit"
                          icon={"tick"}
                          large={true}
                          fill={true}
                        >
                          Submit
                        </Button>
                      </FormGroup>
                    )}
                  </form>
                </div>
              </div>

              {game.treatment.altersCount > 1 ? (
                <div
                  className="social-interaction revert"
                  style={{ width: "11rem" }}
                >
                  {rewiring
                    ? [
                        this.renderLeftColumn(player, alters),
                        this.renderRightColumn(nonAlters)
                      ]
                    : this.renderLeftColumn(player, alters)}
                </div>
              ) : null}
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
    if (sortedPlayers.length === 1) {
      console.log("I am in");
      this.props.player.set("instructionsScoreColor", null);
      return;
    }

    sortedPlayers.forEach((player, i) => {
      if (i < top3rd) {
        this.state.fakePlayers[player._id].scoreColor = "green";
      } else if (i >= bottom3rd) {
        this.state.fakePlayers[player._id].scoreColor = "red";
      } else {
        this.state.fakePlayers[player._id].scoreColor = "orange";
      }
      this.forceUpdate();
      if (this.props.player._id === player._id) {
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
