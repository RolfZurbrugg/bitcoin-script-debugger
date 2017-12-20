var bitcore = require('bitcore-lib');



console.log('app.js ready');

//constants needed for accessing the generated key pairs in the table in the script parsing
var PRIVATE_KEY = 1;
var PUBLIC_KEY = 2;
var ADDRESS   = 3;


/**
 * This function takes the input and output script with id 'is', 'os' respectivly
 * and evaluates the script
 * @param form
 */
function runScript(form) {


    clearStack();

    var input_script_string = getInputScript();
    var output_script_string = getOutputScript();

    var stackArray = bitcore.Script.Interpreter.prototype.debug(input_script_string, output_script_string);
    console.log(stackArray);


    $('#stt').val(window.stack_trace);
}

function getSelectedPrivateKey() {
    var privK_n = $('#privateKeySelection').val();
    return P$.getValueByKey(privK_n);
}

/**
 *
 */
function setSignature() {
    var privK = $('#privateKeySelection').val();
    var option = getSigType();
    setTransaction(privK,option,'sig_1');
    $('#sigSet').text('true');
}

function removeSig() {
    $('#sigSet').text('false');
}



/**
 * Functions for accessing the input and output script text boxes.
 */

function getInputScript(){
    var input_script_string = $("#is").val();
    return input_script_string;
}

function getOutputScript(){
    var output_script_string = $("#os").val();
    return output_script_string;
}

function setInputScript(scriptString){
    $('#is').val(scriptString);
}

function setOutPutScript(scriptString) {
    $('#os').val(scriptString);
}

/**
 * This function was implemented because there is no way to clear textareas on refresh
 * so a manual option is provided to clear the current stack trace
 * @param form
 */
function clearStack() {
    $('#stt').val('');
    window.stack_trace = '';
}


function getSigType() {
    var sigType = $('#sigType').val();
    var option = P$.getValueByKey(sigType);
    return option;
}



/**
 * todo this needs refactoring
 * creating a dynamic table in order to store public and private key pairs and their corresponding address
 * @type {number}
 */
//create dynamic table for keypairs and addresses
//addapted implementation from http://www.encodedna.com/javascript/dynamically-add-remove-rows-to-html-table-using-javascript-and-save-data.htm


// ARRAY FOR HEADER.
var createdAdressId = 1;
var arrHead = new Array();
arrHead = ['ID', 'Private Key', 'Public Key', 'Address', ''];      // SIMPLY ADD OR REMOVE VALUES IN THE ARRAY FOR TABLE HEADERS.

// FIRST CREATE A TABLE STRUCTURE BY ADDING A FEW HEADERS AND
// ADD THE TABLE TO YOUR WEB PAGE.
function createTable() {
    var empTable = document.createElement('table');
    empTable.setAttribute('id', 'empTable');            // SET THE TABLE ID.

    var tr = empTable.insertRow(-1);

    for (var h = 0; h < arrHead.length; h++) {
        var th = document.createElement('th');          // TABLE HEADER.
        th.innerHTML = arrHead[h];
        tr.appendChild(th);
    }

    var div = document.getElementById('cont');
    div.appendChild(empTable);    // ADD THE TABLE TO YOUR WEB PAGE.
}

// ADD A NEW ROW TO THE TABLE.s
function addRow() {
    var empTab = document.getElementById('empTable');

    var rowCnt = empTab.rows.length;        // GET TABLE ROW COUNT.
    var tr = empTab.insertRow(rowCnt);      // TABLE ROW.
    tr = empTab.insertRow(rowCnt);


    //create a key pair and address
    var privateKey = new bitcore.PrivateKey();
    var publicKey = new bitcore.PublicKey.fromPrivateKey(privateKey);
    var address = publicKey.toAddress();


    for (var c = 0; c < arrHead.length; c++) {
        var td = document.createElement('td');          // TABLE DEFINITION.
        td = tr.insertCell(c);

        if (c == 0) {
            addTextBox(document, td, createdAdressId);
        }

        if (c == 1) {
            var privKeyName = 'privK_' + createdAdressId;
            addTextBox(document, td, privateKey.toString());
            P$.addKeyValuePair(privKeyName, privateKey);
            addPrivateKeyToDropDown(privKeyName);
            addVariableToHashCreateDropDown(privKeyName);
        }

        if (c == 2) {
            var pubKeyName = 'pubK_' + createdAdressId;
            addTextBox(document, td, publicKey.toString());
            P$.addKeyValuePair(pubKeyName, publicKey);
            addVariableToHashCreateDropDown(pubKeyName);
        }

        if (c == 3) {
            addTextBox(document, td, address);
            P$.addKeyValuePair('addr_' + createdAdressId, publicKey);
        }

        if (c == 4) {           // FIRST COLUMN.
                                // ADD A BUTTON.
            var button = document.createElement('input');

            // SET INPUT ATTRIBUTE.
            button.setAttribute('type', 'button');
            button.setAttribute('value', 'Remove');

            // ADD THE BUTTON's 'onclick' EVENT.
            button.setAttribute('onclick', 'removeRow(this)');

            td.appendChild(button);

            //ToDo remove key pairs and address from Variable Map
        }
        else { //todo why does this case occour?

        }
    }
    createdAdressId++;
}

