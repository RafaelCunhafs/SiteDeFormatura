<?php
/**
* @package   BaGallery
* @author    Balbooa http://www.balbooa.com/
* @copyright Copyright @ Balbooa
* @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
*/

defined('_JEXEC') or die;

JHtml::_('behavior.tooltip');

if (JVERSION >= '3.4.0') {
    JHtml::_('behavior.formvalidator');
} else {
    JHtml::_('behavior.formvalidation');
}
$uploading = new StdClass();
$uploading->const = JText::_('UPLOADING_MEDIA');
$uploading->url = JUri::root();
$uploading = json_encode($uploading);
$mediaHelper = new JHelperMedia;
$language = JFactory::getLanguage();
$language->load('com_media', JPATH_ADMINISTRATOR);
$pagLimit = array(
    5 => 5,
    10 => 10,
    15 => 15,
    20 => 20,
    25 => 25,
    30 => 30,
    50 => 50,
    100 => 100,
    1 => JText::_('JALL'),
);
$galleryStateStr = bagalleryHelper::checkGalleryActivation();
$galleryState = json_decode($galleryStateStr);
?>

<link rel="stylesheet" href="components/com_bagallery/assets/css/ba-admin.css?<?php echo $this->about->version; ?>" type="text/css"/>
<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
<script src="<?php echo JUri::root(); ?>components/com_bagallery/assets/js/bootstrap.js" type="text/javascript"></script>
<script type="text/javascript">
    function makeDrag()
    {
        jQuery("tbody tr").draggable({
            cursor: 'move',
            cancel: null,
            helper: 'clone',
            revert: 'invalid',
            cursorAt: {
                left: 90,
                top: 20
            },
            handle : '.draggable-handler',
            start : function(){
                jQuery('.ba-folder-tree > ul ul').each(function(){
                    if (jQuery(this).closest('li').hasClass('visible-branch')) {
                        jQuery(this).find('> li > a').droppable('enable');
                    } else {
                        jQuery(this).find('> li > a').droppable('disable');
                    }
                })
            }
        }).disableSelection();
    }
