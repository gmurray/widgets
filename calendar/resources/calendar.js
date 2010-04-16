if( typeof window.widgets === "undefined") {
    window.widgets=function(){var h={MSIE:/MSIE/i.test(navigator.userAgent),counter:0,debug:true};function isDefined(a){return(typeof a!=="undefined");}function matchWildcard(a,b){var c=0;var d=a.length;var e=0;var f=b.length;var i=0;var g=false;while(e+i<f){if(c+i<d){switch(a.charAt(c+i)){case"?":i++;continue;case'*':g=true;e+=i;c+=i;do{++c;if(c==d){return true;}}while(a.charAt(c)=='*');i=0;continue;}if(b.charAt(e+i)!=a.charAt(c+i)){if(!g){return false;}e++;i=0;continue;}i++;}else{if(!g){return false;}e++;i=0;}}do{if(c+i==d){return true;}}while(a.charAt(c+i++)=='*');return false;}function log(a){if(window.console){window.console.log(a);}else{var b=document.getElementById("log");if(b){var c=document.createElement("div");c.innerHTML=a;b.appendChild(c);}}}function trim(t){return t.replace(/^\s+|\s+$/g,"");}function unsubscribe(a){for(var b=0;b<h.subs.length;b++){if(h.subs[b].id==a.id){h.subs.splice(b,1);break;}}}function publish(a,b){if(typeof a=="undefined"||typeof b=="undefined"){return false;}if(h.debug){log("Publish "+a);}if(h.subs){for(var c=0;c<h.subs.length;c++){var d=h.subs[c];if((d.topic instanceof RegExp&&d.topic.test(a))||d.topic==a||(typeof d.topic.charAt=='function'&&matchWildcard(d.topic,a))){b.topic=a;if(d.action=='call'&&d.target){var e;var f='undefined';if(d.target.functionHandler){d.target.functionHandler.apply(window,[b]);}}}}}return true;}function subscribe(l,t){if(!isDefined(l)){return null;}var a;if(typeof l=='object'&&!(l instanceof RegExp)){if(l.topic){l.topic=trim(l.topic);}if(l.topicRegExp){l.topic=new RegExp(l.topicRegExp);}a=l;}else if(typeof t=='string'){a={};if(l.topicRegExp){a.topic=new RegExp(l.topicRegExp);}else{a.topic=l;}a.target={};var b=t.split('.');a.action="call";a.target.functionName=b.pop();a.target.object=b.join('.');}else if(typeof t=='function'){a={};if(l.topicRegExp){a.topic=new RegExp(l.topicRegExp);}else{a.topic=l;}a.target={};a.action="call";a.target.functionHandler=t;}else{log("Subscribe handler required : "+l);}if(isDefined(a)){if(!isDefined(h.subs)){h.subs=[];}if(a.topic){h.subs.push(a);}else{log("Subscribe topic required"+l);return null;};return a;}return null;};var j=function(a){var b=0;var c=0;if(a.offsetParent){while(true){c+=a.offsetTop;b+=a.offsetLeft;if(a.offsetParent===null){break;}a=a.offsetParent;}}else if(a.y){c+=a.y;b+=a.x;}return{x:b,y:c};};var k=function(n,a){if(typeof n=='undefined'||n===null){return null;}var b=0;if(typeof a!="undefined"){b=a;}var c=n.parentNode;while(c&&true){if(c.clientHeight>b){break;}if(c.parentNode&&c.parentNode.clientHeight){c=c.parentNode;}else{break;}}if(!c){return null;}return{h:c.clientHeight,w:c.clientWidth};};return{publish:publish,subscribe:subscribe,getPosition:j,getDimensions:k,log:log};}();
}

