if (process)
    if (process.stdout)
        if (process.stdout.getWindowSize) {
            var lines = process.stdout.getWindowSize()[1];
            for (var i = 0; i < lines; i++) console.log("\r\n");
        }

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
var modules = {}, controls = [], localjs = [], localModules = [], localModulesVars = [], modulesList = [],
    developer = {}, themes = [], tasks = {}, taskList = [];
var fs = require("fs");
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
var getFilesContent = function (dir, controltemplates, prefix) {
    var fs = fs || require("fs"), files = fs.readdirSync(dir);
    files.forEach(function (file) {
        let thisfile = fs.readFileSync(dir + (file));
        controltemplates += `${file.replace('.ejs', '')}111111111${thisfile.toString()}999999999`;
    });
    return controltemplates;
};

var controltemplates = "";
controltemplates = getFilesContent("./" + folders.customControl + "/", controltemplates);

var mergeObject = function (from, to) {
    for (var i in from) {
        if (to.hasOwnProperty(i)) {
            if (Array.isArray(from[i]) && Array.isArray(to[i])) {
                to[i] = to[i].concat(from[i]);
            } else if (typeof to[i] === 'object') {
                mergeObject(from[i], to[i])
            } else {
                to[i] = from[i]
            }
        } else {
            to[i] = from[i]
        }
    }
};
var CONFIG = {};
var ENDPOINTS = {};
var LANGUAGE = {};
endpoints = getFiles("./" + folders.endpoints + "/");
endpoints = endpoints.filter(function (file) {
    return file.indexOf('.disabled') === -1
});
endpoints.forEach(function (endpoint) {
    var file = eval("(" + fs.readFileSync(folders.endpoints + "/" + endpoint) + ")");
    mergeObject(file, ENDPOINTS)
});
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
for (var i in CONFIG.modules) {
    var module = CONFIG.modules[i];
    localModules.push(module.module);
    localModulesVars.push(module.var);
    eval("var " + module.var + " = require('" + module.module + "');");
}
if (CONFIG.mysqlactive)
    mysql = MysqlPoolBooster(mysql);
languages = getFiles("./" + folders.language + "/");
languages = languages.filter(function (file) {
    return file.indexOf('.disabled') === -1;
});
languages.forEach(function (languages) {
    var lan = eval("(" + fs.readFileSync(folders.language + "/" + languages) + ")");
    var nedted = "";
    for (var lany of languages.split('/')) {
        if (lany.indexOf('.json') === -1) eval(`if (LANGUAGE.${nedted + lany} === undefined) LANGUAGE.${nedted + lany} = {};`); else {
            mergeObject(lan, eval(`LANGUAGE.${nedted.substr(0, nedted.length - 1)}`));
        }
        nedted += `${lany}.`;
    }
});
THEMES = getFiles("./" + folders.themes + "/");
themes = [];
THEMES.forEach(function (theme) {
    themes.push({name: theme.replace('.css', ''), code: theme.replace('.css', ''), css: theme});
});
var ThemeTemplate = fs.readFileSync(folders.themesTemplate).toString();
shadesMonochrome = function (color, name, shadesBlocks, allow) {
    var colors = [];
    var hsl = tinycolor(color).toHsl();
    var index = 1;
    for (var i = 9.5; i >= 0.5; i -= 1) {
        hsl.l = 0.1 * i;
        colors[index] = tinycolor(hsl).toHexString();
        index++;
    }
    var shades = {};
    shades.text1 = CONFIG.ui.theme.text1;
    shades.text2 = CONFIG.ui.theme.text2;
    shades.text3 = CONFIG.ui.theme.text3;
    shades.name = name;
    var shadesArray = shadesBlocks.split(',');
    eval(`shades.color0 = '${color}';`);
    for (var i in shadesArray) {
        if (shadesArray[i] == 0 || !allow) {
            eval(`shades.color${parseInt(i) + 1} = '#${color}';`);
        } else {
            eval(`shades.color${parseInt(i) + 1} = colors[${shadesArray[i]}];`);
        }
    }
    return shades;
};
var onerandom = tinycolor.random().toHexString();
var onerandom2 = tinycolor.random().toHexString();
if (CONFIG.ui.theme.primary === "random") CONFIG.ui.theme.primary = onerandom;
if (CONFIG.ui.theme.secundary === "random") CONFIG.ui.theme.secundary = onerandom;
if (CONFIG.ui.theme.extra === "random") CONFIG.ui.theme.extra = onerandom;
if (CONFIG.ui.theme.primary === "random2") CONFIG.ui.theme.primary = onerandom2;
if (CONFIG.ui.theme.secundary === "random2") CONFIG.ui.theme.secundary = onerandom2;
if (CONFIG.ui.theme.extra === "random2") CONFIG.ui.theme.extra = onerandom2;

