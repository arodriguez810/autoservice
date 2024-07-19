app.controller("usuario", function ($scope, $http, $compile) {
    usuario = this;

    var session = new SESSION().current();
    usuario.session = session;
    usuario.validar_usuario = session.super;
    usuario.validar_responsable_actividades = true;
    usuario.headertitle = "Usuarios";
    RUNCONTROLLER("usuario", usuario, $scope, $http, $compile);
    TRIGGER.run(usuario);

    CheckuserStatus = (email) => new Promise((resolve, reject) => {
        //console.log(`$scope.triggers.table.before.load ${$scope.modelName}`);
        SERVICE.base_auth.loginStatus({username: email}, function (data) {
            if (data.data.error === "Account is Locked") {
                resolve("Bloqueado");
            } else {
                resolve("Desbloqueado");
            }
        });

    });
    usuario.triggers.table.after.load = async function (records) {
        usuario.setPermission("import", false);
        usuario.runMagicColum('profile', 'group', "id", "name");
        for (var i of usuario.records.data) {
            var status = await CheckuserStatus(i.correo);
            i.usuario_estatus = status;
        }


        usuario.refreshAngular();
    };
    usuario.permissionTable = "usuario";
    if (session.super) {
        usuario.fixFilters = [];
    } else {
    }



    usuario.formulary = function (data, mode, defaultData, view) {
        if (usuario !== undefined) {
            RUN_B("usuario", usuario, $scope, $http, $compile);
            usuario.form.titles = {
                new: MESSAGE.i('planificacion.titleUsuario'),
                edit: "Editar - " + `${MESSAGE.i('planificacion.titleUsuario')}`,
                view: "Ver ALL - " + `${MESSAGE.i('planificacion.titleUsuario')}`
            };
            if (typeof My_profile_var !== 'not defined') {
                if (typeof My_profile_var != "undefined") {
                    if (My_profile_var) {
                        usuario.form.titles = {
                            edit: "Editar - " + `${MESSAGE.i('planificacion.titleUsuario')}`,
                        }
                    }
                }
            }
            usuario.exist_options = false;
            usuario.triggers.table.after.close = function (data) {
                delete My_profile_var;
            };
            usuario.triggers.table.after.control = function (data) {
                if (data === "group") {
                    $('[name="usuario_group"]').trigger("change");
                }
                if (data === 'profile') {
                    if (typeof My_profile_var !== 'not defined') {
                        if (typeof My_profile_var != "undefined") {
                            if (My_profile_var) {
                                usuario.form.options.profile.disabled = true;
                                usuario.refreshAngular();
                            }
                        }
                    } else {
                        usuario.form.options.profile.disabled = false;
                        usuario.refreshAngular();
                    }
                }
            };
            usuario.triggers.table.before.control = function (data) {
                if (data === 'usuario_activo') {
                    usuario.usuario_activo = usuario.active;
                    usuario.refreshAngular();
                }
                //console.log(`$scope.triggers.table.before.control ${$scope.modelName} ${data}`);
            };

            usuario.valid = false;


            usuario.triggers.table.before.insert = (data) => new Promise((resolve, reject) => {
                data.inserting.usuario_activo = undefined;
                data.inserting.fecha_cambio_contraseña = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                resolve(true);
            });

            usuario.triggers.table.before.update = (data) => new Promise((resolve, reject) => {
                //console.log(`$scope.triggers.table.before.update ${$scope.modelName}`);
                data.updating.usuario_activo = undefined;
                resolve(true);
            });

            usuario.triggers.table.before.load = () => new Promise((resolve, reject) => {
                //console.log(`$scope.triggers.table.before.load ${$scope.modelName}`);
                resolve(true);
            });

            usuario.form.readonly.active = 1;


            usuario.form.schemas.insert.usuario_activo = FORM.schemasType.calculated;
            usuario.form.schemas.update.usuario_activo = FORM.schemasType.calculated;
            usuario.form.schemas.insert.repeatPassword = FORM.schemasType.calculated;

            usuario.createForm(data, mode, defaultData, view);
            usuario.repeatPassword = "[Encrypted]";
            usuario.$scope.$watch('usuario.nombre', function (value) {
                var rules = [];
                rules.push(VALIDATION.general.required(value));
                rules.push(VALIDATION.yariel.maliciousCode(value));
                VALIDATION.validate(usuario, "nombre", rules)
            });
            usuario.$scope.$watch('usuario.apellido', function (value) {
                var rules = [];
                rules.push(VALIDATION.general.required(value));
                rules.push(VALIDATION.yariel.maliciousCode(value));
                VALIDATION.validate(usuario, "apellido", rules)
            });
            usuario.$scope.$watch('usuario.correo', async function (value) {
                var rules = [];
                if (usuario.form.mode === "edit") {
                    var result = await BASEAPI.firstp('usuario', {
                        "where": [
                            {
                                "field": "correo",
                                "value": value
                            },
                            {
                                "field": "id",
                                "operator": "!=",
                                "value": usuario.id
                            }
                        ]
                    });
                    console.log("En el watch del edit", usuario.result);
                } else {
                    var result = await BASEAPI.firstp('usuario', {
                        "where": [
                            {
                                "field": "correo",
                                "value": value
                            }
                        ]
                    });
                }
                rules.push(VALIDATION.general.required(value));
                rules.push(VALIDATION.text.email(value));
                rules.push(VALIDATION.yariel.maliciousCode(value));
                rules.push(VALIDATION.yariel.duplicateEmail(value, result ? result.correo : ""));
                VALIDATION.validate(usuario, "correo", rules);
                usuario.refreshAngular();
            });
            usuario.$scope.$watch('usuario.profile', function (value) {
                var rules = [];
                rules.push(VALIDATION.general.required(value));
                // rules.push(VALIDATION.dropdown.atLeast(value, 1));
                VALIDATION.validate(usuario, "profile", rules)
                if (usuario.form.selected('profile')) {
                    if (usuario.form.selected('profile').caracteristica === "AU") {
                        VALIDATION.validate(usuario, "tipo_auditor", [{
                            valid: !DSON.oseaX0(usuario.tipo_auditor),
                            message: MESSAGE.i('validations.Fieldisrequired'),
                            type: VALIDATION.types.error,
                            visible: false
                        }]);
                        usuario.refreshAngular()
                    } else {
                        VALIDATION.validate(usuario, "tipo_auditor", [{
                            valid: true,
                            message: MESSAGE.i('validations.Fieldisrequired'),
                            type: VALIDATION.types.error,
                            visible: false
                        }]);
                        usuario.tipo_auditor = "[NULL]";
                        usuario.form.loadDropDown('tipo_auditor');
                        usuario.refreshAngular()
                    }
                }
            });
            usuario.$scope.$watch('usuario.tipo_auditor', function (value) {
                var rules = [];
                rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(usuario, "tipo_auditor", rules)
            });
            usuario.$scope.$watch('usuario.password', function (value) {
                var rules = [];
                rules.push(VALIDATION.general.required(value));
                rules.push(VALIDATION.yariel.equal(value, usuario.repeatPassword, "Contraseña", "Repetir Contraseña"));
                rules.push(VALIDATION.yariel.maliciousCode(value));
                VALIDATION.validate(usuario, "password", rules)

                var rules2 = [];
                rules2.push(VALIDATION.general.required(value));
                rules2.push(VALIDATION.yariel.equal(usuario.repeatPassword, value, "Repetir Contraseña", "Contraseña"));
                VALIDATION.validate(usuario, "repeatPassword", rules2);
            });
            usuario.$scope.$watch('usuario.repeatPassword', function (value) {
                var rules = [];
                rules.push(VALIDATION.general.required(value));
                rules.push(VALIDATION.yariel.equal(value, usuario.password, "Repetir Contraseña", "Contraseña"));
                rules.push(VALIDATION.yariel.maliciousCode(value));
                VALIDATION.validate(usuario, "repeatPassword", rules);

                var rules2 = [];
                rules2.push(VALIDATION.general.required(usuario.password));
                rules2.push(VALIDATION.yariel.equal(usuario.password, usuario.repeatPassword, "Contraseña", "Repetir Contraseña"));
                VALIDATION.validate(usuario, "password", rules2)
            });

        }
    };
    usuario.triggers.table.before.open = () => new Promise((resolve, reject) => {
        //console.log(`$scope.triggers.table.before.open ${$scope.modelName}`);
        if (usuario.form.mode === "new")
            usuario.id = undefined;
        resolve(true);
    });
});
