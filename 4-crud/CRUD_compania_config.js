CRUD_compania_config = {};
DSON.keepmerge(CRUD_compania_config, CRUDDEFAULTS);
DSON.keepmerge(CRUD_compania_config, {
    table: {
        //width: "width:3000px;",
        //view: 'vw_compania_config',
        //method: 'compania_config',
        //limits: [10, 50, 100, 0],
        //report: true,
        batch: false,
        //persist: false,
        sortable: false,
        //dragrow: 'num',
        //rowStyle: function (row, $scope) {
        //    return "color:red;";
        //},
        //rowClass: function (row, $scope) {
        //    return row.name === 'whatever' ? "bg-" + COLOR.danger + "-300" : "";
        //},
        //activeColumn: "active",
        key: 'id',
        deletekeys: ['id'],
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
        },
        filters: {
            columns: true
        },
    }
});
//modify methods that existing option
//CRUD_compania_config.table.options[0].menus[0].show = function (data) {
//  return data.row.id > 5;
//};
//add options example, remember add new item in allow object at admin/0-config/security/permission.json
CRUD_compania_config.table.options = [{
    text: (data) => {
        return "Editar Configuración";
    },
    title: (data) => {
        return "Editar Configuración";
    },
    icon: (data) => {
        return "cog2";
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
}]