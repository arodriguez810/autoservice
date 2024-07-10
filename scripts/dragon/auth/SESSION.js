HISTORY = {
    save: async (tipo, data) => {
        let session = new SESSION().current();
        return await BASEAPI.insertIDp('history', {
            tipo: tipo,
            idd: data.id,
            data: JSON.stringify(data),
            usuario: session.usuario,
            compania: session.compania_id,
            fecha: "$now()"
        });
    },
    get: async (tipo, id, formula) => {
        let session = new SESSION().current();
        let data = await BASEAPI.listp('history', {
            where: [
                {field: 'tipo', value: tipo},
                {field: 'idd', value: id},
                {field: 'compania', value: session.compania_id}
            ],
            orderby: 'fecha',
            order: "desc",
            limit: 10
        });

        if (data.data)
            data = data.data;
        let cambios = [];
        if (data.length) {
            cambios.push('Historial de últimos cambios: (Usuario-Fecha-Hora)');
            data.forEach(rowx => {
                let row = rowx.data;
                if (row) {
                    try {
                        row = eval(`(${row})`);
                        if (!formula) {
                            let array = [];
                            Object.keys(row).forEach(d => {
                                if (row[d]) {
                                    array.push(`${capitalize(d)}: ${row[d]}`);
                                }
                            });
                            cambios.push(`${rowx.usuario} - "${array.join(", ")}" - ${LAN.datetime(rowx.fecha)}`);
                        } else {
                            cambios.push(`${rowx.usuario} - "${eval("`" + formula + "`")}" - ${LAN.datetime(rowx.fecha)}`);
                            return eval("`" + formula + "`");
                        }
                    } catch (e) {

                    }
                }
            });
            return cambios.join("\n");
        } else return `No hay historial disponible`;
    },
    fixfilter: [],
    formula: "${data}",
    show: (controller, tipo, id, formula, header, icon) => {
        let session = new SESSION().current();
        HISTORY.fixfilter = [
            {field: 'tipo', value: tipo},
            {field: 'idd', value: id},
            {field: 'compania', value: session.compania_id}
        ];
        HISTORY.formula = formula || "";
        controller.modal.modalView("historyx", {
            width: 'modal-full',
            header: {
                title: header || 'Histórico',
                icon: icon || "book3"
            },
            footer: {
                cancelButton: false
            },
            content: {
                loadingContentText: "Cargando...",
                sameController: 'historyx',
            },
        });
    }
};
$(document).on("click", "[data-history]", function () {
    let data = $(this).data();
    HISTORY.show(eval(data.history), data.type, data.id, data.formula, data.label);
});
$(document).on("mouseenter", "[data-history]", async function () {
    let data = $(this).data();
    $(this).attr("title", "Cargando historial...");
    let title = await HISTORY.get(data.type, data.id, data.formula);
    $(this).attr("title", title);
});
SESSION = function () {
    this.myprofile = function () {
        baseController.modalAction(
            this.current().path ? this.current().path() : CONFIG.users.path,
            MESSAGE.ic('mono.myprofile'),
            'user',
            'edit',
            this.current().getID(),
            "perfil"
        );
        My_profile_var = true;
    };
    this.abount = function () {
        baseController.currentModel.modalAction(
            "information",
            MESSAGE.ic('mono.about'),
            'info3',
            'about',
            this.current().getID(),
            "about"
        );
        My_profile_var = true;
    };
    this.definitivo = () => {
        var session = STORAGE.get("APPSESSION");
        if (session) {
            let departamental = ((session.groups || []).map(d => d.caracteristica || "")).join(",").toLowerCase().indexOf("departamental") !== -1;
            let departamental2 = ((session.groups || []).map(d => d.name || "")).join(",").toLowerCase().indexOf("dpto") !== -1 || ((session.groups || []).map(d => d.name || "")).join(",").toLowerCase().indexOf("departamental") !== -1;
            if (departamental || departamental2)
                return baseController.session.departamento;
        }
        return undefined;
    };
    this.current = function (direct) {
        var obj = direct || STORAGE.get("APPSESSION");
        if (!DSON.oseaX(obj)) {
            for (var i in CONFIG.users.addFields) {
                var calc = CONFIG.users.addFields[i];
                eval(`obj.${i} = function () {
                    return ${calc.replaceAll("&#34;", '"').replaceAll("&#39;", "'")};
                }`);
            }
        }
        try {
            obj.ip = IP;
        } catch (e) {
        }

        return obj;
    };

    this.runFunction = function (obj) {
        if (!DSON.oseaX(obj)) {
            for (var i in CONFIG.users.addFields) {
                var calc = CONFIG.users.addFields[i];
                eval(`obj.${i} = function () {
                    return ${calc.replaceAll("&#34;", '"').replaceAll("&#39;", "'")};
                }`);
            }
        }
        return obj;
    };
    this.register = function (data) {
        STORAGE.add("APPSESSION", data);
        new SESSION().update({openWizard: true});
    };
    this.isLogged = function () {
        return !DSON.oseaX(STORAGE.get("APPSESSION"));
    };
    this.destroy = function () {
        STORAGE.add("YOERADELTIPO", new SESSION().current().tipo_institucion);
        STORAGE.delete("APPSESSION");
        STORAGE.delete("depa");
        STORAGE.delete("depaM");
        STORAGE.delete("historico");
        STORAGE.delete("evento");
        STORAGE.delete('depaP')
    };
    this.ifLogoffRedirec = function (view) {
        var href = view || location.href;
        if (href.indexOf('auth/login') === -1 && href.indexOf(`auth/formulario`) === -1 && href.indexOf(`/outlook`) === -1) {
            if (href.indexOf('auth/forgot') === -1) {
                if (href.indexOf('auth/createaccount') === -1) {
                    if (href.indexOf('auth/restore') === -1) {
                        if (!this.isLogged()) {
                            MODAL.closeAll();
                            var http = new HTTP();
                            let YOERADELTIPO = STORAGE.get("YOERADELTIPO");

                            if (YOERADELTIPO == 2) {
                                http.redirecttag('auth/login?privada');
                                return true;
                            }

                            http.redirecttag('auth/login');
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };
    this.logoff = function () {
        SWEETALERT.confirm({
            message: MESSAGE.i('alerts.AYSCloseSession'),
            confirm: function () {
                STORAGE.add("YOERADELTIPO", new SESSION().current().tipo_institucion);
                new SESSION().destroy();
                location.reload();
            }
        });
    };
    this.terminated = function () {
        SWEETALERT.show({
            type: ENUM.modal.type.warning,
            title: MESSAGE.ic('mono.session'),
            message: MESSAGE.i('alerts.SessionEnd'),
            confirm: function () {
                MODAL.closeAll();
                new SESSION().destroy();
                location.reload();
            }
        });
    };
    this.update = function (obj) {
        var session = STORAGE.get("APPSESSION");
        for (var i in obj)
            session[i] = obj[i];
        STORAGE.add("APPSESSION", session);
        return session;
    };
};
