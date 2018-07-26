const Player = require('./model/player.js')
const KillMatrix = require('./model/kill_matrix.js')
const RoundHistory = require('./model/round_history.js')

var Crawler = {
	request : null,
	cheerio : null,
	fs      : null,
	fileName: null,
	init : function(){
		Crawler.request = require('request');
		Crawler.cheerio = require('cheerio');
		Crawler.fs      = require('fs');
		Crawler.fileName = 'events.csv';
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
	deleteFile: function(file){
		Crawler.fs.unlink('./'+file, function (err) {
			if (err) throw err;
			console.log('File deleted!');
		  });
	},
	getLinks: function () {
        //cabeçalho do arquivo
		// Crawler.appendFile('events.csv', 'name;id;date;prize;location\n');
		
		
		//recupera dados de cada página de consulta
		Crawler.request('https://www.hltv.org/stats/events?matchType=BigEvents', function (err, res, body) {
			if (err)
				console.log('Erro ao recuperar dados da página: ' + err);

			// console.log('entrou');
			var $ = Crawler.cheerio.load(body);
			var gamb = 0;

			//recupera links e conteudo dos artigos na página
			$('.stats-table.events-table .name-col').each(function () {
				// Crawler.getContent('https://jmedicalcasereports.biomedcentral.com' + $(this).attr('href').trim());
				
				// var title = $(this).find('.eventLogo').text().trim();
				var link = $(this).find('.name-col a').attr('href');
				gamb++;
				// console.log(link);
				if(gamb!=1){
					Crawler.getEventInfo('https://www.hltv.org/' + link);
				}
				
				
				
			});
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
			var date = $('.eventdate').text().trim().substring(4,27);
			var prize = $('.info').find( "tr" ).eq( 1 ).find( "td" ).eq( 1 ).text().trim();
			var teams = $('.info').find( "tr" ).eq( 1 ).find( "td" ).eq( 2 ).text().trim();
			var location = $('.flag-align').text().trim();

			var matchesLink = $('.stats-section.stats-team.stats-sidebar').find('.sidebar-single-line-item').eq(3).attr('href').trim();
			// console.log('https://www.hltv.org/'+matchesLink);

			Crawler.getAllMatches('https://www.hltv.org/'+matchesLink);

			var data = name + ';' + id + ';' + date + ';' + prize + ';' + location + ';' + '\n';
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
				console.log('https://www.hltv.org/'+$(this).find("td").eq(0).find("a").attr('href'));
				
			});
			

			// var data = name + ';' + id + ';' + date + ';' + prize + ';' + location + ';' + '\n';
			// Crawler.appendFile('events.csv', data);
		});
	},
	getMatch: function (link) {
	}
};
Crawler.init();
