var orm    = require("orm");
var mysql = require("mysql");
var Sync   = require("sql-ddl-sync").Sync;
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var button_array = [];

var db  = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'content'
});

db.getConnection(function(err, connection) {
   //connected! (unless `err` is set)
});
/* var db = mysql.createConnection({
	host:'localhost',
	user:'root',
	database:'content'
});

db.connect(function(err){
	if(err) console.log(err);
}); */

app.all('/*', function(req, res, next){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

server.listen(3000,'127.0.0.1');
console.log("server running :3000");

users = [];
connections = [];

app.get('/', function(req,res){
	res.sendFile(__dirname+ '/index.html');
});
io.sockets.on('connection',function(socket){
	connections.push(socket);
	//console.log('Connected: %s sockets connected', connections.length);
	
	//Disconnect
	socket.on('disconnect',function(data){
		connections.splice(connections.indexOf(socket),1);
		//console.log('Disconnect: %s sockets connected', connections.length);
	});
	
	db.getConnection(function(err, connection) {
	  // Use the connection
	  db.query('SELECT * FROM btn')
		.on('result', function(data){
			button_array.push(data);
		})
		.on('end', function(){
			socket.emit('initialbutton', button_array);
			connection.release();
		});
	});
	
	
	////update btn
	socket.on('updatebutton',function(data){
		/* console.log(data); */
		if(data.status==0){
			data.status=1;
		}else{
			data.status=0;
		}
		db.query('UPDATE btn SET ? WHERE btn_id = ?', [{ btn_status: data.status }, data.btn_id]);
		
		io.sockets.emit('eventbtnUpdate',{name_button:data.btn,datareturn:data.status} );
	});
	
	
	
});