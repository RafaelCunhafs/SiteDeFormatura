<?php
/**
* @package   BaGallery
* @author    Balbooa http://www.balbooa.com/
* @copyright Copyright @ Balbooa
* @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
*/

defined('_JEXEC') or die;

jimport('joomla.filesystem.folder');
jimport('joomla.filesystem.file');

class bagalleryModelUploader extends JModelLegacy
{
    protected $_parent;
    protected $_folders;
    
    public function getParent()
    {
        return $this->_parent;
    }

    public function getFolderList()
    {
        $dir = $this->_folders;
        $folders = JFolder::folders($dir);
        $items = array();
        foreach ($folders as $folder) {
            $fold = new stdClass;
            $fold->path = $dir. '/' .$folder;
            $fold->name = $folder;
            $this->_folders = $dir. '/' .$folder;
            $fold->childs = $this->getFolderList();
            $items[] = $fold;
        }

        return $items;
    }

    public function getBreadcrump()
    {
        $dir = IMAGES_BASE;
        $this->_folders = $dir;
        $input = JFactory::getApplication()->input;
        $name = $input->get('folder', '', 'string');
        if ($name == "undefined") {
            $name = '';
        }
        if (!empty($name)) {
            $dir = $name;
        }
        if ($dir != IMAGES_BASE) {
            $fold = new stdClass();
            $pat = JPATH_ROOT;
            $pos = strlen(JPATH_ROOT.'/');
            $prepath = substr($dir, $pos);
            $array = explode('/', $prepath);
            $fold->curr = $array[count($array) - 1];
            unset($array[count($array) - 1]);
            $path = array();
            for ($i = 0; $i < count($array); $i++) {
                $pat .= '/' .$array[$i];
                $path[] = $pat;
            }
            $fold->par = $array;
            $fold->path = $path;
            $fold->name = "../";
        } else {
            $fold = '';
        }

        return $fold;
    }
    
    public function getFolders()
    {
        $dir = IMAGES_BASE;
        $this->_folders = $dir;
        $input = JFactory::getApplication()->input;
        $name = $input->get('folder', '', 'string');
        if ($name == "undefined") {
            $name = '';
        }
        if (!empty($name)) {
            $dir = $name;
        }
        $items = array();
        if ($dir != IMAGES_BASE) {
            $this->_parent = $dir;
        }
        $folders = JFolder::folders($dir);
        if (!empty($folders)) {
            foreach ($folders as $folder) {
                $fold = new stdClass;
                $fold->path = $dir. '/' .$folder;
                $fold->name = $folder;
                $items[] = $fold;
            }
        }
        $folders = $items;
        return $folders;
    }

    public function getImages()
    {
        $dir = IMAGES_BASE;
        $input = JFactory::getApplication()->input;
        $name = $input->get('folder', '', 'string');
        if ($name == "undefined") {
            $name = '';
        }
        if (!empty($name)) {
            $dir = $name;
            $curent = str_replace(IMAGES_BASE, '', $dir);
        }
        $files	= JFolder::files($dir);
        $pos = strlen(JPATH_ROOT);
        $dir = substr($dir, $pos);
        $images = array();
        if (!empty($files)) {
            foreach ($files as $file) {
                $ext = strtolower(JFile::getExt($file));
                $flag = $this->checkExt($ext);
                if ($flag) {
                    $image = new stdClass;
                    $image->ext = $ext;
                    $image->name = $file;
                    $image->path = $image->url = $dir. '/' .$file;
                    $image->size = filesize(JPATH_ROOT.$image->path);
                    $images[] = $image;
                }
            }
        }
        return $images;
    }
    
    public function checkExt($ext)
    {
        switch($ext) {
            case 'jpg':
            case 'png':
            case 'gif':
            case 'jpeg':
                return true;
            default:
                return false;
        }
    }
}