widgets.Calendar = function( uuid, args) {

    var ONE_DAY = 86400000; // (1 * 24 * 60 * 60 * 1000);
    var widget = this;
    var today = new Date();
    var startYear = today.getFullYear();
    var startMonth = today.getMonth();

    function Map(mixin) {

        var map = this;

        if (typeof mixin == 'undefined') {
            map = {};
        } else {
            map = mixin;
        }

        /**
         * Get a list of the keys to check
         */
        this.keys = function() {
            var _keys = [];

            for (var _i in map){
                // make sure we don't return prototype properties.
                if (map.hasOwnProperty(_i)) {
                    _keys.push(_i);
                }
            }
            return _keys;
        };
        /**
         * Put stores the value in the table
         * @param key the index in the table where the value will be stored
         * @param value the value to be stored
         */
        this.put = function(key,value) {
            map[key] = value;
        };

        /**
         * Return the value stored in the table
         * @param key the index of the value to retrieve
         */
        this.get = function(key) {
            return map[key];
        };

        /**
         * Remove the value from the table
         * @param key the index of the value to be removed
         */
        this.remove =  function(key) {
            delete map[key];
        };
        /**
         *  Clear the table
         */
        this.clear = function() {
            map = {};
        };
    };

    
    widget.events = new Map();
    widget.eventNodeMappings = new Map();
    widget.eventTypeBuckets = new Map();
    widget.details = null;
    widget.table = null;
    widget.tableRows = [];
    widget.detailsWidth = 550;
    var useSmallIcons = false;
    var useShortNames = false;
    var allowDateSelection = true;
    var enableEventCreation = false;
    var minimumSelectableDate = null;

    widget.publish = "/widgets/calendar";

    var publishSubtype = "save";
    widget.subscribe = ["/widgets/calendar"];

    widget.container = document.getElementById( uuid );
    widget.days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    
    widget.shortDays = [
                    "Sun",
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat"
                ];
    
    widget.daysInMonth = [
        31,
        28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31
    ];

    widget.months = [
                      { label : 'January', value : 0},
                     { label : 'February', value : 1 },
                     { label : 'March', value : 2 },
                     { label : 'April', value : 3  },
                     { label : 'May', value : 4 },
                     { label : 'June', value : 5 },
                     { label : 'July', value : 6 },
                     { label : 'August', value : 7 },
                     { label : 'September', value : 8 },
                     { label : 'October', value : 9 },
                     { label : 'November', value : 10 },
                     { label : 'December', value : 11}
                    ];

    widget.years = [];

    for (var i = startYear; i >= 1999; i-=1) {
        widget.years.push({ label : i + "",  value : i });
    }
    // select the first year
    widget.years[0].selected = true;

    widget.months[startMonth].selected = true;  

    function getFirstDay(month, year){
        var _d = new Date();
        _d.setYear(year);
        _d.setMonth(month, 1);
        return _d.getDay();
    }

    function getNumberOfDays(month, year) {
       // handle leap year
       if (month == 1 &&
          (new Date(year,1,29).getDate() == 29)) {
           return 29;
        } else {
           return widget.daysInMonth[month];
        }
    }

    this.useSmallIcons = function(smallIcons) {
        useSmallIcons = smallIcons;
    };

    this.getNext = function() {
        if (startMonth < 11) {
            startMonth+=1;
        }  else {
            startMonth = 0;
            startYear+=1;
        }
        widget.selectMonth(startMonth);
        widget.selectYear(startYear);  
        widget.render();
    };

    this.getPrevious = function() {
        if (startMonth > 0) {
            startMonth-=1;
        } else {
            startMonth = 11;
            startYear-=1;
        }
        widget.selectMonth(startMonth);
        widget.selectYear(startYear);
        widget.render();

    };

    function addRow(_table) {
        var _row;
        if (widgets.MSIE) {
            _row = _table.insertRow(-1);
        } else {
            _row = document.createElement("tr");
            _table.appendChild(_row);
        }
        return _row;
    }

    function addCell(_row) {
        var _cell;
        if (widgets.MSIE) {
            _cell = _row.insertCell(-1);
        } else {
            _cell = document.createElement("td");
            _row.appendChild(_cell);
        }
        return _cell;
    }

    function completeEdit(e) {
        if (!widget.editing) {
            return;
        }
        widget.editing = false;
        var _esrc;
        if (e && e.target) {
            _esrc = e.target;
        } else if (window.event) {
            _esrc = window.event.srcElement;
        }
        var _eid = _esrc.eid;
         _esrc.parentNode.eid = _eid;
        var events = widget.events.get(_esrc.dateid);
        var event = events[_eid];
        event.label = _esrc.value;
        var _name = document.createElement("div");
        _name.dateid = _esrc.dateid;
        _name.eid = _eid;
        _name.innerHTML = event.label;
        _name.className = "jmk-calendar-entry";
        _name.onclick = showDetails;
        _esrc.parentNode.replaceChild(_name, _esrc);
        widgets.publish(widget.publish + "/" + publishSubtype, {});
    }

    this.selectMonth = function(_month) {
        startMonth = _month;
        for (var i=0;i < widget.months.length; i+=1) {
            if (i === _month) {
                widget.months[i].selected = true;
            } else {
                widget.months[i].selected = false;
            }
        }
        if (widget.monthWidget) {
            widget.monthWidget.setValue({ label : widget.months[_month].label, value : _month }); 
            resizeMonthWidgets();
        } else {
            widget.labelsDiv.innerHTML = widget.months[_month].label + "&nbsp;" + startYear;
        }
    };

    this.selectYear = function(_year) {
        startYear = _year;
        for (var i=0;i < widget.years.length; i+=1) {
            if (widget.years[i].value === _year) {
                widget.years[i].selected = true;
            } else {
                widget.years[i].selected = false;
            }
        } 

        if (widget.yearWidget) {
            widget.yearWidget.setValue({value : _year, label : _year});
            resizeMonthWidgets();
        } else {
            widget.labelsDiv.innerHTML = widget.months[startMonth].label + "&nbsp;" + startYear;
        }
    };

    this.showToday = function() {
        var today = new Date();
        var _year = today.getFullYear();
        var _month = today.getMonth();
        widget.selectMonth(_month);
        widget.selectYear(_year);
        widget.render();
    };

   this.selectDate = function(date) {
       var _year = date.getFullYear();
       var _month = date.getMonth();
       var _day = date.getDate();
       widget.selectMonth(_month);
       widget.selectYear(_year);
       var dayNode = document.getElementById( uuid + "_" + _year + "_" + _month + "_" + _day );
       if (dayNode != null) {
           selectDateCell(dayNode);
       }
   };

    this.select = function(obj) {
       
        var eventId;
        if (obj.message) {
            obj = obj.message;
        }
        if (obj.targetId) {
            eventId = obj.targetId;
        
        }

        if (eventId) {

            var event = findEvent(eventId);
            if (event !== null) {
                startYear = event.date.year;
                widget.selectMonth(event.date.month);
                widget.selectYear(event.date.year);
                widget.render();
                var el =  widget.eventNodeMappings.get(eventId);
                showDetails({ target : el.eNode});
            }
        }
    };

    function findEvent(target) {
        return widget.eventMappings.get(target) || null;
    }

    function completeDetailsNameEdit() {
        var _esrc = document.getElementById( uuid + "_details_name_edit" );
        if (!_esrc) {
            return;

        }
        var _eid =  widget.currentEvent.eid;
        var events = widget.events.get(widget.currentEvent.dateid);
        var event = events[_eid];

         if (widget.currentEvent) {
             widget.currentEvent.innerHTML = _esrc.value;
         }
         event.label = _esrc.value;
         var _name = document.createElement("div");
         _name.className = "jmk-calendar-details-body-name";
         _name.innerHTML = _esrc.value;
         _name.ondblclick = editEventDetailsName;
         _esrc.parentNode.replaceChild(_name,_esrc);
         widgets.publish(widget.publish + "/" + publishSubtype, {});
    }

    function completeDetailsEdit() {
        var _src = document.getElementById( uuid + "_details_edit" );
        if (!_src) {
            return;
        }
        var _eid =  widget.currentEvent.eid;
        var events = widget.events.get(widget.currentEvent.dateid);
        var event = events[_eid];
        event.details = _src.value;
        var _details = document.createElement("div");
        _details.className = "jmk-calendar-details-body-details";
        _details.innerHTML = _src.value;
        _details.ondblclick = editEventDetails;
        _src.parentNode.replaceChild(_details,_src);
        widgets.publish(widget.publish + "/" + publishSubtype, {});
    }

    function editEventDetailsName(e) {

        var _src;
        if (e && e.target) {
            _src = e.target;
        } else if (window.event) {
            _src = window.event.srcElement;

        }
        var _p = _src.parentNode;
        var _in = document.createElement("input");
        _in.eid = _src.eid;
        _in.dateid = _src.dateid;
        _in.value = _src.innerHTML;
        var _div = document.createElement("div");
        _in.id= uuid + "_details_name_edit";
        _in.className = "jmk-calendar-edit";

        _in.onblur = completeDetailsNameEdit;
        _in.onkeypress = function(e) {
            var _kc;
            if (e && e.keyCode) {
                _kc = e.keyCode;
            } else if (window.event && window.event.keyCode) {
                _kc = window.event.keyCode;
            }
            if(_kc=='13') {
                completeDetailsNameEdit(e);
            }
        };
        _div.appendChild(_in);
        _p.replaceChild(_div,_src);
        _in.select();
        _in.focus();
    }

    function clone(t) {
        var _obj;
        if (t instanceof Array) {
            _obj = [];
            for (var _j=0;_j< t.length;_j+=1) {
                if (typeof t[_j] != "function") {
                    _obj.push(clone(t[_j]));
                }
            }
        } else if (t instanceof Object) {
            _obj = {};
            for (var _jj in t) {
                if (typeof t[_jj] != "function") {
                 _obj[_jj] = clone(t[_jj]);
                }
            }
        } else {
            _obj = t;
        }
        return _obj;
     }

    function editEventDetails(e) {
        var _src;
        if (e && e.target) {
            _src = e.target;
        } else if (window.event) {
            _src = window.event.srcElement;
        }
        var _p = _src.parentNode;
        _p.removeChild(_src);
        var _eid =  widget.currentEvent.eid;
        var events = widget.events.get(widget.currentEvent.dateid);
        var event = events[_eid];      
        var _div = document.createElement("div");
        var _in = document.createElement("textarea");
        _in.className = "jmk-calendar-edit";
        _in.id = uuid + "_details_edit";
        if (event.details) {
            _in.value = event.details;
        } else {
            _in.value = "Click to Edit";
        } 
        _in.onblur = completeDetailsEdit;
        _in.onkeypress = function(e) {
            var _kc;
            if (e && e.keyCode) {
                _kc = e.keyCode;
            } else if (window.event && window.event.keyCode) {
                _kc = window.event.keyCode;
            }
            if(_kc=='13') {
                completeDetailsEdit(e);
            }
        };
        _div.appendChild(_in);
        _p.appendChild(_div);
        _in.select();
        _in.focus();
    }

    function addEvent(e) {
        if (enableEventCreation === false) {
            return;
        }
        var _src;
        if (e && e.target) {
            _src = e.target;
        } else if (window.event) {
            _src = window.event.srcElement;
        }
        if (!_src || !_src.date || widget.editing) {
            return;
        }
        widget.editing = true;
        var _div = document.createElement("div");
        var _in = document.createElement("input");
        var _eid = _src.date.id;
        _in.dateid = _eid;
        _in.className = "jmk-calendar-edit";
        _in.value = "New Event";
        _in.onblur = completeEdit;
        _in.onkeydown = function(e) {
            var _kc;
            if (e && e.keyCode) {
                _kc = e.keyCode;
            } else if (window.event && window.event.keyCode) {
                _kc = window.event.keyCode;
            }
            if(_kc=='13') {
                completeEdit(e);
            }
        };
        var events = widget.events.get(_eid);
        if (events === null) {
          events = [];
          widget.events.put(_eid, events);
        }
        var event = clone(_src.date);
        event.label = "New Event";
        _in.eid = (events) ? events.length : 0;
        events.push(event);
        _div.appendChild(_in);
        _src.appendChild(_div);
        widgets.publish(widget.publish + "/" + publishSubtype, {});
        _in.select();
        _in.focus();
    }

    function addEventNode(_event, _parent, _id){

        var eMap = widget.eventNodeMappings.get(_parent.date.id);

        if (!eMap) {
            eMap = { events : {}, date : _parent.date};
            widget.eventNodeMappings.put(_parent.date.id, eMap);
        }

        var count = 0;

        var cmap = eMap.events[_event.eventType];

        if (!cmap) {
            cmap = { events : []};
            eMap.events[_event.eventType] = cmap;
        }

        // create a map of children
        if (cmap) {
            count = cmap.events.length;
        }

        if (count === 0) {

            cmap.eNode = document.createElement("div");

            cmap.eNode.onclick = showDetails;
            _parent.appendChild(cmap.eNode);

            cmap.eNode.dateid = _parent.date.id;
            cmap.eNode.id = _event.uuid;
            cmap.eNode.eventType = _event.eventType;

            var iObject = null;

            if ( args && args.eventMetadata[_event.eventType] ) {
                iObject = args.eventMetadata[_event.eventType];
            }

            if (iObject) {
                if (iObject.src) {
                    cmap.eNode.className = "jmk-calendar-icon-container";
                    cmap.iNode = document.createElement("img");
                    cmap.iNode.src= iObject.src;
                    if (iObject.title) {
                        cmap.iNode.title = iObject.title;
                    }
                    if (typeof iObject.titleFormatter === "function") {
                        cmap.iNode.title = iObject.titleFormatter.apply({}, [_event.title, _event]);
                    }
                    if (typeof iObject.decorator === "function") {
                       iObject.decorator.apply({}, [_event,cmap.eNode, useSmallIcons]);
                    }
                    cmap.iNode.className = "jmk-calendar-icon";
                    if (iObject.size) {
                        cmap.eNode.style.width = iObject.size.w + "px";
                        cmap.eNode.style.height = iObject.size.h + "px";
                        cmap.iNode.style.width = iObject.size.w + "px";
                        cmap.iNode.style.height = iObject.size.h + "px";
                    } else if (useSmallIcons) {
                        cmap.eNode.style.width = "30px";
                        cmap.eNode.style.height = "20px";
                        cmap.iNode.style.width = "30px";
                        cmap.iNode.style.height = "20px";
                    }
                    cmap.eNode.appendChild(cmap.iNode);
                } else {
                    cmap.eNode.className = "jmk-calendar-entry";
                }
            } else  {
                cmap.eNode.className = "jmk-calendar-entry";
                cmap.eNode.innerHTML = _event.title;
            }

            cmap.events.push(_event);
            cmap.eventNode = cmap.eNode;

            cmap.countNode = document.createElement("div");
            cmap.countNode.className = "jmk-calendar-dup-entry-count";
            if (useSmallIcons) {
                if (count > 8) {
                    cmap.countNode.className = "jmk-calendar-dup-entry-count-many-s";
                } else {
                    cmap.countNode.className = "jmk-calendar-dup-entry-count-s";
                }
            }
            cmap.countNode.innerHTML = count + 1;
            cmap.eNode.appendChild(cmap.countNode);

        } else {
            var jObject = null;
            
            if ( args &&
                args.eventMetadata[_event.eventType]) {
                jObject = args.eventMetadata[_event.eventType];
            }

            if ( jObject ) {
                if (typeof jObject.multipleItems == "string") {
                    cmap.iNode.title = jObject.multipleItems;
                    cmap.countNode.title = jObject.multipleItems;
                }
            }
            cmap.eNode = cmap.eventNode;
            if (cmap.countNode && count > 0) {
                cmap.countNode.style.display = "block";
                if (useSmallIcons) {
                    if (count > 8) {
                        cmap.countNode.className = "jmk-calendar-dup-entry-count-many-s";
                    } else {
                        cmap.countNode.className = "jmk-calendar-dup-entry-count-s";
                    }
                }
                cmap.countNode.innerHTML = count + 1;
            }
            cmap.events.push(_event);
            // put a reference to the top level node
        }

        widget.eventNodeMappings.put(_event.id, cmap);
    }

    function hideDetails() {
       if (widget.details !== null) {
           widget.details.style.display = "none";
           widget.detailsRightArrow.style.display = "none";
           completeDetailsNameEdit();
           completeDetailsEdit();
           widget.currentEvent = null;
       }
    }

    function removeCurrentEvent() {
       if (widget.details !== null && widget.currentEvent !== null) {
           var _parent = widget.currentEvent.parentNode;
           var _eid =  widget.currentEvent.eid;
           var events = widget.events.get(widget.currentEvent.dateid);
           var event = events[_eid];
           events.splice(event.id,1);
           //rebuild event nodes
           var cnodes = widgets.getElementsByStyle("jmk-calendar-entry", _parent);
           for (var i=0; i < cnodes.length; i+=1) {
              cnodes[i].parentNode.removeChild(cnodes[i]);
           }
           //remove current
           widget.currentEvent.parentNode.removeChild(widget.currentEvent);
           for (var j=0;j < events.length;j+=1) {
               addEventNode(events[j],_parent, j);
           }
           widgets.publish(widget.publish + "/" + publishSubtype, {});
           hideDetails();
       }
    }

    function setOpacity(target, opacity) {
        target.style.opacity = opacity / 100;
        target.style.filter = "alpha(opacity='" + opacity + "')";
    }

    function showDetails(e) {

        var _src;

        if (e && e.target) {
            _src = e.target;
        } else if (window.event) {
            _src = window.event.srcElement;
        }
        if (!_src) {
            widgets.log("no source element");
            return;
        }
        // if we are an image / text inside of the icon use the parent.
        if (!_src.dateid) {
            if (_src.parentNode && _src.parentNode.dateid) {
                _src = _src.parentNode;
            } else {
                return false;
            }
        }

        widget.currentEvent = _src;

        var event;
        var aggregateEvent = widget.eventNodeMappings.get(_src.dateid);
        var eventType = _src.eventType;

        if (!aggregateEvent) {
            event = findEvent(_src.eventId);
        }

        var loc = widgets.getPosition(_src);

        if (widget.details === null) {

            widget.detailsContainer = document.getElementById(uuid + "_details_container");
            widget.detailsRightArrow = document.getElementById(uuid + "_details_arrow_right");
            widget.detailsLeftArrow = document.getElementById(uuid + "_details_arrow_left");
            widget.detailsContainerShadow = document.getElementById(uuid + "_details_container_shadow");
            setOpacity(widget.detailsContainerShadow, 15);
            widget.detailsContainer.style.width = widget.detailsWidth + "px";
            widget.detailsContainerShadow.style.width = widget.detailsWidth + "px";
            widget.details = document.getElementById(uuid + "_details");

            widget.detailsName = document.getElementById(uuid + "_details_name");

            //widget.detailsName.ondblclick = editEventDetailsName;
            widget.detailsContent = document.getElementById(uuid + "_details_content");
            //widget.detailsContent.ondblclick = editEventDetails;

            widget.detailsClose = document.getElementById(uuid + "_details_close");
            widget.detailsClose.onclick = hideDetails;

            widget.detailsDone = document.getElementById( uuid + "_details_done");
            widget.detailsDone.onclick = hideDetails;

            //widget.detailsRemove = document.getElementById(uuid + "_details_remove");
            // widget.detailsRemove.onclick = removeCurrentEvent;
            document.body.appendChild(widget.details);

            // attach the drag listeners
            widget.dragger = document.getElementById( uuid + "_details_dragger");

            widget.dragger.className = "jmk-calendar-details-dragger";

            // attach the drag listeners
            widget.leftDragger = document.getElementById( uuid + "_details_left_dragger");
            widget.dragger.className = "jmk-calendar-details-left-dragger";

            // drag done
            widget.dragStart = null;
            widget.left = 0;

            function onmouseup(e) {
                widget.dragStart = null;
                widget.dragAnchor = null;
            }

            function getMousePos(e) {
                var lx = 0;
                var ly = 0;
                if (!e) {
                    e = window.event;
                }
                if (e.pageX || e.pageY) {
                    lx = e.pageX;
                    ly = e.pageY;

                } else if (e.clientX || e.clientY) {
                    lx = e.clientX;
                    ly = e.clientY;
                }
                // calculate scroll offsetsets
                if (widgets.MSIE) {
                    ly += (document.documentElement.scrollTop) ?
                            document.documentElement.scrollTop :
                            document.body.scrollTop;
                    lx += (document.documentElement.scrollLeft) ?
                            document.documentElement.scrollLeft :
                                document.body.scrollLeft;
                }
                return {x:lx,y:ly};
            }
             function dragStart(e) {
                 widget.dragAnchor = widgets.getPosition(widget.detailsContainer);
                 widget.dragStart = getMousePos(e);
                 widget.dragStartWidth = null;
                 if (e) {
                     e.preventDefault = true;
                 }
                 return false;
             }

             function dragLeftStart(e) {
                 widget.dragAnchor = widgets.getPosition(widget.detailsContainer);
                 widget.dragStart = getMousePos(e);
                 widget.dragStartWidth = widget.detailsContainer.clientWidth;
                 if (e) {
                     e.preventDefault = true;
                 }
                 return false;
             }

            widget.dragger.onmousedown = dragStart;

            widget.leftDragger.onmousedown = dragLeftStart;

            function mouseMove(e) {
                if (widget.dragStart !== null) {

                    var pos = getMousePos(e);

                    // TODO handle negative

                    var  w = pos.x - widget.dragAnchor.x;
                    var h =  pos.y - widget.dragAnchor.y;
                    if (widget.dragStartWidth !== null) {
                        widget.details.style.left = (pos.x - 25) + "px";
                        // add the negative diff
                        w = widget.dragStartWidth - w;
                    }
                    if (w > 0) {
                        widget.detailsContainer.style.width = w + "px";
                        widget.detailsContainerShadow.style.width = w + "px";
                    }
                    if (h > 0) {
                        widget.detailsContainer.style.height = h + "px";
                        widget.detailsContainerShadow.style.height = h + "px";
                    }
                    if (h > 80) {
                        widget.detailsContent.style.height = (h - 80) + "px";
                    }
                }
                if (e) {
                    e.preventDefault = true;
                }
                return false;
            }

            // attach listeners to doc
            if (typeof document.attachEvent != 'undefined') {
                document.attachEvent("onmousemove", mouseMove);
            } else {
                document.addEventListener("mousemove",mouseMove, true);
            }

            if (typeof document.attachEvent != 'undefined') {
                document.attachEvent("onmouseup",onmouseup);
            } else {
                document.addEventListener("mouseup", onmouseup, true);
            }

        }

        // look up the meta data object for this type
        var iObject = null;
        if ( args &&
                args.eventMetadata[eventType]) {
                iObject = args.eventMetadata[eventType];
        }

        if (event) {

               var _title = (event.date.month + 1) +
                   "/"+ ((event.date.day < 10) ? '0' : '') +
                   event.date.day + "/" + event.date.year;

                widget.detailsName.innerHTML = _title + event.title ;

            if (!event.description || event.description === '') {
                widget.detailsContent.innerHTML = "Click to Edit";
            } else {
                widget.detailsContent.innerHTML = event.description;
            }

        } else if (aggregateEvent) {

            var cmap = aggregateEvent.events[eventType];
            if (cmap) {
                 cmap.eventType = eventType;
                 var _title = (aggregateEvent.date.month + 1) +
                            "/"+ ((aggregateEvent.date.day < 10) ? '0' : '') +
                            aggregateEvent.date.day + "/" + aggregateEvent.date.year + " ";
                 if (iObject && cmap.events.length > 1 && iObject.multipleItems) {
                     _title += iObject.multipleItems;
                 } else {
                     _title += cmap.events[0].title;
                 }
                   widget.detailsName.innerHTML = _title;
                       
                 if (iObject && typeof iObject.detailsContentFormatter == "function") {
                          widget.detailsContent.innerHTML = iObject.detailsContentFormatter.apply({}, [cmap]);
                   } else {
                     var _des = "";
                     _des += "<table class='jmk-calendar-details-table'><tr><th>Event Type</th><th nowrap='nowrap'>Event Id</th><th>Title</th></tr>";
                     for (var i=0; i < cmap.events.length;i+=1) {
                         _des += "<tr>" + 
                         "<td>" + eventType + "</td>" +
                         "<td>" + cmap.events[i].id + "</td><td>" + cmap.events[i].description + "</td></tr>";
                     }
                     _des +="</table>";
                     widget.detailsContent.innerHTML = _des;
                 }
             }
            widget.pos = widgets.getPosition(widget.container);
             widget.details.style.top = (loc.y - 50) + "px";
             widget.details.style.display = "block";
             //decide right vs left
             widget.showRight = false;
             // add some padding for the arrow
             if ((loc.x + widget.detailsContainer.clientWidth) > (widget.pos.x + widget.container.clientWidth - 30)) {
                 widget.showRight = true;
             }

             if (widget.showRight  === true) {
                 widget.dragger.style.display = "none";
                 widget.leftDragger.style.display = "block";
                 widget.detailsRightArrow.style.display = "block";
                 widget.detailsLeftArrow.style.display = "none";
                 widget.detailsRightArrow.style.left= (loc.x -5) + "px";
                 widget.detailsRightArrow.style.top = (loc.y - 50) + "px";
                 widget.details.style.left = (loc.x - widget.detailsContainer.clientWidth - 30 ) + "px";
             } else {
                 widget.dragger.style.display = "block";
                 widget.detailsLeftArrow.style.display = "block";
                 widget.detailsRightArrow.style.display = "none";
                 widget.leftDragger.style.display = "none";
                 widget.details.style.left = (loc.x + _src.clientWidth - 15)  + "px";
             }

             widget.detailsContainerShadow.style.height = widget.detailsContainer.clientHeight + "px";
        }
    }

    function selectCell(e) {
        if (allowDateSelection === false) {
            return;
        }
        var _src;
        if (e && e.target) {
            _src = e.target; 
        } else if (window.event) {
            _src = window.event.srcElement;
        }
        return selectDateCell(_src, e);
    }

    function selectDateCell(_src, _e) {
        if (_src.className == "jmk-calendar-cell-date") {
            _src = _src.parentNode;
        }
        // check that we can select this cell (against the minimum selectable date)
        if (minimumSelectableDate !== null && _src.date) {
            var cellDate = new Date();
            cellDate.setMonth(_src.date.month);
            cellDate.setDate(_src.date.day);
            cellDate.setFullYear(_src.date.year);
            // do not allow selection of dates that are less than the minimum selectable date
            if (cellDate.getTime() <  minimumSelectableDate.getTime() ) {
                return;
            }
        }
        if (widget.selected) {
            if (widget.selected.className == "jmk-calendar-cell today-selected") {
                widget.selected.className = "jmk-calendar-cell today";
            } else {
                widget.selected.className = "jmk-calendar-cell";
            };
        }
        if (_src.className == "jmk-calendar-cell" || _src.className == "jmk-calendar-cell today") {
            widget.selected = _src;
            if (_src.className == "jmk-calendar-cell today") {
                widget.selected.className = "jmk-calendar-cell today-selected";
            } else {
                widget.selected.className = "jmk-calendar-cell-selected";
            }
            widgets.publish(widget.publish + "/onDateSelect", { widgetId : uuid, date : _src.date });
        }
        if (_e) {
            _e.preventDefault = true;
            if (_e.stopPropagation) {
                _e.stopPropagation();
            }
            _e.cancelBubble = true;
        }
        return false;
    }

    function initRender() {

        widget.container.innerHTML = "";
        widget.container.className = "jmk-calendar";

        var _title = document.createElement("div");

        widget.container.appendChild(_title);

        if (useShortNames) {
            _title.className = "jmk-calendar-header-month-small";
        } else {
            _title.className = "jmk-calendar-header-month";
        }

        var centerMeDiv = document.createElement("div");

        centerMeDiv.style.width = "100%";

        centerMeDiv.style.height = "2em";

        _title.appendChild(centerMeDiv);

        widget.titleDiv = document.createElement("div");

        widget.titleDiv .style.marginLeft = "auto";
        widget.titleDiv .style.marginRight = "auto";
        widget.titleDiv .style.height = "2em";
        centerMeDiv.appendChild(widget.titleDiv);
    
        widget.prev= document.createElement("div");
        widget.prev.className = "jmk-calendar-nav jmk-calendar-nav-left";

        var _prevLink = document.createElement("a");

        _prevLink.appendChild(document.createTextNode("<<"));
        _prevLink.onclick = widget.getPrevious;
        widget.prev.appendChild(_prevLink);

        widget.titleDiv.appendChild(widget.prev);

        widget.titleMidDiv = document.createElement("div");
        if (useShortNames === true) {
            widget.titleMidDiv .className = "jmk-calendar-title-mid-small";
        } else {
            widget.titleMidDiv .className = "jmk-calendar-title-mid";
        }

        widget.titleDiv.appendChild(widget.titleMidDiv);
        // need two divs for month and year
        
        widget.labelsDiv = document.createElement("div");
        if (useShortNames === false) {
            widget.labelsDiv.className = "jmk-calendar-title-labels";
        }
        widget.titleMidDiv.appendChild(widget.labelsDiv);

        widget.monthDiv = document.createElement("div");
        widget.monthDiv.className = "jmk-calendar-monthLabel";


        widget.labelsDiv.appendChild(widget.monthDiv);

        var myspacer = document.createElement("div");
        myspacer.className = "jmk-calendar-monthYearSpacer";
        widget.labelsDiv.appendChild(myspacer);

        widget.yearDiv = document.createElement("div");
        widget.yearDiv.className = "jmk-calendar-yearLabel";
        widget.labelsDiv.appendChild(widget.yearDiv);

        var _next = document.createElement("div");

        var _nextLink = document.createElement("a");
        _nextLink.appendChild(document.createTextNode(">>"));
        if (useShortNames === true) {
            _next.className = "jmk-calendar-nav jmk-calendar-nav-right-small";
        } else {
            _next.className = "jmk-calendar-nav jmk-calendar-nav-right";
        }
        _nextLink.onclick = widget.getNext;
        _next.appendChild(_nextLink);
        widget.titleDiv.appendChild(_next);
        if (useShortNames === false) {
            widget.todayDiv = document.createElement("div");
            widget.todayLink= document.createElement("a");
            widget.todayDiv.appendChild(widget.todayLink);
            widget.todayDiv.className = "jmk-calendar-header-today";
            widget.todayLink.innerHTML = "Show Today";
            widget.titleDiv.appendChild(widget.todayDiv);
            widget.todayLink.onclick = widget.showToday;
        }

        widget.table = document.createElement("table");

        widget.container.appendChild(widget.table);
        if (useShortNames === false) {
            widget.monthWidget =  new widgets.HoverCombobox ( uuid + "_month",{
                target : widget.monthDiv,
                menuHeight : 150,
                widgetDir : args.widgetDir,
                value :  widget.months
    
            });
        }
        if (useShortNames === false) {
            widget.yearWidget =  new widgets.HoverCombobox( uuid + "_year", {
                target : widget.yearDiv,
                menuHeight : 150,
                widgetDir : args.widgetDir,
                value :  widget.years
            });
    
            initYearAndMonthWidgetSizes(); 
        }
        widget.tableBody = document.createElement("TBody");
        widget.table.appendChild(widget.tableBody);

        // show the current date
        if (useShortNames === true) {
            widget.labelsDiv.innerHTML = widget.months[startMonth].label + "&nbsp;" + startYear;
        } else {
            widget.selectMonth(startMonth);
            widget.selectYear(startYear);
        }
    }

    function getRowCount () {
        if (widget.tableBody === null) {
            return 0;
        }
        if (widgets.MSIE) {
            return widget.tableBody.rows.length;
        } else {
            return widget.tableBody.childNodes.length;
        }
    }

    function clearRows() {
        var _rc = getRowCount();
        for (var _ri=_rc-1; _ri >= 0; _ri-=1) {
            if (widgets.MSIE) {
                widget.tableBody.deleteRow(_ri);
            } else {
                widget.tableBody.removeChild(widget.tableBody.childNodes[_ri]);
            }
        }
        widget.tableRows = [];
    }

    this.render = function(hideDetailsWindow) {
        if (widget.table === null) {
            initRender();
        }
        clearRows();

        var _fd = getFirstDay(startMonth, startYear);
        var _days = getNumberOfDays(startMonth, startYear);
        var _index = 1;
        
        widget.eventNodeMappings.clear();
        
        var today = new Date();
        var todayString = today.getFullYear() + "_" + today.getMonth() + "_" + today.getDate();
        
        if (hideDetailsWindow !== false) {
            hideDetails();
        }
        widget.selected = null;

        var _header = addRow(widget.tableBody);
        widget.tableRows.push(_header);

        for (var j=0; j < 7; j+=1) {
            var _c = addCell(_header);
            _c.className = "jmk-calendar-header-cell";
            _header.appendChild(_c);
            _c.innerHTML = widget.days[j];
        }

        for (var i=0; i < 6; i+=1) {
            var _row = addRow(widget.tableBody);
            widget.tableRows.push(_row);
            for (var ii=0; ii < 7; ii+=1) {
                var _cell = addCell(_row);
                if (i === 0 && ii < _fd ||
                    _index > _days) {
                    _cell.className = "jmk-calendar-cell-disabled";
                } else {
                    _cell.className = "jmk-calendar-cell";
                    var _eid = startYear + "_" +
                               startMonth + "_" +
                               _index;
                    if (todayString == _eid) {
                        _cell.className += " today";
                    }
                    _cell.id = uuid + "_" + _eid;
                    _cell.date = { id : _eid, month : startMonth, day : _index, year : startYear};
                    var _date = document.createElement("div");
                    _date.innerHTML = _index;
                    _index += 1;
                    _date.className = "jmk-calendar-cell-date";
                    _date.onclick = selectCell;
                    if (useShortNames) {
                        _date.style.cursor = "pointer";
                        _cell.style.cursor = "pointer";
                    }
                    _cell.appendChild(_date);
                    _cell.ondblclick = addEvent;
                    _cell.onclick = selectCell;
                    var events = widget.events.get(_eid);
                    if (events) {
                        for (var k=0; k < events.length; k+=1) {
                            addEventNode(events[k],_cell,k);
                        }
                    }
                }
            }
        }

    };

    // listen for events from the month / year widgets
    widgets.subscribe("/widgets/hoverCombobox/*", function(args) {
        var year = widget.yearWidget.getValue();
        var month = widget.monthWidget.getValue();
        
        if (month !== null) {
            widget.selectMonth(month.value);
        }
        if (year !== null) {
            widget.selectYear(year.value);
        }
        widget.render();
    });

   function initYearAndMonthWidgetSizes() {
          // get the full width of the title bar which is << + monthWidget + yearWidget + >>
       var navWidth = widget.prev.clientWidth * 2;
       var _w =  (widget.yearWidget.maxWidth + widget.monthWidget.maxWidth);
       var _mw =  (widget.yearWidget.width + widget.monthWidget.width);
       widget.labelsDiv.style.width = (_mw + 40) + "px";
       widget.titleMidDiv.style.width = (_w + 40) + "px";
       // get todayWith
       var tdw = widget.todayDiv.clientWidth;
       widget.titleDiv.style.width = (navWidth + _w + 70 + tdw) + "px";
   }

    function resizeMonthWidgets() {
        var _w =  (widget.yearWidget.width + widget.monthWidget.width + 34);
        widget.labelsDiv.style.width = _w + "px";
    }

    this.getValue = function() {
        var _data = [];
        var keys = widget.events.keys();
        for (var i=0;i < keys.length;i+=1) {
            _data.push( widget.events.get(keys[i]) );
        }
        return { events : _data }; 
    };

    this.setValue = function(_val) {
        widget.events.clear();
        widget.eventTypeBuckets.clear();
        widget.eventMappings.clear();
        widget.addEvents(_val, true);
    };

    this.addEvents = function(_val, _hideDetailsWindow) {
        var hideDetailsWindow = false;
        if (typeof _hideDetailsWindow != 'undefined') {
            hideDetailsWindow = _hideDetailsWindow;
        }
        var _requiresRender = false;
        if (_val) {
            var currentDay = null;

            for (var i=0; i < _val.length;i+=1) {
                if (_val[i].eventType) {
                    var bucket = widget.eventTypeBuckets.get(_val[i].eventType);
                    if (bucket == undefined) {
                        bucket = [];
                        widget.eventTypeBuckets.put(_val[i].eventType, bucket);
                    }
                    bucket.push(_val[i]);
                }

                var date = new Date(_val[i].timestamp);
                if (date.getMonth() === startMonth) {
                    _requiresRender = true;
                }
                var endDate = null;

                if (_val[i].endTimestamp != -1) {
                    endDate = new Date(_val[i].endTimestamp);
                }

                if (endDate) {

                    // render if the extended event starts in or before the current month
                    // and ends after or in the current month
                    if (date.getMonth() <= startMonth &&
                         endDate.getMonth() >= startMonth) {
                        _requiresRender = true;
                    } 

                    var startTime = new Date(_val[i].timestamp);
                    // set to noon so we won't get thrown off by DST
                    startTime.setHours(12);

                    var endTime = new Date(_val[i].endTimestamp );
                    endTime.setHours(12);

                    // get the number of days between the two dates
                    // care must be given to leap year processing
                    var dayCount = (endTime.getTime() - startTime.getTime()) / ONE_DAY;
                    // round the days
                    dayCount = Math.round(dayCount);

                    var startMills = startTime.getTime();
                    for (var j=1;j <= dayCount ; j+=1) {

                         var ne = { eventType : _val[i].eventType,
                                    title : _val[i].title,
                                    description : _val[i].description
                                  };
                         ne.details = clone(_val[i].details);

                         var d = new Date(startMills + (j * ONE_DAY));
                         var did =  d.getFullYear() + "_" + d.getMonth() + "_" + d.getDate();
                         ne.title = "";

                         ne.id = did + "_" + _val[i].id + "_" + j;
                         ne.uuid = ne.id;
                         ne.date = {  id : did, month: d.getMonth(),
                                      day : d.getDate(),
                                      year : d.getFullYear()
                                   };
                         var devents = widget.events.get(did);
                         if (!devents) {
                             devents = [];
                             widget.events.put(did, devents);
                             devents.push(ne);
                        } else {
                             // add the event to the first position
                             devents.splice(0,0, ne);
                        }
                        widget.eventMappings.put(ne.id, ne);
                    }

                } else {
                    var dayId =  date.getFullYear() + "_" + date.getMonth() + "_" + date.getDate();
                    var events  = widget.events.get(dayId); 
                    if (!events) {
                         events = [];
                         widget.events.put(dayId, events);
                    }
                    _val[i].uuid = dayId + "_" + _val[i].id;
                    _val[i].date = { id : dayId,
                                    month: date.getMonth(),
                                    day : date.getDate(),
                                    year : date.getFullYear()
                                   };
                    events.push(_val[i]);
                    widget.eventMappings.put(_val[i].id, _val[i]);
                }
                currentDay = date;
            }
        } else {
            // render forever events
            if (date.getMonth() <= startMonth ) {
                   _requiresRender = true;
            }
        }
        if (_requiresRender === true) {
            widget.render(hideDetailsWindow);
        }
    };

    function doSubscribe(topic, handler) {
        var i = widgets.subscribe(topic, handler);
        widget.subs.push(i);
    }

    this.enableDateSelection = function(_allowDateSelection) {
        allowDateSelection = _allowDateSelection;
    };

    this.setMinimalSelectableDate = function(date) {
        minimumSelectableDate = date;
    };

    this.setEnabled = function(enabled) {
        if (!widget.blocker) {
            widget.blocker = document.createElement("div");
            widget.blocker.className = "jmk-calendar-blocker";
            widget.container.appendChild(widget.blocker);
        }
        widget.blocker.style.display = (enabled === true) ? "none" : "block";
    };

    this.postLoad = function() {

        widget.eventMappings = new Map();

        if ( args ) {
            if ( args.publish ) {
                widget.publish = args.publish;
            } 
            if ( args.publishSubtype ) {
                publishSubtype = args.publishSubtype;
            }
            if ( args.useShortNames === true ) {
                useShortNames = true;
                widget.days = widget.shortDays;
            }
            if (typeof args.allowDateSelection == "boolean" ) {
                allowDateSelection = args.allowDateSelection;
            }
            if ( args.minimumSelectableDate ) {
                minimumSelectableDate = args.minimumSelectableDate;
            }
            if ( args.subscribe ){
                if (typeof args.subscribe == "string") {
                    widget.subscribe = [];
                    widget.subscribe.push( args.subscribe);
                } else {
                    widget.subscribe = args.subscribe;
                }
            }
            if (args.value) {
                for (var i=0; i < args.value.length;i+=1) {
                    widget.events.put( args.value[i].id, args.value[i].value );
                }
            }
        }

        widget.subs = [];
        for (var _i=0; _i < widget.subscribe.length; _i+=1) {
            doSubscribe( widget.subscribe[_i]  + "/select", widget.select );
        }

       widget.render();
    };
    widget.postLoad();
};