//create and add textbox and set value
function addTextBox(document, td, value) {
    // CREATE AND ADD TEXTBOX IN EACH CELL.
    var ele = document.createElement('input');
    ele.setAttribute('type', 'text');
    ele.setAttribute('value', value);
    ele.setAttribute('readonly', true);

    td.appendChild(ele);
}

// DELETE TABLE ROW.
function removeRow(oButton) {
    var empTab = document.getElementById('empTable');
    empTab.deleteRow(oButton.parentNode.parentNode.rowIndex);       // BUTTON -> TD -> TR.
}

// Access table by row and columns
function getTableValue(row, columns) {
    var myTab = document.getElementById('empTable');
    var element = myTab.rows.item(row).cells[columns];

    return element.childNodes[0].value;
}


// ToDo not sure if this is needed
// EXTRACT AND SUBMIT TABLE DATA.
function sumbit() {
    var myTab = document.getElementById('empTable');
    var values = new Array();

    // LOOP THROUGH EACH ROW OF THE TABLE.
    for (row = 1; row < myTab.rows.length - 1; row++) {
        for (c = 0; c < myTab.rows[row].cells.length; c++) {   // EACH CELL IN A ROW.

            var element = myTab.rows.item(row).cells[c];
            if (element.childNodes[0].getAttribute('type') == 'text') {
                values.push("'" + element.childNodes[0].value + "'");
            }
        }
    }
    console.log(values);
}

/**
 * @param privateKeyVariable
 */
function addPrivateKeyToDropDown(privateKeyVariable){
    var selectHTML='';

    selectHTML += '\n'+'<option value="'+privateKeyVariable+'">'+privateKeyVariable+'</option>';
    $('#keySelectionElement0').after(selectHTML);
}

function addVariableToHashCreateDropDown(publicKeyVariable) {
    var selectHTML='';

    selectHTML += '\n'+'<option value="'+publicKeyVariable+'">'+publicKeyVariable+'</option>';
    $('#selectionPubKeyElement0').after(selectHTML);
}

/**
 *
 * @param num
 * @returns {*}
 */
function getPubKeyFromTable(num){
    var pubKeyString = getTableValue(num, PUBLIC_KEY); //getting the public key string out of the dynamic table
    var pubKey = new bitcore.PublicKey(pubKeyString);
    return pubKey;
}

/**
 *
 * @param num
 * @returns {*}
 */
function getPrivatKeyFromTable(num){
    var privateKeyString = getTableValue(num, PRIVATE_KEY);
    var privateKey = new bitcore.PrivateKey(privateKeyString);
    return privateKey;
}

/**
 *
 */
function loadBaiscDemoScript(){
    var inputScriptString =     'OP_1\n' +
                                'OP_1\n' +
                                'OP_ADD';

    var outputScriptString =    'OP_2\n' +
                                'OP_EQUAL';

    setInputScript(inputScriptString);
    setOutPutScript(outputScriptString);
}

/**
 *
 */
function loadP2PKDemoScript() {
    var inputScriptString =     'sig_0';

    var outputScriptString =    'pubK_0\n' +
                                'OP_CHECKSIG';

    setInputScript(inputScriptString);
    setOutPutScript(outputScriptString);

    //creating a new tx on the fly.
    setTransaction('privK_0');
}


/**
 *
 */
function loadP2PKHDemoScript() {
    var inputScriptString =     'sig_0\n' +
                                'pubK_0';

    var outputScriptString =    'OP_DUP\n' +
                                'OP_HASH160\n' +
                                'hash_0\n' +
                                'OP_EQUALVERIFY\n' +
                                'OP_CHECKSIG';

    setInputScript(inputScriptString);
    setOutPutScript(outputScriptString);

    setTransaction('privK_0');
}


