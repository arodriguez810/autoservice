CRUD_usuario = {};
DSON.keepmerge(CRUD_usuario, CRUDDEFAULTS);
DSON.keepmerge(CRUD_usuario, {
    table: {
        engine: 'my',
        width: "width: 1800px;",
        sort: "id",
        order: "desc",
        columns: {
            id: {
                label: "ID",
                sorttype: "numeric",
                class: "text-left",
                visible: false,
                visibleDetail: false,
                export: false,
                exportExample: false,
                dead: true
            },
            nombre: {
                label: "Nombre",
                shorttext: 370
            },
            apellido: {
                label: "Apellido",
                shorttext: 370
            },
            correo: {
                label: "Correo",
                shorttext: 370
            },
            profile: {
                label: function () {
                    return "Grupo";
                },
                format: function (row) {
                    if (typeof row.profile === 'string') {
                        return row.tipo_auditor ? row.profile + " (" + row.tipo_auditores_nombre + ")" : row.profile;
                    } else {
                        return "[N/A]";
                    }
                }
            },
            active: {
                format: function (row) {
                    if (row.active == 1) {
                        return "Sí";
                    } else {
                        return "No";
                    }
                }
            }
        },
        allow: {
            menu: true,
            add: true,
            edit: true,
            view: true,
            remove: true,
            active: false,
            filter: true,
            import: false,
            copy: true,
            export: {
                Clipboard: true,
                PDF: true,
                CSV: true,
                XLS: true,
                DOC: true
            },
            actions: true,
        },
        options: [
            {
                text: (data) => {
                    return "";
                },
                title: (data) => {
                    if (PERMISSIONS.mypermission.usuario.allow.edit && PERMISSIONS.mypermission.usuario.allow.view && PERMISSIONS.mypermission.usuario.allow.remove) {
                        return MESSAGE.i('actions.Edit') + ", " +
                            MESSAGE.i('actions.View') + ", " +
                            MESSAGE.i('actions.Remove');
                    } else if (PERMISSIONS.mypermission.usuario.allow.edit && PERMISSIONS.mypermission.usuario.allow.view && PERMISSIONS.mypermission.usuario.allow.remove) {
                        return MESSAGE.i('actions.Edit') + ", " +
                            MESSAGE.i('actions.View') + ", " +
                            MESSAGE.i('actions.Remove');
                    } else if (PERMISSIONS.mypermission.usuario.allow.edit && PERMISSIONS.mypermission.usuario.allow.remove) {
                        return MESSAGE.i('actions.Edit') + ", " +
                            MESSAGE.i('actions.Remove');
                    } else if (PERMISSIONS.mypermission.usuario.allow.edit && PERMISSIONS.mypermission.usuario.allow.view) {
                        return MESSAGE.i('actions.Edit') + ", " +
                            MESSAGE.i('actions.View');
                    } else if (PERMISSIONS.mypermission.usuario.allow.view && PERMISSIONS.mypermission.usuario.allow.remove) {
                        return MESSAGE.i('actions.View') + ", " +
                            MESSAGE.i('actions.Remove');
                    } else if (PERMISSIONS.mypermission.usuario.allow.edit && PERMISSIONS.mypermission.usuario.allow.view) {
                        return MESSAGE.i('actions.Edit') + ", " +
                            MESSAGE.i('actions.View');
                    } else if (PERMISSIONS.mypermission.usuario.allow.edit && PERMISSIONS.mypermission.usuario.allow.remove) {
                        return MESSAGE.i('actions.Edit') + ", " +
                            MESSAGE.i('actions.Remove');
                    } else if (PERMISSIONS.mypermission.usuario.allow.edit) {
                        return MESSAGE.i('actions.Edit');
                    } else if (PERMISSIONS.mypermission.usuario.allow.view) {
                        return MESSAGE.i('actions.View');
                    } else if (PERMISSIONS.mypermission.usuario.allow.view && PERMISSIONS.mypermission.usuario.allow.remove) {
                        return MESSAGE.i('actions.View') + ", " +
                            MESSAGE.i('actions.Remove');
                    } else if (PERMISSIONS.mypermission.usuario.allow.edit) {
                        return MESSAGE.i('actions.Edit');
                    } else if (PERMISSIONS.mypermission.usuario.allow.remove) {
                        return MESSAGE.i('actions.Remove');
                    } else if (PERMISSIONS.mypermission.usuario.allow.view) {
                        return MESSAGE.i('actions.View');
                    }
                },
                icon: (data) => {
                    return "cog2";
                },
                permission: (data) => {
                    return ['edit', 'remove', 'active', 'view', 'copy'];
                },
                characterist: (data) => {
                    return '';
                },
                click: (data) => {
                    var user_status = data.$scope.records.data.filter(data2 => {
                        return data2.id == data.row.id;
                    });
                    console.log(user_status);
                    if (user_status[0].usuario_estatus == "Desbloqueado") {
                        data.$scope.setPermission("unlock_action", false);
                    } else {
                        data.$scope.setPermission("unlock_action", true);
                    }
                },
                menus: [
                    {
                        text: (data) => {
                            return MESSAGE.i('actions.Edit');
                        },
                        icon: (data) => {
                            return "pencil5";
                        },
                        permission: (data) => {
                            return 'edit';
                        },
                        characterist: (data) => {
                            return "";
                        },
                        click: function (data) {
                            data.$scope.formulary({
                                where: [{
                                    field: eval(`CRUD_${data.$scope.modelName}`).table.key,
                                    value: eval(`data.row.${eval(`CRUD_${data.$scope.modelName}`).table.key}`)
                                }]
                            }, FORM.modes.edit, {});
                            return false;
                        }
                    },
                    {
                        text: (data) => {
                            return MESSAGE.i('actions.View');
                        },
                        icon: (data) => {
                            return "eye";
                        },
                        permission: (data) => {
                            return 'view';
                        },
                        characterist: (data) => {
                            return "";
                        },
                        click: function (data) {
                            if (!DSON.oseaX(data.row)) {
                                data.$scope.dataForView = data.row;
                                data.$scope.modal.modalView(String.format("{0}/view", data.$scope.modelName), {
                                    header: {
                                        title: MESSAGE.i('mono.Viewof') + " " + data.$scope.plural,
                                        icon: "user"
                                    },
                                    footer: {
                                        cancelButton: true
                                    },
                                    content: {
                                        loadingContentText: `${MESSAGE.i('actions.Loading')}...`,
                                        sameController: true
                                    },
                                });
                            }
                        }
                    },
                    {
                        text: (data) => {
                            return MESSAGE.i('actions.Remove');
                        },
                        icon: (data) => {
                            return "trash";
                        },
                        permission: (data) => {
                            return 'remove';
                        },
                        characterist: (data) => {
                            return "";
                        },
                        click: function (data) {
                            SWEETALERT.confirm({
                                message: MESSAGE.i('alerts.AYSDelete'),
                                confirm: function () {
                                    SWEETALERT.loading({message: MESSAGE.ic('mono.deleting') + "..."});
                                    BASEAPI.first('dragon_audit', {
                                        where: [{field: 'user_id', value: 2}]
                                    }, function (result) {
                                        console.log(result);
                                        if (typeof result != 'undefined') {
                                            SWEETALERT.loading({message: "Este Usuario ha trabajado en el sistema y no se puede eliminar este registro. "});
                                        } else {
                                            data.$scope.deleteRow(data.row).then(function () {
                                                SWEETALERT.stop();
                                            });
                                        }
                                    });
                                }
                            });
                            return false;
                        }
                    },
                    {
                        text: (data) => {
                            return MESSAGE.i('actions.Enable');
                        },
                        icon: (data) => {
                            return "checkmark-circle";
                        },
                        permission: (data) => {
                            return 'active';
                        },
                        characterist: (data) => {
                            return "";
                        },
                        click: function (data) {
                            SWEETALERT.confirm({
                                message: MESSAGE.i('alerts.AYSEnable'),
                                confirm: async function () {
                                    SWEETALERT.loading({message: MESSAGE.ic('mono.procesing')});
                                    var obj_user_list = await BASEAPI.listp('usuario', {
                                        limit: 0,
                                        order: "asc",
                                        where: [
                                            {
                                                field: "profile",
                                                value: 1
                                            }
                                        ]
                                    });
                                    var admin_email_list = [];
                                    for (var i of obj_user_list.data) {
                                        admin_email_list.push(i.correo);
                                    }
                                    data.$scope.activeRow(data.row, 1).then(function () {
                                        BASEAPI.mail({
                                            "to": admin_email_list,
                                            "subject": "El usuario " + data.row.nombre + " " + data.row.apellido + " ha sido habilitado",
                                            "name": "noReply",
                                            "template": 'email/plane',
                                            "fields": { //estos campos se utilizarán en el template
                                                message: "El usuario " + data.row.nombre + " " + data.row.apellido + " ya podrá acceder a la aplicación y ser seleccionado para trabajar en el aplicativo."
                                            }
                                        }, function (result) {
                                        });
                                        SWEETALERT.stop();
                                    });
                                }
                            });
                            return false;
                        },
                        show: function (data) {
                            return data.$scope.activeColumn();
                        }
                    },
                    {
                        text: (data) => {
                            return MESSAGE.i('actions.Disable');
                        },
                        icon: (data) => {
                            return "circle";
                        },
                        permission: (data) => {
                            return 'active';
                        },
                        characterist: (data) => {
                            return "";
                        },
                        click: function (data) {
                            SWEETALERT.confirm({
                                message: MESSAGE.i('alerts.AYSDisable'),
                                confirm: async function () {
                                    var obj_user_list = await BASEAPI.listp('usuario', {
                                        limit: 0,
                                        order: "asc",
                                        where: [
                                            {
                                                field: "profile",
                                                value: 1,
                                            }
                                        ]
                                    });
                                    var admin_email_list = [];
                                    for (var i of obj_user_list.data) {
                                        admin_email_list.push(i.correo);
                                    }
                                    SWEETALERT.loading({message: MESSAGE.ic('mono.procesing')});
                                    data.$scope.activeRow(data.row, 0).then(function () {
                                        BASEAPI.mail({
                                            "to": admin_email_list,
                                            "subject": "El usuario " + data.row.nombre + " " + data.row.apellido + " ha sido deshabilitado",
                                            "name": "noReply",
                                            "template": 'email/plane',
                                            "fields": { //estos campos se utilizarán en el template
                                                message: "El usuario " + data.row.nombre + " " + data.row.apellido + " ha sido deshabilitado y por consecuencia no podrá acceder al aplicativo ni se podrá elegir para que trabaje en este."
                                            }
                                        }, function (result) {
                                        });
                                        SWEETALERT.stop();
                                    });
                                }
                            });
                            return false;
                        },
                        show: function (data) {
                            return data.$scope.activeColumn();
                        }
                    },
                    {
                        text: (data) => {
                            return MESSAGE.i('actions.unlock');
                        },
                        icon: (data) => {
                            return "unlocked2";
                        },
                        permission: (data) => {
                            return ["unlock_action"];
                        },
                        characterist: (data) => {
                            return "";
                        },
                        show: function (data) {
                            return PERMISSIONS.mypermission.usuario.allow.unlock;
                        },
                        click: function (data) {
                            SERVICE.base_auth.unlockUser({
                                username: toLocaleLowerCase(data.row.correo),
                            }, function () {
                                SWEETALERT.show({
                                    message: "El usuario ha sido desbloqueado",
                                });
                            });
                            data.$scope.refresh();
                            return false;
                        }
                    },
                    {
                        text: (data) => {
                            return MESSAGE.i('actions.Copy');
                        },
                        icon: (data) => {
                            return "copy3";
                        },
                        permission: (data) => {
                            return 'copy';
                        },
                        characterist: (data) => {
                            return "";
                        },
                        click: function (data) {

                            var formatRow = {};

                            for (var i in eval(`CRUD_${data.$scope.modelName}`).table.columns) {
                                var column = eval(`CRUD_${data.$scope.modelName}`).table.columns[i];
                                var key = i;
                                var alter = column.exportKey !== undefined ? column.exportKey : i;
                                if (eval(`CRUD_${data.$scope.modelName}`).table.columns[key].exportExample !== false) {
                                    var exampleText = eval(`CRUD_${data.$scope.modelName}`).table.columns[key].exportExample;
                                    exampleText = exampleText === undefined ? "[string]" : exampleText;
                                    var realValue = eval(`data.row.${key};`);
                                    if (!DSON.oseaX(realValue)) {
                                        if (column.link !== undefined) {
                                            realValue = eval(`data.row.${key.split('_')[0]}_${key.split('_')[1]}_id;`);
                                        }
                                        eval(`formatRow.${alter} = '${realValue}';`);
                                    }
                                }
                            }
                            SWEETALERT.confirm({
                                title: MESSAGE.i('actions.CopyRecords'),
                                message: MESSAGE.i('alerts.Copy'),
                                confirm: function () {
                                    SWEETALERT.loading({message: MESSAGE.i('actions.CopyngRecord')});
                                    var records = [formatRow];
                                    var columns = eval(`CRUD_${data.$scope.modelName}`).table.columns;
                                    var inserts = [];
                                    for (var i in records) {
                                        var record = records[i];
                                        var row = {};
                                        for (var i in record) {
                                            var key = i;
                                            var value = record[i];
                                            for (var c in columns) {
                                                var column = false;
                                                if (c === key || key === columns[c].exportKey)
                                                    column = columns[c];
                                                if (column === false) continue;
                                                eval(`row.${key} = '${value}';`);
                                                break;
                                            }
                                        }
                                        inserts.push({row: row, relations: []});
                                    }
                                    data.$scope.importing(inserts);
                                }
                            });
                            return false;
                        }
                    },
                    {
                        text: (data) => {
                            return MESSAGE.i('actions.audit');
                        },
                        title: (data) => {
                            return MESSAGE.i('actions.audit');
                        },
                        permission: (data) => {
                            return 'audit';
                        },
                        icon: (data) => {
                            return "stack-text";
                        },
                        characterist: (data) => {
                            return "";
                        },
                        click: function (data) {
                            if (!DSON.oseaX(data.row)) {
                                data.$scope.dataForView = data.row;
                                data.$scope.modal.modalView(String.format("{0}/audit", data.$scope.modelName), {
                                    header: {
                                        title: MESSAGE.i('mono.auditof') + " " + data.$scope.plural,
                                        icon: "user"
                                    },
                                    footer: {
                                        cancelButton: true
                                    },
                                    content: {
                                        loadingContentText: `${MESSAGE.i('actions.Loading')}...`,
                                        sameController: true
                                    },
                                });
                            }
                        }
                    }
                ]
            }
        ]
    }
});
