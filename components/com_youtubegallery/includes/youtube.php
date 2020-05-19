<?php
/**
 * YoutubeGallery
 * @version 4.9.0
 * @author Ivan Komlev <support@joomlaboat.com>
 * @link http://www.joomlaboat.com
 * @GNU General Public License
 **/

// No direct access to this file
defined('_JEXEC') or die('Restricted access');

require_once(JPATH_SITE.DIRECTORY_SEPARATOR.'components'.DIRECTORY_SEPARATOR.'com_youtubegallery'.DIRECTORY_SEPARATOR.'includes'.DIRECTORY_SEPARATOR.'misc.php');

class VideoSource_YouTube
{
	public static function extractYouTubeID($youtubeURL)
	{
		if(!(strpos($youtubeURL,'://youtu.be')===false) or !(strpos($youtubeURL,'://www.youtu.be')===false))
		{
			//youtu.be
			$list=explode('/',$youtubeURL);
			if(isset($list[3]))
				return $list[3];
			else
				return '';
		}
		else
		{
			//youtube.com
			$arr=YouTubeGalleryMisc::parse_query($youtubeURL);
			if(isset($arr['v']))
				return $arr['v'];
			else
				return '';
		}

	}

	public static function getVideoData($videoid,$customimage,$customtitle,$customdescription, $thumbnailcssstyle, $getinfomethod)
	{
		//onBehalfOfContentOwner

		//blank	array
		$blankArray=array(
				'videosource'=>'youtube',
				'videoid'=>$videoid,
				'imageurl'=>'',
				'title'=>'',
				'description'=>'',
				'publisheddate'=>'',
				'duration'=>0,
				'rating_average'=>0,
				'rating_max'=>0,
				'rating_min'=>0,
				'rating_numRaters'=>0,
				'statistics_favoriteCount'=>0,
				'statistics_viewCount'=>0,
				'keywords'=>'',
				'likes'=>0,
				'dislikes'=>'',
				'commentcount'=>'',
				'channel_username'=>'',
				'channel_title'=>'',
				'channel_subscribers'=>0,
				'channel_subscribed'=>0,
				'channel_location'=>'',
				'channel_commentcount'=>0,
				'channel_viewcount'=>0,
				'channel_videocount'=>0,
				'channel_description'=>''
				);

		$api_key = YouTubeGalleryMisc::getSettingValue('youtube_api_key');

		if($api_key!='')
			$answer=VideoSource_YouTube::getYouTubeVideoData_API_v3($videoid,$blankArray, $getinfomethod, $api_key); //Use API v3.0
		else
			$answer=VideoSource_YouTube::getYouTubeVideoData_API_v2($videoid,$blankArray, $getinfomethod);


		if($answer!='')
		{
			$blankArray['title']='***Video not found*** ('.YouTubeGalleryMisc::html2txt($answer).')';
			$blankArray['description']=YouTubeGalleryMisc::html2txt($answer);
			return $blankArray;
		}

		if($customtitle!='')
			$blankArray['title']=$customtitle;

		if($customdescription!='')
			$blankArray['description']=$customdescription;

		if($customimage!='' and strpos($customimage, '#')===false)
		{
			$blankArray['imageurl']=$customimage;
		}
		else
		{
			if($blankArray['imageurl']=='')
				$blankArray['imageurl']=VideoSource_YouTube::getYouTubeImageURL($videoid,$thumbnailcssstyle);

		}


		return $blankArray;
	}

	public static function getYouTubeImageURL($videoid,$thumbnailcssstyle)
	{


		if($thumbnailcssstyle == null)
			return 'http://img.youtube.com/vi/'.$videoid.'/default.jpg';

		//get bigger image if size of the thumbnail set;

		$a=str_replace(' ','',$thumbnailcssstyle);
		if(strpos($a,'width:')===false and strpos($a,'height:')===false)
			return 'http://img.youtube.com/vi/'.$videoid.'/default.jpg';
		else
			return 'http://img.youtube.com/vi/'.$videoid.'/0.jpg';

	}


