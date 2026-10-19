# TaskFlow - Lista de Tareas con Pestañas de Navegador

Una aplicación web ágil, moderna e intuitiva para gestionar listas de tareas y actividades cotidianas, diseñada con una interfaz de pestañas inspirada en navegadores web y persistencia local automática.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Bootstrap 5.3](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat-square&logo=bootstrap&logoColor=white)
![Bootstrap Icons](https://img.shields.io/badge/Icons-Bootstrap_Icons-7952B3?style=flat-square)

---

## 🚀 Características Principales

- **Interfaz Multilista con Pestañas estilo Navegador**: Organiza tus actividades en múltiples listas (Personal, Trabajo, Proyectos) con pestañas dinámicas con scroll horizontal y botón de adición rápida.
- **Gestión Completa de Tareas (CRUD)**:
  - Crear nuevas tareas con validación.
  - Marcar como completada/pendiente con animaciones de tachado y feedback visual inmediato.
  - Edición en sitio mediante modal interactivo.
  - Eliminación individual o confirmación de borrado al eliminar listas con pendientes.
- **Barra de Progreso y Métricas en Tiempo Real**: Visualiza el porcentaje de cumplimiento y el conteo de tareas completadas frente al total de la lista activa.
- **Persistencia Local Automática**: Todo tu progreso se almacena de forma segura en `localStorage` del navegador; tus listas permanecen intactas al recargar la página o cerrar el navegador sin necesidad de backend o bases de datos externas.
- **Diseño Responsivo y Elegante**: Adaptado para dispositivos móviles, tablets y escritorios, utilizando la fuente **Inter** de Google Fonts y componentes de **Bootstrap 5.3**.

---

## 📁 Estructura del Proyecto

```text
ListaTareas/
├── index.html            # Estructura semántica principal y modales de Bootstrap
├── css/
│   └── styles.css        # Estilos personalizados, diseño de pestañas y microinteracciones
├── js/
│   ├── app.js            # Punto de entrada e inicialización de la aplicación
│   ├── state.js          # Manejo de estado reactivo (Observable pattern) y lógica de negocio
│   ├── storage.js        # Capa de persistencia segura con localStorage
│   └── ui.js             # Renderizado dinámico del DOM y delegación de eventos
├── plan/
│   └── mvp.md            # Plan técnico y arquitectura del MVP
├── specs/
│   └── mvp.md            # Especificaciones funcionales y criterios de aceptación
├── tasks/
│   └── mvp.md            # Registro y seguimiento de tareas implementadas
├── AGENTS.md             # Contexto del proyecto y lineamientos de arquitectura
├── .gitignore            # Exclusión de archivos temporales y de configuración
└── README.md             # Documentación del proyecto
```

---

## 💻 Cómo Ejecutar el Proyecto

Al ser una aplicación 100% frontend basada en estándares web:

### Opción 1: Apertura Directa
1. Clona o descarga este repositorio:
   ```bash
   git clone https://github.com/svelascotellez/ListaTareas.git
   ```
2. Haz doble clic en el archivo `index.html` o ábrelo en cualquier navegador web moderno (Chrome, Edge, Firefox, Safari).

### Opción 2: Servidor Local Ligero (Opcional)
Si prefieres servirlo mediante un servidor HTTP local:
```bash
# Con Python 3
python -m http.server 8080

# O con Node.js / npx serve
npx serve .
```
Luego abre `http://localhost:8080` en tu navegador.

---

## 🛠️ Tecnologías Empleadas

- **HTML5**: Marcado semántico y accesible.
- **CSS3 Vanilla**: Personalización de pestañas tipo Chrome/Edge, estados hover y transiciones fluidas.
- **JavaScript (ES6+)**: Módulos desacoplados orientados a eventos.
- **Bootstrap 5.3 & Bootstrap Icons**: Sistema de rejilla responsivo, modales y tipografía.
- **Web Storage API (`localStorage`)**: Persistencia local entre sesiones de usuario.

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.
