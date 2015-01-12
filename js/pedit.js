var a = $(location).attr('href');
	var params = a.split('/');
	var pRef = new Firebase ('http://traxlist.firebaseio.com/p/' + params[4]);
	var iRef = new Firebase ('http://traxlist.firebaseio.com/i/' + params[4]);
	var key = params[6];
	$(function(){
		$('#playlist_save_url').val(a);
		$("#resave_traxlist").click(function(event){
			event.preventDefault();
			console.log('resave_traxlist');
			resave_traxlist(params[4], params[6]);
		});
		

	});
	var kRef =  fbRoot.child('i').child(params[4]).child('key');
	var u_key = params[6];
	kRef.on('value', function(ChildSnapshot, prevChildName){
		s_key = ChildSnapshot.val();
        if (u_key == s_key){
            console.log('good key: ');
            $('div [name="user_stuffs"]').css("display", "inline-block");
            pRef.on('child_added', function(ChildSnapshot, prevChildName) {
			    console.log('child_added');
			    url = ChildSnapshot.val();
			    console.log('added item' + url);
			    console.log(url);
			    var id = user_entered_url(url);
			});
        }else{
            console.log('bad key');
			$('div [name="user_stuffs"]').html('<h1>BAD PASSWORD BRAH</h1>');
			$('div [name="user_stuffs"]').css("display", "inline-block");
        }
    });
