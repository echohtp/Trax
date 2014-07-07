function get_reddit(mods){
	$('#playlist_container').empty();
	$.getJSON("http://www.reddit.com" + $(location).attr('pathname') + mods +".json?jsonp=?", function(data) {
    	$.each(data.data.children, function(i,item){
        	user_entered_url(item.data.url);
    	});
    });
}	

$(function(){
	get_reddit('/new');

	$('#r_new_a').click(function(event){
		event.preventDefault();
		console.log('new happened');
		get_reddit('/new');
	});


	$('#r_hot_a').click(function(event){
		event.preventDefault();
		console.log('hot happened');
		get_reddit('/hot');
	});

	$('#r_top_a').click(function(event){
		event.preventDefault();
		console.log('top happened');
		get_reddit('/top');
	});
});
