CRUD_hint_entity = {};
DSON.keepmerge(CRUD_hint_entity, CRUDDEFAULTS);
DSON.keepmerge(CRUD_hint_entity, {
    table: {
        columns: {
            id: {
                visible: false,
                visibleDetail: false,
                export: false,
                exportExample: false,
                dead:true
            },
            name: {
                shorttext: 360
            },
            description: {
                shorttext: 360
            }
        },
        filters: {
            columns: true
        }
    }
});