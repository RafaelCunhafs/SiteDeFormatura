<?php
/**
 * @package Plugin YouTubeR for Joomla! 3.x
 * @version 1.30
 * @author Maxiolab
 * @copyright (C) 2016- Maxiolab
 * @license GNU/GPLv3 http://www.gnu.org/licenses/gpl-3.0.html
**/
defined( '_JEXEC' ) or die;
require_once(dirname(__FILE__).'/base.php');

class mxYouTuberView_video extends mxYouTuberView_base{
	
	public function __construct($attribs,$controller){
		parent::__construct($attribs,$controller);
		
		$this->setTemplate('video');
		$dataModel = $this->getDataModel();
        
		$this->video = $dataModel->getVideo( $attribs['id'] );
        $this->channel = $dataModel->getChannel( $this->video->snippet->channelId );
		
		if($attribs['size']==''){
			$attribs['size'] = 'default';
			if(isset($this->video->snippet->thumbnails->medium)) $attribs['size'] = 'medium';
			else if(isset($this->video->snippet->thumbnails->maxres)) $attribs['size'] = 'maxres';
			else if(isset($this->video->snippet->thumbnails->high)) $attribs['size'] = 'high';
			else if(isset($this->video->snippet->thumbnails->standard)) $attribs['size'] = 'standard';
		}
		$this->showTitle = strpos($attribs['display'],'title')!==false;
		$this->showChannel = strpos($attribs['display'],'channel')!==false;
		$this->showDescription = strpos($attribs['display'],'description')!==false;
		$this->showMeta = strpos($attribs['display'],'meta')!==false;
		$this->showDate = strpos($attribs['display'],'date')!==false;
		
		$this->attribs = $attribs;
	}
	
}