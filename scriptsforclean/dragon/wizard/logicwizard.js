LOGIC_WIZARD = function (enity) {

        var entityList = BASEAPI.list('wizard', {}, function(result){

        console.log(enity);
        baseController.currentModel.wizard_steps = [];

        let sup = 1;
        baseController.currentModel.wizard_steps.push([]);
        let limit = CONFIG.wizardlimit;
        let index = 1;
        for (let item of result.data) {
            // console.log(item);
            ARRAY.last(baseController.currentModel.wizard_steps).push({name: item.name, index: index, complete: item.complete, label: MESSAGE.ic("columns." + item.name)});
            index++;
            if((sup%limit) === 0)
                baseController.currentModel.wizard_steps.push([]);
            sup++;
        }



        for (let i = 0; i < result.data.length; i++) {
            //console.log(result.data[i]);
            if(result.data[i].complete == "false") {
                //if (result.data[i].cant_records_require > result.data[i].count) {
                //console.log("Alo");
                baseController.currentModel.controller = result.data[i].name;
                baseController.currentModel.cant_records_require = result.data[i].cant_records_require;
                baseController.currentModel.count = result.data[i].count;
                baseController.currentModel.controller_id = result.data[i].id;
                baseController.currentModel.require_data = result.data[i].require;
                break;
            }



        }

        console.log(baseController.currentModel.require_data);
        if (baseController.currentModel.require_data == 0) {
            console.log("Igual a 0");
        }

        // baseController.currentModel.nextElement = [];
        // for (let i = 0; i < result.data.length; i++) {
        //     console.log(result.data[i].name);
        //     baseController.currentModel.nextElement.push(result.data[i].name);
        // }

        //console.log(baseController.currentModel.require_data);

        if (enity != undefined) {
            baseController.currentModel.controller = enity;
        }

        let modal = {
            width: 'modal-full',
            header: {
                title: MESSAGE.ic("columns." + baseController.currentModel.controller),
                icon: ''
            },
            footer: {
                cancelButton: true
            },
            content: {
                loadingContentText: MESSAGE.i('actions.Loading'),
                sameController: baseController.currentModel.controller
            },
            event: {
                show: {
                    begin: function (data) {

                    },
                    end: function(data) {
                        $('.remtop').remove();
                        baseController.currentModel.htmlButon = '<button dragonlanguage="" title="Siguiente" type="button" role="button" class=" btn bg-success-800 btn-labeled btn-xs pull-right rem" ng-click="baseController.currentModel.nextC()"><b><i class="icon-arrow-right7"></i></b><language>Siguiente</language></button>';

                        baseController.currentModel.htmlButonNoRequire = '<button dragonlanguage="" title="Siguiente" type="button" role="button" class=" btn bg-success-800 btn-labeled btn-xs pull-right rem" ng-click="baseController.currentModel.nextR(baseController.currentModel.controller)"><b><i class="icon-arrow-right7"></i></b><language>Siguiente (boton no requerido)</language></button>';

                        baseController.currentModel.htmlButonComplete = '<button dragonlanguage="" title="Completar" type="button" role="button" class=" btn bg-success-800 btn-labeled btn-xs pull-right rem" ng-click="baseController.currentModel.modelComplete()"><b><i class="icon-checkmark"></i></b><language>Completar</language></button>';

                        baseController.currentModel.htmlView = '<button dragonlanguage="" title="Ver resumen" type="button" role="button" class=" btn bg-success-800 btn-labeled btn-xs pull-right remtop" ng-click="baseController.currentModel.viewAllEntity(baseController.currentModel.controller)"><b><i class="icon-arrow-right7"></i></b><language>Ver resumen</language></button>';

                        // baseController.currentModel.htmlSteps = `<ul class="remtop" ng-repeat="(key,row) in baseController.currentModel.wizard_steps">
                        //             <li  class="pointer ponterextra" ng-repeat="(inx, element) in row" ng-class="element.name == baseController.currentModel.controller ? 'current' : ''">
                        //             <a ng-click="baseController.currentModel.start_wizard(element.name)">
                        //             <span class="number" ng-class="element.complete == 'true' ? 'complete': ''">{{element.index}} </span>
                        //             {{element.label}}
                        //             </a>
                        //             </li>
                        //             </ul>`;


                        console.log(baseController.currentModel.wizard_steps[0].length);

                        baseController.currentModel.steps_custom = [];
                        // baseController.currentModel.htmlSteps = '<ul class="remtop"> ddd</ul>';
                        var arr = baseController.currentModel.wizard_steps[0];
                        for (let i = 0; i < arr.length; i++) {

                            //console.log(arr[i]);

                            baseController.currentModel.steps_custom.push({
                                name: arr[i].name,
                                index: arr[i].index,
                                complete: arr[i].complete,
                                label: arr[i].label
                            })

                        }

                        console.log(baseController.currentModel.steps_custom);

                        baseController.currentModel.htmlSteps = `<ul class="remtop" ng-repeat="(key,row) in ${baseController.currentModel.steps_custom}">222</ul>`;

                        setTimeout(function () {
                            if (baseController.currentModel.wizard_steps.length !== 0) {
                                $('.modal-body').prepend(baseController.currentModel.returnBuild(baseController.currentModel.htmlSteps));
                                baseController.currentModel.refreshAngular();
                                $(".modal-body").prepend(baseController.currentModel.returnBuild(baseController.currentModel.htmlView));
                            }

                            if (baseController.currentModel.require_data == 0 || baseController.currentModel.require_data == "0") {
                                $('.rem').remove();
                                $('.modal-footer').prepend(baseController.currentModel.returnBuild(baseController.currentModel.htmlButonNoRequire));
                            }
                        }, 100);

                        BASEAPI.list('wizard', {}, function(result){

                            setTimeout( async function () {

                                var requre = await BASEAPI.firstp('wizard', {
                                    "where": [
                                        {
                                            "field": "name",
                                            "operator": "=",
                                            "value": baseController.currentModel.controller
                                        }
                                    ]
                                });

                                var lastentity2 = await BASEAPI.firstp('wizard', {orderby: 'id', order: 'desc'});

                                eval(`${baseController.currentModel.controller}.triggers.table.after.insert = async function (data) {
                                                                                                   
                                    await BASEAPI.updateallp('wizard', {
                                        "count": ${baseController.currentModel.controller}.records.totalCount + 1,
                                         where: [{
                                            "field": "id",
                                            "operator": "=",
                                            "value": ${baseController.currentModel.controller_id}
                                         }]
                                    })
                                    
                                    //console.log(${baseController.currentModel.controller}.records.totalCount);
                                    
                                    var countnumber = await BASEAPI.firstp('wizard', {
                                        "where": [
                                            {
                                                "field": "name",
                                                "operator": "=",
                                                "value": "${baseController.currentModel.controller}"
                                            }
                                        ]
                                    });
                                   
                                    
                                    var lastentity = await BASEAPI.firstp('wizard', {orderby: 'id', order: 'desc'});
                                           
                                    // console.log(countnumber.name);
                                     //console.log(lastentity.name);
                                     console.log(countnumber.require);
                                                                                                            
                                         if (countnumber.count >= countnumber.cant_records_require){
                                           
                                            await BASEAPI.updateallp('wizard', {
                                                "complete": "true",
                                                 where: [{
                                                    "field": "id",
                                                    "operator": "=",
                                                    "value": ${baseController.currentModel.controller_id}
                                                 }]
                                            })
                                            
                                            if (countnumber.name == lastentity.name) {
                                                //$('.rem').remove(); 
                                                   $('.remtop').remove();
                                                $('.modal-footer').prepend(baseController.currentModel.returnBuild(baseController.currentModel.htmlButonComplete));
                                            } else {
                                           
                                                $('.rem').remove();    
                                                $('.modal-footer').prepend(baseController.currentModel.returnBuild(baseController.currentModel.htmlButon));
                                               
                                            }
                                            
                                            
                                         
                                                                                   
                                   }
                               
                                }
                                
                                ${baseController.currentModel.controller}.triggers.table.after.load = async function (records) {
                                    //console.log('delete');
                                        await BASEAPI.updateallp('wizard', {
                                            "count": ${baseController.currentModel.controller}.records.totalCount,
                                             where: [{
                                                "field": "id",
                                                "operator": "=",
                                                "value": ${baseController.currentModel.controller_id}
                                             }]
                                        })
                                        
                                        var countnumber = await BASEAPI.firstp('wizard', {
                                        "where": [
                                            {
                                                "field": "name",
                                                "operator": "=",
                                                "value": "${baseController.currentModel.controller}"
                                            }
                                        ]
                                    });
                                        
                                        if (countnumber.count < countnumber.cant_records_require){
                                            //console.log('Boton 2');
                                            await BASEAPI.updateallp('wizard', {
                                                "complete": "false",
                                                 where: [{
                                                    "field": "id",
                                                    "operator": "=",
                                                    "value": ${baseController.currentModel.controller_id}
                                                 }]
                                            })
                                            
                                           // $('.rem').remove();    
                                        }
                                }
                                
                                `);

                            }, 1000);

                        });
                    }
                }
            }
        };
        baseController.currentModel.modal.modalView(baseController.currentModel.controller, modal);

    });

};