primary = ejs.compile(ThemeTemplate, {})({DATA: shadesMonochrome(CONFIG.ui.theme.primary, 'primary', CONFIG.ui.shadows[CONFIG.ui.theme.primaryShades], CONFIG.ui.theme.shadowcrome)});
secundary = ejs.compile(ThemeTemplate, {})({DATA: shadesMonochrome(CONFIG.ui.theme.secundary, 'secundary', CONFIG.ui.shadows[CONFIG.ui.theme.secundaryShades], CONFIG.ui.theme.shadowcrome)});
extra = ejs.compile(ThemeTemplate, {})({DATA: shadesMonochrome(CONFIG.ui.theme.extra, 'extra', CONFIG.ui.shadows[CONFIG.ui.theme.extraShades], CONFIG.ui.theme.shadowcrome)});

fs.writeFileSync(folders.themes + "/primary.css", primary);
fs.writeFileSync(folders.themes + "/secundary.css", secundary);
fs.writeFileSync(folders.themes + "/extra.css", extra);
if (CONFIG.domain === true) {
    var ifaces = os.networkInterfaces();
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                return;
            }
            if (alias >= 1) {
                CONFIG.domain = iface.address;
            } else {
                CONFIG.domain = iface.address;
            }
            ++alias;
        });
    });
}
storage.init({
    dir: CONFIG.storage,
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    logging: false,
    ttl: false,
    expiredInterval: 2 * 60 * 1000,
    forgiveParseErrors: false
});
SHOWLANGS = [];
SHOWLANGSConsole = [];
for (var lan of CONFIG.languages) SHOWLANGSConsole.push(lan.name);
SHOWLANGS = CONFIG.languages;
if (CONFIG.oracle !== undefined) oracle.autoCommit = true;
var upload = multer({dest: folders.files + '/uploads/'});
var jsoncsv = require('express-json-csv')(express);
localModulesVars.push("jsoncsv");

const {Client} = require("@microsoft/microsoft-graph-client");
const {PublicClientApplication, ConfidentialClientApplication} = require("@azure/msal-node");
const isomorphicFetch = require('isomorphic-fetch');
var filesmodules = fs.readdirSync("./" + folders.modules + "/");
for (var i in filesmodules) {
    var file = filesmodules[i];
    modulesList.push(file.replace(".js", "").replace("BASE_", ""));
    eval("modules." + file.replace(".js", "").replace("BASE_", "") + " = require('./" + folders.modules + "/" + file + "');");
}
var filestasks = fs.readdirSync("./" + folders.tasks + "/");
for (var i in filestasks) {
    var file = filestasks[i];
    taskList.push(file.replace(".js", "").replace("", ""));
    eval("tasks." + file.replace(".js", "").replace("", "") + " = require('./" + folders.tasks + "/" + file + "');");
}
localStyles = getFiles("./" + folders.styles + "/");
localjs = getFiles("./" + folders.scripts + "/");
controls = getFiles("./" + folders.fields + "/");
localserver = getFiles("./" + folders.server + "/");
controllersjs = getFiles("./" + folders.controllersBase + "/");
for (var ctr in controllersjs) controllersjs[ctr] = folders.controllersBase + "/" + controllersjs[ctr];
controllersjsCustom = getFiles("./" + folders.controllers + "/");
for (var ctr in controllersjsCustom) controllersjsCustom[ctr] = folders.controllers + "/" + controllersjsCustom[ctr];
for (var ctr of controllersjsCustom) controllersjs.push(ctr);
crudjs = getFiles("./" + folders.crudBase + "/");
for (var ctr in crudjs) crudjs[ctr] = folders.crudBase + "/" + crudjs[ctr];
crudCustom = getFiles("./" + folders.crud + "/");
for (var ctr in crudCustom) crudCustom[ctr] = folders.crud + "/" + crudCustom[ctr];
for (var ctr of crudCustom) crudjs.push(ctr);

