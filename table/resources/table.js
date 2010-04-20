window.table = function( uuid, args) {

    var className = "";
    var autowidth = false;

     var widget = this;
     // asc or desc

     widget.sorted = {
         column : 0,
         direction : 'asc'
     };

     this.model = {
         headers : [],
         rows : []
     };

     this.setSorted = function(_sorted) {
         widget.sorted = _sorted;
     };

     function init() {
         // get init params
         // for old stuff
         if (typeof args === 'string') {
             className = args;
         }
         // autogen an id if not provided.
         if (!uuid) {
             if (!window.uuidCounter) {
                 window.uuidCounter = 0;
             }
             uuid = "tablebuilder_" + (window.uuidCounter+=1);
         }
         if (!window.tableWidgets) {
             tableWidgets = {};
         }
         window.tableWidgets[uuid] = widget;
     }

     this.setHeaders = function(headers) {
         for (var i=0; i < headers.length; i+=1) {
             widget.addHeader(headers[i]);
         }
     };

     this.sorterDescending = function (a,b) {
         if (typeof a.cells[widget.sorted.column].sortKey !== 'undefined') {
             if (a.cells[widget.sorted.column].sortKey === b.cells[widget.sorted.column].sortKey) return 0;
             return (a.cells[widget.sorted.column].sortKey < b.cells[widget.sorted.column].sortKey) ? -1 : 1;
         } else {
             if ( a.cells[widget.sorted.column].content === b.cells[widget.sorted.column].content ) return 0;
             return (a.cells[widget.sorted.column].content < b.cells[widget.sorted.column].content) ? -1 : 1;
         }
     };

     this.sorterAscending = function (a,b) {
         if (typeof a.cells[widget.sorted.column].sortKey !== 'undefined') {
             if (a.cells[widget.sorted.column].sortKey === b.cells[widget.sorted.column].sortKey) return 0;
             return (a.cells[widget.sorted.column].sortKey > b.cells[widget.sorted.column].sortKey) ? -1 : 1;
         } else {
             if ( a.cells[widget.sorted.column].content === b.cells[widget.sorted.column].content) return 0;
             return ( a.cells[widget.sorted.column].content > b.cells[widget.sorted.column].content ) ? -1 : 1;
         }
     };


     this.addHeader = function(header) {
         if (typeof header === "string") {
             widget.model.headers.push({ label : header});
             if (header.width !== 'undefined') {
                 autowidth = false;
             }
         } else {
             widget.model.headers.push(header);
         }
     };

     this.addRawRow = function(row) {
         widget.model.rows.push({ raw : row});
     };

     this.setRows = function(lrows) {
         for (var r=0; r < lrows.length;r+=1) {
             widget.addRow(lrows[r]);
         }
     };

     this.sort = function(_row, _direction) {
         var sorter = widget.sorterAscending;
         if (_direction === "asc" ) {
             sorter = widget.sorterDescending;
         }
         widget.sorted.column = _row;
         if (widget.sorted.column !== null && typeof _direction === "undefined") {
             if (widget.sorted.column === _row) {
                 if (widget.sorted.direction === "asc") {
                     widget.model.rows.sort(widget.sorterDescending);
                     widget.sorted.direction = "desc";
                 } else {
                    widget.model.rows.sort(widget.sorterAscending);
                     widget.sorted.direction = "asc";
                 }
             }
         } else  {
            widget.model.rows.sort(sorter);
            if (_direction === "desc" ) {
                widget.sorted.direction = "desc";
            } else {
                widget.sorted.direction = "asc";
            }
         }
         widget.sorted.column = _row;
         widget.renderBody();
     };

     this.addRow = function(cells) {

         var _cells = [];
         for (var i=0; i < cells.length; i+=1) {
             if (cells[i] !== null &&
                 typeof cells[i] !== 'undefined' &&
                 typeof cells[i].content !== 'undefined') {
                 _cells.push(cells[i]);
             } else {
                 _cells.push({content : cells[i]});
             }
         }
         widget.model.rows.push({ cells : _cells});
     };

     this.addRowWithDetails = function(cells, rowId) {
         widget.model.rows.push({ cells : cells, id : rowId});
     };

     this.renderBody = function() {
         var tbody = document.getElementById(uuid + "_tbody");
         if (tbody) {
             tbody.innerHTML = renderRows();
         }
     };

     function renderRows() {
         var _rows = [];
         for (var r=0; r < widget.model.rows.length; r+=1) {
             var _row = widget.model.rows[r];
             // TODO : limit this in the code
             if (_row.raw) {
                 _rows.push(_row.raw);
                 continue;
             }
             var _cells = _row.cells;
             if (_row.id) {
                 rowId = _row.id;
             } else {
                 rowId = r;
             }
             var _rowtext= "<tr id='" + rowId + "'>";

             for (var i=0; i < _cells.length; i+= 1) {
                 var _w = '';
                 if (widget.model.headers[i] && typeof widget.model.headers[i].width !== "undefined") {
                     _w = " style='width:" + widget.model.headers[i].width + "'";
                     if (r % 2 === 0) {
                         _w += " class='oddItem'";
                     }
                 }

                 if (_cells[i].className) {
                     var _cNames = _cells[i].className;
                     if (r % 2 === 0) {
                         _cNames += " oddItem'";
                     }
                     _rowtext += "<td class='" + _cNames + "'"+ _w  +">";
                 } else {
                     _rowtext += "<td" + _w + ">";
                 }
                 if (_cells[i].content) {
                     _rowtext += _cells[i].content;
                 } else if (typeof _cells[i] === "string") {
                     _rowtext += _cells[i];
                 }
                 if (_cells[i].details) {
                     _rowtext += "<div id='" + rowId + "_cell_" + i + "_details' style='display:none'>" + _cells[i].details + "</div>";
                 }
                 _rowtext += "</div>";
             }
             _rowtext += "</tr>";
             _rows.push(_rowtext);
         }
         return _rows.join('');
     }

     this.toString = function() {

         var _headers = [];
         // render the headers
         for (var i=0; i < widget.model.headers.length; i+=1) {
             var header = widget.model.headers[i];
             var h = "<th";
             if (header.className) {
                 h += " class='" + header.className + "'";
             }
             // set the width
             if (autowidth === true) {
                 header.width = (100 / widget.model.headers.length) + "%";
             }
             if (header.width) {
                 h +=  " width='" + header.width + "'";
             }
             var _htext;
             if (header.sortable === true) {
                 _htext = "<a href='javascript:void(0)' onclick='tableWidgets[\"" + uuid + "\"].sort(" + i + ")'>" + header.label + "</a>";
             } else {
                 _htext = header.label;
             }
             h +=  (">" + _htext + "</th>");
             _headers.push(h);
         }

         var _text =  "<table id='" + uuid + "' class='" + className + "'>" +
             "<tr class='fixedHeader'>" + _headers.join("") + "</tr>" +
             "<tbody class='scrollContent' id='" + uuid + "_tbody'>" +
              renderRows()  +
              "</tbody> </table>";
         return _text;
     };

     init();
};