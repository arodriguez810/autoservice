BASEAPI = {
    ajax: {
        loading: function (element) {
            if (element)
                new ANIMATION().loadingPure(element, "", element, '30');
            else
                SWEETALERT.loading({message: MESSAGE.i('actions.Loading')});
        },
        stop: function (element) {
            if (element)
                new ANIMATION().stoploadingPure(element, element);
            else
                SWEETALERT.stop();
        },
        formpost: function (method, parameters, callBack) {
            BASEAPI.ajax.loading();
            var newForm = $('<form>', {
                'action': method,
                'method': 'post'
            });

            for (var i in parameters) {
                newForm.append($('<input>', {
                    'name': i,
                    'value': parameters[i],
                    'type': 'hidden'
                }));
            }
            newForm.appendTo(document.body).submit();
            newForm.remove();
            BASEAPI.ajax.stop();
            callBack();
        },
        post: function (method, parameters, callBack, element) {
            BASEAPI.ajax.loading(element);
            $http = angular.injector(["ng"]).get("$http");
            var http = new HTTP();
            http.setToken($http);
            $http.post(method, parameters).then(function (data) {
                http.evaluate(data);
                BASEAPI.ajax.stop(element);
                callBack(data);
            }, function (data) {
                BASEAPI.ajax.stop(element);
                console.log(data);
            });
        },
        postp: (method, parameters, element) => new Promise((resolve, reject) => {
            BASEAPI.ajax.post(method, parameters, function (result) {
                resolve(result);
            }, element);
        }),
        get: function (method, parameters, callBack, element) {
            if (element != 'notLoad') {
                BASEAPI.ajax.loading(element);
            }
            $http = angular.injector(["ng"]).get("$http");
            var http = new HTTP();
            http.setToken($http);
            var query = http.objToQuery(parameters);
            $http.get(method + "?" + query).then(function (data) {
                http.evaluate(data);
                if (element != 'notLoad') {
                    BASEAPI.ajax.stop(element);
                }
                if (!http.evaluateTokenHTML(data))
                    callBack(data);
            }, function (data) {
                if (element != 'notLoad') {
                    BASEAPI.ajax.stop(element);
                }
                console.log(data);
            });
        },
    },
    cedula: (cedula) => new Promise((resolve, reject) => {
        let config = {
            "async": true,
            "url": `http://151.106.62.86/satte/public/admin/offlineservices/cedula?cedula=` + cedula,
            "method": "GET",
            headers: {'Access-Control-Allow-Origin': '*'},
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            }
        }
        $.ajax(config).done((response) => {
            resolve(response.data);
        }).fail((e) => {
            resolve(e);
        });
    }),
    cedula2: (cedula) => new Promise((resolve, reject) => {
        var http = new HTTP();
        http.allowOrigin($http);
        $http.get(`http://151.106.62.86/satte/public/admin/offlineservices/cedula?cedula=` + cedula).then(function (data) {
            resolve(data);
        }, function (data) {
            resolve(data);
        });
    }),
    csv: function (engine, tableName, paramenters) {
        var rootPath = '/api/' + model;
        BASEAPI.ajax.post(`${engine}_csv`, {
            "tableName": tableName
        }, function (data) {
            console.log(data);
        });
    },
    list: function (model, parameters, callBack) {
        $http = angular.injector(["ng"]).get("$http");
        var http = new HTTP();
        http.setToken($http);
        var rootPath = '/api/' + model;
        if (parameters.limit === 0) {
            parameters.limit = Number.MAX_SAFE_INTEGER;
        }
        $http.post(rootPath + '/list', parameters).then(function (data) {
            http.evaluate(data);
            if (!http.evaluateTokenHTML(data)) {
                if (callBack !== undefined)
                    callBack(data.data);
                else {
                    return new Promise(function (resolve, reject) {
                        resolve(data.data);
                    });
                }
            }
        }, function (data) {
            call_myswal();
            console.log('Error: ' + data);
        });
    },
    listp: (model, parameters) => new Promise((resolve, reject) => {
        BASEAPI.list(model, parameters, function (result) {
            resolve(result);
        });
    }),
    listf: async (table, where, orderby, desc) => {
        let data = undefined;
        if (where)
            data = await BASEAPI.listp(table, {
                limit: 0,
                orderby: orderby || "id",
                order: desc ? "desc" : "asc",
                where: where
            });
        else
            data = await BASEAPI.listp(table, {
                limit: 0,
                orderby: orderby || "id",
                order: desc ? "desc" : "asc",
            });
        return data.data;
    },
    listx: function (model, parameters, callBack) {
        $http = angular.injector(["ng"]).get("$http");
        var http = new HTTP();
        http.setToken($http);
        var rootPath = '/api/' + model;
        if (parameters.limit === 0) {
            parameters.limit = Number.MAX_SAFE_INTEGER;
        }
        $http.post(rootPath + '/listx', parameters).then(function (data) {
            http.evaluate(data);
            if (!http.evaluateTokenHTML(data)) {
                if (callBack !== undefined)
                    callBack(data.data);
                else {
                    return new Promise(function (resolve, reject) {
                        resolve(data.data);
                    });
                }
            }
        }, function (data) {
            call_myswal();
            console.log('Error: ' + data);
        });
    },
    first: function (model, parameters, callBack) {
        $http = angular.injector(["ng"]).get("$http");
        var http = new HTTP();
        http.setToken($http);
        var rootPath = '/api/' + model;
        if (parameters.limit === 0) {
            parameters.limit = Number.MAX_SAFE_INTEGER;
        }
        $http.post(rootPath + '/list', parameters).then(function (data) {
            http.evaluate(data);
            if (!http.evaluateTokenHTML(data))
                if (data.data.data !== undefined)
                    callBack(data.data.data[0]);
                else
                    callBack(null);
        }, function (data) {
            call_myswal();
            console.log('Error: ' + data);
        });
    },
    firstp: (model, parameters) => new Promise((resolve, reject) => {
        BASEAPI.first(model, parameters, function (result) {
            resolve(result);
        });
    }),
    get: function (model, id, callBack) {
        $http = angular.injector(["ng"]).get("$http");
        var http = new HTTP();
        http.setToken($http);
        var rootPath = '/api/' + model;
        $http.get(rootPath + '/get/' + id).then(function (data) {
            http.evaluate(data);
            if (!http.evaluateTokenHTML(data))
                callBack(data.data);
        }, function (data) {
            call_myswal();
            console.log('Error: ' + data);
        });
    },
    getp: (model, id) => new Promise((resolve, reject) => {
        BASEAPI.get(model, id, function (result) {
            resolve(result);
        });
    }),
    insert: function (model, dataToInsert, callback) {
        $http = angular.injector(["ng"]).get("$http");
        var http = new HTTP();
        http.setToken($http);
        var rootPath = '/api/' + model;
        $http.post(rootPath + '/insert', dataToInsert).then(function (data) {
            http.evaluate(data);
            if (!http.evaluateTokenHTML(data))
                callback(data);
        }, function (data) {
            call_myswal();
            console.log('Error: ' + data);
        });
    },
    insertp: (model, dataToInsert) => new Promise((resolve, reject) => {
        BASEAPI.insert(model, dataToInsert, function (result) {
            resolve(result);
        });
    }),
    insertID: function (model, dataToInsert, field, value, callback) {
        $http = angular.injector(["ng"]).get("$http");
        var http = new HTTP();
        http.setToken($http);
        var rootPath = '/api/' + model;
        var postData = {};
        postData.insertData = dataToInsert;
        postData.field = field;
        postData.value = value;
        $http.post(rootPath + '/insertID', postData).then(function (data) {
            http.evaluate(data);
            if (!http.evaluateTokenHTML(data))
                callback(data);
        }, function (data) {
            call_myswal();
            console.log('Error: ' + data);
        });
    },
    insertIDp: (model, dataToInsert, field, value) => new Promise((resolve, reject) => {
        BASEAPI.insertID(model, dataToInsert, field, value, function (result) {
            resolve(result);
        });
    }),
    insertIDpfirst: (model, dataToInsert, field, value) => new Promise((resolve, reject) => {
        BASEAPI.insertID(model, dataToInsert, field, value, function (result) {
            resolve(result?.data?.data[0] || null);
        });
    }),
    update: function (model, id, dataToUpdate, callback) {
        $http = angular.injector(["ng"]).get("$http");
        var http = new HTTP();
        http.setToken($http);
        var rootPath = '/api/' + model;
        $http.post(rootPath + '/update/' + id, dataToUpdate).then(function (data) {
            http.evaluate(data);
            if (!http.evaluateTokenHTML(data))
                callback(data);
        }, function (data) {
            call_myswal();
            console.log('Error: ' + data);
        });
    },
    updatep: (model, id, dataToUpdate) => new Promise((resolve, reject) => {
        BASEAPI.update(model, id, dataToUpdate, function (result) {
            resolve(result);
        });
    }),
    updateall: function (model, dataToUpdate, callback) {
        $http = angular.injector(["ng"]).get("$http");
        var http = new HTTP();
        http.setToken($http);
        var rootPath = '/api/' + model;
        $http.post(rootPath + '/update', dataToUpdate).then(function (data) {
            http.evaluate(data);
            if (!http.evaluateTokenHTML(data))
                callback(data);
        }, function (data) {
            call_myswal();
            console.log('Error: ' + data);
        });
    },
    updateallp: (model, dataToUpdate) => new Promise((resolve, reject) => {
        BASEAPI.updateall(model, dataToUpdate, function (result) {
            resolve(result);
        });
    }),
    deleteall: function (model, dataToDelete, callback) {
        $http = angular.injector(["ng"]).get("$http");
        var http = new HTTP();
        http.setToken($http);
        var rootPath = '/api/' + model;
        $http.post(rootPath + '/delete', dataToDelete).then(function (data) {
            http.evaluate(data);
            if (!http.evaluateTokenHTML(data))
                callback(data);
        }, function (data) {
            call_myswal();
            console.log('Error: ' + data);
        });
    },
    deleteallp: (model, dataToDelete) => new Promise((resolve, reject) => {
        BASEAPI.deleteall(model, dataToDelete, function (result) {
            resolve(result);
        });
    }),
    delete: function (model, id, callback) {
        $http = angular.injector(["ng"]).get("$http");
        var http = new HTTP();
        http.setToken($http);
        var rootPath = '/api/' + model;
        $http.delete(rootPath + '/delete/' + id).then(function (data) {
            callback(data);
        }, function (data) {
            call_myswal();
            console.log('Error: ' + data);
        });
    },
    deletep: (model, id) => new Promise((resolve, reject) => {
        BASEAPI.delete(model, id, function (result) {
            resolve(result);
        });
    }),
    truncate: function (model, callback) {
        $http = angular.injector(["ng"]).get("$http");
        var http = new HTTP();
        http.setToken($http);
        var rootPath = '/api/' + model;
        $http.post(rootPath + '/truncate').then(function (data) {
            callback(data);
        }, function (data) {
            call_myswal();
            console.log('Error: ' + data);
        });
    },
    truncatep: (model) => new Promise((resolve, reject) => {
        BASEAPI.truncate(model, function (result) {
            resolve(result);
        });
    }),
    mail: function (params, callback) {
        $http = angular.injector(["ng"]).get("$http");
        new HTTP().setToken($http);
        var rootPath = '/email/send';
        $http.post(rootPath, params).then(function (data) {
            callback(data);
        }, function (data) {
            SWEETALERT.stop();
            call_myswal();
            console.log('Error: ' + data);
        });
    },
    mailp: (params) => new Promise((resolve, reject) => {
        BASEAPI.mail(params, function (result) {
            resolve(result);
        });
    }),
};

