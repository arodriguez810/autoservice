getPEIstatus = async function ($scope, pei_id) {
    $scope.pei = await BASEAPI.listp("pei", {
        where: [{
            field: 'id',
            operator: "=",
            value: pei_id
        }]
    });
    if ($scope.pei.data) {
        if ($scope.pei.data.length > 0) {
            $scope.estatus_pei = $scope.pei.data[0].estatus;
            $scope.condicion_pei = $scope.pei.data[0].activo;
        }
    }
};

removeNumbers = function (str) {
    var rs = str.replace(/[0-9]/g, '');
    return rs;
};

getPOAstatus = async function ($scope, poa_id) {
    $scope.poa = await BASEAPI.listp("poa", {
        where: [{
            field: 'id',
            operator: "=",
            value: poa_id
        }]
    });
    if ($scope.poa.data) {
        $scope.estatus_poa = $scope.poa.data[0].estado;
        $scope.condicion_poa = $scope.poa.data[0].activo;
    }
};

equlizer = function (Class_name, scope) {
    var maxHeight = 0;
    $(`.${Class_name}`).each(function () {
        $(this).removeAttr('style');
        if ($(this).height() > maxHeight) {
            maxHeight = $(this).height();
        }
    });
    $(`.${Class_name}`).height(maxHeight);
};

equlizer_with_Style = function (Class_name, scope) {
    var maxHeight = 0;
    $(`.${Class_name}`).each(function () {
        if ($(this).height() > maxHeight) {
            maxHeight = $(this).height();
        }
    });
    $(`.${Class_name}`).height(maxHeight);
};

watchIndicadores = function (controller, controllerName, name) {
    controller.$scope.$watch(controllerName, function (value) {
        value ? value.replace("$", "") : value;
        var rules = [];
        if (value == "" || value == null)
            rules.push(VALIDATION.general.required(value));
        VALIDATION.validate(controller, name, rules)
    });
};

watchIndicadoresSoft = function (controller, controllerName, name) {
    controller.$scope.$watch(controllerName, function (value) {
        value ? value.replace("$", "") : value;
        var rules = [];
        VALIDATION.validate(controller, name, rules)
    });
};

watchIndicadoresValorAbsoluto = function (controller, controllerName, name) {
    controller.$scope.$watch(controllerName, function (value) {
        value = value ? value.replace("$", "") : value;
        valueR = value < 0 ? value = "" : value;
        var rules = [];
        if (valueR == "" || valueR == null) {
            rules.push(VALIDATION.yariel.mayorCeroMeta(valueR, "La Meta"));
            rules.push(VALIDATION.general.required(valueR));
        }
        VALIDATION.validate(controller, name, rules)
    });
};

function_send_email_group = function (titulo_push, cuerpo_push, titulo, cuerpo, compania, departamento, correo_usuario, institucion) {
    var array_grupos_dir_anali = [];
    var array_grupos_dir_dept = [];
    var code = [];
    var usuario_data = [];
    var usuario_director_dir_anali = [];
    var usuario_director_dir_dept = [];
    var id_usuarios_dir_anali = [];
    var correo_usuarios_dir_anali = [];
    var id_usuarios_dir_dept = [];
    var correo_usuarios_dir_dept = [];
    BASEAPI.listp('group', {}).then(function (rs_g) {
        code = rs_g.data;
        var cod = code.filter(search => {
            return search.caracteristica == ENUM_2.Grupos.director_general || search.caracteristica == ENUM_2.Grupos.analista_de_planificacion;
        });
        for (key in cod) {
            array_grupos_dir_anali.push(cod[key].id);
        }
        BASEAPI.listp('usuario', {
            limit: 0,
            where: [
                {
                    "field": "nombre",
                    "operator": "!=",
                    "value": "Admin"
                }
            ]
        }).then(function (result) {
            usuario_data = result.data;
            for (var i = 0; i < array_grupos_dir_anali.length; i++) {
                usuario_director_dir_anali.push(usuario_data.filter(search => {
                    return search.profile == array_grupos_dir_anali[i];
                }));
            }
            for (item of usuario_director_dir_anali) {
                for (resul of item) {
                    id_usuarios_dir_anali.push(resul.id);
                    correo_usuarios_dir_anali.push(resul.correo);
                }
            }
            var data_json_dir_anali = {
                title: titulo_push,
                content: cuerpo_push,
                user: id_usuarios_dir_anali,
                url: 'actividades_poa'
            };
            send_notification.send.send(data_json_dir_anali);
            if (typeof departamento != "undefined") {
                var cod2 = code.filter(search => {
                    return search.caracteristica == ENUM_2.Grupos.director_departamental;
                });
                for (key in cod2) {
                    array_grupos_dir_dept.push(cod2[key].id);
                }
                for (var i = 0; i < array_grupos_dir_dept.length; i++) {
                    usuario_director_dir_dept.push(usuario_data.filter(search => {
                        return search.profile == array_grupos_dir_dept[i] && search.departamento == departamento;
                    }));
                }
                for (item of usuario_director_dir_dept) {
                    for (resul of item) {
                        id_usuarios_dir_dept.push(resul.id);
                        correo_usuarios_dir_dept.push(resul.correo);
                    }
                }
                if (id_usuarios_dir_dept.length > 0 && correo_usuarios_dir_dept.length > 0) {
                    var data_json_dir_dept = {
                        title: titulo_push,
                        content: cuerpo_push,
                        user: id_usuarios_dir_dept,
                        url: 'actividades_poa'
                    };
                    send_notification.send.send(data_json_dir_dept);
                    if (correo_usuario) {
                        correo_usuarios_dir_dept.push(correo_usuario);
                    }
                    console.log(correo_usuarios_dir_dept, correo_usuarios_dir_anali);
                    var data_json_email_dir_anali = {
                        to: correo_usuarios_dir_dept ? correo_usuarios_dir_dept : correo_usuarios_dir_anali,
                        cc: correo_usuarios_dir_dept ? correo_usuarios_dir_anali : "",
                        subject: titulo,
                        name_show: "NoReply",
                        template: 'email/plane',
                        message: cuerpo,
                        notification: 'yes'
                    };
                } else {
                    if (correo_usuario) {
                        correo_usuarios_dir_dept.push(correo_usuario);
                    }
                    var data_json_email_dir_anali = {
                        to: correo_usuarios_dir_dept ? correo_usuarios_dir_dept : correo_usuarios_dir_anali,
                        cc: correo_usuarios_dir_dept ? correo_usuarios_dir_anali : "",
                        subject: titulo,
                        name_show: "NoReply",
                        template: 'email/plane',
                        message: cuerpo,
                        notification: 'yes'
                    };
                }
            } else {
                if (correo_usuarios_dir_anali.length > 0) {
                    var data_json_email_dir_anali = {
                        to: correo_usuarios_dir_anali,
                        subject: titulo,
                        name_show: "NoReply",
                        template: 'email/plane',
                        message: cuerpo,
                        notification: 'yes'
                    };
                }
            }
            send_notification.send.email(data_json_email_dir_anali);
            //
        });
    });
};

