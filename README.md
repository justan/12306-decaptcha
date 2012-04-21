#12306-decaptcha

##时过境迁的目标:

  *12306-decaptcha* 尝试对[中国铁路客户服务系统](https://dynamic.12306.cn/otsweb/) 的登录验证码 ![12306验证码](https://dynamic.12306.cn/otsweb/passCodeAction.do?rand=lrand "") 进行识别. 

  可运行在 *browser / node* 环境中
  
##Usage:

In browser: 
  
```javascript
<script type="text/javascript" src="https://raw.github.com/justan/12306-decaptcha/master/lib/decaptcha12306.js"></script>
<img id="passcode" src="https://dynamic.12306.cn/otsweb/passCodeAction.do?rand=lrand" />
<script type="text/javascript">
  var img = $("#passcode")[0];
  img.onload = function(){
    $.get('https://raw.github.com/justan/12306-decaptcha/master/imageset.json', function(imgset){//download the imageset.json to yourself server
      var result =  decaptcha.recognizer(img, imgset);
      alert(result.result);
    });
  }
</script>
```
  
In Node.js: 
  
```javascript
var Canvas = require('canvas'), Image = Canvas.Image, decaptcha = require('./12306-decaptcha');
var img = new Image;
img.src = "https://dynamic.12306.cn/otsweb/passCodeAction.do?rand=lrand";
var imgset = JSON.parse(fs.readFileSync('imageset.json', 'utf8'));
var result = decaptcha.recognizer(img, imgset);
console.log(result.result);
```
  
##License

(The MIT License)

Copyright (c) 2012 Justan

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.