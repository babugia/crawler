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
		Crawler.getLinks();
	},
    getLinks: function () {
        var stats = Crawler.fs.statSync('./jsons/team_overview.json');
        const team_overview_size = stats.size;
        stats = Crawler.fs.statSync('./jsons/team_ftu.json');
        const team_ftu_size = stats.size;
        stats = Crawler.fs.statSync('./jsons/team_pistol.json');
        const team_pistol_size = stats.size;  
        
		Crawler.request('https://www.hltv.org/stats/events?matchType=BigEvents', function (err, res, body) {
			if (err)
				console.log('Erro ao recuperar dados da página: ' + err);

			var $ = Crawler.cheerio.load(body);
			var gamb = 0;
			var eventCount = 0;
			$('.stats-table.events-table .name-col').each(function () {
				var link = $(this).find('.name-col a').attr('href');
				
				gamb++;
				console.log('https://www.hltv.org/' + link);
				if(gamb!=1){
					Crawler.getEventInfo('https://www.hltv.org/' + link);
					
				
					eventCount++
					// console.log(`${eventCount} eventos salvos`);
                }	
                sleep(001);
			});
            // console.log(`TEM ${eventCount} EVENTOS`);

            //    jsonfile.writeFile('team_overview.json', overview, {spaces: 2}, function (err) {
            //         console.error(err)
            //     })

		});
		
        
    },
	getEventInfo: function(link){
        // 'https://www.hltv.org/stats/matches?matchType=BigEvents&event=3530'

        sleep(001);
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

        sleep(001);
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
                sleep(001);
           });

           jsonfile.writeFile('team_overview.json', overview, {spaces: 2}, function (err) {
				console.error(err)
			})
           Crawler.getTeamsFtu('https://www.hltv.org/'+ftuLink);
            
		});
    },
    getTeamsFtu(link) {
        sleep(001);

        Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);
            var $ = Crawler.cheerio.load(body);

            const pistolLink = $('.stats-section.stats-team.stats-sidebar').eq(1).find("a").eq(5).attr('href');
            
            $('.stats-table.player-ratings-table').eq(0).find("tbody").find("tr").each(function () {
                const team_id = $(this).find(".factor-team a").attr('href').substring(13, 17);
                const round_win_percentage = $(this).find("td").eq(2).text().trim();
                const opening_duel_percentage = $(this).find("td").eq(3).text().trim();
                const multi_kills_per_round_percentage = $(this).find("td").eq(4).text().trim();
                const win_5x4 = $(this).find("td").eq(5).text().trim();
                const win_4x5 = $(this).find("td").eq(6).text().trim();
                const deaths_traded = $(this).find("td").eq(7).text().trim();
                const adr = $(this).find("td").eq(8).text().trim();
                const fa = $(this).find("td").eq(8).text().trim();

                const team_ftu = {};
                team_ftu.team_id = team_id;
                team_ftu.round_win_percentage = round_win_percentage;
                team_ftu.opening_duel_percentage = opening_duel_percentage;
                team_ftu.multi_kills_per_round_percentage = multi_kills_per_round_percentage;
                team_ftu.win_5x4 = win_5x4;
                team_ftu.win_4x5 = win_4x5;
                team_ftu.deaths_traded = deaths_traded;
                team_ftu.adr = adr;
                team_ftu.fa = fa;

                ftu.push(team_ftu);
                sleep(001);
           });

           jsonfile.writeFile('team_ftu.json', ftu, {spaces: 2}, function (err) {
            		console.error(err)
            })
           //       FAZER UM LOOP PROCURANDO O TEAM_ID DO FTU E OVERVIEW, POIS NÃO ESTAO NA MESMA POSIÇÃO
           //       PERGUNTAR COMO FAZER ASYNC, 

            // const teams = {};

            // teams.id = team_overview.team_id + team_overview.event_id; //FAZER COM AUTO_INCREMENT OU SEILA OQ NO DB
            // teams.event_id = team_overview.event_id;
            // teams.name = team_overview.name;
            // teams.maps = team_overview.maps;
            // teams.kd_diff = team_overview.kd_diff;
            // teams.kd = team_overview.kd;
            // teams.rating = team_overview.rating;
            // teams.round_win_percentage = team_ftu.round_win_percentage;
            // teams.opening_duel_percentage = team_ftu.opening_duel_percentage;
            // teams.multi_kills_per_round_percentage = team_ftu.multi_kills_per_round_percentage;
            // teams.win_5x4 = team_ftu.win_5x4;
            // teams.win_4x5 = team_ftu.win_4x5;
            // teams.deaths_traded = team_ftu.deaths_traded;
            // tems.adr = team_ftu.adr;
            // teams.fa = team_ftu.fa;

        //    jsonfile.writeFile('teams.json', teams, {spaces: 2}, function (err) {
		// 		console.error(err)
        //     })
            
           Crawler.getTeamsPistol('https://www.hltv.org/'+pistolLink);
		});
    },
    getTeamsPistol(link) {
        sleep(001);
        Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);
            var $ = Crawler.cheerio.load(body);
            
            console.log(link);
            $('.stats-table.player-ratings-table').eq(0).find("tbody").find("tr").each(function () {
                const team_id = $(this).find("td").eq(0).find("a").attr('href').substring(13, 17);
                const win_percentage = $(this).find("td").eq(3).text().trim();
                const percentage_after_win_first = $(this).find("td").eq(4).text().trim();
                const forced_wins_percentage = $(this).find("td").eq(5).text().trim();

                const team_pistol = {};
                team_pistol.team_id = team_id;
                team_pistol.win_percentage = win_percentage;
                team_pistol.percentage_after_win_first = percentage_after_win_first;
                team_pistol.forced_wins_percentage = forced_wins_percentage;

                pistol.push(team_pistol);

                // jsonfile.writeFile('teams_pistol.json', pistol, {spaces: 2}, function (err) {
                //     console.error(err)
                // })
                sleep(001);
                
           });

        //    console.log(pistol);
           jsonfile.writeFile('team_pistol.json', pistol, {spaces: 2}, function (err) {
            console.error(err)
        })
		});
    }

};
Crawler.init();
