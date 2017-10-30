var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');
console.log('app.js active');
//var buf =



var script = bitcore.Script()
    .add('OP_IF')                       // add an opcode by name
    .prepend(114)                       // add OP_2SWAP by code
    .add(bitcore.Opcode.OP_NOT)                 // add an opcode object
    .add(new bitcore.deps.Buffer('bacacafe', 'hex')) // add a data buffer (will append the size of the push operation first)

var test = bitcore.utils.assert(script.toString() === 'OP_2SWAP OP_IF OP_NOT 4 0xbacacafe');

console.log(test);

