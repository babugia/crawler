const express = require('express');
const app = express();         
const bodyParser = require('body-parser');
const port = 3005; 
const mysql = require('mysql');

//configurando o body parser para pegar POSTS mais tarde
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//definindo as rotas
const router = express.Router();
router.get('/', (req, res) => res.json({ message: 'Funcionando!' }));
app.use('/', router);

router.get('/events', async (req, res) =>{
    await execSQLQuery('SELECT * FROM events', res);
})

router.post('/events', async (req, res) =>{
    try {
        console.log(req.body.id);
        // const name = req.body.name.substring(0,51);
        // const id = req.body.id;
        // const date = req.body.date.substring(0,24);
        // const prize = req.body.prize.substring(0,10);
        // const location = req.body.location.substring(0,38);
        
        // execSQLQuery(`INSERT INTO events(name, id, date, prize, location) VALUES('${name}','${id}','${date}','${prize}','${location}')`, res);

        return res.send('added');
    } catch (error) {
        return res.status(500).send(error);        
    }
});

//inicia o servidor
app.listen(port);
console.log('API funcionando!');

function execSQLQuery(sqlQry, res){
    const connection = mysql.createConnection({
        host     : 'localhost',
        port     : 3306,
        user     : 'root',
        password : 'databasetcc2018',
        database : 'champion_prediction'
      });
  
    connection.query(sqlQry, function(error, results, fields){
        if(error) 
          res.json(error);
        else
          res.json(results);
        connection.end();
        console.log('executou!');
    });
  }