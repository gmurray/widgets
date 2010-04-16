if( typeof window.widgets === "undefined") {
    window.widgets=function(){var h={MSIE:/MSIE/i.test(navigator.userAgent),counter:0,debug:true};function isDefined(a){return(typeof a!=="undefined");}function matchWildcard(a,b){var c=0;var d=a.length;var e=0;var f=b.length;var i=0;var g=false;while(e+i<f){if(c+i<d){switch(a.charAt(c+i)){case"?":i++;continue;case'*':g=true;e+=i;c+=i;do{++c;if(c==d){return true;}}while(a.charAt(c)=='*');i=0;continue;}if(b.charAt(e+i)!=a.charAt(c+i)){if(!g){return false;}e++;i=0;continue;}i++;}else{if(!g){return false;}e++;i=0;}}do{if(c+i==d){return true;}}while(a.charAt(c+i++)=='*');return false;}function log(a){if(window.console){window.console.log(a);}else{var b=document.getElementById("log");if(b){var c=document.createElement("div");c.innerHTML=a;b.appendChild(c);}}}function trim(t){return t.replace(/^\s+|\s+$/g,"");}function unsubscribe(a){for(var b=0;b<h.subs.length;b++){if(h.subs[b].id==a.id){h.subs.splice(b,1);break;}}}function publish(a,b){if(typeof a=="undefined"||typeof b=="undefined"){return false;}if(h.debug){log("Publish "+a);}if(h.subs){for(var c=0;c<h.subs.length;c++){var d=h.subs[c];if((d.topic instanceof RegExp&&d.topic.test(a))||d.topic==a||(typeof d.topic.charAt=='function'&&matchWildcard(d.topic,a))){b.topic=a;if(d.action=='call'&&d.target){var e;var f='undefined';if(d.target.functionHandler){d.target.functionHandler.apply(window,[b]);}}}}}return true;}function subscribe(l,t){if(!isDefined(l)){return null;}var a;if(typeof l=='object'&&!(l instanceof RegExp)){if(l.topic){l.topic=trim(l.topic);}if(l.topicRegExp){l.topic=new RegExp(l.topicRegExp);}a=l;}else if(typeof t=='string'){a={};if(l.topicRegExp){a.topic=new RegExp(l.topicRegExp);}else{a.topic=l;}a.target={};var b=t.split('.');a.action="call";a.target.functionName=b.pop();a.target.object=b.join('.');}else if(typeof t=='function'){a={};if(l.topicRegExp){a.topic=new RegExp(l.topicRegExp);}else{a.topic=l;}a.target={};a.action="call";a.target.functionHandler=t;}else{log("Subscribe handler required : "+l);}if(isDefined(a)){if(!isDefined(h.subs)){h.subs=[];}if(a.topic){h.subs.push(a);}else{log("Subscribe topic required"+l);return null;}return a;}return null;}var j=function(a){var b=0;var c=0;if(a.offsetParent){while(true){c+=a.offsetTop;b+=a.offsetLeft;if(a.offsetParent===null){break;}a=a.offsetParent;}}else if(a.y){c+=a.y;b+=a.x;}return{x:b,y:c};};var k=function(n,a){if(typeof n=='undefined'||n===null){return null;}var b=0;if(typeof a!="undefined"){b=a;}var c=n.parentNode;while(c&&true){if(c.clientHeight>b){break;}if(c.parentNode&&c.parentNode.clientHeight){c=c.parentNode;}else{break;}}if(!c){return null;}return{h:c.clientHeight,w:c.clientWidth};};return{publish:publish,subscribe:subscribe,getPosition:j,getDimensions:k,log:log}}();
}

