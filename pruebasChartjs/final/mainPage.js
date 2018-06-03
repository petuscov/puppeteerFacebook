"use strict";

window.onload = ()=>{
	$('#login').click(function(){
		$('#loginModal').show();
	});
	$('#signup').click(function(){
		$('#signUpModal').show();
	});
	$('#closeLoginModal').click(function(){
		$('#loginModal').hide();
		$('.errorMsg').text("");
	});
	$('#closeSignUpModal').click(function(){
		$('#signUpModal').hide();
		$('.errorMsg').text("");
	});
	$('#loginModal').click(function(event){
		if (event.target.id == 'loginModal') {
	    	$('#loginModal').hide();
	    	$('.errorMsg').text("");
	    }
	});
	$('#signUpModal').click(function(event){
		if (event.target.id == 'signUpModal') {
	        $('#signUpModal').hide();
	    	$('.errorMsg').text("");
	    }
	});

	$('#logInForm').submit(function(event) {
        event.preventDefault();
        $.post('/action_login', function(data) {
        	if(data.errMsg){
        		$('.errorMsg').text(data.errMsg);
        	}
  		});
	});
	$('#signUpForm').submit(function(event) {
        event.preventDefault();
        $.post('/action_signup', function(data) {
    		if(data.errMsg){
    			$('.errorMsg').text(data.errMsg);
  			}
  		});
	});
};

function validateLoginData(){
	if($('#username').val().length<7){
		$('.errorMsg').text("Los nombres de usuario tienen más de 6 caracteres.");
		//console.log("Los nombres de usuario tienen más de 6 caracteres.");
		return false;
	}
	if($('#username').val().length>15){
		$('.errorMsg').text("Los nombres de usuario tienen 15 caracteres o menos.");
		//console.log("Los nombres de usuario tienen 15 caracteres o menos.");
		return false;
	}
	return true;
}

function validateSignUpData(){
	if(!/[0-9]+/.test($('#newPassword').val()) || !/[A-Za-z]+/.test($('#newPassword').val())){
		$('.errorMsg').text("Contraseña debe tener por lo menos una letra y un dígito.");
		//console.log("Contraseña debe tener por lo menos una letra y un dígito.");
		return false;
	}
	if($('#newUsername').val().length<7){
		$('.errorMsg').text("Username debe tener más de 6 caracteres.");
		//console.log("Username debe tener más de 6 caracteres.");
		return false;
	}
	if($('#newUsername').val().length>15){
		$('.errorMsg').text("Username debe tener 15 caracteres o menos.");
		//console.log("Username debe tener 15 caracteres o menos.");
		return false;
	}
	if($('#newPassword').val().length<7){
		$('.errorMsg').text("Contraseña debe tener más de 6 caracteres.");
		//console.log("Contraseña debe tener más de 6 caracteres.");
		return false;
	}
	if($('#newPassword').val() != $('#newPasswordConf').val()){
		$('.errorMsg').text("Contraseña y confirmación no coinciden.");
		//console.log("Contraseña y confirmación no coinciden.");
		return false;
	}
	return true;
}