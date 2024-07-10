var _params = null;
exports.init = async function (params) {
    _params = params;
    var clean = function () {
        var connection = params.modules.mysql;
        connection.data(`select * from mepydfiles where estado='Pendiente' order by id asc limit 1`, _params).then(async data => {
            if (data.data.length > 0) {
                var result = data.data[0];
                console.log('Busco una solicitud');
                connection.executeNonQuery(`update mepydfiles set estado='Generado' where id=${result.id}`, _params).then(async x => {
                    console.log('Marcado como generado');
                    let query = `INSERT INTO mepydreports SELECT  BASE.*, '${result.id}' report FROM \`vw_mepyd\` BASE  WHERE  BASE.\`compania\` = '${result.compania}'    ORDER BY  compania_base,compania,eje,objetivo,politica,impacto,denominacion_pnpsp,indicador_denominacion_pnpsp,resultado,indicador_pei,end_edt,oge_edt,oes_edt,la_edt,producto_id asc  LIMIT 9007199254740991 OFFSET 0`;
                    connection.executeNonQuery(query, _params).then(async report => {
                        console.log('Insertó el reporte');
                        params.servicesFunctions.base_onesignal.posts.send(
                            {
                                headings: {en: 'Reporte Generado'},
                                contents: {en: 'Se ha generado su reporte solicitado: Planificación Estratégica VS Instrumentos de Planificación Nacional'},
                                users: [result.usuario],
                            });
                        console.log('Envio la push');

                        mail({
                            to: [result.correo],
                            subject: "Reporte Planificación Estratégica VS Instrumentos de Planificación Nacional",
                            name: "noReply",
                            template: 'email/mepyd',
                            fields: {
                                nombre: result.nombre
                            }
                        });

                    });
                });
                //*
            }
        });
    };

    function mail(req) {
        res = {};
        var models = params.models
            .concat(params.modelsql)
            .concat(params.modelmysql)
            .concat(params.modeloracle)
            .concat(params.modelstorage);
        try {
            var transporter = params.mail.createTransport(params.CONFIG.smtp);
            var options = params.CONFIG.smptOptions;
            var from = params.CONFIG.support.email || params.CONFIG.smptOptions.sender;
            var name = params.CONFIG.developerBy.name || params.CONFIG.smptOptions.name;
            if (!req.to)
                res = {error: "mailneedreceivers", success: false};
            if (!req.subject)
                res = {error: "mailneedsubject", success: false};
            if (!req.html && !req.text && !req.template)
                res = {error: "mailneedbody", success: false};
            var mailOptions = {
                from: `"${name}" ${from}`,
                to: req.to,
                subject: req.subject
            };
            if (req.cc) {
                mailOptions.cc = req.cc;
            }
            if (req.bcc) {
                mailOptions.bcc = req.bcc;
            }
            if (req.text) {
                mailOptions.text = req.text;
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        res = {error: error, success: false};
                    }
                    res = {success: true};
                });
            }
            if (req.html) {
                mailOptions.html = req.html;
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log('si', res);
                        // res = {error: error, success: false});
                    }
                    res = {success: true};
                });
            }
            if (req.template) {
                params.app.render("../" + params.folders.viewsDragon + "/templates/" + req.template,
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
                            res = {error: err, html: html};
                            return;
                        }
                        mailOptions.html = html;
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                res = {error: error, success: false};
                            }
                            console.log('Envio la correo');
                            res = {success: true};
                        });
                    }
                );
            }
        } catch (e) {
            console.log('error al intentar enviar los correo el posible error pudo ser que no existen un correo valido', e);
        }
    }

    if (_params.CONFIG.mysqlactive) {
        for (var i = 0; i <= 60; i += 1) {
            params.schedule.scheduleJob({minute: i}, clean);
        }
    }
};
