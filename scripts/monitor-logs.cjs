const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando monitoreo de logs...\n');

// Función para monitorear un archivo de log
function monitorLogFile(logFile, label) {
  if (!fs.existsSync(logFile)) {
    console.log(`⚠️  Archivo de log no encontrado: ${logFile}`);
    return;
  }

  console.log(`📋 Monitoreando: ${label} (${logFile})`);
  
  const tail = spawn('tail', ['-f', logFile]);
  
  tail.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${label}: ${line}`);
        
        // Detectar errores críticos
        if (line.includes('ERROR') || line.includes('FATAL') || line.includes('password authentication failed')) {
          console.log(`🚨 ERROR DETECTADO en ${label}: ${line}`);
        }
        
        // Detectar problemas de conexión
        if (line.includes('connection') && (line.includes('failed') || line.includes('timeout'))) {
          console.log(`🔌 PROBLEMA DE CONEXIÓN en ${label}: ${line}`);
        }
      }
    });
  });
  
  tail.stderr.on('data', (data) => {
    console.error(`❌ Error en monitoreo de ${label}:`, data.toString());
  });
  
  tail.on('close', (code) => {
    console.log(`📴 Monitoreo de ${label} cerrado con código: ${code}`);
  });
  
  return tail;
}

// Monitorear logs de la aplicación
const logFiles = [
  { file: 'dev.log', label: 'DEV-LOG' },
  { file: 'dev-no-turbopack.log', label: 'DEV-NO-TURBOPACK' }
];

const monitors = logFiles.map(log => monitorLogFile(log.file, log.label));

// Función para limpiar al salir
function cleanup() {
  console.log('\n🛑 Deteniendo monitoreo...');
  monitors.forEach(monitor => {
    if (monitor) {
      monitor.kill();
    }
  });
  process.exit(0);
}

// Manejar señales de salida
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

console.log('✅ Monitoreo iniciado. Presiona Ctrl+C para detener.\n'); 