	protected static function getYouTubeVideoData_API_v3($videoid, &$blankArray, $getinfomethod, $api_key)
	{
		if (!function_exists('curl_init') and !function_exists('file_get_contents'))
			return "enable php functions: curl_init or file_get_contents";

		if (function_exists('phpversion'))
		{
			if(phpversion()<5)
				return "Update to PHP 5+";
		}

		try
		{
			$part='id,snippet,contentDetails,statistics';//,status
			$url = 'https://www.googleapis.com/youtube/v3/videos?id='.$videoid.'&part='.$part.'&key='.$api_key;

			$blankArray['datalink']=$url;

			$htmlcode=YouTubeGalleryMisc::getURLData($url);
			
				
			

			if(($getinfomethod=='js' or $getinfomethod=='jsmanual' ) and $htmlcode=='')
				return '';

				
				
			$j=json_decode($htmlcode);

			if(!$j)
				return 'Connection Error';
			
			if(isset($j->error))
			{
				
				if(isset($j->error->errors))
				{
					$e=$j->error->errors[0];
					return strip_tags($e->message);
				}
				
			}

			$items=$j->items;

			if(!is_array($items))
			{
				return 'Cannot get youtube video data. Please Check Youtube API Key.';
			}

			foreach($items as $item)
			{
				if($item->kind=='youtube#video' and $item->id==$videoid)
				{
					$snippet=$item->snippet;


					$blankArray['title']=$snippet->title;
					$blankArray['description']=$snippet->description;
					$blankArray['publisheddate']=$snippet->publishedAt;

					$t=$snippet->thumbnails;

					$images=array();

					if(isset($t->default))
						$images[]=$t->default->url;

					if(isset($t->medium))
						$images[]=$t->medium->url;

					if(isset($t->high))
						$images[]=$t->high->url;

					if(isset($t->standard))
						$images[]=$t->standard->url;

					if(isset($t->maxres))
						$images[]=$t->maxres->url;

					$blankArray['imageurl']=implode(',',$images);

					$blankArray['channel_title']=$snippet->channelTitle;

					$d=$item->contentDetails->duration;

					$blankArray['duration']=VideoSource_YouTube::covtime_apiv3($d);

					$blankArray['statistics_favoriteCount']=$item->statistics->favoriteCount;
					$blankArray['statistics_viewCount']=$item->statistics->viewCount;

					$blankArray['likes']=$item->statistics->likeCount;
					$blankArray['dislikes']=$item->statistics->dislikeCount;

					if(isset($item->statistics->commentCount))
						$blankArray['commentcount']=$item->statistics->commentCount;
					else
						$blankArray['commentcount']=0;

					if(isset($snippet->tags))
						$blankArray['keywords']=$snippet->tags;

					return '';
				}
			}


		}
		catch(Exception $e)
		{
			return 'Cannot get youtube video data.';
		}
		return '';
	}

	protected static function covtime_apiv3($youtube_time)
	{
		$start = new DateTime('@0'); // Unix epoch
		$start->add(new DateInterval($youtube_time));

		$d=$start->format('H:i:s');

		$parts=explode(':',$d);
		$hours = intval($parts[0]);
		$minutes = intval($parts[1]);
		$seconds = intval($parts[2]);

		return $seconds+$minutes*60+$hours*3600;
	}


	protected static function convert_duration($youtube_time)
	{
		$parts=null;
		preg_match_all('/(\d+)/',$youtube_time,$parts);

		$hours = floor($parts[0][0]/60);
		$minutes = $parts[0][0]%60;
		if(isset($parts[0][1]))
			$seconds = $parts[0][1];
		else
			$seconds=0;

		return $seconds+$minutes*60+$hours*3600;
	}

