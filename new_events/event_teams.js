const sleep = require('system-sleep');
const jsonfile = require('jsonfile');

var teams = [];

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
		Crawler.getTeams();
	},
    getTeams: function () {
		Crawler.request('https://www.hltv.org/events/3564/faceit-major-2018', function (err, res, body) {
			if (err)
				console.log('Erro ao recuperar dados da página: ' + err);

            var $ = Crawler.cheerio.load(body);
            let gamb = 0;
            console.log('OI');
			$('.group.standard-box').find("table").find("tr").each(function () {

                if(gamb > 0){
                    var href = $(this).find('a').attr('href');
                    // console.log(href);
                    const event_id = '3564';
                    let team_id = href.split("team/");
                    team_id = team_id[1].split("/");
                    team_id = team_id[0];
                    console.log(team_id);
                    sleep(20);

                    let event_teams = {};
                    event_teams.event_id = event_id;
                    event_teams.team_id = team_id;

                    teams.push(event_teams);

                    
                }
				gamb++;
            });
            
            console.log('adding..');
            if(teams.length > 0) {
                jsonfile.writeFile('event_teams.json', teams, {spaces: 2}, function (err) {
                    console.error(err)
                })
            }
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
    }

};
Crawler.init();