widgets.Tree = function( uuid, args) {

    var editable = false;
    var publish = "/widgets/tree";
    var _widget = this;
    var _selectedNode = null;
    var _selectedNodeList = null;
    var _rootNode = null;

    var counter = 0;

    this.nodeType = {
         FOLDER :  "folder",
         LEAF : "leaf"
    };

    // initialize 
    if ( args ) {
        if ( args.publish ) {
            publish = args.publish;
        }
    }

    this.toggleEdits = function () {

        if ( editable === false ) {
            editable = true;
            editLink.innerHTML = "Disable Edits";
        } else {
            editable = false;
            editLink.innerHTML = "Edit";
        }
        loadList();
    };

    function toggleNode( e ) {
        var _t;
        if (!e) {
            _t = window.event.srcElement;
        } else {
            _t = e.target;
        }
        var _src = _t;

        if ( _src.className !== "widgets-tree-folder" ) {
            _src = _src.parentNode;
        }
        var _parent = _src.parentNode;
        var _icon = _src.childNodes[0];

        // go up a level if we clicked on the image / label
        var _fChild = null;
        if ( _parent.childNodes &&_parent.childNodes[1] ) {
            _fChild = _parent.childNodes[1];
        }

        if ( _src.expanded === true ) {
            _fChild.style.display = "none";
            _src.expanded = false;
            _icon.className = "widgets-tree-folder-closed-icon";
        } else {
            _fChild.style.display = "block";
            _src.expanded = true;
            _icon.className = "widgets-tree-folder-open-icon";
        }
        if ( e ) {
          e.preventDefault();
        }
        return false;
    }

    function select( _target, _nodeList ) {
        if ( _selectedNode !== null ) {
            _selectedNode.style.background = "";
            _selectedNode.style.color = "";
        }

        _target.style.background = "#444";
        _target.style.color = "#FFF";

        _selectedNode = _target;
        _selectedNodeList = _nodeList;
    }

    function folderLabelSelect( e ) {
        var _t;
        if (!e) {
            _t = window.event.srcElement;
        } else {
            _t = e.target;
        }
        var _src = _t;
        if ( _src.className !== "widgets-tree-folder-label" ) {
            _src = _src.parentNode;
        }

        var _parent = _src.parentNode;
        select( _src, _parent );
        widgets.publish( publish + "/onFolderLabelSelect", { targetId : _src.id, path : _parent.path } );
        e.preventDefault();
        return false;
    }

    function folderSelect( e ) {
        var _t;
        if (!e) {
            _t = window.event.srcElement;
        } else {
            _t = e.target;
        }
        var _src = _t;
        if ( _src.className !== "widgets-tree-folder" ) {
            _src = _src.parentNode;
        }
        widgets.publish( publish + "/onFolderSelect", { targetId : _src.id, path : _src.path } );
        e.preventDefault();
        return false;
    }

    function iconSelect( e ) {
        var _t;
        if (!e) {
            _t = window.event.srcElement;
        } else {
            _t = e.target;
        }
        var _src = _t;
        if ( _src.className !== "widgets-tree-leaf" ) {
            _src = _src.parentNode;
        }
        select( _src );
        widgets.publish( publish + "/onIconSelect", { targetId : _src.id, path : _src.path } );
    }

    function buildList( ul, list, className, _path ) {
        if ( list == null ) {
            return;
        }
        for ( var i =0; i < list.length; i+=1 ) {
            var item = list[i];
            var _label = "";
            // get the key
            for ( var j in item ) {
                _label = j;
                break;
            }
            if ( item.children !== null && typeof item.children !== "undefined" ) {
                addFolderNode( item, ul, _label, _path + i + "/" + _label + "/" );
widgets.log("adding folder " + _label + " with path " + _path + "/"  );
            } else {
                addLeafNode( item, ul, _path + i + "/" );

            }
        }
    }

    function addFolderNode( item , _parent, _label, _path ) {

        //var _id = item.id;
        var _children;
        if ( item ) {
            _children = item.children;
        }
        var _lpath = "";
          if ( item  && typeof item === "number" ||
                        typeof item === "string" ||
                        typeof item === "boolean" ) { 
              _label = item;
          } else if ( item ) {
              // get the key
            for ( var i in item ) {
                _label = i;
                break;
            }
        }
        var li = document.createElement("li");
        li.className = "contentCategory";
        var _container = document.createElement("div");
        _container.className = "widgets-tree-folder";
        _container.id = _label;
        _container.path = _path || "/";
        _container.expanded = true;
        li.appendChild( _container );
        var _icon = document.createElement("div");
        _icon.className = "widgets-tree-folder-open-icon";
        _container.appendChild( _icon );
        var _labelDiv = document.createElement("div");
        _labelDiv.className = "widgets-tree-folder-label";
        _labelDiv.innerHTML =  _label;
        _labelDiv.onclick = folderLabelSelect;
        _container.appendChild( _labelDiv );
        _icon.onclick = toggleNode;
        var childrenUl = document.createElement( "ul" );
        childrenUl.className = "childList";
        li.appendChild( childrenUl );
        buildList( childrenUl, _children, "childList", _path  );
        _parent.appendChild( li );
        return _labelDiv;
    }

    function addLeafNode( item, _parent, _path ) {
        var _label = "<unknown>";
        var _id = item.id;
        var valueNode = false;
        var _extraPath = "";
        if ( typeof item === "number" ||
             typeof item === "string" ||
             typeof item === "boolean" ) { 
            _label = item;
            valueNode = true;
        } else {
            // get the key
            for ( var i in item ) {
                _label = i;
                _extraPath = i;
                break;
            }
        }
        var cli = document.createElement( "li" );
        var _container = document.createElement("div");
        _container.onclick = iconSelect;
        _container.id = _id || _label;
        _container.path = _path + _extraPath;
        _container.className = "widgets-tree-leaf";
        cli.appendChild( _container );
        var _icon = document.createElement("div");
        if ( valueNode === true ) {
            _icon.className = "widgets-tree-leaf-value-icon";
        } else {
            _icon.className = "widgets-tree-leaf-icon";
        }
        _container.appendChild( _icon );
        var _labelNode = document.createElement("div");
        _labelNode.className = "widgets-tree-leaf-icon-label";
        _labelNode.innerHTML = _label;
        _container.appendChild( _labelNode );
        _parent.appendChild( cli );
        return _labelNode;
    }

    function addNode( _type, _parentNode, _value, _edit ) {
        var _target = null;
        if ( _type === _widget.nodeType.FOLDER ) {
            var _id = genUUID();
            _target = addFolderNode ( undefined, _parentNode, "New Node",  _parentNode.path );
        } else if ( _type === addNode.nodeType.LEAF ) {
            _target = addLeafNode( _id, _label, _parentNode, _parentNode.path );
        }
        if ( _edit === true ) {

            new widgets.InlineEdit( _target,

                    { inEditMode : true,
                      parent  : _parentNode,
                      callback : function( value ) {

                        var _path = value.parent.path;

                         // if we are null we are the root
                    //     if ( _path ) {
                     //        alert("case 1")
                     //        value.parent.path = _parentNode.path + _lastPath;
                      //       _path[value.value ] = "foo";//{};
                        // } else {
                            // _widget.value[ value.value ] = "Top level";
                        var targetJSON = _widget.findObject(_path);
                        if ( targetJSON != null ) {
                            if (  targetJSON instanceof Array ) {
                                var _lastPath = _widget.value.length;
                                value.target.parentNode.path = _parentNode.path + _lastPath;
                                _widget.value.push( value.value );
                            } else {
                                value.target.parentNode.path = _parentNode.path + value;
                                targetJSON[ value.value ] = value.value;
                            }
                        }
                        alert("target json=" + targetJSON );
                             //alert( _parentNode.path + "<<new path is ref on target " + (_parentNode.path + _lastPath) );
                             // TODO differentiate the Object versus Array
                           //  value.target.parentNode.path = _widget.value[ value.value ];
                      //   }
                         value.widgetRef.detach();
                     }
            });
        }

    };

    this.addNode = function( ) {
        var _parentNode = _selectedNodeList || _rootNode;
        addNode( _widget.nodeType.FOLDER, _parentNode, "New Node", true );
    };

    function genUUID() {
        return uuid + "_" + (counter+=1) ; 
    }

    this.getValue = function() {
        return _widget.value;
    };

    this.setValue = function( _value ) {

        this.value = _value;
        var cl = document.getElementById( uuid );
        cl.innerHTML = "";

        var ul = document.createElement( "ul" );
        ul.className = "widgets-tree";
        ul.path = "/";
        _rootNode = ul;
        cl.appendChild( ul );
        buildList( ul, _value, undefined, "/" );

    };

    // resolve a path to a reference in the _widget.value JSON
    this.findObject = function( _path ) {
        // return the root path if needed
        if ( _path === "/" ) {
            return _widget.value;
        }
        console.log("path is " + _path );
        // don't need root path
        _path = _path.substring( 1 );
        var paths = _path.split( '/' );

        console.log("paths=" + paths );
        var found = false;
        var _obj = _widget.value[ paths[ 0 ] ];
        widgets.log("find with first path " +  paths[ 0 ] + " and obj is " + _obj );
        if ( _obj && paths.length === 1 ) {
            found = true;
        }
        if ( typeof _obj !== "undefined" ){
            for ( var ii =1; ii < paths.length; ii+=1 ) {
                var _lp = paths[ ii ];
                if ( typeof _obj[ _lp ] !== "undefined" ) {
                    _obj = _obj[ _lp ];
                    found = true;
                } else {
                    found = false;
                    break;
                }
            }
            if ( found ) {
                return _obj;
            }
        }
        return null;
    }
};

