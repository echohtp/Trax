function handle_url(url){
	if (url !== null) {
        //check if already exists.
        var check = true;
        $.each(playlist_id_to_url, function(k,v){
        	if (url == v){
        		//track already exists.
        		console.log('track exists');
        		check = false;
        	}
        });
        //
        if (check){
        	var a = url.toLowerCase();
        	if (a.indexOf('youtube') >= 0) {
        		handle = handle_youtube(url);
        	} else if (a.indexOf('soundcloud') >= 0) {
        		handle = handle_soundcloud(url);
        	} else { 
        		return false; 
        	}
        	return handle;
        }
        return false; 
    }
    return handle;
};
