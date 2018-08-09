const sleep = require('system-sleep');
const jsonfile = require('jsonfile');

var overview =[];
var individual = [];
var opening_kills = [];

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
        
		Crawler.request('https://www.hltv.org/stats/events?matchType=BigEvents', function (err, res, body) {
			if (err)
				console.log('Erro ao recuperar dados da página: ' + err);

			var $ = Crawler.cheerio.load(body);
			var gamb = 0;
			var eventCount = 0;
			$('.stats-table.events-table .name-col').each(function () {
				var link = $(this).find('.name-col a').attr('href');
				
				gamb++;
				// console.log('https://www.hltv.org/' + link);
				if(gamb!=1){
					Crawler.getEventInfo('https://www.hltv.org/' + link);
					
				
					eventCount++
					// console.log(`${eventCount} eventos salvos`);
                }	
                sleep(300);
			});
            // console.log(`TEM ${eventCount} EVENTOS`);

            //    jsonfile.writeFile('player_overview.json', overview, {spaces: 2}, function (err) {
            //         console.error(err)
            //     })

		});
		
        
    },
	getEventInfo: function(link){
        // 'https://www.hltv.org/stats/matches?matchType=BigEvents&event=3530'

        sleep(300);
        // console.log('ta no eventInfo');
		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);
            var $ = Crawler.cheerio.load(body);
            
            const playerLink = $('.stats-section.stats-team.stats-sidebar').find("a").eq(1).attr('href');

            // console.log('https://www.hltv.org/'+playerLink);
            Crawler.getPlayers('https://www.hltv.org/'+playerLink);

		});
    },
    getPlayers(link){

        // console.log('ta no players');
        sleep(300);
        Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);
            var $ = Crawler.cheerio.load(body);
            
            const event_id = link.substring(link.length-4, link.length);
            // const individualLink = $('.stats-section.stats-team.stats-sidebar').find("a").eq(4).attr('href');

            $('.stats-table.player-ratings-table').find("tbody").find("tr").each(function () {

                const overviewLink = $(this).find(".playerCol a").attr('href');

                Crawler.getPlayersOverview('https://www.hltv.org/'+overviewLink);

                sleep(300);
           });
            
		});
    },
    getPlayersOverview(link){

        console.log(link);
        sleep(300);
        Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);
            var $ = Crawler.cheerio.load(body);
            
            const event_id = link.substring(link.length-4, link.length);
            var fields = link.split("players/");
            const quase = fields[1];
            fields = quase.split("/");
             player_id = fields[0];
            const full_name = $(".statsPlayerName").text().trim();
             fields = full_name.split("'");
            const quase2 = fields[1];
            fields = quase2.split("'");
            const name = fields[0];
            const age = $(".large-strong").eq(1).text().trim();
            const country = $(".large-strong").eq(2).text().trim();
             team_id = $(".large-strong.text-ellipsis").attr('href').substring(13, 17);

            const total_kills = $(".stats-row").eq(0).find("span").eq(1).text().trim();
            const hs_percentage = $(".stats-row").eq(1).find("span").eq(1).text().trim();
            const total_deaths = $(".stats-row").eq(2).find("span").eq(1).text().trim();
            const kd_ratio = $(".stats-row").eq(3).find("span").eq(1).text().trim();
            const dmg_round = $(".stats-row").eq(4).find("span").eq(1).text().trim();
            const granade_dmg_round = $(".stats-row").eq(5).find("span").eq(1).text().trim();
            const maps_played = $(".stats-row").eq(6).find("span").eq(1).text().trim();
            const rounds_played = $(".stats-row").eq(7).find("span").eq(1).text().trim();
            const saved_by_teammate = $(".stats-row").eq(11).find("span").eq(1).text().trim();
            const saved_teammates = $(".stats-row").eq(12).find("span").eq(1).text().trim();
            const rating = $(".stats-row").eq(13).find("span").eq(1).text().trim();

            const player_overview = {};

            player_overview.event_id = event_id;

            player_overview.id = player_id;
            player_overview.team_id = team_id;
            player_overview.name = name;
            player_overview.age = age;
            player_overview.country = country;


            player_overview.total_kills = total_kills;
            player_overview.hs_percentage = hs_percentage;
            player_overview.total_deaths = total_deaths;
            player_overview.kd_ratio = kd_ratio;
            player_overview.dmg_round = dmg_round;
            player_overview.granade_dmg_round = granade_dmg_round;
            player_overview.maps_played = maps_played;
            player_overview.rounds_played = rounds_played;
            player_overview.saved_by_teammate = saved_by_teammate;
            player_overview.saved_teammates = saved_teammates;
            player_overview.rating = rating;

            overview.push(player_overview);

            const individualLink = $(".stats-top-menu-item-link").eq(1).attr('href');
            sleep(300);
            // console.log('https://www.hltv.org/'+individualLink);

           jsonfile.writeFile('player_overview.json', overview, {spaces: 2}, function (err) {
				console.error(err)
			})
           Crawler.getPlayersIndividual('https://www.hltv.org/'+individualLink);
            // console.log(overview);
        });
        
        
    },
    getPlayersIndividual(link) {

        Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);
            var $ = Crawler.cheerio.load(body);
            
            const event_id = link.substring(link.length-4, link.length);

            //OPENING STATS
            const total_opening_kills = $(".stats-row").eq(6).find("span").eq(1).text().trim();
            const total_opening_deaths = $(".stats-row").eq(7).find("span").eq(1).text().trim();
            const opening_kill_ratio = $(".stats-row").eq(8).find("span").eq(1).text().trim();
            const opening_kill_rating = $(".stats-row").eq(9).find("span").eq(1).text().trim();
            const team_win_after_first_kill = $(".stats-row").eq(10).find("span").eq(1).text().trim();
            const first_kill_won_rounds = $(".stats-row").eq(11).find("span").eq(1).text().trim();


            const player_individual = {};
            player_individual.event_id = event_id;
            player_individual.player_id = player_id;
            player_individual.team_id = team_id;

            player_individual.total_opening_kills = total_opening_kills;
            player_individual.total_opening_deaths = total_opening_deaths;
            player_individual.opening_kill_ratio = opening_kill_ratio;
            player_individual.opening_kill_rating = opening_kill_rating;
            player_individual.team_win_after_first_kill = team_win_after_first_kill;
            player_individual.first_kill_won_rounds = first_kill_won_rounds;

            //ROUND STATS

            const zero_kill_rounds = $(".stats-row").eq(12).find("span").eq(1).text().trim();
            const one_kill_rounds = $(".stats-row").eq(13).find("span").eq(1).text().trim();
            const two_kill_rounds = $(".stats-row").eq(14).find("span").eq(1).text().trim();
            const three_kill_rounds = $(".stats-row").eq(15).find("span").eq(1).text().trim();
            const four_kill_rounds = $(".stats-row").eq(16).find("span").eq(1).text().trim();
            const five_kill_rounds = $(".stats-row").eq(17).find("span").eq(1).text().trim();

            player_individual.zero_kill_rounds = zero_kill_rounds;
            player_individual.one_kill_rounds = one_kill_rounds;
            player_individual.two_kill_rounds = two_kill_rounds;
            player_individual.three_kill_rounds = three_kill_rounds;
            player_individual.four_kill_rounds = four_kill_rounds;
            player_individual.five_kill_rounds = five_kill_rounds;

            //WEAPON STATS

            const rifle_kills = $(".stats-row").eq(18).find("span").eq(1).text().trim();
            const sniper_kills = $(".stats-row").eq(19).find("span").eq(1).text().trim();
            const smg_kills = $(".stats-row").eq(20).find("span").eq(1).text().trim();
            const pistol_kills = $(".stats-row").eq(21).find("span").eq(1).text().trim();
            const granade_kills = $(".stats-row").eq(22).find("span").eq(1).text().trim();

            player_individual.rifle_kills = rifle_kills;
            player_individual.sniper_kills = sniper_kills;
            player_individual.smg_kills = smg_kills;
            player_individual.pistol_kills = pistol_kills;
            player_individual.granade_kills = granade_kills;

            individual.push(player_individual);
            sleep(300);

            jsonfile.writeFile('player_individual.json', individual, {spaces: 2}, function (err) {
				console.error(err)
			})

        });
    }

};
Crawler.init();
