function desofuscar(file) {
    if (file.indexOf("#bqqObnf#") !== -1) {
        var result = "";
        for (var chart of file) {
            result += String.fromCharCode(chart.charCodeAt(0) - 1);
        }
        return result;
    } else
        return file;
}

var mergeObject = function (from, to) {
    for (var i in from) {
        if (to.hasOwnProperty(i)) {
            if (typeof to[i] === 'object') {
                mergeObject(from[i], to[i])
            } else {
                to[i] = from[i]
            }
        } else {
            to[i] = from[i]
        }
    }
};
var getFiles = function (dir, filelist, prefix) {
    var fs = fs || require("fs"), files = fs.readdirSync(dir);
    filelist = filelist || [];
    prefix = prefix || "";
    files.forEach(function (file) {
        if (fs.statSync(dir + "/" + file).isDirectory()) {
            filelist = getFiles(dir + "/" + file, filelist, prefix + file + "/")
        } else {
            filelist.push(prefix + file)
        }
    });
    return filelist
};
var folders = {
    models: "2-procedures",
    service: "1-service",
    controllers: "3-controllers",
    controllersBase: "7-plugins/application/controllers",
    customControl: "7-plugins/templates/form",
    crudBase: "7-plugins/application/cruds",
    crud: "4-crud",
    views: "5-views",
    viewsDragon: "7-plugins",
    endpoints: "9-endpoints",
    fields: "7-plugins/templates/form",
    silents: "7-plugins/templates/system/view",
    master: "7-plugins/master",
    language: "6-language",
    scripts: "scripts",
    modules: "modules",
    config: "0-config",
    eviroments: "8-enviroments",
    configBase: "7-plugins/application/config",
    styles: "styles",
    server: "server",
    files: "files",
    themesTemplate: "7-plugins/templates/system/color.ejs",
    themes: "files/configuration/themes",
    tasks: "11-tasks",
    menu: "8-enviroments/QA/appearance/menu.json",
    menuDeveloper: "0-config/appearance/menu.json",
    menus_privado: "8-enviroments/QA/appearance/menu_privado.json"
};
var express = require('express');
var compression = require('compression');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var http = require('http');
var https = require('https');
const fs = require("fs");
const session = require("express-session");
const cors = require("cors");
const {Client} = require("@microsoft/microsoft-graph-client");
const {PublicClientApplication, ConfidentialClientApplication} = require("@azure/msal-node");

var CONFIG = {};
configs = getFiles("./" + folders.configBase + "/");
configs = configs.filter(function (file) {
    return file.indexOf('.disabled') === -1
});
configs.forEach(function (config) {
    var file = eval("(" + fs.readFileSync(folders.configBase + "/" + config) + ")");
    mergeObject(file, CONFIG)
});
configs = getFiles("./" + folders.config + "/");
configs = configs.filter(function (file) {
    return file.indexOf('.disabled') === -1
});
configs.forEach(function (config) {
    var fileContent = fs.readFileSync(folders.config + "/" + config) + "";
    var file = eval("(" + desofuscar(fileContent) + ")");
    mergeObject(file, CONFIG)
});
var configMode = CONFIG.mode === "developer" ? folders.config : `${folders.eviroments}/${CONFIG.mode}`;
var CONFIG = {};
configs = getFiles("./" + folders.configBase + "/");
configs = configs.filter(function (file) {
    return file.indexOf('.disabled') === -1;
});
configs.forEach(function (config) {
    var fileContent = fs.readFileSync(folders.configBase + "/" + config) + "";
    var file = eval("(" + desofuscar(fileContent) + ")");
    mergeObject(file, CONFIG);
});
configs = getFiles("./" + configMode + "/");
configs = configs.filter(function (file) {
    return file.indexOf('.disabled') === -1;
});
configs.forEach(function (config) {
    var fileContent = fs.readFileSync(configMode + "/" + config) + "";
    var file = eval("(" + desofuscar(fileContent) + ")");
    mergeObject(file, CONFIG);
});
var app = express();
app.use(compression());
folderslash = "/" + "Dragon";
console.log(__dirname);
app.use(folderslash, express.static(__dirname + "\\12-down"));
app.use(express.static(__dirname));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: false, limit: '100mb'}));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.json({type: "application/vnd.api+json"}));
app.use(methodOverride());
console.log(CONFIG.port);
var httpServer = CONFIG.ssl ? https.createServer({
    pfx: fs.readFileSync('server.pfx'),
    passphrase: CONFIG.passphrase
}, app) : http.createServer(app);

httpServer.listen(CONFIG.port);
