<?php
/**
 * @package Video Gallery Lite
 * @author Huge-IT
 * @copyright (C) 2014 Huge IT. All rights reserved.
 * @license GNU/GPLv3 http://www.gnu.org/licenses/gpl-3.0.html
 * @website		http://www.huge-it.com/
 **/ 

defined('_JEXEC') or die('Restircted access');

JError::$legacy = false;
JLoader::register('VideogalleryliteHelper', dirname(__FILE__) . '/helpers/videogallerylite.php');
$document = JFactory::getDocument();
jimport('joomla.application.component.controller');
?>
<?php
$controller = JControllerLegacy::getInstance('Videogallerylite');
$controller->execute(JFactory::getApplication()->input->get('task'));
$controller->redirect();
