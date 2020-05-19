<?php
/**
 * @package Plugin YouTubeR lite for Joomla! 3.x
 * @version 1.30
 * @author Maxiolab
 * @copyright (C) 2016- Maxiolab
 * @license GNU/GPLv3 http://www.gnu.org/licenses/gpl-3.0.html
**/
defined( '_JEXEC' ) or die;

class mxYouTuberData{
	
	private $_browser_key = '';
	private $_caching = 1;
	private $_cache_lifetime = 3600;
	private $_controller;	
    const YOUTUBE_API_HOST = 'https://www.googleapis.com/youtube/v3/';
    const CACHE_KEY = 'plg_system_youtuber_lite';
	
	public function __construct($controller){
		$this->_controller = $controller;
		$this->_browser_key = $controller->params->get('googleBrowserKey');
		$this->_caching = (int)$controller->params->get('caching');
		$this->_cache_lifetime = (int)$controller->params->get('cache_lifetime');
	}
	
	public function getVideo($id){
		$response = $this->getData( 'videos' , array(
            'part'          => 'snippet,statistics,contentDetails',
            'maxResults'    => (is_array($id)?count($id):1),
            'id'            => (is_array($id)?implode(',',$id):$id)
        ));

        if( !isset($response->items[0]) ) {
            if(is_array($id)){
				throw new Exception('Videos IDs:'.implode(' ,',$id).' not found');
			}
			else{
				throw new Exception('Video ID:'.$id.' not found');
			}
        }
        
        return (is_array($id)?$response->items:$response->items[0]);
	}
		
	public function getChannel($id){
        $response = $this->getData( 'channels' , array(
            'part' => 'snippet,contentDetails,brandingSettings,statistics',
            'id' => $id
        ));

        if( !isset($response->items[0]) ) {
            throw new Exception('Channel ID:'.$id.' not found');
        }

        return $response->items[0];
	}

    private function getRequestURI( $type,$data ){
        $data['key'] = $this->_browser_key;
        return self::YOUTUBE_API_HOST.$type.'?'.http_build_query( $data );
    }

	private function getData($type,$data){
		$cache = JFactory::getCache(self::CACHE_KEY, '');
		$cache->setCaching((bool)$this->_caching);
		$cache->setLifeTime($this->_cache_lifetime);
		$URI = $this->getRequestURI($type,$data);
		$qID = md5($URI);
		$cached = $cache->get( $qID );

		if($this->_caching && $cached){
			return json_decode(base64_decode($cached));
		}
	
		$request = JHttpFactory::getHttp();
		$responce = $request->get($URI,array(
			'Accept' => 'application/json',
			'Referer' => JURI::base(false)
		),10);
		
		if( (int)$responce->code != 200 ) {
			throw new Exception('YouTube server responce error.'.(!empty($responce->body)?'<pre>'.print_r($responce->body,true).'</pre>':''));
		}
		$result = $responce->body;
		
		if($this->_caching){
			$cache->store(base64_encode($result), $qID);
		}
		else{
			$cache->remove($qID);
		}
	
		return json_decode($result);
	}

}