AUDIT = {
    LOG: (action, modelName, data, prev) => new Promise(async (resolve, reject) => {

        var user = new SESSION().current();
        var obj = {
            modelname: modelName,
            varname: modelName,
            action: action,
            username: user.fullName(),
            dataJson: JSON.stringify(data),
            version: CONFIG.version.data,
            ip: user.ip,
            compania: user.compania_id || "",
            pei: user.pei_id || "",
            poa: user.poa_id || "",
            user_id: user.usuario_id,
            date: new Date(`${new Date()} UTC`)
        };
        if (prev) {
            obj.updatedJson = JSON.stringify(data);
            obj.dataJson = JSON.stringify(prev);
        }
        await BASEAPI.insertp('dragon_audit', obj);
        resolve(true);
    }),
    LOGCUSTOM: (action, modelName, data, prev, custom_sub_action) => new Promise(async (resolve, reject) => {
        var user = new SESSION().current();
        var accion = await BASEAPI.firstp("audit_action", {
            where: [
                {
                    field: "nombre",
                    value: action
                },
                {
                    field: "compania",
                    value: user.compania_id
                },
                {
                    field: "modelName",
                    value: modelName
                }
            ]
        });
        if (!accion) {
            await BASEAPI.insertp('audit_action', {
                nombre: action,
                compania: user.compania_id,
                modelName: modelName,
                varname: modelName,
            });
        }

        var obj = {
            modelname: modelName,
            varname: modelName,
            action: action,
            username: user.fullName(),
            dataJson: JSON.stringify(data),
            version: CONFIG.version.data,
            ip: user.ip,
            compania: user.compania_id,
            pei: user.pei_id,
            poa: user.poa_id || "",
            custom_sub_action: custom_sub_action
        };
        if (prev) {
            obj.updatedJson = JSON.stringify(data);
            obj.dataJson = JSON.stringify(prev);
        }
        await BASEAPI.insertp('dragon_audit', obj);
        resolve(true);
    }),
    ACTIONS: {
        insert: 'insert',
        update: 'update',
        delete: 'delete'
    },
    OPEN: (modelName, controllerName) => {
        let modal = {
            width: 'modal-full',
            storageModel: modelName,
            header: {
                title: MESSAGE.ic("mono.audit") + " de " + controllerName,
                icon: ''
            },
            footer: {
                cancelButton: false
            },
            content: {
                loadingContentText: MESSAGE.i('actions.Loading'),
                sameController: 'dragon_audit'
            },
            event: {
                show: {
                    begin: function (data) {
                    },
                    end: function (data) {
                    }
                }
            }
        };
        baseController.currentModel.modal.modalView("dragon_audit", modal);
    }
};
