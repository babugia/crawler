var fs = require('fs');
const mysql = require('mysql');

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

var obj;
fs.readFile('../jsons/matches.json', 'utf8', function (err, data) {
  if (err) throw err;
  obj = JSON.parse(data);
  console.log(obj.length);

  obj.forEach(element => {
    //   console.log(element);
      execSQLQuery(`INSERT INTO matches(matchId, eventId, eventName, map, team1_name, team1_score, team1_clutches, team1_firstKills, team1_rating,
                                         team2_name, team2_score, team2_clutches, team2_firstKills, team2_rating) 
                                         VALUES('${element.matchId}','${element.eventId}','${element.eventName}','${element.map}',
                                         '${element.team1.name}', '${element.team1.score}', '${element.team1.clutches}', '${element.team1.firstKills}', '${element.team1.rating}',
                                         '${element.team2.name}', '${element.team2.score}', '${element.team2.clutches}', '${element.team2.firstKills}', '${element.team2.rating}')`);
  });
  
});