function_send_email_group_user = function (titulo_push, cuerpo_push, titulo, cuerpo, compania, departamento, correo_usuario, institucion) {
    var array_grupos_dir_anali = [];
    var array_grupos_dir_dept = [];
    var code = [];
    var usuario_data = [];
    var usuario_director_dir_anali = [];
    var usuario_director_dir_dept = [];
    var id_usuarios_dir_anali = [];
    var correo_usuarios_dir_anali = [];
    var id_usuarios_dir_dept = [];
    var correo_usuarios_dir_dept = [];
    BASEAPI.listp('group', {}).then(function (rs_g) {
        code = rs_g.data;
        var cod = code.filter(search => {
            return search.caracteristica == ENUM_2.Grupos.director_general || search.caracteristica == ENUM_2.Grupos.analista_de_planificacion;
        });
        for (key in cod) {
            array_grupos_dir_anali.push(cod[key].id);
        }
        BASEAPI.listp('usuario', {
            limit: 0,
            where: [
                {
                    "field": "nombre",
                    "operator": "!=",
                    "value": "Admin"
                },
                {
                    "field": "compania",
                    "value": compania
                },
                {
                    "field": "institucion",
                    "operator": institucion ? "=" : "is",
                    "value": institucion ? institucion : "$null"
                }
            ]
        }).then(function (result) {
            usuario_data = result.data;
            for (var i = 0; i < array_grupos_dir_anali.length; i++) {
                usuario_director_dir_anali.push(usuario_data.filter(search => {
                    return search.profile == array_grupos_dir_anali[i];
                }));
            }
            for (item of usuario_director_dir_anali) {
                for (resul of item) {
                    id_usuarios_dir_anali.push(resul.id);
                    correo_usuarios_dir_anali.push(resul.correo);
                }
            }
            if (id_usuarios_dir_anali.length > 0 && correo_usuarios_dir_anali.length > 0) {
                var data_json_dir_anali = {
                    title: titulo_push,
                    content: cuerpo_push,
                    user: id_usuarios_dir_anali,
                    url: 'actividades_poa'
                };
                send_notification.send.send(data_json_dir_anali);
                var data_json_email_dir_anali = {
                    to: correo_usuario,
                    cc: correo_usuarios_dir_anali,
                    subject: titulo,
                    name_show: "NoReply",
                    template: 'email/plane',
                    message: cuerpo,
                    notification: 'yes'
                };
                if (typeof departamento != "undefined") {
                    var cod2 = code.filter(search => {
                        return search.caracteristica == ENUM_2.Grupos.director_departamental;
                    });
                    for (key in cod2) {
                        array_grupos_dir_dept.push(cod2[key].id);
                    }
                    for (var i = 0; i < array_grupos_dir_dept.length; i++) {
                        usuario_director_dir_dept.push(usuario_data.filter(search => {
                            return search.profile == array_grupos_dir_dept[i] && search.departamento == departamento;
                        }));
                    }
                    for (item of usuario_director_dir_dept) {
                        for (resul of item) {
                            id_usuarios_dir_dept.push(resul.id);
                            correo_usuarios_dir_anali.push(resul.correo);
                        }
                    }
                    var data_json_dir_dept = {
                        title: titulo_push,
                        content: cuerpo_push,
                        user: id_usuarios_dir_dept,
                        url: 'actividades_poa'
                    };
                    send_notification.send.send(data_json_dir_dept);

                    // var data_json_email_dir_dept = {
                    //     to: correo_usuarios_dir_dept,
                    //     subject: titulo,
                    //     name_show: "NoReply",
                    //     template: 'email/plane',
                    //     message: cuerpo,
                    //     notification: 'yes'
                    // };

                    // console.log("Todas las variables a ver qué pasa",cod2,array_grupos_dir_dept, usuario_director_dir_dept, id_usuarios_dir_dept, correo_usuarios_dir_anali)
                    // if (correo_usuarios_dir_dept.length > 0) {
                    //     send_notification.send.email(data_json_email_dir_dept);
                    // }
                }
                send_notification.send.email(data_json_email_dir_anali);
            }
            //

        });
    });
};

function_send_email_director_user = function (titulo_push, cuerpo_push, titulo, cuerpo, compania, departamento, correo_usuario, institucion) {
    var array_grupos_dir_anali = [];
    var array_grupos_dir_dept = [];
    var code = [];
    var usuario_data = [];
    var usuario_director_dir_anali = [];
    var usuario_director_dir_dept = [];
    var id_usuarios_dir_anali = [];
    var correo_usuarios_dir_anali = [];
    var id_usuarios_dir_dept = [];
    var correo_usuarios_dir_dept = [];
    BASEAPI.listp('group', {}).then(function (rs_g) {
        code = rs_g.data;
        var cod = code.filter(search => {
            return search.caracteristica == ENUM_2.Grupos.director_general || search.caracteristica == ENUM_2.Grupos.analista_de_planificacion;
        });
        for (key in cod) {
            array_grupos_dir_anali.push(cod[key].id);
        }
        BASEAPI.listp('usuario', {
            limit: 0,
            where: [
                {
                    "field": "nombre",
                    "operator": "!=",
                    "value": "Admin"
                },
                {
                    "field": "compania",
                    "value": compania
                },
                {
                    "field": "institucion",
                    "operator": institucion ? "=" : "is",
                    "value": institucion ? institucion : "$null"
                }
            ]
        }).then(function (result) {
            usuario_data = result.data;
            var cod2 = code.filter(search => {
                return search.caracteristica == ENUM_2.Grupos.director_departamental;
            });
            for (key in cod2) {
                array_grupos_dir_dept.push(cod2[key].id);
            }
            for (var i = 0; i < array_grupos_dir_dept.length; i++) {
                usuario_director_dir_dept.push(usuario_data.filter(search => {
                    return search.profile == array_grupos_dir_dept[i] && search.departamento == departamento;
                }));
            }
            for (item of usuario_director_dir_dept) {
                for (resul of item) {
                    id_usuarios_dir_dept.push(resul.id);
                    correo_usuarios_dir_dept.push(resul.correo);
                }
            }
            var data_json_dir_dept = {
                title: titulo_push,
                content: cuerpo_push,
                user: id_usuarios_dir_dept,
                url: 'actividades_poa'
            };
            send_notification.send.send(data_json_dir_dept);

            var data_json_email_dir_dept = {
                to: correo_usuario,
                cc: correo_usuarios_dir_dept,
                subject: titulo,
                name_show: "NoReply",
                template: 'email/plane',
                message: cuerpo,
                notification: 'yes'
            };
            // send_notification.send.email(data_json_email_dir_dept);
            send_notification.send.email(data_json_email_dir_dept);
            //

        });
    });
};

