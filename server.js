var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var connect = require('connect');
var request = require('request');
var Firebase = require('firebase');

var fbRoot = new Firebase('https://traxlist.firebaseio.com/');
var playlists_ref = new Firebase('https://traxlist.firebaseio.com/p/');
var playlists_list = [];
/* predeclaring functions */

// function to keep a active list of playlists

playlists_ref.on('child_added', function(dataSnapshot, prevChildSnapshot) {
    console.log('playlist_added: ' + dataSnapshot.name());
    playlists_list.push(dataSnapshot.name());
});
/* end of predeclarations */

/* setup static routes */
app.set('view engine', 'html');    //# use .html extension for templates
app.set('layout', 'layout');       //# use layout.html as the default layout
app.set('partials', {
        analytics: 'ga', 
        providers: 'providers',
        local_js: 'local_js',
        css: 'css',
        site_header:'site_header',
        reddit_h:'reddit_h',
        playlist_data: 'playlist_data',
    });
app.enable('view cache');
app.engine('html', require('hogan-express'));

app.use(express.compress())

app.use(function(req, res, next) {
   if(req.url.substr(-1) == '/' && req.url.length > 1)
       res.redirect(301, req.url.slice(0, -1));
   else
       next();
});

app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/", express.static(__dirname));

app.use(express.bodyParser());

app.get('/p/:uid/edit/:key', function(req, res){
    res.locals = {
        local_script: 'edit.js',
        local_script2: 'pedit.js',
        reddit_header: '',
        user_stuffs:'user_stuff_edit',
        };
    res.render('playlist');
});

app.get('/p/:uid/edit/', function(req, res){
    res.redirect('/');
});

app.get('/r/:sub', function(req, res) {
    //return a reddit page
    res.locals = {
        local_script: 'edit.js',
        local_script2: 'reddit.js',
        reddit_header: '',
        };
    res.render('playlist');
});

app.get('/p/:uid', function(req, res) {
    res.locals = { local_script: 'view.js', };
    res.render('playlist', {partials: { user_stuffs: 'user_stuff_view' }});
});

app.get('/faq', function(req, res) {
    res.sendfile(__dirname + '/faq.html');
});

app.get('/r/', function(req, res) {
    res.sendfile(__dirname + '/subreddits.html');
});

app.get('/random/', function(req, res) {
    //return a random playlist
    var p_entry = (Math.floor((Math.random() * 100000) + 1)) % playlists_list.length;
    res.redirect('/p/' + playlists_list[p_entry]);
});

app.get('/at', function(req, res) {
    res.sendfile(__dirname + '/all_traxlist.html');
});

app.get('/', function(req, res) {
    res.locals = { local_script: 'edit.js', };
    res.render('playlist');
});

app.get('*', function(req, res) {
    res.locals = { local_script: 'edit.js', };
    res.render('playlist');
});

/*
  To Run server on port 3000:
    node server.py
  Run server on port 80:
    node server.py prod
 */
var env = process.argv[2] || 'dev'
var port = (env == 'prod') ? 80 : 3000
console.log('Listening on ' + port)
server.listen(port);
