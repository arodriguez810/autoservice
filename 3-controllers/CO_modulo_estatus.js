app.controller("modulo_estatus", function ($scope, $http, $compile) {
    modulo_estatus = this;
    //modulo_estatus.fixFilters = [];
    modulo_estatus.session = new SESSION().current();
    modulo_estatus.fixFilters = [];
    modulo_estatus.evalDrowndowns = ["estatus_posterior", "rol_permite", "rol_permite_full"];
    //modulo_estatus.singular = "singular";
    //modulo_estatus.plural = "plural";
    //modulo_estatus.headertitle = "Hola Title";
    modulo_estatus.destroyForm = false;
    //modulo_estatus.permissionTable = "tabletopermission";
    RUNCONTROLLER("modulo_estatus", modulo_estatus, $scope, $http, $compile);
    RUN_B("modulo_estatus", modulo_estatus, $scope, $http, $compile);
    modulo_estatus.$scope.$watch("modulo_estatus.modulo_entidad_diagram", function (value) {
        var rules = [];
        //rules here
        // rules.push(VALIDATION.general.required(value));
        VALIDATION.validate(modulo_estatus, 'modulo_entidad_diagram', rules);
    });
    modulo_estatus.formulary = async function (data, mode, defaultData, view) {
        if (modulo_estatus !== undefined) {
            RUN_B("modulo_estatus", modulo_estatus, $scope, $http, $compile);
            modulo_estatus.form.modalWidth = ENUM.modal.width.full;
            modulo_estatus.form.readonly = {};
            modulo_estatus.form.titles = {
                new: "Agregar estatus",
                edit: "Editar estatus",
                view: "Ver estatus"
            };
            SWEETALERT.loading({message: MESSAGE.ic('mono.procesing')});
            modulo_estatus.estatus_posterior = [];
            modulo_estatus.rol_permite = [];
            modulo_estatus.rol_permite_full = [];
            modulo_estatus.estatus_list = await BASEAPI.listp('modulo_estatus', {
                limit: 0
            });
            modulo_estatus.estatus_list = modulo_estatus.estatus_list.data;
            if (!modulo_estatus.roles_list) {
                modulo_estatus.roles_list = await BASEAPI.listp('group', {
                    limit: 0
                });
                modulo_estatus.roles_list = modulo_estatus.roles_list.data;
            }
            modulo_estatus.refreshAngular();
            modulo_estatus.createForm(data, mode, defaultData, view, () => {
                if (mode === 'edit') {
                    modulo_estatus.estatus_list = modulo_estatus.estatus_list.filter(d => {
                        return d.id != modulo_estatus.id
                    });
                    modulo_estatus.loaded = false;
                    modulo_estatus.loaded_entidad = false;
                }
                SWEETALERT.stop();
            });
            $scope.$watch("modulo_estatus.tipo_estatus", function (value) {
                var rules = [];
                //rules here
                rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(modulo_estatus, 'tipo_estatus', rules);
            });
            $scope.$watch("modulo_estatus.modulo_entidad", function (value) {
                var rules = [];
                //rules here
                if (value){
                    modulo_estatus.estatus_list_drp = modulo_estatus.estatus_list.filter(d=> d.modulo_entidad== value);
                }
                rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(modulo_estatus, 'modulo_entidad', rules);
            });
            $scope.$watch("modulo_estatus.icon", function (value) {
                var rules = [];
                //rules here
                rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(modulo_estatus, 'icon', rules);
            });
            $scope.$watch("modulo_estatus.nombre", function (value) {
                var rules = [];
                //rules here
                rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(modulo_estatus, 'nombre', rules);
            });
            $scope.$watch("modulo_estatus.descripcion", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(modulo_estatus, 'descripcion', rules);
            });
            $scope.$watch("modulo_estatus.estatus_posterior", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(modulo_estatus, 'estatus_posterior', rules);
            });
            $scope.$watch("modulo_estatus.rol_permite", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(modulo_estatus, 'rol_permite', rules);
            });
            $scope.$watch("modulo_estatus.rol_permite_full", function (value) {
                var rules = [];
                //rules here
                //rules.push(VALIDATION.general.required(value));
                VALIDATION.validate(modulo_estatus, 'rol_permite_full', rules);
            });
        }
    };
    modulo_estatus.downloadDiagram = () => {
        let image = modulo_estatus.myDiagram.makeImage({
            scale: 1
        });
        var a = document.createElement("a"); //Create <a>
        a.href = image.src; //Image Base64 Goes here
        a.download = "Flujo de Trabajo - Catálogo de Bienes y Servicios.png";
        a.click();
    };
    modulo_estatus.diagram = () => {
        modulo_estatus.modal.modalView("modulo_estatus/diagram", {
            width: 'modal-full',
            header: {
                title: "Vista del Flujo de Trabajo",
                icon: "icon-repo-forked"
            },
            footer: {
                cancelButton: false
            },
            content: {
                loadingContentText: MESSAGE.i('actions.Loading'),
                sameController: 'modulo_estatus',
            },
            event: {
                show: {
                    end: async function (data) {
                        modulo_estatus.from_node = false;
                        SWEETALERT.loading({message: "Cargando Diagrama"});
                        let entidad = await BASEAPI.firstp('modulo_entidad', {
                            order: "asc",
                        });
                        modulo_estatus.statusList_diagram = await BASEAPI.listp('modulo_estatus', {
                            limit: 0,
                            orderby: "modulo_entidad",
                            order: "asc",
                            where: [
                                {
                                    "field": "modulo_entidad",
                                    "value": entidad.id
                                }
                            ]
                        });
                        modulo_estatus.statusList_diagram = modulo_estatus.statusList_diagram.data;
                        setTimeout(async function () {
                            const $$$ = go.GraphObject.make;
                            let statusList = modulo_estatus.statusList_diagram;
                            let thejson = {
                                class: "go.GraphLinksModel",
                                "nodeKeyProperty": "id",
                                "nodeDataArray": [],
                                "linkDataArray": []
                            };

                            statusList.forEach((d) => {
                                let item = {
                                    "id": d.id,
                                    "text": d.nombre
                                };
                                if (d.tipo_estatus === 1)
                                    item.type = "Start";
                                else if (d.tipo_estatus === 3)
                                    item.type = "End";
                                thejson.nodeDataArray.push(item);
                                thejson.nodeDataArray.push({
                                    "id": d.id * -1,
                                    "text": d.descripcion,
                                    "category": "Comment"
                                });
                                thejson.linkDataArray.push({"from": d.id, "to": d.id * -1, "category": "Comment"});
                            });
                            statusList.forEach((d) => {
                                let posteriores = eval(d.estatus_posterior);
                                posteriores.forEach((e) => {
                                    let posterior = statusList.filter(f => f.id === e)[0];
                                    if (posterior) {
                                        let isprogress = true;
                                        if (d.tipo_estatus === 3)
                                            isprogress = false;
                                        let item = {
                                            "from": d.id,
                                            "to": e,
                                            "progress": isprogress,
                                            "text": posterior.action
                                        };
                                        thejson.linkDataArray.push(item);
                                    }
                                });
                            });


                            modulo_estatus.myDiagram = new go.Diagram(
                                'myDiagramDiv', // must name or refer to the DIV HTML element
                                {
                                    'animationManager.initialAnimationStyle': go.AnimationStyle.None,
                                    InitialAnimationStarting: (e) => {
                                        var animation = e.subject.defaultAnimation;
                                        animation.easing = go.Animation.EaseOutExpo;
                                        animation.duration = 800;
                                        animation.add(e.diagram, 'scale', 0.3, 1);
                                        animation.add(e.diagram, 'opacity', 0, 1);
                                    },

                                    // have mouse wheel events zoom in and out instead of scroll up and down
                                    'toolManager.mouseWheelBehavior': go.WheelMode.Zoom,
                                    // enable undo & redo
                                    'undoManager.isEnabled': true,
                                    layout: new go.LayeredDigraphLayout({
                                        layerSpacing: 100,
                                        columnSpacing: 100,
                                        direction: 90,
                                        setsPortSpot: false,
                                        setsChildPortSpot: false,
                                        arrangement: go.TreeArrangement.Horizontal,
                                    }),
                                }
                            );
                            const colors = {
                                pink: '#facbcb',
                                blue: '#b7d8f7',
                                green: '#b9e1c8',
                                yellow: '#faeb98',
                                background: '#e8e8e8',
                            };
                            modulo_estatus.myDiagram.div.style.backgroundColor = colors.background;
                            modulo_estatus.myDiagram.nodeTemplate = new go.Node('Auto', {
                                doubleClick: modulo_estatus.nodeClicked,
                                isShadowed: true,
                                shadowBlur: 0,
                                shadowOffset: new go.Point(5, 5),
                                shadowColor: 'black',
                            }).bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify).add(
                                new go.Shape('RoundedRectangle', {
                                    strokeWidth: 1.5,
                                    fill: colors.blue,
                                }).bind('fill', 'type', (type) => {
                                    if (type === 'Start') return colors.green;
                                    if (type === 'End') return colors.pink;
                                    return colors.blue;
                                }).bind('figure', 'type', (type) => {
                                    return 'RoundedRectangle';
                                }),
                                new go.TextBlock({
                                    shadowVisible: false,
                                    margin: 8,
                                    font: 'bold 14px sans-serif',
                                    stroke: '#333',
                                }).bind('text')
                            );

                            // replace the default Link template in the linkTemplateMap
                            modulo_estatus.myDiagram.linkTemplate = new go.Link(
                                {
                                    isShadowed: true,
                                    shadowBlur: 0,
                                    shadowColor: 'black',
                                    shadowOffset: new go.Point(2.5, 2.5),
                                    curve: go.Curve.Bezier,
                                    curviness: 40,
                                    adjusting: go.LinkAdjusting.Stretch,
                                    reshapable: true,
                                    relinkableFrom: true,
                                    relinkableTo: true,
                                    fromShortLength: 8,
                                    toShortLength: 10,
                                }).bindTwoWay('points').bind('curviness').add(
                                new go.Shape({strokeWidth: 2, shadowVisible: false, stroke: 'black'})
                                    .bind('strokeDashArray', 'progress', (progress) => (progress ? [] : [5, 6]))
                                    .bind('opacity', 'progress', (progress) => (progress ? 1 : 0.5)),
                                new go.Shape({
                                    fromArrow: 'circle',
                                    strokeWidth: 1.5,
                                    fill: 'white'
                                }).bind('opacity', 'progress', (progress) => (progress ? 1 : 0.5)),
                                new go.Shape({
                                    toArrow: 'standard',
                                    stroke: null,
                                    scale: 1.5,
                                    fill: 'black'
                                }).bind('opacity', 'progress', (progress) => (progress ? 1 : 0.5)),
                                new go.Panel('Auto').add(
                                    new go.Shape('RoundedRectangle', {
                                        shadowVisible: true,
                                        fill: colors.yellow,
                                        strokeWidth: 0.5,
                                    }),
                                    new go.TextBlock(
                                        {
                                            font: '9pt helvetica, arial, sans-serif',
                                            margin: 1,
                                            editable: false, // enable in-place editing
                                        }
                                    ).bind('text')
                                )
                            );

                            modulo_estatus.myDiagram.nodeTemplateMap.add(
                                'Comment',
                                $$$(go.Node, // this needs to act as a rectangular shape for BalloonLink,
                                    {background: 'lightyellow'}, // which can be accomplished by setting the background.
                                    $$$(go.TextBlock, {
                                        font: 'bold 14px sans-serif',
                                        stroke: 'brown',
                                        margin: 3,
                                        maxSize: new go.Size(200, 200)
                                    }, new go.Binding('text'))
                                )
                            );

                            modulo_estatus.myDiagram.linkTemplateMap.add(
                                'Comment',
                                // if the BalloonLink class has been loaded from the Extensions directory, use it
                                $$$(typeof BalloonLink === 'function' ? BalloonLink : go.Link,
                                    $$$(go.Shape, // the Shape.geometry will be computed to surround the comment node and
                                        // point all the way to the commented node
                                        {stroke: 'brown', strokeWidth: 1, fill: 'lightyellow'}
                                    )
                                )
                            );
                            modulo_estatus.myDiagram.addDiagramListener("BackgroundDoubleClicked", function (ev) {
                                MODAL.close()
                                modulo_estatus.from_node = true;
                                modulo_estatus.formulary(null,'new');
                            });

                            modulo_estatus.myDiagram.commandHandler.deleteSelection = function() { // must be a function, not an arrow =>
                                modulo_estatus.delete_node();
                            };

                            // read in the JSON data from the "mySavedModel" element
                            modulo_estatus.myDiagram.model = go.Model.fromJson(JSON.stringify(thejson));
                            SWEETALERT.stop();
                        }, 1000)
                    }
                }
            }
        });
    }
    modulo_estatus.nodeClicked = function(e, obj) {
        // executed by click and doubleclick handlers
        MODAL.close()
        modulo_estatus.from_node = true;
        modulo_estatus.formulary({
            where: [{
                field: eval(`CRUD_${modulo_estatus.modelName}`).table.key,
                value: eval(`obj.Qt.${eval(`CRUD_${modulo_estatus.modelName}`).table.key}`)
            }]
        }, FORM.modes.edit, {});
    }

    modulo_estatus.delete_node = function (){
        let node = modulo_estatus.myDiagram.selection.first();
        if (node instanceof go.Node && node.Qt.category !== "Comment")
        SWEETALERT.confirm({
            message: MESSAGE.i('alerts.AYSDelete'),
            confirm: async function () {

                SWEETALERT.loading({message: MESSAGE.ic('mono.deleting') + "..."});
                await BASEAPI.deleteallp('modulo_estatus',[
                    {
                        field: "id",
                        value: node.Qt.id
                    }
                ]);
                modulo_estatus.refresh();
                await modulo_estatus.reload_diagram();
            }
        });
    }

    modulo_estatus.reload_diagram = async function (){
        SWEETALERT.loading({message: "Cargando Diagrama"});
        modulo_estatus.myDiagram.div = null;
        modulo_estatus.myDiagram = null;
        modulo_estatus.statusList_diagram = await BASEAPI.listp('modulo_estatus', {
            limit: 0,
            orderby: "modulo_entidad",
            order: "asc",
            where: [
                {
                    "field": "modulo_entidad",
                    "value": modulo_estatus.modulo_entidad_diagram
                }
            ]
        });
        modulo_estatus.statusList_diagram = modulo_estatus.statusList_diagram.data;
        setTimeout(async function () {
            const $$$ = go.GraphObject.make;
            let statusList = modulo_estatus.statusList_diagram;
            let thejson = {
                class: "go.GraphLinksModel",
                "nodeKeyProperty": "id",
                "nodeDataArray": [],
                "linkDataArray": []
            };

            statusList.forEach((d) => {
                let item = {
                    "id": d.id,
                    "text": d.nombre
                };
                if (d.tipo_estatus === 1)
                    item.type = "Start";
                else if (d.tipo_estatus === 3)
                    item.type = "End";
                thejson.nodeDataArray.push(item);
                thejson.nodeDataArray.push({
                    "id": d.id * -1,
                    "text": d.descripcion,
                    "category": "Comment"
                });
                thejson.linkDataArray.push({"from": d.id, "to": d.id * -1, "category": "Comment"});
            });
            statusList.forEach((d) => {
                let posteriores = eval(d.estatus_posterior);
                posteriores.forEach((e) => {
                    let posterior = statusList.filter(f => f.id === e)[0];
                    if (posterior) {
                        let isprogress = true;
                        if (d.tipo_estatus === 3)
                            isprogress = false;
                        let item = {
                            "from": d.id,
                            "to": e,
                            "progress": isprogress,
                            "text": posterior.action
                        };
                        thejson.linkDataArray.push(item);
                    }
                });
            });


            modulo_estatus.myDiagram = new go.Diagram(
                'myDiagramDiv', // must name or refer to the DIV HTML element
                {
                    'animationManager.initialAnimationStyle': go.AnimationStyle.None,
                    InitialAnimationStarting: (e) => {
                        var animation = e.subject.defaultAnimation;
                        animation.easing = go.Animation.EaseOutExpo;
                        animation.duration = 800;
                        animation.add(e.diagram, 'scale', 0.3, 1);
                        animation.add(e.diagram, 'opacity', 0, 1);
                    },

                    // have mouse wheel events zoom in and out instead of scroll up and down
                    'toolManager.mouseWheelBehavior': go.WheelMode.Zoom,
                    // enable undo & redo
                    'undoManager.isEnabled': true,
                    layout: new go.LayeredDigraphLayout({
                        layerSpacing: 100,
                        columnSpacing: 100,
                        direction: 90,
                        setsPortSpot: false,
                        setsChildPortSpot: false,
                        arrangement: go.TreeArrangement.Horizontal,
                    }),
                }
            );
            const colors = {
                pink: '#facbcb',
                blue: '#b7d8f7',
                green: '#b9e1c8',
                yellow: '#faeb98',
                background: '#e8e8e8',
            };
            modulo_estatus.myDiagram.div.style.backgroundColor = colors.background;
            modulo_estatus.myDiagram.nodeTemplate = new go.Node('Auto', {
                doubleClick: modulo_estatus.nodeClicked,
                isShadowed: true,
                shadowBlur: 0,
                shadowOffset: new go.Point(5, 5),
                shadowColor: 'black',
            }).bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify).add(
                new go.Shape('RoundedRectangle', {
                    strokeWidth: 1.5,
                    fill: colors.blue,
                }).bind('fill', 'type', (type) => {
                    if (type === 'Start') return colors.green;
                    if (type === 'End') return colors.pink;
                    return colors.blue;
                }).bind('figure', 'type', (type) => {
                    return 'RoundedRectangle';
                }),
                new go.TextBlock({
                    shadowVisible: false,
                    margin: 8,
                    font: 'bold 14px sans-serif',
                    stroke: '#333',
                }).bind('text')
            );

            // replace the default Link template in the linkTemplateMap
            modulo_estatus.myDiagram.linkTemplate = new go.Link(
                {
                    isShadowed: true,
                    shadowBlur: 0,
                    shadowColor: 'black',
                    shadowOffset: new go.Point(2.5, 2.5),
                    curve: go.Curve.Bezier,
                    curviness: 40,
                    adjusting: go.LinkAdjusting.Stretch,
                    reshapable: true,
                    relinkableFrom: true,
                    relinkableTo: true,
                    fromShortLength: 8,
                    toShortLength: 10,
                }).bindTwoWay('points').bind('curviness').add(
                new go.Shape({strokeWidth: 2, shadowVisible: false, stroke: 'black'})
                    .bind('strokeDashArray', 'progress', (progress) => (progress ? [] : [5, 6]))
                    .bind('opacity', 'progress', (progress) => (progress ? 1 : 0.5)),
                new go.Shape({
                    fromArrow: 'circle',
                    strokeWidth: 1.5,
                    fill: 'white'
                }).bind('opacity', 'progress', (progress) => (progress ? 1 : 0.5)),
                new go.Shape({
                    toArrow: 'standard',
                    stroke: null,
                    scale: 1.5,
                    fill: 'black'
                }).bind('opacity', 'progress', (progress) => (progress ? 1 : 0.5)),
                new go.Panel('Auto').add(
                    new go.Shape('RoundedRectangle', {
                        shadowVisible: true,
                        fill: colors.yellow,
                        strokeWidth: 0.5,
                    }),
                    new go.TextBlock(
                        {
                            font: '9pt helvetica, arial, sans-serif',
                            margin: 1,
                            editable: false, // enable in-place editing
                        }
                    ).bind('text')
                )
            );

            modulo_estatus.myDiagram.nodeTemplateMap.add(
                'Comment',
                $$$(go.Node, // this needs to act as a rectangular shape for BalloonLink,
                    {background: 'lightyellow'}, // which can be accomplished by setting the background.
                    $$$(go.TextBlock, {
                        font: 'bold 14px sans-serif',
                        stroke: 'brown',
                        margin: 3,
                        maxSize: new go.Size(200, 200)
                    }, new go.Binding('text'))
                )
            );

            modulo_estatus.myDiagram.linkTemplateMap.add(
                'Comment',
                // if the BalloonLink class has been loaded from the Extensions directory, use it
                $$$(typeof BalloonLink === 'function' ? BalloonLink : go.Link,
                    $$$(go.Shape, // the Shape.geometry will be computed to surround the comment node and
                        // point all the way to the commented node
                        {stroke: 'brown', strokeWidth: 1, fill: 'lightyellow'}
                    )
                )
            );

            modulo_estatus.myDiagram.addDiagramListener("BackgroundDoubleClicked", function (ev) {
                MODAL.close()
                modulo_estatus.from_node = true;
                modulo_estatus.formulary(null,'new');
            });

            modulo_estatus.myDiagram.commandHandler.deleteSelection = function() { // must be a function, not an arrow =>
                modulo_estatus.delete_node();
            };

            // read in the JSON data from the "mySavedModel" element
            modulo_estatus.myDiagram.model = go.Model.fromJson(JSON.stringify(thejson));
            SWEETALERT.stop();
        }, 1000)
    }
    // $scope.triggers.table.after.load = function (records) {
    //     //console.log(`$scope.triggers.table.after.load ${$scope.modelName}`);
    // };
    modulo_estatus.triggers.table.before.load = () => new Promise(async (resolve, reject) => {
        SWEETALERT.loading({message: "Procesando flujo de trabajo"});
        //console.log(`$scope.triggers.table.before.load ${$scope.modelName}`);
        modulo_estatus.statusList = await BASEAPI.listp('modulo_estatus', {
            limit: 0,
            orderby: "tipo_estatus, nombre",
            order: "asc",
        });
        modulo_estatus.statusList = modulo_estatus.statusList.data;
        modulo_estatus.statusList_simple = {};
        modulo_estatus.statusList.forEach(d => {
            modulo_estatus.statusList_simple[d.id] = d.nombre;
        });
        if (!modulo_estatus.roleList) {
            modulo_estatus.roleList = await BASEAPI.listp('group', {
                limit: 0
            });
            modulo_estatus.roleList = modulo_estatus.roleList.data;
            modulo_estatus.roleList_simple = {};
            modulo_estatus.roleList.forEach(d => {
                modulo_estatus.roleList_simple[d.id] = d.name;
            });
        }
        setTimeout(() => {
            SWEETALERT.stop();
        }, 500);
        resolve(true);
    });
    //
    // $scope.triggers.table.after.open = function (data) {
    //     //console.log(`$scope.triggers.table.after.open ${$scope.modelName}`);
    // };
    // $scope.triggers.table.before.open = () => new Promise((resolve, reject) => {
    //     //console.log(`$scope.triggers.table.before.open ${$scope.modelName}`);
    //     resolve(true);
    // });
    //
    modulo_estatus.triggers.table.after.close = function (data) {
        if (modulo_estatus.from_node){
            setTimeout(function(){
                modulo_estatus.diagram();
            },100)
        }
        //console.log(`$scope.triggers.table.after.close ${$scope.modelName}`);
    };
    // $scope.triggers.table.before.close = () => new Promise((resolve, reject) => {
    //     //console.log(`$scope.triggers.table.before.close ${$scope.modelName}`);
    //     resolve(true);
    // });
    //
    // $scope.triggers.table.after.insert = function (data) {
    //     //console.log(`$scope.triggers.table.after.insert ${$scope.modelName}`);
    //     return true;
    // };
    modulo_estatus.triggers.table.before.insert = (data) => new Promise((resolve, reject) => {
        //console.log(`$scope.triggers.table.before.insert ${$scope.modelName}`);
        console.log(data);
        ["estatus_posterior", "rol_permite", "rol_permite_full"].forEach(d => {
            if (Array.isArray(modulo_estatus[d]))
                modulo_estatus[d] = "[" + modulo_estatus[d].join(",") + "]";
        });
        data.inserting.estatus_posterior = modulo_estatus.estatus_posterior || "[]";
        data.inserting.rol_permite = modulo_estatus.rol_permite || "[]";
        data.inserting.rol_permite_full = modulo_estatus.rol_permite_full || "[]";
        resolve(true);
    });
    //
    // $scope.triggers.table.after.update = function (data) {
    //     //console.log(`$scope.triggers.table.after.update ${$scope.modelName}`);
    // };
    modulo_estatus.triggers.table.before.update = (data) => new Promise((resolve, reject) => {
        //console.log(`$scope.triggers.table.before.update ${$scope.modelName}`);
        console.log(data);
        ["estatus_posterior", "rol_permite", "rol_permite_full"].forEach(d => {
            if (Array.isArray(modulo_estatus[d]))
                modulo_estatus[d] = "[" + modulo_estatus[d].join(",") + "]";
        });
        data.updating.estatus_posterior = modulo_estatus.estatus_posterior || "[]";
        data.updating.rol_permite = modulo_estatus.rol_permite || "[]";
        data.updating.rol_permite_full = modulo_estatus.rol_permite_full || "[]";
        resolve(true);
    });
    //
    modulo_estatus.triggers.table.after.control = function (data) {
        if (data === 'tipo_estatus' && modulo_estatus.form.mode === 'edit' && !modulo_estatus.loaded){
            modulo_estatus.tipo_estatus = modulo_estatus.tipo_estatus + "";
            modulo_estatus.form.loadDropDown('tipo_estatus');
            modulo_estatus.loaded = true;
        }
        if (data === 'modulo_entidad' && modulo_estatus.form.mode === 'edit' && !modulo_estatus.loaded_entidad){
            if (modulo_estatus.form.options.solicitud_documentofile.folder_construct){
                var root = `${modulo_estatus.modelName}`;
                for(var folders of modulo_estatus.form.options.solicitud_documentofile.folder_construct){
                    root += `/${eval(`modulo_estatus.${folders}`)}`;
                }
                modulo_estatus.form.options.solicitud_documentofile.old_rootfolder = root;
                modulo_estatus.form.options.solicitud_documentofile.new_rootfolder = root;
            }
            modulo_estatus.modulo_entidad = modulo_estatus.modulo_entidad + "";
            modulo_estatus.form.loadDropDown('tipo_estatus');
            modulo_estatus.loaded_entidad = true;
        }
        //console.log(`$scope.triggers.table.after.control ${$scope.modelName} ${data}`);
    };
    // $scope.triggers.table.before.control = function (data) {
    //     //console.log(`$scope.triggers.table.before.control ${$scope.modelName} ${data}`);
    // };
    //$scope.beforeDelete = function (data) {
    //    return false;
    //};
    //$scope.afterDelete = function (data) {
    //};

});