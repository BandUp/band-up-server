$(document).ready(function(){
    var myToken = window.location.href.split("/").pop();
    var baseUrl = "http://band-up-server.herokuapp.com/";

    $("form").submit(function(event){
        event.preventDefault();
        // gather and validate password inputs
        var pass1 = $("#inputPassword1").val();
        var pass2 = $("#inputPassword2").val();
        if (!validate(pass1, pass2)) {
            $("#input1").addClass("has-error");
            $("#input2").addClass("has-error");
            return;
        }
        var myUrl = baseUrl + "/reset-password/send";

        // send a confirmed password to server using ajax
        $.ajax({
            dataType: "jsonp",
            type: "POST",
            url: myUrl,
            contentType: 'application/json',
            data: JSON.stringify({
                token: myToken,
                password: pass1
            }),
            success: function(response){
                $("#successMessage").show();
                $("#resetForm").hide();
            }
        });
    });
});

function validate(password, password2){
    if(password !== password2){
        alert("Your passwords do not match");
        return false;
    }else if(password.length < 6) {
        alert("Your password must be at least 6 characters long");
        return false;
    }else if (!password.match(/[a-z]/) && !password.match(/[A-Z]/)) {
        alert("Your password must contain both upper and lower case characters");
        return false;
    }
    return true;
}
