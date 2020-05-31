<?php
/**
* @package   BaGallery
* @author    Balbooa http://www.balbooa.com/
* @copyright Copyright @ Balbooa
* @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
*/

defined('_JEXEC') or die;

jimport('joomla.application.component.controllerform');
jimport('joomla.filesystem.folder');
jimport('joomla.filesystem.file');

class BagalleryControllerUploader extends JControllerForm
{
    public function checkFileExists()
    {
        $content = file_get_contents('php://input');
        $obj = json_decode($content);
        $name = $obj->title;
        $file = bagalleryHelper::replace($name);
        $file = JFile::makeSafe($file.'.'.$obj->ext);
        $name = str_replace('-', '', $file);
        $name = str_replace($obj->ext, '', $name);
        $name = str_replace('.', '', $name);
        if ($name == '') {
            $file = date("Y-m-d-H-i-s").'.'.$obj->ext;
        }
        $obj->path = str_replace($obj->name, '', $obj->path).$file;
        echo JFile::exists(JPATH_ROOT.$obj->path);exit;
    }

    public function savePhotoEditorImage()
    {
        $content = file_get_contents('php://input');
        $obj = json_decode($content);
        if (isset($obj->title)) {
            $name = $obj->title;
            $file = bagalleryHelper::replace($name);
            $file = JFile::makeSafe($file.'.'.$obj->ext);
            $name = str_replace('-', '', $file);
            $name = str_replace($obj->ext, '', $name);
            $name = str_replace('.', '', $name);
            if ($name == '') {
                $file = date("Y-m-d-H-i-s").'.'.$obj->ext;
            }
            $obj->path = str_replace($obj->name, '', $obj->path).$file;
        }
        $data = explode(',', $obj->image);
        $method = $obj->method;
        $str = $method($data[1]);
        if ($obj->ext == 'png') {
            $imageSave = bagalleryHelper::imageSave($obj->ext);
            $imageCreate = bagalleryHelper::imageCreate($obj->ext);
            $img = imagecreatefromstring($str);
            $width = imagesx($img);
            $height = imagesy($img);
            $out = imagecreatetruecolor($width, $height);
            imagealphablending($out, false);
            imagesavealpha($out, true);
            $transparent = imagecolorallocatealpha($out, 255, 255, 255, 127);
            imagefilledrectangle($out, 0, 0, $width, $height, $transparent);          
            imagecopyresampled($out, $img, 0, 0, 0, 0, $width, $height, $width, $height);
            $imageSave($out, JPATH_ROOT.$obj->path, 9);
        } else {
            JFile::write(JPATH_ROOT.$obj->path, $str);
        }
        echo JPATH_ROOT.$obj->path;
        exit();
    }
    
    public function moveTo()
    {
        $file = $_POST['ba_image'];
        $target = $_POST['ba_folder'];
        if (JFolder::exists($file)) {
            $name = explode('/', $file);
            $name = end($name);
            JFolder::move($file, $target.'/'.$name);
        } else if (JFile::exists(JPATH_ROOT.$file)) {
            $name = JFile::getName(JPATH_ROOT.$file);
            JFile::move(JPATH_ROOT.$file, $target.'/'.$name);
        }        
        echo new JResponseJson(true, JText::_('SUCCESS_MOVED'));
        jexit();
    }

    public function moveTarget()
    {
        $target = $_POST['ba_target'];
        $path = $_POST['ba_path'];
        $flag = $_POST['ba_flag'];
        if ((bool)$flag == false) {
            if (!empty($target)) {
                if (JFolder::exists($target)) {
                    $name = explode('/', $target);
                    $name = end($name);
                    JFolder::move($target, $path.'/'.$name);
                } else if (JFile::exists(JPATH_ROOT.$target)) {
                    $name = JFile::getName(JPATH_ROOT.$target);
                    JFile::move(JPATH_ROOT.$target, $path.'/'.$name);
                }
            }
        } else {
            $target = explode(';', $target);
            foreach ($target as $key => $item) {
                if (!empty($item)) {
                    if (JFolder::exists($item)) {
                        $name = explode('/', $item);
                        $name = end($name);
                        JFolder::move($item, $path.'/'.$name);
                    } else if (JFile::exists(JPATH_ROOT.$item)) {
                        $name = JFile::getName(JPATH_ROOT.$item);
                        JFile::move(JPATH_ROOT.$item, $path.'/'.$name);
                    }
                }
            }
        }
        echo new JResponseJson($path.'/'.$name, JText::_('SUCCESS_MOVED'));
        jexit();
    }

    public function renameTarget()
    {
        $target = $_POST['ba_target'];
        $name = $_POST['ba_name'];
        $name = str_replace(' ', '-', $name);
        $dir = explode('/', $target);
        $n = count($dir) - 1;
        unset($dir[$n]);
        $dir = implode('/', $dir);
        if (!empty($target)) {
            if (JFolder::exists($target)) {
                JFolder::move($target, $dir.'/'.$name);
            } else if (JFile::exists(JPATH_ROOT.$target)) {
                $ext = JFile::getExt(JPATH_ROOT.$target);
                $name .= '.'.$ext;
                JFile::move(JPATH_ROOT.$target, JPATH_ROOT.$dir.'/'.$name);
            }
        }
        echo new JResponseJson($dir.'/'.$name, JText::_('SUCCESS_RENAME'));
        jexit();
    }

