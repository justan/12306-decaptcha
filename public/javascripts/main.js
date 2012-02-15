(function($){

$(function(){
  var vectorData = localStorage.vectorData && JSON.parse(localStorage.vectorData);
  if(!vectorData){
    $.ajax('imageset').done(function(data){
      vectorData = data;
      localStorage.vectorData = JSON.stringify(data);
    });
  }
  function passcode(callback){
    var img = new Image();
    img.src = "passcode.jpg?" + Date.now();
    img.onload = function(){
      var results = decaptcha.recognizer(img, vectorData), res = [];
      results.result.length == 4 ? _.each(results.result, function(result, i){
        res.push(result[0][1])
        res.length == 4 && callback(res.join(''));
      }) : passcode(callback);
    };
  }
  function login(){
    passcode(function(r){
      console.log(r);
      $.ajax('login?autoretry=1', {
        type: "POST",
        data: {
          username: $("#username").val(),
          password: $("#password").val(),
          rancode: r
        }
      }).done(function(ret){
        if(ret.login){
          $("#login_box").hide();
          $("#check_box").show();
        }else{
          //if(ret.code === 0){
            login();
          //}
        }
      });
    });
    return false;
  }
  if(!window.__ISLOGIN__){
    document.login_form.onsubmit = login;
  }
})
})(jQuery);