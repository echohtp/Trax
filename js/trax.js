
String.prototype.insert = function (index, string) {
	if (index > 0)
		return this.substring(0, index) + string + this.substring(index, this.length);
	else
		return string + this;
};

var Model = Backbone.Model.extend({
	defaults: {
		html: '',
		dId: '',
		vId: '',
		thumbnail_url: '',
		author_name: '',
		title: '',
		object: '',
		provider: '',
		order: '',
		loaded: 'false',
		status: 'stopped'
	},

	playNext: function(){
		var that = this;
		var tModel = traxList.findWhere({'order': that.get('order') + 1 });
		if (tModel){
			tModel.play();
		}
	},

	play: function(){
		var that = this;
		traxList.where({'status': 'playing'}).forEach(function(tElement){
			tElement.stop();
		});

		if (this.get('provider') === 'soundcloud' && this.get('loaded') === 'true'){
			this.get('object').play();
			this.set('status', 'playing');
		}else if (this.get('provider') === 'soundcloud' && this.get('loaded') === 'false'){
			this.load();
		}

		if (this.get('provider') === 'youtube' && this.get('loaded') === 'true'){
			
			this.get('object').playVideo();
			this.set('status', 'playing');
		}else if ( this.get('provider') ==='youtube' && this.get('loaded') === 'false'){
			this.load();
		}
	},

	stop: function(){
		var that = this;
		if ( this.get('provider') === 'soundcloud'){
			
			this.get('object').toggle();
			this.set('status', 'stopped');
		}

		if (this.get('provider') === 'youtube'){
			
			this.get('object').stopVideo();
			$('div[name=' + this.get('dId') + ']').animate({height: '166px'},1000);
			this.set('status', 'stopped');
		}

	},

	load: function(){
		var that = this;
		that.on('change:loaded', that.play);
		if (this.get('provider') === 'soundcloud'){
			$( '#' + this.get('dId') ).replaceWith(this.get('html'));

			var widgetIframe = document.getElementById( this.get('dId') );
			var widget = SC.Widget(widgetIframe);
			widget.dId = this.get('dId');
			this.set('object', widget);

			this.get('object').bind(SC.Widget.Events.FINISH, function(event){
				var tTrax = traxList.findWhere({'dId': this.dId});
				tTrax.playNext();
			});

			this.get('object').bind(SC.Widget.Events.READY, function(event){
				that.set('loaded', 'true');
			});
		}

		if (this.get('provider') === 'youtube'){
			var params = { allowScriptAccess: 'always' };
			var atts = {id: this.get('dId') };
			swfobject.embedSWF('http://youtube.com/v/' + this.get('vId') + '?enablejsapi=1&playerapiid=' + this.get('dId') + '&version=3', this.get('dId'), '100%', '100%', '8', null, null, params, atts);
		}
		
	}

});

var mCollection = Backbone.Collection.extend({
	model: Model
});

var traxView = Backbone.View.extend({

	initialize: function() {
		this.listenTo(this.model, "change", this.render);
		this.el = '#' + this.model.get('dId');
	},

	render: function(){
		var template = _.template( $('#sc-container-template').html() );
		var html = template(this.model.attributes);
		return html;
	}

});

var traxList = new mCollection();

var scOptions = {
	'maxheight': '166',
	'buying': 'false',
	'show_comments': 'false',
	'show_playcount': 'false',
	'hide_related': 'true'
};

SC.initialize({
	client_id: 'd801359914234a52f7138bbce4df18ad',
});

var fbRef = new Firebase('https://traxlist.firebaseio.com/new/p/');
var tListID = Math.random().toString(36).substr(2);
var tListRef = fbRef.child(tListID);


function saveTraxList(){
	console.log(traxList.toJSON());
	var tlObj = traxList.toJSON();
	tlObj.forEach(function(e){
		tListRef.push(e);
	});
}

function onYouTubePlayerReady(pId){
	ytplayer = document.getElementById(pId);
	window["playerState" + pId] = function(state) {
		console.log("#" + pId + ": new state " + state);
		if (state == '1'){
			$('div[name=' + pId + ']').animate({height: '400px'},1000);
		}
		if (state == '2'){

			//$('div[name=' + pId + ']').animate({height: '166px'},1000);                       
		}
		if (state == '0'){
			$('div[name=' + pId + ']').animate({height: '166px'},1000);
			var me = traxList.findWhere({'dId': pId});
			me.playNext();
		}
	};
	ytplayer.addEventListener("onStateChange", "playerState" + pId);

	var tmpModel = traxList.findWhere({'dId': pId});
	tmpModel.set('object', ytplayer);
	tmpModel.set('loaded', 'true');
	traxList.set(tmpModel, {remove: false});

};

function addTrax(url){
	if (url.toLowerCase().indexOf('youtube.com') > -1 ){
		//handle youtube
		console.log('YT')
		var vId = ''
		var YTsplit = url.split('v=');
		if (YTsplit[1].indexOf('&') > -1 ){
			 vId = YTsplit[1].split('&')[0];
		}else{
			vId = YTsplit[1];
		}

		var dId = Math.random().toString(36).substr(2,4);
		var template = _.template( $('#yt-container-template').html() );
		var tImage = 'http://img.youtube.com/vi/' + vId + '/0.jpg'
		var html = template({ 'dId': dId, 'vId': vId, thumbnail_url: tImage} );
		var ytModel = new Model({'dId': dId, provider: 'youtube', order: traxList.length , thumbnail_url: tImage, vId: vId});
		
		$('#traxList').append(html);
		
		traxList.add(ytModel)

		$('.yt').click(function(event){
			var that = this;
			var curId = $(that).attr('name');
			var toLoad = traxList.findWhere({'dId': curId});
			toLoad.load();
		});
	

	}else if( url.toLowerCase().indexOf('soundcloud.com') > -1 ){
		//handle soundcloud

		SC.oEmbed(url, scOptions, function(oEmbed){
			var dId = Math.random().toString(36).substr(2,4);
			oEmbed.dId = dId;
			oEmbed.html = oEmbed.html.insert(7, ' id="' + dId + '"');

			var tModel = new Model(oEmbed);
			tModel.set('order', traxList.length);
			tModel.set('provider', 'soundcloud');
			
			traxList.add(tModel);
			
			var tView = new traxView({model: tModel});
			$('#traxList').append(tView.render());

			$('.sc-container').on('click', function(event){
				var that = this;
				var curId = $(that).attr('id');
				var toLoad = traxList.findWhere({'dId': curId });
				toLoad.load();
			});
		});
	}else{
		//handle deaded
		console.log('def');
	}
}