    public function deleteTarget()
    {
        $target = $_POST['ba_target'];
        $result = JText::_('SUCCESS_DELETE');
        $flag = true;
        if (!empty($target)) {
            if (JFolder::exists($target)) {
                if(!JFolder::delete($target)) {
                    $result = JText::_('DELETE_FOLDER_ERROR');
                    $flag = false;
                }
            } else if (JFile::exists(JPATH_ROOT.$target)) {
                if(!JFile::delete(JPATH_ROOT.$target)) {
                    $result = JText::_('DELETE_FILE_ERROR');
                    $flag = false;
                }
            }
        }
        echo new JResponseJson($flag, $result);
        jexit();
    }

    public function addFolder()
    {
        $location = $this->getDir();
        $dir = $location[0];
        $input = JFactory::getApplication()->input;
        $nfolder = $input->get('new-folder', '', 'string');
        $nfolder = str_replace(' ', '-', $nfolder);
        if (JFolder::create($dir.'/'.$nfolder)) {
            $result = JText::_('FOLDER_IS_CREATED');
        } else {
            $result = JText::_('FOLDER_IS_NOT_CREATED');
        }
        echo '<input type="hidden" id="ba-message-data" value="'.$result.'">';
        ?>
            <script type="text/javascript">
                var msg = document.getElementById("ba-message-data").value;
                window.parent.postMessage(msg, "*");
            </script>

        <?php
        exit;
    }
    
    public function getDir()
    {
        $redirect = 'index.php?option=com_bagallery&view=uploader&tmpl=component';
        $dir = IMAGES_BASE;
        $input = JFactory::getApplication()->input;
        $folder = $input->get('current-dir', '', 'string');
        if (!empty($folder)) {
            $dir = $folder;
            $redirect .= '&folder=' .$dir;
        }
        $array = array($dir, $redirect);

        return $array;
        
    }
    
    public function delete()
    {
        $location = $this->getDir();
        $dir = $location[0];
        $redirect = $location[1];
        $input = JFactory::getApplication()->input;
        $items = $input->get('ba-rm', '', 'array');
        $result = JText::_('SUCCESS_DELETE');
        foreach ($items as $item) {
            if ($item != '') {
                if (JFolder::exists($dir. '/' .$item)) {
                    if(!JFolder::delete($dir. '/' .$item)) {
                        $result = JText::_('DELETE_FOLDER_ERROR');
                    }
                }
                if (JFile::exists($dir. '/' .$item)) {
                    if(!JFile::delete($dir. '/' .$item)){
                        $result = JText::_('DELETE_FILE_ERROR');
                    }
                }
            }
        }
        echo '<input type="hidden" id="ba-message-data" value="'.$result.'">';
        ?>
            <script type="text/javascript">
                var msg = document.getElementById("ba-message-data").value;
                window.parent.postMessage(msg, "*");
            </script>

        <?php
        exit;
    }

    public function uploadAjax()
    {
        $folder = $_GET['folder'];
        $file = $_GET['file'];
        $ext = strtolower(JFile::getExt($file));
        $name = str_replace('.'.$ext, '', $file);
        $file = bagalleryHelper::replaceFilename($name);
        $file = JFile::makeSafe($file.'.'.$ext);
        $name = str_replace('-', '', $file);
        $name = str_replace($ext, '', $name);
        $name = str_replace('.', '', $name);
        if ($name == '') {
            $file = date("Y-m-d-H-i-s").'.'.$ext;
        }
        if (empty($folder)) {
            $folder = IMAGES_BASE;
        }
        $model = $this->getModel();
        $pos = strlen(JPATH_ROOT);
        $dir = substr($folder, $pos);
        if ($model->checkExt($ext)) {
            file_put_contents(
                $folder. '/'. $file,
                file_get_contents('php://input')
            );
            $image = new stdClass;
            $image->name = $file;
            $image->path = $image->url = $dir. '/' .$file;
            $image->size = filesize(JPATH_ROOT.$image->path);
            echo json_encode($image);
        }        
        exit;
    }

