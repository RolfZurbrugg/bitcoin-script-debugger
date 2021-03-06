var bitcore = require('bitcore-lib');

//constants needed for accessing the generated key pairs in the table in the script parsing
var PRIVATE_KEY = 1;
var PUBLIC_KEY = 2;
var ADDRESS = 3;

var isDebug = false; // true if debug mode is active
var stackArray = []; // holds the stack trace of the evalutated script
var stepIndex = 0; // used to step through the stack array
var isTransactionSigned = false;

var cmInputScript = null;
var cmOutputScript = null;

var mark; // holds a reference to the active mark

// entry point
$(function () {
    init();
});

/**
 * Initializes the user interface and components.
 */
function init() {
    // configure CodeMirror for input script
    cmInputScript = CodeMirror.fromTextArea(document.getElementById("inputScript"), {
        lineNumbers: true,
        mode: "script"
    });

    // configure CodeMirror for output script
    cmOutputScript = CodeMirror.fromTextArea(document.getElementById("outputScript"), {
        lineNumbers: true,
        mode: "script"
    });

    $("#btnRun").click(function () {
        runScript();
        this.blur();
    });

    $("#btnStepForward").click(function () {
        stepForwardScript();
        this.blur();
    });

    $("#btnStepBackward").click(function () {
        stepBackwardScript();
        this.blur();
    });

    $("#btnStop").click(function () {
        stopScript();
        this.blur();
    });

    $("#btnAutoFormat").click(function () {
        autoFormatScript();
        this.blur();
    });

    $("#btnSignTransaction").click(function () {
        signTransaction();
        this.blur();
    });

    $("#btnUnsignTransaction").click(function () {
        unsignTransaction();
        this.blur();
    });

    $("#btnCheckInputScript").click(function () {
        checkInputScriptIfStandard();
        this.blur();
    });

    $("#btnCheckOutputScript").click(function () {
        checkOutputScriptIfStandard();
        this.blur();
    });

    updateVariablesTable();
    handleState();
}

/**
 * This function takes the input and output script with id 'is', 'os' respectivly
 * and evaluates the script
 */
function runScript() {
    if (evaluateScript()) {
        isDebug = true;
        stepIndex = stackArray.length - 1;
    }

    markNextToken();
    updateStackTable(stackArray, stepIndex);
    handleState();
}

function stopScript() {
    isDebug = false;
    stackArray = [];
    stepIndex = 0;

    clearStackTable();
    handleState();

    if (mark) {
        mark.clear();
    }
}

function stepForwardScript() {
    if (!isDebug) {
        if (!evaluateScript()) {
            return;
        }
        isDebug = true;
        stepIndex = -1;
    }

    if (stepIndex < stackArray.length - 1) {
        stepIndex++;
    }

    markNextToken();
    updateStackTable(stackArray, stepIndex);
    handleState();
}

function stepBackwardScript() {
    if (!isDebug) {
        return;
    }

    if (stepIndex > 0) {
        stepIndex--;
    }

    markNextToken();
    updateStackTable(stackArray, stepIndex);
    handleState();
}

/**
 * Formats the input and output script.
 */
function autoFormatScript() {
    // format input script
    cmInputScript.autoFormatRange(
        { line: 0, ch: 0 },
        { line: cmInputScript.lineCount() }
    );
    // format output script
    cmOutputScript.autoFormatRange(
        { line: 0, ch: 0 },
        { line: cmOutputScript.lineCount() }
    );
}

/**
 * Signs a dummy transaction.
 */
function signTransaction() {
    isTransactionSigned = true;

    var privKey = $("#sctPrivateKey option:selected").text();
    var sigHashType = $("#sctSighashType option:selected").text();

    try {
        setTransaction(privKey, sigHashType);
        $("#alert-error").addClass("hidden");
    } catch (err) {
        console.log(err);
        $("#alert-error").removeClass("hidden");
        $("#alert-error-a").text(err);

        isTransactionSigned = false;
    }

    updateVariablesTable();
    handleState();
}

/**
 * Unsigns the dummy transaction.
 */
function unsignTransaction() {
    isTransactionSigned = false;

    updateVariablesTable();
    handleState();
}

/**
 * Loads the selected demo script.
 */
function loadSelectedDemoScript() {
    var demoScriptName = $("#sctDemoScript").val();
    loadDemoScript(demoScriptName);
}

/**
 * Handles the UI state by enabling or disabling user controls.
 */