</script>
<script src="components/com_bagallery/assets/js/ba-uploader.js?<?php echo $this->about->version; ?>"></script>
<input type="hidden" id="uploading-media" value="<?php echo htmlentities($uploading); ?>">
<input type="hidden" id="post-max-size" value="<?php echo $mediaHelper->toBytes(ini_get('post_max_size')); ?>">
<input type="hidden" id="post-max-error" value="<?php echo $language->_('COM_MEDIA_ERROR_WARNUPLOADTOOLARGE'); ?>">
<input type="hidden" id="success-upload" value="<?php echo JText::_('SUCCESS_UPLOAD'); ?>">
<div id="ba-media-manager">
    <form  target="form-target" action="<?php echo JRoute::_('index.php?option=com_bagallery&layout=uploader&id=&tmpl=component'); ?>"
        method="post" autocomplete="off" name="adminForm" id="adminForm" class="form-validate" enctype="multipart/form-data">
        <div id="create-folder-modal" class="ba-modal-sm modal hide" style="display:none">
            <div class="modal-body">
                <h3><?php echo JText::_('CREATE_FOLDER'); ?></h3>
                <input type="text" maxlength="260" name="new-folder" placeholder="<?php echo JText::_('ENTER_FOLDER_NAME') ?>">
                <span class="focus-underline"></span>
                <input type="hidden" name="current-dir" value="<?php echo $this->_parent; ?>">
            </div>
            <div class="modal-footer">
                <a href="#" class="ba-btn" data-dismiss="modal">
                    <?php echo JText::_('CANCEL') ?>
                </a>
                <a href="#" class="ba-btn-primary" id="add-folder">
                    <?php echo JText::_('JTOOLBAR_APPLY') ?>
                </a>
            </div>
        </div>
        <div id="delete-modal" class="ba-modal-sm modal hide" style="display:none">
            <div class="modal-body">
                <h3><?php echo JText::_('DELETE_ITEM'); ?></h3>
                <p><?php echo JText::_('MODAL_DELETE'); ?></p>
            </div>
            <div class="modal-footer">
                <a href="#" class="ba-btn" data-dismiss="modal">
                    <?php echo JText::_('CANCEL') ?>
                </a>
                <a href="#" class="ba-btn-primary red-btn" id="apply-delete">
                    <?php echo JText::_('DELETE') ?>
                </a>
            </div>
        </div>
        <div id="move-to-modal" class="ba-modal-md modal hide" style="display:none">
            <div class="modal-body">
                <div class="ba-modal-header">
                    <h3><?php echo JText::_('MOVE_TO'); ?></h3>
                    <i data-dismiss="modal" class="zmdi zmdi-close"></i>
                </div>
                <div class="availible-folders">
                    <ul>
                        <li data-path="<?php echo IMAGES_BASE; ?>">
                            <span>
                                <i class="zmdi zmdi-folder"></i>
                                <?php echo $this->params->get('image_path', 'images'); ?>
                            </span>                            
                        </li>
                    </ul>
                </div>
            </div>
            <div class="modal-footer">
                <a href="#" class="ba-btn" data-dismiss="modal">
                    <?php echo JText::_('CANCEL') ?>
                </a>
                <a href="#" class="ba-btn-primary apply-move">
                    <?php echo JText::_('JTOOLBAR_APPLY') ?>
                </a>
            </div>
        </div>
        <div id="rename-modal" class="ba-modal-sm modal hide" style="display:none">
            <div class="modal-body">
                <h3><?php echo JText::_('RENAME'); ?></h3>
                <input type="text" maxlength="260" class="new-name">
                <span class="focus-underline"></span>
            </div>
            <div class="modal-footer">
                <a href="#" class="ba-btn" data-dismiss="modal">
                    <?php echo JText::_('CANCEL') ?>
                </a>
                <a href="#" class="ba-btn-primary" id="apply-rename">
                    <?php echo JText::_('JTOOLBAR_APPLY') ?>
                </a>
            </div>
        </div>
        <div class ="row-fluid">
            <div class="row-fluid ba-media-header">
                <div class="span12">
                    <i class="zmdi zmdi-fullscreen media-fullscrean"></i>
                    <i class="close-media zmdi zmdi-close"></i>
                </div>
                <div class="span12">
                    <div class="uploader-nav">
                    <div class="ba-breadcrumb">
                <?php 
                    if (!empty($this->_breadcrumb)) {
                        for ($i = 0; $i < count($this->_breadcrumb->par); $i++) {
                    ?>
                    <a class="folder-list" 
                       href="index.php?option=com_bagallery&view=uploader&folder=<?php echo $this->_breadcrumb->path[$i]; ?>&tmpl=component" >
                        <?php echo $this->_breadcrumb->par[$i]; ?>
                    </a><i class="zmdi zmdi-chevron-right"></i>
                    <?php }
                        echo $this->_breadcrumb->curr;
                    }
                    if (empty($this->_parent)) {
                        echo '<a>'.$this->params->get('image_path', 'images').'</a>';
                    }

                ?>
                    </div>
                        <div class="control-toolbar">
                            <label class="media-manager-apply-wrapper">
                                <i class="zmdi zmdi-plus" id="ba-apply"></i>
                                <span class="ba-tooltip ba-top"><?php echo JText::_('INSERT_SELECTED_ITEMS'); ?></span>
                            </label>
                            <label>
                                <i class="zmdi zmdi-cloud-upload" id="show-upload"></i>
                                <span class="ba-tooltip ba-bottom"><?php echo JText::_('UPLOAD_IMAGE'); ?></span>
                            </label>
                            <label>
                                <i class="zmdi zmdi-folder" id="show-folder"></i>
                                <span class="ba-tooltip ba-bottom"><?php echo JText::_('CREATE_FOLDER'); ?></span>
                            </label>
                            <label>
                                <i class="zmdi zmdi-forward" id="move-to"></i>
                                <span class="ba-tooltip ba-bottom"><?php echo JText::_('MOVE_TO'); ?></span>
                            </label>
                            <label>
                                <i class="zmdi zmdi-delete" id="delete-items"></i>
                            </label>
                            <div class="pagination-limit">
                                <div class="ba-custom-select">
                                    <input readonly value="<?php echo $pagLimit[$this->_limit]; ?>"
                                       data-value="<?php echo $this->_limit; ?>"
                                       size="<?php echo strlen($this->_limit); ?>" type="text">
                                    <i class="zmdi zmdi-caret-down"></i>
                                    <ul>
                                        <?php
                                        foreach ($pagLimit as $key => $lim) {
                                            $str = '<li data-value="'.$key.'">';
                                            if ($key == $this->_limit) {
                                                $str .= '<i class="zmdi zmdi-check"></i>';
                                            }
                                            $str .= $lim.'</li>';
                                            echo $str;
                                        }
                                        ?>
                                    </ul>
                                    <a href="<?php echo 'index.php?option=com_bagallery&view=uploader&folder='.$this->_parent.'&tmpl=component&page=0'; ?>" style="display: none;"></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row-fluid ba-media-manager">
                <div class="ba-folder-tree" style="width: 30%;">
                    <?php echo $this->_list; ?>
                </div>
                <div class="ba-work-area" style="width: 70%;">
                    <div class="table-head">
                        <div class="files-name">
                            <input type="checkbox" name="ba-rm[]" value="" id="check-all">
                            <i class="zmdi zmdi-check-circle check-all"></i>
                            <?php echo JText::_('NAME'); ?>
                        </div>
                        <div class="files-size">
                            <?php echo JText::_('FILE_SIZE'); ?>
                        </div>
                    </div>
                    <div>
                        <table class="ba-items-list">
                            <tbody>
                                <?php
                                $img = JUri::root().'administrator/index.php?option=com_bagallery';
                                $img .= '&layout=uploader&task=uploader.showImage&time='.(strtotime('now')).'&image=';
                                foreach ($this->_items as $item) {
                                    if (!isset($item->size)) { ?>
                                <tr>
                                    <td class="select-td">
                                        <input class="select-item" type="checkbox" name="ba-rm[]" value="<?php echo $item->name; ?>">
                                        <div class="folder-icons">
                                            <a href="index.php?option=com_bagallery&view=uploader&folder=<?php echo $item->path; ?>&tmpl=component" class="zmdi zmdi-folder"></a>
                                            <i class="zmdi zmdi-circle-o"></i>
                                            <i class="zmdi zmdi-check"></i>
                                        </div>
                                    </td>
                                    <td class="draggable-handler">
                                        <a class="folder-list" 
                                           href="index.php?option=com_bagallery&view=uploader&folder=<?php echo $item->path; ?>&tmpl=component" >
                                            <?php echo $item->name; ?></a>
                                    </td>
                                    <td class="draggable-handler">
                                    </td>
                                </tr>
                                <?php
                                    } else { ?>
                                <tr class="ba-images" data-ext="<?php echo $item->ext; ?>">
                                    <td class="select-td">
                                        <div class="ba-image">
                                            <img data-src="<?php echo $img.$item->path; ?>">
                                            <input class="select-item" type="checkbox" name="ba-rm[]" value="<?php echo $item->name; ?>">
                                            <input type="hidden" value="<?php echo htmlentities(json_encode($item)); ?>" class="ba-obj">
                                            <i class="zmdi zmdi-circle-o"></i>
                                            <i class="zmdi zmdi-check"></i>
                                        </div>
                                    </td>
                                    <td class="draggable-handler">
                                        <?php echo $item->name; ?>
                                    </td>
                                    <td class="draggable-handler">
                                        <?php echo $this->getFileSize($item->size); ?>
                                    </td>
                                </tr>
                                <?php
                                    }
                                }
                                ?>                                
                            </tbody>
                        </table>
                    </div>
                    <?php
                    if ($this->_pages > 1) {
                        $prev = $this->_page - 1
                    ?>
                    <div class="pagination">
                        <ul class="pagination-list">
                            <li class="<?php echo ($this->_page == 0) ? 'disabled' : ''; ?>">
                                <a href="<?php echo $this->_page > 0 ? 'index.php?option=com_bagallery&view=uploader&folder='.$this->_parent.'&tmpl=component&page=0&ba_limit='.$this->_limit : ''; ?>">
                                    <span class="icon-first"></span>
                                </a>
                            </li>
                            <li class="<?php echo ($this->_page == 0) ? 'disabled' : ''; ?>">
                                <a href="<?php echo $this->_page > 0 ? 'index.php?option=com_bagallery&view=uploader&folder='.$this->_parent.'&tmpl=component&page='.$prev.'&ba_limit='.$this->_limit : ''; ?>">
                                    <span class="icon-previous"></span>
                                </a>
                            </li>
                    <?php
                        $start = 0;
                        $max = $this->_pages;
                        if ($this->_page > 2 && $this->_pages > 4) {
                            $start = $this->_page - 2;
                        }
                        if ($this->_pages > 4 && ($this->_pages - $this->_page) < 3) {
                            $start = $this->_pages - 5;
                        }
                        if ($this->_pages > $this->_page + 2) {
                            $max = $this->_page + 3;
                            if ($this->_pages > 4 && $this->_page < 2) {
                                $max = 5;
                            }
                        }
                        for ($i = $start; $i < $max; $i++) { ?>
                            <li class="<?php echo ($this->_page == $i) ? 'active' : ''; ?>">
                                <?php 
                                $numb = $i + 1;
                                ?>
                                <a href="<?php echo $this->_page != $i ? 'index.php?option=com_bagallery&view=uploader&folder='.$this->_parent.'&tmpl=component&page='.$i.'&ba_limit='.$this->_limit : ''; ?>"><?php echo $numb; ?></a>
                            </li>
                    <?php
                        }
                        $next = $this->_page + 1;
                        $end = $this->_pages - 1
                    ?>
                            <li class="<?php echo ($this->_page == $end) ? 'disabled' : ''; ?>">
                                <a href="<?php echo $this->_page < $end ? 'index.php?option=com_bagallery&view=uploader&folder='.$this->_parent.'&tmpl=component&page='.$next.'&ba_limit='.$this->_limit : ''; ?>">
                                    <span class="icon-next"></span>
                                </a>
                            </li>
                            <li class="<?php echo ($this->_page == $end) ? 'disabled' : ''; ?>">
                                <a href="<?php echo $this->_page < $end ? 'index.php?option=com_bagallery&view=uploader&folder='.$this->_parent.'&tmpl=component&page='.$end.'&ba_limit='.$this->_limit : ''; ?>">
                                    <span class="icon-last"></span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <?php
                    }                    
                    ?>
                </div>
            </div>
        </div>
        <div class="ba-context-menu empty-context-menu" style="display: none">
            <span class="upload-file ba-group-element"><i class="zmdi zmdi-cloud-upload"></i><?php echo JText::_('UPLOAD_IMAGE'); ?></span>
            <span class="create-folder"><i class="zmdi zmdi-folder"></i><?php echo JText::_('CREATE_FOLDER'); ?></span>
        </div>
        <div class="ba-context-menu files-context-menu" style="display: none">
