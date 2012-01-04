(function($){


$(function(){
  $("#randcode").click(function(){
    this.src = this.src.replace(/0\.\d+$/, Math.random());
  });
  
  document.login_form.onsubmit = function(e){
    $.ajax('login', {
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
        
      }
    });
    return false;
  };
})
})(jQuery);