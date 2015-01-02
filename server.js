var Hapi = require('hapi');
var Jade = require('jade');
var Firebase = require('firebase');
var Backbone = require('backbone');
var Youtube = require('youtube-node');
var request = require('request');

var SocketIO = require('socket.io')


var sOptions = {
	host: 'localhost',
	port: 8950
};

// Create a server with a host and port
var server = new Hapi.Server();
server.connection( sOptions );

server.route({
    method: 'GET',
    path: '/img/{param*}',
    handler: {
        directory: {
            path: 'public',
            path: './img'
        }
    }
});

server.route({
    method: 'GET',
    path: '/js/{param*}',
    handler: {
        directory: {
            path: 'public',
            path: './js'
        }
    }
});

server.route({
    method: 'GET',
    path: '/css/{param*}',
    handler: {
        directory: {
            path: 'public',
            path: './css'
        }
    }
});

server.route({
    method: 'GET',
    path:'/r/{param*}', 
    handler: function (request, reply) {
        console.log('reddit request');
        if (request.params.param.indexOf('+') > -1){
            var pSplit = request.params.param.split('+');
            var count = 0;
            var url = []
            console.log(pSplit);
            pSplit.forEach(function(reddit){
                request('http://reddit.com/r/' + reddit + '.json', function(error, response, body){
                     count++;
                     if (!error && response.statusCode == 200) {
                        var jObj = JSON.parse(body);
                        console.log(jObj);
                        if ( count === pSplit.length ){
                            var fn = Jade.compileFile('layouts/reddit.jade', {});
                            var html = fn({urls: url});
                            reply(html);
                        }
                    }
                });
            });
        }else{
            var reddit = request.params.param;
            request('http://reddit.com/r/futurebeats.json', function(error, response, body){
                var jObj = JSON.parse(body);
                console.log(jObj);
            });
        }
    }
});

server.route({
    method: 'GET',
    path:'/', 
    handler: function (request, reply) {
    	var fn = Jade.compileFile('layouts/index.jade', {});
    	var html = fn(sOptions);
    	reply(html);
    }
});


var fbRef = new Firebase('https://traxlist.firebaseio.com/new/');

fbRef.on('child_added', function(dSnap){
	var sObj = {
		provider: dSnap.child('provider').val(),
		url: dSnap.child('url').val()
	}

	if (sObj.provider === "soundcloud"){
		console.log(dSnap.name() + ":added soundcloud");
	}

	if (sObj.provider === 'youtube'){
		console.log(dSnap.name() + ":added youtube");
	}

});

var io = SocketIO.listen(server.listener);
io.sockets.on('connection', function(socket) {
   	socket.on('add', function(data){
   		console.log(data);
   	}); 
});

// Start the server
server.start(function(){
	console.log('server started: http://' + sOptions.host + ':' + sOptions.port);
});

