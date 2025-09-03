// models/index.ts
import User from './User';
import Role from './Role';
import Permission from './Permission';
import RolePermission from './RolePermission';
import Session from './Session';
import Ticket from './Ticket';
import TicketHistory from './TicketHistory';
import CarteraContribuyente from './CarteraContribuyente';

export {
  User,
  Role,
  Permission,
  RolePermission,
  Session,
  Ticket,
  TicketHistory,
  CarteraContribuyente
};

// Asociaciones de autenticación
User.belongsTo(Role, { 
  foreignKey: 'role_id', 
  as: 'role',
  targetKey: 'id'
});

Role.hasMany(User, { 
  foreignKey: 'role_id', 
  as: 'users',
  sourceKey: 'id'
});

// Asociaciones de permisos (muchos a muchos)
Role.belongsToMany(Permission, { 
  through: RolePermission, 
  foreignKey: 'role_id', 
  otherKey: 'permission_id',
  as: 'permissions' 
});

Permission.belongsToMany(Role, { 
  through: RolePermission, 
  foreignKey: 'permission_id', 
  otherKey: 'role_id',
  as: 'roles' 
});

// Asociaciones de sesiones
User.hasMany(Session, { 
  foreignKey: 'user_id', 
  as: 'sessions',
  sourceKey: 'id'
});

Session.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user',
  targetKey: 'id'
});

// Asociaciones de tickets
User.hasMany(Ticket, {
  foreignKey: 'creado_por',
  as: 'ticketsCreados',
  sourceKey: 'id'
});

Ticket.belongsTo(User, {
  foreignKey: 'creado_por',
  as: 'creador',
  targetKey: 'id'
});

User.hasMany(Ticket, {
  foreignKey: 'ejecutivo_id',
  as: 'ticketsAsignados',
  sourceKey: 'id'
});

Ticket.belongsTo(User, {
  foreignKey: 'ejecutivo_id',
  as: 'ejecutivo',
  targetKey: 'id'
});

// Asociaciones de historial de tickets
Ticket.hasMany(TicketHistory, {
  foreignKey: 'ticket_id',
  as: 'historial',
  sourceKey: 'id'
});

TicketHistory.belongsTo(Ticket, {
  foreignKey: 'ticket_id',
  as: 'ticket',
  targetKey: 'id'
});

User.hasMany(TicketHistory, {
  foreignKey: 'usuario_id',
  as: 'cambiosRealizados',
  sourceKey: 'id'
});

TicketHistory.belongsTo(User, {
  foreignKey: 'usuario_id',
  as: 'usuario',
  targetKey: 'id'
});

// Función para sincronizar modelos
export async function syncModels() {
  try {
    await User.sync({ alter: true });
    await Role.sync({ alter: true });
    await Permission.sync({ alter: true });
    await RolePermission.sync({ alter: true });
    await Session.sync({ alter: true });
    
    console.log('✅ Modelos sincronizados correctamente');
  } catch (error) {
    console.error('❌ Error sincronizando modelos:', error);
    throw error;
  }
}

// Función para verificar conexión
export async function testConnection() {
  try {
    await User.sequelize?.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
}