-- Script para crear vista materializada de planillas de recaudación 2024 con todos los campos

-- Eliminar la vista materializada existente si existe
DROP MATERIALIZED VIEW IF EXISTS datalake.planillas_recaudacion_2024_mv;

-- Crear la vista materializada completa
CREATE MATERIALIZED VIEW datalake.planillas_recaudacion_2024_mv AS
SELECT 
    pr.rif_contribuyente,
    pr.cod_seg_planilla,
    pr.fecha_trans,
    pr.num_planilla,
    pr.monto_total_trans,
    c.monto_concepto,
    cp.codigo_presupuestario,
    cp.designacion_presupuestario,
    f.nombre_forma,
    f.codigo_forma,
    b.codigo_banco,
    b.nombre_banco,
    pr.registro
FROM datalake.planillas_recaudacion_2024 pr 
LEFT JOIN datalake.conceptos_2024 c ON pr.id = c.id_planilla 
LEFT JOIN public.codigos_presupuestarios cp ON c.cod_presupuestario = cp.id
LEFT JOIN public.formas f ON pr.cod_forma = f.id
LEFT JOIN public.bancos b ON pr.cod_banco = b.id
WHERE pr.registro = true;

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_planillas_mv_rif_contribuyente ON datalake.planillas_recaudacion_2024_mv(rif_contribuyente);
CREATE INDEX idx_planillas_mv_cod_seg_planilla ON datalake.planillas_recaudacion_2024_mv(cod_seg_planilla);
CREATE INDEX idx_planillas_mv_fecha_trans ON datalake.planillas_recaudacion_2024_mv(fecha_trans);
CREATE INDEX idx_planillas_mv_codigo_forma ON datalake.planillas_recaudacion_2024_mv(codigo_forma);
CREATE INDEX idx_planillas_mv_codigo_banco ON datalake.planillas_recaudacion_2024_mv(codigo_banco);

-- Agregar comentario descriptivo
COMMENT ON MATERIALIZED VIEW datalake.planillas_recaudacion_2024_mv IS 
'Vista materializada de planillas de recaudación 2024 con información completa de conceptos, códigos presupuestarios, formas y bancos';

-- Verificar que la vista se creó correctamente
SELECT pg_matviews WHERE matviewname = 'planillas_recaudacion_2024_mv';

-- Mostrar un conteo de registros para verificar
SELECT COUNT(*) as total_registros FROM datalake.planillas_recaudacion_2024_mv; 