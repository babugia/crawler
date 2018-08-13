

var eventsArray = [];
const jsonfile = require('jsonfile');

const mysql = require('mysql');
// const api = require('./api/index.js');

const connection = mysql.createConnection({
    host     : 'localhost',
    port     : 3306,
    user     : 'root',
    password : 'databasetcc2018',
    database : 'champion_prediction'
  });

  function execSQLQuery(sqlQry){
    connection.query(sqlQry, function(error, results, fields){
        console.log('executou!');
    });
  }

var Crawler = {
	request : null,
	cheerio : null,
	fs      : null,
	init : function(){
		Crawler.request = require('request');
		Crawler.cheerio = require('cheerio');
		Crawler.fs      = require('fs');
		Crawler.getLinks();
	},
	deleteFileContent: function(file){
		Crawler.fs.writeFile(file, '', function(){console.log(`${file} contend deleted`)})
	},
	getLinks: function () {

		//recupera dados de cada página de consulta
		Crawler.request('https://www.hltv.org/stats/events?matchType=BigEvents', function (err, res, body) {
			if (err)
				console.log('Erro ao recuperar dados da página: ' + err);

			var $ = Crawler.cheerio.load(body);
			var gamb = 0;
            var eventCount = 0;
            
			$('.stats-table.events-table .name-col').each(function () {
				var link = $(this).find('.name-col a').attr('href');
				
				gamb++;
				// console.log('https://www.hltv.org/' + link);
				if(gamb!=1){
					Crawler.getEventInfo('https://www.hltv.org/' + link);
				
					eventCount++
					// console.log(`${eventCount} eventos salvos`);
				}	
			});
			// console.log(`TEM ${eventCount} EVENTOS`);

		});
		
        
    },
	getEventInfo: function (link) {
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

			var data = name + ';' + id + ';' + date + ';' + prize + ';' + location + ';' + '\n';

			
			var eventsJson = {};

			eventsJson.name = name;
			eventsJson.id = id;
			eventsJson.date = date;
			eventsJson.prize = prize;
            eventsJson.location = location;
            
            
            execSQLQuery(`INSERT INTO events(name, id, date, prize, location) VALUES('${name}','${id}','${date}','${prize}','${location}')`);
		
			eventsArray.push(eventsJson);

			// console.log(eventsArray.length);

			jsonfile.writeFile('events.json', eventsArray, {spaces: 2}, function (err) {
				console.error(err)
			})

		});
	}
};
Crawler.init();
