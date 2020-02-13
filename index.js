if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
// =========== MODULES ================
const express = require('express')
const app = express();
const path = require('path')
const PORT = process.env.PORT || 5000
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const methodOverride = require('method-override')
const User = require('./models/user')
const localStrategy = require('passport-local').Strategy


app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

var bodyParser = require('body-parser'); 
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

// ============== MONGOOSE DATABASE ======================== 

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'));


// ======= PASSPORT FUNCTIONS AND LOCAL AUTHENTICATION ========//

app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: db })
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

passport.use(new localStrategy(
  function(username, password, done) {
    console.log(username);
    console.log(password);

      User.findOne({
        username: username
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false,  { message: "No user with that username", type: 'error' });
        }

        if (user.password != password) {
          return done(null, false, { message: 'Password incorrect', type: 'error' });
        }
        return done(null, user);
      });
  }
));

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    });
});


// ========= ROUTES ================

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
  // const hashedPassword = await bcrypt.hash(req.body.password, 10)
  const user = new User({
    name: req.body.name,
    username: req.body.username,
    password: req.body.password
  })
  try {
    const newUser = await user.save({}, (err) => console.log(err) );
    res.redirect('/login');
  }
  catch (error) {
    res.redirect('/register');
    // console.log(error)
  }
});

// regex route which accepts integers [1-17]
app.get('^/:week([1-9]|1[0-7])$', checkAuthenticated, (req, res) => {
  var week = req.params.week;
  res.render('pages/index', {'week': week, 'user':req.user});
});

//playoff schedule routes.. could try to include in regex route above but this is ok for now..
app.get('/wildcard', checkAuthenticated, (req, res) => {
  res.render('pages/index', {'week': 'WildCard', 'user':req.user});
});
app.get('/division', checkAuthenticated, (req, res) => {
  res.render('pages/index', {'week': 'Division', 'user':req.user});
});
app.get('/conference', checkAuthenticated, (req, res) => {
  res.render('pages/index', {'week': 'ConfChamp', 'user':req.user});
});
app.get('/superbowl', checkAuthenticated, (req, res) => {
  res.render('pages/index', {'week': 'SuperBowl', 'user':req.user});
});

app.get('/admin', async (req, res) => {
  try {
    const users = await User.find({});
    res.render('pages/admin', { users: users });
  }
  catch {
    res.render('pages/admin', { errorMessage: `Error: Can't get all users...try again later` })
  }
})

app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
});


// ============ MIDDLEWARE ====================

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  else res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.render('/1', { user: req.body } )
  }
  else next();
}

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

