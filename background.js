// Crear el menú contextual cuando se instala la extensión
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'saveTabs',
      title: 'Quick Save Tabs',
      contexts: ['action']  // 'action' es para el menú del icono de la extensión
    });
  });
  
  // Función para formatear la fecha
  function formatDate(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[date.getDay()];
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    
    return `${day} ${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }
  
  // Manejar el clic en el menú contextual
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'saveTabs') {
      // Obtener todas las pestañas
      const tabs = await chrome.tabs.query({});
      const extensionUrl = chrome.runtime.getURL('');
      
      // Crear los datos de la sesión
      const sessionData = {
        name: '',  // Sin nombre como pediste
        date: formatDate(new Date()),
        urls: tabs
          .filter(tab => !tab.url.startsWith(extensionUrl))
          .map(tab => tab.url)
      };
  
      // Obtener sesiones existentes y añadir la nueva
      const { sessions = [] } = await chrome.storage.local.get('sessions');
      sessions.unshift(sessionData);
      await chrome.storage.local.set({ sessions });
    }
  });
  
  // Manejar el clic en el icono de la extensión
  chrome.action.onClicked.addListener(function() {
    chrome.tabs.create({
      url: 'tabs.html'
    });
  });