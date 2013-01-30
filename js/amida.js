/**
 * Amida class
 * あみだくじ
 */

// Global Object
var Amida = function(ent_count, step_count){

	var _data = [];
	var _ent_count = 0;
	var _step_count = 0;

	this.getStepCount = function(){
		return _step_count;
	};

	var init = function(ent_count, step_count){
		var r, c;
		_ent_count = ent_count;
		_step_count = step_count;
		_data = [];
		for ( r = 0; r < step_count; ++r ){
			_data[r] = [];
			for ( c = 0; c < ent_count + 1; ++c ){ // c === 0, ent_count は番兵
				_data[r][c] = false;
			}
		}
	};

	// 単純な方法 格段一箇所のみ横棒を作成
	var lot_simple = function(){
		var r, c;
		for ( r = 0; r < _step_count; ++r ){
			c = Math.floor( Math.random() * (_ent_count - 1) ) + 1;
			_data[r][c] = true;
		}
	};

	var lot = function(){
		var r, c;
		for ( r = 0; r < _step_count; ++r ){
			for ( c = 1; c < _ent_count; ++c ) {
				if ( _data[r][c-1] ){ // 直左に横棒があれば作成しない
					continue;
				}
				if ( r > 0 && _data[r-1][c] ){ // 直上に横棒があれば作成しない
					continue;
				}
				if ( Math.floor( Math.random() * 2) === 0 ) { // 1/2の確率で横棒作成
					_data[r][c] = true;
				}
			}
		}
	};

	this.isLadder = function(r, c){
		return ( r < _step_count && c < _ent_count )? _data[r][c+1] : false;
	};

	this.draw = function(start, draw_func){
		var data = _data;
		var pos = start + 1;
		var r;
		for ( r = 0; r < _step_count; ++r ){
			var f = pos;
			if ( data[r][pos-1] ){
				--pos;
			}
			else if ( data[r][pos] ){
				++pos;
			}
			var t = pos;
			draw_func(r, f-1, t-1);
		}
		return pos - 1;
	};

	init(ent_count, step_count)
	lot();
};
