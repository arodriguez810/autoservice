exports.init = async function (params) {
    _params = params;
    // second (0-59)
    // minute (0-59)
    // hour (0-23)
    // date (1-31)
    // month (0-11)
    // year
    // dayOfWeek (0-6) Starting with Sunday
    // start: Date
    // end: Date
    var array = [];
    var array_dia = parseInt(params.CONFIG.diasdegracia);
    var date = new Date();
    var date_normal = date.getFullYear() + "-" + (date.getMonth() +1) + "-" + date.getDate();
    var date_now =    date.getFullYear() + "-" + (date.getMonth() +1) + "-" + (date.getDate() + array_dia);

    var cant_acti = 0;
    var array_id_usuarios = [];
    var arreglos_correos_acti = [];
    var array_correos_usuarios = [];
    var array_id_grupos_correos = [];
    var arreglos_nombre_acti = [];
    var array_correos_usuarios_dp = [];
    var array_id_usuarios_dp = [];
    var array_id_grupos_correos_dp = [];
    var paso = 0;
    var cant_acti_resp =0;
    function last (arr) {
        return arr[arr.length - 1];
    }
    if (params.CONFIG.diasdegracia && params.CONFIG.horanotificacion) {

        array[0] = params.CONFIG.horanotificacion.split(":")[0];

        if (params.CONFIG.horanotificacion.split(":") == "00") {
            array[1] = 0;
        } else {
            array[1] = parseInt(params.CONFIG.horanotificacion.split(":")[1]);
        }
        // send emails
        async function get_producto() {
            cnn = params.modules.mysql;
            var module = params.CONFIG.mysqlactive ? params.modules.mysql : params.modules.postgre;
            var preter = params.CONFIG.mysqlactive ? 'call' : 'select';
            var ff = await cnn.executeNonQuery(`${preter} sp_get_product('${date_normal}','${date_now}')`, params)
                .then(function (data) {
                    return data;
                }).catch(err => {
                    return err;
                });
            cant_acti = ff.recordset[0].length;
            var compania = [];
            var arreglo= [];
            arreglos_correos_acti = [];
            arreglos_nombre_acti = [];
            cant_acti_resp = 0;
            for (items of ff.recordset[0]){
                if (compania !== items.compania) {
                    arreglo.push({
                        compania: items.compania,
                        cantidad: items.cantidad_compania,
                        departamento: items.departamento,
                        productos: []
                    });
                }

                last(arreglo).productos.push(items.nombre);
                compania = items.compania;
            }
            //
            if (cant_acti > 0){
                cnn2 = params.modules.storage;
                modelo_grupo = new cnn2.Model("group", params);

                return await modelo_grupo.data({})
                    .then( async rs_g => {
                        array_id_grupos_correos = [];
                        cnn = params.modules.mysql;
                        modelo_usuario = new cnn.Model("usuario", params);

                        var code = rs_g.data.filter(search => {
                            return search.caracteristica == "DG" || search.caracteristica == "AP";
                        });

                        var code_dp = rs_g.data.filter(search => {
                            return search.caracteristica == "DP";
                        });

                        console.log(code_dp);
                        for (key in code){
                            array_id_grupos_correos.push(code[key].id);
                        }
                        for (key in code_dp){
                            array_id_grupos_correos_dp.push(code_dp[key].id);
                        }
                        for (it in arreglo) {
                            // dividir begin
                            // if (it != paso) {
                                paso = it;
                                await modelo_usuario.where([
                                        {
                                            "field": "compania",
                                            "value": arreglo[it]['compania']
                                        }
                                    ]
                                ).then(async result => {
                                    array_correos_usuarios = [];
                                    array_id_usuarios = [];
                                    for (item of result.data) {
                                        if (array_id_grupos_correos.indexOf(item.profile) > -1){
                                            array_correos_usuarios.push(item.correo);
                                            array_id_usuarios.push(item.id);
                                        }
                                        if (array_id_grupos_correos_dp.indexOf(item.profile) > -1 && item.departamento == arreglo[it]['departamento']){
                                            array_correos_usuarios_dp.push(item.correo);
                                            array_id_usuarios.push(item.id);
                                        }
                                    }
                                    console.log( "correo directores plani", array_correos_usuarios);
                                    console.log("id de directores dept", array_id_usuarios)
                                    console.log("correo de directores dept", array_correos_usuarios_dp)
                                    if (array_correos_usuarios.length > 0){
                                        // if (arreglo[it] != undefined) {
                                            params.servicesFunctions.base_onesignal.posts.send(
                                                {
                                                    headings: { en: 'Se aproxima la fecha de vencimiento de '+ arreglo[it]['cantidad'] + ' producto(s)' },
                                                    contents: { en: 'Productos próximo a vencer:'+ arreglo[it]['productos']  },
                                                    users: array_id_usuarios,
                                                });
                                            mail({
                                                to: array_correos_usuarios_dp,
                                                cc: array_correos_usuarios,
                                                subject: "Se aproxima la fecha de vencimiento de "+ arreglo[it]['cantidad'] +" Producto(s)",
                                                name: "noReply",
                                                template: 'email/plane',
                                                fields: {
                                                    message: 'Productos próximo a vencer:',
                                                    list: arreglo[it]['productos']
                                                }
                                            });
                                        // }
                                    }

                                    console.log("Correos enviados correctamente productos");
                                }).catch(error3 => {
                                    console.log("Error al buscar los usuarios para obtener sus correos get_producto", error3);
                                });
                                // end
                            // }
                        }
                    });
            }
        };

        async function get_auditoria() {
            cnn = params.modules.mysql;
            cnn2 = params.modules.storage;
            var ff = await cnn.executeNonQuery(`SELECT * FROM vw_noti_auditoria`, params)
                .then(function (data) {
                    return data;
                }).catch(err => {
                    return err;
                });
            cant_acti = ff.length;
            to_correo_usuarios = [];
            to_noti_usuarios = [];
            cant_acti_resp = 0;
            for (items of ff.recordset){
                modelo_grupo = new cnn2.Model("group", params);
                await modelo_grupo.data({}).then( async rs_g => {
                    cnn = params.modules.mysql;
                    array_id_grupos = [];
                    modelo_usuario = new cnn.Model("usuario", params);

                    var code = rs_g.data.filter(search => {
                        return search.caracteristica == "AC" || search.caracteristica == "SC" || search.caracteristica == "DG";
                    });
                    for (key in code){
                        array_id_grupos.push(code[key].id);
                    }
                    await modelo_usuario.where([
                            {
                                "field": "compania",
                                "value": items.compania
                            },
                            {
                                "field": "profile",
                                "value": array_id_grupos
                            }
                        ]
                    ).then(async result => {
                        var id_auditores = eval(items.id_auditores);
                        var id_participantes = eval(items.id_participantes);
                        var correos_auditores = eval(items.correos_auditores);
                        var correos_participantes = eval(items.correos_participantes);
                        var nombre_auditores = eval(items.nombre_rol_auditores);
                        var nombre_participantes = eval(items.nombre_dep_participantes);
                        cc_noti_usuarios = [];
                        cc_correo_usuarios = [];
                        to_noti_usuarios = id_auditores.concat(id_participantes);
                        to_correo_usuarios = correos_auditores.concat(correos_participantes);
                        for (user of result.data){
                            cc_noti_usuarios.push(user.id);
                            cc_correo_usuarios.push(user.correo)
                        }
                        params.servicesFunctions.base_onesignal.posts.send(
                            {
                                headings: { en: 'Se aproxima la fecha de ejecución de la auditoría "' + items.nombre + '"' },
                                contents: { en: 'Restan ' + items.dias_restantes + ' días para la fecha de inicio de Recolección de Datos de la Auditoría "' + items.nombre + '"' },
                                users: cc_noti_usuarios,
                            });
                        params.servicesFunctions.base_onesignal.posts.send(
                            {
                                headings: { en: 'Se aproxima la fecha de ejecución de la auditoría "' + items.nombre + '"' },
                                contents: { en: 'Restan ' + items.dias_restantes + ' días para la fecha de inicio de Recolección de Datos de la Auditoría "' + items.nombre + '"' },
                                users: to_noti_usuarios,
                            });

                        var correo_msj_uno = `Restan ${items.dias_restantes} días para la fecha de inicio de Recolección de Datos de la Auditoría "${items.nombre}".

Los auditores participantes en esta auditoría serán: `;
                        var correo_msj_dos = `Los participantes departamentales coordinen sus labores para estar listos cuando los auditores procedan a evaluar sus áreas. 

Los participantes Departamentales serán:`;
                        var correo_msj_tres = `Gracias`;
                        mail({
                            to: to_correo_usuarios,
                            cc: cc_correo_usuarios,
                            subject: ' Se aproxima la fecha de ejecución de la auditoría "' + items.nombre + '"',
                            name: "noReply",
                            template: 'email/auditoria',
                            fields: {
                                message: correo_msj_uno,
                                message_2: correo_msj_dos,
                                message_3: correo_msj_tres,
                                list2: nombre_auditores,
                                list: nombre_participantes
                            }
                        });
                    }).catch(error3 => {
                        console.log("Error al buscar los usuarios para obtener sus correos get_auditoria", error3);
                    });
                });
            }
        };
        async function get_after_auditoria() {
            cnn = params.modules.mysql;
            cnn2 = params.modules.storage;
            var ff = await cnn.executeNonQuery(`SELECT * FROM vw_noti_after_auditoria`, params)
                .then(function (data) {
                    return data;
                }).catch(err => {
                    return err;
                });
            cant_acti = ff.length;
            to_correo_usuarios = [];
            to_noti_usuarios = [];
            cant_acti_resp = 0;
            for (items of ff.recordset){
                modelo_grupo = new cnn2.Model("group", params);
                await modelo_grupo.data({}).then( async rs_g => {
                    cnn = params.modules.mysql;
                    array_id_grupos = [];
                    modelo_usuario = new cnn.Model("usuario", params);

                    var code = rs_g.data.filter(search => {
                        return search.caracteristica == "AC" || search.caracteristica == "SC" || search.caracteristica == "DG";
                    });
                    for (key in code){
                        array_id_grupos.push(code[key].id);
                    }
                    await modelo_usuario.where([
                            {
                                "field": "compania",
                                "value": items.compania
                            },
                            {
                                "field": "profile",
                                "value": array_id_grupos
                            }
                        ]
                    ).then(async result => {
                        var id_auditores = eval(items.id_auditores);
                        var id_participantes = eval(items.id_participantes);
                        var correos_auditores = eval(items.correos_auditores);
                        var correos_participantes = eval(items.correos_participantes);
                        var nombre_auditores = eval(items.nombre_rol_auditores);
                        var nombre_participantes = eval(items.nombre_dep_participantes);
                        cc_noti_usuarios = [];
                        cc_correo_usuarios = [];
                        to_noti_usuarios = id_auditores.concat(id_participantes);
                        to_correo_usuarios = correos_auditores.concat(correos_participantes);
                        for (user of result.data){
                            cc_noti_usuarios.push(user.id);
                            cc_correo_usuarios.push(user.correo)
                        }
                        params.servicesFunctions.base_onesignal.posts.send(
                            {
                                headings: { en: 'La auditoría "' + items.nombre + '" está Autorizada. Favor iniciar la labor de Recolección de datos.' },
                                contents: { en: '' },
                                users: cc_noti_usuarios,
                            });
                        params.servicesFunctions.base_onesignal.posts.send(
                            {
                                headings:  { en: 'La auditoría "' + items.nombre + '" está Autorizada. Favor iniciar la labor de Recolección de datos.' },
                                contents: { en: '' },
                                users: to_noti_usuarios,
                            });

                        var correo_msj_uno = `La Auditoría "${items.nombre}" tiene mas de tres días de Autorizada, por favor iniciar la labor de Recolección de Datos

Los auditores participantes en esta auditoría serán: `;
                        var correo_msj_dos = `Los participantes departamentales coordinen sus labores para estar listos cuando los auditores procedan a evaluar sus áreas. 

Los participantes Departamentales serán:`;
                        var correo_msj_tres = `Gracias`;
                        mail({
                            to: to_correo_usuarios,
                            cc: cc_correo_usuarios,
                            subject: ' La auditoría "' + items.nombre + '" está Autorizada. Favor iniciar la labor de Recolección de datos.',
                            name: "noReply",
                            template: 'email/auditoria',
                            fields: {
                                message: correo_msj_uno,
                                message_2: correo_msj_dos,
                                message_3: correo_msj_tres,
                                list2: nombre_auditores,
                                list: nombre_participantes
                            }
                        });
                    }).catch(error3 => {
                        console.log("Error al buscar los usuarios para obtener sus correos get_auditoria", error3);
                    });
                });
            }
        };

        async function get_actividad(nameTable,value,field_msj,field_msj2) {
            cnn = params.modules.mysql;
            var module = params.CONFIG.mysqlactive ? params.modules.mysql : params.modules.postgre;
            var preter = params.CONFIG.mysqlactive ? 'call' : 'select';
            var ff = await cnn.executeNonQuery(`${preter} ${nameTable}('${date_normal}','${value}')`, params)
                .then(function (data) {
                    return data;
                }).catch(err => {
                    return err;
                });
            cant_acti = ff.recordset[0].length;
                var arreglo= {};
                arreglos_correos_acti = [];
                arreglos_nombre_acti = [];
                array_correos_usuarios_dp = [];
                array_id_usuarios = [];
                cant_acti_resp = 0;
            for (items of ff.recordset[0]){
                if (!arreglo[items.compania])
                    arreglo[items.compania] = {};
                arreglo[items.compania]["compania"] = {};
                if (!arreglo[items.compania]["compania"])
                    arreglo[items.compania]["compania"] = {};
                console.log(items);
                arreglo[items.compania]["compania"]['comp'] = items.compania;
                arreglo[items.compania]["compania"]['cant'] = items.cantidad;
                arreglo[items.compania]["compania"]['departamento'] = items.departamento;
                array_correos_usuarios_dp.push(items.correo);
                array_id_usuarios.push(items.responsable);
                if (!arreglo[items.compania]["compania"]['nom'])
                    arreglo[items.compania]["compania"]['nom'] = {};
                arreglo[items.compania]["compania"]['nom']['nomb'] = [];
                for (resul of ff.recordset[0]){
                    if (resul.compania == items.compania){
                        arreglo[items.compania]["compania"]['nom']['nomb'].push(resul.nombre);
                    }
                }
            }
            //
            if (cant_acti > 0){
                cnn2 = params.modules.storage;
                modelo_grupo = new cnn2.Model("group", params);

                return await modelo_grupo.data({})
                    .then( async rs_g => {
                        array_id_grupos_correos = [];
                        cnn = params.modules.mysql;
                        modelo_usuario = new cnn.Model("usuario", params);

                        var code = rs_g.data.filter(search => {
                            return search.caracteristica == "DG"|| search.caracteristica == "AP";
                        });

                        var code_dp = rs_g.data.filter(search => {
                            return search.caracteristica == "DP";
                        });

                        console.log(code_dp);
                        for (key in code){
                            array_id_grupos_correos.push(code[key].id);
                        }
                        for (key in code_dp){
                            array_id_grupos_correos_dp.push(code_dp[key].id);
                        }
                        console.log(arreglo);
                        for (it in arreglo) {
                            // dividir begin
                            console.log("a ver",arreglo[it]);
                            if (it != paso) {
                                paso = it;
                                await modelo_usuario.where([
                                    {
                                        "field": "compania",
                                        "value": it
                                    }
                                ]
                                ).then(async result => {
                                    array_correos_usuarios = [];
                                    for (item of result.data) {
                                        if (array_id_grupos_correos.indexOf(item.profile) > -1) {
                                            array_correos_usuarios.push(item.correo);
                                            array_id_usuarios.push(item.id)
                                        }
                                        if (array_id_grupos_correos_dp.indexOf(item.profile) > -1 && item.departamento == arreglo[it]['compania']['departamento']){
                                            array_correos_usuarios_dp.push(item.correo);
                                            array_id_usuarios.push(item.id);
                                        }
                                    }
                                    console.log( "correo directores plani", array_correos_usuarios);
                                    console.log("id de directores dept", array_id_usuarios)
                                    console.log("correo de directores dept", array_correos_usuarios_dp)
                                    if (array_correos_usuarios.length > 0){
                                        if (arreglo[it] != undefined) {
                                            params.servicesFunctions.base_onesignal.posts.send(
                                                {
                                                    headings: { en: 'Se aproxima la fecha de vencimiento de '+ arreglo[it]['compania'].cant + ' '+field_msj },
                                                    contents: { en: field_msj2+' próximo a vencer son los siguientes:'+arreglo[it]['compania']['nom']['nomb']  },
                                                    users: array_id_usuarios,
                                                });
                                            mail({
                                                to: array_correos_usuarios_dp,
                                                cc: array_correos_usuarios,
                                                subject: "Se aproxima la fecha de vencimiento de "+ arreglo[it]['compania'].cant +" "+ field_msj,
                                                name: "noReply",
                                                template: 'email/plane',
                                                fields: {
                                                    message: field_msj2+' próximo a vencer son los siguientes:',
                                                    list: arreglo[it]['compania']['nom']['nomb']
                                                }
                                            });
                                        }
                                    }

                                    console.log('Correos enviados correctamente get_actividad');
                                }).catch(error3 => {
                                    console.log("Error al buscar los usuarios para obtener sus correos get_actividad", error3);
                                });
                                // end
                            }
                        }
                    });
            }
        };

        async function get_data_analis_dir_producto(nameTable,value,field_msj,field_msj2) {
            cnn = params.modules.mysql;
            var module = params.CONFIG.mysqlactive ? params.modules.mysql : params.modules.postgre;
            var preter = params.CONFIG.mysqlactive ? 'call' : 'select';
            var ff = await cnn.executeNonQuery(`${preter} ${nameTable} ('${date_normal}','${value}')`, params)
                .then(function (data) {
                    return data;
                }).catch(err => {
                    return err;
                });
            cant_acti = ff.recordset[0].length;
            var arreglo= [];
            var compania = [];
            var departamento = [];
            arreglos_correos_acti = [];
            arreglos_nombre_acti = [];
            cant_acti_resp = 0;
            for (items of ff.recordset[0]){
                if (compania !== items.compania) {
                    arreglo.push({
                        compania: items.compania,
                        departamentos: []
                    });
                }

                if (departamento !== items.departamento) {
                    last(arreglo).departamentos.push({
                        cantidad: items.cantidad,
                        depto: items.departamento,
                        productos: []
                    });
                }

                last(last(arreglo).departamentos).productos.push(items.nombre);
                departamento = items.departamento;
                compania = items.compania;
            }
            //
            if (cant_acti > 0){
                cnn2 = params.modules.storage;
                modelo_grupo = new cnn2.Model("group", params);

                return await modelo_grupo.data({})
                    .then( async rs_g => {
                        array_id_grupos_correos = [];
                        cnn = params.modules.mysql;
                        modelo_usuario = new cnn.Model("usuario", params);

                        var code = rs_g.data.filter(search => {
                            return search.caracteristica == "DP" || search.caracteristica == "AD";
                        });

                        for (key in code){
                            array_id_grupos_correos.push(code[key].id);
                        }
                        for (it in arreglo) {
                            // dividir begin
                            // if (it != paso){
                            //     paso = it;
                                for (var item_depto of arreglo[it]['departamentos']) {
                                    await modelo_usuario.where([
                                            {
                                                "field": "profile",
                                                "value": array_id_grupos_correos
                                            },
                                            {
                                                "field": "departamento",
                                                "value": item_depto.depto
                                            },
                                            {
                                                "field": "compania",
                                                "value": arreglo[it]['compania']
                                            }
                                        ]
                                    ).then(async result => {
                                        array_correos_usuarios = [];
                                        array_id_usuarios = [];
                                        for (item of result.data) {
                                            array_id_usuarios.push(item.id);
                                            array_correos_usuarios.push(item.correo);
                                        }
                                        if (array_correos_usuarios.length > 0){
                                                params.servicesFunctions.base_onesignal.posts.send(
                                                    {
                                                        headings: { en: 'Se aproxima la fecha de vencimiento de un '+ item_depto.cantidad + ' '+field_msj },
                                                        contents: { en: field_msj2+' próximo a vencer son los siguientes:'+item_depto.productos  },
                                                        users: array_id_usuarios,
                                                    });
                                                mail({
                                                    to: array_correos_usuarios,
                                                    subject: "Se aproxima la fecha de vencimiento de "+ item_depto.cantidad +" "+ field_msj,
                                                    name: "noReply",
                                                    template: 'email/plane',
                                                    fields: {
                                                        message: field_msj2+' próximo a vencer son los siguientes:',
                                                        list: item_depto.productos
                                                    }
                                                });
                                        }
                                        console.log('Correos enviados correctamente get_data_analis_dir_producto');
                                    }).catch(error3 => {
                                        console.log("Error al buscar los usuarios para obtener sus correos get_data_analis_dir_producto", error3);
                                    });
                                }
                                // end
                            // }
                        }
                    });
            }
        };
        async function get_data_analis_dir_actividad(value,field_msj,field_msj2) {
            cnn = params.modules.mysql;
            var module = params.CONFIG.mysqlactive ? params.modules.mysql : params.modules.postgre;
            var preter = params.CONFIG.mysqlactive ? 'call' : 'select';
            var ff = await cnn.executeNonQuery(`${preter} sp_get_actividades_x_depto('${date_normal}','${value}')`, params)
                .then(function (data) {
                    return data;
                }).catch(err => {
                    return err;
                });
            cant_acti = ff.recordset[0].length;
            var arreglo1= {};
            arreglos_correos_acti = [];
            arreglos_nombre_acti = [];
            cant_acti_resp = 0;
            var compania = [];
            var departamento = [];
            var arreglo = [];
            for (items of ff.recordset[0]){
                if (compania !== items.compania) {
                    arreglo.push({
                        compania: items.compania,
                        departamentos: []
                    });
                }

                if (departamento !== items.departamento) {
                    last(arreglo).departamentos.push({
                        cantidad: items.cant_depto,
                        depto: items.departamento,
                        actividades: []
                    });
                }

                last(last(arreglo).departamentos).actividades.push(items.nombre);
                departamento = items.departamento;
                compania = items.compania;
            }
            //
            if (cant_acti > 0){
                cnn2 = params.modules.storage;
                modelo_grupo = new cnn2.Model("group", params);

                return await modelo_grupo.data({})
                    .then( async rs_g => {
                        array_id_grupos_correos = [];
                        cnn = params.modules.mysql;
                        modelo_usuario = new cnn.Model("usuario", params);

                        var code = rs_g.data.filter(search => {
                            return search.caracteristica == "DP" || search.caracteristica == "AD";
                        });

                        for (key in code){
                            array_id_grupos_correos.push(code[key].id);
                        }
                        for (it in arreglo) {
                            // dividir begin
                            // if (it != paso){
                            //     paso = it;
                                for (var item_depto of arreglo[it]['departamentos']) {
                                    await modelo_usuario.where([
                                            {
                                                "field": "profile",
                                                "value": array_id_grupos_correos
                                            },
                                            {
                                                "field": "departamento",
                                                "value": item_depto.depto
                                            },
                                            {
                                                "field": "compania",
                                                "value": arreglo[it]['compania']
                                            }
                                        ]
                                    ).then(async result => {
                                        array_correos_usuarios = [];
                                        array_id_usuarios = [];
                                        for (item of result.data) {
                                            array_id_usuarios.push(item.id);
                                            array_correos_usuarios.push(item.correo);
                                        }
                                        if (array_correos_usuarios.length > 0){
                                                params.servicesFunctions.base_onesignal.posts.send(
                                                    {
                                                        headings: { en: 'Se aproxima la fecha de vencimiento de un '+ item_depto.cantidad + ' '+field_msj },
                                                        contents: { en: field_msj2+' próximo a vencer son los siguientes:'+ item_depto.actividades  },
                                                        users: array_id_usuarios,
                                                    });
                                                mail({
                                                    to: array_correos_usuarios,
                                                    subject: "Se aproxima la fecha de vencimiento de "+ item_depto.cantidad +" "+ field_msj,
                                                    name: "noReply",
                                                    template: 'email/plane',
                                                    fields: {
                                                        message: field_msj2+' próximo a vencer son los siguientes:',
                                                        list: item_depto.actividades
                                                    }
                                                });
                                        }
                                        console.log('Correos enviados correctamente get_data_analis_dir_actividad');
                                    }).catch(error3 => {
                                        console.log("Error al buscar los usuarios para obtener sus correos get_data_analis_dir_actividad", error3);
                                    });
                                }
                                // end
                            // }
                        }
                    });
            }
        };
        async function get_data_usuario(value) {
            cnn = params.modules.mysql;
            var module = params.CONFIG.mysqlactive ? params.modules.mysql : params.modules.postgre;
            var preter = params.CONFIG.mysqlactive ? 'call' : 'select';
            var ff = await cnn.executeNonQuery(`${preter} sp_get_actividades_x_responsable('${date_normal}','${value}')`, params)
                .then(function (data) {
                    return data;
                }).catch(err => {
                    return err;
                });
            cant_acti = ff.recordset[0].length;
            arreglos_correos_acti = [];
            arreglos_nombre_acti = [];
            cant_acti_resp = 0;
            var arreglo = [];
            var compania = 0;
            var usuario = 0;
            var paso_si;
            for (items of ff.recordset[0]){
                if (compania !== items.compania) {
                    arreglo.push({
                        compania: items.compania,
                        usuarios: []
                    });
                }

                if (usuario !== items.responsable) {
                    last(arreglo).usuarios.push({
                        usuario: items.responsable,
                        cantidad: items.cantidad,
                        correo: items.correo,
                        actividades: []
                    });
                }

                last(last(arreglo).usuarios).actividades.push(items.nombre);
                usuario = items.responsable;
                compania = items.compania;
            }
            //
            if (cant_acti > 0){
                cnn2 = params.modules.storage;
                modelo_grupo = new cnn2.Model("group", params);
                for (it in arreglo) {
                    for (it2 of arreglo[it]['usuarios']) {
                            if (arreglo.length > 0){
                                params.servicesFunctions.base_onesignal.posts.send(
                                    {
                                        headings: { en: 'Se aproxima la fecha de vencimiento de un '+ it2.cantidad + ' actividad(es)' },
                                        contents: { en: 'Actividad(es) próximo a vencer son los siguientes:'+ it2.actividades},
                                        users: [it2.usuario],
                                    });
                                mail({
                                    to: it2.correo,
                                    subject: "Se aproxima la fecha de vencimiento de "+ it2.cantidad +" actividad(es)",
                                    name: "noReply",
                                    template: 'email/plane',
                                    fields: {
                                        message: 'Actividad(es) próximo a vencer son los siguientes:',
                                        list: it2.actividades
                                    }
                                });
                            paso_si = it;
                        }
                        }
                    }
                console.log('Correos enviados correctamente get_data_usuario');
            }
        };

        function mail(req) {
            res = {};
            var models = params.models
                .concat(params.modelsql)
                .concat(params.modelmysql)
                .concat(params.modelpostgre)
                .concat(params.modeloracle)
                .concat(params.modelstorage);
            try {
                var transporter = params.mail.createTransport(params.CONFIG.smtp);
                var options = params.CONFIG.smptOptions;
                var from = params.CONFIG.support.email || params.CONFIG.smptOptions.sender;
                var name = req.name || params.CONFIG.developerBy.name || params.CONFIG.smptOptions.name;
                if (!req.to)
                    res = {error: "mailneedreceivers", success: false};
                if (!req.subject)
                    res = {error: "mailneedsubject", success: false};
                if (!req.html && !req.text && !req.template)
                    res = {error: "mailneedbody", success: false};
                var mailOptions = {
                    from: `"${name}" ${from}`,
                    to: req.to,
                    subject: req.subject
                };
                if (req.cc) {
                    mailOptions.cc = req.cc;
                }
                if (req.bcc) {
                    mailOptions.bcc = req.bcc;
                }
                if (req.text) {
                    mailOptions.text = req.text;
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            res = {error: error, success: false};
                        }
                        res = {success: true};
                    });
                }
                if (req.html) {
                    mailOptions.html = req.html;
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.log('si',res);
                            // res = {error: error, success: false});
                        }
                        res = {success: true};
                    });
                }
                if (req.template) {
                    params.app.render("../" + params.folders.viewsDragon + "/templates/" + req.template,
                        {
                            session: params.session,
                            CONFIG: params.CONFIG,
                            LANGUAGE: params.LANGUAGE,
                            SHOWLANGS: params.SHOWLANGS,
                            COLOR: params.CONFIG.ui.colors,
                            models: models,
                            FOLDERS: params.folders,
                            DATA: req.fields,
                        }, function (err, html) {
                            if (err) {
                                res = {error: err, html: html};
                                return;
                            }
                            mailOptions.html = html;
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    res = {error: error, success: false};
                                }
                                res = {success: true};
                            });
                        }
                    );
                }
            } catch (e) {
                console.log('error al intentar enviar los correo el posible error pudo ser que no existen un correo valido',e);
            }
        }
        //
        params.schedule.scheduleJob({
            // second: 10,
            minute: parseInt(array[1]),
            hour: parseInt(array[0])
        }, async function () {
            await get_producto();
            await get_data_analis_dir_producto("sp_get_product",date_now,'Producto(s)','El/Los productos(s)');
            await get_actividad("sp_get_actividades",date_now,'actividad(es)','La(s) actividad(es)');
            await get_data_analis_dir_actividad(date_now,'actividad(es)','La(s) actividad(es)');
            await get_data_usuario(date_now);
        });
    } else {
        console.log('No existe un valor definido para el envio de las notificaciones con anterioridad');
    }
    
    params.schedule.scheduleJob({
        hour: 6
    },async function(){
        await get_auditoria();
        await get_after_auditoria();
    });
};