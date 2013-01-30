/**
 * あみだくじGUI
 */

$(function(){

	var AMIDA_STEP = 20;
	var AMIDA_FOOT = 5;

	var g_amida = null;

	/**
	 * Entry
	 */

	$("#btn_entry").click(function(){
		on_btn_entry();
	});

	$("#text_entry").keydown(function(e){
		if ( e.keyCode === 13 ){
			on_btn_entry();
		}
	});

	var on_btn_entry = function(){
		var text = $("#text_entry").val();
		if ( text !== "" ){
			append_option(text);
			$("#text_entry").select().focus();
		}
	};

	var append_option = function(text){
		var opt = $("<option>" + text + "</option>")
		$("#sel_entry").append(opt);
		refresh_count();
	};

	$("#btn_remove").click(function(){
		var opts = $("#sel_entry > option");
		for ( var i = opts.length - 1; i >= 0; --i ){
			if ( opts[i].selected ){
				opts[i].remove();
			}
		}
		refresh_count();
	});

	$("#btn_clear").click(function(){
		$("#sel_entry").html("");
		refresh_count();
	});

	var refresh_count = function(){
		$("#alter_count").html($("#sel_entry > option").length);
	};

	/**
	 * Make
	 */

	var COOKIEENTRY = "AMIDAENTRY=";

	$("#btn_make").click(function(){
		var entries = get_entries();
		if ( entries.length >= 2 ){
			var nextYear = new Date();
			nextYear.setFullYear(nextYear.getFullYear() + 1);
			document.cookie = COOKIEENTRY + encodeURIComponent(entries.join(",")) + "; expires=" + nextYear.toGMTString();
			make_amida();
		}
	});

	var load_entries = function(){
		var cookiestr = document.cookie;
		var pos = cookiestr.indexOf(COOKIEENTRY);
		if ( pos === -1 ) return false;

		pos += COOKIEENTRY.length;
		var end = cookiestr.indexOf(";", pos);
		if ( end === -1 ) end = cookiestr.length;
		var entstr = decodeURIComponent(cookiestr.substring(pos, end));
		if ( entstr === "" ) return false;

		var entries = entstr.split(",");
		on_btn_clear();
		var i, len = entries.length;
		for ( i = 0; i < len; ++i ){
			append_option(entries[i]);
		}
		return ( len >= 2 );
	};

	var make_amida = function(){
		var entries = get_entries();
		var len = entries.length;
		if ( len >= 2 ){
			randomize_array(entries);
			make_amida_head(len);
			make_amida_foot(entries);
			g_amida = new Amida(len, AMIDA_STEP);
			make_amida_body(entries);
		}
	};

	var randomize_array = function(arr){
		for ( var i = arr.length-1; i > 0; --i ){
			var p = Math.floor( Math.random() * (i+1) );
			if ( p != i ){
				var t = arr[i];
				arr[i] = arr[p];
				arr[p] = t;
			}
		}
	};

	var get_entries = function(){
		var opts = $("#sel_entry > option");
		var entries = [];
		for ( var i = 0, len = opts.length; i < len; ++i ){
			if ( opts[i].text ) entries.push( opts[i].text );
		}
		return entries;
	};

	var make_amida_head = function(num){
		var tr = '<tr>';
		for ( var c = 0; c < num; ++c ){
			tr += '<th>';
			tr += '<input type="text" class="player"/>';
			tr += '<div><input type="button" value="Go" idnum="' + c + '" /></div>';
			tr += '</th>';
		}
		tr += '</tr>';
		$("#amida_head").html(tr);
		$("#amida_head input:button").click(function(){
			on_click_go($(this));
		});
	};

	var make_amida_foot = function(entries){
		var tr = '<tr>';
		for ( var c = 0, len = entries.length; c < len; ++c ){
			tr += '<th>' + entries[c] + '</th>';
		}
		tr += '</tr>';
		$("#amida_foot").html(tr);
	};

	var make_amida_body = function(entries){
		var step_count = g_amida.getStepCount();
		var r, row_len = step_count + AMIDA_FOOT;
		var c, col_len = entries.length;
		var tr = '';
		for ( r = 0; r < row_len; ++r ){
			tr += '<tr>';
			for ( c = 0; c < col_len; ++c ){
				if ( g_amida.isLadder(r, c) ){
					tr += '<td class="pole bordered"> </td>';
				} else {
					tr += '<td class="pole"> </td>';
				}
			}
			tr += '</tr>';
		}
		$("#amida_body").html(tr);
	};

	var on_click_go = function(btn){
		var inps = $("#amida_head input:text");
		var id = Number(btn.attr('idnum'));
		var inp = $(inps[id]);
		if ( inp.val() === "" ){
			inp.val("Pelayer" + (id + 1));
		}
		clear_lot_line();
		draw_lot_line(id, inp.val());
	};

	var clear_lot_line = function(){
		var tds = $("#amida_body td");
		for ( var i = 0, len = tds.length; i < len; ++i ){
			$(tds[i]).removeClass("rooting_l");
			$(tds[i]).removeClass("rooting_b");
		}
	};

	var draw_lot = function(r, f, t){
		var targ = get_target_cell(r, f);
		targ.addClass("rooting_l");
		if ( f < t ){
			targ.addClass("rooting_b");
		}
		else if ( f > t ){
			get_target_cell(r, t).addClass("rooting_b");
		}
	};

	var draw_lot_line = function(idnum, name){
		var result = g_amida.draw(idnum, draw_lot);
		var step_count = g_amida.getStepCount();
		var r, len = step_count + AMIDA_FOOT;
		for ( r = step_count; r < len; ++r ){
			get_target_cell(r, result).addClass("rooting_l");
		}
		var th = $("#amida_foot th:eq("+result+")").css("color", "black");
	};

	var get_target_cell = function(r, c){
		return $("#amida_body > tr:eq("+r+") > td:eq("+c+")");
	};

	/**
	 * Initialize
	 */

	$("#text_entry").focus();
	if ( load_entries() ) make_amida();

});
