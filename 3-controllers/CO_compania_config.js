app.controller("compania_config", function ($scope, $http, $compile) {
    compania_config = this;
    //compania_config.fixFilters = [];
    compania_config.session = new SESSION().current();
    compania_config.singular = "Configuración";
    compania_config.plural = "Configuraciones";
    compania_config.headertitle = "Configuración de la compañía";
    //compania_config.destroyForm = false;
    //compania_config.permissionTable = "tabletopermission";
    RUNCONTROLLER("compania_config", compania_config, $scope, $http, $compile);
    compania_config.formulary = function (data, mode, defaultData) {
        if (compania_config !== undefined) {
            RUN_B("compania_config", compania_config, $scope, $http, $compile);
            compania_config.form.modalWidth = ENUM.modal.width.full;
            compania_config.form.titles = {
                new: "Agregar XXX",
                edit: "Editar Configuración",
                view: "Ver XXXX"
            };
            compania_config.createForm(data, mode, defaultData);
            $scope.$watch("compania_config.pacc", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'pacc', rules);
            });
            $scope.$watch("compania_config.institucional", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'institucional', rules);
            });
            $scope.$watch("compania_config.sectorial", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'sectorial', rules);
            });
            $scope.$watch("compania_config.ods", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'ods', rules);
            });
            $scope.$watch("compania_config.estatus_productoXactividades", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'estatus_productoXactividades', rules);
            });
            $scope.$watch("compania_config.notificaciones_correo", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'notificaciones_correo', rules);
            });
            $scope.$watch("compania_config.notificaciones_push", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'notificaciones_push', rules);
            });
            $scope.$watch("compania_config.planificacion", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'planificacion', rules);
            });
            $scope.$watch("compania_config.asignaciones_especiales", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'asignaciones_especiales', rules);
            });
            $scope.$watch("compania_config.ipn", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'ipn', rules);
            });
            $scope.$watch("compania_config.calidad", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'calidad', rules);
            });
            $scope.$watch("compania_config.proyectos_especiales", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'proyectos_especiales', rules);
            });
            $scope.$watch("compania_config.gestion_indicadores", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'gestion_indicadores', rules);
            });
            $scope.$watch("compania_config.riesgo_var", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'riesgo_var', rules);
            });
            $scope.$watch("compania_config.riesgo_amfe", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'riesgo_amfe', rules);
            });
            $scope.$watch("compania_config.plan_accion", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'plan_accion', rules);
            });
            $scope.$watch("compania_config.salidas", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'salidas', rules);
            });
            $scope.$watch("compania_config.servicio", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'servicio', rules);
            });
            $scope.$watch("compania_config.documentos_externos", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'documentos_externos', rules);
            });
            $scope.$watch("compania_config.formularios", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'formularios', rules);
            });
            $scope.$watch("compania_config.reporte_configurable", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'reporte_configurable', rules);
            });
            $scope.$watch("compania_config.plantillas_ods", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'plantillas_ods', rules);
            });
            $scope.$watch("compania_config.import_masivo", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'import_masivo', rules);
            });
            $scope.$watch("compania_config.historial_acceso", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'historial_acceso', rules);
            });
            $scope.$watch("compania_config.mesa_ayuda", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'mesa_ayuda', rules);
            });
            $scope.$watch("compania_config.repositorio_archivos", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'repositorio_archivos', rules);
            });
            $scope.$watch("compania_config.interfaces", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'interfaces', rules);
            });
            $scope.$watch("compania_config.color_principal", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'color_principal', rules);
            });
            $scope.$watch("compania_config.color_secundario", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'color_secundario', rules);
            });
            $scope.$watch("compania_config.dias_de_gracia", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'dias_de_gracia', rules);
            });
            $scope.$watch("compania_config.hora_notificacion", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'hora_notificacion', rules);
            });
            $scope.$watch("compania_config.onesignal_key", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'onesignal_key', rules);
            });
            $scope.$watch("compania_config.onesignal_appauth", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'onesignal_appauth', rules);
            });
            $scope.$watch("compania_config.onesignal_appid", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'onesignal_appid', rules);
            });
            $scope.$watch("compania_config.carga_evidencia_abierta", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'carga_evidencia_abierta', rules);
            });
            $scope.$watch("compania_config.smtp_host", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'smtp_host', rules);
            });
            $scope.$watch("compania_config.smtp_port", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'smtp_port', rules);
            });
            $scope.$watch("compania_config.smtp_ssl", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'smtp_ssl', rules);
            });
            $scope.$watch("compania_config.smtp_email", function (value) {
                var rules = [];
                //rules here
                rules.push(VALIDATION.text.email(value));
                VALIDATION.validate(compania_config, 'smtp_email', rules);
            });
            $scope.$watch("compania_config.smtp_password", function (value) {
                var rules = [];
                //rules here
                VALIDATION.validate(compania_config, 'smtp_password', rules);
            });
            $scope.$watch("compania_config.smtp_sender", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'smtp_sender', rules);
            });
            $scope.$watch("compania_config.smtp_sender_name", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(compania_config, 'smtp_sender_name', rules);
            });
        }
    };
    compania_config.triggers.table.after.load = async function (records) {
        //console.log(`$scope.triggers.table.after.load ${$scope.modelName}`);

    };
    // compania_config.triggers.table.before.load = () => new Promise(async (resolve, reject) => {
    //
    //     //console.log(`$scope.triggers.table.before.load ${$scope.modelName}`);
    //     resolve(true);
    // });
    //
    // $scope.triggers.table.after.open = function (data) {
    //     //console.log(`$scope.triggers.table.after.open ${$scope.modelName}`);
    // };
    // $scope.triggers.table.before.open = () => new Promise((resolve, reject) => {
    //     //console.log(`$scope.triggers.table.before.open ${$scope.modelName}`);
    //     resolve(true);
    // });
    //
    // $scope.triggers.table.after.close = function (data) {
    //     //console.log(`$scope.triggers.table.after.close ${$scope.modelName}`);
    // };
    // $scope.triggers.table.before.close = () => new Promise((resolve, reject) => {
    //     //console.log(`$scope.triggers.table.before.close ${$scope.modelName}`);
    //     resolve(true);
    // });
    //
    // $scope.triggers.table.after.insert = function (data) {
    //     //console.log(`$scope.triggers.table.after.insert ${$scope.modelName}`);
    //     return true;
    // };
    // $scope.triggers.table.before.insert = (data) => new Promise((resolve, reject) => {
    //     //console.log(`$scope.triggers.table.before.insert ${$scope.modelName}`);
    //     resolve(true);
    // });
    //
    compania_config.triggers.table.after.update = function (data) {
        location.reload();
    };
    // $scope.triggers.table.before.update = (data) => new Promise((resolve, reject) => {
    //     //console.log(`$scope.triggers.table.before.update ${$scope.modelName}`);
    //     resolve(true);
    // });
    //
    // $scope.triggers.table.after.control = function (data) {
    //     //console.log(`$scope.triggers.table.after.control ${$scope.modelName} ${data}`);
    // };
    // $scope.triggers.table.before.control = function (data) {
    //     //console.log(`$scope.triggers.table.before.control ${$scope.modelName} ${data}`);
    // };
    //$scope.beforeDelete = function (data) {
    //    return false;
    //};
    //$scope.afterDelete = function (data) {
    //};
});