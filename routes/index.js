var https = require('https'),
  http = require('http'),
  w = require('winston');

//w.setLevels(w.config.npm.levels);
//w.addColors(w.config.npm.colors);
w.add(w.transports.File, { filename: 'logs/w.log' });
/*
 * GET home page.
 */

module.exports = {
  index: function(req, res){
    res.render('index', { title: 'Express' })
  },
  login: function(req, res){
    login(req, function(err, rs){
      var html = '';
      if(err){
        res.send(err, 503);
      }else{
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
            req.session.username = ret.name;
          }else{
            ret.login = false;
            ret.code = -1;
            for(var i = 0, l = reasonExp.length; i < l; i++){
              if(reasonExp[i].test(html)){
                ret.code = i;
                ret.message = reasonExp[i].toString().replace(/(^\/|\/$)/g, '');
                break;
              }
            }
          }
          res.send(ret);
          w.silly(html)
        });
        //rs.pipe(res);
      }
    });
  },
  rancode: function(req, res){
    var headers = {
      'User-Agent': req.header('User-Agent'),
      'Referer': 'https://dynamic.12306.cn/otsweb/loginAction.do?method=init',
      'Accept': 'image/png,image/*;q=0.8,*/*;q=0.5'
    }, cookie = cookie_12306(req);
    w.silly(req.cookies);
    cookie && (headers['Cookie'] = cookie);
    
    var r = https.request({
      method: 'GET',
      host: 'dynamic.12306.cn',
      port: 443,
      path: '/otsweb/passCodeAction.do?rand=lrand&' + Math.random(),
      headers: headers
    }, function(rs){
      var _jsessionid, _BIGipServerotsweb;
      w.silly(rs.headers);
      rs.headers['set-cookie'] && rs.headers['set-cookie'].forEach(function(item){
        w.info(item);
        var nr = /^(.+?)=/,
          name = item.match(nr)[1],
          val = item.replace(nr, '').replace(/;.*$/, '');
        name && res.cookie(name, val);
        w.info('name: ' + name + ', val: ' + val);
      });
      rs.pipe(res);
    });
    r.on('error', function(e){
      res.send(e, 503);
      w.warn(e);
    });
    r.end();
    w.log('debug', r.output);
  },
  check: function(req, res){
    
  },
  test: function(req, res){
    w.silly(req.body);
  }
};

var login = function(req, cb){
  cb = cb || function(){};
  var data = "loginUser.user_name=" + 
    req.param('username') + "&nameErrorFocus=&user.password=" + req.param('password') + 
    "&passwordErrorFocus=&randCode=" + req.param('rancode') + "&randErrorFocus=",
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
      'Cookie': cookie_12306(req)
    }
  }, function(res){
    res.setEncoding('utf8');
    cb(undefined, res);
  });
  r.on('error', function(e){
    cb(e)
    w.warn(e);
  });
  r.write(data);
  r.end();
  w.verbose(r.output);  
},
cookie_12306 = function(req){
  var cookie;
  if(req.cookies.jsessionid && req.cookies.bigipserverotsweb){
    cookie = 'JSESSIONID=' + req.cookies.jsessionid + '; BIGipServerotsweb=' + req.cookies.bigipserverotsweb;
  }
  return cookie;
};