var app = express();
app.use(compression());
if (CONFIG.mongo !== undefined) mongoose.connect(CONFIG.mongo);
CONFIG.folderslash = "/" + CONFIG.folder;
app.use(CONFIG.folderslash, express.static(__dirname));
app.use(express.static(__dirname));
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: false, limit: '100mb'}));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.json({type: "application/vnd.api+json"}));
console.log(modules);
app.use(cors({
    origin: '*'
}));
app.use(methodOverride());
app.use(session({
    secret: CONFIG.appKey,
    resave: false,
    saveUninitialized: false,
}));

app.set("view engine", "ejs");
app.set("layouts", "./" + folders.master);
var textbg = CONFIG.ui.console.bg.replace("bg", "").toLowerCase();
colors.setTheme({
    pxz: [CONFIG.ui.console.text, CONFIG.ui.console.bg],
    pxz2: ["white", CONFIG.ui.console.bg],
    pxz3: [CONFIG.ui.console.text, "bgWhite"],
    normal1: ["white", "bgBlack"],
    normal2: [CONFIG.ui.console.text, "bgBlack"],
    vacio: [textbg, CONFIG.ui.console.bg],
    error: ["red", "underline"],
    success: ["green", "bgWhite"],
    info: ["cyan", "bgBlue"],
    warning: ["yellow", "bgRed"]
});
var allparams = "{";
allparams += "      app: app,";
allparams += "      dir: __dirname,";
for (var i in modulesList) {
    var name = modulesList[i];
    allparams += "      " + name + ":modules." + name + ",";
}
for (var i in localModulesVars) {
    var name = localModulesVars[i];
    allparams += "      " + name + ":" + name + ",";
}
currencies = [];
hints = [];
{
    allparams += "      Client: Client,";
    allparams += "      PublicClientApplication: PublicClientApplication,";
    allparams += "      ConfidentialClientApplication: ConfidentialClientApplication,";
    allparams += "      isomorphicFetch: isomorphicFetch,";
    allparams += "      collections: collections,";
    allparams += "      controltemplates: controltemplates,";
    allparams += "      scope: '@model@',";
    allparams += "      currencies:currencies,";
    allparams += "      hints:hints,";
    allparams += "      modules:modules,";
    allparams += "      storage:storage,";
    allparams += "      http:http,";
    allparams += "      https:https,";
    allparams += "      fetch :fetch,";
    allparams += "      secure:secure,";
    allparams += "      themes:themes,";
    allparams += "      fs:fs,";
    allparams += "      jwt:jwt,";
    allparams += "      rimraf:rimraf,";
    allparams += "      localjs:localjs,";
    allparams += "      controls:controls,";
    allparams += "      localStyles:localStyles,";
    allparams += "      controllersjs:controllersjs,";
    allparams += "      localserver:localserver,";
    allparams += "      upload:upload,";
    allparams += "      crudjs:crudjs,";
    allparams += "      models:models,";
    allparams += "      mssql:mssql,";
    allparams += "      mysql:mysql,";
    allparams += "      postgre:postgre,";
    allparams += "      lacone:lacone,";
    allparams += "      cacheobjects:cacheobjects,";
    if (CONFIG.oracle !== undefined) allparams += "      oracle:oracle,";
    allparams += "      CONFIG:CONFIG,";
    allparams += "      ENDPOINTS:ENDPOINTS,";
    allparams += "      LANGUAGE:LANGUAGE,";
    allparams += "      SHOWLANGS:SHOWLANGS,";
    allparams += "      OneSignal:OneSignal,";
    allparams += "      catalogs:catalogs,";
    allparams += "      mail:mail,";
    allparams += "      folders:folders,";
    allparams += "      servicesFunctions:servicesFunctions,";
    allparams += "      app:app,";
    if (CONFIG.mongo) allparams += "  mongoose:mongoose,";
    if (CONFIG.mssql) allparams += "  modelsql:modelsql,";
    if (CONFIG.mysqlactive) allparams += "  modelmysql:modelmysql,";
    if (CONFIG.postgreactive) allparams += "  modelpostgre:modelpostgre,";
    if (CONFIG.oracle) allparams += "  modeloracle:modeloracle,";
    if (true) allparams += "  modelstorage:modelstorage,";
    allparams += "}";
}
var secure = {};
for (var i in CONFIG.routes.notoken) {
    CONFIG.routes.notoken[i] = eval('`' + CONFIG.routes.notoken[i] + '`;');
}
var userIDClient = 0;
var getURL = "";
secure.check = (req, res) => new Promise((resolve, reject) => {
    userIDClient = req.headers['x-access-userid'] || 0;
    getURL = req.headers['x-access-geturl'] || "";
    if (!CONFIG.features.token) {
        resolve({apptoken: true, user: userIDClient, getURL: getURL, message: 'valid', code: "3"});
    }
    var path = req.originalUrl;
    var realPath = path.split("?")[0];
    if (CONFIG.routes.notoken.indexOf(realPath) !== -1) {
        resolve({apptoken: true, user: userIDClient, getURL: getURL, message: 'valid', code: "3"});
    }
    let token = req.headers['x-access-token'] || req.headers['authorization'] || "";
    userIDClient = req.headers['x-access-userid'] || 0;
    getURL = req.headers['x-access-geturl'] || "";
    if (token) {
        jwt.verify(token, CONFIG.appKey, (err, decoded) => {
            if (err) {
                req.decoded = decoded;
                resolve({
                    apptoken: false,
                    user: userIDClient,
                    getURL: getURL,
                    message: 'Token is not valid',
                    url: realPath,
                    code: "2"
                });
            } else {
                req.decoded = decoded;
                resolve({apptoken: true, user: userIDClient, getURL: getURL, message: 'valid', code: "3"});
            }
        });
    } else {
        req.decoded = decoded;
        resolve({
            apptoken: false,
            user: userIDClient,
            getURL: getURL,
            message: 'Auth token is not supplied',
            url: realPath,
            code: "1"
        });
    }
});
var models = [], modelsql = [], modelmysql = [], modeloracle = [], modelstorage = [], modelpostgre = [];
var collections = {}, collectionsql = {};
loadedMotors = 0;
cacheobjects = undefined;
console.log(CONFIG.appName.pxz + " Server Engine's:".pxz);
lacone = undefined;
var PARAMS = eval("(" + allparams + ")");


