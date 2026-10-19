/**
 * Módulo de Persistencia: StorageService
 * Maneja la lectura, escritura y estructura inicial en localStorage.
 */

export class StorageService {
  /**
   * @param {string} storageKey Clave utilizada para almacenar los datos en localStorage
   */
  constructor(storageKey = 'todo_app_data_v1') {
    this.storageKey = storageKey;
  }

  /**
   * Carga los datos almacenados en localStorage.
   * Si no existen o el JSON está corrupto, retorna la estructura predeterminada.
   * @returns {Object} Datos de la aplicación
   */
  loadData() {
    try {
      const serialized = localStorage.getItem(this.storageKey);
      if (!serialized) {
        const defaultData = this.getDefaultData();
        this.saveData(defaultData);
        return defaultData;
      }
      
      const parsed = JSON.parse(serialized);

      // Validación básica de estructura
      if (!parsed || !Array.isArray(parsed.lists) || !parsed.activeListId) {
        console.warn('Estructura de datos inválida en localStorage. Restableciendo a valores por defecto.');
        const defaultData = this.getDefaultData();
        this.saveData(defaultData);
        return defaultData;
      }

      return parsed;
    } catch (error) {
      console.error('Error al cargar datos desde localStorage:', error);
      const defaultData = this.getDefaultData();
      this.saveData(defaultData);
      return defaultData;
    }
  }

  /**
   * Serializa y persiste los datos en localStorage.
   * @param {Object} data Objeto completo con listas y lista activa
   * @returns {boolean} True si se guardó con éxito, false en caso contrario
   */
  saveData(data) {
    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Los datos a guardar deben ser un objeto válido.');
      }
      const serialized = JSON.stringify(data);
      localStorage.setItem(this.storageKey, serialized);
      return true;
    } catch (error) {
      console.error('Error al guardar datos en localStorage:', error);
      return false;
    }
  }

  /**
   * Genera el estado inicial predeterminado para nuevos usuarios.
   * @returns {Object} Estructura inicial con una lista y una tarea de bienvenida
   */
  getDefaultData() {
    const defaultListId = 'list-' + Date.now();
    return {
      activeListId: defaultListId,
      lists: [
        {
          id: defaultListId,
          title: 'Mi Lista',
          createdAt: Date.now(),
          tasks: [
            {
              id: 'task-' + Date.now(),
              title: '¡Bienvenido a TaskFlow! Marca esta tarea como completada o añade tus propios pendientes.',
              completed: false,
              createdAt: Date.now()
            }
          ]
        }
      ]
    };
  }
}
