function decodeHTMLEntities(text) {
    return $("<textarea/>")
        .html(text)
        .text();
}

function addZeroes(num) {
    var value = num + "";
    if (value.indexOf(".") !== -1)
        return Number(num).toFixed(2);
    return value;
}

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
        if (controller.modelName == 'indicador_pei'){
            var periodo_id = name.split('metas').pop();
            var periodo = eval(`${controller.modelName}.list_${controller.modelName}_anos`).find(d => d.id == periodo_id);
        }else {
            var periodo_id = name.split('periodos').pop();
            var periodo = eval(`${controller.modelName}.list_${controller.modelName}_periodo`).find(d => d.id == periodo_id);
        }
        console.log(periodo, periodo_id, name, controllerName, controller.modelName)
        value ? value.replace("$", "") : value;
        var rules = [];
        if (periodo && periodo.valor_alcanzado)
            rules.push(VALIDATION.yariel.customValidation(value, periodo.valor, "Esta meta no puede ser modificada debido a que tiene un valor alcanzado"))
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
        if (controller.modelName == 'indicador_pei'){
            var periodo_id = name.split('metas').pop();
            var periodo = eval(`${controller.modelName}.list_${controller.modelName}_anos`).find(d => d.id == periodo_id);
        }else {
            var periodo_id = name.split('periodos').pop();
            var periodo = eval(`${controller.modelName}.list_${controller.modelName}_periodo`).find(d => d.id == periodo_id);
        }
        value = value ? value.replace("$", "") : value;
        valueR = value < 0 ? value = "" : value;
        var rules = [];
        if (periodo && periodo.valor_alcanzado)
            rules.push(VALIDATION.yariel.customValidation(value, periodo.valor, "Esta meta no puede ser modificada debido a que tiene un valor alcanzado"))
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
    var session = new SESSION().current();
    if (session.est_poa == 5 || session.poa_habilitado == 0){
        $('.icon-plus-circle2 ').parent().hide();
        return
    }
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
        if (session.poa_id) {
            if (session.tipo_institucion == 1)
                $scope.headertitle = msj + " / PEI (" + session.periodo_desde + ' - ' +  session.periodo_hasta + ") POA - " + session.periodo_poa;
            else
                $scope.headertitle = msj + " / PEI (" + session.periodo_desde + ' - ' +  session.periodo_hasta + ") Gestión Presupuestaria - " + session.periodo_poa;
        }else {
            $scope.headertitle = msj + " / PEI (" + session.periodo_desde + ' - ' +  session.periodo_hasta + ")";
        }
    } else {
        $scope.headertitle = msj + " / PEI ";
    }
};

title_header_table_poa = function ($scope, msj) {
    var session = new SESSION().current();
    if (session.poa_id) {
        if (session.tipo_institucion == 1)
            $scope.headertitle = msj + " / PEI (" + session.periodo_desde + ' - ' +  session.periodo_hasta + ") POA - " + session.periodo_poa;
        else
            $scope.headertitle = msj + " / PEI (" + session.periodo_desde + ' - ' +  session.periodo_hasta + ") Gestión Presupuestaria - " + session.periodo_poa;
    } else if (session.pei_id) {
        $scope.headertitle = msj + " / PEI (" + session.periodo_desde + ' - ' +  session.periodo_hasta + ")";
    } else {
        $scope.headertitle = msj + " / PEI ";
    }
};

