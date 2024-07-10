SIDEBAR = {
    apply: function (classElement, classBody) {
        if (STORAGE.exist(classElement)) {
            if (STORAGE.getSimple(classElement) === "true") {
                $('body').addClass(classBody);
            }
        }
    }
};
$(document).ready(function () {
    SIDEBAR.apply('app.sidebar-main-ishide', 'sidebar-main-hidden');
    if (STORAGE.getSimple('app.sidebar-main-ishide') === "true") {
        $(".sidebar-main-toggle").hide();
    }
    SIDEBAR.apply('app.sidebar-xs', 'sidebar-xs');


});

$(document).on("click", ".modal-body", function () {
    if (baseController.currentModel)
        if (baseController.currentModel.clicaalgo)
            baseController.currentModel.clicaalgo();
});

$(document).on("click", ".expanddocument", function () {
    $(".documentis").hide("slow");
    $(".myclose").hide();
    $(".miproceso").removeClass("aymi100percent");

    $(this).next(".documentis").show("slow");
    $(this).parent().find(".myclose").show();
    $(this).parent().parent().addClass('aymi100percent');
});

$(document).on("click", ".expanddocumentClose", function () {
    $(".documentis").hide("slow");
    $(".miproceso").removeClass("aymi100percent");
    $(".myclose").hide();
});

$(document).on("mouseover", ".modal-body", function () {
    if (baseController.currentModel)
        if (baseController.currentModel.clicaalgo)
            baseController.currentModel.clicaalgo();
});

$(window).focus(function () {
    if (resizeCharts)
        resizeCharts();
});
