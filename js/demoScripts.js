/**
 * Loads a basic demo script.
 */
function loadBasicDemoScript() {
    var inputScriptString = 'OP_1\n' +
        'OP_1\n' +
        'OP_ADD';

    var outputScriptString = 'OP_2\n' +
        'OP_EQUAL';

    setInputScript(inputScriptString);
    setOutputScript(outputScriptString);
}

/**
 * Loads the P2PK script.
 */
function loadP2PKDemoScript() {
    var inputScriptString = '\u003Csig_0\u003E';

    var outputScriptString = '\u003CpubK_0\u003E\n' +
        'OP_CHECKSIG';

    setInputScript(inputScriptString);
    setOutputScript(outputScriptString);

    //creating a new tx on the fly.
    setTransaction('privK_0');
}

/**
 * ToDo this doesnt work yet
 */
function loadP2PKWithLockTimeDemoScript() {
    //var myTx = new bitcore.Transaction();
    var lockUntil = new Date(2015, 01, 01);
    var lockUntilInt = lockUntil.getTime() / 1000;
    var lockUntilBuffer = bitcore.util.buffer.integerAsBuffer(lockUntilInt);
    var lockUntilBufferBN = bitcore.crypto.BN.fromNumber(lockUntilInt);
    //myTx.lockUntilDate(lockUntil);
    //var nLockTime = myTx.nLockTime;
    //var nLockTimeBuffer = bitcore.crypto.BN(nLockTime);
    P$.addKeyValuePair('lockUntil', lockUntilBufferBN);


    var inputScriptString = 'OP_1';

    var outputScriptString = 'OP_1\n' +
        '\u003ClockUntil\u003E\n' +
        'OP_CHECKLOCKTIMEVERIFY\n' +
        'OP_DROP\n' +
        //'OP_1\n' +
        'OP_EQUAL';

    setInputScript(inputScriptString);
    setOutputScript(outputScriptString);

    //creating a new tx on the fly.
    setTransaction();

    //add lock time to transaction
    var future = new Date(2011, 10, 30);
    var tx = P$.getValueByKey('tx');
    tx.lockUntilDate(future); //tx.lockUntilBlockHeight()
    P$.addKeyValuePair('tx', tx);
    console.log(tx);
    console.log(tx.getLockTime());

    //set the flag to enable OP_CHECKLOCKTIMEVERIFY in accordance to bip 65
    P$.addKeyValuePair('interpreterFlags', bitcore.Script.Interpreter.SCRIPT_VERIFY_CHECKLOCKTIMEVERIFY);
}

/**
 * Loads the P2PKH script.
 */
function loadP2PKHDemoScript() {
    var inputScriptString = '\u003Csig_0\u003E\n' +
        '\u003CpubK_0\u003E';

    var outputScriptString = 'OP_DUP\n' +
        'OP_HASH160\n' +
        '\u003Chash_0\u003E\n' +
        'OP_EQUALVERIFY\n' +
        'OP_CHECKSIG';

    setInputScript(inputScriptString);
    setOutputScript(outputScriptString);

    setTransaction('privK_0');
}

/**
 * Loads the P2SH script.
 */
function loadP2SHDemoScript() {
    var inputScriptString = '\u003Cstr_0\u003E';

    var outputScriptString = 'OP_HASH160\n' +
        '\u003Chash_00\u003E\n' +
        'OP_EQUAL';

    setInputScript(inputScriptString);
    setOutputScript(outputScriptString);
}

/**
 * Loads the MultiSig script.
 */
function loadMultiSigDemoScript() {
    var inputScriptString = 'OP_0\n' +
        '\u003Csig_10\u003E\n' +
        '\u003Csig_11\u003E';

    var outputScriptString = '2\n' +
        '\u003CpubK_0\u003E\n' +
        '\u003CpubK_00\u003E\n' +
        '\u003CpubK_000\u003E\n' +
        '3\n' +
        'OP_CHECKMULTISIG';


    P$.addKeyValuePair('threshold', 2); //the threshold defines how many signatures are required.
    setInputScript(inputScriptString);
    setOutputScript(outputScriptString);
    var privKArr = ['privK_0', 'privK_00', 'privK_000'];
    setTransactionMultisig(privKArr);
}

/**
 * Loads a OP_PUSHDATA sample script.
 */
function loadPushDataDemoScript() {
    var dataString = P$.convertStringToHex('Bitcoin Rocks', true); //true indicates to function, to add 0x to the start of the returned Hex string
    console.log(dataString);
    var inputScriptString = 'OP_PUSHDATA2 13 ' +
        dataString;

    var outputScriptString = 'OP_PUSHDATA2 13 ' +
        dataString + '\n' +
        'OP_EQUAL';

    setInputScript(inputScriptString);
    setOutputScript(outputScriptString);

    //creating a new tx on the fly.
    setTransaction();
}

/**
 * Loads a OP_RETURN sample script.
 */
function loadOPReturnDemoScript() {
    var inputScriptString = '';

    var outputScriptString = 'OP_RETURN\n' +
        '\u003Cstr_0\u003E';

    setInputScript(inputScriptString);
    setOutputScript(outputScriptString);
}