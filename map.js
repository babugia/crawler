var Crawler = {
	request : null,
	cheerio : null,
	fs      : null,
	fileName: null,
	init : function(){
		Crawler.request = require('request');
		Crawler.cheerio = require('cheerio');
		Crawler.fs      = require('fs');
		Crawler.fileName = 'event.csv';
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

		Crawler.request('https://www.hltv.org/stats/matches?matchType=BigEvents&event=3530', function(err, res, body){
			if(err)
				console.log('Error: ' + err);
			var $ = Crawler.cheerio.load(body);

			$('.stats-table.matches-table.no-sort').find("tbody").find("tr").each(function () {

				var map = $(this).find('.dynamic-map-name-full').text().trim();
				var matchLink = $(this).find("td").eq(0).find("a").attr('href');
			});
            


			


			// Crawler.appendFile(data);
		});
	}
};
Crawler.init();
