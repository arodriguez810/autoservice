lachechon = new SESSION().current();
lachechon = lachechon || {};
CRUD_usuario = DSON.merge(CRUD_usuario,
    {
        table: {
            filters: {
                columns: [
                    {
                        key: 'nombre',
                        label: 'Nombre',
                        type: FILTER.types.string,
                        placeholder: 'Nombre',
                        maxlength: 255
                    },
                    {
                        key: 'apellido',
                        label: 'Apellido',
                        type: FILTER.types.string,
                        placeholder: 'Apellido',
                        maxlength: 255
                    },
                    {
                        key: 'correo',
                        label: 'Correo',
                        type: FILTER.types.string,
                        placeholder: 'Correo',
                        maxlength: 255
                    },
                    {
                        key: 'profile',
                        label: 'Grupo',
                        type: FILTER.types.relation,
                        table: 'group',
                        value: "id",
                        text: "item.name",
                        query: {
                            limit: 0,
                            page: 1,
                            orderby: "id",
                            order: "asc",
                            distinct: false,
                            where: []
                        },
                    }
                ]
            }
        }
    });