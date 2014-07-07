var embed_types = ['.jpg', '.png', '.jpeg'];

function parse_generic(url) {
    //try default noembed.

    if ((a.indexOf('http://') || a.indexOf('https://') >= 0)) {
        url = 'http://' + url;
    }

    $.getJSON(embed_http + url, function(data) {
        handle_generic(data);
    });
}

function handle_generic(json_object) {
    if (typeof json_object.html == 'undefined') {
        //bad link
        $('#track_url').effect("highlight", {
            color: '#ff0000'
        }, 1500);
        console.log('bad link');

        //do you really want to collect bad links?
        //bad_links_ref.push(json_object.url); 
    } else {
        var div_id = s4();
        var a = '<div class="generic_entry id="' + div_id + '">';
        a += json_object.html;
        a += '</div>';

        // div entry created, save data.
        playlist_ids.push(div_id);
        playlist_entries.push(json_object.url); // we save the url to be parsed for TL

        //let them know the link was good!
        $('#track_url').effect("highlight", {
            color: '#00ff00'
        }, 1500);

        //append it! 
        $('#playlist_container').append(a);
    }
}
