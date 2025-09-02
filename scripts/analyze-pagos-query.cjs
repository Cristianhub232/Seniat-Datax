const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001';

async function analyzePagosQuery() {
  try {
    console.log('🔍 Analizando query de Pagos Ejecutados...\n');
    
    // 1. Login
    console.log('1. Realizando login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login falló');
      return;
    }
    
    console.log('✅ Login exitoso');
    
    // 2. Obtener token
    const cookies = loginResponse.headers['set-cookie'];
    const authCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
    const authToken = authCookie.split(';')[0];
    
    // 3. Analizar la estructura de la query
    console.log('\n2. Analizando estructura de la query...');
    
    const queryStructure = {
      tables: [
        'CGBRITO.CARTERA_CONTRIBUYENTES (cc)',
        'DBO.MOVIMIENTO_PAGO (mp)',
        'DATOSCONTRIBUYENTE.CONTRIBUYENTE (c)',
        'DATOSCONTRIBUYENTE.DEPENDENCIA (d)',
        'DATOSCONTRIBUYENTE.TIPO_CONTRIBUYENTE (tc)',
        'dbo.BANCO (b)',
        'dbo.FORMULARIO (f)'
      ],
      fields: [
        'cc.rif - RIF del contribuyente',
        'c.APELLIDO_CONTRIBUYENTE - Apellido del contribuyente',
        'mp.MONTO_TOTAL_PAGO - Monto total del pago',
        'mp.TIPO_DOCUMENTO_PAGO - Tipo de documento de pago',
        'mp.FECHA_RECAUDACION_PAGO - Fecha de recaudación del pago',
        'mp.NUMERO_DOCUMENTO_PAGO - Número de documento de pago',
        'mp.BANCO_PAGO - Banco del pago',
        'mp.PERIODO_PAGO - Período del pago',
        'd.NOMBRE_DEPENDENCIA - Nombre de la dependencia',
        'tc.DESCRIPCION_TIPO_CONTRIBUYENTE - Descripción del tipo de contribuyente',
        'c.ID_CONTRIBUYENTE - ID del contribuyente (para validar RIF)',
        'b.NOMBRE_BANCO - Nombre del banco',
        'f.DESCRIPCION_FORMULARIO - Descripción del formulario'
      ],
      joins: [
        'LEFT JOIN DBO.MOVIMIENTO_PAGO mp ON mp.RIF_CONTRIBUYENTE_PAGO = cc.RIF',
        'LEFT JOIN DATOSCONTRIBUYENTE.CONTRIBUYENTE c ON cc.RIF = c.RIF_CONTRIBUYENTE',
        'LEFT JOIN DATOSCONTRIBUYENTE.DEPENDENCIA d ON mp.DEPENDENCIA_SECTOR_PAGO = d.CODIGO_DEPENDENCIA',
        'LEFT JOIN DATOSCONTRIBUYENTE.TIPO_CONTRIBUYENTE tc ON c.TIPO_CONTRIBUYENTE = tc.CODIGO_TIPO_CONTRIBUYENTE',
        'LEFT JOIN dbo.BANCO b ON mp.BANCO_PAGO = b.CODIGO_BANCO',
        'LEFT JOIN dbo.FORMULARIO f ON mp.TIPO_DOCUMENTO_PAGO = f.CODIGO_FORMULARIO'
      ],
      filters: [
        'Filtro obligatorio de tiempo en FECHA_RECAUDACION_PAGO',
        'RIF inválidos: registros donde c.ID_CONTRIBUYENTE IS NULL'
      ]
    };
    
    console.log('📊 Estructura de la query:');
    console.log('   - Tablas involucradas:', queryStructure.tables.length);
    console.log('   - Campos seleccionados:', queryStructure.fields.length);
    console.log('   - Joins realizados:', queryStructure.joins.length);
    console.log('   - Filtros aplicados:', queryStructure.filters.length);
    
    console.log('\n📋 Campos principales:');
    queryStructure.fields.forEach((field, index) => {
      console.log(`   ${index + 1}. ${field}`);
    });
    
    console.log('\n🔗 Relaciones (JOINS):');
    queryStructure.joins.forEach((join, index) => {
      console.log(`   ${index + 1}. ${join}`);
    });
    
    console.log('\n⚡ Filtros especiales:');
    queryStructure.filters.forEach((filter, index) => {
      console.log(`   ${index + 1}. ${filter}`);
    });
    
    // 4. Análisis de funcionalidades requeridas
    console.log('\n3. Funcionalidades requeridas:');
    const requirements = [
      '✅ Filtro obligatorio de tiempo en FECHA_RECAUDACION_PAGO',
      '✅ Identificación de RIF inválidos (ID_CONTRIBUYENTE IS NULL)',
      '✅ Descarga de Excel con los resultados',
      '✅ Mismo estilo visual que Cartera de Contribuyentes',
      '✅ Integración en sección "Módulos Transaccionales"'
    ];
    
    requirements.forEach(req => console.log(`   ${req}`));
    
    // 5. Resumen del análisis
    console.log('\n📋 RESUMEN DEL ANÁLISIS:');
    console.log('='.repeat(60));
    console.log('🎯 El módulo "Pagos Ejecutados" debe:');
    console.log('   • Mostrar pagos con filtro de fecha obligatorio');
    console.log('   • Identificar RIF inválidos automáticamente');
    console.log('   • Permitir descarga de Excel');
    console.log('   • Mantener consistencia visual con Cartera');
    console.log('   • Integrarse en la sección transaccional');
    console.log('\n📊 Datos principales a mostrar:');
    console.log('   • RIF y apellido del contribuyente');
    console.log('   • Monto y fecha del pago');
    console.log('   • Banco y tipo de documento');
    console.log('   • Dependencia y período');
    console.log('   • Estado de validación del RIF');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error durante el análisis:', error.message);
    
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

// Ejecutar el análisis
analyzePagosQuery(); 