app.controller("dragon_audit", function ($scope, $http, $compile) {
    dragon_audit = this;
    dragon_audit.LAN = LAN;
    dragon_audit.session = new SESSION().current();
    dragon_audit.LAN = LAN;
    //dragon_audit.fixFilters = [];
    //dragon_audit.singular = "singular";
    //dragon_audit.plural = "plural";
    //dragon_audit.headertitle = "Hola Title";
    //dragon_audit.destroyForm = false;
    //dragon_audit.permissionTable = "tabletopermission";
    //comentario placebo

    dragon_audit.tab = "active";

    dragon_audit.arrays = [];


    dragon_audit.storageModel = MODAL.current().storageModel || eval(`CRUD_${dragon_audit.storageModel}`).table.view;
    if (eval(` typeof CRUD_${dragon_audit.storageModel} === "undefined"`)) {
        eval(`CRUD_${dragon_audit.storageModel} = {}`);
        eval(`CRUD_${dragon_audit.storageModel}.table = {}`);
        eval(`CRUD_${dragon_audit.storageModel}.table.audit =  dragon_audit.storageModel`);
    }
    if (eval(`CRUD_${dragon_audit.storageModel}`).table.audit)
        dragon_audit.storageModel = eval(`CRUD_${dragon_audit.storageModel}`).table.audit;
    dragon_audit.filter_click = async function () {
        var accion = dragon_audit.form.selected('audit_action');
        if (accion) {
            if (dragon_audit.session.super) {
                dragon_audit.fixFilters = [
                    {
                        "open": "(",
                        "field": "modelname",
                        "value": dragon_audit.storageModel
                    },
                    {
                        "field": "action",
                        "value": accion.nombre,
                        "close": ")",
                        "connector": " AND "
                    }
                ]
            } else {
                dragon_audit.fixFilters = [
                    {
                        "open": "(",
                        "field": "modelname",
                        "value": dragon_audit.storageModel
                    },
                    {
                        "field": "action",
                        "value": accion.nombre,
                        "close": ")",
                        "connector": " AND "
                    }
                ];
            }
            dragon_audit.refresh();
        }
    };
    if (dragon_audit.session.super) {
        dragon_audit.fixFilters = [
            {
                "open": "(",
                "field": "modelname",
                "value": dragon_audit.storageModel
            },
            {
                "field": "action",
                "value": "insert",
                "close": ")",
                "connector": " AND "
            }
        ]
    } else {
        dragon_audit.fixFilters = [
            {
                "open": "(",
                "field": "modelname",
                "value": dragon_audit.storageModel
            },
            {
                "field": "action",
                "value": "insert",
                "close": ")",
                "connector": " AND "
            }
        ];
    }

    function isIsoDate(str) {
        if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
        var d = new Date(str);
        return d.toISOString() === str;
    }


    function isValidDate(dateString) {
        var regEx = /^(19[5-9][0-9]|20[0-4][0-9]|2050)[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12][0-9]|3[01])$$/;
        return dateString.match(regEx) != null;
    }

    dragon_audit.showfields = false;
    dragon_audit.openTab = async function (action) {
        if (dragon_audit.session.super) {
            dragon_audit.fixFilters = [
                {
                    "open": "(",
                    "field": "modelname",
                    "value": dragon_audit.storageModel
                },
                {
                    "field": "action",
                    "value": action,
                    "close": ")",
                    "connector": " AND "
                }
            ]
        } else {
            dragon_audit.fixFilters = [
                {
                    "open": "(",
                    "field": "modelname",
                    "value": dragon_audit.storageModel
                },
                {
                    "field": "action",
                    "value": action,
                    "close": ")",
                    "connector": " AND "
                }
            ];
        }

        if (action == 'app') {
            if (dragon_audit.session.super) {
                dragon_audit.fixFilters = [
                    {
                        "open": "(",
                        "field": "modelname",
                        "value": dragon_audit.storageModel
                    },
                    {
                        "field": "action",
                        "operator": "!=",
                        "value": "insert"
                    },
                    {
                        "field": "action",
                        "operator": "!=",
                        "value": "delete"
                    },
                    {
                        "field": "action",
                        "operator": "!=",
                        "value": "update",
                        "close": ")",
                        "connector": " AND "
                    }
                ]
            } else {
                dragon_audit.fixFilters = [
                    {
                        "open": "(",
                        "field": "modelname",
                        "value": dragon_audit.storageModel
                    },
                    {
                        "field": "action",
                        "operator": "!=",
                        "value": "insert"
                    },
                    {
                        "field": "action",
                        "operator": "!=",
                        "value": "delete"
                    },
                    {
                        "field": "action",
                        "operator": "!=",
                        "value": "update",
                        "close": ")",
                        "connector": " AND "
                    }
                ];
            }
            dragon_audit.showfields = true;
        } else {
            dragon_audit.showfields = false;
        }

        if (action == 'update' || action == 'app') {
            if (dragon_audit.session.super) {
                dragon_audit.arrays = await BASEAPI.listp('dragon_audit', {
                    "where": [
                        {
                            "open": "(",
                            "field": "modelname",
                            "operator": "=",
                            "value": dragon_audit.storageModel
                        },
                        {
                            "field": "action",
                            "operator": "=",
                            "value": action,
                            "close": ")",
                            "connector": " AND "
                        }
                    ]
                });
            } else {
                dragon_audit.arrays = await BASEAPI.listp('dragon_audit', {
                    "where": [
                        {
                            "open": "(",
                            "field": "modelname",
                            "operator": "=",
                            "value": dragon_audit.storageModel
                        },
                        {
                            "field": "action",
                            "operator": "=",
                            "value": action,
                            "close": ")",
                            "connector": " AND "
                        }
                    ]
                });
            }

            dragon_audit.data = [];

            // var deleteKey = eval(`CRUD_${dragon_audit.storageModel}`).table.key;
            // for (var item of dragon_audit.arrays.data) {
            //     var newObject = {};
            //
            //     for (var i in item.updatedJson) {
            //         if (CONFIG.black_list.indexOf(i) === -1) {
            //             if (isIsoDate(item.updatedJson[i]) == true) {
            //                 newObject[i + "_new"] = LAN.date(item.updatedJson[i]);
            //             } else {
            //                 newObject[i + "_new"] = item.updatedJson[i];
            //             }
            //
            //             delete newObject[deleteKey + "_old"];
            //             newObject[i + "_old"] = item.dataJson[i];
            //         }
            //     }
            //     newObject["username"] = item.username;
            //     newObject["date"] = LAN.date(item.date);
            //     newObject["ip"] = item.ip;
            //     dragon_audit.data.push(newObject);
            // }
            // console.log(dragon_audit.data);
        }
        console.log(isValidDate('2019/09/19'));
        dragon_audit.goPage(1);
        dragon_audit.refresh();
    };

    dragon_audit.oldNew = function (key, value) {
        var originalKey = key.split("_")[0];
        var type = key.split("_")[1];

        if (type == "new") {
            return value[key];
        } else {
            if (value[originalKey + "_new"] != value[originalKey + "_old"]) {
                return `<b>${value[key]}</b>`;
                //return value[key];
            } else {
                return value[key];
                // return `<b>${value[key]}</b>`;
            }
        }
    };

    dragon_audit.setName = function (key) {
        var keyName = key.replace("_new", "").replace("_old", "");

        if (CONFIG.black_list.indexOf(keyName) === -1) {
            return MESSAGE.ic("columns." + keyName);
        }
        //return key;
    };

    RUNCONTROLLER("dragon_audit", dragon_audit, $scope, $http, $compile);
    RUN_B("dragon_audit", dragon_audit, $scope, $http, $compile);
    dragon_audit.show_aplication_tab = false;

    dragon_audit.formulary = function (data, mode, defaultData) {
        if (dragon_audit !== undefined) {
            RUN_B("dragon_audit", dragon_audit, $scope, $http, $compile);
            dragon_audit.form.modalWidth = ENUM.modal.width.large;
            dragon_audit.form.readonly = {};
            dragon_audit.createForm(data, mode, defaultData);
            $scope.$watch("dragon_audit.modelname", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(dragon_audit, 'modelname', rules);
            });
            $scope.$watch("dragon_audit.action", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(dragon_audit, 'action', rules);
            });
            $scope.$watch("dragon_audit.dataJson", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(dragon_audit, 'dataJson', rules);
            });
            $scope.$watch("dragon_audit.date", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(dragon_audit, 'date', rules);
            });
            $scope.$watch("dragon_audit.version", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(dragon_audit, 'version', rules);
            });
            $scope.$watch("dragon_audit.ip", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(dragon_audit, 'ip', rules);
            });
        }
    };

    dragon_audit.magic = function (field) {
        //dragon_audit.storageModel
    }
    // dragon_audit.triggers.table.after.load = function (records) {
    //     //dragon_audit.runMagicColum('@thistable', '@thisfield','@relationtable','@relationfield');
    //     //console.log(`dragon_audit.triggers.table.after.load dragon_audit`);
    // };
    // dragon_audit.triggers.table.before.load = () => new Promise((resolve, reject) => {
    //     //console.log(`dragon_audit.triggers.table.before.load dragon_audit`);
    //     resolve(true);
    // });
    //
    // dragon_audit.triggers.table.after.open = function (data) {
    //     //console.log(`dragon_audit.triggers.table.after.open dragon_audit`);
    // };
    // dragon_audit.triggers.table.before.open = () => new Promise((resolve, reject) => {
    //     //console.log(`dragon_audit.triggers.table.before.open dragon_audit`);
    //     resolve(true);
    // });
    //
    // dragon_audit.triggers.table.after.close = function (data) {
    //     //console.log(`dragon_audit.triggers.table.after.close dragon_audit`);
    // };
    // dragon_audit.triggers.table.before.close = () => new Promise((resolve, reject) => {
    //     //console.log(`dragon_audit.triggers.table.before.close dragon_audit`);
    //     resolve(true);
    // });
    //
    // dragon_audit.triggers.table.after.insert = function (data) {
    //     //console.log(`dragon_audit.triggers.table.after.insert dragon_audit`);
    //     return true;
    // };
    // dragon_audit.triggers.table.before.insert = (data) => new Promise((resolve, reject) => {
    //     //console.log(`dragon_audit.triggers.table.before.insert dragon_audit`);
    //     resolve(true);
    // });
    //
    // dragon_audit.triggers.table.after.update = function (data) {
    //     //console.log(`dragon_audit.triggers.table.after.update dragon_audit`);
    // };
    // dragon_audit.triggers.table.before.update = (data) => new Promise((resolve, reject) => {
    //     //console.log(`dragon_audit.triggers.table.before.update dragon_audit`);
    //     resolve(true);
    // });
    //
    // dragon_audit.triggers.table.after.control = function (data) {
    //     //console.log(`dragon_audit.triggers.table.after.control dragon_audit ${data}`);
    // };
    // dragon_audit.triggers.table.before.control = function (data) {
    //     //console.log(`dragon_audit.triggers.table.before.control dragon_audit ${data}`);
    // };
    //dragon_audit.beforeDelete = function (data) {
    //    return false;
    //};
    //dragon_audit.afterDelete = function (data) {
    //};
});
