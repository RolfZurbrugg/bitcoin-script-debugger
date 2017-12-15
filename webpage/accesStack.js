var bitcore = require('bitcore-lib');

window.stackArray = new Array();
var count = 0;


(function (interpreter) {

    bitcore.Script.Interpreter.prototype.step = function () {
        var bool = interpreter.call(this);

        bitcore.Script.Interpreter.prototype.printStack(this);

        return bool;
    };

    bitcore.Script.Interpreter.prototype.printStack = function (_this) {
        here = Object.assign(this, _this);
        var fRequireMinimal = (here.flags & bitcore.Script.Interpreter.SCRIPT_VERIFY_MINIMALDATA) !== 0;

        // Read instruction
        var pc = here.pc -1;
        console.log(pc);
        var chunk = here.script.chunks[pc];
        //here.pc++;
        //console.log(chunk)
        var opcodenum = chunk.opcodenum;

        var op_code = getKeyByValue(bitcore.Opcode.map, opcodenum);

        stackArray[count] = new Array();
        stackArray[count][0] = op_code;
        window.stack_trace += 'Opcodenum: ' + op_code + '\n';

        //console.log(here);

        //added by rolf
        window.stack_trace += '\n' + '--------- start of stack --------' + '\n';
        console.log('--------- start of stack --------');
        //bitcore.crypto.BN.fromScriptNumBuffer(here.stack[here.stack.length - 1], fRequireMinimal); //todo, can this line be removed? until now ther seems to be no impact
        // console.log(Object.assign({},this));
        var size = here.stack[0].length;
        if (size < 4){size = 4;} //default value of size is 4, see function BN.fromScriptNumBuffer from bitcore-lib
        for (var i = 0; i < here.stack.length; i++) {
            // console.log('here');
            var bn = bitcore.crypto.BN.fromScriptNumBuffer(here.stack[i], fRequireMinimal, size);
            //console.log(bn);
            window.stack_trace += 'Stack element[' + i + '] = ' + bn.words[0] + '\n';
            console.log('Stack element[' + i + '] = ' + bn.words[0]);
            stackArray[count][i+1] = bn.words[0];
        }
        window.stack_trace += '--------- end of stack --------' + '\n\n';
        console.log('--------- end of stack --------');
        // console.log(this);
        count++;
    }

    /**
     * This function maps the integer representation of op_codes to a string representation (for example the integer 172 is maped to the string OP_CHECKSIG)
     * @param map takes bitcore.Opcode.map as a map of op_codes
     * @param value integer representation of the op_code number
     * @returns {string} returns a string representation of the op_code corresponding to its value (integer) representation.
     */
    var getKeyByValue = function( map, value ) {
        for( var prop in map ) {
            if( map.hasOwnProperty( prop ) ) {
                if( map[ prop ] === value )
                    return prop;
            }
        }
    }

    window.resetCount = function () {
        count =0;
    }



}(bitcore.Script.Interpreter.prototype.step));