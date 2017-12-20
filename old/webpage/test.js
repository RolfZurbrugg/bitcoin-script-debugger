var bitcore = require('bitcore-lib');
var Mnemonic = require('bitcore-mnemonic');

console.log('test.js active');



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


console.log('------------ parse script test --------------------');
var script_txt_input = 'OP_6 OP_DUP';
var script_txt_output = 'OP_ADD OP_12 OP_EQUAL';

var script_i = P$(script_txt_input);
var script_o = P$(script_txt_output);

var tst = bitcore.Script.Interpreter().verify(script_i, script_o);

console.log(tst);


//verify(script_simple_input,script_simple_output);


// ------------------------------ bitcore.utils.assert() -> assert() ------------------------------------

//this function stems from bitcore.utils but for some reason I cant access it here :/
function assert(cond, msg) {
    if (!cond)
        throw new Error(msg || 'Assertion failed');
}

/**

// ------------------------------ Interpreter.prototype.verify -> verify ------------------------------------

function verify(scriptSig, scriptPubkey, tx, nin, flags) {
    var Transaction = bitcore.Transaction;
    if (isUndefined(tx)) {
        tx = new Transaction();
    }
    if (isUndefined(nin)) {
        nin = 0;
    }
    if (isUndefined(flags)) {
        flags = 0;
    }
    this.set({
        script: scriptSig,
        tx: tx,
        nin: nin,
        flags: flags
    });
    var stackCopy;

    if ((flags & Interpreter.SCRIPT_VERIFY_SIGPUSHONLY) !== 0 && !scriptSig.isPushOnly()) {
        this.errstr = 'SCRIPT_ERR_SIG_PUSHONLY';
        return false;
    }

    // evaluate scriptSig
    if (!this.evaluate()) {
        return false;
    }

    if (flags & Interpreter.SCRIPT_VERIFY_P2SH) {
        stackCopy = this.stack.slice();
    }

    var stack = this.stack;
    this.initialize();
    this.set({
        script: scriptPubkey,
        stack: stack,
        tx: tx,
        nin: nin,
        flags: flags
    });

    // evaluate scriptPubkey
    if (!this.evaluate()) {
        return false;
    }

    if (this.stack.length === 0) {
        this.errstr = 'SCRIPT_ERR_EVAL_FALSE_NO_RESULT';
        return false;
    }

    var buf = this.stack[this.stack.length - 1];
    if (!Interpreter.castToBool(buf)) {
        this.errstr = 'SCRIPT_ERR_EVAL_FALSE_IN_STACK';
        return false;
    }

    // Additional validation for spend-to-script-hash transactions:
    if ((flags & Interpreter.SCRIPT_VERIFY_P2SH) && scriptPubkey.isScriptHashOut()) {
        // scriptSig must be literals-only or validation fails
        if (!scriptSig.isPushOnly()) {
            this.errstr = 'SCRIPT_ERR_SIG_PUSHONLY';
            return false;
        }

        // stackCopy cannot be empty here, because if it was the
        // P2SH  HASH <> EQUAL  scriptPubKey would be evaluated with
        // an empty stack and the EvalScript above would return false.
        if (stackCopy.length === 0) {
            throw new Error('internal error - stack copy empty');
        }

        var redeemScriptSerialized = stackCopy[stackCopy.length - 1];
        var redeemScript = Script.fromBuffer(redeemScriptSerialized);
        stackCopy.pop();

        this.initialize();
        this.set({
            script: redeemScript,
            stack: stackCopy,
            tx: tx,
            nin: nin,
            flags: flags
        });

        // evaluate redeemScript
        if (!this.evaluate()) {
            return false;
        }

        if (stackCopy.length === 0) {
            this.errstr = 'SCRIPT_ERR_EVAL_FALSE_NO_P2SH_STACK';
            return false;
        }

        if (!Interpreter.castToBool(stackCopy[stackCopy.length - 1])) {
            this.errstr = 'SCRIPT_ERR_EVAL_FALSE_IN_P2SH_STACK';
            return false;
        } else {
            return true;
        }
    }

    return true;
};


// ------------------------------ lodash/isUndefined.js -> isUndefined ------------------------------------
// this lodash function is need for the verify function imported above.

function isUndefined(value) {
    return value === undefined
}

*/