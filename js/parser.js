var bitcore = require('bitcore-lib');






//todo this function in bitcore-lib.js needs to be alltered by disabeling two lines.
// /**
//  * @constructor
//  */
// function MultiSigInput(input, pubkeys, threshold, signatures) {
//     Input.apply(this, arguments);
//     var self = this;
//     pubkeys = pubkeys || input.publicKeys;
//     threshold = threshold || input.threshold;
//     signatures = signatures || input.signatures;
//     this.publicKeys = _.sortBy(pubkeys, function(publicKey) { return publicKey.toString('hex'); }); Todo this line needs to be disabled for multisig to work.
//     // $.checkState(Script.buildMultisigOut(this.publicKeys, threshold).equals(this.output.script), Todo this line needs to be disabled for multisig to work.
//     //   'Provided public keys don\'t match to the provided output script');
//     this.publicKeyIndex = {};
//     _.each(this.publicKeys, function(publicKey, index) {
//         self.publicKeyIndex[publicKey.toString()] = index;
//     });
//     this.threshold = threshold;
//     // Empty array of signatures
//     this.signatures = signatures ? this._deserializeSignatures(signatures) : new Array(this.publicKeys.length);
// }
// inherits(MultiSigInput, Input);


/**
 * Enabeling this override allows signatures to be generated, but an error is caused when using these signatures.
 * The reason seams to be that the the signature don't match up with the object the are verified again.
 * This can be enabled for development purposes.
 *
 * here we override the bitcore Input.PublicKey.prototype.getSignature function.
 * This function can be found int the bitcore-lib under /lib/transaction/input/publickey.js
 * We need to override this function because we are using a dummy transaction to create all our signatures.
 * The original function would verify if the public key would mach the one in the transaction.
 * Of course our public key derived from the privet key will not match the pub key in the dummy transaction.
 */
// (function () {
//     //define override method.
//     bitcore.Transaction.Input.PublicKey.prototype.getSignatures = function(transaction, privateKey, index, sigtype) {
//         //$.checkState(this.output instanceof bitcore.Transaction.Output);
//         sigtype = sigtype || Signature.SIGHASH_ALL;
//         var publicKey = privateKey.toPublicKey();
//         if (true) { //changeing condition from (publicKey.toString() === this.output.script.getPublicKey().toString('hex'))
//             return [new bitcore.Transaction.Signature.prototype.constructor({
//                 publicKey: publicKey,
//                 prevTxId: this.prevTxId,
//                 outputIndex: this.outputIndex,
//                 inputIndex: index,
//                 signature: bitcore.Transaction.Sighash.sign(transaction, privateKey, sigtype, index, this.output.script),
//                 sigtype: sigtype
//             })];
//         }
//         return [];
//     };
//     console.log('override: bitcore.Transaction.Input.PublicKey.prototype.getSignatures successful');
// })();


/**
 * The parser takes a string containing opcodes which are either separated by whitespaces or
 * carriage return. It will return a bitcore script object containing the script.
 *
 * ToDo extend this library to be able to do syntax checks
 */



var _numOfSigs = 1; //this variable is used to keep track of how many signatures are created and increment their variable name correctly

