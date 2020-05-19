<?php
/*
 * @version		$Id: controller.php 3.5.0 2020-02-25 $
 * @package		All Video Share
 * @copyright   Copyright (C) 2012-2020 MrVinoth
 * @license     GNU/GPL http://www.gnu.org/licenses/gpl-2.0.html
*/

// no direct access
defined( '_JEXEC' ) or die( 'Restricted access' );

jimport( 'joomla.application.component.controller' );

class AllVideoShareController extends JControllerLegacy {
	
	public function display( $cachable = false, $urlparams = array() ) {
		parent::display( $cachable, $urlparams );
	}
		
}