<?php
/*
 * @version		$Id: helper.php 3.5.0 2020-02-25 $
 * @package		All Video Share
 * @copyright   Copyright (C) 2012-2020 MrVinoth
 * @license     GNU/GPL http://www.gnu.org/licenses/gpl-2.0.html
*/
 
// no direct access
defined( '_JEXEC' ) or die( 'Restricted access' );

class AllVideoSharePlayerHelper {   
	
	public static function getVideoId( $params ) {
			
		$videoId = $params->get( 'videoid' );	
		
		if ( 'latest' == $videoId || 'popular' == $videoId ) {

        	$db = JFactory::getDBO();
		
			$query = "SELECT id FROM #__allvideoshare_videos WHERE published=1";
			switch( $videoId ) {
		 		case 'latest' :
		 			$query .= " ORDER BY id DESC LIMIT 1";
					break;
				case 'popular' :
					$query .= " ORDER BY views DESC LIMIT 1";
					break;
			}
        	$db->setQuery( $query );
        	$videoId = $db->loadResult();
		
		}
		
		return (int) $videoId;
		
	}	
		
}