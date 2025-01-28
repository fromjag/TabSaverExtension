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

// Manejar el clic en el icono de la extensión
chrome.action.onClicked.addListener(async function() {
  // Buscar si ya existe una pestaña con la página de la extensión
  const tabs = await chrome.tabs.query({});
  const extensionUrl = chrome.runtime.getURL('tabs.html');
  
  const existingTab = tabs.find(tab => 
    tab.url && tab.url === extensionUrl
  );
  
  if (existingTab) {
    // Si existe, activar esa pestaña
    await chrome.tabs.update(existingTab.id, { active: true });
    // Si la pestaña está en otra ventana, enfocamos esa ventana
    await chrome.windows.update(existingTab.windowId, { focused: true });
  } else {
    // Si no existe, crear nueva pestaña
    chrome.tabs.create({
      url: 'tabs.html'
    });
  }
});