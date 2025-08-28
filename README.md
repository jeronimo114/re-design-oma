# OMA Website - Guía de Instalación y Ejecución

Este proyecto es un sitio web estático para OMA, construido con HTML, CSS (compilado desde SCSS) y JavaScript. Utiliza Gulp para el procesamiento de estilos y BrowserSync para el servidor de desarrollo.

## 📋 Requisitos del Sistema

- **Node.js**: Versión 14 o superior (cualquier versión reciente funciona)
- **npm**: Generalmente incluido con Node.js
- **Git**: Para clonar el repositorio

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/jeronimo114/re-design-oma.git
cd re-design-oma
```

### 2. Instalar dependencias

```bash
npm install
```

## 🛠️ Desarrollo

### Ejecutar en modo desarrollo

```bash
npm start
```

Esto iniciará:

- Compilación automática de SCSS a CSS
- Servidor local en http://localhost:3000
- Live reload para cambios en HTML, JS y SCSS

### Estructura de desarrollo

- **SCSS**: Archivos en la carpeta `scss/`
- **HTML**: Archivos principales en la raíz
- **JavaScript**: Archivos JS en la raíz
- **Recursos**: Imágenes y documentos en `media/` y `docs/`

## 📦 Build para Producción

### Compilar estilos para producción

```bash
npx gulp compileSCSS
```

Los archivos CSS compilados se generarán en la carpeta `dist/css/` con:

- CSS minimizado
- Autoprefijos para compatibilidad
- Source maps para debugging

### Estructura de archivos para producción

Para deploy, subir los siguientes archivos y carpetas:

```
index.html
catalogo.html
productoZoom.html
articulos/
dist/css/main.css
media/
docs/
*.js
```

## 🌐 Deployment

### Opción 1: Servidor Web estático

Subir todos los archivos listados arriba a cualquier servidor web (Apache, Nginx, etc.)

### Opción 2: GitHub Pages

1. Habilitar GitHub Pages en la configuración del repositorio
2. La carpeta raíz del repositorio sirve los archivos automáticamente

### Opción 3: Netlify/Vercel

1. Conectar el repositorio
2. Configurar build command: `npx gulp compileSCSS`
3. Configurar publish directory: `.` (raíz)

## 📝 Notas Importantes

- Los estilos SCSS se compilan automáticamente en desarrollo
- Para producción, asegurarse de ejecutar `npx gulp compileSCSS` antes del deploy
- El sitio no requiere base de datos ni backend
- Todos los recursos están incluidos localmente

## 🆘 Troubleshooting

**Error: Command not found: gulp**

```bash
npm install -g gulp-cli
```

**Error: Node Sass could not find a binding**

```bash
npm rebuild node-sass
```

**Problemas de permisos**

```bash
sudo npm install -g gulp-cli
```

## 📞 Soporte

Para problemas técnicos, revisar:

1. Versión de Node.js: `node --version`
2. Dependencias instaladas: `npm list`
3. Logs de error en la consola del navegador
