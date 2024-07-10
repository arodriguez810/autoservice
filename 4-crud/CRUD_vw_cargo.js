CRUD_vw_cargo = {};
DSON.keepmerge(CRUD_vw_cargo, CRUDDEFAULTS);
DSON.keepmerge(CRUD_vw_cargo, {
    table: {
        //width: "width:3000px;",
        //view: 'vw_vw_cargo',
        //method: 'vw_cargo',
        //limits: [10, 50, 100, 0],
        //report: true,
        //batch: false,
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
                visible: false,
                visibleDetail: false,
                export: false,
                exportExample: false
            },
            nombre: {},
            descripcion: {shorttext: 360},
            created_at: {visible: false,visibleDetail: false,export: false,exportExample: false},
            updated_at: {visible: false,visibleDetail: false,export: false,exportExample: false},
            deleted_at: {visible: false,visibleDetail: false,export: false,exportExample: false},
            created_by: {visible: false,visibleDetail: false,export: false,exportExample: false},
            updated_by: {visible: false,visibleDetail: false,export: false,exportExample: false},
            deleted_by: {visible: false,visibleDetail: false,export: false,exportExample: false},
            compania_name: {link: {table: 'compania',from: 'compania'}},
            institucion_name: {link: {table: 'institucion',from: 'institucion'}},
            entidad: {formattype: ENUM.FORMAT.numeric}
        },
        filters: {
            columns: true
        },
        single: [
            {
                'table': 'compania',
                'base': 'compania',
                'field': 'id',
                'columns': ['id', 'name']
            },

            {
                'table': 'institucion',
                'base': 'institucion',
                'field': 'id',
                'columns': ['id', 'name']
            }]
    }
});
//modify methods that existing option
//CRUD_vw_cargo.table.options[0].menus[0].show = function (data) {
//  return data.row.id > 5;
//};
//add options example, remember add new item in allow object at admin/0-config/security/permission.json
// CRUD_vw_cargo.table.options[0].menus.push({
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