/**
 *
 */
function loadP2SHDemoScript() {
    var inputScriptString =     'str_0';

    var outputScriptString =    'OP_HASH160\n' +
                                'hash_00\n' +
                                'OP_EQUAL';

    setInputScript(inputScriptString);
    setOutPutScript(outputScriptString);
}

/**
 * this doesnt work, as bitcore-lib doesnt allow the signing of non standard transacrtions.
 */
// function loadNonStandardScript() {
//     var inputScriptString =     'sig_0\n' +
//                                 'pubK_0\n' +
//                                 'str_0';
//
//     var outputScriptString =    'OP_HASH160\n' +
//                                 'hash_00\n' +
//                                 'OP_EQUALVERIFY\n' +
//                                 'OP_CHECKSIG';
//
//     setInputScript(inputScriptString);
//     setOutPutScript(outputScriptString);
//
//     setTransaction('privK_0');

/**
 *
 */
function loadOPReturnScript() {
    var inputScriptString =     '';

    var outputScriptString =    'OP_RETURN\n' +
                                'str_0';

    setInputScript(inputScriptString);
    setOutPutScript(outputScriptString);
}

/**
 *
 */
function loadMultiSigScript() {
    var inputScriptString =     'sig_0\n' +
                                'sig_00';

    var outputScriptString =    '2\n' +
                                'pubK_0\n' +
                                'pubK_00\n' +
                                'pubK_000\n' +
                                '3\n' +
                                'OP_CHECKMULTISIGVERIFY';

    setInputScript(inputScriptString);
    setOutPutScript(outputScriptString);
}

function setTransaction(privKStr, option, sigVar) {
    option = option || bitcore.crypto.Signature.SIGHASH_ALL;
    sigVar = sigVar || 'sig_0'
    P$.createTransaction(P$(getOutputScript()),P$.getValueByKey(privKStr));
    var tx = P$.getValueByKey('tx');
    var sigArray = tx.getSignatures(P$.getValueByKey(privKStr),option);
    var sig = sigArray[0]; //at the moment only one signature is supported
    P$.addKeyValuePair(sigVar,sig);
    console.log(sigVar);
}


/**
 * table for hashes
 *
 */

// ARRAY FOR HEADER.
var createdHashId = 1;
var hashTableHead = new Array();
hashTableHead = ['ID', 'Publik Key', 'Hash', 'Type', ''];      // SIMPLY ADD OR REMOVE VALUES IN THE ARRAY FOR TABLE HEADERS.

// FIRST CREATE A TABLE STRUCTURE BY ADDING A FEW HEADERS AND
// ADD THE TABLE TO YOUR WEB PAGE.
function createHashTable() {
    var empHashTable = document.createElement('table');
    empHashTable.setAttribute('id', 'empHashTable');            // SET THE TABLE ID.

    var tr = empHashTable.insertRow(-1);

    for (var h = 0; h < hashTableHead.length; h++) {
        var th = document.createElement('th');          // TABLE HEADER.
        th.innerHTML = hashTableHead[h];
        tr.appendChild(th);
    }

    var div = document.getElementById('contHashTable');
    div.appendChild(empHashTable);    // ADD THE TABLE TO YOUR WEB PAGE.
}

// ADD A NEW ROW TO THE TABLE.s
function hashTableAddRow() {
    var empTab = document.getElementById('empHashTable');

    var rowCnt = empTab.rows.length;        // GET TABLE ROW COUNT.
    var tr = empTab.insertRow(rowCnt);      // TABLE ROW.
    tr = empTab.insertRow(rowCnt);


    // get selected pubKey
    var selectedPubKey = $('#selectPubKeyForHash').val();
    var pubKey = P$.getValueByKey(selectedPubKey);

    // get selected hash function
    var selectedHashFunction = $('#selectHashFunktion').val();



    for (var c = 0; c < hashTableHead.length; c++) {
        var td = document.createElement('td');          // TABLE DEFINITION.
        td = tr.insertCell(c);

        if (c == 0) {
            addTextBox(document, td, createdHashId);
        }

        if (c == 1) {
            var pubKeyHashName = 'hash_' + createdHashId;
            var pubKeyHash = createHash(pubKey, selectedHashFunction);
            P$.addKeyValuePair(pubKeyHashName, pubKeyHash);
            addTextBox(document, td, pubKey.toString());
        }

        if (c == 2) {
            var pubKeyHashName = 'hash_' + createdHashId;
            var pubKeyHash = P$.getValueByKey(pubKeyHashName);
            addTextBox(document, td, pubKeyHash.toString('hex'));
        }

        if (c == 3) {
            addTextBox(document, td, selectedHashFunction);

        }

        if (c == 4) {           // FIRST COLUMN.
            // ADD A BUTTON.
            var button = document.createElement('input');

            // SET INPUT ATTRIBUTE.
            button.setAttribute('type', 'button');
            button.setAttribute('value', 'Remove');

            // ADD THE BUTTON's 'onclick' EVENT.
            button.setAttribute('onclick', 'removeRowPubKeyHashTable(this)');

            td.appendChild(button);

            //ToDo remove key pairs and address from Variable Map
        }
        else { //todo why does this case occour?

        }
    }
    createdHashId++;
}

