removeArray = function (array, ax) {
    var what, a = arguments, L = a.length, ax;
    while (L && array.length) {
        what = a[--L];
        while ((ax = array.indexOf(what)) !== -1) {
            array.splice(ax, 1);
        }
    }
    return array;
};
getFiles = function (params, exclude, dir, filelist, prefix) {
    var fs = params.fs || require("fs"),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    prefix = prefix || "";
    files.forEach(function (file) {
        if (fs.statSync(dir + "/" + file).isDirectory()) {
            if (exclude.indexOf(dir + "/" + file) === -1) {
                filelist.push(prefix + file);
                filelist = getFiles(params,
                    exclude,
                    dir + "/" + file,
                    filelist,
                    prefix + file + "/"
                );
            } else {
                //console.log("exclude:" + dir + "/" + file);
            }
        } else {
        }
    });
    for (var root in exclude) {
        if (exclude[root][0] === '@') {
            var path = exclude[root].replace("@", "");
            filelist = removeArray(filelist, path);
        }
    }
    return filelist;
};
deleteFolderRecursive = function (path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function getAccessToken(params) {
    let options = {
        method: 'POST',
        uri: params.CONFIG.microsoft_cognitiveservices.API,
        headers: {
            'Ocp-Apim-Subscription-Key': params.CONFIG.microsoft_cognitiveservices.subscriptionKey
        }
    };
    return params.request_promise(options);
}

function textToSpeech(accessToken, text, params, lan) {
    // Create the SSML request.
    let xml_body = params.xmlbuilder.create('speak')
        .att('version', '1.0').att('xml:lang', 'en-us').ele('voice').att('xml:lang', 'en-us')
        .att('name', eval(`params.CONFIG.microsoft_cognitiveservices.voices.${lan}`)).txt(text).end();
    // Short name for 'Microsoft Server Speech Text to Speech Voice (en-US, Guy24KRUS)'
    // Convert the XML into a string to send in the TTS request.
    let body = xml_body.toString();
    let options = {
        method: 'POST',
        baseUrl: params.CONFIG.microsoft_cognitiveservices.baseUrl,
        url: 'cognitiveservices/v1',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'cache-control': 'no-cache',
            'User-Agent': 'YOUR_RESOURCE_NAME',
            'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm',
            'Content-Type': 'application/ssml+xml'
        },
        body: body
    };

    let request = params.request_promise(options)
        .on('response', (response) => {
            if (response.statusCode === 200) {
                request.pipe(params.fs.createWriteStream('./preview.wav'));
                console.log('Your file is ready');
            }
        });
    return request;

};

