"use strict";

var http = require("http");
var fileSystem = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var session = require('express-session');
var cookieParser = require('cookie-parser');
const saltRounds = 10;

//var mysqlEvents = require('mysql-events'); //TODO para actualizado de analisis en vivo
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'root',
  database : 'messengerbots' //podemos usar una db distinta a la del analizador.
});

var express = require('express');
var app = express();

//passport mw.
//app.use(passport.session({ secret: 'anything' }));
app.use(cookieParser()) //?
app.use(session({ 
    secret: 'anything',
    resave: true,
    saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get("/",function(req,res){
	res.sendFile(__dirname + '/mainPage.html');   
})
app.get("/analysis.js",function(req,res){
	res.sendFile(__dirname + '/analysis.js');   
})
app.get('/index.css',function(req,res){
    res.sendFile(__dirname + '/index.css');   
});
app.get('/Chart.bundle.min.js',function(req,res){
    res.sendFile(__dirname + '/Chart.bundle.min.js');   
});
app.get('/mainPage.js',function(req,res){
    res.sendFile(__dirname + '/mainPage.js');   
});
app.get('/mainPage.html',function(req,res){
    res.sendFile(__dirname + '/mainPage.html');   
});
app.get('/mainPage.css',function(req,res){
    res.sendFile(__dirname + '/mainPage.css');   
});
app.get('/logedPage.html',isAuthenticated,function(req,res){
    res.sendFile(__dirname + '/logedPage.html');   
});
app.get('/logedPage.js',function(req,res){
    res.sendFile(__dirname + '/logedPage.js');   
});
app.get('/favicon.ico',function(req,res){
    res.sendFile(__dirname + '/res/analyzer.ico');
});

//TODO.
app.get("/analysis.html",function(req,res){
    //TODO obtener info del bot y enviarla junto con la página.
    //templates, vue, en res.headers de alguna forma? es posible y sencillo?
    res.sendFile(__dirname + '/analysis.html');   
})
app.get('/analysis/:id',function(req, res) {
    res.send('NOT IMPLEMENTED YET. analysis id: ' + req.params.id);
});

var serv = require('http').Server(app);
serv.listen(3000,()=>{
	console.log("listening on 3000.");
});

function isAuthenticated(req, res, next) {

    //passport middleware (gestión sesiones)
    if (req.user.authenticated){
        return next();
    } 
    res.redirect('/');
}

//TODO
app.post('/action_search',function(req,res){

});

app.post('/action_login',function(req,res){
    //comprobamos si existe el usuario y el hash de la contraseña coincide con el de el usuario.
    loginUser(req.body.username,req.body.password).then(function(correct){
        if(correct){
            passport.authenticate('local', { failureFlash: 'Invalid username or password.'});

            res.redirect('/logedPage.html');    
            //, session:true });
            
        }else{
            res.redirect('/'); //TODO informar usuario de bad login?
        }
    }).catch(function(err){
        console.log("err:" + err);
    });
});
//TODO CONSOLE.LOG de NOPE, login incorrecto mostrar en errorMsg div.
//COMPLETAR EN RES.SEND el envio de si el login ha sido correcto o no.

app.post('/action_signup',function(req,res){
    //Comprobamos si ya existe usuario con el username que se pretende crear
    saveUser(req.body.username,req.body.password).then(function(correct){
        if(correct){
            console.log("username registered.");
        }else{
            console.log("username already exists.");
        }
    }).catch(function(err){
        console.log("unexpected error: "+ err);
    });
});
//TODO LOS CONSOLE.LOGS mostrar en errorMsg div.
//COMPLETAR EN RES.SEND el envio de si el signup ha sido correcto o no.
//LOS ANALISIS SE PODRAN VER SIN LOGEARSE, PERO REALIZAR UN ANALISIS NO SE PODRÁ HACER SI EL USUARIO NO ESTÁ LOGEADO.





//WS (actualización de análisis en vivo)
	
//ante eventos de mysql-events socket.emit al cliente con la info.
//de momento lo simulamos con setinterval. (o settimeout.)

var io=require('socket.io')(serv,{});

io.sockets.on('connection',function(socket){

   	setInterval(function(){
		var message = Math.random().toString(36).substr(2, 5);
    	var time = 3 + (1-Math.random()*2);
    	var emojiFlag = Math.random()>0.5;
        socket.emit("info",{
        	message: message,
        	time: time,
        	emojiFlag : emojiFlag
        });
   	},5000); //simulamos actualización cada 5 secs.

        

    socket.on('disconnect', function() {
       
    });

} );

///

/**
 * saves new user in db. Called in SignUp request.
 **
 * @param  {String} - username - name of the user.
 * @param  {String} - password - password whose hash will be stored.
 **
 * @returns {Promise} - rejected if error, resolved to false if username already exists.  
 */
function saveUser(username, password){
    return new Promise(function(resolve,reject){
        bcrypt.hash(password, null,null, function(err, passwordhash) { //TODO que esta pasando.
            if(err){reject(err);}
            connection.query('insert into users(username, passwordhash) values ("'+username+'","'+passwordhash +'"'+');', 
            function (error, results, fields) {
                if (error) {
                  return connection.rollback(function() {
                    resolve(false); 
                  });
                }else{
                    resolve(true);
                }
            });
        });
        
    });
}

/**
 * check if user-password auth is correct. Called in Login request.
 **
 * @param  {String} - username - name of the user trying to login.
 * @param  {String} - password - password of the user trying to login.
 **
 * @returns {Promise} - rejected if error, resolved to false if auth failed, resolved to true if auth correct.  
 */
function loginUser(username, password){
    return new Promise(function(resolve,reject){
       
        connection.query('Select passwordhash from users where username="' + username+ '";', 
            
        function (error, results, fields) {
            if (error) {
              return connection.rollback(function() {
                reject(error); 
              });
            }else{
                if(results.length===1){
                    bcrypt.compare(password, results[0].passwordhash, function (err, result) {
                        if(err){reject(err);}
                        if (result === true) {
                          resolve(true);
                        } else {
                          resolve(false);
                        }
                    });
                }else{
                    resolve(false);
                }
            }
        });
    });
}