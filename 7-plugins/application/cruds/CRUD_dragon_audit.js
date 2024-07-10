CRUD_dragon_audit = {};
DSON.keepmerge(CRUD_dragon_audit, CRUDDEFAULTS);
DSON.keepmerge(CRUD_dragon_audit, {
    properties: ["nombre", "descripcion"],
    table: {
        //width: "width:3000px;",
        //view: 'vw_dragon_audit',
        //method: 'dragon_audit',
        //limits: [10, 50, 100, 0],
        //report: true,
        batch: false,
        //persist: false,
        //sortable: false,
        //dragrow: 'num',
        //rowStyle: function (row, $scope) {
        //     return "color:red;";
        //},
        //rowClass: function (row, $scope) {
        //    return row.name === 'whatever' ? "bg-" + COLOR.danger + "-300" : "";
        //},
        //activeColumn: "active",
        //key: 'id',
        //deletekeys: ['id'],
        columns: {
            // dbcolumnname: {
            //     visible: false,
            //     visibleDetail: false,
            //     export: false,
            //     exportExample: false,
            //     sortable: false,
            //     shorttext: 360,
            //     dead:true,
            //     formattype: ENUM.FORMAT.numeric,
            //     sorttype: ENUM.FORMATFILTER.numeric,
            //     drag: true,
            //     click: function (data) {
            //         alert(data.row.id);
            //         //["click", "dblclick", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseover", "mouseup"]
            //     },
            //     reference: "id",
            //     format: function (row) {
            //         return row.id + "*";
            //     }
            // },
            id: {
                visible: false,
                visibleDetail: false,
                export: false,
                exportExample: false
            },
            action: {
                format: function (data) {
                    var posiblos = [
                        'nombre',
                        'nombre_clasificador',
                        'nombre_institucion',
                        'nombre_mostrar',
                        'nombre_razon',
                        'nombre_estatus_act',
                        'nombre_actividad_apoyo',
                        'estatus_nombre_activdad',
                        'nombre_eje',
                        'nombre_sin_hijos',
                        'nombre_estrategia',
                        'nombre_poa',
                        'nombre_departamento_solicitante',
                        'nombre_departamento_solicitado',
                        'nombre_responsable',
                        'nombre_estatus',
                        'nombre_indicador',
                        'producto',
                        'producto_name',
                        'descripcion',
                        'tempid',
                        'calificacion',
                        'comentario',
                        'key',
                        'resultado',
                        'description',
                        'code',
                        'compromiso',
                        'compromiso_institucional',
                        'telefono',
                        'direccion',
                        'funcionario',
                        'telefono_oficial',
                        'depende_institucion',
                        'sitioweb',
                        'cargo',
                        'fortalezas',
                        'debilidades',
                        'oportunidades',
                        'amenazas',
                        'fuente',
                        'metodo_calculo',
                        'linea_base',
                        'medio_verificacion',
                        'valor',
                        'valor_alcanzado',
                        'mision',
                        'vision',
                        'conductas',
                        'objetivo',
                        'politicos',
                        'sociales',
                        'ambientales',
                        'economicos',
                        'tecnologicos',
                        'departamento',
                        'apellido',
                        'correo',
                        'password',
                        'repeatpassword',
                        'nombreobjetivo',
                        'descripcionobjetivo',
                        'responsable',
                        'estatus_actividad_apoyo',
                        'type_nombre',
                        'usuario_nombre',
                        'estatus_nombre',
                        'estatus_poa_dept_nombre',
                        'razon_nombre',
                        'tipo_inversion_nombre',
                        'clasificador_code',
                        'clasificador_nombre',
                        'comentarios',
                        'manejapresupuesto',
                        'foda',
                        'pesta',
                        'eje_estrategico_nombre',
                        'name',
                        'nombre2',
                        'indicadores',
                        'resultado_esperado',
                        'producto',
                        'eje_estrategico',
                        'objetivo_estrategico',
                        'estrategia',
                        'resultado',
                        'indicador',
                        'no_producto',
                        'actividad',
                        'no2',
                        'no_objetivo',
                        'no_estrategia',
                        'no_resultado',
                        'no1',
                        'producto_nombre',
                        'estatus',
                        'tipo_inversion',
                        'comment',
                        'departamento solicitante',
                        'departamento_solicitado',
                        'razon',
                        'departamento_solicitante',
                        'departamento_createdby',
                        'estatus_presupuesto',
                        'compromisos',
                        'compromiso_id',
                        'tipo institución',
                        'flt_tipo_institucion',
                        'acumulado',
                        'alcanzado',
                        'entidad',
                        'resultados_esperados',
                        'tipo',
                        'no',
                        'actividades_poa_nombre',
                        'descripcion_indicador',
                        'metodo',
                        'linea',
                        'indicador_poa_r',
                        'varianzas',
                        'monitoreo',
                        'medio',
                        'estrategias',
                        'resultados',
                        'no_indicador',
                        'departamento_name',
                        'indicador_pei_nombre',
                        'valores',
                        'actividad_apoyo',
                        'area_apoyo',
                        'actividad_poa_nombre',
                        'projectado',
                        'usuario',
                        'creado_en',
                        'periodo',
                        'actividad_poa',
                        'departamento_id',
                        'estrategia_nombre',
                        'resultado_nombre',
                        'ends',
                        'obj_nombre',
                        'alineación end',
                        'periodo_pei',
                        'estado',
                        'monitoreo_nombre',
                        'departamento_nombre',
                        'periodo pei',
                        'actividades_poa',
                        'restante_crear',
                        'restante_editar',
                        'fecha_inicio',
                        'fecha_fin',
                        'id_departamento',
                        'estado_producto',
                        'actividades',
                        'description_razon',
                        'compania',
                        'tipo_institucion',
                        'ano',
                        'presupuesto',
                        'tipo_meta',
                        'direccion_meta',
                        'indicador_poa_id',
                        'pei_nombre',
                        'n_estado_nombre',
                        'n_nombre',
                        'n_pei_nombre',
                        'secundarios',
                        'admin_correo',
                        'pei',
                        'poa',
                        'periodo_pei_msj',
                        'periodo_poa_msj',
                        'email',
                    ];
                    var add = [];
                    data.dataJson = DSON.stringToObject(data.dataJson);

                    if (data.dataJson) {
                        var key, keys = Object.keys(data.dataJson);
                        var n = keys.length;
                        var newobj = {}
                        while (n--) {
                            key = keys[n];
                            newobj[key.toLowerCase()
                                .replace('á', 'a')
                                .replace('é', 'e')
                                .replace('í', 'i')
                                .replace('ó', 'o')
                                .replace('ú', 'u')
                                ] = data.dataJson[key];
                        }

                        if (newobj)
                            for (var pos of posiblos) {
                                if (add.length === 2)
                                    break;
                                if (newobj[pos] !== undefined) {
                                    if (typeof newobj[pos] === 'string') {
                                        if (!newobj[pos].match(/^\d/)) {
                                            add.push(newobj[pos]);
                                        }
                                    }
                                }
                            }
                    }

                    var dataaction = "Creado";
                    if (data.action !== "insert") {
                        if (data.custom_sub_action) {
                            dataaction = data.custom_sub_action;
                        } else {
                            dataaction = "Trabajado";
                        }
                    }
                    if (data.action === "delete")
                        dataaction = "Eliminado";
                    if (data.action === "update")
                        dataaction = "Actualizado";


                    return dataaction + `(${add.join(",")})`;
                }
            },
            username: {},
            dataJson: {visible: false, visibleDetail: false, export: false, exportExample: false, dead: true},
            updatedJson: {visible: false, visibleDetail: false, export: false, exportExample: false, dead: true},
            date: {formattype: 'datetime'},
            version: {},
            ip: {},
            cambios: {
                format: function (data) {
                    var print = "N/A";
                    var blacklist = ["where", "compania", "created_at", "created_by", "deleted_at", "deleted_by", "updated_at", "updated_by"];
                    var columns = ["Campo", "Nuevo", "Viejo"];
                    var rows = [];
                    data.dataJson = DSON.stringToObject(data.dataJson);
                    data.updatedJson = DSON.stringToObject(data.updatedJson);
                    if (data) {
                        if (data.updatedJson) {
                            for (var i in data.updatedJson) {
                                if (data.dataJson) {
                                    if (data.dataJson.hasOwnProperty(i)) {
                                        if (blacklist.indexOf(i) === -1) {
                                            if (Array.isArray(data.dataJson[i]))
                                                if (data.dataJson[i].length === 0)
                                                    delete data.dataJson[i];
                                            if (data.updatedJson[i] !== data.dataJson[i]) {
                                                var columnName = MESSAGE.ic('columns.' + i, capitalizeOneSpace(i));

                                                if (print === "N/A") print = [];
                                                rows.push([columnName, data.updatedJson[i], data.dataJson[i]]);
                                                print.push(`<b>${columnName}:</b> ${data.updatedJson[i]} <b>-></b> ${data.dataJson[i]}`);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    var toreturn = "";
                    toreturn += Array.isArray(print) ? DSON.LATA(columns, rows) : print;
                    //toreturn += DSON.LATA(columns, rows);
                    return toreturn;
                },
                click: function (data) {

                },
                export: false
            }
        },
        filters: {
            columns: true
        },
        options: [
            {
                text: (data) => {
                    return "";
                },
                title: (data) => {
                    return MESSAGE.i('actions.View');
                },
                icon: (data) => {
                    return "cog2";
                },
                permission: (data) => {
                    return ['edit', 'remove', 'active', 'view', 'copy', 'audit'];
                },
                characterist: (data) => {
                    return '';
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
                        show: function (data) {
                            return true;
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
                                    event: {
                                        hide: {
                                            begin: function (data) {
                                            },
                                            end: function (data) {
                                                dragon_audit.refresh();
                                            }
                                        }
                                    }
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
                                confirm: async function () {
                                    SWEETALERT.loading({message: MESSAGE.ic('mono.deleting') + "..."});
                                    data.$scope.deleteRow(data.row).then(function () {
                                        SWEETALERT.stop();
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
                                confirm: function () {
                                    SWEETALERT.loading({message: MESSAGE.ic('mono.procesing')});
                                    data.$scope.activeRow(data.row, 1).then(function () {
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
                                confirm: function () {
                                    SWEETALERT.loading({message: MESSAGE.ic('mono.procesing')});
                                    data.$scope.activeRow(data.row, 0).then(function () {
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
                                        if (column.formattype === "datetime") {
                                            realValue = moment(realValue).format(DSON.UNIVERSALTIME);
                                        }
                                        if (column.formattype === "date") {
                                            realValue = moment(realValue).format(DSON.UNIVERSAL);
                                        }
                                        eval(`formatRow.${alter} = \`${realValue}\`;`);
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
                                                eval(`row.${key} = \`${value}\`;`);
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
                                    event: {
                                        hide: {
                                            begin: function (data) {
                                                dragon_audit.refresh();
                                            },
                                            end: function (data) {
                                                dragon_audit.refresh();
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    },
                ]
            },
            {
                text: (data) => {
                    return "";
                },
                title: (data) => {
                    return MESSAGE.i('mono.Exportas');
                },
                icon: (data) => {
                    return "file-download2";
                },
                show: (data) => {
                    return false;
                },
                permission: (data) => {
                    return ['export.Clipboard', 'export.PDF', 'export.CSV', 'export.XLS', 'export.DOC'];
                },
                characterist: (data) => {
                    return '';
                },
                menus: [
                    {
                        text: (data) => {
                            return MESSAGE.i('actions.Clipboard');
                        },
                        icon: (data) => {
                            return "copy3";
                        },
                        permission: (data) => {
                            return 'export.Clipboard';
                        },
                        characterist: (data) => {
                            return "";
                        },
                        click: function (data) {
                            data.$scope.unCheckAll();
                            data.row.selected = true;
                            data.$scope.export.go('Clipboard', true);
                            return false;
                        }
                    },
                    {
                        text: (data) => {
                            return "PDF";
                        },
                        icon: (data) => {
                            return "file-pdf";
                        },
                        permission: (data) => {
                            return 'export.PDF';
                        },
                        characterist: (data) => {
                            return "";
                        },
                        click: function (data) {
                            data.$scope.unCheckAll();
                            data.row.selected = true;
                            data.$scope.export.go('PDF', true);
                            return false;
                        }
                    },
                    {
                        text: (data) => {
                            return "CSV";
                        },
                        icon: (data) => {
                            return "libreoffice";
                        },
                        permission: (data) => {
                            return 'export.CSV';
                        },
                        characterist: (data) => {
                            return "";
                        },
                        click: function (data) {
                            data.$scope.unCheckAll();
                            data.row.selected = true;
                            data.$scope.export.go('CSV', true);
                            return false;
                        }
                    },
                    {
                        text: (data) => {
                            return ENUM.file.formats.XLS;
                        },
                        icon: (data) => {
                            return "file-excel";
                        },
                        permission: (data) => {
                            return 'export.XLS';
                        },
                        characterist: (data) => {
                            return "";
                        },
                        click: function (data) {
                            data.$scope.unCheckAll();
                            data.row.selected = true;
                            data.$scope.export.go('XLS', true);
                            return false;
                        }
                    },
                    {
                        text: (data) => {
                            return "DOCX";
                        },
                        icon: (data) => {
                            return "file-word";
                        },
                        permission: (data) => {
                            return 'export.DOC';
                        },
                        characterist: (data) => {
                            return "";
                        },
                        click: function (data) {
                            data.$scope.unCheckAll();
                            data.row.selected = true;
                            data.$scope.export.go('DOC', true);
                            return false;
                        }
                    }
                ]
            }
        ]
    }
});
//modify methods that existing option
//CRUD_dragon_audit.table.options[0].menus[0].show = function (data) {
//  return data.row.id > 5;
//};
//add options example, remember add new item in allow object at admin/0-config/security/permission.json
// CRUD_dragon_audit.table.options[0].menus.push({
//     text: (data) => {
//         return MESSAGE.i('actions.Extra');
//     },
//     icon: (data) => {
//         return "list";
//     },
//     permission: (data) => {
//         return 'extra';
//     },
//     characterist: (data) => {
//         return "";
//     },
//     show: function (data) {
//         return true;
//     },
//     click: function (data) {
//         //extra function
//         return false;
//     }
// });
