<?php
/**
 * @package Plugin YouTubeR for Joomla! 3.x
 * @version 1.30
 * @author Maxiolab
 * @copyright (C) 2016- Maxiolab
 * @license GNU/GPLv3 http://www.gnu.org/licenses/gpl-3.0.html
**/
defined( '_JEXEC' ) or die;

class mxYouTuberView_base{
	
	private $_tmpl = '';
	private $_controller;	
	
	public function __construct($attribs,$controller){
		$this->_controller = $controller;
	}
	
	protected function getDataModel(){
		static $model;
		if(!is_object($model)){
			$model = new mxYouTuberData($this->_controller);
		}
		return $model;
	}
	
	public function render(){
		$theme = $this->attribs['theme'];
		$template = $this->getTemplate();
		$path = '';
		foreach($this->_controller->getTemplatePaths($theme) as $tp){
			if(is_file($tp.'/'.$template.'.php')){
				$path = $tp.'/'.$template.'.php';
				break;
			}
		}
		if($path==''){
			throw new Exception('Template "'.$template.'" for the theme "'.$theme.'" not found.');
		}
		ob_start();
		include($path);
		$result = ob_get_contents();
		ob_end_clean();
		return $result;
	}
	
	public function orderVideos(&$videos,$orderBy,$orderDir){
		if($orderBy!='default'){
			mxYoutubeR_globalVar('videosOrderBy',$orderBy);
			uasort($videos,create_function('$a,$b','
				$orderBy = mxYoutubeR_globalVar("videosOrderBy");
				$varA = 0;
				$varB = 0;
				switch($orderBy){
					case "date":
						$varA = strtotime($a->snippet->publishedAt);
						$varB = strtotime($b->snippet->publishedAt);
					break;
					case "views":
						$varA = (int)@$a->statistics->viewCount;
						$varB = (int)@$b->statistics->viewCount;
					break;
					case "likes":
						$varA = (int)@$a->statistics->likeCount;
						$varB = (int)@$b->statistics->likeCount;
					break;
					case "comments":
						$varA = (int)@$a->statistics->commentCount;
						$varB = (int)@$b->statistics->commentCount;
					break;
				}
				if ($varA == $varB) {
					return 0;
				}
				return ($varA < $varB) ? -1 : 1;
			'));
		}
		if($orderDir=='desc'){
			$videos = array_reverse($videos);
		}
		return true;
	}
	
	public function getVideoHTML($video,$attribs){
		$size = $attribs['size'];
		
		parse_str($attribs['ytp_params'],$ytPlayerAttribs);
		
		if($attribs['suggested_videos']=='false'){
			$ytPlayerAttribs['rel'] = '0';
		}

		switch($attribs['mode']){
			case 'embed':
				if(!isset($ytPlayerAttribs['showinfo'])) $ytPlayerAttribs['showinfo'] = 0;
				
				$html = '<iframe width="'.$attribs['width'].'" height="'.$attribs['height'].'" src="https://www.youtube.com/embed/'.$video->id.'?'.http_build_query($ytPlayerAttribs).'" frameborder="0" allowfullscreen></iframe>';
			break;
			case 'lightbox':
			case 'link':
			default:
				if(!isset($ytPlayerAttribs['autoplay'])) $ytPlayerAttribs['autoplay'] = 1;
				
				$html = '<a href="'.($attribs['mode']=='lightbox'?'https://www.youtube.com/embed/'.$video->id.'?'.http_build_query($ytPlayerAttribs):'https://youtu.be/'.$video->id).'" class="mxyt-videolink '.($attribs['mode']=='lightbox'?' mxyt-lightbox':'').'" '.(isset($attribs['rel'])?'data-rel="'.$attribs['rel'].'"':'').' target="_blank">
					<span class="mxyt-play">
						<i class="mxyt-icon mxyt-icon-play"></i>
					</span>
					'.(isset($video->contentDetails->duration)?'<span class="mxyt-time">'.$this->getYouTubeTime($video->contentDetails->duration).'</span>':'').'
					<img src="'.$this->getThumbURL($video,$size).'" alt="'.htmlentities($video->snippet->title).'" />
				</a>';
			break;
		}
		return $html;
	}
	
	public function getVideoDate($timestamp){
		return date($this->_controller->params->get('date_format'),strtotime($timestamp));
	}
	
	public function getLimitVideoDescr($text,$num_words){
		$words_array = preg_split( "/[\n\r\t ]+/", $text, $num_words + 1, PREG_SPLIT_NO_EMPTY );
		$sep = ' ';
		if ( count( $words_array ) > $num_words ) {
			array_pop( $words_array );
			$text = implode( $sep, $words_array );
		}
		$text = implode( $sep, $words_array );
		$text = preg_replace_callback('~([^\s]{24})([^\s])~is',create_function('$match','return $match[1]." ".$match[2];'),$text);
		return $text;
	}

	public function getFullVideoDescr($str){
		$str = preg_replace_callback('~(https?://[^\s]+)~i',create_function('$matches','$title = (JString::strlen($matches[1])>25?JString::substr($matches[1],0,25)."...":$matches[1]);return "<a href=\"{$matches[1]}\" target=\"_blank\" rel=\"nofollow\">{$title}</a>";'),$str);
		return $str;
	}
	
	public function getYouTubeTime($str){
		$int = new DateInterval($str);
	
		if($int->h != 0){
			$duration = $int->format('%h:%I:%S');
		}
		else{
			$duration = $int->format('%i:%S');
		}
	
		return $duration;
	}
	
	public function getThumbURL($video,$size){
		return (isset($video->snippet->thumbnails->$size)?$video->snippet->thumbnails->{$size}->url:$video->snippet->thumbnails->default->url);
	}
	
	public function setTemplate($tmpl){
		$this->_tmpl = $tmpl;
	}
	
	public function getTemplate(){
		return $this->_tmpl;
	}

}