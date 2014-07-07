/* VARIABLES */
var fbPlaylist = new Firebase('https://traxlist.firebaseio.com' + $(location).attr('pathname'));
var SC_embed = "http://soundcloud.com/oembed?maxheight=130&format=json&url="; //remove maxheight to make BIG

var playlist_order_db = [];

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
};

fbPlaylist.on('value', function(snapshot) {
    if (snapshot.val() === null) {
        //die somehow;
        console.log('null');
    } else {
        console.log('not null');
    }
});

fbPlaylist.on('child_added', function(ChildSnapshot, prevChildName) {
    console.log('child_added');
    url = ChildSnapshot.val();
    console.log(url);
    playlist_order_db.push(url);
    var id = parse_url(url);
    handle_out_of_order(url, id);
});


function handle_out_of_order(url, id) {
    // add url to map
    url_map[url] = id;

    // find out idx of url
    var idx;
    $.each(playlist_order_db, function(key, value) {
        if (url == value) {
            idx = key;
            //break;
        }
    });
    playlist_ids[idx] = id;
};
areWeAPlaylist = true;
