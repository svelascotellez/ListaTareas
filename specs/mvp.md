# Especificación de Requerimientos del MVP (Spec Driven Development)

## 1. Visión General del Producto
El MVP de la **Aplicación de Lista de Tareas** es una solución web 100% frontend orientada a la gestión organizada de múltiples listas de actividades mediante una metáfora de pestañas similar a la de los navegadores web modernos. Permite a los usuarios crear diferentes listas temáticas, alternar entre ellas, gestionar sus tareas (crear, completar, editar, eliminar) y mantener todos los datos persistidos en el almacenamiento local (`localStorage`) del navegador.

---

## 2. Tecnologías y Dependencias
- **Estructura:** HTML5 semántico.
- **Estilos:** Bootstrap 5.3 + CSS personalizado para el diseño estilizado de pestañas y microinteracciones.
- **Iconografía:** Bootstrap Icons (v1.11+).
- **Lógica e Interactividad:** JavaScript moderno (ES6+ modular o basado en clases/objetos de estado).
- **Persistencia:** API de `localStorage` del navegador.

---

## 3. Modelo de Datos y Estructura en LocalStorage

### 3.1 Clave de almacenamiento
- Clave principal: `todo_app_data_v1`

### 3.2 Esquema JSON
```json
{
  "activeListId": "list-1",
  "lists": [
    {
      "id": "list-1",
      "title": "Mi primera lista",
      "createdAt": 1713264000000,
      "tasks": [
        {
          "id": "task-101",
          "title": "Aprender Spec Driven Development",
          "completed": false,
          "createdAt": 1713264005000
        },
        {
          "id": "task-102",
          "title": "Configurar la interfaz con Bootstrap",
          "completed": true,
          "createdAt": 1713264010000
        }
      ]
    }
  ]
}
```

### 3.3 Reglas de Estado Inicial
- Si `localStorage` está vacío al cargar la aplicación, se genera automáticamente una lista predeterminada con título `"General"` o `"Mi Lista"` y una tarea de bienvenida instructiva.
- `activeListId` debe apuntar siempre al identificador de una lista existente.

---

## 4. Especificaciones de la Interfaz de Usuario (UI/UX)

### 4.1 Header: Barra de Pestañas estilo Navegador Web
1. **Contenedor de Pestañas:**
   - Ubicado en la parte superior de la ventana principal.
   - Apariencia visual que emula pestañas de navegador (pestañas con esquinas redondeadas superiores, fondo integrado con el área de trabajo activa).
   - Capacidad de desplazamiento horizontal (overflow-x) si la cantidad de pestañas supera el ancho de la pantalla.
2. **Elemento Pestaña:**
   - **Indicador activo/inactivo:** La pestaña activa tiene un color de fondo diferenciado, elevación visual y borde continuo con el contenedor de la lista.
   - **Título de la lista:** Texto truncado con puntos suspensivos si excede el tamaño máximo permitido.
   - **Botón de Cierre/Eliminación individual (`x`):** Icono `bi-x` que permite eliminar la lista (con confirmación si contiene tareas). No visible o deshabilitado si solo queda una única lista activa.
   - **Clic en pestaña:** Selecciona dicha lista y actualiza el contenido principal.
3. **Botón Nueva Pestaña (`+`):**
   - Situado a la derecha de la última pestaña.
   - Botón circular o cuadrado estilizado con icono `bi-plus-lg`.
   - Al pulsar, abre un diálogo o prompt interactivo para definir el nombre de la nueva lista y la activa automáticamente.

---

### 4.2 Área Principal: Lista Actual

#### 4.2.1 Cabecera de la Lista
- **Título de la Lista:** Encabezado `<h2>` con el nombre de la lista activa.
  - Opción de edición rápida del título (icono `bi-pencil` o doble clic).
- **Contador y Resumen:**
  - Badge o texto informativo con métricas: `"X pendientes de Y tareas"`.
  - Barra de progreso visual (opcional/complementaria) indicando el porcentaje de avance.

#### 4.2.2 Formulario de Creación de Tareas
- Campo de texto (`input[type="text"]`) con placeholder descriptivo (ej. *"¿Qué necesitas hacer hoy?"*).
- Botón de envío con icono `bi-plus-circle` y texto *"Añadir"*.
- Posibilidad de enviar la tarea presionando la tecla `Enter`.

#### 4.2.3 Listado de Tareas
- Lista vertical de tarjetas o ítems limpios (`list-group-item` estilizado).
- Cada ítem contiene:
  1. **Checkbox de Completado:**
     - Checkbox nativo estilizado o botón interactivo `bi-check-circle` / `bi-circle`.
     - Al activarse: aplica tachado de texto (`text-decoration: line-through`), atenúa el color del texto y reproduce una transición suave.
  2. **Texto de la Tarea:** Etiqueta legible con soporte para salto de línea sin romper el diseño.
  3. **Acciones por Tarea (a la derecha):**
     - **Botón Editar (`bi-pencil`):** Permite cambiar el texto de la tarea (edición in-place o mediante modal simple).
     - **Botón Eliminar (`bi-trash3`):** Elimina la tarea inmediatamente con una animación sutil.

