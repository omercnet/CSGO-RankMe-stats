$(document).ready(async () => {
    const overviewTable = $("#overview").DataTable({
        order: [
            [2, "desc"]
        ],
        columns: [{
                render: function (data, type, row, meta) {
                    return `<a href="/player/${row.id}">${row.name}</a>`
                }
            }, {
                data: 'score',
            }, {
                data: 'adr',
            }, {
                data: 'kdr'
            }, {
                data: 'hs_percent'
            }, {
                data: 'kills'
            }, {
                data: 'deaths'
            }
        ]
    });

    const playerData = await getPlayers();
    const historicalData = await getHistoricalData();

    drawDataTable(playerData, overviewTable)

    const groupedData = _.groupBy(historicalData, 'steam')
    const richData = [];

    for (const steamId of Object.keys(groupedData)) {
        const playerData = groupedData[steamId]

        const oldKills = playerData[0].kills;
        const newKills = playerData[playerData.length - 1].kills
        const killsDifference = newKills - oldKills

        const oldScore = playerData[0].score;
        const newScore = playerData[playerData.length - 1].score
        const scoreDifference = newScore - oldScore
        
        const oldADR = playerData[0].adr;
        const newADR = playerData[playerData.length - 1].adr
        const adrDifference = newADR - oldADR
        
        richData.push({
            steamId,
            name: playerData[0].name,
            killsDifference,
            scoreDifference,
            adrDifference
        })
    }

    const sortedByKills = _.orderBy(richData, 'killsDifference', 'desc');
    const sortedByScore = _.orderBy(richData, 'scoreDifference', 'desc');
    const sortedByADR = _.orderBy(richData, 'adrDifference', 'desc');

    const mostKillsPlayer = _.find(playerData, {
        steam: sortedByKills[0].steamId
    });
    const mostScorePlayer = _.find(playerData, {
        steam: sortedByScore[0].steamId
    });
    const mostADRPlayer = _.find(playerData, {
        steam: sortedByADR[0].steamId
    });

    const topKillsNames = [];
    const topKillsData = [];
    const topScoreNames = [];
    const topScoreData = [];
    const topADRNames = [];
    const topADRData = [];

    for (let index = 0; index < 10; index++) {
        
        // Score
        let runnerUpPlayer = _.find(playerData, {
            steam: sortedByScore[index].steamId
        });
        topScoreNames.push(runnerUpPlayer.name)
        topScoreData.push(groupedData[runnerUpPlayer.steam].map(d => d.score));
        $("#score-inc ol").append(`<li><a href="/player/${runnerUpPlayer.id}"><span class="tab">${runnerUpPlayer.name}</span></a> +${sortedByScore[index].scoreDifference} </li>`);

        // Kills
        runnerUpPlayer = _.find(playerData, {
            steam: sortedByKills[index].steamId
        });
        topKillsNames.push(runnerUpPlayer.name)
        topKillsData.push(groupedData[runnerUpPlayer.steam].map(d => d.kills));
        $("#kills-inc ol").append(`<li><a href="/player/${runnerUpPlayer.id}"><span class="tab">${runnerUpPlayer.name}</span></a> +${sortedByKills[index].killsDifference} </li>`);

        // ADR
        runnerUpPlayer = _.find(playerData, {
            steam: sortedByADR[index].steamId
        });
        topADRNames.push(runnerUpPlayer.name)
        topADRData.push(groupedData[runnerUpPlayer.steam].map(d => d.adr));
        $("#adr-inc ol").append(`<li><a href="/player/${runnerUpPlayer.id}"><span class="tab">${runnerUpPlayer.name}</span></a> +${sortedByADR[index].adrDifference} </li>`);
    }

    drawLineChart(topScoreNames, topScoreData, groupedData[sortedByScore[0].steamId].map(d => d.createdAt), 'score-increase-chart')
    drawLineChart(topKillsNames, topKillsData, groupedData[sortedByScore[0].steamId].map(d => d.createdAt), 'kills-increase-chart')
    drawLineChart(topADRNames, topADRData, groupedData[sortedByScore[0].steamId].map(d => d.createdAt), 'adr-increase-chart')

});