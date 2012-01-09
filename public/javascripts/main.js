(function($){

$(function(){
  var rancode = function(){
    var fn = function(){
      ele.src = '/passcode.jpg?' + Math.random();
    },
    ele = fn.element = document.getElementById('randcode');
    return fn;
  }();
  
  if(!window.__ISLOGIN__){
    rancode();
    $("#randcode").click(function(){
      rancode();
    });

    document.login_form.onsubmit = function(e){
      $.ajax('login?autoretry=1', {
        type: "POST",
        data: {
          username: $("#username").val(),
          password: $("#password").val(),
          rancode: $("#rancode").val()
        }
      }).done(function(ret){
        if(ret.login){
          $("#login_box").hide();
          $("#check_box").show();
        }else{
          if(ret.code === 0){
            //rancode();
          }
        }
      });
      return false;
    };
  }
})
})(jQuery);