var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
console.log('app.js active');



var script = bitcore.Script()
    .add('OP_IF')                       // add an opcode by name
    .prepend(114)                       // add OP_2SWAP by code
    .add(bitcore.Opcode.OP_NOT)                 // add an opcode object
    .add(new bitcore.deps.Buffer('bacacafe', 'hex')); // add a data buffer (will append the size of the push operation first)

try{
    assert(script.toString() === 'OP_2SWAP OP_IF OP_NOT 4 0xbacacafe');
}
catch (err){
    console.log(err);
}

/* This doesnt work but why?
try{
    bitcore.utils.assert(script.toString() === 'OP_2SWAP OP_IF OP_NOT 4 0xbacacafe');
}
catch (err){
    console.log(err);
}
*/



console.log(script);

var test_script = bitcore.Script.Interpreter().verify(script);

console.log('test script: '+test_script)

console.log('I am stupid');

//this function stems from bitcore.utils but for some reason I cant access it here :/
function assert(cond, msg) {
    if (!cond)
        throw new Error(msg || 'Assertion failed');
}


// Now lets see if we can get a script to evaluate 1 1 + -> 2
// Evaluates to true because 2 >= 1 ==> TRUE

console.log('----------- create simple add script ----------------');
var script_simple_add = bitcore.Script()
                            .add('OP_1')
                            .add('OP_3');
                           // .add('OP_ADD');

console.log('----------- evaluate simple add script ----------------');
var test_add = bitcore.Script.Interpreter().verify(script_simple_add);

console.log(test_add);

// Now lets see if we can get a script to evaluate 1 1 - -> 2
// Evaluates to true because 0 <= 1 ==> FALSE

console.log('----------- create simple sub script ----------------');
var script_simple_add = bitcore.Script()
    .add('OP_10')
    .add('OP_10')
    .add('OP_SUB');

console.log('----------- evaluate simple add script ----------------');
var test_sub = bitcore.Script.Interpreter().verify(script_simple_add);

console.log(test_sub);


//ToDo Bitcore-Lib.js lin 6116 iterates over the script



//buffer testing
console.log('\nBuffer testing');
var my_buf = new bitcore.deps.Buffer('bacacafe', 'hex');
console.log(my_buf);
console.log(my_buf.toString('hex'));


console.log('----------- create simple input script ----------------');

var script_simple_input = bitcore.Script()
    .add('OP_6')
    .add('OP_DUP');

console.log('----------- create simple output script ----------------');

var script_simple_output = bitcore.Script()
    .add('OP_ADD')
    .add('OP_12')
    .add('OP_EQUAL');

console.log('----------- evaluate simple script ----------------');
var test_io_script = bitcore.Script.Interpreter().verify(script_simple_input,script_simple_output);

console.log('\n'+test_io_script);
