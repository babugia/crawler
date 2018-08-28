const sleep = require('system-sleep');
const jsonfile = require('jsonfile');

var overview =[];
var ftu = [];
var pistol = [];

var Crawler = {
	request : null,
	cheerio : null,
	fs      : null,
	fileName: null,
	init : function(){
		Crawler.request = require('request');
		Crawler.cheerio = require('cheerio');
		Crawler.fs      = require('fs');
		Crawler.fileName = 'event.csv';
		Crawler.getRank();
    },
    appendFile: function (file, data) {
		
        Crawler.fs.appendFile(file, data, function (err) {
            if (err) {
                console.log('Erro ao gravar dados no arquivo: ' + err);
                throw err;
            }
        });
	},
    getRank: function () {
        
		Crawler.request('https://www.hltv.org/ranking/teams', function (err, res, body) {
			if (err)
				console.log('Erro ao recuperar dados da página: ' + err);

            var $ = Crawler.cheerio.load(body);

            

            Crawler.appendFile('teams_ranking.csv', 'id;name;points\n');
            
            
			$('.ranked-team.standard-box').each(function () {
                // var link = $(this).find('.name-col a').attr('href');
                
                const name = $(this).find(".teamLine.sectionTeamPlayers").find("span").eq(0).text().trim();
                const pontos = $(this).find(".teamLine.sectionTeamPlayers").find("span").eq(1).text().trim();

                var x = pontos.substring(1, pontos.length-1).split(" ");

                const points = x[0];
                console.log(name + " = " + points);
                
                const link = $(this).find(".details.moreLink").attr('href');
                // console.log(link);
                var fields = link.split("details");
                const id = fields[1].substring(1, fields[1].length);
                // console.log(id);

                var ranking = id + ';' + name + ';' + points + '\n'
                Crawler.appendFile('teams_ranking.csv', ranking);

                sleep(80);
                
			});
            // console.log(`TEM ${eventCount} EVENTOS`);

            //    jsonfile.writeFile('team_overview.json', overview, {spaces: 2}, function (err) {
            //         console.error(err)
            //     })
            const date = $('.regional-ranking-header').text().trim();

            console.log('date = '+date);

		});
		
        
    },
	getEventInfo: function(link){
        // 'https://www.hltv.org/stats/matches?matchType=BigEvents&event=3530'

        sleep(80);
		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);
            var $ = Crawler.cheerio.load(body);
            
            const teamLink = $('.stats-section.stats-team.stats-sidebar').find("a").eq(2).attr('href');

            // console.log('https://www.hltv.org/'+teamLink);
            Crawler.getTeams('https://www.hltv.org/'+teamLink);

		});
    },
    getTeams(link){

        sleep(80);
        Crawler.request(link, async function(err, res, body){
			if(err)
				console.log('Error: ' + err);
            var $ = Crawler.cheerio.load(body);
            
            const event_id = link.substring(link.length-4, link.length);
            const ftuLink = $('.stats-section.stats-team.stats-sidebar').find("a").eq(4).attr('href');

            $('.stats-table.player-ratings-table').find("tbody").find("tr").each(function () {
                const team_id = $(this).find(".teamCol-teams-overview a").attr('href').substring(13, 17);
                const name = $(this).find(".teamCol-teams-overview a").text().trim();
                const maps = $(this).find(".statsDetail").eq(0).text().trim();
                const kd_diff = $(this).find(".kdDiffCol").text().trim();
                const kd = $(this).find(".statsDetail").eq(1).text().trim();
                const rating = $(this).find(".ratingCol").text().trim();

                const team_overview = {};
                team_overview.team_id = team_id;
                team_overview.event_id = event_id;
                team_overview.name = name;
                team_overview.maps = maps;
                team_overview.kd_diff = kd_diff;
                team_overview.kd = kd;
                team_overview.rating = rating;

                overview.push(team_overview);
                sleep(80);
           });

           jsonfile.writeFile('team_overview.json', overview, {spaces: 2}, function (err) {
				console.error(err)
			})
           Crawler.getTeamsFtu('https://www.hltv.org/'+ftuLink, event_id);
            
		});
    }

};
Crawler.init();
