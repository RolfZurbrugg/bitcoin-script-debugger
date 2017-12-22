var bitcore = require('bitcore-lib');


var _countStackArray = 0; //the _countStackArray is needed in orded to fill the Parser.prototype.stackArray properly


(function (interpreter) {

    /**
     *
     * @param inputScript
     * @param outputScript
     * @param privateKey
     * @param signed {boolean} True = Signed, False = not Signed. Determines weather the user whants the transaction to be signed or not if transaction is not signed, no transaction needs to be created.
     * @returns {Array}
     */
    bitcore.Script.Interpreter.prototype.debug = function (inputScriptString, outputScriptString) {

        //reset _countStackArray to fill stack Array
        Parser.prototype.resetCount();

        //initialize stackArray
        Parser.prototype.stackArray = new Array();



        //convert the inputScript and outPutScript Strings to script objects
        var inputScript = P$(inputScriptString);
        var outputScript = P$(outputScriptString);


        //create utox
        // var utox = createUtox(outputScript, address); //the address to where the transaktion is sent, is not relevant for the debugging, as no follow up operations are performed on the completed transaction.

        //create transaction from utox
        // var transaction = P$.createTransactionFromUtox(utox, publicKey);

        //sign the transaction
        // var option = P$.getValueByKey('selectedSigType'); //selectedSigType stems from app.js -> function get sigType.
        // var signedTransaction = signTransaction(transaction, privateKey, option);

        //extract the inputScript containing the signature from the signedTransaction
        // var signedInputScript = bitcore.Script(signedTransaction.inputs[0]._script);

        //evaluate the scripts and the functions
        var nin = undefined;
        var result  = bitcore.Script.Interpreter().verify(inputScript, outputScript, P$.getValueByKey('tx'), nin,P$.getValueByKey('interpreterFlags') );
        console.log(_countStackArray);
        console.log(result);
        return Parser.prototype.stackArray;
    };






    /**
     *
     * @returns {*}
     */
    bitcore.Script.Interpreter.prototype.step = function () {
        var bool = interpreter.call(this);

        bitcore.Script.Interpreter.prototype.printStack(this);

        return bool;
    };

    /**
     *
     * @param _this
     */
    bitcore.Script.Interpreter.prototype.printStack = function (_this) {
        here = Object.assign(this, _this);
        var fRequireMinimal = (here.flags & bitcore.Script.Interpreter.SCRIPT_VERIFY_MINIMALDATA) !== 0;

        // Read instruction
        var _pc = here.pc -1; // the program counter needs to be decremented because the code from bitcore-lib has allready incremented their counter and my code gets executed after that.
        //console.log(_pc);
        var chunk = here.script.chunks[_pc];
        //here._pc++;
        //console.log(chunk)
        var opcodenum = chunk.opcodenum;

        var op_code = getKeyByValueOfOpCodes(opcodenum);
        console.log('OP_CODE: '+op_code);

        //extract and add the debug from the chunk and add the opcode to it
        var debug = chunk.debug;
        debug.opcode = op_code;


        Parser.prototype.stackArray[_countStackArray] = new Array();
        Parser.prototype.stackArray[_countStackArray][0] = debug;
        window.stack_trace += 'Opcodenum: ' + op_code + '\n';

        //console.log(here);

        //added by rolf
        window.stack_trace += '\n' + '--------- start of stack --------' + '\n';
        console.log('--------- start of stack --------');

        for (var i = 0; i < here.stack.length; i++) {
            // console.log('here');
            //var bn = bitcore.crypto.BN.fromScriptNumBuffer(here.stack[i], fRequireMinimal, here.stack[i].length);
            //console.log(here);
            window.stack_trace += 'Stack element[' + i + '] = ' + here.stack[i].toString('hex') + '\n';
            console.log('Stack element[' + i + '] = ' + here.stack[i].toString('hex'));
            Parser.prototype.stackArray[_countStackArray][i+1] = here.stack[i].toString('hex');
        }
        window.stack_trace += '--------- end of stack --------' + '\n\n';
        console.log('--------- end of stack --------');
        // console.log(this);
        _countStackArray++;
    };

    /**
     * This function maps the integer representation of op_codes to a string representation (for example the integer 172 is maped to the string OP_CHECKSIG)
     * @param map takes bitcore.Opcode.map as a map of op_codes
     * @param value integer representation of the op_code number
     * @returns {string} returns a string representation of the op_code corresponding to its value (integer) representation.
     */
    var getKeyByValueOfOpCodes = function( value ) {
        var map = bitcore.Opcode.map;
            for( var prop in map ) {
            if( map.hasOwnProperty( prop ) ) {
                if( map[ prop ] === value )
                    return prop;
            }
        }
        /*OP_CODE 1-75 are not defined. Opcode 1-75: The next opcode bytes is data to be pushed onto the stack.
        * insted of displaying 'undefined' as an opcode the actual number of the opcode is now displayed.*/
        return value;

    };

    /**
     *
     */
    Parser.prototype.resetCount = function () {
        _countStackArray =0;
    };

    /**
     *
     * @returns {number}
     */
    Parser.prototype.getCount = function (){
        return _countStackArray;
    }



}(bitcore.Script.Interpreter.prototype.step));