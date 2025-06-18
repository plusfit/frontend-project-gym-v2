# Actualizaciones del Backend para Soporte de MediaType

## Resumen
El frontend ahora envía un campo `mediaType` cuando se crean o actualizan ejercicios. Este campo indica si el archivo subido es una imagen o un video.

## Cambios Implementados en el Frontend

### 1. Interfaces Actualizadas
- **Exercise Interface**: Se agregó el campo `mediaType?: 'image' | 'video'`
- **ExercisePayload Interface**: Se agregó el campo `mediaType?: 'image' | 'video'`

### 2. Detección Automática de Tipo de Archivo
- El frontend detecta automáticamente si el archivo subido es imagen o video
- Se envía el `mediaType` correspondiente al backend en los métodos `create` y `update`

### 3. Tipos de Archivo Soportados
- **Imágenes**: GIF, JPG, JPEG, PNG
- **Videos**: MP4

## Cambios Requeridos en el Backend

### 1. Schema de la Base de Datos
Actualizar el schema del modelo Exercise para incluir el campo `mediaType`:

```javascript
// En el schema de Exercise
mediaType: {
  type: String,
  enum: ['image', 'video'],
  required: false // Para compatibilidad con ejercicios existentes
}
```

### 2. API Endpoints
Actualizar los endpoints de creación y actualización de ejercicios para recibir y guardar el campo `mediaType`:

```javascript
// En el controller de Exercise
const createExercise = async (req, res) => {
  const { name, description, gifUrl, mediaType, category, type, ... } = req.body;
  
  const exercise = new Exercise({
    name,
    description,
    gifUrl,
    mediaType, // Guardar el tipo de archivo
    category,
    type,
    // ... otros campos
  });
  
  // ... resto de la lógica
};
```

### 3. Detección Automática en Firebase Storage (Opcional)
Para mayor robustez, el backend puede detectar automáticamente el tipo de archivo:

```javascript
const detectMediaType = (fileUrl) => {
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv'];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  
  const urlLower = fileUrl.toLowerCase();
  
  if (videoExtensions.some(ext => urlLower.includes(ext))) {
    return 'video';
  } else if (imageExtensions.some(ext => urlLower.includes(ext))) {
    return 'image';
  }
  
  return 'image'; // Default
};
```

### 4. Migración de Datos Existentes (Script)
Crear un script para actualizar ejercicios existentes:

```javascript
// Script de migración
const updateExistingExercises = async () => {
  const exercises = await Exercise.find({ mediaType: { $exists: false } });
  
  for (const exercise of exercises) {
    if (exercise.gifUrl) {
      const mediaType = detectMediaType(exercise.gifUrl);
      await Exercise.findByIdAndUpdate(exercise._id, { mediaType });
    }
  }
};
```

## Datos Enviados desde el Frontend

### Estructura del Payload
```typescript
{
  name: string;
  description: string;
  gifUrl?: string;
  mediaType?: 'image' | 'video'; // NUEVO CAMPO
  category: string;
  type: string;
  rest?: number;
  minutes?: number;
  reps?: number;
  series?: number;
}
```

## Beneficios de esta Implementación

1. **Renderizado Correcto**: El frontend puede mostrar correctamente videos vs imágenes
2. **Optimización**: El backend puede aplicar diferentes optimizaciones según el tipo
3. **Validación**: Se puede validar que el tipo de archivo corresponda al mediaType
4. **Analíticas**: Se pueden obtener métricas sobre tipos de contenido más populares
5. **Escalabilidad**: Facilita la adición de nuevos tipos de media en el futuro

## Notas de Implementación

- El campo `mediaType` es opcional para mantener compatibilidad con ejercicios existentes
- Si no se envía `mediaType`, el backend debería detectarlo automáticamente
- Se recomienda ejecutar el script de migración una sola vez para actualizar datos existentes
