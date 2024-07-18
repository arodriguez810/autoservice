HTTP = function () {
    this.hrefToObj = function () {
        var newobj = {};
        var url = location.href.split("?");
        if (url.length > 1) {
            var queries = url[1].split("&");
            for (var i in queries) {
                var values = queries[i].split("=");
                if (values.length > 1) {
                    var key = values[0];
                    var value = values[1];
                    eval(`newobj.${key} = value`);
                }
            }
        }
        return newobj;
    };
    this.hrefToMulObj = function () {
        var newobj = {};
        var url = location.href.split("?");
        if (url) {
            for (var j in url) {
                var queries = url[j].split("&");
                for (var i in queries) {
                    var values = queries[i].split("=");
                    if (values.length > 1) {
                        var key = values[0];
                        var value = values[1];
                        eval(`newobj.${key} = value`);
                    }
                }
            }
        }
        return newobj;
    };
    this.objToQuery = function (obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    };
    this.path = function (pathsarray) {
        var formurl = [];
        formurl.push(`http${CONFIG.proxy.ssl ? "s" : ""}://${CONFIG.proxy.subdomain !== "" ? (CONFIG.proxy.subdomain + ".") : ""}${CONFIG.proxy.domain}${CONFIG.proxy.port === 80 || CONFIG.proxy.port === 443 ? "" : ":" + CONFIG.proxy.port}`);
        return formurl.concat(pathsarray).join("/");
    };
    this.folderpath = function (pathsarray) {
        var formurl = [];
        formurl.push(`http${CONFIG.proxy.ssl ? "s" : ""}://${CONFIG.proxy.subdomain !== "" ? (CONFIG.proxy.subdomain + ".") : ""}${CONFIG.proxy.domain}${CONFIG.proxy.port === 80 || CONFIG.proxy.port === 443 ? "" : ":" + CONFIG.proxy.port}${CONFIG.folderslash || ''}`);
        return formurl.concat(pathsarray).join("/");
    };
    this.folderredirect = function (path) {
        var url = new HTTP().path(path.split('/'));
        console.log(url);
        var $menu = $(`.modalmenu[href='${path}']`);
        if ($menu.length > 0) {
            var modal = $menu.data('modal');
            if (modal) {
                $menu.trigger("click");
                return;
            }
        }
        document.location.href = new HTTP().folderpath(path.split('/'));
    };
    this.cleanRoot = function (path) {
        return path.replaceAll(new HTTP().path([]), "");
    };
    this.tagpath = function (pathsarray) {
        var formurl = [];
        pathsarray[0] = "#" + pathsarray[0];
        formurl.push(`http${CONFIG.proxy.ssl ? "s" : ""}://${CONFIG.proxy.subdomain !== "" ? (CONFIG.proxy.subdomain + ".") : ""}${CONFIG.proxy.domain}${CONFIG.proxy.port === 80 || CONFIG.proxy.port === 443 ? "" : ":" + CONFIG.proxy.port}${CONFIG.folderslash || ''}`);
        return formurl.concat(pathsarray).join("/");
    };
    this.redirect = function (path) {
        var url = new HTTP().path(path.split('/'));
        console.log(url);
        var $menu = $(`.modalmenu[href='${path}']`);
        if ($menu.length > 0) {
            var modal = $menu.data('modal');
            if (modal) {
                $menu.trigger("click");
                return;
            }
        }
        document.location.href = new HTTP().path(path.split('/'));
    };
    this.redirecttag = function (path) {
        var url = new HTTP().tagpath(path.split('/'));
        var $menu = $(`.sidebar-content .modalmenu[href='#${path}']`);
        if ($menu.length > 0) {
            var modal = $menu.data('modal');
            if (modal) {
                $menu.trigger("click");
                return;
            }
        }
        document.location.href = new HTTP().tagpath(path.split('/'));
    };
    this.evaluateTokenHTML = function (data) {
        var session = new SESSION();
        if (session.isLogged()) {
            if (data.data.apptoken !== undefined) {
                session.terminated();
                return true;
            }
        }
        return false;
    };
    this.setToken = function ($http) {
        var session = new SESSION();
        if (new session.isLogged())
            if (session.current() !== null) {
                $http.defaults.headers.common['x-access-token'] = session.current().token;
                $http.defaults.headers.common['x-access-userid'] = session.current().getID();
                try {
                    $http.defaults.headers.common['x-access-geturl'] = new HTTP().tagpath("#" + baseController.currentModel.modelName);
                } catch (e) {
                }

            }
    };
    this.allowOrigin = function ($http) {
        $http.defaults.headers.common['Access-Control-Allow-Origin'] = "*";
        console.log($http.defaults.headers);
    };
    this.evaluate = function (data) {
        if (STORAGE.exist('warningRequests')) {
            WARNINGREQUESTS = STORAGE.get('warningRequests');
        }
        if (DSON.oseaX(WARNINGREQUESTS))
            WARNINGREQUESTS = [];
        var analize = {
            url: data.config.url,
            method: data.config.method,
            time: data.config.responseTimestamp - data.config.requestTimestamp,
            date: new Date(),
            params: data.config.paramSerializer()
        };
        if (analize.method === "GET") {
            if (analize.time > CONFIG.performance.http.get) {
                WARNINGREQUESTS.push(analize);
            }
        }
        if (analize.method === "POST") {
            if (analize.time > CONFIG.performance.http.post) {
                WARNINGREQUESTS.push(analize);
            }
        }
        STORAGE.add('warningRequests', WARNINGREQUESTS);
        baseController.WARNINGREQUESTS = WARNINGREQUESTS;
    };
    this.openManager = function () {
        baseController.viewData = {
            staticdata: WARNINGREQUESTS
        };
        var modal = {
            header: {
                title: MESSAGE.ic('navbar.RequestManager'),
                icon: "stack-text"
            },
            footer: {
                cancelButton: true
            },
            content: {
                loadingContentText: MESSAGE.i('actions.Loading')
            },
        };
        baseController.currentModel.modal.modalView("../templates/components/requestManager", modal);
    };
    this.resetManager = function () {
        if (WARNINGREQUESTS.length)
            SWEETALERT.confirm({
                message:
                    "This option reset all persisted data for Request Manager system, are you sure?",
                confirm: function () {
                    STORAGE.delete('warningRequests');
                    WARNINGREQUESTS = [];
                    MODAL.close(baseController.currentModel);
                }
            });
        else
            SWEETALERT.show({message: "There is not persisted data to restore in Request Manager."});
    }
};
$(document).ready(function () {
    $(document).on('click', '.modalmenu', function () {
        var $me = $(this);
        var width = $me.data('modal');
        var icon = $me.find('i:eq(0)').attr('class');
        var title = $me.find('span:eq(0)').html();
        var link = $me.attr('href').replace('#', '');
        var paths = link.split('/');
        if (paths.length > 0) {
            location.href = `#information/about`;
            $("body").removeClass("sidebar-mobile-main");
            var controller = paths[0];
            MENUMODAL = true;
            MODAL.rawModal(title, link, icon.replace('icon-', ''), width, controller);
        }
        return false;
    });

    $(document).on('click', '#losseparator a', function () {
        $("#losseparator").hide("fast");
    });
    $(document).on('dblclick', '.navbar-brand-text', function () {
        if (MENU.reseler)
            MENU.reseler();
    });
    $(window).bind('hashchange', function () { //detect hash change
        CHANGINGMENU = true;
        $("body").removeClass("sidebar-mobile-main");
        if (location.href.indexOf("#information/about") === -1) {
            location.reload();

        }
        // FIXELEMENT.elements = [];
        // if (typeof outanimation !== "undefined") {
        //     if (!DSON.oseaX(outanimation)) {
        //         new ANIMATION().playPure($('#content'), outanimation, function () {
        //             ANGULARJS.get('baseController').base();
        //         });
        //     } else {
        //         ANGULARJS.get('baseController').base();
        //     }
        // }
    });
});
