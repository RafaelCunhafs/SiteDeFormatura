<?php
/*
 * @version		$Id: playlist.php 3.5.0 2020-02-25 $
 * @package		All Video Share
 * @copyright   Copyright (C) 2012-2020 MrVinoth
 * @license     GNU/GPL http://www.gnu.org/licenses/gpl-2.0.html
*/

// no direct access
defined( '_JEXEC' ) or die( 'Restricted access' );

class AllVideoShareControllerPlayList extends AllVideoShareController {
	
	public function playlist()	{	
		
        $model = $this->getModel( 'playlist' );
		$model->buildXml();
		
	}
			
}