(function (global) {

    var Parser = function (script_text) {
        return new Parser.init(script_text); //ToDo why new parser
    };

    Parser.scriptCount = 0;

    Parser.resetScriptCount = function () {
        Parser.scriptCount=0;
    };


    Parser.init = function (script_text) {

        Parser.scriptCount++;
        console.log(Parser.scriptCount)

        var positionstring = script_text;

        var index = 0;

        var index2 = 0;

        var line = 0;


        /**
         * extra whitespaces and new line characters need to be removed, before the script is split.
         */
        //remove all line brakes '\n' and replace them with whitespaces
        var script_text_cleaned = script_text.replace('\n', ' ');

        //now remove all excess whitespaces. (\s)+ this regex matches one or more whitespaces.
        script_text_cleaned = script_text_cleaned.replace(/(\s)+/, ' ');

        //remove leading whitespaces. ^\s+ this matches all lines starting with whitespaces.
        script_text_cleaned = script_text_cleaned.replace(/^\s+/,'');

        //remove trailing whitespaces. \s+$ this matches all whitespaces at the end of the string.
        script_text_cleaned = script_text_cleaned.replace(/\s+$/,'');


        var opcode_arr = script_text_cleaned.split(/\s+|\r+/); //spliting text on whitespace or new line. Trailing whitespaces or new lines will cause an error

        var script = new bitcore.Script();

        function addDebugToChunk() {
            //here = Object.assign(this, _this);

            index = script_text.indexOf(opcode_arr[i], index); //the index of matched op code is set. The previous value of index is used as an offset to avoid matching the same op code multiple times.
            line = script_text.substr(0, index).split('\n').length; //the line number is extracted by counting the amount of line brakes between the start of the script_text string and the currently matched op code in the script_text string.

            //if the opcode is on a new line the position string needs to be shorttend to not contain the previous line.
            if (positionstring.substring(0, index2 + opcode_arr[i].length).split('\n').length > 1) { //this test if the string up to the end of the currently matched op_codes contains any new line characters.
                index2 = 0;
                positionstring = script_text.substring(index + opcode_arr[i].length, script_text.length); //the position string is shortend to only contain the original string after the currently matched opcode
            }
            else { //the index2 is set to the index of the currently matched op code in the position string.
                index2 = positionstring.indexOf(opcode_arr[i], index2);
            }

            //the debug attribute is added to the script chunk.
            script.chunks[script.chunks.length - 1].debug = {
                start: {line: line -1, ch: index2},
                end: {line: line -1 , ch: index2 + opcode_arr[i].length},
                script: Parser.scriptCount
            };

            index += opcode_arr[i].length; //index is set to the index corresponding to the end of the matched op code in the script_text
            index2 += opcode_arr[i].length; //index2 is set to the index corresponding to the end of the matched op code in the positionstring

        }

        if (script_text === '') { //if a script is empty return a empty script
            return script;
        }

        for (var i = 0; i < opcode_arr.length; i++) {
            // if a value in the opcode_arr corresponds to a variable -> replace variable
            if (/(privK_[0-9])/.test(opcode_arr[i]) || //test for private key variable
                /(pubK_[0-9])/.test(opcode_arr[i]) || //test for public key variable
                /(addr_[0-9])/.test(opcode_arr[i])) {     //test for address

                var variable = P$.getValueByKey(opcode_arr[i]); //ToDo find a better name instead of variable
                if(variable !== undefined){
                    script.add(variable.toBuffer());
                    addDebugToChunk(this);
                }
                else{
                    throw opcode_arr[i] + ' is undefined';
                }

            }
            else if (/(hash_[0-9])/.test(opcode_arr[i])) { //test for pubkik key hash. pubkey hash is already a buffer. testing for the key word hash_<number>
                var variable = P$.getValueByKey(opcode_arr[i]);
                if(variable !== undefined){
                    script.add(variable);
                    addDebugToChunk(this);
                }
                else{
                    throw opcode_arr[i] + ' is undefined';
                }
            }
            else if (/(sig_[0-9])/.test(opcode_arr[i])) { //test for key word sig_<number>
                var sig = P$.getValueByKey(opcode_arr[i]);

                if(sig !== undefined){
                    var scriptContainingSig = bitcore.Script.buildPublicKeyIn(sig.signature.toDER());
                    // console.log('sigscript');
                    // console.log(scriptContainingSig);
                    // console.log(scriptContainingSig.toString());
                    script.add(scriptContainingSig);

                    addDebugToChunk(this);
                }
                else{
                    throw opcode_arr[i] + ' is undefined';
                }
            }
            else if (/(str_[0-9])/.test(opcode_arr[i])) { // test for a string variable
                var str = P$.getValueByKey(opcode_arr[i]);
                if(str !== undefined){
                    var strBuf = P$.convertStringToBuffer(str);
                    script.add(strBuf);
                    addDebugToChunk(this);
                }
                else{
                    throw opcode_arr[i] + ' is undefined';
                }
            }
            else if ((/(^[0-9])/).test(opcode_arr[i])) { //test for a number. ^ denotes that the string must start with a number. [0-9]* will then match any following numbers.
                var num = Number(opcode_arr[i]); //convert the string to a number
                if (num >= 0 && num <= 16){
                    script.add(bitcore.Opcode.smallInt(num));
                    addDebugToChunk(this);
                }
                else{
                    throw 'Number: '+num+'is bigger than 16 or smaller than 0';
                }



            }
            else if((/redeemScript/.test(opcode_arr[i]))){
                var variable  = P$.getValueByKey(opcode_arr[i]);
                if (variable !== undefined){
                    script.add(variable);
                    addDebugToChunk(this);
                }
                else{
                    throw opcode_arr[i] + ' is undefined';
                }


            }
            else if((/redeemScriptHash/.test(opcode_arr[i]))){
                var variable  = P$.getValueByKey(opcode_arr[i]);
                if (variable !== undefined){
                    script.add(variable.toBuffer());
                    addDebugToChunk(this);
                }
                else{
                    throw opcode_arr[i] + ' is undefined';
                }
            }
            else if((/lockUntil/.test(opcode_arr[i]))){
                var lockTime = P$.getValueByKey(opcode_arr[i]); //locktime is saved as a buffer when it is created
                if (lockTime !== undefined){
                    script.add(lockTime);
                    addDebugToChunk(this);
                }
                else{
                    throw 'lock time is undefined';
                }
            }
            else if (/OP_PUSHDATA[1-4]/.test(opcode_arr[i])){
                if(!(/OP_PUSHDATA3/.test(opcode_arr[i]))){
                    // it is tested if the string is in hexadecimal form, bitcore-lib requiers hex strings to start with
                    // 0x so the first 2 characters of the string are removed and the rest is tested if it is in hex form
                    if(bitcore.util.js.isHexa(opcode_arr[i+2].substring(2, opcode_arr[i+2].length))){
                        var string = opcode_arr[i] + ' ' + opcode_arr[i+1]+ ' ' +opcode_arr[i+2];
                        var pushdataScript = bitcore.Script.fromString(string);
                        script.add(pushdataScript);
                        addDebugToChunk(this);
                    //
                     i++;
                     i++;
                   }
                    else{
                        throw opcode_arr[i+1] + 'is not a valid hex string.';
                    }

                }
                else{
                    throw 'OP_PUSHDATA3 is not an opcode';
                }

            }
            else {
                //error handling to test if (opcode_arr[i]) is an opcode
                if (P$.testIfOpcode(opcode_arr[i])) {
                    script.add(opcode_arr[i]);
                    addDebugToChunk(this);
                } else {
                    throw 'Opcode: ' + opcode_arr[i] + ' is not defined. Error at position: ' + i;
                }
            }
        }

        console.log(script);
        console.log(script.toString());
        return script;


    };

    /**
     * This functions tests if a provided string is considered an opcode.
     * @param str
     * @returns {boolean}
     */
    Parser.testIfOpcode = function (str) {
        var map = bitcore.Opcode.map;
        for (var prop in map) {
            if (map.hasOwnProperty(prop)) {
                if (prop === str)
                    return true;
            }
        }
        return false;
    };

    /**
     * Methods for interaction with the stackArray
     */

    Parser.getStackArray = function () {
        return Parser.prototype.stackArray;
    };


    /**
     * methods for interaction with the variableMap
     */

    /**
     * given a key returns the corresponding value
     * @param key {string}
     * @returns {*}
     */
    Parser.getValueByKey = function (key) {
        return Parser.prototype.variableMap[key];
    };


    /**
     * returns the variableMap
     * @returns {{}}
     */
    Parser.getVariableMap = function () {
        return Parser.prototype.variableMap;
    };

    /**
     * This function returns the variable map as an array.
     * @returns {Array}
     */
    Parser.getVariableMapAsArray = function () {
        return convertMapToArray(P$.getVariableMap());
    };

    /**
     * helper function, it converts a given map to an array.
     * @param map
     * @returns {Array}
     */
    function convertMapToArray(map) {
        var keyVal;
        var value;
        var count = 0;
        var array = new Array();

        Object.keys(map).forEach(function (key) { //iterate over all key value pairs in the map
            array[count] = new Array();
            keyVal = key; // extract the value of the key
            value = map[key]; // extract the value corresponding to the given key.

            array[count][0] = keyVal;
            array[count][1] = value;

            count++;
        });

        return array;
    }

    /**
     * allow the dynamic addition of key value pairs
     * @param key {string}
     * @param value {object}
     */
    Parser.addKeyValuePair = function (key, value) {
        Parser.prototype.variableMap[key] = value;
    };

    /**
     * deletes the key value pair for a given key
     * @param key {string}
     */
    Parser.deleteKeyValuePair = function (key) {
        delete Parser.prototype.variableMap[key];
    };

    /**
     * This is a helper function, that creates a utox (unspent transaction output)
     * @param outputScript
     * @param toAddress
     * @returns {*}
     */
    Parser.createUtox = function (outputScript, pubK) {

        //var privk = new bitcore.PrivateKey();
        //var pubk = new bitcore.PublicKey.fromPrivateKey(privk);

        if (Array.isArray(pubK)) {
            pubK = pubK[0];
        }


        /**
         * this is necessary because otherwise following error is thrown by bitcore:
         *  Trying to sign unsupported output type (only P2PKH and P2SH multisig inputs are supported)
         */
            // if(!outputScript.isStandard()){ //the problem is if a script is not standard the bitcore client refuses to sign a transaction containing a non standard script.
            //     outputScript = new bitcore.Script().add(pubK.toBuffer()).add('OP_CHECKSIG');
            //     var debug =outputScript.isStandard();
            //     if(!outputScript.isStandard()){
            //         this.errstr = 'SCRIPT IS NON STANDARD';
            //     }
            // }

            //creating the data object in order to be able to create a utox
        var data = new Object(); // creating the data opbject to create an unspent tx
        data.txid = '00baf6626abc2df808da36a518c69f09b0d2ed0a79421ccfde4f559d2e42128b'; // {String} the previous transaction id
        //data.txId = '00baf6626abc2df808da36a518c69f09b0d2ed0a79421ccfde4f559d2e42128b'; // {String=} alias for 'txid'
        //data.vout = 0; // {number} the index in the transaction
        data.outputIndex = 0; // {number=} alias for 'vout'
        //data.scriptPubKey = outputScript; // {string|Script} the script that must be resolved to release the funds
        data.script = outputScript; // {string|Script=} alias for 'scriptPubKey' (Output Script)
        //data.amount = 1; // {number} amount of bitcoins associated
        data.satoshis = 100000000; // {number=} alias for 'amount', but expressed in satoshis (1 BTC = 1e8 satoshis)
        //data.address = toAddress; // {sting | Address=} the associated address to the script, if provided.

        var utox = bitcore.Transaction.UnspentOutput(data);
        return utox;
    };

    /**
     *
     * @param utox
     * @param inputScript
     * @param publicKey
     * @returns {Transaction|Number}
     */
    Parser.createTransactionFromUtox = function (utox, publicKey) {

        var address;
        var amount = 100000000;

        if (Array.isArray(publicKey)) {
            address = new Array();
            amount = new Array();
            for (var i = 0; i < publicKey.length; i++) {
                address[i] = publicKey[i].toAddress();
                amount[i] = 1000000;
            }
        } else {
            address = publicKey.toAddress();
        }

        //create a address from the public key


        var transaction = bitcore.Transaction();


        if (Array.isArray(address)) {
            var threshold = P$.getValueByKey('threshold'); //the threshold defines how many signatures are required.
            transaction.from(utox, publicKey, threshold);
            for (var i = 0; i < address.length; i++) {
                transaction.to(address[i], amount[i]);
            }
        } else {
            transaction.from(utox, publicKey)
            transaction.to(address, amount);
        }

        /* further options list of options that can be specified in order to create transactions
         * .change(changeAddress)
         */

        return transaction;
    };

    Parser.createTransaction = function (outputScript, privateKey) {
        var pubKey;
        if (Array.isArray(privateKey)) {
            pubKey = new Array();
            for (var i = 0; i < privateKey.length; i++) {
                pubKey[i] = privateKey[i].toPublicKey();
            }
        } else {
            pubKey = privateKey.toPublicKey();
        }

        var utox = P$.createUtox(outputScript, pubKey); //the adress is not important for our purposes.
        var tx = P$.createTransactionFromUtox(utox, pubKey);


        P$.addKeyValuePair('tx', tx);
    };

    /**
     * todo remove this, this is not usefull as each signature references the pubkey used to create the tx.
     * @param tx
     * @param privateKey
     * @param option
     */
    // Parser.createSig = function (privateKey, option){
    //     var tx = P$.getValueByKey('tx'); // get the dummy transaction to sign
    //     var sigArray = tx.getSignatures(privateKey, option);
    //     var sig = sigArray[0]; //at the moment only one signature is supported
    //     P$.addKeyValuePair('sig_' + _numOfSigs, sig);
    //     console.log('sig_' + _numOfSigs);
    //     _numOfSigs ++;
    // };


    /**
     * This function converts any string to a Uint8Array.
     * @param string
     * @returns {Uint8Array}
     */
    Parser.convertStringToBuffer = function (string) {
        var bytes = new bitcore.deps.Buffer(string);
        return bytes;
    };


    /**
     * converts a string to hex
     * @param str
     * @param flag {boolen} if set to true '0x' is added to the beginning of the hex string.
     * @returns {*}
     */
    Parser.convertStringToHex = function (str, flag) {
        flag = flag || false;

        var hex = '';
        for(var i=0;i<str.length;i++) {
            hex += ''+str.charCodeAt(i).toString(16);
        }
        if(flag){
            return '0x'+hex;
        }
        return hex;
    };


    Parser.init.prototype = Parser.prototype;

    global.Parser = global.P$ = Parser;


}(window));