widgets.InlineEdit = function( _target, args ) {

    var _value = "";
    var _input = null;
    var _editing = false;
    var _orginalWidth = "";
    var _originalColor = "";
    var _hoverActive = false;
    var _widget = this;
    var _clickListener = null;

    // find the element
    if ( typeof _target === "string" ) {
        _target = document.getElementById( args.uuid );
    }
    if ( typeof _target.onclick === "function" ) {
        _clickListener = _target.onclick;
    }

    function enableEdits() {
        if ( _editing === true ) {
            return;
        } else if ( _editing === false ) {
            _editing = true;
            _target.onclick = null;
            _value = _target.innerHTML + "";
            _orginalWidth = _target.parentNode.style.width;
      //      _target.parentNode.style.width = (_target.clientWidth + 8 ) + "px";
        }
        var _wrapper = document.createElement("span");

        var form = document.createElement("form");
        form.onsubmit = function(e) {
            _target.innerHTML = _input.value;
            _editing = false;
            //_target.onclick = onclick;
            _target.parentNode.style.width = _orginalWidth;
            if ( typeof args.callback === "function" ) {
                 //alert("all done")
                var _val =  { id : args.uuid, target : _target, value : _input.value, widgetRef : _widget };
                if ( args.parent ) {
                    _val.parent = args.parent;
                }
                 args.callback.apply({}, [ _val ]);
            }
            if ( e ) {
                 e.preventDefault();
            }
            return false;
        };

        _input = document.createElement("input");
        _input.type = "text";
        _input.value = _value;

        var submit = document.createElement("input");
        submit.type = "SUBMIT";
        submit.value = "Update";

        var cancel = document.createElement("a");
        cancel.onclick = function(e) {
            _target.innerHTML  = _value;
            _editing = false;
            if (e) {
                e.cancelBubble = true;
                e.stopPropagation = true;
            }
            //_target.onclick = onclick;
            _target.parentNode.style.width = _orginalWidth;
            return false;
        };

        cancel.href = "javascript:void(0)";
        cancel.innerHTML = "cancel";
        form.appendChild(_input);
        form.appendChild(submit);
        form.appendChild(cancel);
        _target.innerHTML = "";
        _wrapper.appendChild( form );
        _target.appendChild( _wrapper );
        _input.focus();
    }

    function onclick(e) {

        enableEdits();
        if (e) {
            e.cancelBubble = true;
            e.stopPropagation = true;
        }
        return false;
    }

    function clearHover() {
        _target.style.backgroundColor = _originalColor;
        _hoverActive = false;
    }

    function hover() {
        if ( _hoverActive === true || _editing === true) {
            return;
        }
        _originalColor = _target.style.backgroundColor;
        _hoverActive = true;
        var fader = new Fade( _target, "#ffc", "#fff", 20, 50, 0, function() {
            _hoverActive = false;
            _target.style.backgroundColor = _originalColor;
        });
        fader.init();
    }

    this.detach = function() {
        if ( _target.removeEventListener ) {
            _target.removeEventListener( "click", onclick, false );
            _target.removeEventListener( "mouseover", hover, false );
            if ( _clickListener != null ) {
                _target.onclick = _clickListener;
            }
        }
       // _target.parentNode.removeChild( _target );
        _target.title = "Cruel world";
    };
    if ( _target.addEventListener ) {
        _target.addEventListener( "mouseover", hover, false );
        _target.addEventListener( "click", onclick, false );
    }

    _target.style.cursor = "pointer";


    if ( args.inEditMode === true ) {
        enableEdits();
    }

};

