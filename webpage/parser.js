/**
 *
 *
 */

var bitcore = require('bitcore-lib');

(function (global) {
    
    var Parser = function (script_text) {
        return new Parser.init(script_text);
    }

    Parser.init = function (script_text) {

        var opcode_arr = script_text.split(/\s+|\r+/);

        var script = bitcore.Script();

        for(var i=0; i<opcode_arr.length; i++){
            script.add(opcode_arr[i]);
        }

        console.log(script);
        return script;


    }


    Parser.init.prototype = Parser.prototype;

    global.Parser = global.P$ = Parser;


}(window));