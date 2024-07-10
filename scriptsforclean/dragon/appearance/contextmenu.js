$(document).ready(function () {
    $(document).on('mousedown', '.context-control, .dragon-actions', function (event) {
        var myTD = $(this);
        var currentRowMenu = myTD.parent().find('.icons-list:eq(0)');
        switch (event.which) {
            case 1: {
                break;
            }
            case 2: {

                break;
            }
            case 3: {
                myTD.append(currentRowMenu);
                currentRowMenu.find('.dropdown-toggle:eq(0)').click();
                break;
            }
        }
    });
    $(document).on('click', '.breadcrumb-elements-toggle', function (event) {
        $(this).parent().children(".breadcrumb-elements").toggleClass("visible-elements")
    });
    $(document).on('click', '.dragon-action', function (event) {
        $(".dragon-action").each(function (item) {
            var td = $(this).parent();
            if (!td.hasClass('dragon-actions')) {
                td.parent().find('.dragon-actions').append($(this));
            }
        });
    });

    $(document).on("keypress", ".decimals", function (evt) {

        if (evt.which < 48 || evt.which > 57) {
            if (evt.which !== 46)
                evt.preventDefault();
        }
    });

    $(document).on("keypress", ".numbers", function (evt) {
        if (evt.which < 48 || evt.which > 57) {
            evt.preventDefault();
        }
    });

});
