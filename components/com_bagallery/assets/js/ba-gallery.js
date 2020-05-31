/**
* @package   BaGallery
* @author    Balbooa https://www.balbooa.com/
* @copyright Copyright @ Balbooa
* @license   https://www.gnu.org/licenses/gpl.html GNU/GPL
*/

var ba_jQuery = jQuery,
    baPasswords = {};

function initGalleries()
{
    let scroll = window.innerWidth - document.documentElement.offsetWidth;
    document.body.parentNode.style.setProperty('--gallery-scroll-width', scroll+'px');
    document.removeEventListener("DOMContentLoaded", initGalleries);
    window.removeEventListener("load", initGalleries);
    ba_jQuery('.ba-gallery').each(function(){
        initGallery(this);
    });
}

function initGallery(bagallery)
{
    if (!bagallery) {
        initGalleries();
        return false;
    }
    var disqus_shortname = jQuery('.disqus-subdomen').val(),
        globalImage = {
            width : '',
            height : ''
        },
        infinity = null,
        likeFlag = true,
        imgC,
        imagesArray = [],
        aimgC,
        originalLocation = '',
        catNames = new Array(),
        galleryId = bagallery.dataset.gallery,
        vk_api = ba_jQuery('#vk-api-id-'+galleryId).val(),
        goodWidth = (ba_jQuery(window).height() - 100) * 1.6,
        goodHeight = ba_jQuery(window).height() - 100,
        scroll = jQuery(window).scrollTop(),
        gallery = ba_jQuery(bagallery),
        galleryModal = gallery.find('.gallery-modal'),
        slideFlag = true,
        vkFlag = false,
        pageRefresh = gallery.find('.page-refresh').val(),
        gFlag = false,
        juri = jQuery('.ba-juri').val(),
        albumMode = gallery.find('.album-mode').val(),
        album = gallery.find('.ba-album'),
        albumOptions = gallery.find('.albums-options').val(),
        defaultFilter = gallery.find('.default-filter-style').val(),
        galleryOptions = JSON.parse(gallery.find('.gallery-options').val()),
        $container = gallery.find('.ba-gallery-grid'),
        category = gallery.find('.ba-filter-active').attr('data-filter'),
        defaultCat = category,
        winSize = ba_jQuery(window).width(),
        albumWidth = 0,
        widthContent = 0,
        pagination = gallery.find('.ba-pagination-options').val(),
        copyright = gallery.find('.copyright-options').val(),
        lazyloadOptions = {};
        paginationConst = gallery.find('.ba-pagination-constant').val();

    if (pageRefresh == 1) {
        var refreshData = JSON.parse(gallery.find('.refresh-data').val());
    }

    var catModal = gallery.find('.category-password-modal');
    gallery.find('.category-filter a[data-password], .ba-album-items[data-password]').each(function(){
        if (!baPasswords[this.dataset.id]) {
            baPasswords[this.dataset.id] = false;
        }
    });
    if (pagination && galleryOptions.pagination_type == 'infinity') {
        var infinityLoading = false;
        infinity = JSON.parse(gallery.find('.infinity-data').val());

        function getInfinityImages()
        {
            var match = category.match(/category-\d+/),
                tags = '',
                colors = '',
                newPage = currentPage.replace('.page-', ''),
                newCat = category == '.root' ? 'root' : match[0],
                method = 'append';
            gallery.find('.gallery-color.active').each(function(){
                if (colors) {
                    colors += ',';
                }
                colors += this.dataset.id;
            });
            gallery.find('.gallery-tag.active').each(function(){
                if (tags) {
                    tags += ',';
                }
                tags += this.dataset.id;
            });
            $container.ba_isotope({
                filter: category,
                margin : galleryOptions.image_spacing,
                count : imgC,
                mode : layout
            });
            if (infinity.page != newPage || infinity.category != newCat || infinity.tags != tags || infinity.colors != colors){
                if (infinity.category != newCat || infinity.tags != tags || infinity.colors != colors) {
                    method = 'html';
                }
                infinity.page = newPage;
                infinity.category = newCat;
                infinity.tags = tags;
                infinity.colors = colors;
                jQuery.ajax({
                    url: juri+'index.php?option=com_bagallery&task=gallery.getGalleryImages&tmpl=component',
                    type: "POST",
                    dataType: 'text',
                    data: infinity,
                    success: function(msg) {
                        infinityLoading = false;
                        var scrollTarrget = jQuery(document);
                        gallery.find('.ba-pagination').addClass('ba-empty').empty();
                        if (albumMode && albumOptions.album_enable_lightbox == 1 && infinity.category != 'root') {
                            scrollTarrget = gallery;
                        }
                        if (method == 'html') {
                            currentPage = '.page-1';
                            scrollTarrget.off('scroll.infinity');
                        }
                        if (msg) {
                            scrollTarrget.on('scroll.infinity', function(event) {
                                var paginatorY = gallery.find('.ba-pagination').parent().offset().top - window.innerHeight;
                                if (paginatorY < scroll && !infinityLoading) {
                                    infinityLoading = true;
                                    var next = currentPage.substr(6) * 1 + 1;
                                    currentPage = '.page-'+next;
                                    scrollTarrget.off('scroll.infinity');
                                    getInfinityImages();
                                    $container.ba_isotope({
                                        filter: category,
                                        margin : galleryOptions.image_spacing,
                                        count : imgC,
                                        mode : layout
                                    });
                                }
                                if (gallery.hasClass('album-in-lightbox')) {
                                    scroll = gallery.scrollTop();
                                } else {
                                    scroll = jQuery(window).scrollTop();
                                }
                            });
                            if (galleryOptions.random_sorting == 1) {
                                var div = document.createElement('div');
                                div.innerHTML = msg;
                                jQuery(div).ba_isotope('shuffle');
                                msg = div.innerHTML;
                            }
                            gallery.find('.ba-gallery-grid')[method](msg);
                            setSize();
                            addCaptionStyle();
                            createThumbnails();
                            $container.ba_isotope({
                                filter: category,
                                margin : galleryOptions.image_spacing,
                                count : imgC,
                                mode : layout
                            });
                        }
                        elements = getData();
                        if (infinity.activeImage) {
                            delete(infinity.activeImage);
                            locationImage();
                            currentPage = '.page-'+Math.ceil(elements.length / pagination.images_per_page);
                        }
                        checkImgCounts();
                        if (imgCounts[infinity.category] == elements.length && (albumOptions.album_enable_lightbox != 1 ||
                                (albumOptions.album_enable_lightbox == 1 && gallery.hasClass('album-in-lightbox')))) {
                            scrollTarrget.off('scroll.infinity');
                            if (elements.length > pagination.images_per_page * 1) {
                                var str = '<a class="ba-btn scroll-to-top">'+paginationConst[3]+'</a>';
                                gallery.find('.ba-pagination').removeClass('ba-empty').html(str);
                                addPaginationStyle();
                                var position = gallery.offset().top,
                                    target = jQuery('html, body');
                                if (gallery.hasClass('album-in-lightbox')) {
                                    target = gallery;
                                    position = 0;
                                }
                                gallery.find('.ba-pagination a').on('click', function(){
                                    target.stop().animate({
                                        scrollTop: position
                                    }, 'slow');
                                });
                            }
                        }
                    }
                });
            }
        }
    }
    if (albumMode) {
        albumOptions = JSON.parse(albumOptions);
        category = '.root';
        album.find('.ba-album-items').each(function(){
            catNames.push(jQuery(this).attr('data-filter'));
        });
    } else {
        albumOptions = {}
    }
    if (paginationConst) {
        paginationConst = paginationConst.split('-_-');
    }
    if (disqus_shortname) {
        var disqus_url = window.location.href;
    }
    var style = gallery.find('.lightbox-options').val();
    style = JSON.parse(style);            
    var layout = gallery.find('.gallery-layout').val(),
        currentPage = '.page-1',
        paginationPages = 0,
        image = '',
        imageIndex = '',
        elements = getData(),
        titleSize = gallery.find('.modal-title').length,
        categoryDescription = gallery.find('.categories').val();
    if (categoryDescription) {
        categoryDescription = JSON.parse(categoryDescription);
    }

    var thumbnails = new Array(),
        notification = gallery.find('.gallery-notification'),
        notificationDelay,
        thumbnailStack = {
            count: 0
        },
        thumbnailc = 0;

    function addNoticeText(message, className)
    {
        var time = 3000;
        if (className) {
            time = 6000;
        }
        notification.find('p').html(message);
        notification.addClass(className).removeClass('animation-out').addClass('notification-in');
        clearTimeout(notificationDelay);
        notificationDelay = setTimeout(function(){
            notification.removeClass('notification-in').addClass('animation-out');
            setTimeout(function(){
                notification.removeClass(className);
            }, 400);
        }, time);
    }

    function showNotice(message, className)
    {
        if (!className) {
            className = '';
        }
        if (notification.hasClass('notification-in')) {
            clearTimeout(notificationDelay);
            notificationDelay = setTimeout(function(){
                notification.removeClass('notification-in').addClass('animation-out');
                setTimeout(function(){
                    addNoticeText(message, className);
                }, 400);
            }, 3000);
        } else {
            addNoticeText(message, className);
        }
    }

    function createThumbnail(src)
    {
        jQuery.ajax({
            url: src,
            type: "POST",
            dataType: 'text',
            data: {
                src: src
            },
            success: function(msg){
                var img = document.createElement('img');
                img.onload = function(){
                    var image = thumbnailStack[this.dataset.old];
                    image.src = this.src;
                    image.dataset.width = this.width;
                    image.dataset.height = this.height;
                    thumbnailc++;
                    clearTimeout(thumbnailStack.delay);
                    thumbnailStack.delay = setTimeout(function(){
                        if (thumbnailc == thumbnailStack.count) {
                            resizeIsotope();
                        }
                    }, 1000);
                }
                img.src = msg;
                img.dataset.old = src;
            }
        });
    }

    function createThumbnails()
    {
        gallery.find('.ba-image img').each(function(){
            var src = jQuery(this).attr('src');
            if (!src) {
                src = jQuery(this).attr('data-original');
            }
            if (src.indexOf('option=com_bagallery') !== -1 && !thumbnailStack[src]) {
                thumbnailStack[src] = this;
                thumbnailStack.count++;
                thumbnails.push(src);
            }
        });
        while (thumbnails.length > 0) {
            var src = thumbnails.pop();
            createThumbnail(src);
        }
    }

    notification.find('i.zmdi-close').on('click', function(){
        notification.removeClass('notification-in').addClass('animation-out');
    });
    
    createThumbnails()

    copyright = JSON.parse(copyright);
    if (copyright.disable_right_clk == '1') {
        gallery.off('contextmenu.gallery').on('contextmenu.gallery', function(e){
            e.preventDefault();
            e.stopPropagation();
        });
        galleryModal.parent().off('contextmenu.gallery').on('contextmenu.gallery', function(e){
            e.preventDefault();
            e.stopPropagation();
        });
    }
    if (copyright.disable_shortcuts == '1') {
        jQuery(window).on('keydown', function(e){
            if ((e.ctrlKey || e.metaKey) && (e.keyCode == 88 || e.keyCode == 65
                || e.keyCode == 67 || e.keyCode == 86 || e.keyCode == 83)) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }
    if (copyright.disable_dev_console == '1') {
        function checkDevConsole(e)
        {
            if ((e.keyCode == 123 && e.originalEvent && e.originalEvent.code == 'F12') ||
                (e.keyCode == 73 && e.ctrlKey && e.shiftKey) ||
                (e.keyCode == 67 && e.ctrlKey && e.shiftKey) ||
                (e.keyCode == 75 && e.ctrlKey && e.shiftKey) ||
                (e.keyCode == 83 && e.ctrlKey && e.shiftKey) ||
                (e.keyCode == 81 && e.ctrlKey && e.shiftKey) ||
                (e.keyCode == 116 && e.shiftKey && e.originalEvent.code == 'F5') ||
                (e.keyCode == 118 && e.shiftKey && e.originalEvent.code == 'F7')) {
                return true;
            } else {
                return false;
            }
        }
        jQuery(window).on('keydown', function(e){
            if (checkDevConsole(e)) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        jQuery(document).off('contextmenu').on('contextmenu', function(e){
            e.preventDefault();
            e.stopPropagation();
        });
    }

    function directionAware(el, event)
    {
        var w = el.width(),
            h = el.height(),
            x = (event.pageX - el.offset().left - (w / 2)) * (w > h ? (h / w) : 1),
            y = (event.pageY - el.offset().top  - (h / 2)) * (h > w ? (w / h) : 1),
            direction = Math.round((((Math.atan2(y, x) * (180 / Math.PI)) + 180) / 90) + 3) % 4;
        switch(direction) {
            case 0:
                return 'top';
                break;
            case 1:
                return 'right';
                break;
            case 2:
                return 'bottom';
                break;
            case 3:
                return 'left';
                break;
        }
    }

    function createVK(vk)
    {
        vk.pageUrl = window.location.href;
        if (vk_api) {
            if (!vkFlag) {
                var vkScript = document.createElement('script');
                vkScript.src = '//vk.com/js/api/openapi.js?125';
                document.getElementsByTagName('head')[0].appendChild(vkScript);
                ba_jQuery(vkScript).on('load', function(){
                    VK.init({
                        apiId: vk_api,
                        onlyWidgets: true
                    });
                    if (vk) {
                        VK.Widgets.Comments("ba-vk-"+galleryId, vk);
                    }
                    vkFlag = true;
                });
            } else {
                VK.Widgets.Comments("ba-vk-"+galleryId, vk);
            }
        }
    }

    if (galleryOptions.random_sorting == 1) {
        $container.ba_isotope('shuffle');
    }

    if (albumMode) {
        addBackStyle();
    }
    if (pagination) {
        pagination = JSON.parse(pagination);
    }
    if (defaultFilter) {
        defaultFilter = JSON.parse(defaultFilter);
    }
    
    function getWidthContent()
    {
        imgC = galleryOptions.column_number * 1
        var s = galleryOptions.image_spacing * 1,
            w = $container.width() * 1;
        if (winSize < 1024 && winSize >= 768) {
            imgC = galleryOptions.tablet_numb;
        } else if (winSize <= 767 && winSize >= 480) {
            imgC = galleryOptions.phone_land_numb;
        } else if (winSize < 480) {
            imgC = galleryOptions.phone_port_numb;
        } else {
            imgC = galleryOptions.column_number * 1;
        }
        setAlbumWidth();

        return Math.floor((w - (s * (imgC - 1))) / imgC);
    }

    function setAlbumWidth()
    {
        aimgC = albumOptions.album_column_number * 1
        var s = albumOptions.album_image_spacing * 1,
            w = album.width() * 1;
        if (winSize < 1024 && winSize >= 768) {
            aimgC = albumOptions.album_tablet_numb;
        } else if (winSize <= 767 && winSize >= 480) {
            aimgC = albumOptions.album_phone_land_numb;
        } else if (winSize < 480) {
            aimgC = albumOptions.album_phone_port_numb;
        } else {
            aimgC = albumOptions.album_column_number;
        }
        
        albumWidth = Math.floor((w - (s * (aimgC - 1))) / aimgC);
    }
    
    function addBackStyle()
    {
        var backStyle = gallery.find('.back-style').val()
        backStyle = JSON.parse(backStyle);
        gallery.find('.ba-goback a').css({
            'background-color' : backStyle.pagination_bg,
            'border' : '1px solid '+backStyle.pagination_border,
            'border-radius' : backStyle.pagination_radius+'px',
            'color' : backStyle.pagination_font,
        });
        gallery.find('.ba-goback a').hover(function(){
            ba_jQuery(this).css({
                'background-color' : backStyle.pagination_bg_hover,
                'color' : backStyle.pagination_font_hover
            });
        }, function(){
            ba_jQuery(this).css({
                'background-color' : backStyle.pagination_bg,
                'color' : backStyle.pagination_font
            });
        });
    }
    
    function addFilterStyle()
    {
        gallery.find('.ba-filter').css({
            'background-color' : defaultFilter.bg_color,
            'border' : '1px solid '+defaultFilter.border_color,
            'border-radius' : defaultFilter.border_radius+'px',
            'color' : defaultFilter.font_color,
            'font-weight' : defaultFilter.font_weight,
            'font-size' : defaultFilter.font_size+'px'
        });
        gallery.find('.ba-filter-active').css({
            'background-color' : defaultFilter.bg_color_hover,
            'border' : '1px solid '+defaultFilter.border_color,
            'border-radius' : defaultFilter.border_radius+'px',
            'color' : defaultFilter.font_color_hover,
            'font-weight' : defaultFilter.font_weight,
            'font-size' : defaultFilter.font_size+'px'
        });
        gallery.find('.category-filter').css('text-align', defaultFilter.alignment);
        gallery.find('.ba-filter').hover(function(){
            ba_jQuery(this).css('background-color', defaultFilter.bg_color_hover);
            ba_jQuery(this).css('color', defaultFilter.font_color_hover);
        }, function(){
            ba_jQuery(this).css('background-color', defaultFilter.bg_color);
            ba_jQuery(this).css('color', defaultFilter.font_color);
        });
        gallery.find('.ba-filter-active').hover(function(){
            ba_jQuery(this).css('background-color', defaultFilter.bg_color_hover);
            ba_jQuery(this).css('color', defaultFilter.font_color_hover);
        }, function(){
            ba_jQuery(this).css('background-color', defaultFilter.bg_color_hover);
            ba_jQuery(this).css('color', defaultFilter.font_color_hover);
        });
    }

    function checkHash()
    {
        if (window.location.href.indexOf('#') > 0) {
            window.history.replaceState(null, null, window.location.href.replace('#'+window.location.hash, ''))
        }
    }

    function chechAlbumItems(a)
    {
        var title = a.find('h3').text(),
            alias = a.find('a').attr('data-href'),
            oldCategory = category,
            filter = a.attr('data-filter');
        if (checkPassword(a.attr('data-id'), alias)) {
            return false;
        }
        if (albumOptions.album_enable_lightbox == 1 && a.hasClass('root')) {
            gallery.find('.ba-goback a').hide();
        } else {
            gallery.find('.ba-goback a').css('display', '');
        }
        gallery.find('.ba-goback h2').text(title);
        setCategoryDescription(filter);
        category = filter;
        if (category != '.root' && albumOptions.album_enable_lightbox == 1 && oldCategory == '.root' && pageRefresh != 1) {
            gallery.next().height(gallery.height());
        }
        if (pagination) {
            currentPage = '.page-1'
            drawPagination();
        }
        if (!pagination || (pagination && galleryOptions.pagination_type != 'infinity')) {
            gallery.trigger('scroll');
        }
        if (albumOptions.album_enable_lightbox != 1 && galleryOptions.disable_auto_scroll != 1) {
            var position = gallery.offset().top;
            jQuery('html, body').stop().animate({
                scrollTop: position
            }, 'slow');
        }
        if (albumOptions.album_enable_lightbox == 1) {
            if (category == '.root') {
                gallery.removeClass('album-in-lightbox');
                jQuery('body').removeClass('album-in-lightbox-open');
                gallery.find('.ba-gallery-row-wrapper').css('background-color', '');
            } else {
                gallery.find('.ba-gallery')
                gallery.addClass('album-in-lightbox');
                jQuery('body').addClass('album-in-lightbox-open');
                gallery[0].scrollTop = 0;
                gallery.find('.ba-gallery-row-wrapper').css('background-color', style.lightbox_border);
            }
        }
    }

    gallery.find('.ba-album-items').on('click', function(){
        var alias = jQuery(this).find('a').attr('data-href');
        if (checkPassword(this.dataset.id, alias)) {
            return false;
        }
        checkHash();
        if (pageRefresh == 1) {
            refreshPage(alias)
            gallery.find('.ba-pagination').hide();
        } else {
            window.history.replaceState(null, null, alias);
            chechAlbumItems(jQuery(this));
            resizeIsotope();
        }
    });

    gallery.find('.ba-album-items.root').on('click', function(){
        if (albumOptions.album_enable_lightbox == 1 && pageRefresh == 1) {
            gallery.next().height(gallery.height());
        }
    });

    gallery.find('.ba-goback a').on('click', function(){
        checkHash();
        if (category == '.root') {
            var flag = false;
        } else {
            var catName = album.find('div[data-filter="'+category+'"]')[0].className,
                array = catName.split(' ');
                flag = false;
            for (var i = 0; i < array.length; i++) {
                if (array[i].indexOf('category-') != -1) {
                    catName = array[i];
                }
            }
            for (var i = 0; i < catNames.length; i ++) {
                if (catName == catNames[i].replace('.', '')) {
                    album.find('div[data-filter="'+catNames[i]+'"]').trigger('click');
                    flag = true;
                    break;
                }
            }
        }
        if (!flag) {
            category = '.root';
            var alias = gallery.find('.current-root').val();
            if (pageRefresh == 1) {
                if (alias != window.location.href) {
                    refreshPage(alias)
                    gallery.find('.ba-pagination').hide();
                }
            } else {
                window.history.replaceState(null, null, alias);
                if (pagination) {
                    currentPage = '.page-1';
                    addPages();
                    drawPagination();
                }
                resizeIsotope();
            }
        }
    });

    function removeFilterPasswordsImages(cat)
    {
        var str = cat;
        if (str == '.category-0') {
            for (var ind in baPasswords) {
                if (!baPasswords[ind]) {
                    var filter = gallery.find('.category-filter a[data-id="'+ind+'"]').attr('data-filter');
                    str += ':not('+filter+')';
                }
            }
        }

        return str;
    }
    
    function filterAction(a)
    {
        category = removeFilterPasswordsImages(category);
        var oldActive = gallery.find('.ba-filter-active'),
            newActive = a,
            filter = a.attr('data-filter'),
            alias = a.attr('data-href');
        if (checkPassword(a.attr('data-id'), alias)) {
            return false;
        }
        oldActive.removeClass('ba-filter-active');
        oldActive.addClass('ba-filter');
        newActive.removeClass('ba-filter');
        newActive.addClass('ba-filter-active');
        addFilterStyle();
        gallery.find('.ba-select-filter option').each(function(){
            if (ba_jQuery(this).val() == filter) {
                ba_jQuery(this).attr('selected', true);
            } else {
                ba_jQuery(this).removeAttr('selected');
            }
        });
        gallery.find('.gallery-tag.active').removeClass('active');
        gallery.find('.gallery-color.active').removeClass('active');
        $container.find('.ba-gallery-items').hide();
        var desc = setCategoryDescription(filter);
        category = filter;
        category = removeFilterPasswordsImages(category);
        if (pagination) {
            currentPage = '.page-1'
            addPages();
            drawPagination();
        }
    }

    function tagsAction(a)
    {
        var filter = a.attr('data-id');
        if (!a.hasClass('active')) {
            jQuery.ajax({
                type:"POST",
                dataType:'text',
                url: juri+"index.php?option=com_bagallery&task=gallery.setTagHit&tmpl=component",
                data:{
                    id : filter
                },
                success : function(msg){
                    
                }
            });
            a.addClass('active');
        } else {
            a.removeClass('active');
        }
        setColorsTagsFilter();
        $container.find('.ba-gallery-items').hide();
        if (pagination) {
            currentPage = '.page-1'
            addPages();
            drawPagination();
        }
    }

    function setColorsTagsFilter()
    {
        var match = category.match(/category-\d+/),
            cat = category == '.root' ? 'root' : match[0];
        cat = '.'+cat;
        if (galleryOptions.tags_method == 'include' && galleryOptions.colors_method == 'include') {
            category = '';
            gallery.find('.gallery-tag.active').each(function(){
                if (category) {
                    category += ', ';
                }
                category += removeFilterPasswordsImages(cat)+'.ba-tag-'+this.dataset.id;
            });
            gallery.find('.gallery-color.active').each(function(){
                if (category) {
                    category += ', ';
                }
                category += removeFilterPasswordsImages(cat)+'.ba-color-'+this.dataset.id;
            });
        } else if (galleryOptions.colors_method == 'include') {
            category = '';
            gallery.find('.gallery-tag.active').each(function(){
                if (!category) {
                    category += removeFilterPasswordsImages(cat);
                }
                category += '.ba-tag-'+this.dataset.id;
            });
            gallery.find('.gallery-color.active').each(function(){
                if (category) {
                    category += ', ';
                }
                category += removeFilterPasswordsImages(cat)+'.ba-color-'+this.dataset.id;
            });
        } else if (galleryOptions.tags_method == 'include') {
            category = '';
            gallery.find('.gallery-color.active').each(function(){
                if (!category) {
                    category += removeFilterPasswordsImages(cat);
                }
                category += '.ba-color-'+this.dataset.id;
            });
            gallery.find('.gallery-tag.active').each(function(){
                if (category) {
                    category += ', ';
                }
                category += removeFilterPasswordsImages(cat)+'.ba-tag-'+this.dataset.id;
            });
        } else {
            category = '';
            gallery.find('.gallery-color.active').each(function(){
                if (!category) {
                    category += removeFilterPasswordsImages(cat);
                }
                category += '.ba-color-'+this.dataset.id;
            });
            gallery.find('.gallery-tag.active').each(function(){
                if (!category) {
                    category += removeFilterPasswordsImages(cat);
                }
                category += '.ba-tag-'+this.dataset.id;
            });
        }
        if (!category) {
            category = removeFilterPasswordsImages(cat);
        }
    }

    function colorsAction(a)
    {
        var filter = a.attr('data-id');
        if (!a.hasClass('active')) {
            jQuery.ajax({
                type:"POST",
                dataType:'text',
                url: juri+"index.php?option=com_bagallery&task=gallery.setColorHit&tmpl=component",
                data:{
                    id : filter
                },
                success : function(msg){
                    
                }
            });
            a.addClass('active');
        } else {
            a.removeClass('active');
        }
        setColorsTagsFilter();
        $container.find('.ba-gallery-items').hide();
        if (pagination) {
            currentPage = '.page-1'
            addPages();
            drawPagination();
        }
    }

    gallery.find('a.gallery-tag').on('click', function(event){
        event.preventDefault();
        var $this = jQuery(this),
            alias = $this.attr('data-href'),
            href = window.location.href,
            search = this.dataset.alias,
            pos = href.indexOf(search);
        if (pos != -1) {
            var symbol = href[pos - 1],
                start = href.substring(0, pos - 1),
                end = href.substring(pos + search.length);
            if (symbol == '?' && end) {
                end = '?'+end.substring(1);
            }
            alias = start+end;
        } else {
            if (href.indexOf('?') != -1) {
                alias = href += '&'+this.dataset.alias;
            } else {
                alias = href += '?'+this.dataset.alias;
            }
        }
        if (alias.indexOf('ba-page=') != -1) {
            var match = alias.match(/\Wba-page=\d+/);
            alias = alias.replace(match[0], '');
        }
        if (pageRefresh == 1) {
            if (alias != window.location.href) {
                refreshPage(alias)
            }
        } else {
            window.history.replaceState(null, null, alias);
            tagsAction($this);
            resizeIsotope();
        }
    });

    gallery.find('a.gallery-color').on('click', function(event){
        event.preventDefault();
        var $this = jQuery(this),
            alias = $this.attr('data-href'),
            href = window.location.href,
            search = this.dataset.alias,
            pos = href.indexOf(search);
        if (pos != -1) {
            var symbol = href[pos - 1],
                start = href.substring(0, pos - 1),
                end = href.substring(pos + search.length);
            if (symbol == '?' && end) {
                end = '?'+end.substring(1);
            }
            alias = start+end;
        } else {
            if (href.indexOf('?') != -1) {
                alias = href += '&'+this.dataset.alias;
            } else {
                alias = href += '?'+this.dataset.alias;
            }
        }
        if (alias.indexOf('ba-page=') != -1) {
            var match = alias.match(/\Wba-page=\d+/);
            alias = alias.replace(match[0], '');
        }
        if (pageRefresh == 1) {
            if (alias != window.location.href) {
                refreshPage(alias)
            }
        } else {
            window.history.replaceState(null, null, alias);
            colorsAction($this);
            resizeIsotope();
        }
    });

    gallery.find('.ba-reset-filter a').on('click', function(event){
        event.preventDefault();
        var href = window.location.href;
        gallery.find('.active.gallery-tag').each(function(ind){
            var search = this.dataset.alias,
                pos = href.indexOf(search),
                start = href.substring(0, pos - 1),
                end = href.substring(pos + search.length);
            href = start+end;
            if (pageRefresh != 1) {
                tagsAction(jQuery(this));
            }
        });
        gallery.find('.active.gallery-color').each(function(ind){
            var search = this.dataset.alias,
                pos = href.indexOf(search),
                start = href.substring(0, pos - 1),
                end = href.substring(pos + search.length);
            href = start+end;
            if (pageRefresh != 1) {
                colorsAction(jQuery(this));
            }
        });
        if (pageRefresh != 1 && href != window.location.href) {
            resizeIsotope();
            window.history.replaceState(null, null, href);
        } else if (href != window.location.href) {
            refreshPage(href)
        }
    });

    gallery.find('.show-filter-modal').on('click', function(event){
        event.preventDefault();
        var div =  gallery.find('.equal-positions-tags').addClass('visible-filter-modal'),
            height = div.height();
        div.css('margin-top', (window.innerHeight - height) / 2);
        document.body.classList.add('filter-modal-open');
    });

    gallery.find('.close-filter-modal').on('click', function(event){
        event.preventDefault();
        gallery.find('.ba-reset-filter a').trigger('click');
        gallery.find('.apply-filter-modal').trigger('click');
    });

    gallery.find('.apply-filter-modal').on('click', function(event){
        event.preventDefault();
        gallery.find('.equal-positions-tags').removeClass('visible-filter-modal').css('margin-top', '');
        setTimeout(function(){
            document.body.classList.remove('filter-modal-open');
        }, 300);
    });

    catModal.find('.category-password').on('input', function(){
        if (this.value.trim()) {
            catModal.find('.apply-category-password').removeClass('disable-button').addClass('active-button');
        } else {
            catModal.find('.apply-category-password').addClass('disable-button').removeClass('active-button');
        }
    });
    
    catModal.find('[data-dismiss="modal"]').on('click', function(event){
        event.preventDefault();
        catModal.ba_modal('hide');
    });

    catModal.find('.apply-category-password').on('click', function(event){
        event.preventDefault();
        if (this.classList.contains('active-button')) {
            var id = this.dataset.id,
                alias = this.dataset.alias,
                password = catModal.find('.category-password').val().trim();
            jQuery.ajax({
                url : juri+'index.php?option=com_bagallery&task=gallery.matchCategoryPassword&tmpl=component',
                type:"POST",
                dataType:'text',
                data: {
                    id : id,
                    password: password
                },
                success: function(msg){
                    if (msg == 'match') {
                        baPasswords[id] = true;
                        catModal.ba_modal('hide');
                        if (gallery.find('.ba-album-items').length > 0) {
                            gallery.find('.ba-album-items a[data-href="'+alias+'"]').closest('.ba-album-items').trigger('click');
                        } else {
                            gallery.find('[data-password][data-id="'+id+'"]').trigger('click');
                        }
                    } else {
                        showNotice(catModal.find('.incorrect-password').val(), 'ba-alert');
                    }
                }
            });
        }
    });

    catModal.on('hide', function(){
        var id = catModal.find('.apply-category-password').attr('data-id'),
            url = gallery.find('.current-root').val();
        catModal.parent().addClass('modal-scrollable-out');
        document.body.classList.remove('category-password-modal-open');
        setTimeout(function(){
            catModal.parent().removeClass('modal-scrollable-out');
        }, 500);
        if (!baPasswords[id] && window.location.href != url) {
            window.history.replaceState(null, null, url);
        }
    });

    function checkPassword(id, alias)
    {
        $flag = false;
        if (id && typeof(baPasswords[id]) != 'undefined' && !baPasswords[id]) {
            catModal.find('.category-password').val('');
            catModal.find('.apply-category-password').addClass('disable-button')
                .removeClass('active-button').attr('data-id', id).attr('data-alias', alias);
            catModal.ba_modal();
            document.body.classList.add('category-password-modal-open');
            $flag = true;
        }

        return $flag;
    }

    gallery.find('.category-filter a:not(.show-filter-modal)').on('click', function(event){
        event.preventDefault();
        var $this = jQuery(this),
            alias = $this.attr('data-href');
        if (checkPassword(this.dataset.id, alias)) {
            return false;
        }
        checkHash();
        if (pageRefresh == 1) {
            refreshPage(alias);
        } else {
            window.history.replaceState(null, null, alias);
            filterAction($this);
            resizeIsotope();
        }
    });

    if (pagination && galleryOptions.pagination_type == 'infinity' && gallery.find('.active-category-image').length > 0) {
        infinity.activeImage = window.location.href;
    } else {
        locationImage();
    }
    checkFilter();

    function checkFilter()
    {
        var filterFlag = false,
            search = location.href,
            pos = search.indexOf('ba-page'),
            albumItems = gallery.find('.ba-album-items'),
            filterItems = gallery.find('.category-filter a');
        if (pos != -1) {
            search = search.substr(0, pos - 1);
        } else {
            if (search.indexOf('?') > 0) {
                search = search.split('?');
                search = search[0]+'?'+search[1];
            }
        }
        if (!location.search) {
            if (albumItems.length > 0 ) {
                category = '.root';
                if (gallery.hasClass('album-in-lightbox')) {
                    if (pageRefresh == 1) {
                        var alias = gallery.find('.current-root').val();
                        refreshPage(alias);
                        gallery.find('.ba-pagination').hide();
                    }
                }
            } else if (filterItems.length > 0) {
                filterAction(gallery.find('.category-filter [data-filter="'+defaultCat+'"]'));
            }
        } else {
            if (gallery.find('.active-category-image').length > 0) {
                search = gallery.find('.active-category-image').val();
            }
            if (albumItems.length > 0 ) {
                var a = albumItems.find('a[data-href="'+search+'"]');
                if (a.length > 0) {
                    chechAlbumItems(a.closest('.ba-album-items'));
                    filterFlag = true;
                }
                if (!filterFlag) {
                    category = '.root';
                }
            } else if (filterItems.length > 0) {
                var a = gallery.find('.category-filter a[data-href="'+search+'"]');
                if (a.length > 0) {
                    filterAction(a);
                    filterFlag = true;
                }
                if (!filterFlag) {
                    category = defaultCat;
                }
            }
            if (!category) {
                category = '.category-0';
            }
            var array = search.split('?');
            if (array[1]) {
                array = array[1].split('&');
                gallery.find('a.gallery-tag').each(function(){
                    if (array.indexOf(this.dataset.alias) != -1) {
                        tagsAction(jQuery(this));
                    }
                });
                gallery.find('a.gallery-color').each(function(){
                    if (array.indexOf(this.dataset.alias) != -1) {
                        colorsAction(jQuery(this));
                    }
                });
            }
        }
    }        

    function setCategoryDescription(filter)
    { 
        var description = '';
        if (categoryDescription) {
            var length = categoryDescription.length,
                cat = '';
            filter = filter.substring(10);
            for (var i = 0; i < length; i++) {
                cat = categoryDescription[i].settings.split(';');
                if (cat[4]*1 == filter*1) {
                    if (!cat[7]) {
                        cat[7] = '';
                    }
                    description = cat[7];
                    break;
                }
            }
            description = description.replace(new RegExp("-_-_-_", 'g'), "'").replace(new RegExp("-_-", 'g'), ';');
            description = checkForms(description);
            gallery.find('.categories-description').html(description);
        }
    }

    function checkForms(data)
    {
        if (data.indexOf('baforms ID=') > 0) {
            jQuery.ajax({
                type: "POST",
                dataType: 'text',
                async: false,
                url: juri+"index.php?option=com_bagallery&view=gallery&task=gallery.checkForms&tmpl=component",
                data: {
                    ba_data : data,
                },
                success: function(msg){
                    data = msg;
                }
            });
        }

        return data;
    }
    
    gallery.find('.ba-select-filter').on('change', function(){
        var filter = ba_jQuery(this).val(),
            newActive = gallery.find('.category-filter a[data-filter="'+filter+'"]');
        newActive.trigger('click');
    });
    
    function addCaptionStyle()
    {
        var color = hexToRgb(galleryOptions.caption_bg);
        color.a = galleryOptions.caption_opacity;
        if (!gallery.find('.ba-gallery-grid').hasClass('css-style-11') && !gallery.find('.ba-gallery-grid').hasClass('css-style-13')) {
            gallery.find('.ba-gallery-items .ba-caption').css('background-color',
                        'rgba('+color.r+','+color.g+','+color.b+','+color.a+')');
        }
        if (gallery.find('.ba-gallery-grid').hasClass('css-style-12')) {
            gallery.find('.ba-gallery-items').on('mouseenter', function(event){
                var caption = jQuery(this).find('.ba-caption'),
                    dir = 'from-'+directionAware(jQuery(this), event);
                caption.addClass(dir);
                setTimeout(function(){
                    caption.removeClass(dir);
                }, 300);
            });
            gallery.find('.ba-gallery-items').on('mouseleave', function(event){
                var caption = jQuery(this).find('.ba-caption'),
                    dir = 'to-'+directionAware(jQuery(this), event);
                caption.addClass(dir);
                setTimeout(function(){
                    caption.removeClass(dir);
                }, 300);

            });
        }
        if (!gallery.find('.ba-gallery-grid').hasClass('css-style-11') && !gallery.find('.ba-gallery-grid').hasClass('css-style-13')) {
            gallery.find('.ba-gallery-items h3').css('color', galleryOptions.title_color);
            gallery.find('.ba-gallery-items .short-description').css('color', galleryOptions.description_color);
            gallery.find('.ba-gallery-items .image-category').css('color', galleryOptions.category_color);
        }
        gallery.find('.ba-gallery-items h3').css('font-size', galleryOptions.title_size+'px');
        gallery.find('.ba-gallery-items h3').css('font-weight', galleryOptions.title_weight);
        gallery.find('.ba-gallery-items h3').css('text-align', galleryOptions.title_alignment);
        gallery.find('.ba-gallery-items .short-description').css('font-size', galleryOptions.description_size+'px');
        gallery.find('.ba-gallery-items .short-description').css('font-weight', galleryOptions.description_weight);
        gallery.find('.ba-gallery-items .short-description').css('text-align', galleryOptions.description_alignment);
        gallery.find('.ba-gallery-items .image-category').css('font-size', galleryOptions.category_size+'px');
        gallery.find('.ba-gallery-items .image-category').css('font-weight', galleryOptions.category_weight);
        gallery.find('.ba-gallery-items .image-category').css('text-align', galleryOptions.category_alignment);
        if (!category) {
            category = '.category-0';
        }
        if (album.hasClass('css-style-12')) {
            album.find('.ba-album-items').on('mouseenter', function(event){
                var caption = jQuery(this).find('.ba-caption'),
                    dir = 'from-'+directionAware(jQuery(this), event);
                caption.addClass(dir);
                setTimeout(function(){
                    caption.removeClass(dir);
                }, 300);
            });
            album.find('.ba-album-items').on('mouseleave', function(event){
                var caption = jQuery(this).find('.ba-caption'),
                    dir = 'to-'+directionAware(jQuery(this), event);
                caption.addClass(dir);
                setTimeout(function(){
                    caption.removeClass(dir);
                }, 300);
            });
        }
    }
    
    function hexToRgb(hex)
    {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function refreshPage(href)
    {
        var div = document.createElement('div'),
            sBackdrop = jQuery('<div/>', {
                'class' : 'saving-backdrop'
            }),
            img = document.createElement('img');
        img.src = juri+'components/com_bagallery/assets/images/reload.svg';
        document.getElementsByTagName('body')[0].appendChild(sBackdrop[0]);
        document.getElementsByTagName('body')[0].appendChild(img);
        if (href != window.location.href) {
            window.history.replaceState(null, null, href);
        }
        jQuery(div).load(href+' .ba-gallery[data-gallery="'+gallery.attr('data-gallery')+'"]', {
            baPasswords : baPasswords
        }, function(){
            setTimeout(function(){
                document.body.classList.remove('filter-modal-open');
            }, 300);
            sBackdrop.className += ' animation-out';
            setTimeout(function(){
                document.getElementsByTagName('body')[0].removeChild(sBackdrop[0]);
                document.getElementsByTagName('body')[0].removeChild(img);
            }, 300);
            galleryModal.parent().remove();
            if (!albumMode && galleryOptions.disable_auto_scroll != 1) {
                var position = $container.offset().top;
                ba_jQuery('html, body').stop().animate({
                    scrollTop: position
                }, 'slow');
            }
            if (gallery.hasClass('album-in-lightbox')) {
                var height = gallery.next().height();
                jQuery(div).find('.ba-gallery').height(height);
            }
            jQuery('body').removeClass('album-in-lightbox-open');
            gallery.replaceWith(div.innerHTML);
            initGallery(jQuery('.ba-gallery[data-gallery="'+gallery.attr('data-gallery')+'"]')[0]);
        });
    }
    
    function drawPagination()
    {
        if (pageRefresh == 1) {
            addPaginationStyle();
            gallery.find('.ba-pagination a').off('click').on('click', function(event){
                var $this = jQuery(this);
                if ($this.hasClass('ba-dissabled') || $this.hasClass('ba-current')) {
                    event.preventDefault();
                } else if (!$this.hasClass('scroll-to-top')) {
                    event.preventDefault();
                    var href = $this.attr('data-href');
                    refreshPage(href)
                }
            });
            return false;
        }
        var page = 1,
            n = 0;
        addPages();
        gallery.find('.ba-gallery-items'+category).each(function(){
            if (n == pagination.images_per_page) {
                n = 1;
                page++;
            } else {
                n++;
            }
        });
        paginationPages = page;
        var paginator = gallery.find('.ba-pagination');
        paginator.empty();
        if (page == 1 || gallery.find('.ba-gallery-items'+category).length == 0) {
            resizeIsotope();
            return false;
        }
        if (pagination.pagination_type != 'infinity') {
            if (pagination.pagination_type != 'load') {
                var str = '<a class="ba-btn ba-first-page ba-dissabled"';
                str += ' style="display:none;"';
                str += '><span class="zmdi zmdi-skip-previous"></span></a>';
                str += '<a class="ba-btn ba-prev';
                if (pagination.pagination_type != 'slider') {
                    str += ' ba-dissabled';
                }
                str += '" style="display:none;"><span class="zmdi zmdi-play"></span></a>';
                for (var i = 0; i < page; i++) {
                    str += '<a class="ba-btn';
                    if (i == 0) {
                        str += ' ba-current';
                    }
                    str += '"';
                    str += ' style="display:none"';
                    str += '>';
                    if (pagination.pagination_type != 'dots') {
                        str += (i + 1);
                    }
                    str += '</a>';
                }
                str += '<a class="ba-btn ba-next" style="display:none;"><span class="zmdi zmdi-play"></span></a>';
                str += '<a class="ba-btn ba-last-page"';
                str += ' style="display:none"';
                str += '><span class="zmdi zmdi-skip-next"></span></a>';
            } else {
                var str = '<a class="ba-btn load-more" style="display:none;">'+paginationConst[2]+'</a>';
            }
        } else {
            var str = '';
        }
        paginator.html(str);
        if (pagination.pagination_type == 'dots') {
            paginator.find('.ba-first-page, .ba-last-page, .ba-prev, .ba-next').hide();
            paginator.find('a').addClass('ba-dots');
        }
        addPaginationStyle();
        addPaginationFilter();
        gallery.find('.ba-pagination a').on('click', function(event){
            event.preventDefault();
            if (jQuery(this).hasClass('ba-dissabled')) {
                return false;
            }
            var button = ba_jQuery(this);
            paginationAction(button);
            addPaginationStyle();
            checkPaginator();
            gallery.trigger('scroll');
        });
    }

    function checkPaginator()
    {
        var paginator = gallery.find('.ba-pagination');
        if (paginator.find('a').length == 0) {
            paginator.addClass('ba-empty');
        } else {
            paginator.removeClass('ba-empty');
        }
        if (pagination.pagination_type == 'default') {
            var current,
                curInd = 0,
                pagButtons = paginator.find('a').not('.ba-first-page, .ba-last-page, .ba-prev, .ba-next');
            paginator.find('.ba-first-page, .ba-last-page, .ba-prev, .ba-next').css('display', 'inline-block');
            if (pagButtons.length >= 5) {
                pagButtons.each(function(ind, el){
                    if (jQuery(this).hasClass('ba-current')) {
                        current = jQuery(this);
                        curInd = ind;
                        return false;
                    }
                });
                if (curInd <= 2) {
                    pagButtons.each(function(ind, el){
                        if (ind < 5) {
                            jQuery(this).css('display', 'inline-block');
                        } else {
                            jQuery(this).hide();
                        }
                    });
                } else if (curInd + 1 > pagButtons.length - 3) {
                    for (var i = pagButtons.length - 1; i >= 0; i--) {
                        if (i >= pagButtons.length - 5) {
                            jQuery(pagButtons[i]).css('display', 'inline-block');
                        } else {
                            jQuery(pagButtons[i]).hide();
                        }
                    }
                } else {
                    pagButtons.hide();
                    current.css('display', 'inline-block').prev().css('display', 'inline-block')
                        .prev().css('display', 'inline-block');
                    current.next().css('display', 'inline-block').next().css('display', 'inline-block');
                }
            } else {
                pagButtons.css('display', 'inline-block');
            }
        } else if (pagination.pagination_type == 'dots') {
            paginator.find('a').not('.ba-first-page, .ba-last-page, .ba-prev, .ba-next').css('display', 'inline-block');
        } else if (pagination.pagination_type == 'slider') {
            paginator.find('.ba-prev, .ba-next').css('display', 'inline-block');
        } else if (pagination.pagination_type == 'load') {
            paginator.find('a').css('display', 'inline-block');
        }
    }
    
    function setSize()
    {
        if (layout != 'justified') {
            $container.find('.ba-gallery-items').width(widthContent);
            $container.find('.ba-gallery-items').height(widthContent);
        }
        if (layout == 'metro') {
            $container.find('.width2').css('width', widthContent * 2 + (galleryOptions.image_spacing * 1)+'px');
            $container.find('.height2').css('height', widthContent*2+(galleryOptions.image_spacing * 1)+'px');
            $container.find('.height2 img').css('height', widthContent * 2 + (galleryOptions.image_spacing * 1)+'px');
            $container.find('.width2:not(.height2) img').css('height', widthContent+'px');
        } else if (layout == 'masonry') {
            $container.find('.height2').css('height', widthContent * 2 + (galleryOptions.image_spacing * 1)+'px');
            $container.find('.height2 img').css('height', widthContent * 2 + (galleryOptions.image_spacing * 1)+'px');
        } else if (layout == 'square') {
            $container.find('.width2').css('width', widthContent * 2 +(galleryOptions.image_spacing * 1)+'px');
            $container.find('.height2').css('height', widthContent * 2 +(galleryOptions.image_spacing * 1)+'px');
            $container.find('.height2 img').css('height', widthContent * 2+(galleryOptions.image_spacing * 1)+'px');
        } else if (layout == 'random') {
            $container.find('.ba-gallery-items').height('auto');
            $container.find('.ba-gallery-items, .ba-gallery-items img').width(widthContent);
            var ratio = 1;
            $container.find('.ba-gallery-items img').each(function(){
                var $this = jQuery(this),
                    w = $this.attr('data-width'),
                    h = $this.attr('data-height');
                ratio = w / h;
                $this.css('height', widthContent / ratio);
            });
        }
        if (winSize <= 480) {
            $container.find('.width2.height2').width(widthContent).height(widthContent);
            $container.find('.width2.height2 img').height(widthContent);
            $container.find('.width2').not('.height2').width(widthContent).height(widthContent / 2);
            $container.find('.width2').not('.height2').find('img').height(widthContent / 2);
        }
        if (albumOptions.album_layout != 'justified') {
            album.find('.ba-album-items').width(albumWidth);
            album.find('.ba-album-items').height(albumWidth);
        }
        if (albumOptions.album_layout == 'metro') {
            album.find('.width2').css('width', albumWidth * 2 + (galleryOptions.image_spacing * 1)+'px');
            album.find('.height2').css('height', albumWidth*2+(galleryOptions.image_spacing * 1)+'px');
            album.find('.height2 img').css('height', albumWidth * 2 + (galleryOptions.image_spacing * 1)+'px');
            album.find('.width2:not(.height2) img').css('height', albumWidth+'px');
        } else if (albumOptions.album_layout == 'masonry') {
            album.find('.height2').css('height', albumWidth * 2 + (galleryOptions.image_spacing * 1)+'px');
            album.find('.height2 img').css('height', albumWidth * 2 + (galleryOptions.image_spacing * 1)+'px');
        } else if (albumOptions.album_layout == 'square') {
            album.find('.width2').css('width', albumWidth * 2 +(galleryOptions.image_spacing * 1)+'px');
            album.find('.height2').css('height', albumWidth * 2 +(galleryOptions.image_spacing * 1)+'px');
            album.find('.height2 img').css('height', albumWidth * 2+(galleryOptions.image_spacing * 1)+'px');
        } else if (albumOptions.album_layout == 'random') {
            album.find('.ba-album-items').height('auto');
            album.find('.ba-album-items, .ba-album-items img').width(albumWidth);
            var ratio = 1;
            album.find('.ba-album-items img').each(function(){
                var $this = jQuery(this),
                    w = $this.attr('data-width'),
                    h = $this.attr('data-height');
                ratio = w / h;
                $this.css('height', albumWidth / ratio);
            });
        }
        if (winSize <= 480) {
            album.find('.width2.height2').width(albumWidth).height(albumWidth);
            album.find('.width2.height2 img').height(albumWidth);
            album.find('.width2').not('.height2').width(albumWidth).height(albumWidth / 2);
            album.find('.width2').not('.height2').find('img').height(albumWidth / 2);
        }
    }
    
    function resizeIsotope()
    {
        winSize = ba_jQuery(window).width();
        widthContent = getWidthContent();
        setSize();
        if (pageRefresh == 1 && pagination && pagination.pagination_type != 'infinity') {
            currentPage = '';
        }
        if (albumMode) {
            album.ba_isotope({
                filter: category,
                margin : albumOptions.album_image_spacing,
                count : aimgC,
                mode: albumOptions.album_layout
            });
            if (category == '.root') {
                gallery.find('.ba-goback').hide();
            }
        }
        if (pagination && pagination.pagination_type != 'infinity') {
            if (pagination.pagination_type != 'load') {
                var array = category.split(', '),
                    str = '';
                for (var i = 0; i < array.length; i++) {
                    array[i] += currentPage;
                }
                str = array.join(', ');
                $container.ba_isotope({
                    filter: str,
                    margin : galleryOptions.image_spacing,
                    count : imgC,
                    mode : layout
                });
            } else {
                var array = category.split(', '),
                    page = currentPage.replace(new RegExp('.page-', 'g'), ''),
                    current = '';
                for (var j = 0; j < array.length; j++) {
                    if (current) {
                        current += ', ';
                    }
                    for (var i = 1; i <= page; i++) {
                        current += array[j]+'.page-'+i;
                        if (i != page) {
                            current += ', ';
                        }
                    }
                }
                $container.ba_isotope({
                    filter: current,
                    margin : galleryOptions.image_spacing,
                    count : imgC,
                    mode : layout
                });
            }
        } else {
            if (pagination && galleryOptions.pagination_type == 'infinity') {
                getInfinityImages();
            } else {
                $container.ba_isotope({
                    filter: category,
                    margin : galleryOptions.image_spacing,
                    count : imgC,
                    mode : layout
                });
            }
        }
        setTimeout(function(){
            gallery.css('height', '');
        }, 500);
        if (!pagination || (pagination && galleryOptions.pagination_type != 'infinity')) {
            gallery.trigger('scroll');
        }
    }

    $container.on('show_isotope', function(){
        gallery.find('.category-filter').show();
        if (pagination) {
            checkPaginator();
        }
        if (category != '.root') {
            gallery.find('.ba-goback').show();
        }
    });
    
    ba_jQuery('a[data-toggle="tab"], [data-uk-tab]').on('shown shown.bs.tab change.uk.tab', function(){
        resizeIsotope();
    });

    jQuery('a[data-toggle="tab"]').on('click', function(){
        setTimeout(function(){
            resizeIsotope();
        }, 1);
    });

    jQuery('ul[data-uk-switcher] li a').on('click', function(){
        setTimeout(function(){
            resizeIsotope();
        }, 300);
    });

    jQuery('.sppb-nav li a').on('click', function(){
        setTimeout(function(){
            resizeIsotope();
        }, 200);
    });

    var resizeITime;
    
    ba_jQuery(window).on('resize.isotope', function(){
        clearTimeout(resizeITime);
        resizeITime = setTimeout(function(){
            var newWinsize = ba_jQuery(window).width();
            if (winSize != newWinsize) {
                resizeIsotope();
                if (galleryModal.find('.header-icons').length == 0) {
                    return false;
                }
                if (winSize <= 1024) {
                    var shadow = galleryModal.parent()[0].style.backgroundColor;
                    galleryModal.find('.header-icons')[0].style.boxShadow = 'inset 0px -85px 150px -85px '+shadow;
                } else {
                    galleryModal.find('.header-icons')[0].style.boxShadow = '';
                }
            }
        }, 100);
    });
    
    function paginationAction(button)
    {
        if (pagination.pagination_type != 'load') {
            var next = button.attr('data-filter');
            if (currentPage == next) {
                return false;
            }
            currentPage = next;
            gallery.find('.ba-current').removeClass('ba-current');
            gallery.find('.ba-pagination [data-filter="'+next+'"]').each(function(){
                if (!ba_jQuery(this).hasClass('ba-prev') && !ba_jQuery(this).hasClass('ba-next')
                    && !ba_jQuery(this).hasClass('ba-first-page') && !ba_jQuery(this).hasClass('ba-last-page')) {
                    ba_jQuery(this).addClass('ba-current');
                }
            });
            var prev = next.substr(6)-1;
            if (prev == 0) {
                prev = 1;
                if (pagination.pagination_type == 'slider') {
                    prev = paginationPages;
                } else {
                    gallery.find('.ba-prev').addClass('ba-dissabled');
                    gallery.find('.ba-first-page').addClass('ba-dissabled');
                }
            } else {
                gallery.find('.ba-prev').removeClass('ba-dissabled');
                gallery.find('.ba-first-page').removeClass('ba-dissabled');
            }
            next = next.substr(6);
            next = next*1+1;
            if (next > paginationPages) {
                next = next-1;
                if (pagination.pagination_type == 'slider') {
                    next = 1;
                } else {
                    gallery.find('.ba-next').addClass('ba-dissabled');
                    gallery.find('.ba-last-page').addClass('ba-dissabled');
                }
            } else {
                gallery.find('.ba-next').removeClass('ba-dissabled');
                gallery.find('.ba-last-page').removeClass('ba-dissabled');
            }
            gallery.find('.ba-prev').attr('data-filter', '.page-'+prev);
            gallery.find('.ba-next').attr('data-filter', '.page-'+next);
            if (galleryOptions.disable_auto_scroll != 1) {
                var position = $container.offset().top,
                    target = jQuery('html, body');
                if (gallery.hasClass('album-in-lightbox')) {
                    target = gallery;
                    position = 0;
                }
                target.stop().animate({
                    scrollTop: position
                }, 'slow');
            }
        } else {
            var next = button.attr('data-filter');
            currentPage = next;
            next = next.substr(6);
            if (next < paginationPages) {
                next = next * 1 + 1;
                button.attr('data-filter', '.page-'+next);
            } else {
                button.removeClass('load-more').addClass('scroll-to-top');
                button.text(paginationConst[3]);
                var position = gallery.offset().top,
                    target = jQuery('html, body');
                if (gallery.hasClass('album-in-lightbox')) {
                    target = gallery;
                    position = 0;
                }
                button.on('click', function(){
                    target.stop().animate({
                        scrollTop: position
                    }, 'slow');
                });
            }
        }
        resizeIsotope();
    }
    
    function addPaginationStyle()
    {
        gallery.find('.ba-pagination a').css('background-color', pagination.pagination_bg);
        gallery.find('.ba-pagination a').css('border-radius', pagination.pagination_radius+'px');
        gallery.find('.ba-pagination a').css('border', '1px solid '+pagination.pagination_border);
        gallery.find('.ba-pagination a').css('color', pagination.pagination_font);
        gallery.find('.ba-pagination').css('text-align', pagination.pagination_alignment);
        gallery.find('.ba-pagination a').hover(function(){
            ba_jQuery(this).css('background-color', pagination.pagination_bg_hover);
            ba_jQuery(this).css('color', pagination.pagination_font_hover);
        }, function(){
            if (!ba_jQuery(this).hasClass('ba-current')) {
                ba_jQuery(this).css('background-color', pagination.pagination_bg);
                ba_jQuery(this).css('color', pagination.pagination_font);
            } else {
                ba_jQuery(this).css('background-color', pagination.pagination_bg_hover);
                ba_jQuery(this).css('color', pagination.pagination_font_hover);
            }
        });
        gallery.find('.ba-current').css('background-color', pagination.pagination_bg_hover);
        gallery.find('.ba-current').css('color', pagination.pagination_font_hover);
    }
    
    function addPaginationFilter()
    {
        var n = 1;
        if (pagination.pagination_type != 'load' && pagination.pagination_type != 'infinity') {
            gallery.find('.ba-pagination a').not('.ba-first-page, .ba-prev, .ba-next, .ba-last-page').each(function(){
                ba_jQuery(this).attr('data-filter', '.page-'+n);
                n++;
            });
            n--;
            gallery.find('.ba-prev').attr('data-filter', '.page-1');
            gallery.find('.ba-first-page').attr('data-filter', '.page-1');
            gallery.find('.ba-last-page').attr('data-filter', '.page-'+n);
            if (paginationPages != 1) {
                gallery.find('.ba-next').attr('data-filter', '.page-2');
            } else {
                gallery.find('.ba-next').attr('data-filter', '.page-1');
            }
        } else {
            if (paginationPages != 1) {
                gallery.find('.ba-pagination a').attr('data-filter', '.page-2');
            } else {
                gallery.find('.ba-pagination a').attr('data-filter', '.page-1');
            }
        }
    }
    
    function addPages()
    {
        removePages();
        var page = 1,
            items = gallery.find('.ba-gallery-grid '+category)
            n = 0;
        if (pageRefresh == 1) {
            items.addClass('page-'+page);
            return false;
        }
        items.each(function(ind, elem){
            if (n < pagination.images_per_page) {
                ba_jQuery(this).addClass('page-'+page);
                n++;
            } else {
                n = 0;
                page++;
                ba_jQuery(this).addClass('page-'+page);
                n++;
            }
        });
    }
    
    function removePages()
    {
        var len = gallery.find('.ba-gallery-items').length,
            n = Math.ceil(len / pagination.images_per_page) + 1;
        for (var i = 1; i <= n; i++) {
            gallery.find('.ba-gallery-items').removeClass('page-'+i);
        }
    }

    if (style.disable_lightbox == 0) {
        gallery.find('.ba-gallery-grid').on('click', '.ba-gallery-items', function(){
            image = ba_jQuery(this).find('.image-id').val();
            image = image.replace(new RegExp("-_-_-_",'g'), "'");
            var item = JSON.parse(image);
            if (item.link == '') {
                elements = getData();
                showOptions();
                galleryModal.ba_modal();
                originalLocation = window.location.href;
                addModalEvents(this);
            }
        });
    }
    galleryModal.on('hide', function() {
        galleryModal.parent().addClass('hide-animation');
        setTimeout(function(){
            galleryModal.parent().removeClass('hide-animation');
            hideOptions();
            galleryModal.removeClass('ba-description-left ba-description-right');
        }, 500);
    });
    
    function addModalEvents($this)
    {
        var startCoords = {},
            endCoords = {},
            hDistance,
            evCache = new Array(),
            prevDiff = -1,
            modalImage = galleryModal.find('.modal-image'),
            xabs, yabs;
        imageIndex = elements.indexOf(image);
        galleryModal.parent().find('.modal-nav').show();
        setImage(image, imagesArray[imageIndex]);
        galleryModal.parent().find('.modal-nav .ba-left-action').on('click', function(){
            if (slideFlag){
                getPrev();
            }
        });
        galleryModal.on('mousedown', function(event){
            if (ba_jQuery(event.srcElement).hasClass('gallery-modal')) {
                galleryModal.ba_modal('hide');
            }                
        });
        galleryModal.parent().find('.modal-nav .ba-right-action').on('click', function(){
            if (slideFlag) {
                getNext();
            }
        });
        galleryModal.find('.ba-icon-close').on('click', function(event){
            event.preventDefault();
            event.stopPropagation();
            galleryModal.ba_modal('hide');
        });        
        galleryModal.find('.ba-modal-header .ba-like-wrapper').on('click', function(event){
            event.stopPropagation();
            jQuery(this).addClass('likes-animation');
            setTimeout(function(){
                galleryModal.find('.ba-modal-header .ba-like-wrapper').removeClass('likes-animation');
            }, 300);
            likeImage();
        });
        galleryModal.find('.zmdi.zmdi-share').on('click', function(event){
            event.stopPropagation();
            event.preventDefault();
            var aimDelay = 0;
            galleryModal.find('.ba-share-icons').addClass('visible-sharing').one('click', function(){
                setTimeout(function(){
                    galleryModal.find('.ba-share-icons').addClass('sharing-out');
                    setTimeout(function(){
                        galleryModal.find('.ba-share-icons').removeClass('sharing-out visible-sharing');
                    }, 500);
                }, 100);
            }).find('i').each(function(){
                jQuery(this).css('animation-delay', aimDelay+'s');
                aimDelay += 0.1;
            });
            return false;
        });
        ba_jQuery(window).on('keyup', function(event) {
            event.preventDefault();
            event.stopPropagation();
            if (event.keyCode === 37 && slideFlag) {
                getPrev();
            } else if (event.keyCode === 39 && slideFlag) {
                getNext();
            } else if ( event.keyCode === 27 ) {
                galleryModal.ba_modal('hide');
                galleryModal.find('.ba-share-icons').removeClass('visible-sharing')
            }
        });

        ba_jQuery('body').on('touchstart.bagallery', function(event) {
            evCache.push(event);
            endCoords = event.originalEvent.targetTouches[0];
            startCoords.pageX = event.originalEvent.targetTouches[0].pageX;
            startCoords.pageY = event.originalEvent.targetTouches[0].pageY;
        });
        ba_jQuery('body').on('touchmove.bagallery', function(event) {
            endCoords = event.originalEvent.targetTouches[0];
        });
        ba_jQuery('body').on('touchend.bagallery', function(event) {
            evCache = new Array();
            prevDiff = -1;
            hDistance = endCoords.pageX - startCoords.pageX;
            xabs = Math.abs(endCoords.pageX - startCoords.pageX);
            yabs = Math.abs(endCoords.pageY - startCoords.pageY);
            if (hDistance >= 100 && xabs >= yabs * 2 && zoomClk == 1) {
                getPrev();
            } else if (hDistance <= -100 && xabs >= yabs * 2 && zoomClk == 1) {
                getNext();
            }
        });

        function resizeModal()
        {
            var item = JSON.parse(image);
            if (jQuery(window).width() > 1024 && (item.description || disqus_shortname || vk_api)) {
                galleryModal.addClass('ba-description-'+style.description_position);
            } else {
                galleryModal.removeClass('ba-description-'+style.description_position);
            }
            if (style.auto_resize != 0) {
                setTimeout(function(){
                    var dWidth = window.innerWidth,
                        dHeight = window.innerHeight;
                    if (!item.video) {
                        var imgWidth = globalImage.width,
                            modalTop,
                            imgHeight = globalImage.height;
                        if (galleryModal.hasClass('ba-description-left') || galleryModal.hasClass('ba-description-right')) {
                            dWidth -= 400;
                        }
                        if (imgWidth < dWidth && imgHeight < dHeight) {
                            
                        } else {
                            var percent = imgWidth / imgHeight;
                            if (imgWidth > imgHeight) {
                                imgWidth = dWidth;
                                imgHeight = imgWidth / percent;
                            } else {
                                imgHeight = dHeight;
                                imgWidth = percent * imgHeight;
                            }
                            if (imgHeight > dHeight) {
                                imgHeight = dHeight;
                                imgWidth = percent * imgHeight;
                            }
                            if (imgWidth > dWidth) {
                                imgWidth = dWidth;
                                imgHeight = imgWidth / percent;
                            }
                            if (imgHeight == dHeight && item.description &&
                                !galleryModal.hasClass('ba-description-left') && !galleryModal.hasClass('ba-description-right')) {
                                dHeight = dHeight * 0.9;
                                imgHeight = dHeight;
                                imgWidth = percent * imgHeight;
                            }
                        }
                        modalTop = (dHeight - imgHeight) / 2;
                        galleryModal.stop().animate({
                            'width' : Math.round(imgWidth),
                            'margin-top' : Math.round(modalTop)
                        }, 500, function(){
                            galleryModal.css({'height' : 'auto'});
                            slideFlag = true;
                        });
                        goodWidth = imgWidth;
                        goodHeight = imgHeight;
                    } else {
                        if (galleryModal.hasClass('ba-description-left') || galleryModal.hasClass('ba-description-right')) {
                            dWidth -= 400;
                        }
                        var height = dHeight - 200,
                            percent = height / dHeight,
                            width = dWidth * percent;
                        if (jQuery(window).width() <= 1024) {
                            width = dWidth;
                        }
                        galleryModal[0].style.height = '';
                        galleryModal.css({
                            'width' : Math.round(width)+'px'
                        });
                        setTimeout(function(){
                            var top = (height - galleryModal.height()) / 2 + 100;
                            if (top < ba_jQuery(window).height() * 0.1) {
                                top = ba_jQuery(window).height() * 0.1;
                            }
                            galleryModal.css({
                                'margin-top' : top+'px'
                            });
                        }, 1);
                    }
                }, 500);
            } else {
                if (jQuery(window).width() <= 1024) {
                    galleryModal.addClass('ba-resize');
                    var imgWidth = goodWidth,
                        imgHeight = goodHeight,
                        dWidth = window.innerWidth,
                        dHeight = window.innerHeight;
                    if (imgWidth < dWidth && imgHeight < dHeight) {
                        
                    } else {
                        var percent = imgWidth / imgHeight;
                        if (imgWidth > imgHeight) {
                            imgWidth = dWidth;
                            imgHeight = imgWidth / percent;
                        } else {
                            imgHeight = dHeight;
                            imgWidth = percent * imgHeight;
                        }
                        if (imgHeight > dHeight) {
                            imgHeight = dHeight;
                            imgWidth = percent * imgHeight;
                        }
                        if (imgWidth > dWidth) {
                            imgWidth = dWidth;
                            imgHeight = imgWidth / percent;
                        }
                        if (imgHeight == dHeight && item.description) {
                            dHeight = dHeight * 0.9;
                            imgHeight = dHeight;
                            imgWidth = percent * imgHeight;
                        }
                    }
                    modalTop = (dHeight - imgHeight) / 2;
                    galleryModal.css({
                        'width' : Math.round(imgWidth),
                        'margin-top' : Math.round(modalTop)
                    });
                } else {
                    galleryModal.removeClass('ba-resize');
                    var width = style.lightbox_width;
                    if (galleryModal.hasClass('ba-description-left') || galleryModal.hasClass('ba-description-right')) {
                        width = width / 100;
                        width = 'calc((100% - 400px)*'+width+')';
                    } else {
                        width += '%';
                    }
                    galleryModal.css({
                        'width' : width,
                        'margin-top' : ''
                    });
                }
            }
        }

        ba_jQuery(window).on('resize.bagallery', function(){
            resizeModal();
        });
    }
    
    function showOptions()
    {
        ba_jQuery('body').addClass('modal-open');
        galleryModal.parent().addClass('ba-scrollable');
        goodWidth = (ba_jQuery(window).height()-100)*1.6;
        goodHeight = ba_jQuery(window).height()-100;
        addModalStyle();
    }
    
    function hideOptions()
    {
        checkHash();
        galleryModal.parent().find('.modal-nav').hide();
        galleryModal.parent().find('.modal-nav .ba-left-action').off('click');
        galleryModal.parent().find('.modal-nav .ba-right-action').off('click');
        ba_jQuery('body').off('touchstart.bagallery');
        ba_jQuery('body').off('touchmove.bagallery');
        ba_jQuery(window).off('orientationchange.bagallery');
        ba_jQuery('body').off('touchend.bagallery');
        galleryModal.off('click');
        ba_jQuery( window ).off('keyup');
        galleryModal.find('.ba-icon-close, .zmdi.zmdi-share').off('click touchend');
        galleryModal.find('.ba-modal-header .ba-like-wrapper').off('click touchend');
        if (style.enable_alias == 1 && originalLocation && window.location.href != originalLocation) {
            window.history.replaceState(null, null, originalLocation);
        }
        galleryModal.parent().removeClass('ba-scrollable');
        ba_jQuery('body').removeClass('modal-open');
        galleryModal.find('.modal-image').empty();
        if (!fullscreen) {
            galleryModal.find('.display-lightbox-fullscreen').trigger('click');
        }
    }
    
    function getData()
    {
        var items = [];
        imagesArray = [];
        if (category) {
            gallery.find(category).find('.image-id').each(function(){
                var elem = ba_jQuery(this).val();
                elem = elem.replace(new RegExp("-_-_-_",'g'), "'");
                var item = JSON.parse(elem);
                if (item.link == '') {
                    var alias = jQuery(this).closest('.ba-gallery-items').find('.ba-gallery-image-link').attr('data-href');
                    imagesArray.push(alias);
                    items.push(elem);
                }
            });
        } else {
            gallery.find('.image-id').each(function(){
                var elem = ba_jQuery(this).val();
                elem = elem.replace(new RegExp("-_-_-_",'g'), "'");;
                var item = JSON.parse(elem);
                if (item.link == '') {
                    var alias = jQuery(this).closest('.ba-gallery-items').find('.ba-gallery-image-link').attr('data-href');
                    imagesArray.push(alias);
                    items.push(elem);
                }
            });
        }
        return items;
    }

    var imgCounts = null;

    function checkImgCounts()
    {
        if (!imgCounts) {
            imgCounts = {
                'category-0': 0
            };
            for (ind in infinity.catImageCount) {
                if (infinity.unpublishCats.indexOf(ind.replace('category-', '')) == -1) {
                    imgCounts['category-0'] += infinity.catImageCount[ind] * 1;
                    imgCounts[ind] = infinity.catImageCount[ind] * 1;
                }
            }
        }
    }

    function getGalleryImageInfinity(imageIndex)
    {
        var data = jQuery.extend(true, {}, infinity);
        data.imageIndex = imageIndex;
        jQuery.ajax({
            url: juri+'index.php?option=com_bagallery&task=gallery.getGalleryImageInfinity&tmpl=component',
            type: "POST",
            dataType: 'text',
            data: data,
            success: function(msg) {
                var div = document.createElement('div');
                div.innerHTML = msg;
                jQuery(div).find('.ba-gallery-items').each(function(){
                    imagesArray[imageIndex] = this.querySelector('.ba-gallery-image-link').dataset.href;
                    elements[imageIndex] = this.querySelector('.image-id').value;
                    image = elements[imageIndex];
                    setImage(image, imagesArray[imageIndex]);
                });
            }
        });
    }

    function getGalleryImageRefresh(imageIndex)
    {
        var data = jQuery.extend(true, {}, refreshData);
        data.imageIndex = imageIndex;
        jQuery.ajax({
            url: juri+'index.php?option=com_bagallery&task=gallery.getGalleryImageRefresh&tmpl=component',
            type: "POST",
            dataType: 'text',
            data: data,
            success: function(msg) {
                var div = document.createElement('div');
                div.innerHTML = msg;
                jQuery(div).find('.ba-gallery-items').each(function(){
                    imagesArray[imageIndex] = this.querySelector('.ba-gallery-image-link').dataset.href;
                    elements[imageIndex] = this.querySelector('.image-id').value;
                    image = elements[imageIndex];
                    setImage(image, imagesArray[imageIndex]);
                });
            }
        });
    }

    function getNext()
    {
        imageIndex++;
        if (imageIndex == elements.length && infinity && infinity.category) {
            checkImgCounts();
        }
        if (infinity && infinity.category && !elements[imageIndex] &&
            infinity.page * pagination.images_per_page - (pagination.images_per_page - imageIndex) < imgCounts[infinity.category]) {
            getGalleryImageInfinity(imageIndex);
            return false;
        } else if (!elements[imageIndex] && pageRefresh == 1 && pagination &&
            refreshData.currentPage * pagination.images_per_page - (pagination.images_per_page - imageIndex) < refreshData.order.length) {
            getGalleryImageRefresh(imageIndex);
            return false;
        }
        if (imageIndex >= elements.length) {
            imageIndex = 0;
        }
        image = elements[imageIndex];
        setImage(image, imagesArray[imageIndex]);
    }
    
    function getPrev()
    {
        imageIndex--;
        if (imageIndex < 0 && infinity && infinity.category) {
            checkImgCounts();
            imageIndex = imgCounts[infinity.category] - 1;
        } else if (imageIndex < 0 && pageRefresh == 1 && pagination) {
            imageIndex = refreshData.currentPage * pagination.images_per_page - pagination.images_per_page;
            imageIndex = imageIndex == 0 ? refreshData.order.length - 1 : imageIndex;
        }
        if (infinity && infinity.category && !elements[imageIndex]) {
            getGalleryImageInfinity(imageIndex);
            return false;
        } else if (pageRefresh == 1 && !elements[imageIndex]) {
            getGalleryImageRefresh(imageIndex);
            return false;
        }
        if (imageIndex < 0) {
            imageIndex = elements.length - 1;
        }
        image = elements[imageIndex];
        setImage(image, imagesArray[imageIndex]);
    }

    function locationImage()
    {
        if (catModal.hasClass('in') && !catModal.parent().hasClass('modal-scrollable-out')) {
            return false;
        }
        var imageFlag = false;
        if (window.location.search) {
            var search = decodeURIComponent(window.location.href);
            gallery.find('.ba-gallery-image-link[data-href="'+search+'"]').each(function(){
                elements = getData();
                image = jQuery(this).parent().find('.image-id').val().replace(/-_-_-_/g, "'");
                showOptions();
                galleryModal.ba_modal();
                originalLocation = gallery.find('.active-category-image').val();
                addModalEvents(this);
                imageFlag = true;
                return false;
            });
            if (!imageFlag && galleryModal.hasClass('in')) {
                galleryModal.ba_modal('hide');
            }
        } else {
            hideOptions();
        }

        return imageFlag;
    }

    function isNumber(n)
    {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function checkImage(search)
    {
        var flag = false,
            image = gallery.find('.image-id[data-id="ba-image-'+search+'"]');
        if (image.length > 0) {
            flag = true;
        }
        
        return flag;
    }
    
    function checkTitle(search)
    {
        var items = [];
        gallery.find(' .image-id').each(function(){
            var elem = jQuery(this).val();
            elem = elem.replace(new RegExp("-_-_-_",'g'), "'");;
            var item = JSON.parse(elem);
            if (item.link == '') {
                items.push(elem);
            }
        });
        var n = items.length,
            flag = false,
            el = '';
        for (var i = 0; i < n; i++) {
            el = JSON.parse(items[i]);
            if (el.lightboxUrl) {
                var url = el.lightboxUrl.replace(/ /g, "-").replace(/%/g, "").replace(/\?/g, "").toLowerCase();
                if (url == decodeURI(search).toLowerCase()) {
                    flag = true;
                    break;
                }
            }
        }
        
        return flag;
    }

    function setImage(image, imageUrl)
    {
        checkHash();
        galleryModal.find('.ba-zoom-out').addClass('disabled-item');
        galleryModal.find('.ba-zoom-in').removeClass('disabled-item');
        galleryModal.removeClass('hidden-description');
        galleryModal.parent().css('overflow', '');
        var vk = {
            redesign : 1,
            limit : 10,
            attach : "*",
            pageUrl : window.location.href
        }
        var item = JSON.parse(image);
        if (item.url.indexOf('gallery.addWatermark') !== -1 || item.url.indexOf('gallery.compressionImage') !== -1) {
            var str = '<img style="" src="'+juri;
            str += 'components/com_bagallery/assets/images/reload.svg" class="reload">';
            galleryModal.find('.ba-modal-body').addClass('reload-parent');
            galleryModal.find('.ba-modal-body').css('background-color', style.lightbox_border);
            galleryModal.addClass('ba-resize');
            galleryModal.find('.modal-image').html(str);
            jQuery.ajax({
                dataType:'text',
                url : item.url,
                success: function(msg){
                    item.url = msg;
                    image = JSON.stringify(item);
                    gallery.find('.image-id[data-id="ba-image-'+item.id+'"]').val(image);
                    elements[imageIndex] = image;
                    setImage(image, imageUrl);
                }
            });
            return false;
        }
        if (jQuery(window).width() > 1024 && (item.description || disqus_shortname || vk_api)) {
            galleryModal.addClass('ba-description-'+style.description_position);
        } else {
            galleryModal.removeClass('ba-description-'+style.description_position);
        }
        if (style.enable_alias == 1) {
            if (disqus_shortname) {
                disqus_url = imageUrl;
            }
            if (window.location.href != imageUrl) {
                window.history.replaceState(null, null, imageUrl);
            }
        }
        if (disqus_shortname) {
            jQuery('#disqus_thread').empty()
            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
            jQuery(dsq).remove();
            dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq)
        }
        jQuery("#ba-vk-"+galleryId).empty();
        galleryModal.find('.ba-download-img').attr('href', item.url);
        if (!item.video) {
            if (style.auto_resize != 0) {
                var str = '<img style="" src="'+juri;
                str += 'components/com_bagallery/assets/images/reload.svg" class="reload">';
                galleryModal.find('.ba-modal-body').addClass('reload-parent');
            } else {
                var str = document.createElement('img');
                str.src = item.url;
                str.alt = item.alt;
                str.onload = function(){
                    goodWidth = this.width;
                    goodHeight = this.height;
                    if (jQuery(window).width() <= 1024) {
                        var imgWidth = goodWidth,
                            imgHeight = goodHeight,
                            dWidth = jQuery(window).width(),
                            dHeight = window.innerHeight;
                        if (imgWidth < dWidth && imgHeight < dHeight) {
                            
                        } else {
                            var percent = imgWidth / imgHeight;
                            if (imgWidth > imgHeight) {
                                imgWidth = dWidth;
                                imgHeight = imgWidth / percent;
                            } else {
                                imgHeight = dHeight;
                                imgWidth = percent * imgHeight;
                            }
                            if (imgHeight > dHeight) {
                                imgHeight = dHeight;
                                imgWidth = percent * imgHeight;
                            }
                            if (imgWidth > dWidth) {
                                imgWidth = dWidth;
                                imgHeight = imgWidth / percent;
                            }
                            if (imgHeight == dHeight && item.description) {
                                dHeight = dHeight * 0.9;
                                imgHeight = dHeight;
                                imgWidth = percent * imgHeight;
                            }
                        }
                        modalTop = (dHeight - imgHeight) / 2;
                        galleryModal.css({
                            'width' : Math.round(imgWidth),
                            'margin-top' : Math.round(modalTop)
                        });
                        createVK(vk);
                    } else {
                        var width = style.lightbox_width;
                        if (galleryModal.hasClass('ba-description-left') || galleryModal.hasClass('ba-description-right')) {
                            width = width / 100;
                            width = 'calc((100% - 400px)*'+width+')';
                        } else {
                            width += '%';
                        }
                        galleryModal.css({
                            'width' : width,
                            'margin-top' : ''
                        });
                    }
                };
            }
            galleryModal.find('.ba-modal-body').removeClass('embed-code');
            galleryModal.find('.modal-image').removeClass('embed');
            galleryModal.find('.ba-download-img, .ba-zoom-out, .ba-zoom-in').show();
        } else {
            galleryModal.find('.modal-image').addClass('embed');
            galleryModal.find('.ba-modal-body').addClass('embed-code');
            galleryModal.find('.ba-download-img, .ba-zoom-out, .ba-zoom-in').addClass('ba-hidden-icons');
            setTimeout(function(){
                galleryModal.find('.ba-download-img, .ba-zoom-out, .ba-zoom-in').removeClass('ba-hidden-icons').hide();
            }, 300);
            var str = item.video.replace('-_-_-_', "'");
            str = checkForms(str);
        }
        galleryModal.find('.modal-image').html(str);
        galleryModal.find('.modal-title').remove();
        if (titleSize > 0) {
            if (item.title) {
                var title = ba_jQuery('<h3/>', {
                    class: 'modal-title',
                    style: 'color:'+style.header_icons_color
                });
                galleryModal.find('.ba-modal-header .ba-modal-title').html(title);
                galleryModal.find('.modal-title').html(item.title);
            }
        }
        var descHeight = galleryModal.find('.modal-description').height();
        if (!descHeight || galleryModal.hasClass('ba-description-left') || galleryModal.hasClass('ba-description-right')) {
            descHeight = 0;
        }
        goodHeight += descHeight * 1;
        galleryModal.find('.modal-description').remove();
        galleryModal.find('.ba-likes p').text(item.likes);
        galleryModal.find('.ba-modal-body').css('background-color', style.lightbox_border);
        if (style.auto_resize != 0) {
            var dWidth = window.innerWidth,
                dHeight = window.innerHeight;
            if (!item.video) {
                jQuery('#disqus_thread').hide();
                var newImage = new Image(),
                    imgWidth,
                    imgHeight,
                    modalTop;
                slideFlag = false;
                galleryModal.css('height', goodHeight);
                newImage.onload = function(){
                    imgWidth = this.width;
                    imgHeight = this.height;
                    globalImage.width = this.width;
                    globalImage.height = this.height;
                    if (galleryModal.hasClass('ba-description-left') || galleryModal.hasClass('ba-description-right')) {
                        dWidth -= 400;
                    }
                    if (imgWidth < dWidth && imgHeight < dHeight) {
                        
                    } else {
                        var percent = imgWidth / imgHeight;
                        if (imgWidth > imgHeight) {
                            imgWidth = dWidth;
                            imgHeight = imgWidth / percent;
                        } else {
                            imgHeight = dHeight;
                            imgWidth = percent * imgHeight;
                        }
                        if (imgHeight > dHeight) {
                            imgHeight = dHeight;
                            imgWidth = percent * imgHeight;
                        }
                        if (imgWidth > dWidth) {
                            imgWidth = dWidth;
                            imgHeight = imgWidth / percent;
                        }
                        if (imgHeight == dHeight && item.description &&
                            !galleryModal.hasClass('ba-description-left') && !galleryModal.hasClass('ba-description-right')) {
                            dHeight = dHeight * 0.9;
                            imgHeight = dHeight;
                            imgWidth = percent * imgHeight;
                        }
                    }
                    modalTop = (dHeight - imgHeight) / 2;
                    galleryModal.animate({
                        'width' : Math.round(imgWidth),
                        'height' : Math.round(imgHeight),
                        'margin-top' : Math.round(modalTop)
                    }, 500, function(){
                        galleryModal.find('.modal-image img').attr('src', item.url).attr('alt', item.alt).removeClass('reload');
                        galleryModal.find('.ba-modal-body').removeClass('reload-parent');
                        galleryModal.css({'height' : 'auto'});
                        if (item.description) {
                            item.description = checkForms(item.description);
                            galleryModal.find('.ba-modal-body .description-wrapper')
                                .prepend('<div class="modal-description"></div>');
                            galleryModal.find('.modal-description').html(item.description);
                        }
                        jQuery('#disqus_thread').show();
                        createVK(vk);
                        slideFlag = true;
                    });
                    goodWidth = imgWidth;
                    goodHeight = imgHeight;
                }
                newImage.src = item.url;
            } else {
                if (galleryModal.hasClass('ba-description-left') || galleryModal.hasClass('ba-description-right')) {
                    dWidth -= 400;
                }
                var height = dHeight - 200,
                    percent = height / dHeight,
                    width = dWidth * percent,
                    top = dHeight * 0.1;
                if (jQuery(window).width() <= 1024) {
                    width = dWidth;
                }
                galleryModal[0].style.height = '';
                galleryModal.css({
                    'width' : Math.round(width)+'px',
                    'margin-top' : top+'px'
                });
                setTimeout(function(){
                    top = (height - galleryModal.height()) / 2 + 100;
                    if (top < ba_jQuery(window).height() * 0.1) {
                        top = ba_jQuery(window).height() * 0.1;
                    }
                    galleryModal.css({
                        'margin-top' : top+'px'
                    });
                }, 1);
                if (item.description) {
                    item.description = checkForms(item.description);
                    galleryModal.find('.ba-modal-body .description-wrapper')
                        .prepend('<div class="modal-description"></div>');
                    galleryModal.find('.modal-description').html(item.description);
                }
                createVK(vk);
            }
            galleryModal.addClass('ba-resize');
        } else {
            if (jQuery(window).width() > 1024) {
                galleryModal.removeClass('ba-resize');
                var width = style.lightbox_width;
                if (galleryModal.hasClass('ba-description-left') || galleryModal.hasClass('ba-description-right')) {
                    width = width / 100;
                    width = 'calc((100% - 400px)*'+width+')';
                } else {
                    width += '%';
                }
                galleryModal.css({
                    'width' : width,
                    'margin-top' : ''
                });
            } else {
                galleryModal.addClass('ba-resize');
            }
            if (item.description) {
                item.description = checkForms(item.description);
                galleryModal.find('.ba-modal-body .description-wrapper')
                    .prepend('<div class="modal-description"></div>');
                galleryModal.find('.modal-description').html(item.description);
            }
            createVK(vk);
        }
        zoomClk = 1;
    }

    galleryModal.find('.ba-zoom-out').on('click', function(){
        if (zoomClk == 1) {
            return false;
        }
        galleryModal.removeClass('hidden-description');
        jQuery(this).addClass('disabled-item');
        galleryModal.find('.ba-zoom-in').removeClass('disabled-item');
        var img = galleryModal.find('.modal-image img');
        img.addClass('ba-zoom-image').css({
            width : zoomW,
            height : zoomH,
            top : zoomT,
            left : zoomL,
            position : 'absolute'
        });
        setTimeout(function(){
            img.css({
                position : '',
                width : '',
                height : '',
                left: '',
                top : '',
                'max-width' : '',
                'max-height' : '',
                'cursor' : ''
            }).off('mousedown.zoom mouseup.zoom touchstart.zoom touchend.zoom').removeClass('ba-zoom-image');
            galleryModal.parent().css('overflow', '');
        }, 150);
        zoomClk = 1;
    });

    var zoomClk = 1,
        maxZoom = 10,
        zoomW,
        zoomH,
        zoomT,
        zoomL;

    galleryModal.find('.ba-zoom-in').on('click', function(){
        if (slideFlag) {
            if (galleryModal.parent().scrollTop() > 0) {
                galleryModal.parent().stop().animate({
                    scrollTop: 0
                }, 150, function(){
                    galleryModal.find('.ba-zoom-in').trigger('click');
                });
                return false;
            }
            if (zoomClk > maxZoom) {
                jQuery(this).addClass('disabled-item');
                return false;
            }
            galleryModal.addClass('hidden-description');
            galleryModal.find('.ba-zoom-out').removeClass('disabled-item');
            var img = galleryModal.find('.modal-image img'),
                position = img.position(),
                width = img.width() * 1.2,
                height = img.height() * 1.2,
                w = window.innerWidth,
                h = window.innerHeight;
            if (galleryModal.hasClass('ba-description-left') || galleryModal.hasClass('ba-description-right')) {
                w -= 400;
            }
            var left = (w - width) / 2,
                top = (h - img.height() * 1.2) / 2;
            if (galleryModal.hasClass('ba-description-left')) {
                left += 400;
            }
            if (zoomClk == 1) {
                zoomW = img.width();
                zoomH = img.height();
                zoomT = position.top;
                zoomL = position.left;
                img.css({
                    width : zoomW,
                    height : zoomH,
                    top : zoomT,
                    left : zoomL,
                    position : 'absolute'
                });
            }
            zoomClk++;
            if (img.length == 0) {
                return false;
            }
            setTimeout(function(){
                img.addClass('ba-zoom-image').css({
                    position : 'absolute',
                    width : width,
                    height : height,
                    left: left,
                    top : top,
                    'max-width' : 'none',
                    'max-height' : 'none',
                    'cursor' : 'move'
                });
            }, 100);
            setTimeout(function(){
                img.removeClass('ba-zoom-image');
                galleryModal.parent().css('overflow', 'hidden');
            }, 150);
            galleryModal.off('mousedown.zoom').on('mousedown.zoom', function(){
                return false;
            }).off('mouseup.zoom').on('mouseup.zoom', function(){
                img.off('mousemove.zoom').off('mouseup.zoom');
            });
            img.off('mousedown.zoom touchstart.zoom').on('mousedown.zoom touchstart.zoom', function(e){
                e.stopPropagation();
                var x = e.clientX,
                    y = e.clientY;
                if (e.type == 'touchstart') {
                    x = e.originalEvent.targetTouches[0].pageX;
                    y = e.originalEvent.targetTouches[0].pageY;
                }
                jQuery(this).on('mousemove.zoom touchmove.zoom', function(event){
                    var deltaX = x - event.clientX,
                        deltaY = y - event.clientY,
                        w = document.documentElement.clientWidth,
                        h = document.documentElement.clientHeight;
                    if (e.type == 'touchstart') {
                        deltaX = x - event.originalEvent.targetTouches[0].pageX;
                        deltaY = y - event.originalEvent.targetTouches[0].pageY;
                    }
                    if (galleryModal.hasClass('ba-description-left') || galleryModal.hasClass('ba-description-right')) {
                        w -= 400;
                    }
                    var maxX = (width - w) * -1,
                        maxY = (height - h) * -1,
                        minX = 0,
                        minY = 0;
                    if (galleryModal.hasClass('ba-description-left')) {
                        minX = 400;
                        maxX += 400;
                    }
                    x = event.clientX;
                    y = event.clientY;
                    if (e.type == 'touchstart') {
                        x = event.originalEvent.targetTouches[0].pageX;
                        y = event.originalEvent.targetTouches[0].pageY;
                    }
                    if (width > w) {
                        if (deltaX > 0 && left > maxX) {
                            left -= Math.abs(deltaX);
                            left = left < maxX ? maxX : left;
                            jQuery(this).css('left', left);
                        } else if (deltaX < 0 && left < minX) {
                            left += Math.abs(deltaX);
                            left = left > minX ? minX : left;
                            jQuery(this).css('left', left);
                        }
                    }
                    if (height > h) {
                        if (deltaY > 0 && top > maxY) {
                            top -= Math.abs(deltaY);
                            top = top < maxY ? maxY : top;
                            jQuery(this).css('top', top);
                        } else if (deltaY < 0 && top < minY) {
                            top += Math.abs(deltaY);
                            top = top > minY ? minY : top;
                            jQuery(this).css({
                                'top' : top
                            });
                        }
                    }                        
                    return false;
                });
                return false;
            }).off('mouseup.zoom touchend.zoom').on('mouseup.zoom touchend.zoom', function(){
                jQuery(this).off('mousemove.zoom touchmove.zoom');
            });
        }
    });

    var fullscreen = true;

    function checkFullscreen()
    {
        if (document.fullscreenElement || document.webkitIsFullScreen
            || document.mozFullScreen || document.msFullscreenElement) {
            galleryModal.find('.display-lightbox-fullscreen').removeClass('zmdi-fullscreen')
                .addClass('zmdi-fullscreen-exit');
            fullscreen = false;
        } else {
            galleryModal.find('.display-lightbox-fullscreen').removeClass('zmdi-fullscreen-exit')
                .addClass('zmdi-fullscreen');
            fullscreen = true;
        }
    }

    document.addEventListener('fullscreenchange', checkFullscreen, false);
    document.addEventListener('webkitfullscreenchange', checkFullscreen, false);
    document.addEventListener('mozfullscreenchange', checkFullscreen, false);
    document.addEventListener('msfullscreenchange', checkFullscreen, false);

    galleryModal.find('.display-lightbox-fullscreen').on('click', function(){
        if (fullscreen) {
            var docElm = document.documentElement;
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            } else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen();
            }                
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.classList.add('zmdi-fullscreen');
            this.classList.remove('zmdi-fullscreen-exit');
            fullscreen = true;
        }
    });
    
    galleryModal.find('.ba-twitter-share-button').on('click touchend', function(event){
        event.preventDefault();
        event.stopPropagation();
        var url = 'https://twitter.com/intent/tweet?url=',
            title = galleryModal.find('.modal-title').text();
        if (!title) {
            title = ba_jQuery('title').text();
        }
        url += encodeURIComponent(window.location.href);
        url += '&text='+encodeURIComponent(title);
        window.open(url, 'sharer', 'toolbar=0, status=0, width=626, height=436');
    });
    
    galleryModal.find('.ba-facebook-share-button').on('click touchend', function(event){
        event.preventDefault();
        event.stopPropagation();
        var item = JSON.parse(image),
            url = 'http://www.facebook.com/sharer.php?u=';
        url += encodeURIComponent(window.location.href);
        window.open(url, 'sharer', 'toolbar=0, status=0, width=626, height=436');
    });
    
    galleryModal.find('.ba-pinterest-share-button').on('click touchend', function(event){
        event.preventDefault();
        event.stopPropagation();
        var url = 'http://www.pinterest.com/pin/create/button/?url=',
            title = galleryModal.find('.modal-title').text();
        if (!title) {
            title = ba_jQuery('title').text();
        }
        url += encodeURIComponent(window.location.href)+'&media=';
        url += encodeURIComponent(galleryModal.find('.modal-image img').attr('src'))+'&description=';
        url += encodeURIComponent(title);
        window.open(url, 'sharer', 'toolbar=0, status=0, width=626, height=436');
    });

    galleryModal.find('.ba-linkedin-share-button').on('click touchend', function(event){
        event.preventDefault();
        event.stopPropagation();
        var url = 'http://www.linkedin.com/shareArticle?url=',
            title = galleryModal.find('.modal-title').text();
        if (!title) {
            title = ba_jQuery('title').text();
        }
        url += encodeURIComponent(window.location.href)+'&text=';
        url += encodeURIComponent(title);
        window.open(url, 'sharer', 'toolbar=0, status=0, width=626, height=436');
    });

    galleryModal.find('.ba-vk-share-button').on('click touchend', function(event){
        event.preventDefault();
        event.stopPropagation();
        var url = 'http://vk.com/share.php?url=',
            title = galleryModal.find('.modal-title').text();
        if (!title) {
            title = ba_jQuery('title').text();
        }
        url += encodeURIComponent(window.location.href)+'&text=';
        url += encodeURIComponent(title)+'&image=';
        url += encodeURIComponent(galleryModal.find('.modal-image img').attr('src'));
        window.open(url, 'sharer', 'toolbar=0, status=0, width=626, height=436');
    });

    galleryModal.find('.ba-ok-share-button').on('click touchend', function(event){
        event.preventDefault();
        event.stopPropagation();
        var url = 'https://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1&st._surl=',
            title = galleryModal.find('.modal-title').text();
        if (!title) {
            title = ba_jQuery('title').text();
        }
        url += encodeURIComponent(window.location.href)+'&st.comments=';
        url += encodeURIComponent(title);
        window.open(url, 'sharer', 'toolbar=0, status=0, width=626, height=436');
    });

    gallery.find('.albums-backdrop, .albums-backdrop-close').on('click', function(){
        category = '.root';
        var alias = gallery.find('.current-root').val();
        if (pageRefresh == 1) {
            if (alias != window.location.href) {
                refreshPage(alias);
                gallery.find('.ba-pagination').hide();
            }
        } else {
            gallery.removeClass('album-in-lightbox');
            jQuery('body').removeClass('album-in-lightbox-open');
            gallery.find('.ba-gallery-row-wrapper').css('background-color', '');
            window.history.replaceState(null, null, alias);
            if (pagination) {
                currentPage = '.page-1';
                addPages();
                drawPagination();
            }
            resizeIsotope();
        }
    });
    
    function likeImage()
    {
        var item = JSON.parse(image);
        if (likeFlag) {
            likeFlag = false;
            jQuery.ajax({
                type:"POST",
                dataType:'text',
                url: juri+"index.php?option=com_bagallery&view=gallery&task=gallery.likeIt&tmpl=component&image_id="+item.id,
                data:{
                    image_id : item.id,
                },
                success: function(msg){
                    msg = JSON.parse(msg);
                    galleryModal.find('.ba-modal-header .ba-add-like');
                    item.likes = msg.data;
                    gallery.find('input[data-id="ba-image-'+item.id+'"]').val(JSON.stringify(item));
                    elements[imageIndex] = JSON.stringify(item);
                    galleryModal.find('.ba-likes p').text(msg.data);
                    likeFlag = true;
                }
            });
        }
    }
    
    function addModalStyle()
    {
        var color = hexToRgb(style.lightbox_bg);
        color.a = style.lightbox_bg_transparency;
        galleryModal.parent().css('background-color',
                                                'rgba('+color.r+','+color.g+','+color.b+','+color.a+')');
        if (style.auto_resize != 0) {
            goodWidth = 0;
            goodHeight = 0;
            galleryModal.css({
                'width' : goodWidth+'px',
                'height' : goodHeight+'px',
                'margin-top' : jQuery(window).height() / 2+'px'
            });
        }
    }

    if (defaultFilter) {
        addFilterStyle();
    }
    addCaptionStyle();
    if (pagination) {
        drawPagination();
    }
    setTimeout(function(){
        resizeIsotope();
    }, 100);
    if (galleryModal.find('.header-icons').length > 0) {
        if (winSize <= 1024) {
            var shadow = galleryModal.parent()[0].style.backgroundColor;
            galleryModal.find('.header-icons')[0].style.boxShadow = 'inset 0px -85px 150px -85px '+shadow;
        } else {
            galleryModal.find('.header-icons')[0].style.boxShadow = '';
        }
    }
    if (albumMode) {
        lazyloadOptions.lightbox = albumOptions.album_enable_lightbox
    }
    gallery.find('.ba-gallery-items img').lazyload(lazyloadOptions);
}

document.addEventListener("DOMContentLoaded", initGalleries);
window.addEventListener("load", initGalleries);