	protected static function getYouTubeVideoData_API_v2($videoid, &$blankArray, $getinfomethod)
	{
		if (!function_exists('curl_init') and !function_exists('file_get_contents'))
			return "enable php functions: curl_init or file_get_contents";

		if (function_exists('phpversion'))
		{
			if(phpversion()<5)
				return "Update to PHP 5+";
		}

		try{

			$url = 'http://gdata.youtube.com/feeds/api/videos/'.$videoid.'?v=2'; //v=2to get likes and dislikes

			$blankArray['datalink']=$url;


			/*
			if($getinfomethod=='js' or $getinfomethod=='jsmanual')
			{
				$rd=YouTubeGalleryMisc::getRawData($videoid);
				if($rd=='')
				{
					YouTubeGalleryMisc::setDelayedRequest($videoid,$url);
					return '';
				}
				elseif($rd=='' or $rd=='*youtubegallery_request*')
					return '';
				else $htmlcode=$rd;
			}
			else
			*/

			$htmlcode=YouTubeGalleryMisc::getURLData($url);
		

			if(($getinfomethod=='js' or $getinfomethod=='jsmanual' ) and $htmlcode=='')
				return '';


			//	return 'Get info method not set, go to Settings.';

			if(strpos($htmlcode,'<?xml version')===false)
			{
				if(strpos($htmlcode,'Invalid id')===false)
					return substr($htmlcode,0,30);
				else
					return 'Invalid id';

				//return $pair;
			}
			else
			{
				if(strpos($htmlcode, '<code>too_many_recent_calls</code>')!==false)
					return 'Youtube API Key needed';
			}

			$doc = new DOMDocument;
			$doc->loadXML($htmlcode);

			if(!isset($doc->getElementsByTagName("title")->item(0)->nodeValue))
			{
				return 'Youtube 2 Video "'.$videoid.'" not found.';
			}

			$blankArray['title']=$doc->getElementsByTagName("title")->item(0)->nodeValue;
			$blankArray['description']=$doc->getElementsByTagName("description")->item(0)->nodeValue;
			$blankArray['publisheddate']=$doc->getElementsByTagName("published")->item(0)->nodeValue;

			if($doc->getElementsByTagName("duration"))
			{
				if($doc->getElementsByTagName("duration")->item(0))
					$blankArray['duration']=$doc->getElementsByTagName("duration")->item(0)->getAttribute("seconds");
			}

			$MediaElement=$doc->getElementsByTagName("thumbnail");
			if($MediaElement->length>0)
			{
				$images=array();
				foreach($MediaElement as $me)
					$images[]=$me->getAttribute("url");

				$blankArray['imageurl']=implode(',',$images);
			}


			$FeedElement=$doc->getElementsByTagName("feedLink");
			if($FeedElement->length>0)
			{
				$fe0=$FeedElement->item(0);
				$blankArray['commentcount']=$fe0->getAttribute("countHint");
			}

			$RatingElement=$doc->getElementsByTagName("rating");
			if($RatingElement->length>0)
			{


				$re0=$RatingElement->item(0);
				$blankArray['rating_average']=$re0->getAttribute("average");
				$blankArray['rating_max']=$re0->getAttribute("max");
				$blankArray['rating_min']=$re0->getAttribute("min");
				$blankArray['rating_numRaters']=$re0->getAttribute("numRaters");



				if($RatingElement->length>1)
				{
					$re1=$RatingElement->item(1);


					$blankArray['likes']=$re1->getAttribute("numLikes");
					$blankArray['dislikes']=$re1->getAttribute("numDislikes");
				}
				else
				{
					$blankArray['likes']=0;
					$blankArray['dislikes']=0;
				}
			}

			$StatElement=$doc->getElementsByTagName("statistics");
			if($StatElement->length>0)
			{
				$se0=$StatElement->item(0);
				$blankArray['statistics_favoriteCount']=$se0->getAttribute("favoriteCount");
				$blankArray['statistics_viewCount']=$se0->getAttribute("viewCount");
			}

			$blankArray['keywords']=$doc->getElementsByTagName("keywords")->item(0)->nodeValue;

		}
		catch(Exception $e)
		{
			return 'Cannot get youtube video data.';
		}

		return '';
	}




