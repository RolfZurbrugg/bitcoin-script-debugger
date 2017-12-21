(function () {
    jQuery.fn.extend({
        disableIf: function (condition) {
            return this.each(function () {
                if (condition) {
                    $(this).attr("disabled", "disabled");
                } else {
                    $(this).removeAttr("disabled");
                }
            });
        }
    })
})();