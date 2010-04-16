/* Emile */
(function(f,a){var h=document.createElement("div"),g=("backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft paddingRight paddingTop right textIndent top width wordSpacing zIndex").split(" ");function e(j,k,l){return(j+(k-j)*l).toFixed(3)}function i(k,j,l){return k.substr(j,l||1)}function c(l,p,s){var n=2,m,q,o,t=[],k=[];while(m=3,q=arguments[n-1],n--){if(i(q,0)=="r"){q=q.match(/\d+/g);while(m--){t.push(~~q[m])}}else{if(q.length==4){q="#"+i(q,1)+i(q,1)+i(q,2)+i(q,2)+i(q,3)+i(q,3)}while(m--){t.push(parseInt(i(q,1+m*2,2),16))}}}while(m--){o=~~(t[m+3]+(t[m]-t[m+3])*s);k.push(o<0?0:o>255?255:o)}return"rgb("+k.join(",")+")"}function b(l){var k=parseFloat(l),j=l.replace(/^[\-\d\.]+/,"");return isNaN(k)?{v:j,f:c,u:""}:{v:k,f:e,u:j}}function d(m){var l,n={},k=g.length,j;h.innerHTML='<div style="'+m+'"></div>';l=h.childNodes[0].style;while(k--){if(j=l[g[k]]){n[g[k]]=b(j)}}return n}a[f]=function(p,m,j){p=typeof p=="string"?document.getElementById(p):p;j=j||{};var r=d(m),q=p.currentStyle?p.currentStyle:getComputedStyle(p,null),l,s={},n=+new Date,k=j.duration||200,u=n+k,o,t=j.easing||function(v){return(-Math.cos(v*Math.PI)/2)+0.5};for(l in r){s[l]=b(q[l])}o=setInterval(function(){var v=+new Date,w=v>u?1:(v-n)/k;for(l in r){p.style[l]=r[l].f(s[l].v,r[l].v,t(w))+r[l].u}if(v>u){clearInterval(o);j.after&&j.after()}},10)}})("emile",this);

if( typeof window.widgets === "undefined") {
    window.widgets=function(){var h={MSIE:/MSIE/i.test(navigator.userAgent),counter:0,debug:true};function isDefined(a){return(typeof a!=="undefined")}function matchWildcard(a,b){var c=0;var d=a.length;var e=0;var f=b.length;var i=0;var g=false;while(e+i<f){if(c+i<d){switch(a.charAt(c+i)){case"?":i++;continue;case'*':g=true;e+=i;c+=i;do{++c;if(c==d){return true}}while(a.charAt(c)=='*');i=0;continue}if(b.charAt(e+i)!=a.charAt(c+i)){if(!g){return false}e++;i=0;continue}i++}else{if(!g){return false}e++;i=0}}do{if(c+i==d){return true}}while(a.charAt(c+i++)=='*');return false}function log(a){if(window.console){window.console.log(a)}else{var b=document.getElementById("log");if(b){var c=document.createElement("div");c.innerHTML=a;b.appendChild(c)}}}function trim(t){return t.replace(/^\s+|\s+$/g,"")}function unsubscribe(a){for(var b=0;b<h.subs.length;b++){if(h.subs[b].id==a.id){h.subs.splice(b,1);break}}}function publish(a,b){if(typeof a=="undefined"||typeof b=="undefined"){return false}if(h.debug){log("Publish "+a)}if(h.subs){for(var c=0;c<h.subs.length;c++){var d=h.subs[c];if((d.topic instanceof RegExp&&d.topic.test(a))||d.topic==a||(typeof d.topic.charAt=='function'&&matchWildcard(d.topic,a))){b.topic=a;if(d.action=='call'&&d.target){var e;var f='undefined';if(d.target.functionHandler){d.target.functionHandler.apply(window,[b])}}}}}return true}function subscribe(l,t){if(!isDefined(l)){return null}var a;if(typeof l=='object'&&!(l instanceof RegExp)){if(l.topic){l.topic=trim(l.topic)}if(l.topicRegExp){l.topic=new RegExp(l.topicRegExp)}a=l}else if(typeof t=='string'){a={};if(l.topicRegExp){a.topic=new RegExp(l.topicRegExp)}else{a.topic=l}a.target={};var b=t.split('.');a.action="call";a.target.functionName=b.pop();a.target.object=b.join('.')}else if(typeof t=='function'){a={};if(l.topicRegExp){a.topic=new RegExp(l.topicRegExp)}else{a.topic=l}a.target={};a.action="call";a.target.functionHandler=t}else{log("Subscribe handler required : "+l)}if(isDefined(a)){if(!isDefined(h.subs)){h.subs=[]}if(a.topic){h.subs.push(a)}else{log("Subscribe topic required"+l);return null}return a}return null}var j=function(a){var b=0;var c=0;if(a.offsetParent){while(true){c+=a.offsetTop;b+=a.offsetLeft;if(a.offsetParent===null){break}a=a.offsetParent}}else if(a.y){c+=a.y;b+=a.x}return{x:b,y:c}};var k=function(n,a){if(typeof n=='undefined'||n===null){return null}var b=0;if(typeof a!="undefined"){b=a}var c=n.parentNode;while(c&&true){if(c.clientHeight>b){break}if(c.parentNode&&c.parentNode.clientHeight){c=c.parentNode}else{break}}if(!c){return null}return{h:c.clientHeight,w:c.clientWidth}};return{publish:publish,subscribe:subscribe,getPosition:j,getDimensions:k,log:log}}()
}

