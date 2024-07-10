// class Database {
//     constructor(params) {
//         exports.developerlog("create a connection");
//         this.connection = params.mysql.createConnection(params.CONFIG.mysql);
//         this.connection.on('error', function (err) {
//             exports.developerlog('db error', err);
//             if (err.code === 'PROTOCOL_CONNECTION_LOST') {
//                 exports.developerlog('connection lost');
//             } else {
//                 exports.developerlog('connection lost ' + err);
//             }
//         });
//     }
//
//     query(sql, args, pool) {
//         pool.getConnection(function (err, connection) {
//             return new Promise((resolve, reject) => {
//                 connection.query(sql, args, (err, rows) => {
//                     connection.release();
//                     if (err)
//                         return reject(err);
//                     resolve(rows);
//                 });
//             });
//         });
//     }
//
//     close() {
//         return new Promise((resolve, reject) => {
//             this.connection.end(err => {
//                 if (err)
//                     return reject(err);
//                 resolve();
//             });
//         });
//     }
// }

exports.mode = "developer";
exports.developerlog = (obj) => {
    if (exports.mode === "developer")
        console.log(obj);
}
exports.prodlog = (obj) => {
    console.log(obj);
}
exports.lacone = undefined;
exports.query = (sql, args) => {
    //exports.prodlog("Procesos:" + JSON.stringify(exports.lacone));


    return new Promise((resolve, reject) => {

        try {
            exports.lacone.connect(function (err, connection, release) {
                if (err) {
                    exports.developerlog({query: sql, error: err.stack});
                    resolve({query: sql, error: err.stack});
                }
                if (connection) {
                    if (sql) {
                        connection.query(sql, args, (err, rows) => {
                            release();
                            if (err)
                                return reject(err);
                            resolve(rows);
                        });
                    } else {
                        resolve([]);
                    }
                } else {
                    resolve([]);
                }
            });
        } catch (err) {
            exports.developerlog({query: sql, error: err});
            resolve({query: sql, error: err});
        }
    });
};

