/**
 * Punto de Entrada Principal: app.js
 * Inicializa la persistencia, el estado y el gestor de interfaz de usuario.
 */

import { StorageService } from './storage.js';
import { AppState } from './state.js';
import { UIManager } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Instanciación de componentes
  const storageService = new StorageService();
  const appState = new AppState(storageService);
  const uiManager = new UIManager(appState);

  // 2. Suscribir el renderizado de la UI ante cualquier cambio de estado
  appState.subscribe(() => {
    uiManager.render();
  });

  // 3. Inicializar estado y enlazar eventos
  appState.init();
  uiManager.init();

  // 4. Primer renderizado
  uiManager.render();
});
