const sleep = require('system-sleep');
const jsonfile = require('jsonfile');

var overview = [];
var round_history = [];


var Crawler = {
	request : null,
	cheerio : null,
    fs      : null,
    jsonfile: null,
	init : function(){
		Crawler.request = require('request');
		Crawler.cheerio = require('cheerio');
        Crawler.fs      = require('fs');
        Crawler.jsonfile = require('jsonfile');
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
				// console.log('https://www.hltv.org/' + link);
				if(gamb!=1){
					Crawler.getEventInfo('https://www.hltv.org/' + link);
					
				
					eventCount++
					// console.log(`${eventCount} eventos salvos`);
                }	
                sleep(300);
			});
            // console.log(`TEM ${eventCount} EVENTOS`);

            //    jsonfile.writeFile('team_overview.json', overview, {spaces: 2}, function (err) {
            //         console.error(err)
            //     })

		});
		
        
    },
	getEventInfo: function(link){
        // 'https://www.hltv.org/stats/matches?matchType=BigEvents&event=3530'

        sleep(300);
		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);
            var $ = Crawler.cheerio.load(body);
            
            const matchesLink = $('.stats-section.stats-team.stats-sidebar').find("a").eq(3).attr('href');

            // console.log('https://www.hltv.org/'+matchesLink);
            Crawler.getAllMatches('https://www.hltv.org/'+matchesLink);

		});
    },
	getAllMatches: function (link) {

        // var link = 'https://www.hltv.org/stats/matches?matchType=BigEvents&event=3392';
        var matchLink = '';
        var nextUrl = '';

         function getMatches(link) {
            Crawler.request(link, function(err, res, body){
                if(err)
                    console.log('Error: ' + err);

                var $ = Crawler.cheerio.load(body);

                 $('.stats-table.matches-table.no-sort').find("tbody").find("tr").each(function () {

                    matchLink = $(this).find("td").eq(0).find("a").attr('href');
                    console.log('https://www.hltv.org/'+matchLink);
                    const map = $(this).find('.dynamic-map-name-full').text().trim();
                    Crawler.getMatchOverview('https://www.hltv.org/'+matchLink, map);
                    Crawler.getMatchRoundHistory('https://www.hltv.org/'+matchLink);
                    
                });

                nextUrl = $('.pagination-next').eq(0).attr('href');
                // console.log('https://www.hltv.org'+nextUrl);
                if(nextUrl != undefined){
                    getMatches('https://www.hltv.org'+nextUrl);
                }
            
            });
        }

        getMatches(link);
        // console.log(this.nextUrl);
	},
	getMatchOverview: function (link, map) {
        sleep(200);

        Crawler.request(link, function(err, res, body){
            if(err)
                console.log('Error: ' + err);
                
            var $ = Crawler.cheerio.load(body);

            var fields = link.split("mapstatsid/");
            var quase = fields[1];
            fields = quase.split("/");
            const match_id = fields[0];            
            const event_id = link.substring(link.length-4, link.length);
            const date = $('.small-text').find("span").eq(0).text().trim();
            const team1 = $('.team-left').find("a").text().trim();
            const team2 = $('.team-right').find("a").text().trim();
            const team1_score = $('.match-info-row').eq(0).find(".right").find("span").eq(0).text().trim();
            const team2_score = $('.match-info-row').eq(0).find(".right").find("span").eq(1).text().trim();
            const ratings = $('.match-info-row').eq(1).find(".right").text().trim();
            fields = ratings.split(":");
            const team1_rating = fields[0];
            const team2_rating = fields[1];
            const first_kills = $('.match-info-row').eq(2).find(".right").text().trim();
            fields = first_kills.split(":");
            const team1_first_kills = fields[0];
            const team2_first_kills = fields[1];
            const clutches = $('.match-info-row').eq(3).find(".right").text().trim();
            fields = clutches.split(":");
            const team1_clutches = fields[0];
            const team2_clutches = fields[1];
            
            const match_overview = {};

            match_overview.id = match_id;
            match_overview.event_id = event_id;
            match_overview.map = map;
            match_overview.date = date;
            match_overview.team1 = team1;
            match_overview.team2 = team2;
            match_overview.team1_score = team1_score;
            match_overview.team2_score = team2_score;
            match_overview.team1_rating = team1_rating;
            match_overview.team2_rating = team2_rating;
            match_overview.team1_first_kills = team1_first_kills;
            match_overview.team2_first_kills = team2_first_kills;
            match_overview.team1_clutches = team1_clutches;
            match_overview.team2_clutches = team2_clutches;

            overview.push(match_overview);

            // console.log(overview);

            jsonfile.writeFile('match_overview.json', overview, {spaces: 2}, function (err) {
				console.error(err)
			})
        });

        
	},
	getMatchRoundHistory: function (link) {
        sleep(200);

        Crawler.request(link, function(err, res, body){
            if(err)
                console.log('Error: ' + err);
                
            var $ = Crawler.cheerio.load(body);

            var fields = link.split("mapstatsid/");
            var quase = fields[1];
            fields = quase.split("/");
            const match_id = fields[0];
            const event_id = link.substring(link.length-4, link.length);
            let team1 = $('.round-history-team').eq(0).attr('src');
            fields = team1.split("team/");
            quase = fields[1];
            fields = quase.split("/");
            const team1_id =  fields[1];

            let team2 = $('.round-history-team').eq(1).attr('src');
             fields = team2.split("team/");
             quase = fields[1];
            fields = quase.split("/");
            const team2_id =  fields[1];

            var ct_wins = 0;
            var tr_wins = 0;
            var defused = 0;
            var exploded = 0;

            var side = '';
            if($('.match-info-row').eq(0).find("div").eq(0).find("span").eq(2).attr('class') == 'ct-color'){
                side= 'ct';
            }else {
                side = 'tr';
            }

            $('.round-history-half').eq(0).find("img").each(function () {
                if(side == 'ct'){
                    if($(this).attr('src') == '//static.hltv.org/images/scoreboard/ct_win.svg'){
                        ct_wins++;
                    }else if($(this).attr('src') == '//static.hltv.org/images/scoreboard/bomb_defused.svg'){
                        defused++;
                    }
                }else if(side == 'tr'){
                    if($(this).attr('src') == '//static.hltv.org/images/scoreboard/t_win.svg'){
                        tr_wins++;
                    }else if($(this).attr('src') == '//static.hltv.org/images/scoreboard/bomb_exploded.svg'){
                        exploded++;
                    }
                }					
            });


            $('.round-history-half').eq(1).find("img").each(function () {
                if(side == 'tr'){
                    if($(this).attr('src') == '//static.hltv.org/images/scoreboard/ct_win.svg'){
                        ct_wins++;
                    }else if($(this).attr('src') == '//static.hltv.org/images/scoreboard/bomb_defused.svg'){
                        defused++;
                    }
                }else if(side == 'ct'){
                    if($(this).attr('src') == '//static.hltv.org/images/scoreboard/t_win.svg'){
                        tr_wins++;
                    }else if($(this).attr('src') == '//static.hltv.org/images/scoreboard/bomb_exploded.svg'){
                        exploded++;
                    }
                }
            });

            const team1_round_history = {};
            team1_round_history.ct_wins = ct_wins;
            team1_round_history.tr_wins = tr_wins;
            team1_round_history.defused = defused;
            team1_round_history.exploded = exploded;

            ct_wins = 0;
            tr_wins = 0;
            defused = 0;
            exploded = 0;

            let time2 = $('.round-history-team').eq(1).attr('title');

            $('.round-history-half').eq(2).find("img").each(function () {
                if(side == 'tr'){
                    if($(this).attr('src') == '//static.hltv.org/images/scoreboard/ct_win.svg'){
                        ct_wins++;
                    }else if($(this).attr('src') == '//static.hltv.org/images/scoreboard/bomb_defused.svg'){
                        defused++;
                    }
                }else if(side == 'ct'){
                    if($(this).attr('src') == '//static.hltv.org/images/scoreboard/t_win.svg'){
                        tr_wins++;
                    
                }else if($(this).attr('src') == '//static.hltv.org/images/scoreboard/bomb_exploded.svg'){
                        exploded++;
                    }
                }
            });

            $('.round-history-half').eq(3).find("img").each(function () {
                if(side == 'ct'){
                    if($(this).attr('src') == '//static.hltv.org/images/scoreboard/ct_win.svg'){
                        ct_wins++;
                    }else if($(this).attr('src') == '//static.hltv.org/images/scoreboard/bomb_defused.svg'){
                        defused++;
                    }
                }else if(side == 'tr'){
                    if($(this).attr('src') == '//static.hltv.org/images/scoreboard/t_win.svg'){
                        tr_wins++;
                    }else if($(this).attr('src') == '//static.hltv.org/images/scoreboard/bomb_exploded.svg'){
                        exploded++;
                    }
                }    
            });
        
            const team2_round_history = {};
            team2_round_history.ct_wins = ct_wins;
            team2_round_history.tr_wins = tr_wins;
            team2_round_history.defused = defused;
            team2_round_history.exploded = exploded;

            const match_round_history = {};
            match_round_history.match_id = match_id;
            match_round_history.event_id = event_id;
            // match_round_history.team1_id = team1_id;
            // match_round_history.team2_id = team2_id;
            match_round_history.team1 = team1_round_history;
            match_round_history.team2 = team2_round_history;

            round_history.push(match_round_history);

            jsonfile.writeFile('match_round_history.json', round_history, {spaces: 2}, function (err) {
				console.error(err)
			})
            // console.log('MATCH_HISTORY = '+round_history);

        });
	}
};
Crawler.init();


