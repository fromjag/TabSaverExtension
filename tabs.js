const ARROW_RIGHT = '>';  // Usando símbolo simple para mejor compatibilidad
const ARROW_DOWN = 'v';  // Usando símbolo simple para mejor compatibilidad

// Format date to "Monday DD/MM/YYYY HH:mm"
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

// Load saved sessions
async function loadSessions() {
  const sessionsDiv = document.getElementById('sessions');
  const { sessions = [] } = await chrome.storage.local.get('sessions');
  
  sessionsDiv.innerHTML = '';
  sessions.forEach((session, index) => {
    const sessionElement = document.createElement('div');
    sessionElement.className = 'session';
    
    sessionElement.innerHTML = `
      <div class="session-header">
        <span class="collapse-arrow">${ARROW_RIGHT}</span>
        <div class="session-info">
          <span class="tab-count info-item">${session.urls.length} tabs</span>
          <span class="session-date info-item">${session.date}</span>
          <h3 class="session-name info-item" contenteditable="true">${session.name || ''}</h3>
        </div>
        <div class="session-actions">
          <div class="open-btn-group">
            <button class="open-btn">Open</button>
            <button class="open-btn-dropdown">${ARROW_DOWN}</button>
            <div class="dropdown-content">
              <div class="dropdown-option" data-action="current">Open in current window</div>
              <div class="dropdown-option" data-action="new">Open in new window</div>
            </div>
          </div>
          <button class="delete-btn">Delete</button>
        </div>
      </div>
      <div class="urls">
        ${session.urls.map(url => `
          <div class="url-item">
            <a href="${url}" target="_blank">${url}</a>
          </div>
        `).join('')}
      </div>
    `;

    // Event listeners
    const sessionHeader = sessionElement.querySelector('.session-header');
    sessionHeader.addEventListener('click', (e) => {
      // Ignore clicks on buttons and editable name
      if (!e.target.closest('.session-actions') && !e.target.closest('[contenteditable]')) {
        sessionElement.classList.toggle('expanded');
      }
    });

    const nameElement = sessionElement.querySelector('.session-name');
    nameElement.addEventListener('click', (e) => e.stopPropagation());
    nameElement.addEventListener('blur', async () => {
      const { sessions } = await chrome.storage.local.get('sessions');
      sessions[index].name = nameElement.textContent;
      await chrome.storage.local.set({ sessions });
    });

    // Open button and dropdown functionality
    const openBtn = sessionElement.querySelector('.open-btn');
    const dropdownBtn = sessionElement.querySelector('.open-btn-dropdown');
    const dropdownContent = sessionElement.querySelector('.dropdown-content');

    openBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Default behavior: open in current window
      session.urls.forEach(url => {
        chrome.tabs.create({ url });
      });
    });

    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownContent.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdownContent.classList.remove('show');
    });

    dropdownContent.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = e.target.dataset.action;
      if (action === 'current') {
        session.urls.forEach(url => {
          chrome.tabs.create({ url });
        });
      } else if (action === 'new') {
        chrome.windows.create({
          url: session.urls
        });
      }
      dropdownContent.classList.remove('show');
    });

    const deleteBtn = sessionElement.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const { sessions } = await chrome.storage.local.get('sessions');
      sessions.splice(index, 1);
      await chrome.storage.local.set({ sessions });
      loadSessions();
    });

    sessionsDiv.appendChild(sessionElement);
  });
}

// Save current tabs
document.getElementById('saveButton').addEventListener('click', async () => {
  const tabs = await chrome.tabs.query({});
  const extensionUrl = chrome.runtime.getURL('');
  
  const sessionData = {
    name: document.getElementById('sessionName').value,
    date: formatDate(new Date()),
    urls: tabs
      .filter(tab => !tab.url.startsWith(extensionUrl))
      .map(tab => tab.url)
  };

  const { sessions = [] } = await chrome.storage.local.get('sessions');
  sessions.unshift(sessionData);
  await chrome.storage.local.set({ sessions });
  
  document.getElementById('sessionName').value = '';
  loadSessions();
});

// Theme selector
document.getElementById('themeSelector').addEventListener('change', function() {
  const theme = this.value;
  chrome.storage.local.set({ theme });
  window.setTheme(theme);
});

// Initial load
loadSessions();