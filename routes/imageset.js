var fs = require('fs');
  
var imageset = {},
  iconset = ['2','3','4','5','6','7','8','9','a','b','c','d','e','f','g',
    'h','j','k','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  
(function(){
  iconset.forEach(function(letter){
    fs.readdir('public/iconset/' + letter, function(err, files){
      var i;
      if(err) console.log(err);
      if(files){
        i = files.indexOf('Thumbs.db');
        console.log(letter + ': ' + files)
        if(i != -1){
          files.splice(i, 1);
        }
        imageset[letter] = files;
      }
    });
  });
})();
  
module.exports = function(req, res, next){
  res.send(imageset);
};