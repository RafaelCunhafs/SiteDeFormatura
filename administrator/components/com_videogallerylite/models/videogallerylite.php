<?php 
/**
 * @package Video Gallery Lite
 * @copyright (C) 2014 Huge IT. All rights reserved.
 * @license GNU/GPLv3 http://www.gnu.org/licenses/gpl-3.0.html
 * @website     http://www.huge-it.com/
 **/

defined('_JEXEC') or die('Restircted access');
jimport('joomla.application.component.modeladmin');
jimport('joomla.application.component.helper');

class VideogalleryliteModelVideogallerylite  extends JModelAdmin {

    public function getTable($type = 'Videogallerylite', $prefix = 'VideogalleryliteTable', $config = array()) {
        return JTable::getInstance($type, $prefix, $config);
    }

    public function getForm($data = array(), $loadData = true) {

        $form = $this->loadForm(
                $this->option . '.videogallerylite', 'videogallerylite', array('control' => 'jform', 'load_data' => $loadData)
        );

        if (empty($form)) {
            return false;
        }

        return $form;
    }

    protected function loadFormData() {
        $data = JFactory::getApplication()->getUserState($this->option . '.editvideogallerylite.data', array());
        if (empty($data)) {
            $data = $this->getItem();
        }
        return $data;
    }

    public function getVideoGallery() {
        $db = JFactory::getDBO();
        $query = $db->getQuery(true);
        $query->select('*');
        $query->from('#__huge_it_videogallery_galleries');
        $db->setQuery($query);
        $results = $db->loadObjectList();
        return $results;
    }

    public function getPropertie() {
        $db = JFactory::getDBO();
        $id_cat = intval(JRequest::getVar('id'));
        $query = $db->getQuery(true);
        $query->select('#__huge_it_videogallery_videos.name as name,'
                . '#__huge_it_videogallery_videos.id ,'
                . '#__huge_it_videogallery_galleries.name as portName,'
                . 'videogallery_id, #__huge_it_videogallery_videos.description as description,image_url,sl_url,sl_type,link_target,#__huge_it_videogallery_videos.ordering,#__huge_it_videogallery_videos.published,published_in_sl_width');
        $query->from(array('#__huge_it_videogallery_galleries' => '#__huge_it_videogallery_galleries', '#__huge_it_videogallery_videos' => '#__huge_it_videogallery_videos'));
        $query->where('#__huge_it_videogallery_galleries.id = videogallery_id')->where('videogallery_id=' . $id_cat);
        $query->order('ordering asc');
        $db->setQuery($query);
        $results = $db->loadObjectList();
        return $results;
    }

    public function getImageByID() {
        $db = JFactory::getDBO();
        $id_cat = intval(JRequest::getVar('id'));
        $query = $db->getQuery(true);
        $query->select('*');
        $query->from('#__huge_it_videogallery_videos');
        $query->where('videogallery_id=' . $id_cat);
        $db->setQuery($query);
        $results = $db->loadObjectList();
        return $results;
    }

   public function save($data) {
        $db = JFactory::getDBO();       
        $result = $this->getPropertie();
        $this->updarteGallery();
        $this->selectStyle();
        foreach ($result as $key => $value) {
            $imageId = $value->id;
            $titleimage = $db->escape($data['titleimage' . $imageId]);
            $im_description1 = $data['im_description'. $imageId];
            $im_description = $db->escape($im_description1);
            $sl_url = $db->escape($data['sl_url'. $imageId]);
            $sl_link_target = $db->escape($data['sl_link_target'. $imageId]);
            $ordering = $data['order_by_'. $imageId];
            $image_url = $db->escape($data['image_url'. $imageId]);
            $query = $db->getQuery(true);
            $query->update('#__huge_it_videogallery_videos')->set('name="' . $titleimage . '"')->set('description="' . $im_description . '"')
                    ->set('sl_url="' . $sl_url . '"')->set('link_target="' . $sl_link_target . '"')
                    ->set('ordering="' . $ordering . '"')->set('image_url="' . $image_url . '"')->where('id="' . $imageId . '"') ;
            $db->setQuery($query);
            $db->execute();
            
        }      
        
    }

