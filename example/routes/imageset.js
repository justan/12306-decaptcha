var fs = require('fs');
  
var imageset = {},
  fd, fstat,
  iconset = ['2','3','4','5','6','7','8','9','a','b','c','d','e','f','g',
    'h','j','k','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  
(function(){
  fs.open('../imageset.json', 'r+', function(err, f){
    if(err){
      next(err);
    }else{
      fd = f;
      fs.fstat(fd, function(err, stats){
        fstat = stats;
      });
    }
  });
})();
  
module.exports = {
  trainset: function(req, res){
    var count = 0;
    iconset.forEach(function(letter){
      fs.readdir('public/iconset/' + letter, function(err, files){
        var i;
        count++;
        if(err) console.log(err);
        if(files){
          i = files.indexOf('Thumbs.db');
          //console.log(letter + ': ' + files)
          if(i != -1){
            files.splice(i, 1);
          }
          imageset[letter] = files;
        }
        count >= iconset.length && res.send(imageset);
      });
    });
  },
  imageset: function(req, res, next){
    var vset = req.body.data,
      buffer;
    if(vset){
      if(fd){
        buffer = new Buffer(vset)
        fs.writeSync(fd, vset, 0, 'utf-8');
        res.send('ok');
      }else{
        res.send(404);
      }
    }else{
      if(fd && fstat){
        buffer = new Buffer(fstat.size);
        fs.read(fd, buffer, 0, fstat.size, 0, function(err, some){
          if(err){ next(err) }else{
            res.header('Content-Type', 'application/json; charset=UTF-8');
            res.header('access-control-allow-origin', '*');
            res.send(buffer);
          }
        });
      }else{
        res.send(404);
      }
    }
  }
};