function call_myswal() {
    var sesion = new SESSION().current();
    var urlError = new HTTP().tagpath("#" + (baseController.currentModel || {}).modelName);
    myswal = swal.mixin({
        confirmButtonClass: "btn btn-" + COLOR.success,
        cancelButtonClass: "btn btn-" + COLOR.danger,
        buttonsStyling: false,
        allowOutsideClick: false,
        closeOnClickOutside: false
    });
    SWEETALERT.show({
        type: 'error',
        title: 'Error del Sistema',
        message: 'Ha ocurrido un error no monitoreado. Estaremos restaurando la configuración para que pueda continuar trabajando. Disculpe los inconvenientes ocasionados.',
        confirm: async function () {
            SWEETALERT.loading({message: 'Refrescando...'});
            BASEAPI.mail({
                "to": [sesion.correo, sesion.admin_correo],
                "subject": 'Error del Sistema',
                "template": 'email/plane',
                "fields": {
                    message: `Ha ocurrido un error no monitoreado en la ruta ${urlError}. El usuario que generó el error fue  ${sesion.usuario}, el día ${LAN.datetime()}.`
                }
            }, async function (rs) {
                await AUDIT.LOGCUSTOM(`Error no monitoreado`, baseController.currentModel.tableOrView, {
                    mensaje: `Ha ocurrido un error no monitoreado en la ruta ${urlError}. El usuario que generó el error fue  ${sesion.usuario}, el día ${LAN.datetime()}.`
                });
                SWEETALERT.stop();
                location.reload();
                // BASEAPI.ajax.get(http.path('files/restart/'), {}, function (data) {});
            });

        }
    });
}


