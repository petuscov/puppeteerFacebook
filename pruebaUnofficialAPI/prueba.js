"use strict";

var arrUsers = require('../credentials.js').arrUsers;

var facebookUnofficialAPI = require("facebook-chat-api");
facebookUnofficialAPI({email: arrUsers.username, password: arrUsers.password}, (err,api)=>{
	if(err) return console.error(err);
});

//dónde se especifica el bot de facebook?
//es posible que no se use para fbdirect??