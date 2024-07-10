String.prototype.lines = function () {

    return this.split(/\r*\n/);
};

function has_scrollbar(name) {
    var elem = document.getElementById(name);
    return elem.clientHeight < elem.scrollHeight;
}

DSON = {
    stringToObject: (obj) => {
        if (typeof obj === "object")
            return obj;
        if (typeof obj === "string") {
            try {
                return eval("(" + obj + ")");
            } catch (e) {
                return {};
            }
        }
        return obj;
    },
    isNumberKey: function (evt, val) {
        // console.log(val.value);
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        return !(charCode !== 46 && charCode > 31
            && (charCode < 48 || charCode > 57));
    },
    removeOther: function (obj, props) {
        var newObj = {};
        for (var i in obj) {
            if (props.indexOf(i) !== -1) {
                newObj[i] = obj[i];
            }
        }
        return newObj;
    },
    isNumberKeyPercentage: function (evt, val) {
        // console.log(val.value);
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        return !(charCode > 31
            && (charCode < 48 || charCode > 57));
    },
    isNumberKeyNegative: function (evt, val) {
        var charCode = (evt.which) ? evt.which : evt.keyCode;
        return !(charCode !== 45 && charCode > 31
            && (charCode < 48 || charCode > 57));
        //  console.log(value);
        // e.target.value = value.replace(/(?!^)-/g, '').replace(/^,/, '').replace(/^-,/, '-');
        // console.log(e.target.value);
        // return e.target.value;
    },
    QUERO: function () {
        var obj = {};
        var query = location.href;
        if (query !== undefined) {
            query = query.split("?");
            if (query.length > 0) {
                query = query[1];
                if (query !== undefined) {
                    query = query.split('&');
                    if (query.length > 0) {
                        query.forEach(d => {
                            var segments = d.split("=");
                            if (segments.length > 1) {
                                var key = segments[0];
                                var value = segments[1];
                                if (obj.hasOwnProperty(key)) {
                                    if (!Array.isArray(obj)) {
                                        var starconly = eval(`obj.${key}`);
                                        eval(`obj.${key} = [];`);
                                        eval(`obj.${key}.push(starconly)`);
                                        eval(`obj.${key}.push(value)`);
                                    } else {
                                        eval(`obj.${key}.push(value)`);
                                    }
                                } else {
                                    eval(`obj.${key} = value;`);
                                }
                            }
                        });
                    }
                }
            }
            return obj;
        }
    },
    CHTML: function (str) {
        str = (str).replaceAll("&#39;", '"');
        str = (str).replaceAll("&#34;", "'");
        str = (str).replaceAll("&lt;", "<");
        str = (str).replaceAll("&gt;", ">");
        return str;
    },
    UNIVERSAL: "YYYY/MM/DD",
    UNIVERSALTIME: "YYYY/MM/DD H:mm",
    DTF: function (format) {
        var newformat = format;
        newformat = newformat.replace("LTS", moment().localeData()._longDateFormat.LTS);
        newformat = newformat.replace("LT", moment().localeData()._longDateFormat.LT);
        newformat = newformat.replace("LLLL", moment().localeData()._longDateFormat.LLLL);
        newformat = newformat.replace("LLL", moment().localeData()._longDateFormat.LLL);
        newformat = newformat.replace("LL", moment().localeData()._longDateFormat.LL);
        newformat = newformat.replace("L", moment().localeData()._longDateFormat.L);
        return newformat;
    },
    substringif: function (str, len) {
        return str.length >= len ? str.substring(0, len) + "..." : str;
    },
    cleanSpace: function (str) {
        return str.split(' ').join('_');
    },
    template: function (templatestring, t) {
        return new Function("return `" + templatestring + "`;").call(t);
    },
    merge: function (from, to, deep) {
        return $.extend(deep || true, from, to);
    },
    OSO: function (object) {
        return eval("(" + JSON.stringify(object) + ")");
    },
    EO: function (string) {
        try {
            return eval("(" + string + ")");
        } catch (e) {

        }
    },
    ULALIA: function (arays, custom_class) {
        if (arays)
            if (arays.filter(d => d).length)
                return `<ul style=''><li class="${custom_class || ""}" style=''>${arays.join(`</li><li class="${custom_class || ""}">`)}</li></ul>`;
        return "";
    },
    OLALIA: function (arays) {
        return `<ol style=""><li>${arays.join("</li><li>")}</li></ol>`;
    },
    LATA: function (columns, rows) {
        var table = "<table class='table-responsive table table-togglable table-framed sindu-table dragon-table dragon_audit-drag'><thead><tr class='bg-secundary'>";
        for (var column of columns) {
            table += `<th>${column}</th>`;
        }
        table += "<tbody>";
        table += "<tr>";
        for (var row of rows) {
            for (var cell of row) {
                table += `<td>${cell}</td>`;
            }
            table += "</tr>";
        }
        table += "</tbody>";
        table += "</tr></thead></table>";
        return table;
    },
    OMG: function (id, scope) {
        eval(`${scope}.loadImage${id} = function () {
            FILE.runServerFile($("#${id}"));
        }`);
        if (`${scope}.form.beginFunctions.indexOf('${scope}.loadImage${id}();')===-1`) {
            //eval(`${scope}.form.beginFunctions.push('${scope}.loadImage${id}();');`);
        }
        eval(`${scope}.loadImage${id}();`);
    },
    equals: function (obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    },
    mergeBool: function (from, to, naturally) {
        for (var i in from) {
            if (from.hasOwnProperty(i)) {
                if (typeof to[i] === 'object') {
                    DSON.mergeBool(from[i], to[i]);
                } else if (to[i] === false) {
                    to[i] = from[i];
                } else if (!to.hasOwnProperty(i)) {
                    to[i] = false;
                }
            }
        }
    },
    jalar: function (from, to, only) {
        for (var i in from) {
            if (to.hasOwnProperty(i)) {
                if (typeof to[i] === 'object') {
                    DSON.jalar(from[i], to[i]);
                } else {
                    if (!only)
                        to[i] = from[i];
                    else {
                        if (from[i] === only)
                            to[i] = from[i];
                    }
                }
            }
        }
    },
    allvalue: function (to, value) {
        for (var i in to) {
            if (typeof to[i] === 'object') {
                DSON.allvalue(to[i], value);
            } else if (to[i] !== value) {
                to[i] = value;
            }
        }
    },
    invermerge: function (from, to, deep) {
        return $.extend(deep || true, to, from);
    },
    keepInvermerge: function (from, to, deep) {
        var fromy = DSON.merge(from, {});
        return $.extend(deep || true, to, fromy);
    },
    keepmerge: function (from, to, deep) {
        $.extend(deep || true, from, to);
    },
    oseaX: function (obj) {
        if (Array.isArray(obj)) {
            return obj.length === 0;
        }
        return (
            obj === '[NULL]' || obj === undefined || typeof obj === "undefined" || typeof obj === "not defined" || obj === null || obj === "" || obj < 0 || obj === '0' || obj === 'null'
        );
    },
    oseaX0: function (obj) {
        if (Array.isArray(obj)) {
            return obj.length === 0;
        }
        return (
            obj === '[NULL]' || obj === undefined || obj === null || obj === "" || obj < 0
        );
    },
    NewoseaX0: function (obj) {
        if (Array.isArray(obj)) {
            return obj.length === 0;
        }
        return (
            obj === '[NULL]' || obj === undefined || obj === null || obj === ""
        );
    },
    ifundefined: function (variable, result) {
        return variable === undefined ? result : variable;
    },
    iffunction: function (obj) {
        return typeof obj === "function";
    },
    cleanNumber: function (number) {

        if (DSON.oseaX(number))
            return 0;
        if (new SESSION().current()) {
            let toreplace = new SESSION().current().monedaformat[1];
            if (toreplace === ",") {
                return number.replace(/[^\d,-]/g, '');
            }
        }
        return number.replace(/[^\d.-]/g, '');
    },
    noset: function (text) {
        return "";
    },
    jsonToArray: function (json) {
        var newarray = [];
        json.forEach((item) => {
            var rowArray = [];
            for (var i in item)
                rowArray.push(item[i]);
            newarray.push(rowArray);
        });
        return newarray;
    },
    jsonToCSV: function (json, hasColumns, name) {
        if (json.length > 0) {
            var csv = '';
            var columns = [];
            if (hasColumns !== false) {
                for (var i in json[0]) {
                    columns.push(capitalize(i));
                }
                csv += columns.join(",") + "\r\n";
            }
            for (var step of json) {
                var values = [];
                for (var i in step) {
                    values.push(step[i]);
                }
                csv += `"${values.join('","')}"\r\n`;
            }
            SWEETALERT.loading({title: MESSAGE.ic('mono.downloading')});
            DOWNLOAD.csv(`${name}.csv`, csv);
            swal.close();
        } else {
            SWEETALERT.show(MESSAGE.i('alerts.Theresnotdatafordownload'));
        }
    },
    viewData: {},
    setViewData(obj) {
        DSON.viewData = {};
        DSON.viewData = $.extend(true, obj, DSON.viewData);
    }
};
