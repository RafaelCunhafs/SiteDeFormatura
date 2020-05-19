
	const YoutubeGalleryPlayerObject = class
	{
		constructor(width_,height_,playerapiid_,initial_volume_,mute_on_play_,auto_play_)
		{
			this.videolistid=null;
			this.playerapiid=playerapiid_;
			this.videoStopped=false;
			this.PlayList=[];
			this.CurrentVideoID="";
			this.IframeApiReady=false;
			this.youtubeplayer_options=null;//options_;
			this.ApiStart=null;//this.options.start;
			this.ApiEnd=null;//this.options.end;
			this.width=width_;
			this.height=height_;
			this.api_player=null;
			this.APIPlayerBodyPartLoaded=false;
			this.initial_volume=initial_volume_;//-1 is default
			this.mute_on_play=mute_on_play_;
			this.auto_play=auto_play_;
			this.VideoSources=[];
			this.Player=[];
			this.openinnewwindow=0;
		}



		youtube_SetPlayer_(videoid)
		{
				this.youtubeplayer_options.start=this.ApiStart;
				this.youtubeplayer_options.end=this.ApiEnd;

				this.videoStopped=false;
				this.CurrentVideoID=videoid;
				var playerid=this.playerapiid+"api";
				document.getElementById(playerid).innerHTML='';

				var initial_volume=this.initial_volume;
				var mute_on_play=this.mute_on_play;
				var auto_play=this.auto_play;
				var PlayList=this.PlayList;

				var classname="youtubeplayer"+this.videolistid;
				var func=classname+'.FindNextVideo(true);';

				this.api_player = new YT.Player(playerid, {
					width: this.width,
					id: playerid,
					height: this.height,
					autoplay: 0,
					playerVars: this.youtubeplayer_options,
					videoId: videoid,
					events: {
						"onReady": function(event){
							if(initial_volume!=-1)
								event.target.setVolume(initial_volume);

							if(mute_on_play)
								event.target.mute();

							if(auto_play)
							{
								event.target.playVideo();
							}
						},
						"onStateChange": function(event){
							if(PlayList.length!=0)
							{
								if (event.data == YT.PlayerState.ENDED)
								{
									setTimeout(eval(func), 500);
								}
							}
						}
					}
				});
		}

		vimeo_SetPlayer_(videoid)
		{
				this.vimeoplayer_options.start=this.ApiStart;
				this.vimeoplayer_options.end=this.ApiEnd;

				this.videoStopped=false;
				this.CurrentVideoID=videoid;
				var playerid=this.playerapiid+"api";
				document.getElementById(playerid).innerHTML='';

				var classname="youtubeplayer"+this.videolistid;
				var func=classname+'.FindNextVideo(true);';


				var player_options = {
					id: videoid,
					width: this.width,
					height: this.height,
					autoplay: !!+this.auto_play,
					background: !!+this.vimeoplayer_options.background,
					loop: !!+this.vimeoplayer_options.loop,
					muted: !!+this.mute_on_play
				};

				this.api_player = new Vimeo.Player(playerid, player_options);

				if(this.initial_volume!=-1)
					this.api_player.setVolume(this.initial_volume/100);//Vimeo player volume is from 0 to 1

				this.api_player.on('play', function() {
					//alert('Played the first video');
				});

				this.api_player.on('ended', function() {
					setTimeout(eval(func), 500);
				});
		}



			FindNextVideo(set_to_autoplay)
			{
				var d=0;
				var v=this.CurrentVideoID;
				var l=this.PlayList.length;
				var g=null;
				for(var i=0;i<l;i++)
				{
					g=this.PlayList[i].split("*");
					if(g[0]==v)//0 - id
					{
						//if current video is the last in the list play the first video
						d=i+1;
						if(d==l)
							d=0;

						break;
					}
				}
				//alert(this.PlayList);
				//alert(d);
				g=this.PlayList[d].split("*");
				//alert(g);
				var videoid=g[0];
				var objectid=g[1];
				var videosource=g[2];

				if(set_to_autoplay)
					this.auto_play=true;

				this.HotVideoSwitch(this.videolistid,videoid,videosource,objectid);
			}

			FindCurrentVideo()
			{
				var l=this.PlayList.length;
				for(var i=0;i<l;i++)
				{
					var g=this.PlayList[i].split("*");
					if(g[0]==this.CurrentVideoID)
					{
						var videoid=g[0];
						var objectid=g[1];
						var videosource=g[2];
						this.HotVideoSwitch(this.videolistid,videoid,videosource,objectid);

						break;
					}
				}

			}





	HotVideoSwitch(videolistid,videoid,videosource,id)
	{

		var i=this.VideoSources.indexOf(videosource);

		var playercode="";
		if(i!=-1)
			playercode=this.Player[i];

		playercode=playercode.replace("****youtubegallery-video-id****",videoid);
		//alert("YoutubeGalleryThumbTitle"+this.videolistid+"_"+id);

		var title=document.getElementById("YoutubeGalleryThumbTitle"+this.videolistid+"_"+id).innerHTML;
		var description=document.getElementById("YoutubeGalleryThumbDescription"+this.videolistid+"_"+id).innerHTML;
		var link=document.getElementById("YoutubeGalleryThumbLink"+this.videolistid+"_"+id).innerHTML;
		var startsecond=document.getElementById("YoutubeGalleryThumbStartSecond"+this.videolistid+"_"+id).innerHTML;
		var endsecond=document.getElementById("YoutubeGalleryThumbEndSecond"+this.videolistid+"_"+id).innerHTML;
		var customimage_obj=document.getElementById("YoutubeGalleryThumbCustomImage"+this.videolistid+"_"+id);

		if(customimage_obj)
		{
			var customimage=customimage_obj.innerHTML;
			var n=customimage.indexOf("_small");
			if(n==-1)
			{
				playercode=playercode.replace("****youtubegallery-video-customimage****",customimage);
				for(i=0;i<2;i++)
				{
					playercode=playercode.replace("***code_begin***","");
					playercode=playercode.replace("***code_end***","");
				}
			}
			else
				playercode=YoutubeGalleryCleanCode(playercode);
		}
		else
			playercode=YoutubeGalleryCleanCode(playercode);

		playercode=playercode.replace("****youtubegallery-video-link****",link);
		playercode=playercode.replace("****youtubegallery-video-startsecond****",startsecond);
		playercode=playercode.replace("****youtubegallery-video-endsecond****",endsecond);
		playercode=playercode.replace("autoplay=0","autoplay=1");

		var ygsc=document.getElementById("YoutubeGallerySecondaryContainer"+this.videolistid+"");
		ygsc.innerHTML=playercode;
		ygsc.style.display="block";


		if(playercode.indexOf("<!--DYNAMIC PLAYER-->")!=-1)
		{
			this.ApiStart=startsecond;
			this.ApiEnd=endsecond;

			if(videosource=="youtube")
			{
				this.youtube_SetPlayer_(videoid);
			}
			else if(videosource=="vimeo")
			{
				this.vimeo_SetPlayer_(videoid);

			}
			else
				eval("this.youtubegallery_updateplayer_"+videosource+"(videoid,true)");
		}

		var tObj=document.getElementById("YoutubeGalleryVideoTitle"+this.videolistid+"");
		var dObj=document.getElementById("YoutubeGalleryVideoDescription"+this.videolistid+"");

		if(tObj)
			tObj.innerHTML=title;

		if(dObj)
			dObj.innerHTML=description;

		if(this.openinnewwindow==5)
		{
			//Jump to the player anchor:"youtubegallery"
			window.location.hash="youtubegallery";
		}
	}
    };


	function YoutubeGalleryCleanCode(playercode)
	{
		do{
			var b=playercode.indexOf("***code_begin***");
			var e=playercode.indexOf("***code_end***");
			if(b!=-1 && e!=-1)
				playercode=playercode.substr(0,b) + playercode.substr(e+14);

			if(b==-1 || e==-1)
				break;

		}while(1==1);
		return playercode;
	}
