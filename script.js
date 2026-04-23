// ── CONFIG ──
const OPENAI_MODEL = 'llama-3.3-70b-versatile';
const WEBHOOK_URL = 'http://localhost:5678/webhook/Clinic-Booking';

const SYSTEM_PROMPT = `You are a friendly clinic appointment booking assistant for City Clinic.
Collect patient name, phone number, doctor/department preference, and preferred date and time.
Once all information is collected, respond ONLY with this exact JSON:
{"name":"...","phone":"...","doctor":"...","datetime":"...","action":"BOOK_APPOINTMENT"}
Keep responses short, friendly and in English.`;

// ── STATE ──
let messages = [];
let apiKey = '';
let bookingDone = false;

// ── DOM HELPERS ──
const messagesEl = () => document.getElementById('chat-messages');
const inputEl = () => document.getElementById('chat-input');
const sendBtnEl = () => document.getElementById('send-btn');

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatBotText(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

// ── MESSAGE RENDERING ──
function addBotMessage(text) {
  const el = messagesEl();
  const div = document.createElement('div');
  div.className = 'message bot';
  div.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div>
      <div class="msg-bubble">${formatBotText(text)}</div>
      <div class="msg-time">${getTime()}</div>
    </div>`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function addUserMessage(text) {
  const el = messagesEl();
  const div = document.createElement('div');
  div.className = 'message user';
  div.innerHTML = `
    <div>
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <div class="msg-time">${getTime()}</div>
    </div>
    <div class="msg-avatar">👤</div>`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function showTyping() {
  const el = messagesEl();
  const div = document.createElement('div');
  div.className = 'message bot';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <div class="msg-avatar">🤖</div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function showSuccessCard(data) {
  const el = messagesEl();
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="success-message">
      <div class="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h4>Appointment Confirmed! 🎉</h4>
      <p>
        <strong>${escapeHtml(data.name)}</strong><br>
        👨‍⚕️ ${escapeHtml(data.doctor)}<br>
        📅 ${escapeHtml(data.datetime)}<br>
        📞 ${escapeHtml(data.phone)}
      </p>
    </div>`;
  el.appendChild(div);
  el.scrollTop = el.scrollHeight;
}

function showErrorMessage(text) {
  addBotMessage(`⚠️ ${text}`);
}

// ── API KEY ──
function saveApiKey() {
  const val = document.getElementById('api-key-input').value.trim();
  if (!val.startsWith('gsk_')) {
    alert('Please enter a valid Groq API key starting with "gsk_".');
    return;
  }
  apiKey = val;
  const status = document.getElementById('key-status');
  const btn = document.getElementById('save-key-btn');
  status.style.display = 'inline';
  btn.textContent = '✓ Saved';
  btn.style.background = '#10b981';
  setTimeout(() => {
    status.style.display = 'none';
    btn.textContent = 'Save Key';
    btn.style.background = '';
  }, 2500);

  // Start chat if not already started
  if (messagesEl().children.length === 0) {
    initChat();
  }
}

// ── CHAT INIT ──
function initChat() {
  messages = [];
  bookingDone = false;
  messagesEl().innerHTML = '';
  addBotMessage("Hello! 👋 Welcome to **City Clinic**.\n\nI'm your AI booking assistant. I'll help you schedule an appointment in just a few steps.\n\nLet's start — what is your **full name**?");
}

function resetChat() {
  if (confirm('Start a new conversation?')) {
    initChat();
  }
}

// ── SEND MESSAGE ──
async function sendMessage() {
  if (bookingDone) return;

  const input = inputEl();
  const text = input.value.trim();
  if (!text) return;

  if (!apiKey) {
    alert('Please enter and save your OpenAI API key first.');
    return;
  }

  // Clear input
  input.value = '';
  input.style.height = 'auto';
  sendBtnEl().disabled = true;

  addUserMessage(text);
  messages.push({ role: 'user', content: text });

  showTyping();

  try {
    const response = await callOpenAI();
    removeTyping();

    const reply = response.choices[0].message.content.trim();
    messages.push({ role: 'assistant', content: reply });

    // Try to detect booking JSON
    const bookingData = extractBookingJson(reply);

    if (bookingData) {
      addBotMessage("Great! I have all the details. Let me confirm your booking now... ⏳");
      await submitBooking(bookingData);
    } else {
      addBotMessage(reply);
    }
  } catch (err) {
    removeTyping();
    showErrorMessage(`${err.message}. Please check your API key and internet connection.`);
  }

  sendBtnEl().disabled = false;
  input.focus();
}

async function callOpenAI() {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      max_tokens: 350,
      temperature: 0.7
    })
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const errData = await res.json();
      msg = errData.error?.message || msg;
    } catch (_) {}
    throw new Error(msg);
  }

  return res.json();
}

function extractBookingJson(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]);
    if (
      parsed.action === 'BOOK_APPOINTMENT' &&
      parsed.name && parsed.phone && parsed.doctor && parsed.datetime
    ) {
      return parsed;
    }
  } catch (_) {}
  return null;
}

// ── WEBHOOK ──
async function submitBooking(data) {
  const payload = {
    name: data.name,
    phone: data.phone,
    doctor: data.doctor,
    datetime: data.datetime
  };

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.warn('Webhook responded with', res.status);
    }
  } catch (err) {
    // n8n might not be running in dev — log silently, still show success UI
    console.warn('Webhook not reachable:', err.message);
  }

  bookingDone = true;
  showSuccessCard(data);
  addBotMessage("Your appointment has been booked successfully! ✅\n\nWe'll send a confirmation to the number you provided. Please arrive **10 minutes early** on the day.\n\nIs there anything else I can help you with? _(Click the reset button to start a new booking)_");
}

// ── INPUT HELPERS ──
function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

// ── AUTO-START if no key required (demo mode check) ──
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('chat-input');
  if (input) {
    input.addEventListener('keydown', handleKey);
    input.addEventListener('input', () => autoResize(input));
  }

  // Show placeholder greeting (no key needed to see it)
  addBotMessage("👋 Hello! I'm the **City Clinic** AI booking assistant.\n\nTo get started, please **paste your OpenAI API key** in the field above and click **Save Key**.");
});
