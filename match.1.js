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

		Crawler.request('https://www.hltv.org/stats/matches?matchType=BigEvents&event=3392', function(err, res, body){
			if(err)
				console.log('Error: ' + err);
				
			var $ = Crawler.cheerio.load(body);

			$('.stats-table.matches-table.no-sort tbody tr').each(function(){
				var date = $(this).find('.date-col .time').text().trim();
				var team1 = $(this).find('.team-col a').eq(0).text().trim();
				var team2 = $(this).find('.team-col a').eq(1).text().trim();
				var map = $(this).find('.statsDetail .dynamic-map-name-full').text().trim();

				var data = date + ';' + team1 + ';' + team2 + ';' + map + ';' + '\n';
				console.log(data);
			});
			

			// console.log(location);

			// var data = name + ';' + id + ';' + date + ';' + prize + ';' + location + ';' + '\n';
			// Crawler.appendFile(data);
		});
	}
};
Crawler.init();
