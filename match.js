const Player = require('./model/player.js')
const KillMatrix = require('./model/kill_matrix.js')

var Crawler = {
	request : null,
	cheerio : null,
	fs      : null,
	fileName: null,
	init : function(){
		Crawler.request = require('request');
		Crawler.cheerio = require('cheerio');
		Crawler.fs      = require('fs');
		Crawler.fileName = 'match.csv';
		Crawler.deleteFile('performance.csv');
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
	deleteFile: function(file){
		Crawler.fs.unlink('./'+file, function (err) {
			if (err) throw err;
			console.log('File deleted!');
		  });
	},
	getEventInfo: function(){
		//cabeçalho do arquivo
		// Crawler.appendFile('name;id;date;prize;location\n');

		Crawler.appendFile('match.csv', 'match_id;event_id;date;team1;team1_score;team1_clutches;team1_rating;team1_firstkills;team2;team2_score;team2_clutches;team2_rating;team2_firstkills;;map;event\n');

		Crawler.appendFile('performance.csv', 'match_id;team1;player;kills;assists;deaths;kast;adr;fkDiff;rating\n')

		Crawler.request('https://www.hltv.org/stats/matches/mapstatsid/70102/natus-vincere-vs-big?matchType=BigEvents&event=3392', function(err, res, body){
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
							team1_rating + ';' + team1_firstkills + team2 + ';' + team2_score + ';' + team2_clutches + ';' + 
							team2_rating + ';' + team2_firstkills + ';' + map + ';' + eventName + ';' +  '\n'
				Crawler.appendFile('match.csv', match);
				//  console.log(match);

				var performance = '';

				 Team1Players.forEach(player => {
					performance = matchId + ';' + team1 + ';' + player.name + ';' + player.kills + ';' + 
					player.assists + ';' + player.deaths + ';' + player.kast + ';' + player.adr + ';' + 
					player.fkDiff + ';' + player.rating + ';' +  '\n' ;

					 Crawler.appendFile('performance.csv', performance);
				 })

				 Team2Players.forEach(player => {
					performance = matchId + ';' + team2 + ';' + player.name + ';' + player.kills + ';' + 
					player.assists + ';' + player.deaths + ';' + player.kast + ';' + player.adr + ';' + 
					player.fkDiff + ';' + player.rating + ';' +  '\n' ;

					 Crawler.appendFile('performance.csv', performance);
				 })
				
				var performanceLink = $('.stats-top-menu-item.stats-top-menu-item-link').eq(1).attr('href');
				Crawler.getMatchMatrix('https://www.hltv.org/' + performanceLink);
				 
		});
	},
	getMatchMatrix(link) {

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

			kill_matrix_all.forEach(matrix => {
				// console.log(matrix.player1);
			})

			//KILL MATRIX FIRST KILLS
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

			//KILL MATRIX AWP KILLS
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
