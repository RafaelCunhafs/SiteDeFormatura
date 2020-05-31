/**
* @package   BaGallery
* @author    Balbooa http://www.balbooa.com/
* @copyright Copyright @ Balbooa
* @license   http://www.gnu.org/licenses/gpl.html GNU/GPL
*/

var $g = jQuery,
    notification = null,
    app = {};

jQuery(document).off('click.bs.tab.data-api click.bs.modal.data-api click.bs.collapse.data-api');

function showNotice(message)
{
    if (notification.classList.contains('notification-in')) {
        setTimeout(function(){
            notification.className = 'animation-out';
            setTimeout(function(){
                addNoticeText(message);
            }, 400);
        }, 2000);
    } else {
        addNoticeText(message);
    }
}

function addNoticeText(message)
{
    notification.children[0].innerText = message;
    notification.className = 'notification-in';
    animationOut = setTimeout(function(){
        notification.className = 'animation-out';
    }, 3000);
}

function checkModule(module)
{
    if (!(module in app)) {
        loadModule(module);
    } else {
        app[module]();
    }
}

function loadModule(module)
{
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'components/com_bagallery/assets/js/'+module+'.js';
    document.getElementsByTagName('head')[0].appendChild(script);
}

function rangeAction(range, callback)
{
    var $this = $g(range),
        max = $this.attr('max') * 1,
        min = $this.attr('min') * 1,
        number = $this.next();
    number.on('input', function(){
        var value = this.value * 1;
        if (max && value > max) {
            this.value = value = max;
        }
        if (min && value < min) {
            value = min;
        }
        $this.val(value);
        setLinearWidth($this);
        callback(number);
    });
    $this.on('input', function(){
        var value = this.value * 1;
        number.val(value).trigger('input');
    });
}

function inputCallback(input)
{
    var callback = input.attr('data-callback');
    if (callback in app) {
        app[callback]();
    }
}

function setLinearWidth(range)
{
    var max = range.attr('max') * 1,
        value = range.val() * 1,
        sx = ((Math.abs(value) * 100) / max) * range.width() / 100,
        linear = range.prev();
    if (value < 0) {
        linear.addClass('ba-mirror-liner');
    } else {
        linear.removeClass('ba-mirror-liner');
    }
    if (linear.hasClass('letter-spacing')) {
        sx = sx / 2;
    }
    linear.width(sx);
}

function setTabsUnderline()
{
    $g('.general-tabs > ul li.active a').each(function(){
        var coord = this.getBoundingClientRect();
        $g(this).closest('.general-tabs').find('div.tabs-underline').css({
            'left' : coord.left,
            'right' : document.documentElement.clientWidth - coord.right,
        }); 
    });
}