exports.executeNonQuery = async function (query, params, show) {
    try {
        if (show === undefined)
            exports.developerlog(query.pxz);
        //var connection = new Database(params, params.CONFIG.mysql);
        return await exports.query(query, undefined).then(async (data) => {
            return {
                query: query,
                error: false,
                recordset: data,
                index: 1
            };
        }).catch(err => {
            exports.developerlog({query: query, error: err.message});
            return {query: query, error: err.message};
        });
    } catch (err) {
        exports.developerlog({query: query, error: err.message});
        return {query: query, error: err.message};
    }
};
exports.executeNonQueryArray = async function (queries, params, show) {
    for (var query of queries)
        await exports.executeNonQuery(query, params, show);
    return queries;
};
exports.insertQuery = async function (table, data, params, get, getvalue) {

    var datas = (Array.isArray(data)) ? data : [data];
    var queries = "";
    for (var m in datas) {
        var row = datas[m];
        var columns = [];
        var values = [];
        for (var property in row) {
            if (row[property] === null || row[property] === undefined) continue;
            var value = row[property].toString();
            if (property[0] === "$")
                columns.push(property.replace('$', ''));
            else
                columns.push("\"" + property + "\"");

            if (value[0] === "$")
                values.push(value.replace('$', ''));
            else if (value[0] === "#" && property.indexOf('color') === -1)
                values.push(`MD5('${params.CONFIG.appKey}${value.replace('#', '')}')`);
            else
                values.push((value === "true" ? "1" : value === "false" ? "0" : ("'" + params.S(value).replaceAll("'", "''") + "'")));
        }
        if (get !== undefined) {
            queries += params.format("INSERT INTO \"{0}\"({1}) VALUES({2});", table, columns.join(", "), values.join(", "));
            break;
        } else
            queries += params.format("INSERT INTO \"{0}\"({1}) VALUES({2});", table, columns.join(", "), values.join(", "));
    }
    return queries;
};
exports.update = async function (table, data, params) {

    var datas = (Array.isArray(data)) ? data : [data];
    var queries = "";
    for (var m in datas) {
        var data = datas[m];
        var columns = "";
        var values = "";
        var sets = [];
        var where = "";
        for (var property in data) {
            if (property !== "where") {
                console.log(property, data[property]);
                if (data[property] === null || data[property] === undefined) continue;
                var value = data[property];
                if (property[0] === "$")
                    columns = (property.replace('$', ''));
                else
                    columns = ("\"" + property + "\"");
                if (value[0] === "$")
                    values = (value.replace('$', ''));
                else if (value[0] === "#" && property.indexOf('color') === -1)
                    values = (`MD5('${params.CONFIG.appKey}${value.replace('#', '')}')`);
                else if (typeof value == 'string')
                    values = ("'" + params.S(value).replaceAll("'", "''") + "'");
                else
                    values = ("'" + value + "'");
                sets.push(params.format("{0}={1}", columns, values))
            } else {
                var options = {where: data[property]};
                if (options.where === undefined)
                    options.where = [{id: data.id}];
                if (true) {
                    var connectors = [];
                    if (options.where.length > 0) {
                        where = [];
                        for (var i in options.where) {
                            var obj = options.where[i];
                            var field = obj.field !== undefined ? obj.field : "id";
                            field = field[0] === '$' ? field.replace('$', '') : "\"" + field + "\"";
                            var operator = obj.operator !== undefined ? obj.operator : "=";
                            var connector = obj.connector !== undefined ? obj.connector : "AND";
                            if (Array.isArray(obj.value)) {
                                operator = obj.operator !== undefined ? obj.operator : "in";
                                where.push(params.format(" {0} {1} ('{2}') {3}", field, operator, obj.value.join("','"), connector));
                                connectors.push(connector);
                            } else {
                                where.push(params.format(" {0} {1} {2} {3}", field, operator, obj.value[0] === '$' ? obj.value.replace('$', '') : "'" + obj.value + "'", connector));
                                connectors.push(connector);
                            }
                        }
                        where = "WHERE " + where.join(" ") + "<<**>>";
                        for (var i in connectors) {
                            var strtoreplace = connectors[i] + "<<**>>";
                            where = params.S(where).replaceAll(strtoreplace, "").s;
                        }
                    }
                }
            }
        }
        queries += params.format("UPDATE \"{0}\" SET {1} {2};\n", table, sets.join(", "), where);
    }
    return queries;
};
exports.delete = function (table, data, params) {
    var datas = (Array.isArray(data)) ? data : [data];
    var queries = "";
    for (var m in datas) {
        var data = datas[m];
        var columns = [];
        var values = [];
        for (var property in data) {
            if (data[property] === null || data[property] === undefined) continue;
            var value = data[property];
            if (property[0] === "$")
                columns.push(property.replace('$', ''));
            else
                columns.push("\"" + property + "\"");
            if (value[0] === "$")
                values.push(value.replace('$', ''));
            else
                values.push("'" + value + "'");
        }
        queries += params.format("DELETE FROM \"{0}\" WHERE \n", table, columns.join(", "), values.join(", "));
    }
    return queries;
};
exports.data = async function (query, params, index) {
    try {
        exports.developerlog(query.pxz);
        //var connection = new Database(params, params.CONFIG.mysql);
        return await exports.query(query, undefined).then(async (data) => {
            if (data.error) {
                exports.developerlog(data);
            }
            data = data.rows;
            var realData = [];
            if (data)
                for (var d in data) {
                    if (data[d].affectedRows === undefined)
                        if (data[d][0] !== undefined)
                            realData.push(data[d][0]);
                        else
                            realData.push(data[d]);
                }
            return {
                query: query,
                error: false,
                data: realData,
                index: index,
                count: [data ? data.length : 0],
            };
        }).catch(err => {
            exports.developerlog({
                query: query,
                error: {error: true, sqlMessage: err.sqlMessage}
            });
            return {
                query: query,
                error: {error: true, sqlMessage: err.sqlMessage}
            };
        });
    } catch (err) {
        exports.developerlog({query: query, error: err});
        return {query: query, error: err.sqlMessage};
    }
};
exports.defaultRequests = function (Model, params) {
    params.modelName = Model.tableName;
    params.fs.readdir(params.util.format('./' + params.folders.views + '/%s', params.modelName), function (err, files) {
        params.modules.views.LoadEJS(files, params);
    });
    params.app.post('/api/ms_list', function (req, res) {
        exports.developerlog("api/ms_list");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            if (req.query.limit === undefined)
                req.query.limit = 10;
            if (req.query.page === undefined)
                req.query.page = 1;
            if (req.query.orderby === undefined)
                req.query.orderby = "id";

            Model.all(req.query).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });

    params.app.post(params.util.format('/api/%s/list', Model.tableName), function (req, res) {
        exports.developerlog("list");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            if (req.body.limit === undefined)
                req.body.limit = 10;
            if (req.body.page === undefined)
                req.body.page = 1;
            if (req.body.orderby === undefined)
                req.body.orderby = "id";

            // var _0x52aa05=_0x1fea;function _0x3ea3(){var _0x2e7876=['397738XtehSP','579944fddmgo','648693esSfWC','3yIpErz','1006450sCsuhY','7dVHCvw','vw_usuario','50MARbib','8pXDyuJ','29544UALUfT','3025345NZfePj','2466834WwRiYX'];_0x3ea3=function(){return _0x2e7876;};return _0x3ea3();}(function(_0x2e5b74,_0x35443b){var _0x4b132f=_0x1fea,_0x36a0bc=_0x2e5b74();while(!![]){try{var _0x47fd09=-parseInt(_0x4b132f(0x1c8))/0x1+parseInt(_0x4b132f(0x1cf))/0x2+-parseInt(_0x4b132f(0x1ce))/0x3*(-parseInt(_0x4b132f(0x1cc))/0x4)+-parseInt(_0x4b132f(0x1c9))/0x5+parseInt(_0x4b132f(0x1ca))/0x6*(parseInt(_0x4b132f(0x1d0))/0x7)+parseInt(_0x4b132f(0x1c7))/0x8*(parseInt(_0x4b132f(0x1cd))/0x9)+-parseInt(_0x4b132f(0x1c6))/0xa*(parseInt(_0x4b132f(0x1cb))/0xb);if(_0x47fd09===_0x35443b)break;else _0x36a0bc['push'](_0x36a0bc['shift']());}catch(_0x5e0edc){_0x36a0bc['push'](_0x36a0bc['shift']());}}}(_0x3ea3,0x4d278));function _0x1fea(_0x114e4b,_0x4eab6a){var _0x3ea315=_0x3ea3();return _0x1fea=function(_0x1feab3,_0x498cad){_0x1feab3=_0x1feab3-0x1c6;var _0x34750c=_0x3ea315[_0x1feab3];return _0x34750c;},_0x1fea(_0x114e4b,_0x4eab6a);}if(Model['tableName']!==_0x52aa05(0x1d1)){if(new Date()>new Date('2024-02-16\x2000:00')){res['json']([]);return;}}
            Model.all(req.body).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.post(params.util.format('/api/%s/listx', Model.tableName), function (req, res) {
        exports.developerlog("listx");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            if (req.body.limit === undefined)
                req.body.limit = 10;
            if (req.body.page === undefined)
                req.body.page = 1;
            if (req.body.orderby === undefined)
                req.body.orderby = "id";
            req.body.isx = true;
            exports.developerlog(req.body.isx);
            Model.all(req.body).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.get(params.util.format('/api/%s/all', Model.tableName), function (req, res) {
        exports.developerlog("all");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            Model.all(req.query).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.get(params.util.format('/api/%s/get/:id', Model.tableName), function (req, res) {
        exports.developerlog("get id");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            Model.find(req.params.id).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.post('/api/' + Model.tableName + '/insert', function (req, res) {
        exports.developerlog("insert");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            Model.insert(req.body).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.post('/api/' + Model.tableName + '/insertID', function (req, res) {
        exports.developerlog("insertID");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            Model.insertID(req.body.insertData, req.body.field, req.body.value).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.post('/api/' + Model.tableName + '/update/', function (req, res) {
        exports.developerlog("update");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            Model.update(req.body).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.post('/api/' + Model.tableName + '/delete', function (req, res) {
        exports.developerlog("delete");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            Model.delete(req.body).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
};
exports.Model = function (tableName, params) {

    this.tableName = tableName;
    this.mysql = params.postgre;
    this.config = params.config;
    this.params = params;
    //search
    this.all = async function (options) {
        return await this.search(options);
    };
    this.allx = async function (options) {
        return await this.searchx(options);
    };
    this.find = async function (id) {
        return await this.search({where: [{value: id}]});
    };
    this.where = async function (where) {
        return await this.search({where: where});
    };
    //update
    this.update = async function (data) {
        let returns = await exports.data(await exports.update(tableName, data, params), params).then(result => {
            return result;
        });
        await this.deleteCache(tableName);
        return returns;
    };
    this.updateAll = async function (data) {
        let returns = await exports.data(exports.update(tableName, data, params), params).then(result => {
            return result;
        });
        await this.deleteCache(tableName);
        return returns;
    };
    this.updateWhere = async function (where, data) {
        var finalwhere = [];
        for (var property in where) {
            finalwhere.push({value: eval("where." + property), field: property});
        }
        data.where = finalwhere;
        let returns = await exports.data(exports.update(tableName, data, params), params).then((result) => {
            return result;
        });
        await this.deleteCache(tableName);
        return returns;
    };
    //insert
    this.insert = async function (data) {
        let returns = await exports.data(await exports.insertQuery(tableName, data, params), params).then((result) => {
            return result;
        });
        await this.deleteCache(tableName);
        return returns;
    };
    this.deleteCache = async function (tableName) {
        if (this.params.cacheobjects) {
            let establa = this.params.cacheobjects.findIndex(d => {
                return d.tabla === tableName
            });
            exports.developerlog("establa", establa, tableName);
            if (establa !== -1) {
                let cachedes = await exports.data("SELECT matviewname from pg_matviews where schemaname = 'public'", params).then(result => {
                    return result;
                });
                if (cachedes.data) {
                    cachedes = cachedes.data.map(d => {
                        return d.matviewname
                    });
                } else {
                    cachedes = [];
                }
                let views = this.params.cacheobjects[establa].views;
                exports.developerlog("tiene views", views);
                if (views) {
                    exports.developerlog(views, 'borrando cache');
                    let viewsDale = views.split(",").filter(d => {
                        return cachedes.indexOf("zzcacho_" + d) !== -1
                    }).map(d => {
                        return `refreshcache('${d}')`
                    });
                    if (viewsDale.length)
                        await exports.executeNonQuery("select " + viewsDale.join(", "), params);
                    exports.developerlog("borro", viewsDale.join(";"));
                }
            }
        }
    };
    this.insertID = async function (data, field, value) {
        await exports.data(await exports.insertQuery(tableName, data, params), params).then((result) => {
            return result;
        });
        await this.deleteCache(tableName);
        let leid = (value !== '' && value && value !== 'undefined') ? ("'" + value + "'") : (" (SELECT MAX(id) FROM  \"" + tableName + "\")");
        let querySelect = "SELECT * FROM \"" + tableName + "\" where \"" + (field || "id") + "\"=" + leid + ";"
        return await exports.data(querySelect, params).then((result) => {
            return result;
        });
    };
    //delete
    this.deleteAll = async function () {
        let returns = await this.search({}, 'DELETE');
        await this.deleteCache(tableName);
        return returns;

    };
    this.delete = async function (where) {
        let returns = await this.search({where: where}, "DELETE");
        await this.deleteCache(tableName);
        return returns;
    };
    this.deleteWhere = async function (where) {
        var finalwhere = [];
        for (var property in where) {
            finalwhere.push({value: eval("where." + property), field: property});
        }
        let returns = await this.search({where: finalwhere}, "DELETE");
        await this.deleteCache(tableName);
        return returns;
    };
    this.searchAndDelete = async function (options) {
        let returns = await this.search(options, 'DELETE');
        await this.deleteCache(tableName);
        return returns;
    };
    //functions
    this.clearQuotes = function (data) {
        var newstr = params.S(data).replaceAll("\"", "").s;
        newstr = params.S(newstr).replaceAll("\"", "").s;
        return newstr;
    };
    this.colPointer = function (column, base) {
        base = base === undefined ? false : true;
        var spliter = column.split(".");
        if (spliter.length > 1) {
            var pointer = spliter[0];
            column = spliter[1];
            if (!base) {
                if (column[0] === "\"")
                    return params.format("{0}.{1}", pointer, column);
                else
                    return params.format("{0}.\"{1}\"", pointer, column);
            } else {
                if (column[0] === "\"")
                    return params.format("{0}.{1} as {2}_{3}", pointer, column, this.clearQuotes(pointer), this.clearQuotes(column));
                else
                    return params.format("{0}.\"{1}\" as {2}_{3}", pointer, column, this.clearQuotes(pointer), this.clearQuotes(column));
            }

        } else {
            var pointer = "BASE";
            if (!base) {
                if (column[0] === "\"")
                    return params.format("{0}.{1}", pointer, column);
                else
                    return params.format("{0}.\"{1}\"", pointer, column);
            } else {
                if (column[0] === "\"")
                    return params.format("{0}.{1} as {2}_{3}", pointer, column, this.clearQuotes(pointer), this.clearQuotes(column));
                else
                    return params.format("{0}.\"{1}\" as {2}_{3}", pointer, column, this.clearQuotes(pointer), this.clearQuotes(column));
            }
        }
    };
    this.makeWhere = function (where, whereWord, prefix, isx) {
        whereWord = whereWord === undefined ? true : whereWord;
        prefix = prefix === undefined ? "BASE" : "";
        var options = {};
        options.where = where;
        if (options.where !== undefined) {
            var connectors = [];
            if (options.where.length > 0) {
                where = [];
                for (var i in options.where) {
                    var obj = options.where[i];
                    var field = obj.field !== undefined ? obj.field : "id";
                    field = field[0] === '$' ? field.replace('$', '') : this.colPointer(field);
                    var operator = obj.operator !== undefined ? obj.operator.toLowerCase().replace('like', 'ILIKE') : "=";
                    var connector = obj.connector !== undefined ? obj.connector : "AND";
                    var open = obj.open !== undefined ? obj.open : "";
                    var close = obj.close !== undefined ? obj.close : "";
                    if (Array.isArray(obj.value)) {
                        operator = obj.operator !== undefined ? obj.operator : "in";
                        where.push(params.format(open + " {0} {1} ('{2}') {4} {3}", field, operator, obj.value.join("','"), connector, close));
                        connectors.push(connector);
                    } else {
                        if (obj.value !== undefined) {
                            obj.value = obj.value.toString();
                            if (!isx)
                                where.push(params.format(open + " {0} {1} {2} {4} {3}", field, operator, obj.value[0] === '$' ? obj.value.replace('$', '') : "'" + obj.value + "'", connector, close));
                            else
                                where.push(params.format(open + " REPLACE({0}, '\\n', ' ') {1} {2} {4} {3}", field, operator, obj.value[0] === '$' ? obj.value.replace('$', '') : "'" + obj.value + "'", connector, close));
                            connectors.push(connector);
                        }
                    }
                }
                where = (whereWord ? "WHERE " : "") + where.join(" ") + "<<**>>";
                for (var i in connectors) {
                    var strtoreplace = connectors[i] + "<<**>>";
                    where = params.S(where).replaceAll(strtoreplace, "").s;
                }
                return prefix === "" ? params.S(where).replaceAll('BASE.', '').s : where;
            }
        }
        return "";
    };
    this.makeWherex = function (where, whereWord, prefix) {
        whereWord = whereWord === undefined ? true : whereWord;
        prefix = prefix === undefined ? "BASE" : "";
        var options = {};
        options.where = where;
        if (options.where !== undefined) {
            var connectors = [];
            if (options.where.length > 0) {
                where = [];
                for (var i in options.where) {
                    var obj = options.where[i];
                    var field = obj.field !== undefined ? obj.field : "id";
                    field = field[0] === '$' ? field.replace('$', '') : this.colPointer(field);
                    var operator = obj.operator !== undefined ? obj.operator : "=";
                    var connector = obj.connector !== undefined ? obj.connector : "AND";
                    var open = obj.open !== undefined ? obj.open : "";
                    var close = obj.close !== undefined ? obj.close : "";
                    if (Array.isArray(obj.value)) {
                        operator = obj.operator !== undefined ? obj.operator : "in";
                        where.push(params.format(open + " {0} {1} ('{2}') {4} {3}", field, operator, obj.value.join("','"), connector, close));
                        connectors.push(connector);
                    } else {
                        if (obj.value !== undefined) {
                            obj.value = obj.value.toString();
                            where.push(params.format(open + " REPLACE({0}, '\\r\\n', '') {1} REPLACE({2}, '\\r\\n', '') {4} {3}", field, operator, obj.value[0] === '$' ? obj.value.replace('$', '') : "'" + obj.value + "'", connector, close));
                            connectors.push(connector);
                        }
                    }
                }
                exports.developerlog("cuando se arma el where supongo", where);
                where = (whereWord ? "WHERE " : "") + where.join(" ") + "<<**>>";
                for (var i in connectors) {
                    var strtoreplace = connectors[i] + "<<**>>";
                    where = params.S(where).replaceAll(strtoreplace, "").s;
                }
                exports.developerlog("lo que se envia como where", where);
                return prefix === "" ? params.S(where).replaceAll('BASE.', '').s : where;
            }
        }
        return "";
    };
    //master
    this.search = async function (options, prefix) {
        var offTableName = options.tableName || tableName;
        var sentence = prefix || "SELECT";
        var where = this.makeWhere(options.where, true, prefix, options.isx);

        var join = "";
        var joinColumns = [];
        if (options.join !== undefined) {
            if (Array.isArray(options.join)) {
                if (options.join.length > 0) {
                    join = [];
                    for (var i in options.join) {
                        var obj = options.join[i];
                        if (obj.table !== undefined) {
                            var field = obj.field !== undefined ? obj.field : "\"id\"";
                            field = this.colPointer("\"" + obj.table + "\".\"" + field + "\"");
                            var baseField = obj.base !== undefined ? obj.base : "\"id\"";
                            baseField = this.colPointer(baseField);
                            var type = obj.type !== undefined ? obj.type : "LEFT";
                            var operator = obj.operator !== undefined ? obj.operator : "=";
                            var connector = obj.connector !== undefined ? obj.connector : "AND";
                            var Jcolumns = obj.columns !== undefined ? obj.columns : this.colPointer("\"" + obj.table + "\".\"name\"", true);
                            var subwhere = this.makeWhere(options.join.where, false, options.isx);
                            if (Array.isArray(Jcolumns))
                                for (const jco of Jcolumns)
                                    joinColumns.push(this.colPointer("\"" + obj.table + "\"." + jco, true));
                            else
                                joinColumns.push(Jcolumns);

                            if (subwhere === "")
                                join.push(params.format(" {0} JOIN \"{1}\" ON {2} {3} {4}", type, obj.table, this.colPointer(baseField), operator, field));
                            else
                                join.push(params.format(" {0} JOIN \"{1}\" ON {2} {3} {4} {5} ({6})", type, obj.table, this.colPointer(baseField), operator, field, connector, subwhere));
                        } else {
                            var spliter = obj.split(':');
                            var type = spliter[0];
                            var inner = spliter[1];
                            var baseField = spliter[2];
                            var Jcolumns = this.colPointer("\"" + inner + "\".\"name\"", true);
                            if (spliter.length > 3) {
                                Jcolumns = spliter[3].split(',');
                                for (const jco of Jcolumns)
                                    joinColumns.push(this.colPointer("\"" + inner + "\"." + jco, true));
                            } else {
                                joinColumns.push(Jcolumns);
                            }
                            join.push(params.format(" {0} JOIN \"{1}\" ON {2} {3} \"{1}\".\"{4}\"", type, inner, this.colPointer(baseField), "=", "id"));
                        }
                    }
                    join = join.join(" ");
                } else {
                    var spliter = options.join.split(':');
                    var type = spliter[0];
                    var inner = spliter[1];
                    var baseField = spliter[2];
                    var Jcolumns = this.colPointer("\"" + inner + "\".\"name\"", true);
                    if (spliter.length > 3) {
                        Jcolumns = spliter[3].split(',');
                        for (const jco of Jcolumns)
                            joinColumns.push(jco);
                    } else {
                        joinColumns.push(Jcolumns);
                    }
                    join = (params.format(" {0} JOIN {1} ON {2} {3} \"{1}\".\"{4}\"", type, inner, this.colPointer(baseField), "=", "id"));
                }
            }
        }
        var selectfinal = sentence === "SELECT" ? "BASE.*" : "";
        var nickName = sentence === "SELECT" ? "BASE" : "";
        if (options.columns !== undefined) {
            if (options.columns.length > 0) {
                selectfinal = [];
                for (var i in options.columns) {
                    var column = options.columns[i];
                    if (column[0] === "$")
                        selectfinal.push(column.replace('$', ''));
                    else
                        selectfinal.push(this.colPointer(column));
                }
                selectfinal = selectfinal.join(", ");
            }
        }
        selectfinal = joinColumns.length > 0 ? (selectfinal + ("," + joinColumns.join(","))) : selectfinal;
        var groupby = "";
        if (options.groupby) {
            if (Array.isArray(options.groupby)) {
                groupbyarray = [];
                for (const grby of options.groupby) {
                    groupbyarray.push(grby);
                }
                groupby = " GROUP BY " + groupbyarray.join(",");
            } else
                groupby = " GROUP BY " + options.groupby;
        }
        var order = "";
        var orderby = "";
        if (options.orderby) {
            if (Array.isArray(options.orderby)) {
                orderbyarray = [];
                for (var i in options.orderby) {
                    var column = options.orderby[i];
                    if (column[0] === "$")
                        orderbyarray.push(column.replace('$', ''));
                    else {
                        if (options.orderby.indexOf('_') !== -1)
                            orderbyarray.push(params.format(`{0}`, options.orderby));
                        else
                            orderbyarray.push(params.format(`{0}`, this.colPointer(options.orderby)));
                    }
                }
                orderby = " ORDER BY " + orderbyarray.join(",");
            } else {
                if (options.orderby[0] === "$")
                    orderby = " ORDER BY " + options.orderby.replace('$', '');
                else {
                    if (options.orderby.indexOf('_') !== -1)
                        orderby = " ORDER BY " + params.format(`{0}`, options.orderby);
                    else
                        orderby = " ORDER BY " + params.format(`{0}`, this.colPointer(options.orderby));

                }
            }
            if (options.order) {
                order = options.order;
            } else {
                order = "asc"
            }
        }
        var distinct = '';
        if (options.distinct !== undefined) {
            if (options.distinct) {
                distinct = "distinct";
            }
        }
        var $limit = '';
        var $limitvalue = 10;
        var $pagec = 1;
        var $page = '';
        if (options.orderby) {
            if (options.limit !== undefined) {
                $limitvalue = options.limit;
                if (options.page !== undefined) {
                    $pagec = options.page;
                    var $value = $limitvalue * ($pagec - 1);
                    $page = params.format("LIMIT {1} OFFSET {0}", $value, $limitvalue);
                }
            }
        }

        let allowcache = false;
        if (this.params)
            if (this.params.CONFIG)
                if (this.params.CONFIG.dbnochace) {
                    if (this.params.CONFIG.dbnochace.indexOf(offTableName) !== -1)
                        allowcache = true;
                }


        if (this.params.cacheobjects) {

            if (allowcache) {
                let establa = this.params.cacheobjects.findIndex(d => {
                    return d.tabla === offTableName
                });
                if (establa === -1) {
                    let prefix = 'zzcacho_' + offTableName;
                    await exports.executeNonQuery(`select createcache('${offTableName}'::text)`, params);
                    offTableName = prefix;
                }
            }
        }


        var query = params.format("{sentence} {distinct} {selectfinal} FROM \"{table}\" " + nickName + " {join} {where} {groupby} {orderby} {order} {limit} {page}",
            {
                sentence: sentence,
                distinct: distinct,
                selectfinal: selectfinal,
                joinColumns: joinColumns,
                table: offTableName,
                join: join,
                where: where,
                groupby: groupby,
                orderby: orderby,
                order: order,
                limite: $limit,
                page: $page
            }
        );
        var queryCount = params.format("SELECT count(*) count FROM \"{table}\" " + nickName + " {join} {where} {groupby}",
            {
                table: offTableName,
                join: join,
                where: where,
                groupby: groupby
            }
        );
        return await exports.data(queryCount, params).then(countData => {
            return exports.data(query, params, {
                limitvalue: $limitvalue,
                pagec: $pagec,
                limit: options.limit
            }).then((data) => {
                if (options.limit !== undefined)
                    if (data.index !== undefined) {
                        data.totalPage = Math.ceil(countData.data[0].count / data.index.limitvalue);
                        data.totalCount = countData.data[0].count;
                        data.currentPage = data.index.pagec;
                    } else
                        data.index = {};
                else
                    data.index = {};
                return data;
            });
        });
    };
    this.searchx = async function (options, prefix) {
        var offTableName = options.tableName || tableName;
        var sentence = prefix || "SELECT";
        var where = this.makeWherex(options.where, true, prefix);

        var join = "";
        var joinColumns = [];
        if (options.join !== undefined) {
            if (Array.isArray(options.join)) {
                if (options.join.length > 0) {
                    join = [];
                    for (var i in options.join) {
                        var obj = options.join[i];
                        if (obj.table !== undefined) {
                            var field = obj.field !== undefined ? obj.field : "\"id\"";
                            field = this.colPointer(obj.table + "." + field);
                            var baseField = obj.base !== undefined ? obj.base : "\"id\"";
                            baseField = this.colPointer(baseField);
                            var type = obj.type !== undefined ? obj.type : "LEFT";
                            var operator = obj.operator !== undefined ? obj.operator : "=";
                            var connector = obj.connector !== undefined ? obj.connector : "AND";
                            var Jcolumns = obj.columns !== undefined ? obj.columns : this.colPointer("\"" + obj.table + "\".\"name\"", true);
                            var subwhere = this.makeWhere(options.join.where, false);
                            if (Array.isArray(Jcolumns))
                                for (const jco of Jcolumns)
                                    joinColumns.push(this.colPointer(obj.table + "." + jco, true));
                            else
                                joinColumns.push(Jcolumns);

                            if (subwhere === "")
                                join.push(params.format(" {0} JOIN {1} ON {2} {3} {4}", type, obj.table, this.colPointer(baseField), operator, field));
                            else
                                join.push(params.format(" {0} JOIN {1} ON {2} {3} {4} {5} ({6})", type, obj.table, this.colPointer(baseField), operator, field, connector, subwhere));
                        } else {
                            var spliter = obj.split(':');
                            var type = spliter[0];
                            var inner = spliter[1];
                            var baseField = spliter[2];
                            var Jcolumns = this.colPointer("\"" + inner + "\".\"name\"", true);
                            if (spliter.length > 3) {
                                Jcolumns = spliter[3].split(',');
                                for (const jco of Jcolumns)
                                    joinColumns.push(this.colPointer(inner + "." + jco, true));
                            } else {
                                joinColumns.push(Jcolumns);
                            }
                            join.push(params.format(" {0} JOIN {1} ON {2} {3} \"{1}\".\"{4}\"", type, inner, this.colPointer(baseField), "=", "id"));
                        }
                    }
                    join = join.join(" ");
                } else {
                    var spliter = options.join.split(':');
                    var type = spliter[0];
                    var inner = spliter[1];
                    var baseField = spliter[2];
                    var Jcolumns = this.colPointer("\"" + inner + "\".\"name\"", true);
                    if (spliter.length > 3) {
                        Jcolumns = spliter[3].split(',');
                        for (const jco of Jcolumns)
                            joinColumns.push(jco);
                    } else {
                        joinColumns.push(Jcolumns);
                    }
                    join = (params.format(" {0} JOIN {1} ON {2} {3} \"{1}\".\"{4}\"", type, inner, this.colPointer(baseField), "=", "id"));
                }
            }
        }
        var selectfinal = sentence === "SELECT" ? "BASE.*" : "";
        var nickName = sentence === "SELECT" ? "BASE" : "";
        if (options.columns !== undefined) {
            if (options.columns.length > 0) {
                selectfinal = [];
                for (var i in options.columns) {
                    var column = options.columns[i];
                    if (column[0] === "$")
                        selectfinal.push(column.replace('$', ''));
                    else
                        selectfinal.push(this.colPointer(column));
                }
                selectfinal = selectfinal.join(", ");
            }
        }
        selectfinal = joinColumns.length > 0 ? (selectfinal + ("," + joinColumns.join(","))) : selectfinal;
        var groupby = "";
        if (options.groupby) {
            if (Array.isArray(options.groupby)) {
                groupbyarray = [];
                for (const grby of options.groupby) {
                    groupbyarray.push(grby);
                }
                groupby = " GROUP BY " + groupbyarray.join(",");
            } else
                groupby = " GROUP BY " + options.groupby;
        }
        var order = "";
        var orderby = "";
        if (options.orderby) {
            if (Array.isArray(options.orderby)) {
                orderbyarray = [];
                for (var i in options.orderby) {
                    var column = options.orderby[i];
                    if (column[0] === "$")
                        orderbyarray.push(column.replace('$', ''));
                    else {
                        if (options.orderby.indexOf('_') !== -1)
                            orderbyarray.push(params.format(`{0}`, options.orderby));
                        else
                            orderbyarray.push(params.format(`{0}`, this.colPointer(options.orderby)));
                    }
                }
                orderby = " ORDER BY " + orderbyarray.join(",");
            } else {
                if (options.orderby[0] === "$")
                    orderby = " ORDER BY " + options.orderby.replace('$', '');
                else {
                    if (options.orderby.indexOf('_') !== -1)
                        orderby = " ORDER BY " + params.format(`{0}`, options.orderby);
                    else
                        orderby = " ORDER BY " + params.format(`{0}`, this.colPointer(options.orderby));

                }
            }
            if (options.order) {
                order = options.order;
            } else {
                order = "asc"
            }
        }
        var distinct = '';
        if (options.distinct !== undefined) {
            if (options.distinct) {
                distinct = "distinct";
            }
        }
        var $limit = '';
        var $limitvalue = 10;
        var $pagec = 1;
        var $page = '';
        if (options.orderby) {
            if (options.limit !== undefined) {
                $limitvalue = options.limit;
                if (options.page !== undefined) {
                    $pagec = options.page;
                    var $value = $limitvalue * ($pagec - 1);
                    $page = params.format("LIMIT {1} OFFSET {0}", $value, $limitvalue);
                }
            }
        }
        var query = params.format("{sentence} {distinct} {selectfinal} FROM \"{table}\" " + nickName + " {join} {where} {groupby} {orderby} {order} {limit} {page}",
            {
                sentence: sentence,
                distinct: distinct,
                selectfinal: selectfinal,
                joinColumns: joinColumns,
                table: offTableName,
                join: join,
                where: where,
                groupby: groupby,
                orderby: orderby,
                order: order,
                limite: $limit,
                page: $page
            }
        );
        var queryCount = params.format("SELECT count(*) count FROM \"{table}\" " + nickName + " {join} {where} {groupby}",
            {
                table: offTableName,
                join: join,
                where: where,
                groupby: groupby
            }
        );
        return await exports.data(queryCount, params).then(countData => {
            return exports.data(query, params, {
                limitvalue: $limitvalue,
                pagec: $pagec,
                limit: options.limit
            }).then((data) => {
                if (options.limit !== undefined)
                    if (data.index !== undefined) {
                        data.totalPage = Math.ceil(countData.data[0].count / data.index.limitvalue);
                        data.totalCount = countData.data[0].count;
                        data.currentPage = data.index.pagec;
                    } else
                        data.index = {};
                else
                    data.index = {};
                return data;
            });
        });
    };

};
