const Player = require('./model/player.js')
const KillMatrix = require('./model/kill_matrix.js')
const RoundHistory = require('./model/round_history.js')
const Team = require('./model/team.js')
const Performance = require('./model/performance.js')

var Crawler = {
	request : null,
	cheerio : null,
	fs      : null,
	sleep: null,
	jsonfile: null,
	init : function(){
		Crawler.request = require('request');
		Crawler.cheerio = require('cheerio');
		Crawler.fs      = require('fs');
		Crawler.sleep = require('system-sleep');
		Crawler.jsonfile = require('jsonfile');
		// Crawler.deleteFileContent('kill_matrix.csv');
		// Crawler.deleteFileContent('match.csv');
		// Crawler.deleteFileContent('performance.csv');
		// Crawler.deleteFileContent('round_history.csv');
		// Crawler.deleteFileContent('events.csv');
		Crawler.getLinks();
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
		Crawler.fs.writeFile(file, '', function(){console.log(`${file} contend deleted`)})
	},
	getLinks: function () {
        //cabeçalho do arquivo
		// Crawler.appendFile('events.csv', 'name;id;date;prize;location\n');
		// Crawler.appendFile('match.csv', 'match_id;event_id;date;team1;team1_score;team1_clutches;team1_rating;team1_firstkills;team2;team2_score;team2_clutches;team2_rating;team2_firstkills;map;event\n');

		// Crawler.appendFile('kill_matrix.csv', 'match_id;kill_type;player1;player1_kills;player2;player2_kills\n')

		// Crawler.appendFile('performance.csv', 'match_id;team1;player;kills;assists;deaths;kast;adr;fkDiff;rating\n')+

		// Crawler.appendFile('round_history.csv', 'match_id;team;ct_wins;tr_wins;defused;exploded\n')
				
		//recupera dados de cada página de consulta
		Crawler.request('https://www.hltv.org/stats/events?matchType=BigEvents', function (err, res, body) {
			if (err)
				console.log('Erro ao recuperar dados da página: ' + err);

			// console.log('entrou');
			var $ = Crawler.cheerio.load(body);
			var gamb = 0;
			var eventCount = 0;
			var sleep = require('system-sleep');
			//recupera links e conteudo dos artigos na página
			$('.stats-table.events-table .name-col').each(function () {
				var link = $(this).find('.name-col a').attr('href');
				
				gamb++;
				console.log('https://www.hltv.org/' + link);
				if(gamb!=1){
					Crawler.getEventInfo('https://www.hltv.org/' + link);
					// sleep(1000);
				
					eventCount++
					console.log(`${eventCount} eventos salvos`);
				}	
			});
			// console.log(`TEM ${eventCount} EVENTOS`);
		});
        
    },
	getEventInfo: function (link) {
		//cabeçalho do arquivo
		// Crawler.appendFile('events.csv', 'name;id;date;prize;location\n');
		// console.log(link);
		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);

			var $ = Crawler.cheerio.load(body);

			var name = $('.eventname').text().trim();
			var id = $('.event-header-component.event-holder.header a').attr('href').substring(8,12);
			var date = $('.eventdate').text().trim();
			var fields = date.split('Date');
			var date = fields[1];
			var prize = $('.info').find( "tr" ).eq( 1 ).find( "td" ).eq( 1 ).text().trim();
			var teams = $('.info').find( "tr" ).eq( 1 ).find( "td" ).eq( 2 ).text().trim();
			var location = $('.flag-align').text().trim();

			var matchesLink = $('.stats-section.stats-team.stats-sidebar').find('.sidebar-single-line-item').eq(3).attr('href').trim();
			// console.log('https://www.hltv.org/'+matchesLink);

			Crawler.getAllMatches('https://www.hltv.org/'+matchesLink);

			var data = name + ';' + id + ';' + date + ';' + prize + ';' + location + ';' + '\n';

			var eventsJson = {};

			eventsJson.name = name;
			eventsJson.id = id;
			eventsJson.date = date;
			eventsJson.prize = prize;
			eventsJson.location = location;

			// Crawler.jsonfile.writeFile('events.json', eventsJson, {flag: 'a', spaces: 2}, function (err) {
			// 	console.error(err)
			// })

			// Crawler.appendFile('events.csv', data);
			// console.log(data);
		});
	},
	getAllMatches: function (link) {

		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);

			var $ = Crawler.cheerio.load(body);

			$('.stats-table.matches-table.no-sort').find("tbody").find("tr").each(function () {
				// var link = $(this).find('.name-col a').attr('href');
				// console.log('oi');
				// console.log('https://www.hltv.org/'+$(this).find("td").eq(0).find("a").attr('href'));

				var matchLink = $(this).find("td").eq(0).find("a").attr('href');
				Crawler.getMatch('https://www.hltv.org/'+matchLink);
			});
		});
	},
	getMatch: function (link) {
		//cabeçalho do arquivo
		// Crawler.appendFile('name;id;date;prize;location\n');


		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);

			var $ = Crawler.cheerio.load(body);

				var idLink = $('.block.text-ellipsis').attr('href');
				var eventId = idLink.substring(idLink.length-4,idLink.length);

				idLink = $('.stats-top-menu-item-link.selected').attr('href');
				var matchId = idLink.substring(26, 31);

				var eventName = $('.menu-header').text().trim();
				// console.log(eventName);
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

				var matchJson = {};

				matchJson.matchId = matchId;
				matchJson.eventId = eventId;
				matchJson.eventName = eventName;
				matchJson.map = map;
				var teamUm = {};
				teamUm.name = team1;
				teamUm.score = team1_score;
				teamUm.clutches = team1_clutches;
				teamUm.firstKills = team1_firstkills;
				teamUm.rating = team1_rating;
				matchJson.team1 = teamUm;
				var teamDois = {};
				teamDois.name = team2;
				teamDois.score = team2_score;
				teamDois.clutches = team2_clutches;
				teamDois.firstKills = team2_firstkills;
				teamDois.rating = team2_rating;
				matchJson.team2 = teamDois;


				// console.log(matchJson);

				// Crawler.jsonfile.writeFile('match.json', matchJson, {flag: 'a', spaces: 2}, function (err) {
				// 	console.error(err)
				// })

				var performance = '';
				
				var performanceJson = {};
				performanceJson.matchId = matchId;
				performanceJson.team1 = [];
				performanceJson.team2 = [];

				// var jsonfile = require('jsonfile')

				 Team1Players.forEach(player => {
					performance = matchId + ';' + team1 + ';' + player.name + ';' + player.kills + ';' + 
					player.assists + ';' + player.deaths + ';' + player.kast + ';' + player.adr + ';' + 
					player.fkDiff + ';' + player.rating + ';' +  '\n' ;

					var player1 = {
						name: player.name,
						kills: player.kills,
						assists: player.assists,
						deaths: player.deaths,
						kast: player.kast,
						adr: player.adr,
						fkDiff: player.fkDiff,
						rating: player.rating
					}
					performanceJson.team1.push(player1);

					//  Crawler.appendFile('performance.csv', performance);
					 
				 })

				 Team2Players.forEach(player => {
					performance = matchId + ';' + team2 + ';' + player.name + ';' + player.kills + ';' + 
					player.assists + ';' + player.deaths + ';' + player.kast + ';' + player.adr + ';' + 
					player.fkDiff + ';' + player.rating + ';' +  '\n' ;

					//  Crawler.appendFile('performance.csv', performance);

					var player2 = {
						name: player.name,
						kills: player.kills,
						assists: player.assists,
						deaths: player.deaths,
						kast: player.kast,
						adr: player.adr,
						fkDiff: player.fkDiff,
						rating: player.rating
					}
					performanceJson.team2.push(player2);
				 })

				//  var x = new Team(Team1Players);
				//  var y = new Team(Team2Players);
				//  var perf = new Performance(matchId, x, y);

				 
				//  Crawler.appendFile('performance.json', JSON.stringify(jsonTest));

				// Crawler.jsonfile.writeFile('performance.json', performanceJson, {flag: 'a', spaces: 2}, function (err) {
				// 	console.error(err)
				//   })
				
				var performanceLink = $('.stats-top-menu-item.stats-top-menu-item-link').eq(1).attr('href');
				// Crawler.getMatchMatrix('https://www.hltv.org/' + performanceLink, matchId);

				//  console.log('https://www.hltv.org/' + performanceLink);

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

				var roundHistoryJson = {};
				roundHistoryJson.matchId = matchId;
				var teamUm = {};
				teamUm.name = time1;
				teamUm.ctWins = round.ctWins;
				teamUm.trWins = round.tr_wins;
				teamUm.defused = round.defused;
				teamUm.exploded = round.exploded;
				roundHistoryJson.team1 = teamUm;
				var teamDois = {};
				teamDois.name = time2;
				teamDois.ctWins = round1.ctWins;
				teamDois.trWins = round1.tr_wins;
				teamDois.defused = round1.defused;
				teamDois.exploded = round1.exploded;
				roundHistoryJson.team2 = teamDois;

				// Crawler.jsonfile.writeFile('round_history.json', roundHistoryJson, {flag: 'a', spaces: 2}, function (err) {
				// 	console.error(err)
				// })
				
	 
		});
	},
	getMatchMatrix(link, matchId) {

		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);

			var $ = Crawler.cheerio.load(body);

			var playerName = [];
			var jump = 0;
			$('.killmatrix-topbar').eq(0).find("td").each(function () {

				if(jump > 0) {
					// console.log($(this).find("a").text().trim());
					playerName.push($(this).find("a").text().trim());
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

			var matrixJson = {};

			matrixJson.matchId = matchId;
			var all = {
				team1: []
			};
			var teamUm = {
				players: []
			};
			let player = {};


			//KILL MATRIX ALL
			var tr = 0;
			$('.killmatrix-content').eq(0).find("tbody").find("tr").each(function () {

				if(tr > 0) {
					var td = 0;
					$(this).find("td").each(function () {
						if(td == 0) {
							// console.log($(this).find("a").text().trim());
							player1 = $(this).find("a").text().trim();

						}
						if(td > 0){
							player1Kills = $(this).find("span").eq(0).text().trim();
							player2Kills = $(this).find("span").eq(1).text().trim();
							player2 = playerName[td-1];
							var matrix = new KillMatrix(killType, player1, player1Kills, player2, player2Kills);
							kill_matrix_all.push(matrix);

						}
						td++;
					});
					
					// console.log(kill_matrix_all);
					
					
				}
				tr++;
				

			});

			var kill_matrix = '';

			kill_matrix_all.forEach(matrix => {
				kill_matrix = matchId + ';' + matrix.killType + ';' + matrix.player1 + ';' + matrix.player1Kills + ';' + 
					matrix.player2 + ';' + matrix.player2Kills + ';' +  '\n' ;

				
				// Crawler.appendFile('kill_matrix.csv', kill_matrix);
			})

			



			//KILL MATRIX FIRST KILLS
			killType = 'First Kills';
			var tr = 0;
			$('.killmatrix-content').eq(1).find("tbody").find("tr").each(function () {

				if(tr > 0) {
					var td = 0;
					$(this).find("td").each(function () {
						if(td == 0) {
							// console.log($(this).find("a").text().trim());
							player1 = $(this).find("a").text().trim();

						}
						if(td > 0){
							player1Kills = $(this).find("span").eq(0).text().trim();
							player2Kills = $(this).find("span").eq(1).text().trim();
							player2 = playerName[td-1];
							var matrix = new KillMatrix(killType, player1, player1Kills, player2, player2Kills);
							kill_matrix_first_kills.push(matrix);

						}
						td++;
					});
					
					// console.log(kill_matrix_first_kills);
					
					
				}
				tr++;
				

			});

			kill_matrix = '';

			kill_matrix_first_kills.forEach(matrix => {
				kill_matrix = matchId + ';' + matrix.killType + ';' + matrix.player1 + ';' + matrix.player1Kills + ';' + 
					matrix.player2 + ';' + matrix.player2Kills + ';' +  '\n' ;
				// Crawler.appendFile('kill_matrix.csv', kill_matrix);
			})

			//KILL MATRIX AWP KILLS
			killType = 'Awp Kills';
			var tr = 0;
			$('.killmatrix-content').eq(2).find("tbody").find("tr").each(function () {

				if(tr > 0) {
					var td = 0;
					$(this).find("td").each(function () {
						if(td == 0) {
							// console.log($(this).find("a").text().trim());
							player1 = $(this).find("a").text().trim();

						}
						if(td > 0){
							player1Kills = $(this).find("span").eq(0).text().trim();
							player2Kills = $(this).find("span").eq(1).text().trim();
							player2 = playerName[td-1];
							var matrix = new KillMatrix(killType, player1, player1Kills, player2, player2Kills);
							kill_matrix_awp.push(matrix);

						}
						td++;
					});
					
					// console.log(kill_matrix_awp);
					
					
				}
				tr++;
				

			});

			kill_matrix = '';

			kill_matrix_awp.forEach(matrix => {
				kill_matrix = matchId + ';' + matrix.killType + ';' + matrix.player1 + ';' + matrix.player1Kills + ';' + 
					matrix.player2 + ';' + matrix.player2Kills + ';' +  '\n' ;
				// Crawler.appendFile('kill_matrix.csv', kill_matrix);
			})



			// Crawler.jsonfile.writeFile('kill_matrix.json', matrixJson, {flag: 'a', spaces: 2}, function (err) {
			// 	console.error(err)
			// })


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
