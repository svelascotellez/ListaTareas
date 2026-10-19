/**
 * Módulo de Interfaz de Usuario: UIManager
 * Se encarga del renderizado dinámico del DOM, captura de eventos y gestión
 * de modales de Bootstrap para listas y tareas.
 */

export class UIManager {
  /**
   * @param {import('./state.js').AppState} appState
   */
  constructor(appState) {
    this.state = appState;

    // Cache de elementos del DOM
    this.tabsContainer = document.getElementById('tabs-container');
    this.btnAddTab = document.getElementById('btn-add-tab');

    this.currentListTitle = document.getElementById('current-list-title');
    this.btnEditListTitle = document.getElementById('btn-edit-list-title');
    this.statsBadge = document.getElementById('stats-badge');
    this.statsText = document.getElementById('stats-text');
    this.listProgressBar = document.getElementById('list-progress-bar');

    this.taskForm = document.getElementById('task-form');
    this.taskInput = document.getElementById('task-input');
    this.tasksList = document.getElementById('tasks-list');
    this.emptyState = document.getElementById('empty-state');

    // Modales de Bootstrap e inputs asociados
    this.modalNewListEl = document.getElementById('modal-new-list');
    this.modalNewList = new bootstrap.Modal(this.modalNewListEl);
    this.formNewList = document.getElementById('form-new-list');
    this.inputNewListTitle = document.getElementById('input-new-list-title');

    this.modalRenameListEl = document.getElementById('modal-rename-list');
    this.modalRenameList = new bootstrap.Modal(this.modalRenameListEl);
    this.formRenameList = document.getElementById('form-rename-list');
    this.inputRenameListTitle = document.getElementById('input-rename-list-title');

    this.modalEditTaskEl = document.getElementById('modal-edit-task');
    this.modalEditTask = new bootstrap.Modal(this.modalEditTaskEl);
    this.formEditTask = document.getElementById('form-edit-task');
    this.editTaskId = document.getElementById('edit-task-id');
    this.inputEditTaskTitle = document.getElementById('input-edit-task-title');

    this.modalDeleteListEl = document.getElementById('modal-delete-list');
    this.modalDeleteList = new bootstrap.Modal(this.modalDeleteListEl);
    this.deleteListIdInput = document.getElementById('delete-list-id');
    this.deleteListNameText = document.getElementById('delete-list-name');
    this.deleteListWarning = document.getElementById('delete-list-warning');
    this.deleteListWarningContainer = document.getElementById('delete-list-warning-container');
    this.btnConfirmDeleteList = document.getElementById('btn-confirm-delete-list');
  }

  /**
   * Inicializa los listeners globales y delegación de eventos.
   */
  init() {
    this._bindTabEvents();
    this._bindTaskFormEvents();
    this._bindTaskListEvents();
    this._bindModalEvents();
  }

  /**
   * Orquesta el renderizado completo de la aplicación.
   */
  render() {
    this.renderTabs();
    this.renderListHeader();
    this.renderTasks();
  }

  // =========================================================================
  // Renderizado
  // =========================================================================

  /**
   * Renderiza las pestañas estilo navegador web.
   */
  renderTabs() {
    const lists = this.state.getAllLists();
    const activeListId = this.state.getActiveListId();
    const canDelete = lists.length > 1;

    this.tabsContainer.innerHTML = lists
      .map((list) => {
        const isActive = list.id === activeListId;
        const closeBtnHtml = canDelete
          ? `<span class="tab-close-btn" data-action="delete-tab" data-list-id="${list.id}" aria-label="Cerrar lista" title="Eliminar lista">
               <i class="bi bi-x"></i>
             </span>`
          : '';

        return `
          <button 
            type="button" 
            class="browser-tab ${isActive ? 'active' : ''} d-flex align-items-center gap-2" 
            role="tab" 
            aria-selected="${isActive}" 
            data-list-id="${list.id}"
            title="${this._escapeHtml(list.title)}"
          >
            <i class="bi bi-card-checklist ${isActive ? 'text-primary' : 'text-secondary'}" aria-hidden="true"></i>
            <span class="tab-title text-truncate">${this._escapeHtml(list.title)}</span>
            ${closeBtnHtml}
          </button>
        `;
      })
      .join('');
  }

  /**
   * Renderiza la cabecera de la lista activa (título y contadores/barra de progreso).
   */
  renderListHeader() {
    const activeList = this.state.getActiveList();
    if (!activeList) return;

    this.currentListTitle.textContent = activeList.title;

    const stats = this.state.getListStats(activeList.id);
    this.statsText.textContent = `${stats.pending} pendientes de ${stats.total}`;

    this.listProgressBar.style.width = `${stats.percentage}%`;
    this.listProgressBar.setAttribute('aria-valuenow', stats.percentage);

    // Ajustar color de la barra si todo está completado
    if (stats.total > 0 && stats.pending === 0) {
      this.listProgressBar.classList.remove('bg-primary');
      this.listProgressBar.classList.add('bg-success');
    } else {
      this.listProgressBar.classList.remove('bg-success');
      this.listProgressBar.classList.add('bg-primary');
    }
  }