(function($){
    $(window).on('load', function(){
        if ($('#jform_id').val() * 1) {
            $.ajax({
                type : "POST",
                dataType : 'text',
                url : "index.php?option=com_bagallery&task=gallery.checkProductTour&tmpl=component",
                success : function(msg){
                    if (msg == 'false') {
                        $('.quick-view').trigger('mousedown');
                    }
                }
            });
            $.ajax({
                type : "POST",
                dataType : 'text',
                url : "index.php?option=com_bagallery&task=gallery.checkRate&tmpl=component",
                success : function(msg){
                    if (msg == 'true') {
                        $('#love-gallery-modal').modal();
                    }
                }
            });
        }        
    })
    $(document).ready(function(){

        var fileButton = $('#file-upload-form input[type="file"]');

        notification = document.getElementById('ba-notification'),

        setTimeout(function(){
            $('.alert.alert-success').addClass('animation-out');
        }, 2000);

        $g('.ba-range-wrapper input[type="range"]').each(function(){
            rangeAction(this, inputCallback);
        });

        setInterval(function(){
            $.ajax({
                type : "POST",
                dataType : 'text',
                url : "index.php?option=com_bagallery&task=gallery.getSession&tmpl=component",
                success : function(msg){
                }
            });
        }, 600000);

        Joomla.submitbutton = function(task) {
            if (task == "gallery.cancel" || document.formvalidator.isValid(document.getElementById("adminForm")))
            {
                Joomla.submitbutton = function(task) {
                    return false;
                }
                jQuery(window).on('keydown', function(e){
                    if (e.keyCode == 116 || e.keyCode == 82) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
                if (task != "gallery.cancel") {
                    $('.alert.alert-success').addClass('animation-out');
                    $('ul.root-list input.cat-options').each(function(){
                        var $this = $(this),
                            obj = {},
                            li = $this.closest('li');
                        obj.parent = '';
                        if (!$this.closest('ul').hasClass('root-list')) {
                            obj.parent = li.parent().closest('li').attr('id');
                        }
                        obj.settings = $this.val();
                        obj.id = li.attr('data-id');
                        obj.access = li.attr('data-access');
                        obj.password = li.attr('data-password');
                        $this.val(JSON.stringify(obj))
                    });
                    var items = new Array(),
                        array = new Array(),
                        sort = new Array(),
                        flag = false,
                        album_flag = false,
                        watermarkNames = new Array(),
                        thumbnailArray = {},
                        id = $('#jform_id').val(),
                        allThumb = new Array(),
                        allCat = new Array();
                    if (width != $('#jform_image_width').val() || refreshImg
                        || quality != $('#jform_image_quality').val() ||
                        layout != $('#jform_gallery_layout').val()) {
                        flag = true;
                    }
                    if (album_width != $('#jform_album_width').val() || refreshImg
                        || album_quality != $('#jform_album_quality').val() ||
                        album_layout != $('#jform_album_layout').val()) {
                        album_flag = true;
                    }
                    $('.category-list li').each(function(){
                        var key = $(this).attr('id');
                        if (catImages[key]) {
                            catImages[key].forEach(function(el, ind){
                                if (flag) {
                                    el.thumbnail_url = '';
                                }
                                if ($.inArray(el.category, allCat) == -1) {
                                    allCat.push(el.category);
                                }
                                if (el.thumbnail_url) {
                                    var thumb = el.thumbnail_url.split('/');
                                    if (!thumbnailArray[el.category]) {
                                        thumbnailArray[el.category] = new Array();
                                    }
                                    thumbnailArray[el.category].push(thumb[thumb.length - 1]);
                                }
                                if (el.watermark_name && watermarkNames.indexOf(el.watermark_name) == -1) {
                                    watermarkNames.push(el.watermark_name);
                                } else if (watermarkNames.indexOf(el.watermark_name) != -1) {
                                    el.resave = 1;
                                    el.watermark_name = '';
                                }
                                array.push(el);
                                sort.push(el.imageId);
                            });
                        }
                    });
                    allThumb = JSON.stringify(thumbnailArray);
                    if (flag) {
                        $.ajax({
                            type : "POST",
                            dataType : 'text',
                            url : "index.php?option=com_bagallery&task=gallery.emptyThumbnails&tmpl=component",
                            data : {
                                ba_id : id
                            }
                        });
                    }
                    if (album_flag) {
                        $.ajax({
                            type : "POST",
                            dataType : 'text',
                            url : "index.php?option=com_bagallery&task=gallery.emptyAlbums&tmpl=component",
                            data : {
                                ba_id : id
                            }
                        });
                    }
                    if (watermark) {
                        $.ajax({
                            type : "POST",
                            dataType : 'text',
                            url : "index.php?option=com_bagallery&task=gallery.removeWatermark&tmpl=component",
                            data : {
                                ba_id : id
                            }
                        });
                    }
                    if (compWidth != $('#jform_compression_width').val() || compQuality != $('#jform_compression_quality').val()) {
                        $.ajax({
                            type : "POST",
                            dataType : 'text',
                            url : "index.php?option=com_bagallery&task=gallery.removeCompression&tmpl=component",
                            data : {
                                ba_id : id
                            }
                        });
                    }
                    sort = sort.join('-_-');
                    jQuery('#jform_settings').val(sort);
                    $('#jform_gallery_items').val('');
                    array.forEach(function(el){
                        var name;
                        if (el.id) {
                            items.push(el.id);
                        }
                        if (!el.thumbnail_url) {
                            name = checkName(thumbnailArray[el.category], el.name);
                            if (!thumbnailArray[el.category]) {
                                thumbnailArray[el.category] = new Array();
                            }
                            thumbnailArray[el.category].push(name);
                            el.thumbnail_url = '/images/bagallery/gallery-'+id+'/thumbnail/'+el.category+'/'+name;
                        }
                        if (!el.watermark_name) {
                            name = checkName(watermarkNames, el.name);
                            el.watermark_name = name;
                            watermarkNames.push(el.watermark_name);
                        }
                    });
                    var upload = jQuery('#saving-media').val(),
                        str = '';
                    upload = JSON.parse(upload);
                    str += upload.const+'<img src="'+upload.url;
                    str += 'administrator/components/com_bagallery/assets/images/reload.svg"></img>';
                    notification.className = 'notification-in';
                    notification.children[0].innerHTML = str;
                    $('<div/>', {
                        'class' : 'saving-backdrop'
                    }).appendTo('body');
                    clearTimeout(animationOut);
                    saveData(array, allThumb, allCat, id, task, items)
                } else {
                    Joomla.submitform(task, document.getElementById("adminForm"));
                }
            }
        }

        function saveData(array, allThumb, allCat, id, task, items)
        {
            var length = array.length,
                max = length > 50 ? 50 : length;
            if (length > 0) {
                var imgArray = new Array(),
                    medium = new Array();
                imgArray = array.splice(0, max);
                for (var i = 0; i < max; i++) {
                    if (imgArray[i].resave == 1) {
                        medium.push(imgArray[i]);
                    }
                }
                if (medium.length == 0) {
                    saveData(array, allThumb, allCat, id, task, items);
                    return false;
                }
                imgArray = JSON.stringify(medium);
                $.ajax({
                    type : "POST",
                    dataType : 'text',
                    url : "index.php?option=com_bagallery&task=gallery.saveItems&tmpl=component",
                    data : {
                        gallery_items : imgArray,
                        ba_id : id
                    },
                    success: function(msg) {
                        msg = JSON.parse(msg);
                        msg = JSON.parse(msg.message);
                        for (var i = 0; i < msg.length; i++) {
                            items.push(msg[i]);
                        }
                        saveData(array, allThumb, allCat, id, task, items);
                    }
                });
            } else {
                items = JSON.stringify(items);
                allCat = JSON.stringify(allCat);
                $.ajax({
                    type : "POST",
                    dataType : 'text',
                    url : "index.php?option=com_bagallery&task=gallery.clearOld&tmpl=component",
                    data : {
                        'gallery_items' : items,
                        'allThumb' : allThumb,
                        'allCat' : allCat,
                        ba_id : id
                    }
                });
                Joomla.submitform(task, document.getElementById("adminForm"));
            }
        }

        function checkName(array, name)
        {
            if ($.inArray(name, array) > -1) {
                name = getRandomInt(0, 999999999)+'-'+name;
                name = checkName(array, name);
            }

            return name;
        }

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        function sendData(obj)
        {
            jQuery.ajax({
                type : "POST",
                dataType : 'text',
                url : "index.php?option=com_bagallery&task=gallery.saveItems&tmpl=component",
                data : {
                    gallery_items : array,
                    ba_id : $('#jform_id').val()
                }
            });
        }

        function saveTags()
        {
            var tags = new Array(),
                obj = currentItem.find('.select-item').val();
            obj = JSON.parse(obj);
            $('select.meta_tags option').each(function(){
                var object = {
                    id : this.value,
                    title : this.textContent.trim()
                }
                tags.push(object);
            });
            obj.tags = tags;
            obj.resave = 1;
            saveImg(obj);
        }

        function saveColors()
        {
            var colors = new Array(),
                obj = currentItem.find('.select-item').val();
            obj = JSON.parse(obj);
            $('select.image_colors option').each(function(){
                var object = {
                    id : this.value,
                    title : this.textContent.trim()
                }
                colors.push(object);
            });
            obj.colors = colors;
            obj.resave = 1;
            saveImg(obj);
        }

        $('#create-gallery-modal input.gallery-name').on('input', function(){
            var name = $(this).val();
            if ($.trim(name)) {
                $('#create-gallery').addClass('active-button');
            } else {
                $('#create-gallery').removeClass('active-button');
            }            
        });

        $('#create-gallery').on('click', function(event){
            event.preventDefault();
            if ($(this).hasClass('active-button')) {
                var name = $('#create-gallery-modal input.gallery-name').val();
                $('#jform_title').val(name);
                $('#create-gallery-modal').removeClass('in').addClass('hide');
                Joomla.submitbutton('gallery.apply');
            }
        });

        var categoryId = 1,
            watermark  = false,
            animationOut,
            CKE = CKEDITOR.replace('CKE-editor'),
            ckeImage = '',
            deleteMode,
            pagLimit = $('.pagination-limit .ba-custom-select input').attr('data-value') * 1,
            compWidth = $('#jform_compression_width').val(),
            compQuality = $('#jform_compression_quality').val(),
            width = $('#jform_image_width').val(),
            quality = $('#jform_image_quality').val(),
            layout = $('#jform_gallery_layout').val(),
            album_width = $('#jform_album_width').val(),
            refreshImg = false,
            album_quality = $('#jform_album_quality').val(),
            album_layout = $('#jform_album_layout').val(),
            imageId = 1,
            images = $('#jform_gallery_items').val(),
            categories = $('#jform_gallery_category').val(),
            catImages = new Array(),
            target = $('.category-list ul.root-list'),
            str = '',
            settings,
            currentCat,
            currentItem,
            uploadMode = false,
            albumMode = true,
            uri = $('#juri-root').val(),
            currentContext,
            contextMode = false,
            oldName = '',
            showUrl = uri+'administrator/index.php?option=com_bagallery&task=gallery.showImage&image=',
            allImages = new Array(),
            clientHeight = document.documentElement.clientHeight,
            UpType = $('#select-upload-type');

        catImages['root'] = new Array();

        if (categories) {
        	var catAll = target.find('#category-all').clone();
            target = target.empty();
            categories = JSON.parse(categories);
            categories.forEach(function(el, ind){
                el.settings = el.settings.split(';');
                str = '<li class="ba-category';
                if (el.settings[2] == 0) {
                    str += ' ba-unpublish'
                }
                str += '" id="';
                if (el.settings[3]) {
                    str += 'category-all';
                } else {
                    str += 'category-'+el.settings[4];
                }
                str += '" data-id="';
                str += el.id+'" data-access="'+el.access+'" data-password="'+el.password;
                str += '" ><a><label><i class="zmdi zmdi-folder">';
                str += '</i></label><span>';
                str += el.settings[0]+'</span><input type="hidden" class="cat-options"';
                str += ' name="cat-options[]" value="">';
                if (el.settings[1] == 1) {
                    str += '<i class="zmdi zmdi-star"></i>';
                }
                str += '</a></li>';
                if (!el.settings[3]) {
                    if (el.settings[4] >= categoryId) {
                        categoryId = el.settings[4];
                        categoryId++;
                    }
                    catImages['category-'+el.settings[4]] = new Array();
                } else {
                	catAll = '';
                }
                if (!el.parent) {
                    target.append(str);
                } else {
                    if ($('#'+el.parent).find('> ul').length == 0) {
                        $('#'+el.parent).append('<i class="zmdi zmdi-chevron-right"></i><ul></ul>');
                    }
                    $('#'+el.parent).find('> ul').append(str)
                }                
                target.find('.cat-options').last().val(el.settings.join(';'));
            });
            if (catAll) {
            	target.prepend(catAll);
            }
            images = JSON.parse(images);
            if (images.length > 0) {
                var newArrayI = new Array(),
                    sort = $('#jform_settings').val();
                sort = sort.split('-_-');
                images.forEach(function(el, ind){
                    var settings = JSON.parse(el.settings);
                    if (catImages[settings.category]) {
                        settings.resave = 0;
                        newArrayI[settings.imageId] = settings;
                        if (imageId <= settings.imageId) {
                            imageId = settings.imageId;
                            imageId++;
                        }
                    }
                });
                sort.forEach(function(set) {
                    var settings = newArrayI[set];
                    if (settings) {
                    	catImages[settings.category].push(settings);
                    }
                });
            }
        }

        $('#jform_album_mode').on('click', function(){
            checkAlbum();
        });
        checkAlbum();
        checkComments();

        function checkComments()
        {
            var comments = $('#jform_enable_disqus').val(),
                vk = $('.vk-options'),
                disqus = $('.disqus-options');
            if (comments == 1) {
                disqus.show();
                vk.hide()
            } else if (comments == 'vkontakte') {
                disqus.hide();
                vk.show()
            } else {
                disqus.hide();
                vk.hide()
            }
        }

        function rgba2hex(rgb)
        {
            var parts = rgb.toLowerCase().match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/),
                hex = '#',
                part,
                color = new Array();
            if (parts) {
                for ( var i = 1; i <= 3; i++ ) {
                    part = parseInt(parts[i]).toString(16);
                    if (part.length < 2) {
                        part = '0'+part;
                    }
                    hex += part;
                }
                color.push(hex);
                color.push(parts[4]);
                
                return color;
            } else {
                color.push(rgb);
                color.push(1);
                
                return color;
            }
        }

        function checkCompression()
        {
            if (document.getElementById('jform_enable_compression').checked) {
                $('.compression-options').css('display', '');
            } else {
                $('.compression-options').hide();
            }
        }

        checkCompression();
        $('#jform_enable_compression').on('change', checkCompression);

        function checkPageRefresh()
        {
            var pagT = $('#jform_pagination_type'),
                value = pagT.val(),
                pagType = pagT.prev(),
                def = pagType.find('li[data-value="default"]').text();
            if ($('#jform_page_refresh').prop('checked')) {
                pagType.find('li[data-value="infinity"], li[data-value="load"]').hide();
                if (value == 'infinity' || value == 'load') {
                    pagT.val('default');
                    pagType.find('.ba-form-trigger').attr('data-value', 'default').val($.trim(def));
                }
            } else {
                pagType.find('li[data-value="infinity"], li[data-value="load"]').css('display', '');
            }
        }

        checkPageRefresh();
        $('#jform_page_refresh').on('click', function(){
            checkPageRefresh();
        });

        function checkAlbum()
        {
            if ($('#jform_album_mode').prop('checked')) {
                albumMode = true;
                var options = $('.root-list .zmdi.zmdi-star').parent().find('.cat-options').val().split(';');
                options[1] = 0;
                options = options.join(';');
                $('div.meta-tags').hide().prev().hide().prev().hide();
                $('div.image-colors').hide().prev().hide().prev().hide();
                $('.root-list .zmdi.zmdi-star').parent().find('.cat-options').val(options)
                $('.root-list .zmdi.zmdi-star').remove();
                var options = $('#category-all > a .cat-options').val().split(';');
                options[2] = 1;
                $('#category-all .cat-options').val(options.join(';'));
                $('#category-all').removeClass('ba-unpublish');
                checkDefault();
                $('body').addClass('album-mode');
                $('a[href="#filter-options"]').hide();
                $('a[href="#album-options"]').show();
                $('input.default-category').closest('div').hide();
                $('input.hide-in-category-all').closest('div').hide();
                $('.folders-context-menu .move-to, #move-to-modal li[data-id="root"] > span').show();
                $('#category-options div.img-thumbnail').show();
            } else {
                albumMode = false;
                $('body').removeClass('album-mode');
                $('div.meta-tags').css('display', '').prev().css('display', '').prev().css('display', '');
                $('a[href="#filter-options"]').show();
                $('a[href="#album-options"]').hide();
                $('input.default-category').closest('div').show();
                $('input.hide-in-category-all').closest('div').show();
                $('.folders-context-menu .move-to, #move-to-modal li[data-id="root"] > span').hide();
                $('#category-options div.img-thumbnail').hide();
                $('#root .root-list li').each(function(){
                    var $this = $(this),
                        ul = $this.parent();
                    if (!ul.hasClass('root-list')) {
                        $('#root .root-list').append(this);
                    }
                });
                $('#root .root-list ul, #root .root-list i.zmdi-chevron-right').remove();
                catImages['root'] = new Array();
            }
            if (currentCat == 'root') {
                $('#root > a').trigger('click');
            }
        }



        function getAllImages()
        {
            allImages = new Array();
            jQuery('table.ba-items-table img').each(function(){
                var src = jQuery(this).attr('data-src');
                this.onload = function(){
                    jQuery(this).closest('td').addClass('loaded');
                }
                var obj = {
                    el : this,
                    img : src
                }
                allImages.push(obj)                    
            });
            jQuery('div.table-body').on('scroll',function(){
                checkImages()
                if (allImages.length == 0) {
                    jQuery(this).off('scroll')
                }
            });
            checkImages();
        }

        function checkImages()
        {
            var newArray = new Array();
            clientHeight = document.documentElement.clientHeight
            allImages.forEach(function(el, ind){
                if (jQuery(el.el).offset().top < clientHeight * 2) {
                    el.el.src = el.img;
                } else {
                    newArray.push(el)
                }
            });
            allImages = newArray
        }

        function getFileSize(size)
        {
            size = size / 1024;
            size = Math.floor(size);
            if (size >= 1024) {
                size = size / 1024;
                size = Math.floor(size);
                size = size+' MB';
            } else {
                size = size+' KB';
            }

            return size;
        }

        function saveImg(obj)
        {
            obj = JSON.stringify(obj);
            var item = currentItem.find('.select-item');
            item.val(obj);
            item = item.attr('data-index');
            catImages[currentCat][item] = JSON.parse(obj);
        }

        function checkAutoResize()
        {
            if ($('#jform_auto_resize').prop('checked')) {
                $('.lightbox-width').hide();
            } else {
                $('.lightbox-width').show();
            }
        }

        function checkHeader()
        {
            var childrens = $('#lightbox-header-options').children();
            if ($("#jform_display_header").prop('checked')) {
                childrens.show();
            } else {
                childrens.hide();
                childrens.first().show();
            }
            if (!$('#jform_enable_alias').prop('checked')) {
                $('.share-group').hide().prev().hide();
            }
        }

        function strip_tags(str)
        {
            return str.replace(/<\/?[^>]+>/gi, '');
        }

        function checkDefault()
        {
            var options = $('#category-all > a .cat-options').val().split(';');
            options[1] = 1;
            $('#category-all .cat-options').val(options.join(';'));
            $('#category-all > a').append('<i class="zmdi zmdi-star"></i>');
        }

        function addRangeWidth(input)
        {
            var max = input.attr('max') * 1,
                value = input.val(),
                sx = ((value * 100) / max) * input.width() / 100;
            input.prev().width(sx);
        }

        function checkLightbox()
        {
            if ($('#enable-lightbox').prop('checked')) {
                $('#lightbox-options .left-tabs > ul > li:not(:first-child)').show();
                $('a[href="#copyright-watermark-options"]').parent().show();
                if (!$('#jform_enable_alias').prop('checked')) {
                    $('a[href="#lightbox-comments-options"]').parent().hide();
                }
                $('#lightbox-general-options > .ba-options-group').show();
                checkAutoResize();
            } else {
                $('#lightbox-options .left-tabs > ul > li:not(:first-child)').hide();
                $('a[href="#copyright-watermark-options"]').parent().hide();
                $('#lightbox-general-options > .ba-options-group').hide();
                $('#lightbox-general-options > .ba-options-group').first().show();
            }
        }

        function checkAlias()
        {
            if ($('#jform_enable_alias').prop('checked')) {
                $('.image-alias').show().parent().prev().show();
                if ($('#enable-lightbox').prop('checked')) {
                    $('a[href="#lightbox-comments-options"]').parent().show();
                }
                if ($('#jform_display_header').prop('checked')) {
                    $('.share-group').show().prev().show();
                }
            } else {
                $('.share-group').hide().prev().hide();
                $('.image-alias').hide().parent().prev().hide();
                $('a[href="#lightbox-comments-options"]').parent().hide();
            }
        }

        function listenMessage(event)
        {
            if (event.origin == location.origin && typeof(event.data) != 'string') {
                $('#uploader-modal').modal('hide');
                if (uploadMode == 'images') {
                    for (var i = 0; i < event.data.length; i++) {
                        var obj = event.data[i];
                        tbody = $('table.ba-items-table tbody');
                        obj.category = currentCat;
                        obj.imageId = imageId;
                        obj.resave = 1;
                        obj.time = +new Date();
                        obj.target = 'blank';
                        catImages[currentCat].push(obj);
                        imageId++;
                        if (tbody.find('tr').length < pagLimit) {
                            var ind = catImages[currentCat].length - 1,
                                str = returnTrHtml(obj, ind);
                            tbody.append(str);
                            tbody.find('.select-item').last().val(JSON.stringify(obj));
                        }
                    }
                    drawPaginator();
                    getAllImages();
                    showNotice($('#upload-const').val());
                } else if (uploadMode == 'alternativeImage') {
                    var img = event.data.url,
                        obj = currentItem.find('.select-item').val();
                    obj = JSON.parse(obj);
                    obj.alternative = img;
                    obj.resave = 1;
                    $('.alternative-image').val(img);
                    saveImg(obj);
                } else if (uploadMode == 'reselectImage') {
                    var obj = currentItem.find('.select-item').val();
                    obj = JSON.parse(obj);
                    obj.name = event.data.name;
                    obj.path = event.data.path;
                    obj.size = event.data.size;
                    obj.resave = 1;
                    obj.thumbnail_url = '';
                    obj.url = event.data.url;
                    currentItem.find('img')[0].src = obj.url;
                    currentItem.find('.select-td').next().text(obj.name).next().text(getFileSize(obj.size));
                    obj.url = obj.url.replace(new RegExp(' ', 'g'), '%20');
                    $('div.images-options div.img-thumbnail').css('background-image', 'url('+uri+obj.url+')');
                    saveImg(obj);
                } else if (uploadMode == 'album') {
                    settings = currentItem.find('> a .cat-options').val().split(';');
                    settings[5] = event.data.path;
                    $('#category-options div.img-thumbnail img').remove();
                    event.data.url = event.data.url.replace(new RegExp(' ', 'g'), '%20');
                    $('#category-options div.img-thumbnail').css('background-image', 'url('+uri+event.data.url+')');
                    currentItem.find('> a .cat-options').val(settings.join(';'));
                } else if (uploadMode == 'watermark') {
                    var img = event.data.path;
                    $('#jform_watermark_upload').val(img);
                    watermark = true;
                } else if (uploadMode == 'CKEImage') {
                    var url = event.data.url;
                    $('.cke-upload-image').val(url);
                    $('#add-cke-image').addClass('active-button');
                }
            }            
        }

        $('.cke-image-alt, .cke-image-width, .cke-image-height').on('input', function(){
            if ($('.cke-upload-image').val()) {
                $('#add-cke-image').addClass('active-button');
            }
        });

        $('.cke-image-select').on('customHide', function(){
            if ($('.cke-upload-image').val()) {
                $('#add-cke-image').addClass('active-button');
            }
        });

        $('#add-cke-image').on('click', function(event){
            event.preventDefault();
            if (jQuery(this).hasClass('active-button')) {
                var url = $('.cke-upload-image').val(),
                    alt = $('.cke-image-alt').val(),
                    width = $('.cke-image-width').val(),
                    height = $('.cke-image-height').val(),
                    align = $('.cke-image-align').val(),
                    img = '',
                    doc = $('#html-editor iframe')[0].contentDocument;
                if (width) {
                    width += 'px';
                }
                if (height) {
                    height += 'px';
                }
                if (ckeImage) {
                    ckeImage.src = url;
                    ckeImage.alt = $.trim(alt);
                    ckeImage.style.width = width;
                    ckeImage.style.height = height;
                    ckeImage.style.float = align;
                } else {
                    img = document.createElement('img');
                    img.src = url;
                    img.alt = $.trim(alt);
                    img.style.width = width;
                    img.style.height = height;
                    img.style.float = align;
                    if (doc.getSelection().rangeCount > 0) {
                        var range = doc.getSelection().getRangeAt(0);
                        range.insertNode(img);
                    } else {
                        var data = CKE.getData();
                        data += img.outerHTML;
                        CKE.setData(data);
                    }
                }
                $('#cke-image-modal').modal('hide');
            }
        });

        function sortName(obj1, obj2)
        {
            if(obj1.name.toLowerCase() > obj2.name.toLowerCase()) {
                return 1;
            }
            if(obj1.name.toLowerCase() < obj2.name.toLowerCase()) {
                return -1;
            }
            else {
                return 0;
            }
        }

        function checkFilter()
        {
            var childrens = $('#filter-categories-options').children();
            if ($('#jform_category_list').prop('checked')) {
                childrens.show();
            } else {
                childrens.not(childrens[0]).hide();
            }
        }

        function checkTags()
        {
            var childrens = $('#filter-tags-options').children();
            if ($('#jform_enable_tags').prop('checked')) {
                childrens.show();
            } else {
                childrens.not(childrens[0]).hide();
            }
        }

        function checkColors()
        {
            var childrens = $('#filter-colors-options').children();
            if ($('#jform_enable_colors').prop('checked')) {
                childrens.show();
            } else {
                childrens.not(childrens[0]).hide();
            }
        }

        function checkPaginator()
        {
            if ($('#jform_pagination').prop('checked')) {
                $('#pagination-options').children().show();
            } else {
                $('#pagination-options').children().hide();
                $('#pagination-options').children().first().show();
            }
        }

        function drawPaginator()
        {
            $('div.table-body').find('.pagination').remove();
            if (catImages[currentCat].length > pagLimit && pagLimit != 1) {
                var pages = Math.ceil(catImages[currentCat].length / pagLimit),
                    div = document.createElement('div'),
                    ul = document.createElement('ul'),
                    li = document.createElement('li'),
                    a = document.createElement('a'),
                    span = document.createElement('span');
                div.className = 'pagination';
                ul.className = 'pagination-list';
                li.className = 'disabled ba-first-page';
                span.className = 'icon-first';
                div.appendChild(ul);
                ul = appendItems(ul, li, a, span);
                li = document.createElement('li')
                li.className = 'disabled ba-prev';
                a = document.createElement('a');
                span = document.createElement('span');
                span.className = 'icon-previous';
                ul = appendItems(ul, li, a, span);
                for (var i = 0; i < pages; i++) {
                    li = document.createElement('li');
                    li.className = 'ba-pages';
                    if (i == 0) {
                        li.className += ' active';
                    }
                    a = document.createElement('a');
                    span = document.createTextNode(i + 1);
                    $(a).attr('data-page', i);
                    ul = appendItems(ul, li, a, span);
                }
                li = document.createElement('li');
                a = document.createElement('a');
                li.className = 'ba-next';
                span = document.createElement('span');
                span.className = 'icon-next';
                $(a).attr('data-page', 1);
                ul = appendItems(ul, li, a, span);
                li = document.createElement('li');
                a = document.createElement('a');
                li.className = 'ba-last-page';
                span = document.createElement('span');
                span.className = 'icon-last';
                $(a).attr('data-page', pages - 1);
                ul = appendItems(ul, li, a, span);
                $(ul).find('a').on('click', function(event){
                    event.preventDefault();
                    var $this = $(this);
                    if ($this.parent().hasClass('active') || $this.parent().hasClass('disabled')) {
                        return false;
                    }
                    var page = $this.attr('data-page') * 1,
                        ul = $this.closest('ul'),
                        first = ul.find('li').first(),
                        last = ul.find('li').last(),
                        max = page*pagLimit + pagLimit,
                        tbody = $('table.ba-items-table tbody').empty();
                    ul.find('li.active').removeClass('active');
                    first.removeClass('disabled');
                    first.find('a').attr('data-page', 0);
                    first.next().removeClass('disabled').find('a').attr('data-page', page - 1);
                    last.removeClass('disabled');
                    last.find('a').attr('data-page', pages - 1);
                    last.prev().removeClass('disabled').find('a').attr('data-page', page + 1);
                    ul.find('.ba-pages [data-page="'+page+'"]').parent().addClass('active');
                    if (page == 0) {
                        first.addClass('disabled');
                        first.find('a').removeAttr('data-page');
                        first.next().addClass('disabled').find('a').removeAttr('data-page');
                    }
                    if (page == pages - 1) {
                        last.addClass('disabled');
                        last.find('a').removeAttr('data-page');
                        last.prev().addClass('disabled').find('a').removeAttr('data-page');
                    }
                    if (catImages[currentCat].length < max) {
                        max = catImages[currentCat].length;                        
                    }
                    for (var i = page * pagLimit; i < max; i++) {
                        var str = returnTrHtml(catImages[currentCat][i], i);
                        tbody.append(str);
                        tbody.find('.select-item').last().val(JSON.stringify(catImages[currentCat][i]))
                    }
                    checkPagination();
                    getAllImages();
                });
                $('div.table-body').append(div);
                checkPagination();
            }
        }

        function checkPagination()
        {
            var paginator = $('.pagination-list'),
                current,
                curInd = 0,
                pagButtons = paginator.find('li').not('.ba-first-page, .ba-last-page, .ba-prev, .ba-next');
            if (pagButtons.length >= 5) {
                pagButtons.each(function(ind, el){
                    if (jQuery(this).hasClass('active')) {
                        current = jQuery(this);
                        curInd = ind;
                        return false;
                    }
                });
                if (curInd <= 2) {
                    pagButtons.each(function(ind, el){
                        if (ind < 5) {
                            jQuery(this).show();
                        } else {
                            jQuery(this).hide();
                        }
                    });
                } else if (curInd + 1 > pagButtons.length - 3) {
                    for (var i = pagButtons.length - 1; i >= 0; i--) {
                        if (i >= pagButtons.length - 5) {
                            jQuery(pagButtons[i]).show();
                        } else {
                            jQuery(pagButtons[i]).hide();
                        }
                    }
                } else {
                    pagButtons.hide();
                    current.show().prev().show().prev().show();
                    current.next().show().next().show();
                }
            }
        }

        function appendItems(ul, li, a, span)
        {
            a.appendChild(span);
            li.appendChild(a);
            ul.appendChild(li);

            return ul;
        }
        
        function sortDate(obj1, obj2)
        {
            return obj1.time - obj2.time;
        }

        function checkContext(context, deltaY, deltaX)
        {
            if (deltaX - context.width() < 0) {
                context.addClass('ba-left');
            } else {
                context.removeClass('ba-left');
            }
            if (deltaY - context.height() < 0) {
                context.addClass('ba-top');
            } else {
                context.removeClass('ba-top');
            }
        }

        function checkCaptionOptions()
        {
            if (!$('#jform_disable_caption').prop('checked')) {
                $('a[href="#thumbnail-typography-options"]').parent().show();
                $('.caption-group').show();
                var value = document.getElementById('jform_thumbnail_layout').value;
                if (value == '11' || value == '13') {
                    $('#jform_caption_bg').closest('.ba-options-group').hide();
                }
            } else {
                $('a[href="#thumbnail-typography-options"]').parent().hide();
                $('.caption-group').hide();
            }
        }

        function checkAlbumCaptionOptions()
        {
            if (!$('#jform_album_disable_caption').prop('checked')) {
                $('a[href="#album-typography-options"]').parent().show();
                $('.album-caption-group').show();
                var value = document.getElementById('jform_thumbnail_layout').value;
                if (value == '11' || value == '13') {
                    $('#jform_album_caption_bg').closest('.ba-options-group').hide();
                }
            } else {
                $('a[href="#album-typography-options"]').parent().hide();
                $('.album-caption-group').hide();
            }
        }

        function reIndexArray()
        {
            if (currentCat) {
                var array = new Array();
                catImages[currentCat].forEach(function(el, ind){
                    array.push(el);
                });
                catImages[currentCat] = array;
            }
        }

        function checkRandomGrid()
        {
            var value =  $('#jform_gallery_layout').val(),
                thumb = $('#jform_thumbnail_layout'),
                effect = thumb.prev();
            if (value == 'random') {
                effect.find('li[data-value="10"]').removeClass('disabled-hover-effect');
            } else {
                effect.find('li[data-value="10"]').addClass('disabled-hover-effect');
                if (thumb.val() == '10') {
                    thumb.val(10);
                    var name = $.trim(effect.find('li').first().text());
                    effect.find('input').attr('data-value', 1).val(name);
                    $('#jform_thumbnail_layout').val(1);
                }
            }
        }

        function checkAlbumRandomGrid()
        {
            var value =  $('#jform_album_layout').val(),
                thumb = $('#jform_album_thumbnail_layout'),
                effect = thumb.prev();
            if (value == 'random') {
                effect.find('li[data-value="10"]').removeClass('disabled-hover-effect')
            } else {
                effect.find('li[data-value="10"]').addClass('disabled-hover-effect')
                if (thumb.val() == '10') {
                    thumb.val(10);
                    var name = $.trim(effect.find('li').first().text());
                    effect.find('input').attr('data-value', 1).val(name);
                    $('#jform_album_thumbnail_layout').val(1);
                }
            }
        }

        function checkEffect()
        {
            var value = document.getElementById('jform_thumbnail_layout').value;
            if (value == '11' || value == '13') {
                $('#jform_caption_bg').closest('.ba-options-group').hide();
                $('#title_color, #category_color, #description_color').closest('.ba-group-element').hide();
            } else {
                $('#jform_caption_bg').closest('.ba-options-group').show();
                $('#title_color, #category_color, #description_color').closest('.ba-group-element').show();
            }
        }

        function checkAlbumEffect()
        {
            var value = document.getElementById('jform_thumbnail_layout').value;
            if (value == '11' || value == '13') {
                $('#jform_album_caption_bg').closest('.ba-options-group').hide();
                $('#album_title_color, #album_img_count_color').closest('.ba-group-element').hide();
            } else {
                $('#jform_album_caption_bg').closest('.ba-options-group').show();
                $('#album_title_color, #album_img_count_color').closest('.ba-group-element').show();
            }
        }

        function showContext(event)
        {
            event.stopPropagation();
            event.preventDefault();
            $('.context-active').removeClass('context-active');
            currentContext.addClass('context-active');
            var deltaX = document.documentElement.clientWidth - event.pageX,
                deltaY = document.documentElement.clientHeight - event.clientY,
                context;
            if (currentContext.hasClass('ba-images')) {
                context = $('.files-context-menu');
            } else {
                if (currentContext[0].localName == 'tr') {
                    var id = currentContext.attr('data-id');
                    currentContext = $('#'+id+' > a');
                }
                context = $('.folders-context-menu');
            }
            setTimeout(function(){
                context.css({
                    'top' : event.pageY,
                    'left' : event.pageX,
                }).show();
                checkContext(context, deltaY, deltaX);
            }, 50);
        }

        if ($('html').attr('dir') == 'rtl') {
            CKEDITOR.config.contentsLangDirection = 'rtl';
        }
        CKE.setUiColor('#fafafa');
        CKE.config.allowedContent = true;
        CKEDITOR.dtd.$removeEmpty.span = 0;
        CKEDITOR.dtd.$removeEmpty.i = 0;
        CKE.config.toolbar_Basic =
        [
            { name: 'document',    items : [ 'Source' ] },
            { name: 'styles',      items : [ 'Styles','Format' ] },
            { name: 'colors',      items : [ 'TextColor' ] },
            { name: 'clipboard',   items : [ 'Undo','Redo' ] },            
            { name: 'basicstyles', items : [ 'Bold','Italic','Underline'] },
            { name: 'paragraph',   items : [ 'NumberedList','BulletedList','-','Outdent',
                                            'Indent','-','Blockquote','-','JustifyLeft',
                                            'JustifyCenter','JustifyRight','JustifyBlock','-' ] },
            { name: 'links',       items : [ 'Link','Unlink','Anchor' ] },
            { name: 'insert',      items : [ 'myImage','Table','HorizontalRule'] }
        ];
        CKE.config.toolbar = 'Basic';
        CKEDITOR.config.removePlugins = 'image';
        CKE.addCommand("imgComand", {
            exec: function(edt) {
                $('#add-cke-image').removeClass('active-button');
                var align = src = w = h = alt = label = '',
                    selected = CKE.getSelection().getSelectedElement()
                if (selected && selected.$.localName == 'img') {
                    ckeImage = selected.$;
                    src = ckeImage.src;
                    alt = ckeImage.alt;
                    w = ckeImage.style.width.replace('px', '');
                    h = ckeImage.style.height.replace('px', '');
                    align = ckeImage.style.float;
                    label = $('.cke-image-align').parent().find('li[data-value="'+align+'"]').text();
                    label = $.trim(label);
                } else {
                    ckeImage = '';
                }
                $('.cke-upload-image').val(src);
                $('.cke-image-alt').val(alt);
                $('.cke-image-width').val(w);
                $('.cke-image-height').val(h);
                $('.cke-image-align').attr('data-value', align);
                $('.cke-image-align').val(label);
                $('#cke-image-modal').modal();
            }
        });
        CKE.ui.addButton('myImage', {
            label: "Image",
            command: 'imgComand',
            toolbar: 'insert',
            icon: 'image'
        });

        $('.cke-upload-image').on('mousedown', function(){
            $('#uploader-modal').attr('data-check', 'single').modal();
            uploadMode = 'CKEImage';
        });

        $('.modal').on('hide', function(){
            $(this).addClass('ba-modal-close');
            setTimeout(function(){
                $('.ba-modal-close').removeClass('ba-modal-close');
            }, 500)
        });

        $('#uploader-modal').on('show', function(){
            window.addEventListener("message", listenMessage, false);
        });
        
        $('#uploader-modal').on('hide', function(){
            window.removeEventListener("message", listenMessage, false);
        });

        $('i.check-all').on('click', function(){
            $('#check-all').trigger('click');
        });

        $('i.sort-action').closest('.ba-custom-select').on('show', function(){
            var sort = $('#jform_sorting_mode').val();
            $(this).find('li').removeClass('selected').each(function(){
                var $this = $(this);
                $this.find('i.zmdi-check').remove();
                if ($this.attr('data-value') == sort) {
                    $this.addClass('selected').prepend('<i class="zmdi zmdi-check"></i>');
                }
            });
        });

        $('.aspect-ratio-select').on('show', function(){
            var $this = $(this),
                ul = $this.find('ul'),
                value = $this.find('input[type="hidden"]').val();
            ul.find('i').remove();
            ul.find('.selected').removeClass('selected');
            ul.find('li[data-value="'+value+'"]').addClass('selected').prepend('<i class="zmdi zmdi-check"></i>');
        });

        $('label.ba-help').on('click', function(event){
            var coor = this.getBoundingClientRect();
            $('div.help-context-menu').css({
                'top' : coor.bottom,
                'left' : coor.right,
            }).show();
        })

        $('.gallery-editor .category-list, .gallery-editor .images-list').on('contextmenu', function(event){
            event.preventDefault();
        });

        $('div.category-list, div.table-body').on('contextmenu', function(event){
            $('.context-active').removeClass('context-active');
            var deltaX = document.documentElement.clientWidth - event.pageX,
                deltaY = document.documentElement.clientHeight - event.clientY,
                context;
            setTimeout(function(){
                context = $('.empty-context-menu');
                context.css({
                    'top' : event.pageY,
                    'left' : event.pageX,
                }).show();
                checkContext(context, deltaY, deltaX);
            }, 50);
        });

        jQuery('.new-name').on('input', function(){
            var name = jQuery(this).val();
            if (jQuery.trim(name) && name != oldName) {
                jQuery('#apply-rename').addClass('active-button');
            } else {
                jQuery('#apply-rename').removeClass('active-button');
            }
        });

        jQuery('#apply-rename').on('click', function(event){
            event.preventDefault();
            if (!$(this).hasClass('active-button')) {
                return false;
            }
            var name = $.trim($('.new-name').val()),
                id = currentContext.closest('li').attr('id');
            name = name.replace(new RegExp(';', 'g'), '');
            $('tr[data-id="'+id+'"] td.draggable-handler a').text(name)
            settings = currentContext.find('.cat-options').val().split(';');
            settings[0] = name;
            currentContext.find('.cat-options').val(settings.join(';'));
            currentContext.find('span').text(name);
            if (currentItem && currentItem[0].id == currentContext.parent()[0].id) {
                $('#category-name').val(name);
            }            
            jQuery('#rename-modal').modal('hide');
        });

        $('.ba-context-menu .documentation, .ba-context-menu .support').on('mousedown', function(event){
            if (event.button > 1) {
                return false;
            }
            event.stopPropagation();
            setTimeout(function(){
                $('div.help-context-menu').hide();
            }, 150);
        });

        $('.ba-context-menu .love-gallery').on('mousedown', function(event){
            if (event.button > 1) {
                return false;
            }
            $('#love-gallery-modal').modal();
        });

        $('.ba-context-menu .quick-view').on('mousedown', function(event){
            if (event.button > 1) {
                return false;
            }
            //event.stopPropagation();
            var sBackdrop = $('<div/>', {
                'class' : 'saving-backdrop'
            });
            document.getElementsByTagName('body')[0].appendChild(sBackdrop[0]);
            $('.product-tour.step-1').addClass('visible');
            $('.category-list .create-categery').addClass('active-product-tour');
        });

        $('.product-tour.step-1 .next').on('click', function(){
            $('.product-tour.step-1').removeClass('visible');
            $('.category-list .create-categery').removeClass('active-product-tour');
            $('.product-tour.step-2').addClass('visible');
            $('.images-list .camera-container').addClass('active-product-tour');
        });

        $('.product-tour.step-2 .next').on('click', function(){
            $('.product-tour.step-2').removeClass('visible');
            $('.images-list .camera-container').removeClass('active-product-tour');
            $('.product-tour.step-3').addClass('visible');
            $('.ba-toolbar-icons .settings').addClass('active-product-tour');
        });

        $('.product-tour.step-3 .close').on('click', function(){
            $('.product-tour.step-3').removeClass('visible');
            $('.ba-toolbar-icons .settings').removeClass('active-product-tour');
            var sBackdrop = document.getElementsByClassName('saving-backdrop')[0];
            sBackdrop.className += ' animation-out';
            setTimeout(function(){
                document.getElementsByTagName('body')[0].removeChild(sBackdrop);
            }, 300);
        });

        $('.product-tour .zmdi.zmdi-close').on('click', function(){
            $('.product-tour.step-1').removeClass('visible');
            $('.category-list .create-categery').removeClass('active-product-tour');
            $('.product-tour.step-2').removeClass('visible');
            $('.images-list .camera-container').removeClass('active-product-tour');
            $('.product-tour.step-3').removeClass('visible');
            $('.ba-toolbar-icons .settings').removeClass('active-product-tour');
            var sBackdrop = document.getElementsByClassName('saving-backdrop')[0];
            sBackdrop.className += ' animation-out';
            setTimeout(function(){
                document.getElementsByTagName('body')[0].removeChild(sBackdrop);
            }, 300);
        });

        $('.refresh-images').on('click', function(event){
            event.preventDefault();
            refreshImg = true;
            $('#toolbar-apply button').trigger('click');
        });

        $('.ba-context-menu .rename').on('mousedown', function(event){
            if (event.button > 1) {
                return false;
            }
            if (currentContext.parent().hasClass('ba-category')) {
                oldName = currentContext.find('> span').text();
            } else {
                oldName = currentContext.text();
            }
            oldName = $.trim(oldName);
            $('.new-name').val(oldName);
            $('#apply-rename').removeClass('active-button');
            $('#rename-modal').modal();
        });

        $('table.ba-items-list').on('contextmenu', 'tr', function(event){
            currentContext = $(this);
            showContext(event);
        });

        $('ul.root-list').on('contextmenu', 'a', function(event){
            currentContext = $(this);
            showContext(event);
        });

        $('.ba-sorting-action-wrapper ul li').on('click', function(){
            var value = $(this).attr('data-value');
            if (currentCat) {
                if (value == 'name') {
                    catImages[currentCat].sort(sortName);
                } else if (value == 'newest') {
                    catImages[currentCat].sort(sortDate);
                    catImages[currentCat].reverse();
                } else if (value == 'oldest') {
                    catImages[currentCat].sort(sortDate);
                }
                var tbody = $('table.ba-items-table tbody').empty();
                catImages[currentCat].forEach(function(el, ind){
                    var str = returnTrHtml(el, ind);
                    tbody.append(str);
                    tbody.find('.select-item').last().val(JSON.stringify(el))
                });
                getAllImages();
            }
            $('#jform_sorting_mode').val(value);
        });

        $('#check-all').on('click', function(){
            if ($(this).prop('checked')) {
                var tr = $('tr');
                if (albumMode) {
                    tr = $('tr').not('.category-all');
                }
                tr.find('input[type="checkbox"]').each(function(){
                    $(this).attr('checked', true);
                    $('i.delete-selected, i.filename-to-title').removeClass('disabled-item');
                    if (!albumMode && currentCat == 'root') {

                    } else {
                        $('i.move-to').removeClass('disabled-item');
                    }
                });
            } else {
                $('tr input[type="checkbox"]').each(function(){
                    $(this).removeAttr('checked');
                    $('i.move-to, i.delete-selected, i.filename-to-title').addClass('disabled-item');
                });
            }
        });

        $('table.ba-items-list ').on('change', 'input[type="checkbox"]', function(){
            if ($(this).prop('checked')) {
                $('i.move-to, i.delete-selected, i.filename-to-title').removeClass('disabled-item');
            } else {
                var flag = true;
                $('tr input[type="checkbox"]').each(function(){
                    if ($(this).prop('checked')) {
                        flag = false;
                    }
                });
                if (flag) {
                    $('i.move-to, i.delete-selected, i.filename-to-title').addClass('disabled-item');
                }
            }
        });

        $('i.move-to').on('click', function(){
            if ($(this).hasClass('disabled-item')) {
                return false;
            }
            contextMode = false;
            $('#move-to-modal .availible-folders .active').removeClass('active');
            $('#move-to-modal .active-button').removeClass('active-button');
            $('#move-to-modal').modal();
        });

        $('#move-to-modal .availible-folders').on('click', 'li', function(event){
            event.stopPropagation();
            $('#move-to-modal .availible-folders .active').removeClass('active');
            $(this).addClass('active');
            $('.apply-move').addClass('active-button');
        });

        $('#move-to-modal').on('hide', function(){
            $('#move-to-modal .availible-folders > ul > li > ul').remove();
        });

        $('#move-to-modal').on('show', function(){
        	$('#move-to-modal .availible-folders > ul > li > ul').remove();
            var ul = $('div.category-list ul.root-list').clone(),
                li,
                text;
            ul.find('.active').removeClass('active');
            ul.find('li').each(function(){
                li = $(this);
                var span = document.createElement('span'),
                    i = document.createElement('i');
                i.className = 'zmdi zmdi-folder';
                text = li.find('> a').text();
                text = $.trim(text),
                text = document.createTextNode(text);
                span.appendChild(i);
                span.appendChild(text);
                li.find('> a').remove();
                if (li.attr('id') == 'category-all') {
                    li.hide();
                }
                li.attr('data-id', li.attr('id')).removeAttr('id').removeClass('ba-category').prepend(span);
            });
            if (!contextMode) {
                $('table.ba-category-table input[type="checkbox"]').each(function(){
                    var $this = $(this),
                        id = $this.closest('tr').attr('data-id');
                    if ($this.prop('checked')) {
                        ul.find('[data-id="'+id+'"]').hide();
                    }
                });
            } else {
                if (!currentContext.hasClass('ba-images')) {
                    var id = currentContext.closest('li').attr('id');
                    ul.find('[data-id="'+id+'"]').hide();
                }
            }
            $('#move-to-modal .availible-folders > ul > li').append(ul);
            ul.find('i.zmdi-chevron-right').on('click', function(){
                if ($(this).parent().hasClass('visible-branch')) {
                    $(this).parent().removeClass('visible-branch');
                } else {
                    $(this).parent().addClass('visible-branch');
                }
            });
        });

        $('.apply-move').on('click', function(event){
            event.preventDefault();
            var path = $('#move-to-modal .availible-folders .active').attr('data-id');
            if (!path) {
                return false;
            }
            if (!contextMode) {
                $('table.ba-items-table input.select-item').each(function(){
                    var $this = $(this),
                        ind,
                        obj;
                    if ($this.prop('checked')) {
                        ind = $this.attr('data-index');
                        obj = catImages[currentCat][ind];
                        obj.resave = 1;
                        obj.category = path;
                        delete(catImages[currentCat][ind]);
                        catImages[path].push(obj);
                        $this.closest('tr').remove();
                    }
                });
                $('table.ba-category-table input[type="checkbox"]').each(function(){
                    var $this = $(this),
                        id = $this.closest('tr').attr('data-id'),
                        parent;
                    if ($this.prop('checked')) {
                        if (id != path) {
                            if ($('#'+path).find('> ul').length == 0) {
                                $('#'+path).append('<i class="zmdi zmdi-chevron-right"></i><ul></ul>');
                            }
                            parent = $('#'+id).parent();
                            $('#'+path+'> ul').append($('#'+id));
                            $this.closest('tr').remove();
                            if (parent.find('li').length == 0) {
                                parent.parent().find('i.zmdi-chevron-right').remove();
                                parent.remove();
                            }
                        }
                    }
                });
            } else {
                if (currentContext.hasClass('ba-images')) {
                    var ind = currentContext.find('input.select-item').attr('data-index'),
                        obj = catImages[currentCat][ind];
                    delete(catImages[currentCat][ind]);
                    obj.category = path;
                    obj.resave = 1;
                    catImages[path].push(obj);
                    currentContext.remove();
                } else {
                    var id = currentContext.closest('li').attr('id'),
                        parent = $('#'+id).parent();
                    if (id != path) {
                        if ($('#'+path).find('> ul').length == 0) {
                            $('#'+path).append('<i class="zmdi zmdi-chevron-right"></i><ul></ul>');
                        }
                        $('#'+path+'> ul').append($('#'+id));
                        $('tr[data-id="'+id+'"]').remove();
                        if (parent.find('li').length == 0) {
                            parent.parent().find('i.zmdi-chevron-right').remove();
                            parent.remove();
                        }
                    }
                }
            }
            reIndexArray();
            $('#'+currentCat).find('> a').trigger('click');
            showNotice($('#move-to-const').val());
            $('#move-to-modal').modal('hide');
        });

        $('div.ba-context-menu span.move-to').on('mousedown', function(event){
            if (event.button > 1) {
                return false;
            }
            contextMode = true;
            $('#move-to-modal .availible-folders .active').removeClass('active');
            $('#move-to-modal .active-button').removeClass('active-button');
            $('#move-to-modal').modal();
        });

        function UploadType(client)
        {
            setTimeout(function(){
                if (UpType.hasClass('visible-upload-type')) {
                    UpType.addClass('upload-type-out');
                    setTimeout(function(){
                        UpType.removeClass('upload-type-out visible-upload-type');
                        showType(client);
                    }, 300);
                } else {
                    showType(client);
                }
            }, 100);
        }

        function showType(client)
        {
            $('#select-upload-type').css({
                top : client.top,
                left : client.left,
            }).addClass('visible-upload-type');
        }

        $(document).on('mousedown', function(){
            if (UpType.hasClass('visible-upload-type')) {
                UpType.addClass('upload-type-out');
                setTimeout(function(){
                    UpType.removeClass('upload-type-out visible-upload-type');
                }, 300);
            }
        });

        $('.ba-context-menu .upload-images').on('mousedown', function(event){
            if (event.button > 1) {
                return false;
            }
            if (currentCat && !$(this).hasClass('disabled-item')) {
                uploadMode = 'images';
                $('#uploader-modal').attr('data-check', '').modal();
            }
        });

        $('.camera-container .upload-images').on('mousedown', function(event){
            if (event.button > 1 || $(this).parent().hasClass('active-product-tour')) {
                return false;
            }
            if (currentCat && !$(this).hasClass('disabled-item')) {
                uploadMode = 'images';
                var client = this.getBoundingClientRect();
                $('#uploader-modal').attr('data-check', '');
                fileButton.attr('multiple', true);
                UploadType(client);
            }
        });

        $('.upload-type.folder').on('click', function(){
            $('#uploader-modal').modal();
            $('.upload-type').trigger('mouseleave');
        });

        $('.upload-type.desktop').on('mousedown', function(){
            fileButton.trigger('click');
            $('.upload-type').trigger('mouseleave');
        });

        fileButton.off('change').on('change', function(event){
            if (this.files.length > 0) {
                var files = new Array(),
                    sBackdrop = jQuery('<div/>', {
                        'class' : 'saving-backdrop'
                    });
                for (var i = 0; i < this.files.length; i++) {
                    files.push(this.files[i]);
                }
                document.getElementsByTagName('body')[0].appendChild(sBackdrop[0]);
                UploadFiles(files);
            }
        });

        function UploadFiles(files)
        {
            if (files.length > 0) {
                var upload = jQuery('#saving-media').val(),
                    str = '',
                    file = files.pop(),
                    XHR = new XMLHttpRequest(),
                    url = "administrator/index.php?option=com_bagallery&task=gallery.uploadAjax&file="+file.name;
                if (XHR.upload && file.size <= 66000000) {
                    upload = JSON.parse(upload);
                    url = upload.url+url;
                    str += upload.uploading+'<img src="'+upload.url;
                    str += 'administrator/components/com_bagallery/assets/images/reload.svg"></img>';
                    if (notification.children[0].innerHTML != str) {
                        notification.children[0].innerHTML = str;
                        notification.className = 'notification-in';
                    }
                    XHR.onreadystatechange = function(e) {
                        if (XHR.readyState == 4) {
                            try {
                                var obj = JSON.parse(XHR.responseText);
                                if (obj.size == 0) {
                                    $('#file-upload-form form')[0].submit();
                                    return false;
                                }
                            } catch (error) {
                                $('#file-upload-form form')[0].submit();
                                return false;
                            }
                            if (uploadMode == 'images') {
                                var tbody = $('table.ba-items-table tbody'),
                                    img = new Image(),
                                    canvas = document.createElement('canvas'),
                                    ratio = 1;
                                obj.category = currentCat;
                                obj.imageId = imageId;
                                obj.resave = 1;
                                obj.time = +new Date();
                                obj.target = 'blank';
                                catImages[currentCat].push(obj);
                                imageId++;
                                if (tbody.find('tr').length < pagLimit) {
                                    var ind = catImages[currentCat].length - 1,
                                        str = returnTrHtml(obj, ind);
                                    tbody.append(str);
                                    tbody.find('.select-item').last().val(JSON.stringify(obj));
                                }
                                drawPaginator();
                                getAllImages();
                            } else if (uploadMode == 'reselectImage') {
                                var data = currentItem.find('.select-item').val();
                                data = JSON.parse(data);
                                data.name = obj.name;
                                data.path = obj.path;
                                data.size = obj.size;
                                data.thumbnail_url = '';
                                data.url = obj.url;
                                data.resave = 1;
                                currentItem.find('img')[0].src = obj.url;
                                currentItem.find('.select-td').next().text(obj.name).next().text(getFileSize(obj.size));
                                obj.url = obj.url.replace(new RegExp(' ', 'g'), '%20');
                                $('div.images-options div.img-thumbnail').css('background-image', 'url('+uri+obj.url+')');
                                saveImg(data);
                            } else if (uploadMode == 'album') {
                                settings = currentItem.find('> a .cat-options').val().split(';');
                                settings[5] = obj.path;
                                $('#category-options div.img-thumbnail img').remove();
                                obj.url = obj.url.replace(new RegExp(' ', 'g'), '%20');
                                $('#category-options div.img-thumbnail').css('background-image', 'url('+uri+obj.url+')');
                                currentItem.find('> a .cat-options').val(settings.join(';'));
                            } else if (uploadMode == 'watermark') {
                                $('#jform_watermark_upload').val(obj.path);
                                watermark = true;
                            }
                            UploadFiles(files);
                        }
                    };
                    XHR.open("POST", url, true);
                    XHR.send(file);
                } else {
                    showNotice(jQuery('#post-max-error').val());
                    UploadFiles(files);
                }
            } else {
                var sBackdrop = document.getElementsByClassName('saving-backdrop')[0];
                sBackdrop.className += ' animation-out';
                setTimeout(function(){
                    document.getElementsByTagName('body')[0].removeChild(sBackdrop);
                }, 300);
                showNotice($('#upload-const').val());
            }
        }

        window.uploadCallback = function(array){
            if (uploadMode == 'images') {
                for (var i = 0; i < array.length; i++) {
                    var obj = array[i],
                        tbody = $('table.ba-items-table tbody'),
                        img = new Image(),
                        canvas = document.createElement('canvas'),
                        ratio = 1;
                    obj.category = currentCat;
                    obj.imageId = imageId;
                    obj.resave = 1;
                    obj.time = +new Date();
                    obj.target = 'blank';
                    catImages[currentCat].push(obj);
                    imageId++;
                    if (tbody.find('tr').length < pagLimit) {
                        var ind = catImages[currentCat].length - 1,
                            str = returnTrHtml(obj, ind);
                        tbody.append(str);
                        tbody.find('.select-item').last().val(JSON.stringify(obj));
                    }
                    
                }
                drawPaginator();
                getAllImages();
            } else if (uploadMode == 'reselectImage') {
                var obj = array[0],
                    data = currentItem.find('.select-item').val();
                data = JSON.parse(data);
                data.name = obj.name;
                data.path = obj.path;
                data.size = obj.size;
                data.thumbnail_url = '';
                data.url = obj.url;
                data.resave = 1;
                currentItem.find('img')[0].src = obj.url;
                currentItem.find('.select-td').next().text(obj.name).next().text(getFileSize(obj.size));
                obj.url = obj.url.replace(new RegExp(' ', 'g'), '%20');
                $('div.images-options div.img-thumbnail').css('background-image', 'url('+uri+obj.url+')');
                saveImg(data);
            } else if (uploadMode == 'album') {
                var obj = array[0];
                settings = currentItem.find('> a .cat-options').val().split(';');
                settings[5] = obj.path;
                $('#category-options div.img-thumbnail img').remove();
                obj.url = obj.url.replace(new RegExp(' ', 'g'), '%20');
                $('#category-options div.img-thumbnail').css('background-image', 'url('+uri+obj.url+')');
                currentItem.find('> a .cat-options').val(settings.join(';'));
            } else if (uploadMode == 'watermark') {
                var obj = array[0];
                $('#jform_watermark_upload').val(obj.path);
                watermark = true;
            }
            var sBackdrop = document.getElementsByClassName('saving-backdrop')[0];
            sBackdrop.className += ' animation-out';
            setTimeout(function(){
                document.getElementsByTagName('body')[0].removeChild(sBackdrop);
            }, 300);
            showNotice($('#upload-const').val());
        }

        $('body').on('mousedown', function(){
            $('.context-active').removeClass('context-active');
            $('.ba-context-menu').hide();
        });

        $('.ba-custom-select').not('.aspect-ratio-select').find('> i, > span > i, input').on('click', function(event){
            event.stopPropagation();
            var $this = $(this),
                parent = $this.closest('.ba-custom-select');
            parent.find('ul').addClass('visible-select');
            parent.find('li').off('click.custom-select').one('click.custom-select', function(){
                if (!$(this).hasClass('disabled-hover-effect')) {
                    var text = this.textContent.trim(),
                        val = this.dataset.value;
                    parent.find('input').val(text).attr('data-value', val);
                    parent.trigger('customHide');
                }
            });
            parent.trigger('show');
            setTimeout(function(){
                $('body').one('click', function(){
                    $('.visible-select').removeClass('visible-select');
                });
            }, 50);
        });

        $('.aspect-ratio-select').find(' > i, input').on('click', function(event){
            var $this = $(this),
                parent = $this.parent();
            if (!parent.find('ul').hasClass('visible-select')) {
                event.stopPropagation();
                $('.visible-select').removeClass('visible-select');
                parent.find('ul').addClass('visible-select');
                parent.find('li').off('click').one('click', function(){
                    var text = this.textContent.trim(),
                        val = this.dataset.value;
                    parent.find('input[type="text"]').val(text);
                    parent.find('input[type="hidden"]').val(val).trigger('change');
                    parent.trigger('customAction');
                });
                parent.trigger('show');
                setTimeout(function(){
                    $('body').one('click', function(){
                        $('.visible-select').parent().trigger('customHide');
                        $('.visible-select').removeClass('visible-select');
                    });
                }, 50);
            }
        });

        $('.create-categery').on('mousedown', function(event){
            if (event.button > 1 || $(this).hasClass('active-product-tour')) {
                return false;
            }
            event.preventDefault();
            $('input.category-name').val('');
            $('#create-new-category').removeClass('active-button');
            $('#create-category-modal').modal();
        });

        $('#create-new-category').on('click', function(event){
            event.preventDefault();
            if ($(this).hasClass('active-button')) {
                var catName = $('input.category-name').val();
                str = '<li class="ba-category';
                str += '" id="';
                str += 'category-'+categoryId;
                str += '" data-access="1" data-password="" data-id="';
                str += '0"><a><label><i class="zmdi zmdi-folder"></i>';
                str += '</label><span>';
                str += catName+'</span><input type="hidden" class="cat-options"';
                str += ' name="cat-options[]" value="'+catName+';0;1;;'+categoryId+'">';
                str += '</a></li>';
                catImages['category-'+categoryId] = new Array();
                if (!albumMode || currentCat == 'root' || !currentCat) {
                    target.append(str);
                } else {
                    if ($('#'+currentCat).find('> ul').length == 0) {
                        $('#'+currentCat).append('<i class="zmdi zmdi-chevron-right"></i><ul></ul>');
                    }
                    $('#'+currentCat).find('> ul').append(str);
                }
                if ((albumMode && currentCat) || currentCat == 'root') {
                    str = '<tr data-id="category-'+categoryId+'"><td class="select-td">';
                    str += '<input type="checkbox"><div class="folder-icons">';
                    str += '<a class="zmdi zmdi-folder"></a><i class="zmdi zmdi-circle';
                    str += '-o"></i><i class="zmdi zmdi-check"></i></div></td>';
                    str += '<td class="draggable-handler"><a>';
                    str += catName+'</a></td><td class="draggable-handler"></td></tr>';
                    $('table.ba-category-table tbody').append(str);
                }
                $('#category-'+categoryId+' > a').trigger('click');
                categoryId++;
                showNotice($('#category-const').val());
                $('#create-category-modal').modal('hide');
            }
        });

        $('input.category-name').on('input', function(){
            if ($.trim($(this).val())) {
                $('#create-new-category').addClass('active-button');
            } else {
                $('#create-new-category').removeClass('active-button');
            }
        });

        $('label.settings').on('click', function(){
            if (!$(this).hasClass('active-product-tour')) {
                $('#global-options').modal()
            }
        });

        target.on('click', 'i.zmdi-chevron-right', function(){
            if ($(this).closest('li').hasClass('visible-branch')) {
                $(this).closest('li').removeClass('visible-branch');
            } else {
                $(this).closest('li').addClass('visible-branch');
            }
        });

        $('li.root > a').on('click', function(){
            $('#check-all').removeAttr('checked');
            $('div.gallery-options > div').hide();
            $('').hide();
            target.find('.active').removeClass('active');
            $(this).closest('li').addClass('active');
            var tbody = $('table.ba-items-table tbody').empty();
            $('table.ba-category-table tbody').empty();
            $('div.gallery-options > img').show();
            if (!albumMode) {
                $('.upload-images').addClass('disabled-item').parent().addClass('disabled-item');
            } else {
                $('.upload-images').removeClass('disabled-item').parent().removeClass('disabled-item');
            }
            currentCat = 'root';
            $('li.root > ul > li').each(function(){
                var $this = $(this);
                    str = '<tr data-id="'+$this.attr('id')+'"';
                    if ($this.attr('id') == 'category-all') {
                        str += ' class="category-all"';
                    }
                    str += '><td class="select-td">';
                    str += '<input type="checkbox"><div class="folder-icons">';
                    str += '<a class="zmdi zmdi-folder"></a><i class="zmdi zmdi-circle';
                    str += '-o"></i><i class="zmdi zmdi-check"></i></div></td>';
                    str += '<td class="draggable-handler"><a>';
                    str += $this.find('> a span').text();
                    str += '</a></td><td class="draggable-handler"></td></tr>';
                    $('table.ba-category-table tbody').append(str);
            });
            catImages['root'].forEach(function(el, ind){
                var str = returnTrHtml(el, ind);
                tbody.append(str);
                tbody.find('.select-item').last().val(JSON.stringify(el))
            });
            drawPaginator();
            getAllImages();
        });

        $('table.ba-category-table').on('click', 'div.folder-icons', function(){
            var checkbox = $(this).closest('td.select-td').find('input[type="checkbox"]');
            if (checkbox.prop('checked')) {
                checkbox.removeAttr('checked');
                var flag = true;
                $('tr input[type="checkbox"]').each(function(){
                    if ($(this).prop('checked')) {
                        flag = false;
                    }
                });
                if (flag) {
                    $('i.move-to, i.delete-selected, i.filename-to-title').addClass('disabled-item');
                }
            } else {
                checkbox.attr('checked', true);
                $('i.delete-selected, i.filename-to-title').removeClass('disabled-item');
                if (albumMode) {
                    $('i.move-to').addClass('disabled-item');
                }
            }
        });

        $('table.ba-category-table').on('click', 'a', function(event){
            event.preventDefault();
            var id = $(this).closest('tr').attr('data-id');
            $('#'+id+'> a').trigger('click');
        });

        target.on('click', 'a', function(event){
            event.stopPropagation();
            var li = $(this).closest('li'),
                id = li.attr('id'),
                access = li[0].dataset.access,
                password = li[0].dataset.password,
                tbody = $('table.ba-items-table tbody').empty(),
                catTable = $('table.ba-category-table tbody').empty(),
                parent = $(this).closest('li').parent();
            if (!parent.hasClass('root-list')) {
                parent.parentsUntil('ul.root-list').each(function(){
                    $(this).addClass('visible-branch');
                })
            }
            $('#check-all').removeAttr('checked');
            $('i.move-to, i.delete-selected, i.filename-to-title').addClass('disabled-item');
            $('div.category-list li.active').removeClass('active');
            $(this).closest('li').addClass('active');
            currentItem = $(this).closest('li');
            settings = currentItem.find('.cat-options').val().split(';');
            $('#category-options div.img-thumbnail').hide();
            $('#access')[0].dataset.value = access;
            access = $('.access-select li[data-value="'+access+'"]').text();
            access = $.trim(access);
            $('#access').val(access);
            if (id != 'category-all') {
                if (albumMode) {
                    $('#category-options div.img-thumbnail').show();
                }
                if (!settings[5]) {
                    settings[5] = '/components/com_bagallery/assets/images/gallery-logo-category.svg';
                    $('#category-options div.img-thumbnail').css('background-image', '');
                    $('#category-options div.img-thumbnail img').remove();
                    $('#category-options div.img-thumbnail').append('<img src="'+uri+settings[5]+'">');
                } else {
                    $('#category-options div.img-thumbnail img').remove();
                    settings[5] = settings[5].replace(new RegExp(' ', 'g'), '%20');
                    $('#category-options div.img-thumbnail').css('background-image', 'url('+uri+settings[5]+')');
                }                
            }
            $('div.gallery-options > img').hide();
            $('i.add-link').parent().hide();
            $('i.add-embed-code').parent().hide();
            $('#category-name').val(settings[0]);
            if (settings[8]) {
                $('input.category-alias').val(settings[8]);
            } else {
                $('input.category-alias').val(settings[0].toLowerCase().replace(new RegExp(" ", 'g'), '-'));
            }
            $('#category-options, div.gallery-options div.gallery-header').show();
            $('div.images-options').hide();
            if (settings[1] == 1) {
                $('.default-category').attr('checked', true);
            } else {
                $('.default-category').removeAttr('checked');
            }
            if (settings[2] == '0') {
                $('.unpublish-category').attr('checked', true);
            } else {
                $('.unpublish-category').removeAttr('checked');
            }
            if (id != 'category-all') {
                $('.category-password').parent().css('display', '').prev().css('display', '');
                $('.category-password').val(password);
                if (password) {
                    $('.default-category').closest('div').hide();
                } else if (!albumMode) {
                    $('.default-category').closest('div').css('display', '');
                }
                if (settings[1] == 1) {
                    $('.category-password').parent().hide().prev().hide();
                } else {
                    $('.category-password').parent().css('display', '').prev().css('display', '');
                }
                currentCat = id;
                catImages[id].forEach(function(el, ind){
                    if (ind >= pagLimit && pagLimit != 1) {
                        return false;
                    }
                    var str = returnTrHtml(el, ind);
                    tbody.append(str);
                    tbody.find('.select-item').last().val(JSON.stringify(el))
                });
                drawPaginator();
                getAllImages();
                $(this).closest('li').find('> ul > li').each(function(){
                    var $this = $(this);
                    str = '<tr data-id="'+$this.attr('id')+'"><td class="select-td">';
                    str += '<input type="checkbox"><div class="folder-icons">';
                    str += '<a class="zmdi zmdi-folder"></a><i class="zmdi zmdi-circle';
                    str += '-o"></i><i class="zmdi zmdi-check"></i></div></td>';
                    str += '<td class="draggable-handler"><a>';
                    str += $this.find('> a span').text();
                    str += '</a></td><td class="draggable-handler"></td></tr>';
                    catTable.append(str);
                });
            } else {
                $('.category-password').parent().hide().prev().hide();
                currentCat = '';
                $('div.table-body div.pagination').remove();
            }
            if (currentCat) {
                $('.upload-images').removeClass('disabled-item').parent().removeClass('disabled-item');
            } else {
                $('.upload-images').addClass('disabled-item').parent().addClass('disabled-item');
            }
        });

        function returnTrHtml(el, ind)
        {
            if (!el.likes) {
                el.likes = 0;
            }
            var str = '<tr class="ba-images"><td class="select-td"><label ';
            str += 'class="ba-image">';
            str += '<input data-index="'+ind;
            str += '" class="select-item" type="checkbox" value="';
            str += '"><i class="zmdi zmdi-circle-o"></i><i class="zmdi';
            str += ' zmdi-check"></i></label><img data-src="'+showUrl+encodeURIComponent(el.path);
            str += '"></td><td class="draggable-handler">';
            str += el.name+'</td><td class="draggable-handler">';
            str += getFileSize(el.size)+'</td><td class="likes-container';
            if (el.likes * 1 > 0) {
                str += ' liked';
            }
            str += '">';
            str += '<i class="zmdi zmdi-favorite"></i><span>'+el.likes+'</span></td></tr>';

            return str;
        }

        $('div.images-options div.img-thumbnail .camera-container').on('click', function(){
            var client = $(this).find('i')[0].getBoundingClientRect();
            fileButton.removeAttr('multiple');
            UploadType(client);
            $('#uploader-modal').attr('data-check', 'single');
            uploadMode = 'reselectImage';
        });

        $('.alternative-image').on('click', function(){
            $('#uploader-modal').attr('data-check', 'single').modal();
            uploadMode = 'alternativeImage';
        });

        $('.delete-alternative-image').on('click', function(){
            var obj = currentItem.find('.select-item').val();
            obj = JSON.parse(obj);
            obj.alternative = '';
            obj.resave = 1;
            $('.alternative-image').val('');
            saveImg(obj);
        });

        $('.image-suffix').on('input', function(){
            var obj = currentItem.find('.select-item').val();
            obj = JSON.parse(obj);
            obj.suffix = this.value.trim();
            obj.resave = 1;
            saveImg(obj);
        });

        $('#category-options div.img-thumbnail .camera-container').on('click', function(){
            var client = $(this).find('i')[0].getBoundingClientRect();
            fileButton.removeAttr('multiple');
            UploadType(client);
            $('#uploader-modal').attr('data-check', 'single');
            uploadMode = 'album';
        });

        $('#category-name').on('input', function(){
            var name = $.trim($(this).val());
            settings = currentItem.find('.cat-options').val().split(';');
            name = name.replace(new RegExp(';', 'g'), '');
            settings[0] = name;
            currentItem.find('> a .cat-options').val(settings.join(';'));
            currentItem.find('> a span').text(name);
        });

        $('.category-alias').on('input', function(){
            var name = $(this).val();
            settings = currentItem.find('.cat-options').val().split(';');
            name = name.replace(new RegExp(";",'g'), '');
            name = name.toLowerCase().replace(new RegExp(" ", 'g'), '-');
            settings[8] = name;
            currentItem.find('> a .cat-options').val(settings.join(';'));
        });

        $('.category-password').on('input', function(){
            currentItem[0].dataset.password = this.value.trim();
            if (currentItem[0].dataset.password) {
                $('.default-category').closest('div').hide();
            } else {
                $('.default-category').closest('div').css('display', '');
            }
        });

        $('.hidden-password').on('click', function(){
            this.style.display = 'none';
            $('.visible-password').css('display', '');
            $('.category-password').attr('type', 'text');
        });

        $('.visible-password').on('click', function(){
            this.style.display = 'none';
            $('.hidden-password').css('display', '');
            $('.category-password').attr('type', 'password');
        });

        $('.access-select').on('customHide', function(){
            var access = $('#access')[0].dataset.value;
            currentItem[0].dataset.access = access;
        }).on('show', function(){
            var value = $(this).find('#access').attr('data-value');
            $(this).find('li').each(function(){
                var $this = $(this).removeClass('selected');
                $this.find('i.zmdi-check').remove();
                if ($this.attr('data-value') == value) {
                    $this.addClass('selected').prepend('<i class="zmdi zmdi-check"></i>');
                }
            });
        });

        $('.default-category').on('change', function(){
            settings = currentItem.find('.cat-options').val().split(';');
            if (!$(this).prop('checked')) {
                var options = $('#category-all').find('.cat-options').val().split(';');
                if (options[2] == 0) {
                    $(this).attr('checked', true);
                    $('#message-dialog').modal();
                    $('#message-dialog .cannot-unpublish').show();
                    $('#message-dialog .cannot-default').hide();
                    $(this).attr('checked', true);
                    return false;
                }
            }
            if (!$(this).prop('checked') && settings[3] == '*') {
                $(this).attr('checked', true);
                return false;
            }
            if (settings[2] != 0 && currentItem.closest('li.ba-unpublish').length == 0) {
                $('.cat-options').each(function(){
                    var option = $(this).val();
                    option = option.split(';');
                    option[1] = 0;
                    $(this).parent().find('> .zmdi-star').remove();
                    option = option.join(';');
                    $(this).val(option);
                });
                if (settings[1] == 1) {
                    settings[1] = 0;
                    currentItem.find('> a > .zmdi-star').remove();
                    checkDefault();
                } else {
                    settings[1] = 1;
                    currentItem.find('> a').append('<i class="zmdi zmdi-star"></i>');
                }
                if (settings[1] == 1) {
                    $('.category-password').parent().hide().prev().hide();
                } else {
                    $('.category-password').parent().css('display', '').prev().css('display', '');
                }
                currentItem.find('> a .cat-options').val(settings.join(';'));
            } else {
                $(this).removeAttr('checked');
                $('#message-dialog').modal();
                $('#message-dialog .cannot-unpublish').hide();
                $('#message-dialog .cannot-default').show();
            }
        });

        $('.unpublish-category').on('click', function(){
            settings = currentItem.find('.cat-options').val().split(';');
            if (settings[1] != 1 && currentItem.find('.zmdi.zmdi-star').length == 0) {
                if (settings[2] == 1) {
                    settings[2] = 0;
                    currentItem.addClass('ba-unpublish');
                } else {
                    settings[2] = 1;
                    currentItem.removeClass('ba-unpublish');
                }
                currentItem.find('> a .cat-options').val(settings.join(';'));
            } else {
                $(this).removeAttr('checked');
                $('#message-dialog').modal();
                $('#message-dialog .cannot-unpublish').show();
                $('#message-dialog .cannot-default').hide();
            }
        });

        $('.general-tabs ul.uploader-nav').on('show', function(event){
            var ind = new Array(),
                id = $(event.relatedTarget).attr('href'),
                aId = $(event.target).attr('href');
            $(this).find('li a').each(function(i){
                if (this == event.target) {
                    ind[0] = i;
                }
                if (this == event.relatedTarget) {
                    ind[1] = i;
                }
            });
            if (ind[0] > ind[1]) {
                $(id).addClass('out-left');
                $(aId).addClass('right');
                setTimeout(function(){
                    $(id).removeClass('out-left');
                    $(aId).removeClass('right');
                }, 500);
            } else {
                $(id).addClass('out-right');
                $(aId).addClass('left');
                setTimeout(function(){
                    $(id).removeClass('out-right');
                    $(aId).removeClass('left');
                }, 500);
            }
        }).on('shown', function(event){
            setTabsUnderline();
        });

        $('#global-options').one('shown', function(){
            setTabsUnderline();
        });

        $('#photo-editor-dialog').on('shown', function(){
            setTabsUnderline();
        });

        $('input.link-target+i+ul li').on('click', function(){
            $('input.link-target+i+ul li.selected').removeClass('selected');
            $('input.link-target+i+ul i.zmdi-check').remove();
            $(this).addClass('selected').prepend('<i class="zmdi zmdi-check"></i>');
        });

        $('i.add-link').on('click', function(){
            var obj = currentItem.find('.select-item').val();
            obj = JSON.parse(obj);
            $('input.image-link').val(obj.link);
            $('input.link-target').parent().find('ul li').each(function(){
                var $this = $(this);
                if ($this.attr('data-value') == obj.target) {
                    $('input.link-target').attr('data-value', $this.attr('data-value')).val($this.text());
                    return false;
                }
            });
            $('input.link-target+i+ul li').each(function(){
                var $this = $(this).removeClass('selected');
                $this.find('i.zmdi-check').remove();
                if ($this.attr('data-value') == obj.target) {
                    $this.addClass('selected').prepend('<i class="zmdi zmdi-check"></i>');
                }
            });
            $('#add-link-modal').modal();
        });

        $('.select-link').on('click', function(){
            $.ajax({
                type: "POST",
                dataType: 'text',
                url: "index.php?option=com_bagallery&task=gallery.getLinksString",
                complete: function(msg){
                    $('.apply-link').removeClass('active-button');
                    $('#link-select-modal .availible-folders').html(msg.responseText);
                    if ($('#menu-item-add-modal').hasClass('in')) {
                        $('#link-select-modal .availible-folders > ul > li').last().hide();
                    }
                    $('#link-select-modal').modal();
                }
            });
        });

        $('#link-select-modal .availible-folders').on('click', 'i.zmdi-chevron-right', function(event){
            event.stopPropagation();
            if ($(this).parent().hasClass('visible-branch')) {
                $(this).parent().removeClass('visible-branch');
            } else {
                $(this).parent().addClass('visible-branch');
            }
        });

        $('#link-select-modal .availible-folders').on('click', 'li[data-url]', function(event){
            event.stopPropagation();
            if (this.dataset.url) {
                $('#link-select-modal .availible-folders .active').removeClass('active');
                this.classList.add('active');
                $('.apply-link').addClass('active-button');
            }
        });

        $('.apply-link').on('click', function(){
            if (this.classList.contains('active-button')) {
                $('.image-link').val($('#link-select-modal .availible-folders li.active')[0].dataset.url);
                $('#link-select-modal').modal('hide');
            }
        })

        $('#add-link').on('click', function(event){
            event.preventDefault();
            var obj = currentItem.find('.select-item').val();
            obj = JSON.parse(obj);
            obj.link = $('input.image-link').val();
            obj.target = $('input.link-target').attr('data-value');
            obj.resave = 1;
            saveImg(obj);
            $('#add-link-modal').modal('hide');
        });

        $('i.add-embed-code').on('click', function(){
            var obj = currentItem.find('.select-item').val();
            obj = JSON.parse(obj);
            $('.ba-embed').val(obj.video)
            $('#embed-modal').modal();
        });
        
        $('#embed-apply').on('click', function(){
            var value = $('.ba-embed').val(),
                obj = currentItem.find('.select-item').val();
            obj = JSON.parse(obj);
            obj.video = value;
            obj.resave = 1;
            saveImg(obj);
            $('#embed-modal').modal('hide');
        });

        $('i.edit-description').on('click', function(){
            if (currentItem.hasClass('ba-category')) {
                settings = currentItem.find('.cat-options').val().split(';');
                if (settings[7]) {
                    settings[7] = settings[7].replace(new RegExp("-_-", 'g'), ';');
                }
                CKE.setData(settings[7]);
            } else {
                var obj = currentItem.find('.select-item').val();
                obj = JSON.parse(obj);
                CKE.setData(obj.description);
            }
            $('#html-editor').modal();
        });

        function filenameToTitle(el)
        {
            var name = el.name.split('.'),
                title = '';
            for (var i = 0; i < name.length - 1; i++) {
                title += name[i];
            }
            title = title.replace(/-/g, ' ').replace(/_/g, ' ');
            el.title = el.alt = title;
            el.lightboxUrl = '';
            el.resave = 1;
        }

        $('i.filename-to-title').on('click', function(){
            if (!this.classList.contains('disabled-item')) {
                if ($('table.ba-category-table [data-id="category-all"] input[type="checkbox"]').prop('checked')) {
                    $('table.ba-category-table tr:not([data-id="category-all"])').each(function(){
                        catImages[this.dataset.id].forEach(function(el){
                            filenameToTitle(el);
                        });
                    });
                } else {
                    $('table.ba-category-table tr input[type="checkbox"]').each(function(){
                        if (this.checked) {
                            var id = $(this).closest('tr').attr('data-id');
                            catImages[id].forEach(function(el){
                                filenameToTitle(el);
                            });
                            $('#'+id+' ul li').each(function(){
                                catImages[this.id].forEach(function(el){
                                    filenameToTitle(el);
                                });
                            });
                        }
                    });
                    $('td.select-td input.select-item').each(function(){
                        if (this.checked) {
                            filenameToTitle(catImages[currentCat][this.dataset.index]);
                            var obj = JSON.stringify(catImages[currentCat][this.dataset.index]);
                            this.value = obj;
                            if ($(this).closest('tr.ba-images').hasClass('active')) {
                                $(this).trigger('click');
                            }
                        }
                    });
                }
                showNotice(galleryLanguage['TITLES_MOVED']);
            }
        });

        $('i.delete-selected').on('click', function(){
            deleteMode = 'array';
            contextMode = false;
            var flag = false;
            $('table.ba-items-list input[type="checkbox"]').each(function(){
                if ($(this).prop('checked')) {
                    flag = true;
                    return false;
                }
            });
            if (flag) {
                if ($('table.ba-category-table [data-id="category-all"] input[type="checkbox"]').prop('checked')) {
                    $('.cannot-delete').show();
                    $('.can-delete, #delete-dialog h3').hide();
                    $('#apply-delete').addClass('disabled-button');
                } else {
                    $('table.ba-category-table tr input[type="checkbox"]').each(function(){
                        var $this = $(this),
                            id = $this.closest('tr').attr('data-id'),
                            parent;
                        if ($this.prop('checked')) {
                            settings = $('#'+id).find('.cat-options').val().split(';');
                            if (settings[1] == 1) {
                                flag = false;
                                return false;
                            }
                        }
                    });
                    if (!flag) {
                        $('#deafult-message-dialog').modal();
                        return false;
                    }
                    $('.cannot-delete').hide();
                    $('.can-delete, #delete-dialog h3').show();
                    $('#apply-delete').removeClass('disabled-button');
                }
                $('#delete-dialog').modal();
            }
        });

        $('i.delete-item').on('click', function(){
            deleteMode = 'single';
            contextMode = false;
            if (currentItem.attr('id') == 'category-all') {
                $('.cannot-delete').show();
                $('.can-delete, #delete-dialog h3').hide();
                $('#apply-delete').addClass('disabled-button');
            } else {
                if (currentItem.hasClass('ba-category')) {
                    settings = currentItem.find('.cat-options').val().split(';');
                    if (settings[1] == 1) {
                        $('#deafult-message-dialog').modal();
                        return false;
                    }
                }
                $('.cannot-delete').hide();
                $('.can-delete, #delete-dialog h3').show();
                $('#apply-delete').removeClass('disabled-button');
            }
            $('#delete-dialog').modal();
        });

        $('div.ba-context-menu span.delete').on('mousedown', function(event){
            if (event.button > 1) {
                return false;
            }
            contextMode = true;
            if (currentContext.closest('li').attr('id') == 'category-all') {
                $('.cannot-delete').show();
                $('.can-delete, #delete-dialog h3').hide();
                $('#apply-delete').addClass('disabled-button');
            } else {
                if (currentContext.closest('li').hasClass('ba-category')) {
                    settings = currentContext.closest('li').find('.cat-options').val().split(';');
                    if (settings[1] == 1) {
                        $('#deafult-message-dialog').modal();
                        $('div.ba-context-menu').hide();
                        return false;
                    }
                }                
                $('.cannot-delete').hide();
                $('.can-delete, #delete-dialog h3').show();
                $('#apply-delete').removeClass('disabled-button');
            }
            $('#delete-dialog').modal();
        });

        $('#apply-delete').on('click', function(event){
            event.preventDefault();
            if ($(this).hasClass('disabled-button')) {
                return false;
            }
            if (!contextMode) {
                if (deleteMode == 'single') {
                    if (currentItem.hasClass('ba-category')) {
                        delete(catImages[currentCat]);
                        $('table.ba-items-table tbody').empty();
                        $('.upload-images').addClass('disabled-item').parent().addClass('disabled-item');
                    } else {
                        var ind = currentItem.find('.select-item').attr('data-index');
                        delete(catImages[currentCat][ind]);
                    }
                    var parent = currentItem.parent();
                    currentItem.remove();
                    if (parent[0].localName == 'ul') {
                        if (parent.find('> li').length == 0) {
                            parent = parent.parent();
                            parent.find('i.zmdi-chevron-right').remove();
                            parent.find('> ul').remove();
                        }
                    }
                } else {
                    $('td.select-td input.select-item').each(function(){
                        var $this = $(this);
                        if ($this.prop('checked')) {
                            delete(catImages[currentCat][$this.attr('data-index')]);
                            $this.closest('tr').remove();
                        }
                    });
                    $('table.ba-category-table tr input[type="checkbox"]').each(function(){
                        var $this = $(this),
                            id = $this.closest('tr').attr('data-id'),
                            parent;
                        if ($this.prop('checked')) {
                            delete(catImages[id]);
                            parent = $('#'+id).parent();
                            $('#'+id).remove();
                            if (!parent.hasClass('root-list')) {
                                if (parent.find('> li').length == 0) {
                                    parent = parent.parent();
                                    parent.find('i.zmdi-chevron-right').remove();
                                    parent.find('> ul').remove();
                                }
                            }
                            $this.closest('tr').remove();
                        }
                    });
                }
            } else {
                if (currentContext.hasClass('ba-images')) {
                    var ind = currentContext.find('input.select-item').attr('data-index');
                    delete(catImages[currentCat][ind]);
                    currentContext.remove();
                } else {
                    var id = currentContext.closest('li').attr('id'),
                        parent = $('#'+id).parent();
                    $('tr[data-id="'+id+'"]').remove();
                    var parent = currentContext.closest('li').parent();
                    currentContext.closest('li').remove();
                    if (parent[0].localName == 'ul') {
                        if (parent.find('> li').length == 0) {
                            parent = parent.parent();
                            parent.find('i.zmdi-chevron-right').remove();
                            parent.find('> ul').remove();
                        }
                    }
                }
            }
            $('div.table-body').find('.pagination').remove();
            if (deleteMode != 'single' || !currentItem.hasClass('ba-category')) {
                reIndexArray();
                $('#'+currentCat).find('> a').trigger('click');
            }
            showNotice($('#delete-const').val());
            $('div.gallery-options > div').hide();
            $('#delete-dialog').modal('hide');
        });

        $('#apply-html').on('click', function(event){
            event.preventDefault();
            if (currentItem.hasClass('ba-category')) {
                settings = currentItem.find('> a .cat-options').val().split(';');
                settings[7] = CKE.getData().replace(new RegExp(";", 'g'), '-_-');
                currentItem.find('> a .cat-options').val(settings.join(';'));
            } else {
                var obj = currentItem.find('.select-item').val();
                obj = JSON.parse(obj);
                obj.description = CKE.getData();
                obj.resave = 1;
                saveImg(obj);
            }
            $('#html-editor').modal('hide');
        });

        $('table.ba-items-table').on('click', 'tr', function(){
            $('tr.active').removeClass('active');
            $(this).addClass('active');
            $('#category-options').hide();
            $('div.images-options, div.gallery-options div.gallery-header').show();
            $('i.add-link').parent().show();
            $('i.add-embed-code').parent().show();
            currentItem = $(this);
            var obj = currentItem.find('.select-item').val();
            obj = JSON.parse(obj);
            if (!obj.tags) {
                obj.tags = new Array();
            }
            if (!obj.colors) {
                obj.colors = new Array();
            }
            $('.picked-tags .tags-chosen').remove();
            $('select.meta_tags').empty();
            $('.all-tags li').removeClass('selected-tag');
            $('.meta-tags .picked-tags .search-tag input').val('');
            $('.all-tags li').hide();
            obj.tags.forEach(function(el){
                var title = el.title,
                    tagId = el.id,
                    str = '<li class="tags-chosen"><span>';
                $('.all-tags li[data-id="'+tagId+'"]').addClass('selected-tag');
                str += title+'</span><i class="zmdi zmdi-close" data-remove="'+tagId+'"></i></li>';
                $('.picked-tags .search-tag').before(str);
                str = '<option value="'+tagId+'" selected>'+title+'</option>';
                $('select.meta_tags').append(str);
            });
            $('.picked-colors .colors-chosen').remove();
            $('select.image_colors').empty();
            $('.all-colors li').removeClass('selected-colors');
            $('.image-colors .picked-colors .search-colors input').val('');
            $('.all-colors li').hide();
            obj.colors.forEach(function(el){
                var title = el.title,
                    tagId = el.id,
                    str = '<li class="colors-chosen"><span><span class="chosen-color" style="background-color: ';
                $('.all-colors li[data-id="'+tagId+'"]').addClass('selected-colors');
                str += title+';"></span><span>'+title+'</span><i class="zmdi zmdi-close" data-remove="'+tagId+'"></i></li>';
                $('.picked-colors .search-colors').before(str);
                str = '<option value="'+tagId+'" selected>'+title+'</option>';
                $('select.image_colors').append(str);
            });
            $('div.gallery-options > img').hide();
            obj.url = obj.url.replace(new RegExp(' ', 'g'), '%20');
            $('div.images-options div.img-thumbnail').css('background-image', 'url('+uri+obj.url+')');
            $('input.image-title').val(obj.title);
            if (obj.lightboxUrl) {
                $('input.image-alias').val(obj.lightboxUrl);
            } else {
                if (obj.title) {
                    $('input.image-alias').val(obj.title.toLowerCase().replace(new RegExp(" ", 'g'), "-"));
                } else {
                    $('input.image-alias').val('');
                }
            }
            $('input.image-short').val(obj.short);
            $('input.image-alt').val(obj.alt);
            $('.alternative-image').val(obj.alternative ? obj.alternative : '');
            $('.image-suffix').val(obj.suffix ? obj.suffix : '');
            if (obj.hideInAll && obj.hideInAll == 1) {
                $('.hide-in-category-all').attr('checked', true);
            } else {
                $('.hide-in-category-all').removeAttr('checked');
            }
        });

        $('.hide-in-category-all').on('click', function(){
            var value = $(this).prop('checked') ? 1 : 0,
                obj = currentItem.find('.select-item').val();
            obj = JSON.parse(obj);
            obj.hideInAll = value;
            obj.resave = 1;
            saveImg(obj);
        });

        $('input.image-title').on('input', function(){
            var value = $(this).val(),
                obj = currentItem.find('.select-item').val();
            obj = JSON.parse(obj);
            value = strip_tags(value);
            obj.title = value;
            obj.resave = 1;
            saveImg(obj);
        });
        
        $('input.image-alias').on('input', function(){
            var value = $(this).val().toLowerCase(),
                obj = currentItem.find('.select-item').val();
            obj = JSON.parse(obj);
            value = strip_tags(value);
            obj.lightboxUrl = value.replace(new RegExp(" ", 'g'), "-");
            obj.resave = 1;
            saveImg(obj);
        });
        
        $('.image-short').on('input', function(){
            var value = $(this).val(),
                obj = currentItem.find('.select-item').val();
            obj = JSON.parse(obj);
            value = strip_tags(value);
            obj.short = value;
            obj.resave = 1;
            saveImg(obj);
        });
        
        $('.image-alt').on('input', function(){
            var value = $(this).val(),
                obj = currentItem.find('.select-item').val();
            obj = JSON.parse(obj);
            value = strip_tags(value);
            obj.alt = value;
            obj.resave = 1;
            saveImg(obj);
        });

        $('.meta-tags .picked-tags .search-tag input').on('keydown', function(event){
            var title = $(this).val().trim().toLowerCase();
            if (event.keyCode == 13) {
                if (!title) {
                    this.value = '';
                    return false;
                }
                var str = '<li class="tags-chosen"><span>',
                    tagId = 'new$'+title;
                $('.all-tags li').each(function(){
                    var search = $(this).text().trim().toLowerCase();
                    if (title == search) {
                        this.classList.add('selected-tag');
                        tagId = this.dataset.id;
                        return false;
                    }
                });
                if ($('.picked-tags .tags-chosen i[data-remove="'+tagId+'"]').length > 0) {
                    return false;
                }
                str += title+'</span><i class="zmdi zmdi-close" data-remove="'+tagId+'"></i></li>';
                $('.picked-tags .search-tag').before(str);
                str = '<option value="'+tagId+'" selected>'+title+'</option>';
                $('select.meta_tags').append(str);
                $(this).val('');
                $('.all-tags li').hide();
                saveTags();
                event.stopPropagation();
                event.preventDefault();
                return false;
            } else {
                $('.all-tags li').each(function(){
                    var search = $(this).text().trim().toLowerCase();
                    if (search.indexOf(title) < 0 || title == '') {
                        $(this).hide();
                    } else {
                        $(this).show();
                    }
                });
            }
        });

        $('.all-tags').on('click', 'li', function(){
            if (this.classList.contains('selected-tag')) {
                return false;
            }
            var title = $(this).text().trim(),
                tagId = this.dataset.id;
            var str = '<li class="tags-chosen"><span>';
            str += title+'</span><i class="zmdi zmdi-close" data-remove="'+tagId+'"></i></li>';
            $('.picked-tags .search-tag').before(str);
            str = '<option value="'+tagId+'" selected>'+title+'</option>';
            $('select.meta_tags').append(str);
            $('.meta-tags .picked-tags .search-tag input').val('');
            $('.all-tags li').hide();
            this.classList.add('selected-tag');
            saveTags();
        });

        $('.meta-tags .picked-tags').on('click', '.zmdi.zmdi-close', function(){
            var del = this.dataset.remove;
            $('select.meta_tags option[value="'+del+'"]').remove();
            $(this).closest('li').remove();
            $('.all-tags li[data-id="'+del+'"]').removeClass('selected-tag');
            $('.all-tags li').hide();
            saveTags();
        });

        $('.image-colors .picked-colors .search-colors input').on('keydown', function(event){
            var title = $(this).val().trim().toLowerCase();
            if (event.keyCode == 13) {
                if (!title) {
                    this.value = '';
                    return false;
                }
                var str = '<li class="colors-chosen"><span class="chosen-color" style="background-color: ',
                    tagId = 'new$'+title;
                $('.all-colors li').each(function(){
                    var search = $(this).text().trim().toLowerCase();
                    if (title == search) {
                        this.classList.add('selected-colors');
                        tagId = this.dataset.id;
                        return false;
                    }
                });
                if ($('.picked-colors .colors-chosen i[data-remove="'+tagId+'"]').length > 0) {
                    return false;
                }
                str += title+';"></span><span>'+title+'</span><i class="zmdi zmdi-close" data-remove="';
                str += tagId+'"></i></li>';
                $('.picked-colors .search-colors').before(str);
                str = '<option value="'+tagId+'" selected>'+title+'</option>';
                $('select.image_colors').append(str);
                $(this).val('');
                $('.all-colors li').hide();
                saveColors();
                event.stopPropagation();
                event.preventDefault();
                return false;
            }
        });

        $('.image-colors .picked-colors').on('click', '.zmdi.zmdi-close', function(){
            var del = this.dataset.remove;
            $('select.image_colors option[value="'+del+'"]').remove();
            $(this).closest('li').remove();
            $('.all-colors li[data-id="'+del+'"]').removeClass('selected-colors');
            $('.all-colors li').hide();
            saveColors();
        });

        $('table.ba-items-table tbody').sortable({
            cancel: null,
            cursorAt: {
                left: 90,
                top: 20
            },
            handle : '.draggable-handler',
            tolerance: 'pointer',
            stop : function(event, ui){
                ui.item.addClass('ba-dropping-helper');
                setTimeout(function(){
                    ui.item.removeClass('ba-dropping-helper');
                }, 500);
                var page = $('.pagination-list li.ba-pages.active a').attr('data-page');
                if (!page) {
                    page = 0;
                }
                var sItems = $(this).find('tr input.select-item'),
                    max = page * pagLimit + sItems.length,
                    ind = 0;
                for (var i = page * pagLimit; i < max; i++) {
                    var $this = $(sItems[ind]);
                    obj = $this.val();
                    $this.attr('data-index', i);
                    obj = JSON.parse(obj);
                    catImages[currentCat][i] = obj;
                    ind++;
                }
            }
        }).disableSelection();

        $('table.ba-category-table tbody').sortable({
            cancel: null,
            cursorAt: {
                left: 90,
                top: 20
            },
            handle : '.draggable-handler',
            tolerance: 'pointer',
            stop : function(event, ui){
                ui.item.addClass('ba-dropping-helper');
                setTimeout(function(){
                    ui.item.removeClass('ba-dropping-helper');
                }, 500);
                var id,
                    items,
                    ul = document.createElement('ul');
                $(this).find('tr').each(function(ind, el){
                    id = $(this).attr('data-id');
                    ul.appendChild($('#'+id)[0]);
                });
                $('div.category-list li.active > ul').html(ul.innerHTML)
            }
        }).disableSelection();

        $('.ba-tooltip').each(function(){
            $(this).parent().on('mouseenter', function(){
                if (this.dataset.value == 10 && !this.classList.contains('disabled-hover-effect')) {
                    return false;
                }
                var tooltip = $(this).find('.ba-tooltip'),
                    coord = this.getBoundingClientRect(),
                    top = coord.top,
                    data = tooltip.html(),
                    center = (coord.right - coord.left) / 2;
                    className = tooltip[0].className;
                center = coord.left + center;
                if (tooltip.hasClass('ba-bottom')) {
                    top = coord.bottom;
                }
                $('body').append('<span class="'+className+'">'+data+'</span>');
                var tooltip = $('body > .ba-tooltip').last(),
                    width = tooltip.outerWidth(),
                    height = tooltip.outerHeight();
                if (tooltip.hasClass('ba-top') || tooltip.hasClass('ba-help')) {
                    top -= (15 + height);
                    center -= (width / 2)
                } else if (tooltip.hasClass('ba-bottom')) {
                    top += 10;
                    center -= (width / 2)
                } else if (tooltip.hasClass('ba-left')) {
                    center -= width + (coord.right - coord.left) / 2;
                }
                var screen = document.documentElement.clientWidth;
                if (center + width > screen) {
                    center = coord.right - width;
                    tooltip.addClass('offset-left');
                }
                tooltip.css({
                    'top' : top+'px',
                    'left' : center+'px'
                }).on('mousedown', function(event){
                    event.stopPropagation();
                });
            }).on('mouseleave', function(){
                var tooltip = $('body').find(' > .ba-tooltip');
                tooltip.addClass('tooltip-hidden');
                setTimeout(function(){
                    tooltip.remove();
                }, 500);
            });
        });

        $('#jform_watermark_upload').on('click', function(){
            $('#uploader-modal').modal().attr('data-check', 'single');
            uploadMode = 'watermark';
        });

        $('#remove-watermark').on('click', function(event){
            event.preventDefault();
            $('#jform_watermark_upload').val('');
            watermark = true;
        });

        $('#jform_watermark_position').prev().on('customHide', function(){
            watermark = true;
        });

        $('#jform_watermark_opacity').prev().on('change', function(){
            watermark = true;
        });

        $('#jform_scale_watermark').on('change', function(){
            watermark = true;
        });

        $('#jform_watermark_opacity').on('input', function(){
            watermark = true;
        });

        $('.thumbnail-typography-select').parent().on('show', function(){
            var value = $(this).find('input.thumbnail-typography-select').attr('data-value');
            $(this).find('li').each(function(){
                var $this = $(this).removeClass('selected');
                $this.find('i.zmdi-check').remove();
                if ($this.attr('data-value') == value) {
                    $this.addClass('selected').prepend('<i class="zmdi zmdi-check"></i>');
                }
            });
        }).on('customHide', function(){
            var value = $(this).find('input.thumbnail-typography-select').attr('data-value');
            $(this).closest('.ba-options-group').find('.option-border').hide();
            $(this).closest('.ba-options-group').find('div.'+value+'-options').show();
        });

        checkRandomGrid();
        checkAlbumRandomGrid()

        $('#jform_gallery_layout').prev().on('customHide', function(){
            setTimeout(function(){
               checkRandomGrid();
            }, 100);
        });

        $('#jform_album_layout').prev().on('customHide', function(){
            setTimeout(function(){
               checkAlbumRandomGrid();
            }, 100);
        });

        checkEffect();
        checkAlbumEffect();

        $('#jform_thumbnail_layout').prev().on('customHide', function(){
            setTimeout(function(){
               checkEffect();
            }, 100);
        });

        $('#jform_album_thumbnail_layout').prev().on('customHide', function(){
            setTimeout(function(){
               checkAlbumEffect();
            }, 100);
        });

        $('.ba-form-trigger').parent().each(function(){
            var $this = $(this),
                val = $(this).next().val(),
                value;
            $this.find('ul li').each(function(){
                value = $(this).attr('data-value')
                if (value == val) {
                    $this.find('input').attr('data-value', value).val($(this).text());
                    return false;
                }
            });
        }).on('show', function(){
            var value = $(this).find('input').attr('data-value');
            $(this).find('li').each(function(){
                var $this = $(this).removeClass('selected');
                $this.find('i.zmdi-check').remove();
                if ($this.attr('data-value') == value) {
                    $this.addClass('selected').prepend('<i class="zmdi zmdi-check"></i>');
                }
            });
        }).on('customHide', function(){
            var $this = $(this),
                value = $this.find('input').attr('data-value');
            $this.next().val(value);
        });

        $('.equal-trigger').on('customHide', function(){
            var input = this.querySelector('input[type="text"]'),
                select = $('.equal-trigger[data-trigger="'+this.dataset.trigger+'"]');
            select.find('input[type="text"]').val(input.value).attr('data-value', input.dataset.value);
            select.next().val(input.dataset.value);
        });

        $('#filter-options .ba-custom-select, .cke-image-select').on('show', function(){
            var value = $(this).find('input[data-value]').attr('data-value');
            $(this).find('li').each(function(){
                var $this = $(this).removeClass('selected');
                $this.find('i.zmdi-check').remove();
                if ($this.attr('data-value') == value) {
                    $this.addClass('selected').prepend('<i class="zmdi zmdi-check"></i>');
                }
            });
        });

        function ckeckBg(input)
        {
            var obj = $(input).minicolors('rgbObject');
            if (obj.r == 255 && obj.g == 255 && obj.b == 255 && obj.a == 1) {
                $(input).parent().addClass('ba-minicolors-border');
            } else {
                $(input).parent().removeClass('ba-minicolors-border');
            }
        }

        $('#jform_caption_bg').attr('data-opacity', jQuery('#jform_caption_opacity').val());
        $('#jform_caption_bg').minicolors('settings', {
            opacity: true,
            change: function(hex) {
                var rgba = $(this).minicolors('rgbObject');
                ckeckBg(this);
                jQuery('#jform_caption_opacity').val(rgba.a);
            }
        });
        ckeckBg($('#jform_caption_bg')[0]);

        $('.minicolors-trigger').each(function(){
            $(this).minicolors({
                opacity: true,
                theme: 'bootstrap',
                change: function(hex) {
                    hex = $(this).minicolors('rgbaString');
                    ckeckBg(this);
                    $('#jform_'+this.id).val(hex)
                }
            });
            var subColor = rgba2hex($('#jform_'+this.id).val());
            $(this).minicolors('value', subColor[0]);
            $(this).minicolors('opacity', subColor[1]);
        });

        $('.search-colors input').minicolors({
            theme: 'bootstrap'
        });

        $('#jform_lightbox_bg').attr('data-opacity', $('#jform_lightbox_bg_transparency').val());
        $('#jform_lightbox_bg').minicolors('settings', {
            opacity: true,
            change: function(hex) {
                ckeckBg(this);
                var rgba = $(this).minicolors('rgbObject');
                $('#jform_lightbox_bg_transparency').val(rgba.a);
            }
        });
        ckeckBg($('#jform_lightbox_bg')[0]);

        $('.ba-gallery-range').each(function(){
            var input = $(this),
                max = input.attr('max') * 1,
                min = input.attr('min') * 1,
                number = input.next();
            input.val(number.val());
            addRangeWidth(input);
            number.on('input', function(){
                var value = this.value * 1;
                if (!this.value) {
                    value = 0
                }
                if (max && value > max) {
                    this.value = value = max;
                }
                if (min && value < min) {
                    value = min;
                }
                input.val(value);
                addRangeWidth(input);
            })
        });
        $('.ba-gallery-range').on('mousedown', function(){
            var input = $(this),
                interval = setInterval(function(){
                    addRangeWidth(input);
                    input.next().val(input.val());
            }, 20);
            $(this).one('mouseup', function(){
                clearInterval(interval);
            });
        });

        $('.radio-trigger').each(function(){
            if (this.value == $('#jform_'+this.dataset.radio).val()) {
                this.checked = true;
            } else {
                this.checked = false;
            }
        }).on('change', function(){
            $('#jform_'+this.dataset.radio).val(this.value);
        });

        if ($('#jform_disable_lightbox').val() == 0) {
            $('#enable-lightbox').attr('checked', true);
        }

        $('#enable-lightbox').on('click', function(){
            if ($(this).prop('checked')) {
                $('#jform_disable_lightbox').val(0);
            } else {
                $('#jform_disable_lightbox').val(1);
            }
            checkLightbox();
        });

        $('#jform_enable_alias').on('change', checkAlias);

        $('#lightbox-comments-options .ba-custom-select').on('customHide', function(){
            checkComments();
        });

        $('#jform_disable_caption').on('click', function(){
            checkCaptionOptions();
        });

        $('#jform_album_disable_caption').on('click', function(){
            checkAlbumCaptionOptions();
        });

        $('#jform_category_list').on('click', function(){
            checkFilter();
        });

        $('#jform_enable_tags').on('click', function(){
            checkTags();
        });

        $('#jform_enable_colors').on('click', function(){
            checkColors();
        });

        $('#jform_pagination').on('click', function(){
            checkPaginator();
        });

        $('.column-number-select').parent().on('show', function(){
            var value = $(this).find('input.column-number-select').attr('data-value');
            $(this).find('li').each(function(){
                var $this = $(this).removeClass('selected');
                $this.find('i.zmdi-check').remove();
                if ($this.attr('data-value') == value) {
                    $this.addClass('selected').prepend('<i class="zmdi zmdi-check"></i>');
                }
            });
        }).on('customHide', function(){
            var value = $(this).find('input.column-number-select').attr('data-value');
            $(this).closest('.ba-options-group').find('.option-border').hide();
            $(this).closest('.ba-options-group').find('.'+value+'-options').show();
        });

        $('#jform_auto_resize').on('click', function(){
            checkAutoResize();
        });

        $('#jform_display_header').on('click', function(){
            checkHeader();
        });

        $('.pagination-limit .ba-custom-select').on('show', function(){
            var value = $(this).find('input').attr('data-value');
            $(this).find('li').each(function(){
                var $this = $(this).removeClass('selected');
                $this.find('i.zmdi-check').remove();
                if ($this.attr('data-value') == value) {
                    $this.addClass('selected').prepend('<i class="zmdi zmdi-check"></i>');
                }
            });
        }).on('customHide', function(){
            pagLimit = $(this).find('input').attr('data-value') * 1;
            $.ajax({
                type : "POST",
                dataType : 'text',
                url : "index.php?option=com_bagallery&task=gallery.setPagLimit&tmpl=component",
                data : {
                    key : 'bagallery-edit',
                    value : pagLimit
                }
            });
            var tbody = $('table.ba-items-table tbody').empty();
            if (currentCat) {
                catImages[currentCat].forEach(function(el, ind){
                    if (ind >= pagLimit && pagLimit != 1) {
                        return false;
                    }
                    var str = returnTrHtml(el, ind);
                    tbody.append(str);
                    tbody.find('.select-item').last().val(JSON.stringify(el))
                });
                drawPaginator();
                getAllImages();
            }
        });

        checkHeader();
        checkLightbox();
        checkAutoResize();
        checkFilter();
        checkTags();
        checkColors();
        checkPaginator();
        checkCaptionOptions();
        checkAlbumCaptionOptions();
        checkAlias();

        $('.minicolors-input').attr('maxlength', '7');
    });
})(jQuery);