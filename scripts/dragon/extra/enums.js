ENUM_2 = {
    documentos_estatus: {
      Eliminado: 4
    },
    COMPANY_TYPE: {
        publica: 1,
        privada: 2
    },
    poa_estatus: {
        Inactivo: 0,
        Activo: 1,
        Pendiente_a_autorizar: 3,
        Autorizado: 4,
        Cerrado: 5
    },
    pei_estatus: {
        Inactivo: 0,
        Activo: 1,
        Pendiente_a_autorizar: 3,
        Autorizado: 4,
        Cerrado: 5
    },
    presupuesto_estatus: {
        Pendiente: 1,
        Trabajado: 2,
        Completo: 3
    },
    asignacion_especial_estatus: {
        Completa: 1,
        Incompleto: 0,
        Completado: 1,
        Pendiente: 2,
        Rechazado: 3
    },
    actividad_poa_estatus: {
        Completa: 1,
        Incompleto: 0,
        Completada: 1,
        Abierta: 2,
        Cancelada: 3,
        Detenida: 4,
        Trabajada: 5,
        Ejecucion: 6
    },
    actividad_apoyo_estatus: {
        Pendiente: 1,
        Completa: 2,
        Cancelada: 3,
        Detenida: 4
    },
    actividad_proyecto_estatus: {
        Abierta: 1,
        Trabajada: 2,
        Ejecucion: 3,
        Detenida: 4,
        Cancelada: 5,
        Completa: 6
    },
    actividad_apoyo_proyecto_estatus: {
        Abierta: 1,
        Trabajada: 2,
        Ejecucion: 3,
        Detenida: 4,
        Cancelada: 5,
        Completa: 6
    },
    razon: {
        Completado: 1,
        A_Tiempo: 2,
        Completado_fuera_tiempo: 3,
        Parcialmente_completado: 4,
        Detenido: 5,
        Incompleto: 6
    },
    productos_estatus: {
        Abierto: 1,
        Detenido: 2,
        Completado: 3,
        Cancelada: 4
    },
    tipo_comentario: {
        PEI_General: 1,
        POA_General: 2,
        POA_Presupuesto: 3,
        POA_Producto: 4,
        PEI_Resultado: 5,
        Productos_POA: 6,
        Liberar_Presupuesto: 7,
        Trabajar_actividad: 8,
        Actualizacion_indicadores_pei: 9,
        Actualizacion_indicadores_poa: 10,
        Actividades_apoyo: 11,
        Actualizacion_indicadores_poa_actividad: 12,
        Actualizacion_indicadores_poa_proceso: 23,
        Actualizacion_indicadores_poa_generico: 19,
        Pacc_departamental_detail: 13,
        Pacc_departamental: 14,
        Riesgo: 21,
        Proyecto_actividad_apoyo: 25,
        proyecto_actividad: 26,
        trabajar_puntos_de_verificación: 29
    },
    Grupos: {
        director_general: "DG",
        director_departamental: "DP",
        analista_de_planificacion: "AP",
        analista_departamental: "AD",
        solo_lectura: "SL",
        analista_de_calidad: "AC",
        supervisor_de_calidad: "SC"
    },
    msj_entidad: [
        '.`actividades_apoyo',
        '.`actividades_poa',
        '.`actividades_poa_estatus',
        '.`alerta',
        '.`asignacion_especial_poa',
        '.`asignacion_especial_poa_estatus',
        '.`caracteristica',
        '.`cargo',
        '.`categoria_alerta',
        '.`clientes_compromisos',
        '.`clientes_institucion',
        '.`comentarios',
        '.`compania',
        '.`configuracion',
        '.`departamento',
        '.`eje_estrategico',
        '.`end',
        '.`estrategia',
        '.`estrategia_foda',
        '.`estrategia_pesta',
        '.`evaluacion_pei',
        '.`evaluacion_poa',
        '.`foda',
        '.`foda_items',
        '.`foda_type',
        '.`indicador_pei',
        '.`indicador_pei_ano',
        '.`indicador_poa',
        '.`indicador_poa_periodo',
        '.`indicador_producto_poa',
        '.`indicador_resultado_pei',
        '.`marco_estrategico',
        '.`marco_estrategico_valores',
        '.`marco_estrategicos_virtudes',
        '.`objetivo',
        '.`objetivo_end',
        '.`objetivo_estrategico',
        '.`objetivo_estrategico_oe_end',
        '.`ods',
        '.`pei',
        '.`pei_estatus',
        '.`pei_poa',
        '.`periodo',
        '.`pesta',
        '.`pesta_items',
        '.`pesta_type',
        '.`pnpsp',
        '.`poa',
        '.`poa_estatus',
        '.`poa_monitoreo',
        '.`presupuesto_aprobado',
        '.`presupuesto_aprobado_estatus',
        '.`productos_poa',
        '.`productos_poa_status',
        '.`prudcto_involucrado',
        '.`razon',
        '.`resultado',
        '.`tipo_comentario',
        '.`tipo_institucion',
        '.`tipo_inversion',
        '.`usuario',
        '.`perspectiva',
        '.`tipoMeta',
        '.`direccionMeta',
        '.`features',
        '.`hint_entity',
        '.`hint_fields',
        '.`institucion',
        '.`sec_objetivo_sectorial',
        '.`indicador_actividad'
    ],
    msj_entidad_mostrar: [
        'Actividades de Apoyo',
        'Actividades',
        'Actividades poa Eestatus',
        'Alerta',
        'Asignación Especial',
        'Asignacion Especial Estatus',
        'Característica',
        'Cargo',
        'Categoría Alerta',
        'Clientes compromisos',
        'Clientes Institución',
        'Comentarios',
        'Compañia',
        'Configuración',
        'Departamentos',
        'Eje Estratégico',
        'END',
        'Estrategia',
        'Estrategia foda',
        'Estrategia pesta',
        'Evaluacion_pei',
        'Evaluacion_poa',
        'FODA',
        'FODA Items',
        'FODA Type',
        'Indicador PEI',
        'Indicador PEI año',
        'Indicador POA',
        'Indicador POA período',
        'Indicador Proyecto/Producto',
        'Indicador Resultado PEI',
        'Marco Estratégico',
        'Marco Estratégico valores',
        'Conductas Asociadas',
        'Objetivo',
        'Objetivo END',
        'Objetivo Estratégicos',
        'Objetivo Estratégico END',
        'ODS',
        'PEI',
        'PEI estatus',
        'Pei_poa',
        'Periodo',
        'PESTA',
        'PESTA Items',
        'PESTA Type',
        'PNPSP',
        'POA',
        'POA Estatus',
        'Poa_monitoreo',
        'Programación de presupuesto',
        'Programación de presupuesto Estatus',
        'Proyectos/Productos',
        'Proyecto/Producto Estatus',
        'Proyectos/Productos',
        'Razón',
        'Resultado',
        'Tipo Comentarios',
        'Tipo de Institución',
        'Tipo Inversión',
        'Usuario',
        'Perspectiva',
        'Tipo de Meta',
        'Dirección de Meta',
        'Features',
        'Hint Entity',
        'Hint Fields',
        'Institución',
        'Objetivo Sectorial',
        'Indicador de Actividad'
    ],
    sin_dato: {
        valor_default: -1,
        cero: 0,
        nada: '',
        valor: 1
    },
    MANEJA_PACC: {
        Si: 1,
        No: 2 || 0
    },
    PACC_DEPARTAMENTAL: {
        "D-DC": 1,
        "D-EP": 2,
        "D-PP": 3,
        "D-EV": 4,
        "D-AP": 5
    }
};