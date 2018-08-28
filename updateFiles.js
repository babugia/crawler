const fs = require('fs');
const jsonfile = require('jsonfile');
const sleep = require('system-sleep');
const valueIs = require('value-is');


//NEWS 
const match_overview_new = './matches_scripts/match_overview.json'
const match_round_history_new = './matches_scripts/match_round_history.json'  
const match_performance_new = './matches_scripts/match_performance.json'

const player_individual_new = './players_scripts/player_individual.json'  
const player_overview_new = './players_scripts/player_overview.json'

const team_ftu_new = './teams_scripts/team_ftu.json';
const team_overview_new = './teams_scripts/team_overview.json';
const team_pistol_new = './teams_scripts/team_pistol.json';



//SAVED
const match_overview_saved = './jsons/match_overview.json'
const match_round_history_saved = './jsons/match_round_history.json'  
const match_performance_saved = './jsons/match_performance.json'

const player_individual_saved = './jsons/player_individual.json'  
const player_overview_saved = './jsons/player_overview.json'

const team_ftu_saved = './jsons/team_ftu.json';
const team_overview_saved= './jsons/team_overview.json';
const team_pistol_saved = './jsons/team_pistol.json';

const test_saved = './jsons/testes/test1.json';
const test_new = './jsons/testes/test2.json';


// fs.readFile(match_round_history_new, 'utf8', function (err, data) { //team_overview, team_ftu, team_pistol
//     if (err) throw err;
//     savedJson = JSON.parse(data);
//     console.log('saved size = '+savedJson.length);
// });
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

 function uploadFile(saved_patch, new_patch){
    var savedJson = [], actualJson = [] ;

    fs.readFile(saved_patch, 'utf8', function async (err, data) { //team_overview, team_ftu, team_pistol
        if (err) throw err;
        savedJson = JSON.parse(data);
        console.log('saved size = '+savedJson.length);
    });
    
    var i =0;
    fs.readFile(new_patch, 'utf8', function async (err, data) {
        if (err) throw err;
        actualJson = JSON.parse(data);
        console.log('actual size = '+actualJson.length);

        // actualJson.forEach(team => {
        //     // console.log(team);

        //     var targetKeys = Object.keys(team);
        //     var index = savedJson.findIndex(function(entry) {
        //         // console.log(entry);
        //         var keys = Object.keys(entry);
        //         return keys.length == targetKeys.length && keys.every(function(key) {
        //             return team.hasOwnProperty(key) && entry[key] === team[key];
        //        });
        //     });
        //     if(index == -1){
        //         i++;
        //         savedJson.push(team);
        //     }
            
        // });

        actualJson.forEach(team => {
           const idx = savedJson.findIndex(obj => obj.id == team.id);
           if(idx == -1){
               i++;
           }

        //    if(isEmpty(valueIs(savedJson, team))) {
        //     // Object is empty (Would return true in this example)
        //     // console.log('empty');
        //         i++;
        //         savedJson.push(team);
        //         // console.log(team);
        //     } else {
        //         // Object is NOT empty
        //         // console.log('not empty');
        //     }
        })
        
        console.log(`tem ${i} objs faltando`);
        console.log('tamanho antes de adicionar = '+savedJson.length);

        if(i < actualJson.length){
            // jsonfile.writeFile(saved_patch, savedJson, {spaces: 2}, function (err) {
            //     console.error(err)
            // })
        }
    });

         
    
}

// saved, new
uploadFile(match_overview_saved, match_overview_new);
    
    
    