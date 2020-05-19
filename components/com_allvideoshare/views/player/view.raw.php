<?php
/*
 * @version		$Id: view.raw.php 3.5.0 2020-02-25 $
 * @package		All Video Share
 * @copyright   Copyright (C) 2012-2020 MrVinoth
 * @license     GNU/GPL http://www.gnu.org/licenses/gpl-2.0.html
*/

// no direct access
defined( '_JEXEC' ) or die( 'Restricted access' );

class AllVideoShareViewPlayer extends AllVideoShareView {

    public function display( $tpl = null ) {        
        $this->app = JFactory::getApplication();        

        $this->config = AllVideoShareUtils::getConfig();

		$model = $this->getModel();

        $vid = $this->app->input->getInt( 'vid' );
        $this->video = $model->getVideo( $vid );

        $pid = $this->app->input->getInt( 'pid' );
        $this->player = $model->getPlayer( $pid );
        
        $this->license = $model->getLicense();
        
        parent::display( $tpl );		
    }    
    
    public function getTitle() {	
		$document = JFactory::getDocument();
        return $document->getTitle() . ' - ' . $this->video->title;		
    }

    public function getURL() {
        $siteURL = ( isset( $_SERVER['HTTPS'] ) ? 'https' : 'http' ) . "://" . $_SERVER['SERVER_NAME'];	
        $itemId  = $this->app->input->getInt( 'Itemid' ) ? '&Itemid=' . $this->app->input->getInt( 'Itemid' ) : '';        

        return $siteURL . JRoute::_( 'index.php?option=com_allvideoshare&view=video&slg=' . $this->video->slug . $itemId );	
    }
    
    public function hasQualitySwitcher() {	
		if ( $this->player->hddock && in_array( $this->video->type, array( 'general', 'url', 'upload' ) ) && ! empty( $this->video->hd ) ) {
			return true;
		}
		
		return false;		
    }

    public function hasAds() {
        $this->player->ad_engine = ! empty( $this->player->ad_engine ) ? $this->player->ad_engine : 'custom';

        if ( 'custom' == $this->player->ad_engine ) {
			$lang = JFactory::getLanguage();
			$locales = $lang->getLocale();
			if ( $this->player->preroll == 1 || $this->player->postroll == 1 ) {
            	$this->player->vast_url = JURI::root() . 'index.php?option=com_allvideoshare&view=ads&task=vmap&id=' . $this->player->id . '&format=xml&lang=' . $locales[4];
				return true;
			}
        } elseif ( 'vast' == $this->player->ad_engine ) {
            if ( ! empty( $this->player->vast_url ) ) {
                return true;
            }
        }

        return false;
    }

    public function getIpAddress() {
        // Whether ip is from share internet
        if ( ! empty( $_SERVER['HTTP_CLIENT_IP'] ) ) {
            $ip_address = $_SERVER['HTTP_CLIENT_IP'];
        }
        
        // Whether ip is from proxy
        elseif ( ! empty( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
            $ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'];
        }
        
        // Whether ip is from remote address
        else {
            $ip_address = $_SERVER['REMOTE_ADDR'];
        }
        
        return $ip_address;        
    }

    public function showGdprConsent() {
        if ( ! empty( $this->config->show_gdpr_consent ) && in_array( $this->video->type, array( 'youtube', 'vimeo' ) ) ) {
            // Get the cookie
            $value = $this->app->input->cookie->get( 'avs_gdpr_consent', null );

            // If there's no cookie value, manually set it
            if ( $value == null ) {
                return true;
            }            
        }

        return false;
    }
    
}