//globals
var fbRoot = new Firebase('https://traxlist.firebaseio.com/');
var playlists_ref = new Firebase('https://traxlist.firebaseio.com/p/');
var bad_links_ref = new Firebase('https://traxlist.firebaseio.com/bad/');
var embed_https = "https://noembed.com/embed?nowrap=on&url=";
var embed_http = "http://noembed.com/embed?nowrap=on&url=";
/* VARIABLES */

var url_map = {};
var playlist_entries = [];
var playlist_ids = [];
var playlist_objects = {};
var bad_links = [];
var playlist_id_to_url = {};
var areWeAPlaylist = false;
var currently_playing;
var playing_status = false;
var playlist_rebind_by_id = {};

// generic functions
var reBindObjects = function(reBind_id){
    console.log('trying some rebinding shit ID: ' + reBind_id);
    playlist_rebind_by_id[reBind_id](reBind_id);
}

    function toggle_playing() {
    currently_playing = currently_playing || $('#playlist_container').find('div').first().attr('name');
    $.each(playlist_objects, function(div_id, object) {
        console.log(object);

        if (div_id == currently_playing)
            object.playpause_toggle() || object.toggle();
    });
}

function get_currently_playing_id(){
    $.each(playlist_objects, function(div_id, object) {
        console.log(object);
	if (object.getState() == 1) //playing
	    return div_id;
    });
    return playlist_ids[0];
}

function play_prev(){
    $.each(playlist_ids,function(key, value){
            if (currently_playing == value){
                //play prev
                playlist_objects[playlist_ids[key-1]].play();
                currently_playing = playlist_ids[key-1];
                 var pos = $("div[name='" + playlist_ids[key-1] + "']").offset() || $("#" + playlist_ids[key-1]).offset();
                $('html,body').animate({
                    scrollTop: pos.top
                });
            }
        });
    }

function play_next(cur_idx) {
    var next = false;

    console.log('pn: cur_idx: ' + cur_idx);
    console.log('pn: playlist_ids: ' + playlist_ids);

    var done = false;
    $.each(playlist_ids, function(key, value) {
        if (done) {
            return;
            }
        console.log('k/v ' + key + '/' + value);
        if (next) {
            console.log('we found next: ' + value);
            
            stop_all_except_given(value);
            playlist_objects[value].play();

            done = true;

            console.log('gonna move diz bitch');
            setTimeout(function(){console.log("div[name='" + value + "']");
            var pos = $("div[name='" + value + "']").offset() || $("#" + value).offset();
            $('html,body').animate({ scrollTop: pos.top });
            currently_playing = value;},350);
            return;
        } else {
            console.log('looking for next.: ' + value + ' :: cur idx: ' + cur_idx);
            if (value == cur_idx) {
                next = true;
            }
        }
        });

}

function stop_all_except_given(stop_id) {
    $.each(playlist_objects, function(div_id, object) {
        if (stop_id != div_id) {
            console.log('stopping ' + div_id);
            
            if ($('#player_' + div_id).height() == 500){
               console.log('big boy: ' + div_id);
                $('#player_' + div_id).animate({height:'166px'});
                $('div[name=' + div_id + ']').animate({height:'166px'});
            }

            if (object !== undefined && object.stop !== undefined)
                object.stop();
        }
    });
}

/* CLIENT SIDE FUNCTIONS */

function sanitize_playlistname(playlist_name) {
    if (playlist_name.charAt(playlist_name.length - 1) == '!') {
        return playlist_name.slice(0, playlist_name.length - 1);
    }
    return name
}

function save_playlist(traxlist_name, key, edit_able) {

    var saved = false;
    var playlist_name =  typeof traxlist_name !== 'undefined' ? traxlist_name : $('#playlist_save_url').val();
    var password = typeof key !== 'undefined' ? key : guid(); 
    var editable = typeof edit_able !== 'undefined' ? edit_able : false;
    var playlist_ref =  playlists_ref.child(playlist_name);
    fbRoot.child('i').child(playlist_name).child('key').set(password);

    //rebuild playlist order in the event of moves.
    var idx = 0;
    playlist_entries = [];
    $.each(playlist_ids, function(k, v) {
        playlist_entries[idx] = playlist_id_to_url[v];
        idx++;
    });

    console.log('trying to save playlist: ' + playlist_ref.ref());
    playlist_ref.on('value', function(snapshot) {

        if (!editable && snapshot.val() !== null) {
            alert('Playlist already exists!');
            saved = false;
        } else {
            //we can save here
            playlist_ref.off('value');
            playlist_ref.set(playlist_entries);
            saved = true;
        }
        playlist_ref.off('value');
        if (saved){
        console.log('ish saved. lets send ya on yo way nukka');
        //build url
        var host =  $(location).attr('protocol') + '//' + $(location).attr('host');
        if (host.slice(-1) != '/'){
            host = host + '/';
        }
        var p_edit = host + "p/" + playlist_name + '/edit/' + password;
        console.log ('redirect: '+  p_edit);
        //redirect to edit page
        window.location.href = p_edit;
    }
    });

}

function resave_traxlist(p_name, u_key){
    var key =  fbRoot.child('i').child(p_name).child('key');
    var s_key;
    key.on('value', function(ChildSnapshot, prevChildName){
        s_key = ChildSnapshot.val();
        if (u_key == s_key){
            console.log('good key: ' + u_key + ' (' + s_key + ')');
            save_playlist(p_name, u_key, true);
        }else{
            console.log('bad key: ' + u_key + ' (' + s_key+ ')');
        }
    });
}

function random_name_handler(state) {
    if (state) {
        console.log('random name handler state is: ' + state);
        $('#playlist_save_url').prop('disabled', true);
        $('#playlist_save_url').val(guid());
    } else {
        $('#playlist_save_url').prop('disabled', false);

    }
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
};

function guid() {
    return s4() + s4() + s4() + s4();
}

function uuid() {
    return s4() + s4() + s4();
}

function delete_track(div_id) {
    playlist_entries = $.grep(playlist_entries, function(k, v) {
        return (k !== playlist_id_to_url[div_id]);
    });

    playlist_ids = $.grep(playlist_ids, function(k, v) {
        return (k !== div_id);
    });

    delete playlist_objects[div_id];
    var url = playlist_id_to_url[div_id];
    delete playlist_id_to_url[div_id];
    delete url_map[url];

    $('div[name=' + div_id + ']').remove();
}

setup_bind_callback = function(div_id, cb1, cb2){
    console.log("Creating: doit_"+div_id);
    window['doit_' + div_id] = function(){

        console.log("onload embed handler: " + div_id);
        obj = cb1(div_id);
        cb2(div_id, obj);
    };
};
