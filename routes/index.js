var https = require('https'),
  http = require('http');

/*
 * GET home page.
 */

module.exports = {
  index: function(req, res){
    res.render('index', { title: 'Express' })
  },
  login: function(req, res){
    login(req, function(rs){
      var html = '';
      rs.on('data', function(chunk){
        html += chunk;
      });
      rs.on('end', function(){
        var u_name = html.match(/var u_name = \'(.+)';/), ret = {},
          reasonExp = [
            /当前访问用户过多/, 
            /请输入正确的验证码/,
            /系统维护中/
          ];
        if(u_name){
          ret.login = true;
          ret.name = u_name[1];
        }else{
          ret.login = false;
          ret.code = -1;
          for(var i = 0, l = reasonExp.length; i < l; i++){
            if(reasonExp[i].test(html)){
              ret.code = i;
              break;
            }
          }
        }
        res.send(ret);
        console.log(html)
      });
      //rs.pipe(res);
    });
  },
  rancode: function(req, res){
    var headers = {
      'User-Agent': req.header('User-Agent'),
    }, cookie = req.header('Cookie');
    if(cookie){
      headers['Cookie'] = cookie;
    }
    var r = https.request({
      method: 'GET',
      host: 'dynamic.12306.cn',
      port: 443,
      path: '/otsweb/passCodeAction.do?rand=lrand&' + Math.random(),
      headers: headers
    }, function(rs){
      if(rs.headers['set-cookie'] && rs.headers['set-cookie'][0]){
        rs.headers['set-cookie'][0] = rs.headers['set-cookie'][0].replace('Path=/otsweb', '');
      }
      rs.headers['set-cookie'] && res.header('Set-Cookie', rs.headers['set-cookie']);
      rs.pipe(res);
    });
    r.on('error', function(e){
      res.send(e);
    });
    r.end();
    //console.log(r.output);
  },
  test: function(req, res){
    console.log(req.body);
  }
};

var login = function(req, cb){
  cb = cb || function(){};
  var data = "loginUser.user_name=" + 
    req.param('un') + "&nameErrorFocus=&user.password=" + req.param('pw') + 
    "&passwordErrorFocus=&randCode=" + req.param('rc') + "&randErrorFocus=",
  r = https.request({
    host: 'dynamic.12306.cn',
    //host: 'localhost',
    port: 443,
    path: '/otsweb/loginAction.do?method=login',
    //path: '/test',
    method: 'POST',
    headers: {
      'User-Agent': req.header('User-Agent'),
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'Content-Length': data.length,
      'Referer': 'https://dynamic.12306.cn/otsweb/loginAction.do?method=init',
      'Cookie': req.header('Cookie')
    }
  }, function(res){
    res.setEncoding('utf8');
    cb(res);
    //console.log('STATUS: ' + res.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(res.headers));
    //res.on('data', function (chunk) {
      //console.log('BODY: ' + chunk);
    //});
  });
  r.on('error', function(e){
    console.log(e);
  });
  r.write(data);
  r.end();
  console.log(r.output);  
};