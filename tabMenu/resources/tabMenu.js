
if( typeof window.widgets === "undefined") {
    window.widgets=function(){var h={MSIE:/MSIE/i.test(navigator.userAgent),counter:0,debug:true};function isDefined(a){return(typeof a!=="undefined");}function matchWildcard(a,b){var c=0;var d=a.length;var e=0;var f=b.length;var i=0;var g=false;while(e+i<f){if(c+i<d){switch(a.charAt(c+i)){case"?":i++;continue;case'*':g=true;e+=i;c+=i;do{++c;if(c==d){return true;}}while(a.charAt(c)=='*');i=0;continue;}if(b.charAt(e+i)!=a.charAt(c+i)){if(!g){return false;}e++;i=0;continue;}i++;}else{if(!g){return false;}e++;i=0;}}do{if(c+i==d){return true;}}while(a.charAt(c+i++)=='*');return false;}function log(a){if(window.console){window.console.log(a);}else{var b=document.getElementById("log");if(b){var c=document.createElement("div");c.innerHTML=a;b.appendChild(c);}}}function trim(t){return t.replace(/^\s+|\s+$/g,"");}function unsubscribe(a){for(var b=0;b<h.subs.length;b++){if(h.subs[b].id==a.id){h.subs.splice(b,1);break;}}}function publish(a,b){if(typeof a=="undefined"||typeof b=="undefined"){return false;}if(h.debug){log("Publish "+a);}if(h.subs){for(var c=0;c<h.subs.length;c++){var d=h.subs[c];if((d.topic instanceof RegExp&&d.topic.test(a))||d.topic==a||(typeof d.topic.charAt=='function'&&matchWildcard(d.topic,a))){b.topic=a;if(d.action=='call'&&d.target){var e;var f='undefined';if(d.target.functionHandler){d.target.functionHandler.apply(window,[b]);}}}}}return true;}function subscribe(l,t){if(!isDefined(l)){return null;}var a;if(typeof l=='object'&&!(l instanceof RegExp)){if(l.topic){l.topic=trim(l.topic);}if(l.topicRegExp){l.topic=new RegExp(l.topicRegExp);}a=l;}else if(typeof t=='string'){a={};if(l.topicRegExp){a.topic=new RegExp(l.topicRegExp);}else{a.topic=l;}a.target={};var b=t.split('.');a.action="call";a.target.functionName=b.pop();a.target.object=b.join('.');}else if(typeof t=='function'){a={};if(l.topicRegExp){a.topic=new RegExp(l.topicRegExp);}else{a.topic=l;}a.target={};a.action="call";a.target.functionHandler=t;}else{log("Subscribe handler required : "+l);}if(isDefined(a)){if(!isDefined(h.subs)){h.subs=[];}if(a.topic){h.subs.push(a);}else{log("Subscribe topic required"+l);return null;};return a;}return null;};var j=function(a){var b=0;var c=0;if(a.offsetParent){while(true){c+=a.offsetTop;b+=a.offsetLeft;if(a.offsetParent===null){break;}a=a.offsetParent;}}else if(a.y){c+=a.y;b+=a.x;}return{x:b,y:c};};var k=function(n,a){if(typeof n=='undefined'||n===null){return null;}var b=0;if(typeof a!="undefined"){b=a;}var c=n.parentNode;while(c&&true){if(c.clientHeight>b){break;}if(c.parentNode&&c.parentNode.clientHeight){c=c.parentNode;}else{break;}}if(!c){return null;}return{h:c.clientHeight,w:c.clientWidth};};return{publish:publish,subscribe:subscribe,getPosition:j,getDimensions:k,log:log};}();
}

