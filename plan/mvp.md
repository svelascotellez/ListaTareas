# Plan de Desarrollo del MVP: Aplicación de Lista de Tareas (SDD)

Basado en la especificación [specs/mvp.md](file:///c:/Users/salva/.antigravity/ListaTareas/specs/mvp.md), este documento detalla la arquitectura técnica, la estructura de archivos, el diseño de clases y funciones, y la hoja de ruta de implementación para el desarrollo del MVP.

---

## 1. Estructura de Archivos y Carpetas

Se plantea una arquitectura modular basada en estándares nativos de la web (HTML5, CSS3, JavaScript ES6 Modules), sin transpiladores ni empaquetadores externos, permitiendo su ejecución directa en el navegador.

```text
ListaTareas/
├── AGENTS.md                   # Contexto general del proyecto
├── specs/
│   └── mvp.md                  # Especificaciones funcionales y requisitos
├── plan/
│   └── mvp.md                  # Este plan técnico de desarrollo
├── index.html                  # Marcado semántico y estructura principal
├── css/
│   └── styles.css              # Estilos personalizados (pestañas navegador, animaciones)
└── js/
    ├── app.js                  # Punto de entrada de la aplicación
    ├── storage.js              # Capa de persistencia con localStorage
    ├── state.js                # Gestor de estado centralizado (listas y tareas)
    └── ui.js                   # Renderizado y manipulación del DOM
```

---

## 2. Arquitectura de Módulos y Responsabilidades

Se adopta un patrón desacoplado tipo **MVC / Estado Unidireccional**:

```
+------------------+         +------------------+
|    storage.js    |<------->|     state.js     |
| (localStorage)   |         |  (AppState /     |
+------------------+         |   Lógica de Datos)
                             +--------+---------+
                                      |
                                      v Notifica cambios
                             +------------------+         +------------------+
                             |      ui.js       |<------->|    index.html    |
                             | (Renderizado DOM |         |      + CSS       |
                             |  y Eventos)      |         +------------------+
                             +--------+---------+
                                      ^
                                      | Inicializa
                             +--------+---------+
                             |      app.js      |
                             +------------------+
```

---

## 3. Diseño de Clases, Funciones y Módulos

### 3.1 Módulo de Persistencia: `js/storage.js`
Responsable exclusivamente de la lectura y escritura segura en el almacenamiento local del navegador.

```javascript
export class StorageService {
  constructor(storageKey = 'todo_app_data_v1')
  
  /**
   * Obtiene los datos persistidos o null si no existen / hay error de parseo.
   * @returns {Object|null}
   */
  loadData()

  /**
   * Guarda el objeto de estado completo en localStorage.
   * @param {Object} data
   * @returns {boolean} Retorna true si guardó con éxito.
   */
  saveData(data)

  /**
   * Retorna la estructura inicial predeterminada en caso de primera visita.
   * @returns {Object}
   */
  getDefaultData()
}
```

---

### 3.2 Módulo de Estado y Lógica de Negocio: `js/state.js`
Mantiene el estado en memoria, aplica validaciones y notifica cada cambio para persistencia y re-renderizado.

```javascript
export class AppState {
  constructor(storageService)

  // --- Ciclo de vida y persistencia ---
  init()                                // Carga datos desde storage o inicializa por defecto
  subscribe(listener)                   // Registra callback ejecutado ante cualquier mutación
  private _notify()                     // Persiste en storage y notifica a los listeners

  // --- Consultas (Getters) ---
  getAllLists()                         // Retorna arreglo de listas
  getActiveList()                       // Retorna el objeto de la lista seleccionada actualmente
  getActiveListId()                     // Retorna el ID de la lista activa

  // --- Operaciones sobre Listas (Pestañas) ---
  createList(title)                     // Crea una lista con ID único (UUID o timestamp) y la activa
  selectList(listId)                    // Cambia la lista activa
  renameList(listId, newTitle)          // Renombra la lista indicada
  deleteList(listId)                    // Elimina una lista (impide si es la única disponible)

  // --- Operaciones sobre Tareas ---
  addTask(listId, title)                // Inserta una nueva tarea en la lista indicada
  toggleTask(listId, taskId)            // Alterna el estado completed (true/false)
  editTask(listId, taskId, newTitle)    // Actualiza la descripción de una tarea existente
  deleteTask(listId, taskId)            // Remueve una tarea de la lista indicada
}
```

---

### 3.3 Módulo de Interfaz y DOM: `js/ui.js`
Gestiona la captura de eventos del usuario, la sincronización visual y los componentes interactivos de Bootstrap (modales, tooltips).

```javascript
export class UIManager {
  constructor(appState)

  // --- Elementos del DOM ---
  // Cachea selectores: #tabs-container, #add-tab-btn, #current-list-title,
  // #task-form, #task-input, #tasks-container, #stats-container, etc.

  // --- Métodos de Inicialización ---
  init()                                // Vincula listeners globales (inputs, submits, clics delegados)

  // --- Métodos de Renderizado ---
  render()                              // Orquesta el renderizado completo de la interfaz
  renderTabs()                          // Genera el HTML de las pestañas estilo navegador web
  renderListHeader()                    // Pinta el título y contadores de la lista actual
  renderTasks()                         // Renderiza la lista de tareas o el estado vacío (empty state)
  
  // --- Modales e Interacciones Auxiliares ---
  showPromptNewList()                   // Modal o prompt accesible para crear lista
  showConfirmDeleteList(listId)         // Modal de confirmación para borrar lista
  openEditTaskDialog(taskId, oldTitle)  // Permite editar el texto de una tarea
}
```

---

### 3.4 Punto de Entrada: `js/app.js`
Coordina el inicio de la aplicación cuando el árbol DOM está completamente cargado.

```javascript
import { StorageService } from './storage.js';
import { AppState } from './state.js';
import { UIManager } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const storage = new StorageService();
  const state = new AppState(storage);
  const ui = new UIManager(state);

  // Al cambiar el estado, se re-renderiza la UI automáticamente
  state.subscribe(() => ui.render());

  state.init();
  ui.init();
  ui.render();
});
```

---

## 4. Diseño Visual y Estilos Clave (`css/styles.css`)

### 4.1 Pestañas estilo Navegador Web
Para cumplir con el requerimiento de apariencia tipo navegador:
- **Contenedor `.browser-tab-bar`:** Fondo ligeramente más oscuro/atenuado con barra de desplazamiento horizontal oculta o estilizada.
- **Pestaña `.browser-tab`:**
  - Curvatura superior con `border-radius: 8px 8px 0 0`.
  - Estados: hover con elevación sutil; activa (`.active`) con fondo blanco/fondo principal continuo con el cuerpo, sombra superior y botón de cerrar visible.
  - Botón de cierre (`.tab-close-btn`): Icono `bi-x` con efecto hover circular.
- **Botón Nueva Pestaña (`.btn-new-tab`):** Botón compacto al extremo derecho de las pestañas con icono `bi-plus-lg` y hover con feedback visual inmediato.

### 4.2 Tareas y Microinteracciones
- **Ítem de Tarea (`.task-item`):**
  - Transición suave al marcar como completada (`transition: all 0.2s ease`).
  - Tarea completada (`.completed`): texto con `text-decoration: line-through` y opacidad al 60%.
  - Botones de acción (editar y eliminar) discretos con aparición destacada en hover.

---

## 5. Fases de Implementación

### Fase 1: Estructura Base y Maquetación (HTML/CSS)
- [x] Crear [index.html](file:///c:/Users/salva/.antigravity/ListaTareas/index.html) con Bootstrap 5.3 CDN, Bootstrap Icons CDN y marcado semántico.
- [x] Crear [css/styles.css](file:///c:/Users/salva/.antigravity/ListaTareas/css/styles.css) con el estilo de pestañas de navegador y layout responsivo.

### Fase 2: Servicios de Persistencia y Estado (`storage.js` y `state.js`)
- [x] Implementar `StorageService` con métodos de validación y datos iniciales.
- [x] Implementar `AppState` con el patrón observable (suscripción) y métodos CRUD para listas y tareas.

### Fase 3: Renderizado y Manejo de Eventos (`ui.js` y `app.js`)
- [x] Implementar `UIManager` para renderizado dinámico de pestañas y lista activa.
- [x] Delegación de eventos para optimizar clics en pestañas, botones de cierre, checkboxes de tareas, editar y borrar.
- [x] Conectar la inicialización en `app.js`.

### Fase 4: Casos Límite y Validaciones
- [x] Impedir eliminación si solo queda una lista activa.
- [x] Validar entradas vacías en nombres de listas y títulos de tareas.
- [x] Confirmación al eliminar listas con tareas existentes.

### Fase 5: Verificación y Pruebas
- [x] Validar persistencia completa tras recargar navegador.
- [x] Comprobar funcionamiento responsivo en viewport móvil y de escritorio.
- [x] Revisión visual contra las especificaciones de [specs/mvp.md](file:///c:/Users/salva/.antigravity/ListaTareas/specs/mvp.md).
