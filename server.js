 /* Include static file webserver library */
 var static = require('node-static');

 /* Include http server library*/
 var http = require('http');

 /* Assume we're running this on heroku*/
 var port = process.env.PORT;
 var directory = __dirname + '/public';

 /* If not on heroku, readjust port/directory info. Port won't be set if not on heroku*/
 if (typeof port == 'undefined' || !port) {
 	directory = './public';
 	port = 8080;
 }

/*Set up a static web server that'll deliver files from the filesystem*/
var file = new static.Server(directory);

/*Construct an http server that gets files from the file server*/
var app = http.createServer(
	function(request,response) {
		request.addListener('end' , 
			function(){
				file.serve(request,response);
			}).resume();
	}
).listen(port);

console.log('The server is running'); 