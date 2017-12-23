(function () {
    // Define a new mode for Bitcoin Script because this mode
    // is not supported by the CodeMirror library.
    //
    // The code is based on the vbscript mode implementation.
    CodeMirror.defineMode("script", function (conf, parserConf) {

        function wordRegexp(words) {
            return new RegExp("^((" + words.join(")|(") + "))\\b", "i");
        }

        var keywords = /OP\_(.+?)\b/i
        var opening = /OP\_(IF|NOTIF)\b/i
        var middle = /OP\_ELSE\b/i
        var closing = /OP\_ENDIF\b/i
        var literals = /^(0x|0X)?[a-fA-F0-9]+$/i

        // tokenizer
        function tokenBase(stream, state) {
            if (stream.eatSpace()) {
                return 'space';
            }

            if (stream.match(opening)) {
                state.currentIndent++;
                return 'flowcontrol';
            }

            if (stream.match(middle)) {
                return 'flowcontrol';
            }

            if (stream.match(closing)) {
                state.currentIndent--;
                return 'flowcontrol';
            }

            if(stream.match(keywords)){
                return 'keyword';
            }

            if (stream.match(literals)) {
                return 'string';
            }

            // Handle non-detected items
            stream.next();

            return 'error';
        }

        var external = {
            startState: function () {
                return {
                    tokenize: tokenBase,
                    lastToken: null,
                    currentIndent: 0,
                };
            },

            token: function (stream, state) {
                var style = state.tokenize(stream, state);
                state.lastToken = { style: style, content: stream.current() };

                if (style === 'space') {
                    style = null;
                }
                return style;
            },

            indent: function (state, textAfter) {
                var trueText = textAfter.replace(/^\s+|\s+$/g, '');
                if (trueText.match(closing) || trueText.match(middle)) {
                    return conf.indentUnit * (state.currentIndent - 1);
                }
                if (state.currentIndent < 0) {
                    return 0;
                }
                return state.currentIndent * conf.indentUnit;
            },

            newlineAfterToken: function (type, content, textAfter) {
                return type != 'error';
            },

            tokenToUpperCase: function (type, content) {
                return type == "flowcontrol" || type == "keyword";
            }
        };

        return external;
    });

    // http://codemirror.net/2/lib/util/formatting.js with some modifications
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
                if (/\S/.test(cur) && inner.mode.tokenToUpperCase(style, cur)) {
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
            for (var cur = from.line + 1, end = from.line + lines; cur <= end; ++cur){
                cm.indentLine(cur, "smart");
            }
        });
    });
})();