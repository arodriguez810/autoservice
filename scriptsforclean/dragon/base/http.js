HTTP = function () {
    this.hrefToObj = function () {
        var newobj = {}, url = location.href.split("?");
        if (url.length > 1) {
            var queries = url[1].split("&");
            for (var i in queries) {
                var values = queries[i].split("=");
                if (values.length > 1) {
                    var key = values[0], value = values[1];
                    eval(`newobj.${key} = value`)
                }
            }
        }
        return newobj
    }, this.objToQuery = function (e) {
        var t = [];
        for (var o in e) e.hasOwnProperty(o) && t.push(encodeURIComponent(o) + "=" + encodeURIComponent(e[o]));
        return t.join("&")
    }, this.path = function (e) {
        var t = [];
        return t.push(`http${CONFIG.proxy.ssl ? "s" : ""}://${"" !== CONFIG.proxy.subdomain ? CONFIG.proxy.subdomain + "." : ""}${CONFIG.proxy.domain}${80 === CONFIG.proxy.port || 443 === CONFIG.proxy.port ? "" : ":" + CONFIG.proxy.port}`), t.concat(e).join("/")
    }, this.folderpath = function (e) {
        var t = [];
        return t.push(`http${CONFIG.proxy.ssl ? "s" : ""}://${"" !== CONFIG.proxy.subdomain ? CONFIG.proxy.subdomain + "." : ""}${CONFIG.proxy.domain}${80 === CONFIG.proxy.port || 443 === CONFIG.proxy.port ? "" : ":" + CONFIG.proxy.port}${CONFIG.folderslash || ""}`), t.concat(e).join("/")
    }, this.folderredirect = function (e) {
        var t = (new HTTP).path(e.split("/"));
        console.log(t);
        var o = $(`.modalmenu[href='${e}']`);
        if (o.length > 0 && o.data("modal")) return void o.trigger("click");
        document.location.href = (new HTTP).folderpath(e.split("/"))
    }, this.cleanRoot = function (e) {
        return e.replaceAll((new HTTP).path([]), "")
    }, this.tagpath = function (e) {
        var t = [];
        return e[0] = "#" + e[0], t.push(`http${CONFIG.proxy.ssl ? "s" : ""}://${"" !== CONFIG.proxy.subdomain ? CONFIG.proxy.subdomain + "." : ""}${CONFIG.proxy.domain}${80 === CONFIG.proxy.port || 443 === CONFIG.proxy.port ? "" : ":" + CONFIG.proxy.port}${CONFIG.folderslash || ""}`), t.concat(e).join("/")
    }, this.redirect = function (e) {
        var t = (new HTTP).path(e.split("/"));
        console.log(t);
        var o = $(`.modalmenu[href='${e}']`);
        if (o.length > 0 && o.data("modal")) return void o.trigger("click");
        document.location.href = (new HTTP).path(e.split("/"))
    }, this.redirecttag = function (e) {
        (new HTTP).tagpath(e.split("/"));
        var t = $(`.modalmenu[href='#${e}']`);
        if (t.length > 0 && t.data("modal")) return void t.trigger("click");
        document.location.href = (new HTTP).tagpath(e.split("/"))
    }, this.evaluateTokenHTML = function (e) {
        var t = new SESSION;
        return !(!t.isLogged() || void 0 === e.data.apptoken) && (t.terminated(), !0)
    }, this.setToken = function (e) {
        var t = new SESSION;
        if (new t.isLogged && null !== t.current()) {
            e.defaults.headers.common["x-access-token"] = t.current().token, e.defaults.headers.common["x-access-userid"] = t.current().getID();
            try {
                e.defaults.headers.common["x-access-geturl"] = (new HTTP).tagpath("#" + baseController.currentModel.modelName)
            } catch (e) {
            }
        }
    }, this.evaluate = function (e) {
        STORAGE.exist("warningRequests") && (WARNINGREQUESTS = STORAGE.get("warningRequests")), DSON.oseaX(WARNINGREQUESTS) && (WARNINGREQUESTS = []);
        var t = {
            url: e.config.url,
            method: e.config.method,
            time: e.config.responseTimestamp - e.config.requestTimestamp,
            date: new Date,
            params: e.config.paramSerializer()
        };
        "GET" === t.method && t.time > CONFIG.performance.http.get && WARNINGREQUESTS.push(t), "POST" === t.method && t.time > CONFIG.performance.http.post && WARNINGREQUESTS.push(t), STORAGE.add("warningRequests", WARNINGREQUESTS), baseController.WARNINGREQUESTS = WARNINGREQUESTS
    }, this.openManager = function () {
        baseController.viewData = {staticdata: WARNINGREQUESTS};
        var e = {
            header: {title: MESSAGE.ic("navbar.RequestManager"), icon: "stack-text"},
            footer: {cancelButton: !0},
            content: {loadingContentText: MESSAGE.i("actions.Loading")}
        };
        baseController.currentModel.modal.modalView("../templates/components/requestManager", e)
    }, this.resetManager = function () {
        WARNINGREQUESTS.length ? SWEETALERT.confirm({
            message: "This option reset all persisted data for Request Manager system, are you sure?",
            confirm: function () {
                STORAGE.delete("warningRequests"), WARNINGREQUESTS = [], MODAL.close(baseController.currentModel)
            }
        }) : SWEETALERT.show({message: "There is not persisted data to restore in Request Manager."})
    }
}, $(document).ready(function () {
    $(document).on("click", ".modalmenu", function () {
        var e = $(this), t = e.data("modal"), o = e.find("i:eq(0)").attr("class"), n = e.find("span:eq(0)").html(),
            r = e.attr("href").replace("#", ""), a = r.split("/");
        if (a.length > 0) {
            location.href = "#information/about", $("body").removeClass("sidebar-mobile-main");
            var i = a[0];
            MENUMODAL = !0, MODAL.rawModal(n, r, o.replace("icon-", ""), t, i)
        }
        return !1
    }), $(window).bind("hashchange", function () {
        CHANGINGMENU = !0, $("body").removeClass("sidebar-mobile-main"), FIXELEMENT.elements = [], DSON.oseaX(outanimation) ? ANGULARJS.get("baseController").base() : (new ANIMATION).playPure($("#content"), outanimation, function () {
            ANGULARJS.get("baseController").base()
        })
    })
});
