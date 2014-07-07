/* playlist_handler.js */
/* VARIABLES */
var fbRoot = new Firebase('https://traxlist.firebaseio.com/');
var cur_Playlist;
var playlist_path = 'a';
var playlist_hash = '';

/* function declarations */
var send_new_trax = function(t_url) {
    $.post("/newtrack", {
        track_url: t_url,
        playlist: playlist_path,
        key: playlist_hash
    });
}

var bindNewStuff = function() {
    $('#track_button').click(function(event) {
        event.preventDefault();
        console.log("attempting to add new track");
        send_new_trax($('#track_url').val());
    });

    $('#track_url').keypress(function(event) {
        if (event.which == 13) {
            console.log("pressed enter");
            send_new_trax($('#track_url').val());
        }
    });
}

var handleUrl = function(path) {
    var p_data = path.split('/');

    switch (p_data.length) {
        case 1:
            playlist_path = p_data[1];
            break;

        case 2:
            playlist_path = p_data[1];
            playlist_hash = p_data[2];
            break;

        default:
            break;
    }
    $('#playlist_save').val(document.URL);

    cur_Playlist = fbRoot.child(playlist_path);

    cur_Playlist.on('child_added', function(childSnapshot, prevChildName) {
        console.log('C_A: ' + childSnapshot.val());
    });
}

/* end of function declarations */

$(function() {
    console.log("Set up bindings");
    bindNewStuff();
    console.log("Bindings Bound");

    handleUrl(window.location.pathname);

    console.log(window.location.pathname);


});