    function updarteGallery() {
        $db = JFactory::getDBO();
        $data = JRequest::get('post');
        $name = $db->escape($data['name']);
        $huge_it_sl_effects = $data['huge_it_sl_effects'];
        $sl_width = (isset($data['sl_width']) ? $data['sl_width'] : "");
        $sl_height = (isset($data['sl_height']) ? $data['sl_height'] : "");
        $pause_on_hover = (isset($data['pause_on_hover']) ? $data['pause_on_hover'] : "");
        $pause_on_hover_new = (isset($data['pause_on_hover_new']) ? $data['pause_on_hover_new'] : "");
        $autoslide = (isset($data['name3']) ? $data['name3'] : "");
        $sl_pausetime = (isset($data['name1']) ? $data['name1'] : "" );
        $sl_changespeed = (isset($data['name2']) ? $data['name2'] : "");
        $sl_position = (isset($data['sl_position']) ? $sl_position = $data['sl_position'] : $sl_position = "");
        $display_type = $data['display_type'];
        $content_per_page = $data['content_per_page'];
        $videogallery_list_effects_s = (isset($data['videogallery_list_effects_s']) ? $videogallery_list_effects_s = $data['videogallery_list_effects_s'] : $videogallery_list_effects_s = "");
        $id_cat = intval(JRequest::getVar('id'));

        $query = $db->getQuery(true);
        $query->update('#__huge_it_videogallery_galleries')->set('name ="' . $name . '"')
            ->set('sl_width ="' . $sl_width . '"')
            ->set('sl_height ="' . $sl_height . '"')
            ->set('pause_on_hover ="' . $pause_on_hover . '"')
            ->set('pause_on_hover_new ="' . $pause_on_hover_new . '"')
            ->set('autoslide ="' . $autoslide . '"')
            ->set('description ="' . $sl_pausetime . '"')
            ->set('param ="' . $sl_changespeed . '"')
            ->set('sl_position ="' . $sl_position . '"')
            ->set('huge_it_sl_effects="' . $huge_it_sl_effects . '"')
            ->set('videogallery_list_effects_s="' . $videogallery_list_effects_s . '"')
            ->set('display_type="' . $display_type . '"')
            ->set('content_per_page="' . $content_per_page . '"')
            ->where('id="' . $id_cat . '"');
        $db->setQuery($query);
        $db->execute();
    }

    function selectStyle() {
        $db = JFactory::getDBO();
        $data = JRequest::get('post');
        $styleName = $data['videogallery_list_effects_s'];
        $id_cat = intval(JRequest::getVar('id'));
        $query = $db->getQuery(true);
        $query->update('#__huge_it_videogallery_galleries')->set('videogallery_list_effects_s ="' . $styleName . '"')->where('id="' . $id_cat . '"');
        $db->setQuery($query);
        $db->execute();
    }

       public function saveCat() {
        $db = JFactory::getDBO();
        $query = $db->getQuery(true);
        $query->insert('#__huge_it_videogallery_galleries', 'id')->set('name = "New Gallery"')
                ->set('sl_height = 375')
                ->set('sl_width = 600')
                ->set('pause_on_hover = "on"')
                ->set('videogallery_list_effects_s = "cubeH"')
                ->set('description=4000')
                ->set('param = 1000')
                ->set('sl_position = "left"');
        $db->setQuery($query);
        $db->execute();
        return $db->insertid();
    }
    
    
    private function getNumber($videogalleryId) {
        $db = JFactory::getDBO();
        $query = $db->getQuery(true);
        $query->select('max(ordering) as maximum');
        $query->from('#__huge_it_videogallery_videos');
        $query->where('videogallery_id=' . $videogalleryId);
        $db->setQuery($query);
        $results = $db->loadResult();
        return $results;        
    }
    
    function saveProject($imageUrl, $galleryId) {
        $imageUrl = $imageUrl;
        $db = JFactory::getDBO();
        $query = $db->getQuery(true);
        
        $ordering = $this->getNumber($galleryId) + 1;
        $query->insert('#__huge_it_videogallery_videos', 'id')->set('videogallery_id = "' . $galleryId . '"')
                ->set('image_url= "' . $imageUrl . '"')
                ->set('sl_type= "image"')
                ->set('ordering= "'.$ordering.'"');
        $db->setQuery($query);
        $db->execute();
        return $galleryId;
    }

    public function deleteProject() {
        $id_cat = intval(JRequest::getVar('removeslide'));
        $id = intval(JRequest::getVar('id'));
        $db = JFactory::getDBO();
        $query = $db->getQuery(true);
        $query->delete('#__huge_it_videogallery_videos')->where('id =' . $id_cat);
        $db->setQuery($query);
        $db->execute();
        return;
    }
}
