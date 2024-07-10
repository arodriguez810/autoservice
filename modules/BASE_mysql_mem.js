exports.gentes = {};

class Database {

    constructor(params, config, tokenid) {
        this.tokenid = tokenid;
        if (!exports.gentes[this.tokenid]) {
            console.log("creo conexion para ", tokenid);

            exports.gentes[this.tokenid] = params.mysql.createConnection(params.CONFIG.mysql);
            exports.gentes[this.tokenid].on('error', function (err) {
                console.log('db error', err);
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.log('connection lost');
                } else {
                    console.log('connection lost ' + err);
                }
            });
        } else {
            console.log("ya existe la conexion ", tokenid);
        }
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            exports.gentes[this.tokenid].query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                try {
                    resolve(rows);
                } catch (e) {
                    reject(err);

                }
            });

        });
    }

    open() {
        return new Promise((resolve, reject) => {
            exports.gentes[this.tokenid].connect(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            exports.gentes[this.tokenid].end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}

exports.executeNonQuery = async function (query, params, show, tokenid) {

    if (show === undefined)
        console.log(query.pxz);
    var connection = new Database(params, params.CONFIG.mysql, tokenid);
    return await connection.query(query).then(async (data) => {
        return {
            query: query,
            error: false,
            recordset: data,
            index: 1
        };
    }).catch(err => {
        return {query: query, error: err.sqlMessage};
    });
};
exports.executeNonQueryArray = async function (queries, params, show, tokenid) {
    for (var query of queries)
        await exports.executeNonQuery(query, params, show, tokenid);
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
            var value = row[property].toString();
            if (property[0] === "$")
                columns.push(property.replace('$', ''));
            else
                columns.push("`" + property + "`");

            if (value[0] === "$")
                values.push(value.replace('$', ''));
            else if (value[0] === "#")
                values.push(`MD5('${params.CONFIG.appKey}${value.replace('#', '')}')`);
            else
                values.push((value === "true" ? "1" : value === "false" ? "0" : ("'" + value.replace("'", "''") + "'")));
        }
        if (get !== undefined) {
            queries += params.format("INSERT INTO `{0}`({1}) VALUES({2}); SELECT * FROM `{0}` where `" + get + "`=" + getvalue + ";", table, columns.join(", "), values.join(", "));
            break;
        } else
            queries += params.format("INSERT INTO `{0}`({1}) VALUES({2});", table, columns.join(", "), values.join(", "));
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
                var value = data[property];
                if (property[0] === "$")
                    columns = (property.replace('$', ''));
                else
                    columns = ("`" + property + "`");
                if (value[0] === "$")
                    values = (value.replace('$', ''));
                else if (value[0] === "#")
                    values = (`MD5('${params.CONFIG.appKey}${value.replace('#', '')}')`);
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
                            field = field[0] === '$' ? field.replace('$', '') : "`" + field + "`";
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
        queries += params.format("UPDATE `{0}` SET {1} {2};\n", table, sets.join(", "), where);
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
            var value = data[property];
            if (property[0] === "$")
                columns.push(property.replace('$', ''));
            else
                columns.push("`" + property + "`");
            if (value[0] === "$")
                values.push(value.replace('$', ''));
            else
                values.push("'" + value + "'");
        }
        queries += params.format("DELETE FROM `{0}` WHERE \n", table, columns.join(", "), values.join(", "));
    }
    return queries;
};
exports.data = async function (query, params, index, tokenid) {

    console.log(query.pxz);
    var connection = new Database(params, params.CONFIG.mysql, tokenid);
    return await connection.query(query).then(async (data) => {
        var realData = [];
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
            count: [data.length],
        };
    }).catch(err => {
        return {query: query, error: err.sqlMessage};
    });
};
exports.defaultRequests = function (Model, params) {
    params.modelName = Model.tableName;
    params.fs.readdir(params.util.format('./' + params.folders.views + '/%s', params.modelName), function (err, files) {
        params.modules.views.LoadEJS(files, params);
    });
    params.app.post('/api/ms_list', function (req, res) {
        console.log("api/ms_list");
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
            let tokenid = req.headers['x-access-token'] || req.headers['authorization'] || "";
            Model.all(req.query, token).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.post(params.util.format('/api/%s/list', Model.tableName), function (req, res) {
        console.log("list");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                return;
            }
            let tokenid = req.headers['x-access-token'] || req.headers['authorization'] || "";


            if (req.body.limit === undefined)
                req.body.limit = 10;
            if (req.body.page === undefined)
                req.body.page = 1;
            if (req.body.orderby === undefined)
                req.body.orderby = "id";

            Model.all(req.body, tokenid).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.post(params.util.format('/api/%s/listx', Model.tableName), function (req, res) {
        console.log("listx");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            let tokenid = req.headers['x-access-token'] || req.headers['authorization'] || "";
            if (req.body.limit === undefined)
                req.body.limit = 10;
            if (req.body.page === undefined)
                req.body.page = 1;
            if (req.body.orderby === undefined)
                req.body.orderby = "id";
            req.body.isx = true;
            Model.all(req.body, tokenid).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.get(params.util.format('/api/%s/all', Model.tableName), function (req, res) {
        console.log("all");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            let tokenid = req.headers['x-access-token'] || req.headers['authorization'] || "";
            Model.all(req.query, tokenid).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.get(params.util.format('/api/%s/get/:id', Model.tableName), function (req, res) {
        console.log("get id");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            let tokenid = req.headers['x-access-token'] || req.headers['authorization'] || "";
            Model.find(req.params.id, tokenid).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.post('/api/' + Model.tableName + '/insert', function (req, res) {
        console.log("insert");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            let tokenid = req.headers['x-access-token'] || req.headers['authorization'] || "";
            Model.insert(req.body, tokenid).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.post('/api/' + Model.tableName + '/insertID', function (req, res) {
        console.log("insertID");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            let tokenid = req.headers['x-access-token'] || req.headers['authorization'] || "";
            Model.insertID(req.body.insertData, req.body.field, req.body.value, tokenid).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.post('/api/' + Model.tableName + '/update/', function (req, res) {
        console.log("update");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            let tokenid = req.headers['x-access-token'] || req.headers['authorization'] || "";
            Model.update(req.body, tokenid).then((data) => {
                if (data.error !== false) res.send(data.error);
                res.json(data);
            }).catch(err => {
                res.json(err);
            });
        }).catch(function () {

        });
    });
    params.app.post('/api/' + Model.tableName + '/delete', function (req, res) {
        console.log("delete");
        params.secure.check(req, res).then(function (token) {
            if (!token.apptoken) {
                res.json(token);
                return;
            }
            let tokenid = req.headers['x-access-token'] || req.headers['authorization'] || "";
            Model.delete(req.body, tokenid).then((data) => {
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
    this.mysql = params.mysql;
    this.config = params.config;
    //search
    this.all = async function (options, tokenid) {
        return await this.search(options, undefined, tokenid);
    };
    this.allx = async function (options, tokenid) {
        return await this.searchx(options, undefined, tokenid);
    };
    this.find = async function (id, tokenid) {
        return await this.search({where: [{value: id}]}, undefined, tokenid);
    };
    this.where = async function (where, tokenid) {
        return await this.search({where: where}, undefined, tokenid);
    };
    //update
    this.update = async function (data, tokenid) {
        return await exports.data(await exports.update(tableName, data, params, tokenid), params, undefined, tokenid).then(result => {
            return result;
        });
    };
    this.updateAll = async function (data, tokenid) {
        return await exports.data(exports.update(tableName, data, params, tokenid), params, undefined, tokenid).then(result => {
            return result;
        });
    };
    this.updateWhere = async function (where, data, tokenid) {
        var finalwhere = [];
        for (var property in where) {
            finalwhere.push({value: eval("where." + property), field: property});
        }
        data.where = finalwhere;
        return await exports.data(exports.update(tableName, data, params, tokenid), params, undefined, tokenid).then((result) => {
            return result;
        });
    };
    //insert
    this.insert = async function (data, tokenid) {
        return await exports.data(await exports.insertQuery(tableName, data, params, tokenid), params, undefined, tokenid).then((result) => {
            return result;
        });
    };
    this.insertID = async function (data, field, value) {
        return await exports.data(await exports.insertQuery(tableName, data, params, field || "id", value !== '' ? ("'" + value + "'") : (" (SELECT MAX(id) FROM  `" + tableName + "`)"), tokenid), params, undefined, tokenid).then((result) => {
            return result;
        });
    };
    //delete
    this.deleteAll = async function (tokenid) {
        return await this.search({}, 'DELETE', tokenid);
    };
    this.delete = async function (where, tokenid) {
        return await this.search({where: where}, "DELETE", tokenid);
    };
    this.deleteWhere = async function (where, tokenid) {
        var finalwhere = [];
        for (var property in where) {
            finalwhere.push({value: eval("where." + property), field: property});
        }
        return await this.search({where: finalwhere}, "DELETE", tokenid);
    };
    this.searchAndDelete = async function (options, tokenid) {
        return await this.search(options, 'DELETE', tokenid);
    };
    //functions
    this.clearQuotes = function (data) {
        var newstr = params.S(data).replaceAll("`", "").s;
        newstr = params.S(newstr).replaceAll("`", "").s;
        return newstr;
    };
    this.colPointer = function (column, base) {
        base = base === undefined ? false : true;
        var spliter = column.split(".");
        if (spliter.length > 1) {
            var pointer = spliter[0];
            column = spliter[1];
            if (!base) {
                if (column[0] === "`")
                    return params.format("{0}.{1}", pointer, column);
                else
                    return params.format("{0}.`{1}`", pointer, column);
            } else {
                if (column[0] === "`")
                    return params.format("{0}.{1} as {2}_{3}", pointer, column, this.clearQuotes(pointer), this.clearQuotes(column));
                else
                    return params.format("{0}.`{1}` as {2}_{3}", pointer, column, this.clearQuotes(pointer), this.clearQuotes(column));
            }

        } else {
            var pointer = "BASE";
            if (!base) {
                if (column[0] === "`")
                    return params.format("{0}.{1}", pointer, column);
                else
                    return params.format("{0}.`{1}`", pointer, column);
            } else {
                if (column[0] === "`")
                    return params.format("{0}.{1} as {2}_{3}", pointer, column, this.clearQuotes(pointer), this.clearQuotes(column));
                else
                    return params.format("{0}.`{1}` as {2}_{3}", pointer, column, this.clearQuotes(pointer), this.clearQuotes(column));
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
                console.log("cuando se arma el where supongo", where);
                where = (whereWord ? "WHERE " : "") + where.join(" ") + "<<**>>";
                for (var i in connectors) {
                    var strtoreplace = connectors[i] + "<<**>>";
                    where = params.S(where).replaceAll(strtoreplace, "").s;
                }
                console.log("lo que se envia como where", where);
                return prefix === "" ? params.S(where).replaceAll('BASE.', '').s : where;
            }
        }
        return "";
    };
    //master
    this.search = async function (options, prefix, tokenid) {
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
                            var field = obj.field !== undefined ? obj.field : "`id`";
                            field = this.colPointer(obj.table + "." + field);
                            var baseField = obj.base !== undefined ? obj.base : "`id`";
                            baseField = this.colPointer(baseField);
                            var type = obj.type !== undefined ? obj.type : "LEFT";
                            var operator = obj.operator !== undefined ? obj.operator : "=";
                            var connector = obj.connector !== undefined ? obj.connector : "AND";
                            var Jcolumns = obj.columns !== undefined ? obj.columns : this.colPointer("`" + obj.table + "`.`name`", true);
                            var subwhere = this.makeWhere(options.join.where, false, options.isx);
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
                            var Jcolumns = this.colPointer("`" + inner + "`.`name`", true);
                            if (spliter.length > 3) {
                                Jcolumns = spliter[3].split(',');
                                for (const jco of Jcolumns)
                                    joinColumns.push(this.colPointer(inner + "." + jco, true));
                            } else {
                                joinColumns.push(Jcolumns);
                            }
                            join.push(params.format(" {0} JOIN {1} ON {2} {3} `{1}`.`{4}`", type, inner, this.colPointer(baseField), "=", "id"));
                        }
                    }
                    join = join.join(" ");
                } else {
                    var spliter = options.join.split(':');
                    var type = spliter[0];
                    var inner = spliter[1];
                    var baseField = spliter[2];
                    var Jcolumns = this.colPointer("`" + inner + "`.`name`", true);
                    if (spliter.length > 3) {
                        Jcolumns = spliter[3].split(',');
                        for (const jco of Jcolumns)
                            joinColumns.push(jco);
                    } else {
                        joinColumns.push(Jcolumns);
                    }
                    join = (params.format(" {0} JOIN {1} ON {2} {3} `{1}`.`{4}`", type, inner, this.colPointer(baseField), "=", "id"));
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
        var query = params.format("{sentence} {distinct} {selectfinal} FROM `{table}` " + nickName + " {join} {where} {groupby} {orderby} {order} {limit} {page}",
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
        var queryCount = params.format("SELECT count(*) count FROM `{table}` " + nickName + " {join} {where} {groupby}",
            {
                table: offTableName,
                join: join,
                where: where,
                groupby: groupby
            }
        );
        console.log("en el list", tokenid);

        return await exports.data(queryCount, params, undefined, tokenid).then(countData => {
            return exports.data(query, params, {
                limitvalue: $limitvalue,
                pagec: $pagec,
                limit: options.limit
            }, tokenid).then((data) => {
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
    this.searchx = async function (options, prefix, tokenid) {
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
                            var field = obj.field !== undefined ? obj.field : "`id`";
                            field = this.colPointer(obj.table + "." + field);
                            var baseField = obj.base !== undefined ? obj.base : "`id`";
                            baseField = this.colPointer(baseField);
                            var type = obj.type !== undefined ? obj.type : "LEFT";
                            var operator = obj.operator !== undefined ? obj.operator : "=";
                            var connector = obj.connector !== undefined ? obj.connector : "AND";
                            var Jcolumns = obj.columns !== undefined ? obj.columns : this.colPointer("`" + obj.table + "`.`name`", true);
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
                            var Jcolumns = this.colPointer("`" + inner + "`.`name`", true);
                            if (spliter.length > 3) {
                                Jcolumns = spliter[3].split(',');
                                for (const jco of Jcolumns)
                                    joinColumns.push(this.colPointer(inner + "." + jco, true));
                            } else {
                                joinColumns.push(Jcolumns);
                            }
                            join.push(params.format(" {0} JOIN {1} ON {2} {3} `{1}`.`{4}`", type, inner, this.colPointer(baseField), "=", "id"));
                        }
                    }
                    join = join.join(" ");
                } else {
                    var spliter = options.join.split(':');
                    var type = spliter[0];
                    var inner = spliter[1];
                    var baseField = spliter[2];
                    var Jcolumns = this.colPointer("`" + inner + "`.`name`", true);
                    if (spliter.length > 3) {
                        Jcolumns = spliter[3].split(',');
                        for (const jco of Jcolumns)
                            joinColumns.push(jco);
                    } else {
                        joinColumns.push(Jcolumns);
                    }
                    join = (params.format(" {0} JOIN {1} ON {2} {3} `{1}`.`{4}`", type, inner, this.colPointer(baseField), "=", "id"));
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
        var query = params.format("{sentence} {distinct} {selectfinal} FROM `{table}` " + nickName + " {join} {where} {groupby} {orderby} {order} {limit} {page}",
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
        var queryCount = params.format("SELECT count(*) count FROM `{table}` " + nickName + " {join} {where} {groupby}",
            {
                table: offTableName,
                join: join,
                where: where,
                groupby: groupby
            }
        );
        return await exports.data(queryCount, params, undefined, tokenid).then(countData => {
            return exports.data(query, params, {
                limitvalue: $limitvalue,
                pagec: $pagec,
                limit: options.limit
            }, tokenid).then((data) => {
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
