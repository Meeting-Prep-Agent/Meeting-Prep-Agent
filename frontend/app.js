// Meeting Prep Agent - Vanilla JavaScript Frontend (Step 7B: Final AI Brief Rendering Cleanup)

const API_BASE_URL = 'http://localhost:8000/api/v1';

let contactsCache = [];
let currentContactId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Sidebar navigation tab switching
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Fetch contacts from backend on page load
  fetchContacts();

  // Bind contact dropdown change listener
  const contactSelect = document.getElementById('contactSelect');
  if (contactSelect) {
    contactSelect.addEventListener('change', handleContactChange);
  }

  // Bind meeting process button
  const processBtn = document.getElementById('processBtn');
  if (processBtn) {
    processBtn.addEventListener('click', handleMeetingUpload);
  }

  // Bind AI Prepare Me button
  const prepareBtn = document.getElementById('prepareBtn');
  if (prepareBtn) {
    prepareBtn.addEventListener('click', handlePrepareBrief);
  }
});

async function fetchContacts() {
  const contactSelect = document.getElementById('contactSelect');
  const errorBanner = document.getElementById('errorBanner');

  if (!contactSelect) return;

  // 1. Loading state
  contactSelect.innerHTML = '<option value="" disabled selected>Loading contacts...</option>';
  if (errorBanner) {
    errorBanner.classList.add('hidden');
    errorBanner.textContent = '';
  }

  try {
    const response = await fetch(`${API_BASE_URL}/contacts`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const contacts = await response.json();
    contactsCache = Array.isArray(contacts) ? contacts : [];

    // 2. Handle empty contacts response
    if (contactsCache.length === 0) {
      contactSelect.innerHTML = '<option value="" disabled selected>No contacts found</option>';
      return;
    }

    // 3. Populate dropdown with backend contacts
    contactSelect.innerHTML = '<option value="" disabled selected>Select a contact</option>';

    contactsCache.forEach(contact => {
      const option = document.createElement('option');
      option.value = contact.id;
      option.textContent = contact.company ? `${contact.name} (${contact.company})` : contact.name;
      contactSelect.appendChild(option);
    });

  } catch (error) {
    console.error('API Error when fetching contacts:', error);
    
    // 4. Handle API failure
    contactSelect.innerHTML = '<option value="" disabled selected>Unable to load contacts</option>';
    
    if (errorBanner) {
      errorBanner.textContent = `Unable to load contacts: ${error.message || 'Network Error'}`;
      errorBanner.classList.remove('hidden');
    }
  }
}

function handleContactChange() {
  const contactSelect = document.getElementById('contactSelect');
  if (!contactSelect) return;

  const selectedId = contactSelect.value;
  if (!selectedId || selectedId === currentContactId) return;

  currentContactId = selectedId;
  const contact = contactsCache.find(c => String(c.id) === String(selectedId));

  // 1. Render real Behavioral Profile if available
  renderBehavioralProfile(contact);

  // 2. Clear old state / brief results
  const resultCard = document.getElementById('processedMeetingCard');
  if (resultCard) resultCard.classList.add('hidden');

  const emptyState = document.getElementById('aiPrepEmptyState');
  const prepResult = document.getElementById('aiPrepResult');
  const prepStatus = document.getElementById('prepStatus');

  if (emptyState) emptyState.classList.remove('hidden');
  if (prepResult) prepResult.classList.add('hidden');
  if (prepStatus) prepStatus.classList.add('hidden');

  // 3. Fetch real Meeting History for selected contact
  fetchMeetingHistory(selectedId);
}

function renderBehavioralProfile(contact) {
  const container = document.getElementById('behavioralProfileContainer');
  if (!container) return;

  if (!contact || !contact.behavioral_profile || Object.keys(contact.behavioral_profile).length === 0) {
    container.innerHTML = '<span class="placeholder-text">Behavioral profile will appear after sufficient interaction history.</span>';
    return;
  }

  const profile = contact.behavioral_profile;
  let html = '<div class="behavioral-details">';

  if (profile.communication_style) {
    html += `
      <div class="behavioral-item">
        <span class="behavioral-label">Communication Style:</span>
        <span class="behavioral-val">${escapeHtml(profile.communication_style)}</span>
      </div>
    `;
  }

  if (profile.decision_pattern) {
    html += `
      <div class="behavioral-item">
        <span class="behavioral-label">Decision Pattern:</span>
        <span class="behavioral-val">${escapeHtml(profile.decision_pattern)}</span>
      </div>
    `;
  }

  if (profile.preferred_communication) {
    html += `
      <div class="behavioral-item">
        <span class="behavioral-label">Preferred Channel:</span>
        <span class="behavioral-val">${escapeHtml(profile.preferred_communication)}</span>
      </div>
    `;
  }

  if (Array.isArray(profile.hot_button_topics) && profile.hot_button_topics.length > 0) {
    html += `
      <div class="behavioral-item">
        <span class="behavioral-label">Key Topics/Concerns:</span>
        <span class="behavioral-val">${profile.hot_button_topics.map(t => escapeHtml(t)).join(', ')}</span>
      </div>
    `;
  }

  html += '</div>';
  container.innerHTML = html;
}

async function fetchMeetingHistory(contactId) {
  const container = document.getElementById('meetingHistoryContainer');
  const countBadge = document.getElementById('historyCountBadge');

  if (!container) return;

  // Loading state
  container.innerHTML = `
    <div class="empty-state">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      <p>Loading meeting history...</p>
    </div>
  `;

  if (countBadge) countBadge.classList.add('hidden');

  try {
    const response = await fetch(`${API_BASE_URL}/meetings/history/${contactId}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const meetings = await response.json();

    if (!Array.isArray(meetings) || meetings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No previous meetings found.</p>
        </div>
      `;
      return;
    }

    // Update count badge
    if (countBadge) {
      countBadge.textContent = `${meetings.length} meeting${meetings.length === 1 ? '' : 's'}`;
      countBadge.classList.remove('hidden');
    }

    // Render timeline meeting list
    let listHtml = '<div class="history-card-list">';

    meetings.forEach(m => {
      const formattedDate = formatDate(m.date || m.created_at);
      const toneBadge = m.tone_analysis 
        ? `<span class="badge badge-subtle">Tone: ${escapeHtml(m.tone_analysis)}</span>` 
        : '';
      
      const topicsHtml = (Array.isArray(m.key_topics) && m.key_topics.length > 0)
        ? `<div class="history-topics">${m.key_topics.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`
        : '';

      const sentimentText = (m.sentiment_score !== null && m.sentiment_score !== undefined)
        ? `<span>Sentiment: ${m.sentiment_score > 0 ? '+' : ''}${m.sentiment_score}</span>`
        : '';

      listHtml += `
        <div class="history-card">
          <div class="history-card-header">
            <span class="history-date">${escapeHtml(formattedDate)}</span>
            ${toneBadge}
          </div>
          <p class="history-summary">${escapeHtml(m.summary || 'No summary available.')}</p>
          ${topicsHtml}
          <div class="history-meta">
            <span class="code-font">ID: ${escapeHtml(m.id ? m.id.substring(0, 8) + '...' : 'N/A')}</span>
            ${sentimentText}
          </div>
        </div>
      `;
    });

    listHtml += '</div>';
    container.innerHTML = listHtml;

  } catch (error) {
    console.error('API Error when fetching meeting history:', error);
    container.innerHTML = `
      <div class="empty-state">
        <p>Unable to load meeting history.</p>
      </div>
    `;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return 'Unknown Date';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

async function handleMeetingUpload() {
  const contactSelect = document.getElementById('contactSelect');
  const transcriptInput = document.getElementById('transcriptInput');
  const processBtn = document.getElementById('processBtn');
  const uploadStatus = document.getElementById('uploadStatus');
  const resultCard = document.getElementById('processedMeetingCard');

  const contactId = contactSelect ? contactSelect.value : '';
  const transcriptText = transcriptInput ? transcriptInput.value.trim() : '';

  // 1. Frontend Validations
  if (!contactId) {
    showAlert(uploadStatus, 'Please select a contact before processing.', 'error');
    return;
  }

  if (!transcriptText) {
    showAlert(uploadStatus, 'Please enter a meeting transcript.', 'error');
    return;
  }

  // 2. Loading state setup
  if (resultCard) resultCard.classList.add('hidden');
  processBtn.disabled = true;
  processBtn.textContent = 'Processing...';
  showAlert(uploadStatus, 'Processing meeting transcript via AI intelligence...', 'info');

  try {
    const payload = {
      contact_id: contactId,
      transcript_raw: transcriptText
    };

    const response = await fetch(`${API_BASE_URL}/meetings/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} Error`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 400) {
        throw new Error(`Validation Error: ${errorMessage}`);
      } else if (response.status === 404) {
        throw new Error(`Resource Not Found: ${errorMessage}`);
      } else if (response.status === 500) {
        throw new Error(`Server Error: ${errorMessage}`);
      } else {
        throw new Error(errorMessage);
      }
    }

    const meeting = await response.json();

    // 3. Success state
    showAlert(uploadStatus, 'Meeting transcript processed and saved successfully!', 'success');
    renderMeetingResult(meeting);

    // 4. Automatically refresh meeting history for selected contact
    fetchMeetingHistory(contactId);

  } catch (error) {
    console.error('Meeting upload error:', error);
    showAlert(uploadStatus, `Failed to process meeting: ${error.message || 'Network Error'}`, 'error');
  } finally {
    processBtn.disabled = false;
    processBtn.textContent = 'Process Meeting';
  }
}

async function handlePrepareBrief() {
  const contactSelect = document.getElementById('contactSelect');
  const prepareBtn = document.getElementById('prepareBtn');
  const prepStatus = document.getElementById('prepStatus');

  const contactId = contactSelect ? contactSelect.value : '';

  // 1. Validation
  if (!contactId) {
    showAlert(prepStatus, 'Please select a contact before generating a brief.', 'error');
    return;
  }

  // 2. Loading State
  prepareBtn.disabled = true;
  prepareBtn.textContent = 'Preparing your meeting...';
  showAlert(prepStatus, 'Synthesizing intelligence brief using Hindsight memory & Groq...', 'info');

  try {
    const payload = {
      contact_id: contactId,
      message: 'Prepare me for my next meeting with this contact. Use their previous meetings, behavioral profile, commitments, and long-term memories to give me a concise preparation brief.'
    };

    const response = await fetch(`${API_BASE_URL}/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} Error`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }

      if (response.status === 400) {
        throw new Error(`Validation Error: ${errorMessage}`);
      } else if (response.status === 404) {
        throw new Error(`Resource Not Found: ${errorMessage}`);
      } else if (response.status === 500) {
        throw new Error(`Server Error: ${errorMessage}`);
      } else {
        throw new Error(errorMessage);
      }
    }

    const data = await response.json();

    // 3. Render Real Response
    if (data && data.content) {
      handlePrepareBriefSuccess(data.content);
      showAlert(prepStatus, 'Personalized meeting brief generated successfully!', 'success');
    } else {
      throw new Error('Backend returned empty content.');
    }

  } catch (error) {
    console.error('Prepare brief error:', error);
    showAlert(prepStatus, `Failed to generate preparation brief: ${error.message || 'Network Error'}`, 'error');
  } finally {
    prepareBtn.disabled = false;
    prepareBtn.textContent = 'Prepare Me';
  }
}

function handlePrepareBriefSuccess(content) {
  const emptyState = document.getElementById('aiPrepEmptyState');
  const resultContainer = document.getElementById('aiPrepResult');
  const briefContent = document.getElementById('prepBriefContent');
  const quickBriefArea = document.getElementById('quickBriefArea');

  if (emptyState) emptyState.classList.add('hidden');

  // 1. Top Summary "Quick Brief" Area
  const quickItems = extractQuickBriefItems(content);
  if (quickItems && Object.keys(quickItems).length > 0 && quickBriefArea) {
    quickBriefArea.innerHTML = '';
    Object.entries(quickItems).forEach(([label, value]) => {
      const card = document.createElement('div');
      card.className = 'quick-brief-card';
      card.innerHTML = `
        <div class="quick-brief-label">${escapeHtml(label)}</div>
        <div class="quick-brief-value">${escapeHtml(value)}</div>
      `;
      quickBriefArea.appendChild(card);
    });
    quickBriefArea.classList.remove('hidden');
  } else if (quickBriefArea) {
    quickBriefArea.classList.add('hidden');
  }

  // 2. Render Clean Full Markdown
  if (briefContent) {
    briefContent.innerHTML = parseMarkdown(content);
  }

  if (resultContainer) resultContainer.classList.remove('hidden');
}

function extractQuickBriefItems(markdown) {
  if (!markdown) return null;
  const items = {};
  const lines = markdown.split('\n');
  
  lines.forEach(line => {
    const clean = line.replace(/^[\-\*#\d\.]+\s*/, '').trim();
    
    if (/^(objective|goal|purpose):?\s*(.*)/i.test(clean)) {
      const match = clean.match(/^(objective|goal|purpose):?\s*(.*)/i);
      if (match && match[2] && match[2].length > 3 && !items['Objective']) items['Objective'] = match[2];
    } else if (/^(strategy|recommended strategy|approach):?\s*(.*)/i.test(clean)) {
      const match = clean.match(/^(strategy|recommended strategy|approach):?\s*(.*)/i);
      if (match && match[2] && match[2].length > 3 && !items['Strategy']) items['Strategy'] = match[2];
    } else if (/^(key concern|risk|red flag):?\s*(.*)/i.test(clean)) {
      const match = clean.match(/^(key concern|risk|red flag):?\s*(.*)/i);
      if (match && match[2] && match[2].length > 3 && !items['Key Concern']) items['Key Concern'] = match[2];
    } else if (/^(communication style|style):?\s*(.*)/i.test(clean)) {
      const match = clean.match(/^(communication style|style):?\s*(.*)/i);
      if (match && match[2] && match[2].length > 3 && !items['Communication Style']) items['Communication Style'] = match[2];
    }
  });

  return Object.keys(items).length > 0 ? items : null;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseMarkdown(markdown) {
  if (!markdown) return '';

  // 1. Process literal <br>, <br/>, <br /> tags into newlines before escaping
  let processed = markdown
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const lines = processed.split('\n');
  let html = '';
  let inList = null; // 'ul' or 'ol'
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];

  function closeList() {
    if (inList) {
      html += `</${inList}>`;
      inList = null;
    }
  }

  function closeTable() {
    if (inTable) {
      let tableHtml = '<div class="table-responsive"><table class="markdown-table"><thead><tr>';
      tableHeaders.forEach(header => {
        tableHtml += `<th>${formatInline(header)}</th>`;
      });
      tableHtml += '</tr></thead><tbody>';
      tableRows.forEach(row => {
        tableHtml += '<tr>';
        row.forEach(cell => {
          tableHtml += `<td>${formatInline(cell)}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table></div>';
      html += tableHtml;
      inTable = false;
      tableHeaders = [];
      tableRows = [];
    }
  }

  function formatInline(text) {
    if (!text) return '';
    return text
      .replace(/^\|\s*/, '')
      .replace(/\s*\|$/, '')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Skip empty standalone pipes or line artifacts
    if (line === '|' || line === '') {
      closeList();
      closeTable();
      continue;
    }

    // Horizontal rule (---, ***, ___ or |---|---|)
    if (/^[\-\*_]{3,}$/.test(line)) {
      closeList();
      closeTable();
      html += '<hr class="markdown-hr">';
      continue;
    }

    // Table detection: line contains '|' and has at least one internal pipe
    const pipeMatches = line.match(/\|/g);
    const isPipeLine = (line.includes('|') && (line.startsWith('|') || line.endsWith('|') || (pipeMatches && pipeMatches.length >= 2)));

    if (isPipeLine) {
      closeList();
      let rawCells = line.split('|');
      if (line.startsWith('|')) rawCells.shift();
      if (line.endsWith('|')) rawCells.pop();

      const cells = rawCells.map(c => c.trim());

      // Delimiter row (|---|---|)
      if (cells.every(c => /^[:\-\s]+$/.test(c))) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      closeTable();
    }

    // Headings (# Heading)
    if (line.startsWith('#')) {
      closeList();
      const level = line.match(/^#+/)[0].length;
      const text = line.replace(/^#+\s*/, '');
      const tag = level <= 4 ? `h${level}` : 'h4';
      html += `<${tag} class="markdown-heading">${formatInline(text)}</${tag}>`;
      continue;
    }

    // Unordered List (- item, * item, + item, • item)
    const ulMatch = line.match(/^[\-\*\+\u2022]\s+(.*)$/);
    if (ulMatch) {
      if (inList !== 'ul') {
        closeList();
        inList = 'ul';
        html += '<ul class="markdown-list">';
      }
      html += `<li>${formatInline(ulMatch[1])}</li>`;
      continue;
    }

    // Ordered List (1. item)
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (inList !== 'ol') {
        closeList();
        inList = 'ol';
        html += '<ol class="markdown-list">';
      }
      html += `<li>${formatInline(olMatch[1])}</li>`;
      continue;
    }

    // Paragraph
    closeList();
    html += `<p>${formatInline(line)}</p>`;
  }

  closeList();
  closeTable();

  return html;
}

function showAlert(element, message, type) {
  if (!element) return;
  element.className = `alert-message alert-${type}`;
  element.textContent = message;
  element.classList.remove('hidden');
}

function renderMeetingResult(meeting) {
  const resultCard = document.getElementById('processedMeetingCard');
  const resultMeetingId = document.getElementById('resultMeetingId');
  const resultTone = document.getElementById('resultTone');
  const resultSentiment = document.getElementById('resultSentiment');
  const resultSummary = document.getElementById('resultSummary');
  const resultTopics = document.getElementById('resultTopics');

  if (!resultCard) return;

  if (resultMeetingId) resultMeetingId.textContent = meeting.id || 'N/A';
  if (resultTone) resultTone.textContent = meeting.tone_analysis || 'N/A';
  if (resultSentiment) {
    resultSentiment.textContent = (meeting.sentiment_score !== null && meeting.sentiment_score !== undefined) 
      ? meeting.sentiment_score 
      : 'N/A';
  }
  if (resultSummary) resultSummary.textContent = meeting.summary || 'No summary generated.';

  if (resultTopics) {
    resultTopics.innerHTML = '';
    const topics = Array.isArray(meeting.key_topics) ? meeting.key_topics : [];
    if (topics.length === 0) {
      resultTopics.innerHTML = '<span class="placeholder-text">None</span>';
    } else {
      topics.forEach(topic => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = topic;
        resultTopics.appendChild(tag);
      });
    }
  }

  resultCard.classList.remove('hidden');
}
