// server.js
// where your node app starts

// init project

// Express web framework for Node.js: https://expressjs.com/
// express is a function
var express = require('express');

// Node.js body parsing middleware.
// Parse incoming request bodies in a middleware before your handlers, available under the req.body property
var bodyParser = require('body-parser');

// Read environment varibale in .env (PORT, ...)
const dotenv = require('dotenv');
dotenv.config();

// Web application instance
var app = express();

// Express Middlewares

// parse URL-encoded forme
app.use(bodyParser.urlencoded({ extended: true }));

// parse JSON
app.use(bodyParser.json());

// http://expressjs.com/en/starter/static-files.html
// Now we can use files in the public folder, without prefix (cf: app.use('/static', express.static('public')); )
app.use(express.static('public'));

// init sqlite db
var fs = require('fs');
var dbFile = './.data/sqlite.db';
var exists = fs.existsSync(dbFile);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(dbFile);

// if ./.data/sqlite.db does not exist, create it, otherwise print records to console (but you need the .data folder)
db.serialize( () => {
  if (!exists) {
    db.run('CREATE TABLE Dreams (dream TEXT)');
    console.log('New table Dreams created!');
    
    // insert default dreams
    db.serialize( () => {
      db.run('INSERT INTO Dreams (dream) VALUES ("Find and count some sheep"), ("Climb a really tall mountain"), ("Wash the dishes")');
    });
  }
  else {
    console.log('Database "Dreams" ready to go!');
    db.each('SELECT * from Dreams', (err, row) => {
      if ( row ) {
        console.log('record:', row);
      }
    });
  }
});

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

// endpoint to get all the dreams in the database
app.get('/getDreams', (request, response) => {
  db.all('SELECT * from Dreams', (err, rows) => {
    response.send(JSON.stringify(rows));
  });
});

// endpoint to insert a dream into the database
app.post('/insertDream', (request, response) => {
// thanks to the json middleware, we are able to parse the body, which includes the new dream
  const NewDream = request.body.dream;
  db.run(`INSERT into Dreams VALUES(?)`, [NewDream], (err) => {
    if (err) {
      return console.log(err.message);
    }

    console.log(`A new dream has been inserted`);
  });
});

// listen for requests
var listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});