//Load Functions
exports.LoadEJS = function (files, params, folder) {
    for (var i in files) {
        var file = files[i];
        var viewName = params.S(file).contains("index.ejs") ? "" : file.replace(".ejs", "");
        var url = params.util.format("/%s%s", params.modelName === "base" ? `${params.CONFIG.folder}` : `${params.CONFIG.folder}/` + params.modelName + "/", viewName);
        params.app.get(url,
            function (req, res) {
                console.log("LoadEJS");
                params.secure.check(req, res).then(async function (token) {
                    if (!token.apptoken) {
                        res.json(token);
                        return;
                    }
                    req.originalUrl = req.originalUrl.replace(params.CONFIG.folder + "/", "");
                    req.originalUrl = req.originalUrl.replace("/" + params.CONFIG.folder, "");

                    var path = req.originalUrl;
                    var realPath = path.split("?");
                    var viewN = realPath[0].split("/");
                    var modelName = viewN.filter(function (item) {
                        return item !== '';
                    });
                    var query = "";
                    if (realPath.length > 1) {
                        query = realPath[1];
                        realPath = realPath[0];
                    } else {
                        if (realPath[0] === "/") realPath = realPath[0] + "/base";
                        else {
                            if (realPath[0].split("/").length > 1) realPath = realPath[0];
                            else realPath = realPath[0] + "/index";
                        }
                    }

                    res.render("../" + (folder || params.folders.views) + "/" + realPath, {
                        DATA: (req || {query: {}}).query,
                        scope: req.query.scope,
                        params: params,
                        url: req.originalUrl
                    });
                }).catch(function () {

                });
            }
        );
    }
};
exports.LoadEJSDragon = function (files, params, folder) {
    for (var i in files) {
        var file = files[i];
        var viewName = params.S(file).contains("index.ejs") ? "" : file.replace(".ejs", "");
        var url = params.util.format("/%s%s", params.modelName === "base" ? `${params.CONFIG.folder}` : `${params.CONFIG.folder}/` + params.modelName + "/", viewName);
        params.app.get(url,
            function (req, res) {
                console.log("LoadEJSDragon");
                params.secure.check(req, res).then(async function (token) {
                    if (!token.apptoken) {
                        res.json(token);
                        return;
                    }
                    req.originalUrl = req.originalUrl.replace(params.CONFIG.folder + "/", "");
                    req.originalUrl = req.originalUrl.replace("/" + params.CONFIG.folder, "");

                    var path = req.originalUrl;
                    var realPath = path.split("?");
                    var viewN = realPath[0].split("/");
                    var modelName = viewN.filter(function (item) {
                        return item !== '';
                    });
                    console.log("original: " + path);
                    var query = "";
                    if (realPath.length > 1) {
                        query = realPath[1];
                        realPath = realPath[0];
                    } else {
                        if (realPath[0] === "/") realPath = realPath[0] + "/base";
                        else {
                            if (realPath[0].split("/").length > 1) realPath = realPath[0];
                            else realPath = realPath[0] + "/index";
                        }
                    }


                    res.render("../" + (folder || params.folders.viewsDragon) + "/" + realPath, {
                        DATA: (req || {query: {}}).query,
                        scope: req.query.scope,
                        params: params,
                        url: req.originalUrl
                    });
                }).catch(function () {

                });
            }
        );
    }
};
exports.runServices = function (services, prefix, params) {
    var catalogs = [];
    for (var i in services.gets) {
        var func = services.gets[i];
        catalogs.push("get*" + prefix + "." + func.name);
        params.app.get(params.util.format("/service/%s/%s", prefix, i), async function (req, res) {
            var config = req.originalUrl.split('?')[0].replace('/service/', '').split('/');
            var service = config[0];
            var functionR = config[1];
            eval(`var serviceFunction = params.servicesFunctions["${service}"].gets.${functionR}`);
            return await serviceFunction((req || {query: {}}).query).then(result => {
                params.secure.check(req, res).then(function (token) {
                    if (!token.apptoken) {
                        res.json(token);
                    } else
                        res.json(result);
                }).catch(function () {

                });
            }).catch(err => {
                res.json(err);
            });
        });
    }
    for (var i in services.posts) {
        var func = services.posts[i];
        catalogs.push("post*" + prefix + "." + func.name);
        params.app.post(params.util.format("/service/%s/%s", prefix, i), async function (req, res) {
            var config = req.originalUrl.replace('/service/', '').split('/');
            var service = config[0];
            var functionR = config[1];
            eval(`var serviceFunction = params.servicesFunctions["${service}"].posts.${functionR}`);
            return await serviceFunction(req.body).then(result => {
                params.secure.check(req, res).then(function (token) {
                    if (!token.apptoken) {
                        res.json(token);
                        return;
                    }
                    res.json(result);
                }).catch(function () {

                });
            }).catch(err => {
                res.json(err);
            });
        });
    }
    for (var i in services.puts) {
        var func = services.puts[i];
        catalogs.push("put*" + prefix + "." + func.name);
        params.app.post(params.util.format("/service/%s/%s", prefix, i), async function (req, res) {
            var config = req.originalUrl.replace('/service/', '').split('/');
            var service = config[0];
            var functionR = config[1];
            eval(`var serviceFunction = params.servicesFunctions["${service}"].puts.${functionR}`);
            return await serviceFunction(req.body).then(result => {
                params.secure.check(req, res).then(function (token) {
                    if (!token.apptoken) {
                        res.json(token);
                        return;
                    }
                    res.json(result);
                }).catch(function () {

                });
            }).catch(err => {
                res.json(err);
            });
        });
    }
    for (var i in services.deletes) {
        var func = services.deletes[i];
        catalogs.push("delete*" + prefix + "." + func.name);
        params.app.post(params.util.format("/service/%s/%s", prefix, i), async function (req, res) {
            var config = req.originalUrl.replace('/service/', '').split('/');
            var service = config[0];
            var functionR = config[1];
            eval(`var serviceFunction = params.servicesFunctions["${service}"].deletes.${functionR}`);
            return await serviceFunction(req.body).then(result => {
                params.secure.check(req, res).then(function (token) {
                    if (!token.apptoken) {
                        res.json(token);
                        return;
                    }
                    res.json(result);
                }).catch(function () {

                });
            }).catch(err => {
                res.json(err);
            });
        });
    }
    return catalogs;
};
exports.loadEJSSimple = function (folder, prefix, params) {
    params.fs.readdir(folder, function (err, files) {
        for (var i in files) {
            var file = files[i];
            var viewName = params.S(file).contains("index.ejs") ? "" : "/" + file.replace(".ejs", "");
            if (viewName.indexOf('.') !== -1)
                continue;
            params.app.get(params.util.format("/%s%s", `${params.CONFIG.folder}/` + prefix, viewName), function (req, res) {
                console.log("loadEJSSimple");
                params.secure.check(req, res).then(async function (token) {
                    if (!token.apptoken) {
                        res.json(token);
                        return;
                    }
                    req.originalUrl = req.originalUrl.replace(params.CONFIG.folder + "/", "");
                    req.originalUrl = req.originalUrl.replace("/" + params.CONFIG.folder, "");

                    var path = req.originalUrl;


                    var realPath = path.split("?");
                    var viewN = realPath[0].split("/");

                    var modelName = viewN.filter(function (item) {
                        return item !== '';
                    });
                    var viewfinal = viewN[viewN.length - 1];
                    if (modelName.length == 1)
                        viewfinal = "index";
                    res.render("." + folder + "/" + viewfinal,
                        {
                            DATA: (req || {query: {}}).query,
                            params: params,
                            scope: req.query.scope,
                            url: req.originalUrl
                        });
                }).catch(function () {

                });
            });
            params.app.post(params.util.format("/post/%s%s", `` + prefix, viewName), async function (req, res) {
                console.log("loadEJSSimple post");
                req.originalUrl = req.originalUrl.replace(params.CONFIG.folder + "/", "");
                req.originalUrl = req.originalUrl.replace("/" + params.CONFIG.folder, "");
                var path = req.originalUrl;
                var realPath = path.split("?");
                var viewN = realPath[0].split("/");

                var models = params.models
                    .concat(params.modelsql)
                    .concat(params.modelmysql)
                    .concat(params.modelpostgre)
                    .concat(params.modeloracle)
                    .concat(params.modelstorage);

                var modelName = viewN.filter(function (item) {
                    return item !== '';
                });

                var viewfinal = viewN[viewN.length - 1];
                if (modelName.length == 1)
                    viewfinal = "index";
                if (req.body.pdf) {
                    if (req.body.pdf2) {

                    } else {
                        params.app.render("." + folder + "/" + viewfinal, {
                            DATA: req.body,
                            params: params,
                            scope: modelName[0]
                        }, function (err, html) {
                            if (err) {
                                res.json(err);
                                return;
                            }

                            params.app.render("." + folder + "/" + 'header', {
                                DATA: req.body,
                                params: params,
                                scope: modelName[0]
                            }, function (err, headHtml) {
                                if (err) {
                                    res.json(err);
                                    return;
                                }

                                params.app.render("." + folder + "/" + 'footer', {
                                    DATA: req.body,
                                    params: params,
                                    scope: modelName[0]
                                }, function (err, footerHtml) {
                                    if (err) {
                                        res.json(err);
                                        return;
                                    }
                                    var runnings = `module.exports = {
                                    header: {
                                        height: '5cm', 
                                        contents: function (page) {
                                            return '${headHtml.replace(/(\r\n|\n|\r)/gm, "")}';
                                        }
                                    },
        
                                    footer: {
                                        height: '5cm', 
                                        contents: function (page) {
                                            return '${footerHtml.replace(/(\r\n|\n|\r)/gm, "")}';
                                        }
                                    },
                                };`;
                                    var pdfOptions = {
                                        html: html,
                                        paperSize: {
                                            format: 'A4',
                                            orientation: 'landscape', // portrait
                                            border: '1cm'
                                        },
                                        runnings: runnings
                                    };

                                    params.fs.writeFile("./preview.html", html, function (err) {
                                        if (err) {
                                            return console.log(err);
                                        }
                                    });

                                    params.PDF.convert(pdfOptions, function (err, result) {
                                        result.toFile("./preview.pdf", function () {
                                            res.download("./preview.pdf", req.body.pdf);
                                        });
                                    });
                                });
                            });
                        });
                    }

                } else if (req.body.docx) {
                    params.app.render("." + folder + "/" + viewN[viewN.length - 1], {
                        DATA: req.body,
                        params: params,
                        scope: modelName[0]
                    }, function (err, html) {
                        if (err) {
                            res.json(err);
                            return;
                        }
                        var docx = params.HtmlDocx.asBlob(html, {
                            orientation: 'landscape',
                            margins: {top: 200, right: 200, left: 200, header: 200, footer: 200, bottom: 200}
                        });
                        params.fs.writeFile("./preview.docx", docx, function (err) {
                            if (err) {
                                res.json(err);
                                return;
                            }

                            res.download("./preview.docx", req.body.docx);
                        });
                    });
                } else {
                    res.render("." + folder + "/" + viewN[viewN.length - 1],
                        {
                            DATA: req.body,
                            params: params,
                            scope: modelName[0],
                            url: req.originalUrl
                        });
                }
            });
        }
    });
};
exports.loadEJSSimpleSilents = function (folder, prefix, params) {
    params.fs.readdir(folder, function (err, files) {
        for (var i in files) {
            var file = files[i];
            var viewName = params.S(file).contains("index.ejs") ? "" : "/" + file.replace(".ejs", "");
            params.app.get(params.util.format("/%s%s", `${params.CONFIG.folder}/` + prefix, viewName), function (req, res) {
                console.log("loadEJSSimpleSilents");
                params.secure.check(req, res).then(async function (token) {
                    if (!token.apptoken) {
                        res.json(token);
                        return;
                    }
                    req.originalUrl = req.originalUrl.replace(params.CONFIG.folder + "/", "");
                    req.originalUrl = req.originalUrl.replace("/" + params.CONFIG.folder, "");


                    var path = req.originalUrl;
                    var realPath = path.split("?");
                    var viewN = realPath[0].split("/");
                    var modelName = viewN.filter(function (item) {
                        return item !== '';
                    });


                    var viewfinal = viewN[viewN.length - 1];
                    if (modelName.length == 1)
                        viewfinal = "index";
                    res.render("../" + params.folders.silents + "/" + viewfinal, {
                        DATA: (req || {query: {}}).query,
                        params: params,
                        scope: req.query.scope,
                        url: req.originalUrl
                    });
                }).catch(function () {

                });
            });
            params.app.post(params.util.format("/post/%s%s", `` + prefix, viewName), async function (req, res) {
                console.log("loadEJSSimpleSilents post");
                req.originalUrl = req.originalUrl.replace(params.CONFIG.folder + "/", "");
                req.originalUrl = req.originalUrl.replace("/" + params.CONFIG.folder, "");
                var path = req.originalUrl;
                var realPath = path.split("?");
                var viewN = realPath[0].split("/");
                var modelName = viewN.filter(function (item) {
                    return item !== '';
                });
                var viewfinal = viewN[viewN.length - 1];
                if (modelName.length == 1)
                    viewfinal = "index";
                if (req.body.pdf) {
                    params.app.render("." + folder + "/" + viewfinal, {
                        DATA: req.body,
                        params: params,
                        scope: modelName[0]
                    }, function (err, html) {
                        if (err) {
                            res.json(err);
                            return;
                        }

                        params.app.render("." + folder + "/" + 'header', {
                            DATA: req.body,
                            params: params,
                            scope: modelName[0]
                        }, function (err, headHtml) {
                            if (err) {
                                res.json(err);
                                return;
                            }

                            params.app.render("." + folder + "/" + 'footer', {
                                DATA: req.body,
                                params: params,
                                scope: modelName[0]
                            }, function (err, footerHtml) {
                                if (err) {
                                    res.json(err);
                                    return;
                                }
                                var runnings = `module.exports = {
                                    header: {
                                        height: '5cm', 
                                        contents: function (page) {
                                            return '${headHtml.replace(/(\r\n|\n|\r)/gm, "")}';
                                        }
                                    },
        
                                    footer: {
                                        height: '5cm', 
                                        contents: function (page) {
                                            return '${footerHtml.replace(/(\r\n|\n|\r)/gm, "")}';
                                        }
                                    },
                                };`;
                                var pdfOptions = {
                                    html: html,
                                    paperSize: {
                                        format: 'A4',
                                        orientation: 'landscape', // portrait
                                        border: '1cm'
                                    },
                                    runnings: runnings
                                };

                                params.fs.writeFile("./preview.html", html, function (err) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                });

                                params.PDF.convert(pdfOptions, function (err, result) {
                                    result.toFile("./preview.pdf", function () {
                                        res.download("./preview.pdf", req.body.pdf);
                                    });
                                });
                            });
                        });
                    });
                } else if (req.body.docx) {
                    params.app.render("." + folder + "/" + viewN[viewN.length - 1], {
                        DATA: req.body,
                        params: params,
                        scope: modelName[0]
                    }, function (err, html) {
                        if (err) {
                            res.json(err);
                            return;
                        }
                        var docx = params.HtmlDocx.asBlob(html, {
                            orientation: 'landscape',
                            margins: {top: 200, right: 200, left: 200, header: 200, footer: 200, bottom: 200}
                        });
                        params.fs.writeFile("./preview.docx", docx, function (err) {
                            if (err) {
                                res.json(err);
                                return;
                            }

                            res.download("./preview.docx", req.body.docx);
                        });
                    });
                } else {
                    res.render("." + folder + "/" + viewN[viewN.length - 1],
                        {
                            DATA: req.body,
                            params: params,
                            scope: modelName[0],
                            url: req.originalUrl
                        });
                }
            });
        }
    });
};
exports.loadEJSSimplePOST = function (folder, prefix, params) {
    params.fs.readdir(folder, function (err, files) {
        for (var i in files) {
            var file = files[i];
            var viewName = params.S(file).contains("index.ejs") ? "" : "/" + file.replace(".ejs", "");
            params.app.post(params.util.format("/%s%s", `` + prefix, viewName), function (req, res) {
                console.log("loadEJSSimplePOST");
                params.secure.check(req, res).then(async function (token) {
                    if (!token.apptoken) {
                        res.json(token);
                        return;
                    }
                    req.originalUrl = req.originalUrl.replace(params.CONFIG.folder + "/", "");
                    req.originalUrl = req.originalUrl.replace("/" + params.CONFIG.folder, "");


                    var path = req.originalUrl;
                    var realPath = path.split("?");
                    var viewN = realPath[0].split("/");

                    var models = params.models
                        .concat(params.modelsql)
                        .concat(params.modelmysql)
                        .concat(params.modelpostgre)
                        .concat(params.modeloracle)
                        .concat(params.modelstorage);

                    var modelName = viewN.filter(function (item) {
                        return item !== '';
                    });

                    var viewfinal = viewN[viewN.length - 1];
                    if (modelName.length == 1)
                        viewfinal = "index";
                    res.render("." + folder + "/" + viewfinal, {
                        DATA: req.body,
                        params: params,
                        scope: req.query.scope,
                        url: req.originalUrl
                    });
                }).catch(function () {

                });
            });
        }
    });
};

