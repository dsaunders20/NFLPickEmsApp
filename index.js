const express = require('express')
const app = express();
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: true
// });

// // use this for testing
var pool = new Pool({
  host: 'localhost',
  database: 'postgres'
});

const users = [];

express()
  app.use(express.static(path.join(__dirname, 'public')))
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs')


  app.get('/login', (req, res) => {
    res.render('pages/login');
  });

  app.post('/register', (req, res) => {
    req.body.name
  })

  app.get('/register', (req, res) => {
    res.render('pages/register');
  });

  app.post('/register')
 
  // regex route which accepts integers [1-17]
  app.get('^/:week([1-9]|1[0-7])$', (req, res) => {
    var week = req.params.week;
    res.render('pages/index', {'week': week});
  });

  //playoff schedule routes.. could try to include in regex route above but this is ok for now..
  app.get('/wildcard', (req, res) => {
    res.render('pages/index', {'week': 'WildCard'});
  });
  app.get('/division', (req, res) => {
    res.render('pages/index', {'week': 'Division'});
  });
  app.get('/conference', (req, res) => {
    res.render('pages/index', {'week': 'ConfChamp'});
  });
  app.get('/superbowl', (req, res) => {
    res.render('pages/index', {'week': 'SuperBowl'});
  });



  app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
