const sleep = require('system-sleep');
const jsonfile = require('jsonfile');

var teams_in =[];

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
		Crawler.getLinks();
	},
    getLinks: function () {
        // var stats = Crawler.fs.statSync('./jsons/team_overview.json');
        // const team_overview_size = stats.size;
        // stats = Crawler.fs.statSync('./jsons/team_ftu.json');
        // const team_ftu_size = stats.size;
        // stats = Crawler.fs.statSync('./jsons/team_pistol.json');
        // const team_pistol_size = stats.size;  
        
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
                sleep(80);
			});
            // console.log(`TEM ${eventCount} EVENTOS`);

            //    jsonfile.writeFile('team_overview.json', overview, {spaces: 2}, function (err) {
            //         console.error(err)
            //     })

		});
		
        
    },
	getEventInfo: function(link){
        // 'https://www.hltv.org/stats/matches?matchType=BigEvents&event=3530'

        sleep(80);
		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);
            var $ = Crawler.cheerio.load(body);
            
            const teamLink = $('.stats-section.stats-team.stats-sidebar').find("a").eq(2).attr('href');

            // console.log('https://www.hltv.org/'+teamLink);
            Crawler.getTeams('https://www.hltv.org/'+teamLink);

		});
    },
    getTeams(link){

        sleep(80);
        Crawler.request(link, async function(err, res, body){
			if(err)
				console.log('Error: ' + err);
            var $ = Crawler.cheerio.load(body);
            
            const event_id = link.substring(link.length-4, link.length);

            $('.stats-table.player-ratings-table').find("tbody").find("tr").each(function () {
                const team_id = $(this).find(".teamCol-teams-overview a").attr('href').substring(13, 17);

                const teams = {};
                teams.event_id = event_id;
                teams.team_id = team_id;                

                teams_in.push(teams);
                sleep(80);
           });

           jsonfile.writeFile('teams_in.json', teams_in, {spaces: 2}, function (err) {
				console.error(err)
			})
            
		});
    }

};
Crawler.init();