	public static function renderYouTubePlayer($options, $width, $height, &$videolist_row, &$theme_row)//,$startsecond,$endsecond)
	{

		$videoidkeyword='****youtubegallery-video-id****';

		VideoSource_YouTube::ygPlayerTypeController($options, $theme_row);

		$playerapiid='ygplayerapiid_'.$videolist_row->id;
		$playerid='youtubegalleryplayerid_'.$videolist_row->id;

		$settings=VideoSource_YouTube::ygPlayerPrepareSettings($options, $theme_row,$playerapiid);//,$startsecond,$endsecond);

		$initial_volume=(int)$theme_row->volume;

		$playlist='';
		$full_playlist='';
		$youtubeparams=$options['youtubeparams'];
		$p=explode(';',$youtubeparams);


		if($options['allowplaylist']==1)
		{
			foreach($p as $v)
			{
				$pair=explode('=',$v);
				if($pair[0]=='playlist')
					$playlist=$pair[1];

				if($pair[0]=='fullplaylist')
					$full_playlist=$pair[1];
			}
		}

		if($options['allowplaylist']!=1 or $options['playertype']==5 or $options['playertype']==2)
		{
			$p_new=array();
			foreach($p as $v)
			{
				$pair=explode('=',$v);
				if($pair[0]!='playlist')
					$p_new[]=$v;
			}
			$youtubeparams=implode(';',$p_new);
		}

		YouTubeGalleryMisc::ApplyPlayerParameters($settings,$youtubeparams);

		$settingline=YouTubeGalleryMisc::CreateParamLine($settings);



		if (isset($_SERVER["HTTPS"]) and $_SERVER["HTTPS"] == "on")
			$http='https://';
		else
			$http='http://';

		if($theme_row->nocookie)
			$youtubeserver=$http.'www.youtube-nocookie.com/';
		else
			$youtubeserver=$http.'www.youtube.com/';

		$return=VideoSource_YouTube::ygHTML5PlayerAPI($width,$height,$youtubeserver,$videoidkeyword,$settingline,
															  $options,$videolist_row->id,$playerid,$theme_row,
															  $full_playlist,$initial_volume,$playerapiid,false);
		return $return;
	}

	protected static function ygPlayerPrepareSettings(&$options, &$theme_row, $playerapiid)//,$startsecond,$endsecond)
	{
		$settings=array();
		$settings[]=array('autoplay',(int)$options['autoplay']);

		$settings[]=array('hl','en');


		if($options['fullscreen']!=0)
			$settings[]=array('fs','1');
		else
			$settings[]=array('fs','0');


		$settings[]=array('showinfo',$options['showinfo']);
		$settings[]=array('iv_load_policy','3');
		$settings[]=array('rel',$options['relatedvideos']);
		$settings[]=array('loop',(int)$options['repeat']);
		$settings[]=array('border',(int)$options['border']);

		if($options['color1']!='')
			$settings[]=array('color1',$options['color1']);

		if($options['color2']!='')
			$settings[]=array('color2',$options['color2']);

		if($options['controls']!='')
		{
			$settings[]=array('controls',$options['controls']);
			if($options['controls']==0)
				$settings[]=array('version',3);

		}
		//--------------
		//if($options['playertype']!=2)
		//{
			//$settings[]=array('start',((int)$startsecond));
			//$settings[]=array('end',((int)$endsecond));
		//}


		if($options['playertype']==2)
		{
			//Player with Flash availability check
			$settings[]=array('playerapiid','ygplayerapiid_'.$playerapiid);
			$settings[]=array('enablejsapi','1');
		}


		return $settings;
	}

