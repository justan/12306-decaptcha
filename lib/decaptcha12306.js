/**
 * 12306 验证码识别
 */

var decaptcha = (typeof module !== "undefined" && module.exports) || {};

(function(exports){

var BG = "rgba(255, 255, 255, 255)",
  LETTER_HEIGHT = 14, //字母高度
  TRANSFORM_RATE = [1, 0, .38, 1, 0, 0], //变形
  GREY = 160; //背景分离灰度

var Canvas;
if(typeof module !== "undefined" && module.exports){
  Canvas = require('canvas');
}else{
  Canvas = function(width, height){
    var c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    return c;
  };
}
var Objeach = function(obj, fn){
  for(var key in obj){
    fn(key, obj[key]);
  }
};
/**
 * 处理验证码
 */
var Blade = function(){
  var fn = function(canvas){
    this.canvas  = canvasClone(canvas);
    this.context = this.canvas.getContext('2d');
  };
  fn.prototype = {
    grey: function(bindepth){
      var img = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height), 
      d = img.data, c256;
      for(var i = 0, l = d.length; i < l; i += 4){
        c256 = grey(d[i], d[i + 1], d[i + 2]);
        if(bindepth !== undefined){
          c256 = c256 > bindepth ? 255 : 0;
        }
        d[i] = d[i + 1] = d[i + 2] = c256;
      }
      this.context.putImageData(img, 0, 0);
      return this;
    },
    
    transform: function(){
      var myc = canvasClone(this.canvas);
      this.context.save();
      this.canvas.width *= (1 + arguments[2]);
      this.canvas.height *= (1 + arguments[1]);
      this.context.fillStyle = BG;
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.context.setTransform.apply(this.context, arguments);
      this.context.drawImage(myc, 0, 0);
      //this.context.restore();
      return this;
    },
    /**
     * 切分验证字符
     */
    binSplit: function(){
      var image = this.canvas, w = image.width, h = image.height,
        lettersPos = [], lettersData = [], start = 0, end = 0, pix, startY = h - 1, endY = 0,
        foundletter, inletter, _inletter,
        img = this.context.getImageData(0, 0, w, h), 
        data = img.data,
        min = Math.min, max = Math.max;
      for(var x = 0; x < w; x++){
        for(var y = 0; y < h; y++){
          pix = data[(y*w + x)*4];
          if(pix === 0){
            inletter = true;
            if(!_inletter){
              startY = min(startY, y);
            }
            if(y == h - 1){
              endY = h;
            }
            _inletter = true;
          }else{
            if(_inletter){
              endY = max(endY, y);
            }
            _inletter = false;
          }
        }
        if(!foundletter && inletter){
          foundletter = true;
          start = x;
        }
        if(foundletter && !inletter){
          foundletter = false;
          end = x;
          //fix height
          if(endY - startY < LETTER_HEIGHT){
            if(startY === 0){
              startY = endY - LETTER_HEIGHT;
            }else if(endY === 0){
              endY = startY + LETTER_HEIGHT;
            }
          }
          //fix height end
          
          if(end - start >= 5){
            lettersPos.push([start, end, startY, endY]);
            var _imgdata_ = this.context.getImageData(
              start, startY, end - start, endY - startY
            );
            if(startY < 0){
              for(var i = 0, m = -startY*(end - start); i < m; i++){
                _imgdata_.data[i] = '255';
              }
            }
            lettersData.push(_imgdata_);
          }
          startY = h - 1, endY = 0;
        }
        inletter = false;
      }
      if(lettersPos.length < 4){
        
      }
      
      return lettersData;
    }
  };
  var grey = function(r, g, b){
    var p = Math.pow;
    return p((p(r, 2.2)*.2973 + p(g, 2.2)*.6274 + p(b, 2.2)*.0753), 1/2.2);
  };
  return fn;
}();

var dataTocanvas = function(imgdata){
  var ct = new Canvas(imgdata.width, imgdata.height).getContext('2d');
  ct.putImageData(imgdata, 0, 0);
  return ct.canvas;
},
canvasClone = function(canvas){
  var ct = new Canvas(canvas.width, canvas.height).getContext('2d');
  ct.drawImage(canvas, 0, 0);
  return ct.canvas;
},
buildvector = function(imgdata){
  var d1 = [], d = imgdata.data;
  for(var i = 0, l = d.length; i < l; i += 4){
    d1.push(d[i]);
  }
  return {data: d1, width: imgdata.width, height: imgdata.height};
},
besmart = function(imgdata, trainset){
  var guess = [];
  Objeach(trainset, function(letter, imgs){
    imgs.forEach(function(img){
      guess.push([v.relation(img, buildvector(imgdata)), letter]);
    });
  });
  guess = guess.sort().reverse();
  return guess;
},
/**
 * 验证码识别主要方法
 * @param {Object} img 验证码图片对象
 * @param {Object} trainset 验证数据集合
 * @return {Object} detail: 详细的结果参数, result: 最为可能的结果
 */
recognizer = function(img, trainset){
  var w = img.width, h = img.height, 
    canvas = new Canvas(w, h),
    ctx = canvas.getContext('2d'), imageData, bl, result = [], imgs = [], detail = [];
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0);
  imageData = ctx.getImageData(0, 0, w, h);
  bl = (new Blade(canvas));
  bl.transform.apply(bl, TRANSFORM_RATE).grey(GREY);
  
  bl.binSplit().forEach(function(imgData, i){
    var res = besmart(imgData, trainset);
    detail.push(res);
    result.push(res[0][1]);
    imgs.push(dataTocanvas(imgData));
  });
  return {detail: detail, imgData: imgs, result: result};
},
//根据图片集生成矢量数据集
vectorSet = function(imgSet){
  var vSet = {};
  Objeach(imgSet, function(letter, imgs){
    imgs.forEach(function(img){
      vSet[letter] = vSet[letter] || [];
      vSet[letter].push(buildvector(canvasClone(img).getContext('2d').getImageData(0, 0, img.width, img.height)));
    });
  });
  return vSet;
};

var VectorCompare = (function(){
  var fn = function(){};
  fn.prototype = {
    magnitude: function(concordance){
      var total = 0;
      concordance.data.forEach(function(item, i){
        var x = i % concordance.width, y = Math.floor(i/concordance.width)
        total += Math.pow(item*(Math.pow(x*x + y*y, 1/2)), 2);
      });
      return Math.sqrt(total)
    },
    /**
     * 计算矢量相关率
     * @return {Number} 相关率
     */
    relation: function(concordance1, concordance2){
      var relevance = 0, topvalue = 0;
      for(var i = 0, w = Math.min(concordance1.width, concordance2.width); i < w; i++){
        for(var j = 0, h = Math.min(concordance1.height, concordance2.height); j < h; j++){
          topvalue += concordance1.data[j*concordance1.width + i]*concordance2.data[j*concordance2.width + i]*(i*i + j*j);
        }
      }
      return topvalue / (this.magnitude(concordance1) * this.magnitude(concordance2));
    }
  };
  return fn;
})();

var v = new VectorCompare();

exports.recognizer = recognizer;
exports.vectorSet = vectorSet;
})(decaptcha)