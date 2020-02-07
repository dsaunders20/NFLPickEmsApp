if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express')
const app = express();
const path = require('path')
const PORT = process.env.PORT || 5000
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config');
initializePassport(passport, 
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);

const users = [];
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

var bodyParser = require('body-parser'); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

// for passport
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get('/', checkAuthenticated, (req, res) => {
  res.render('pages/login');
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('pages/login');
});

app.post('/login', passport.authenticate('local', {
  passReqToCallback: true,
  successRedirect: '/1',
  failureRedirect: '/login',
  failureFlash: true,
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('pages/register');
});

app.post('/register', checkNotAuthenticated, async (req, res) => {

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
    // console.log(error)
  }
  console.log(users);
});

// regex route which accepts integers [1-17]
app.get('^/:week([1-9]|1[0-7])$', checkAuthenticated, (req, res) => {
  var week = req.params.week;
  res.render('pages/index', {'week': week, 'user':req.user});
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

app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  else res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/1')
  }
  else next();
}

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

