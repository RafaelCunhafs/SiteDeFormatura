<?php
/**
* @package   BaGallery
* @author    Balbooa http://www.balbooa.com/
* @copyright Copyright @ Balbooa
* @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
*/

defined('_JEXEC') or die;

jimport('joomla.application.component.view');

class bagalleryViewUploader extends JViewLegacy
{
    protected $_folders;
    protected $_images;
    protected $_items;
    protected $_parent;
    protected $_list;
    protected $_breadcrumb;
    protected $_move_to = array();
    protected $_page = 0;
    protected $_pages = 1;
    protected $_limit = 25;
    protected $about;
    protected $params;

    
    public function display ($tpl = null)
    {
        if (count($errors = $this->get('Errors'))) {
            JError::raiseError(500, implode('<br />', $errors));
            return false;
        }
        $doc = JFactory::getDocument();
        $this->_folders = $this->get('Folders');
        $this->_images = $this->get('Images');
        $this->_items = array_merge($this->_folders, $this->_images);
        $this->_parent = $this->get('parent');
        $this->about = bagalleryHelper::aboutUs();
        $this->addToolBar();
        $this->drawPagination();
        if (is_array($this->_folders)) {
            $this->_breadcrumb = $this->get('Breadcrump');
        }
        if ($doc->getDirection() == 'rtl') {
            $doc->addStyleSheet(JUri::root().'administrator/components/com_bagallery/assets/css/rtl-ba-admin.css?'.$this->about->version);
        }
        $this->_list = $this->get('folderList');
        $this->_list = $this->drawFolderList($this->_list);
        $this->params = JComponentHelper::getParams('com_bagallery');
        $image_path = $this->params->get('image_path', 'images');
        $doc->addScriptDeclaration('var image_path = "'.$image_path.'";');
        parent::display($tpl);
    }

    protected function drawPagination()
    {
        $input = JFactory::getApplication()->input;
        $page = $input->get('page', '', 'string');
        if (!empty($page)) {
            $this->_page = $page * 1;
        }
        $limit = $input->get('ba_limit', '', 'string');
        if (!$limit) {
            $limit = 25;
        }
        $this->_limit = $limit;
        $count = count($this->_items);
        $this->_pages = ceil($count / $limit);
        if ($limit == 1) {
            $this->_pages = 1;
        }
        if ($this->_pages > 1) {
            $this->_items = array_slice($this->_items, $this->_page * $limit, $limit);
        }
    }

    protected function drawFolderList($list)
    {
        $str = '<ul>';
        foreach ($list as $value) {
            $str .= '<li data-path="'.$value->path.'"';            
            if ($this->_parent == $value->path) {
                $str .= ' class="active"';
            }
            if (!empty($this->_breadcrumb) && in_array($value->path, $this->_breadcrumb->path)) {
                $str .= ' class="visible-branch"';
            }
            $str .= '><a href="index.php?';
            $str .= 'option=com_bagallery&view=uploader&folder='.$value->path;
            if (isset($_GET['layout']) && $_GET['layout'] == 'thubnail') {
                $str .= '&layout=thubnail';
            }
            $str .= '&tmpl=component" ><i class="zmdi zmdi-folder"></i> '.$value->name.'</a>';
            if (count($value->childs) > 0) {
                $str .= '<i class="zmdi zmdi-chevron-right"></i>';
                $str .= $this->drawFolderList($value->childs);
            }
            $str .= '</li>';
        }
        $str .= '</ul>';

        return $str;
    }

    protected function getFileSize($size)
    {
        $size = $size / 1024;
        $size = floor($size);
        if ($size >= 1024) {
            $size = $size / 1024;
            $size = floor($size);
            $size = (string)$size .' MB';
        } else {
            $size = (string)$size .' KB';
        }

        return $size;
    }

    protected function addToolBar()
    {
        $input = JFactory::getApplication()->input;
        $input->set('hidemainmenu', true);
        
    }
}