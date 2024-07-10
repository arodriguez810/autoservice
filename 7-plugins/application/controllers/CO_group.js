app.controller("group", function ($scope, $http, $compile) {
    group = this;
    RUNCONTROLLER("group", group, $scope, $http, $compile);
    group.formulary = function (data, mode, defaultData) {
        if (group !== undefined) {
            RUN_B("group", group, $scope, $http, $compile);
            group.form.schemas.insert = {};
            group.form.schemas.select = {};
            group.form.readonly = {};
            group.createForm(data, mode, defaultData);
            group.$scope.$watch('group.name', function (value) {
                var rules = [];
                rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(group, "name", rules);
            });
        }
    };
    // group.triggers.table.after.insert = function (data) {
    //     //console.log(`$scope.triggers.table.after.insert ${$scope.modelName}`);
    //     BASEAPI.deleteall('a_clone_group',{},async function (result){
    //         if (result) {
    //             var grupos = await BASEAPI.listp('group', {});
    //             BASEAPI.insert('a_clone_group', grupos.data, function (result) {
    //                 console.log(result, grupos.data);
    //             });
    //         }
    //     });
    //     return true;
    // };
    // group.triggers.table.before.update = (data) => new Promise((resolve, reject) => {
    //     //console.log(`$scope.triggers.table.before.update ${$scope.modelName}`);
    //     if (group.gracia)
    //         data.updating.gracia = LAN.money(group.gracia).value;
    //     if (group.repeat)
    //         data.updating.repeat = LAN.money(group.repeat).value;
    //     resolve(true);
    // });
    // group.triggers.table.after.update = function (data) {
    //     //console.log(`$scope.triggers.table.after.update ${$scope.modelName}`);
    //     BASEAPI.deleteall('a_clone_group',{},async function (result){
    //         if (result) {
    //             var grupos = await BASEAPI.listp('group', {});
    //             BASEAPI.insert('a_clone_group', grupos.data, function (result) {
    //                 console.log(result, grupos.data);
    //             });
    //         }
    //     })
    //     return true;
    // };
});