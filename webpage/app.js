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

console.log('I am stupid');

console.log(script);

//this function stems from bitcore.utils but for some reason I cant access it here :/
function assert(cond, msg) {
    if (!cond)
        throw new Error(msg || 'Assertion failed');
}


// Now lets see if we can get a script to evaluate 1 1 + -> 2
// Evaluates to true because 2 >= 1 ==> TRUE

var script_simple_add = bitcore.Script()
                            .add('OP_1')
                            .add('OP_1')
                            .add('OP_ADD');

var test_add = bitcore.Script.Interpreter().verify(script_simple_add);

console.log(test_add);

// Now lets see if we can get a script to evaluate 1 1 - -> 2
// Evaluates to true because 0 <= 1 ==> FALSE

var script_simple_add = bitcore.Script()
    .add('OP_1')
    .add('OP_1')
    .add('OP_SUB');

var test_sub = bitcore.Script.Interpreter().verify(script_simple_add);

console.log(test_sub);
