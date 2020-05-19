<?php
/**
 * @package Plugin YouTubeR lite for Joomla! 3.x
 * @version 1.31
 * @author Maxiolab
 * @copyright (C) 2016- Maxiolab
 * @license GNU/GPLv3 http://www.gnu.org/licenses/gpl-3.0.html
**/
defined( '_JEXEC' ) or die;
 
class plgSystemYoutuber_lite extends JPlugin{
	
	protected $autoloadLanguage = true;
 	
	function onAfterInitialise(){
		$app = JFactory::getApplication();
		$input = $app->input;
		$action = $input->get('action','');
		if($action!='mxyoutuber'){
			return true;
		}
		try{
			JResponse::setHeader('Content-Type', 'application/json', true);
			parse_str(urldecode($input->getString('params','')),$attribs);
			$attribs = $this->shortcodeAttribs($attribs);
			$attribs['pageToken'] = $input->getString('pageToken','');
			
			$view = $this->getView($attribs);
			
			$result = new stdclass;
			$result->success = 1;
			$result->pageToken = '';
			$result->html = $view->render();
			
			echo json_encode($result);
		}
		catch(Exception $e){
			JResponse::setHeader('Content-Type', 'text/html', true);
			echo '<p><strong>YouTubeR '.JText::_('error').':</strong> '.$e->getMessage().'</p>';
		}
		$app->close();
	}
	
	function onAfterRender(){
		$app = JFactory::getApplication();
		if($app->isAdmin()) return;	
		$doc = JFactory::getDocument();
		if($doc->getType()!='html') return;
		$html = JResponse::getBody();
		if(strpos($html,'[mx_youtuber')===false){
			return true;
		}
		$html = preg_replace_callback('~\[(mx_youtube[^ ]+)([^\]]+)]~',array($this,'renderShortcode'),$html);
		JResponse::setBody($html);
		return true;
	}
	