#### 4.2.4 Estado Vacío (Empty State)
- Si la lista actual no contiene tareas, se muestra una ilustración o icono representativo (`bi-clipboard-check`), acompañado del texto: *"No hay tareas pendientes en esta lista. ¡Añade una para comenzar!"*.

---

## 5. Requerimientos Funcionales y Reglas de Negocio

### 5.1 Gestión de Listas (Pestañas)
- **RF-L1: Creación de Lista:**
  - El usuario puede crear una nueva lista mediante el botón `+`.
  - El nombre no puede estar vacío ni contener solo espacios en blanco. Si se deja en blanco, se asigna un valor por defecto tipo `"Nueva Lista N"`.
  - La nueva lista se vuelve inmediatamente la lista activa.
- **RF-L2: Selección de Lista:**
  - Al hacer clic sobre cualquier pestaña inactiva, la aplicación guarda cualquier cambio pendiente y renderiza la lista seleccionada.
- **RF-L3: Renombrado de Lista:**
  - El usuario puede editar el nombre de cualquier lista. El cambio se refleja tanto en la pestaña como en el encabezado principal.
- **RF-L4: Eliminación de Lista:**
  - Si la lista tiene tareas asociadas, se debe solicitar confirmación previa al usuario.
  - No se permite eliminar la última lista; la aplicación siempre debe mantener al menos una lista disponible.
  - Al eliminar la lista activa, el foco pasa automáticamente a la pestaña adyacente.

### 5.2 Gestión de Tareas
- **RF-T1: Añadir Tarea:**
  - Valida que el texto no esté vacío.
  - La nueva tarea se añade al inicio o final de la lista activa.
  - Se limpia el campo de texto y se mantiene el foco para facilitar entradas sucesivas.
- **RF-T2: Marcar como Terminada / Pendiente:**
  - Alterna el atributo `completed` entre `true` y `false`.
  - Persiste el cambio de inmediato en `localStorage`.
- **RF-T3: Edición de Tarea:**
  - Permite corregir o actualizar la descripción de la tarea sin perder su estado de completitud ni su identificador.
  - Validación de texto no vacío antes de confirmar la edición.
- **RF-T4: Eliminación de Tarea:**
  - Remueve la tarea del arreglo de tareas de la lista activa.

### 5.3 Persistencia de Datos
- **RF-P1: Sincronización Automática:**
  - Cada mutación en listas o tareas (crear, editar, borrar, completar) debe invocar una función centralizada de guardado en `localStorage`.
- **RF-P2: Recuperación de Sesión:**
  - Al recargar la página, se cargan exactamente las listas, tareas y la pestaña activa tal como quedaron en la última sesión.

---

## 6. Requerimientos No Funcionales
- **RNF-1 Usabilidad y Diseño:** Interfaz moderna, limpia, con bordes redondeados y transiciones suaves (CSS transitions).
- **RNF-2 Responsividad:** Adaptable a pantallas móviles (smartphones), tablets y escritorios.
- **RNF-3 Accesibilidad (a11y):** Elementos interactivos con etiquetas ARIA adecuadas (`aria-label` en botones de sólo iconos), contraste adecuado y navegación básica por teclado.
- **RNF-4 Desempeño:** Tiempos de respuesta inmediatos (< 50ms) al manipular tareas y pestañas sin demoras perceptibles.
- **RNF-5 Código Limpio y Mantenible:** Separación de responsabilidades clara entre la vista (HTML/DOM), el estilo (CSS) y el estado/controlador (JavaScript).

---

## 7. Criterios de Aceptación (Escenarios de Prueba)

### Escenario 1: Creación y conmutación de pestañas
- **Dado** que el usuario está en la aplicación con la lista "General" abierta,
- **Cuando** presiona el botón `+` en el header e ingresa "Compras",
- **Entonces** se crea una nueva pestaña "Compras", se selecciona automáticamente y el cuerpo muestra una lista vacía para "Compras".

### Escenario 2: Creación y completado de una tarea
- **Dado** que el usuario tiene la pestaña "Compras" activa,
- **Cuando** escribe "Comprar leche" y presiona "Añadir",
- **Entonces** "Comprar leche" aparece en el listado como pendiente;
- **Y cuando** hace clic en el checkbox de la tarea,
- **Entonces** el texto se muestra tachado y el contador de tareas pendientes se actualiza.

### Escenario 3: Edición y persistencia
- **Dado** que existe una tarea creada,
- **Cuando** el usuario edita el texto de la tarea y recarga el navegador web,
- **Entonces** la tarea conserva el nuevo texto y su estado (completada o pendiente).

### Escenario 4: Protección de última lista
- **Dado** que solo queda 1 pestaña en la aplicación,
- **Cuando** el usuario intenta cerrarla,
- **Entonces** el sistema impide la eliminación o deshabilita el botón de borrado, garantizando que siempre exista al menos una lista.
