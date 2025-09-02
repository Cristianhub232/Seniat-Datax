const { ICON_MAP } = require('../src/lib/iconMap.ts');

console.log('🔍 Verificando mapeo de iconos...\n');

const iconMappings = {
  'home': 'IconHome',
  'users': 'IconUsers', 
  'shield': 'IconShield',
  'building': 'IconBuilding',
  'file-text': 'IconFileText',
  'factory': 'IconTractor',
  'hash': 'IconHash',
  'plus-circle': 'IconCirclePlus',
  'file-spreadsheet': 'IconFileSpreadsheet',
  'alert-triangle': 'IconAlertTriangle',
  'bar-chart': 'IconChartBar'
};

console.log('📋 Iconos mapeados desde la base de datos:');
Object.entries(iconMappings).forEach(([dbIcon, componentName]) => {
  const iconComponent = ICON_MAP[dbIcon];
  const status = iconComponent ? '✅' : '❌';
  console.log(`${status} ${dbIcon} → ${componentName}`);
});

console.log('\n🎯 Iconos disponibles en ICON_MAP:');
Object.keys(ICON_MAP).forEach(iconKey => {
  console.log(`  - ${iconKey}`);
});

console.log('\n✨ Verificación completada!'); 