function handleState() {
    $("#btnRun").disableIf(isDebug);
    $("#btnStepForward").disableIf(isDebug && stepIndex > stackArray.length - 2);
    $("#btnStepBackward").disableIf(!isDebug || stepIndex < 1);
    $("#btnStop").disableIf(!isDebug);

    $("#btnAutoFormat").disableIf(isDebug);

    $("#btnUnsignTransaction").disableIf(!isTransactionSigned);
    $("#btnSignTransaction").disableIf(isTransactionSigned);
    $("#sctPrivateKey").disableIf(isTransactionSigned);
    $("#sctSighashType").disableIf(isTransactionSigned);

    cmInputScript.setOption("readOnly", isDebug);
    if (isDebug) {
        cmInputScript.setOption("theme", "3024-day");
    } else {
        cmInputScript.setOption("theme", "default");
    }

    cmOutputScript.setOption("readOnly", isDebug || isTransactionSigned);
    if (isDebug || isTransactionSigned) {
        cmOutputScript.setOption("theme", "3024-day");
    } else {
        cmOutputScript.setOption("theme", "default");
    }
}

/**
 * Evaluates the user script from the ui and stores the result
 * in the stackArray. The method returns false if the evaluation fails
 * and displays the error message in the error box.
 */
function evaluateScript() {
    var inputScript = getInputScript();
    var outputScript = getOutputScript();

    try {
        stackArray = bitcore.Script.Interpreter().debug(inputScript, outputScript);
    } catch (err) {
        console.log(err);
        $("#alert-error").removeClass("hidden");
        $("#alert-error-a").text(err);
        return false; // evaluation failed
    }
    $("#alert-error").addClass("hidden");
    return true; // evaluation was successfull
}

function updateStackTable(stackArray, index) {
    clearStackTable();
    var stack = stackArray[index];
    for (var i = 1; i < stack.length; i++) {
        var row = $.parseHTML("<tr><td>" + i + "</td><td>" + stack[i] + "</td></tr>");
        if (stepIndex == stackArray.length - 1 && i == stack.length - 1) {
            $(row).css("background-color", stack[i] == 1 ? "#dff0d8" : "#f2dede");
        }
        $("#stack > tbody").append(row);
    }
}

function clearStackTable() {
    $("#stack").find("tr:gt(0)").remove();
}

function updateVariablesTable() {
    clearVariablesTable();
    var variables = P$.getUserVariableMap();
    for (var i = 0; i < variables.length; i++) {
        var row = "<tr><td>" + variables[i][0] + "</td><td>" + variables[i][1] + "</td></tr>";
        $("#variables > tbody").append(row);
    }
}

function clearVariablesTable() {
    $("#variables").find("tr:gt(0)").remove();
}

function markNextToken() {
    if (mark) {
        mark.clear();
    }

    if (stepIndex < stackArray.length - 1) { // if there is a next token
        var debugInfo = stackArray[stepIndex + 1][0]; // mark next token
        var doc = (debugInfo.script == 1 ? cmInputScript : cmOutputScript).getDoc(); // beautiful

        mark = doc.markText(debugInfo.start, debugInfo.end, { className: "active-token" });
    }
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
    setTransaction(privK, option, 'sig_1');
    $('#sigSet').text('true');
}

function removeSig() {
    $('#sigSet').text('false');
}

/**
 * Gets the input script.
 */
function getInputScript() {
    var doc = cmInputScript.getDoc();
    return doc.getValue();
}

/**
 * Sets the input script.
 * @param {string} scriptString
 */
function setInputScript(scriptString) {
    var doc = cmInputScript.getDoc();
    doc.setValue(scriptString);
}

/**
 * Gets the output script.
 */
function getOutputScript() {
    var doc = cmOutputScript.getDoc();
    return doc.getValue();
}

/**
 * Sets the output script.
 * @param {string} scriptString
 */
