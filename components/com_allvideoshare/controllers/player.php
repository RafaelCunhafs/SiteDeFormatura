<?php
/*
 * @version		$Id: player.php 3.5.0 2020-02-25 $
 * @package		All Video Share
 * @copyright   Copyright (C) 2012-2020 MrVinoth
 * @license     GNU/GPL http://www.gnu.org/licenses/gpl-2.0.html
*/

// no direct access
defined( '_JEXEC' ) or die( 'Restricted access' );

class AllVideoShareControllerPlayer extends AllVideoShareController {
	
	public function player() {	
		$model = $this->getModel( 'player' );
		
	    $view = $this->getView( 'player', 'raw' );	
        $view->setModel( $model, true );
		$view->setLayout( 'default' );
		$view->display();
	}

	public function gdpr() {
		$model = $this->getModel( 'player' );
		$model->gdpr();
	}
			
}