function_send_email_group_indicadores = function (titulo_push, cuerpo_push, titulo, cuerpo, compania, departamento, variables, correo_usuario, institucion) {
    var array_grupos_dir_anali = [];
    var array_grupos_dir_dept = [];
    var code = [];
    var usuario_data = [];
    var usuario_director_dir_anali = [];
    var usuario_director_dir_dept = [];
    var id_usuarios_dir_anali = [];
    var correo_usuarios_dir_anali = [];
    var id_usuarios_dir_dept = [];
    var correo_usuarios_dir_dept = [];
    BASEAPI.listp('group', {}).then(function (rs_g) {
        code = rs_g.data;
        var cod = code.filter(search => {
            return search.caracteristica == ENUM_2.Grupos.director_general || search.caracteristica == ENUM_2.Grupos.analista_de_planificacion;
        });
        for (key in cod) {
            array_grupos_dir_anali.push(cod[key].id);
        }
        BASEAPI.listp('usuario', {
            limit: 0,
            where: [
                {
                    "field": "nombre",
                    "operator": "!=",
                    "value": "Admin"
                },
                {
                    "field": "compania",
                    "value": compania
                },
                {
                    "field": "institucion",
                    "operator": institucion ? "=" : "is",
                    "value": institucion ? institucion : "$null"
                }
            ]
        }).then(function (result) {
            usuario_data = result.data;
            for (var i = 0; i < array_grupos_dir_anali.length; i++) {
                usuario_director_dir_anali.push(usuario_data.filter(search => {
                    return search.profile == array_grupos_dir_anali[i];
                }));
            }
            for (item of usuario_director_dir_anali) {
                for (resul of item) {
                    id_usuarios_dir_anali.push(resul.id);
                    correo_usuarios_dir_anali.push(resul.correo);
                }
            }
            var data_json_dir_anali = {
                title: titulo_push,
                content: cuerpo_push,
                user: id_usuarios_dir_anali,
                url: 'actividades_poa'
            };
            send_notification.send.send(data_json_dir_anali);
            if (typeof departamento != "undefined") {
                var cod2 = code.filter(search => {
                    return search.caracteristica == ENUM_2.Grupos.director_departamental;
                });
                for (key in cod2) {
                    array_grupos_dir_dept.push(cod2[key].id);
                }
                for (var i = 0; i < array_grupos_dir_dept.length; i++) {
                    usuario_director_dir_dept.push(usuario_data.filter(search => {
                        return search.profile == array_grupos_dir_dept[i] && search.departamento == departamento;
                    }));
                }
                for (item of usuario_director_dir_dept) {
                    for (resul of item) {
                        id_usuarios_dir_dept.push(resul.id);
                        correo_usuarios_dir_dept.push(resul.correo);
                    }
                }
                if (id_usuarios_dir_dept.length > 0 && correo_usuarios_dir_dept.length > 0) {
                    // var data_json_dir_dept = {
                    //     title: titulo_push,
                    //     content: cuerpo_push,
                    //     user: id_usuarios_dir_dept,
                    //     url: 'actividades_poa'
                    // };
                    // send_notification.send.send(data_json_dir_dept);
                    if (correo_usuario) {
                        correo_usuarios_dir_dept.push(correo_usuario);
                    }
                    var data_json_email_dir_anali = {
                        to: correo_usuarios_dir_dept,
                        cc: correo_usuarios_dir_anali,
                        subject: titulo,
                        name_show: "NoReply",
                        template: 'email/indicadores',
                        message: cuerpo,
                        notification: 'yes',
                        direccion_meta: variables.direccion_meta,
                        meta_proyectada_total: variables.meta_proyectada_total,
                        meta_alcanzada_total: variables.meta_alcanzada_total
                    };
                    // send_notification.send.email_indicadores(data_json_email_dir_dept);
                }
            } else {
                var data_json_email_dir_anali = {
                    to: correo_usuarios_dir_anali,
                    subject: titulo,
                    name_show: "NoReply",
                    template: 'email/indicadores',
                    message: cuerpo,
                    notification: 'yes',
                    direccion_meta: variables.direccion_meta,
                    meta_proyectada_total: variables.meta_proyectada_total,
                    meta_alcanzada_total: variables.meta_alcanzada_total
                };
            }
            console.log(data_json_email_dir_anali);
            send_notification.send.email_indicadores(data_json_email_dir_anali);
            //

        });
    });
};

function_send_email_group_dept = function (titulo_push, cuerpo_push, titulo_email, cuerpo_email, compania, departamento_solicitante, departamento_solicitado, institucion) {
    var array_grupos_dir_anali = [];
    var array_grupos_dir_dept = [];
    var code = [];
    var usuario_data = [];
    var usuario_director_dir_anali = [];
    var usuario_director_dir_dept = [];
    var id_usuarios_dir_anali = [];
    var correo_usuarios_dir_anali = [];
    var id_usuarios_dir_dept = [];
    var correo_usuarios_dir_dept = [];
    BASEAPI.listp('group', {}).then(function (rs_g) {
        code = rs_g.data;
        var cod = code.filter(search => {
            return search.caracteristica == ENUM_2.Grupos.director_departamental;
        });
        for (key in cod) {
            array_grupos_dir_anali.push(cod[key].id);
        }
        BASEAPI.listp('usuario', {
            limit: 0,
            where: [
                {
                    "field": "nombre",
                    "operator": "!=",
                    "value": "Admin"
                },
                {
                    "field": "compania",
                    "value": compania
                },
                {
                    "field": "institucion",
                    "operator": institucion ? "=" : "is",
                    "value": institucion ? institucion : "$null"
                }
            ]
        }).then(function (result) {
            usuario_data = result.data;
            for (var i = 0; i < array_grupos_dir_anali.length; i++) {
                usuario_director_dir_anali.push(usuario_data.filter(search => {
                    return search.profile == array_grupos_dir_anali[i] && search.departamento == departamento_solicitante;
                }));
            }
            for (item of usuario_director_dir_anali) {
                for (resul of item) {
                    id_usuarios_dir_anali.push(resul.id);
                    correo_usuarios_dir_anali.push(resul.correo);
                }
            }
            var data_json_dir_anali = {
                title: titulo_push,
                content: cuerpo_push,
                user: id_usuarios_dir_anali,
                url: 'actividades_poa'
            };
            send_notification.send.send(data_json_dir_anali);

            var data_json_email_dir_anali = {
                to: correo_usuarios_dir_anali,
                subject: titulo_email,
                name_show: "NoReply",
                template: 'email/plane',
                message: cuerpo_email,
                notification: 'yes'
            };
            send_notification.send.email(data_json_email_dir_anali);
            //
            if (typeof departamento_solicitado != "undefined") {
                var cod2 = code.filter(search => {
                    return search.caracteristica == ENUM_2.Grupos.director_departamental;
                });
                for (key in cod2) {
                    array_grupos_dir_dept.push(cod2[key].id);
                }
                for (var i = 0; i < array_grupos_dir_dept.length; i++) {
                    usuario_director_dir_dept.push(usuario_data.filter(search => {
                        return search.profile == array_grupos_dir_dept[i] && search.departamento == departamento_solicitado;
                    }));
                }
                for (item of usuario_director_dir_dept) {
                    for (resul of item) {
                        id_usuarios_dir_dept.push(resul.id);
                        correo_usuarios_dir_dept.push(resul.correo);
                    }
                }
                if (id_usuarios_dir_dept.length > 0 && correo_usuarios_dir_dept.length > 0) {
                    var data_json_dir_dept = {
                        title: titulo_push,
                        content: cuerpo_push,
                        user: id_usuarios_dir_dept,
                        url: 'actividades_poa'
                    };
                    send_notification.send.send(data_json_dir_dept);

                    var data_json_email_dir_dept = {
                        to: correo_usuarios_dir_dept,
                        subject: titulo_email,
                        name_show: "NoReply",
                        template: 'email/plane',
                        message: cuerpo_email,
                        notification: 'yes'
                    };
                    send_notification.send.email(data_json_email_dir_dept);
                }
            }
        });
    });
};