if (CONFIG.mongo !== undefined) {
    fs.readdir("./" + folders.models + "/mongo", function (err, files) {
        for (var i in files) {
            var file = files[i];
            models.push(S(file).replaceAll(".json", "").replaceAll("MO_", "").s);
        }
        for (var i in models) {
            var model = models[i];
            var content = fs.readFileSync(util.format("./" + folders.models + "/mongo/MO_%s.json", model));
            eval(util.format("collections.%s = mongoose.model('%s', %s);", model, model, content));
        }
        if (CONFIG.mongo) for (var i in models) {
            var model = models[i];
            var stringModel = S(allparams).replaceAll("@model@", model).s;
            modules.request.defaultRequests(eval("(" + stringModel + ")"), eval(util.format("collections.%s", model)));
        }
        loadedMotors++;
    });
} else loadedMotors++;
if (CONFIG.mssql !== undefined) {
    modelsql = [];
    modules.mssql.data(`select TABLE_NAME from INFORMATION_SCHEMA.TABLES`, PARAMS, false).then(x => {
        //  console.log('loaded mssql models');
        for (var row of x.data) {
            modelsql.push(row.TABLE_NAME);
        }
        var MSSQLDB = {};
        for (var i in modelsql) {
            var stringModel = S(allparams).replaceAll("@model@", modelsql[i]).s;
            eval("MSSQLDB." + modelsql[i] + " = new modules.mssql.Model('" + modelsql[i] + "'," + allparams + ");");
            modules.mssql.defaultRequests(eval(util.format("MSSQLDB.%s", modelsql[i])), eval("(" + stringModel + ")"));
        }
        loadedMotors++
        fs.readdir("./" + folders.models + "/mssql", function (err, sentences) {
            var queries = [];
            for (var i in sentences) {
                var sentence = sentences[i];
                var query = fs.readFileSync(`./${folders.models}/mssql/${sentence}`);
                queries.push(util.format("%s", query));
            }
            modules.mssql.executeNonQueryArray(queries, PARAMS, false).then((data) => {
            });
        });
    }).catch((err) => {
        console.log("mssql database error");
    });
} else loadedMotors++;
if (CONFIG.mysqlactive !== false) {
    modelmysql = [];
    modules.mysql.lacone = PARAMS.mysql.createPool(PARAMS.CONFIG.mysql);
    modules.mysql.data(`select * from viewcache`, PARAMS, false).then(y => {
        cacheobjects = y.data;
        PARAMS.cacheobjects = cacheobjects;
        console.log(cacheobjects[0]);
        modules.mysql.data(`select TABLE_NAME from information_schema.\`TABLES\`where TABLE_SCHEMA='${CONFIG.mysql.database}'`, PARAMS, false).then(x => {
            // console.log('loaded mysql models');
            for (var row of x.data) {
                if (row.TABLE_NAME.indexOf("aaa_") === -1 && row.TABLE_NAME.indexOf("zzcacho_") === -1)
                    modelmysql.push(row.TABLE_NAME);
            }
            var MYQLDB = {};
            for (var i in modelmysql) {
                var stringModel = S(allparams).replaceAll("@model@", modelmysql[i]).s;
                eval("MYQLDB." + modelmysql[i] + " = new modules.mysql.Model('" + modelmysql[i] + "'," + allparams + ");");
                modules.mysql.defaultRequests(eval(util.format("MYQLDB.%s", modelmysql[i])), eval("(" + stringModel + ")"));
            }
            loadedMotors++
            fs.readdir("./" + folders.models + "/mysql", function (err, sentences) {
                var queries = [];
                for (var i in sentences) {
                    var sentence = sentences[i];
                    var query = fs.readFileSync(`./${folders.models}/mysql/${sentence}`);
                    queries.push(util.format("%s", query));
                }
                modules.mysql.executeNonQueryArray(queries, PARAMS, false).then((data) => {
                });
            });
        }).catch((err) => {
            console.log("mysql database error");
        });
    }).catch((err) => {
        console.log("mysql database error", err);
    });
} else loadedMotors++;
if (CONFIG.postgreactive !== false) {

    var types = PARAMS.postgre.types;
    console.log(PARAMS.postgre);

    types.setTypeParser(1114,  (stringValue)=> {
        var temp = new Date(stringValue);
        let convertida =new Date(Date.UTC(temp.getUTCFullYear(), temp.getUTCMonth(), temp.getUTCDate(), temp.getUTCHours() + (CONFIG.postgre.timezone), temp.getUTCMinutes(), temp.getUTCSeconds()));
        console.log("datetime",stringValue,convertida);
        return convertida;
    });
    types.setTypeParser(1082,  (stringValue)=> {
        var temp = new Date(stringValue);
        let convertida = new Date(Date.UTC(temp.getUTCFullYear(), temp.getUTCMonth(), temp.getUTCDate(), 0+ (CONFIG.postgre.timezone), 0, 0));
        console.log("date",stringValue,convertida);
        return convertida;
    });
    types.setTypeParser(1184,  (stringValue)=> {
        var temp = new Date(stringValue);
        let convertida =new Date(Date.UTC(temp.getUTCFullYear(), temp.getUTCMonth(), temp.getUTCDate(), temp.getUTCHours() + (CONFIG.postgre.timezone), temp.getUTCMinutes(), temp.getUTCSeconds()));
        console.log("datetimez",stringValue,convertida);
        return convertida;
    });


    modelpostgre = [];
    modules.postgre.lacone = new PARAMS.postgre.Pool(PARAMS.CONFIG.postgre);
    console.log( PARAMS.postgre.types);
    modules.postgre.data(`select * from viewcache`, PARAMS, false).then(y => {
        cacheobjects = y.data;
        PARAMS.cacheobjects = cacheobjects;
        console.log(cacheobjects[0]);
        modules.postgre.data(`select TABLE_NAME as "TABLE_NAME" from information_schema.tables where TABLE_SCHEMA='public'`, PARAMS, false).then(x => {
            console.log('loaded postgre models');
            for (var row of x.data) {
                if (row.TABLE_NAME.indexOf("aaa_") === -1 && row.TABLE_NAME.indexOf("zzcacho_") === -1)
                    modelpostgre.push(row.TABLE_NAME);
            }
            var POSTGREDB = {};
            console.log(modelpostgre.length);

            for (var i in modelpostgre) {
                var stringModel = S(allparams).replaceAll("@model@", modelpostgre[i]).s;
                eval("POSTGREDB." + modelpostgre[i] + " = new modules.postgre.Model('" + modelpostgre[i] + "'," + allparams + ");");
                modules.postgre.defaultRequests(eval(util.format("POSTGREDB.%s", modelpostgre[i])), eval("(" + stringModel + ")"));
            }
            loadedMotors++
            fs.readdir("./" + folders.models + "/postgre", function (err, sentences) {
                var queries = [];
                for (var i in sentences) {
                    var sentence = sentences[i];
                    var query = fs.readFileSync(`./${folders.models}/postgre/${sentence}`);
                    queries.push(util.format("%s", query));
                }
                modules.postgre.executeNonQueryArray(queries, PARAMS, false).then((data) => {
                });
            });
        }).catch((err) => {
            console.log("postgre database error");
            console.log(err);
        });
    }).catch((err) => {
        console.log("postgre database error");
        console.log(err);
    });

} else loadedMotors++;
if (CONFIG.oracle !== undefined) {
    modeloracle = [];
    modeloracleReal = [];
    modules.oracle.data(`SELECT TABLE_NAME FROM all_tables where owner='${CONFIG.oracle.user}'`, PARAMS, false).then(async x => {
        modules.oracle.data(`SELECT VIEW_NAME as TABLE_NAME FROM all_views where owner='${CONFIG.oracle.user}'`, PARAMS, false).then(async y => {
            //   console.log('loaded oracle models');
            var myfields = [];
            for (var row of x.data) {
                modeloracle.push(row.table_name.toLowerCase());
                modeloracleReal.push(row.table_name);
                dbfields = await modules.oracle.dataNoShow(`select COLUMN_NAME as"column",DATA_TYPE as"type"from all_tab_columns where TABLE_NAME='${row.table_name}'`, PARAMS, false);
                dbfields.data.forEach((field) => {
                    if (myfields.indexOf(field.column) === -1) myfields.push(field.column);
                });
            }
            for (var row of y.data) {
                modeloracle.push(row.table_name.toLowerCase());
                modeloracleReal.push(row.table_name);
                dbfields = await modules.oracle.dataNoShow(`select COLUMN_NAME as"column",DATA_TYPE as"type"from all_tab_columns where TABLE_NAME='${row.table_name}'`, PARAMS, false);
                dbfields.data.forEach((field) => {
                    if (myfields.indexOf(field.column) === -1) myfields.push(field.column);
                });
            }
            //console.log(modeloracleReal);
            var ORACLEDB = {};
            for (var i in modeloracleReal) {
                var stringModel = S(allparams).replaceAll("@model@", modeloracleReal[i]).s;
                eval("ORACLEDB." + modeloracleReal[i] + " = new modules.oracle.Model('" + modeloracleReal[i] + "'," + allparams + ",myfields,modeloracleReal);");
                modules.oracle.defaultRequests(eval(util.format("ORACLEDB.%s", modeloracleReal[i])), eval("(" + stringModel + ")"));
            }
            loadedMotors++
            fs.readdir("./" + folders.models + "/oracle", function (err, sentences) {
                var queries = [];
                for (var i in sentences) {
                    var sentence = sentences[i];
                    var query = fs.readFileSync(`./${folders.models}/oracle/${sentence}`);
                    queries.push(util.format("%s", query));
                }
                modules.oracle.executeNonQueryArray(queries, PARAMS, false).then((data) => {
                });
            });
        }).catch((err) => {
            console.log("oracle database error ");
            console.log(err);
        });
    }).catch((err) => {
        console.log("oracle database error ");
        console.log(err);
    });
} else loadedMotors++;
if (true) {
    for (var i in CONFIG.appEntities) {
        modelstorage.push(i);
    }
    // console.log('loaded storage models');
    var STORAGEDB = {};
    for (var i in modelstorage) {
        var stringModel = S(allparams).replaceAll("@model@", modelstorage[i]).s;
        eval("STORAGEDB." + modelstorage[i] + " = new modules.storage.Model('" + modelstorage[i] + "'," + allparams + ");");
        modules.storage.defaultRequests(eval(util.format("STORAGEDB.%s", modelstorage[i])), eval("(" + stringModel + ")"), folders.views);
    }
    //console.log('loaded storage queries');
    loadedMotors++;
} else loadedMotors++;
if (true) {
    for (var i in CONFIG.storageEntities) {
        modelstorage.push(i);
    }
    var FIXA = [];
    for (var i in CONFIG.storageEntities) {
        FIXA.push(i);
    }
    // console.log('loaded storage app models');
    for (var i in FIXA) {
        var stringModel = S(allparams).replaceAll("@model@", FIXA[i]).s;
        eval("STORAGEDB." + FIXA[i] + " = new modules.storage.Model('" + FIXA[i] + "'," + allparams + ");");
        modules.storage.defaultRequests(eval(util.format("STORAGEDB.%s", FIXA[i])), eval("(" + stringModel + ")"), folders.viewsDragon);
    }
    //console.log('loaded storage app queries');
    loadedMotors++;
} else loadedMotors++;
while (loadedMotors < 6) sleep(1);
console.log('loadedMotors', loadedMotors);
servicesFiles = getFiles("./" + folders.service + "/");
var catalogs = [];
var servicesFunctions = [];
servicesFiles.forEach(function (item) {
    var model = item.replace(".js", "").replace("SE_", "");
    model = S(model).replaceAll('/', '_').s;
    eval(util.format("%sService = require('" + "./" + folders.service + "/%s');", model, item));
    var stringModel = S(allparams).replaceAll("@model@", model).s;
    eval(model + "Service.run(" + stringModel + ");");
    eval(`if (${model}Service.extra) ${model}Service.extra();`);
    eval("services = " + model + "Service.api");
    servicesFunctions[model] = services;
    var c = modules.views.runServices(services, model, eval("(" + stringModel + ")"));
    c.forEach(function (item) {
        catalogs.push(item);
    });
});
storage.getItem("base_currency").then(currencies => {
    currencies = currencies || []
    storage.getItem("hint_fields").then(hints => {
        hints = hints || []
        modules.views.init(eval("(" + allparams + ")"));
    });
});
console.log(CONFIG.ssl);

