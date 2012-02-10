var fs = require('fs');
  
var imageset = {},
  iconset = ['2','3','4','5','6','7','8','9','a','b','c','d','e','f','g',
    'h','j','k','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  
(function(){
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
  imageset: function(req, res){
    
  }
};