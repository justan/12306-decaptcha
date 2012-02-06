
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , stache = require('stache');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'mustache');
  app.register('.mustache', stache);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);
app.get('/passcode.jpg', routes.rancode);
app.get('/check.html', routes.check);

app.post('/login', routes.login);
app.post('/test', routes.test);

app.get('/imageset', routes.imageset);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
