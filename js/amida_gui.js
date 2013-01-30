/**
 * あみだくじGUI
 */

(function(){

	var AMIDA_STEP = 20;
	var AMIDA_FOOT = 5;

	var g_amida = null;

	var $ = function(element){
		if (typeof element === 'string') element = document.getElementById(element);
		return element;
	};

	var addClassName = function(element /*, cname ...*/){
		var i, cname, len = arguments.length;
		if ( len < 2 ) return;
		for ( i = 1; i < len; ++i ){
			cname = arguments[i];
			if ( !isExistsClassName(element, cname) ){
				element.className += " " + cname;
			}
		}
	};

	var removeClassName = function(element /*, cname ...*/){
		var i, j, cname, cnames, new_cnames, len = arguments.length;
		if ( len < 2 ) return;
		cnames = element.className.split(" ");
		var cn_len = cnames.length;
		for ( i = 1; i < len; ++i ){
			cname = arguments[i];
			for ( j = 0; j < cn_len; ++j ){
				if ( cnames[j] === cname ){
					cnames[j] = "";
				}
			}
		}
		element.className = cnames.join(" ").replace(/ +/g, " ");
	};

	var isExistsClassName = function(element, cname){
		var cnames = element.className.split(" ");
		for ( var i = 0; i < cnames.length; ++i ){
			if ( cnames[i] === cname ){
				return true;
			}
		}
		return false;
	};

	var addListener = (function() {
		if ( window.addEventListener ) {
			return function(el, type, fn){ el.addEventListener(type, fn, false); };
		}
		else if ( window.attachEvent ) {
			return function(el, type, fn) {
				var f = function(){ fn.call(el, window.event); };
				el.attachEvent('on'+type, f);
			};
		}
		else {
			return function(el, type, fn){ el['on'+type] = fn; };
		}
	})();

	/**
	 * Entry
	 */

	var on_keydown = function(event){
		var e = event || window.event;
		if ( e.type === "keydown" && e.keyCode === 13 ){
			on_btn_entry();
		}
	};

	var on_btn_entry = function(){
		var text = $("text_entry").value;
		if ( text !== "" ){
			appendOption(text);
			var ent = $("text_entry");
			ent.select();
			ent.focus();
		}
	};

	var appendOption = function(text){
		var opt = document.createElement("option");
		opt.appendChild( document.createTextNode(text) );
		$("sel_entry").appendChild(opt);
		refreshCountDisp();
	};

	var on_btn_remove = function(){
		var opts = $("sel_entry").getElementsByTagName("option");
		var i;
		for ( i = opts.length - 1; i >= 0; --i ){
			if ( opts[i].selected ){
				$("sel_entry").removeChild(opts[i]);
			}
		}
		refreshCountDisp();
	};

	var on_btn_clear = function(){
		var opts = $("sel_entry").getElementsByTagName("option");
		while ( opts.length > 0 ){
			$("sel_entry").removeChild(opts[0]);
			opts.shift
		}
		refreshCountDisp();
	};

	var refreshCountDisp = function(){
		$("alter_count").innerHTML = $("sel_entry").getElementsByTagName("option").length;
	};

	/**
	 * Make
	 */

	var COOKIEENTRY = "AMIDAENTRY=";

	var on_btn_make = function(){
		var entries = getEntries();
		if ( entries.length >= 2 ){
			var nextYear = new Date();
			nextYear.setFullYear(nextYear.getFullYear() + 1);
			document.cookie = COOKIEENTRY + encodeURIComponent(entries.join(",")) + "; expires=" + nextYear.toGMTString();
			makeAmida();
		}
	};

	var loadEntries = function(){
		var cookiestr = document.cookie;
		var pos = cookiestr.indexOf(COOKIEENTRY);
		if ( pos === -1 ){
			return false;
		}
		pos += COOKIEENTRY.length;
		var end = cookiestr.indexOf(";", pos);
		if ( end === -1 ) end = cookiestr.length;
		var entstr = decodeURIComponent(cookiestr.substring(pos, end));
		if ( entstr === "" ){
			return false;
		}
		var entries = entstr.split(",");
		on_btn_clear();
		var i, len = entries.length;
		for ( i = 0; i < len; ++i ){
			appendOption(entries[i]);
		}
		return ( len >= 2 );
	};

	var makeAmida = function(){
		var entries = getEntries();
		var len = entries.length;
		if ( len >= 2 ){
			randomizeArray(entries);
			makeAmidaHead(len);
			makeAmidaFoot(entries);
			g_amida = new Amida(len, AMIDA_STEP);
			makeAmidaBody(entries);
		}
	};

	var randomizeArray = function(arr){
		var i, len = arr.length
		for ( i = 0; i < len - 1; ++i ){
			var p = Math.floor( Math.random() * (len-i) ) + i;
			var t = arr[i];
			arr[i] = arr[p];
			arr[p] = t;
		}
	};

	var getEntries = function(){
		var opts = $("sel_entry").getElementsByTagName("option");
		var entries = [];
		var i, len = opts.length;
		for ( i = 0; i < len; ++i ){
			if ( opts[i].text ) entries.push( opts[i].text );
		}
		return entries;
	};

	var makeAmidaHead = function(num){
		var thead = $("amida_head");
		removeAllChild(thead);
		var tr = document.createElement("tr");
		var c, inp, btn, btndiv, th;
		for ( var c = 0; c < num; ++c ){
			inp = document.createElement("input");
			inp.style.width = "80px";
			inp.type = "text";

			btn = document.createElement("input");
			btn.type = "button";
			btn.value = "Go";
			btn.idnum = c;
			btn.onclick = on_click_go;

			btndiv = document.createElement("div");
			btndiv.appendChild(btn);

			th = document.createElement("th");
			th.appendChild(btndiv);
			th.appendChild(inp);
			tr.appendChild(th);
		}
		thead.appendChild(tr);
	};

	var makeAmidaFoot = function(entries){
		var tfoot = $("amida_foot");
		removeAllChild(tfoot);
		var tr = document.createElement("tr");
		var c, len = entries.length;
		for ( c = 0; c < len; ++c ){
			var th = document.createElement("th");
			th.appendChild( document.createTextNode(entries[c]) );
			tr.appendChild(th);
		}
		tfoot.appendChild(tr);
	};

	var makeAmidaBody = function(entries){
		var tbody = $("amida_body");
		removeAllChild(tbody);

		var step_count = g_amida.getStepCount();
		var r, row_len = step_count + AMIDA_FOOT;
		var c, col_len = entries.length;
		var tr, td;
		for ( r = 0; r < row_len; ++r ){
			tr = document.createElement("tr");
			tbody.appendChild(tr);
			for ( c = 0; c < col_len; ++c ){
				td = document.createElement("td");
				td.appendChild( document.createTextNode(" ") );
				tr.appendChild(td);
				addClassName(td, "pole");
				if ( g_amida.isLadder(r, c) ){
					addClassName(td, "bordered");
				}
			}
		}
	};

	var removeAllChild = function(element){
		while ( element.childNodes.length ){
			element.removeChild( element.childNodes[0] );
		}
	};

	var on_click_go = function(e){
		var thead = $("amida_head");
		var inpNodes = thead.getElementsByTagName("input");
		var inps = [];
		var i, len = inpNodes.length;
		for ( i = 0; i < len; ++i ){
			if ( inpNodes[i].type === "text" ){
				inps.push( inpNodes[i] );
			}
		}

		if ( inps[this.idnum].value === "" ){
			inps[this.idnum].value = "Unknown" + (this.idnum + 1);
		}

		clearLotLine();
		drawLotLine(this.idnum, inps[this.idnum].value);
	};

	var clearLotLine = function(){
		var tds = $("amida_body").getElementsByTagName("td");
		var i, len = tds.length;
		for ( i = 0; i < len; ++i ){
			removeClassName(tds[i], "rooting_l", "rooting_b");
		}
	};

	var drawFunc = function(r, f, t){
		addClassName( getTargetCell(r, f), "rooting_l" );
		if ( f < t ){
			addClassName( getTargetCell(r, f), "rooting_b" );
		}
		else if ( f > t ){
			addClassName( getTargetCell(r, t), "rooting_b" );
		}
	};

	var drawLotLine = function(idnum, name){
		var result = g_amida.draw(idnum, drawFunc);
		var step_count = g_amida.getStepCount();
		var r, len = step_count + AMIDA_FOOT;
		for ( r = step_count; r < len; ++r ){
			addClassName( getTargetCell(r, result), "rooting_l" );
		}

		var th = $("amida_foot").getElementsByTagName("th")[result];
		th.style.color = "black";
	};

	var getTargetCell = function(r, c){
		var tr = $("amida_body").getElementsByTagName("tr")[r];
		return tr.getElementsByTagName("td")[c];
	};

	/**
	 * Initialize
	 */

	addListener( window, "load", function(){
		addListener( $("text_entry"), "keydown", on_keydown );
		addListener( $("btn_entry"), "click", on_btn_entry );
		addListener( $("btn_remove"), "click", on_btn_remove );
		addListener( $("btn_clear"), "click", on_btn_clear );
		addListener( $("btn_make"), "click", on_btn_make );
		$("text_entry").focus();
		if ( loadEntries() ) makeAmida();
	});

})();