<?php
        if ($this->about->tag == 'pro' && isset($galleryState->data)) {
?>
            <span class="edit-image"><i class="zmdi zmdi-camera-alt"></i><?php echo JText::_('PHOTO_EDITOR'); ?></span>
<?php
        }
?>
            <span class="rename"><i class="zmdi zmdi-edit"></i><?php echo JText::_('RENAME'); ?></span>
            <span class="move-to"><i class="zmdi zmdi-forward"></i><?php echo JText::_('MOVE_TO'); ?>...</span>
            <span class="download"><i class="zmdi zmdi-download"></i><?php echo JText::_('DOWNLOAD'); ?></span>
            <span class="delete ba-group-element"><i class="zmdi zmdi-delete"></i><?php echo JText::_('DELETE'); ?></span>
        </div>
        <div class="ba-context-menu folders-context-menu" style="display: none">
            <span class="rename"><i class="zmdi zmdi-edit"></i><?php echo JText::_('RENAME'); ?></span>
            <span class="move-to"><i class="zmdi zmdi-forward"></i><?php echo JText::_('MOVE_TO'); ?>...</span>
            <span class="delete ba-group-element"><i class="zmdi zmdi-delete"></i><?php echo JText::_('DELETE'); ?></span>
        </div>
        <input type="hidden" name="task" value="gallery.uploader" />
        <?php echo JHtml::_('form.token'); ?>
    </form>
</div>
<iframe id="form-target" name="form-target" style="display: none;"></iframe>
<div id="file-upload-form" style="display: none;">
    <form target="file-upload-form-target" enctype="multipart/form-data" method="post"
        action="<?php echo JUri::base(); ?>index.php?option=com_bagallery&task=uploader.formUpload">
        <input type="file" multiple name="files[]">
        <input type="hidden" name="current_folder" value="">
    </form>
    <iframe src="javascript:''" name="file-upload-form-target"></iframe>
</div>