SC.initialize({
    client_id: 'ebd231319eab6fe002334affe9c0eef4'
});

function handle_soundcloud(url) {
    var a = url.toLowerCase();
    if ((a.indexOf('http://') >= 0 || a.indexOf('https://') >= 0)) {} else {
        url = 'https://' + url
    }
    if (a.indexOf('http://') >= 0) {
        url = 'https://' + url.substring(7);
    }
    make_holder = function (div_id) {
	console.log('url: ' + url);
        return '<iframe onload="doit_' + div_id + '()" id="' + div_id + '" width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=' + encodeURI(url) + '&show_artwork=true&visual=true&buying=false&sharing=true&hide_related=true&liking=true&show_comments=false"></iframe>';
    };
    make_obj = function (div_id) {
        console.log('make obj for ' + div_id);
        var widgetIframe = document.getElementById(div_id);
        var widget = SC.Widget(widgetIframe);
        widget.load(url, {
            show_artwork: true,
            visual: true,
            buying: false,
            sharing: true,
            hide_related: true,
            show_comments: false,
            liking: true
        });
        widget.bind(SC.Widget.Events.FINISH, function() {
            console.log("finished sc");
            play_next(div_id);
        });
        widget.bind(SC.Widget.Events.READY, function(x) {
            // save object into array
            console.log('sc widget ready: ');
            var widgetIframe = document.getElementById(div_id);
            var widget = SC.Widget(widgetIframe);
	        console.log(widget);
            widget.stop = widget.pause;
            widget.playpause_toggle = widget.toggle;
        });
        widget.bind(SC.Widget.Events.PLAY, function() {
           console.log("playing id: " + div_id);
            stop_all_except_given(div_id);
            currently_playing = div_id;
        });
        return widget;
    };
    return new Array(make_holder, make_obj);
}