//todo not sure if this belongs inside the parser function.

/**
 * The map that is created here will be added to the Parses.prototype object.
 * The parser proveides folowing methods for interaction with the map:
 *      getValueByKey
 *      getVariableMap
 *      clearMap
 *      addKeyValuePair
 *      deleteKeyValuePair
 *
 * public keys will be denoted as <pubKey_n> where n is a the corresponding number.
 * private keys will be denoted as <privKey_n>
 * adresses will be denoted as <addr_n>
 * signatures will be denoted as <sig> . no number is needed here because currently only one signature is suported. This might need to be expanded.
 * @type {{}}
 */

(function () {
    /**
     * Initialize variable map with some default values
     *
     */
    Parser.prototype.variableMap = {
        SIGHASH_ALL: bitcore.crypto.Signature.SIGHASH_ALL,
        SIGHASH_NONE: bitcore.crypto.Signature.SIGHASH_NONE,
        SIGHASH_SINGLE: bitcore.crypto.Signature.SIGHASH_SINGLE,
        SIGHASH_ANYONECANPAY: bitcore.crypto.Signature.SIGHASH_ANYONECANPAY
    };

    // creating a set of keys and addresses for use in default scripts
    var privk0 = new bitcore.PrivateKey();
    var pubk0 = new bitcore.PublicKey.fromPrivateKey(privk0);
    var privk00 = new bitcore.PrivateKey();
    var pubk00 = new bitcore.PublicKey.fromPrivateKey(privk00);
    var privk000 = new bitcore.PrivateKey();
    var pubk000 = new bitcore.PublicKey.fromPrivateKey(privk000);
    var address = pubk0.toAddress();
    var pubkHASH160 = bitcore.crypto.Hash.sha256ripemd160(pubk0.toBuffer());

    P$.addKeyValuePair('privK_0', privk0);
    P$.addKeyValuePair('pubK_0', pubk0);
    P$.addKeyValuePair('privK_00', privk00);
    P$.addKeyValuePair('pubK_00', pubk00);
    P$.addKeyValuePair('privK_000', privk000);
    P$.addKeyValuePair('pubK_000', pubk000);
    P$.addKeyValuePair('addr_0', address);
    P$.addKeyValuePair('hash_0', pubkHASH160);

    var str = 'bitcoin rocks';
    var strBuf = P$.convertStringToBuffer(str);
    var hashStr = bitcore.crypto.Hash.sha256ripemd160(strBuf);

    P$.addKeyValuePair('hash_00', hashStr);
    P$.addKeyValuePair('str_0', str);

    console.log('variable map initialized');

})();