/* 

Script to gradually change background colour of an element

References: 
   http://www.37signals.com/svn/archives/000558.php
   http://www.meyerweb.com/eric/tools/color-blend/

Future work: 
   Could change foreground, border colours
   Transparency

*/

function Fade(id, startColour, endColour, count, speed, delay, _callback ) {

  /* Properties */

  this.id = id;                    /* id/object ref of element to fade */
  this.startColour = startColour;  /* initial colour (3 or 6 digit) hex */
  this.endColour = endColour;      /* final colour (3 or 6 digit) hex */
  this.count = count;              /* No of steps to take during fade */
  this.speed = speed;              /* Delay in ms between steps */
  this.delay = delay;              /* Initial delay before fade begins */

  if (typeof this.id == "string") {
    this.obj = document.getElementById(id);  
  } else {
    this.obj = this.id;
  }
  this.colour = new Array();
  this.steps = 0;

  /* Methods */

  this.init = init;
  this.fade = fade;
  this.parseColour = parseColour;

  function init() {

    first = this.parseColour(this.startColour, 'hex');
    last = this.parseColour(this.endColour, 'hex');

    this.colour = new Array();
    this.colour[this.count] = this.startColour;
    for (i=0; i<this.count; i++) {
      temp = "rgb(";
      temp += parseInt(first[0]+(last[0]-first[0])/this.count*i);
      temp += ",";
      temp += parseInt(first[1]+(last[1]-first[1])/this.count*i);
      temp += ",";
      temp += parseInt(first[2]+(last[2]-first[2])/this.count*i);
      temp += ")";
      this.colour[this.count-i] = temp;
    }
    this.colour[0] = this.endColour;

    var thisObj = this;
    setTimeout( function() { thisObj.fade(); }, this.delay);

  }

  function fade() {
    if (this.count >= 0) {

      this.obj.style.backgroundColor = this.colour[this.count--];

      // I want to do this:
      // setTimeout("this.fade()", init.speed);
      // but setTimeout runs in a different thread so 'this' 
      // is out of context. 
      // See: http://www.faqts.com/knowledge_base/view.phtml/aid/2311

      var thisObj = this;
      setTimeout( function() { thisObj.fade(); }, this.speed);

    } else {
        if ( typeof _callback === "function" ) {
            _callback.apply({}, [] );
        }
    }
  }

  function parseColour(colour, t) {
    /* From: http://www.meyerweb.com/eric/tools/color-blend/ */
    var m = 1;
    col = colour.replace(/[\#rgb\(]*/,'');
    if (t == 'hex') {
      if (col.length == 3) {
        a = col.substr(0,1);
        b = col.substr(1,1);
        c = col.substr(2,1);
        col = a + a + b + b + c + c;
      }
      var num = new Array(col.substr(0,2),col.substr(2,2),col.substr(4,2));
      var base = 16;
    } else {
      var num = col.split(',');
      var base = 10;
    }
    if (t == 'rgbp') {m = 2.55;}
    var ret = new Array(parseInt(num[0],base)*m,parseInt(num[1],base)*m,parseInt(num[2],base)*m);
    return(ret);
  }
}