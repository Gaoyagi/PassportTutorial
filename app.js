//create new express app
const express = require('express');
const app = express();

app.use(express.static(__dirname)); //define where we read static files from

//MIDDLEWARE
const bodyParser = require('body-parser');                            //bodyparser middleare helps parse and read incoming requests
const expressSession = require('express-session')({                   //express-session saves the sessions cookie
  secret: 'secret',
  resave: false,
  saveUninitialized: false
});
const passport = require('passport');                                  //Passport authentication

const mongoose = require('mongoose');                                  //mongoose lets you communciate with mongodb
const passportLocalMongoose = require('passport-local-mongoose');      //middleware to easily let passport and mongoose communicate with each other
const connectEnsureLogin = require('connect-ensure-login');            //middleware that checks to see if the user is logged in everytime a request is sent, if not then redirect to login

//connect to mongoose
mongoose.connect('mongodb://localhost/MyDatabase',
  { useNewUrlParser: true, useUnifiedTopology: true });

//App.use
    //use bodyparser stuf
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
    //use express-session
app.use(expressSession);
    //use passport
app.use(passport.initialize());
app.use(passport.session());

//A user mongoose model (figure out hwo to sperate to another file later)
const Schema = mongoose.Schema;
const UserDetail = new Schema({
  username: String,
  password: String
});

UserDetail.plugin(passportLocalMongoose);   //a plugin for the model (how does this work?)
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

//Passport Strategy's (methods?)
passport.use(UserDetails.createStrategy());
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

//port listening
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('App listening on port ' + port))


app.post('/login', (req, res, next) => {
    passport.authenticate('local',
    (err, user, info) => {  
      if (err) {
        return next(err);
      }
  
      if (!user) {
        return res.redirect('/login?info=' + info);
      }
  
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
  
        return res.redirect('/');
      });
  
    })(req, res, next);
  });
  
  app.get('/login',
    (req, res) => res.sendFile('views/login.html',
    { root: __dirname })
  );
  
  app.get('/',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => res.sendFile('views/index.html', {root: __dirname})
  );
  
  app.get('/private',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => res.sendFile('views/private.html', {root: __dirname})
  );
  
  app.get('/user',
    connectEnsureLogin.ensureLoggedIn(),
    (req, res) => res.send({user: req.user})
  );


/* REGISTER SOME USERS */

// UserDetails.register({username:'paul', active: false}, 'paul');
// UserDetails.register({username:'jay', active: false}, 'jay');
// UserDetails.register({username:'roy', active: false}, 'roy');