  /**
   * Renderiza la lista de tareas o el estado vacío (empty state).
   */
  renderTasks() {
    const activeList = this.state.getActiveList();
    if (!activeList) return;

    const tasks = activeList.tasks || [];

    if (tasks.length === 0) {
      this.tasksList.innerHTML = '';
      this.emptyState.classList.remove('d-none');
      return;
    }

    this.emptyState.classList.add('d-none');
    this.tasksList.innerHTML = tasks
      .map((task) => {
        const isCompleted = task.completed;
        return `
          <li class="list-group-item d-flex align-items-center justify-content-between p-3 rounded-3 border task-item ${isCompleted ? 'completed' : ''}" data-task-id="${task.id}">
            <div class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden">
              <input 
                class="form-check-input task-checkbox flex-shrink-0 fs-5 mt-0" 
                type="checkbox" 
                id="check-${task.id}" 
                data-action="toggle-task"
                data-task-id="${task.id}"
                ${isCompleted ? 'checked' : ''} 
                aria-label="Marcar como completada"
              >
              <label 
                class="form-check-label task-title text-truncate cursor-pointer flex-grow-1" 
                for="check-${task.id}"
                title="${this._escapeHtml(task.title)}"
              >
                ${this._escapeHtml(task.title)}
              </label>
            </div>
            <div class="task-actions d-flex align-items-center gap-1 ms-2">
              <button 
                type="button" 
                class="btn btn-light btn-sm text-secondary btn-action-edit" 
                data-action="edit-task" 
                data-task-id="${task.id}" 
                title="Editar tarea" 
                aria-label="Editar tarea"
              >
                <i class="bi bi-pencil"></i>
              </button>
              <button 
                type="button" 
                class="btn btn-light btn-sm text-danger btn-action-delete" 
                data-action="delete-task" 
                data-task-id="${task.id}" 
                title="Eliminar tarea" 
                aria-label="Eliminar tarea"
              >
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </li>
        `;
      })
      .join('');
  }

  // =========================================================================
  // Manejadores y Vinculación de Eventos
  // =========================================================================

  /**
   * Eventos de pestañas: selección, cierre y botón añadir.
   * @private
   */
  _bindTabEvents() {
    // Delegación sobre el contenedor de pestañas
    this.tabsContainer.addEventListener('click', (e) => {
      // 1. Clic en botón cerrar pestaña
      const closeBtn = e.target.closest('[data-action="delete-tab"]');
      if (closeBtn) {
        e.stopPropagation();
        const listId = closeBtn.dataset.listId;
        this._openDeleteListModal(listId);
        return;
      }

      // 2. Clic en la pestaña para seleccionarla
      const tab = e.target.closest('.browser-tab');
      if (tab) {
        const listId = tab.dataset.listId;
        if (listId && listId !== this.state.getActiveListId()) {
          this.state.selectList(listId);
        }
      }
    });

    // Botón '+' para abrir modal de nueva lista
    this.btnAddTab.addEventListener('click', () => {
      this.inputNewListTitle.value = '';
      this.modalNewList.show();
      setTimeout(() => this.inputNewListTitle.focus(), 300);
    });

    // Botón para renombrar lista activa
    this.btnEditListTitle.addEventListener('click', () => {
      const activeList = this.state.getActiveList();
      if (!activeList) return;
      this.inputRenameListTitle.value = activeList.title;
      this.modalRenameList.show();
      setTimeout(() => this.inputRenameListTitle.focus(), 300);
    });
  }

