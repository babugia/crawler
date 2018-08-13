const KillMatrix = require('../model/kill_matrix.js');

const sleep = require('system-sleep');
const jsonfile = require('jsonfile');

var kill_matrix = [];


var Crawler = {
	request : null,
	cheerio : null,
    fs      : null,
	init : function(){
		Crawler.request = require('request');
		Crawler.cheerio = require('cheerio');
        Crawler.fs      = require('fs');
        Crawler.jsonfile = require('jsonfile');
        Crawler.getLinks();
        // Crawler.getAllMatches('https://www.hltv.org/stats/matches?matchType=BigEvents&event=3515');
        // Crawler.getMatchMatrix('https://www.hltv.org//stats/matches/performance/mapstatsid/69910/mousesports-vs-g2?matchType=BigEvents&event=3392');
    },
    getLinks: function () {
        sleep(140);
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
                }	
                
			});
		});
		
        
    },
	getEventInfo: function(link){
        // 'https://www.hltv.org/stats/matches?matchType=BigEvents&event=3530'

        sleep(140);
		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error1: ' + err);
            var $ = Crawler.cheerio.load(body);
            
            const matchesLink = $('.stats-section.stats-team.stats-sidebar').find("a").eq(3).attr('href');

            // console.log('https://www.hltv.org/'+matchesLink);
            Crawler.getAllMatches('https://www.hltv.org/'+matchesLink);

		});
    },
    getAllMatches: function (link) {
        sleep(140);
		var matchLink = '';
        var nextUrl = '';

		function getMatches(link) {
		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);

            var $ = Crawler.cheerio.load(body);

			$('.stats-table.matches-table.no-sort').find("tbody").find("tr").each(function () {

				 matchLink = $(this).find("td").eq(0).find("a").attr('href');
				Crawler.getMatch('https://www.hltv.org/'+matchLink);
				// sleep(1200);
			});

			nextUrl = $('.pagination-next').eq(0).attr('href');
                // console.log('https://www.hltv.org'+nextUrl);
                if(nextUrl != undefined){
                    getMatches('https://www.hltv.org'+nextUrl);
                }
		});


        }
        // console.log(link);
		getMatches(link);
    },
    getMatch: function (link) {
        sleep(140);

		Crawler.request(link, function(err, res, body){
			if(err)
                console.log('Error: ' + err);

            var $ = Crawler.cheerio.load(body);
            const performanceLink = $('.stats-top-menu-item.stats-top-menu-item-link').eq(1).attr('href');
            // console.log(performanceLink);
            Crawler.getMatchMatrix('https://www.hltv.org'+performanceLink);
        });
    },
	getMatchMatrix(link) {

        sleep(300);
        var fields = link.split("mapstatsid/");
        var quase = fields[1];
        fields = quase.split("/");
        const match_id = fields[0];

		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);

			var $ = Crawler.cheerio.load(body);

			var playerName = [];
			var team1PlayerName = [];
			var jump = 0;
			$('.killmatrix-topbar').eq(0).find("td").each(function () {

				if(jump > 0) {
					// console.log($(this).find("a").text().trim());
					team1PlayerName.push($(this).find("a").text().trim());
				}
				jump++;
			});

			

			// console.log(playerName);

			var killType = 'All';
			var player1 = '';
			var player2 = '';
			var player1Kills = '';
			var player2Kills = '';
			var kill_matrix_all = [];
			var kill_matrix_first_kills = [];
			var kill_matrix_awp = [];

			

			var team2PlayerName = [];
			var kills = [];
			var x = {};

			//KILL MATRIX ALL
			var tr = 0;
			$('.killmatrix-content').eq(0).find("tbody").find("tr").each(function () {

				if(tr > 0) {
					var td = 0;
					$(this).find("td").each(function () {
						if(td == 0) {
							// console.log($(this).find("a").text().trim());
							player2 = $(this).find("a").text().trim();

							team2PlayerName.push(player2);

						}
						if(td > 0){
							player1Kills = $(this).find(".team1-player-score").text().trim();
							player2Kills = $(this).find(".team2-player-score").text().trim();
							player1 = team1PlayerName[td-1];
							var matrix = new KillMatrix(killType, player1, player1Kills, player2, player2Kills);
							kill_matrix_all.push(matrix);

							x = {};

							x.team1playerKills = player1Kills;
							x.team2playerKills = player2Kills;

							kills.push(x);

						}
						td++;
					});
					
					// console.log(kill_matrix_all);
					
					
				}
				tr++;
				

			});

			var matrixJson = {};

			matrixJson.match_id = match_id;
			var all = {
				team1: [],
				team2: []
			};
			var teamUm = {
				players_kill: []
			};
			var teamDois = {
				 player_kills: []
			};

			for(var i =0; i < team1PlayerName.length; i++){
				var teamUm = {
					players_kill: []
				};
				teamUm.player = team1PlayerName[i];
				for(var j = 0; j< team2PlayerName.length;j++){
					var x = {};
					x.player = team2PlayerName[j];
					
					gamb = j*5+i;
					
					x.kills = kills[gamb].team1playerKills;

					const key = team2PlayerName[j];  
					const object = {   
						[key]: kills[gamb].team1playerKills
					};

					teamUm.players_kill.push(object);
					
				}
				// console.log(teamUm);
				all.team1.push(teamUm)
			}


			for(var i =0; i < team2PlayerName.length; i++){
				var teamDois = {
					players_kill: []
				};
				teamDois.player = team2PlayerName[i];

				for(var j = 0; j< team1PlayerName.length;j++){
					var x = {};
					x.player = team1PlayerName[j];
					
					gamb = i*5+j;
					
					x.kills = kills[gamb].team2playerKills;
					const key = team1PlayerName[j];  
					const object = {   
						[key]: kills[gamb].team2playerKills
					};

					teamDois.players_kill.push(object);
					
				}
				// console.log(teamDois);
				all.team2.push(teamDois)
			}

			matrixJson.all = all;

			// var kill_matrix = '';

			// kill_matrix_all.forEach(matrix => {
			// 	kill_matrix = match_id + ';' + matrix.killType + ';' + matrix.player1 + ';' + matrix.player1Kills + ';' + 
			// 		matrix.player2 + ';' + matrix.player2Kills + ';' +  '\n' ;
				
				
			// 	// Crawler.appendFile('kill_matrix.csv', kill_matrix);
			// })


            sleep(100);
			var kills = [];
			var x = {};

			//KILL MATRIX FIRST KILLS
			killType = 'First Kills';
			var tr = 0;
			$('.killmatrix-content').eq(1).find("tbody").find("tr").each(function () {

				if(tr > 0) {
					var td = 0;
					$(this).find("td").each(function () {
						if(td == 0) {
							// console.log($(this).find("a").text().trim());
							player2 = $(this).find("a").text().trim();
							// console.log(player2);

						}
						if(td > 0){
							player1Kills = $(this).find(".team1-player-score").text().trim();
							player2Kills = $(this).find(".team2-player-score").text().trim();
							player1 = team1PlayerName[td-1]
							var matrix = new KillMatrix(killType, player1, player1Kills, player2, player2Kills);
							kill_matrix_first_kills.push(matrix);

							x = {};

							x.team1playerKills = player1Kills;
							x.team2playerKills = player2Kills;


							kills.push(x);

						}
						td++;
					});
					
					// console.log(kill_matrix_first_kills);
					
					
				}
				tr++;
				

			});

			var first_kills = {
				team1: [],
				team2: []
			};
			var teamUm = {
				players_kill: []
			};
			var teamDois = {
				 player_kills: []
			};


			for(var i =0; i < team1PlayerName.length; i++){
				var teamUm = {
					players_kill: []
				};
				teamUm.player = team1PlayerName[i];
				for(var j = 0; j< team2PlayerName.length;j++){
					var x = {};
					x.player = team2PlayerName[j];
					gamb = j*5+i;

					
					x.kills = kills[gamb].team1playerKills;

					const key = team2PlayerName[j];  
					const object = {   
						[key]: kills[gamb].team1playerKills
					};

					teamUm.players_kill.push(object);
					
				}
				// console.log(teamUm);
				first_kills.team1.push(teamUm)
			}


			for(var i =0; i < team2PlayerName.length; i++){
				var teamDois = {
					players_kill: []
				};
				teamDois.player = team2PlayerName[i];

				for(var j = 0; j< team1PlayerName.length;j++){
					var x = {};
					x.player = team1PlayerName[j];
					
					gamb = i*5+j;
					
					x.kills = kills[gamb].team2playerKills;

					const key = team1PlayerName[j];  
					const object = {   
						[key]: kills[gamb].team2playerKills
					};

					teamDois.players_kill.push(object);
					
				}
				// console.log(teamDois);
				first_kills.team2.push(teamDois)
			}

			matrixJson.first_kills = first_kills;


			// kill_matrix = '';

			// kill_matrix_first_kills.forEach(matrix => {
			// 	kill_matrix = match_id + ';' + matrix.killType + ';' + matrix.player1 + ';' + matrix.player1Kills + ';' + 
			// 		matrix.player2 + ';' + matrix.player2Kills + ';' +  '\n' ;
			// 	// Crawler.appendFile('kill_matrix.csv', kill_matrix);
			// })

			var kills = [];
			var x = {};

            sleep(100);
			//KILL MATRIX AWP KILLS
			killType = 'Awp Kills';
			var tr = 0;
			$('.killmatrix-content').eq(2).find("tbody").find("tr").each(function () {

				if(tr > 0) {
					var td = 0;
					$(this).find("td").each(function () {
						if(td == 0) {
							// console.log($(this).find("a").text().trim());
							player2 = $(this).find("a").text().trim();

						}
						if(td > 0){
							player1Kills = $(this).find(".team1-player-score").text().trim();
							player2Kills = $(this).find(".team2-player-score").text().trim();
							player1 = playerName[td-1];
							var matrix = new KillMatrix(killType, player1, player1Kills, player2, player2Kills);
							kill_matrix_awp.push(matrix);

							x = {};

							x.team1playerKills = player1Kills;
							x.team2playerKills = player2Kills;


							kills.push(x);

						}
						td++;
					});
					
					// console.log(kill_matrix_awp);
					
					
				}
				tr++;
				

			});

			var awp = {
				team1: [],
				team2: []
			};
			var teamUm = {
				players_kill: []
			};
			var teamDois = {
				 player_kills: []
			};

			var player = {};

			for(var i =0; i < team1PlayerName.length; i++){
				var teamUm = {
					players_kill: []
				};
				teamUm.player = team1PlayerName[i];
				for(var j = 0; j< team2PlayerName.length;j++){
					var x = {};
					x.player = team2PlayerName[j];
					gamb = j*5+i;

					
					x.kills = kills[gamb].team1playerKills;

					const key = team2PlayerName[j];  
					const object = {   
						[key]: kills[gamb].team1playerKills
					};

					teamUm.players_kill.push(object);
					
				}
				// console.log(teamUm);
				awp.team1.push(teamUm)
			}


			for(var i =0; i < team2PlayerName.length; i++){
				var teamDois = {
					players_kill: []
				};
				teamDois.player = team2PlayerName[i];

				for(var j = 0; j< team1PlayerName.length;j++){
					var x = {};
					x.player = team1PlayerName[j];
					
					gamb = i*5+j;
					
					x.kills = kills[gamb].team2playerKills;

					const key = team1PlayerName[j];  
					const object = {   
						[key]: kills[gamb].team2playerKills
					};

					teamDois.players_kill.push(object);
					
				}
				// console.log(teamDois);
				awp.team2.push(teamDois)
			}

			matrixJson.awp = awp;

			// console.log(matrixJson);

			// Crawler.kill_matrix_json_array.push(matrixJson);
			// console.log(Crawler.kill_matrix_json_array);

			// jsonfile.writeFile('kill_matrix.json', matrixJson, {flag: 'a', spaces: 2}, function (err) {
			// 	console.error(err)
            // })
            
            kill_matrix.push(matrixJson);

            jsonfile.writeFile('match_kill_matrix.json', kill_matrix, {spaces: 2}, function (err) {
                console.error(err)
            })

			// kill_matrix = '';

			// kill_matrix_awp.forEach(matrix => {
			// 	kill_matrix = match_id + ';' + matrix.killType + ';' + matrix.player1 + ';' + matrix.player1Kills + ';' + 
			// 		matrix.player2 + ';' + matrix.player2Kills + ';' +  '\n' ;
			// })



		});

		
	}
};
Crawler.init();


