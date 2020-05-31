<?php
/**
* @package   BaGallery
* @author    Balbooa http://www.balbooa.com/
* @copyright Copyright @ Balbooa
* @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
*/

defined('_JEXEC') or die;

if (!function_exists('mb_strtolower')) {
    function mb_strtolower($str, $encoding = 'utf-8')
    {
        return strtolower($str);
    }
}

abstract class bagalleryHelper 
{
    public static function cleanup()
    {
        jimport('joomla.filesystem.folder');
        jimport('joomla.filesystem.file');
        $dir = THUMBNAILS_BASE.'/bagallery/original/';
        $db = JFactory::getDbo();
        if (JFolder::exists($dir)) {
            $images = JFolder::files($dir);
            foreach ($images as $image) {
                $name = '%bagallery/original/'.$image;
                $name1 = '%bagallery/original//'.$image;
                $query = $db->getQuery(true);
                $query->select('COUNT(id)')
                    ->from('`#__bagallery_items`')
                    ->where('`path` like '.$db->quote($name).' OR `path` like '.$db->quote($name1));
                $db->setQuery($query);
                $count = $db->loadResult();
                if ($count == 0) {
                    $name .= '%';
                    $query = $db->getQuery(true);
                    $query->select('COUNT(id)')
                        ->from('`#__bagallery_category`')
                        ->where('`settings` like '.$db->quote($name).' OR `settings` like '.$db->quote($name1));
                    $db->setQuery($query);
                    $count = $db->loadResult();
                    if ($count == 0) {
                        JFile::delete($dir.$image);
                    }
                }
            }
        }
    }

    public static function getGalleryLanguage()
    {
        $language = JFactory::getLanguage();
        $paths = $language->getPaths('com_bagallery');
        $result = array();
        foreach ($paths as $key => $value) {
            if (JFile::exists($key)) {
                $contents = JFile::read($key);
                $contents = str_replace('_QQ_', '"\""', $contents);
                $data = parse_ini_string($contents);
                foreach ($data as $ind => $value) {
                    $result[$ind] = JText::_($ind);
                }
            }
        }
        $data = 'var galleryLanguage = '.json_encode($result).';';

        return $data;
    }

    public static function imageSave($type) {
        switch ($type) {
            case 'png':
                $imageSave = 'imagepng';
                break;
            case 'gif':
                $imageSave = 'imagegif';
                break;
            default:
                $imageSave = 'imagejpeg';
        }

        return $imageSave;
    }

    public static function imageCreate($type) {
        switch ($type) {
            case 'png':
                $imageCreate = 'imagecreatefrompng';
                break;
            case 'gif':
                $imageCreate = 'imagecreatefromgif';
                break;
            default:
                $imageCreate = 'imagecreatefromjpeg';
        }

        return $imageCreate;
    }

    public static function aboutUs()
    {
        $db = JFactory::getDbo();
        $query = $db->getQuery(true);
        $query->select("manifest_cache");
        $query->from("#__extensions");
        $query->where("type=" .$db->quote('component'))
            ->where('element=' .$db->quote('com_bagallery'));
        $db->setQuery($query);
        $cache = $db->loadResult();
        $about = json_decode($cache);
        $xml = simplexml_load_file(JPATH_ROOT.'/administrator/components/com_bagallery/bagallery.xml');
        $about->tag = (string)$xml->tag;

        return $about;
    }

    public static function getJoomlaCheckboxes($name, $form)
    {
        $input = $form->getField($name);
        $value = $form->getValue($name);
        if ($value === null) {
            $value = $form->getFieldAttribute($name, 'default');
        }
        $class = !empty($input->class) ? ' class="' . $input->class . '"' : '';
        $checked = $input->checked || $value == 1 ? ' checked' : '';
        
        return '<input type="checkbox" name="'.$input->name.'" id="'.$input->id.'" value="1"'.$class.$checked.'>';
    }

    public static function getAccess()
    {
        $db = JFactory::getDbo();
        $query = $db->getQuery(true);
        $query->select('id, title')
            ->from('#__viewlevels')
            ->order($db->quoteName('ordering') . ' ASC')
            ->order($db->quoteName('title') . ' ASC');
        $db->setQuery($query);
        $array = $db->loadObjectList();
        $access = array();
        foreach ($array as $value) {
            $access[$value->id] = $value->title;
        }

        return $access;
    }

    public static function checkGalleryState()
    {
        $db = JFactory::getDbo();
        $query = $db->getQuery(true)
            ->select('`key`')
            ->from('#__bagallery_api')
            ->where('service = '.$db->quote('balbooa'));
        $db->setQuery($query);
        $balbooa = $db->loadResult();
        if (empty($balbooa)) {
            $obj = new stdClass();
            $obj->key = $balbooa = '{}';
            $obj->service = 'balbooa';
            $db->insertObject('#__bagallery_api', $obj);
            $obj = new stdClass();
            $obj->key = $balbooa = '{}';
            $obj->service = 'balbooa_activation';
            $db->insertObject('#__bagallery_api', $obj);
        }

        return $balbooa;
    }

