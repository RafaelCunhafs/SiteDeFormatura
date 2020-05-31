<?php
/**
* @package   BaGallery
* @author    Balbooa http://www.balbooa.com/
* @copyright Copyright @ Balbooa
* @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
*/

defined('_JEXEC') or die;


class PlgButtonBagallery extends JPlugin
{
	public function onDisplay($name)
	{
		$js = "
		function SelectGallery(id) {
				if ('jInsertEditorText' in window) {
					jInsertEditorText('[gallery ID='+id+']', '".$name."');
					SqueezeBox.close();
	                jModalClose();
				} else {
					for (var ind in Joomla.editors.instances) {
						Joomla.editors.instances[ind].replaceSelection('[gallery ID='+id+']', '".$name."');
						break;
					}
					jQuery(Joomla.currentModal).modal('hide');
				}
		  }";

		$doc = JFactory::getDocument();
		$doc->addScriptDeclaration($js);

		JHtml::_('behavior.modal');

		$link = 'index.php?option=com_bagallery&amp;view=galleries&amp;layout=modal&amp;tmpl=component&amp;' . JSession::getFormToken() . '=1';

		$button = new JObject;
		$button->set('modal', true);
		$button->set('class', 'btn');
		$button->set('link', $link);
		$button->set('text', 'Gallery');
		$button->set('name', 'picture');
		$button->set('options', "{handler: 'iframe', size: {x: 740, y: 545}}");

		return $button;
	}
}
