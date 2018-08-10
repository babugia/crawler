const sleep = require('system-sleep');
const jsonfile = require('jsonfile');

var performance = [];
var kill_matrix = [];


var Crawler = {
	request : null,
	cheerio : null,
    fs      : null,
	init : function(){
		Crawler.request = require('request');
		Crawler.cheerio = require('cheerio');
        Crawler.fs      = require('fs');
        Crawler.jsonfile = require('jsonfile');
        // Crawler.getLinks();
        Crawler.getMatchPerformance('https://www.hltv.org//stats/matches/performance/mapstatsid/69910/mousesports-vs-g2?matchType=BigEvents&event=3392');
    },
	getMatchPerformance: function (link) {

        Crawler.request(link, function(err, res, body){
            if(err)
                console.log('Error: ' + err);
                
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


