const Commando = require('discord.js-commando');
const RichEmbed = require('discord.js').RichEmbed;
const Sequelize = require('sequelize');

class Stats extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            group: 'stats',
            memberName: 'stats',
            description: 'Shows server wide statistics'
        });
    }

    async run(msg, args) {

        let resultEmbed = new RichEmbed({
            title: `:globe_with_meridians: Global statistics`
        });

        let totalPlayers = await this.client.Player.count();
        resultEmbed.setFooter(`Tracking ${totalPlayers} players!`)
            .setColor('RANDOM')
            .setTimestamp()

        let topScorePlayer = await this.client.Player.findAll({
            attributes: ['name', 'score'],
            limit: 3,
            order: [
                ['score', 'DESC']
            ],
            where: {
                kills: {
                    [Sequelize.Op.gt]: this.client.config.discordBot.minimumKillsBeforeStatsCalc
                }
            }
        });

        let topKDRPlayer = await this.client.Player.findAll({
            attributes: ['name', [this.client.sequelize.literal("round(`kills` / `deaths`,2)"), "kdr"]],
            limit: 3,
            order: [
                [this.client.sequelize.literal('kdr'), 'DESC']
            ],
            where: {
                kills: {
                    [Sequelize.Op.gt]: this.client.config.discordBot.minimumKillsBeforeStatsCalc
                }
            }
        });

        let topADRPlayer = await this.client.Player.findAll({
            attributes: ['name', [this.client.sequelize.literal("round(`damage` / (`rounds_ct` + `rounds_tr`))"), "adr"]],
            limit: 3,
            order: [
                [this.client.sequelize.literal('adr'), 'DESC']
            ],
            where: {
                kills: {
                    [Sequelize.Op.gt]: this.client.config.discordBot.minimumKillsBeforeStatsCalc
                }
            }
        });

        let topTKPlayer = await this.client.Player.findAll({
            attributes: ['name', 'tk'],
            limit: 3,
            order: [
                ['tk', 'DESC']
            ],
            where: {
                kills: {
                    [Sequelize.Op.gt]: this.client.config.discordBot.minimumKillsBeforeStatsCalc
                }
            }
        });

        let mostAccuratePlayer = await this.client.Player.findAll({
            attributes: ['name', [this.client.sequelize.literal("concat(round((`hits` / `shots`) * 100),'%')"), 'accuracy']],
            limit: 3,
            order: [
                [this.client.sequelize.literal('accuracy'), 'DESC']
            ],
            where: {
                kills: {
                    [Sequelize.Op.gt]: this.client.config.discordBot.minimumKillsBeforeStatsCalc
                }
            }
        });

        let mostHeadshotPercentagePlayer = await this.client.Player.findAll({
            attributes: ['name', [this.client.sequelize.literal("concat(round((`headshots` / `kills`) * 100),'%')"), 'hs_percent']],
            limit: 3,
            order: [
                [this.client.sequelize.literal('hs_percent'), 'DESC']
            ],
            where: {
                kills: {
                    [Sequelize.Op.gt]: this.client.config.discordBot.minimumKillsBeforeStatsCalc
                }
            }
        });

        let leastHitsPerKill = await this.client.Player.findAll({
            attributes: ['name', [this.client.sequelize.literal("concat(round(`hits` / `kills`, 2), ' hits per kill')"), 'efficiency']],
            limit: 3,
            order: [
                [this.client.sequelize.literal('efficiency'), 'ASC']
            ],
            where: {
                kills: {
                    [Sequelize.Op.gt]: this.client.config.discordBot.minimumKillsBeforeStatsCalc
                }
            }
        });

        let bestWinRate = await this.client.Player.findAll({
            attributes: ['name', 'match_win', 'match_draw', 'match_lose', [this.client.sequelize.literal("concat(round( (`match_win` / (`match_win` + `match_draw` + `match_lose`)) * 100), '%')"), 'winLossRatio'],
                         [this.client.sequelize.literal("(`match_win` / (`match_win` + `match_draw` + `match_lose`))"), 'wlr']],
            limit: 3,
            order: [
                [this.client.sequelize.literal('wlr'), 'DESC']
            ],
            where: {
                kills: {
                    [Sequelize.Op.gt]: this.client.config.discordBot.minimumKillsBeforeStatsCalc
                }
            }
        });

        let topKnifeKills = await this.client.Player.findAll({
            attributes: ['name', 'knife'],
            limit: 3,
            order: [
                ['knife', 'DESC']
            ],
            where: {
                kills: {
                    [Sequelize.Op.gt]: this.client.config.discordBot.minimumKillsBeforeStatsCalc
                }
            }
        });

        let topTaserKills = await this.client.Player.findAll({
            attributes: ['name', 'taser'],
            limit: 3,
            order: [
                ['taser', 'DESC']
            ],
            where: {
                kills: {
                    [Sequelize.Op.gt]: this.client.config.discordBot.minimumKillsBeforeStatsCalc
                }
            }
        });

        let topMvp = await this.client.Player.findAll({
            attributes: ['name', 'mvp'],
            limit: 3,
            order: [
                ['mvp', 'DESC']
            ],
            where: {
                kills: {
                    [Sequelize.Op.gt]: this.client.config.discordBot.minimumKillsBeforeStatsCalc
                }
            }
        });


        if (topScorePlayer.length === 0) {
            return msg.channel.send(`No players were found! Please check that your database has info in it.`)
        }

        resultEmbed.addField(`:star: Top score`, generateTopThreeString(topScorePlayer, "score", this.client.config), true);
        resultEmbed.addField(`:star2: Top KDR`, generateTopThreeString(topKDRPlayer, "kdr", this.client.config), true);
        resultEmbed.addField(`:right_facing_fist: Top ADR`, generateTopThreeString(topADRPlayer, "adr", this.client.config), true);
        resultEmbed.addField(`:poop:  Most teamkills`, generateTopThreeString(topTKPlayer, "tk", this.client.config), true);
        resultEmbed.addField(`:gun:  Most accurate`, generateTopThreeString(mostAccuratePlayer, "accuracy", this.client.config), true);
        resultEmbed.addField(`:cowboy: Headshot`, generateTopThreeString(mostHeadshotPercentagePlayer, "hs_percent", this.client.config), true);
        resultEmbed.addField(`:dart: Most efficient`, generateTopThreeString(leastHitsPerKill, "efficiency", this.client.config), true);
        resultEmbed.addField(`:trophy: Best win/loss ratio`, generateTopThreeString(bestWinRate, "winLossRatio", this.client.config), true);
        resultEmbed.addField(`:dagger: Most knife kills`, generateTopThreeString(topKnifeKills, "knife", this.client.config), true);
        resultEmbed.addField(`:zap: Most zeus kills`, generateTopThreeString(topTaserKills, "taser", this.client.config), true);
        resultEmbed.addField(`:crown: Most MVPs`, generateTopThreeString(topMvp, "mvp", this.client.config), true);

        return msg.channel.send(resultEmbed);

    }

}


module.exports = Stats;

function generateTopThreeString(players, field, config) {
    let returnString = new String();
    let counter = 1;

    if (players.length === 0) {
        return "No players found."
    }

    for (const player of players) {

        let prefixText = counter;

        if (config.discordBot.stats_showMedals) {
            if (counter == 1) {
                prefixText = ":first_place: "
            }

            if (counter == 2) {
                prefixText = ":second_place: "
            }

            if (counter == 3) {
                prefixText = ":third_place: "
            }
        }

        returnString += `${prefixText}. ${player.dataValues.name} - ${player.dataValues[field]}\n`;
        counter++
    }
    return returnString
}