	protected static function ygPlayerTypeController(&$options, &$theme_row)
	{
		$initial_volume=(int)$theme_row->volume;


		if($options['playertype']==100) //auto
			$options['playertype']=2; //Flash with API by default

		//Change Flash 2 to 3
		elseif($options['playertype']==4)//Flash Version 2 is depricated (api)
			$options['playertype']=2;//Flash Version 3 (api)
		elseif($options['playertype']==3)//Flash Version 2 is depricated
			$options['playertype']=0;//Flash Version 3


		//Change to HTML5 if for Apple
		if($options['playertype']==0)
		{
			if(YouTubeGalleryMisc::check_user_agent_for_apple())
				$options['playertype']=1; //Flash Player not supported use IFrame Instead
		}

		//Change to HTML5 API if for Apple
		if($options['playertype']==2)
		{
			if(YouTubeGalleryMisc::check_user_agent_for_apple())
				$options['playertype']=5; //Flash Player not supported use IFrame API Instead
		}

		//Change to API if needed
		if($options['playertype']==0)
		{
			//Note - not available for IE
			if(($theme_row->muteonplay or $initial_volume!=-1) and $options['playertype']!=5)
					$options['playertype']=2; //because other types of player doesn't support this functionality.
		}

		//Change to API if needed
		if($options['playertype']==1)
		{
			//Note - not available for IE
			if(($theme_row->muteonplay or $initial_volume!=-1) and $options['playertype']!=5)
					$options['playertype']=5; //because other types of player doesn't support this functionality.
		}

		//Disable API for IE (Flash)
		if($options['playertype']==2)
		{
			if(YouTubeGalleryMisc::check_user_agent_for_ie())
				$options['playertype']=0; //Disable API for IE (so sad!)
		}


		//Disable API for IE (IFrame)
		if($options['playertype']==5)
		{
			if(YouTubeGalleryMisc::check_user_agent_for_ie())
				$options['playertype']=1; //Disable API for IE (so sad!)
		}

	}



	protected static function ygHTML5PlayerAPI($width,$height,$youtubeserver,$videoidkeyword,$settingline,
											   &$options,$vlid,$playerid,&$theme_row,&$full_playlist,$initial_volume,$playerapiid,$withFlash=false)
	{
			$showHeadScript=false;

			/*$result='<iframe id="'.$playerapiid.'api" type="text/html" width="640" height="390"
  src="http://www.youtube.com/embed/M7lc1UVf-VE?enablejsapi=1&origin=http://example.com"
  frameborder="0"></iframe>';*/
			$result='<div id="'.$playerapiid.'api"></div><!--DYNAMIC PLAYER-->';

			$showHeadScript=true;

			if($showHeadScript)
				$result.=VideoSource_YouTube::ygHTML5PlayerAPIHead($width,$height,$youtubeserver,$videoidkeyword,
																   $settingline,$options,$vlid,$playerid,
																   $theme_row,$full_playlist,$initial_volume,$playerapiid,$withFlash);

			return $result;
	}

	protected static function ygHTML5PlayerAPIHead($width,$height,$youtubeserver,$videoidkeyword,$settingline,
												   &$options,$vlid,$playerid,&$theme_row,&$full_playlist,
												   $initial_volume,$playerapiid,$withFlash=false)
	{

		$AdoptedPlayerVars=str_replace('&amp;','", "',$settingline);
		$AdoptedPlayerVars='"'.str_replace('=','":"',$AdoptedPlayerVars).'", "enablejsapi":"1"';

		if($full_playlist!='')
			$pl='"'.$full_playlist.'".split(",");';
		else
			$pl='[];';


		$autoplay=((int)$options['autoplay']==1 ? 'true' : 'false');
		$result_head='
			var tag = document.createElement("script");
			tag.src = "https://www.youtube.com/iframe_api";
			var firstScriptTag = document.getElementsByTagName("script")[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			youtubeplayer'.$vlid.'.youtubeplayer_options={'.$AdoptedPlayerVars.'};
			//window.YTConfig = {  host: "https://www.youtube.com"}
		';

		$document = JFactory::getDocument();
		$document->addScriptDeclaration($result_head);

	}





}
