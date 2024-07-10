CRUD_group = DSON.merge(CRUD_group,
    {
        table: {
            filters: {
                columns: [
                    {
                        key: 'name',
                        label: 'Name',
                        type: FILTER.types.string,
                        placeholder: 'Name',
                        maxlength: 50
                    },
                    {
                        key: 'description',
                        label: 'Description',
                        type: FILTER.types.string,
                        maxlength: 200
                    },
                    {
                        key: 'homePage',
                        label: 'Home Page',
                        type: FILTER.types.string,
                    },
                    {
                        key: 'isAdmin',
                        label: 'Admin',
                        type: FILTER.types.bool,
                    },
                    {
                        key: 'notificaciones',
                        label: 'Acepta Notificaciones de Avance de Indicador?',
                        type: FILTER.types.bool,
                    },
                    {
                        key: 'gracia',
                        label: 'Días de Gracia',
                        type: FILTER.types.integer,
                    },
                    {
                        key: 'repeat',
                        label: 'Cantidad de días a repetir las notificaciones',
                        type: FILTER.types.integer,
                    }
                ]
            }
        }
    });