function setOutputScript(scriptString) {
    var doc = cmOutputScript.getDoc();
    doc.setValue(scriptString);
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

function addPrivateKeyToDropDown(privateKeyVariable) {
    var selectHTML = '';

    selectHTML += '\n' + '<option value="' + privateKeyVariable + '">' + privateKeyVariable + '</option>';
    $('#keySelectionElement0').after(selectHTML);
}

function addVariableToHashCreateDropDown(publicKeyVariable) {
    var selectHTML = '';

    selectHTML += '\n' + '<option value="' + publicKeyVariable + '">' + publicKeyVariable + '</option>';
    $('#selectionPubKeyElement0').after(selectHTML);
}

function getPubKeyFromTable(num) {
    var pubKeyString = getTableValue(num, PUBLIC_KEY); //getting the public key string out of the dynamic table
    var pubKey = new bitcore.PublicKey(pubKeyString);
    return pubKey;
}

function getPrivatKeyFromTable(num) {
    var privateKeyString = getTableValue(num, PRIVATE_KEY);
    var privateKey = new bitcore.PrivateKey(privateKeyString);
    return privateKey;
}

function loadDemoScript(name) {
    window["load" + name + "DemoScript"]();
}

function setTransactionMultisig(privKStrArr, option) {
    option = option || bitcore.crypto.Signature.SIGHASH_ALL;
    var privKArr = new Array();

    //loop over each private key variable in array and get the actual private key.
    for (var i = 0; i < privKStrArr.length; i++) {
        privKArr[i] = P$.getValueByKey(privKStrArr[i]);
    }

    P$.createTransaction(P$(getOutputScript()), privKArr);   //get the string representation of the output script and parse
    // it to return a string obj which is then passed to the createTransction function.
    //get the created transaction
    var tx = P$.getValueByKey('tx');

    var sigArr = new Array(); //create an array for all transaction signatures to be stored temporarily

    //loop over all provided private keys and sign the tx with them.
    for (var i = 0; i < privKArr.length; i++) {
        var sigArray = tx.getSignatures(privKArr[i], option);
        sigArr[i] = sigArray[0];
    }

    //loop over all signatures in sigArr and add them to the Variable map.
    for (var i = 0; i < sigArr.length; i++) {
        P$.addKeyValuePair('sig_1' + i, sigArr[i]); //the signature variables for the multisig will be of form sig_1<number>
        console.log('sig_1' + i);
    }
}

function setTransaction(privKStr, option, sigVar) {

    switch (option) {
        case undefined:
            option = bitcore.crypto.Signature.SIGHASH_ALL;
            break;
        case 'SIGHASH_ALL':
            option = bitcore.crypto.Signature.SIGHASH_ALL;
            break;

        case 'SIGHASH_NONE':
            option = bitcore.crypto.Signature.SIGHASH_NONE;
            break;

        case 'SIGHASH_SINGLE':
            option = bitcore.crypto.Signature.SIGHASH_SINGLE;
            break;

        case 'SIGHASH_ANYONECANPAY':
            option = bitcore.crypto.Signature.SIGHASH_ANYONECANPAY;
            break;
    }

    sigVar = sigVar || 'sig_0';
    var signBool = true;
    if (privKStr === undefined) {
        signBool = false;
        privKStr = 'privK_0'; //it shoudln't matter which private key is chosen, as it is not needed for validation.
    }
    P$.createTransaction(P$(getOutputScript()), P$.getValueByKey(privKStr));
    var tx = P$.getValueByKey('tx');

    if (signBool) {
        var privateKey = P$.getValueByKey(privKStr);
        var sigArray = tx.getSignatures(privateKey, option);
        var sig = sigArray[0]; //at the moment only one signature is supported
        P$.addKeyValuePair(sigVar, sig);
        console.log(sigVar);
    }
}

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

function createHash(obj, hashType) {

    if (obj instanceof bitcore.PublicKey) {
        obj = obj.toBuffer();
    }
    var hash = null;

    switch (hashType) {
        case 'sha1':
            hash = bitcore.crypto.Hash.sha1(obj);
            break;

        case 'sha256':
            hash = bitcore.crypto.Hash.sha256(obj);
            break;

        case 'sha256sha256':
            hash = bitcore.crypto.Hash.sha256sha256(obj);
            break;

        case 'ripemd160':
            hash = bitcore.crypto.Hash.ripemd160(obj);
            break;

        case 'sha256ripemd160':
            hash = bitcore.crypto.Hash.sha256ripemd160(obj);
            break;

        case 'sha512':
            hash = bitcore.crypto.Hash.sha512(obj);
            break;

        case 'sha512':
            hash = bitcore.crypto.Hash.sha512(obj);
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

function initTables() {
    createTable();
    createHashTable();

}

/**
 * Checks if the given script is a standard script.
 */
function checkIfStandardScript(script) {
    return script.isStandard();
}

/**
 * Checks if the input script is a standard script.
 */
function checkInputScriptIfStandard() {
    var scriptString = getInputScript();
    var script = P$(scriptString);
    var isStandard = checkIfStandardScript(script);

    $("#inputScriptIsStandardFeedback").removeClass();
    if (isStandard) {
        $("#inputScriptIsStandardFeedback").addClass("glyphicon glyphicon-ok green");
    } else {
        $("#inputScriptIsStandardFeedback").addClass("glyphicon glyphicon-remove red");
    }
}

/**
 * Checks if the output script is a standard script.
 */
function checkOutputScriptIfStandard() {
    var scriptString = getOutputScript();
    var script = P$(scriptString);
    var isStandard = checkIfStandardScript(script);

    $("#outputScriptIsStandardFeedback").removeClass();
    if (isStandard) {
        $("#outputScriptIsStandardFeedback").addClass("glyphicon glyphicon-ok green");
    } else {
        $("#outputScriptIsStandardFeedback").addClass("glyphicon glyphicon-remove red");
    }
}

function addHashValue() {
    var selectedHashFunction = $('#selectStringHashFunktion').val();
    var option = P$.getValueByKey(selectedHashFunction);
    var stringToHash = $('#StringToHash').val();
    var stringBuffer = P$.convertStringToBuffer(stringToHash);
    var hash = createHash(stringBuffer, selectedHashFunction);
    P$.addKeyValuePair('hash_' + createdHashId, hash);
    console.log('hash_' + createdHashId);
    createdHashId++;
}

var stringVarCount = 1;
function addStringVar() {
    var str = $('#StringVar').val();
    P$.addKeyValuePair('str_' + stringVarCount, str);
    console.log('str_' + stringVarCount);
    stringVarCount++;
}
