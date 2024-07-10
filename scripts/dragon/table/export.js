EXPORT = {
    run: function ($scope) {
        $scope.export = {};
        $scope.export.importModal = function () {
            var root = `${$scope.modelName}/imports_files/`;
            baseController.viewData = {
                root: root,
                scope: $scope,
                maxfiles: 8,
                acceptedFiles: 'text/csv,application/vnd.ms-excel',
                columns: 4,
            };
            $scope.modal.modalView("templates/components/import", {
                width: 'modal-full',
                header: {
                    title: `${MESSAGE.i('export.Importfilesof')} ${$scope.plural}`,
                    icon: "file-excel"
                },
                footer: {
                    cancelButton: true
                },
                content: {
                    loadingContentText: MESSAGE.i('actions.Loading')
                },
            });
        };
        $scope.export.downloadExample = function () {
            var data = [];
            for (var i in eval(`CRUD_${$scope.modelName}`).table.columns) {
                var column = eval(`CRUD_${$scope.modelName}`).table.columns[i];
                var key = i;
                var alter = column.exportKey !== undefined ? column.exportKey : i;
                if (eval(`CRUD_${$scope.modelName}`).table.columns[key].exportExample !== false) {
                    var exampleText = eval(`CRUD_${$scope.modelName}`).table.columns[key].exportExample;
                    exampleText = exampleText === undefined ? "[string]" : exampleText;
                    data.push({
                        column: alter,
                        value: exampleText
                    });
                }
            }
            var csv = '';
            var labels = [];
            var values = [];
            for (var i in data) {
                var item = data[i];
                labels.push(item.column);
                values.push(item.value);
            }
            csv += labels.join(",") + "\r\n";
            csv += `"${values.join('","')}"\r\n`;
            $scope.export.Preview = $scope.export.jsonToTableExample();
            $scope.modal.simpleModal(`<div style="overflow: auto;height: 500px;width: 100%">${$scope.export.Preview}</div>`,
                {
                    width: "modal-full",
                    header: {title: `${MESSAGE.i('export.Exampletoimportrecords')}`},
                    footer: {
                        buttons: [
                            {
                                color: COLOR.primary + '-600',
                                title: MESSAGE.ic('mono.donwload'),
                                action: function () {
                                    SWEETALERT.loading({title: `${MESSAGE.i('mono.Preparing')}`});
                                    DOWNLOAD.csv(`${MESSAGE.i('export.Exampletoimport')} ${$scope.plural}.csv`, csv);
                                    swal.close();
                                }
                            }
                        ]
                    }
                });
        };
        $scope.export.go = function (type, direct) {
            var parameters = {
                limit: $scope.table.currentLimit,
                page: $scope.table.currentPage,
                orderby: $scope.table.orderby,
                order: $scope.table.order,
                join: eval(`CRUD_${$scope.modelName}`).table.single
            };


            var options = [
                {id: 'firstrow', text: MESSAGE.i('export.ColumnsinFirstRow')},
                {id: 'orderColumn', text: MESSAGE.i('export.ColumnsPosition')},
                {id: 'sort', text: MESSAGE.ic('export.Sort')},
                {id: 'filter', text: MESSAGE.ic('export.Filters')},
                {id: 'currentPage', text: MESSAGE.ic('export.CurrentPage')},
                {id: 'selected', text: MESSAGE.ic('export.Selecteds')},
                {id: 'orginalformat', text: MESSAGE.i('export.OriginalFormat')},
            ];
            var optionsHtml = "";
            options.forEach(function (item) {
                var goChecked = false;
                if (item.id === "selected") {
                    if ($scope.checkAllIcon($scope.checkall) !== "icon-checkbox-unchecked")
                        goChecked = true;
                }
                if (item.id === "sort") {
                    if ((eval(`CRUD_${$scope.modelName}`).table.key || "id") !== parameters.orderby || "asc" !== parameters.order)
                        goChecked = true;
                }
                if (item.id === "orderColumn") {
                    if (STORAGE.hasColumns($scope))
                        goChecked = true;
                }
                if (item.id === "firstrow") {
                    goChecked = true;
                }
                if (item.id === "currentPage") {
                    if ($scope.table.currentPage > 1)
                        goChecked = true;
                }
                if (item.id === "orginalformat") {
                    if (type === "XLS" && !$scope.dontCheck) {
                        goChecked = true;
                    }
                }

                if (item.id === "filter") {
                    if (!DSON.oseaX($scope.filters))
                        if (!DSON.oseaX($scope.filters.lastFilter))
                            if ($scope.filters.lastFilter.length > 0)
                                goChecked = true;
                }


                var checked = goChecked ? 'checked="checked"' : "";
                optionsHtml +=
                    `
                    <div class="checkbox checkbox-switchery">
                        <label style="font-size: 15px">
                            <input type="checkbox" id="${item.id}" class="exportoptions switchery" ${checked}>
                            ${item.text}
                        </label>
                    </div>
                    `
            });
            var columnsHtml = "";
            for (const i in $scope.columns()) {
                var column = $scope.columns()[i];
                var checked = column.visible !== false ? 'checked="checked"' : "";
                if (column.checkExport) {
                    checked = 'checked="checked"';
                }
                if (column.parent) {
                    if (eval(`$scope.columns().${column.parent}.visible`) === false) {
                        checked = ''
                    }
                }
                if (column.export !== false)
                    columnsHtml +=
                        `
                    <div class="checkbox checkbox-switchery">
                        <label style="font-size: 15px">
                            <input type="checkbox" value="${i}" class="switchery exporcolumns" ${checked}>
                            ${$scope.columnLabel(column, i)}
                        </label>
                    </div>`;
            }
            SWEETALERT.buttons(
                {
                    title:
                        `${MESSAGE.ic('mono.export')} ${MESSAGE.i('mono.to')} ${type}`,
                    message:
                        `
                        <div class="row">
								<div class="col-md-12">
									<div class="content-group-lg">
										<p class="content-group">${MESSAGE.i('alerts.ExportedDepends')}</p>
										
									</div>
								</div>
								<div class="col-md-6">
								<h4 style="margin-right: 75px; margin-top: 0px;"><strong>${MESSAGE.ic('mono.export_condition')}</strong></h4>
									<div class="content-group-lg" style="text-align: left">
										${optionsHtml}
									</div>
								</div>
								<div class="col-md-6">
								<h4 style="margin-right: 75px; margin-top: 0px;"><strong>${MESSAGE.ic('mono.export_columns')}</strong></h4>
									<div class="content-group-lg" style="text-align: left">
										${columnsHtml}
									</div>
								</div>
						</div>
                        `,
                    type: " ",
                    class: "width-600"
                },
                [
                    {
                        text: MESSAGE.i('mono.export'),
                        action: function () {
                            if (!$(`#currentPage`).is(':checked')) {
                                parameters.limit = 0;
                                parameters.page = 1;
                            }
                            if (!$(`#sort`).is(':checked')) {
                                parameters.orderby = eval(`CRUD_${$scope.modelName}`).table.key || "id";
                                parameters.order = "asc";
                            }
                            var firstrow = true;
                            if (!$(`#firstrow`).is(':checked')) {
                                firstrow = false;
                            }
                            var orderColumn = true;
                            if (!$(`#orderColumn`).is(':checked')) {
                                orderColumn = false;
                            }
                            var filter = true;
                            if (!$(`#filter`).is(':checked')) {
                                filter = false;
                            }
                            var selected = true;
                            if (!$(`#selected`).is(':checked')) {
                                selected = false;
                            }
                            var orginalformat = true;
                            if (!$(`#orginalformat`).is(':checked')) {
                                orginalformat = false;
                            }

                            var columsAllow = [];
                            var coSel = document.querySelectorAll(".exporcolumns");
                            coSel.forEach(function (item) {
                                if (item.checked)
                                    columsAllow.push(item.value);
                            });
                            SWEETALERT.loading({title: `${MESSAGE.ic('mono.preparing')} ${MESSAGE.ic('mono.file')} ${type}`});
                            $scope.export.json(parameters, type, function (data) {
                                var dataToExport = $scope.formatDataExport(data.data, {
                                    orderColumn: orderColumn,
                                    selected: selected,
                                    orginalformat: orginalformat,
                                    columsAllow: columsAllow,
                                    onerow: direct,
                                    type: type,
                                    filter: filter
                                });


                                if (type === "Clipboard") {
                                    swal.close();
                                    $scope.export.Content = $scope.export.jsonToClipboard(dataToExport, columsAllow, firstrow);
                                    $scope.export.Preview = $scope.export.jsonToTable(dataToExport, columsAllow, firstrow, undefined, undefined, true);
                                    $scope.modal.simpleModal(`<div style="overflow: auto;height: auto;width: 100%">${$scope.export.Preview}</div>`,
                                        {
                                            width: "modal-full",
                                            header: {title: `${MESSAGE.ic('mono.export')} ${type} ${MESSAGE.i('mono.of')} ${dataToExport.length} ${MESSAGE.i('mono.rows')}`},
                                            footer: {
                                                buttons: [
                                                    {
                                                        color: COLOR.primary + '-600',
                                                        title: MESSAGE.ic('mono.copy'),
                                                        action: function () {
                                                            DOWNLOAD.clipboard($scope.export.Content);
                                                            SWEETALERT.show({
                                                                type: "succcess",
                                                                title: `${MESSAGE.ic('mono.copy')} ${dataToExport.length} ${MESSAGE.ic('mono.rows')} ${MESSAGE.i('mono.of')} ${$scope.plural} ${MESSAGE.i('mono.to')} ${type}`,
                                                                close: function () {
                                                                    swal.close();
                                                                }
                                                            });
                                                        }
                                                    }
                                                ]
                                            },
                                            event: {
                                                show: {
                                                    begin: function (data) {
                                                        setTimeout(function () {
                                                            $(".modal-body").css('padding-top', 5);
                                                        }, 500)
                                                    },
                                                    end: function (data) {
                                                        // setTimeout(() => {
                                                        //     if ($(".modal-footer").length < 2) {
                                                        //         let footer = $('.modal-footer');
                                                        //         if (footer.height() > $(window).height()) {
                                                        //             $('.modal-body').prepend($scope.returnBuild(footer.clone()));
                                                        //         }
                                                        //     }
                                                        // }, 1000);
                                                    }
                                                }
                                            }
                                        });
                                    if (direct === true) {
                                        $scope.unCheckAll();
                                    }
                                }
                                if (type === ENUM.file.formats.CSV) {
                                    swal.close();
                                    $scope.export.Content = $scope.export.jsonToCSV(dataToExport, columsAllow, firstrow);
                                    $scope.export.Preview = $scope.export.jsonToTable(dataToExport, columsAllow, firstrow, undefined, undefined, true);
                                    $scope.modal.simpleModal(`<div style="overflow: auto;height: auto;width: 100%">${$scope.export.Preview}</div>`,
                                        {
                                            width: "modal-full",
                                            header: {title: `${MESSAGE.ic('mono.export')} ${MESSAGE.i('mono.to')} ${type} ${MESSAGE.ic('mono.preview')} ${MESSAGE.i('mono.of')} ${dataToExport.length} ${MESSAGE.i('mono.rows')}`},
                                            footer: {
                                                buttons: [
                                                    {
                                                        color: COLOR.primary + '-600',
                                                        title: MESSAGE.ic('mono.download'),
                                                        action: function () {
                                                            DOWNLOAD.csv(`${$scope.plural} ${moment().format("DD-MM-YYYY")}.csv`, $scope.export.Content);
                                                            swal.close();
                                                        }
                                                    }
                                                ]
                                            },
                                            event: {
                                                show: {
                                                    begin: function (data) {
                                                        setTimeout(function () {
                                                            $(".modal-body").css('padding-top', 5);
                                                        }, 500)
                                                    },
                                                    end: function (data) {
                                                        // setTimeout(() => {
                                                        //     if ($(".modal-footer").length < 2) {
                                                        //         let footer = $('.modal-footer');
                                                        //         if (footer.height() > $(window).height()) {
                                                        //             $('.modal-body').prepend($scope.returnBuild(footer.clone()));
                                                        //         }
                                                        //     }
                                                        // }, 1000);
                                                    }
                                                }
                                            }
                                        });
                                }
                                if (type === "PDF") {
                                    swal.close();
                                    $scope.export.Preview = $scope.export.jsonToTable(dataToExport, columsAllow, firstrow, undefined, "table table-print");
                                    $scope.export.ToExport = $scope.export.jsonToTable(dataToExport, columsAllow, firstrow, "500px", "table table-print");
                                    $scope.modal.simpleModal(`<div style="overflow: auto;height: auto;width: 100%">
                                                                        <div id="info-box" class="alert alert-primary alert-styled-left alert-bordered" style="display: ${$scope.show_export_tab ? 'block' : 'none'}; margin-bottom: 5px; padding: 5px 20px;">
                                                                            Sugerencias para exportar o imprimir PDF: <br>
                                                                                a) ir a "Más ajustes" <br>
                                                                                b) poner "Escala" en valor "Personalizado" = a 45% <br>
                                                                                c) en "Opciones" marcar el recuadro de gráficos de fondo
                                                                        </div> 
                                                                        ${$scope.export.Preview}
                                                                    </div>`,
                                        {
                                            width: "modal-full",
                                            header: {title: `${MESSAGE.ic('mono.export')} ${MESSAGE.i('mono.to')} ${type} ${MESSAGE.i('mono.of')} ${dataToExport.length} ${MESSAGE.i('mono.rows')}`},
                                            footer: {
                                                buttons: [
                                                    {
                                                        color: COLOR.primary + '-600',
                                                        title: `${ICON.i('file-pdf')} Download`,
                                                        action: function () {
                                                            //SWEETALERT.loading({title: MESSAGE.ic('mono.downloading') + " PDF..."});


                                                            // var url = $("#dataexport").excelexportjs({
                                                            //     containerid: "dataexport",
                                                            //     datatype: 'table',
                                                            //     worksheetName: `${$scope.plural}`,
                                                            //     returnUri: true
                                                            // });
                                                            // DOWNLOAD.excel(`${$scope.plural} ${moment().format("DD-MM-YYYY")}.pdf`, url);

                                                            $("#dataexport").printThis({
                                                                importCSS: false,                // import parent page css
                                                                loadCSS: "../styles/planificacion/stylePrint.css?node=" + new Date().getTime(),      // path to additional css file - use an array [] for multiple
                                                                printDelay: 333,
                                                            });

                                                            // if (direct) {
                                                            //     BASEAPI.ajax.formpost('/post/templates/pdf/clean',
                                                            //         {
                                                            //             pdf: `${$scope.plural} ${moment().format("DD-MM-YYYY")}.pdf`,
                                                            //             content: $scope.export.Preview
                                                            //         }, function (data) {
                                                            //
                                                            //         });
                                                            // } else {
                                                            //     BASEAPI.ajax.formpost('/post/templates/pdf/table',
                                                            //         {
                                                            //             pdf: `${$scope.plural} ${moment().format("DD-MM-YYYY")}.pdf`,
                                                            //             content: JSON.stringify(dataToExport),
                                                            //             firstrow: firstrow,
                                                            //             columns: JSON.stringify($scope.export.jsonLabels(columsAllow))
                                                            //         }, function (data) {
                                                            //
                                                            //         });
                                                            // }
                                                        }
                                                    }
                                                ]
                                            },
                                            event: {
                                                show: {
                                                    begin: function (data) {
                                                        setTimeout(function () {
                                                            $(".modal-body").css('padding-top', 5);
                                                            $("#info-box").css('width', $('#dataexport').width());
                                                        }, 500)
                                                    },
                                                    end: function (data) {
                                                        // setTimeout(() => {
                                                        //     if ($(".modal-footer").length < 2) {
                                                        //         let footer = $('.modal-footer');
                                                        //         if (footer.height() > $(window).height()) {
                                                        //             $('.modal-body').prepend($scope.returnBuild(footer.clone()));
                                                        //         }
                                                        //     }
                                                        // }, 1000);
                                                    }
                                                }
                                            }
                                        });
                                }
                                if (type === ENUM.file.formats.XLS) {
                                    swal.close();
                                    $scope.export.Content = $scope.export.jsonToCSV(dataToExport, columsAllow, firstrow);
                                    $scope.export.Preview = $scope.export.jsonToTable(dataToExport, columsAllow, firstrow, undefined, undefined, true);
                                    $scope.modal.simpleModal(`<div style="overflow: auto;height: auto;width: 100%">${$scope.export.Preview}</div>`,
                                        {
                                            width: "modal-full",
                                            header: {title: `${MESSAGE.ic('mono.export')} ${MESSAGE.i('mono.to')} ${type} ${MESSAGE.ic('mono.preview')} ${MESSAGE.i('mono.of')} ${dataToExport.length} ${MESSAGE.i('mono.rows')}`},
                                            footer: {
                                                buttons: [
                                                    {
                                                        color: COLOR.primary + '-600',
                                                        title: MESSAGE.ic('mono.download'),
                                                        action: function () {
                                                            var fileName = `${$scope.plural} ${moment().format("DD-MM-YYYY")}.xls`;
                                                            var url = $("#dataexport").excelexportjs({
                                                                containerid: "dataexport",
                                                                datatype: 'table',
                                                                worksheetName: `${$scope.plural} ${dataToExport.length} ${MESSAGE.i('mono.rows')}`,
                                                                returnUri: true
                                                            });
                                                            DOWNLOAD.excel(fileName, url);
                                                            swal.close();
                                                        }
                                                    }
                                                ]
                                            },
                                            event: {
                                                show: {
                                                    begin: function (data) {
                                                        setTimeout(function () {
                                                            $(".modal-body").css('padding-top', 5);
                                                        }, 500)
                                                    },
                                                    end: function (data) {
                                                        // setTimeout(() => {
                                                        //     if ($(".modal-footer").length < 2) {
                                                        //         let footer = $('.modal-footer');
                                                        //         if (footer.height() > $(window).height()) {
                                                        //             $('.modal-body').prepend($scope.returnBuild(footer.clone()));
                                                        //         }
                                                        //     }
                                                        // }, 1000);
                                                    }
                                                }
                                            }
                                        });
                                }
                                if (type === "DOC") {
                                    swal.close();
                                    $scope.export.Preview = $scope.export.jsonToTable(dataToExport, columsAllow, firstrow, "500px");
                                    $scope.export.ToExport = $scope.export.jsonToTable(dataToExport, columsAllow, firstrow, "500px", "no");
                                    $scope.modal.simpleModal(`<div style="overflow: auto;height: auto;width: 100%">${$scope.export.Preview}</div>`,
                                        {
                                            width: "modal-full",
                                            header: {title: `${MESSAGE.ic('mono.export')} ${MESSAGE.i('mono.to')} ${type} ${MESSAGE.ic('mono.preview')} ${MESSAGE.i('mono.of')} ${dataToExport.length} ${MESSAGE.i('mono.rows')}`},
                                            footer: {
                                                buttons: [
                                                    {
                                                        color: COLOR.primary + '-600',
                                                        title: MESSAGE.ic('mono.download'),
                                                        action: function () {
                                                            SWEETALERT.loading({title: MESSAGE.ic('mono.building')});
                                                            if (direct) {
                                                                BASEAPI.ajax.formpost('/post/templates/docx/clean',
                                                                    {
                                                                        docx: `${$scope.plural} ${moment().format("DD-MM-YYYY")}.docx`,
                                                                        content: $scope.export.ToExport
                                                                    }, function (data) {

                                                                    });
                                                            } else {
                                                                BASEAPI.ajax.formpost('/post/templates/pdf/table',
                                                                    {
                                                                        docx: `DOC ${dataToExport.length} ${MESSAGE.i('mono.rows')} ${MESSAGE.i('mono.of')} ${$scope.plural} ${MESSAGE.i('mono.to')} ${type}.docx`,
                                                                        content: JSON.stringify(dataToExport),
                                                                        firstrow: firstrow,
                                                                        columns: JSON.stringify($scope.export.jsonLabels(columsAllow))
                                                                    }, function (data) {

                                                                    });
                                                            }
                                                        }
                                                    }
                                                ]
                                            },
                                            event: {
                                                show: {
                                                    begin: function (data) {
                                                        setTimeout(function () {
                                                            $(".modal-body").css('padding-top', 5);
                                                        }, 500)
                                                    },
                                                    end: function (data) {
                                                        // setTimeout(() => {
                                                        //     if ($(".modal-footer").length < 2) {
                                                        //         let footer = $('.modal-footer');
                                                        //         if (footer.height() > $(window).height()) {
                                                        //             $('.modal-body').prepend($scope.returnBuild(footer.clone()));
                                                        //         }
                                                        //     }
                                                        // }, 1000);
                                                    }
                                                }
                                            }
                                        });
                                }

                            }, orginalformat);
                        }
                    },
                    {
                        text: MESSAGE.ic('mono.cancel'),
                        color: COLOR.secundary,
                        action: function () {
                            swal.close();
                            if (direct === true) {
                                $scope.unCheckAll();
                            }
                        }
                    }
                ]);
            if (direct === true) {
                $("#sweetalertbutton0").click();
            }
            CHECKBOX.run_switchery();
        };
        $scope.export.json = function (parameters, type, callback, orginalformat) {

            delete parameters.where;
            parameters.join = eval(`CRUD_${$scope.modelName}`).table.single;
            parameters.where = $scope.fixFiltersApply();
            $scope.filtersApply(parameters);
            if (RELATIONS.anonymous[$scope.modelName] !== undefined) {
                parameters.where = RELATIONS.anonymous[$scope.modelName].where;
            }
            if (!DSON.oseaX(ARRAY.last(MODAL.historyObject))) {
                if (!DSON.oseaX(ARRAY.last(MODAL.historyObject).viewData)) {
                    if (!DSON.oseaX(ARRAY.last(MODAL.historyObject).viewData.data)) {
                        if (DSON.oseaX(parameters.where))
                            parameters.where = [];
                        for (const item of ARRAY.last(MODAL.historyObject).viewData.data) {
                            parameters.where.push(item);
                        }
                    }
                }
            }

            BASEAPI.list(eval(`CRUD_${$scope.modelName}`).table.viewExport || $scope.tableOrView, parameters, function (data) {
                var finalData = data.data;
                var aymicrud = eval(`CRUD_${$scope.modelName}`);
                finalData.forEach((row, index) => {
                    Object.keys(row).forEach((prop) => {
                        if ($scope.columns()[prop])
                            if (!$scope.columns()[prop].export)
                                finalData[index][prop] = $scope.cellValueExport(prop, $scope.columns()[prop], row, orginalformat);
                                // else if (typeof $scope.columns()[prop].export === "function")
                            //     finalData[index][prop] = $scope.columns()[prop].export(row[prop]);
                            else
                                finalData[index][prop] = row[prop];
                    });
                });

                callback({data: finalData});
            });
        };
        $scope.export.jsonLabels = function (columns) {
            var labels = [];
            for (var i in columns) {
                var key = columns[i];
                labels.push(HTML.strip($scope.columnLabel(eval(`CRUD_${$scope.modelName}`).table.columns[key], key)));
            }
            return labels;
        };
        $scope.export.createColums = (labelsx, columns) => {
            var labelsx = [];
            if (!$scope.CRUD().columnsOrder)
                for (var i in columns) {
                    var key = columns[i];
                    labelsx.push(HTML.strip($scope.columnLabel(eval(`CRUD_${$scope.modelName}`).table.columns[key], key)));
                }
            else {
                $scope.CRUD().columnsOrder.forEach(colrow => {
                    colrow.forEach(col => {
                        labelsx.push(col);
                    });
                });

            }
            return labelsx;
        }
        $scope.export.jsonToTableExample = function (width, classes) {
            var preview = `<table id="dataexport" class="tabla-pagina-5 ${classes || "table"} table-togglable table-framed table-bordered" style="${width || $scope.funcWidth}">`;
            var labels = [];
            var previewColums = "";
            var oneRow = "";
            for (var i in eval(`CRUD_${$scope.modelName}`).table.columns) {
                var key = i;
                if (eval(`CRUD_${$scope.modelName}`).table.columns[key].exportExample !== false) {
                    labels.push(HTML.strip($scope.columnLabel(eval(`CRUD_${$scope.modelName}`).table.columns[key], key)));
                    previewColums += `<th>${ARRAY.last(labels)}</th>`;
                    var exampleText = eval(`CRUD_${$scope.modelName}`).table.columns[key].exportExample;
                    exampleText = exampleText === undefined ? "[string]" : exampleText;
                    oneRow += `<td>${exampleText}</td>`;
                }
            }
            preview += `<thead class="bg-${COLOR.secundary}"  ><tr>${previewColums}</tr></thead><tbody><tr>${oneRow}</tr></tbody>`;
            $("#info-box").css('width', $('#dataexport').width());
            return preview;
        };
        $scope.export.getTableHeaders = function () {
            var labels = [];
            for (var i in eval(`CRUD_${$scope.modelName}`).table.columns) {
                var key = i;
                var tempObj = {};
                if (eval(`CRUD_${$scope.modelName}`).table.columns[key].exportExample !== false) {
                    tempObj.column = key;
                    tempObj.columnNameLabel = HTML.strip($scope.columnLabel(eval(`CRUD_${$scope.modelName}`).table.columns[key], key));
                    labels.push(tempObj);
                }
            }
            tempObj.column = "error";
            tempObj.columnNameLabel = 'Descripción del error';
            labels.push(tempObj)
            return labels;
        };
        $scope.export.jsonToTable = function (json, columns, first, width, classes, nospam) {
            if (json.length > 1) {
                var preview = `<table id="dataexport" class="tabla-pagina-5 ${classes || "table"} table-togglable table-framed table-bordered" style="${width || $scope.funcWidth}">`;
                if (first) {
                    var labels = [];
                    var previewColums = "<tr>";
                    if (!$scope.CRUD().columnsOrder) {
                        for (var i in columns) {
                            var key = columns[i];
                            labels.push(HTML.strip($scope.columnLabel(eval(`CRUD_${$scope.modelName}`).table.columns[key], key)));
                            previewColums += `<th style="background-color: #${CONFIG.ui.theme.primary};color: white">${ARRAY.last(labels)}</th>`;
                        }
                        previewColums += "</tr>";
                    } else {
                        previewColums = "";
                        $scope.CRUD().columnsOrder.forEach(colrow => {
                            previewColums += "<tr>";
                            colrow.forEach(col => {
                                labels.push(col.label);
                                previewColums += `<th class="text-center" style="background-color: #${CONFIG.ui.theme.primary};color: white" rowspan="${col.row || 1}" colspan="${col.col || 1}">${col.label}</th>`;
                            });
                            previewColums += "</tr>";
                        });
                    }
                    preview += `<thead class="bg-${COLOR.secundary}">${previewColums}</thead>`;
                }
                preview += `<tbody>`;
                let locolumns = eval(`CRUD_${$scope.modelName}`).table.columns;
                json.forEach(function (row, idx) {
                    var previewRow = "";
                    for (const i in row) {
                        if (nospam) {
                            previewRow += `<td>${row[i]}</td>`;
                            continue;
                        }
                        let value = locolumns[i];
                        let rowspan = "1";
                        let visible = true;
                        if (value.rowspan) {
                            rowspan = value.rowspan(idx, json, 'span', true);
                            visible = value.rowspan(idx, json, 'seeme', true);
                        }
                        if (visible)
                            previewRow += `<td rowspan="${rowspan}" >${row[i]}</td>`;
                    }
                    preview += `<tr>${previewRow}</tr>`;
                });
                preview += `</tbody>`;
                preview += `</table>`;
            } else {
                var preview = `<table id="dataexport" class="tabla-pagina-5 ${classes || "table"} table-togglable table-framed table-bordered" style="${width || $scope.funcWidth}">`;
                if (first) {
                    var labels = [];
                    var previewColums = "";
                    for (var i in columns) {
                        var key = columns[i];
                        labels.push(HTML.strip($scope.columnLabel(eval(`CRUD_${$scope.modelName}`).table.columns[key], key)));
                        previewColums += `<th style="background-color: #${CONFIG.ui.theme.primary};color: white">${ARRAY.last(labels)}</th>`;
                    }
                    preview += `<thead class="bg-${COLOR.secundary}"  ><tr>${previewColums}</tr></thead>`;
                }
                preview += `<tbody>`;
                json.forEach(function (row) {
                    var previewRow = "";
                    for (const i in row) {
                        previewRow += `<td>${row[i]}</td>`;
                    }
                    preview += `<tr>${previewRow}</tr>`;
                });
                preview += `</tbody>`;
                preview += `</table>`;
            }
            return preview;
        };
        $scope.export.jsonToCSV = function (json, columns, first) {
            var csv = '';
            if (json.length > 1) {
                if (first) {
                    var labels = [];
                    for (var i in columns) {
                        var key = columns[i];
                        labels.push(HTML.strip($scope.columnLabel(eval(`CRUD_${$scope.modelName}`).table.columns[key], key)));
                    }
                    csv += labels.join(",") + "\r\n";
                }
                json.forEach(function (row) {
                    var rowValues = [];
                    for (const i in row) {
                        rowValues.push(row[i]);
                    }
                    csv += `"${rowValues.join('","')}"\r\n`;
                });
            } else {
                var labels = [];
                for (var i in columns) {
                    var key = columns[i];
                    labels.push(`${HTML.strip($scope.columnLabel(eval(`CRUD_${$scope.modelName}`).table.columns[key], key))},${eval("json[0]." + key)}`);
                }
                csv += labels.join("\r\n");
            }
            return csv;
        };
        $scope.export.jsonToClipboard = function (json, columns, first) {
            var result = '';
            if (json.length > 1) {
                if (first) {
                    var labels = [];
                    for (var i in columns) {
                        var key = columns[i];
                        labels.push(HTML.strip($scope.columnLabel(eval(`CRUD_${$scope.modelName}`).table.columns[key], key)));
                    }
                    result += labels.join("\t") + "\r\n";
                }
                json.forEach(function (row) {
                    var rowValues = [];
                    for (const i in row) {
                        rowValues.push(row[i]);
                    }
                    result += `${rowValues.join("\t")}\r\n`;
                });
            } else {
                var labels = [];
                for (var i in columns) {
                    var key = columns[i];
                    labels.push(`${HTML.strip($scope.columnLabel(eval(`CRUD_${$scope.modelName}`).table.columns[key], key))}\t${eval("json[0]." + key)}`);
                }
                result += labels.join("\r\n");
            }
            return result;
        }
    },
};
