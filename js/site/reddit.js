var base_url = 'http://reddit.com/';
var subreddit = $(location).attr('pathname');

$.getJSON(base_url + subreddit, function(data) {
    console.log('Recieved data from Reddit.');
    var subData = jQuery.parseJSON(data);

});
