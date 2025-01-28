// Save current tabs function
async function saveCurrentTabs() {
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
}

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
        <span class="collapse-arrow">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </span>
        <div class="session-info">
          <span class="tab-count info-item">${session.urls.length} tabs</span>
          <span class="session-date info-item">${session.date}</span>
          <h3 class="session-name info-item" contenteditable="true">${session.name || ''}</h3>
        </div>
        <div class="session-actions">
          <div class="open-btn-group">
            <button class="open-btn">Open</button>
            <button class="open-btn-dropdown">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="dropdown-content">
              <div class="dropdown-option" data-action="current">Open in current window</div>
              <div class="dropdown-option" data-action="new">Open in new window</div>
            </div>
          </div>
          <button class="delete-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
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

// Add event listeners
document.getElementById('saveButton').addEventListener('click', saveCurrentTabs);

// Add keypress event listener to input field
document.getElementById('sessionName').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); // Prevent default form submission
    saveCurrentTabs();
  }
});

// Theme selector
document.getElementById('themeSelector').addEventListener('change', function() {
  const theme = this.value;
  chrome.storage.local.set({ theme });
  window.setTheme(theme);
});

// Initial load
loadSessions();