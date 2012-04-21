
/**
 * Module dependencies.
 */

var express = require('express')
  , fs = require('fs')
  , routes = require('./routes')
  , stache = require('stache')
  , request = require('request')
  , imageset = require('./routes/imageset')
  , decaptcha = require('../')
  , Canvas = require('../node_modules/canvas')
  , Image = Canvas.Image;

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
app.get('/crack.js', function(req, res){
  fs.createReadStream('../lib/decaptcha12306.js').pipe(res);
});

app.get('/', routes.index);
app.get('/passcode.jpg', routes.rancode);
app.get('/check.html', routes.check);

app.post('/login', routes.login);
app.post('/test', routes.test);

app.get('/trainset', imageset.trainset);
app.all('/imageset', imageset.imageset);

//node example
var trainset = JSON.parse(fs.readFileSync('../imageset.json', 'utf8'));

app.get('/node_test', function(req, res){
  var img = new Image;
  buf = request({
    url: 'https://dynamic.12306.cn/otsweb/passCodeAction.do?rand=lrand',
    encoding: null
  }, function(err, resp, buf){
    img.src = buf;
    var canvas = new Canvas(img.width, img.height);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    console.log('passcode loaded');
    var result = decaptcha.recognizer(canvas, trainset);
    result.originImage = canvas.toDataURL();
    result.imgData.forEach(function(data, i, arr){
      arr[i] = data.toDataURL();
    });
    result.result = result.result.join('');
    res.render("node_test", result);
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
