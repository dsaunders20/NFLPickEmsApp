const express = require('express')
const app = express();
const path = require('path')
const PORT = process.env.PORT || 5000
const bcrypt = require('bcrypt')

const users = [];
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

var bodyParser = require('body-parser'); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('pages/login');
});

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.post('/register', async (req, res) => {

  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login');
  }
  catch (error) {
    res.redirect('/register');
    console.log(error)
  }
  console.log(users);
});

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
