/* VARIABLES */
var fbPlaylist = new Firebase('https://traxlist.firebaseio.com' + $(location).attr('pathname'));
var SC_embed = "http://soundcloud.com/oembed?maxheight=130&format=json&url="; //remove maxheight to make BIG
var playlist_order_db = [];

var reOrderPlaylist = function(event, ui) {
    console.log('ui_html: ' + ui.item[0].outerHTML);
    var reBind_id = ui.item[0].outerHTML.split(' ')[1].split('=')[1].substr(1).slice(0, -1);
    console.log('rebind_id: ' + reBind_id);

    var a = $('#playlist_container').find('.entry');
    console.log('reorder-playlist_ids: ' + playlist_ids);
    $.each(a, function(k, v) {
        console.log('p-reorder k/v: ' + k + '/' + $(v).attr('name'));
        playlist_ids[k] = $(v).attr('name');
    });
    reBindObjects(reBind_id);
}

function handle_user_entry(event) {
    event.preventDefault();
    var url = $('#track_url').val();
};

function user_entered_url(url) {
    div_id = s4();
    console.log('parse_url(' + url + ')' + 'doing id: ' + div_id);
    playlist_entries.push(url);
    handler = handle_url(url);
    $('#track_url').val('');
    if (handler != false) {
        console.log('parse success');
        embed_holder = handler[0];
        make_object = handler[1];

        setup_bind_callback(div_id,
            make_object,
            function(div_id, obj) {
                console.log("SETTING OBJ FOR "+div_id);
                playlist_objects[div_id] = obj;
            }
        );

        if ($('#playlist_container').children().length == 0){ currently_playing = div_id;}

        $('#playlist_container').append(embed_holder(div_id));

        playlist_rebind_by_id[div_id] = make_object;
        playlist_ids.push(div_id);
    }
}
$(function() {
    console.log('Setting up page bindings.');

    $('html body').keypress(function(e) {
        // SPACE BAR TOGGLE
        if (e.which === 32) {
            e.preventDefault();
            toggle_playing();
        }
    });

    $('html body').keydown(function(e) {
        //play next
        if (e.shiftKey && e.which === 39) {
            e.preventDefault();
            console.log('play next');
            play_next(currently_playing);
        }

        //play prev
        if (e.shiftKey && e.which === 37) {
            e.preventDefault();
            console.log('play prev');
            play_prev();
        }
    });

    // RANDOM PLAYLIST BINDINGS
    $('#random_name_cb').change(function(e) {
        console.log($(this).is(':checked'));
        random_name_handler($(this).is(':checked'));
    });

    random_name_handler(true);
    $('#playlist_save_url').val(guid());

    $('#what_do').tooltip({
        placement: 'bottom',
        tooltipClass: 'my-tooltip-style'
    });
    $('#playlist_container').sortable({
        stop: reOrderPlaylist,
        handle: '.handle'
    });
    $('#playlist_container').disableSelection();
});
$('#track_url').focus();

fbPlaylist.on('value', function(snapshot) {
    if (snapshot.val() === null) {
        //die somehow;
        console.log('snapshot null');
    } else {
        console.log('not null');
    }
});

fbPlaylist.on('child_added', function(ChildSnapshot, prevChildName) {
    url = ChildSnapshot.val();
    console.log('added item' + url);
    console.log(url);
    playlist_order_db.push(url);
    var id = user_entered_url(url);
    //$('#playlist_container').append(ChildSnapshot.val());
    //handle_out_of_order(url, id);
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
    //$('.hideforplayback').remove();
};
