
(function($){
    "use strict";
    
    window.wzYoutube = {
        youtubeConnector: null,
        channelID: null,
        wrapper: null,
        pages: null,
        currentPage: null,
        moreBtn: null,
		appID: null,
        templates: {
            channelTitle: '<img src="{img}"> <b>{channel_name}</b> <i class="icon-fl icon-logout wzYoutubeSignOut"></i>',
            videoItem: '<li class="wzYTVideoItem" data-id="{video_id}"><img src="{img}"><div><b>{video_title}</b><p>{video_descr}</p></div></li>',
			noVideosItem: '<li class="wzYTNoVideoItems">No video</li>',
            loader: '<div class="wzLoader"><div class="wzShade"></div><div class="wzLoadbar"><progress value="50" max="100"></progress></div></div>'
        },
        loader: null,
        onVideoSelect: function(_videoID){
            alert(_videoID);
        },
        lang: {
            authorize_account: 'Authorize YouTube account',
            upload_video: 'Upload video',
            list_videos: 'Videos list',
            more_videos: 'More videos',
            title: 'Title',
            video_title: 'Video title',
            description: 'Description',
            video_description: 'Video description',
            tags: 'Tags',
            video_tags: 'Tags, separated by comma',
            privacy_status: 'Privacy Status',
            upload: 'Upload',
            privacy_public: 'Public',
            privacy_ulnisted: 'Unlisted',
            privacy_private: 'Private',
            youtube_terms: 'By uploading a video, you certify that you own all rights to the content or that you are authorized by the owner to make the content publicly available on YouTube, and that it otherwise complies with the YouTube Terms of Service located at <a href="http://www.youtube.com/t/terms" target="_blank">http://www.youtube.com/t/terms</a>',
            enter_video_title: 'Please enter video title',
            choose_video_file: 'Please choose video file',
        },
        init: function(_onVideoSelectCallback){
            var self = this;
            if(this.wrapper){
				this.close(true);
				this.open();
				return;
			}
			var html = '<div class="wzYoutubeApp"><div class="wzYoutubeWrapper">';
					html+= '<div class="wzYoutubePages">';
						html+= '<div class="page page-1"><span class="wzYTAuthBtn"><i class="icon-fl icon-youtube-squared"></i> '+self.lang.authorize_account+'</span></div>';
						html+= '<div class="page page-2"><div class="wzYTHead"><span class="wzYTHeadLink wzYTVideoAddItem"><i class="icon-fl icon-upload fa-fw"></i> '+self.lang.upload_video+'</span><div class="wzYTChannel">&nbsp;</div></div><ul class="wzYTVideos"></ul><div class="wzYTMoreBtn"><i class="icon-fl icon-plus fa-fw"></i> '+self.lang.more_videos+'</div></div>';
						html+= '<div class="page page-3"><div class="wzYTHead"><span class="wzYTHeadLink wzYTVideoListLink"><i class="icon-fl icon-th-list fa-fw"></i> '+self.lang.list_videos+'</span><div class="wzYTChannel">&nbsp;</div></div>';
							html+= '<form class="wzYTUploadForm">';
							html+= '<p><label>'+self.lang.title+'<i>*</i> :</label><input type="text" class="wzYTUploadTitle" placeholder="'+self.lang.video_title+'"/></p>';
							html+= '<p><label>'+self.lang.description+':</label><textarea class="wzYTUploadDescr" placeholder="'+self.lang.video_description+'"></textarea></p>';
							html+= '<p><label>'+self.lang.tags+':</label><input type="text" class="wzYTUploadTags" placeholder="'+self.lang.video_tags+'"/></p>';
							html+= '<p><label>'+self.lang.privacy_status+':</label><select class="wzYTUploadPrivacy"><option value="public">'+self.lang.privacy_public+'</option><option value="unlisted">'+self.lang.privacy_ulnisted+'</option><option value="private">'+self.lang.privacy_private+'</option></select></p>';
							html+= '<p><input type="file" class="wzYTUploadFile" accept="video/*"><button class="wzYTUploadButton button button-primary"><i class="icon-fl icon-upload fa-fw"></i> '+self.lang.upload+'</button></p>';
							html+= '</form>';
							html+= '<p class="wzYTUploadTerms">'+self.lang.youtube_terms+'</p>';
						html+= '</div>';
					html+= '</div>';
				html+= '</div><div class="wzYoutubeShade"></div><div class="wzYoutubeClose"><i class="icon-fl icon-cancel"></i></div></div>';
			this.wrapper = $(html).hide();
			$('body').append(this.wrapper);

            this.pages = this.wrapper.find('.page');
            this.loader = $(this.templates.loader).hide();
            this.wrapper.find('.wzYoutubeWrapper').append(this.loader);
            
            $(this.wrapper.find('.wzYTVideoAddItem')).on('click',function(){
                self.setCurrentPage(3);
            });
            $(this.wrapper.find('.wzYTVideoListLink')).on('click',function(){
                self.setCurrentPage(2);
            });
            self.moreBtn = this.wrapper.find('.wzYTMoreBtn').on('click',function(){
                self.showLoading();
                self.loadVideos($(this).attr('data-token'),function(){
                    self.hideLoading();
                    self.setCurrentPage(2);
                });
            }).hide();
            
            this.wrapper.find('form.wzYTUploadForm').on('submit',function(e){
                e.preventDefault();
                e.stopImmediatePropagation();
                var form = $(this);
                var file = form.find('.wzYTUploadFile').get(0).files[0];
                //console.info(file);
                var metadata = {
                    snippet: {
                        title: form.find('.wzYTUploadTitle').val(),
                        description: form.find('.wzYTUploadDescr').val(),
                        tags: form.find('.wzYTUploadTags').val(),
                        categoryId: 22
                    },
                    status: {
                        privacyStatus: form.find('.wzYTUploadPrivacy').val()
                    }
                };
                if(!metadata.snippet.title || metadata.snippet.title==''){
                    alert(self.lang.enter_video_title);
                    return false;
                }
                if(!file){
                    alert(self.lang.choose_video_file);
                    return false;
                }
                
                var progressBar = self.loader.find('progress');
                progressBar.attr({value:0});
                self.showLoading();
                
                self.youtubeConnector.uploadVideo(metadata,file
                    ,function(_videoID){
                        //console.log('done uploading');
                        progressBar.attr({value:99});
                        self.wrapper.find('.wzYTVideos .wzYTVideoItem').remove();
                        self.loadVideos(null,function(){
                            self.hideLoading();
                            self.setCurrentPage(2);
							self.wrapper.find('.wzYTVideos .wzYTVideoItem[data-id="'+_videoID+'"]').addClass('loading');
							
							self.youtubeConnector.pollForVideoStatus(_videoID,function(_vID){
                        		self.wrapper.find('.wzYTVideos .wzYTVideoItem[data-id="'+_vID+'"]').removeClass('loading');
                    		},function(_vID,errorMsg){
								self.wrapper.find('.wzYTVideos .wzYTVideoItem[data-id="'+_vID+'"]').removeClass('loading').addClass('error');
								alert(errorMsg);
							});
							
                        });
                    }
                    ,function(_bytesUploaded,_totalBytes,_bytesPerSecond){
                        var estimatedSecondsRemaining = Math.ceil((_totalBytes - _bytesUploaded) / _bytesPerSecond);
                        var percentageComplete = Math.floor(_bytesUploaded / _totalBytes * 100);
                        //console.log('Uploaded: '+percentageComplete+'%, est. seconds: '+estimatedSecondsRemaining);
                        progressBar.attr({value:percentageComplete});
                    }
                );              
                
                return false;
            });
            
            if(_onVideoSelectCallback){
                this.onVideoSelect = _onVideoSelectCallback;
            }
            
            this.setCurrentPage(1);
            
            this.showLoading();
            
            this.youtubeConnector = new wzYoutubeConnector(this.appID,{
                onAuthSuccess: function(){
                    this.loadChannels(function(channels){
                        var channel = channels[0];
                        var channelContainer = self.wrapper.find('.wzYTChannel');
                        channelContainer.html(self.templates.channelTitle.replace('{channel_name}',channel.snippet.title).replace('{img}',channel.snippet.thumbnails.default.url));
                        /*channelContainer.on('click',function(){
                            self.setCurrentPage(2);
                        });*/
						self.wrapper.find('.wzYoutubeSignOut').on('click',function(){
							self.showLoading();
							self.youtubeConnector.signOut(function(){
								self.setCurrentPage(1);
								self.hideLoading();
							});
						});
                        self.channelID = channel.contentDetails.relatedPlaylists.uploads;
						self.wrapper.find('.wzYTVideos').html(' ');
                        self.loadVideos(null,function(){
                            self.hideLoading();
                            self.setCurrentPage(2);
                        });
                    });
                },
                onAuthFail: function(){
                    self.hideLoading();
                    self.setCurrentPage(1);
                },
                onError: function(error){
                    alert(error);
                    self.close();
                }
            }).checkAuth();
            
            this.wrapper.find('.wzYTAuthBtn').on('click',this.youtubeConnector.showAuthWin);
            this.wrapper.find('.wzYoutubeShade, .wzYoutubeClose').on('click',function(){
				self.close();
			});
			
			this.open();
        },
        loadVideos: function(_pageToken,_doneCallback){
            var self = this;
            this.youtubeConnector.loadVideos(this.channelID,_pageToken,function(videos,nextPageToken){
                var videoList = self.wrapper.find('.wzYTVideos');
                var videoItem;
                for(var i=0;i<videos.length;i++){
                    //console.info(videos[i]);
                    videoItem = $(self.templates.videoItem
                        .replace('{video_title}',videos[i].snippet.title)
                        .replace('{video_descr}',videos[i].snippet.description)
                        .replace('{img}',videos[i].snippet.thumbnails.default.url)
                        .replace('{video_id}',videos[i].snippet.resourceId.videoId)
                        ).on('click',function(){
                            self.onVideoSelect.call(this,$(this).attr('data-id'));
                    }); 
                    videoList.append(videoItem);
                }
                if(nextPageToken){
                    self.moreBtn.attr('data-token',nextPageToken).show();
                }
                else{
                    self.moreBtn.hide();
                }
				
				if(!_pageToken && !videos.length){
					videoList.append(self.templates.noVideosItem);
				}
				
                if(_doneCallback){
                    _doneCallback.call(self);
                }
            });
        },
        setCurrentPage: function(_pageNum){
            this.currentPage = _pageNum;
            this.wrapper.addClass('noTrans');
            this.wrapper.removeClass('currentPage-1 currentPage-2 currentPage-3');
            this.wrapper.removeClass('noTrans');
            this.wrapper.addClass('currentPage-'+this.currentPage);
			if(_pageNum==1){
				this.wrapper.find('.wzYTVideos').html(this.templates.noVideosItem);
			}
        },
        showLoading: function(){
            this.loader.show();
        },
        hideLoading: function(){
            this.loader.hide();
        },
		open: function(){
			this.wrapper.show();
			this.wrapper.find('.wzYoutubeWrapper').hide().fadeIn();
		},
        close:function(_force){
            var self = this;
			if(_force){
				this.wrapper.hide();
			}
			else{
				this.wrapper.find('.wzYoutubeWrapper').fadeOut(400,function(){
					self.wrapper.hide();
				});
			}
        }
    };
    
	var wzYoutubeConnector = function(_appID,_callbacks){
        var self = this;
        this.googleAppID = _appID;
        this.authScopes = [
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtube'
        ];
        this.googleAPI = gapi;
        this.authenticated = false;
        this.accessToken = '';
        this.callbacks = {
            onAuthSuccess: function(){
                
            },
            onAuthFail: function(){
                
            },
            onError: function(error){
                
            }
        };
        //console.info(_callbacks,typeof(_callbacks));
        if(typeof(_callbacks)=='object'){
            $.extend(true,this.callbacks,_callbacks);
        }
		
		this.signOut = function(_callback){
			$.ajax({
				url: 'https://accounts.google.com/o/oauth2/revoke?token='+self.accessToken,
				type:'get',
				complete: function(jqXHR, textStatus){
					_callback();
				}
			});
			
		}
        
        this.showAuthWin = function(){
            self.googleAPI.auth.authorize({
                    client_id: self.googleAppID,
                    scope: self.authScopes,
                    immediate: false
                    }, self.handleAuthResult);
            return this;
        }
        
        this.checkAuth = function(){
            self.googleAPI.auth.authorize({
                client_id: self.googleAppID,
                scope: self.authScopes,
                immediate: true
                }, self.handleAuthResult);
            return this;
        }
        
        this.handleAuthResult = function(authResult){
            //console.info('handleAuthResult:',authResult);
            if(authResult && !authResult.error){
                console.info('Auth result: ',authResult);
                self.accessToken = authResult.access_token;
                self.googleAPI.client.load('youtube', 'v3', function(){
                    self.callbacks.onAuthSuccess.apply(self);
                });
            } else {
                self.callbacks.onAuthFail.apply(self);
            }
        }
        
        this.loadChannels = function(_callback){
            self.googleAPI.client.youtube.channels.list({
                mine: true,
                part: 'contentDetails'
            }).execute(function(response) {
                if(response.error) {
                    self.callbacks.onError(response.error.message);
                } else {
                    var channel = response.result.items[0];
                    self.googleAPI.client.youtube.channels.list({
                        mine: true,
                        part: 'snippet'
                    }).execute(function(response) {
                        if(response.error) {
                            self.callbacks.onError(response.error.message);
                        } else {
                            $.extend(true,channel,response.result.items[0]);
                            response.result.items[0] = channel;
                            _callback.call(self,response.result.items);
                        }
                    });
                }
            });
        }
        
        this.loadVideos = function(_channelID,_pageToken,_callback,_maxResults){
            if(!_maxResults){
                _maxResults = 15;
            }
            var requestOptions = {
                playlistId: _channelID,
                part: 'snippet',
                maxResults: _maxResults
            };
            if (_pageToken) {
                requestOptions.pageToken = _pageToken;
            }
            self.googleAPI.client.youtube.playlistItems.list(requestOptions).execute(function(response){
                if(response.error) {
                    self.callbacks.onError(response.error.message);
                } else {
                    _callback.call(self,response.result.items,response.result.nextPageToken);
                }
                /*
                nextPageToken = response.result.nextPageToken;
                prevPageToken = response.result.prevPageToken
                */
                
            });
        }
        
        this.uploadVideo = function(_metadata,_file,_doneCallback,_processCallback){
            var uploader = new MediaUploader({
                baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
                file: _file,
                token: self.accessToken,
                metadata: _metadata,
                params: {
                    part: Object.keys(_metadata).join(',')
                },
                onError: function(data) {
                    var message = data;
                    try {
                        var errorResponse = JSON.parse(data);
                        message = errorResponse.error.message;
                    } finally {
                        self.callbacks.onError(message);
                    }
                }.bind(this),
                onProgress: function(data) {
                    var currentTime = Date.now();
                    var bytesUploaded = data.loaded;
                    var totalBytes = data.total;
                    var bytesPerSecond = bytesUploaded / ((currentTime - uploadStartTime) / 1000);
                    
                    bytesUploaded-= bytesUploaded/10;
                    
                    _processCallback.call(self,bytesUploaded,totalBytes,bytesPerSecond);
                }.bind(this),
                onComplete: function(data) {
                    var uploadResponse = JSON.parse(data);
                    _doneCallback.call(self,uploadResponse.id);
                }.bind(this)
            });
            var uploadStartTime = Date.now();
            uploader.upload();
        }
        
        this.pollForVideoStatus = function(_videoID,_doneCallback,_errorCallback) {
            self.googleAPI.client.request({
                path: '/youtube/v3/videos',
                params: {
                    part: 'status,player',
                    id: _videoID
                },
                callback: function(response) {
                    if(response.error) {
                        //console.log(response.error.message);
                        setTimeout(self.pollForVideoStatus.bind(this,_videoID,_doneCallback,_errorCallback), 60000);
                    } else {
                        var uploadStatus = response.items[0].status.uploadStatus;
                        switch (uploadStatus) {
                            case 'uploaded':
                                setTimeout(self.pollForVideoStatus.bind(this,_videoID,_doneCallback,_errorCallback), 60000);
                            break;
                            case 'processed':
                                _doneCallback.call(self,_videoID);
                            break;
                            default:
								_errorCallback.call(self,_videoID,'Transcoding failed.');
                            break;
                        }
                    }
                }.bind(this)
            });
        };
        
        
        return this;
    }
	
})(jQuery);







