VALIDATION = DSON.merge(VALIDATION, {
    number: {
        range: function (value, from, to) {
            return {
                valid: (value >= from && value <= to),
                message: `${MESSAGE.i('validations.Numbermustbebetween')} ${from} ${MESSAGE.i('mono.and')} ${to}`,
                type: VALIDATION.types.error
            };
        },
        mayorWarning: function (presupuesto, proyectado) {
            return {
                valid: (presupuesto <= proyectado),
                message: `El presupuesto es mayor al proyectado favor verificar las actividades de apoyo`,
                type: VALIDATION.types.warning
            };
        }
    }
});
