var Hapi = require('hapi');
var Jade = require('jade');
var Firebase = require('firebase');
var Backbone = require('backbone');
var Youtube = require('youtube-node');
var request = require('request');
var events = require('events');
var eventEmitter = new events.EventEmitter();

var SocketIO = require('socket.io')


var sOptions = {
    host: 'localhost',
    port: 8950
};

// Create a server with a host and port
var server = new Hapi.Server();
server.connection(sOptions);

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
    path: '/fonts/{param*}',
    handler: {
        directory: {
            path: 'public',
            path: './fonts'
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
    path: '/r/{param*}',
    handler: function(req, reply) {
        var fn = Jade.compileFile('layouts/reddit.jade', {});
        var pOptions = {
            urls: []
        };
        var tUrls = [];
        var count = 0;
        var total = 0;

        if (req.params.param) {
            var pSplit = req.params.param.split('+');
            pSplit.forEach(function(sub) {
                request('http://reddit.com/r/' + sub + '.json', function(error, resp, body) {
                    if (!error && resp.statusCode == 200) {
                        total += JSON.parse(body).data.children.length;
                        console.log('total: ' + total);

                        JSON.parse(body).data.children.forEach(function(child) {
                            tUrls.push(child.data.url);
                            count++;
                            console.log('count:' + count);
                            if (count == total) {
                                console.log('calling html');
                                pOptions.urls = tUrls;
                                html = fn(pOptions);
                                reply(html);
                            }
                        });
                    }
                });
            });

        }
    }
});

server.route({
    method: 'GET',
    path: '/at/',
    handler: function(request, reply) {
        var fn = Jade.compileFile('layouts/alltrax.jade', {});
        var html = fn(sOptions);
        reply(html);
    }
});

server.route({
    method: 'GET',
    path: '/random/',
    handler: function(request, reply) {
        var fn = Jade.compileFile('layouts/random.jade', {});
        var html = fn(sOptions);
        reply(html);
    }
});

server.route({
    method: 'GET',
    path: '/faq/',
    handler: function(request, reply) {
        var fn = Jade.compileFile('layouts/faq.jade', {});
        var html = fn(sOptions);
        reply(html);
    }
});


server.route({
    method: 'GET',
    path: '/',
    handler: function(request, reply){
        var fn = Jade.compileFile('layouts/index.jade', {});
        var html = fn(sOptions);
        reply(html);   
    }
});

var fbRef = new Firebase('https://traxlist.firebaseio.com/new/');

fbRef.on('child_added', function(dSnap) {
    var sObj = {
        provider: dSnap.child('provider').val(),
        url: dSnap.child('url').val()
    }

    if (sObj.provider === "soundcloud") {
        console.log(dSnap.name() + ":added soundcloud");
    }

    if (sObj.provider === 'youtube') {
        console.log(dSnap.name() + ":added youtube");
    }

});

var io = SocketIO.listen(server.listener);
io.sockets.on('connection', function(socket) {
    socket.on('add', function(data) {
        console.log(data);
    });
});

// Start the server
server.start(function() {
    console.log('server started: http://' + sOptions.host + ':' + sOptions.port);
});