    public function formUpload()
    {
        $input = JFactory::getApplication()->input;
        $items = $input->files->get('files', '', 'array');
        $dir = $_POST['current_folder'];
        if (empty($dir)) {
            $dir = IMAGES_BASE;
        }
        $contentLength = (int) $_SERVER['CONTENT_LENGTH'];
        $mediaHelper = new JHelperMedia;
        $uploadMaxFileSize = $mediaHelper->toBytes(ini_get('upload_max_filesize'));
        $model = $this->getModel();
        $curent = str_replace(IMAGES_BASE, '', $dir);
        $images = array();
        foreach($items as $item) {
            $flag = true;
            if (($item['error'] == 1) || ($uploadMaxFileSize > 0 && $item['size'] > $uploadMaxFileSize)) {
                $flag = false;
            }
            $ext = strtolower(JFile::getExt($item['name']));
            if ($model->checkExt($ext) && $flag) {
                $name = str_replace('.'.$ext, '', $item['name']);
                $file = bagalleryHelper::replaceFilename($name);
                $file = JFile::makeSafe($file.'.'.$ext);
                $name = str_replace('-', '', $file);
                $name = str_replace($ext, '', $name);
                $name = str_replace('.', '', $name);
                if ($name == '') {
                    $file = date("Y-m-d-H-i-s").'.'.$ext;
                }
                JFile::upload( $item['tmp_name'], $dir. $file);
                $pos = strlen(JPATH_ROOT);
                $dir = substr($dir, $pos);
                $image = new stdClass;
                $image->name = $file;
                $image->path = $image->url = $dir. '/' .$file;
                $image->size = filesize(JPATH_ROOT.$image->path);
                $images[] = $image;
            }
        }
        $images = json_encode($images);
?>
    <script type="text/javascript">
        var images = <?php echo $images; ?>;
        window.parent.uploadCallback(images);
    </script>
<?php
    exit();
    }

    public function showImage()
    {
        $params = JComponentHelper::getParams('com_bagallery');
        $image_path = $params->get('image_path', 'images');
        $dir = urldecode($_GET['image']);
        $pos = strpos($dir, '/'.$image_path.'/');
        $dir = substr($dir, $pos);
        $dir = JPATH_ROOT.$dir;
        $ext = strtolower(JFile::getExt($dir));
        $imageCreate = bagalleryHelper::imageCreate($ext);
        $imageSave = bagalleryHelper::imageSave($ext);
        header("Content-type: image/".$ext);
        $offset = 60 * 60 * 24 * 90;
        $ExpStr = "Expires: " . gmdate("D, d M Y H:i:s", time() + $offset) . " GMT";
        header($ExpStr);
        if (!$img = $imageCreate($dir)) {
            $f = fopen($dir, "r");
            fpassthru($f);
        } else {
            $width = imagesx($img);
            $height = imagesy($img);
            $ratio = $width / $height;
            if ($width > $height) {
                $w = 100;
                $h = 100 / $ratio;
            } else {
                $h = 100;
                $w = 100 * $ratio;
            }
            $out = imagecreatetruecolor($w, $h);
            if ($ext == 'png') {
                imagealphablending($out, false);
                imagesavealpha($out, true);
                $transparent = imagecolorallocatealpha($out, 255, 255, 255, 127);
                imagefilledrectangle($out, 0, 0, $w, $h, $transparent);
            }
            imagecopyresampled($out, $img, 0, 0, 0, 0, $w, $h, $width, $height);
            $imageSave($out);
            imagedestroy($img);
            imagedestroy($out);
        }
        exit;
    }

    public function upload()
    {
        $location = $this->getDir();
        $dir = $location[0];
        $model = $this->getModel();
        $input = JFactory::getApplication()->input;
        $items = $input->files->get('ba-files', '', 'array');
        $result = JText::_('SUCCESS_UPLOAD');
        $language = JFactory::getLanguage();
        $language->load('com_media', JPATH_ADMINISTRATOR);
        $mediaHelper = new JHelperMedia;
        $postMaxSize = $mediaHelper->toBytes(ini_get('post_max_size'));
        $memoryLimit = $mediaHelper->toBytes(ini_get('memory_limit'));
        $contentLength = (int) $_SERVER['CONTENT_LENGTH'];
        if (($postMaxSize > 0 && $contentLength > $postMaxSize)
            || ($memoryLimit != -1 && $contentLength > $memoryLimit)) {
            $result = $language->_('COM_MEDIA_ERROR_WARNUPLOADTOOLARGE');
        } else {
            $uploadMaxFileSize = $mediaHelper->toBytes(ini_get('upload_max_filesize'));
            foreach($items as $item) {
                $item['name'] = JFile::makeSafe($item['name']);
                $item['name'] = str_replace(' ', '-', $item['name']);
                if (($item['error'] == 1) || ($uploadMaxFileSize > 0 && $item['size'] > $uploadMaxFileSize)) {
                    $result = $language->_('COM_MEDIA_ERROR_WARNFILETOOLARGE');
                    break;
                } else {
                    $ext = strtolower(JFile::getExt($item['name']));
                    $name = str_replace('-', '', $item['name']);
                    if(str_replace('.'.$ext, '', $name) == '') {
                        $item['name'] = date("Y-m-d-H-i-s").'.'.$ext;
                    }
                    $flag = $model->checkExt($ext);
                    if ($flag) {
                        $name = $dir. '/' .$item['name'];
                        if(!JFile::upload( $item['tmp_name'], $name)) {
                            $result = $language->_('COM_MEDIA_ERROR_UNABLE_TO_UPLOAD_FILE');
                            break;
                        }
                    } else {
                        $result = JText::_('INVALID_EXT');
                        break;
                    }
                }                
            }
        }        
        echo '<input type="hidden" id="ba-message-data" value="'.$result.'">';
        ?>
            <script type="text/javascript">
                var msg = document.getElementById("ba-message-data").value;
                window.parent.postMessage(msg, "*");
            </script>

        <?php
        exit;
    }
}