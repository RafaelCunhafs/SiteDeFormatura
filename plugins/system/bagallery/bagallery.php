<?php
/**
* @package   BaGallery
* @author    Balbooa http://www.balbooa.com/
* @copyright Copyright @ Balbooa
* @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
*/

defined('_JEXEC') or die;

jimport( 'joomla.plugin.plugin' );
jimport('joomla.filesystem.folder');
 
class plgSystemBagallery extends JPlugin
{
    public function __construct( &$subject, $config )
    {
        parent::__construct( $subject, $config );
    }

    public function onAfterInitialise()
    {
        $app = JFactory::getApplication();
        if ($app->isSite()) {
            $path = JPATH_ROOT . '/components/com_bagallery/helpers/bagallery.php';
            JLoader::register('bagalleryHelper', $path);
            if (isset($_GET['fbclid'])) {
                $url = $_SERVER['REQUEST_URI'];
                $pos = strpos($url, 'fbclid');
                $delimiter = $url[$pos - 1];
                $url = str_replace($delimiter.'fbclid='.$_GET['fbclid'], '', $url);
                header('Location: '.$url);
            }
        }
    }
    
    public function onBeforeCompileHead()
    {
        $app = JFactory::getApplication();
        $loaded = JLoader::getClassList( );
        $doc = JFactory::getDocument();
        if (isset($loaded['bagalleryhelper'])) {
            $option = $app->input->get('option', '', 'string');
            $a_id = $app->input->get('a_id', '', 'string');
            if ($app->isSite() && empty($a_id) && $doc->getType() == 'html' && $option != 'com_config') {
                bagalleryHelper::addStyle();
            }
        }
    }

    public function onAfterRender()
    {
        $app = JFactory::getApplication();
        $doc = JFactory::getDocument();
        $option = $app->input->get('option', '', 'string');
        $a_id = $app->input->get('a_id', '', 'string');
        if ($app->isSite() && empty($a_id) && $doc->getType() == 'html' && $option != 'com_config') {
            $loaded = JLoader::getClassList();
            if (isset($loaded['bagalleryhelper'])) {
                $html = $app->getBody();
                $pos = strpos($html, '</head>');
                $head = substr($html, 0, $pos);
                $body = substr($html, $pos);
                if (strpos($head, 'name="og:') !== false) {
                    $head = str_replace('name="og:', 'property="og:', $head);
                    if (strpos($head, 'prefix="og: http://ogp.me/ns#"') === false) {
                        $head = str_replace('<html', '<html prefix="og: http://ogp.me/ns#" ', $head);
                    }
                }
                $html = $head.$this->getContent($body);
                $app->setBody($html);
            }
        }
    }
    
    public function getContent($body)
    {
        $regex = '/\[gallery ID=+(.*?)\]/i';
        $array = array();
        preg_match_all($regex, $body, $matches, PREG_SET_ORDER);
        if ($matches) {
            foreach ($matches as $index => $match) {
                $gallery = explode(',', $match[1]);
                $id = $gallery[0];
                $pos = strpos($id, ' category ID');
                if ($pos !== false) {
                    $id = substr($id, 0, $pos);
                }
                if (isset($id)) {
                    if (bagalleryHelper::checkGallery($id)) {
                        if (!in_array($id, $array)) {
                            $array[] = $id;
                        }
                        $doc = JFactory::getDocument();
                        $gallery = bagalleryHelper::drawHTMLPage($match[1]);
                        $about = bagalleryHelper::aboutUs();
                        $v = $about->version;
                        $url = JURI::root() . 'components/com_bagallery/assets/js/ba-gallery.js?'.$v;
                        $body = @preg_replace("|\[gallery ID=".$match[1]."\]|", addcslashes($gallery, '\\$'), $body, 1);
                    }
                }
            }
            if (!empty($array)) {
                $body = $this->drawScripts($array).$body;
            }
        }
        return $body;
    }
    
    public function drawScripts($cid)
    {
        $doc = JFactory::getDocument();
        $scripts = $doc->_scripts;
        $array = array();
        $about = bagalleryHelper::aboutUs();
        $v = $about->version;
        $html = '';
        $jquery = true;
        foreach ($scripts as $key => $script) {
            $key = explode('/', $key);
            $array[] = end($key);
        }
        foreach ($cid as $id) {
           if (!$jquery || bagalleryHelper::loadJQuery($id) == 0) {
                
            } else if (!in_array('jquery.min.js', $array) && !in_array('jquery.js', $array)) {
                $src = JUri::root(true). '/media/jui/js/jquery.min.js';
                $html .= '<script type="text/javascript" src="' .$src. '"></script>';
            }
        }
        $src = JURI::root(). 'components/com_bagallery/libraries/modal/ba_modal.js?'.$v;
        $html .= '<script type="text/javascript" src="' .$src. '"></script>';
        $src = JUri::root(). 'components/com_bagallery/assets/css/ba-style.css?'.$v;
        $html .= '<link rel="stylesheet" href="' .$src. '">';
        $src = JUri::root(). 'components/com_bagallery/assets/css/ba-effects.css?'.$v;
        $html .= '<link rel="stylesheet" href="' .$src. '">';
        $src = JURI::root() . 'components/com_bagallery/libraries/ba_isotope/ba_isotope.js?'.$v;
        $html .= '<script type="text/javascript" src="'.$src.'"></script>';
        $src = JURI::root(). 'components/com_bagallery/libraries/lazyload/jquery.lazyload.min.js?'.$v;
        $html .= '<script type="text/javascript" src="' .$src. '"></script>';
        $src = JURI::root(). 'components/com_bagallery/assets/js/ba-gallery.js?'.$v;
        $html .= '<script type="text/javascript" src="' .$src. '"></script>';
        
        return $html; 
    }
}

function gallery_sc(){}