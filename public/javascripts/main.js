(function($){


$(function(){
  $("#randcode").click(function(){
    this.src = this.src.replace(/0\.\d+$/, Math.random());
  });
  $("#dologin").click(function(){
    var un = $("#username").val(),
      pw = $("#password").val(),
      rc = $("#rancode").val();
    $.ajax('login', {
      type: "POST",
      data: {
        un: un,
        pw: pw,
        rc: rc
      }
    }).done(function(ret){
      if(ret.login){
        
      }else{
        
      }
    });
  });
})
})(jQuery);