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
    createTable(connection);
  })

  function createTable(conn){

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