widgets.TabMenu = function( uuid, args ) {

    var _widget = this;
    var publish = "/widgets/tabMenu";
    var subscribe =  ["/widgets/tabMenu"];


    var items;
    var selectedTab;
    var mis = [];
    var tabs = {};
    var mode = "";
    var theme = "";

    if ( args ) {
        if ( args.mode === "bottom" ) {
            mode = "-b";
        }
        if ( args.theme ) {
            theme = "-" + args.theme;
        }
    }
    var themeExtras = mode + theme;
    var container = document.getElementById( uuid + "_container");
    var parent = document.getElementById(  uuid );
    if ( container === null ) {
        container = document.createElement("div");
        container.className = "jm-tm-centered";
        parent.appendChild( container );
    }
    if ( parent ) {
        parent.className = "jm-tm-container" + ((themeExtras != "") ? " jm-tm-container" + themeExtras : "");
    }
    if (args.value) {
        items = args.value.menu;
    }
    if ( args.publish) {
        publish = args.publish;
    }
    if ( args.subscribe ){
        if (typeof args.subscribe == "string") {
            subscribe = [];
            subscribe.push( args.subscribe);
        } else {
            subscribe = args.subscribe;
        }
    }

    function createMenu(items) {
        var _firstSelected;
        var menu = document.createElement("ul");
        container.appendChild(menu);

        for (var l= 0; l < items.length; l++) {
            
            var _id;
            if (items[l].id) _id = items[l].id;
            else _id = uuid + "_" + l;

            if (items[l].selected || !_firstSelected) _firstSelected = _id;
            var mi = document.createElement("li");
            _widget.list = mi;

            var mil = document.createElement("div");
            mil.className = "jm-tm-left" + ((themeExtras != "") ? " jm-tm-left" + themeExtras : "");
            mil.id = _id + "_left";

            var mic =  document.createElement("div");
            mic.className = "jm-tm-center" + ((themeExtras != "") ? " jm-tm-center" + themeExtras : "");
            mic.id = _id + "_center";

            var mir =  document.createElement("div");
            mir.className = "jm-tm-right" + ((themeExtras != "") ? " jm-tm-right" + themeExtras : "");
            mir.id = _id + "_right";

            var link = document.createElement("a");
            var target = items[l].id;
            link.id = target;

            link.className = "jm-tm-link";
            link.item =  items[l];
            link.item.uuid = _id;

            link.onclick = function(e) {
                if (!e) var e = window.event;
                var t;
                if (e.target) t= e.target;
                else if (e.srcElement) t = e.srcElement;
                       
                _widget.select(t.item.uuid);
               
                if (t.item.href) {
                    // if it's just a href nativate to it
                    if (t.item.href && !t.item.target) {
                        window.location.href = t.item.href;
                    } else if (t.item.target) {
                        t.target = t.item.target;
                        t.href= t.item.href;
                    }
                }
            };

            link.appendChild(document.createTextNode(items[l].label));

            mic.appendChild(link);
            mi.appendChild(mil);
            mi.appendChild(mic);
            mi.appendChild(mir);
            menu.appendChild(mi);
            mis.push(link);
            tabs[_id] = link;
       }
       if (_firstSelected){
           _widget.select(_firstSelected);
       }
       // set the size on the container which will cause it to center
       if (mi.parentNode.clientWidth !== 0) {
           container.style.width = mi.parentNode.clientWidth + "px";
       }
    }

    this.select = function(e) {
        var viewId;
        if (e.message)e = e.message;
        if (e.targetId) viewId = e.targetId;
        else viewId = e;
        if (tabs[viewId]) {
            var t = tabs[viewId];
            selectedTab = t.item.uuid;
            processActions(t.item, t.id, 'onSelect');
            for (var i=0; i < mis.length; i++) {
                var tar = mis[i].item.uuid;
                if (selectedTab != tar) {
                    document.getElementById( tar + "_left").className = "jm-tm-left" + ((themeExtras != "") ? " jm-tm-left" + themeExtras : "");
                    document.getElementById( tar + "_center").className = "jm-tm-center" + ((themeExtras != "") ? " jm-tm-center" + themeExtras: "");
                    document.getElementById( tar + "_right").className = "jm-tm-right" + ((themeExtras != "") ? " jm-tm-right" + themeExtras : "");
                } else {
                    document.getElementById( tar + "_left").className = "jm-tm-left-selected" + ((themeExtras != "") ? " jm-tm-left-selected"+ themeExtras : "");
                    document.getElementById( tar + "_center").className = "jm-tm-center-selected" + ((themeExtras != "") ? " jm-tm-center-selected" + themeExtras : "");
                    document.getElementById( tar + "_right").className = "jm-tm-right-selected" + ((themeExtras != "") ?" jm-tm-right-selected" + themeExtras : "");
              }
            }
        }  
    };

    this.getSelectedTab = function() {
        return selectedTab;
    };

    this.setTitle = function(targetId, label) {
        var el = document.getElementById(targetId);
        if (el != null) {
            el.innerHTML = label;
        }
        // resize
        // set the size on the container which will cause it to center
        if (_widget.list.parentNode.clientWidth !== 0) {
            container.style.width = _widget.list.parentNode.clientWidth + "px";
        }
    };

    function doSubscribe(topic, handler) {
        var i = widgets.subscribe(topic, handler);
        _widget.subs.push(i);
    }    
           
    this.init = function() {
         createMenu(items);
        _widget.subs = [];
        for (var _i=0; _i < subscribe.length; _i++) {
        _widget.subs = [];
            doSubscribe(subscribe[_i]  + "/select", _widget.select);
        }
    };

    this.destroy = function() {
        for ( var i=0; _widget.subs && i < _widget.subs.length; i++ ) {
            widgets.unsubscribe( _widget.subs[i]);
        }
    };

    function processActions(_t, _pid, _type, _value ) {
        widgets.publish( publish + "/" + _type, {
            value : _value,
            type : _type,
            action : _t.action,
            widgetId : uuid,
            targetId : _pid,
            topic : publish
        });
    }

    this.init();
};