// (function () {
//     /**
//      * Checks a locktime parameter with the transaction's locktime.
//      * There are two times of nLockTime: lock-by-blockheight and lock-by-blocktime,
//      * distinguished by whether nLockTime < LOCKTIME_THRESHOLD = 500000000
//      *
//      * See the corresponding code on bitcoin core:
//      * https://github.com/bitcoin/bitcoin/blob/ffd75adce01a78b3461b3ff05bcc2b530a9ce994/src/script/interpreter.cpp#L1129
//      *
//      * @param {BN} nLockTime the locktime read from the script
//      * @return {boolean} true if the transaction's locktime is less than or equal to
//      *                   the transaction's locktime
//      */
//     bitcore.Interpreter.prototype.checkLockTime = function(nLockTime) {
//
//         //var myTx = P$.getValueByKey('dummyTx');
//         // We want to compare apples to apples, so fail the script
//         // unless the type of nLockTime being tested is the same as
//         // the nLockTime in the transaction.
//         if (!(
//                 (this.tx.nLockTime <  Interpreter.LOCKTIME_THRESHOLD && nLockTime.lt(Interpreter.LOCKTIME_THRESHOLD_BN)) ||
//                 (this.tx.nLockTime >= Interpreter.LOCKTIME_THRESHOLD && nLockTime.gte(Interpreter.LOCKTIME_THRESHOLD_BN))
//             )) {
//             return false;
//         }
//
//         // Now that we know we're comparing apples-to-apples, the
//         // comparison is a simple numeric one.
//         if (nLockTime.gt(new BN(this.tx.nLockTime))) {
//             return false;
//         }
//
//         // Finally the nLockTime feature can be disabled and thus
//         // CHECKLOCKTIMEVERIFY bypassed if every txin has been
//         // finalized by setting nSequence to maxint. The
//         // transaction would be allowed into the blockchain, making
//         // the opcode ineffective.
//         //
//         // Testing if this vin is not final is sufficient to
//         // prevent this condition. Alternatively we could test all
//         // inputs, but testing just this input minimizes the data
//         // required to prove correct CHECKLOCKTIMEVERIFY execution.
//         if (!this.tx.inputs[this.nin].isFinal()) {
//             return false;
//         }
//
//         return true;
//     };
// })();