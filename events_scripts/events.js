
var eventsArray = [];
var performanceArray = [];
var matchesArray = [];
var roundHistoryArray = [];
const sleep = require('system-sleep');
const jsonfile = require('jsonfile');

var map = '';

// const mysql = require('mysql');

// const connection = mysql.createConnection({
//     host     : 'localhost',
//     port     : 3306,
//     user     : 'root',
//     password : 'databasetcc2018',
//     database : 'champion_prediction'
//   });

//   function execSQLQuery(sqlQry){
//     connection.query(sqlQry, function(error, results, fields){
//         // console.log('executou!');
//     });
//   }

var months = [undefined, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


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
		// Crawler.appendFile('events.csv', 'name;id;start_date;end_date;prize;location\n');
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
			//recupera links e conteudo dos artigos na página
			$('.stats-table.events-table .name-col').each(function () {
				var link = $(this).find('.name-col a').attr('href');
				
				gamb++;
				// console.log('https://www.hltv.org/' + link);
				if(gamb!=1){
					Crawler.getEventInfo('https://www.hltv.org/' + link);
					sleep(200);
				
					eventCount++
					// console.log(`${eventCount} eventos salvos`);
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
			var test = date.split(' ');
			var startDate = '';
			startDate = startDate.concat(test[5]);
			startDate = startDate.concat('-');
			let month = months.indexOf(test[0]);
			// console.log(month);
			if(month < 10){
				let zero = "0";
				month = zero.concat(month);
			}
			// console.log('update = '+month);
			startDate = startDate.concat(month); 
			startDate = startDate.concat('-');
			startDate = startDate.concat(test[1].match(/[0-9]+/g))

			var endDate = '';
			endDate = endDate.concat(test[5]);
			endDate = endDate.concat('-');
			month = months.indexOf(test[3]);
			// console.log(month);
			if(month < 10){
				let zero = "0";
				month = zero.concat(month);
			}
			endDate = endDate.concat(month); 
			
			endDate = endDate.concat('-');
			endDate = endDate.concat(test[4].match(/[0-9]+/g))
			
			// console.log(endDate);

			var prize = $('.info').find( "tr" ).eq( 1 ).find( "td" ).eq( 1 ).text().trim();
			prize = prize.substring(1, prize.length);
			prize = prize.replace(/,/g, '.');
			// console.log(prize);

			var teams = $('.info').find( "tr" ).eq( 1 ).find( "td" ).eq( 2 ).text().trim();
			var location = $('.flag-align').text().trim();

			var matchesLink = $('.stats-section.stats-team.stats-sidebar').find('.sidebar-single-line-item').eq(3).attr('href').trim();
			// console.log('https://www.hltv.org/'+matchesLink);

			// Crawler.getAllMatches('https://www.hltv.org/'+matchesLink);
			sleep(200);

			var data = name.toString() + ';' + id + ';' + startDate + ';' + endDate + ';' + prize + ';' + location + '\n';

			
			var eventsJson = {};

			eventsJson.name = name;
			eventsJson.id = id;
			eventsJson.start_date = startDate;
			eventsJson.end_date = endDate;
			eventsJson.prize = prize;
			eventsJson.location = location;

		
			eventsArray.push(eventsJson);

			// console.log(eventsArray.length);

			jsonfile.writeFile('events.json', eventsArray, {spaces: 2}, function (err) {
				console.error(err)
			})

			// Crawler.appendFile('events.csv', data);
			// console.log(data);
		});
	},
	getAllMatches: function (link) {

		var matchLink = '';
        var nextUrl = '';

		function getMatches(link) {
		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);

			var $ = Crawler.cheerio.load(body);

			$('.stats-table.matches-table.no-sort').find("tbody").find("tr").each(function () {

				 matchLink = $(this).find("td").eq(0).find("a").attr('href');
				 map = $(this).find('.dynamic-map-name-full').text().trim();
				Crawler.getMatch('https://www.hltv.org/'+matchLink, map);
				sleep(200);
			});

			nextUrl = $('.pagination-next').eq(0).attr('href');
                // console.log('https://www.hltv.org'+nextUrl);
                if(nextUrl != undefined){
                    getMatches('https://www.hltv.org'+nextUrl);
                }
		});


		}
		getMatches(link);
	},
	getMatch: function (link, map) {

		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);

			// var mapa = map;

			var $ = Crawler.cheerio.load(body);

				// var idLink = $('.block.text-ellipsis').attr('href');
				// var eventId = idLink.substring(idLink.length-4,idLink.length);

				// idLink = $('.stats-top-menu-item-link.selected').attr('href');
				// var matchId = idLink.substring(26, 31);

				// var eventName = $('.menu-header').text().trim();
				// // console.log(eventName);
				// var date = $('.match-info-box-con .small-text').find("span").eq(0).text().trim().substring(0,10);
				// var team1 = $('.match-info-box-con .team-left a').text().trim();
				// var team1_score = $('.match-info-box-con .team-left').find("div").eq(0).text().trim();
				// var team2 = $('.match-info-box-con .team-right a').text().trim();
				// var team2_score = $('.match-info-box-con .team-right').find("div").eq(0).text().trim();
				
				// var team1_rating = $('.match-info-box-con .match-info-row').eq(1).find("div").eq(0).text().trim().substring(0,4);
				// var team2_rating = $('.match-info-box-con .match-info-row').eq(1).find("div").eq(0).text().trim().substring(7,11);
				// var firstKills = $('.match-info-box-con .match-info-row').eq(2).find("div").eq(0).text().trim();
				// var fields = firstKills.split(':');
				// var team1_firstkills = fields[0];
				// var team2_firstkills = fields[1];


				// var clutches = $('.match-info-box-con .match-info-row').eq(3).find("div").eq(0).text().trim();
				// var fields = clutches.split(':');
				// var team1_clutches = fields[0];
				// var team2_clutches = fields[1];
				// var player = {
				// 	name: String,
				// 	kills: String,
				// 	assists: String,
				// 	deaths: String,
				// 	kast: String,
				// 	adr: String,
				// 	fkDiff: String,
				// 	rating: String
				// };
				// var Team1Players = [];

				// $('.stats-table').find("tbody").eq(0).find("tr").each(function () {
				// 	player.name = $(this).find("td").eq(0).text().trim();
				// 	var kill = $(this).find("td").eq(1).text().trim();
				// 	var fields = kill.split('(');
				// 	player.kills = fields[0];
				// 	var assist = $(this).find("td").eq(2).text().trim();
				// 	fields = assist.split('(');
				// 	player.assists = fields[0];
				// 	player.deaths = $(this).find("td").eq(3).text().trim();
				// 	player.kast = $(this).find("td").eq(4).text().trim();
				// 	player.adr = $(this).find("td").eq(6).text().trim();
				// 	player.fkDiff = $(this).find("td").eq(7).text().trim();
				// 	player.rating = $(this).find("td").eq(8).text().trim();
					
				// 	var x = new Player(player.name, player.kills, player.assists, player.deaths, player.kast, player.adr, player.fkDiff, player.rating);
				// 	// console.log(player);
				// 	Team1Players.push(x);	
				// 	// console.log(Team1Players);
				// });

				// // console.log(Team1Players);

				// var Team2Players = [];

				// $('.stats-table').find("tbody").eq(1).find("tr").each(function () {
				// 	player.name = $(this).find("td").eq(0).text().trim();
				// 	var kill = $(this).find("td").eq(1).text().trim();
				// 	var fields = kill.split('(');
				// 	player.kills = fields[0];
				// 	var assist = $(this).find("td").eq(2).text().trim();
				// 	fields = assist.split('(');
				// 	player.assists = fields[0];
				// 	player.deaths = $(this).find("td").eq(3).text().trim();
				// 	player.kast = $(this).find("td").eq(4).text().trim();
				// 	player.adr = $(this).find("td").eq(6).text().trim();
				// 	player.fkDiff = $(this).find("td").eq(7).text().trim();
				// 	player.rating = $(this).find("td").eq(8).text().trim();
					
				// 	var x = new Player(player.name, player.kills, player.assists, player.deaths, player.kast, player.adr, player.fkDiff, player.rating);
				// 	// console.log(player);
				// 	Team2Players.push(x);	
				// 	// console.log(Team2Players);
				// });

				// var match = matchId + ';' + eventId + ';' + date + ';' + team1 + ';' + team1_score + ';' + team1_clutches + ';' + 
				// 			team1_rating + ';' + team1_firstkills + ';' +  team2 + ';' + team2_score + ';' + team2_clutches + ';' + 
				// 			team2_rating + ';' + team2_firstkills + ';' + map + ';' + eventName + ';' +  '\n'
				// // Crawler.appendFile('match.csv', match);
				// //  console.log(match);

				// var matchJson = {};

				// matchJson.matchId = matchId;
				// matchJson.eventId = eventId;
				// matchJson.eventName = eventName;
				// matchJson.map = mapa;
				// var teamUm = {};
				// teamUm.name = team1;
				// teamUm.score = team1_score;
				// teamUm.clutches = team1_clutches;
				// teamUm.firstKills = team1_firstkills;
				// teamUm.rating = team1_rating;
				// matchJson.team1 = teamUm;
				// var teamDois = {};
				// teamDois.name = team2;
				// teamDois.score = team2_score;
				// teamDois.clutches = team2_clutches;
				// teamDois.firstKills = team2_firstkills;
				// teamDois.rating = team2_rating;
				// matchJson.team2 = teamDois;


				// // console.log(matchJson);

				// // console.log('passou no matchjson');

				// // jsonfile.writeFile('match.json', matchJson, {flag: 'a', spaces: 2}, function (err) {
				// // 	console.error(err)
				// // })
				// matchesArray.push(matchJson);
				// jsonfile.writeFile('matches.json', matchesArray, {spaces: 2}, function (err) {
				// 	console.error(err)
				// })
				// execSQLQuery(`INSERT INTO matches(matchId, eventId, eventName, map, team1_name, team1_score, team1_clutches, team1_firstKills, team1_rating,
				// 	team2_name, team2_score, team2_clutches, team2_firstKills, team2_rating) 
				// 	VALUES('${matchJson.matchId}','${matchJson.eventId}','${matchJson.eventName}','${matchJson.map}',
				// 	'${matchJson.team1.name}', '${matchJson.team1.score}', '${matchJson.team1.clutches}', '${matchJson.team1.firstKills}', '${matchJson.team1.rating}',
				// 	'${matchJson.team2.name}', '${matchJson.team2.score}', '${matchJson.team2.clutches}', '${matchJson.team2.firstKills}', '${matchJson.team2.rating}')`);

				// execSQLQuery(`UPDATE matches SET map = ${matchJson.map} WHERE map=''`);


				var performance = '';
				
				var performanceJson = {};
				performanceJson.matchId = matchId;
				performanceJson.team1 = [];
				performanceJson.team2 = [];

				
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

				// jsonfile.writeFile('performance.json', performanceJson, {flag: 'a', spaces: 2}, function (err) {
				// 	console.error(err)
				//   })

				performanceArray.push(performanceJson);
				// jsonfile.writeFile('performance.json', performanceArray, {spaces: 2}, function (err) {
				// 		console.error(err)
				// })
				
				var performanceLink = $('.stats-top-menu-item.stats-top-menu-item-link').eq(1).attr('href');
				// console.log('https://www.hltv.org/' + performanceLink);
				// Crawler.getMatchMatrix('https://www.hltv.org/' + performanceLink, matchId);


				//  

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

				// jsonfile.writeFile('round_history.json', roundHistoryJson, {flag: 'a', spaces: 2}, function (err) {
				// 	console.error(err)
				// })

				roundHistoryArray.push(roundHistoryJson);
				
				//  jsonfile.writeFile('round_history.json', roundHistoryArray, {spaces: 2}, function (err) {
				// 		console.error(err)
				// 	})
				
	 
		});
	},
	getMatchMatrix(link, matchId) {

		console.log(link);
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

			var kill_matrix = '';

			kill_matrix_all.forEach(matrix => {
				kill_matrix = matchId + ';' + matrix.killType + ';' + matrix.player1 + ';' + matrix.player1Kills + ';' + 
					matrix.player2 + ';' + matrix.player2Kills + ';' +  '\n' ;
				
				
				// Crawler.appendFile('kill_matrix.csv', kill_matrix);
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

			console.log('passou aqui');
			// Crawler.kill_matrix_json_array.push(matrixJson);
			// console.log(Crawler.kill_matrix_json_array);

			// jsonfile.writeFile('kill_matrix.json', matrixJson, {flag: 'a', spaces: 2}, function (err) {
			// 	console.error(err)
			// })

			kill_matrix = '';

			kill_matrix_awp.forEach(matrix => {
				kill_matrix = matchId + ';' + matrix.killType + ';' + matrix.player1 + ';' + matrix.player1Kills + ';' + 
					matrix.player2 + ';' + matrix.player2Kills + ';' +  '\n' ;
			})



		});

		
	}
};
Crawler.init();
