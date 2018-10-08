const sleep = require('system-sleep');
const jsonfile = require('jsonfile');

var overview = [];
var round_history = [];

var maps_enum = {
    Cache: 1,
    Dust2: 2,
    Mirage: 3,
    Inferno: 4,
    Nuke: 5,
    Train: 6,
    Cobblestone: 7,
    Overpass: 8
}

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
		Crawler.getEventInfo('https://www.hltv.org/stats?matchType=BigEvents&event=3389');
    },
	getEventInfo: function(link){
        // 'https://www.hltv.org/stats/matches?matchType=BigEvents&event=3530'

        sleep(50);
		Crawler.request(link, function(err, res, body){
			if(err)
				console.log('Error: ' + err);
            var $ = Crawler.cheerio.load(body);
            
            const matchesLink = $('.stats-section.stats-team.stats-sidebar').find("a").eq(3).attr('href');

            // console.log('https://www.hltv.org/'+matchesLink);
            Crawler.getAllMatches('https://www.hltv.org/'+matchesLink);

            console.log('CHAMEI O getAllMatches');

            var allMatches = new Promise(function(resolve, reject) {
                console.log('OLAA')
                resolve("Success!");
                // or
                // reject ("Error!");
              });

		});
    },
	getAllMatches: function (link) {

        sleep(50);
        // var link = 'https://www.hltv.org/stats/matches?matchType=BigEvents&event=3392';
        var matchLink = '';
        var nextUrl = '';

         function getMatches(link) {
            Crawler.request(link, function(err, res, body){
                if(err)
                    console.log('Error: ' + err);

                var $ = Crawler.cheerio.load(body);

                 $('.stats-table.matches-table.no-sort').find("tbody").find("tr").each(function () {

                    matchLink = $(this).find("td").eq(0).find("a").attr('href');
                    // console.log('https://www.hltv.org/'+matchLink);
                    const map = $(this).find('.dynamic-map-name-full').text().trim();
                    Crawler.getMatchOverview('https://www.hltv.org/'+matchLink, map);
                    
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
	getMatchOverview: function (link, map) {
        sleep(50);
        
        Crawler.request(link, function(err, res, body){
            if(err)
                console.log('Error: ' + err);
                
            var $ = Crawler.cheerio.load(body);

            var fields = link.split("mapstatsid/");
            var quase = fields[1];
            fields = quase.split("/");
            const match_id = fields[0];            
            const event_id = link.substring(link.length-4, link.length);
            const date = $('.small-text').find("span").eq(0).text().trim().substring(0, 10);
            // const team1 = $('.team-left').find("a").text().trim();
            // const team2 = $('.team-right').find("a").text().trim();
            const logo_team1 = $('.team-left').find(".team-logo").attr('src');
            fields = logo_team1.split("team/");
            quase = fields[1];
            fields = quase.split("/");
            const team1 = fields[1];
            // console.log('team1 = ' +team1);
            const logo_team2 = $('.team-right').find(".team-logo").attr('src');
            fields = logo_team2.split("team/");
            quase = fields[1];
            fields = quase.split("/");
            const team2 = fields[1];       
            // console.log('team2 = ' +team2);     
            const team1_score = $('.match-info-row').eq(0).find(".right").find("span").eq(0).text().trim();
            const team2_score = $('.match-info-row').eq(0).find(".right").find("span").eq(1).text().trim();
            const ratings = $('.match-info-row').eq(1).find(".right").text().trim();
            fields = ratings.split(":");
            const team1_rating = fields[0];
            const team2_rating = fields[1];
            const first_kills = $('.match-info-row').eq(2).find(".right").text().trim();
            fields = first_kills.split(":");
            const team1_first_kills = fields[0];
            const team2_first_kills = fields[1];
            const clutches = $('.match-info-row').eq(3).find(".right").text().trim();
            fields = clutches.split(":");
            const team1_clutches = fields[0];
            const team2_clutches = fields[1];
            
            const match_overview = {};

            match_overview.id = match_id;
            match_overview.event_id = event_id;
            switch(map) {
                case "Cache":
                    match_overview.map = maps_enum.Cache;
                    break;
                case "Dust2":
                    match_overview.map = maps_enum.Dust2;
                    break;
                case "Mirage":
                    match_overview.map = maps_enum.Mirage;
                    break;
                case "Inferno":
                    match_overview.map = maps_enum.Inferno;
                    break;
                case "Nuke":
                    match_overview.map = maps_enum.Nuke;
                    break;
                case "Train":
                    match_overview.map = maps_enum.Train;
                    break;
                case "Cobblestone":
                    match_overview.map = maps_enum.Cobblestone;
                    break;
                case "Overpass":
                    match_overview.map = maps_enum.Overpass;
                    break;
            }

            let Wteam, Lteam, Wteam_rating, Lteam_rating, Wteam_firstkills, Lteam_firstkills, Wteam_clutches, Lteam_clutches;
            if(parseInt(team1_score) > parseInt(team2_score)){
                Wteam = team1;
                Lteam = team2;
                Wteam_score = team1_score;
                Lteam_score = team2_score;
                Wteam_rating = team1_rating;
                Lteam_rating = team2_rating;
                Wteam_firstkills = team1_first_kills;
                Lteam_firstkills = team2_first_kills;
                Wteam_clutches = team1_clutches;
                Lteam_clutches = team2_clutches;
            }else {
                Wteam = team2;
                Lteam = team1;
                Wteam_score = team2_score;
                Lteam_score = team1_score;
                Wteam_rating = team2_rating;
                Lteam_rating = team1_rating;
                Wteam_firstkills = team2_first_kills;
                Lteam_firstkills = team1_first_kills;
                Wteam_clutches = team2_clutches;
                Lteam_clutches = team1_clutches;
            }
            // match_overview.map = map;
            match_overview.date = date;
            match_overview.Wteam = Wteam;
            match_overview.Lteam = Lteam;
            match_overview.Wteam_score = Wteam_score;
            match_overview.Lteam_score = Lteam_score;
            match_overview.Wteam_rating = Wteam_rating;
            match_overview.Lteam_rating = Lteam_rating;
            match_overview.Wteam_firstkills = Wteam_firstkills;
            match_overview.Lteam_firstkills = Lteam_firstkills;
            match_overview.Wteam_clutches = Wteam_clutches;
            match_overview.Lteam_clutches = Lteam_clutches;

            overview.push(match_overview);

            // console.log(overview);

            if(overview.length > 0) {
                jsonfile.writeFile('match_overview.json', overview, {spaces: 2}, function (err) {
                    console.error(err)
                })
                sleep(15);
            }
            
        });       
	}
};
Crawler.init();


