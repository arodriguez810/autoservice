FIXELEMENT = {
    isScrolledIntoView: function (elem) {
        var docViewTop = $(window).scrollTop();
        var elemTop = elem.offset().top;
        return ((elemTop >= docViewTop));
    },
    isScrolledIntoViewReverse: function (elem) {
        var docViewTop = $(window).scrollTop();
        var elemTop = elem.offset().top;
        return ((elemTop <= docViewTop));
    },
    isScrolledIntoViewBottom: function (elem) {
        if (elem.offset())
            return elem.offset().top > $(window).height();
        else
            return false;
    },
    run: function () {
        var tables = $('.dragon-table');
        tables.each(function () {
            var table = $(this);
            var columns = table.find('thead tr').clone().addClass('dragon-column-hide');
            var footers = table.find('tfoot tr').clone().addClass('dragon-column-hide');
            var rows = table.find('tbody tr.dragon-rows');
            var removes = table.find('tbody tr.dragon-columns');
            var removesf = table.find('tfoot tr.dragon-columns');
            removes.remove();
            //removesf.remove();
            var lasHideRow = undefined;
            var lasHideRowf = undefined;
            rows.each(function () {
                var row = $(this);
                if (FIXELEMENT.isScrolledIntoView(row) === false) {
                    lasHideRow = row;
                } else {
                    return;
                }
            });
            // var lastlast = rows[rows.length - 1];
            // if (lastlast) {
            //     var row = $(lastlast);
            //     if (FIXELEMENT.isScrolledIntoView(row) === true) {
            //         console.log('down', row);
            //         lasHideRowf = row;
            //     } else {
            //
            //     }
            // }
            if (lasHideRow !== undefined)
                lasHideRow.after(columns);
            // if (-lasHideRowf !== undefined)
            //     lasHideRowf.after(footers);
        });
    }
};
$(document).ready(function () {
    $(document).on("scroll", function () {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            $(".upButtom").show();
        } else {
            $(".upButtom").hide();
        }
        FIXELEMENT.run();
    });
    $(document).on('click', '.upButtom', function () {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });

});
