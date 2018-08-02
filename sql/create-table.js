const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  port     : 3306,
  user     : 'root',
  password : 'databasetcc2018',
  database : 'champion_prediction'
});

connection.connect(function(err){
    if(err) return console.log(err);
    console.log('conectou!');
    createEventsTable(connection);
    createMatchesTable(connection);
  })

  function createEventsTable(conn){

    const events =   "CREATE TABLE IF NOT EXISTS events (\n"+
                    "name VARCHAR(51) NOT NULL,\n"+
                    "id INT NOT NULL,\n"+
                    "date VARCHAR(24) NOT NULL,\n"+
                    "prize VARCHAR(10) NOT NULL,\n"+
                    "location VARCHAR(38) NOT NULL,\n"+
                    "PRIMARY KEY (id)\n"+
                    ");"

    conn.query(events, function (error, results, fields){
        if(error) return console.log(error);
        console.log('table events created!');
    });
}

function createMatchesTable(conn){

    const matches = "CREATE TABLE IF NOT EXISTS matches (\n"+
                    "matchId INT NOT NULL,\n"+
                    "eventId INT NOT NULL,\n"+
                    "eventName VARCHAR(38) ,\n"+
                    "map VARCHAR(11) ,\n"+
                    "team1_name VARCHAR(21) NOT NULL,\n"+
                    "team1_score INT NOT NULL,\n"+
                    "team1_clutches INT NOT NULL,\n"+
                    "team1_firstKills INT NOT NULL,\n"+
                    "team1_rating NUMERIC(3, 2) NOT NULL,\n"+
                    "team2_name VARCHAR(21) NOT NULL,\n"+
                    "team2_score INT NOT NULL,\n"+
                    "team2_clutches INT NOT NULL,\n"+
                    "team2_firstKills INT NOT NULL,\n"+
                    "team2_rating NUMERIC(3, 2) NOT NULL,\n"+
                    "PRIMARY KEY (matchId)\n"+
                    ");"                

    
    conn.query(matches, function (error, results, fields){
        if(error) return console.log(error);
        console.log('table matches created!');
    });
}
