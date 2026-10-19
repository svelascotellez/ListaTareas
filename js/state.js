/**
 * Módulo de Estado: AppState
 * Gestiona el estado reactivo centralizado de listas y tareas, aplicando reglas
 * de negocio y notificando a los observadores para renderizado y persistencia.
 */

export class AppState {
  /**
   * @param {import('./storage.js').StorageService} storageService
   */
  constructor(storageService) {
    this.storageService = storageService;
    this.listeners = [];
    this.data = {
      activeListId: null,
      lists: []
    };
  }

  /**
   * Inicializa el estado cargando los datos desde el servicio de almacenamiento.
   */
  init() {
    this.data = this.storageService.loadData();

    // Asegurar que exista una lista activa válida
    if (!this.getActiveList() && this.data.lists.length > 0) {
      this.data.activeListId = this.data.lists[0].id;
      this.storageService.saveData(this.data);
    }
  }

  /**
   * Registra un observador que se ejecutará cada vez que el estado mute.
   * @param {Function} listener
   */
  subscribe(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener);
    }
  }

  /**
   * Guarda los cambios en almacenamiento y notifica a los suscriptores.
   * @private
   */
  _notify() {
    this.storageService.saveData(this.data);
    this.listeners.forEach((listener) => {
      try {
        listener(this.data);
      } catch (err) {
        console.error('Error en suscriptor de AppState:', err);
      }
    });
  }

  // =========================================================================
  // Consultas (Getters)
  // =========================================================================

  /**
   * Retorna una copia de todas las listas.
   * @returns {Array<Object>}
   */
  getAllLists() {
    return [...this.data.lists];
  }

  /**
   * Retorna el ID de la lista actualmente seleccionada.
   * @returns {string|null}
   */
  getActiveListId() {
    return this.data.activeListId;
  }

  /**
   * Obtiene el objeto de una lista por su identificador.
   * @param {string} listId
   * @returns {Object|null}
   */
  getListById(listId) {
    return this.data.lists.find((l) => l.id === listId) || null;
  }

  /**
   * Retorna la lista actualmente activa.
   * @returns {Object|null}
   */
  getActiveList() {
    return this.getListById(this.data.activeListId);
  }

  /**
   * Calcula las métricas de progreso de una lista determinada.
   * @param {string} [listId] Si se omite, calcula las de la lista activa.
   * @returns {{ total: number, completed: number, pending: number, percentage: number }}
   */
  getListStats(listId = this.data.activeListId) {
    const list = this.getListById(listId);
    if (!list || !Array.isArray(list.tasks)) {
      return { total: 0, completed: 0, pending: 0, percentage: 0 };
    }

    const total = list.tasks.length;
    const completed = list.tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, percentage };
  }

  // =========================================================================
  // Operaciones sobre Listas (Pestañas)
  // =========================================================================

  /**
   * Crea una nueva lista y la establece como activa.
   * @param {string} title
   * @returns {Object} La nueva lista creada
   */
  createList(title) {
    const cleanTitle = (title || '').trim() || `Lista ${this.data.lists.length + 1}`;
    const newList = {
      id: 'list-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: cleanTitle,
      createdAt: Date.now(),
      tasks: []
    };

    this.data.lists.push(newList);
    this.data.activeListId = newList.id;
    this._notify();
    return newList;
  }

  /**
   * Selecciona una lista para volverla activa.
   * @param {string} listId
   * @returns {boolean} True si la lista existe y fue seleccionada
   */
  selectList(listId) {
    const exists = this.data.lists.some((l) => l.id === listId);
    if (exists && this.data.activeListId !== listId) {
      this.data.activeListId = listId;
      this._notify();
      return true;
    }
    return false;
  }

  /**
   * Renombra una lista existente.
   * @param {string} listId
   * @param {string} newTitle
   * @returns {boolean}
   */
  renameList(listId, newTitle) {
    const cleanTitle = (newTitle || '').trim();
    if (!cleanTitle) return false;

    const list = this.getListById(listId);
    if (list) {
      list.title = cleanTitle;
      this._notify();
      return true;
    }
    return false;
  }

  /**
   * Elimina una lista. Si era la lista activa, activa otra adyacente.
   * No permite eliminar si solo queda una lista.
   * @param {string} listId
   * @returns {boolean} True si se eliminó con éxito
   */
  deleteList(listId) {
    if (this.data.lists.length <= 1) {
      console.warn('No se puede eliminar la única lista existente.');
      return false;
    }

    const index = this.data.lists.findIndex((l) => l.id === listId);
    if (index === -1) return false;

    this.data.lists.splice(index, 1);

    // Si eliminamos la que estaba activa, cambiamos a la anterior o la primera
    if (this.data.activeListId === listId) {
      const nextIndex = Math.max(0, index - 1);
      this.data.activeListId = this.data.lists[nextIndex].id;
    }

    this._notify();
    return true;
  }

  // =========================================================================
  // Operaciones sobre Tareas
  // =========================================================================

  /**
   * Agrega una nueva tarea a la lista especificada (o activa).
   * @param {string} title Descripción de la tarea
   * @param {string} [listId] Identificador de la lista objetivo
   * @returns {Object|null} La tarea creada o null si no fue válida
   */
  addTask(title, listId = this.data.activeListId) {
    const cleanTitle = (title || '').trim();
    if (!cleanTitle) return null;

    const list = this.getListById(listId);
    if (!list) return null;

    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: cleanTitle,
      completed: false,
      createdAt: Date.now()
    };

    // Añadir al inicio para mejor visibilidad del usuario
    list.tasks.unshift(newTask);
    this._notify();
    return newTask;
  }

  /**
   * Alterna el estado de completado (true/false) de una tarea.
   * @param {string} taskId
   * @param {string} [listId]
   * @returns {boolean}
   */
  toggleTask(taskId, listId = this.data.activeListId) {
    const list = this.getListById(listId);
    if (!list) return false;

    const task = list.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this._notify();
      return true;
    }
    return false;
  }

  /**
   * Modifica la descripción de una tarea existente.
   * @param {string} taskId
   * @param {string} newTitle
   * @param {string} [listId]
   * @returns {boolean}
   */
  editTask(taskId, newTitle, listId = this.data.activeListId) {
    const cleanTitle = (newTitle || '').trim();
    if (!cleanTitle) return false;

    const list = this.getListById(listId);
    if (!list) return false;

    const task = list.tasks.find((t) => t.id === taskId);
    if (task) {
      task.title = cleanTitle;
      this._notify();
      return true;
    }
    return false;
  }

  /**
   * Elimina una tarea de la lista indicada.
   * @param {string} taskId
   * @param {string} [listId]
   * @returns {boolean}
   */
  deleteTask(taskId, listId = this.data.activeListId) {
    const list = this.getListById(listId);
    if (!list) return false;

    const index = list.tasks.findIndex((t) => t.id === taskId);
    if (index !== -1) {
      list.tasks.splice(index, 1);
      this._notify();
      return true;
    }
    return false;
  }
}
