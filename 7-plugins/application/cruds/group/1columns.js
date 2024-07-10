CRUD_group = {};
DSON.keepmerge(CRUD_group, CRUDDEFAULTS);
DSON.keepmerge(CRUD_group, {
    table: {
        width: "width:1350px;",
        engine: 'ms',
        columns: {
            id: {visible: false, visibleDetail: false, export: false, exportExample: false},
            name: {
                label: "name",
                shorttext: 40
            },
            description: {
                label: "description",
                sortable: false,
                shorttext: 80,
                null: "<span class='text-grey'>[NULL]</span>"
            },
            homePage: {
                label: "Home Page",
                shorttext: 40
            },
            isAdmin: {
                label: "Admin",
                visible: true,
                sorttype: "bool",
                formattype: "bool"
            },
            notificaciones: {
                label: "Acepta Notificaciones de Avance de Indicador?",
                format: function (row) {
                    if(row.notificaciones == 1){
                        return "Sí"
                    }else {
                        return "No"
                    }
                }
            },
        }
    }
});