exports.init = function (params) {
    var excludes = [
        params.folders.views + "//base",
        params.folders.views + "//master",
    ];
    var excludesDragon = [
        params.folders.viewsDragon + "//base",
        params.folders.viewsDragon + "//master",
        "@templates",
        params.folders.viewsDragon + "//templates/charts",
        // params.folders.viewsDragon + "//templates/email",
        params.folders.viewsDragon + "//templates/form",
        params.folders.viewsDragon + "//templates/header",
        params.folders.viewsDragon + "//templates/system",
        params.folders.viewsDragon + "//templates/table",
        params.folders.viewsDragon + "//application"
    ];

    var models = params.models
        .concat(params.modelsql)
        .concat(params.modelmysql)
        .concat(params.modelpostgre)
        .concat(params.modeloracle)
        .concat(params.modelstorage);

    models.forEach(element => {
        excludes.push(params.folders.views + "//" + element);
    });
    models.forEach(element => {
        excludesDragon.push(params.folders.viewsDragon + "//" + element);
    });

    params.modelName = "base";


    params.fs.readdir(
        params.util.format("./" + params.folders.viewsDragon + "/%s", params.modelName), function (err, files) {
            params.modelName = "base";
            exports.LoadEJSDragon(files, params);
        }
    );

    var autroute = getFiles(params, excludesDragon, params.folders.viewsDragon + "/");
    autroute.forEach(element => {
        exports.loadEJSSimple(
            "./" + params.folders.viewsDragon + "/" + element.replace(".ejs", ""),
            element.replace(".ejs", ""),
            params
        );
    });
    autroute = getFiles(params, excludes, params.folders.views + "/");
    autroute.forEach(element => {
        exports.loadEJSSimple(
            "./" + params.folders.views + "/" + element.replace(".ejs", ""),
            element.replace(".ejs", ""), params
        );
    });

    CONTROLLERSNAMES = [];
    for (var CONTROLLER of params.controllersjs) {
        var name = CONTROLLER.split('CO_')[1].split('.js')[0];
        if (["BASE"].indexOf(name) === -1)
            CONTROLLERSNAMES.push(name);
    }

    STORAGENAMES = [];
    for (var sotargy in params.CONFIG.storageEntities) {
        STORAGENAMES.push(sotargy);
    }

    silentsmodels = [];
    models.forEach(function (item) {
        if (item !== undefined) {
            if (CONTROLLERSNAMES.indexOf(item) === -1) {
                if (STORAGENAMES.indexOf(item) === -1) {
                    silentsmodels.push(item);
                }
            }
        }
    });
    silentsmodels.forEach(element => {
        if (params.CONFIG.silents.visible.indexOf(element) !== -1) {
            exports.loadEJSSimpleSilents(
                "./" + params.folders.silents, element.replace(".ejs", ""), params
            );
        }
    });

    exports.loadEJSSimplePOST("./" + params.folders.fields, "dragoncontrol", params);

    //Extra API

    var reloadServer = function (data) {
        var res = {};
        var fs = params.fs || require("fs");
        var configFolder = params.folders.config;
        var file = __dirname + '/../' + configFolder + '/' + 'z_restart.json';
        fs.writeFile(file, "{\"restart\":" + new Date().getTime() + "}", function (err, data) {
            res = {error: 'reload server'};
            return res;
        });

    };
    var goodNotificationPush = async function (condition) {
        var restart = false;
        cnn = params.modules.mysql;
        modelo_usuario = new cnn.Model("usuario", params);
        modelo_usuario.where().then(async rs_u => {
            var arr_correo = [];
            var rs = [];
            arr_correo = rs_u.data;

            rs = arr_correo.filter(row => {
                return true;
            }).map(function (obj) {
                return obj.id;
            });

            if ((rs.length > 0 && rs != undefined)) {
                await params.servicesFunctions.base_onesignal.posts.send(
                    {
                        headings: {en: 'Error del Sistema'},
                        contents: {en: 'El sistema ha sido restaurado, puede continuar con sus labores. Disculpe los inconvenientes ocasionados.'},
                        users: rs,
                    });
                restart = condition ? true : false;
            }
            if (reloadServer) {
                reloadServer();
            }
        });
    };
    var mail = async function (req, count, row) {
        res = {};
        var models = params.models
            .concat(params.modelsql)
            .concat(params.modelmysql)
            .concat(params.modelpostgre)
            .concat(params.modeloracle)
            .concat(params.modelstorage);
        try {
            var transporter = await params.mail.createTransport(params.CONFIG.smtp);
            var options = params.CONFIG.smptOptions;
            var from = params.CONFIG.support.email || params.CONFIG.smptOptions.sender;
            var name = "TI";
            var mailOptions = {
                from: `"${name}" ${from}`,
                to: req.to,
                subject: req.subject
            };
            if (req.template) {
                await params.app.render("../" + params.folders.viewsDragon + "/templates/" + req.template,
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
                            res.json({error: err, html: html});
                            return;
                        }
                        mailOptions.html = html;
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log('error al enviar', res);
                                res = {error: error, success: false};
                            }
                            res = {success: true};
                            console.log('enviado satisfactoriamente', res, count, row);
                            if (count == row) {
                                setTimeout(function () {
                                    goodNotificationPush(1);
                                }, 30000);
                            }
                        });
                    }
                );
            }
        } catch (e) {
            console.log('Error al intentar enviar los correo, el posible error pudo ser por aver intentando enviar un correo no existente.', e);
        }
    };
    var errorNoControl = function (statusCode, userID, urlPage) {
        // if (statusCode == 500) {
        // cnn = params.modules.mysql;
        // modelo_compania = new cnn.Model("compania", params);
        // modelo_usuario = new cnn.Model("usuario", params);
        // modelo_compania.where().then(rs_c => {
        //     modelo_usuario.where().then(async rs_u => {
        //         var arr_correo = [];
        //         var arr_compania = [];
        //         var rs = [];
        //         var rs2 = [];
        //         var userSendError = [];
        //         var moment = require('moment');
        //         var date = moment().lang("es").format('LLL');
        //
        //         arr_compania = [{id: 8}, {id: 6}];//  rs_c.data;
        //         arr_correo = rs_u.data;
        //
        //         userSendError = arr_correo.filter(row => {
        //             return row.id == userID;
        //         }).map(function (obj) {
        //             return obj.nombre + ' ' + obj.apellido;
        //         });
        //
        //
        //         var count = arr_compania.length;
        //         i = 1;
        //
        //         for (item of arr_compania) {
        //
        //             rs = arr_correo.filter(row => {
        //                 return row.compania == item.id;
        //             }).map(function (obj) {
        //                 return obj.correo;
        //             });
        //
        //             rs2 = arr_correo.filter(row => {
        //                 return row.compania == item.id;
        //             }).map(function (obj) {
        //                 return obj.id;
        //             });
        //
        //             if ((rs.length > 0 && rs != undefined) && (rs2.length > 0 && rs2 != undefined)) {
        //                 console.log(rs, rs2);
        //                 params.servicesFunctions.base_onesignal.posts.send(
        //                     {
        //                         headings: {en: 'Error del Sistema'},
        //                         contents: {en: 'Ha ocurrido un error no monitoreado. Estaremos restaurando el sistema en 30 segundos. Es un proceso rápido y estaremos enviando una notificación una vez hayamos terminado. Disculpe los inconvenientes ocasionados.'},
        //                         users: rs2,
        //                     });
        //                 await mail({
        //                     "to": rs,
        //                     "subject": 'Error del Sistema',
        //                     "template": 'email/plane',
        //                     "fields": {
        //                         message: `Ha ocurrido un error GRAVE no monitoreado en la ruta ${urlPage}. El usuario que generó el error fue  ${userSendError[0]}, el día ${date}.`
        //                     }
        //                 }, count, i);
        //                 i++;
        //             }
        //         }
        //     });
        // });
        // }
    };

    var globalToke = null;

    params.app.post("/menu/edit/", function (req, res) {

        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }

            // var moment = require('moment');
            // var date = moment().format();
            var fs = params.fs || require("fs");
            // var configFolder = params.folders.menuDeveloper;
            var names = {
                "menu.json": "menus",
                "menus_privado.json": "menus_privado",
            };

            var configFolder = params.CONFIG.mode === "developer" ? `${params.folders.config}/appearance/${req.body.file}` : `${params.folders.eviroments}/${params.CONFIG.mode}/appearance/${req.body.file}`;
            var file = __dirname + '/../' + configFolder;

            req.body.json = params.S(req.body.json).replaceAll("&#39;", "'").s;
            req.body.json = params.S(req.body.json).replaceAll("&#34;", "\"").s;
            req.body.json = params.S(req.body.json).replaceAll("&lt;", "<").s;
            req.body.json = params.S(req.body.json).replaceAll("&gt;", ">").s;

            console.log(file, req.body.json);
            var elo = req.body.file.indexOf('menus_privado') !== -1 ? "menus_privado" : "menus";
            var finalname = elo + (req.body.compania || '');
            fs.writeFile(file, "{\"" + finalname + "\":" + req.body.json + "}", function (err, data) {
                if (err) {
                    res.json({error: err});
                }
            });

            var configFolder2 = params.folders.config;
            var file2 = __dirname + '/../' + configFolder2 + '/' + 'z_restart.json';
            fs.writeFile(file2, "{\"restart\":" + new Date().getTime() + "}", function (res, data) {
                if (res) {
                    res.json({error: err});
                }
            });

            res.json({error: false, saved: true});

        }).catch(function () {
            res.json({error: true});
        });
    });

    params.app.get(`/${params.CONFIG.folder}/home`, function (req, res) {
        console.log("loadEJSSimple");
        req.originalUrl = req.originalUrl.replace(params.CONFIG.folder + "/", "");
        req.originalUrl = req.originalUrl.replace("/" + params.CONFIG.folder, "");
        var path = req.originalUrl;
        res.render("../" + params.folders.viewsDragon + "/base/indexclean.ejs",
            {
                DATA: (req || {query: {}}).query,
                params: params,
                scope: req.query.scope,
                url: req.originalUrl
            });
    });
    params.app.get(`/${params.CONFIG.folder}/outlook`, async function (req, res) {
        console.log("loadEJSSimple");
        if (params.CONFIG.microsoft_graph_testing) {
            let cnnX = params.modules.mssql;
            let finalname = req.query.tempname || "Sin Nombre";
            let user_info = {
                nombre: finalname,
                apellido: "*",
                correo: finalname.replaceAll(" ", "") + "@dgcp.gob.do",
                password: "572011BACE358A0A6AC4B3760DB7228E",
                confirmpassword: "572011BACE358A0A6AC4B3760DB7228E",
                active: 1,
                allinfo: {}
            };
            let modelo_usuariox = new cnnX.Model("usuario", params);
            let usuario_creadox = await modelo_usuariox.where([
                {
                    field: "correo",
                    value: user_info.correo
                }
            ]);
            if (!usuario_creadox.data.length)
                await cnnX.data(`INSERT INTO usuario (nombre, apellido, correo, password, repeatPassword, profile, active ) values('${(user_info.nombre) + ''}', '${user_info.apellido || ''}', '${user_info.correo}', '572011BACE358A0A6AC4B3760DB7228E', '572011BACE358A0A6AC4B3760DB7228E', 1, 1) `, params, false);
            res.render("../" + params.folders.viewsDragon + "/base/indexclean.ejs",
                {
                    DATA: user_info,
                    params: params,
                    scope: req.query.scope,
                    url: req.originalUrl,
                    user_info: {}
                });
        }

        req.originalUrl = req.originalUrl.replace(params.CONFIG.folder + "/", "");
        req.originalUrl = req.originalUrl.replace("/" + params.CONFIG.folder, "");
        var path = req.originalUrl;
        const msalConfig = {
            auth: {
                clientId: params.CONFIG.microsoft_graph.clientId,
                authority: `https://login.microsoftonline.com/${params.CONFIG.microsoft_graph.tenantId}`,
                redirectUri: params.CONFIG.microsoft_graph.redirectUri,
            },
        };

        const pca = new params.PublicClientApplication(msalConfig);

        const ccaConfig = {
            auth: {
                clientId: params.CONFIG.microsoft_graph.clientId,
                authority: `https://login.microsoftonline.com/${params.CONFIG.microsoft_graph.tenantId}`,
                clientSecret: params.CONFIG.microsoft_graph.clientSecret,
            },
        };

        const cca = new params.ConfidentialClientApplication(ccaConfig);

        if (!req.query.code) {
            const authCodeUrlParameters = {
                scopes: params.CONFIG.microsoft_graph.scopes,
                redirectUri: params.CONFIG.microsoft_graph.redirectUri,
            };

            let getAuthCodeUrl = await pca.getAuthCodeUrl(authCodeUrlParameters);

            res.redirect(getAuthCodeUrl);
            return;
        } else {
            const tokenRequest = {
                code: req.query.code,
                scopes: params.CONFIG.microsoft_graph.scopes,
                redirectUri: params.CONFIG.microsoft_graph.redirectUri,
                clientSecret: params.CONFIG.microsoft_graph.clientSecret,
            };

            const tokenRequest_Client = {
                scopes: params.CONFIG.microsoft_graph.scopes,
                clientSecret: params.CONFIG.microsoft_graph.clientSecret,
            };


            let acquireTokenByCode = await pca.acquireTokenByCode(tokenRequest);
            const accessToken = acquireTokenByCode.accessToken;

            // let acquireTokenByClientCredential = await cca.acquireTokenByClientCredential(tokenRequest_Client);
            // const clientAccessToken  = acquireTokenByClientCredential.accessToken;

            // console.log(accessToken, "access token")

            const client = new params.Client.init({
                authProvider: (done) => {
                    done(null, accessToken);
                },
            });


            const userinfo = await client.api('https://graph.microsoft.com/v1.0/me').get();

            console.log(userinfo, "user info")

            let cnn = params.modules.mssql;
            let modelo_usuario = new cnn.Model("usuario", params);
            let usuario_creado = await modelo_usuario.where([
                {
                    field: "correo",
                    value: userinfo.mail
                }
            ]);

            if (usuario_creado.data.length > 0) {
                console.log(usuario_creado.data[0], "estoy creado")
                res.render("../" + params.folders.viewsDragon + "/base/indexclean.ejs",
                    {
                        DATA: usuario_creado.data[0],
                        params: params,
                        scope: req.query.scope,
                        url: req.originalUrl,
                        user_info: usuario_creado.data[0],
                        allinfo: userinfo
                    });
            } else {
                let user_info = {
                    nombre: userinfo.givenName || userinfo.displayName,
                    apellido: userinfo.surname,
                    correo: userinfo.mail,
                    password: "572011BACE358A0A6AC4B3760DB7228E",
                    confirmpassword: "572011BACE358A0A6AC4B3760DB7228E",
                    active: 1,
                    allinfo: userinfo
                };
                await cnn.data(`INSERT INTO usuario (nombre, apellido, correo, password, repeatPassword, profile, active ) values('${(userinfo.givenName || userinfo.displayName) + ''}', '${userinfo.surname || ''}', '${userinfo.mail}', '572011BACE358A0A6AC4B3760DB7228E', '572011BACE358A0A6AC4B3760DB7228E', 1, 1) `, params, false);
                //let nuevo_usuario = await modelo_usuario.where([
                //     {
                //         field: "correo",
                //         value: userinfo.mail
                //     }
                // ]);
                res.render("../" + params.folders.viewsDragon + "/base/indexclean.ejs",
                    {
                        DATA: user_info,
                        params: params,
                        scope: req.query.scope,
                        url: req.originalUrl,
                        user_info: user_info
                    });
            }
        }


    });
    params.app.get("/files/restart/", function (req, res) {
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");
            var configFolder = params.folders.config;
            var file = __dirname + '/../' + configFolder + '/' + 'z_restart.json';
            fs.writeFile(file, "{\"restart\":" + new Date().getTime() + "}", function (res, data) {
                if (res) {
                    res.json({error: err});
                }
            });
            res.json({error: false, saved: true});
        }).catch(function () {
        });
    });
    params.app.get("/files/api/", function (req, res) {
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");
            var folder = req.query.folder;
            var realPath = params.folders.files + "/" + folder;
            try {
                if (fs.existsSync(realPath)) {
                    if (fs.statSync(realPath).isDirectory()) {
                        var files = fs.readdirSync(realPath);
                        files = files.filter(function (file) {
                            return file.indexOf(".zip") === -1 && file.indexOf("dragonfile.zip") === -1;
                        });
                        res.json({root: realPath, files: files, count: files.length});
                    } else {
                        res.json({root: realPath, files: [], count: 0, error: "Is Not Directory"});
                    }
                } else {
                    res.json({root: realPath, files: [], count: 0, error: "Is Not Directory"});
                }
            } catch (err) {
                console.log(err);
                res.json({root: realPath, files: [], count: 0, error: {catch: err}});
            }
            res.json({root: realPath, files: [], count: 0});
        }).catch(function () {
            // errorNoControl(res.statusCode, globalToke.user||'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });
    params.app.get("/generalfiles/api/", function (req, res) {
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");
            var folder = req.query.folder;
            var realPath = params.folders.files + "/" + folder;
            try {
                if (fs.existsSync(realPath)) {
                    if (fs.statSync(realPath).isDirectory()) {
                        var files = fs.readdirSync(realPath);
                        files = files.filter(function (file) {
                            return file.indexOf("dragonfile.zip") === -1;
                        });
                        res.json({root: realPath, files: files, count: files.length});
                    } else {
                        res.json({root: realPath, files: [], count: 0, error: "Is Not Directory"});
                    }
                } else {
                    res.json({root: realPath, files: [], count: 0, error: "Is Not Directory"});
                }
            } catch (err) {
                console.log(err);
                res.json({root: realPath, files: [], count: 0, error: {catch: err}});
            }
            res.json({root: realPath, files: [], count: 0});
        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });
    params.app.post("/files/api/delete", async function (req, res) {
        params.secure.check(req, res).then(async function (token) {
            globalToke = token;
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");
            var files = req.body.filename;
            var info = {deleted: [], error: []};
            for (var file of files) {
                try {
                    var filename = __dirname + '/..' + params.S(decodeURIComponent(file)).replaceAll('/', '\\');
                    if (fs.lstatSync(filename).isDirectory()) {
                        params.rimraf.sync(filename);
                    } else {
                        await fs.unlinkSync(filename);
                    }
                    info.deleted.push(file);
                } catch (err) {
                    info.error.push(file);
                }
            }
            res.json(info);
        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });
    params.app.get("/files/api/download", async function (req, res) {
        params.secure.check(req, res).then(async function (token) {
            try {
                if (!token.apptoken) {
                    res.json(token);
                    return;
                }
                var fs = params.fs || require("fs");
                var folder = req.query.folder;
                var name = req.query.name;
                var file = params.folders.files + "/" + folder + "/" + name.replaceAll("/", "-").replaceAll(" ", "_");


                if (fs.existsSync(file)) {
                    await fs.unlinkSync(file);
                    console.log("archivito borrado", file);

                }
                console.log("carpeta compri", params.folders.files + "/" + folder + "/");

                params.zipdir(params.folders.files + "/" + folder + "/", {
                    saveTo: file,
                    filter: (path, stat) => !/\.zip$/.test(path)
                }, function (err, buffer) {
                    if (err) {
                        res.json({zipped: err});
                    }
                    res.json({zipped: true});
                });
            } catch (err) {
                if (err) {
                    res.json({zipped: err});
                }
            }
        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });
    params.app.post("/files/api/import", async function (req, res) {
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");
            var files = req.body.filename;
            var dirfile = __dirname + '/..' + params.S(files[0]).replaceAll('/', '\\');

            // if (!fs.existsSync(dirfile))
            //     params.shelljs.mkdir('-p', dirfile);

            params.csvtojson().fromFile(dirfile).then((jsonObj) => {
                res.json(jsonObj);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });
    params.app.post("/files/api/moveone", async function (req, res) {
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");
            var from = req.body.fromFolder;
            var to = req.body.toFolder;
            fs.renameSync(from, to);
            res.json(info);
        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });
    params.app.post("/files/api/exist", async function (req, res) {
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");
            if (!fs.existsSync(req.body.path))
                res.json({success: true});
            res.json({success: false});
        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });
    params.app.post("/files/api/move", async function (req, res) {
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");
            var verarray = [];
            var errors = [];
            var success = [];
            try {
                for (var transfer of req.body.moves) {
                    if (fs.statSync(transfer.from).isDirectory()) {

                        if (!fs.existsSync(transfer.from))
                            params.shelljs.mkdir('-p', transfer.from);

                        if (!fs.existsSync(transfer.to))
                            params.shelljs.mkdir('-p', transfer.to);

                        var files = fs.readdirSync(transfer.from);
                        for (const file of files) {
                            verarray.push({from: file, to: transfer.to});
                            fs.renameSync(transfer.from + "/" + file, transfer.to + "/" + file);
                        }
                        success.push({success: true, arr: verarray});
                    } else {
                        errors.push({root: realPath, files: [], count: 0, error: "Is Not Directory"});
                    }
                }
            } catch (err) {
                console.log(err);
                res.json({success: false, errors: errors, fines: success});
            }
            res.json({success: true});
        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });

    params.app.post("/files/api/copy", async function (req, res) {
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");
            var verarray = [];
            var errors = [];
            var success = [];
            try {
                for (var transfer of req.body.moves) {
                    if (fs.statSync(transfer.from).isDirectory()) {

                        if (!fs.existsSync(transfer.from))
                            params.shelljs.mkdir('-p', transfer.from);

                        if (!fs.existsSync(transfer.to))
                            params.shelljs.mkdir('-p', transfer.to);

                        var files = fs.readdirSync(transfer.from);
                        for (const file of files) {
                            verarray.push({from: file, to: transfer.to});
                            fs.copyFileSync(transfer.from + "/" + file, transfer.to + "/" + file);
                        }
                        success.push({success: true, arr: verarray});
                    } else {
                        errors.push({root: realPath, files: [], count: 0, error: "Is Not Directory"});
                    }
                }
            } catch (err) {
                console.log(err);
                res.json({success: false, errors: errors, fines: success});
            }
            res.json({success: true});
        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });
    params.app.post("/files/api/upload", params.upload.array('toupload', 100), function (req, res, next) {
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");
            // var msopdf = params.msopdf;
            //
            // msopdf(null, function(error, office) {
            //     if (error) {
            //         console.log("Init failed", error);
            //         return;
            //     }
            //     office.excel({input: "files/indicador_resultado_pei/META43/Resumen_Indicador_PEI.xls___124a7ded6bc46cd85530562f6f6578ea.xls", output: "files/indicador_resultado_pei/META43/Resumen_POA.xls___eae5c27bc1b9a775f2cb141e618f3c7c.pdf"}, function(error, pdf) {
            //         if (error) {
            //             console.log("Woops", error);
            //         } else {
            //             console.log("Saved to", pdf);
            //         }
            //     });
            //
            //     office.close(null, function(error) {
            //         if (error) {
            //             console.log("Woops", error);
            //         } else {
            //             console.log("Finished & closed");
            //         }
            //     });
            // });
            var uploaded = [];
            for (var file of req.files) {
                var ext = file.originalname.split('.');
                ext = "." + ext[ext.length - 1];
                var dir = __dirname + '/../' + params.folders.files + '/' + req.body.folder;
                console.log(dir);
                if (!fs.existsSync(dir))
                    params.shelljs.mkdir('-p', dir);
                let clean = file.filename.replace(/[^a-zA-Z ]/g, "");
                var filename = dir + "/" + (file.originalname + '___' + clean + '___' + new Date().getTime() + '___' + (req.body.user || '1') + ext);
                if (req.body.filename !== '' && req.body.filename !== undefined) {
                    filename = dir + "/" + req.body.filename.replace(/[^a-zA-Z ]/g, "");
                }
                uploaded.push(filename);
                if (!fs.existsSync(dir))
                    params.shelljs.mkdir('-p', dir);

                fs.renameSync(file.path, filename);
            }
            res.json({uploaded: uploaded});
        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });
    params.app.get("/xlsjson/", function (req, res) {
        params.secure.check(req, res).then(async function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");
            let clean = req.query.filename;
            console.log("gasby", clean);
            let workbook = params.XLSX.readFile(clean);
            var sheet_name_list = workbook.SheetNames;
            var superdata = {};
            var supercolumns = {};
            sheet_name_list.forEach((y) => {
                var worksheet = workbook.Sheets[y];
                var headers = {};
                var data = [];
                for (z in worksheet) {
                    if (z[0] === '!') continue;
                    //parse out the column, row, and value
                    var tt = 0;
                    for (var i = 0; i < z.length; i++) {
                        if (!isNaN(z[i])) {
                            tt = i;
                            break;
                        }
                    }
                    var col = z.substring(0, tt);
                    var row = parseInt(z.substring(tt));
                    var value = worksheet[z].v;
                    //store header names
                    if (row == 1 && value) {
                        headers[col] = value;
                        continue;
                    }

                    if (!data[row])
                        data[row] = {};
                    data[row][headers[col]] = (value === 0 ? 0 : value || "");
                }
                //drop those first two rows which are empty
                data.shift();
                data.shift();
                superdata[y] = data;
                supercolumns[y] = Object.values(headers);
            });
            res.json({excel: superdata, mapping: supercolumns});

        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });
    params.app.post('/email/send', function (req, res) {
        params.secure.check(req, res).then(async function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            try {
                var transporter = params.mail.createTransport(params.CONFIG.smtp);
                var options = params.CONFIG.smptOptions;
                var from = req.body.from || options.sender;
                var name = req.body.name || options.name;
                if (!req.body.to)
                    res.json({error: "mailneedreceivers", success: false});
                if (!req.body.subject)
                    res.json({error: "mailneedsubject", success: false});
                if (!req.body.html && !req.body.text && !req.body.template)
                    res.json({error: "mailneedbody", success: false});
                var mailOptions = {
                    from: `"${name}" ${from}`,
                    to: req.body.to,
                    subject: req.body.subject
                };
                if (req.body.cc) {
                    mailOptions.cc = req.body.cc;
                }
                if (req.body.bcc) {
                    mailOptions.bcc = req.body.bcc;
                }
                if (req.body.text) {
                    mailOptions.text = req.body.text;
                    try {
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                res.json({error: error, success: false});
                            }
                            res.json({success: true});
                        });
                    } catch (e) {
                        res.json({error: true, success: false, message: e});
                    }
                }
                if (req.body.html) {
                    mailOptions.html = req.body.html;
                    try {
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                res.json({error: error, success: false});
                            }
                            res.json({success: true});
                        });
                    } catch (e) {
                        res.json({error: true, success: false, message: e});
                    }
                }
                if (req.body.template) {
                    params.app.render("../" + params.folders.viewsDragon + "/templates/" + req.body.template,
                        {
                            session: params.session,
                            CONFIG: params.CONFIG,
                            LANGUAGE: params.LANGUAGE,
                            SHOWLANGS: params.SHOWLANGS,
                            COLOR: params.CONFIG.ui.colors,
                            models: models,
                            FOLDERS: params.folders,
                            DATA: req.body.fields,
                        }, function (err, html) {
                            if (err) {
                                res.json({error: err, html: html});
                                return;
                            }
                            mailOptions.html = html;
                            try {
                                transporter.sendMail(mailOptions, (error, info) => {
                                    if (error) {
                                        res.json({error: error, success: false});
                                    } else
                                        res.json({success: true});
                                });
                            } catch (e) {
                                res.json({error: true, success: false, message: e});
                            }
                        }
                    );
                }
            } catch (e) {
                res.json({success: false, message: e});
            }
        }).catch(function () {
            //errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });

    params.app.post('/email/sendfree', function (req, res) {
        try {
            var transporter = params.mail.createTransport(params.CONFIG.smtp);
            var options = params.CONFIG.smptOptions;
            var from = req.body.from || options.sender;
            var name = req.body.name || options.name;
            if (!req.body.to)
                res.json({error: "mailneedreceivers", success: false});
            if (!req.body.subject)
                res.json({error: "mailneedsubject", success: false});
            if (!req.body.html && !req.body.text && !req.body.template)
                res.json({error: "mailneedbody", success: false});
            var mailOptions = {
                from: `"${name}" ${from}`,
                to: req.body.to,
                subject: req.body.subject
            };
            if (req.body.cc) {
                mailOptions.cc = req.body.cc;
            }
            if (req.body.bcc) {
                mailOptions.bcc = req.body.bcc;
            }
            if (req.body.text) {
                mailOptions.text = req.body.text;
                try {
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            res.json({error: error, success: false});
                        }
                        res.json({success: true});
                    });
                } catch (e) {
                    res.json({error: true, success: false, message: e});
                }
            }
            if (req.body.html) {
                mailOptions.html = req.body.html;
                try {
                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            res.json({error: error, success: false});
                        }
                        res.json({success: true});
                    });
                } catch (e) {
                    res.json({error: true, success: false, message: e});
                }
            }
            if (req.body.template) {
                params.app.render("../" + params.folders.viewsDragon + "/templates/" + req.body.template,
                    {
                        session: params.session,
                        CONFIG: params.CONFIG,
                        LANGUAGE: params.LANGUAGE,
                        SHOWLANGS: params.SHOWLANGS,
                        COLOR: params.CONFIG.ui.colors,
                        models: models,
                        FOLDERS: params.folders,
                        DATA: req.body.fields,
                    }, function (err, html) {
                        if (err) {
                            res.json({error: err, html: html});
                            return;
                        }
                        mailOptions.html = html;
                        try {
                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    res.json({error: error, success: false});
                                } else
                                    res.json({success: true});
                            });
                        } catch (e) {
                            res.json({error: true, success: false, message: e});
                        }
                    }
                );
            }
        } catch (e) {
            res.json({success: false, message: e});
        }
    });
    ofuscar = function (file) {
        var result = "";
        for (var chart of file) {
            result += String.fromCharCode(chart.charCodeAt(0) + 1);
        }
        return result;
    }

    params.app.post("/CBS/api/saveConfigSuper", async function (req, res) {
        params.secure.check(req, res).then(async function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");
            var configFolder = params.CONFIG.mode === "developer" ? params.folders.config : `${params.folders.eviroments}/${params.CONFIG.mode}`;
            var file = __dirname + '/../' + configFolder + '/' + 'appcomp.json';
            req.body.json = params.S(req.body.json).replaceAll("&#39;", "'").s;
            req.body.json = params.S(req.body.json).replaceAll("&#34;", "\"").s;
            req.body.json = params.S(req.body.json).replaceAll("&lt;", "<").s;
            req.body.json = params.S(req.body.json).replaceAll("&gt;", ">").s;
            params.S(req.body.json).replaceAll("llaveappcomp", "ofuscadito").s;


            fs.writeFile(file, ofuscar(req.body.json), function (err, data) {
                if (err) {
                    res.json({error: err});
                }
            });
            res.json({error: false, saved: true});
        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });
    params.app.post("/dragon/api/saveConfig", function (req, res) {
        params.secure.check(req, res).then(async function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");

            var configFolder = params.CONFIG.mode === "developer" ? params.folders.config : `${params.folders.eviroments}/${params.CONFIG.mode}`;
            var file = __dirname + '/../' + configFolder + '/' + 'z_saved.json';

            req.body.json = params.S(req.body.json).replaceAll("&#39;", "'").s;
            req.body.json = params.S(req.body.json).replaceAll("&#34;", "\"").s;
            req.body.json = params.S(req.body.json).replaceAll("&lt;", "<").s;
            req.body.json = params.S(req.body.json).replaceAll("&gt;", ">").s;

            fs.writeFile(file, req.body.json, function (err, data) {
                if (err) {
                    res.json({error: err});
                }
            });
            res.json({error: false, saved: true});
        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });
    params.app.post("/dragon/api/saveLanguages", function (req, res) {
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");

            var languages = eval("(" + req.body.json + ")");
            for (var lan in languages) {
                var dirlan = __dirname + '/../' + params.folders.language + '/' + lan;
                if (!fs.existsSync(dirlan))
                    params.shelljs.mkdir('-p', dirlan);
                for (var section in languages[lan]) {
                    var dirsec = __dirname + '/../' + params.folders.language + '/' + lan + '/' + section;
                    if (!fs.existsSync(dirsec))
                        params.shelljs.mkdir('-p', dirsec);

                    var file = __dirname + '/../' + params.folders.language + '/' + lan + '/' + section + '/' + 'index.json';
                    fs.writeFile(file, JSON.stringify(languages[lan][section]), function (err, data) {
                        if (err) {
                            res.json({error: err});
                        }
                    });
                }
            }
            res.json({error: false, saved: true});
        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });
    params.app.post("/dragon/api/generateMobile", function (req, res) {
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var fs = params.fs || require("fs");
            var languages = eval("(" + req.body.json + ")");
            for (var lan in languages) {
                var dirlan = __dirname + '/../' + params.folders.language + '/' + lan;
                if (!fs.existsSync(dirlan))
                    params.shelljs.mkdir('-p', dirlan);
                for (var section in languages[lan]) {
                    var dirsec = __dirname + '/../' + params.folders.language + '/' + lan + '/' + section;
                    if (!fs.existsSync(dirsec))
                        params.shelljs.mkdir('-p', dirsec);

                    var file = __dirname + '/../' + params.folders.language + '/' + lan + '/' + section + '/' + 'index.json';
                    fs.writeFile(file, JSON.stringify(languages[lan][section]), function (err, data) {
                        if (err) {
                            res.json({error: err});
                        }
                    });
                }
            }
            res.json({error: false, saved: true});
        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });
    params.app.get("/cognitiveservices/api/", function (req, res) {
        params.secure.check(req, res).then(async function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            var accessToken = await getAccessToken(params);
            await textToSpeech(accessToken, req.query.text, params, req.query.lan);
            res.json({success: true});
        }).catch(function () {
            errorNoControl(res.statusCode, globalToke ? (globalToke.user || 'N/A') : 'N/A', globalToke ? (globalToke.getURL || 'N/A') : 'N/A');
        });
    });

    exports.loadEJSSimple("./" + params.folders.viewsDragon + "/master/error", "error", params);
};