var httpServer = CONFIG.ssl ? https.createServer({
    pfx: fs.readFileSync('server.pfx'),
    passphrase: CONFIG.passphrase
}, app) : http.createServer(app);

httpServer.listen(CONFIG.port);


for (var i in tasks) {
    tasks[i].init(eval("(" + allparams + ")"));
}
console.log("");
console.log(CONFIG.appName.pxz + " Server Models:".pxz);
console.log(modelsql + "," + modelmysql + "," + modeloracle + "," + modelpostgre);
console.log("");
console.log(CONFIG.appName.pxz + " Server Modules:".pxz);
console.log(localModules + "," + modulesList);
console.log("");
console.log("");
//console.clear();
process.on('uncaughtException', function (err) {
    console.error(err);
});
if (process)
    if (process.stdout) {
        var width = process.stdout.columns;
        var drow = 0;
        var rows = process.stdout.rows;

        var print = function (quit, align, str, prt, rpt, color, begin, end, c1, c2) {
            quit = quit || 0;
            color = color || "pxz";
            c1 = c1 || "pxz";
            c2 = c2 || "pxz";
            begin = begin || "";
            end = end || "";
            str = str || "";
            align = align || "center";
            prt = prt || "*";
            rpt = rpt || 1;
            var left = 0;
            var right = 0;
            var result = "";
            var half = Math.floor((width - str.length) / 2);
            switch (align) {
                case"center": {
                    right = half - quit;
                    left = half - quit;
                    break;
                }
                case"left": {
                    right = (width - str.length) - quit;
                    break;
                }
                case"right": {
                    left = (width - str.length) - quit;
                    break;
                }
            }
            if (begin !== "") {
                if (left !== 0) left -= begin.length;
                if (right !== 0) right -= begin.length;
            }
            if (end !== "") {
                if (left !== 0) left -= begin.length;
                if (right !== 0) right -= begin.length;
            }
            result = `${prt.repeat(left)}${" ".repeat(quit)}${str}${" ".repeat(quit)}${prt.repeat(right)}`;
            var widttorest = width;
            var r1 = result.length;
            if (result.length < widttorest) result += prt.repeat(widttorest - result.length - (end !== "" ? (end.length * 2) : 0));
            if (result.length > widttorest) result = result.substring(widttorest, result.length - widttorest);
            for (i = 0; i < rpt; i++) {
                drow++;
                console.log(eval(`(begin.${c1} + result + end.${c2}).${color}`));
            }
        };
        var sp = function (str, length) {
            length = length || 15;
            return `${str}${" ".repeat(length - str.length)}`;
        };
        var urlsha = `${CONFIG.proxy.ssl === true ? 'https://' : 'http://'}${CONFIG.proxy.subdomain !== '' ? CONFIG.proxy.subdomain + '.' : ''}${CONFIG.proxy.domain}${(CONFIG.proxy.port === 80 || CONFIG.proxy.port === 443 || CONFIG.proxy.port === 443) ? '' : (":" + CONFIG.proxy.port)}${CONFIG.folderslash}`;
        var urlshahome = `${CONFIG.ssl === true ? 'https://' : 'http://'}${CONFIG.subdomain !== '' ? CONFIG.subdomain + '.' : ''}${CONFIG.domain}${(CONFIG.port === 80 || CONFIG.port === 443 || CONFIG.port === 443) ? '' : (":" + CONFIG.port)}${CONFIG.folderslash}`;
        print(0, "center", "", "█", 1, "pxz", "█", "█");
        print(0, "center", "", "═", 1, "pxz", "█╔", "╗█");
        print(0, "center", "CBS Framework " + CONFIG.version.base, " ", 1, "pxz2", "█║", "║█");
        print(0, "center", "", "█", 2, "vacio", "█║", "║█");
        print(0, "center", `${sp("APPLICATION")}:${sp(CONFIG.appName + " " + CONFIG.version.app, 40)}`, " ", 1, "pxz2", "█║", "║█");
        print(0, "center", `${sp("HOME")}:${sp(urlshahome, 40)}`, " ", 1, "pxz2", "█║", "║█");
        print(0, "center", `${sp("PROXY")}:${sp(urlsha, 40)}`, " ", 1, "pxz2", "█║", "║█");
        print(0, "center", `${sp("MODE")}:${sp(CONFIG.mode, 40)}`, " ", 1, "pxz2", "█║", "║█");
        print(0, "center", `${sp("CONFIGURATION")}:${sp(('By Developer'), 40)}`, " ", 1, "pxz2", "█║", "║█");
        print(0, "center", `${sp("LANGUAGE")}:${sp(CONFIG.language, 40)}`, " ", 1, "pxz2", "█║", "║█");
        if (CONFIG.mssql) print(0, "center", `${sp("MSSQL")}:${sp(CONFIG.mssql.server, 40)}`, " ", 1, "pxz2", "█║", "║█");
        if (CONFIG.mssql) print(0, "center", `${sp("Name")}:${sp(CONFIG.mssql.database, 40)}`, " ", 1, "pxz2", "█║", "║█");
        if (CONFIG.mysqlactive) print(0, "center", `${sp("MYSQL")}:${sp(CONFIG.mysql.host, 40)}`, " ", 1, "pxz2", "█║", "║█");
        if (CONFIG.mysqlactive) print(0, "center", `${sp("Name")}:${sp(CONFIG.mysql.database, 40)}`, " ", 1, "pxz2", "█║", "║█");
        if (CONFIG.postgreactive) print(0, "center", `${sp("POSTGRE")}:${sp(CONFIG.postgre.host, 40)}`, " ", 1, "pxz2", "█║", "║█");
        if (CONFIG.postgreactive) print(0, "center", `${sp("Name")}:${sp(CONFIG.postgre.database, 40)}`, " ", 1, "pxz2", "█║", "║█");
        if (CONFIG.oracle) print(0, "center", `${sp("ORACLE")}:${sp(CONFIG.oracle.connectString, 40)}`, " ", 1, "pxz2", "█║", "║█");
        print(0, "center", "", "█", (rows - drow) - 8, "vacio", "█║", "║█");
        print(0, "center", `${new Date().toString()}`, " ", 1, "pxz2", "█║", "║█");
        print(0, "center", "", "█", 3, "vacio", "█║", "║█");
        print(0, "right", `DEVELOPED BY:${CONFIG.developerBy.name}`, " ", 1, "pxz2", "█║", "║█");
        print(0, "center", "", "═", 1, "pxz", "█╚", "╝█");
        print(0, "center", "", "█", 1, "pxz", "█", "█");
    }
