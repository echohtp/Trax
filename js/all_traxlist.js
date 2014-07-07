/* VARIABLES */
var playlists_ref = new Firebase('https://traxlist.firebaseio.com/p/');

playlists_ref.on('child_added', function(ChildSnapshot, prevChildName) {
    console.log('child_added');
    var c_name = ChildSnapshot.name();
    var n_trax = ChildSnapshot.numChildren();

    console.log('name: ' + c_name);
    console.log('#trax: ' + n_trax);

    $('#pc_table').append('<tr><th><a href="/p/' + c_name + '">' + c_name + '</a></th><th>' + n_trax + '</th></tr>');

});
