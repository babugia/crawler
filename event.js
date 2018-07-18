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
		Crawler.appendFile('name;id;date;prize;location\n');

		Crawler.request('https://www.hltv.org/stats?matchType=BigEvents&event=3666', function(err, res, body){
			if(err)
				console.log('Error: ' + err);
			// var self = this;
			// self.items = new Array();
			var $ = Crawler.cheerio.load(body);
			link = {};
			var name = $('.eventname').text().trim();
			var id = $('.event-header-component.event-holder.header a').attr('href').substring(8,12);
			var date = $('.eventdate').text().trim().substring(4,27);
			var prize = $('.info').find( "tr" ).eq( 1 ).find( "td" ).eq( 1 ).text().trim();
			var teams = $('.info').find( "tr" ).eq( 1 ).find( "td" ).eq( 2 ).text().trim();
			var location = $('.flag-align').text().trim();


			/*$('tbody tr').each(function(){
				var links  = link.url = $(this).find('.name-col a').attr('href');
				console.log(link);
				Crawler.fs.appendFile('event.txt', links + '\n');
			});*/
			console.log(location);

			var data = name + ';' + id + ';' + date + ';' + prize + ';' + location + ';' + '\n';
			Crawler.appendFile(data);
		});
	}
};
Crawler.init();