    public static function checkGalleryActivation()
    {
        $db = JFactory::getDbo();
        $query = $db->getQuery(true)
            ->select('`key`')
            ->from('#__bagallery_api')
            ->where('service = '.$db->quote('balbooa_activation'));
        $db->setQuery($query);
        $balbooa = $db->loadResult();

        return $balbooa;
    }

    public static function setAppLicense($data)
    {
        $db = JFactory::getDbo();
        $query = $db->getQuery(true)
            ->select('*')
            ->from('#__bagallery_api')
            ->where('service = '.$db->quote('balbooa'));
        $db->setQuery($query);
        $balbooa = $db->loadObject();
        $balbooa->key = json_decode($balbooa->key);
        $balbooa->key->data = $data;
        $balbooa->key = json_encode($balbooa->key);
        $db->updateObject('#__bagallery_api', $balbooa, 'id');
        $query = $db->getQuery(true)
            ->select('*')
            ->from('#__bagallery_api')
            ->where('service = '.$db->quote('balbooa_activation'));
        $db->setQuery($query);
        $balbooa = $db->loadObject();
        $balbooa->key = '{"data":"active"}';
        $db->updateObject('#__bagallery_api', $balbooa, 'id');
    }
    
    public static function getContentsCurl($url)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_URL, $url);
        $data = curl_exec($ch);
        curl_close($ch);
        
        return $data;
    }

    public static function replaceFilename($str)
    {
        $search = array('?', '!', '.', ',', ':', ';', '*', '(', ')', '{', '}', '***91;', '&', '<', '>',
            '***93;', '%', '#', '№', '@', '$', '^', '-', '+', '/', '\\', '=','|', '"', '\'');
        $str = str_replace($search, ' ', $str);
        $str = preg_replace('/\s+/', ' ', $str);
        $search = array('а', 'б', 'в', 'г', 'д', 'е', 'ё', 'з', 'и', 'й',
            'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ъ',
            'ы', 'э', ' ', 'ж', 'ц', 'ч', 'ш', 'щ', 'ь', 'ю', 'я', 'А', 'Б',
            'В', 'Г', 'Д', 'Е', 'Ё', 'З', 'И', 'Й',
            'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Ч', 'Ъ',
            'Ы', 'Э', 'Ж', 'Ц', 'Ч', 'Ш', 'Щ', 'Ь', 'Ю', 'Я');
        $replace = array('a', 'b', 'v', 'g', 'd', 'e', 'e', 'z', 'i', 'y', 'k', 'l', 'm', 'n',
            'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'j', 'i', 'e', '-', 'zh', 'ts',
            'ch', 'sh', 'shch', '', 'yu', 'ya', 'A', 'B', 'V', 'G', 'D', 'E', 'E', 'Z', 'I', 'Y', 'K', 'L', 'M', 'N',
            'O', 'P', 'R', 'S', 'T', 'U', 'F', 'H', 'J', 'I', 'E', 'Zh', 'Ts',
            'Ch', 'Sh', 'Shch', '', 'Yu', 'Ya');
        $str = str_replace($search, $replace, $str);
        $str = trim($str);
        $str = preg_replace("/_{2,}/", "-", $str);

        return $str;
    }

    public static function replace($str)
    {
        $str = mb_strtolower($str, 'utf-8');
        $search = array('?', '!', '.', ',', ':', ';', '*', '(', ')', '{', '}', '***91;',
            '***93;', '%', '#', '№', '@', '$', '^', '-', '+', '/', '\\', '=',
            '|', '"', '\'', 'а', 'б', 'в', 'г', 'д', 'е', 'ё', 'з', 'и', 'й',
            'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ъ',
            'ы', 'э', ' ', 'ж', 'ц', 'ч', 'ш', 'щ', 'ь', 'ю', 'я');
        $replace = array('-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-',
            '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-',
            'a', 'b', 'v', 'g', 'd', 'e', 'e', 'z', 'i', 'y', 'k', 'l', 'm', 'n',
            'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'j', 'i', 'e', '-', 'zh', 'ts',
            'ch', 'sh', 'shch', '', 'yu', 'ya');
        $str = str_replace($search, $replace, $str);
        $str = trim($str);
        $str = preg_replace("/_{2,}/", "-", $str);

        return $str;
    }

    public static function increment($string)
    {
        if (preg_match('#\((\d+)\)$#', $string, $matches)) {
            $n = $matches[1] + 1;
            $string = preg_replace('#\(\d+\)$#', sprintf('(%d)', $n), $string);
        } else {
            $n = 2;
            $string .= sprintf(' (%d)', $n);
        }

        return $string;
    }

    public static function getAlias($alias, $table, $name = 'lightboxUrl', $id = 0)
    {
        jimport('joomla.filter.output');
        $alias = self::replace($alias);
        $alias = JFilterOutput::stringURLSafe($alias);
        $db = JFactory::getDbo();
        $query = $db->getQuery(true);
        $query->select('id')
            ->from($table)
            ->where($db->quoteName($name).' = '.$db->Quote($alias))
            ->where('`id` <> ' .$db->Quote($id));
        $db->setQuery($query);
        $id = $db->loadResult();
        if (!empty($id)) {
            $alias = self::increment($alias);
            $alias = self::getAlias($alias, $table, $name);
        }
        return $alias;
    }
}