widgets.Carousel = function(uuid, wargs) {

    var widget = this;
    var items = [];
    var index = 0;
    var count = 1;
    var itemCount = 15;
    var timeout = 35;
    var topic = "/widgets/carousel";
    var subscribe = ["/widgets/carousel"];
    var counter = 0;
    var showNav = true;
    var increment = 25;
    var itemHeight = 100;
    var itemWidth = 100;
    var baseWidth = "100%";
    var fader = null;
    widget.node = document.getElementById(uuid);
    widget.navTop = null;
    widget.scrollJump = 1;
    var template;
    var scrollCount = 1;
    widgets.MSIE = /MSIE/.test(navigator.userAgent);
    var horizontalScroll = true;
    var scrollTimeout = 5000;
    var scrollCarousel = false;
    var scrolling = false;
    var fadeInterval = 150;
    var opacitysetting = 1;
    var scrollJump = 1;
    var scrollInterval = 1000;
    var scroll;

    var themes = {
      ocean : 'ocean',
      kame : 'kame'
   };
    var currentTheme = themes['ocean'];
    if ( wargs.args ) {
        if (wargs.args.itemCount) {
            itemCount = Number(wargs.args.itemCount);
        }
        if ( typeof wargs.args.showNavigation === "boolean" ) {
            showNav = wargs.args.showNavigation;
        }
        if ( wargs.args.filter ) {
            filter = wargs.args.filter;
        }
        if ( wargs.args.scrollTimeout ) {
            scrollTimeout = wargs.args.scrollTimeout;
        }
        if ( wargs.args.increment ) {
            increment = wargs.args.increment;
        }
        if ( wargs.args.itemWidth ) {
            baseWidth = wargs.args.itemWidth;
        }
        if ( typeof wargs.args.scrollCarousel === "boolean" ) {
            scrollCarousel = wargs.args.scrollCarousel;
        }
        if ( wargs.args.theme ) {
            currentTheme = wargs.args.theme;
        }
        if ( typeof wargs.args.navTop === "number" ) {
            widget.navTop = wargs.args.navTop;
        }
        if ( typeof wargs.args.scrollJump === "number" ) {
            widget.scrollJump = wargs.args.scrollJump;
        }
        if ( typeof wargs.args.scrollInterval === "number" ) {
            scrollInterval = wargs.args.scrollInterval;
        }
    }
    if ( widgets.MSIE === true && baseWidth === "100%" ) {
        var _dim = widgets.getDimensions(widget.node);
        if (_dim != null) {
            itemWidth = _dim.w;
        }
    }
    if ( /%/i.test(baseWidth) ) {
        var _w = new Number(baseWidth.split('%')[0]);
        var _dim = widgets.getDimensions(widget.node);
        if (_dim != null) {
            itemWidth = (_dim.w - 12) / _w * 100;
        }
    } else {
        itemWidth = baseWidth;
    }
    if ( horizontalScroll )  {
        scroll = itemWidth;
    } else {
        scroll = itemHeight + 4;
    }
    if ( wargs.subscribe ) {
        if (typeof wargs.subscribe === "string") {
            subscribe = [];
            subscribe.push( wargs.subscribe );
        } else {
            subscribe = wargs.subscribe;
        }
    }

    if (wargs.publish) {
        publish = wargs.publish;
    }

    widget.timerFunction = function(){
        if ( !scrollCarousel ) {
            return;
        }
        if (items && (index < items.length - 1)) {
            widget.getNext();
            widget.timer = setTimeout( widget.timerFunction, scrollTimeout );
        } else {
            widget.reset( function() {;
                widget.timer = setTimeout( widget.timerFunction, scrollTimeout );
            });
        }
    };

    this.reset = function( _callback ) {
        updateNav();
        setTimeout(function(){
            fade('out', function(){
                widget.container.style.display = "none";
                widget.container.style.left = "0px";
                setTimeout(function(){
                    fade('in', function(){
                        widget.select(0);
                        if ( typeof _callback === "function") {
                            _callback.apply({},[]);
                        }
                    });
                }, fadeInterval);
            });
        }, fadeInterval);
    };

    function setOpacity(opacity, target){
        if ( typeof target === "string" ) {
            target = document.getElementById( id );
        }
        if (!target) {
            return;
        }
        if (typeof target.style.filter != 'undefined') {
            target.style.filter = "alpha(opacity:" + (opacity * 100) + ")";
        } else {
            target.style.opacity = opacity;
        }
    }

    function fade( type, _callback ){

        setOpacity(opacitysetting, widget.container );
        var _done = false;
        if ( type == "in" ) {
            opacitysetting += 0.1;
            if (opacitysetting > .2) widget.container.style.display = "block";
            if (opacitysetting >= 1) 
                _done = true;
        } else if ( type == "out" ) {
                opacitysetting -= 0.1;
                if (opacitysetting <= 0) {
                    _done = true;
                }
            }
        if ( _done ) {
            if (typeof _callback == "function") {
                _callback();
            }
        } else {
            setTimeout(function(){
                fade(type, _callback);
            }, fadeInterval);
        }
    }

    if ( scrollCarousel === true ) {
        widget.timer = setTimeout(widget.timerFunction, scrollTimeout);
    }

    this.pause = function() {
        pauseScroller();
    };

    function pauseScroller() {
        // return if we are already stopped
        if ( scrollCarousel === false ) {
            return;
        }
       if ( widget.scrollTimer ) {
            clearTimeout( widget.scrollTimer );
       }
       setTimeout(function() {
           if ( widget.timer ) {
               clearTimeout( widget.timer );
           }
           widget.timer = setTimeout(widget.timerFunction, scrollTimeout);
       }, 15000); 
    }

    this.addItem = function(item) {
        if (!item.id) item.id = items.length;
        var id = item.id;
        var text = widget.applyTemplate(item, template);

        if (typeof item.id == 'undefined') item.id =  counter++; 
        var div = document.createElement("div");
         widget.container.appendChild(div); 
        div.innerHTML = text;
        div.style.zIndex = 1;
        div.style.width = itemWidth + "px";
        div.style.height = itemHeight + "px";
        div.style.display = 'inline';
        if (horizontalScroll) {
           // get the content node
           var content = document.getElementById(uuid+ "_item_" + id);
           content.style.height = itemHeight - 50 + "px";
           if (widgets.MSIE) div.style.styleFloat = "left";
           div.style.cssFloat = "left";
        }
        div.id = uuid + "_item_" + item.id;
        item.div = div;
        items.push(item);
        var _sel = document.createElement("div");
        _sel.index = id;
        _sel.onclick = function(e) {
            if (scrolling) return;
            pauseScroller();
            var _t;
            if (!e) _t = window.event.srcElement;
            else _t = e.target;
             widget.select(_t.index);
        };
        _sel.appendChild(document.createTextNode((id + 1) ));
        _sel.className = "carousel-id carousel-id-" + currentTheme;
        widget.mid.appendChild(_sel);
        item.menu = _sel;
        return id;
    };

    this.select = function(itemId){
        for (var _i=0; _i < items.length; _i++) {
           var item = items[_i];
           if (item.id == itemId) {
               widget.showIndex(_i);
               item.menu.className += "carousel-id carousel-id-" + currentTheme + " carousel-id-selected-" + currentTheme;
           } else {
               item.menu.className = "carousel-id carousel-id-" + currentTheme;
           }
        }
    };

    this.applyTemplate = function(obj, _t) {
        for (var i in obj) {
            var token = "@{" + i + "}";
            while (_t.indexOf(token) != -1) {
                _t = _t.replace(token, obj[i]);
            }
        }
        return _t;
    };
    
    function updateNav() {
        if ( index === 0 ) {
            setOpacity( .1, widget.prev );
        } else {
            setOpacity( 1, widget.prev );
        }
        if ( index === items.length -1 ) {
            setOpacity( .1, widget.next );
        } else {
            setOpacity( 1, widget.next );
        }
        scrolling = false;
    }

    this.showIndex = function( targetIndex ) {
        if (targetIndex < index ||
            targetIndex >= index + count) {
            if (targetIndex < index) {
               var _cb = function() {
                 index = targetIndex;
                 updateNav();
               };
               var targetPos = ( targetIndex * itemWidth) * -1;
               doScroll( targetPos, _cb );
            } else if ( targetIndex >= index + count) {
                var callback = function() {
                   index = targetIndex;
                   updateNav();
                };
                var tp = ( targetIndex * itemWidth) * -1;
                doScroll( tp, callback );
            }
        }  
    };    

    function doScroll(target, callback ) {
        if ( scrolling === true ) {
            return;
        } else {
            scrolling = true;
        }
        emile( widget.container, 'left:' + target + 'px', { duration: scrollInterval,
               after : callback
              });
     }

    this.getNext = function() {
        if (index < items.length - 1) {
            var jumpTo = index + widget.scrollJump;
            if ( jumpTo > items.length -1 ) {
                jumpTo = items.length - 1;
            }
            widget.select(items[jumpTo].id);
        }
    };

    this.getPrevious = function() {
        if (index >= 1) {
           var jumpTo = index - widget.scrollJump;
            if ( jumpTo < 0 ) {
                jumpTo = 0;
            }
            widget.select( items[jumpTo].id );
        }
    };

    this.clear = function() {
        widget.container.innerHTML = "";
        widget.container.style.top = "0px";
        index = 0;
        items = [];
    };

    this.setItems = function(_in) {
       var data = _in;
       if (horizontalScroll) {
            widget.container.style.width = ((itemWidth + 10) * data.length ) + "px";
       }
       for ( var _i=0; _i < data.length && _i < itemCount; _i++) {
         widget.addItem(data[_i]);
       }
       // TODO : fix for large numbers
       widget.mid.style.width = (data.length * 30) + "px";
       if (data.length && data.length > 0) { widget.select(0); } 
    };

    this.load = function() {
        widget.init();
        if (wargs.value) {
            data = wargs.value;
            widget.setItems(data);
        }
        updateNav();
    };

    this.init = function() {
        if (!widget.node) return;
        widget.container = document.getElementById( uuid + "_content");
        widget.scrollpane = document.getElementById(uuid + "_scrollpane");
        widget.node.ontouchstart = function( e ) {
            widget.touches = [];
            e.preventDefault();
        };
        widget.scrollpane.ontouchmove = function( e ) {
            var targetEvent =  e.touches.item(0);
            widget.touches.push( targetEvent.clientX );
            if ( widget.touches.length >= 2 ) {
                if ( widget.touches[0] > widget.touches[1] ) {
                    widget.getNext();  
                } else {
                    widget.getPrevious();  
                }
                delete widget.touches;
            }
        };
        widget.node.ontouchend = function( e ) {
        };
        widget.nav  = document.getElementById(uuid + "_nav");
        widget.mid  = document.getElementById(uuid + "_mid");
        var height = widget.node.parentNode.clientHeight;
        widget.next  = document.getElementById(uuid + "_navRight");
        widget.prev  = document.getElementById(uuid + "_navLeft");
        // assumes the navs are 100px tall and 50px wide
        var _navTop = 50;
        if ( height > 0 && widget.navTop === null ) {
            _navTop = ( height / 2 ) - 75;
        } else {
          _navTop = widget.navTop;
        }
        widget.next.style.top = _navTop + "px";
        widget.prev.style.top = _navTop + "px";
        var navImage = document.createElement( "img" );

        navImage.style.border = "0";
        navImage.src = wargs.widgetDir + "images/navRight.png";
        var _prevLink = document.createElement("a");
        _prevLink.href = "javascript:void(0)";
        _prevLink.onclick = function() {
            widget.pause();
            widget.getNext();
        };
        _prevLink.ontouchstart = function( e ) {
            widget.pause();
            widget.getNext();
            e.preventDefault();
        };
        _prevLink.appendChild( navImage );
        widget.next.appendChild( _prevLink );

        var _nextImage = document.createElement( "img" );
        _nextImage.style.border = "0";
        _nextImage.src = wargs.widgetDir + "images/navLeft.png";

        var nextLink = document.createElement("a");
        nextLink.href = "javascript:void(0)";
        nextLink.onclick = function() {
            widget.pause();
            widget.getPrevious();
        };
        nextLink.ontouchstart = function( e ) {
            widget.pause();
            widget.getPrevious();
            e.preventDefault();
        };
        nextLink.appendChild( _nextImage );
        widget.prev.appendChild( nextLink );

        widget.node.className += " carousel-" + currentTheme;
        widget.subs = [];
        for (var _i=0; _i < subscribe.length; _i++) {
            doSubscribe(subscribe[_i]  + "/clear", widget.clear);
            doSubscribe(subscribe[_i]  + "/setItems", widget.setItems);
        }        
       template = unescape(document.getElementById(uuid + "_template").innerHTML + "");
       widget.container.style.left = "0px";
       widget.resize();
    };

    this.resize = function() {
        var _dim = widgets.getDimensions(widget.node, 52);
        var _w = _dim.w - 12;
        if (widgets.MSIE) {
            _w -= 8;
        }
        widget.scrollpane.style.width =  (_w - 100) + "px";
        if (!_dim) return;
        if (/%/i.test(baseWidth)) {
            var _w = new Number(baseWidth.split('%')[0]);
            itemWidth = (_dim.w - 12) / _w * 100; 
        } else {
            itemWidth = baseWidth;
        }
        for (var i=0; items && i < items.length; i++) {
            widgets.log("gresized  = " + i + " to "  + itemHeight );
            items[i].div.style.width = itemWidth + "px";
            items[i].div.style.height = itemHeight + "px";
        }
        widget.node.style.height = _dim.h - 12 + "px";
        if ( showNav ) {
            widget.nav.style.display = "block";
            itemHeight = _dim.h - 42;
            // assume each nav item is 26px including padding
            widget.mid.style.width = (items.length * 30) + "px";
            widget.scrollpane.style.height = _dim.h - 40 + "px";
        } else {
            itemHeight = _dim.h - 4;
            widget.scrollpane.style.height = _dim.h -12 + "px";
        }
    };

    this.destroy = function() {
        for (var i=0; widget.subs && i < widget.subs.length; i++) {
            widgets.unsubscribe(widget.subs[i]);
        }
        delete list;
        delete container;
    };

    function doSubscribe(topic, handler) {
        var i = widgets.subscribe(topic, handler);
        widget.subs.push(i);
    }

    widget.load();
};