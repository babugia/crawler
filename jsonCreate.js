var fs = require('fs');

var jsonTest = {};
var jsonfile = require('jsonfile')

jsonTest.matchId = '3453';
jsonTest.team1 = [];
jsonTest.team2 = [];

var player1 = {
    name: 'fnx',
    kills: '30',
    assists: '2',
    deaths: '16',
    kast: '2',
    adr: '103.2',
    fkDiff: '4',
    rating: '1.2'
}
jsonTest.team1.push(player1);

var player1 = {
    name: 'bit',
    kills: '30',
    assists: '2',
    deaths: '16',
    kast: '2',
    adr: '103.2',
    fkDiff: '4',
    rating: '1.2'
}

jsonTest.team1.push(player1);

jsonfile.writeFile('input.json', jsonTest, {spaces: 2}, function(err) {
    console.error(err)
  })

// fs.writeFile ("input.json", JSON.stringify(jsonTest), function(err) {
//     if (err) throw err;
//     console.log('complete');
//     }
// );