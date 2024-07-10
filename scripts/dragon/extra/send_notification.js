send_notification = {
    send: {
        send: function (data) {
            if (!CONFIG.features.onesignal)
                return;
            var url = '';
            if (data.url)
                url = data.http ? data.http + '://' + CONFIG.proxy.domain + ':' + CONFIG.proxy.port + '/' + CONFIG.folder + '/#' + data.url : 'http' + '://' + CONFIG.proxy.domain + ':' + CONFIG.proxy.port + '/' + CONFIG.folder + '/#' + data.url;

            // console.log("datos antes de enviar",url);
            SERVICE.base_onesignal.send(
                {
                    headings: {en: data.title},
                    contents: {en: data.content},
                    users: data.user,
                    url: url
                }, function (result) {
                    // console.log("la respuesta",result);
                });
        },
        email: function (data) {
            BASEAPI.mail({
                "to": data.to,
                "cc": data.cc,
                "bcc": data.bcc,
                "subject": data.subject,
                "name": data.name_show,
                "template": data.template,
                "fields": {
                    message: data.message,
                    message_body: data.message_body ? data.message_body : '',
                    list: data.list ? data.list : undefined,
                }
            }, function (result) {
                if (data.notification === 'yes')
                    NOTIFY.success("Correos enviados");
            });
        },
        email_auditoria: function (data) {
            BASEAPI.mail({
                "to": data.to,
                "cc": data.cc,
                "bcc": data.bcc,
                "subject": data.subject,
                "name": data.name_show,
                "template": data.template,
                "fields": {
                    message: data.message,
                    message_2: data.message_2 ? data.message_2 : '',
                    message_3: data.message_3 ? data.message_3 : '',
                    list: data.list ? data.list : undefined,
                    list2: data.list2 ? data.list2 : undefined
                }
            }, function (result) {
                if (data.notification === 'yes')
                    NOTIFY.success("Correos enviados");
            });
        },
        //Esta es la otra funcion para los correos de los auditores de auditorias.
        email_auditoria_auditores: function (data) {
            BASEAPI.mail({
                "to": data.to,
                "cc": data.cc,
                "bcc": data.bcc,
                "subject": data.subject,
                "name": data.name_show,
                "template": data.template,
                "fields": {
                    message: data.message,
                    tabla_data: data.tabla_data ? data.tabla_data : undefined,
                }
            }, function (result) {
                if (data.notification === 'yes')
                    NOTIFY.success("Correos enviados");
            });
        },
        //Esta es la otra funcion para los correos de los indicadores.
        email_indicadores: function (data) {
            if (data)
                if (data.to)
                    BASEAPI.mail({
                        "to": data.to,
                        "cc": data.cc,
                        "bcc": data.bcc,
                        "subject": data.subject,
                        "name": data.name_show,
                        "template": data.template,
                        "fields": {
                            message: data.message,
                            message_body: data.message_body ? data.message_body : '',
                            direccion_meta: data.direccion_meta,
                            meta_proyectada_total: data.meta_proyectada_total,
                            meta_alcanzada_total: data.meta_alcanzada_total
                        }
                    }, function (result) {
                        if (data.notification === 'yes')
                            NOTIFY.success("Correos enviados");
                    });
        }
    }

};