widgets.HoverCombobox = function( uuid, args) {

    var widget = this;
    var model = args.value;
    var container;
    var menu;
    var itemMappings = {};
    var publish = args.publish || "/widgets/hoverCombobox";
    var counter = 0;
    var button;
    var image;
    var labelNode;
    var displayHint = false;
    var menuVisible = false;
    widget.width = 0;
    var currentValue = null;
    var menuHeight;
    var displaySelectedLabel = true;

    function getTextDimensions(text, styles) {
        var e = document.createElement("div");
        e.innerHTML = text;
        if (styles) {
            for (var i in styles) {
                if (i == 'className') {
                    e.className = styles[i];

                } else if (styles.hasOwnProperty(i)) {
                    e.style[i] = styles[i]; 
                }
            }
        }

        e.style.position = "absolute";
        e.style.top = "-500px";
        document.body.appendChild(e);
        var tdim = { width: e.clientWidth, height : e.clientHeight };
        document.body.removeChild(e);
        return tdim;
    }

    function genId() {
        return uuid + "_item_" + (counter+=1);
    }

    this.getValue = function() {
        return currentValue;
    };

    this.setValue = function(_val) {

        for (var i=0; i < model.length;i+=1) {
            if (model[i].value == _val.label &&
                model[i].label == _val.label) {
                currentValue = _val;
            }
        }
        labelNode.innerHTML = _val.label;
        currentValue = _val;
        resize();
    };

    function addClass(node, style) {
        if (/style/.test(node.className)) {
             // return because we have it
        } else {
             node.className += " " + style;
        }
    }

    function removeClass(node, style) {
        var t = new RegExp(style);
        if (t.test(node.className)) {
            var nClasses = [];
            if (node.className != style) {
                var classes = node.className.split(" ");
                for (var i=0; i < classes.length; i+=1) {
                    if (classes[i] === style) {
                        continue;
                    } else {
                        nClasses.push(classes[i]);
                    }
                }
            }
            node.className = nClasses.join(" ");
        } else {
            return; // don't have it
        }
    }

    function hover() {
        addClass(container, "icombobox-hover");
        if (displayHint === false) {
             button.style.display = "block";
        }
       if (window.event) {
          window.event.returnValue = false;
      }
      return false;
    }

    function unhover() {
        if (menuVisible === true) {
            return;
        }
        removeClass(container, "icombobox-hover");
        image.src = args.widgetDir + "images/hover-button.png";
        button.style.background = "#FFF";
    }

    function buttonHover() {
        image.src = args.widgetDir + "images/hover-button-selected.png"; 
        button.style.background = "#DAF0FF";

    }

    function buttonUnhover() {
        image.src = args.widgetDir + "images/hover-button.png";
        button.style.background = "#FFF";

    }

    function selectItem(ev) {
        var e = window.event || ev; 
        var target = e.target || e.srcElement;
        var _item = itemMappings[target.itemId];
     
        for (var i=0; i < model.length;i+=1) {
            model[i].selected = false;
        }    
        if (_item) {
            _item.selected = true;
            currentValue = _item;
            if (displaySelectedLabel) {
                labelNode.innerHTML = _item.label;
                resize();
            }
            widgets.publish({
                    topic : publish + "/onSelect",
                    widgetId : uuid,
                    type : "onSelect",
                    action : _item.action,
                    targetId : _item.id,
                    value : _item
                });
        } else {
            currentValue = null;
        }

        hideMenu();
        unhover();
    }

    function hideMenu() {
        menu.style.display = "none";
        menuVisible = false;
    }

    function showMenu() {
        positionMenu();
        menu.style.display = "inline";
        menuVisible = true;
    }

    function click() {
        // toggle the menu
        if (menu.style.display == "none") {
            showMenu();
        } else {
            hideMenu();
        }
    }

    function bindEvent(target, type, handler) {
         if (typeof target.addEventListener == "function"){
            target.addEventListener(type, handler, false);

        // attach for IE
        } else if (target.attachEvent) {
            target.attachEvent("on" + type, handler);
        }
    }

    function positionMenu() {
        var height = labelNode.clientHeight;
        var pos = widgets.getPosition(container);
        menu.style.top  = (pos.y + height + 4) + "px";
        menu.style.left = (pos.x + 2) + "px";
    }

    function resize() {

        if (widget.width === 0) {
            widget.width = labelNode.clientWidth + 20;
        } else {
              // take into account sizing for 
            widget.width = labelNode.clientWidth + 20;
        }
        container.style.width = widget.width + "px";
        menu.style.width = (widget.width -2 ) + "px";

    }

    function init() {

        if ( args) {
            if ( args.menuHeight) {
                menuHeight = args.menuHeight;
            }
            if (typeof args.displaySelectedLabel == "boolean") {
                displaySelectedLabel = args.displaySelectedLabel;
            }
        }

        labelNode = args.target || document.getElementById(uuid);
        labelNode.style.padding = "0px";
        container = document.createElement("div");
        labelNode.parentNode.replaceChild(container,labelNode);

        // now add the node to our container
        container.appendChild(labelNode);

        addClass(labelNode, "icombobox-text");
        addClass(container,"icombobox");

        button = document.createElement("div");
        button.className = "icombobox-button";

        container.appendChild(button);
        image = document.createElement("img");
        image.src = args.widgetDir + "images/hover-button.png";
        addClass(image, "icombobox-button-img");
        button.appendChild(image);

        menu = document.createElement("ul");
        menu.className = "icombobox-menu";
        if (menuHeight) {
            menu.style.height = menuHeight + "px";
        }
        menu.style.display = "none";
        document.body.appendChild(menu);

        var longestItem = "";

        for (var i=0;i < model.length;i+=1 ) {
            var option = document.createElement("li");
            if (!model[i].id) {
                model[i].id = genId();
            }
            if (model[i].label.length > longestItem.length) {
                longestItem = model[i].label;
            }
            itemMappings[model[i].id] = model[i];
            option.itemId = model[i].id;
            var a = document.createElement("a");
            a.innerHTML = model[i].label;
            a.href = "javascript:void(0)";
            a.itemId =  model[i].id;
            option.appendChild(a);
            a.onclick = selectItem;
            option.value = model[i].value;
            if (model[i].selected === true) {
                currentValue = model[i];
            }

          menu.appendChild(option);

        }
         // set max width based on 2.2 em and extra button
        widget.maxWidth = getTextDimensions(longestItem, { "fontSize" : "2.2em" }).width + 30;

        bindEvent(container, "mouseover", hover);
        bindEvent(container, "mouseout", unhover);
        bindEvent(button, "click", click);
        bindEvent(button, "mouseover", buttonHover);
        bindEvent(button, "mouseout", buttonUnhover); 

    }

    init();
    resize();
};