	function onBeforeCompileHead(){
		$app = JFactory::getApplication();
		$doc = JFactory::getDocument();
		if($doc->getType()!='html') return;
		$mediaURI = JURI::root().'media/plg_system_youtuber_lite/';
		JHtml::_('jquery.framework');
		if($app->isAdmin()){
			JHtml::script($mediaURI.'assets/js/media-uploader.js',false,true);
			JHtml::script($mediaURI.'assets/js/mxyoutube.js',false,true);
			JHtml::script('https://apis.google.com/js/client.js',false,true);
			JHtml::stylesheet($mediaURI.'assets/css/backend.css',array(),true);
			$doc->addScriptDeclaration('
				jQuery(document).ready(function(){
					if(typeof mxYouTubeRBtnClick !="function"){
						return;
					}
					if(window.wzYoutube==undefined){
						alert("'.JText::_('Please activate system YouTubeR_lite plugin').'");
					}
					if("'.$this->params->get('googleOAuthKey').'"==""){
						alert("'.JText::_('Please set Google OAuth client ID').'");
						jQuery(".mxYouTuberBtn").attr("onclick","return false;").css("opacity","0.5");
					}
					else{
						window.wzYoutube.lang.authorize_account = "'.JText::_('Authorize YouTube account').'";
						window.wzYoutube.lang.upload_video = "'.JText::_('Upload video').'";
						window.wzYoutube.lang.list_videos = "'.JText::_('Videos list').'";
						window.wzYoutube.lang.more_videos = "'.JText::_('More videos').'";
						window.wzYoutube.lang.title = "'.JText::_('Title').'";
						window.wzYoutube.lang.video_title = "'.JText::_('Video title').'";
						window.wzYoutube.lang.description = "'.JText::_('Description').'";
						window.wzYoutube.lang.video_description = "'.JText::_('Video description').'";
						window.wzYoutube.lang.tags = "'.JText::_('Tags').'";
						window.wzYoutube.lang.video_tags = "'.JText::_('Tags separated by comma').'";
						window.wzYoutube.lang.privacy_status = "'.JText::_('Privacy Status').'";
						window.wzYoutube.lang.upload = "'.JText::_('Upload').'";
						window.wzYoutube.lang.privacy_public = "'.JText::_('Public').'";
						window.wzYoutube.lang.privacy_ulnisted = "'.JText::_('Unlisted').'";
						window.wzYoutube.lang.privacy_private = "'.JText::_('Private').'";
						window.wzYoutube.lang.enter_video_title = "'.JText::_('Please enter video title').'";
						window.wzYoutube.lang.choose_video_file = "'.JText::_('Please choose video file').'";
						window.wzYoutube.appID = "'.$this->params->get('googleOAuthKey').'";
					}
				});
			');
		}
		else{
			JHtml::script($mediaURI.'assets/js/frontend.js',false,true);
			JHtml::script($mediaURI.'assets/lightcase/lightcase.js',false,true);
			JHtml::stylesheet('http://fonts.googleapis.com/css?family=Roboto:400,400italic,500,500italic,700,700italic&subset=latin,cyrillic');
			JHtml::stylesheet($mediaURI.'assets/css/frontend.css',array(),true);
			JHtml::stylesheet($mediaURI.'assets/lightcase/css/lightcase.css',array(),true);
			$doc->addScriptDeclaration('
				window.mxYouTubeR = {ajax_url:"'.JURI::root().'",lang:{"more":"'.JText::_('More').'","less":"'.JText::_('Less').'"}};
			');
		}
	}
	
	function getView($attribs){
		$viewPath = JPATH_ROOT.'/plugins/system/youtuber_lite/';
		$viewName = 'mxYouTuberView_'.$attribs['type'];
		$classFile = $viewPath.'views/'.$attribs['type'].'.php';
		if(is_file($classFile)){
			require_once($viewPath.'data.php');
			require_once($classFile);
			$view = new $viewName($attribs,$this);
			return $view;
		}
		else{
			throw new Exception('Incorrect shortcode attribute type "'.$attribs['type'].'".');
		}
		return false;
	}
	
	function shortcodeAttribs($rawAttribs){
		$attribs = array();
		if(is_array($rawAttribs)){
			$attribs = $rawAttribs;
		}
		else{
			preg_match_all('~([a-zA-Z0-9_\-]+)="([^"]+)"~',$rawAttribs,$mchs);
			foreach($mchs[1] as $k=>$v){
				$attribs[$v] = $mchs[2][$k];
			}
		}
		$defaults = array(
			'type' => 'video',
			'id' => '',
			'videos' => '',
			'display' => 'title,date,channel,description,meta',
			'mode' => $this->params->get('mode'),
			'theme' => $this->params->get('theme'),
			'ytp_params' => '',
			'size' => '',
			'width' => '100%',
			'height' => '300',
			'cols' => ((isset($attribs['type'])&&$attribs['type']=='channel')?1:(int)$this->params->get('cols')),
			'rows' => (int)$this->params->get('rows'),
			'responsive_limit' => $this->params->get('responsive_limit'),
			'max_words' => (int)$this->params->get('max_words'),
			'infinite_scroll' => 'false',
			'load_more' => 'true',
			'load_more_text' => JText::_('Load more'),
			'pageToken' => '',
			'suggested_videos' => 'false',
			'order_by' => $this->params->get('order_by','default'),
			'order_dir' => $this->params->get('order_dir','asc'),
		);
		$result = array_merge($defaults,$attribs);
		$result['limit'] =  (int)$result['cols']*(int)$result['rows'];
		return $result;
	}
	
	function renderShortcode($matches){
		$shortCode = $matches[1];
		$attribs = $this->shortcodeAttribs($matches[2]);
		if($shortCode=='mx_youtuber_video'){
			$attribs['type'] = 'video';
		}
		try{
			$view = $this->getView($attribs);
			return $view->render();
		}
		catch( Exception $e){
			if(JDEBUG){
				return '<p><strong>YouTubeR '.JText::_('error').':</strong> '.$e->getMessage().'</p>';
			}
			else return '<p><strong>YouTubeR '.JText::_('error').'</strong>.</p>';
		}
		return '';
	}
	
	function getTemplatePaths($theme=''){
		$app    = JFactory::getApplication();
		$mainThemePath = JPATH_ROOT.'/templates/'.$app->getTemplate().'/html/plg_system_youtuber_lite/';
		$mediaPath = JPATH_ROOT.'/media/plg_system_youtuber_lite/';
		$theme = ($theme!=''?$theme:$this->params->get('theme'));
		$paths = array();
		$paths[] = $mainThemePath.$theme;
		$paths[] = $mainThemePath.'default';
		$paths[] = $mediaPath.'themes/'.$theme;
		$paths[] = $mediaPath.'themes/default';
		return $paths;
	}
}