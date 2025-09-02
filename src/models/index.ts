// models/index.ts
import User from './User';
import Role from './Role';
import Permission from './Permission';
import RolePermission from './RolePermission';
import Session from './Session';
import AuditLog from './AuditLog';
import Menu from './Menu';
import RoleMenuPermission from './RoleMenuPermission';
import Notification from './Notification';
import Ticket from './Ticket';
import TicketHistory from './TicketHistory';

export {
  User,
  Role,
  Permission,
  RolePermission,
  Session,
  AuditLog,
  Menu,
  RoleMenuPermission,
  Notification,
  Ticket,
  TicketHistory
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

// Asociaciones de permisos
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

// Asociaciones de auditoría
User.hasMany(AuditLog, { 
  foreignKey: 'user_id', 
  as: 'auditLogs',
  sourceKey: 'id'
});
AuditLog.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user',
  targetKey: 'id'
});

// Asociaciones de menús
Role.belongsToMany(Menu, { 
  through: RoleMenuPermission, 
  foreignKey: 'role_id', 
  otherKey: 'menu_id',
  as: 'menus' 
});
Menu.belongsToMany(Role, { 
  through: RoleMenuPermission, 
  foreignKey: 'menu_id', 
  otherKey: 'role_id',
  as: 'roles' 
});

// Asociaciones de notificaciones
User.hasMany(Notification, {
  foreignKey: 'user_id',
  as: 'notifications',
  sourceKey: 'id'
});
Notification.belongsTo(User, {
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