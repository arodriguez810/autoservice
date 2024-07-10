app.controller("hint_fields", function ($scope, $http, $compile) {
    hint_fields = this;
    var user_info = new SESSION().current();
    hint_fields.super = user_info.super;
    hint_fields.singular = MESSAGE.i('columns.hint_fields');
    ;
    hint_fields.plural = MESSAGE.i('columns.hint_fields');
    ;
    hint_fields.headertitle = MESSAGE.i('columns.hint_fields');
    ;
    //hint_fields.destroyForm = false;
    //hint_fields.permissionTable = "tabletopermission";
    ENTITIES = [];
    FIELDS = [];

    for (var i of CONFIG.entities) {
        ENTITIES.push({
            id: i.controllerName,
            name: i.displayName
        });
    }
    ;

    for (var i of CONFIG.hint_fields) {
        // if (DSON.oseaX(i.cousin)){
        FIELDS.push({
            id: i.fieldName,
            name: i.displayName,
            entity: i.entity,
            cousin: i.cousin,
            trueEntity: i.trueEntity
        })
        // }
    }

    RUNCONTROLLER("hint_fields", hint_fields, $scope, $http, $compile);
    hint_fields.formulary = function (data, mode, defaultData) {
        if (hint_fields !== undefined) {
            RUN_B("hint_fields", hint_fields, $scope, $http, $compile);
            hint_fields.form.modalWidth = ENUM.modal.width.full;
            hint_fields.form.readonly = {};
            hint_fields.createForm(data, mode, defaultData);
            $scope.$watch("hint_fields.entities", function (value) {
                var rules = [];
                // rules here
                rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(hint_fields, 'entities', rules);
            });
            $scope.$watch("hint_fields.field_names", function (value) {
                var rules = [];
                // rules here
                rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(hint_fields, 'field_names', rules);
            });
            $scope.$watch("hint_fields.text", function (value) {
                var rules = [];
                // rules here
                rules.push(VALIDATION.general.required(value));
                rules.push(VALIDATION.yariel.maliciousCode(value));
                VALIDATION.validate(hint_fields, 'text', rules);
            });
        }
    };
    hint_fields.triggers.table.after.load = async function (records) {
        hint_fields.refreshAngular();
    };
    // $scope.triggers.table.before.load = () => new Promise((resolve, reject) => {
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
    // hint_fields.triggers.table.after.insert = function (data) {
    //     //console.log(`$scope.triggers.table.after.insert ${$scope.modelName}`);
    //     return true;
    // };
    hint_fields.triggers.table.before.insert = (data) => new Promise((resolve, reject) => {

        var fieldName = hint_fields.form.options.field_names.data.filter(d => {
            return d.entity === hint_fields.entities && d.id === hint_fields.field_names
        })[0];
        if (hint_fields.form.selected('field_names') != null) {
            if (fieldName.cousin != undefined)
                data.inserting.cousin = fieldName.cousin;
            else
                data.inserting.cousin = undefined;
            if (fieldName.name != undefined)
                data.inserting.field_show_names = fieldName.name;
            else
                data.inserting.field_show_names = "";
            if (fieldName.trueEntity != undefined)
                data.inserting.trueEntity = fieldName.trueEntity;
            else
                data.inserting.trueEntity = undefined;
        }
        if (hint_fields.form.selected('entities') != null) {
            if (hint_fields.form.selected('entities').name != undefined)
                data.inserting.entities_name = hint_fields.form.selected('entities').name;
            else
                data.inserting.entities_name = "";
        }
        BASEAPI.first('hint_fields', {
            where: [
                {
                    field: "entities",
                    value: hint_fields.entities
                },
                {
                    field: "field_names",
                    value: hint_fields.field_names
                }
            ]
        }, function (result) {
            console.log(result);
            if (result) {
                SWEETALERT.show({message: "Ya existe un registro creado con este campo"})
            } else {
                resolve(true);
            }
        });

        // SWEETALERT.confirm({
        //     type: "warning",
        //     title: "Deseas añadir este cambio?",
        //     message: "Este cambio reiniciar el sistema por favor espere...",
        //     confirm: function () {
        //         BASEAPI.ajax.get("/files/restart/",{},function(){
        //             setTimeout(() => {
        //                 location.reload();
        //             }, 5000);

        //         });
        //     }
        // });
    });
    //
    // hint_fields.triggers.table.after.update = function (data) {
    //     //console.log(`$scope.triggers.table.after.update ${$scope.modelName}`);
    // };
    hint_fields.triggers.table.before.update = (data) => new Promise((resolve, reject) => {
        var fieldName = hint_fields.form.options.field_names.data.filter(d => {
            return d.entity === hint_fields.entities && d.id === hint_fields.field_names
        })[0];
        if (hint_fields.form.selected('field_names') != null) {
            if (fieldName.cousin != undefined)
                data.updating.cousin = fieldName.cousin;
            else
                data.updating.cousin = null;
            if (fieldName.name != undefined)
                data.updating.field_show_names = fieldName.name;
            else
                data.updating.field_show_names = "";
            if (fieldName.trueEntity != undefined)
                data.updating.trueEntity = fieldName.trueEntity;
            else
                data.updating.trueEntity = null;
        }
        if (hint_fields.form.selected('entities') != null) {
            if (hint_fields.form.selected('entities').name != undefined)
                data.updating.entities_name = hint_fields.form.selected('entities').name;
            else
                data.updating.entities_name = "";
        }
        // SWEETALERT.confirm({
        //     type: "warning",
        //     title: "Deseas realizar este cambio?",
        //     message: "Este cambio reiniciar el sistema por favor espere...",
        //     confirm: function () {
        //         BASEAPI.ajax.get("/files/restart/",{},function(){
        //             setTimeout(() => {
        //                 location.reload();
        //             }, 5000);
        resolve(true);
        //         });
        //     }
        // });

    });
    //
    // hint_fields.triggers.table.after.control = function (data) {
    //     //console.log(`$scope.triggers.table.before.control ${$scope.modelName} ${data}`);
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