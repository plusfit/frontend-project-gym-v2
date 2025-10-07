/**
 * Error translations configuration for backend messages
 * This file contains all the error message mappings from English to Spanish
 */

export const ERROR_TRANSLATIONS = {
  // Reward related errors
  'A reward with that name already exists': 'Ya existe un premio con ese nombre',
  'Reward not found': 'Premio no encontrado',
  'Invalid reward data': 'Datos de premio inválidos',
  'Insufficient points': 'Puntos insuficientes',
  'Reward is not enabled': 'El premio no está habilitado',
  'Cannot delete reward with active claims': 'No se puede eliminar un premio con reclamaciones activas',
  'Reward has expired': 'El premio ha expirado',
  'Reward limit reached': 'Se ha alcanzado el límite del premio',

  // Client related errors
  'Client not found': 'Cliente no encontrado',
  'Client already exists': 'El cliente ya existe',
  'Invalid client data': 'Datos de cliente inválidos',
  'Client is not active': 'El cliente no está activo',
  'Email already in use': 'El correo electrónico ya está en uso',
  'Invalid email format': 'Formato de correo electrónico inválido',
  'Phone number already exists': 'El número de teléfono ya existe',
  'Invalid phone number': 'Número de teléfono inválido',

  // Authentication errors
  'Invalid credentials': 'Credenciales inválidas',
  'Access denied': 'Acceso denegado',
  'Token expired': 'Token expirado',
  'Unauthorized': 'No autorizado',
  'Account not verified': 'Cuenta no verificada',
  'Account is disabled': 'La cuenta está deshabilitada',
  'Too many login attempts': 'Demasiados intentos de inicio de sesión',

  // General errors
  'Bad Request': 'Solicitud incorrecta',
  'Internal Server Error': 'Error interno del servidor',
  'Network Error': 'Error de conexión',
  'Validation failed': 'Validación fallida',
  'Database connection error': 'Error de conexión a la base de datos',
  'Required field missing': 'Falta un campo requerido',
  'Invalid data format': 'Formato de datos inválido',
  'Operation not allowed': 'Operación no permitida',

  // Schedule related errors
  'Schedule not found': 'Horario no encontrado',
  'Schedule conflict': 'Conflicto de horarios',
  'Invalid schedule data': 'Datos de horario inválidos',
  'Schedule is full': 'El horario está completo',
  'Cannot modify past schedule': 'No se puede modificar un horario pasado',
  'Time slot not available': 'Horario no disponible',

  // Exercise related errors
  'Exercise not found': 'Ejercicio no encontrado',
  'Exercise already exists': 'El ejercicio ya existe',
  'Invalid exercise data': 'Datos de ejercicio inválidos',
  'Exercise is assigned to routines': 'El ejercicio está asignado a rutinas',
  'Invalid exercise duration': 'Duración de ejercicio inválida',

  // Routine related errors
  'Routine not found': 'Rutina no encontrada',
  'Routine already exists': 'La rutina ya existe',
  'Invalid routine data': 'Datos de rutina inválidos',
  'Routine is assigned to clients': 'La rutina está asignada a clientes',
  'Empty routine not allowed': 'No se permite rutina vacía',

  // Equipment related errors
  'Equipment not found': 'Equipo no encontrado',
  'Equipment already exists': 'El equipo ya existe',
  'Equipment is in use': 'El equipo está en uso',
  'Equipment maintenance required': 'El equipo requiere mantenimiento',
  'Invalid equipment data': 'Datos de equipo inválidos',

  // Membership related errors
  'Membership not found': 'Membresía no encontrada',
  'Membership expired': 'Membresía expirada',
  'Membership already active': 'La membresía ya está activa',
  'Invalid membership data': 'Datos de membresía inválidos',
  'Membership type not available': 'Tipo de membresía no disponible',

  // Payment related errors
  'Payment failed': 'El pago falló',
  'Invalid payment method': 'Método de pago inválido',
  'Payment already processed': 'El pago ya fue procesado',
  'Insufficient funds': 'Fondos insuficientes',
  'Payment expired': 'Pago expirado',

  // File upload errors
  'File too large': 'Archivo demasiado grande',
  'Invalid file type': 'Tipo de archivo inválido',
  'File upload failed': 'Error al subir archivo',
  'No file provided': 'No se proporcionó archivo',
  'File corrupted': 'Archivo corrupto',

  // Permission errors
  'Permission denied': 'Permiso denegado',
  'Insufficient permissions': 'Permisos insuficientes',
  'Role not found': 'Rol no encontrado',
  'Invalid role': 'Rol inválido',
  'Cannot modify own permissions': 'No se pueden modificar los propios permisos'
} as const;

/**
 * Default error messages for different operation contexts
 */
export const DEFAULT_ERROR_MESSAGES = {
  create: 'Error al crear el registro',
  update: 'Error al actualizar el registro',
  delete: 'Error al eliminar el registro',
  fetch: 'Error al obtener los datos',
  general: 'Ha ocurrido un error inesperado',
  save: 'Error al guardar',
  load: 'Error al cargar',
  search: 'Error en la búsqueda',
  upload: 'Error al subir archivo',
  download: 'Error al descargar archivo',
  export: 'Error al exportar datos',
  import: 'Error al importar datos',
  validate: 'Error de validación',
  connect: 'Error de conexión'
} as const;

/**
 * Success messages for different operations
 */
export const SUCCESS_MESSAGES = {
  create: 'Registro creado exitosamente',
  update: 'Registro actualizado exitosamente',
  delete: 'Registro eliminado exitosamente',
  save: 'Guardado exitosamente',
  upload: 'Archivo subido exitosamente',
  download: 'Archivo descargado exitosamente',
  export: 'Datos exportados exitosamente',
  import: 'Datos importados exitosamente',
  send: 'Enviado exitosamente',
  process: 'Procesado exitosamente'
} as const;