function_send_email_group_poa = function (titulo_push, cuerpo_push, titulo, cuerpo, message_body, compania, departamento, estatus, institucion) {
    var array_grupos_dir_anali = [];
    var array_grupos_dir_dept = [];
    var code = [];
    var usuario_data = [];
    var usuario_director_dir_anali = [];
    var usuario_director_dir_dept = [];
    var id_usuarios_dir_anali = [];
    var correo_usuarios_dir_anali = [];
    var id_usuarios_dir_dept = [];
    var correo_usuarios_dir_dept = [];
    BASEAPI.listp('group', {}).then(function (rs_g) {
        code = rs_g.data;
        var cod = code.filter(search => {
            // if (estatus == ENUM_2.presupuesto_estatus.Completo){
            return search.caracteristica == ENUM_2.Grupos.director_general || search.caracteristica == ENUM_2.Grupos.analista_de_planificacion;
            ;
            // } else {
            //     return search.caracteristica == ENUM_2.Grupos.director_general;
            // }
        });
        for (key in cod) {
            array_grupos_dir_anali.push(cod[key].id);
        }
        BASEAPI.listp('usuario', {
            limit: 0,
            where: [
                {
                    "field": "nombre",
                    "operator": "!=",
                    "value": "Admin"
                },
                {
                    "field": "compania",
                    "value": compania
                },
                {
                    "field": "institucion",
                    "operator": institucion ? "=" : "is",
                    "value": institucion ? institucion : "$null"
                }
            ]
        }).then(function (result) {
            usuario_data = result.data;
            for (var i = 0; i < array_grupos_dir_anali.length; i++) {
                usuario_director_dir_anali.push(usuario_data.filter(search => {
                    return search.profile == array_grupos_dir_anali[i];
                }));
            }
            for (item of usuario_director_dir_anali) {
                for (resul of item) {
                    id_usuarios_dir_anali.push(resul.id);
                    correo_usuarios_dir_anali.push(resul.correo);
                }
            }
            var data_json_dir_anali = {
                title: titulo_push,
                content: cuerpo_push,
                user: id_usuarios_dir_anali,
                url: 'productos_poa'
            };
            send_notification.send.send(data_json_dir_anali);

            var data_json_email_dir_anali = {
                to: correo_usuarios_dir_anali,
                subject: titulo,
                name_show: "NoReply",
                template: 'email/autorizar_poa',
                message: cuerpo,
                message_body: message_body,
                notification: 'yes'
            };
            send_notification.send.email(data_json_email_dir_anali);
            //
            if (typeof departamento != "undefined") {
                var cod2 = code.filter(search => {
                    return search.caracteristica == ENUM_2.Grupos.director_departamental || search.caracteristica == ENUM_2.Grupos.analista_departamental;
                });
                for (key in cod2) {
                    array_grupos_dir_dept.push(cod2[key].id);
                }
                for (var i = 0; i < array_grupos_dir_dept.length; i++) {
                    usuario_director_dir_dept.push(usuario_data.filter(search => {
                        return search.profile == array_grupos_dir_dept[i] && search.departamento == departamento;
                    }));
                }
                for (item of usuario_director_dir_dept) {
                    for (resul of item) {
                        id_usuarios_dir_dept.push(resul.id);
                        correo_usuarios_dir_dept.push(resul.correo);
                    }
                }
                if (id_usuarios_dir_dept.length > 0 && correo_usuarios_dir_dept.length > 0) {
                    var data_json_dir_dept = {
                        title: titulo_push,
                        content: cuerpo_push,
                        user: id_usuarios_dir_dept,
                        url: 'productos_poa'
                    };
                    send_notification.send.send(data_json_dir_dept);

                    var data_json_email_dir_dept = {
                        to: correo_usuarios_dir_dept,
                        subject: titulo,
                        name_show: "NoReply",
                        template: 'email/autorizar_poa',
                        message: cuerpo,
                        message_body: message_body,
                        notification: 'yes'
                    };
                    send_notification.send.email(data_json_email_dir_dept);
                }
            }
        });
    });
};

getRelationData = (TableName, Field, FilterValue) => new Promise((resolve, executor) => {
    BASEAPI.listp(TableName, {
        limit: 0,
        where: [{
            field: Field,
            value: FilterValue
        }]
    }).then(function (result) {
        resolve(result.data);
    });
});

check_POA = function (controllerName, poa_ID) {
    var total_departamentos = 0;
    var departamentos_autorizados = 0;
    BASEAPI.list("vw_presupuesto_aprobado", {
        where: [
            {
                field: "poa",
                value: poa_ID
            }
        ]
    }, function (res) {
        total_departamentos = res.data.length;
    });
    BASEAPI.list("vw_presupuesto_departamento", {
        where: [
            {
                field: "poa",
                value: poa_ID
            },
            {
                field: 'estatus',
                value: 3
            }
        ]
    }, function (res) {
        departamentos_autorizados = res.data.length;
        if (total_departamentos == departamentos_autorizados && res.data.activo == 1) {
            $('.icon-plus-circle2 ').parent().hide();
        } else {
            $('.icon-plus-circle2 ').parent().show();
        }
    });
};

check_PEI = function ($scope, pei_ID) {
    BASEAPI.list('vw_pei', {
        where: [{
            field: "id",
            value: pei_ID
        }]
    }, function (res) {
        if (res.data) {
            if (res.data.length > 0) {
                if (res.data[0].activo == 0 || res.data[0].estatus_id == 4 || res.data[0].estatus_id == 5) {
                    $('.icon-plus-circle2 ').parent().hide();
                } else {
                    $('.icon-plus-circle2 ').parent().show();
                }
            } else {
                $('.icon-plus-circle2 ').parent().hide();
            }
        } else {
            $('.icon-plus-circle2 ').parent().hide();
        }
    });
};

check_active_PEI = function (pei_ID) {
    BASEAPI.list('vw_pei', {
        where: [{
            field: "id",
            value: pei_ID
        },
            {
                field: "activo",
                value: 1
            }]
    }, function (res) {
        if (res.data) {
            if (res.data.length == 0) {
                $('.icon-plus-circle2 ').parent().hide();
            } else {
                $('.icon-plus-circle2 ').parent().show();
            }
        }
    });
};

check_active_POA = function (poa_ID) {
    BASEAPI.list('vw_poa', {
        where: [
            {
                field: "id",
                value: poa_ID
            },
            {
                field: "activo",
                value: 1
            }
        ]
    }, function (res) {
        if (res.data) {
            if (res.data.length == 0) {
                $('.icon-plus-circle2 ').parent().hide();
            } else {
                $('.icon-plus-circle2 ').parent().show();
            }
        }
    });
};

title_header_table_pei = function ($scope, msj) {
    var session = new SESSION().current();
    if (session.pei_id) {
        $scope.headertitle = msj + " / " + session.periodo_pei_msj;
    } else {
        $scope.headertitle = msj + " / PEI ";
    }
};

title_header_table_poa = function ($scope, msj) {
    var session = new SESSION().current();
    if (session.poa_id) {
        if (session.tipo_institucion == 1)
            $scope.headertitle = msj + " / " + session.periodo_pei_msj + " / POA " + session.periodo_poa;
        else
            $scope.headertitle = msj + " / " + session.periodo_pei_msj + " / Gestión Presupuestaria " + session.periodo_poa;
    } else if (session.pei_id) {
        $scope.headertitle = msj + " / " + session.periodo_pei_msj;
    } else {
        $scope.headertitle = msj + " / PEI ";
    }
};

title_header_dashboard_table_poa = function ($scope, msj, poa) {
    var session = new SESSION().current();
    if (session.poa_id) {
        if (session.tipo_institucion == 1)
            $scope.headertitle = msj + " / " + session.periodo_pei_msj + " / POA " + poa;
        else
            $scope.headertitle = msj + " / " + session.periodo_pei_msj + " / Gestión Presupuestaria " + poa;
    } else if (session.pei_id) {
        $scope.headertitle = msj + " / " + session.periodo_pei_msj;
    } else {
        $scope.headertitle = msj + " / PEI ";
    }
};

