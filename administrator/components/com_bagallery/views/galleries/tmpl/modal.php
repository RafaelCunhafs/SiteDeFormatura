<?php
/**
* @package   BaGallery
* @author    Balbooa http://www.balbooa.com/
* @copyright Copyright @ Balbooa
* @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
*/

defined('_JEXEC') or die;

JHtml::_('behavior.tooltip');
JHtml::_('behavior.framework', true);

?> 
<link rel="stylesheet" href="components/com_bagallery/assets/css/ba-admin.css" type="text/css"/>
<script src="<?php echo JUri::root(); ?>components/com_bagallery/assets/js/bootstrap.js" type="text/javascript"></script>
<input type="hidden" class="constant-all" value="<?php echo JText::_('ALL'); ?>">
<div class="modal-shortcode">
    <form
    action="<?php echo JRoute::_('index.php?option=com_bagallery&view=galleries&layout=modal&tmpl=component&function=SelectGallery'); ?>"
    method="post" name="adminForm" id="adminForm" class="form-inline">
        <fieldset id="modal-filter">
            <input type="text" name="filter_search" placeholder="Enter gallery name" id="filter_search"
            value="<?php echo $this->escape($this->state->get('filter.search')); ?>"/>
            <i class="zmdi zmdi-search"></i>
            <button type="submit" class="ba-btn"><?php echo JText::_('JSEARCH_FILTER_SUBMIT'); ?></button>    
        </fieldset>
        <div class="gallery-table">
            <table class="gallery-list">
                <thead>
                    <tr>
                        <th><?php echo JText::_('GALLERIES'); ?></th>
                        <th><?php echo JText::_('CATEGORY'); ?></th>
                        <th><?php echo JText::_('ID'); ?></th>
                    </tr>
                </thead>
                <tbody>
                <?php foreach ($this->items as $i => $item) { ?>
                    <tr>
                        <th class="gallery-title">
                            <a href="#" data-id="<?php echo $item->id; ?>"><?php echo $item->title; ?></a>
                        </th>
                        <td>
                            <a href="#"  class="gallery-category" data-category=""><?php echo JText::_('ALL'); ?></a>
                        </td>
                        <td><?php echo $item->id; ?></td>
                    </tr>
                <?php } ?>
                </tbody>
            </table>
        </div>
    </form>
    <div>
      <input type="hidden" name="task" value="" />
      <input type="hidden" name="boxchecked" value="0" />
      <?php echo JHtml::_('form.token'); ?>
    </div>
</div>
<div id="category-dialog" class="modal hide ba-modal-md" style="display:none">
    <div class="modal-body">
        <table>
            <thead>
                <th></th>
                <th><?php echo JText::_('CATEGORY'); ?></th>
                <th><?php echo JText::_('ID'); ?></th>
            </thead>
            <tbody></tbody>
        </table>
    </div>
</div>
<script type="text/javascript">
    var category;
    jQuery('.gallery-title a').on('click', function(e){
        e.preventDefault();
        var id = jQuery(this).attr('data-id'),
            cat = jQuery(this).closest('tr').find('.gallery-category').attr('data-category');
        if (window.parent) {
            window.parent.SelectGallery(id+cat);
        }
    });
    jQuery('#category-dialog').find('tbody').on('click', 'tr', function(){
        var id = jQuery(this).attr('data-id'),
            title = jQuery(this).find('.title').text();
        category.attr('data-category', id);
        category.text(title);
        jQuery('#category-dialog').modal('hide')
    });
    jQuery('.gallery-category').on('click', function(e){
        e.preventDefault();
        category = jQuery(this);
        var id = jQuery(this).closest('tr').find('.gallery-title a').attr('data-id'),
            cat = jQuery(this).attr('data-category');
        jQuery.ajax({
            type : "POST",
            dataType : 'text',
            url : "index.php?option=com_bagallery&task=galleries.getCategories&tmpl=component",
            data : {
                gallery : id,
            },
            success: function(msg){
                msg = JSON.parse(msg);
                var str = '<tr data-id=""><td  class="checkbox"';
                str += '><input type="radio"';
                if (!cat) {
                    str += ' checked';
                }
                str += '><i class="zmdi zmdi-circle-o"></i>';
                str += '<i class="zmdi zmdi-check"></i></td><td class="title">'+jQuery('.constant-all').val();
                str += '</td><td></td></tr>';
                msg.forEach(function(el){
                    var settings = el.settings.split(';');
                    if (settings[3] != '*') {
                        str += '<tr data-id=" category ID='+el.id+'"><td';
                        str += ' class="checkbox"><input type="radio"';
                        if (cat == ' category ID='+el.id) {
                            str += ' checked';
                        }
                        str += '><i class="zmdi zmdi-circle-o"></i>';
                        str += '<i class="zmdi zmdi-check"></i></td><td class="title">'+el.title+'</td><td>'+el.id+'</td></tr>';
                    }
                });
                jQuery('#category-dialog').find('tbody').html(str);
                jQuery('#category-dialog').modal();
            }
        });
    });
</script>