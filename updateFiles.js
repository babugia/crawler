const fs = require('fs');
const jsonfile = require('jsonfile');
 
    
var savedJson = [], actualJson = [] ;

fs.readFile('./jsons/team_overview.json', 'utf8', function (err, data) { //team_overview, team_ftu, team_pistol
    if (err) throw err;
    savedJson = JSON.parse(data);
    console.log('saved size = '+savedJson.length);
});

var i =0;
fs.readFile('./team_overview.json', 'utf8', function (err, data) {
    if (err) throw err;
    actualJson = JSON.parse(data);
    console.log(actualJson.length);

    actualJson.forEach(team => {
        let index = savedJson.findIndex(element => element.team_id == team.team_id);
        if(index == -1){
            i++;
            savedJson.push(team);
        } 
    });
    console.log(`tem ${i} teams faltando`);
    console.log('tamanho antes de adicionar = '+savedJson.length);

    jsonfile.writeFile('./jsons/team_overview.json', savedJson, {spaces: 2}, function (err) {
        console.error(err)
    })
});


    
    
    