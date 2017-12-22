

(function () {

    // https://github.com/crm416/script/blob/master/live-editor/code-mirror-editor.jsx
    // Syntax highlighter for Bitcoin Script
    CodeMirror.defineSimpleMode('script', {
        start: [
            // The regex matches the token, the token property contains the type
            { regex: /([0-9]|[A-F]|[a-f])+\b/i, token: 'number' },
            { regex: /OP\_(IF|NOTIF|ELSE)\b/i, token: 'keyword', indent: true },
            { regex: /OP\_(ENDIF)\b/i, token: 'keyword', dedent: true },
            { regex: /OP\_(VERIFY|EQUALVERIFY|RETURN|CHECKSIGVERIFY|CHECKMULTISIGVERIFY)\b/i, token: 'keyword' },
            { regex: /OP\_(.+?)\b/i, token: 'variable' },
        ],
    });

    CodeMirror.extendMode("script", {
        newlineAfterToken: function (type, content, textAfter) {
            return true;
        },

        tokenToUpperCase: function(type, content) {
            return type == "variable" || type == "keyword";
        }
    });

    // http://codemirror.net/2/lib/util/formatting.js
    // Applies automatic formatting to the specified range
    CodeMirror.defineExtension("autoFormatRange", function (from, to) {
        var cm = this;
        var outer = cm.getMode(), text = cm.getRange(from, to).split("\n");
        var state = CodeMirror.copyState(outer, cm.getTokenAt(from).state);
        var tabSize = cm.getOption("tabSize");

        var out = "", lines = 0, atSol = from.ch == 0;
        function newline() {
            out += "\n";
            atSol = true;
            ++lines;
        }

        for (var i = 0; i < text.length; ++i) {
            var stream = new CodeMirror.StringStream(text[i], tabSize);
            while (!stream.eol()) {
                var inner = CodeMirror.innerMode(outer, state);
                var style = outer.token(stream, state), cur = stream.current();
                stream.start = stream.pos;
                if(/\S/.test(cur) && inner.mode.tokenToUpperCase(style, cur)){
                    cur = cur.toUpperCase();
                }
                if (!atSol || /\S/.test(cur)) {
                    out += cur;
                    atSol = false;
                }
                if (!atSol && inner.mode.newlineAfterToken &&
                    inner.mode.newlineAfterToken(style, cur, stream.string.slice(stream.pos) || text[i + 1] || "", inner.state))
                    newline();
            }
            if (!stream.pos && outer.blankLine) outer.blankLine(state);
            if (!atSol) newline();
        }

        cm.operation(function () {
            out = out.replace(/^\s+|\s+$/g, '');
            cm.replaceRange(out, from, to);
            for (var cur = from.line + 1, end = from.line + lines; cur <= end; ++cur)
                cm.indentLine(cur, "smart");
        });
    });
})();