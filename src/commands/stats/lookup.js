const url = require('url');
const config = require('../../../config.json');
const Commando = require('discord.js-commando');
const RichEmbed = require('discord.js').RichEmbed;
const Sequelize = require('sequelize');
const SteamID = require('steamid');

class Lookup extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'lookup',
            group: 'stats',
            memberName: 'lookup',
            description: 'Lookup an individual player',
            args: [{
                key: 'steamId',
                required: true,
                type: 'string',
                prompt: 'Please specify a valid steam ID',
                validate: Lookup.validateArgument
            }]
        });
    }

    validateArgument(value) {
        let isValid = false;
        // Steam2 ID
        if (/^STEAM_([0-5]):([0-1]):([0-9]+)$/.test(value)) {
            isValid = true;
        }
        // Steam3 ID
        if (/^\[([a-zA-Z]):([0-5]):([0-9]+)(:[0-9]+)?\]$/.test(value)) {
            isValid = true;
        }
        // SteamID64
        if (/([0-9]{17})/.test(value)) {
            isValid = true
        }

        // Once we have established the input to look like expected, we check if Steam thinks it's valid aswell
        if (isValid) {
            let id = new SteamID(value);
            if (!id.isValid()) {
                isValid = false;
            }
            // Check if the ID is for a individual (not a gameserver, clan, ...)
            if (id.type !== 1) {
                isValid = false;
            }
        }

        return isValid;
    }

    async run(msg, args) {
        const dateStarted = Date.now();
        const id = new SteamID(args.steamId).steam2(true);
        let responseMessage = await msg.channel.send(`Crunching the numbers :nerd:`);
        const rawData = await findDataFromId(this.client, id);
        if (rawData === null || rawData === undefined) {
            return responseMessage.edit(`Did not find any data for that player. :frowning: `)
        }
        const data = rawData;


        const adr = data.adr;
        const kdr = data.kdr;
        const accuracy = data.accuracy;
        const headShotPercentage = data.hs_percent;

        let columnOne = new String();
        let columnTwo = new String();

        let resultEmbed = new RichEmbed({
            title: `Stats for ${data.name}`,
            description: `View the full profile on ${url.resolve(config.webserver.baseurl, '/player/' + data.id)}`
        });

        let counter = 0;
        for (const dataField of this.client.dataFields) {
            if (counter % 2 === 0) {
                columnOne += `**${dataField}**: ${data[dataField]}\n`;
            } else {
                columnTwo += `**${dataField}**: ${data[dataField]}\n`;
            }
            counter++
        }

        resultEmbed.addField('----------', columnOne, true);
        resultEmbed.addField('----------', columnTwo, true);
        resultEmbed.addBlankField();

        resultEmbed.addField('ADR', adr, true);
        resultEmbed.addField('Accuracy', accuracy, true);
        resultEmbed.addField('Headshot', headShotPercentage, true);

        const dateEnded = Date.now();
        resultEmbed.setFooter(`Took ${dateEnded - dateStarted} ms to get this data!`);
        return responseMessage.edit('', resultEmbed);
    }

}


module.exports = Lookup;


async function findDataFromId(client, id) {
    const foundData = await global.models.Player.findAll({
        where: {
            steam: id
        }
    });
    return foundData[0];
}