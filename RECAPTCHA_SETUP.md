# Configuración de Google reCAPTCHA v3

## Pasos para configurar reCAPTCHA v3 en el proyecto

### 1. Obtener las claves de reCAPTCHA

1. Ve a [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Haz clic en "+" para crear un nuevo sitio
3. Configura el sitio:
   - **Etiqueta**: Un nombre para identificar tu sitio (ej: "Project Gym Login")
   - **Tipo de reCAPTCHA**: Selecciona "reCAPTCHA v3"
   - **Dominios**: Agrega tus dominios (ej: `localhost`, `tu-dominio.com`)
   - Acepta los términos de servicio
4. Haz clic en "Enviar"
5. Copia las claves generadas:
   - **Clave del sitio (Site Key)**: Para el frontend
   - **Clave secreta (Secret Key)**: Para el backend

### 2. Configurar las claves en el proyecto

#### Frontend (Angular)

1. **Desarrollo**: Actualiza `src/environments/environment.ts`:
```typescript
recaptcha: {
  siteKey: 'TU_SITE_KEY_DE_DESARROLLO',
},
```

2. **Producción**: Actualiza `src/environments/environment.prod.ts`:
```typescript
recaptcha: {
  siteKey: 'TU_SITE_KEY_DE_PRODUCCION',
},
```

#### Backend
El backend ya está configurado para validar el token de reCAPTCHA. Solo necesitas configurar la clave secreta en el backend.

### 3. Funcionamiento

1. **Frontend**: Cuando el usuario intenta hacer login, se ejecuta `grecaptcha.execute()` automáticamente
2. **Token generado**: reCAPTCHA genera un token único
3. **Envío al backend**: El token se envía junto con las credenciales al backend
4. **Validación**: El backend valida el token con Google
5. **Respuesta**: Si el token es válido, se procede con la autenticación

### 4. Características implementadas

- ✅ Carga dinámica del script de reCAPTCHA
- ✅ Integración automática en el login
- ✅ Manejo de errores
- ✅ Configuración por entorno
- ✅ Texto informativo de privacidad
- ✅ No requiere interacción del usuario (invisible)

### 5. Archivos modificados

- `src/index.html` - Preparado para carga dinámica
- `src/environments/environment.ts` - Configuración de desarrollo
- `src/environments/environment.prod.ts` - Configuración de producción
- `src/app/core/services/recaptcha.service.ts` - Servicio de reCAPTCHA
- `src/app/features/auth/interfaces/auth.ts` - Interfaz actualizada
- `src/app/features/auth/services/auth.service.ts` - Envío del token al backend
- `src/app/features/auth/state/auth.state.ts` - Estado actualizado
- `src/app/features/auth/components/login-form/` - Componente de login

### 6. Notas importantes

- **Dominios**: Asegúrate de agregar todos los dominios donde funcionará la app
- **Testing**: En desarrollo puedes usar `localhost`
- **Producción**: Usa dominios reales para producción
- **Puntuación**: reCAPTCHA v3 devuelve una puntuación de 0.0 a 1.0 (el backend debe decidir el umbral)

### 7. Debugging

Si hay problemas:
1. Verifica que las claves estén configuradas correctamente
2. Revisa la consola del navegador para errores
3. Confirma que los dominios estén agregados en Google reCAPTCHA Admin
4. Asegúrate de que el backend esté validando correctamente el token
