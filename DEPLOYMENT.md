# Guía de Despliegue - Semillero Digital Dashboard

## Pre-requisitos de Despliegue

### 1. Configuración de Google Cloud Platform
- [ ] Proyecto de Google Cloud creado
- [ ] APIs habilitadas:
  - [ ] Google Classroom API
  - [ ] Google Calendar API
  - [ ] Google People API
- [ ] Credenciales OAuth 2.0 configuradas
- [ ] Pantalla de consentimiento OAuth configurada
- [ ] Dominios de producción autorizados

### 2. Configuración de Firebase
- [ ] Proyecto de Firebase creado
- [ ] Authentication habilitado con proveedor Google
- [ ] Firestore Database configurado
- [ ] Reglas de seguridad de Firestore aplicadas
- [ ] Dominios autorizados configurados

### 3. Variables de Entorno
- [ ] Archivo `.env` configurado para producción
- [ ] Todas las variables de Firebase definidas
- [ ] Variables validadas y funcionando

## Opciones de Despliegue

### Opción 1: Netlify (Recomendado)

#### Configuración Inicial
1. **Conectar Repositorio**
   ```bash
   # Subir código a GitHub
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Configurar Netlify**
   - Ir a [Netlify](https://netlify.com)
   - Conectar repositorio de GitHub
   - Configurar build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Variables de Entorno en Netlify**
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Configurar Redirects**
   - El archivo `netlify.toml` ya está configurado
   - Verifica que las reglas de redirect funcionen

#### Despliegue Automático
- [ ] Push a `main` despliega automáticamente
- [ ] Build exitoso sin errores
- [ ] Deploy preview para pull requests

### Opción 2: Firebase Hosting

#### Configuración
1. **Instalar Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login y Configuración**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configurar firebase.json**
   - El archivo ya está incluido en el proyecto
   - Verifica la configuración

4. **Desplegar**
   ```bash
   npm run build
   firebase deploy
   ```

### Opción 3: Vercel

#### Configuración
1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Desplegar**
   ```bash
   vercel
   ```

3. **Variables de Entorno**
   - Configurar en el dashboard de Vercel
   - O usar `vercel env add`

## Checklist de Pre-Despliegue

### Código y Build
- [ ] `npm run build` ejecuta sin errores
- [ ] No hay warnings críticos en el build
- [ ] Todos los archivos necesarios están en `dist/`
- [ ] Tamaño del bundle es razonable (< 5MB)

### Configuración
- [ ] Variables de entorno configuradas
- [ ] URLs de producción actualizadas
- [ ] Dominios autorizados en Google Cloud
- [ ] Dominios autorizados en Firebase

### Testing
- [ ] Aplicación funciona en localhost
- [ ] Login funciona correctamente
- [ ] APIs responden correctamente
- [ ] No hay errores en consola

## Proceso de Despliegue

### 1. Preparación
```bash
# Verificar que todo está actualizado
git status
git pull origin main

# Instalar dependencias
npm install

# Ejecutar tests (si existen)
npm test

# Build de producción
npm run build
```

### 2. Verificación Local
```bash
# Servir build localmente
npm run preview

# Verificar en http://localhost:4173
# Probar funcionalidades críticas
```

### 3. Despliegue
```bash
# Para Netlify (automático con git push)
git add .
git commit -m "Deploy: descripción de cambios"
git push origin main

# Para Firebase
firebase deploy

# Para Vercel
vercel --prod
```

### 4. Verificación Post-Despliegue
- [ ] Sitio carga correctamente
- [ ] Login funciona
- [ ] APIs funcionan
- [ ] No hay errores 404
- [ ] Performance es aceptable

## Configuración de Dominio Personalizado

### Netlify
1. Ir a Site settings > Domain management
2. Agregar dominio personalizado
3. Configurar DNS records
4. Habilitar HTTPS automático

### Firebase Hosting
```bash
firebase hosting:channel:deploy production --only hosting
```

### Configurar SSL
- [ ] Certificado SSL configurado
- [ ] HTTPS forzado
- [ ] Redirects HTTP → HTTPS

## Monitoreo y Mantenimiento

### Analytics y Monitoreo
- [ ] Google Analytics configurado (opcional)
- [ ] Error tracking configurado (Sentry, etc.)
- [ ] Performance monitoring

### Backup y Seguridad
- [ ] Backup de configuración de Firebase
- [ ] Backup de reglas de Firestore
- [ ] Rotación de claves API (si es necesario)

### Updates
- [ ] Plan de actualización de dependencias
- [ ] Monitoreo de vulnerabilidades de seguridad
- [ ] Plan de rollback en caso de problemas

## Troubleshooting Común

### Error: "Access blocked"
- Verificar dominios autorizados en Google Cloud Console
- Verificar configuración de OAuth

### Error: "Firebase configuration"
- Verificar variables de entorno
- Verificar que el proyecto de Firebase existe

### Error: "API not enabled"
- Verificar que todas las APIs están habilitadas
- Verificar quotas y límites

### Error: "Permission denied"
- Verificar reglas de Firestore
- Verificar permisos de usuario

## Rollback Plan

### En caso de problemas críticos:

1. **Netlify**
   - Usar "Rollback to previous deploy" en dashboard
   - O hacer revert del commit y push

2. **Firebase**
   ```bash
   firebase hosting:clone source-site-id:source-channel target-site-id:live
   ```

3. **Vercel**
   - Usar dashboard para rollback
   - O redeploy de commit anterior

## Checklist Final

### Pre-Launch
- [ ] Todas las configuraciones verificadas
- [ ] Testing completo realizado
- [ ] Performance optimizada
- [ ] SEO básico configurado
- [ ] Error handling implementado

### Launch
- [ ] Despliegue exitoso
- [ ] Verificación funcional completa
- [ ] Performance en producción aceptable
- [ ] Monitoreo activo

### Post-Launch
- [ ] Documentación actualizada
- [ ] Equipo notificado
- [ ] Plan de soporte definido
- [ ] Métricas de baseline establecidas

## Contactos de Emergencia

- **Desarrollador Principal**: [Tu información]
- **Administrador Firebase**: [Información del admin]
- **Administrador Google Cloud**: [Información del admin]
- **Soporte Técnico**: [Información de contacto]
