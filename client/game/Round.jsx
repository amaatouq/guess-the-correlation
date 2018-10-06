import React from "react";

import PlayerProfile from "./PlayerProfile";
import SocialExposure from "./SocialExposure";
import SocialInteraction from "./SocialInteraction.jsx";
import Task from "./Task";

export default class Round extends React.Component {
    render() {
        const { round, stage, player, game } = this.props;
        const social = game.treatment.altersCount > 0;
        return (
            <div className="round">
                <div className="content">
                    <PlayerProfile
                        player={player}
                        round={round}
                        stage={stage}
                        game={game}
                    />
                    <Task player={player} round={round} stage={stage} game={game} />
                    {social && stage.name === "interactive" ? (
                        <SocialExposure
                            player={player}
                            round={round}
                            stage={stage}
                            game={game}
                        />
                    ) : null}
                    {social && stage.name === "outcome" ? (
                        <SocialInteraction
                            player={player}
                            round={round}
                            stage={stage}
                            game={game}
                        />
                    ) : null}
                </div>
            </div>
        );
    }
}
