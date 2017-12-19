var bitcore = require('bitcore-lib');


var count = 0; //the count is needed in orded to fill the Parser.prototype.stackArray properly


(function (interpreter) {

    /**
     *
     * @param inputScript
     * @param outputScript
     * @param privateKey
     * @param signed {boolean} True = Signed, False = not Signed. Determines weather the user whants the transaction to be signed or not if transaction is not signed, no transaction needs to be created.
     * @returns {Array}
     */
    bitcore.Script.Interpreter.prototype.debug = function (inputScriptString, outputScriptString, privateKey, signed) {

        //if signed is undefined the default value of false should be used.
        signed = signed || false;

        //reset count to fill stack Array
        bitcore.Script.Interpreter.prototype.resetCount(); //todo move this some where else

        //initialize stackArray
        Parser.prototype.stackArray = new Array();

        //convert the private key into a public key and address
        var publicKey = new bitcore.PublicKey.fromPrivateKey(privateKey);
        var address = publicKey.toAddress();



        // check whether the transaction was signed or not. If the transaction was not signed no transaction needs to be created
        if (!signed){
            //convert the inputScript and outPutScript Strings to script objects
            var inputScript = P$(inputScriptString);
            var outputScript = P$(outputScriptString);
            // transaction is not signed no transaction needs to be created.
            var result = bitcore.Script.Interpreter().verify(inputScript,outputScript);
            //todo apend result to end of stackArray
            return Parser.prototype.stackArray;
        }else{
            //todo remove this section
            // //create tx and add it to variableMap
            // var utox = P$.createUtox(P$(outputScriptString), publicKey);
            // var tx = P$.createTransactionFromUtox(utox, publicKey);
            // //P$.addKeyValuePair('tx', tx);
            //
            // //signe the transaction
            // P$.createSig(tx, privateKey, P$.getValueByKey('selectedSigType'));
        }

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
        var result  = bitcore.Script.Interpreter().verify(inputScript, outputScript, P$.getValueByKey('tx'));
        console.log(count);
        console.log(result);
        return Parser.prototype.stackArray;
    };

    // /**
    //  *
    //  * @param transaction
    //  * @param privateKey
    //  */
    // function signTransaction(transaction, privateKey, option){ //todo implement option properly
    //     option = option || bitcore.crypto.Signature.SIGHASH_ALL; // default is SIGHASH_ALL, other options include bitcore.Transaction.SIGHASH_NONE =1 todo list other defaults
    //     transaction.sign(privateKey, option);
    //     return transaction;
    // }


    // /**
    //  * ToDo this can be removed was moved to parser
    //  * This is a helper function, that creates a utox (unspent transaction output)
    //  * @param outputScript
    //  * @param toAddress
    //  * @returns {*}
    //  */
    // function createUtox(outputScript, toAddress){
    //
    //     //creating the data object in order to be able to create a utox
    //     var data = new Object(); // creating the data opbject to create an unspent tx
    //     data.txid ='00baf6626abc2df808da36a518c69f09b0d2ed0a79421ccfde4f559d2e42128b'; // {String} the previous transaction id
    //     //data.txId = '00baf6626abc2df808da36a518c69f09b0d2ed0a79421ccfde4f559d2e42128b'; // {String=} alias for 'txid'
    //     //data.vout = 0; // {number} the index in the transaction
    //     data.outputIndex = 0; // {number=} alias for 'vout'
    //     //data.scriptPubKey = outputScript; // {string|Script} the script that must be resolved to release the funds
    //     data.script = outputScript; // {string|Script=} alias for 'scriptPubKey' (Output Script)
    //     //data.amount = 1; // {number} amount of bitcoins associated
    //     data.satoshis =100000000; // {number=} alias for 'amount', but expressed in satoshis (1 BTC = 1e8 satoshis)
    //     //data.address = toAddress; // {sting | Address=} the associated address to the script, if provided.
    //
    //     var utox = bitcore.Transaction.UnspentOutput(data);
    //     return utox;
    // }


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
        var _pc = here.pc -1;
        //console.log(_pc);
        var chunk = here.script.chunks[_pc];
        //here._pc++;
        //console.log(chunk)
        var opcodenum = chunk.opcodenum;

        var op_code = getKeyByValue(bitcore.Opcode.map, opcodenum);
        console.log('OP_CODE: '+op_code)

        Parser.prototype.stackArray[count] = new Array();
        Parser.prototype.stackArray[count][0] = op_code;
        window.stack_trace += 'Opcodenum: ' + op_code + '\n';

        //console.log(here);

        //added by rolf
        window.stack_trace += '\n' + '--------- start of stack --------' + '\n';
        console.log('--------- start of stack --------');
        //bitcore.crypto.BN.fromScriptNumBuffer(here.stack[here.stack.length - 1], fRequireMinimal); //todo, can this line be removed? until now ther seems to be no impact
        // console.log(Object.assign({},this));

        //this is not needed, buffer size can be determined using here.stack[i].length
        // var size = here.stack[_pc].length; //acces the current element on the stack an get its length, in order to specify non default values for the buffer size.
        // if (size < 4){size = 4;} //default value of size is 4, see function BN.fromScriptNumBuffer from bitcore-lib


        for (var i = 0; i < here.stack.length; i++) {
            // console.log('here');
            var bn = bitcore.crypto.BN.fromScriptNumBuffer(here.stack[i], fRequireMinimal, here.stack[i].length); //todo keys and signeatures are not displayed properly. not sure why here.stack[i] returns a Untit8Array which needs to be converted. maybe... :/
            //console.log(bn);
            window.stack_trace += 'Stack element[' + i + '] = ' + bn.words[0] + '\n';
            console.log('Stack element[' + i + '] = ' + bn.words[0]);
            Parser.prototype.stackArray[count][i+1] = bn.words[0];
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
        /*OP_CODE 1-75 are not defined. Opcode 1-75: The next opcode bytes is data to be pushed onto the stack.
        * insted of displaying 'undefined' as an opcode the actual number of the opcode is now displayed.*/
        return value;

    }

    /**
     *
     */
    bitcore.Script.Interpreter.prototype.resetCount = function () { // todo dont have this function on window but on bitcore.Script.Interpreter.
        count =0;
    }

    /**
     *
     * @returns {number}
     */
    bitcore.Script.Interpreter.prototype.getCount = function (){
        return count;
    }



}(bitcore.Script.Interpreter.prototype.step));