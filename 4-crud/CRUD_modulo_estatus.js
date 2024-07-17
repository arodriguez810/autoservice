CRUD_modulo_estatus = {};
DSON.keepmerge(CRUD_modulo_estatus, CRUDDEFAULTS);
DSON.keepmerge(CRUD_modulo_estatus, {
    table: {
        //width: "width:3000px;",
        // view: 'modulo_estatus',
        //method: 'modulo_estatus',
        //limits: [10, 50, 100, 0],
        //report: true,
        batch: false,
        //persist: false,
        //sortable: false,
        //dragrow: 'num',
        //rowStyle: function (row, $scope) {
        //    return "color:red;";
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
                dead: true,
                visible: false,
                visibleDetail: false,
                export: false,
                exportExample: false,
                nofilter: true
            },
            modulo_entidad_nombre: {
                label: "Módulo",
                linkfilter: {
                    from: "modulo_entidad",
                    value: "id",
                    text: "item.nombre",
                    whereColumn: "modulo_entidad",
                }
            },
            tipo_estatus_nombre: {
                label: "Tipo",
                linkfilter: {
                    from: "tipo_estatus",
                    value: "id",
                    text: "item.nombre",
                    whereColumn: "tipo_estatus",
                }
            },
            nombre: {},
            descripcion: {
                shorttext: 370
            },
            posteriores: {
                label: function () {
                    return "Estatus Posteriores"
                },
                format: function (row) {
                    if (modulo_estatus?.statusList) {
                        if (!row.posteriores) {
                            row.posteriores = eval(row.estatus_posterior || "[]")
                                .filter(d => modulo_estatus.statusList_simple[d])
                                .map(d => modulo_estatus.statusList_simple[d]);
                        }
                        return DSON.ULALIA(row.posteriores);
                    }
                    return "";
                },
            },
            roles: {
                label: function () {
                    return "Roles permitidos"
                },
                format: function (row) {
                    if (modulo_estatus?.statusList) {
                        if (!row.roles) {
                            row.roles = eval(row.rol_permite || "[]")
                                .filter(d => modulo_estatus.roleList_simple[d])
                                .map(d => modulo_estatus.roleList_simple[d]);
                        }
                        return DSON.ULALIA(row.roles);
                    }
                    return "";
                },
            }
        },
        filters: {
            columns: true
        },
        single: [
            {
                'table': 'tipo_estatus',
                'base': 'tipo_estatus',
                'field': 'id',
                'columns': ['id', 'nombre']
            },
            {
                'table': 'modulo_entidad',
                'base': 'modulo_entidad',
                'field': 'id',
                'columns': ['id', 'nombre']
            }
        ],

    }
});
//modify methods that existing option
//CRUD_modulo_estatus.table.options[0].menus[0].show = function (data) {
//  return data.row.id > 5;
//};
//add options example, remember add new item in allow object at admin/0-config/security/permission.json
// CRUD_modulo_estatus.table.options[0].menus.push({
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