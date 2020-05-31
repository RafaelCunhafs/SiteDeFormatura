<?php
/**
* @package   BaGallery
* @author    Balbooa http://www.balbooa.com/
* @copyright Copyright @ Balbooa
* @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
*/ 

defined('_JEXEC') or die;

jimport('joomla.filesystem.folder');

class com_bagalleryInstallerScript
{
    public function install($parent)
    {
    }
    
    public function uninstall($parent)
    {
        $params = JComponentHelper::getParams('com_bagallery');
        $base = JPATH_ROOT . '/' . $params->get('file_path', 'images');
        if (jFolder::exists($base. '/bagallery')) {
            jFolder::delete($base. '/bagallery');
        }
    }
    public function update($parent)
    {
    }
    
    public function preflight($type, $parent)
    {
    }
    
    public function postflight($type, $parent)
    {
    }
}