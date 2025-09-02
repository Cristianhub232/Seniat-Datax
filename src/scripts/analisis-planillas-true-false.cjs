const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.local') });

// Conexión a la base de datos XMLS
const xmlsSequelize = new Sequelize(process.env.XMLS_DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function analizarPlanillasTrueFalse() {
  try {
    console.log('🔍 Conectando a la base de datos XMLS...');
    await xmlsSequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    console.log('\n📊 ANALIZANDO DIFERENCIAS ENTRE PLANILLAS TRUE vs FALSE');
    console.log('=' .repeat(80));

    // 1. Estadísticas generales
    console.log('\n📈 ESTADÍSTICAS GENERALES:');
    const [statsGenerales] = await xmlsSequelize.query(`
      SELECT 
        COUNT(*) as total_planillas,
        COUNT(CASE WHEN registro = true THEN 1 END) as planillas_true,
        COUNT(CASE WHEN registro = false THEN 1 END) as planillas_false,
        SUM(monto_total_trans) as monto_total,
        SUM(CASE WHEN registro = true THEN monto_total_trans ELSE 0 END) as monto_true,
        SUM(CASE WHEN registro = false THEN monto_total_trans ELSE 0 END) as monto_false,
        AVG(monto_total_trans) as monto_promedio,
        AVG(CASE WHEN registro = true THEN monto_total_trans END) as monto_promedio_true,
        AVG(CASE WHEN registro = false THEN monto_total_trans END) as monto_promedio_false
      FROM datalake.planillas_recaudacion_2024
    `);

    const stats = statsGenerales[0];
    const porcentajeTrue = (stats.planillas_true / stats.total_planillas) * 100;
    const porcentajeFalse = (stats.planillas_false / stats.total_planillas) * 100;
    const porcentajeMontoTrue = (stats.monto_true / stats.monto_total) * 100;
    const porcentajeMontoFalse = (stats.monto_false / stats.monto_total) * 100;

    console.log(`📋 Total de planillas: ${stats.total_planillas.toLocaleString()}`);
    console.log(`✅ Planillas TRUE: ${stats.planillas_true.toLocaleString()} (${porcentajeTrue.toFixed(2)}%)`);
    console.log(`❌ Planillas FALSE: ${stats.planillas_false.toLocaleString()} (${porcentajeFalse.toFixed(2)}%)`);
    console.log(`💰 Monto total: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(stats.monto_total)}`);
    console.log(`✅ Monto TRUE: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(stats.monto_true)} (${porcentajeMontoTrue.toFixed(2)}%)`);
    console.log(`❌ Monto FALSE: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(stats.monto_false)} (${porcentajeMontoFalse.toFixed(2)}%)`);
    console.log(`📊 Monto promedio general: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(stats.monto_promedio)}`);
    console.log(`✅ Monto promedio TRUE: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(stats.monto_promedio_true)}`);
    console.log(`❌ Monto promedio FALSE: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(stats.monto_promedio_false)}`);

    // 2. Análisis por formas
    console.log('\n📋 ANÁLISIS POR FORMAS:');
    const [formasAnalysis] = await xmlsSequelize.query(`
      SELECT 
        f.codigo_forma,
        f.nombre_forma,
        COUNT(*) as total_planillas,
        COUNT(CASE WHEN pr.registro = true THEN 1 END) as planillas_true,
        COUNT(CASE WHEN pr.registro = false THEN 1 END) as planillas_false,
        SUM(pr.monto_total_trans) as monto_total,
        SUM(CASE WHEN pr.registro = true THEN pr.monto_total_trans ELSE 0 END) as monto_true,
        SUM(CASE WHEN pr.registro = false THEN pr.monto_total_trans ELSE 0 END) as monto_false,
        ROUND((COUNT(CASE WHEN pr.registro = false THEN 1 END) * 100.0 / COUNT(*)), 2) as porcentaje_false
      FROM datalake.planillas_recaudacion_2024 pr
      INNER JOIN public.formas f ON pr.cod_forma = f.id
      GROUP BY f.codigo_forma, f.nombre_forma
      HAVING COUNT(*) > 100
      ORDER BY porcentaje_false DESC, monto_false DESC
      LIMIT 15
    `);

    console.log('🏆 TOP 15 FORMAS CON MAYOR PORCENTAJE DE PLANILLAS FALSE:');
    console.log('─'.repeat(120));
    console.log('CÓDIGO | NOMBRE FORMA'.padEnd(60) + ' | TOTAL | TRUE | FALSE | %FALSE | MONTO FALSE');
    console.log('─'.repeat(120));

    formasAnalysis.forEach((forma, index) => {
      const nombre = forma.nombre_forma.length > 55 ? forma.nombre_forma.substring(0, 55) + '...' : forma.nombre_forma;
      const montoFalse = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(forma.monto_false);
      console.log(
        `${forma.codigo_forma.toString().padEnd(7)} | ${nombre.padEnd(58)} | ${forma.total_planillas.toString().padStart(5)} | ${forma.planillas_true.toString().padStart(4)} | ${forma.planillas_false.toString().padStart(5)} | ${forma.porcentaje_false.toString().padStart(6)}% | ${montoFalse}`
      );
    });

    // 3. Análisis temporal
    console.log('\n📅 ANÁLISIS TEMPORAL:');
    const [temporalAnalysis] = await xmlsSequelize.query(`
      SELECT 
        EXTRACT(YEAR FROM fecha_trans) as anio,
        EXTRACT(MONTH FROM fecha_trans) as mes,
        COUNT(*) as total_planillas,
        COUNT(CASE WHEN registro = true THEN 1 END) as planillas_true,
        COUNT(CASE WHEN registro = false THEN 1 END) as planillas_false,
        SUM(monto_total_trans) as monto_total,
        SUM(CASE WHEN registro = true THEN monto_total_trans ELSE 0 END) as monto_true,
        SUM(CASE WHEN registro = false THEN monto_total_trans ELSE 0 END) as monto_false,
        ROUND((COUNT(CASE WHEN registro = false THEN 1 END) * 100.0 / COUNT(*)), 2) as porcentaje_false
      FROM datalake.planillas_recaudacion_2024
      WHERE fecha_trans IS NOT NULL
      GROUP BY EXTRACT(YEAR FROM fecha_trans), EXTRACT(MONTH FROM fecha_trans)
      ORDER BY anio DESC, mes DESC
      LIMIT 12
    `);

    console.log('📊 ÚLTIMOS 12 MESES - DISTRIBUCIÓN TRUE vs FALSE:');
    console.log('─'.repeat(100));
    console.log('AÑO-MES'.padEnd(10) + ' | TOTAL | TRUE | FALSE | %FALSE | MONTO FALSE');
    console.log('─'.repeat(100));

    temporalAnalysis.forEach((periodo) => {
      const anioMes = `${periodo.anio}-${periodo.mes.toString().padStart(2, '0')}`;
      const montoFalse = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(periodo.monto_false);
      console.log(
        `${anioMes.padEnd(10)} | ${periodo.total_planillas.toString().padStart(5)} | ${periodo.planillas_true.toString().padStart(4)} | ${periodo.planillas_false.toString().padStart(5)} | ${periodo.porcentaje_false.toString().padStart(6)}% | ${montoFalse}`
      );
    });

    // 4. Análisis por bancos
    console.log('\n🏦 ANÁLISIS POR BANCOS:');
    const [bancosAnalysis] = await xmlsSequelize.query(`
      SELECT 
        b.codigo_banco,
        b.nombre_banco,
        COUNT(*) as total_planillas,
        COUNT(CASE WHEN pr.registro = true THEN 1 END) as planillas_true,
        COUNT(CASE WHEN pr.registro = false THEN 1 END) as planillas_false,
        SUM(pr.monto_total_trans) as monto_total,
        SUM(CASE WHEN pr.registro = true THEN pr.monto_total_trans ELSE 0 END) as monto_true,
        SUM(CASE WHEN pr.registro = false THEN pr.monto_total_trans ELSE 0 END) as monto_false,
        ROUND((COUNT(CASE WHEN pr.registro = false THEN 1 END) * 100.0 / COUNT(*)), 2) as porcentaje_false
      FROM datalake.planillas_recaudacion_2024 pr
      INNER JOIN public.bancos b ON pr.cod_banco = b.codigo_banco
      GROUP BY b.codigo_banco, b.nombre_banco
      HAVING COUNT(*) > 50
      ORDER BY porcentaje_false DESC, monto_false DESC
      LIMIT 10
    `);

    console.log('🏆 TOP 10 BANCOS CON MAYOR PORCENTAJE DE PLANILLAS FALSE:');
    console.log('─'.repeat(100));
    console.log('CÓDIGO | NOMBRE BANCO'.padEnd(40) + ' | TOTAL | TRUE | FALSE | %FALSE | MONTO FALSE');
    console.log('─'.repeat(100));

    bancosAnalysis.forEach((banco) => {
      const nombre = banco.nombre_banco.length > 38 ? banco.nombre_banco.substring(0, 38) + '...' : banco.nombre_banco;
      const montoFalse = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(banco.monto_false);
      console.log(
        `${banco.codigo_banco.toString().padEnd(7)} | ${nombre.padEnd(40)} | ${banco.total_planillas.toString().padStart(5)} | ${banco.planillas_true.toString().padStart(4)} | ${banco.planillas_false.toString().padStart(5)} | ${banco.porcentaje_false.toString().padStart(6)}% | ${montoFalse}`
      );
    });

    // 5. Resumen de diferencias clave
    console.log('\n🎯 RESUMEN DE DIFERENCIAS CLAVE:');
    console.log('=' .repeat(80));

    const diferenciaMonto = stats.monto_true - stats.monto_false;
    const diferenciaPorcentaje = porcentajeTrue - porcentajeFalse;
    const diferenciaPromedio = stats.monto_promedio_true - stats.monto_promedio_false;

    console.log(`📊 Diferencia en cantidad: ${(stats.planillas_true - stats.planillas_false).toLocaleString()} planillas más TRUE que FALSE`);
    console.log(`📊 Diferencia en porcentaje: ${diferenciaPorcentaje.toFixed(2)}% más TRUE que FALSE`);
    console.log(`💰 Diferencia en monto: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(diferenciaMonto)} más en TRUE que FALSE`);
    console.log(`📊 Diferencia en promedio: ${new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(diferenciaPromedio)} más en promedio TRUE que FALSE`);

    // 6. Recomendaciones
    console.log('\n💡 RECOMENDACIONES:');
    console.log('─'.repeat(80));
    console.log('• Las planillas FALSE representan un riesgo financiero significativo');
    console.log('• Se recomienda revisar las formas con mayor porcentaje de FALSE');
    console.log('• Implementar validaciones adicionales para reducir planillas FALSE');
    console.log('• Monitorear bancos con alto porcentaje de planillas FALSE');
    console.log('• Establecer alertas para planillas con montos elevados en FALSE');

    console.log('\n🎉 Análisis completado exitosamente');

  } catch (error) {
    console.error('❌ Error durante el análisis:', error);
  } finally {
    await xmlsSequelize.close();
  }
}

analizarPlanillasTrueFalse(); 