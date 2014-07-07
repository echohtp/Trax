function handle_youtube(url) {
    var b = url.split('&');
    //find the video name
    var d;
    $.each(b, function(index, value) {
        if (value.indexOf('v=') >= 0) {
            console.log('v ' + value);
            d = value.split('=');
            console.log('d ' + d);

            if (typeof d != 'undefined' &&
                    typeof d[1] != 'undefined'){
                if (d[1].indexOf('#') >= 0) {
                    d = d[1].split('#')[0]
                    console.log('d2 ' + d);
                } else {
                    d = d[1];
                }
            }
        }
    });
    if (typeof d == 'undefined' || typeof d[1] == 'undefined') {
        return false;
    }
    var vid = d;
    console.log('Full URL: ' + url + ' Vid: ' + vid);
    make_holder = function (div_id) {
        return '<iframe onload="doit_' + div_id + '()" id="player_' + div_id +
        '" width="100%" height="166" src="http://www.youtube.com/embed/' + vid +
        '?enablejsapi=1&autoplay=0`&autohide=1&showinfo=0?wmode=transparent" frameborder="0" class="yt_player_entry_obj"  style="" allowfullscreen></iframe>';
    };
    make_object = function (div_id) {
        console.log('make obj for yt: ' + div_id);
        function state_change(event) {
            console.log(div_id + ' state changed ' + event);
            switch (event.data) {
                case YT.PlayerState.ENDED:
                    console.log('Video has ended.');
                    $('div[name=' + div_id + ']').animate({height:'166px'});
                    $('#player_' + div_id).animate({height:'166px'});
                    setTimeout(function(){
                        play_next(div_id);
                    }, 500);
                    break;
                case YT.PlayerState.PLAYING:
                    console.log('Video is playing.');
                    stop_all_except_given(div_id);
                    currently_playing = div_id;
                    playing_status = true;

                    //make height 100%;
                    $('div[name=' + div_id + ']').animate({height:'500px'});
                    $('#player_' + div_id).animate({height:'500px'});
                    break;
                case YT.PlayerState.PAUSED:
                    console.log('Video is paused.');
                    playing_status = false;
                    break;
                case YT.PlayerState.BUFFERING:
                    console.log('Video is buffering.');
                    break;
                case YT.PlayerState.CUED:
                    console.log('Video is cued.');
                    break;
            }
        }
        obj = new YT.Player('player_' + div_id, {
            events: {'onReady': 
                function (event){
                    var obj = event.target;
                    console.log('YT player ready: ' + div_id);
                    console.log(obj);
                    obj.play = obj.playVideo;
                    obj.stop = obj.stopVideo;
                    obj.getState = obj.getPlayerState;
                    obj.playpause_toggle = playpause_youtube(obj);
                    obj.YT_title = "";
                    obj.YT_artist = "";
                }
                ,
            'onStateChange': state_change, }
        });
        return obj;
    }
    return new Array(make_holder, make_object);
};

function playpause_youtube(obj) {
    return function(){
	switch (obj.getPlayerState()) {
	    case 1: //Playing
		obj.stopVideo();
		break;
	    case 0: // Ended
	    case 2: // Paused
		obj.playVideo();
		break;
	}
    }
}
