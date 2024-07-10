app.controller("ws_connection_field", function ($scope, $http, $compile) {
    ws_connection_field = this;
    //ws_connection_field.fixFilters = [];
    //ws_connection_field.singular = "singular";
    //ws_connection_field.plural = "plural";
    //ws_connection_field.headertitle = "Hola Title";
    //ws_connection_field.destroyForm = false;
    //ws_connection_field.permissionTable = "tabletopermission";
    RUNCONTROLLER("ws_connection_field", ws_connection_field, $scope, $http, $compile);
    ws_connection_field.formulary = function (data, mode, defaultData) {
        if (ws_connection_field !== undefined) {
            RUN_B("ws_connection_field", ws_connection_field, $scope, $http, $compile);
            ws_connection_field.form.modalWidth = ENUM.modal.width.full;
            ws_connection_field.form.readonly = {};
            ws_connection_field.createForm(data, mode, defaultData);
            $scope.$watch("ws_connection_field.name", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(ws_connection_field, 'name', rules);
            });
            //ms_product.selectQueries['ws_connection'] = [
            //    {
                //    field: 'id',
                //    operator: '!=',
                //    value: -1
            //    }
            //];
            $scope.$watch("ws_connection_field.ws_connection", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(ws_connection_field, 'ws_connection', rules);
            });
            $scope.$watch("ws_connection_field.resultPath", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(ws_connection_field, 'resultPath', rules);
            });
            $scope.$watch("ws_connection_field.calcs", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(ws_connection_field, 'calcs', rules);
            });
            //ms_product.selectQueries['ws_periods'] = [
            //    {
                //    field: 'id',
                //    operator: '!=',
                //    value: -1
            //    }
            //];
            $scope.$watch("ws_connection_field.ws_periods", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(ws_connection_field, 'ws_periods', rules);
            });
        }
    };
    // $scope.triggers.table.after.load = function (records) {
    //     //console.log(`$scope.triggers.table.after.load ${$scope.modelName}`);
    // };
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
    // $scope.triggers.table.after.insert = function (data) {
    //     //console.log(`$scope.triggers.table.after.insert ${$scope.modelName}`);
    //     return true;
    // };
    // $scope.triggers.table.before.insert = (data) => new Promise((resolve, reject) => {
    //     //console.log(`$scope.triggers.table.before.insert ${$scope.modelName}`);
    //     resolve(true);
    // });
    //
    // $scope.triggers.table.after.update = function (data) {
    //     //console.log(`$scope.triggers.table.after.update ${$scope.modelName}`);
    // };
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