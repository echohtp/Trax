
	var reOrderPlaylist = function(event, ui){
		console.log('ui_html: ' + ui.item[0].outerHTML);
		var reBind_id = ui.item[0].outerHTML.split(' ')[1].split('=')[1].substr(1).slice(0,-1);
		console.log('rebind_id: ' + reBind_id);

		var a = $('#playlist_container').find('.entry');
		console.log('reorder-playlist_ids: ' + playlist_ids);
		$.each(a, function(k,v){
			console.log('p-reorder k/v: ' + k + '/' + $(v).attr('name'));
			playlist_ids[k] = $(v).attr('name');
		});
		reBindObjects(reBind_id);
	}

    function track_load_success() {
        $('#track_url').effect("highlight", {
            color: '#00ff00'
        }, 1500);
    };
    function track_load_failed() {
        $('#track_url').effect("highlight", {
            color: '#ff0000'
        }, 1500);
    };

	function handle_user_entry(event){
		event.preventDefault();
		var url = $('#track_url').val();
                user_entered_url(url);
        };
        function user_entered_url(url){
            console.log('handle_url(' + url  + ')' );
            div_id = s4();
            playlist_entries.push(url);
            handler = handle_url(url);
            $('#track_url').val('');
            if (handler != false){
                console.log('parse success');
                //good link
                track_load_success();
                embed_holder = handler[0];
                make_object = handler[1];

                setup_bind_callback(div_id,
                    make_object,
                    function(div_id, obj) {
                        playlist_objects[div_id] = obj;
                    }
                );

                div_open = '<div name="' + div_id + '" class="ui-state-default row entry"><span class="col-md-11">';
                div_close = '</span><span class="col-md-1 hideforplayback"><div><span class="btn-lg glyphicon glyphicon-remove" onclick="delete_track(\'' + div_id + '\');"></span></div><br/><div><span class="btn-lg glyphicon glyphicon-align-justify handle"></span></div></div>';
                if ($('#playlist_container').children().length == 0){ currently_playing = div_id;}
                $('#playlist_container').append(div_open + embed_holder(div_id) + div_close);

                playlist_id_to_url[div_id] = url;
                playlist_ids.push(div_id);
            } else {
                console.log('parse failed');
                //bad link
                track_load_failed();
            }
        }

	$(function(){
		console.log('binding');

		// TRACK ADD BUTTON BINDING
		$('#track_add_button').click( handle_user_entry );

		// ZERO CLIP
		$('#playlist_save_button').zclip({
			path: '../js/ZeroClipboard.swf',
			copy: function(){return $(location).attr('host') +'/p/' + $('#playlist_save_url').val();},
			beforeCopy:function(){ save_playlist(); }
		});

		$('#track_url').keypress(function(e){
			if (e.which === 13){
				handle_user_entry(e);
			}
		});
	
		
		$('body').keypress(function(e){
			// SPACE BAR TOGGLE
			if (e.which === 32){
				e.preventDefault();
				toggle_playing();
			}
		});

		$('body').keydown(function(e){
			//play next
			if (e.shiftKey && e.which === 39){
				e.preventDefault();
				console.log('play next');
				play_next(currently_playing);
			}

			//play prev
			if (e.shiftKey && e.which === 37){
				e.preventDefault();
				console.log('play prev');
				play_prev();
			}
		});

		// RANDOM PLAYLIST BINDINGS
		$('#random_name_cb').change(function(e){
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

        //user_entered_url('http://www.youtube.com/watch?v=KNEBLXgWhtM');
        //user_entered_url('http://www.youtube.com/watch?v=KNEBLXgWhtM');
        //user_entered_url('http://www.youtube.com/watch?v=KNEBLXgWhtM');
        //user_entered_url('https://soundcloud.com/bestdropsever/shreks-row');
        //user_entered_url('http://www.youtube.com/watch?v=KNEBLXgWhtM');
        //user_entered_url('https://soundcloud.com/bestdropsever/shreks-row');
	});
	$('#track_url').focus();