// DELETE TABLE ROW.
function removeRowPubKeyHashTable(oButton) {
    var empTab = document.getElementById('empHashTable');
    empTab.deleteRow(oButton.parentNode.parentNode.rowIndex);       // BUTTON -> TD -> TR.
}

function createHash (obj, hashType){

    if( obj instanceof bitcore.PublicKey){
        obj = obj.toBuffer();
    }
    var hash = null;

    switch (hashType){
        case 'sha1' :
            hash= bitcore.crypto.Hash.sha1(obj);
            break;

        case 'sha256' :
            hash= bitcore.crypto.Hash.sha256(obj);
            break;

        case 'sha256sha256' :
            hash= bitcore.crypto.Hash.sha256sha256(obj);
            break;

        case 'ripemd160' :
            hash= bitcore.crypto.Hash.ripemd160(obj);
            break;

        case 'sha256ripemd160' :
            hash= bitcore.crypto.Hash.sha256ripemd160(obj);
            break;

        case 'sha512' :
            hash= bitcore.crypto.Hash.sha512(obj);
            break;

        case 'sha512' :
            hash= bitcore.crypto.Hash.sha512(obj);
            break;

        // following cryptographic functions are available, but are disabled here because they are not used in bitcoin scripts.
        // case 'hmac' :
        //     pubKeyHash= bitcore.crypto.Hash.hmac(pubKey.toBuffer());
        //     break;
        //
        // case 'sha256hmac' :
        //     pubKeyHash= bitcore.crypto.Hash.sha256hmac(pubKey.toBuffer());
        //     break;
        //
        // case 'sha512hmac' :
        //     pubKeyHash= bitcore.crypto.Hash.sha512hmac(pubKey.toBuffer());
        //     break;
    }

    return hash;
}

function initTables(){
    createTable();
    createHashTable();

}

/**
 * check if scripts are standard
 */

function checkIfStandardScript(script){
    return script.isStandard();
}

/**
 * the signature is generated once the script is run. So evaluating if a script
 * is standard when it contains the variable sig an exception will occur while parsing.
 * so a script containing a signature mus be run befor evaluating.
 * ToDo in order to avoid this, the signature and the transaction would need to be created at the point
 * ToDo in which the button sign is clicked.
 */
function checkInputScriptIfStandard (){
    var scriptString = getInputScript();
    var script = P$(scriptString);
    var isStandard =  checkIfStandardScript(script);
    $('#isInputScriptStandardVal').text(isStandard);
}

/**
 *
 */
function checkOutputScriptIfStandard (){
    var scriptString = getOutputScript();
    var script = P$(scriptString);
    var isStandard =  checkIfStandardScript(script);
    $('#isOUtputScriptStandardVal').text(isStandard);
}

/**
 *
 */
function addHashValue() {
    var selectedHashFunction = $('#selectStringHashFunktion').val();
    var option = P$.getValueByKey(selectedHashFunction);
    var stringToHash = $('#StringToHash').val();
    var stringBuffer = P$.convertStringToBuffer(stringToHash);
    var hash = createHash(stringBuffer,selectedHashFunction);
    P$.addKeyValuePair('hash_'+createdHashId, hash);
    console.log('hash_'+createdHashId);
    createdHashId++;
}

/**
 *
 */
var stringVarCount = 1;
function addStringVar() {
    var str = $('#StringVar').val();
    P$.addKeyValuePair('str_'+stringVarCount,str);
    console.log('str_'+stringVarCount);
    stringVarCount++;
}
