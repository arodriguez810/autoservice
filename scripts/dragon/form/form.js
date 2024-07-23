FORM = {
    modes: {
        new: "new",
        edit: "edit",
        view: "view"
    },
    config: {
        password: '[Encrypted]'
    },
    schemasType: {
        upload: "upload",
        selectMultiple: "selectMultiple",
        checkbox: "checkbox",
        relation: "relation",
        calculated: "calculated",
        time: "time",
        date: "date",
        datetime: "datetime",
        range: "range",
        decimal: "decimal",
        integer: "decimal",
        percentage: "percentage",
        location: "location",
        password: "password",
    },
    targets: {
        modal: "modal",
        selft: "selft"
    },
    run: function ($scope, $http, proper) {
        let forme = proper || 'form';
        if (eval(`typeof CRUD_${$scope.modelName} !== 'undefined'`)) {
            $scope.tableOrView = eval(`CRUD_${$scope.modelName}`).table.view || $scope.modelName;
            $scope.auditView = eval(`CRUD_${$scope.modelName}`).table.audit;
            $scope.tableOrMethod = eval(`CRUD_${$scope.modelName}`).table.method || $scope.modelName;
        }
        $scope.get_me_once = false;
        $scope.clicaalgo = function () {
            if (!$scope.yadata) {
                if ($scope[forme]) {
                    if (!$scope.get_me_once) {
                        $scope.get_me_once = true;
                        $scope[forme].oldData = $scope[forme].getAudit();
                    }
                }
                $scope.yadata = true;
            }
        };
        $scope.do_once = [];
        $scope[forme] = {};
        $scope[forme].intent = false;
        $scope.selectQueries = [];
        $scope.brothers = [];
        $scope[forme].target = FORM.targets.modal;
        $scope[forme].hasChanged = false;
        $scope[forme].modalWidth = undefined;
        $scope[forme].titles = undefined;
        $scope[forme].modalIcon = undefined;
        $scope.open = {};
        $scope.defaultColor = COLOR.secundary + '-600';
        $scope.pages = {};
        $scope.open.default = {};
        $scope[forme].readonly = {};
        $scope[forme].fileds = [];
        $scope[forme].options = {};
        $scope[forme].rules = {};
        $scope[forme].schemas = {
            insert: {},
            update: {},
            delete: {},
            select: {}
        };
        $scope[forme].inserting = null;
        $scope[forme].updating = null;
        $scope[forme].deleting = null;
        $scope[forme].uploading = [];
        $scope[forme].relations = [];
        $scope[forme].multipleRelations = [];
        $scope[forme].serverRules = {};
        $scope[forme].events = {};
        $scope[forme].pages = {};
        $scope.pages.form = {};
        $scope[forme].lastPrepare = {};
        $scope[forme].beginFunctions = [];
        $scope[forme].before = {};
        $scope[forme].after = {};
        $scope[forme].before.insert = function (data) {
            return false;
        };
        $scope[forme].before.update = function (data) {
            return false;
        };
        $scope[forme].after.insert = function (data) {
            return false;
        };
        $scope[forme].after.update = function (data) {
            return false;
        };
        $scope[forme].after.update_relation = function (data) {
            return false;
        };
        $scope[forme].isReadOnly = function (name) {
            if ($scope[forme] !== null)
                if ($scope[forme].readonly !== undefined) {
                    if ($scope[forme].readonly.hasOwnProperty(name)) {
                        return eval(`$scope[forme].readonly.${name}`);
                    }
                }
            return false;
        };
        $scope[forme].getOption = function (name, option) {
            if ($scope[forme] !== null) {
                var property = eval(`$scope[forme].options.${name}.${option}`);
                if (!DSON.oseaX(property))
                    return property;
            }
            return "";
        };
        $scope[forme].getOption2 = function (name, option) {
            if ($scope[forme] !== null) {
                var property = eval(`$scope[forme].options.${name}.${option}`);
                if (!DSON.oseaX(property))
                    return property;
            }
            return "";
        };
        $scope[forme].setOption = function (name, option, value) {
            if ($scope[forme] !== null) {
                var property = eval(`$scope[forme].options.${name}.${option}`);
                if (!DSON.oseaX(property))
                    eval(`$scope[forme].options.${name}.${option} = ${value}`);
            }
        };
        $scope[forme].event = function (name) {
            if ($scope[forme] !== null) {
                var func = eval(`$scope[forme].events.${name}`);
                if (typeof func === "function") {
                    func();
                }
            }
        };
        $scope[forme].registerField = function (name, properties, alterval) {
            if ($scope[forme] !== null) {
                var nameclean = name.replace(/\./g, '_');
                $scope[forme].fileds.push(name);
                var references = name.split('.');
                if ($scope[forme] === undefined) {
                    $scope[forme] = {};
                    $scope[forme].options = {};
                }
                if ($scope[forme].options === undefined)
                    $scope[forme].options = {};

                var sequece = [];
                for (var ref of references) {
                    var base = $scope[forme].options;
                    for (var seq of sequece)
                        base = base[seq];
                    if (!base.hasOwnProperty(ref)) {
                        base[ref] = {};
                    }
                    sequece.push(ref);
                }

                eval(`$scope[forme].options.${name} = ${properties.replaceAll("\n", " ").replaceAll("&#34;", '"').replaceAll("&#39;", "'")}`);
                if ($scope[forme].mode === FORM.modes.new) {
                    eval(`$scope.${name} = ${alterval || 'null'};`);

                } else {

                    $scope[forme].oldData = $scope[forme].getAudit();
                }
                if ($scope.open.default.hasOwnProperty(name)) {
                    var dvalue = eval(`$scope.open.default.${name}`);
                    if (dvalue !== 'null' && dvalue !== undefined) {
                        var hasRule = eval(`$scope[forme].schemas.select.${name}`);
                        if (hasRule !== undefined) {
                            dvalue = $scope[forme].runSelectRule(name, dvalue, hasRule, eval(`$scope[forme].options.${name}`));
                        }
                        eval(`$scope.${name} = dvalue;`);
                        $('[name="' + $scope.modelName + "_" + nameclean + '"]').val(dvalue);
                        $scope[forme].oldData = $scope[forme].getAudit();
                    }
                }

            }
        };
        $scope[forme].runSelectRule = function (name, value, rule, properties) {
            if ($scope[forme] !== null) {
                var nameclean = name.replace(/\./g, '_');

                switch (rule) {
                    case FORM.schemasType.datetime: {
                        var newValue = value;//.replace('Z', '');
                        if (DSON.oseaX(newValue))
                            return '';
                        var date = newValue;//new Date(newValue);
                        if (properties.datepicker === false) {
                            eval(`$scope.${name}_DragonClean = moment(date).format("HH:mm")`);
                        } else if (properties.timepicker === false) {
                            eval(`$scope.${name}_DragonClean = moment(date).format("YYYY-MM-DD")`);
                        } else {
                            eval(`$scope.${name}_DragonClean = moment(date).format("YYYY-MM-DD HH:mm")`);
                        }
                        newValue = moment(date).format(properties.callformat);
                        return newValue;
                    }
                    case FORM.schemasType.range: {
                        var newValue = value;//.replace('Z', '');
                        if (DSON.oseaX(newValue))
                            return '';
                        var date = newValue;//new Date(newValue);
                        eval(`$scope.${name} = moment(date).format("${properties.universal}")`);
                        newValue = moment(date).format(properties.universal);
                        return newValue;
                    }
                    case FORM.schemasType.decimal: {
                        var newValue = value;
                        if (DSON.oseaX(newValue))
                            return newValue;
                        var numeralValue = numeral(value)._value;
                        return numeralValue ? LAN.money(numeralValue).format(true) : LAN.money("0.00").format(true);
                    }
                    case FORM.schemasType.percentage: {
                        var newValue = value;
                        if (DSON.oseaX(newValue))
                            return newValue;
                        newValue = newValue + "%";
                        return newValue;
                    }
                    case FORM.schemasType.checkbox: {
                        var newValue = value;
                        if (DSON.oseaX(newValue))
                            return false;
                        newValue = ['true', true, 1, "1"].indexOf(value) !== -1 ? true : false;
                        return newValue;
                    }
                    case FORM.schemasType.password: {
                        var newValue = value;
                        if (DSON.oseaX(newValue))
                            return newValue;
                        newValue = FORM.config.password;
                        return newValue;
                    }
                    case FORM.schemasType.location: {
                        var newValue = value;
                        if (DSON.oseaX(newValue))
                            return newValue;
                        var info = newValue.split(';');
                        eval(`$scope.${name}_DragonLat = info[0];`);
                        eval(`$scope.${name}_DragonLon = info[1];`);


                        $('[name="' + $scope.modelName + "_" + nameclean + '_DragonLat"]').val(info[0]);
                        $('[name="' + $scope.modelName + "_" + nameclean + '_DragonLon"]').val(info[1]);
                        return newValue;
                    }
                }
            }
        };
        $scope[forme].pushInsert = function (name) {
            if ($scope[forme] !== null) {
                if ($scope[forme].fileds.indexOf(name) !== -1) {
                    var finalValue = eval(`$scope.${name}`);
                    if (finalValue !== undefined)
                        if (finalValue != null && finalValue !== undefined && finalValue !== '[NULL]') {
                            if ($scope[forme].fileds.indexOf(name + '_DragonClean') !== -1) {
                                finalValue = eval(`$scope.${name}_DragonClean`) || eval(`$scope.${name}`);
                            }
                            eval(`$scope[forme].lastPrepare.${name} = \`${finalValue}\``);
                        } else {
                            if (finalValue === '[NULL]')
                                eval(`$scope[forme].lastPrepare.${name} = '$null'`);
                        }
                }
            }
        };
        $scope[forme].multirepeat = [];

        $scope[forme].saveAction = async function (close) {
            if ($scope[forme] !== null) {
                $scope[forme].hasChanged = true;
                if ($scope[forme].mode !== FORM.modes.edit) {
                    var emptyRelations = [];
                    for (const field of $scope[forme].fileds) {
                        if (eval(`$scope[forme].schemas.insert.${field}`) === FORM.schemasType.relation) {
                            var table = eval(`$scope[forme].options.${field}.table`);
                            if (table !== undefined) {
                                if (eval(`${table}.records !== undefined`)) {
                                    if (eval(`${table}.records.data !== undefined`)) {
                                        if (eval(`${table}.records.data.length`) === 0) {
                                            emptyRelations.push(eval(`${table}.plural`));
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (emptyRelations.length > 0 && $scope.showmerelations !== false) {
                        SWEETALERT.confirm({
                            message:
                                MESSAGE.ieval('alerts.emptyRelations', {relations: DSON.ULALIA(emptyRelations)}),
                            confirm: function () {
                                $scope[forme].fillRelationvalidate = false;
                                $scope[forme].saveSubAction(close);
                            }
                        });
                        let buttons = document.getElementsByClassName("btn btn-labeled");
                        for (var item of buttons) {
                            item.disabled = false;
                        }
                        return;
                    } else {
                        $scope[forme].fillRelationvalidate = false;
                        $scope[forme].saveSubAction(close);
                    }
                } else
                    $scope[forme].saveSubAction(close);
            }
        };
        $scope[forme].saveSubAction = async function (close) {
            $scope[forme].makeInsert();
            SWEETALERT.loading({message: MESSAGE.ic('mono.saving')});
            if ($scope[forme].mode === FORM.modes.new) {
                for (var i in CONFIG.audit.insert) {
                    var audit = CONFIG.audit.insert[i].replaceAll("&#34;", '"').replaceAll("&#39;", "'");
                    if (eval(`CRUD_${$scope.modelName}`).table.columns[i] !== undefined)
                        eval(`$scope[forme].inserting.${i} = '${eval(audit)}';`);
                }
                if ($scope[forme].before.insert({
                    inserting: $scope[forme].inserting,
                    uploading: $scope[forme].uploading,
                    multipleRelations: $scope[forme].multipleRelations,
                    relations: $scope[forme].relations,
                })) {
                    let buttons = document.getElementsByClassName("btn btn-labeled");
                    for (var item of buttons) {
                        item.disabled = false;
                    }
                    return;
                }
                var conti = await $scope.triggers.table.before.insert({
                    inserting: $scope[forme].inserting,
                    uploading: $scope[forme].uploading,
                    multipleRelations: $scope[forme].multipleRelations,
                    relations: $scope[forme].relations,
                });
                if (conti === false) {
                    let buttons = document.getElementsByClassName("btn btn-labeled");
                    for (var item of buttons) {
                        item.disabled = false;
                    }
                    return;
                }

                var crud = eval(`CRUD_${$scope.modelName}`);
                if (crud.table.dragrow !== false) {
                    var last = await BASEAPI.firstp($scope.tableOrView, {
                        order: 'desc',
                        orderby: crud.table.dragrow,
                        where: $scope.fixFilters,
                    });
                    if (last === undefined)
                        $scope[forme].inserting[crud.table.dragrow] = "1";
                    else
                        $scope[forme].inserting[crud.table.dragrow] = (parseInt(last[crud.table.dragrow]) + 1).toString();
                }

                BASEAPI.insertID($scope.tableOrMethod, $scope[forme].inserting, $scope[forme].fieldExGET, $scope[forme].valueExGET, async function (result) {
                    if (result.data.error === false) {

                        SWEETALERT.loading({message: MESSAGE.i('mono.saving')});
                        var savedRow = result.data.data[0];
                        $scope[forme].after.insert({
                            inserted: savedRow,
                            inserting: $scope[forme].inserting,
                            uploading: $scope[forme].uploading,
                            multipleRelations: $scope[forme].multipleRelations,
                            relations: $scope[forme].relations,
                        });

                        $scope.triggers.table.after.insert({
                            inserted: savedRow,
                            inserting: $scope[forme].inserting,
                            uploading: $scope[forme].uploading,
                            multipleRelations: $scope[forme].multipleRelations,
                            relations: $scope[forme].relations,
                        });

                        //await AUDIT.LOG(AUDIT.ACTIONS.insert, $scope.modelName, $scope[forme].inserting);


                        // console.log($scope[forme].inserting);
                        // console.log(savedRow);

                        var firstColumn = eval(`CRUD_${$scope.modelName}`).table.key || "id";
                        var DRAGONID = eval(`savedRow.${firstColumn}`);
                        var auditVar = $scope[forme].getAudit();
                        auditVar.id = DRAGONID;

                        if ($scope.auditView)
                            await AUDIT.LOG(AUDIT.ACTIONS.insert, $scope.auditView, auditVar);
                        else
                            await AUDIT.LOG(AUDIT.ACTIONS.insert, $scope.tableOrView ? $scope.tableOrView : $scope.modelName, auditVar);


                        if ($scope.modelName === CURRENTPRUDENTS)
                            if (!DSON.oseaX(CURRENTPRUDENTS)) {
                                PRUDENTS[CURRENTPRUDENTS] = DRAGONID;
                                CURRENTPRUDENTS = "";
                            }
                        $scope[forme].mode = FORM.modes.edit;
                        $scope.pages.form.subRequestCompleteVar = 0;
                        $scope.pages.form.subRequestCompleteProgress = 0;
                        $scope.pages.form.subRequestCompleteVar =
                            ($scope[forme].uploading.length > 0 ? 1 : 0)
                            + $scope[forme].multipleRelations.length
                            + $scope[forme].relations.length;

                        if ($scope.pages !== null)
                            if ($scope.pages.form.subRequestCompleteVar === 0) {
                                $scope.pages.form.close(undefined, undefined, close);
                                SWEETALERT.stop();
                                NOTIFY.success(`${$scope.singular} ${MESSAGE.i('mono.saved')}`);
                            }
                        if ($scope[forme] !== null)
                            if ($scope[forme].uploading !== undefined)
                                if ($scope[forme].uploading.length > 0) {
                                    for (var file of $scope[forme].uploading)
                                        file.to = file.to.replace('$id', DRAGONID);

                                    BASEAPI.ajax.post(new HTTP().path(["files", "api", "move"]), {moves: $scope[forme].uploading}, function (data) {
                                        if ($scope.pages.form.subRequestComplete)
                                            $scope.pages.form.subRequestComplete(close);
                                        $scope.filesToMove = [];
                                    });
                                }

                        if ($scope[forme] !== null)
                            if ($scope[forme].relations !== undefined)
                                if ($scope[forme].relations.length > 0) {
                                    for (var relation of $scope[forme].relations) {
                                        for (var frel of relation.data) {
                                            for (var i in frel) {
                                                var vi = frel[i].replace('$id', DRAGONID);
                                                eval(`frel.${i} = vi`);
                                            }
                                        }
                                        BASEAPI.insert(relation.config.toDeleteTable, relation.data, function (data) {
                                            $scope.pages.form.subRequestComplete(close);
                                        });
                                    }
                                }
                        if ($scope[forme] !== null)
                            if ($scope[forme].multipleRelations !== undefined)
                                if ($scope[forme].multipleRelations.length > 0) {
                                    for (var relation of $scope[forme].multipleRelations) {
                                        var dataToUpdate = {};
                                        var dataToWhere = [];
                                        for (var frel of relation.config.where) {
                                            for (var i in frel) {
                                                var vi = frel[i].replace('$id', relation.tempID);
                                                eval(`frel.${i} = vi`);
                                            }
                                            dataToWhere.push(frel);
                                        }
                                        for (var i in relation.config.update) {
                                            var vi = relation.config.update[i].replace('$id', DRAGONID);
                                            eval(`dataToUpdate.${i} = vi`);
                                        }
                                        dataToUpdate.where = dataToWhere;
                                        BASEAPI.updateall(relation.config.toTable, dataToUpdate, function (udata) {
                                            if ($scope.pages.form.subRequestComplete)
                                                if (typeof $scope.pages.form.subRequestComplete === "function")
                                                    $scope.pages.form.subRequestComplete(close);
                                        });
                                    }
                                }
                    } else {
                        SWEETALERT.stop();
                        ERROR.alert(result.data, ERROR.category.database);
                        $scope.pages.form.focusFirstValidation();
                        var buttons = document.getElementsByClassName("btn btn-labeled");
                        for (var item of buttons) {
                            item.disabled = false;
                        }
                    }
                });
            }
            if ($scope[forme].mode === FORM.modes.edit) {
                var firstColumn = eval(`CRUD_${$scope.modelName}`).table.key || "id";
                var dataToWhere = [{field: firstColumn, value: eval(`$scope.${firstColumn}`)}];
                var dataToUpdate = $scope[forme].inserting;
                dataToUpdate.where = dataToWhere;
                for (var i in CONFIG.audit.update) {
                    var audit = CONFIG.audit.update[i].replaceAll("&#34;", '"').replaceAll("&#39;", "'");
                    if (eval(`CRUD_${$scope.modelName}`).table.columns[i] !== undefined)
                        eval(`$scope[forme].inserting.${i} = '${eval(audit)}';`);
                }
                if ($scope[forme].before.update({
                    updating: $scope[forme].inserting,
                    uploading: $scope[forme].uploading,
                    multipleRelations: $scope[forme].multipleRelations,
                    relations: $scope[forme].relations,
                })) {
                    let buttons = document.getElementsByClassName("btn btn-labeled");
                    for (var item of buttons) {
                        item.disabled = false;
                    }
                    return;
                }

                if (await $scope.triggers.table.before.update({
                    updating: $scope[forme].inserting,
                    uploading: $scope[forme].uploading,
                    multipleRelations: $scope[forme].multipleRelations,
                    relations: $scope[forme].relations,
                }) === false) {
                    let buttons = document.getElementsByClassName("btn btn-labeled");
                    for (var item of buttons) {
                        item.disabled = false;
                    }
                    return;
                }

                BASEAPI.updateall($scope.tableOrMethod, dataToUpdate, async function (result) {
                        if (result.data.error === false) {

                            // SWEETALERT.loading({message: MESSAGE.i('mono.saving')});
                            var firstColumn = eval(`CRUD_${$scope.modelName}`).table.key || "id";
                            var DRAGONID = eval(`$scope.${firstColumn}`);
                            var auditVar = $scope[forme].getAudit();
                            $scope[forme].oldData.id = DRAGONID;
                            auditVar.id = DRAGONID;
                            if ($scope.auditView)
                                await AUDIT.LOG(AUDIT.ACTIONS.update, $scope.auditView, auditVar, $scope[forme].oldData);
                            else

                                await AUDIT.LOG(AUDIT.ACTIONS.update, $scope.tableOrView ? $scope.tableOrView : $scope.modelName, auditVar, $scope[forme].oldData);


                            if ($scope[forme] !== null) {
                                $scope[forme].after.update({
                                    updating: $scope[forme].inserting,
                                    uploading: $scope[forme].uploading,
                                    multipleRelations: $scope[forme].multipleRelations,
                                    relations: $scope[forme].relations,
                                });
                                console.log($scope[forme])
                                $scope.triggers.table.after.update({
                                    updating: $scope[forme].inserting,
                                    uploading: $scope[forme].uploading,
                                    multipleRelations: $scope[forme].multipleRelations,
                                    relations: $scope[forme].relations,
                                });
                            }


                            if ($scope[forme] !== null)
                                $scope[forme].mode = FORM.modes.edit;
                            if ($scope.pages !== null)
                                $scope.pages.form.subRequestCompleteVar = 0;
                            if ($scope.pages !== null)
                                $scope.pages.form.subRequestCompleteProgress = 0;
                            if ($scope.pages !== null)
                                $scope.pages.form.subRequestCompleteVar = $scope[forme].relations.length;
                            if ($scope.pages.form.subRequestCompleteVar === 0) {
                                BASEAPI.ajax.post(new HTTP().path(["files", "api", "move"]), {moves: $scope[forme].uploading}, function (data) {
                                    $scope.filesToMove = [];
                                });
                                $scope.pages.form.close(undefined, undefined, close);
                                SWEETALERT.stop();
                                NOTIFY.success(`${$scope.singular} ${MESSAGE.i('mono.saved')}`);
                            }

                            var allrelations = [];
                            if ($scope[forme] !== null)
                                if ($scope[forme].relations) {
                                    for (var item of $scope[forme].relations) {
                                        var relations = [];
                                        var objExist = [];
                                        for (var sub of item.data) {
                                            if (objExist.indexOf(JSON.stringify(sub)) === -1) {
                                                relations.push(sub);
                                                objExist.push(JSON.stringify(sub));
                                            }
                                        }
                                        item.data = relations;
                                        allrelations.push(item);
                                    }
                                }
                            // if (allrelations.length)
                            //     allrelations = allrelations[0];
                            if ($scope[forme] !== null) {
                                if ($scope[forme].relations !== undefined) {
                                    if (allrelations.length > 0) {
                                        for (var relation of allrelations) {
                                            for (var frel of relation.data) {
                                                for (var i in frel) {
                                                    var vi = frel[i].replace('$id', DRAGONID);
                                                    eval(`frel.${i} = vi`);
                                                }
                                            }
                                            for (var i in relation.config.fieldsUpdate) {
                                                var vi = relation.config.fieldsUpdate[i].replace('$id', DRAGONID);
                                                eval(`relation.config.fieldsUpdate.${i} = vi`);
                                            }


                                            let elpivot = Object.keys(relation.config.fields).filter(d => d !== relation.config.fieldsUpdate.field)[0];
                                            var thefilter = [];
                                            thefilter.push(relation.config.fieldsUpdate);
                                            let yaexiste = await BASEAPI.listp(relation.config.toTable, {
                                                limit: 0,
                                                where: thefilter
                                            });
                                            yaexiste = yaexiste.data;

                                            let toinsert = relation.data.filter(d => !yaexiste.filter(e => e[elpivot] == d[elpivot]).length);
                                            toinsert = toinsert.filter(d => d[elpivot] && (d[elpivot] || "") !== "null");
                                            let todelete = yaexiste.filter(d => !relation.data.filter(e => e[elpivot] == d[elpivot]).length);
                                            todelete = todelete.filter(d => d[elpivot] && (d[elpivot] || "") !== "null");
                                            let todeleteWhere = [];
                                            todeleteWhere.push(relation.config.fieldsUpdate);
                                            todeleteWhere.push({
                                                field: elpivot,
                                                value: todelete.map(d => d[elpivot])
                                            });
                                            if (todelete.length)
                                                if ($scope[forme].multirepeat.indexOf(relation.config.toDeleteTable) === -1) {
                                                    var ddata = await BASEAPI.deleteallp(relation.config.toDeleteTable, todeleteWhere);
                                                }
                                            $scope[forme].multirepeat.push(relation.config.toDeleteTable);
                                            var nadaenblancus = true;
                                            // for (var i in relation.data) {
                                            //     for (var j in relation.data[i]) {
                                            //         if (DSON.oseaX(relation.data[i][j])) {
                                            //             nadaenblancus = false;
                                            //         }
                                            //     }
                                            // }
                                            if (toinsert.length)
                                                if (nadaenblancus) {
                                                    if (!relation.config.dont_insert) {
                                                        console.log(await BASEAPI.insertp(relation.config.toDeleteTable, toinsert));
                                                    }
                                                }
                                            if ($scope.triggers.table.after.update_relation)
                                                $scope.triggers.table.after.update_relation({
                                                    updating: $scope[forme].inserting,
                                                    uploading: $scope[forme].uploading,
                                                    multipleRelations: $scope[forme].multipleRelations,
                                                    relations: $scope[forme].relations,
                                                })
                                            var update_relation_ejecutado = true;
                                            $scope.pages.form.subRequestComplete(close);
                                        }
                                    }
                                }
                                if (!update_relation_ejecutado)
                                    if ($scope.triggers.table.after.update_relation)
                                        $scope.triggers.table.after.update_relation({
                                            updating: $scope[forme].inserting,
                                            uploading: $scope[forme].uploading,
                                            multipleRelations: $scope[forme].multipleRelations,
                                            relations: $scope[forme].relations,
                                        });
                            }
                        } else {
                            SWEETALERT.stop();
                            ERROR.alert(result.data, ERROR.category.database);
                        }
                    }
                );
            }
        };
        $scope[forme].makeInsert = function (exclude) {
            if ($scope[forme] !== null) {
                $scope[forme].inserting = {};
                $scope[forme].uploading = [];
                $scope[forme].relations = [];
                $scope[forme].multipleRelations = [];
                $scope[forme].fieldExGET = '';
                $scope[forme].valueExGET = '';
                if ($scope[forme].getfilter) {
                    $scope[forme].fieldExGET = $scope[forme].getfilter.field;
                    $scope[forme].valueExGET = eval(`$scope.${$scope[forme].fieldExGET}`);

                }
                $scope[forme].prepareInsert(exclude);
            }
        };
        $scope[forme].prepareInsert = function (exclude) {
            if ($scope[forme] !== null) {
                $scope[forme].lastPrepare = {};
                exclude = DSON.oseaX(exclude) ? [] : exclude;
                for (const fieldy of $scope[forme].fileds) {
                    var field = fieldy.replace('_DragonClean', '');
                    if (exclude.indexOf(field) === -1)
                        $scope[forme].pushInsert(field);
                }
                for (const fieldy of $scope[forme].fileds) {
                    var field = fieldy;
                    var badwords = [
                        '_DragonCountFile',
                        '_DragonLat',
                        '_DragonLon',
                        '_DragonClean',
                    ];
                    badwords.forEach((item) => {
                        field = field.replace(item, '');
                    });
                    if (eval(`$scope[forme].schemas.insert.${field}`) === undefined) {
                        if (exclude.indexOf(field) === -1) {
                            // if (eval(`$scope[forme].lastPrepare.${field}`) !== undefined) {
                            if (eval(`$scope[forme].lastPrepare.${field}_DragonClean`) !== undefined)
                                eval(`$scope[forme].inserting.${field} = $scope[forme].lastPrepare.${field}_DragonClean;`);
                            else
                                eval(`$scope[forme].inserting.${field} = $scope[forme].lastPrepare.${field};`);
                            // }
                        }
                    } else {
                        var typeField = eval(`$scope[forme].schemas.insert.${field}`);
                        switch (typeField) {
                            case FORM.schemasType.upload: {
                                if (eval(`$scope[forme].options.${field}.folder_construct`)){
                                    var root = `${$scope.modelName}`;
                                    for(var folders of eval(`$scope[forme].options.${field}.folder_construct`)){
                                        root += `/${eval(`$scope.${folders}`)}`;
                                    }
                                    eval(`$scope[forme].options.${field}.new_rootfolder = "${root}";`)
                                    if (!eval(`$scope[forme].options.${field}.old_rootfolder`)){
                                        eval(`$scope[forme].options.${field}.old_rootfolder = "${root}";`)
                                    }
                                    $scope[forme].uploading.push({
                                        from: `${FOLDERS.files}/${eval(`$scope[forme].options.${field}.old_rootfolder`).replace('upload:', '')}`,
                                        to: `${FOLDERS.files}/${eval(`$scope[forme].options.${field}.new_rootfolder`)}`
                                    });
                                }else{
                                    $scope[forme].uploading.push({
                                        from: `${FOLDERS.files}/${eval(`$scope.${field}`).replace('upload:', '')}`,
                                        to: `${FOLDERS.files}/${$scope.modelName}/${field}/$id`
                                    });
                                }
                                break;
                            }
                            case FORM.schemasType.selectMultiple: {
                                var prop = eval(`$scope[forme].options.${field}`);
                                var config = {
                                    dont_insert: prop.get.dont_insert || undefined,
                                    where_delete: prop.get.where_delete || undefined,
                                    toTable: prop.get.table,
                                    toDeleteTable: prop.get.tableDelete || prop.get.table,
                                    text: "Inserting multiples...",
                                    fields: {},
                                    fieldsUpdate: {}
                                };
                                config.fields = {};
                                eval(`config.fields.${prop.get.fieldTo} = '$id';`);
                                eval(`config.fields.${prop.get.field} = '$item';`);
                                eval(`config.fieldsUpdate.field = '${prop.get.fieldTo}';`);
                                eval(`config.fieldsUpdate.value = '$id';`);

                                if (eval(`$scope[forme].lastPrepare.${field}`) !== undefined) {
                                    var arrayField = eval(`$scope[forme].lastPrepare.${field}`).split(',');
                                    var dataarray = [];
                                    for (var item of arrayField) {
                                        var newObj = {};
                                        for (var field in config.fields) {
                                            var valued = config.fields[field].replace('$item', item);
                                            eval(`newObj.${field} = "${valued}"`);
                                        }
                                        dataarray.push(newObj);
                                    }
                                    console.log("llenando", {
                                        config: config,
                                        data: dataarray
                                    });
                                    $scope[forme].relations.push({
                                        config: config,
                                        data: dataarray
                                    });
                                }
                                break;
                            }
                            case FORM.schemasType.relation: {
                                var tempID = eval(`$scope[forme].lastPrepare.${field}`);
                                var prop = eval(`$scope[forme].options.${field}`);
                                var config = {
                                    toTable: prop.table,
                                    toDeleteTable: (prop.get || {tableDelete: prop.table}).tableDelete || prop.table,
                                    update: {all: "$id", tempid: "$NULL"},
                                    where: [{field: "tempid", value: "$id"}]
                                };
                                eval(`config.update = {${prop.field}: "$id", tempid: "$NULL"};`);
                                eval(`config.where = [{field: "tempid", value: "$id"}];`);
                                $scope[forme].multipleRelations.push({
                                    config: config,
                                    tempID: tempID
                                });
                                break;
                            }
                            case FORM.schemasType.password: {
                                if (eval(`$scope[forme].lastPrepare.${field}`) !== FORM.config.password)
                                    eval(`$scope[forme].inserting.${field} = '#${eval(`$scope[forme].lastPrepare.${field}`)}'`);
                                break;
                            }
                            case FORM.schemasType.checkbox: {
                                if (eval(`$scope[forme].lastPrepare.${field}`) !== undefined) {
                                    var truorfalse = eval(`$scope[forme].lastPrepare.${field}`).toString();
                                    if (truorfalse === "true")
                                        eval(`$scope[forme].inserting.${field} = '1'`);
                                    else
                                        eval(`$scope[forme].inserting.${field} = '0'`);
                                } else {
                                    eval(`$scope[forme].inserting.${field} = '0'`);
                                }
                                break;
                            }
                            case FORM.schemasType.calculated: {
                                eval(`delete $scope[forme].inserting.${field}`);
                                break;
                            }
                        }
                    }
                }
            }
        };
        $scope[forme].masked = function (name, value) {
            var nameclean = name.replace(/\./g, '_');
            if ($scope.pages.form.isOpen)
                if (!DSON.oseaX(value)) {
                    try {
                        return $(`[name="${$scope.modelName}_${nameclean}"]`).masked(value);
                    } catch (e) {
                        return "";
                    }
                }
        };
        $scope[forme].selected = function (name, add) {
            if (eval(`$scope[forme].options.${name} === undefined`)) {
                return null;
            }
            if (eval(`$scope[forme].options.${name}.data`) !== undefined) {
                var objectSelected = eval(`$scope[forme].options.${name}.data`).filter(function (row) {
                    var idtun = eval(`$scope[forme].options.${name}.value`);
                    idtun = idtun.replaceAll("item.", "row.");
                    if (!add)
                        return eval(`row.${idtun}`) == eval(`$scope.${name}`);
                    else
                        return eval(`row.${idtun}`) == eval(`$scope.${name}`) && eval(add);
                });
                return objectSelected.length > 0 ? objectSelected[0] : null;
            } else {
                return null;
            }
        };
        $scope[forme].selectedMultiple = function (name) {
            if (eval(`$scope[forme].options.${name} === undefined`)) {
                return null;
            }
            if (eval(`$scope[forme].options.${name}.data`) !== undefined) {
                var objectSelected = eval(`$scope[forme].options.${name}.data`).filter(function (row) {
                    var idtun = eval(`$scope[forme].options.${name}.value`);
                    idtun = idtun.replaceAll("item.", "row.");
                    return eval(`$scope.${name}`).indexOf(`${eval(`row.${idtun}`)}`) !== -1;
                });
                return objectSelected.length > 0 ? objectSelected : null;
            } else {
                return null;
            }
        };
        $scope[forme].loadDropDownList = function (name) {
            var nameclean = name.replace(/\./g, '_');
            if ($scope[forme] !== null) {
                var animation = new ANIMATION();
                var options = eval(`$scope[forme].options.${name}`);
                animation.loading(`#input${$scope.modelName}_${name}`, "", `#icon${name}`, '30');
                if (!options.simple) {
                    eval(`var crud = CRUD_${options.controller || options.table}`);
                    if (crud.table.single)
                        options.query.join = crud.table.single;
                    var toquery = DSON.merge(options.query, {});
                    if ($scope.selectQueries[name]) {
                        var toConsult = $scope.selectQueries[name];
                        toquery.where = toquery.where.filter((wh) => {
                            return wh.selecter !== true;
                        });
                        if (toConsult.length > 0) {
                            if (!DSON.oseaX(toquery.where)) {
                                for (var optadd in toConsult) {
                                    toConsult[optadd].selecter = true;
                                    toquery.where.push(toConsult[optadd]);
                                }
                            } else {
                                for (var optadd in toConsult)
                                    toConsult[optadd].selecter = true;
                                toquery.where = toConsult;
                            }
                        }
                    }

                    if (options.parent !== false) {
                        if (DSON.oseaX(toquery.where))
                            toquery.where = [];
                        var exist = toquery.where.filter((item) => {
                            return item.field === options.parent.myfield || options.parent.model;
                        });
                        if (exist.length) {
                            if (eval(`$scope.${options.parent.model}_object !== null`))
                                exist[0].value = eval(`$scope.${options.parent.model}_object.${options.parent.sufield}`);
                        } else {
                            toquery.where.push({
                                field: options.parent.myfield || options.parent.model,
                                value: eval(`$scope.${options.parent.model}_object.${options.parent.sufield}`)
                            });
                        }
                    }
                    BASEAPI.list(options.table, toquery,
                        function (info) {
                            if (!DSON.oseaX(options.groupby)) {
                                var newData = {};
                                for (const i in info.data) {
                                    var item = info.data[i];
                                    var groupbyValue = eval(`item.${options.groupby}`);
                                    if (DSON.oseaX(eval(`newData.${groupbyValue}`))) {
                                        eval(`newData.${groupbyValue} = [];`);
                                    }
                                    eval(`newData.${groupbyValue}.push(item)`);
                                }
                                eval(`$scope[forme].options.${name}.groupbydata = newData`);
                            }
                            eval(`$scope[forme].options.${name}.data = info.data`);
                            eval(`$scope[forme].options.${name}.info = info`);
                            eval(`${$scope.modelName}.${name}_object = null;`);
                            if (eval(`$scope[forme].options.${name}.data`) !== undefined) {
                                if (eval(`$scope.${name}`) !== "[NULL]") {
                                    var objectSelected = eval(`$scope[forme].options.${name}.data`).filter(function (row) {
                                        var idtun = eval(`$scope[forme].options.${name}.value`);
                                        idtun = idtun.replaceAll("item.", "row.");
                                        return eval(`row.${idtun}`) == eval(`$scope.${name}`);
                                    });
                                    if (objectSelected.length > 0) {
                                        eval(`${$scope.modelName}.${name}_object = objectSelected[0];`);

                                        if (options.childs !== false) {
                                            options.childs.forEach((child) => {
                                                $scope[forme].loadDropDown(child.model);
                                            });
                                        }
                                        $scope.$scope.$digest();
                                    } else {
                                        eval(`${$scope.modelName}.${name}_object = null;`);
                                    }
                                }
                            }

                            if (!options.multiple)
                                animation.stoploading(`#input${$scope.modelName}_${name}`, `#icon${name}`);
                            if (options.multiple) {
                                if (eval(`$scope.${name}.length <= 0`))
                                    eval(`$scope.${name} = [];`);
                                if (!$scope[forme].isReadOnly(name)) {
                                    var lastWhere = [];
                                    if (eval(`$scope.${options.get.fieldFrom}`) !== undefined) {
                                        lastWhere.push({
                                            field: options.get.fieldTo,
                                            value: eval(`$scope.${options.get.fieldFrom}`)
                                        });
                                        BASEAPI.list(options.get.table, {
                                            limit: 99999,
                                            page: 1,
                                            orderby: options.get.fieldTo,
                                            order: "asc",
                                            where: lastWhere
                                        }, function (selectedy) {
                                            if (eval(`$scope.${name} === '[NULL]'`))
                                                eval(`$scope.${name} = [];`);
                                            if (eval(`$scope.${name}.length <= 0`))
                                                selectedy.data.forEach((item) => {
                                                    eval(`$scope.${name}.push('${eval(`item.${options.get.field}`)}')`);
                                                });
                                            animation.stoploading(`#input${$scope.modelName}_${name}`, `#icon${name}`);
                                            $scope[forme].callSelect2(name, options);
                                        });
                                    } else {
                                        animation.stoploading(`#input${$scope.modelName}_${name}`, `#icon${name}`);
                                        $scope[forme].callSelect2(name, options);
                                    }
                                } else {
                                    if (eval(`$scope.${name}.length <= 0`))
                                        eval(`$scope.${name} = $scope[forme].isReadOnly('${name}');`);
                                    animation.stoploading(`#input${$scope.modelName}_${name}`, `#icon${name}`);
                                    $scope[forme].callSelect2(name, options);
                                }
                            } else {
                                $scope[forme].callSelect2(name, options);
                            }
                        });
                } else {
                    var info = {};
                    info.data = options.data;
                    if (!DSON.oseaX(options.groupby)) {
                        var newData = {};
                        for (const i in info.data) {
                            var item = info.data[i];
                            var groupbyValue = eval(`item.${options.groupby}`);
                            if (DSON.oseaX(eval(`newData.${groupbyValue}`))) {
                                eval(`newData.${groupbyValue} = [];`);
                            }
                            eval(`newData.${groupbyValue}.push(item)`);
                        }
                        eval(`$scope[forme].options.${name}.groupbydata = newData`);
                    }
                    eval(`$scope[forme].options.${name}.data = info.data`);
                    animation.stoploading(`#input${$scope.modelName}_${name}`, `#icon${name}`);
                    $scope[forme].callSelect2(name, options);
                }
            }
        };
        $scope[forme].loadSelect = function (name, select2) {
            var nameclean = name.replace(/\./g, '_');
            if ($scope[forme] !== null) {
                var options = eval(`$scope[forme].options.${name}`);
                $scope[forme].callSelect2(name, options, select2);
            }
        };
        $scope[forme].loadDropDown = function (name, select2, afterdropdown) {
            var nameclean = name.replace(/\./g, '_');
            if ($scope[forme] !== null) {
                var animation = new ANIMATION();
                var options = eval(`$scope[forme].options.${name}`);
                animation.loading(`#input${$scope.modelName}_${name}`, "", `#icon${name}`, '30');
                if (options) {
                    if (!options.simple) {

                        eval(`var crud = CRUD_${options.controller || options.table}`);
                        if (crud.table.single)
                            options.query.join = crud.table.single;
                        var toquery = DSON.merge(options.query, {});

                        if ($scope.selectQueries[name]) {
                            var toConsult = $scope.selectQueries[name];
                            toquery.where = toquery.where.filter((wh) => {
                                return wh.selecter !== true;
                            });
                            if (toConsult.length > 0) {
                                if (!DSON.oseaX(toquery.where)) {
                                    for (var optadd in toConsult) {
                                        toConsult[optadd].selecter = true;
                                        toquery.where.push(toConsult[optadd]);
                                    }
                                } else {
                                    for (var optadd in toConsult)
                                        toConsult[optadd].selecter = true;
                                    toquery.where = toConsult;
                                }
                            }
                        }

                        if (options.parent !== false) {
                            if (DSON.oseaX(toquery.where))
                                toquery.where = [];
                            var exist = toquery.where.filter((item) => {
                                return item.field === options.parent.myfield || options.parent.model;
                            });
                            if (exist.length) {
                                if (eval(`$scope.${options.parent.model}_object !== null`))
                                    exist[0].value = eval(`$scope.${options.parent.model}_object.${options.parent.sufield}`);
                            } else {
                                toquery.where.push({
                                    field: options.parent.myfield || options.parent.model,
                                    value: eval(`$scope.${options.parent.model}_object.${options.parent.sufield}`)
                                });
                            }
                        }
                        BASEAPI.list(options.table, toquery,
                            function (info) {
                                if (!DSON.oseaX(options.groupby)) {
                                    var newData = {};
                                    for (const i in info.data) {
                                        var item = info.data[i];
                                        var groupbyValue = eval(`item.${options.groupby}`);
                                        if (DSON.oseaX(eval(`newData["${groupbyValue}"]`))) {
                                            eval(`newData["${groupbyValue}"] = [];`);
                                        }
                                        eval(`newData["${groupbyValue}"].push(item)`);
                                    }
                                    eval(`$scope[forme].options.${name}.groupbydata = newData`);
                                }

                                eval(`$scope[forme].options.${name}.data = info.data`);
                                eval(`$scope[forme].options.${name}.info = info`);
                                eval(`${$scope.modelName}.${name}_object = item;`);
                                if (eval(`$scope[forme].options.${name}.data`) !== undefined) {
                                    if (eval(`$scope.${name}`) !== "[NULL]") {

                                        if ($scope.brothers[name]) {
                                            $scope[forme].options[name].data.push($scope.brothers[name]);
                                        }
                                        var objectSelected = eval(`$scope[forme].options.${name}.data`).filter(function (row) {
                                            var idtun = eval(`$scope[forme].options.${name}.value`);
                                            idtun = idtun.replaceAll("item.", "row.");
                                            if (options.evalvalue)
                                                return eval(`${idtun}`) == eval(`$scope.${name}`);
                                            return eval(`row.${idtun}`) == eval(`$scope.${name}`);
                                        });

                                        if (objectSelected.length > 0) {
                                            console.log(objectSelected, "y que e")
                                            eval(`${$scope.modelName}.${name}_object = objectSelected[0];`);

                                            if (options.childs !== false) {
                                                options.childs.forEach((child) => {
                                                    $scope[forme].loadDropDown(child.model);
                                                });
                                            }
                                            $scope.$scope.$digest();
                                        } else {

                                            eval(`${$scope.modelName}.${name}_object = null;`);
                                        }
                                    } else {
                                        if (!$scope[forme].options[name].allownull) {
                                            let eldaton = $scope[forme].options[name].data.filter(item => eval(decodeHTMLEntities($scope[forme].options[name].condition || "true")));
                                            $scope[name] = eldaton
                                                [
                                                $scope[forme].options[name].takelast ? eldaton.length - 1 : 0
                                                ][$scope[forme].options[name].value] + "";
                                        }
                                        if ($scope.brothers[name]) {
                                            $scope[forme].options[name].data.push($scope.brothers[name]);

                                            var objectSelected = eval(`$scope[forme].options.${name}.data`).filter(function (row) {
                                                var idtun = eval(`$scope[forme].options.${name}.value`);
                                                idtun = idtun.replaceAll("item.", "row.");
                                                if (eval(`row.${idtun}`) == $scope.open.default[name]) {
                                                    $scope[name] = $scope.open.default[name];
                                                }
                                                return eval(`row.${idtun}`) == $scope.open.default[name];
                                            });
                                            if (objectSelected.length > 0) {
                                                $scope[name] = $scope.open.default[name];
                                                eval(`${$scope.modelName}.${name}_object = objectSelected[0];`);

                                                if (options.childs !== false) {
                                                    options.childs.forEach((child) => {
                                                        $scope[forme].loadDropDown(child.model);
                                                    });
                                                }
                                                $scope.$scope.$digest();
                                            } else {

                                                eval(`${$scope.modelName}.${name}_object = null;`);
                                            }
                                        }
                                    }
                                }

                                if (!options.multiple)
                                    animation.stoploading(`#input${$scope.modelName}_${name}`, `#icon${name}`);
                                if (options.multiple && select2 !== false) {

                                    if (eval(`$scope.${name}.length <= 0`))
                                        eval(`$scope.${name} = [];`);
                                    if (!$scope[forme].isReadOnly(name)) {
                                        var lastWhere = [];
                                        if (eval(`$scope.${options.get.fieldFrom}`) !== undefined) {
                                            lastWhere.push({
                                                field: options.get.fieldTo,
                                                value: eval(`$scope.${options.get.fieldFrom}`)
                                            });
                                            BASEAPI.list(options.get.table, {
                                                limit: 99999,
                                                page: 1,
                                                orderby: options.get.fieldTo,
                                                order: "asc",
                                                where: lastWhere
                                            }, function (selectedy) {
                                                if (!$scope.do_once[name]) {
                                                    $scope.do_once[name] = true;
                                                    if (eval(`$scope.${name} === '[NULL]'`))
                                                        eval(`$scope.${name} = [];`);
                                                    if (selectedy.data)
                                                        selectedy.data.forEach((item) => {
                                                            eval(`$scope.${name}.push('${eval(`item.${options.get.field}`)}')`);
                                                        });
                                                }
                                                animation.stoploading(`#input${$scope.modelName}_${name}`, `#icon${name}`);
                                                $scope[forme].callSelect2(name, options, select2);
                                            });
                                        } else {
                                            animation.stoploading(`#input${$scope.modelName}_${name}`, `#icon${name}`);
                                            $scope[forme].callSelect2(name, options, select2);
                                        }
                                    } else {
                                        if (eval(`$scope.${name}.length <= 0`))
                                            eval(`$scope.${name} = $scope[forme].isReadOnly('${name}');`);
                                        animation.stoploading(`#input${$scope.modelName}_${name}`, `#icon${name}`);
                                        $scope[forme].callSelect2(name, options, select2);
                                    }
                                } else {
                                    animation.stoploading(`#input${$scope.modelName}_${name}`, `#icon${name}`);
                                    $scope[forme].callSelect2(name, options, select2);
                                }
                                if (afterdropdown)
                                    afterdropdown();
                            });
                    } else {
                        var info = {};
                        info.data = options.data;
                        if (!DSON.oseaX(options.groupby)) {
                            var newData = {};
                            for (const i in info.data) {
                                var item = info.data[i];
                                var groupbyValue = eval(`item.${options.groupby}`);
                                if (DSON.oseaX(eval(`newData["${groupbyValue}"]`))) {
                                    eval(`newData["${groupbyValue}"] = [];`);
                                }
                                eval(`newData["${groupbyValue}"].push(item)`);
                            }
                            eval(`$scope[forme].options.${name}.groupbydata = newData`);
                        }
                        eval(`$scope[forme].options.${name}.data = info.data`);
                        animation.stoploading(`#input${$scope.modelName}_${name}`, `#icon${name}`);
                        $scope[forme].callSelect2(name, options);
                    }
                }
            }
        };
        $scope.fielsamera = [];
        $scope[forme].matchStart = function (params, data) {
            // If there are no search terms, return all of the data
            console.log("params", params);
            console.log("data", data);

        };
        $scope[forme].callSelect2 = function (name, options, select2) {
            if (select2 === false) {
                $scope.$scope.$digest();
                return;
            }
            if ($scope[forme] !== null) {
                var nameclean = name.replace(/\./g, '_');
                if (!options.simple) {
                    let dataparaselect = {
                        placeholder: options.disabled ? "" : capitalize(options.miplaceholder || MESSAGE.i('mono.youselect')),
                        templateSelection: DROPDOWN.iformat,
                        templateResult: DROPDOWN.iformat,
                        allowHtml: true
                    };
                    if (options.search)
                        dataparaselect.minimumResultsForSearch = -1;
                    else
                        dataparaselect.minimumResultsForSearch = 20;
                    $('[name="' + $scope.modelName + "_" + nameclean + '"]').select2({
                        placeholder: options.disabled ? "" : capitalize(options.miplaceholder || MESSAGE.i('mono.youselect')),
                        templateSelection: DROPDOWN.iformat,
                        templateResult: DROPDOWN.iformat,
                        allowHtml: true,
                    });
                    $('[name="' + $scope.modelName + "_" + nameclean + '"]').on('change', function (e) {
                        if (options.childs !== false) {
                            options.childs.forEach((child) => {
                                if (eval(`$scope[forme].options.${child.model}.multiple`))
                                    eval(`$scope.${child.model} = []`);
                                else
                                    eval(`$scope.${child.model} = '[NULL]'`);
                                $scope[forme].loadDropDown(child.model);
                            });
                        }
                        $scope.$scope.$digest();
                    });
                    $scope.$scope.$digest();
                    $('[name="' + $scope.modelName + "_" + nameclean + '"]').trigger('change.select2');
                } else {
                    $('[name="' + $scope.modelName + "_" + nameclean + '"]').select2({
                        placeholder:
                            capitalize(options.miplaceholder || MESSAGE.i('mono.youselect')),
                        templateSelection: DROPDOWN.iformat,
                        templateResult: DROPDOWN.iformat,
                        allowHtml: true,
                    });
                    $('[name="' + $scope.modelName + "_" + nameclean + '"]').on('change', function (e) {
                        if (options.childs !== false) {
                            options.childs.forEach((child) => {
                                if (eval(`$scope[forme].options.${child.model}.multiple`))
                                    eval(`$scope.${child.model} = []`);
                                else
                                    eval(`$scope.${child.model} = '[NULL]'`);
                                $scope[forme].loadDropDown(child.model);
                            });
                        }
                        $scope.$scope.$digest();
                    });
                    $('[name="' + $scope.modelName + "_" + nameclean + '"]').trigger('change.select2');
                }
                if (typeof $scope[forme].onload === 'function')
                    $scope[forme].onload(nameclean);
                $scope.triggers.table.after.control(nameclean);
                $scope.yadata = false;
                $scope.clicaalgo();
                if ($scope.fielsamera) {
                    if ($scope.fielsamera.indexOf(nameclean) === -1) {
                        $scope.fielsamera.push(nameclean);
                        $scope[forme].oldData = $scope[forme].getAudit();
                    }
                }
            }
        };
        $scope[forme].loadOutDropDown = function (options, id) {
            if ($scope[forme] !== null) {
                var animation = new ANIMATION();
                animation.loading(`#input${name}`, "", `#icon${name}`, '30');
                BASEAPI.list(options.table, options.query,
                    function (info) {
                        if (!DSON.oseaX(options.groupby)) {
                            var newData = {};
                            for (const i in info.data) {
                                var item = info.data[i];
                                var groupbyValue = eval(`item.${options.groupby}`);
                                if (DSON.oseaX(eval(`newData.${groupbyValue}`))) {
                                    eval(`newData.${groupbyValue} = [];`);
                                }
                                eval(`newData.${groupbyValue}.push(item)`);
                            }
                            eval(`options.groupbydata = newData`);
                        }
                        eval(`options.data = info.data`);
                        eval(`options.info = info`);

                        animation.stoploading(`#input${name}`, `#icon${name}`);
                        $scope[forme].callSelect2(name, options);
                    });
            }
        };
        $scope[forme].LabelVisible = function (name) {
            var value = eval("$scope." + name);
            return !DSON.oseaX(value);
        };
        $scope[forme].validate = function (validations) {

        };
        $scope[forme].destroy = function (close) {
            if ($scope[forme] !== null) {
                $scope[forme].fileds.forEach((field) => {
                    eval(`delete $scope.${field}`);
                    if ($scope[field + '_search'])
                        eval(`delete $scope.${field}_search`);
                });
                $scope[forme].mode = 'new';
                if (close !== false) {
                    if ($scope.destroyForm !== false) {
                        $scope[forme] = {};
                        $scope.open = {};
                        $scope.pages = {};
                        $scope.validation.destroy();

                    }
                } else {
                    $scope.refreshAngular();
                }
            }
        };
        $scope[forme].focusFirstValidation = function (fieldsy) {
            setTimeout(function () {

                // var firstFieldWithError = $(".help-block:visible:has('p'):eq(0)").closest('.form-group-material');
                var firstError = $scope.validation.firstWithError(fieldsy);
                var firstFieldWithError = $(`#input${$scope.modelName}_${firstError}`);
                firstFieldWithError.find('.form-control').focus();
                var tab = firstFieldWithError.closest('.tab-pane');
                $(`[href='#${tab.attr('id')}']`).trigger('click');
                new ANIMATION().playPure(firstFieldWithError, "shake", function () {
                    firstFieldWithError.find('.form-control').focus();
                });
            }, 500);
        };
        $scope.openForm = async function (mode, view, callback, data) {
            $scope.fielsamera = [];
            if (await $scope.triggers.table.before.open() === false) {
                if (callback)
                    callback(data);
                return;
            }
            if ($scope[forme] !== null) {
                $scope.pages.form.isOpen = true;
                $scope.pages.form.subRequestCompleteVar = 0;
                $scope.pages.form.subRequestCompleteProgress = 0;
                $scope.pages.form.save = function (pre, post, close) {
                    var buttons = document.getElementsByClassName("btn btn-labeled");
                    for (var item of buttons) {
                        item.disabled = true;
                    }
                    var newRecord = {};
                    var state = $scope.validation.statePure();
                    if (state === VALIDATION.types.success) {
                        $scope[forme].saveAction(close);
                    } else {
                        if (state === VALIDATION.types.warning) {
                            SWEETALERT.confirm({
                                message:
                                    MESSAGE.i('alerts.ContainsWarning'),
                                confirm: function () {
                                    $scope[forme].saveAction(close);
                                    $scope.pages.form.focusFirstValidation();
                                    var buttons = document.getElementsByClassName("btn btn-labeled");
                                    for (var item of buttons) {
                                        item.disabled = false;
                                    }
                                }
                            });
                        } else {
                            $scope[forme].intent = true;
                            SWEETALERT.show({
                                type: "error",
                                message: MESSAGE.i('alerts.ContainsError'),
                                confirm: function () {
                                    $scope.pages.form.focusFirstValidation();
                                    var buttons = document.getElementsByClassName("btn btn-labeled");
                                    for (var item of buttons) {
                                        item.disabled = false;
                                    }
                                }
                            });

                        }
                    }
                };
                $scope.pages.form.saveAlter = function (fields, pre, post, close) {
                    var newRecord = {};
                    var state = $scope.validation.statePure(fields);
                    if (state === VALIDATION.types.success) {
                        $scope[forme].saveAction(close);
                    } else {
                        if (state === VALIDATION.types.warning) {
                            SWEETALERT.confirm({
                                message:
                                    MESSAGE.i('alerts.ContainsWarning'),
                                confirm: function () {
                                    $scope[forme].saveAction(close);
                                }
                            });
                        } else {
                            $scope[forme].intent = true;
                            SWEETALERT.show({
                                type: "error",
                                message: MESSAGE.i('alerts.ContainsError'),
                                confirm: function () {
                                    $scope.pages.form.focusFirstValidation();
                                }
                            });

                        }
                    }
                };
                $scope.pages.form.focusFirstValidation = function (fieldsy) {
                    setTimeout(function () {

                        // var firstFieldWithError = $(".help-block:visible:has('p'):eq(0)").closest('.form-group-material');
                        var firstError = $scope.validation.firstWithError(fieldsy);
                        var firstFieldWithError = $(`#input${$scope.modelName}_${firstError}`);
                        firstFieldWithError.find('.form-control').focus();
                        var tab = firstFieldWithError.closest('.tab-pane');
                        $(`[href='#${tab.attr('id')}']`).trigger('click');
                        new ANIMATION().playPure(firstFieldWithError, "shake", function () {
                            firstFieldWithError.find('.form-control').focus();
                        });
                    }, 500);
                };
                $scope.pages.form.subRequestComplete = function (close) {
                    $scope.pages.form.subRequestCompleteProgress++;
                    if ($scope.pages.form.subRequestCompleteProgress === $scope.pages.form.subRequestCompleteVar) {
                        $scope.pages.form.close(undefined, undefined, close);
                        SWEETALERT.stop();
                        NOTIFY.success(`${$scope.singular} ${MESSAGE.i('mono.saved')}`);
                    } else {

                    }
                };
                $scope.pages.form.beforeOpen = function () {

                };
                $scope.pages.form.onClose = function (close) {

                    $scope.pages.form.isOpen = false;
                    if ($scope[forme] !== null) {
                        $scope[forme].destroy(close);
                        if ($scope[forme].hasChanged)
                            if ($scope.refresh !== undefined) {
                                if (close === false) {
                                    $scope.refresh();
                                    // $scope.modalAction($scope.modelName, 'Parent', 'user', 'new', {});
                                    setTimeout(() => {
                                        eval(`${$scope.modelName}.formulary(null, 'new');`)
                                    }, 200)
                                }
                                $scope.refresh();
                            }
                    }
                    for (var i in eval($scope.modelName))
                        if (i.indexOf("_Dragon") !== -1)
                            eval(`delete ${$scope.modelName}.${i}`);
                };
                $scope.pages.form.close = function (pre, post, close) {
                    $scope.do_once = [];
                    $scope.get_me_once = false;
                    if ($scope[forme].mode !== FORM.modes.edit) {
                        if ($scope[forme].fillRelationvalidate !== false) {
                            var dataRelations = [];
                            for (const field of $scope[forme].fileds) {
                                if (eval(`$scope[forme].schemas.insert.${field}`) === FORM.schemasType.relation) {
                                    var table = eval(`$scope[forme].options.${field}.table`);
                                    if (table !== undefined) {
                                        if (eval(`${table}.records !== undefined`)) {
                                            if (eval(`${table}.records.data !== undefined`)) {
                                                if (eval(`${table}.records.data.length`) > 0) {
                                                    dataRelations.push(eval(`${table}.plural`));
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            if (dataRelations.length > 0) {
                                SWEETALERT.confirm({
                                    message: MESSAGE.ieval('alerts.fullRelations', {relations: DSON.ULALIA(dataRelations)}),
                                    confirm: function () {
                                        if ($scope[forme].target === FORM.targets.modal) {
                                            MODAL.close($scope);
                                            if (close === false) {
                                                $scope.refresh();
                                                // $scope.modalAction($scope.modelName, 'Parent', 'user', 'new', {});
                                                setTimeout(() => {
                                                    eval(`${$scope.modelName}.formulary(null, 'new');`)
                                                }, 200);
                                                return;
                                            }
                                        }
                                        if ($scope.pages.form.onClose)
                                            $scope.pages.form.onClose(close);
                                    }
                                });
                                return;
                            }
                        }
                    }

                    if ($scope[forme] !== null)
                        if ($scope[forme].hasChanged) {
                            if ($scope.refresh !== undefined)
                                $scope.refresh();
                        }
                    if (typeof pre === "function") pre();
                    if ($scope[forme] !== null)
                        if ($scope[forme].mode === FORM.modes.new) {
                            if ($scope.validation.warningClose() && !$scope.NoShowWarningClose)
                                SWEETALERT.confirm({
                                    message: MESSAGE.i('alerts.CloseToComplete'),
                                    confirm: function () {
                                        if ($scope[forme].target === FORM.targets.modal) {
                                            MODAL.close($scope);
                                            if (close === false) {
                                                $scope.refresh();
                                                // $scope.modalAction($scope.modelName, 'Parent', 'user', 'new', {});
                                                setTimeout(() => {
                                                    eval(`${$scope.modelName}.formulary(null, 'new');`)
                                                }, 200);
                                                return;
                                            }
                                        }
                                        if ($scope.pages.form)
                                            $scope.pages.form.onClose(close);
                                    }
                                });
                            else {
                                if ($scope[forme] !== null)
                                    if ($scope[forme].target === FORM.targets.modal) {
                                        MODAL.close($scope);
                                        if (close === false) {
                                            $scope.refresh();
                                            // $scope.modalAction($scope.modelName, 'Parent', 'user', 'new', {});
                                            setTimeout(() => {
                                                eval(`${$scope.modelName}.formulary(null, 'new');`)
                                            }, 200);
                                            return;
                                        }
                                    }
                                if ($scope.pages !== null)
                                    if ($scope.pages.form)
                                        $scope.pages.form.onClose(close);
                            }
                        } else {
                            if ($scope[forme].target === FORM.targets.modal) {
                                MODAL.close($scope);
                                if (close === false) {
                                    if (typeof $scope.refresh === "function")
                                        $scope.refresh();
                                    // $scope.modalAction($scope.modelName, 'Parent', 'user', 'new', {});
                                    setTimeout(() => {
                                        eval(`${$scope.modelName}.formulary(null, 'new');`)
                                    }, 200);
                                    return;
                                }
                            }
                            if ($scope.pages !== null)
                                if ($scope.pages.form)
                                    if ($scope.pages.form.onClose)
                                        $scope.pages.form.onClose(close);
                        }
                    if (typeof post === "function") post();
                    var buttons = document.getElementsByClassName("btn btn-labeled");
                    for (var item of buttons) {
                        item.disabled = false;
                    }

                };
                $scope.pages.form.beforeOpen();
                var icon = "";
                var finalTitle = undefined;
                if (mode === FORM.modes.new) {
                    if ($scope[forme].titles)
                        finalTitle = $scope[forme].titles.new;
                    icon = "file-plus"
                }
                if (mode === FORM.modes.edit) {
                    if ($scope[forme].titles)
                        finalTitle = $scope[forme].titles.edit;
                    icon = "pencil7"
                }
                if (mode === FORM.modes.view) {
                    if ($scope[forme].titles)
                        finalTitle = $scope[forme].titles.view;
                    icon = "file-eye"
                }
                $scope[forme].mode = mode;
                if (mode === FORM.modes.new) {
                    //eval(`CRUD_${$scope.modelName}.table.key = '';`);
                }
                if ($scope[forme].target === FORM.targets.modal) {

                    $scope.modal.modalView($scope.modelName + (`/${$scope.alterform || view || 'form'}`), {
                        width: $scope[forme].modalWidth || ENUM.modal.width.full,
                        header: {
                            title: finalTitle || capitalize(`${MESSAGE.i('mono.' + mode)} ${$scope.singular}`),
                            icon: $scope[forme].modalIcon || icon,
                            bg: mode !== FORM.modes.view ? COLOR.primary + '-600' : `alpha-${COLOR.primary}-600`,
                            closeButton: true,
                            h: "h6"
                        },
                        footer: {
                            cancelButton: false
                        },
                        event: {
                            show: {
                                begin: function (datam) {
                                    for (const func of $scope[forme].beginFunctions) {
                                        eval(func);
                                    }
                                },
                                end: function (datam) {
                                    $scope.triggers.table.after.open($scope[forme]);
                                    setTimeout(() => {
                                        if ($(".dragonformfooter").length < 2) {
                                            let btnformfooter = $('#btnformfooter');
                                            let elment = FIXELEMENT.isScrolledIntoViewBottom(btnformfooter);
                                            if (elment === true) {
                                                var footer_copy = btnformfooter.clone();
                                                footer_copy.addClass('footer-copy')
                                                $('.modal-body').prepend($scope.returnBuild(footer_copy));
                                            }
                                        }
                                        $(".filedragon span").each(function () {
                                            let title = $(this).parent().attr('title');
                                            let count = $(this).parent().attr('count');
                                            if (title.split(')').length > 1) {
                                                let component = title.split(')');
                                                title = component[1] + (count ? `(${count})` : '');
                                            }
                                            console.log($(this).html(title));
                                        });

                                        let select = $('.add-class select')[0];
                                        let div = document.getElementsByClassName('add-class')[0];
                                        if (select) {
                                            if (!select.disabled) {
                                                div.classList.add('focus-field-group')
                                                div.classList.remove('add-class')
                                            }
                                        }
                                    }, 1000);
                                }
                            },
                            hide: {
                                begin: async function (datam) {
                                    if (MODAL.history[MODAL.history.length - 1] === "#modal" + MODAL.current().id) {
                                        for (var field of $scope[forme].fileds) {
                                            eval(`
                                                if (${$scope.modelName}.$scope.$$watchers)
                                                    ${$scope.modelName}.$scope.$$watchers.filter((d, inx) => {
                                                        if (d.exp === \`${$scope.modelName}.\${field}\`) {
                                                            delete ${$scope.modelName}.$scope.$$watchers[inx];
                                                        }
                                                    });`);
                                        }
                                    }
                                    if (await $scope.triggers.table.before.close() === false)
                                        return;
                                    if (MODAL.history.length === 0) {
                                        if ($scope.pages !== null) {
                                            $scope.pages.form.isOpen = false;
                                        }
                                        if ($scope[forme] !== null) {
                                            $scope[forme].destroy(close);
                                            if ($scope[forme].hasChanged)
                                                if ($scope.refresh !== undefined)
                                                    $scope.refresh();
                                        }
                                    }
                                },
                                end: function () {
                                    $scope.triggers.table.after.close($scope[forme]);

                                }
                            }
                        }
                    });
                } else {
                    new LOAD().loadContentScope(
                        location.href.split('#')[1], "content", MESSAGE.i('actions.Loading'), function () {
                            MESSAGE.run();
                        }, undefined, undefined, $scope
                    );
                }
            }
            if (callback)
                callback(data);
        };
        $scope.createForm = function (data, mode, defaultData, view, callback) {
            $scope.mode = mode;

            if ($scope.validate === undefined)
                $scope.validate = [];
            if ($scope[forme] !== null) {
                if (!$scope[forme].onload)
                    $scope[forme].onload = function (name) {
                    };
                $scope[forme].mode = mode;
                for (var i in $scope[forme].readonly) {
                    eval(`$scope.${i} = $scope[forme].readonly.${i};`);
                    $scope[forme].fileds.push(i);
                }

                if (baseController.viewData)
                    if (baseController.viewData.readonly) {
                        $scope[forme].readonly = DSON.merge(baseController.viewData.readonly, $scope[forme].readonly, true);
                        for (var i in $scope[forme].readonly) {
                            eval(`$scope.${i} = $scope[forme].readonly.${i};`);
                            $scope[forme].fileds.push(i);
                        }
                    }


                if (RELATIONS.anonymous[$scope.modelName] !== undefined) {
                    $scope[forme].readonly = DSON.merge(RELATIONS.anonymous[$scope.modelName].readonly, $scope[forme].readonly, true);
                    for (var i in $scope[forme].readonly) {
                        eval(`$scope.${i} = $scope[forme].readonly.${i};`);
                        $scope[forme].fileds.push(i);
                    }
                }

                $scope.open = {};
                $scope.open.default = {};
                if (!DSON.oseaX(defaultData)) {
                    $scope.open.default = defaultData;
                }
                if (data !== null) {
                    $scope.open.query = data;
                    $scope.open.query.orderby = data.where[0].field;
                    BASEAPI.first($scope.tableOrMethod, $scope.open.query, function (data) {
                        for (var i in data) {
                            // var item = data[i];
                            // $scope.open.default[i] = item;
                            // if (item !== 'null' && item !== undefined)
                            //     $scope[i] = item;
                            var item = data[i];
                            $scope.open.default[i] = item;
                            if (item !== 'null' && item !== undefined) {
                                if (($scope?.evalDrowndowns || []).indexOf(i) !== -1) {
                                    try {
                                        $scope[i] = eval(item);
                                    } catch (e) {

                                    }
                                    if ($scope[i])
                                        $scope[i] = $scope[i].map(d => d + "");
                                } else
                                    $scope[i] = item;
                            }
                        }
                        $scope.openForm(mode, view, callback, data);
                    });
                } else {
                    $scope.openForm(mode, view, callback, data);
                }
            }
        };
        $scope[forme].getAudit = function () {
            var obj = {};
            for (var field of $scope[forme].fileds) {
                if (field.indexOf('CBS') == -1) {
                    if ($scope[forme].options[field]) {
                        if (!$scope[forme].options[field].no_audit) {
                            try {
                                var nameclean = field.replace(/\./g, '_');
                                var descripcion = eval(`$scope[forme].options.${field}.placeholder`);
                                if (MESSAGE.exist('columns.' + nameclean)) {
                                    descripcion = MESSAGE.ic('columns.' + nameclean);
                                } else {
                                    if (eval(`$scope[forme].options.${field}.placeholder`) === undefined) {
                                        descripcion = eval(`$scope[forme].options.${field}.label`);
                                    }
                                }

                                var value = $(`[name='${$scope.modelName}_${nameclean}']`).val() || $(`[name='${$scope.modelName}_${nameclean}']`).html();

                                if ($scope[forme].options[field].allowedit !== undefined) {
                                    value = "No Seleccionado";
                                    if ($(`[name='${$scope.modelName}_${field}']`).select2) {
                                        if (Array.isArray($(`[name='${$scope.modelName}_${field}']`).select2('data'))) {
                                            var cade = [];
                                            $(`[name='${$scope.modelName}_${field}']`).select2('data').forEach(d => cade.push(d.element.text));
                                            if (cade.length > 0) {
                                                value = cade.join(", ");
                                            }
                                        } else {
                                            if ($(`[name='${$scope.modelName}_${field}']`).length) {
                                                if ($(`[name='${$scope.modelName}_${field}']`).select2('data')) {
                                                    console.log($(`[name='${$scope.modelName}_${field}']`).select2('data'));
                                                    if ($(`[name='${$scope.modelName}_${field}']`).select2('data').length > 0) {
                                                        var value = [];
                                                        for (var i in $(`[name='${$scope.modelName}_${field}']`).select2('data')) {
                                                            value[i] = $(`[name='${$scope.modelName}_${field}']`).select2('data')[i].element.text.trim();
                                                        }
                                                    } else {
                                                        value = $(`[name='${$scope.modelName}_${field}']`).select2('data')[0].element.text.trim();
                                                    }
                                                }
                                            }
                                        }
                                        if (value !== "No Seleccionado") {
                                        }

                                        eval(`obj['${descripcion}'] = '${value}';`);
                                    }
                                } else if ($scope[forme].options[field].posttype === "date") {
                                    value = moment($scope[field]).format($scope[forme].options[field].format);
                                } else if ($scope[forme].options[field].posttype === "checkbox") {
                                    value = $scope[field] ? "Si" : "No";
                                    var descripcion = eval(`$scope[forme].options.${field}.text`);
                                }
                                if (value !== "undefined" && value !== undefined)
                                    eval(`obj['${descripcion}'] = '${value}';`);
                            } catch (e) {
                                eval(`obj['${field}'] = $scope.${field};`);
                            }
                        }
                    } else {
                        // if ($scope[field] !== "undefined" && $scope[field] !== undefined)
                        //     eval(`obj['${field}'] = $scope.${field};`);
                    }
                }
            }
            return obj;
        }

    }
};
