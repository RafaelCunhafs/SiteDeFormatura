<?php
defined('_JEXEC') or die;

class PlgButtonyoutuber_btn extends JPlugin{
	
	protected $autoloadLanguage = true;

	public function onDisplay($name){
		$doc = JFactory::getDocument();

		$getContent = $this->_subject->getContent($name);
		$js = "
			function mxYouTubeRBtnClick(editor){
				window.wzYoutube.init(function(_videoID){
					jInsertEditorText('[mx_youtuber type=\"video\" id=\"' + _videoID + '\" display=\"title,date,channel,description,meta\"]', editor);
					window.wzYoutube.close();
				});
			}
			";

		$doc->addScriptDeclaration($js);

		$button = new JObject;
		$button->modal = false;
		$button->class = 'btn mxYouTuberBtn';
		$button->onclick = 'mxYouTubeRBtnClick(\'' . $name . '\');return false;';
		$button->text = 'YouTubeR';
		$button->name = 'youtube';

		$button->link = '#';

		return $button;
	}
}