title_header_dashboard_table_poa = function ($scope, msj, poa) {
    var session = new SESSION().current();
    if (session.poa_id) {
        if (session.tipo_institucion == 1)
            $scope.headertitle = msj + " / PEI (" + session.periodo_desde + ' - ' +  session.periodo_hasta + ") POA - " + session.periodo_poa;
        else
            $scope.headertitle = msj + " / PEI (" + session.periodo_desde + ' - ' +  session.periodo_hasta + ") Gestión Presupuestaria - " + session.periodo_poa;
    } else if (session.pei_id) {
        $scope.headertitle = msj + " / PEI (" + session.periodo_desde + ' - ' +  session.periodo_hasta + ")";
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
            title: type == "procesos" || type == "productos poa" || type == "actividades poa" || type == "generico" ? "Comentario" : "Observaciones",
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
                vw_comentarios_indicadores.headertitle = (type == "procesos" || type == "productos poa" || type == "actividades poa" || type == "generico") ? "Comentarios" : "Observaciones";
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
    } else if (tipo_indicador == "indicador generico") {
        tipo_indicador_nombre = "Indicador"
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
        titulo = `Notificación Relacionada al Indicador: "${nombre_indicador}"`;
        cuerpo = `Se han revisado las objeciones de las medidas del ${tipo_indicador_nombre} llamado "${nombre_indicador}".
        
Favor proceder a revisar las correcciones realizadas sugeridas.`
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

function_send_email_custom_group_res = function (titulo_push, cuerpo_push, titulo, cuerpo, compania, institucion, responsable, segundo_grupo, departamento) {
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
        if (responsable) {
            usuario_primer_grupo.push(usuario_data.filter(search => {
                return search.id == responsable;
            }));
        }
        if (Array.isArray(segundo_grupo)) {
            usuario_segundo_grupo.push(usuario_data.filter(search => {
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

function_send_email_custom_group_res_list = function (titulo_push, cuerpo_push, titulo, cuerpo, compania, institucion, responsable, primer_grupo, segundo_grupo, list, message_body) {
    var usuario_data = [];
    var usuario_primer_grupo = [];
    var usuario_segundo_grupo = [];
    var id_usuarios_primer_grupo = [];
    var correo_usuarios_primer_grupo = [];
    var id_usuarios_segundo_grupo = [];
    var correo_usuarios_segundo_grupo = [];
    var usuario_list = [];
    var nombre_usuario_list = [];
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
            usuario_segundo_grupo.push(usuario_data.filter(search => {
                return segundo_grupo.includes(search.profile) || search.id == responsable;
            }));
        } else {
            usuario_segundo_grupo.push(usuario_data.filter(search => {
                return search.profile == segundo_grupo || search.id == responsable;
            }));
        }
        if (Array.isArray(list)) {
            usuario_list.push(usuario_data.filter(search => {
                return list.includes(search.profile);
            }));
        } else {
            usuario_list.push(usuario_data.filter(search => {
                return search.profile == list;
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
        for (item3 of usuario_list) {
            for (resul3 of item3) {
                nombre_usuario_list.push(resul3.nombre + ' ' + resul3.apellido);
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
            list: nombre_usuario_list,
            notification: 'yes',
            message_body: message_body
        };
        send_notification.send.email(data_json_email_primer_segundo_grupo);


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
            usuario_segundo_grupo.push(usuario_data.filter(search => {
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
                                    'presupuesto_liberado', 'presupuesto_restante', 'restante_crear', 'restante_editar', 'valor', 'active', 'presupuesto_aprobado'].forEach(g => delete d[g])
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

function_send_email_custom_group_with_list = function (titulo_push, cuerpo_push, titulo, cuerpo, compania, institucion, primer_grupo, segundo_grupo, auditores, participantes, auditores_first, participantes_first, list, cuerpo_2) {
    var usuario_data = [];
    var usuario_primer_grupo = [];
    var usuario_segundo_grupo = [];
    var id_usuarios_primer_grupo = [];
    var correo_usuarios_primer_grupo = [];
    var id_usuarios_segundo_grupo = [];
    var correo_usuarios_segundo_grupo = [];
    var auditores_list = [];
    BASEAPI.listp('usuario', {
        limit: 0,
        where: [
            {
                "field": "correo",
                "operator": "!=",
                "value": "admin@eisdr.com"
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
            usuario_segundo_grupo.push(usuario_data.filter(search => {
                return segundo_grupo.includes(search.profile);
            }));
        } else {
            usuario_segundo_grupo.push(usuario_data.filter(search => {
                return search.profile == segundo_grupo;
            }));
        }
        console.log(usuario_primer_grupo, usuario_segundo_grupo, "a ver");
        for (item of usuario_primer_grupo) {
            for (var resul of item) {
                id_usuarios_primer_grupo.push(resul.id);
                correo_usuarios_primer_grupo.push(resul.correo);
            }
        }
        for (item2 of usuario_segundo_grupo) {
            for (var resul2 of item2) {
                id_usuarios_segundo_grupo.push(resul2.id);
                correo_usuarios_segundo_grupo.push(resul2.correo);
            }
        }
        if (Array.isArray(auditores)) {
            if (auditores_first) {
                for (var itemA of auditores) {
                    id_usuarios_primer_grupo.push(itemA.usuario);
                    correo_usuarios_primer_grupo.push(itemA.usuario_correo);
                    auditores_list.push(`${itemA.usuario_nombre} ( ${itemA.rol} )`)
                }
            } else {
                for (var itemA of auditores) {
                    id_usuarios_segundo_grupo.push(itemA.usuario);
                    correo_usuarios_segundo_grupo.push(itemA.usuario_correo);
                    auditores_list.push(`${itemA.usuario_nombre} ( ${itemA.rol} )`)
                }
            }
        }
        if (Array.isArray(participantes)) {
            if (participantes_first) {
                for (var itemB of participantes) {
                    id_usuarios_primer_grupo.push(itemB.usuario);
                    correo_usuarios_primer_grupo.push(itemB.usuario_correo);
                }
            } else {
                for (var itemB of participantes) {
                    id_usuarios_segundo_grupo.push(itemB.usuario);
                    correo_usuarios_segundo_grupo.push(itemB.usuario_correo);
                }
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
        console.log(auditores_list, "a ver de nuevo");
        var data_json_email_primer_segundo_grupo = {
            to: correo_usuarios_primer_grupo,
            cc: correo_usuarios_segundo_grupo,
            subject: titulo,
            name_show: "NoReply",
            template: 'email/auditoria',
            message: cuerpo,
            notification: 'yes',
            list: list ? auditores_list : undefined,
            message_3: cuerpo_2
        };
        send_notification.send.email_auditoria(data_json_email_primer_segundo_grupo);
    });
};

function_send_email_custom_group_with_list_auditoria_autorizada = function (titulo_push, cuerpo_push, titulo, cuerpo, compania, institucion, primer_grupo, segundo_grupo, auditores, participantes, auditores_first, participantes_first, list_auditores, list_participantes, cuerpo_2, cuerpo_3) {
    var usuario_data = [];
    var usuario_primer_grupo = [];
    var usuario_segundo_grupo = [];
    var id_usuarios_primer_grupo = [];
    var correo_usuarios_primer_grupo = [];
    var id_usuarios_segundo_grupo = [];
    var correo_usuarios_segundo_grupo = [];
    var auditores_list = [];
    var participantes_list = [];
    BASEAPI.listp('usuario', {
        limit: 0,
        where: [
            {
                "field": "correo",
                "operator": "!=",
                "value": "admin@eisdr.com"
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
            usuario_segundo_grupo.push(usuario_data.filter(search => {
                return segundo_grupo.includes(search.profile);
            }));
        } else {
            usuario_segundo_grupo.push(usuario_data.filter(search => {
                return search.profile == segundo_grupo;
            }));
        }
        console.log(usuario_primer_grupo, usuario_segundo_grupo, "a ver");
        for (item of usuario_primer_grupo) {
            for (var resul of item) {
                id_usuarios_primer_grupo.push(resul.id);
                correo_usuarios_primer_grupo.push(resul.correo);
            }
        }
        for (item2 of usuario_segundo_grupo) {
            for (var resul2 of item2) {
                id_usuarios_segundo_grupo.push(resul2.id);
                correo_usuarios_segundo_grupo.push(resul2.correo);
            }
        }
        if (Array.isArray(auditores)) {
            if (auditores_first) {
                for (var itemA of auditores) {
                    id_usuarios_primer_grupo.push(itemA.usuario);
                    correo_usuarios_primer_grupo.push(itemA.usuario_correo);
                    auditores_list.push(`${itemA.usuario_nombre} ( ${itemA.rol} )`)
                }
            } else {
                for (var itemA of auditores) {
                    id_usuarios_segundo_grupo.push(itemA.usuario);
                    correo_usuarios_segundo_grupo.push(itemA.usuario_correo);
                    auditores_list.push(`${itemA.usuario_nombre} ( ${itemA.rol} )`)
                }
            }
        }
        if (Array.isArray(participantes)) {
            if (participantes_first) {
                for (var itemB of participantes) {
                    id_usuarios_primer_grupo.push(itemB.usuario);
                    correo_usuarios_primer_grupo.push(itemB.usuario_correo);
                    participantes_list.push(`${itemB.usuario_nombre} ( ${itemB.usuario_departamento} )`)
                }
            } else {
                for (var itemB of participantes) {
                    id_usuarios_segundo_grupo.push(itemB.usuario);
                    correo_usuarios_segundo_grupo.push(itemB.usuario_correo);
                    participantes_list.push(`${itemB.usuario_nombre} ( ${itemB.usuario_departamento} )`)
                }
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
        console.log(auditores_list, "a ver de nuevo");
        var data_json_email_primer_segundo_grupo = {
            to: correo_usuarios_primer_grupo,
            cc: correo_usuarios_segundo_grupo,
            subject: titulo,
            name_show: "NoReply",
            template: 'email/auditoria',
            message: cuerpo,
            notification: 'yes',
            list: list_participantes ? participantes_list : undefined,
            list2: list_auditores ? auditores_list : undefined,
            message_2: cuerpo_2,
            message_3: cuerpo_3
        };
        send_notification.send.email_auditoria(data_json_email_primer_segundo_grupo);
    });
};

function stripHtml(html) {
    let tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

FORMATCRUDDATA = (data, CRUD) => {

    var formatedData = [];


    var goColums = Object.keys(CRUD.table.columns);

    var newRow = {};
    let row = data;
    for (const column of goColums) {
        var columnObj = CRUD.table.columns[column];
        if (columnObj) {
            if (typeof columnObj.format === "function")
                eval(`newRow.${column} = columnObj.format(row);`);
            else {
                let goValue = row[columnObj];
                goValue = FORMATCLEAN(CRUD.table.columns[column], row, column);
                newRow[column] = goValue;
            }
        }
    }
    return newRow;
};

FORMATCLEAN = (column, row, key) => {
    var http = new HTTP();
    var value = eval("row." + key);
    if (column.multilink !== undefined) {
        return "...";
    }
    if (column.link !== undefined) {
        if (value === null)
            return "[N/A]";
        return value;
    }
    if (column.anonymous === true) {
        column.sortable = false;
        data = {
            $scope: $scope,
            row: row
        };
        value = typeof column.value === "function" ? column.value(data) : column.value;
    }
    if (column.formattype !== undefined) {
        if (column.formattype.indexOf("datetime") !== -1) {
            if (DSON.oseaX(value)) return DSON.noset();
            return LAN.datetime(value);
        } else if (column.formattype.indexOf("date") !== -1) {
            if (DSON.oseaX(value)) return DSON.noset();
            return LAN.date(value);
        } else if (column.formattype.indexOf("time") !== -1) {
            if (DSON.oseaX(value)) return DSON.noset();
            return LAN.time(value);
        } else if (column.formattype.indexOf("money") !== -1) {
            if (DSON.oseaX(value)) return DSON.noset();
            var numeralValue = numeral(value)._value;
            return numeralValue ? LAN.money(numeralValue).format(true) : LAN.money("0.00").format(true);
        } else if (column.formattype.indexOf("percentage") !== -1) {
            if (DSON.oseaX(value)) return DSON.noset();
            return value + "%";
        } else if (column.formattype.indexOf("password") !== -1) {
            if (DSON.oseaX(value)) return DSON.noset();
            return "*******";
        } else if (column.formattype.indexOf("creditcard") !== -1) {
            if (DSON.oseaX(value)) return DSON.noset();
            if (value.length > 4)
                return "****-" + value.substr(value.length - 4, 4);
            else
                return "";
        } else if (column.formattype === "bool") {
            if (DSON.oseaX(value)) return DSON.noset();
            if (value) return MESSAGE.ic('mono.yes');
            else return MESSAGE.ic('mono.no');
        } else if (column.formattype.indexOf("numeric") !== -1) {
            if (DSON.oseaX(value)) return "";
            var numeralValue = numeral(value)._value;
            return numeralValue ? LAN.money(numeralValue).format(false).split(LAN.money().s.decimal)[0] : "0";
        } else if (column.formattype.indexOf("location") !== -1) {
            if (DSON.oseaX(value))
                return DSON.noset();
            return `${value}`;
        } else if (column.formattype.indexOf("file") !== -1) {
            return http.path([CONFIG.filePath, value]);
        } else if (column.formattype.indexOf("html") !== -1) {

            return http.path([CONFIG.filePath, value]);
        } else if (column.formattype === "color") {
            return value;
        }
    }

    if (typeof column.format === "function")
        value = column.format(value);
    if (value === null || value === undefined) return column.null || "";
    return HTML.strip(value);
};


directRunMagicManyToMany = (daton, column, tablaDesc, idMAM, mykey, showColumn, tableMAM, idADY, idDesc) => new Promise(async (resolve, reject) => {
    try {
        mykey = mykey || "id";
        idADY = idADY || tablaDesc;
        idDesc = idDesc || "id";
        showColumn = showColumn || "name";
        tableMAM = tableMAM;
        let fromallids = [];
        for (const row of daton) {
            fromallids.push(row[mykey]);
        }
        let result = await BASEAPI.listp(tableMAM, {
            limit: 0,
            where: [{field: idMAM, value: fromallids}]
        });
        let toallids = [];
        for (const row of result.data) {
            toallids.push(row[idADY]);
        }
        let descriptions = await BASEAPI.listp(tablaDesc, {
            limit: 0,
            where: [{
                field: idDesc,
                value: toallids
            }]
        });

        for (const row of daton) {
            row[mykey] = row[mykey] || undefined;
            var mylist = [];
            for (const d of result.data) {
                if (row[mykey] !== undefined)
                    if (d[idMAM].toString() === row[mykey].toString())
                        mylist.push(d[idADY].toString());
            }
            var mydescs = [];
            for (const d of descriptions.data) {
                if (mylist.indexOf(d[idDesc].toString()) !== -1)
                    mydescs.push(d[showColumn].toString());
            }
            row[column] = DSON.ULALIA(mydescs);
        }
        resolve(daton);
    } catch (e) {
        resolve(e);
    }
    resolve(daton);
});

directRunMagicOneToMany = (data, column, table, key, description, mykey) => new Promise(async (resolve, reject) => {
    try {
        mykey = mykey || "id";
        description = description || "name";
        var result = await BASEAPI.listp(table, {limit: 0});
        let columnList = result.data;
        if (data) {
            for (const row of data) {
                row[mykey] = row[mykey] || undefined;
                var thistype = columnList.filter(d => {
                    if (row[mykey] !== undefined)
                        if (d[key] !== undefined && d[key] !== null)
                            return d[key].toString() === row[mykey].toString();
                    return false;
                });
                var resultB = [];
                if (thistype.length > 0)
                    for (const type of thistype) {
                        resultB.push(type[description]);
                    }

                if (thistype.length > 0)
                    row[column] = DSON.ULALIA(resultB);
            }
            resolve(data);
        }
    } catch (e) {
        resolve(e);
    }
    resolve(data);
});

sinEsLower = (str) => {
    return (str || "").replaceAll(' ', '').toLowerCase();
}
dibujaGracfico = (div, value, color, width, height, arcstart, arcend) => {
    let knob = pureknob.createKnob(width || 300, height || 300);
    knob.setProperty('angleStart', arcstart || (-0.50 * Math.PI));
    knob.setProperty('angleEnd', arcend || (0.50 * Math.PI));
    knob.setProperty('colorFG', color);
    knob.setProperty('colorBG', "#ccc");
    knob.setProperty('textScale', 0.8);
    knob.setProperty('trackWidth', 0.4);
    knob.setProperty('readonly', true);
    knob.setProperty('valMin', 0);
    knob.setProperty('valMax', 100);
    knob.setProperty('fnValueToString', (value) => {
        if (value === "")
            return "-";
        return `${value}%`;
    });
    knob.setValue(value);
    const listener = function (knob, value) {
        console.log(value);
    };
    knob.addListener(listener);
    const node = knob.node();
    const elem = document.getElementById(div);
    if (elem)
        elem.appendChild(node);
}
createfalse = async () => {
    aacontroldemandofalso = {
        abierto: true,
        api: {
            ponderaciones: undefined,
            formulas: undefined,
            pei: undefined,
            productos: undefined,
            actividades: undefined,
            tiposMeta: baseController.session ? baseController.session.tipoMenta : [],
            direccionesMeta: baseController.session ? baseController.session.direccionMeta : [],
            periodicidad: baseController.poa_monitorieo
        },
        preloaded: {},
        listp: async (api, where) => {
            let data = undefined;
            if (where)
                data = await BASEAPI.listp(api, {
                    limit: 0,
                    orderby: "id",
                    order: "asc",
                    where: where
                });
            else
                data = await BASEAPI.listp(api, {
                    limit: 0,
                    orderby: "id",
                    order: "asc",
                });
            return data.data;
        },
        cumplimiento: async (view, session, indicadorField, indicadorID, espei) => {
            if (aacontroldemandofalso.preloaded[view] === undefined) {
                aacontroldemandofalso.preloaded[view] = await aacontroldemandofalso.listp(view,
                    [
                        {
                            field: "compania",
                            value: session.compania_id
                        },
                        {
                            open: "(",
                            field: "poa",
                            operator: "=",
                            value: `$${session.poa_id} OR poa=0)`
                        }
                    ]);
            }
            let result =aacontroldemandofalso.preloaded[view].filter(d=>d[indicadorField + "_id"]==indicadorID);

            // await aacontroldemandofalso.listp(view,
            // [
            //     {
            //         field: "compania",
            //         value: session.compania_id
            //     },
            //     {
            //         field: indicadorField + "_id",
            //         value: indicadorID
            //     },
            //     {
            //         open: "(",
            //         field: "poa",
            //         operator: "=",
            //         value: `$${session.poa_id} OR poa=0)`
            //     }
            // ]);
            if (result.length > 0) {
                let periodos = result.filter(d => {
                    return d[indicadorField + "_id"] == indicadorID
                });
                let obj = aacontroldemandofalso.indicador(periodos, espei);
                return {
                    cumplimiento: (Number(obj[0].sumas.cumplimiento) || 0.00).toFixed(2),
                    ponderacion: obj[0].sumas.ponderacion,
                    general: obj,
                    ficha: aacontroldemandofalso.ficha(obj)
                }
            }
        },
        existx: (arrayx, label, value) => {
            if (value)
                arrayx.push({label: label, value: value})
        },
        ficha: (indicador) => {
            let main = indicador[0];
            console.log(main);
            let fichaFinal = {};
            fichaFinal.datos_relacionados = [];
            aacontroldemandofalso.existx(fichaFinal.datos_relacionados, "Eje Estrategico", main.eje);
            aacontroldemandofalso.existx(fichaFinal.datos_relacionados, "Objetivo Estrategico", main.objetivo);
            aacontroldemandofalso.existx(fichaFinal.datos_relacionados, "Estrategia", main.estrategia);
            aacontroldemandofalso.existx(fichaFinal.datos_relacionados, "Resultado Esperado", main.resultado);
            aacontroldemandofalso.existx(fichaFinal.datos_relacionados, "Departamento", main.departamento);
            aacontroldemandofalso.existx(fichaFinal.datos_relacionados, "Producto", main.producto);
            aacontroldemandofalso.existx(fichaFinal.datos_relacionados, "Actividad", main.actividad);
            if (!main.indicador_pei)
                aacontroldemandofalso.existx(fichaFinal.datos_relacionados, "Año del POA", main.ano);
            fichaFinal.periodicidad = main.periodicidad.nombre_mostrar;
            fichaFinal.grafico = {
                porcentaje: Number(main.sumas.cumplimiento).toFixed(2),
                color: main.sumas.ponderacion.color,
                titulo_ponderacion: main.sumas.ponderacion.titulo
            };
            fichaFinal.datos_indicador = [];
            aacontroldemandofalso.existx(fichaFinal.datos_indicador, "Indicador PEI", main.indicador_pei);
            aacontroldemandofalso.existx(fichaFinal.datos_indicador, "Indicador POA", main.indicador_producto);
            aacontroldemandofalso.existx(fichaFinal.datos_indicador, "Indicador Actividad", main.indicador_actividad);
            aacontroldemandofalso.existx(fichaFinal.datos_indicador, "Descripción del indicador", main.descripcion);
            aacontroldemandofalso.existx(fichaFinal.datos_indicador, "Fuente", main.fuente);
            aacontroldemandofalso.existx(fichaFinal.datos_indicador, "Método de Cálculo", main.metodo_calculo);
            aacontroldemandofalso.existx(fichaFinal.datos_indicador, "Año Línea Base", main.ano_linea_base);
            aacontroldemandofalso.existx(fichaFinal.datos_indicador, "Línea base", main.linea_base);
            aacontroldemandofalso.existx(fichaFinal.datos_indicador, "Medio de Verificación", main.medio_verificacion);
            fichaFinal.leyenda = `Este indicador trabaja con <b>${main.tipoMeta[0].nombre}</b> y debe tender a ser <b>${main.direccionMeta[0].nombre}</b>`;
            fichaFinal.periodos = [];
            if (indicador) {
                indicador = indicador.sort(GetSortOrder("periodo"));
            }
            indicador.forEach(d => {
                fichaFinal.periodos.push(
                    {
                        indice: d.periodo,
                        periodoValid: d.props.periodoValid,
                        current: d.props.current,
                        sinMeta: d.props.sinMeta,
                        meta: d.props.formatedMeta,
                        meta_alcanzada: d.props.formatedAlcanzada,
                        diferencia: d.props.formatedVarianza,
                        enable: d.props.valid
                    }
                );
            });
            fichaFinal.periodos.push({
                indice: "Total",
                meta: main.sumas.formatedSumMeta,
                meta_alcanzada: main.sumas.formatedSumAlcanzada,
                diferencia: main.sumas.formatedSumVarianza,
                enable: true,
                periodoValid: true,
                sinMeta: false
            });
            return {
                title: main.indicador_pei || main.indicador_producto || main.indicador_actividad,
                FICHA: fichaFinal
            }
        },
        indicador: (periodos, pei) => {
            if (periodos)
                if (periodos.length) {
                    let periodicidad = aacontroldemandofalso.periodicidad(pei ? [] : periodos);
                    let tipo_meta = periodos[0].tipo_meta;
                    let direccion_meta = periodos[0].direccion_meta;
                    let formula = aacontroldemandofalso.formula(tipo_meta, direccion_meta);
                    let periodosValidos = aacontroldemandofalso.processPeriodos(periodos, formula, pei);
                    return periodosValidos;
                }
            return [];
        },
        ponderacion: (valor, tipo_meta) => {
            let finalFilter = tipo_meta || 0;
            return aacontroldemandofalso.api.ponderaciones.filter(d => {
                return d.tipo_meta === finalFilter && (Math.floor(valor) >= d.from && Math.floor(valor) <= d.to);
            })[0] || {
                tipo_meta: "1",
                titulo: "Ponderación Sin Configurar",
                color: "#ccc",
                from: 0,
                to: 0,
                orden: 1,
                compania: baseController.session.compania_id
            };
        },/**/
        percentage: (meta, alcanzada, varianza, formula, tomar) => {
            if (tomar === 0)
                return 0;
            let $RESULTMETA = meta;
            let $RESULTALCANZADA = alcanzada;
            let $RESULTVARIANZA = varianza;
            let realRaw = eval(formula.porcentaje);
            if (realRaw < 0)
                return 0;
            if (realRaw > 100)
                return 100;
            return realRaw || 0;
        },/**/
        format: (valor, sum, formula) => {
            if (valor === "")
                return valor;
            let $RESULT = valor;
            return eval(formula[sum]);
        },/**/
        rawValue: (valor, formula) => {
            let $META = valor;
            let realRaw = eval(formula.formula);
            if (realRaw === null || realRaw === undefined)
                return "";
            realRaw += "";
            if (realRaw.indexOf(".") !== -1)
                return parseFloat(realRaw.replaceAll(",", "").trim());
            return parseInt(realRaw);
        },/**/
        rawVarianza: (valor, valor2, formula) => {
            let $META = valor;
            let $ALCANZADO = valor2;
            let rawVarianzaVar = eval(formula.varianzaformula);
            if (rawVarianzaVar === undefined || rawVarianzaVar === null)
                return "";
            return rawVarianzaVar;
        },/**/
        rawSum: (periodos, variable, formula) => {
            let $SUM = 0;
            let validperiods = periodos.filter(d => d.props.valid);
            let $CANTIDAD = validperiods.length;
            validperiods.forEach(d => {
                if (d.props[variable])
                    $SUM += d.props[variable];
            });
            let realRaw = $CANTIDAD === 0 ? 0 : eval(formula.sumformula);
            return realRaw;
        },/**/
        formula: (tipo_meta, direccion_meta) => {
            return aacontroldemandofalso.api.formulas.filter(d => {
                return d.tipo_meta === tipo_meta && d.direccion_meta === direccion_meta;
            })[0] || {
                formula: "$META",
                formato: "`${LAN.money($RESULT).format(false)}`",
                estilos: "",
                sumformula: "$SUM",
                sumformato: "`${$RESULT}`",
                varianzaformula: "(Math.abs($META-$ALCANZADO))",
                varianzaformato: "`${LAN.money($RESULT).format(false)}`",
                porcentaje: "($RESULTALCANZADA/$RESULTMETA)*100"
            };
        },/**/
        processPeriodos: (periodos, formula, pei) => {
            var mes = new Date().getMonth() + 1;
            var year = new Date().getFullYear();
            if (periodos)
                if (periodos.length) {
                    let periodicidad = aacontroldemandofalso.periodicidad(pei ? [] : periodos);
                    var actual = Math.ceil((mes / (12 / periodicidad.cantidad)));
                    let tipo_meta = aacontroldemandofalso.api.tiposMeta.filter(d => d.id === formula.tipo_meta);
                    let direccion_meta = aacontroldemandofalso.api.direccionesMeta.filter(d => d.id === formula.direccion_meta);
                    periodos.forEach(d => {
                        d.periodicidad = periodicidad;
                        d.tipoMeta = tipo_meta;
                        d.direccionMeta = direccion_meta;
                        d.props = {};
                        d.periodo = pei ? d.ano : d.periodo;
                        d.props.sinMeta = d.valor_alcanzado === null || d.valor_alcanzado === undefined || d.valor_alcanzado === "undefined" || d.valor_alcanzado === "";
                        d.props.valid = pei ? (d.ano <= year) : (((parseInt(d.periodo) || 0) <= actual && (parseInt(d.ano) || 1900) <= year) || (parseInt(d.ano) || 1900) < year);
                        d.props.current = pei ? (d.ano == year) : (((parseInt(d.periodo) || 0) == actual && (parseInt(d.ano) || 1900) == year) || (parseInt(d.ano) || 1900) < year);
                        d.props.periodoValid = pei ? (d.ano <= year) : (((parseInt(d.periodo) || 0) <= actual && (parseInt(d.ano) || 1900) <= year) || (parseInt(d.ano) || 1900) < year);
                        if (aacontroldemandofalso.abierto === false && d.props.current)
                            d.props.valid = false;
                        if (d.props.sinMeta)
                            d.props.valid = false;

                        d.props.rawMeta = aacontroldemandofalso.rawValue(d.valor, formula);
                        d.props.rawAlcanzada = aacontroldemandofalso.rawValue(d.valor_alcanzado, formula);
                        d.props.rawVarianza = aacontroldemandofalso.rawVarianza(d.props.rawMeta, d.props.rawAlcanzada, formula);

                        d.props.formatedMeta = aacontroldemandofalso.format(d.props.rawMeta, "formato", formula);
                        d.props.formatedAlcanzada = aacontroldemandofalso.format(d.props.rawAlcanzada, "formato", formula);
                        d.props.formatedVarianza = aacontroldemandofalso.format(d.props.rawVarianza, "varianzaformato", formula);
                    });
                    let sumas = {};
                    let rawSumMeta = aacontroldemandofalso.rawSum(periodos, "rawMeta", formula);
                    let rawSumAlcanzada = aacontroldemandofalso.rawSum(periodos, "rawAlcanzada", formula);
                    let rawSumVarianza = aacontroldemandofalso.rawSum(periodos, "rawVarianza", formula);
                    let formatedSumMeta = aacontroldemandofalso.format(rawSumMeta, "sumformato", formula);
                    let formatedSumAlcanzada = aacontroldemandofalso.format(rawSumAlcanzada, "sumformato", formula);
                    let formatedSumVarianza = aacontroldemandofalso.format(rawSumVarianza, "sumformato", formula);
                    sumas = {
                        rawSumMeta: rawSumMeta,
                        rawSumAlcanzada: rawSumAlcanzada,
                        tomar: periodos.filter(d => d.props.valid).length,
                        rawSumVarianza: rawSumVarianza,
                        formatedSumMeta: formatedSumMeta,
                        formatedSumAlcanzada: formatedSumAlcanzada,
                        formatedSumVarianza: formatedSumVarianza,
                        cumplimiento: aacontroldemandofalso.percentage(rawSumMeta, rawSumAlcanzada, rawSumVarianza, formula, periodos.filter(d => d.props.valid).length)
                    };
                    sumas.ponderacion = aacontroldemandofalso.ponderacion(sumas.cumplimiento, formula.tipo_meta);
                    periodos.forEach(d => {
                        d.sumas = sumas;
                    });

                    return periodos;
                }
            return [];
        },/**/
        formula: (tipo_meta, direccion_meta) => {
            return aacontroldemandofalso.api.formulas.filter(d => {
                return d.tipo_meta === tipo_meta && d.direccion_meta === direccion_meta;
            })[0] || {
                formula: "$META",
                formato: "`${LAN.money($RESULT).format(false)}`",
                estilos: "",
                sumformula: "$SUM",
                sumformato: "`${$RESULT}`",
                varianzaformula: "(Math.abs($META-$ALCANZADO))",
                varianzaformato: "`${LAN.money($RESULT).format(false)}`",
                porcentaje: "($RESULTALCANZADA/$RESULTMETA)*100"
            };
        },/**/
        periodicidad: (periodos) => {
            return baseController.poa_monitorieo.filter(d => {
                return d.cantidad === (periodos || []).length;
            })[0] || {
                cantidad: 1,
                descripcion: "Cada año",
                id: 2,
                nombre: "Anual",
                nombre_mostrar: "Año",
            }
        },/**/
        periodicidadBy: (id) => {
            return (baseController.poa_monitorieo.filter(d => {
                return d.id == id;
            })[0] || {nombre: 'Anual'});
        }
    }

}
tableUtilities = {};
tableUtilities.files = (scope, folder, field, id, items) => new Promise(async (resolve, reject) => {
    BASEAPI.ajax.get(new HTTP().path(["files", "api"]), {folder: folder + "/" + (items[id])}, function (result) {
        if (result.data.count > 0) {
            if (!scope.fileSI)
                scope.fileSI = [];
            scope.fileSI.push({id: items[id]});
            resolve(true);
        } else {
            var buttons = document.getElementsByClassName("btn btn-labeled");
            for (var item of buttons) {
                item.disabled = false;
            }
            resolve(false);
        }
    }, $('#invisible'));
});
tableUtilities.filesForRecords = async (scope, field, indentity, folder) => {
    if (!scope.verFile)
        scope.verFile = tableUtilities.verFile;
    if (scope.records.data) {
        let finalField = field || "archivo";
        let finalFolder = folder || `${scope.modelName}/${field}`;
        let finalIndentity = indentity || "id";

        for (var items of scope.records.data) {
            await tableUtilities.files(scope, finalFolder, finalField, finalIndentity, items);
        }
    }
    scope.refreshAngular();
    return true;
}
tableUtilities.fileIcon = (scope, row, title, indentity) => {
    let finalIndentity = indentity || "id";
    if (typeof scope !== 'null') {
        if (scope) {
            if (scope.fileSI) {
                var info = scope.fileSI.filter(data => {
                    return data[finalIndentity] == row[finalIndentity];
                });
                if (info.length) {
                    return "<a title='" + (title || "Ver Documento") + "'><i class='icon-files-empty'></i></a>";

                } else {
                    return '';
                }
            }
        }
    }
}

tableUtilities.verFile = function (scope, row, field, folder, indentity) {

    let finalField = field || "archivo";
    let finalFolder = folder || `${scope.modelName}/${field}`;
    let finalIndentity = indentity || "id";

    if (typeof scope !== 'null') {
        if (scope) {
            var info = scope.fileSI.filter(data2 => {
                return data2.id == row.id;
            });
            if (info.length) {
                var root = DSON.template(finalFolder + "/" + row[finalIndentity], row);
                baseController.viewData = {
                    root: root,
                    scope: scope,
                    maxsize: 20,
                    maxfiles: 1,
                    upload: false,
                    remove: !(scope.group_caracteristica !== ENUM_2.Grupos.director_general),
                    acceptedFiles: null,
                    columns: 4,
                };

                scope.modal.modalView("templates/components/filemanagerlite", {
                    width: 'modal-full',
                    header: {
                        title: MESSAGE.ic("mono.files"),
                        icon: "file-eye"
                    },
                    footer: {
                        cancelButton: false
                    },
                    content: {
                        loadingContentText: MESSAGE.i('actions.Loading')
                    },
                });
            }
        }
    }
};

function_send_email_auditores_resposables = function (titulo_push, cuerpo_push, titulo, cuerpo, compania, institucion, primer_grupo, segundo_grupo, auditores, tabla_data) {
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
                "field": "correo",
                "operator": "!=",
                "value": "admin@eisdr.com"
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
            usuario_segundo_grupo.push(usuario_data.filter(search => {
                return segundo_grupo.includes(search.profile);
            }));
        } else {
            usuario_segundo_grupo.push(usuario_data.filter(search => {
                return search.profile == segundo_grupo;
            }));
        }
        for (item of usuario_primer_grupo) {
            for (var resul of item) {
                id_usuarios_primer_grupo.push(resul.id);
                correo_usuarios_primer_grupo.push(resul.correo);
            }
        }
        for (item2 of usuario_segundo_grupo) {
            for (var resul2 of item2) {
                id_usuarios_segundo_grupo.push(resul2.id);
                correo_usuarios_segundo_grupo.push(resul2.correo);
            }
        }
        if (Array.isArray(auditores)) {
            for (var itemA of auditores) {
                id_usuarios_primer_grupo.push(itemA.usuario);
                correo_usuarios_primer_grupo.push(itemA.usuario_correo);
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
        var data_json_email_primer_segundo_grupo = {
            to: correo_usuarios_primer_grupo,
            cc: correo_usuarios_segundo_grupo,
            subject: titulo,
            name_show: "NoReply",
            template: 'email/auditoria_auditores',
            message: cuerpo,
            notification: 'yes',
            tabla_data: tabla_data
        };
        send_notification.send.email_auditoria_auditores(data_json_email_primer_segundo_grupo);
    });
};

SITIENE = (valor, entonces, sino, crude) => {
    return (TIENE(valor, crude) ? entonces : sino);
}
TIENE = (valor, crude) => {
    return (crude || []).filter(d => d.text.indexOf(valor) !== -1).length;
}
LALINEA = (index, crude) => {
    return (crude || []).map(d => d.text)[index - 1] || "";
}
DERECHA = (text, find) => {
    return (text.split(find)[1] || '').trim();
}
IZQUIERDA = (text, find) => {
    return (text.split(find)[0] || '').trim();
}
REEMPLAZAR = (text, find, by) => {
    return (text || '').replaceAll(find, by).trim();
}
DERECHAADD = (value, text) => {
    return value + text;
}
IZQUIERDAADD = (value, text) => {
    return text + value;
}
IA = {
    customFields: ["mapa_proceso", "macro_proceso", "proceso"],
    listConfig: (id) => {
        return IA.lists.filter(d => d.id === id)[0] || {};
    },
    lists: [
        {id: 1, name: "Resultados Esperados", table: "resultado", key: "id", desc: "`nombre`"},
        {id: 2, name: "Departamentos", table: "departamento", key: "id", desc: "`nombre`", force: true},
        {id: 3, name: "Productos", table: "productos_poa", key: "id", desc: "`nombre`"},
        {id: 4, name: "Tipo Inversión", table: "tipo_inversion", key: "id", desc: "`nombre`"},
        {
            id: 5,
            name: "Involucrados de Productos",
            table: "involucrados",
            key: "id",
            desc: "`nombre`",
            key1: "`producto`",
            key2: "`involucrado`",
            where: [{field: "tipo", value: "1"}]
        },
        {
            id: 6,
            name: "Involucrados de Actividades",
            table: "involucrados",
            key: "id",
            desc: "`nombre`",
            key1: "`producto`",
            key2: "`involucrado`",
            where: [{field: "tipo", value: "5"}]
        },
        {id: 7, name: "Usuarios", table: "usuario", key: "id", desc: "concat(`nombre`,` `,`apellido`)"},
    ],
    codes: [
        {
            id: "L",
            nombre: "La Línea",
            params: [
                {nombre: "Número", type: "number"}
            ],
            code: "LALINEA(@1,crude)",
            title: "Con esta instrucción rellenas el valor del campo directamente con la 'línea' especificada."
        },
        {
            id: "D",
            nombre: "A la derecha de",
            params: [
                {nombre: "Texto", type: "text"}
            ],
            code: "DERECHA(@VALUE,@1)",
            title: "Con esta instrucción cortas el texto de la izquierda y te quedas con el texto de la derecha con la coincidencia de un texto especificado."
        },
        {
            id: "I",
            nombre: "A la izquierda de",
            params: [
                {nombre: "Texto", type: "text"}
            ],
            code: "IZQUIERDA(@VALUE,@1)",
            title: "Con esta instrucción cortas el texto de la derecha y te quedas con el texto de la izquierda con la coincidencia de un texto especificado."
        },
        {
            id: "R",
            nombre: "Reemplazar el texto",
            params: [
                {nombre: "De", type: "text"},
                {nombre: "Por", type: "text"},
            ],
            code: "REEMPLAZAR(@VALUE,@1,@2)",
            title: "Con esta instrucción reemplazas la coincidencia de un texto en el parámetro 'De' por el valor especificado en el parámetro 'Por'."
        },
        {
            id: "S",
            nombre: "Si tiene el texto",
            params: [
                {nombre: "Text", type: "text"},
                {nombre: "Entonces", type: "text"},
                {nombre: "De lo contrario", type: "text"},
            ],
            code: "SITIENE(@1,@2,@3,crude)",
            title: "Con esta instrucción indicas que valor tendrá el campo en caso de que la coincidencia sea encontrada u otro valor en caso de que no sea encontrada."
        },
        {
            id: "A",
            nombre: "Agregar a la derecha",
            params: [
                {nombre: "Text", type: "text"}
            ],
            code: "DERECHAADD(@VALUE,@1)",
            title: "Con esta instrucción agregas el texto indicado a la derecha del resultado del campo."
        },
        {
            id: "B",
            nombre: "Agregar a la izquierda",
            params: [
                {nombre: "Text", type: "text"}
            ],
            code: "IZQUIERDAADD(@VALUE,@1)",
            title: "Con esta instrucción agregas el texto indicado a la izquierda del resultado del campo."
        }
    ],
    excelTypes: ["texto", "entero", "decimal", "dinero", "booleano", "fecha", "fecha y hora", "lista simple", "lista multiple", "fijo", "SQL", "especial", "sheet", "clave"],
    executeCode: (line, current, crude) => {
        let elcodigo = IA.codes.filter(d => d.id === line.code)[0];
        let result = current;
        try {
            result = eval(`${elcodigo.code.replaceAll('@VALUE', 'current').replaceAll('@1', 'line.param1').replaceAll('@2', 'line.param2').replaceAll('@3', 'line.param3')}`);
        } catch (e) {
            return current;
        }
        return result;
    },
    valoresEspeciales: {
        "Id Usuario de la sesión": () => {
            return baseController.session.userID;
        },
        "Nombre Usuario de la sesión": () => {
            return baseController.session.fullName();
        },
        "Id Departamento de la sesión": () => {
            return baseController.session.departamento;
        },
        "Nombre Departamento de la sesión": () => {
            return baseController.session.departamento_nombre;
        },
        "Id POA de la sesión": () => {
            return baseController.session.poa_id;
        },
        "Nombre POA de la sesión": () => {
            return baseController.session.poa;
        },
        "Fecha Actual": () => {
            return moment(new Date()).format("YYYY-MM-DD");
        },
        "Id Compañía de la sesión": () => {
            return baseController.session.compania_id;
        },
        "Nombre Compañía de la sesión": () => {
            return baseController.session.compania;
        }
    },
    readFile: (fields, crude, informe, simple) => {
        for (const field of fields) {
            let ix = fields.indexOf(field);
            if (field.tipo === "1") {
                let extract = crude.filter(d => d.id >= field.from && d.id <= field.to).map(d => d.text);
                extract = extract.join(" ").replaceAll("\n", " ");
                if (extract.trim()) {
                    informe.push({
                        id: ix + 1,
                        field: field.field,
                        result: extract.trim()
                    });
                } else {
                    informe.push({
                        id: ix + 1,
                        field: field.field,
                        result: field.defaultValue
                    });
                }
            } else if (field.tipo === "3") {
                try {
                    let extract = eval(field.script);
                    if (Array.isArray(extract)) {
                        extract = extract.map(d => d.text).join(" ").replaceAll("\n", " ").trim();
                    } else
                        extract = (extract + "").replaceAll("\n", " ").trim();
                    if (extract)
                        informe.push({
                            id: ix + 1,
                            field: field.field,
                            result: extract
                        });
                    else
                        informe.push({
                            id: ix + 1,
                            field: field.field,
                            result: field.defaultValue
                        });
                } catch (e) {
                    informe.push({
                        id: ix + 1,
                        field: field.field,
                        result: JSON.stringify(e)
                    });
                }
            } else if (field.tipo === "2") {
                try {
                    let extract = crude.filter((d, ix) => {
                        return ix > crude.findIndex(d => d.text.indexOf(field.from) !== -1) && ix < crude.findIndex(d => d.text.indexOf(field.to) !== -1)
                    });
                    if ((parseInt(field.index) || 0) > 0)
                        extract = extract[field.index - 1];
                    extract = extract.map(d => d.text).join(" ").replaceAll("\n", " ").trim();
                    if (extract)
                        informe.push({
                            id: ix + 1,
                            field: field.field,
                            result: extract
                        });
                    else
                        informe.push({
                            id: ix + 1,
                            field: field.field,
                            result: field.defaultValue
                        });
                } catch (e) {
                    informe.push({
                        id: ix + 1,
                        field: field.field,
                        result: field.defaultValue
                    });
                }
            } else if (field.tipo === "4") {
                let currentValue = "";
                if (field.codes)
                    if (field.codes.length)
                        for (const line of field.codes)
                            currentValue = IA.executeCode(line, currentValue, crude);
                let extract = (currentValue + "").replaceAll("\n", " ").trim();
                if (extract)
                    informe.push({
                        id: ix + 1,
                        field: field.field,
                        result: extract
                    });
                else
                    informe.push({
                        id: ix + 1,
                        field: field.field,
                        result: field.defaultValue
                    });
            } else if (field.tipo === "5") {
                let currentValue = "";
                currentValue = IA.valoresEspeciales[field.from]() || "";
                let extract = (currentValue + "").replaceAll("\n", " ").trim();
                if (extract)
                    informe.push({
                        id: ix + 1,
                        field: field.field,
                        result: extract
                    });
                else
                    informe.push({
                        id: ix + 1,
                        field: field.field,
                        result: field.defaultValue
                    });
            } else if (field.tipo === "6") {
                let currentValue = "";
                currentValue = field.defaultValue || "";
                let extract = (currentValue + "").replaceAll("\n", " ").trim();
                if (extract)
                    informe.push({
                        id: ix + 1,
                        field: field.field,
                        result: extract
                    });
                else
                    informe.push({
                        id: ix + 1,
                        field: field.field,
                        result: field.defaultValue
                    });
            } else if (field.tipo === "7") {
                if (!simple) {
                    if (typeof documentos_import !== "undefined") {
                        if (documentos_import[field.from] !== "[NULL]") {
                            informe.push({
                                id: ix + 1,
                                field: field.field,
                                result: documentos_import[field.from]
                            });
                        } else {
                            informe.push({
                                id: ix + 1,
                                field: field.field,
                                result: "$null"
                            });
                        }
                        continue;
                    }
                    let currentValue = "Se agregará al momento de importar en masa";
                    let extract = (currentValue + "").replaceAll("\n", " ").trim();
                    informe.push({
                        id: ix + 1,
                        field: field.field,
                        result: extract
                    });
                }
            }
        }
    }
}
IA.valoresEspecialesList = Object.keys(IA.valoresEspeciales);

async function deleteAuditoriaProgramaPlanProceso(procesoId) {
    return BASEAPI.deleteallp('auditoria_programa_plan_proceso', [
        {
            field: "proceso",
            value: procesoId
        },
        {
            field: "programa_plan",
            value: auditoria_programa_plan.id
        }
    ]);
}

async function getDocumentosAsociados(procesoId) {
    const result = await BASEAPI.listp('vw_auditoria_programa_plan_documentos_asociados', {
        limit: 0,
        where: [
            {
                field: "proceso",
                value: procesoId
            },
            {
                field: "programa_plan",
                value: auditoria_programa_plan.id
            }
        ]
    });
    return result.data;
}

async function deleteDocumentosAsociadosListaverificacion(documentosAsocIds) {
    return BASEAPI.deleteallp('auditoria_programa_plan_documentos_asociados_listaverificacion', [
        {
            field: "programa_plan_documentos_asociados",
            value: documentosAsocIds
        }
    ]);
}

async function deleteDocumentosAsociadosResponsables(documentosAsocIds) {
    return BASEAPI.deleteallp('auditoria_programa_plan_documentos_asociados_responsables', [
        {
            field: "programa_plan_documentos_asociados",
            value: documentosAsocIds
        }
    ]);
}

async function deleteDocumentosAsociados(documentosAsocIds) {
    return BASEAPI.deleteallp('auditoria_programa_plan_documentos_asociados', [
        {
            field: "id",
            value: documentosAsocIds
        }
    ]);
}

function_send_email_cargos_y_resposables = function (titulo_push, cuerpo_push, titulo, cuerpo, compania, institucion, responsables, cargos, segundo_grupo, calidad) {
    var usuario_data = [];
    var usuario_primer_grupo = [];
    var usuario_segundo_grupo = [];
    var id_usuarios_primer_grupo = [];
    var correo_usuarios_primer_grupo = [];
    var id_usuarios_segundo_grupo = [];
    var correo_usuarios_segundo_grupo = [];
    var directores_departamentales = [];
    BASEAPI.listp('usuario', {
        limit: 0,
        where: [
            {
                "field": "correo",
                "operator": "!=",
                "value": "admin@eisdr.com"
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
        if (responsables.length > 0) {
            usuario_primer_grupo.push(usuario_data.filter(search => {
                return responsables.includes(search.id);
            }));
        } else {
            usuario_primer_grupo.push(usuario_data.filter(search => {
                return cargos.includes(search.cargo);
            }));
        }
        if (Array.isArray(calidad)) {
            usuario_segundo_grupo.push(usuario_data.filter(search => {
                return calidad.includes(search.profile);
            }));
        }
        for (item of usuario_primer_grupo) {
            for (var resul of item) {
                id_usuarios_primer_grupo.push(resul.id);
                correo_usuarios_primer_grupo.push(resul.correo);
                directores_departamentales.push(usuario_data.filter(d => {
                    return d.departamento == resul.departamento && d.profile == segundo_grupo
                }))
            }
        }
        for (item2 of usuario_segundo_grupo) {
            for (var resul2 of item2) {
                id_usuarios_segundo_grupo.push(resul2.id);
                correo_usuarios_segundo_grupo.push(resul2.correo);
            }
        }
        for (item3 of directores_departamentales) {
            for (var resul3 of item3) {
                id_usuarios_segundo_grupo.push(resul3.id);
                correo_usuarios_segundo_grupo.push(resul3.correo);
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
        var data_json_email_primer_segundo_grupo = {
            to: correo_usuarios_primer_grupo,
            cc: correo_usuarios_segundo_grupo,
            subject: titulo,
            name_show: "NoReply",
            template: 'email/plane',
            message: cuerpo,
            notification: 'yes',
        };
        send_notification.send.email(data_json_email_primer_segundo_grupo);
    });
};
getBrowser = () => {
    return navigator.userAgent;
}

function getDifference(o1, o2) {
    var diff = {};
    if (JSON.stringify(o1) === JSON.stringify(o2)) return;

    for (var k in o1) {
         if ((o1[k] || "") !== (o2[k] || "")) {
            diff[k] = o2[k]
        }
    }
    return diff;
}

async function confirmationDeleteMessage (tableName, entity, fieldToLookFor, dataName, resolveF){
    console.log("entity:", entity)
    console.log("entity.id:", entity.id)
    SWEETALERT.loading({message: MESSAGE.ic('mono.procesing')});
    
    let list = await BASEAPI.listp(tableName, {
        "where": [{
            "field": fieldToLookFor,
            "value": entity.id
        }]
    });

    const mappedList = list.data.map(el =>
      `<li>${el.DESCRIPCION.trim()}</li>`
    ).join('');

    let defaultMessage = `¿Estás seguro que deseas solicitar la eliminación del registro "${entity.DESCRIPCION.trim()}"?`
    let showDetailData =`
      <p>Ten presente que dicho elemento contiene: <b>${list.data.length} ${dataName}</b></p>
      <p>
        <a class="btn btn-primary" data-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
          Ver ${dataName}
        </a>
      </p>

      <div class="collapse" id="collapseExample">
        <div class="card card-body">
          <ul style="text-align:left">
            ${mappedList}
          </ul>
        </div>
      </div>
    `

    SWEETALERT.confirm({
        message: (list.data.length)
          ? defaultMessage + showDetailData
          : defaultMessage,

        confirm: async function () {
            SWEETALERT.loading({message: "Creando Solicitud"});
            let cbs = await BASEAPI.insertIDpfirst("cbs_autorizacion", {
                accion: "3",
                usuario: entity.session.usuario_id,
                CODIGO_UNSPSC: entity.id,
                nivel: entity.form.readonly.nivel,
    
                numero_caso: entity.numero_caso,
                detalle_caso: entity.detalle_caso,
    
                tipo_solicitante_caso: entity.tipo_solicitante_caso,
                detalle_solicitante_caso: entity.detalle_solicitante_caso,
                updated_on: entity.updated_on_raw,
                responsable: entity.responsable,
                asignado_a: entity.asignado_a,
                asunto: entity.asunto
            }, "", "");

            SWEETALERT.show({message: "Solicitud Creada"});
            resolveF(true, cbs);
        },
        cancel:() => {
            this.resetModalBtns()
            resolveF(false, cbs);
        }
    });
}

function resetModalBtns(){
  let buttons = document.getElementsByClassName("btn btn-labeled");
  for (var item of buttons) {
      item.disabled = false;
  }
}

function get_redmine_data (){
    $.ajax({
        url: "https://asistenciatecnica.dgcp.gob.do:4000/issues.json",
        crossDomain: true,
        method: 'get',
        headers: {
            'X-Redmine-API-Key': CONFIG.redmine_api.X_Redmine_API_Key,
            'Authorization': CONFIG.redmine_api.Authorization,
            'Cookie': CONFIG.redmine_api.Cookie
        },
        contentType: 'application/json',
        data: ''
    }).done(function(response) {
        console.log(response);
    });
}

function get_redmine_data_id (id, controller){
    SWEETALERT.loading({message: "Obteniendo información de Redmine"})
    $.ajax({
        url: `https://asistenciatecnica.dgcp.gob.do:4000/issues.json?issue_id=${id}`,
        crossDomain: true,
        method: 'get',
        headers: {
            'X-Redmine-API-Key': CONFIG.redmine_api.X_Redmine_API_Key,
            'Authorization': CONFIG.redmine_api.Authorization
        },
        contentType: 'application/json',
        data: ''
    }).done(function(response) {
        if(response.issues.length > 0){
            controller.issue = response?.issues[0];
            controller.detalle_caso = controller?.issue?.description;
            controller.tipo_solicitante_caso = controller?.issue?.status?.name;
            controller.detalle_solicitante_caso = controller?.issue?.custom_fields.filter(d=> {
                return d.name === 'Entidad';
            })[0]?.value[0];
            controller.asignado_a = controller?.issue?.assigned_to?.name;
            controller.responsable = controller?.issue?.author?.name;
            controller.asunto = controller?.issue?.subject;
            controller.updated_on_raw = controller?.issue?.updated_on;
            controller.updated_on = LAN.datetime(controller?.issue?.updated_on);
            controller.refreshAngular();
            SWEETALERT.stop();
        }else{
            SWEETALERT.show({
                message: `<p>No existe un caso en Redmine con el ID <strong>"${id}"</strong></p>`,
                type: 'error'
            });
        }
    });
}

antiQuery = (str) => {
    return (str || "").replaceAll(`'`, `''`);
}