maliciousCode = function (value) {
    var value = value || "";
    if (value.match(/<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2/)) {
        return true;
    } else if (value.match(/(([ trn]*)([a-zA-Z-]*)([.#]{1,1})([a-zA-Z-]*)([ trn]*)+)([{]{1,1})((([ trn]*)([a-zA-Z-]*)([:]{1,1})((([ trn]*)([a-zA-Z-0-9#]*))+)[;]{1})*)([ trn]*)([}]{1,1})([ trn]*)/)) {
        return true;
    } else if (value.match(/^<[^>]+>/)) {
        return true;
    } else if (value.match(/^(#|\.)?[^{]+{/)) {
        return true;
    } else if (value.match(/`/)) {
        return true;
    }
    return false;
};

check_poa_close = function ($scope, session) {
    if (session.est_poa === ENUM_2.poa_estatus.Cerrado) {
        eval(`CRUD_${$scope.modelName}`).table.batch = false;
        $scope.refreshAngular();
    } else {
        eval(`CRUD_${$scope.modelName}`).table.batch = false;
        $scope.refreshAngular();
    }
    return session.est_poa !== ENUM_2.poa_estatus.Cerrado;
};

toLocaleLowerCase = function (r) {
    r = r || "";
    return r.toLocaleLowerCase();
};

searchComments = function () {

}

open_ficha_indicador = function (type, indicador) {
    baseController.modal.modalView("ficha_indicador", {
        width: ENUM.modal.width.full,
        header: {
            title: "Ficha del Indicador",
            icon: "bookmark4"
        },
        footer: {
            cancelButton: false
        },
        content: {
            loadingContentText: `${MESSAGE.i('actions.Loading')}...`,
            sameController: 'ficha_indicador'
        }
    });
    // ficha_indicador.getIndicador_info("indicador actividad", 103);
    // ficha_indicador.getIndicador_info("indicador poa", 85);
    ficha_indicador.getIndicador_info(type, indicador);
}

open_comments_indicador = async function (type, indicador, allow_comment, periodo) {
    baseController.modal.modalView("vw_comentarios_indicadores", {
        width: ENUM.modal.width.full,
        header: {
            title: type == "procesos" || type == "productos poa" || type == "actividades poa" ? "Comentario" : "Observaciones",
            icon: "comment"
        },
        footer: {
            cancelButton: false
        },
        content: {
            loadingContentText: `${MESSAGE.i('actions.Loading')}...`,
            sameController: 'vw_comentarios_indicadores'
        },
    });
    if (typeof vw_comentarios_indicadores != 'undefined') {
        if (typeof vw_comentarios_indicadores != 'not defined') {
            if (vw_comentarios_indicadores) {
                await vw_comentarios_indicadores.set_comment_info(type, indicador, allow_comment, periodo);
                vw_comentarios_indicadores.headertitle = (type == "procesos" || type == "productos poa" || type == "actividades poa") ? "Comentarios" : "Observaciones";
                vw_comentarios_indicadores.refreshAngular();
                vw_comentarios_indicadores.refresh();
            }
        }
    }
}

send_email_indicador = function (sastifactoria, tipo_indicador, table_indicador, indicador, nombre_indicador, departamento, hash_url, tabla_periodo, periodo, callback, nombre_entidad) {
    var array_grupos_dir_anali = [];
    var array_grupos_dir_anali_plani = [];
    var id_usuarios_dir_anali = [];
    var correo_usuarios_dir_anali = [];
    var id_usuarios_dir_anali_pla = [];
    var correo_usuarios_dir_anali_pla = [];
    var compania = new SESSION().current().compania_id;
    var institucion = new SESSION().current().institucion;
    var tipo_indicador_nombre = "";
    var titulo = "";
    var cuerpo = "";
    var only_plani = false;
    if (tipo_indicador == "indicador pei") {
        tipo_indicador_nombre = "Indicador PEI"
    } else if (tipo_indicador == "indicador poa") {
        tipo_indicador_nombre = "Indicador de Producto"
    } else if (tipo_indicador == "indicador actividad") {
        tipo_indicador_nombre = "Indicador de Actividad"
    }
    if (sastifactoria) {
        BASEAPI.updateall(table_indicador, {
            condition: '$null',
            where: [
                {
                    field: "id",
                    value: indicador
                }
            ]
        }, function () {
            if (callback)
                callback();
        });
        titulo = "Captura de Avance de Indicadores Validada";
        cuerpo = `La captura del avance del ${nombre_entidad || tipo_indicador_nombre}: "${nombre_indicador}" ha sido validada.`
        if (tabla_periodo)
            BASEAPI.updateall(tabla_periodo, {
                condition: '$null',
                where: [
                    {
                        field: table_indicador,
                        value: indicador
                    },
                    {
                        field: tabla_periodo.indexOf("_ano") !== -1 ? "ano" : "periodo",
                        value: periodo
                    }
                ]
            }, function () {
                if (callback)
                    callback();
            });
    } else {
        BASEAPI.updateall(table_indicador, {
            condition: 1,
            where: [
                {
                    field: "id",
                    value: indicador
                }
            ]
        }, function () {
            if (callback)
                callback();
        });
        titulo = "Captura de Avance de Indicador con Objeción";
        cuerpo = `Se han revisado la captura de los avances del ${nombre_entidad || tipo_indicador_nombre}: "${nombre_indicador}" de su departamento.

Favor proceder a revisar las observaciones realizadas en la parte de “Comentarios”`;
        if (tabla_periodo)
            BASEAPI.updateall(tabla_periodo, {
                condition: '1',
                where: [
                    {
                        field: table_indicador,
                        value: indicador
                    },
                    {
                        field: tabla_periodo.indexOf("_ano") !== -1 ? "ano" : "periodo",
                        value: periodo
                    }
                ]
            }, function () {
                if (callback)
                    callback();
            });
    }
    if (hash_url == "#indicador_producto_poa" || hash_url == "#indicador_producto_poa_actividad" || hash_url == "#indicador_resultado_pei") {
        only_plani = true;
        titulo = "Notificación";
        let usuario = "";
        if (new SESSION().current())
            usuario = new SESSION().current().usuario;
        cuerpo = `${usuario} ha creado un comentario con relación al indicador "${nombre_indicador}".

Favor proceder con la verificación del mismo`;
    }

    BASEAPI.listp('group', {}).then(function (rs_g) {
        code = rs_g.data;
        var cod = code.filter(search => {
            return search.caracteristica == ENUM_2.Grupos.director_departamental || search.caracteristica == ENUM_2.Grupos.analista_departamental;
        });
        var cop = code.filter(search => {
            return search.caracteristica == ENUM_2.Grupos.director_general || search.caracteristica == ENUM_2.Grupos.analista_de_planificacion;
        });
        for (key in cod) {
            array_grupos_dir_anali.push(cod[key].id);
        }
        for (key in cop) {
            array_grupos_dir_anali_plani.push(cop[key].id);
        }
        BASEAPI.listp('usuario', {
            limit: 0,
            where: [
                {
                    "field": "compania",
                    "value": compania
                },
                {
                    "field": "institucion",
                    "operator": institucion ? "=" : "is",
                    "value": institucion ? institucion : "$null"
                }
            ]
        }).then(function (result) {
            var usuario_dep_data = result.data.filter(search => {
                if (array_grupos_dir_anali.includes(search.profile)) {
                    return search.departamento == departamento;
                }
            });
            var usuario_pla_data = result.data.filter(search => {
                if (array_grupos_dir_anali_plani.includes(search.profile)) {
                    return search;
                }
            });
            console.log(usuario_dep_data, usuario_pla_data);
            for (item of usuario_dep_data) {

                id_usuarios_dir_anali.push(item.id);
                correo_usuarios_dir_anali.push(item.correo);

            }
            for (item of usuario_pla_data) {

                id_usuarios_dir_anali_pla.push(item.id);
                correo_usuarios_dir_anali_pla.push(item.correo);

            }
            if (only_plani) {
                id_usuarios_dir_anali = [];
                correo_usuarios_dir_anali = [];
            }
            var data_json_dir_anali = {
                title: titulo,
                content: cuerpo,
                user: id_usuarios_dir_anali.length > 0 ? id_usuarios_dir_anali : id_usuarios_dir_anali_pla,
                url: hash_url
            };
            send_notification.send.send(data_json_dir_anali);

            var data_json_email_dir_anali = {
                to: correo_usuarios_dir_anali.length > 0 ? correo_usuarios_dir_anali : correo_usuarios_dir_anali_pla,
                cc: correo_usuarios_dir_anali.length > 0 ? correo_usuarios_dir_anali_pla : "",
                subject: titulo,
                name_show: "NoReply",
                template: 'email/plane',
                message: cuerpo,
                notification: 'yes'
            };
            send_notification.send.email(data_json_email_dir_anali);

        })
    });
}

insertBeforeString = function insert(main_string, ins_string, pos) {
    if (typeof (pos) == "undefined") {
        pos = 0;
    }
    if (typeof (ins_string) == "undefined") {
        ins_string = '';
    }
    return main_string.slice(0, pos) + ins_string + main_string.slice(pos);
};

getNueNumber = function (companyID, companySiglas, poaYear, currentID) {
    var dummy_comp = currentID.toString();
    if (dummy_comp.length < 4) {
        if (dummy_comp.length == 2) {
            dummy_comp = insertBeforeString(dummy_comp, "0", 0);
        }
        if (dummy_comp.length == 3) {
            dummy_comp = insertBeforeString(dummy_comp, "00", 0);
        }
        dummy_comp = insertBeforeString(dummy_comp, "000", 0);
    }
    return `${companyID}${companySiglas}${poaYear}${dummy_comp}`
};

get_pacc_status = async function ($scope, estatus) {
    $scope.next_status = await BASEAPI.listp('vw_pacc_status_next', {
        limit: 0,
        where: [
            {
                field: "pacc_status",
                value: estatus
            }
        ]
    });

    $scope.before_status = await BASEAPI.listp('vw_pacc_status_before', {
        limit: 0,
        where: [
            {
                field: "pacc_status",
                value: estatus
            }
        ]
    });
    $scope.refreshAngular();
}

get_pacc_dept_status = async function ($scope, estatus) {
    $scope.next_status = await BASEAPI.listp('vw_pacc_departamento_status_next', {
        limit: 0,
        where: [
            {
                field: "pacc_departamento_status",
                value: estatus
            }
        ]
    });

    $scope.before_status = await BASEAPI.listp('vw_pacc_departamento_status_before', {
        limit: 0,
        where: [
            {
                field: "pacc_departamento_status",
                value: estatus
            }
        ]
    });

}

function_send_email_all_directors = function (titulo_push, cuerpo_push, titulo, cuerpo, compania, institucion) {
    var array_grupos_dir_anali = [];
    var array_grupos_dir_dept = [];
    var code = [];
    var usuario_data = [];
    var usuario_director_dir_anali = [];
    var usuario_director_dir_dept = [];
    var id_usuarios_dir_anali = [];
    var correo_usuarios_dir_anali = [];
    var id_usuarios_dir_dept = [];
    var correo_usuarios_dir_dept = [];
    BASEAPI.listp('group', {}).then(function (rs_g) {
        code = rs_g.data;
        var cod = code.filter(search => {
            return search.caracteristica == ENUM_2.Grupos.director_general || search.caracteristica == ENUM_2.Grupos.analista_de_planificacion;
        });
        for (key in cod) {
            array_grupos_dir_anali.push(cod[key].id);
        }
        BASEAPI.listp('usuario', {
            limit: 0,
            where: [
                {
                    "field": "nombre",
                    "operator": "!=",
                    "value": "Admin"
                },
                {
                    "field": "compania",
                    "value": compania
                },
                {
                    "field": "institucion",
                    "operator": institucion ? "=" : "is",
                    "value": institucion ? institucion : "$null"
                }
            ]
        }).then(function (result) {
            usuario_data = result.data;
            var cod2 = code.filter(search => {
                return search.caracteristica == ENUM_2.Grupos.director_departamental;
            });
            for (key in cod2) {
                array_grupos_dir_dept.push(cod2[key].id);
            }
            for (var i = 0; i < array_grupos_dir_dept.length; i++) {
                usuario_director_dir_dept.push(usuario_data.filter(search => {
                    return search.profile == array_grupos_dir_dept[i];
                }));
            }
            for (item of usuario_director_dir_dept) {
                for (resul of item) {
                    id_usuarios_dir_dept.push(resul.id);
                    correo_usuarios_dir_dept.push(resul.correo);
                }
            }
            var data_json_dir_dept = {
                title: titulo_push,
                content: cuerpo_push,
                user: id_usuarios_dir_dept,
                url: 'actividades_poa'
            };
            var data_json_email_dir_dept = {
                to: correo_usuarios_dir_dept,
                subject: titulo,
                name_show: "NoReply",
                template: 'email/plane',
                message: cuerpo,
                notification: 'yes'
            };
            if (id_usuarios_dir_dept.length > 0)
                send_notification.send.send(data_json_dir_dept);
            if (correo_usuarios_dir_dept.length > 0)
                send_notification.send.email(data_json_email_dir_dept);
            // send_notification.send.email(data_json_email_dir_dept);
            //

        });
    });
};

function_send_email_custom_group = function (titulo_push, cuerpo_push, titulo, cuerpo, compania, institucion, primer_grupo, segundo_grupo, departamento) {
    var usuario_data = [];
    var usuario_primer_grupo = [];
    var usuario_segundo_grupo = [];
    var id_usuarios_primer_grupo = [];
    var correo_usuarios_primer_grupo = [];
    var id_usuarios_segundo_grupo = [];
    var correo_usuarios_segundo_grupo = [];
    BASEAPI.listp('usuario', {
        limit: 0,
        where: [
            {
                "field": "nombre",
                "operator": "!=",
                "value": "Admin"
            },
            {
                "field": "compania",
                "value": compania
            },
            {
                "field": "institucion",
                "operator": institucion ? "=" : "is",
                "value": institucion ? institucion : "$null"
            },
            {
                "field": "departamento",
                "value": departamento
            }
        ]
    }).then(function (result) {
        usuario_data = result.data;
        if (Array.isArray(primer_grupo)) {
            usuario_primer_grupo.push(usuario_data.filter(search => {
                return primer_grupo.includes(search.profile);
            }));
        } else {
            usuario_primer_grupo.push(usuario_data.filter(search => {
                return search.profile == primer_grupo;
            }));
        }
        if (Array.isArray(segundo_grupo)) {
            usuario_primer_grupo.push(usuario_data.filter(search => {
                return segundo_grupo.includes(search.profile);
            }));
        } else {
            usuario_segundo_grupo.push(usuario_data.filter(search => {
                return search.profile == segundo_grupo;
            }));
        }
        console.log(usuario_primer_grupo, usuario_segundo_grupo, "a ver");
        for (item of usuario_primer_grupo) {
            for (resul of item) {
                id_usuarios_primer_grupo.push(resul.id);
                correo_usuarios_primer_grupo.push(resul.correo);
            }
        }
        for (item2 of usuario_segundo_grupo) {
            for (resul2 of item2) {
                id_usuarios_segundo_grupo.push(resul2.id);
                correo_usuarios_segundo_grupo.push(resul2.correo);
            }
        }
        var data_json_primer_grupo = {
            title: titulo_push,
            content: cuerpo_push,
            user: id_usuarios_primer_grupo,
            url: '#'
        };
        var data_json_segundo_grupo = {
            title: titulo_push,
            content: cuerpo_push,
            user: id_usuarios_segundo_grupo,
            url: '#'
        };
        send_notification.send.send(data_json_primer_grupo);
        send_notification.send.send(data_json_segundo_grupo);
        console.log(correo_usuarios_primer_grupo, correo_usuarios_segundo_grupo, "a ver de nuevo");
        var data_json_email_primer_segundo_grupo = {
            to: correo_usuarios_primer_grupo,
            cc: correo_usuarios_segundo_grupo,
            subject: titulo,
            name_show: "NoReply",
            template: 'email/plane',
            message: cuerpo,
            notification: 'yes'
        };
        send_notification.send.email(data_json_email_primer_segundo_grupo);


    });
};

merge_acts_PACC = async function (departamento, callback) {
    SWEETALERT.loading({message: "Cargando por favor espere ..."});
    let session = new SESSION().current();
    let id_departamentos = [];
    let pacc_general = await BASEAPI.firstp('vw_pacc', {
        order: "desc",
        where: [
            {
                field: "estatus",
                operator: "<=",
                value: 7
            },
            {
                field: "compania",
                value: session.compania_id
            },
            {
                "field": "institucion",
                "operator": session.institucion_id ? "=" : "is",
                "value": session.institucion_id ? session.institucion_id : "$null"
            }
        ]
    })
    let PACC_DEstatus = await BASEAPI.firstp('pacc_departamento_status', {
        order: "desc",
        where: [
            {
                field: "id",
                operator: "=",
                value: 2
            }
        ]
    })
    let bad_poa_depts = [];
    let bad_poa_depts_id = [];
    let bad_poa_depts_cbs = [];
    let bad_poa_depts_cbs_id = [];
    PACC_DEstatus = PACC_DEstatus.nombre;
    let poa_dept = await BASEAPI.listp('vw_presupuesto_departamento_auth', {
        limit: 0,
        where: [
            {
                field: "poa",
                value: session.poa_id
            },
            {
                field: "id",
                operator: departamento ? "=" : ">",
                value: departamento ? departamento : 0
            },
            {
                field: "estatus",
                value: 3
            }
        ]
    })
    poa_dept = poa_dept.data;
    for (var i of poa_dept) {
        id_departamentos.push(i.id)
        if (i.count_actividades == 0) {
            bad_poa_depts.push(` "${i.nombre}"`)
            bad_poa_depts_id.push(i.id)
        }
        if (i.count_actividades_cbs == 0 && i.count_actividades_apoyo_cbs == 0) {
            bad_poa_depts_cbs.push(` "${i.nombre}"`)
            bad_poa_depts_cbs_id.push(i.id)
        }
    }
    if (pacc_general) {
        if (poa_dept.length == 0) {
            SWEETALERT.show({
                type: "error",
                message: departamento ? "POA Departamental no está Autorizado. Las actividades no se pueden transferir" : "No existen POA Departamentales Autorizados. Las actividades no se pueden transferir",
            });
        } else {
            if (bad_poa_depts.length > 0) {
                SWEETALERT.show({
                    type: "error",
                    message: departamento ? `Departamento ${bad_poa_depts} no tiene Unidades de Compras para transferir` : `Los departamentos ${bad_poa_depts} no tiene Unidades de Compras para transferir`,
                });
            } else {
                let id_actividades = [];
                let unidades_compra = [];
                let actividades_poa = await BASEAPI.listp('vw_actividades_poa', {
                    limit: 0,
                    where: [
                        {
                            open: "(",
                            connector: "OR",
                            field: "presupuestario",
                            operator: "is not",
                            value: "$null"
                        },
                        {
                            close: ")",
                            field: "bienes_permiso",
                            operator: "is not",
                            value: "$null"
                        },
                        {
                            field: "departamento",
                            value: id_departamentos
                        }
                    ]

                });
                actividades_poa = actividades_poa.data;
                for (var i of actividades_poa) {
                    let custom_object = {};
                    custom_object.actividad = i.id;
                    custom_object.cbs = i.bienes_permiso;
                    custom_object.descripcion = i.actividad;
                    custom_object.departamento = i.departamento;
                    id_actividades.push(i.id);
                    unidades_compra.push(custom_object);
                }
                let actividades_apoyo = await BASEAPI.listp('drp_actividades_apoyo', {
                    limit: 0,
                    where: [
                        {
                            open: "(",
                            connector: "OR",
                            field: "presupuestario",
                            operator: "is not",
                            value: "$null"
                        },
                        {
                            close: ")",
                            field: "bienes_permiso",
                            operator: "is not",
                            value: "$null"
                        },
                        {
                            field: "departamento",
                            value: id_departamentos
                        }
                    ]

                });
                actividades_apoyo = actividades_apoyo.data;
                for (var i of actividades_apoyo) {
                    let custom_object = {};
                    custom_object.actividad = i.id;
                    custom_object.cbs = i.bienes_permiso;
                    custom_object.descripcion = i.nombre;
                    custom_object.departamento = i.departamento;
                    id_actividades.push(i.id);
                    unidades_compra.push(custom_object);
                }
                let pacc_depts = await BASEAPI.listp('vw_pacc_departamental', {
                    limit: 0,
                    where: [
                        {
                            field: "departamento",
                            value: id_departamentos
                        },
                        {
                            field: "pacc",
                            value: pacc_general.id
                        }
                    ]
                });
                pacc_depts = pacc_depts.data;

                let lista_departamentos = await BASEAPI.listp('departamento', {
                    where: [
                        {
                            field: "compania",
                            value: session.compania_id
                        },
                        {
                            "field": "institucion",
                            "operator": session.institucion_id ? "=" : "is",
                            "value": session.institucion_id ? session.institucion_id : "$null"
                        }
                    ]
                });

                lista_departamentos = lista_departamentos.data;

                let last_unidad = await BASEAPI.firstp('vw_pacc_departamental_detail', {
                    where: [
                        {
                            field: "departamento",
                            value: id_departamentos
                        },
                        {
                            field: "actividad",
                            operator: "is not",
                            value: "$null"
                        }
                    ]
                });

                if (bad_poa_depts_cbs.length > 0) {
                    if (bad_poa_depts_cbs.length > 1) {
                        SWEETALERT.stop();
                        SWEETALERT.show({
                            type: "warning",
                            message: `<p>Ninguna de las actividades creadas para los Dptos ${bad_poa_depts_cbs} tienen código de bienes y servicios (CBS) asociado</p>`
                        })
                    } else {
                        SWEETALERT.stop();
                        SWEETALERT.show({
                            type: "warning",
                            message: `<p>Ninguna de las actividades creadas para el Dpto ${bad_poa_depts_cbs} tienen código de bienes y servicios (CBS) asociado</p>`
                        })
                    }
                } else {
                    if (lista_departamentos.length === pacc_depts.filter(d => {
                        return d.estatus > 2
                    }).length) {
                        SWEETALERT.show({
                            type: "error",
                            message: "Todos los PACC departamentales ya no pueden ser trabajados",
                        });
                    } else {
                        let bad_pacc_dpts = [];
                        let bad_pacc_dpts_id = [];
                        if (last_unidad) {
                            SWEETALERT.confirm({
                                type: "warning",
                                message: "<p>Existen registros transferidos en el pasado y serán sustituidos por los nuevos</p> ¿Desea proceder con la acción?",
                                confirm: function () {
                                    for (var i of id_departamentos) {
                                        if (pacc_depts.filter(result => result.departamento = i).length > 0) {
                                            for (var j of pacc_depts) {
                                                if (j.departamento == i && j.estatus == 2) {
                                                    BASEAPI.deleteall('pacc_departamental_detail', [
                                                        {
                                                            field: "pacc_departamento",
                                                            value: j.id
                                                        },
                                                        {
                                                            field: "actividad",
                                                            operator: "is not",
                                                            value: "$null"
                                                        }
                                                    ], function (result) {
                                                        if (result) {
                                                            BASEAPI.insert('pacc_departamental_detail', unidades_compra.filter(d => {
                                                                if (d.departamento == j.departamento) {
                                                                    delete d.departamento;
                                                                    d.pacc_departamento = j.id
                                                                    return d;
                                                                }
                                                            }), function () {
                                                            })
                                                        }
                                                    })
                                                } else {
                                                    bad_pacc_dpts.push(` "${j.departamento_nombre}"`);
                                                    bad_pacc_dpts_id.push(j.departamento)
                                                }
                                            }
                                        }
                                    }
                                    BASEAPI.insert('comentarios', poa_dept.filter(d => {
                                        ['compania', 'count_productos', 'count_actividades', 'count_actividades_cbs', 'count_actividades_apoyo_cbs', 'departamento', 'estatus', 'estatus_nombre',
                                            'id_presupuesto', 'nombre', 'poa', 'presupuesto_actividades', 'presupuesto_institucional',
                                            'presupuesto_liberado', 'presupuesto_restante', 'restante_crear', 'restante_editar', 'valor'].forEach(g => delete d[g])
                                        d.value = d.id;
                                        delete d.id;
                                        d.created_by = session.usuario_id;
                                        d.type = 21;
                                        return !bad_pacc_dpts_id.includes(d.value);
                                    }), function (result) {
                                        if (result) {
                                            if (bad_pacc_dpts.length > 0) {
                                                if (bad_pacc_dpts.length > 1) {
                                                    SWEETALERT.stop();
                                                    SWEETALERT.show({
                                                        type: "warning",
                                                        message: `<p>Las Actividades de los departamentos: ${bad_pacc_dpts} no pueden ser transferidas porque el PACC Departamental no está en estatus “${PACC_DEstatus}”, que es el único estatus permitido.</p>`
                                                    })
                                                } else {
                                                    SWEETALERT.stop();
                                                    SWEETALERT.show({
                                                        type: "warning",
                                                        message: `<p>Las Actividades del departamento ${bad_pacc_dpts} no pueden ser transferidas porque el PACC Departamental no está en estatus “${PACC_DEstatus}”, que es el único estatus permitido.</p>`
                                                    })
                                                }
                                            } else {
                                                SWEETALERT.stop();
                                                SWEETALERT.show({
                                                    message: "El proceso de transferencia ha culminado con éxito"
                                                })
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            for (var i of id_departamentos) {
                                let custom_object = {};
                                if (pacc_depts.filter(result => result.departamento = i).length > 0) {
                                    for (var j of pacc_depts) {
                                        if (j.departamento == i && j.estatus == 2) {
                                            BASEAPI.insert('pacc_departamental_detail', unidades_compra.filter(d => {
                                                if (d.departamento == j.departamento) {
                                                    delete d.departamento;
                                                    d.pacc_departamento = j.id
                                                    return d;
                                                }
                                            }), function () {

                                            });
                                        } else {
                                            bad_pacc_dpts.push(` "${j.departamento_nombre}"`);
                                            bad_pacc_dpts_id.push(j.departamento)
                                        }
                                    }
                                } else {
                                    custom_object.pacc = pacc_general.id;
                                    custom_object.nombre = poa_dept.filter(r => r.id = i)[0].nombre;
                                    custom_object.descripcion = poa_dept.filter(r => r.id = i)[0].nombre;
                                    custom_object.departamento = i;
                                    custom_object.codigo = getNueNumber(session.compania_id, session.sigla, pacc_general['año'], 1);
                                    custom_object.cantidadtotal = 0;
                                    custom_object.version = "1.0";
                                    custom_object.estatus = 2;
                                    custom_object.fecha_modificacion = moment().format("YYYY-MM-DD");
                                    BASEAPI.insertID('pacc_departamental', custom_object, '', '', async function (result) {
                                        let resultado = result.data.data[0];
                                        BASEAPI.insert('pacc_departamental_detail', unidades_compra.filter(d => {
                                            delete d.departamento;
                                            d.pacc_departamento = resultado.id
                                            return d;
                                        }), function () {
                                        });
                                    })
                                }
                            }
                            BASEAPI.insert('comentarios', poa_dept.filter(d => {
                                ['compania', 'count_productos', 'count_actividades', 'count_actividades_cbs', 'count_actividades_apoyo_cbs', 'departamento', 'estatus', 'estatus_nombre',
                                    'id_presupuesto', 'nombre', 'poa', 'presupuesto_actividades', 'presupuesto_institucional',
                                    'presupuesto_liberado', 'presupuesto_restante', 'restante_crear', 'restante_editar', 'valor'].forEach(g => delete d[g])
                                d.value = d.id;
                                delete d.id;
                                d.created_by = session.usuario_id;
                                d.type = 21;
                                return !bad_pacc_dpts_id.includes(d.value);
                            }), function (result) {
                                if (result) {
                                    if (bad_pacc_dpts.length > 0) {
                                        if (bad_pacc_dpts.length > 1) {
                                            SWEETALERT.stop();
                                            SWEETALERT.show({
                                                type: "warning",
                                                message: `<p>Las Actividades de los departamentos: ${bad_pacc_dpts} no pueden ser transferidas porque el PACC Departamental no está en estatus “${PACC_DEstatus}”, que es el único estatus permitido.</p>`
                                            })
                                        } else {
                                            SWEETALERT.stop();
                                            SWEETALERT.show({
                                                type: "warning",
                                                message: `<p>Las Actividades del departamento ${bad_pacc_dpts} no pueden ser transferidas porque el PACC Departamental no está en estatus “${PACC_DEstatus}”, que es el único estatus permitido.</p>`
                                            })
                                        }
                                    } else {
                                        SWEETALERT.stop();
                                        SWEETALERT.show({
                                            message: "El proceso de transferencia ha culminado con éxito"
                                        })
                                    }
                                }
                            });
                        }
                    }
                }

            }
        }
    } else {
        SWEETALERT.show({
            type: "error",
            message: "No existe un Plan Anual de Compras y Contrataciones disponible para trabajar",
        });
    }
    if (callback)
        callback();
}

check_in_object_array = function (array, column, value) {
    return array.some(function (el) {
        return el[column] === value;
    });
}