  /**
   * Evento de envío del formulario para agregar tarea.
   * @private
   */
  _bindTaskFormEvents() {
    this.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = this.taskInput.value.trim();
      if (!title) {
        this.taskInput.classList.add('is-invalid', 'shake');
        setTimeout(() => this.taskInput.classList.remove('shake'), 400);
        return;
      }
      this.taskInput.classList.remove('is-invalid');
      this.state.addTask(title);
      this.taskInput.value = '';
      this.taskInput.focus();
    });

    this.taskInput.addEventListener('input', () => {
      if (this.taskInput.value.trim()) {
        this.taskInput.classList.remove('is-invalid');
      }
    });
  }

  /**
   * Delegación de eventos en el listado de tareas (toggle, editar, borrar).
   * @private
   */
  _bindTaskListEvents() {
    this.tasksList.addEventListener('click', (e) => {
      // 1. Toggle checkbox
      const toggleEl = e.target.closest('[data-action="toggle-task"]');
      if (toggleEl) {
        const taskId = toggleEl.dataset.taskId;
        this.state.toggleTask(taskId);
        return;
      }

      // 2. Editar tarea
      const editBtn = e.target.closest('[data-action="edit-task"]');
      if (editBtn) {
        const taskId = editBtn.dataset.taskId;
        this._openEditTaskModal(taskId);
        return;
      }

      // 3. Eliminar tarea
      const deleteBtn = e.target.closest('[data-action="delete-task"]');
      if (deleteBtn) {
        const taskId = deleteBtn.dataset.taskId;
        this.state.deleteTask(taskId);
        return;
      }
    });
  }

  /**
   * Eventos de los formularios en modales.
   * @private
   */
  _bindModalEvents() {
    // Formulario Crear Lista
    this.formNewList.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = this.inputNewListTitle.value.trim();
      const finalTitle = title || `Nueva Lista ${this.state.getAllLists().length + 1}`;
      this.state.createList(finalTitle);
      this.modalNewList.hide();
    });

    // Formulario Renombrar Lista
    this.formRenameList.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = this.inputRenameListTitle.value.trim();
      const activeListId = this.state.getActiveListId();
      if (!title) {
        this.inputRenameListTitle.classList.add('is-invalid', 'shake');
        setTimeout(() => this.inputRenameListTitle.classList.remove('shake'), 400);
        return;
      }
      if (activeListId) {
        this.state.renameList(activeListId, title);
        this.inputRenameListTitle.classList.remove('is-invalid');
        this.modalRenameList.hide();
      }
    });

    this.inputRenameListTitle.addEventListener('input', () => {
      if (this.inputRenameListTitle.value.trim()) {
        this.inputRenameListTitle.classList.remove('is-invalid');
      }
    });

    // Formulario Editar Tarea
    this.formEditTask.addEventListener('submit', (e) => {
      e.preventDefault();
      const taskId = this.editTaskId.value;
      const title = this.inputEditTaskTitle.value.trim();
      if (!title) {
        this.inputEditTaskTitle.classList.add('is-invalid', 'shake');
        setTimeout(() => this.inputEditTaskTitle.classList.remove('shake'), 400);
        return;
      }
      if (taskId) {
        this.state.editTask(taskId, title);
        this.inputEditTaskTitle.classList.remove('is-invalid');
        this.modalEditTask.hide();
      }
    });

    this.inputEditTaskTitle.addEventListener('input', () => {
      if (this.inputEditTaskTitle.value.trim()) {
        this.inputEditTaskTitle.classList.remove('is-invalid');
      }
    });

    // Confirmar eliminación de lista con protección de última lista
    this.btnConfirmDeleteList.addEventListener('click', () => {
      if (this.state.getAllLists().length <= 1) {
        this.modalDeleteList.hide();
        return;
      }
      const listId = this.deleteListIdInput.value;
      if (listId) {
        this.state.deleteList(listId);
        this.modalDeleteList.hide();
      }
    });
  }

  // =========================================================================
  // Modales de Acción Auxiliares
  // =========================================================================

  /**
   * Abre el modal de confirmación de eliminación de lista con advertencia detallada.
   * @private
   * @param {string} listId
   */
  _openDeleteListModal(listId) {
    if (this.state.getAllLists().length <= 1) {
      return; // Protección estricta: nunca permitir eliminar la última lista
    }

    const list = this.state.getListById(listId);
    if (!list) return;

    this.deleteListIdInput.value = list.id;
    this.deleteListNameText.textContent = `"${list.title}"`;

    const taskCount = list.tasks ? list.tasks.length : 0;
    if (taskCount > 0) {
      this.deleteListWarning.innerHTML = `Atención: Esta lista contiene <strong>${taskCount}</strong> tarea(s) que se eliminarán permanentemente.`;
      this.deleteListWarningContainer.className = 'alert alert-danger d-flex align-items-center gap-2 mb-0 py-2 small';
    } else {
      this.deleteListWarning.textContent = 'Esta lista está vacía actualmente. No se perderán tareas.';
      this.deleteListWarningContainer.className = 'alert alert-info d-flex align-items-center gap-2 mb-0 py-2 small';
    }

    this.modalDeleteList.show();
  }

  /**
   * Abre el modal de edición de una tarea.
   * @private
   * @param {string} taskId
   */
  _openEditTaskModal(taskId) {
    const activeList = this.state.getActiveList();
    if (!activeList) return;

    const task = activeList.tasks.find((t) => t.id === taskId);
    if (!task) return;

    this.editTaskId.value = task.id;
    this.inputEditTaskTitle.value = task.title;
    this.modalEditTask.show();
    setTimeout(() => this.inputEditTaskTitle.focus(), 300);
  }

  /**
   * Escapa caracteres especiales para evitar vulnerabilidades XSS.
   * @private
   * @param {string} str
   * @returns {string}
   */
  _escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
