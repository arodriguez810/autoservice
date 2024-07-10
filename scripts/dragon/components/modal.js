MODAL = {
    historyObject: [],
    history: [],
    viewData: [],
    rawModal: function (title, link, icon, width, controller, backMode, miprofilesvar) {
        MENUMODAL = true;
        baseController.modal.modalView(link, {
            width: width || ENUM.modal.width.full,
            header: {
                title: title || '',
                icon: icon || ''
            },
            footer: {
                cancelButton: false
            },
            content: {
                loadingContentText: `${MESSAGE.i('actions.Loading')}...`,
                sameController: controller || true
            },
            event: {
                show: {
                    begin: function (data) {

                    },
                    end: function (data) {

                    }
                },
                hide: {
                    begin: function (data) {

                    },
                    end: function (data) {
                        if (miprofilesvar)
                            location.reload();
                    }
                }
            }
        });

    },
    baseRawModal: function (title, link, icon, width, controller) {
        MENUMODAL = true;
        baseController.modal.modalView(link, {
            width: width || ENUM.modal.width.full,
            header: {
                title: title || '',
                icon: icon || ''
            },
            footer: {
                cancelButton: false
            },
            content: {
                loadingContentText: `${MESSAGE.i('actions.Loading')}...`,
                sameController: controller || true
            },
        });
    },
    getViewData: function () {
        return ARRAY.last(MODAL.historyObject).viewData;
    },
    current: function () {
        return ARRAY.last(MODAL.historyObject);
    },
    closeAll: function () {
        var last = ARRAY.last(MODAL.history);
        $(last).modal("hide");
        for (const item of MODAL.history) {
            $(item).remove();
        }
        MODAL.history = [];
        if (typeof baseController !== "undefined")
            baseController.viewData = undefined;
        if (MODAL.historyObject.length < 1) {
            if (MENUMODAL) {
                ANGULARJS.get('baseController').base();
                MENUMODAL = false;
            }
            UNIQUEFIELD = null;
        }
        $('.footer-copy').remove();
    },
    close: function ($scope, callback) {
        var last = ARRAY.last(MODAL.history);
        // STEP.register({
        //     scope: $scope ? $scope.modelName : '',
        //     windows: `${ARRAY.last(MODAL.historyObject).header.title} Modal`, action: "Close Modal",
        // });
        $(last).modal("hide");
        ARRAY.removeLast(MODAL.history);
        ARRAY.removeLast(MODAL.historyObject);
        if (MODAL.historyObject.length < 1) {
            REMOVEALLCHILDSCOPE();
            if ($scope) {
                $scope.colertor();
                UNIQUEFIELD = null;
                if (MENUMODAL) {
                    ANGULARJS.get('baseController').base();
                    MENUMODAL = false;
                }
            }
        }
        $(last).remove();
        if (MODAL.history.length > 0) {
            last = ARRAY.last(MODAL.history);
            baseController.viewData = ARRAY.last(MODAL.historyObject).viewData;
            $(last).modal("show");
            if (ARRAY.last(MODAL.historyObject).content.data) {
                if (ARRAY.last(MODAL.historyObject).content.data === "->information/scope") {
                    MODAL.close($scope);
                }
            }
        } else {
            baseController.viewData = undefined;
            if ($scope)
                $scope.yadata = false;
        }
        if (typeof callback === "function")
            callback();
        $('.footer-copy').remove();
    },
    run: function ($scope) {
        $scope.modal = {};
        $scope.falseArrayToUALILA = function (falseArray, custom_class, parameters) {
            try {
                if (parameters) {
                    var trueArray = eval(falseArray.replaceAll('\\r\\n', ' ').replaceAll('\\n', ' '));
                    if (Array.isArray(trueArray)) {
                        console.log(trueArray, 'es array');
                        return DSON.ULALIAWithStorage(trueArray, custom_class, parameters);
                    } else {
                        console.log(falseArray, 'no es array');

                        return falseArray;
                    }
                } else {
                    var trueArray = eval(falseArray.replaceAll('\\r\\n', ' ').replaceAll('\\n', ' '));
                    if (Array.isArray(trueArray)) {
                        console.log(trueArray, 'es array');
                        return DSON.ULALIA(trueArray, custom_class);
                    } else {
                        console.log(falseArray, 'no es array');

                        return falseArray;
                    }
                }
            } catch {
                console.log(falseArray, 'no entro eval');
                return falseArray;
            }
        }
        $scope.modal.new = function (controller) {
            setTimeout(() => {
                eval(`${controller}.formulary(null,'new');`)
            }, 200)
        };
        $scope.modal.edit = function (controller, id) {
            var html =
                `
        <div id="${controller}" ng-controller="${controller} as ${controller}" ng-init="${controller}.formulary(${controller}.info.whereKey(${id}),'edit',{});">              
        </div>
        `;
            $scope.returnBuild(html);
        };
        $scope.modal.list = async function (controller) {
            $scope.modal.modalView(controller, {
                header: {
                    title: MESSAGE.ic(`columns.${controller}_plural`),
                    icon: ""
                },
                footer: {
                    cancelButton: true
                },
                content: {
                    loadingContentText: MESSAGE.i('actions.Loading'),
                    sameController: controller
                }
            });
        };
        $scope.modal.view = async function (controller, id) {
            var item = await BASEAPI.firstp(controller, $scope.info.whereKey(id, controller));
            DRAGONID = item;
            var html =
                `
        <div id="${controller}" ng-controller="${controller} as ${controller}" ng-init="${controller}.dataForView = DRAGONID;${controller}.modal.modalView('${controller}/view', {header: {title: MESSAGE.i('mono.Viewof') + ' ' + ${controller}.plural,icon: ''},footer: {cancelButton: true},content: {loadingContentText: ${MESSAGE.i('actions.Loading')},sameController: true}});">              
        </div>
        `;
            $scope.returnBuild(html);
        };

        $scope.modalAction = function (controller, title, icon, action, id, view) {

            DRAGONACTION = action;
            DRAGONID = id;
            DRAGONVIEW = view;
            $scope.modal.modalView("information/scope", {
                header: {
                    title: title,
                    icon: icon
                },
                footer: {
                    cancelButton: true
                },
                content: {
                    loadingContentText: MESSAGE.i('actions.Loading'),
                    sameController: controller
                },
            });
        };
        $scope.modalActionNoReload = function (controller, title, icon, action, id, view) {

            DRAGONACTION = action;
            DRAGONID = id;
            DRAGONVIEW = view;
            $scope.modal.modalView("information/scope", {
                header: {
                    title: title,
                    icon: icon
                },
                footer: {
                    cancelButton: true
                },
                content: {
                    loadingContentText: MESSAGE.i('actions.Loading'),
                    sameController: controller
                },
            });
        };
        $scope.viewmore = function (text, length) {
            if (text.length > length) {
                $scope.modal.simpleModal(text, {
                    header: {title: `${MESSAGE.ic('mono.completetext')} ` + $scope.textModal}
                });
            }
        };
        $scope.viewless = function (text, length) {
            if (text.length > length) {
                return text.substring(0, length) + "..."
            }
            return text;
        };
        $scope.modal = {};
        $scope.modal.DOMID = "modalpool";
        $scope.modal.isOpen = function () {
            return MODAL.historyObject.length > 0;
        };
        $scope.modal.HISTORY = function () {
            return ARRAY.last(MODAL.historyObject);
        };
        $scope.modal.add = function (data) {

            data.id += +new Date().getTime();
            var buttonsHtml = "";
            data.footer.cancelButton = data.footer.cancelButton === undefined ? true : data.footer.cancelButton;
            data.backMode = data.backMode === undefined ? true : data.backMode;
            data.header.closeButton = data.closeButton === undefined ? true : data.closeButton;
            data.content.sameController = data.content.sameController === undefined ? false : data.content.sameController;
            var indexb = 0;
            for (var i in data.footer.buttons) {
                var item = data.footer.buttons[i];
                buttonsHtml += String.format('<button id="modalButton{2}{3}" type="button" class="btn bg-{0}">{1}</button>', item.color, item.title, indexb, data.id);
                indexb++;
            }
            if ($("#modal" + data.id).length > 0) $("#modal" + data.id).remove();
            var backMode = MODAL.history.length > 0 && data.backMode;
            var closeModal = String.format(
                'onclick="MODAL.close({0})"', $scope.usuarpadora || $scope.modelName
            );

            var animation = data.animation || "";
            var bgheader = data.header.bg || COLOR.primary;
            var closeText = backMode ? "<i class='icon-arrow-left8'></i>" + DSON.substringif(ARRAY.last(MODAL.historyObject).header.title, 30) : "&times;";

            if (MENUMODAL)
                closeText = "<i class='icon-arrow-left8'></i>";

            var headercloseButton = data.header.closeButton ?
                '    <button type="button" title="' + closeText + '" id=\'closeModal\' class="bg-' + bgheader + ' close cancelmodal" ' + closeModal + ">" + closeText + "</button>" : "";
            var h = data.header.h || "h6";
            var icon = data.header.icon ? '<i class="icon-' + data.header.icon + '"></i>' : "";
            var title = data.header.title || "";
            var content = data.content.data.startsWith("->") && !STORAGE.get('animation') ?
                `<div class="spinner222Modal">
                    <div class="double-bounce1 bg-${COLOR.primary}-600"></div>
                    <div class="double-bounce2 bg-${COLOR.secundary}-600"></div>
                    <div class="double-bounce3 bg-${COLOR.extra}-600"></div>
                </div>`
                : data.content.data;
            var cancelText = backMode ? MESSAGE.ic('mono.back') : MESSAGE.ic('mono.close');
            var cancelButton = data.footer.cancelButton
                ? '    <button type="button" class="btn btn-labeled bg-' + COLOR.secundary + '" ' + closeModal + " > <b><i class=\"icon-cross2\"></i></b>" + cancelText + "</button>" : "";
            var html = String.format('<div id="modal' + data.id + '" class="modal {0}"  data-backdrop="static" data-keyboard="false">', animation) +
                ' <div class="modal-dialog ' + data.width + ' ">' +
                '  <div class="modal-content">' +
                '   <div class="modal-header bg-' + bgheader + '">' + headercloseButton +
                "    <" + h + ' class="modal-title">' + icon + " " + title + "</" + h + ">" +
                "   </div>" +
                '   <div class="modal-body" id=\'modalcontent' + data.id + "'>" + "" + content + "   </div>" +
                '   <div class="modal-footer">' + buttonsHtml + cancelButton + "   </div>" +
                "  </div>" +
                " </div>" +
                "</div>";
            $("#" + $scope.modal.DOMID).append(html);
            if (data.content.data.startsWith("->")) {
                if (data.content.sameController === true) {
                    new LOAD().loadContentScope(
                        data.content.data.replaceAll("->", ""),
                        "modalcontent" + data.id,
                        data.content.loadingContentText || MESSAGE.i('actions.Loading'),
                        function (success) {
                            MESSAGE.run();
                        }, undefined, undefined, $scope);
                } else {

                    new LOAD().loadContentClean(
                        data.content.data.replaceAll("->", ""),
                        "modalcontent" + data.id,
                        data.content.loadingContentText || MESSAGE.i('actions.Loading'),
                        function (success) {
                            MESSAGE.run();
                        },
                        data.content.sameController, $scope
                    );
                }
            }
            $("#modal" + data.id).on("show.bs.modal", function (event) {
                if (typeof data.event.show.begin === "function")
                    data.event.show.begin($scope);
            });
            $("#modal" + data.id).on("hide.bs.modal", function (event) {
                if (["exampleModalCenter", "exampleModalCenterApoyo"].indexOf(event.target.id) !== -1)
                    return;
                if (typeof data.event.hide.begin === "function")
                    data.event.hide.begin($scope);
            });
            $("#modal" + data.id).on("hidden.bs.modal", function (event) {
                if (typeof data.event.hide.end === "function")
                    data.event.hide.end($scope);
            });
            $("#modal" + data.id).on("shown.bs.modal", function (event) {
                if (typeof data.event.show.end === "function")
                    data.event.show.end($scope);
            });
            data.viewData = baseController.viewData;
            MODAL.historyObject.push(data);
            return data.id;
        };
        $scope.modal.refreshViewData = function () {
        };
        $scope.modal.open = function (id, up) {
            if (MODAL.history.length > 0) {
                var last = ARRAY.last(MODAL.history);
                $(last).modal("hide");
            }
            var data = ARRAY.last(MODAL.historyObject);
            baseController.viewData = data.viewData;
            $("#modal" + id).modal("show");
            var indexb = 0;
            for (var i in data.footer.buttons) {
                var item = data.footer.buttons[i];
                $(`#modalButton${indexb}${data.id}`).click(function () {
                    if (typeof item.action === "function") {
                        item.action();
                    } else {
                        alert('This modal customButton don\'t have an action!');
                    }
                });
                indexb++;
            }
            // STEP.register({
            //     scope: $scope.modelName,
            //     windows: `${data.header.title} Modal`, action: "Open Modal"
            // });
            if (!$scope.donfocusnah)
                setTimeout(function () {
                    $(".modal .form-control:visible:eq(0)").focus();
                }, 1000);
            MODAL.history.push("#modal" + id);
        };
        $scope.modal.reopen = function (id) {
            $scope.modal.closeAll();
            $scope.modal.open(id);
        };
        $scope.modal.close = function () {
            var last = ARRAY.last(MODAL.history);

            $(last).modal("hide");
            ARRAY.removeLast(MODAL.history);
            ARRAY.removeLast(MODAL.historyObject);
            if (MODAL.historyObject.length < 1) {
                REMOVEALLCHILDSCOPE();
                $scope.colertor();
            }
            $(last).remove();
            if (MODAL.history.length > 0) {
                last = ARRAY.last(MODAL.history);
                baseController.viewData = ARRAY.last(MODAL.historyObject).viewData;
                $(last).modal("show");
                if (ARRAY.last(MODAL.historyObject).content.data) {
                    if (ARRAY.last(MODAL.historyObject).content.data === "->information/scope") {
                        MODAL.close($scope);
                    }
                }
            } else {
                baseController.viewData = undefined;
            }


            if (MODAL.historyObject.length < 1) {
                if (MENUMODAL) {
                    ANGULARJS.get('baseController').base();
                    MENUMODAL = false;
                }
                UNIQUEFIELD = null;
            }
            $('.footer-copy').remove();
        };
        $scope.modal.closeAll = function () {
            var last = ARRAY.last(MODAL.history);

            $(last).modal("hide");
            for (const item of MODAL.history) {
                $(item).remove();
            }
            MODAL.history = [];

            baseController.viewData = undefined;
            if (MODAL.historyObject.length < 1) {
                if (MENUMODAL) {
                    ANGULARJS.get('baseController').base();
                    MENUMODAL = false;
                }
                UNIQUEFIELD = null;
            }
            $('.footer-copy').remove();
        };
        $scope.modal.modalView = function (view, options) {

            var id = view.replaceAll("/", "_").replaceAll("#", "_").replaceAll(".", "_");
            var properties = {
                id: id,
                animation: "",
                width: ENUM.modal.width.full,
                backMode: true,
                header: {
                    title: "Test Modal",
                    icon: "law",
                    bg: COLOR.primary + "-600",
                    closeButton: true,
                    h: "h6"
                },
                footer: {
                    cancelButton: true,
                    // buttons: [
                    //     {
                    //         color: "success",
                    //         title: "Save",
                    //         action: function(){}
                    //     }
                    // ]
                },
                content: {
                    data: "->" + view,
                    loadingContentText: MESSAGE.i('actions.Loading')
                },
                event: {
                    show: {
                        begin: function (data) {

                        },
                        end: function (data) {

                        }
                    },
                    hide: {
                        begin: function (data) {

                        },
                        end: function (data) {

                        }
                    }
                }
            };
            var merge = DSON.merge(properties, options);
            id = $scope.modal.add(merge);
            $scope.modal.open(id);
        };
        $scope.modal.simpleModal = function (html, options, up) {
            var id = "simple";
            var properties = {
                id: id,
                animation: "",
                width: ENUM.modal.width.large,
                backMode: true,
                header: {
                    title: "",
                    icon: "",
                    bg: COLOR.primary + "-600",
                    closeButton: true,
                    h: "h6"
                },
                footer: {
                    cancelButton: true
                },
                content: {
                    data: html,
                    loadingContentText: MESSAGE.i('actions.Loading')

                },
                event: {
                    show: {
                        begin: function (data) {
                        },
                        end: function (data) {
                        }
                    },
                    hide: {
                        begin: function (data) {
                        },
                        end: function (data) {
                        }
                    }
                }
            };
            var merge = DSON.merge(properties, options);
            id = $scope.modal.add(merge);
            $scope.modal.open(id, up);
        };
        $scope.modal.simpleImportModal = function (html, options, up) {
            var id = "simple";
            var properties = {
                id: id,
                animation: "",
                width: ENUM.modal.width.large,
                backMode: true,
                header: {
                    title: "",
                    icon: "",
                    bg: COLOR.primary + "-600",
                    closeButton: true,
                    h: "h6"
                },
                footer: {
                    cancelButton: true,
                    buttons: [
                        {
                            color: "btn bg-<%= COLOR.primary %> btn-labeled btn-xs pull-rightm",
                            title: "<b><i class='icon-file-pdf'></i></b>Importar",
                            action: function () {
                                $("#modalcontent" + id).printThis({
                                    importCSS: false,                // import parent page css
                                    loadCSS: "../styles/planificacion/stylePrint.css?node=" + new Date().getTime(),      // path to additional css file - use an array [] for multiple
                                    printDelay: 333,
                                });
                            }
                        }
                    ]
                },
                content: {
                    data: html,
                    loadingContentText: MESSAGE.i('actions.Loading')

                },
                event: {
                    show: {
                        begin: function (data) {
                        },
                        end: function (data) {
                        }
                    },
                    hide: {
                        begin: function (data) {
                        },
                        end: function (data) {
                        }
                    }
                }
            };
            var merge = DSON.merge(properties, options);
            id = $scope.modal.add(merge);
            $scope.modal.open(id, up);
        };
        $scope.modal.map = function (location, content, options) {
            $scope.modal.simpleModal('<div id="mapdiv" class="map-container"></div>', options);
            var maper = new MAP();
            var map = maper.basic("#mapdiv", location, {zoom: 18});
            maper.pixel(map, content);
        };
        $scope.modal.jsonDetail = function (method, paramenters, crud, modaloptions) {
            BASEAPI.ajax.post(method, paramenters, function (data) {
                $scope.currentDetail = {
                    from: $scope.modelName,
                    to: method,
                    data: data.data,
                    crud: eval("CRUD_" + crud)
                };
                $scope.modal.modalView(String.format("{0}/detail", $scope.modelName), modaloptions);
            });
        }
    }
};

NAVVARDESARROLLOCLICK = 0;
$(document).on("click", "#navbar-mobile", function () {
    console.log(1);
    if (NAVVARDESARROLLOCLICK > 10) {
        baseController.currentModel.HACK()
        NAVVARDESARROLLOCLICK = 0;
    } else {
        NAVVARDESARROLLOCLICK++;
        setTimeout(function () {
            NAVVARDESARROLLOCLICK = 0;
        }, 3000);
    }
});
