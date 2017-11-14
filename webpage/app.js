
var bitcore = require('bitcore-lib');


console.log('app.js ready');

function runScript(form){

    window.stack_trace = ''; //reset, clear value which will be filled in bitcore-lib.js on line 6205 and 7092

    var input_script_string = $("#is").val();
    var output_script_string = $("#os").val();

    var script_i = P$(input_script_string);
    var script_o = P$(output_script_string);


    var result = bitcore.Script.Interpreter().verify(script_i, script_o);

    window.stack_trace += '\n' + 'Result: ' + result;

    $('#stt').val(window.stack_trace);
}

function clearStack(form){
    $('#stt').val('');
}