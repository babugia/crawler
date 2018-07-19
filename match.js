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
		Crawler.getEventInfo();
	},
    appendFile: function (data) {
		
        Crawler.fs.appendFile(Crawler.fileName, data, function (err) {
            if (err) {
                console.log('Erro ao gravar dados no arquivo: ' + err);
                throw err;
            }
        });
    },
	getEventInfo: function(){
		//cabeçalho do arquivo
		// Crawler.appendFile('name;id;date;prize;location\n');

		Crawler.request('https://www.hltv.org/stats/matches/mapstatsid/70102/natus-vincere-vs-big?matchType=BigEvents&event=3392', function(err, res, body){
			if(err)
				console.log('Error: ' + err);

			var $ = Crawler.cheerio.load(body);

				// var date = $('.match-info-box-con .small-text').find("span").eq(0).text().trim().substring(0,10);
				// var team1 = $('.match-info-box-con .team-left a').text().trim();
				// var scoreTeam1 = $('.match-info-box-con .team-left').find("div").eq(0).text().trim();
				// var team2 = $('.match-info-box-con .team-right a').text().trim();
				// var scoreTeam2 = $('.match-info-box-con .team-right').find("div").eq(0).text().trim();
				// var map = $('.match-info-box').text().trim(); //NAO CONSEGUINDO PEGAR
				// var ratingTeam1 = $('.match-info-box-con .match-info-row').eq(1).find("div").eq(0).text().trim().substring(0,4);
				// var ratingTeam2 = $('.match-info-box-con .match-info-row').eq(1).find("div").eq(0).text().trim().substring(7,11);
				var firstKills = $('.match-info-box-con .match-info-row').eq(2).find("div").eq(0).text().trim();
				var fields = firstKills.split(':');
				var team1FirstKills = fields[0];
				var team2FirstKills = fields[1];

				var clutches = $('.match-info-box-con .match-info-row').eq(3).find("div").eq(0).text().trim();
				var fields = clutches.split(':');
				var team1Clutches = fields[0];
				var team2Clutches = fields[1];
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

				// console.log(Team2Players);
				// stats-top-menu-item stats-top-menu-item-link
				var performanceLink = $('.stats-top-menu-item.stats-top-menu-item-link').eq(1).attr('href');
				Crawler.getMatchPerformance('https://www.hltv.org/' + performanceLink);

				//fix Round history, FZR CONTADORES E INCREMENTAR DE ACORDO COM O SRC

				

				// var data = date + ';' + team1 + ';' + team2 + ';' + map + ';' + '\n';
				// console.log(team2Clutches);			

			// console.log(performanceLink);

			// var data = name + ';' + id + ';' + date + ';' + prize + ';' + location + ';' + '\n';
			// Crawler.appendFile(data);
		});
	},
	getMatchPerformance(link) {
		// console.log(link);

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

			//fix performance, get kpr, adr e impact


		});

		
	}
};
Crawler.init();
