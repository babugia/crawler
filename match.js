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
				var players = [];

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
					
					// console.log(player);
					players.push(player);	
					// console.log(players);
				});

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
					
					// console.log(player);
					players.push(player);	
					// console.log(players);
				});

				// stats-top-menu-item stats-top-menu-item-link
				var performanceLink = $('.stats-top-menu-item.stats-top-menu-item-link').eq(1).attr('href');
				Crawler.getMatchPerformance('https://www.hltv.org/' + performanceLink);

				//PENSAR Round history, FZR CONTADORES E INCREMENTAR DE ACORDO COM O SRC

				

				// var data = date + ';' + team1 + ';' + team2 + ';' + map + ';' + '\n';
				// console.log(team2Clutches);			

			// console.log(performanceLink);

			// var data = name + ';' + id + ';' + date + ';' + prize + ';' + location + ';' + '\n';
			// Crawler.appendFile(data);
		});
	},
	getMatchPerformance(link) {
		console.log(link);
	}
};
Crawler.init();
