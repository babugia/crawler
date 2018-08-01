var Crawler = {
	request : null,
	cheerio : null,
    fs      : null,
    jsonfile: null,
	init : function(){
		Crawler.request = require('request');
		Crawler.cheerio = require('cheerio');
        Crawler.fs      = require('fs');
        Crawler.jsonfile = require('jsonfile');
		Crawler.getAllMatches();
	},
	getAllMatches: function () {

        var link = 'https://www.hltv.org/stats/matches?matchType=BigEvents&event=3392';
        var matchLink = '';
        var nextUrl = '';

         function getMatches(link) {
            Crawler.request(link, function(err, res, body){
                if(err)
                    console.log('Error: ' + err);
                
            
                // console.log(link);

            
                var $ = Crawler.cheerio.load(body);

                 $('.stats-table.matches-table.no-sort').find("tbody").find("tr").each(function () {

                    matchLink = $(this).find("td").eq(0).find("a").attr('href');
                    console.log('https://www.hltv.org/'+matchLink);
                    // Crawler.getMatch('https://www.hltv.org/'+matchLink);
                    
                });

                nextUrl = $('.pagination-next').eq(0).attr('href');
                console.log('https://www.hltv.org'+nextUrl);
                if(nextUrl != undefined){
                    getMatches('https://www.hltv.org'+nextUrl);
                }
                
                
            
            });
        }

        getMatches(link);
        // console.log(this.nextUrl);
	}
};
Crawler.init();


