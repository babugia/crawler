const Player = require('./model/player.js')
const KillMatrix = require('./model/kill_matrix.js')
const RoundHistory = require('./model/round_history.js')

var Crawler = {
	request : null,
	cheerio : null,
	fs      : null,
	init : function(){
		Crawler.request = require('request');
		Crawler.cheerio = require('cheerio');
		Crawler.fs      = require('fs');
		// Crawler.deleteFileContent('kill_matrix.csv');
		// Crawler.deleteFileContent('match.csv');
		// Crawler.deleteFileContent('performance.csv');
		// Crawler.deleteFileContent('round_history.csv');
		Crawler.jsonfile = require('jsonfile');
		Crawler.getEventInfo();
	},
    appendFile: function (file, data) {
		
        Crawler.fs.appendFile(file, data, function (err) {
            if (err) {
                console.log('Erro ao gravar dados no arquivo: ' + err);
                throw err;
            }
        });
	},
	deleteFileContent: function(file){
		// Crawler.fs.unlink('./'+file, function (err) {
		// 	if (err) throw err;
		// 	console.log('File deleted!');
		//   });

		Crawler.fs.writeFile(file, '', function(){console.log(`${file} contend deleted`)})
	},
	getEventInfo: function(){
		//cabeçalho do arquivo
		// Crawler.appendFile('name;id;date;prize;location\n');

		// Crawler.appendFile('match.csv', 'match_id;event_id;date;team1;team1_score;team1_clutches;team1_rating;team1_firstkills;team2;team2_score;team2_clutches;team2_rating;team2_firstkills;map;event\n');

		// Crawler.appendFile('kill_matrix.csv', 'match_id;kill_type;player1;player1_kills;player2;player2_kills\n')

		// Crawler.appendFile('performance.csv', 'match_id;team1;player;kills;assists;deaths\n')

		// Crawler.appendFile('round_history.csv', 'match_id;team;ct_wins;tr_wins;defused;exploded\n')

		Crawler.request('https://www.hltv.org/stats/matches/mapstatsid/70102/natus-vincere-vs-big?matchType=BigEvents&event=3392', function(err, res, body){
			if(err)
				console.log('Error: ' + err);

			var $ = Crawler.cheerio.load(body);

				var idLink = $('.block.text-ellipsis').attr('href');
				var eventId = idLink.substring(idLink.length-4,idLink.length);

				idLink = $('.stats-top-menu-item-link.selected').attr('href');
				var matchId = idLink.substring(26, 31);

				var eventName = $('.menu-header').text().trim();
				console.log(eventName);
				var date = $('.match-info-box-con .small-text').find("span").eq(0).text().trim().substring(0,10);
				var team1 = $('.match-info-box-con .team-left a').text().trim();
				var team1_score = $('.match-info-box-con .team-left').find("div").eq(0).text().trim();
				var team2 = $('.match-info-box-con .team-right a').text().trim();
				var team2_score = $('.match-info-box-con .team-right').find("div").eq(0).text().trim();
				
				var team1_rating = $('.match-info-box-con .match-info-row').eq(1).find("div").eq(0).text().trim().substring(0,4);
				var team2_rating = $('.match-info-box-con .match-info-row').eq(1).find("div").eq(0).text().trim().substring(7,11);
				var firstKills = $('.match-info-box-con .match-info-row').eq(2).find("div").eq(0).text().trim();
				var fields = firstKills.split(':');
				var team1_firstkills = fields[0];
				var team2_firstkills = fields[1];

				var map = '';
				$('.col.stats-match-map.standard-box.a-reset').each(function () {
					if($(this).attr('href') == idLink) {
						map = $(this).find(".stats-match-map-result-mapname.dynamic-map-name-full").text().trim();
					}
					
				});

				var clutches = $('.match-info-box-con .match-info-row').eq(3).find("div").eq(0).text().trim();
				var fields = clutches.split(':');
				var team1_clutches = fields[0];
				var team2_clutches = fields[1];
				var player = {
					name: String,
					kills: String,
					assists: String,
					deaths: String,
					kast: String,
					adr: String,
					fkDiff: String,
					rating: String
				};
				var Team1Players = [];

				//ACERTAR O ARRAY
				$('.stats-table').find("tbody").eq(0).find("tr").each(function () {
					player.name = $(this).find("td").eq(0).text().trim();
					var kill = $(this).find("td").eq(1).text().trim();
					var fields = kill.split('(');
					player.kills = fields[0];
					var assist = $(this).find("td").eq(2).text().trim();
					fields = assist.split('(');
					player.assists = fields[0];
					player.deaths = $(this).find("td").eq(3).text().trim();
					player.kast = $(this).find("td").eq(4).text().trim();
					player.adr = $(this).find("td").eq(6).text().trim();
					player.fkDiff = $(this).find("td").eq(7).text().trim();
					player.rating = $(this).find("td").eq(8).text().trim();
					
					var x = new Player(player.name, player.kills, player.assists, player.deaths, player.kast, player.adr, player.fkDiff, player.rating);
					// console.log(player);
					Team1Players.push(x);	
					// console.log(Team1Players);
				});

				// console.log(Team1Players);

				var Team2Players = [];

				$('.stats-table').find("tbody").eq(1).find("tr").each(function () {
					player.name = $(this).find("td").eq(0).text().trim();
					var kill = $(this).find("td").eq(1).text().trim();
					var fields = kill.split('(');
					player.kills = fields[0];
					var assist = $(this).find("td").eq(2).text().trim();
					fields = assist.split('(');
					player.assists = fields[0];
					player.deaths = $(this).find("td").eq(3).text().trim();
					player.kast = $(this).find("td").eq(4).text().trim();
					player.adr = $(this).find("td").eq(6).text().trim();
					player.fkDiff = $(this).find("td").eq(7).text().trim();
					player.rating = $(this).find("td").eq(8).text().trim();
					
					var x = new Player(player.name, player.kills, player.assists, player.deaths, player.kast, player.adr, player.fkDiff, player.rating);
					// console.log(player);
					Team2Players.push(x);	
					// console.log(Team2Players);
				});

				//fix Round history, FZR CONTADORES E INCREMENTAR DE ACORDO COM O SRC

				var match = matchId + ';' + eventId + ';' + date + ';' + team1 + ';' + team1_score + ';' + team1_clutches + ';' + 
							team1_rating + ';' + team1_firstkills + ';' +  team2 + ';' + team2_score + ';' + team2_clutches + ';' + 
							team2_rating + ';' + team2_firstkills + ';' + map + ';' + eventName + ';' +  '\n'
				// Crawler.appendFile('match.csv', match);
				//  console.log(match);

				var performance = '';

				 Team1Players.forEach(player => {
					performance = matchId + ';' + team1 + ';' + player.name + ';' + player.kills + ';' + 
					player.assists + ';' + player.deaths + ';' + player.kast + ';' + player.adr + ';' + 
					player.fkDiff + ';' + player.rating + ';' +  '\n' ;

					//  Crawler.appendFile('performance.csv', performance);
				 })

				 Team2Players.forEach(player => {
					performance = matchId + ';' + team2 + ';' + player.name + ';' + player.kills + ';' + 
					player.assists + ';' + player.deaths + ';' + player.kast + ';' + player.adr + ';' + 
					player.fkDiff + ';' + player.rating + ';' +  '\n' ;

					//  Crawler.appendFile('performance.csv', performance);
				 })
				
				var performanceLink = $('.stats-top-menu-item.stats-top-menu-item-link').eq(1).attr('href');
				Crawler.getMatchMatrix('https://www.hltv.org/' + performanceLink, matchId);


				// console.log($('.match-info-row').eq(0).find("div").eq(0).find("span").eq(2).attr('class'));

				var side = '';
				if($('.match-info-row').eq(0).find("div").eq(0).find("span").eq(2).attr('class') == 'ct-color'){
					side= 'ct';
				}else {
					side = 'tr';
				}

				// console.log(side);

				let time1 = $('.round-history-team').eq(0).attr('title');
				// console.log(time1);

				var ct_wins = 0;
				var tr_wins = 0;
				var defused = 0;
				var exploded = 0;

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
					// console.log($(this).attr('src'));
					
				});
				// console.log(firstHalf);


				var secondHalf = new Array();
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
					// console.log($(this).attr('src'));
				});

				var round = new RoundHistory(time1, ct_wins, tr_wins, defused, exploded);
				// console.log(round);

				ct_wins = 0;
				 tr_wins = 0;
				 defused = 0;
				 exploded = 0;

				let time2 = $('.round-history-team').eq(1).attr('title');
				// console.log(time);

				 firstHalf = new Array();
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
					// console.log($(this).attr('src'));					
				});
				// console.log(firstHalf);

				 secondHalf = new Array();
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
					// console.log($(this).attr('src'));
					
				});

				var round1 = new RoundHistory(time2, ct_wins, tr_wins, defused, exploded);
				// console.log(round1);

				var round_history_team1 = '';
				round_history_team1 = matchId + ';' + round.team + ';' + round.ct_wins + ';' + round.tr_wins + ';' + round.defused + ';' + round.exploded + ';' + '\n';
				// Crawler.appendFile('round_history.csv', round_history_team1);

				var round_history_team2 = '';
				round_history_team2 = matchId + ';' + round1.team + ';' + round1.ct_wins + ';' + round1.tr_wins + ';' + round1.defused + ';' + round1.exploded + ';' + '\n';
				// Crawler.appendFile('round_history.csv', round_history_team2);
				
	 
		});
	},
	getMatchMatrix(link, matchId) {

		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);

			var $ = Crawler.cheerio.load(body);

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

			//new
			var team2PlayerName = [];
			var kills = [];
			var x = {};



			//KILL MATRIX ALL
			var tr = 0;
			$('.killmatrix-content').eq(0).find("tbody").find("tr").each(function () {

				if(tr > 0) {
					var td = 0;
					
					$(this).find("td").each(function () {
						player = {};
						if(td == 0) {
							// console.log($(this).find("a").text().trim());
							player2 = $(this).find("a").text().trim();

							//NEW
							team2PlayerName.push(player2);

						}
						if(td > 0){
							player1Kills = $(this).find(".team1-player-score").text().trim();
							player2Kills = $(this).find(".team2-player-score").text().trim();
							player1 = team1PlayerName[td-1];
							var matrix = new KillMatrix(killType, player2, player1Kills, player1, player2Kills);
							kill_matrix_all.push(matrix);

							//new
							
							x = {};

							x.team1playerKills = player1Kills;
							x.team2playerKills = player2Kills;

							kills.push(x);
							
						}
						td++;
					});
					
				}
				tr++;
				

			});

			var matrixJson = {};

			matrixJson.matchId = matchId;
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

					teamUm.players_kill.push(x);
					
				}
				// console.log(teamUm);
				all.team1.push(teamUm)
			}

			var player = {};

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

					teamDois.players_kill.push(x);
					
				}
				console.log(teamDois);
				all.team2.push(teamDois)
			}

			matrixJson.all = all;

			// console.log(all);


			var kill_matrix = '';

			kill_matrix_all.forEach(matrix => {
				kill_matrix = matchId + ';' + matrix.killType + ';' + matrix.player1 + ';' + matrix.player1Kills + ';' + 
					matrix.player2 + ';' + matrix.player2Kills + ';' +  '\n' ;
				// Crawler.appendFile('kill_matrix.csv', kill_matrix);
				// console.log(matrix)
			})


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

						}
						if(td > 0){
							player1Kills = $(this).find(".team1-player-score").text().trim();
							player2Kills = $(this).find(".team2-player-score").text().trim();
							player1 = team1PlayerName[td-1];
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

					teamUm.players_kill.push(x);
					
				}
				// console.log(teamUm);
				first_kills.team1.push(teamUm)
			}

			var player = {};

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

					teamDois.players_kill.push(x);
					
				}
				console.log(teamDois);
				first_kills.team2.push(teamDois)
			}

			matrixJson.first_kills = first_kills;

			// Crawler.jsonfile.writeFile('test.json', matrixJson, {flag: 'a', spaces: 2}, function (err) {
			// 	console.error(err)
			// })

			kill_matrix = '';

			kill_matrix_first_kills.forEach(matrix => {
				kill_matrix = matchId + ';' + matrix.killType + ';' + matrix.player1 + ';' + matrix.player1Kills + ';' + 
					matrix.player2 + ';' + matrix.player2Kills + ';' +  '\n' ;
				// Crawler.appendFile('kill_matrix.csv', kill_matrix);
			})

			var kills = [];
			var x = {};

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
							// player1Kills = $(this).find("span").eq(0).text().trim();
							// player2Kills = $(this).find("span").eq(1).text().trim();
							player1Kills = $(this).find(".team1-player-score").text().trim();
							player2Kills = $(this).find(".team2-player-score").text().trim();
							player1 = team1PlayerName[td-1];
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

					const key = team2PlayerName[j];  
					
					gamb = j*5+i;

					const object = {   
						[key]: kills[gamb].team1playerKills
					};
					
					x.kills = kills[gamb].team1playerKills;

					teamUm.players_kill.push(object);
					
				}
				// console.log(teamUm);
				awp.team1.push(teamUm)
			}

			var player = {};

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

					teamDois.players_kill.push(x);
					
				}
				console.log(teamDois);
				awp.team2.push(teamDois)
			}

			matrixJson.awp = awp;

			Crawler.jsonfile.writeFile('test.json', matrixJson, {flag: 'a', spaces: 2}, function (err) {
				console.error(err)
			})

			kill_matrix = '';

			kill_matrix_awp.forEach(matrix => {
				kill_matrix = matchId + ';' + matrix.killType + ';' + matrix.player1 + ';' + matrix.player1Kills + ';' + 
					matrix.player2 + ';' + matrix.player2Kills + ';' +  '\n' ;
				// Crawler.appendFile('kill_matrix.csv', kill_matrix);
			})

			// var performance = $('.graph.small').eq(0).find("data-fusionchart-config").text().trim();
			// var json = JSON.stringify(performance);
			// var performance = $(".facts").eq(0).find("div").eq(0);
			// var json = JSON.stringify(performance);
			// console.log(performance);

			//fix performance, get kpr, dpr e impact


		});

		
	}
};
Crawler.init();
