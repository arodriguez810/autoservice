MENU = {
    current: {parents: [], menu: {}},
    favorites: [],
    reseler: () => {
        debugger;
        var view = window.location.href.split("#");
        if (view.length > 1)
            view = view[1];
        else {
            return;
        }
        if (view === "") {
            return;
        }
        if (new SESSION().ifLogoffRedirec(view))
            return;
        if (view.indexOf("?") !== -1) {
            view = view.split("?")[0];
        }
        MENU.setActive(view);
        MENU.reversal();
    },
    setLast: function (menu) {
        MENU.current.parents = [];
        MENU.current.menu = MENU.getMenu(menu);
        baseController.setSeparator(MENU.current.menu.mark);
        MENU.setParents(menu);
        MENU.current.parents = MENU.current.parents.reverse();
    },
    getMenu: function (A) {
        var icon = A.find('i:eq(0)').attr('class');
        var text = A.find('span:eq(0)').html();
        var mark = A.data('mark');
        return {icon: icon, text: MENU.language(text), a: A, href: A.attr("href"), mark: mark};
    },
    language: function (text) {
        if (text === undefined) return "";
        if (text.indexOf('<language>') !== -1)
            return text.replace('<language>', '').replace('</language>', '');
        else
            return text;
    },
    convertToNoA: function (item) {
        return {icon: item.icon, text: item.text, href: item.href};
    },
    setParents: function (menu) {
        var UL = menu.closest("ul");
        if (!UL.hasClass('dragon-menu')) {
            var A = UL.parent().find('a:eq(0)');
            var I = A.find('i:eq(0)');
            var icon = I.attr('class');
            var text = A.find('span:eq(0)').html();
            MENU.current.separator =
                MENU.current.parents.push({icon: icon, text: MENU.language(text), a: A});
            MENU.setBrothers(ARRAY.last(MENU.current.parents));
            MENU.setParents(A);
        }
    },
    setActive: function (link) {
        let links_var = ['riesgo?vw_productos_poa_detalles', 'riesgo?vw_resultado', 'riesgo?vw_objetivo_estrategico_e','riesgo?vw_actividades_poa','riesgo?vw_proyecto_item' ]
        let links_plan_var = ['riesgo?[NULL]?plan?create', 'riesgo?vw_resultado?plan?create', 'riesgo?vw_objetivo_estrategico_e?plan?create','riesgo?vw_actividades_poa?plan?create','riesgo?vw_proyecto_item?plan?create' ]
        let links_work_plan_var = ['riesgo?[NULL]?plan', 'riesgo?vw_resultado?plan', 'riesgo?vw_objetivo_estrategico_e?plan','riesgo?vw_actividades_poa?plan','riesgo?vw_proyecto_item?plan' ]
        var rurl = location.href.split('#');
        rurl = rurl.length > 1 ? rurl[1] : "";
        link = link || rurl;
        if (links_var.indexOf(link) !== -1)
            link = 'riesgo?[NULL]';
        else if(links_plan_var.indexOf(link) !== -1)
            link = 'riesgo?vw_productos_poa_detalles?plan?create';
        else if(links_work_plan_var.indexOf(link) !== -1)
            link = 'riesgo?vw_productos_poa_detalles?plan';

        $(".dragon-menu li").removeClass('active');
        var a = $('.dragon-menu a[href="#' + link + '"]:eq(0)');
        document.title = `${CONFIG.appName} - ${MENU.language(a.find('span:eq(0)').html()) || capitalize(link)}`;
        $("#apptitle").html(MENU.language(a.find('span:eq(0)').html()));
        if (a.length > 0) {
            MENU.setLast(a);
            MENU.expand(a);
        }
        MENU.reversal();
    },
    expand: function (a, debug) {
        if (debug)
            debugger;
        var LI = a.parent();
        LI.addClass('active');
        var UL = LI.parent();
        UL.show();
        MENU.current.parents.forEach(function (item) {
            var LI = item.a.parent();
            LI.addClass('active');
            var UL = LI.parent();
            UL.show();
        });
        MENU.reversal();
    },
    setBrothers: function (item) {
        item.childs = DSON.ifundefined(item.childs, []);
        var A = item.a;
        var UL = A.next('ul:eq(0)');
        var count = UL.children('li').length;
        for (var i = 0; i < count; i++) {
            var LI = UL.children('li:eq(' + i + ')');
            var child = LI.find('a:eq(0)');
            if (child.attr('href') !== "#") {
                item.childs.push(MENU.getMenu(child));
            }
        }
        MENU.reversal();
    },
    reversal: () => {
        $('.hidden-ul').removeClass("elreverse");
        $('.active [style="display: block;"].hidden-ul').last().addClass("elreverse");
    },
    hideNavBar: function () {
        $("ul.dragon-navbar:not(:has(li))").parent().remove();
    },
    hideMenus: function (controller) {
        $("[href='#" + controller.replaceAll('SIGNAL', '?').replaceAll('EQUALS', '=').replaceAll('SLASH', '/').replaceAll('DASH', '-').replaceAll('LBRACKET', '[').replaceAll('RBRACKET', ']') + "']").parent().remove();
        $("ul.hidden-ul:not(:has(li))").parent().remove();
    },
    run: function ($scope) {

    }
};
