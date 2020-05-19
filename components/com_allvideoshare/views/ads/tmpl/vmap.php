<?php
/*
 * @version		$Id: default.php 3.5.0 2020-02-25 $
 * @package		All Video Share
 * @copyright   Copyright (C) 2012-2020 MrVinoth
 * @license     GNU/GPL http://www.gnu.org/licenses/gpl-2.0.html
*/

// no direct access
defined( '_JEXEC' ) or die( 'Restricted access' );
$lang = JFactory::getLanguage();
$locales = $lang->getLocale();
?>

<vmap:VMAP xmlns:vmap="http://www.iab.net/videosuite/vmap" version="1.0">
  <?php if ( ! empty( $this->player->hasPreroll ) ) : ?>
    <vmap:AdBreak timeOffset="start" breakType="linear" breakId="preroll">
      <vmap:AdSource id="preroll-ad" allowMultipleAds="false" followRedirects="true">
        <vmap:AdTagURI templateType="vast3">
          <![CDATA[ <?php echo JURI::root(); ?>index.php?option=com_allvideoshare&view=ads&task=vast&id=<?php echo $this->player->prerollId; ?>&format=xml&lang=<?php echo $locales[4]; ?> ]]>
        </vmap:AdTagURI>
      </vmap:AdSource>
    </vmap:AdBreak>
  <?php endif; ?>

  <?php if ( ! empty( $this->player->hasPostroll ) ) : ?>
    <vmap:AdBreak timeOffset="end" breakType="linear" breakId="postroll">
      <vmap:AdSource id="postroll-ad" allowMultipleAds="false" followRedirects="true">
        <vmap:AdTagURI templateType="vast3">
          <![CDATA[ <?php echo JURI::root(); ?>index.php?option=com_allvideoshare&view=ads&task=vast&id=<?php echo $this->player->postrollId; ?>&format=xml&lang=<?php echo $locales[4]; ?> ]]>
        </vmap:AdTagURI>
      </vmap:AdSource>
    </vmap:AdBreak>
  <?php endif; ?>
</vmap:VMAP>