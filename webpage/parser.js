/**
 * The parser takes a string containing opcodes which are either separated by white spaces or
 * carriage return. It will return a bitcore script object containing the script.
 *
 * ToDo extend this library to be able to do syntax checks
 */

var bitcore = require('bitcore-lib');


(function (global) {
    
    var Parser = function (script_text) {
        return new Parser.init(script_text); //ToDo why new parser
    }


    Parser.init = function (script_text) {

        var opcode_arr = script_text.split(/\s+|\r+/); //spliting text on whitespace or new line.

        var script = new bitcore.Script();

        if(script_text === ''){ //if a script is empty return a empty script
            return script;
        }

        for(var i=0; i<opcode_arr.length; i++){
            // if a value in the opcode_arr corresponds to a variable -> replace variable
            if (/(privK_\n*)/.test(opcode_arr[i])   || //test for private key variable
                /(pubK_\n*)/.test(opcode_arr[i])    || //test for public key variable
                /(addr_\n*)/.test(opcode_arr[i])){     //test for address


                var variable = P$.getValueByKey(opcode_arr[i]); //ToDo find a better name instead of variable
                script.add(variable.toBuffer());

            }else if (/(hash_\n*)/.test(opcode_arr[i])){ //test for pubkik key hash. pubkey hash is already a buffer. testing for the key word hash_<number>
                var variable = P$.getValueByKey(opcode_arr[i]);
                script.add(variable);
            }
            else if (/(sig)/.test(opcode_arr[i])){ //test for key word sig
               var sig = P$.getValueByKey(opcode_arr[i]);

               var scriptContainingSig = bitcore.Script.buildPublicKeyIn(sig.signature.toDER());
               //script.prototype.buildPublicKeyIn(sig.signature.toDER(), sig.sigtype);
                console.log('sigscript');
                console.log(scriptContainingSig);
                console.log(scriptContainingSig.toString());
                script.add(scriptContainingSig);
            }
            else {
                script.add(opcode_arr[i]);
            }
        }

        console.log(script);
        console.log(script.toString());
        return script;


    }

    /**
     * Methods for interaction with the stackArray
     */

    Parser.__proto__.getStackArray = function (){
        return Parser.prototype.stackArray;
    }


    /**
     * methods for interaction with the variableMap
      */

    /**
     * given a key returns the corresponding value
     * @param key {string}
     * @returns {*}
     */
    Parser.__proto__.getValueByKey = function(key){
        return Parser.prototype.variableMap[key];
    };

    /**
     * Initialize variable map with some default values
     * todo this map should be created on load.
     */
    Parser.__proto__.initVariableMap = function () {

        Parser.prototype.variableMap = {
            SIGHASH_ALL:    bitcore.crypto.Signature.SIGHASH_ALL,
            SIGHASH_NONE:   bitcore.crypto.Signature.SIGHASH_NONE,
            SIGHASH_SINGLE: bitcore.crypto.Signature.SIGHASH_SINGLE,
            SIGHASH_ANYONECANPAY: bitcore.crypto.Signature.SIGHASH_ANYONECANPAY
        }

        // creating a set of keys and addresses for use in default scripts
        var privk = new bitcore.PrivateKey();
        var pubk = new bitcore.PublicKey.fromPrivateKey(privk);
        var address = pubk.toAddress();
        var pubkHASH160 = bitcore.crypto.Hash.sha256ripemd160(pubk.toBuffer());

        P$.addKeyValuePair('privK_0',privk);
        P$.addKeyValuePair('pubK_0',pubk);
        P$.addKeyValuePair('addr_0', address);
        P$.addKeyValuePair('hash_0',pubkHASH160)
    };

    /**
     * returns the variableMap
     * @returns {{}}
     */
    Parser.__proto__.getVariableMap = function () {
      return Parser.prototype.variableMap;
    };

    /**
     * This function returns the variable map as an array.
     * @returns {Array}
     */
    Parser.__proto__.getVariableMapAsArray = function(){
        return  convertMapToArray(P$.getVariableMap());
    };

    /**
     * helper function, it converts a given map to an array.
     * @param map
     * @returns {Array}
     */
    function convertMapToArray(map){
        var keyVal;
        var value;
        var count = 0;
        var array = new Array();

        Object.keys(map).forEach(function(key){ //iterate over all key value pairs in the map
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
     * this function removes all set key value pairs from the map.
     */
    Parser.__proto__.clearMap = function() {
       initVariableMap();
    };

    /**
     * allow the dynamic addition of key value pairs
     * @param key {string}
     * @param value {object}
     */
    Parser.__proto__.addKeyValuePair = function(key, value){
        Parser.prototype.variableMap[key] = value;
    };

    /**
     * deletes the key value pair for a given key
     * @param key {string}
     */
    Parser.__proto__.deleteKeyValuePair = function (key) {
        delete Parser.prototype.variableMap[key];
    };

    /**
     * This is a helper function, that creates a utox (unspent transaction output)
     * @param outputScript
     * @param toAddress
     * @returns {*}
     */
    Parser.__proto__.createUtox = function (outputScript, toAddress){

        //creating the data object in order to be able to create a utox
        var data = new Object(); // creating the data opbject to create an unspent tx
        data.txid ='00baf6626abc2df808da36a518c69f09b0d2ed0a79421ccfde4f559d2e42128b'; // {String} the previous transaction id
        //data.txId = '00baf6626abc2df808da36a518c69f09b0d2ed0a79421ccfde4f559d2e42128b'; // {String=} alias for 'txid'
        //data.vout = 0; // {number} the index in the transaction
        data.outputIndex = 0; // {number=} alias for 'vout'
        //data.scriptPubKey = outputScript; // {string|Script} the script that must be resolved to release the funds
        data.script = outputScript; // {string|Script=} alias for 'scriptPubKey' (Output Script)
        //data.amount = 1; // {number} amount of bitcoins associated
        data.satoshis =100000000; // {number=} alias for 'amount', but expressed in satoshis (1 BTC = 1e8 satoshis)
        //data.address = toAddress; // {sting | Address=} the associated address to the script, if provided.

        var utox = bitcore.Transaction.UnspentOutput(data);
        return utox;
    }

    /**
     *
     * @param utox
     * @param inputScript
     * @param publicKey
     * @returns {Transaction|Number}
     */
    Parser.__proto__.createTransactionFromUtox = function (utox, publicKey){

        //create a address from the public key
        var address = publicKey.toAddress();

        var transaction = bitcore.Transaction()
            .from(utox,publicKey)
            .to(address, 100000000);
        /* further options list of options that can be specified in order to create transactions
         * .change(changeAddress)
         */

        return transaction;
    };

    Parser.__proto__.setSignature = function (tx, privateKey, option){
        var sigArray = tx.getSignatures(privateKey, option);
        var sig = sigArray[0]; //at the moment only one signature is supported
        P$.addKeyValuePair('sig', sig);
    };


    /**
     * This function converts any string to a Uint8Array.
     * @param string
     * @returns {Uint8Array}
     */
    Parser.__proto__.convertStringToBuffer = function (string){
        var binary_string = window.atob(string); //convert base64 string to binary (https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding)
        var len = binary_string.length;
        var bytes = new Uint8Array(len);

        for (var i=0; i<len; i++){
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes;
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
Parser.prototype.variableMap = {};