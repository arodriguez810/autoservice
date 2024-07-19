app.controller("auth", function ($scope, $http, $compile) {
    auth = this;
    RUNCONTROLLER("auth", auth, $scope, $http, $compile);
    RUN_B("auth", auth, $scope, $http, $compile);
    var http = new HTTP();
    auth.queries = http.hrefToObj();
    auth.isView = http.hrefToMulObj();
    auth.IP = "0";
    // $.getJSON('https://api.ipify.org?format=jsonp&callback=?', function (data) {
    //     auth.IP = data.ip;
    // });

    if (new SESSION().current()) {
        if (location.href.indexOf('auth/login') !== -1 && location.href.indexOf(`/home#auth/formulario`) === -1 && location.href.indexOf(`/outlook`) === -1) {
            var http = new HTTP();
            http.folderredirect('');
        }
    }
    auth.goHome_formulario = function () {
        let link = `${CONFIG.ssl === true ? 'https://' : 'http://'}${CONFIG.subdomain !== '' ? CONFIG.subdomain + '.' : ''}${CONFIG.domain}${(CONFIG.port === 80 || CONFIG.port === 443 || CONFIG.port === 443) ? '' : (":" + CONFIG.port)}${CONFIG.folderslash}/#modulo_formulario`;
        window.location = link;
    }
    auth.enviarFormulario = async () => {
        let toinsert = {
            modulo_formulario: auth.queries.id || 0,
            respuestas: JSON.stringify(baseController.formulario.registro),
            fecha: "$now()",
            ip: baseController.session ? baseController.session.ip : "0",
            nombre: baseController.session ? baseController.session.fullName() : "Anónimo",
            origen: baseController.session ? "interno" : "externo",
            usuario: baseController.session ? baseController.session.usuario_id : 0,
            browser: getBrowser()
        };
        if (baseController.formulario)
            if (baseController.formulario.config)
                if (baseController.formulario.config.fields)
                    if (baseController.formulario.config.fields.length) {
                        for (const d of baseController.formulario.config.fields) {
                            if (d.config.required)
                                if (!baseController.formulario.registro[d.field]) {
                                    SWEETALERT.show({
                                        message: `El campo ${d.field} es requerido`,
                                        type: 'warning'
                                    });
                                    return;
                                }
                        }
                    }
        SWEETALERT.loading({message: "Enviando Respuestas"});
        BASEAPI.insertIDp("modulo_formulario_registro", toinsert);
        SWEETALERT.show({message: "Gracias por compartirnos tus respuestas"});
        baseController.formulario.end = true;
        baseController.refreshAngular();
    }
    auth.createForm = async () => {
        SWEETALERT.loading({message: "Cargando Formulario"});
        baseController.formulario = {nombre: "", registro: {}};
        let formID = auth.queries.id || 0;
        try {
            MENU.setActive("auth/formulario?id=" + formID);
            baseController.setSeparator("- OPCIONES INDIVIDUALES -");

        } catch (e) {

        }
        if (baseController.session) {
            let yalolleno = await BASEAPI.firstp('modulo_formulario_registro', {
                where: [
                    {field: "usuario", value: baseController.session.usuario_id},
                    {field: "modulo_formulario", value: formID}
                ]
            });
            if (auth.isView.view == "true") {
                if (formID) {
                    baseController.formulario = await BASEAPI.firstp('modulo_formulario', {
                        where: [{value: formID}]
                    });
                    baseController.formulario.registro = {};
                    try {
                        baseController.formulario.config = JSON.parse(baseController.formulario.config);
                    } catch (e) {
                        baseController.formulario.config = {fields: []};
                    }
                    if (baseController.formulario)
                        if (baseController.formulario.config)
                            if (baseController.formulario.config.fields)
                                if (baseController.formulario.config.fields.length) {
                                    baseController.formulario.config.fields.forEach(d => {
                                        if (d.tipo === "lista" || d.tipo === "lista múltiple") {
                                            d.realOptions = [...new Set((d.config.options || '').split(','))];
                                        }
                                    });
                                }
                } else {
                    baseController.formulario.registro = {};
                    baseController.formulario.nombre = "404: Este formulario no existe o fue eliminado.";
                }
                baseController.formulario.en_view = true;
                baseController.refreshAngular();
                SWEETALERT.stop();
                return;
            }
            if (yalolleno) {
                baseController.formulario.registro = {};
                baseController.formulario.nombre = `Hola ${baseController.session.fullName()}, gracias por haber llenado este formulario, estaremos trabajando en tus opiniones.`;
                baseController.formulario.internoyalleno = true;
                baseController.formulario.end = true;
                baseController.refreshAngular();
                SWEETALERT.stop();

                return;
            }
        }
        if (formID) {
            baseController.formulario = await BASEAPI.firstp('modulo_formulario', {
                where: [{value: formID}]
            });
            baseController.formulario.registro = {};
            try {
                baseController.formulario.config = JSON.parse(baseController.formulario.config);
            } catch (e) {
                baseController.formulario.config = {fields: []};
            }
            if (baseController.formulario)
                if (baseController.formulario.config)
                    if (baseController.formulario.config.fields)
                        if (baseController.formulario.config.fields.length) {
                            baseController.formulario.config.fields.forEach(d => {
                                if (d.tipo === "lista" || d.tipo === "lista múltiple") {
                                    d.realOptions = [...new Set((d.config.options || '').split(','))];
                                }
                            });
                        }
        } else {
            baseController.formulario.registro = {};
            baseController.formulario.nombre = "404: Este formulario no existe o fue eliminado.";
        }
        baseController.refreshAngular();
        SWEETALERT.stop();

    }

    if (location.href.indexOf('token=') !== -1) {
        let token = location.href.split('token=')[1];
        SWEETALERT.loading("Validando Token de Credenciales");
        BASEAPI.firstp('vw_usuario', {
            where: [{
                field: 'confirm',
                value: token
            }]
        }).then(user => {
            if (user) {
                console.log(user);
                auth.username = user.correo;
                auth.password = token;
                auth.makeLogin(true);
            }
        });
    }

    $scope.$watch('auth.username', function (value) {
        var rules = [];
        rules.push(VALIDATION.general.required(value));
        VALIDATION.validate(auth, "username", rules);
    });
    $scope.$watch('auth.password', function (value) {
        var rules = [];
        rules.push(VALIDATION.general.required(value));
        var validation = VALIDATION.validate(auth, "password", rules);
        if (value !== undefined) {
            if (value.length >= 5)
                auth.form.options.password.icon.class = "lock2";
            else
                auth.form.options.password.icon.class = "unlocked2";
        }
        return validation;
    });
    $scope.$watch('auth.forgotfield', function (value) {
        var rules = [];
        rules.push(VALIDATION.general.required(value));
        rules.push(VALIDATION.text.email(value));
        VALIDATION.validate(auth, "forgotfield", rules);
    });
    var repeatPasswordMessage = MESSAGE.ic('mono.repeatpassword');
    var passwordMessage = MESSAGE.ic('mono.password');
    $scope.$watch('auth.newpassword', function (value) {
        var rules = [];
        rules.push(VALIDATION.general.required(value));
        rules.push(VALIDATION.general.equal(value, auth.repeatPassword, passwordMessage, repeatPasswordMessage));
        VALIDATION.validate(auth, "newpassword", rules)

        var rulesRepeat = [];
        rulesRepeat.push(VALIDATION.general.equal(auth.repeatPassword, value, repeatPasswordMessage, passwordMessage));
        VALIDATION.validate(auth, "confirmpassword", rulesRepeat);
    });
    $scope.$watch('auth.confirmpassword', function (value) {
        var rules = [];
        rules.push(VALIDATION.general.required(value));
        rules.push(VALIDATION.general.equal(value, auth.newpassword, repeatPasswordMessage, passwordMessage));
        VALIDATION.validate(auth, "confirmpassword", rules);

        var rulesRepeat = [];
        rulesRepeat.push(VALIDATION.general.equal(auth.newpassword, value, passwordMessage, repeatPasswordMessage));
        VALIDATION.validate(auth, "newpassword", rulesRepeat)
    });
    auth.sendForgotPassword = async function () {
        VALIDATION.save(auth, async function () {
            var animation = new ANIMATION();
            console.log('password');

            var where = {where: [{field: CONFIG.users.fields.email, value: auth.forgotfield}]};
            console.log('TEST 0');
            console.log(where);
            var user = await BASEAPI.firstp(CONFIG.users.model, where);
            console.log('TEST 1');

            if (user !== null) {
                user = new SESSION().runFunction(user);
                animation.loadingPure($("#idsend"), "", $("#spinersend"), '30');
                var date = new Date();
                var token = `${date.getFullYear()}${date.getMonth()}${date.getDay()}${user.getID()}`;
                SERVICE.base_auth.md5({value: token}, function (result) {
                    BASEAPI.mail({
                        "to": eval(`user.${CONFIG.users.fields.email}`),
                        "subject": `${CONFIG.appName} - ${MESSAGE.ic('login.passwordrecovery')}`,
                        "name": user.fullName(),
                        "template": 'email/forgotpassword',
                        "fields": {
                            name: user.fullName(),
                            username: eval(`user.${CONFIG.users.fields.username}`),
                            phone: CONFIG.support.phone,
                            "button": MESSAGE.i('login.button'),
                            "a": MESSAGE.i('login.a'),
                            "b": MESSAGE.i('login.b'),
                            "c": MESSAGE.i('login.c'),
                            "d": MESSAGE.i('login.d'),
                            "url": new HTTP().folderpath(["home#auth", `login?restore=${result.data.md5}`])
                        }
                    }, function (result) {
                        animation.stoploading($("#idsend"), $("#spinersend"));
                        SWEETALERT.show({message: MESSAGE.i('login.restoreemailsend')});
                    });
                });

            } else {
                SWEETALERT.show({message: MESSAGE.i('login.restoreemailsend')});
            }
        }, ["forgotfield"]);

    };
    auth.restorePassword = async function () {
        VALIDATION.save(auth, async function () {
            var http = new HTTP();
            let querystring = http.hrefToObj();
            if (Object.keys(querystring).length === 0) {
                if (auth.password === auth.newpassword) {
                    SWEETALERT.show({type: "error", message: "La nueva contraseña no puede ser la misma a la anterior"});
                    return;
                }
                var animation = new ANIMATION();
                animation.loadingPure($("#idsend"), "", $("#spinersend"), '30');
                SERVICE.base_auth.changePassword({
                    restore: auth.queries.restore,
                    newpassword: auth.newpassword
                }, function (result) {
                    animation.stoploading($("#idsend"), $("#spinersend"));
                    if (result.data.success) {
                        SWEETALERT.show({message: MESSAGE.i('login.passwordrestored')});
                        auth.password = "";
                        auth.$scope.$digest();
                        MODAL.close(auth);
                    }
                });
            }else{
                var animation = new ANIMATION();
                animation.loadingPure($("#idsend"), "", $("#spinersend"), '30');
                SERVICE.base_auth.changePassword({
                    restore: auth.queries.restore,
                    newpassword: auth.newpassword
                }, function (result) {
                    animation.stoploading($("#idsend"), $("#spinersend"));
                    if (result.data.success) {
                        SWEETALERT.show({message: MESSAGE.i('login.passwordrestored')});
                        auth.password = "";
                        auth.$scope.$digest();
                        MODAL.close(auth);
                    }
                });
            }
        }, ["newpassword", "confirmpassword"]);
    };
    auth.forgotPassword = function () {
        auth.modal.modalView("auth/forgot", {
            width: ENUM.modal.width.small,
            header: {
                title: MESSAGE.ic("login.forgotpassword"),
                icon: "user-block"
            },
            footer: {
                cancelButton: false
            },
            content: {
                loadingContentText: `${MESSAGE.i('actions.Loading')}...`,
                sameController: true
            },
        });
    };
    auth.lan = LAN;
    auth.refreshAngular = function () {
        if (auth)
            if (auth.$root && !auth.$root.$$phase)
                auth.$digest();
    };
    auth.personalizado = {
        id: -1,
        precio: 0
    };
    auth.priceVar = () => {
        let price = 0;
        if (auth.reules)
            if (auth.reules.data)
                for (const rule of auth.reules.data)
                    if (auth.personalizado[rule.variable])
                        price += rule.precio * (rule.recibevalue ? (auth.personalizado[rule.variable] || 1) : 1);
        return price;
    };
    auth.disableVar = (variable) => {
        let rule = auth.reules.data.filter(d => {
            return d.variable === variable
        })[0];
        if (rule) {
            let requires = (rule.requireds_modules || "").split(';');
            let negatives = (rule.negative_modules || "").split(';');
            for (const vari of requires)
                if (vari)
                    if (!auth.personalizado[vari])
                        return true;
            for (const vari of negatives)
                if (vari)
                    if (auth.personalizado[vari])
                        return true;
        } else
            return true;
        return false;
    };
    auth.create = async function () {
        auth.plans = await BASEAPI.listp('plan_base', {
            where: [{
                field: 'activo',
                value: '1'
            }, {
                field: 'custom',
                operator: 'is',
                value: '$null'
            }]
        });
        auth.reules = await BASEAPI.listp('vw_plan_modules', {});
        auth.selected = undefined;
        auth.refreshAngular();
        auth.modal.modalView("auth/createaccount", {
            width: ENUM.modal.width.full,
            header: {
                title: "Registra tu Institución/Empresa",
                icon: "user-plus"
            },
            footer: {
                cancelButton: true
            },
            content: {
                loadingContentText: `Cargando`,
                sameController: true
            },
        });
    };
    auth.makeLogin = function (tokened) {
        SWEETALERT.loading("Validating credentials");
        SERVICE.base_auth.login({
            username: auth.username,
            password: auth.password,
            tokened: tokened,
            playerID: PLAYERID
        }, async function (data) {
            var response = data.data;
            if (response.error !== false) {
                var user = await BASEAPI.firstp('usuario', {
                    where: [{
                        field: 'correo',
                        value: auth.username
                    }]
                });
                var obj_user_list = await BASEAPI.listp('usuario', {
                    limit: 0,
                    order: "asc",
                    where: [
                        {
                            field: "profile",
                            value: 1
                        }
                    ]
                });
                var company = await BASEAPI.firstp('vw_usuario', {
                    where: [
                        {
                            field: "correo",
                            value: auth.username
                        },
                    ]
                });
                var admin_email_list = [];
                for (var i of obj_user_list.data) {
                    admin_email_list.push(i.correo);
                }
                console.log(admin_email_list);
                BASEAPI.mail({
                    "to": admin_email_list,
                    "subject": "El usuario " + user.nombre + " " + user.apellido + " ha sido bloqueado",
                    "name": "noReply",
                    "template": 'email/plane',
                    "fields": { //estos campos se utilizarán en el template
                        message: "El usuario " + user.nombre + " " + user.apellido + " ha agotado todos los intentos disponibles para iniciar sesión, estará bloqueado hasta que culmine el tiempo establecido en la aplicación y pueda volver a intentar acceder a ella."
                    }
                }, function (result) {
                });
                BASEAPI.mail({
                    "to": user.correo,
                    "subject": "Notificación – Usuario ha sido bloqueado",
                    "name": "noReply",
                    "template": 'email/usuario_bloqueado',
                    "fields": { //estos campos se utilizarán en el template
                        nombre: user.nombre,
                        apellido: user.apellido
                    }
                }, function (result) {

                });
                SWEETALERT.show({
                    type: 'error',
                    message: MESSAGE.ieval('login.blocked'),
                    close: function () {
                        auth.password = "";
                    }
                });
            } else {
                if (response.count[0] > 0) {
                    var user = response.data[0];
                    if (user.active == 1) {
                        if (!user.fecha_cambio_contraseña || moment().diff(user.fecha_cambio_contraseña, 'days') > parseInt(CONFIG.users.expire)){
                            SWEETALERT.show({
                                type: "error",
                                message: "Su contraseña se ha vencido, por favor ingrese una nueva contraseña para iniciar sesión.",
                                confirm: function (){
                                    auth.updatepassword();
                                    auth.modal.modalView("auth/restore", {
                                        width: ENUM.modal.width.large,
                                        header: {
                                            title: MESSAGE.ic("login.resetpassword"),
                                            icon: "lock"
                                        },
                                        footer: {
                                            cancelButton: false
                                        },
                                        content: {
                                            loadingContentText: `${MESSAGE.i('actions.Loading')}...`,
                                            sameController: true
                                        },
                                    });
                                }
                            })
                            return;
                        }
                        if (user.fecha_sesion || moment().diff(user.fecha_sesion, 'hours') < 1){
                            SWEETALERT.show({type: "error", message: "El usuario ya tiene una sesión iniciada"})
                            return;
                        }
                        let session = {
                            current: () => {
                                return new SESSION().current(user);
                            }
                        };
                        //inicio
                        if (session.current().menus)
                            user.currentMenu = session.current().menus();
                        else
                            user.currentMenu = "menus";

                        var condition = false;

                        user.userID = session.current().getID();
                        if (session.current().path)
                            user.path = session.current().path();
                        else
                            user.path = CONFIG.users.path;
                        user.fullName = session.current().fullName();
                        user.type = session.current().type;
                        GROUPS = session.current().onlygroups;
                        var entitiesPermission = [];
                        for (var pers of CONFIG.permissions.entities) {
                            entitiesPermission.push(`${pers}-${user.userID}`)
                        }
                        let result = await BASEAPI.listp('permission', {
                            where: [
                                {
                                    "field": "id",
                                    "value": entitiesPermission,
                                    "connector": "OR"
                                },
                                {
                                    "field": "id+')'",
                                    "value": GROUPS.map(d => {
                                        return `${d})`
                                    })
                                }
                            ]
                        });
                        user.permissionData = result.data;
                        user.GROUPS = GROUPS;
                        new SESSION().register(user);
                        await BASEAPI.insertp('login_history', {
                            usuario: user.id,
                            date: '$now()',
                            ip: auth.IP,
                        });
                        var http = new HTTP();
                        http.folderredirect('');
                    } else {
                        SWEETALERT.show({
                            type: 'error',
                            message: MESSAGE.i('login.invalid'), //MESSAGE.i('login.disabled'),
                            close: function () {
                                auth.password = "";
                            }
                        });
                    }
                } else {
                    SWEETALERT.show({
                        type: 'error',
                        message: MESSAGE.i('login.invalid'),
                        close: function () {
                            auth.password = "";
                        }
                    });
                }
            }
        });
    };
    auth.login_click = function () {
        VALIDATION.save(auth, async function () {
            await auth.makeLogin();
        });
    };
    if (auth.queries.restore !== undefined) {
        SWEETALERT.loading({message: MESSAGE.ic('mono.procesing')});
        SERVICE.base_auth.matchtoken({restore: auth.queries.restore}, function (result) {
            SWEETALERT.stop();
            if (result.data.user !== false) {
                auth.restoreUser = new SESSION().runFunction(result.data.user);
                auth.modal.modalView("auth/restore", {
                    width: ENUM.modal.width.large,
                    header: {
                        title: MESSAGE.ic("login.resetpassword"),
                        icon: "lock"
                    },
                    footer: {
                        cancelButton: false
                    },
                    content: {
                        loadingContentText: `${MESSAGE.i('actions.Loading')}...`,
                        sameController: true
                    },
                });
            } else {
                SWEETALERT.show({message: MESSAGE.i('login.expire')});
            }
        });

    }
    auth.sendRegistration = async function () {
        SWEETALERT.loading({message: "Registrando Compañía"});
        let token = 'DragonTOKEN_' + new Date().getTime();
        let planSelected = auth.plans.data.filter(d => {
            return d.id == auth.selected
        })[0];
        let planid = 0;
        if (auth.selected === -1) {
            let plantoinsert = {
                nombre: `Plan de ${auth.nombre}`,
                descripcion: `Plan de ${auth.nombre}`,
                precio: auth.priceVar(),
                custom: 1
            };
            if (auth.reules)
                if (auth.reules.data)
                    for (const rule of auth.reules.data)
                        if (auth.personalizado[rule.variable])
                            plantoinsert[rule.variable] = auth.personalizado[rule.variable];

            let plan = await BASEAPI.insertIDp('plan_base', plantoinsert, '', '');
            plan = plan.data.data[0];
            planSelected = plan;
            planid = plan.id;
        }
        let compania = await BASEAPI.insertIDp('compania', {
            nombre: auth.nombre,
            sigla: auth.sigla,
            correo: auth.correo,
            telefono: auth.telefono,
            direccion: auth.direccion,
            plan: planid || auth.selected,
            confirm: token,
            maneja_institucion: planSelected.multiinstitucion || 0,
            tipo_institucion: planSelected.privada ? 2 : 1
        }, '', '');
        compania = compania.data.data[0];
        console.log(compania);
        let cargo = await BASEAPI.insertIDp('cargo', {
            nombre: "Administraor del Sistema",
            compania: compania.id,
            active: 1
        }, '', '');
        cargo = cargo.data.data[0];
        console.log(cargo);
        let departamento = await BASEAPI.insertIDp('departamento', {
            nombre: "General",
            compania: compania.id,
            active: 1
        }, '', '');
        departamento = departamento.data.data[0];
        console.log(departamento);
        let usuario = await BASEAPI.insertIDp('usuario', {
            nombre: "Administrador",
            apellido: auth.sigla,
            correo: auth.correo,
            cargo: cargo.id,
            departamento: departamento.id,
            compania: compania.id,
            active: 1,
            profile: 1
        }, '', '');
        usuario = usuario.data.data[0];
        await BASEAPI.updateallp('compania', {
            responsable: usuario.id,
            where: [{value: compania.id}]
        });
        console.log(usuario);
        BASEAPI.mail({
            "to": auth.correo,
            "subject": `Registro de la institución/compañía ${auth.nombre}(${auth.sigla})`,
            "name": "noReply",
            "template": 'email/htmlie',
            "fields": { //estos campos se utilizarán en el template
                message: `Usted se ha registrado como la institución/compañía ${auth.nombre}(${auth.sigla}) en el sistema CBS, se le han adjuntado una serie de documentaciones según su plan adquirido.`,
                url: new HTTP().folderpath(["home#auth", `login?token=${token}`]),
                link: "Activar su cuenta aquí"
            }
        }, function (result) {
            SWEETALERT.stop();
            SWEETALERT.show({
                type: 'success',
                message: `Se le ha enviado enviando un correo a ${auth.correo} con las instrucciones para activar su cuenta.`,
                close: function () {
                    MODAL.close(auth);
                },
                confirm: function () {
                    MODAL.close(auth);
                }
            });
        });
    };
    auth.updatepassword = async function () {
        var user = await BASEAPI.firstp('usuario', {
            where: [{
                field: 'correo',
                value: auth.username
            }]
        });
        if (user !== null) {
            user = new SESSION().runFunction(user);
            var date = new Date();
            var token = `${date.getFullYear()}${date.getMonth()}${date.getDay()}${user.id}`;
            SERVICE.base_auth.md5({value: token}, function (result) {
                auth.queries.restore = result.data.md5;
            });
        }
    }

});
