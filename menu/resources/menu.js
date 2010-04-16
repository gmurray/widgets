if( typeof window.widgets === "undefined") {
    window.widgets=function(){var h={MSIE:/MSIE/i.test(navigator.userAgent),counter:0,debug:true};function isDefined(a){return(typeof a!=="undefined");}function matchWildcard(a,b){var c=0;var d=a.length;var e=0;var f=b.length;var i=0;var g=false;while(e+i<f){if(c+i<d){switch(a.charAt(c+i)){case"?":i++;continue;case'*':g=true;e+=i;c+=i;do{++c;if(c==d){return true;}}while(a.charAt(c)=='*');i=0;continue;}if(b.charAt(e+i)!=a.charAt(c+i)){if(!g){return false;}e++;i=0;continue;}i++;}else{if(!g){return false;}e++;i=0;}}do{if(c+i==d){return true;}}while(a.charAt(c+i++)=='*');return false;}function log(a){if(window.console){window.console.log(a);}else{var b=document.getElementById("log");if(b){var c=document.createElement("div");c.innerHTML=a;b.appendChild(c);}}}function trim(t){return t.replace(/^\s+|\s+$/g,"");}function unsubscribe(a){for(var b=0;b<h.subs.length;b++){if(h.subs[b].id==a.id){h.subs.splice(b,1);break;}}}function publish(a,b){if(typeof a=="undefined"||typeof b=="undefined"){return false;}if(h.debug){log("Publish "+a);}if(h.subs){for(var c=0;c<h.subs.length;c++){var d=h.subs[c];if((d.topic instanceof RegExp&&d.topic.test(a))||d.topic==a||(typeof d.topic.charAt=='function'&&matchWildcard(d.topic,a))){b.topic=a;if(d.action=='call'&&d.target){var e;var f='undefined';if(d.target.functionHandler){d.target.functionHandler.apply(window,[b]);}}}}}return true;}function subscribe(l,t){if(!isDefined(l)){return null;}var a;if(typeof l=='object'&&!(l instanceof RegExp)){if(l.topic){l.topic=trim(l.topic);}if(l.topicRegExp){l.topic=new RegExp(l.topicRegExp);}a=l;}else if(typeof t=='string'){a={};if(l.topicRegExp){a.topic=new RegExp(l.topicRegExp);}else{a.topic=l;}a.target={};var b=t.split('.');a.action="call";a.target.functionName=b.pop();a.target.object=b.join('.');}else if(typeof t=='function'){a={};if(l.topicRegExp){a.topic=new RegExp(l.topicRegExp);}else{a.topic=l;}a.target={};a.action="call";a.target.functionHandler=t;}else{log("Subscribe handler required : "+l);}if(isDefined(a)){if(!isDefined(h.subs)){h.subs=[];}if(a.topic){h.subs.push(a);}else{log("Subscribe topic required"+l);return null;};return a;}return null;};var j=function(a){var b=0;var c=0;if(a.offsetParent){while(true){c+=a.offsetTop;b+=a.offsetLeft;if(a.offsetParent===null){break;}a=a.offsetParent;}}else if(a.y){c+=a.y;b+=a.x;}return{x:b,y:c};};var k=function(n,a){if(typeof n=='undefined'||n===null){return null;}var b=0;if(typeof a!="undefined"){b=a;}var c=n.parentNode;while(c&&true){if(c.clientHeight>b){break;}if(c.parentNode&&c.parentNode.clientHeight){c=c.parentNode;}else{break;}}if(!c){return null;}return{h:c.clientHeight,w:c.clientWidth};};return{publish:publish,subscribe:subscribe,getPosition:j,getDimensions:k,log:log};}();
}
widgets.Menu = function( uuid, args) {

    var widget = this;
    widget.model = null;
    var menusVisible = false;
    var title;

    var container = null;

    var topMenus = [];
    var navMenus = [];
    var menus = [];
    var hideTimer;
    var longHideTimer = null;
    var menu = [];
    var publish = "/widgets/menu";

    var upIconImage = args.widgetDir + "images/menu-arrow-up.gif";
    var menuContainerWidth = null;
    var minimumMenuContainerWidth = null;
    var isIconButton = false;
    var enableItems = [];

    var themes = {
         kame : 'green',
         ocean : 'blue'
        };

    var clickDrop = false;

    var currentTheme = themes['ocean'];

    function addStyle(style, nStyle){
       if (style.indexOf(nStyle) != -1) return style;
       if (style.length > 0) style += " ";
       return (style + nStyle);
    }

    function removeStyle(style, oStyle){
        if (style.indexOf(oStyle) == -1) return style;
        var styles = style.split(' ');
        var nStyle = "";
        for (var i = 0; i < styles.length; i++) {
            if (styles[i] != oStyle) nStyle += styles[i] + " ";
        }
        return nStyle;
    }

    function showMenu(e){
        stopHide();
        var src = (typeof window.event == 'undefined') ? e.target : window.event.srcElement;
        if (src === null) {
            return; 
        }
        if (src && /jmk-menu2Item-label/i.test(src.className)) {
          src = src.parentNode;
        } else if (src.targetMenu) {
            src = src.targetMenu;
        }
        if (src && /jmk-menu2Item/i.test(src.className)) {
            src.className = addStyle(src.className, "jmk-menu2-bg-hover"); 
        }

        widgets.publish(publish + "/showMenu", { targetId : src.targetId, widgetId : uuid});

        var depth = src.menuDepth;
        // hide other menus at this depth
        var depth = src.menuDepth;
        if (typeof depth != 'undefined') {
            widget.hideMenus(depth);
        }

        var parent = document.getElementById(src.parentId);
        if (parent === null) {
            return;
        }

        var target = document.getElementById(src.targetId);
        if (!target) {
            return;
        }
        var _top = 0;
        var _left = 0;
        var pos = widgets.getPosition(src);

        if (depth === 0) {

            if (clickDrop) {
                _top = pos.y + src.clientHeight + 6;
            } else {
                _top = pos.y + parent.clientHeight + 2;
            }
            _left = pos.x;
            if (isIconButton) {
                _top += 15;
                _left -= 5;
            }

        } else {
            var spos = widgets.getPosition(src);
            _top = spos.y;
            _left = pos.x + parent.clientWidth + 2;
        }

        target.style.top = _top + "px";
        target.style.left = _left + "px";
        target.style.display = "block";

        if (target.shadow) {
            target.shadow.style.top = (_top + 5) + "px";
            target.shadow.style.left = (_left + 5) + "px";
            target.shadow.style.height = target.clientHeight + "px";
            target.shadow.style.width = target.clientWidth + "px";
            target.shadow.style.display = "block";
        }
        menusVisible = true;
    }

    function processActions(_t, _pid, _type, _value) {
        widgets.publish( publish + "/" + _type, {
            value : _value,
            type : _type,
            widgetId : uuid,
            topic : publish
        });
    }

    function labelSelect(e) {
        widget.hideMenus();
        var src = (typeof window.event === 'undefined') ? e.target : window.event.srcElement;
        if (src && /jmk-menu2Item-label/i.test(src.className)) {
          src = src.parentNode;
        }
        var item = src.item;
        if (!item || (item && item.enabled === false)) {
            return
        }
        if (typeof item.href === "undefined" || item.href === null) {
            if (!item.menu) {
                processActions(item, src.id, 'onSelect', item);
            }
        } else if (typeof item.href !== "undefined" || item.href !== null) {
            if (typeof item.target === "string") {
                window.open(item.href, item.target);
            } else {
                window.location.href = item.href;
            }
        }
    }

    function menuSelect(e){
        labelSelect(e);
    }

    this.hideMenus = function(level) {
        for (var _i=0; _i < menus.length;_i++) {
             if (level && menus[_i].menuDepth >= level) {
                 menus[_i].style.display = "none";
                 if (menus[_i].shadow) {
                     menus[_i].shadow.style.display = "none";
                 }
             } else if (!level) {
                 menus[_i].style.display = "none";
                 if (menus[_i].shadow) {
                     menus[_i].shadow.style.display = "none";
                 }
             }
        }
        if (!level) {
            menusVisible = false;
        }
    };

    function startLongHide() {
        if (menusVisible === true) {
            if (longHideTimer != null) {
                clearTimeout(longHideTimer);
            }
            longHideTimer = setTimeout(function() {
                widget.hideMenus();
            }, 3000);
        }
    }

    function startHide() {
        if (hideTimer !== null) {
            clearTimeout(hideTimer);
        }
        if (longHideTimer != null) {
            clearTimeout(longHideTimer);
        }
        hideTimer = setTimeout(function() {
            widget.hideMenus();
        }, 1000);
    }

    function stopHide() {
        if (hideTimer != null) {
            clearTimeout(hideTimer);
        }
        if (longHideTimer != null) {
            clearTimeout(longHideTimer);
        }
     }
    
     function createLink(mi, menuE) {
            menuE.id = mi.targetId;
            var target = "";
            if (mi.target !== null && typeof mi.target !== "undefined") {
                 target = " target='" + mi.target + "'";
            }

            if (mi.href !== null && typeof mi.href !== "undefined") {
                var _href = " href='" + mi.href + " ";
                var _link = "<a id='" + mi.targetId + "_link' class='jmk-menu2Item-link' " + target + _href + "'>" + mi.label + "</a>";
                menuE.innerHTML = _link;
            } else {
                menuE.innerHTML =  mi.label;
            }
    }

    function menuList(mi, menuStyle) {
        var ml = document.createElement("li");
        var item = document.createElement("div");
        item.className = "jmk-menu2Item-label";
        ml.appendChild(item);
        ml.className = menuStyle;
        createLink(mi, item);
        return ml;
    }


    function createTopMenuItem(mi, menuStyle, hoverId) {
        var menuE = document.createElement("li", menuStyle);
        menuE.className = menuStyle;
        menuE.onmousemove = stopHide;
        if (clickDrop) {
            widget.icon = document.createElement("img");
            if ( widget.dropIcon ) {
                widget.icon.src = widget.dropIcon;
            }
            widget.icon.hoverId = hoverId;
            widget.icon.style.margin = "0 4px 0 0";
            widget.icon.targetMenu = menuE;
            if (isIconButton == false) {
                var labelN = document.createElement("span");
                labelN.id = mi.targetId;
                labelN.className = "jmk-menu2TopItem";
                labelN.targetMenu = menuE;
                labelN.hoverId = hoverId;
                createLink(mi, labelN);
                menuE.appendChild(labelN);
             } else {
                widget.icon.id = mi.targetId;
                if (title) {
                    widget.icon.title = title;
                } else if (mi.label) {
                    widget.icon.title = mi.label;
                }
            }
            menuE.appendChild(widget.icon);
        } else {
            createLink(mi, menuE);
        }
        return menuE;
    }
    
    function createMenuContainer(label, menuStyle, id, level) {

        var menuE = document.createElement("ul", menuStyle);
        menuE.className = menuStyle;
        if (menuContainerWidth != null) {
            menuE.style.width = menuContainerWidth + "px";
        }
        menuE.id = id;
        if (clickDrop && level === 1 && isIconButton) {
            widget.upIcon = document.createElement("img");
            widget.upIcon.className = "jmk-menu2-upIcon";
            widget.upIcon.src =  upIconImage;
            widget.upIcon.style.padding = "0 4px 0 0";
            widget.upIcon.targetMenu = menuE;
            menuE.appendChild(widget.upIcon);
        } else if (label !== null){
            // need to support menus that are just menubar
            var tmi = document.createTextNode(label);
            menuE.appendChild(tmi);
        }
        return menuE;
    }

    this.destroy = function() {

        for (var _i=0; _i < menus.length;_i++) {
            if (menus[_i].parentNode) {
                menus[_i].shadow.parentNode.removeChild(menus[_i].shadow);
                menus[_i].parentNode.removeChild(menus[_i]);
            }
       }
       container.innerHTML = "";
       topMenus = [];
       navMenus = [];
       menus = [];
       menu = [];
       hideTimer = null;
       longHideTimer = null;
       menusVisible = false;
       if (document.detachEvent) {
           document.detachEvent("onmousemove", startLongHide);
       } else if (document.addEventListener) {
           document.removeEventListener("mousemove", startLongHide, true);
       }
    };

    this.toggleMenu = function(e) {

        if (menus.length > 0 && 
            menus[0].style.display == "block") {
            widget.hideMenus();
        } else {
            showMenu(e);
        }
    };

    function findItemValue(items,targetId) {
        var value = null;
        for(var j=0;  value === null && j < items.length; j+=1) {
            if (items[j].id == targetId) {
                return items[j];
            }
            if (items[j].menu) {
                value = findItemValue(items[j].menu, targetId);
            }
        }
        return value;
    }

    this.getItem = function(targetId) {
        if (!widget.model) {
            return null;
        }
        return findItemValue(widget.model.menu, targetId);
    };

    this.setValue = function(value) {
        widget.destroy();
        widget.init(value);
    };

    this.init = function(value) {
        if (value.data) {
            value = value.data;
        }
        widget.model = value;
        if (document.attachEvent) {
            document.attachEvent("onmousemove", startLongHide);
        } else if (document.addEventListener) {
            document.addEventListener("mousemove", startLongHide, true);
        }

        menu = value.menu;
        var selectedIndex = 0;

        for (var i=0; i < menu.length; i++) {

            if (menu[i].id) {
                menu[i].targetId = uuid+"_menu_" +  menu[i].id;
            } else {
               menu[i].targetId = uuid+ "_menu_" + i;
            }
            var menuId =  menu[i].targetId;
            var me = createTopMenuItem(menu[i], "jmk-menu2Top", menuId );
            var targetId = menu[i].targetId + "_submenu";
            me.targetId =  targetId;
            me.parentId = menuId;
            me.menuDepth = 0;
            me.item = menu[i];

            if ( typeof menu[i].menu != 'undefined') {
                if (clickDrop) {
                      me.onclick = widget.toggleMenu;
                      me.targetHoverId = targetId;
                      me.onmouseover = function(e) {
                         var src = (typeof window.event == 'undefined') ? e.target : window.event.srcElement;
                         //src.className = addStyle(src.className, "jmk-menu2TopHover");
                         var thid = src.hoverId;
                         if ( thid ) {
                             var te = document.getElementById( thid );
                             if ( te !== null) {
                                 te.className = addStyle(src.className, "jmk-menu2TopHover");
                             }
                         }
                      };
                } else {
                    me.onmouseover = showMenu;
                }
            } else {
                me.onmouseover = function(e) {
                    widget.hideMenus(1);
                    var src = (typeof window.event == 'undefined') ? e.target : window.event.srcElement;
                    if (/jmk-menu2Item-link/i.test(src.className)) {
                        src = src.parentNode;
                    }
                    src.className = addStyle(src.className, "jmk-menu2TopHover"); 
                    if ( e ) {
                        e.preventDefault();
                    }
                    return false;
                };
                me.onclick = labelSelect;
            }
            me.onmousemove = stopHide;
            me.onmouseout = function(e){
               var src = (typeof window.event == 'undefined') ? e.target : window.event.srcElement;
               if (/jmk-menu2Item-link/i.test(src.className)) {
                   src = src.parentNode;
               }
               var thid = src.hoverId;
               if ( thid ) {
                   var te = document.getElementById( thid );
                   if ( te !== null) {
                       te.className = removeStyle(src.className, "jmk-menu2TopHover");
                   }
               }
               startHide();
           };
           container.appendChild(me);
           topMenus.push(me);

           if (i < menu.length -1) {
                var spacerDiv = document.createElement("li");
                spacerDiv.appendChild(document.createTextNode("|"));
                spacerDiv.className = "jmk-menu2Separator jmk-menu2Separator-" + currentTheme;
                container.appendChild(spacerDiv);
            }
            if (menu[i].menu) {
                addSubMenu( menu[i].targetId, targetId, menu[i].menu, 1);
            }
        }
        // wait to the widget to load so we can get the correct icon width
        if (widget.enabled === true) {
            widget.enable();
        } else {
            widget.disable();
        }
        if (enableItems.length > 0) {
            for (var i=0; i < enableItems.length; i+=1) {
                widget.enableItems(enableItems[i].key, enableItems[i].enable);
            }
            enableItems = [];
        }
    };

    function getTextDimensions(text, _className) {
        var e = document.createElement("div");
        e.innerHTML = text;
        e.className = _className;
        e.style.position = "absolute";
        e.style.top = "-500px";
        document.body.appendChild(e);
        var tdim = { width: e.clientWidth, height : e.clientHeight };
        document.body.removeChild(e);
        return tdim;
    }

    function addSubMenu(parentId, targetId, menu, level) {
        // create the menu container
        var menuId = parentId;
        var ml = createMenuContainer(null, "jmk-menu2Container jmk-menu2Container-" + currentTheme, targetId,level);
        var menuShadow = document.createElement("div");
        menuShadow.className = "jmk-menu2Container-shadow";
        ml.shadow = menuShadow;
        document.body.appendChild(menuShadow);
        ml.parentId = parentId;
        ml.menuDepth = level;
        menus[menuId] = ml;
        ml.onmouseout = function(e) {
            startHide();
        };
        ml.onmousemove = function(e) {
            stopHide();
        };
        // add to the document body for abosolute positioning
        document.body.appendChild(ml);
        menus.push(ml);

        var maxWidth = 0;
        var maxWithItem = "";

            // render sub menus
            for (var ii=0; ii < menu.length; ii++) {
                var more = "";
                var mClassName = "jmk-menu2Item jmk-menu2Item-" + currentTheme;
                if (menu[ii].enabled === false) {
                    mClassName += " jmk-menu2Item-label-disable";
                }
                menu[ii].targetId =  targetId + "_submenu_" + level + "_" + ii;
                var mi = menuList(menu[ii], mClassName);
                mi.item =  menu[ii];
                var mil = getTextDimensions(menu[ii].label, mClassName);
                if (mil.width > maxWidth) {
                    maxWidth = mil.width;
                    maxWithItem = menu[ii].label;
                }
                mi.menuDepth = level + 1;
                if ( menu[ii].menu) {
                    var moreIcon = document.createElement("div");
                    moreIcon.className =  "jmk-menu2-arrow-right";
                    mi.appendChild(moreIcon);
                    var sTarget = targetId + "_" + (level) + "_" + ii;
                    mi.parentId = targetId;
                    mi.targetId = sTarget;
                    mi.onmouseover = showMenu;
                    addSubMenu(targetId, sTarget, menu[ii].menu, level + 1);
                    mi.onmouseout = function(e){
                        var src = (typeof window.event == 'undefined') ? e.target : window.event.srcElement;
                        if (src && /jmk-menu2Item-label/i.test(src.className)) {
                            src = src.parentNode;
                        }
                        src.className = removeStyle(src.className, "jmk-menu2-bg-hover");
                    };
                } else {
                    mi.onmouseover = function(e) {
                        var src = (typeof window.event === 'undefined') ? e.target : window.event.srcElement;

                        if (/jmk-menu2Item-link/i.test(src.className)) {
                             src = src.parentNode;
                        }
                        if (src && /jmk-menu2Item-label/i.test(src.className) && 
                                /jmk-menu2Item-label-disable/i.test(src.className) === false ) {
                            src = src.parentNode;
                        } else {
                            stopHide();
                        }
                        if (src.item && src.item.enabled === false) {
                            stopHide();
                        }
                       src.className = addStyle(src.className, "jmk-menu2-bg-hover");
                    };
                    mi.onmouseout = function(e){
                        var src = (typeof window.event === 'undefined') ? e.target : window.event.srcElement;
                        if (/jmk-menu2Item-link/i.test(src.className)) {
                             src = src.parentNode;
                        }
                        if (src && /jmk-menu2Item-label/i.test(src.className) && 
                                /jmk-menu2Item-label-disable/i.test(src.className) === false ) {
                            src = src.parentNode;
                        } else {
                            stopHide();
                        }
                        src.className = removeStyle(src.className, "jmk-menu2-bg-hover");
                        var depth = src.menuDepth;
                        // hide other menus at this depth
                        if (typeof depth != 'undefined') {
                            widget.hideMenus(depth);
                        }
                    };
                    // attach reference to model
                    mi.item =  menu[ii];
                }          
                mi.onclick = menuSelect;

                ml.appendChild(mi);
            }

            if (minimumMenuContainerWidth !== null) {
                if ((maxWidth + 18) < minimumMenuContainerWidth) {
                    ml.style.width = minimumMenuContainerWidth + "px";
                } else if (widgets.MSIE) {
                    ml.style.width = (maxWidth + 18) + "px";
                }
            } else if (widgets.MSIE &&
                       menuContainerWidth === null) {
                ml.style.width = (maxWidth + 18) + "px";
            }
    }

    function enableMenuItems(menu, key, enable) {
        for (var i=0; menu != null && i < menu.length; i++) {
            if (menu[i].properties && typeof menu[i].properties[key] != 'undefined') {
                menu[i].enabled = enable;

                var mi = document.getElementById(menu[i].targetId);
                if (menu[i].href) {
                    var mlink = document.getElementById(menu[i].targetId + "_link");
                    if (mlink !== null) {
                        if (enable === true) {
                            mlink.href = menu[i].href;
                            if (menu[i].target) {
                                mlink.target = menu[i].href;
                            }
                        } else {
                            mlink.href = "javascript:void(0)";
                            mlink.target = null;
                        }
                    }
                }
                if (mi) {
                    if (enable === true) {
                        mi.className = removeStyle(mi.className , "jmk-menu2Item-label-disabled" );
                    } else {
                        mi.className = addStyle(mi.className , "jmk-menu2Item-label-disabled");
                    }
                }
            }
            if (menu[i].menu) {
                enableMenuItems( menu[i].menu, key, enable);
            }
        }
    }

    this.enableItems = function(key, enable) {

        var menu = widget.model;
        if (menu === null) {
            enableItems.push({ key : key, enable : enable});
        } else {
            enableMenuItems(widget.model.menu, key, enable);
        }
    };

    this.enable = function() {
        widget.enabled = true;
        enableIcon();
    };

    var IMG_RELOAD_RETRY_MAX = 5;

    // load an array of images and allow for up to IMG_RELOAD_RETRY_MAX tries
    function loadImages(images, callback) {
        if (!images[0].complete) {
            if (!images[0].imageReloadTries) {
                images[0].imageReloadTries = 0;
                setTimeout(function(){
                    images[0].imageReloadTries += 1;
                    loadImages(images, callback);
                },
                50);
            } else if (images[0].imageReloadTries < IMG_RELOAD_RETRY_MAX) {
                setTimeout(function() {
                    images[0].imageReloadTries += 1;
                    loadImages(images, callback);
                },
                250);
            } else {
                // failed so ignore
                widgets.log("failed to load " + images[0].src + " retries=" + images[0].imageReloadTries);
                images.shift();
                if (images.length == 0) {
                    callback();
                } else {
                    loadImages(images, callback);
                }
            }
        } else {
            // remove the first item
            images.shift();
            if (images.length == 0) {
                callback();
            } else {
                loadImages(images, callback);
            }
        }
    }
    function enableIcon() {
        var node = document.getElementById(uuid+ "blocker" );
        if (widget.icon) {
            node.style.width =  (widget.icon.width + 4) + "px";
            node.style.height =  widget.icon.height + "px";
        }
        node.style.display = (widget.enabled === true) ? "none" : "block"; 
    }

    this.setIconTitle = function(title) {
        if (widget.icon) {
            widget.icon.title = title;
        }
    };

    this.setIconBlockerTitle = function(title) {
        var node = document.getElementById(uuid+ "blocker" );
        if (node) {
            node.title = title;
        }
    };

    this.disable = function() {
        widget.enabled = false;
       if (widget.icon) {
           if (widget.icon.width === 0) {
               loadImages([widget.icon], enableIcon);
           } else {
               enableIcon();
           }
       }
    };

    this.setItem = function(targetId, text) {
        var node = document.getElementById(uuid+ "_menu_" + targetId);
        if (node) {
            node.innerHTML = text;
            node.title = text;
        }
    };

    this.postLoad = function() {

        widget.enabled = true;
        if (args && args.topic) {
            publish = args.topic;
        } else if ( args.publish) {
            publish = args.publish;
        }
        if (args && typeof args.enabled == "boolean") {
            widget.enabled = args.enabled;
        }
        if (args  && 
            args.selectedIndex) {
            selectedIndex = Number(args.selectedIndex);
        }
        if (args && args.theme) {
            currentTheme = args.theme;
        }
        if (args) {
            if (typeof args.clickdrop == "boolean") {
               clickDrop = args.clickdrop ;
            }
            if (args.title) {
                title = args.title;
            }
            if (args.imageIcon) {
               widget.dropIcon = args.imageIcon;
            }
            if (args.menuContainerWidth) {
                menuContainerWidth = args.menuContainerWidth;
            }
            if (typeof args.isIconButton == "boolean") {
                isIconButton = args.isIconButton;
            }
            if (typeof args.minimumMenuContainerWidth === "number") {
                minimumMenuContainerWidth = args.minimumMenuContainerWidth;
            }
        }
        
        //
        var target = document.getElementById( uuid );
        target.className = "jmk-menu2Bar";
        var blocker = document.createElement( "div" );
        blocker.className = "jmk-menu2-buttonBlocker";
        blocker.id = uuid + "blocker";
        target.appendChild( blocker );
        container = document.createElement( "div" );
        container.id = uuid + "_container";
        target.appendChild( container );
        container.className += " jmk-menu2-title-" + currentTheme;
        // pull in the arguments
        if ( args.publish) publish = args.publish;
        if ( args.value) {
            widget.init( args.value);
        } else if (widget.dropIcon !== null) {
             widget.init( { menu : [ { label : "" } ] });
        }
        widget.dropIcon = args.widgetDir + "images/menu-arrow-dropdown-" + currentTheme + ".png";

    };

    this.setTopMenuTitle = function( _index, _label ) {
        var target = document.getElementById( uuid + "_menu_" + _index );
        if ( target ) {
            target.innerHTML = _label;
        }
    };

    widget.postLoad();
};
