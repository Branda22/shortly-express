var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session')


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var bcrypt = require('bcrypt-nodejs');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// app.use(express.cookieParser('bobbafet'))
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({
  secret: 'darthVader',
  resave: false,
  saveUninitialized: true
}))


app.get('/', 
function(req, res) {
  restrict(req,res, function() {
    res.render('index');
  })
  //req.api key
  //true: render index
  // false: render login
});

app.get('/create', 
function(req, res) {
  restrict(req,res, function() {
    res.render('create');
  })
});

app.get('/links', 
function(req, res) {
  restrict(req, res, function() {
    Links.reset().fetch().then(function(links) {
      res.send(200, links.models);
    });
    
  })
});

app.get('/login', function(req, res) {
  if(req.session.username){
    res.redirect('/');
  } else {
    res.render('login');
  }
})

app.get('/signup', function(req, res) {
  if(req.session.username){
    res.redirect('/');
  } else {
    res.render('signup');
  }
})

app.post('/login', function(req, res) {
  var username = req.body.username
  var password = req.body.password;
  var sess = req.session;
  if(!username || !password) {
    console.log('empty username or pass')
    return res.redirect('/login');
  }
  bcrypt.hash(password, db.salt, null, function(err, hash){
    if(err) return console.log("Hashing error", err);
    new User({ username: username, password: hash }).fetch().then(function(found){
      if(found){
        sess.username = username;
        return res.redirect('/index');
      } else {
        return res.redirect('/login'); 
      }
    });
  });
})

app.post('/signup', function(req, res){
  var username = req.body.username; 
  var password = req.body.password;
  var sess = req.session;
  if(!username || !password) {
    console.log('empty username or pass')
    return res.redirect('/signup')
  }  
  new User({ username: username }).fetch().then(function(found){
    if(found){
      sess.username = username;
      res.redirect('/')
    } else {
      var user = new User({
        username: username,
        password: password
      });
      user.save().then(function(newUser){
        Users.add(newUser);
        sess.username = username;
        res.redirect('/')
      });
    }
  });
})

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

function restrict(req, res, next){
  //console.log(req.session)
  if(req.session && req.session.username){
    next()//callback
  } else {
    //console.log('restricted no user redirect')
    res.redirect('/login')
  }
}



console.log('Shortly is listening on 4568');
app.listen(4568);
