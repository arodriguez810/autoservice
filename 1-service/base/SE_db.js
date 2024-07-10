var params = {};
exports.run = async function (_params) {
    params = _params;


};
exports.api = {
    gets: {},
    posts: {
        importProductos: async function (request) {
            var module = params.CONFIG.mysqlactive ? params.modules.mysql : params.modules.postgre;
            var preter = params.CONFIG.mysqlactive ? 'call' : 'select';
            return await module.executeNonQuery(`${preter} heredarProductosEstrategicos(${request.compania})`, params)
                .then(function (data) {
                    return data
                }).catch(err => {
                    return err;
                });
        },
        directQuery: async function (request) {
            var module = params.CONFIG.mysqlactive ? params.modules.mysql : params.modules.postgre;
            return await module.executeNonQuery(`${request.query}`, params)
                .then(function (data) {
                    return data
                }).catch(err => {
                    return err;
                });
        },
    },
    puts: {},
    deletes: {},
    options: {}
};
