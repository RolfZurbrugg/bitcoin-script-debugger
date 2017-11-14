var bitcore = require('bitcore-lib');


(function (interpreter) {

    bitcore.Script.Interpreter.prototype.step = function () {
        var bool = interpreter.call(this);

        bitcore.Script.Interpreter.prototype.printStack(this);

        return bool;
    };

    bitcore.Script.Interpreter.prototype.printStack = function (_this) {
        here = Object.assign(this, _this);
        var fRequireMinimal = (here.flags & bitcore.Script.Interpreter.SCRIPT_VERIFY_MINIMALDATA) !== 0;
        //added by rolf
        window.stack_trace += '\n' + '--------- start of stack --------' + '\n';
        console.log('--------- start of stack --------');
        bitcore.crypto.BN.fromScriptNumBuffer(here.stack[here.stack.length - 1], fRequireMinimal);
        // console.log(Object.assign({},this));
        for (var i = 0; i < here.stack.length; i++) {
            // console.log('here');
            var bn = bitcore.crypto.BN.fromScriptNumBuffer(here.stack[i], fRequireMinimal);
            //console.log(bn);
            window.stack_trace += 'Stack element[' + i + '] = ' + bn.words[0] + '\n';
            console.log('Stack element[' + i + '] = ' + bn.words[0]);
        }
        window.stack_trace += '--------- end of stack --------' + '\n\n';
        console.log('--------- end of stack --------');
        // console.log(this);
    }
}(bitcore.Script.Interpreter.prototype.step));