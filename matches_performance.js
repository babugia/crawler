const sleep = require('system-sleep');
const jsonfile = require('jsonfile');

var performance = [];
var kill_matrix = [];


var Crawler = {
	request : null,
	cheerio : null,
    fs      : null,
    jsonfile: null,
	init : function(){
		Crawler.request = require('request');
		Crawler.cheerio = require('cheerio');
        Crawler.fs      = require('fs');
        Crawler.getLinks();
        // Crawler.getAllMatches('https://www.hltv.org/stats/matches?matchType=BigEvents&event=3392');
    },
    getLinks: function () {
        var stats = Crawler.fs.statSync('./jsons/team_overview.json');
        const team_overview_size = stats.size;
        stats = Crawler.fs.statSync('./jsons/team_ftu.json');
        const team_ftu_size = stats.size;
        stats = Crawler.fs.statSync('./jsons/team_pistol.json');
        const team_pistol_size = stats.size;  
        
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
                }	
                
			});
		});
		
        
    },
	getEventInfo: function(link){
        // 'https://www.hltv.org/stats/matches?matchType=BigEvents&event=3530'

        // sleep(100);
		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error1: ' + err);
            var $ = Crawler.cheerio.load(body);
            
            const matchesLink = $('.stats-section.stats-team.stats-sidebar').find("a").eq(3).attr('href');

            // console.log('https://www.hltv.org/'+matchesLink);
            Crawler.getAllMatches('https://www.hltv.org/'+matchesLink);

		});
    },
	getAllMatches: function (link) {

        sleep(100);
        // var link = 'https://www.hltv.org/stats/matches?matchType=BigEvents&event=3392';
        var matchLink = '';
        var nextUrl = '';

         function getMatches(link) {
            Crawler.request(link, function(err, res, body){
                if(err)
                    console.log('Error2: ' + err);

                var $ = Crawler.cheerio.load(body);

                 $('.stats-table.matches-table.no-sort').find("tbody").find("tr").each(function () {

                    matchLink = $(this).find("td").eq(0).find("a").attr('href');
                    // console.log('https://www.hltv.org/'+matchLink);
                    const map = $(this).find('.dynamic-map-name-full').text().trim();
                    Crawler.getMatch('https://www.hltv.org/'+matchLink);
                    
                });

                nextUrl = $('.pagination-next').eq(0).attr('href');
                // console.log('https://www.hltv.org'+nextUrl);
                if(nextUrl != undefined){
                    getMatches('https://www.hltv.org'+nextUrl);
                }
            });
        }

        getMatches(link);
        // console.log(this.nextUrl);
    },
    getMatch: function (link) {

        Crawler.request(link, function(err, res, body){
            if(err)
            console.log('Error3: ' + err);
            
             var $ = Crawler.cheerio.load(body);

             const performanceLink = $('.stats-top-menu-item.stats-top-menu-item-link').eq(1).attr('href');
            //  console.log('https://www.hltv.org/'+performanceLink);
            Crawler.getMatchPerformance('https://www.hltv.org/'+performanceLink);
        });
    },
	getMatchPerformance: function (link) {

        // sleep(200);

        Crawler.request(link, function(err, res, body){
            if(err)
                console.log('Error4: ' + err);
                
            var $ = Crawler.cheerio.load(body);

            var fields = link.split("mapstatsid/");
            var quase = fields[1];
            fields = quase.split("/");
            const match_id = fields[0]; 
            fields = link.split("&");  
            quase = fields[1];
            fields = quase.split("=");         
            const event_id = fields[1];
            
            $('.highlighted-player').each(function () {

                const name = $(this).find(".headline").find("span").eq(0).find("a").find("span").eq(1).text().trim();
                // console.log(name);
                var data = $(this).find('.graph.small').attr('data-fusionchart-config');
                var jsonData = JSON.parse(data);

                const match_performance = {};
                match_performance.id = match_id;
                match_performance.event_id = event_id;
                match_performance.name = name;
                for (var key in jsonData.dataSource.data) {
                    // console.log(jsonData.dataSource.data[key].label + ' = ' + jsonData.dataSource.data[key].displayValue);
                   
                    if(key == 0){
                        match_performance.kpr = jsonData.dataSource.data[0].displayValue;
                    } else if(key == 1){
                        match_performance.dpr = jsonData.dataSource.data[key].displayValue;
                    }else if(key == 2){
                        match_performance.kast = jsonData.dataSource.data[key].displayValue;
                    }else if(key == 3){
                        match_performance.impact = jsonData.dataSource.data[key].displayValue;
                    }else if(key == 4){
                        match_performance.adr = jsonData.dataSource.data[key].displayValue;
                    }else if(key == 5){
                        match_performance.rating = jsonData.dataSource.data[key].displayValue;
                    }
                }
                performance.push(match_performance);
                // console.log(performance);
                jsonfile.writeFile('match_performance.json', performance, {spaces: 2}, function (err) {
                    console.error(err)
                })

            });        
        });
	}
};
Crawler.init();


