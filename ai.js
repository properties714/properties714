// ══════════════════════════════════════
//  PROPERTIES714 — AI ASSISTANT
//  GPT-4o directo, sin n8n
// ══════════════════════════════════════

const AI_SYSTEM_PROMPT = `Eres el asistente de inversiones inmobiliarias de Properties714. Eres experto en:
- Inversiones en Georgia, especialmente Atlanta y sus suburbios
- Fix & Flip, Wholesale, BRRRR, Rental, Airbnb/STR, Subject-To, Seller Finance
- Análisis de deals, ARV, cashflow, cap rate, ROI
- Negociación, contratos, due diligence
- Mercado inmobiliario de Georgia 2024-2025

Eres directo, hablas español, das números concretos cuando puedes. Si no sabes algo, lo dices. Máximo 4 párrafos por respuesta.`;

let AI_CHAT_HISTORY = [];
let AI_CHAT_OPEN    = false;

// ── Init chat UI ──
function initAIChat() {
  if (document.getElementById('ai-chat-widget')) return;

  const widget = document.createElement('div');
  widget.id = 'ai-chat-widget';
  widget.innerHTML = `
    <div id="ai-chat-bubble" onclick="toggleAIChat()" title="Asistente IA">
      <span id="ai-bubble-icon">🤖</span>
      <span id="ai-unread" style="display:none">1</span>
    </div>
    <div id="ai-chat-panel">
      <div id="ai-chat-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;background:linear-gradient(135deg,var(--gold),var(--amber));border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px">🤖</div>
          <div>
            <div style="font-weight:700;font-size:14px">AI Advisor</div>
            <div style="font-size:11px;color:var(--green);display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;background:var(--green);border-radius:50%;display:inline-block"></span>GPT-4o • Online</div>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <button onclick="clearAIChat()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px" title="Limpiar">🗑</button>
          <button onclick="toggleAIChat()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:20px">×</button>
        </div>
      </div>
      <div id="ai-chat-messages">
        <div class="ai-msg ai-msg-bot">
          <div class="ai-msg-content">¡Hola! Soy tu AI Advisor de Properties714. Puedo ayudarte con análisis de deals, estrategias de inversión, preguntas sobre el mercado de Georgia, y más. ¿En qué te puedo ayudar?</div>
        </div>
      </div>
      <div id="ai-quick-btns">
        <button onclick="aiQuick('¿Cómo calculo el ARV de una propiedad?')">ARV</button>
        <button onclick="aiQuick('Explícame la estrategia BRRRR')">BRRRR</button>
        <button onclick="aiQuick('¿Qué cap rate es bueno en Georgia?')">Cap Rate</button>
        <button onclick="aiQuick('¿Cómo negocio mejor precio con el vendedor?')">Negociación</button>
      </div>
      <div id="ai-chat-input-row">
        <textarea id="ai-chat-input" placeholder="Pregunta sobre deals, estrategias, mercado..." rows="1"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendAIMessage()}"
          oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'"></textarea>
        <button id="ai-send-btn" onclick="sendAIMessage()">➤</button>
      </div>
    </div>`;

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #ai-chat-widget { position:fixed;bottom:24px;right:24px;z-index:9000;font-family:'Space Grotesk',sans-serif; }
    #ai-chat-bubble {
      width:56px;height:56px;border-radius:50%;
      background:linear-gradient(135deg,var(--gold),#f59e0b);
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;font-size:24px;
      box-shadow:0 4px 24px rgba(245,200,66,0.4);
      transition:transform .2s,box-shadow .2s;position:relative;
    }
    #ai-chat-bubble:hover { transform:scale(1.08);box-shadow:0 8px 32px rgba(245,200,66,0.5); }
    #ai-unread {
      position:absolute;top:-4px;right:-4px;
      background:var(--red);color:#fff;
      width:18px;height:18px;border-radius:50%;
      font-size:10px;font-weight:700;
      display:flex;align-items:center;justify-content:center;
    }
    #ai-chat-panel {
      position:absolute;bottom:70px;right:0;
      width:380px;max-height:560px;
      background:var(--surface);border:1px solid var(--border);
      border-radius:16px;display:none;flex-direction:column;
      box-shadow:0 24px 64px rgba(0,0,0,0.6);overflow:hidden;
    }
    #ai-chat-panel.open { display:flex; }
    #ai-chat-header {
      padding:14px 16px;border-bottom:1px solid var(--border);
      display:flex;justify-content:space-between;align-items:center;
      background:rgba(0,0,0,0.2);
    }
    #ai-chat-messages {
      flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;
      max-height:340px;
    }
    .ai-msg { display:flex;gap:8px; }
    .ai-msg-bot .ai-msg-content {
      background:rgba(255,255,255,0.05);border:1px solid var(--border);
      padding:10px 14px;border-radius:12px 12px 12px 4px;
      font-size:13px;line-height:1.6;color:var(--text);max-width:90%;
    }
    .ai-msg-user { flex-direction:row-reverse; }
    .ai-msg-user .ai-msg-content {
      background:linear-gradient(135deg,rgba(245,200,66,0.2),rgba(245,200,66,0.1));
      border:1px solid rgba(245,200,66,0.3);
      padding:10px 14px;border-radius:12px 12px 4px 12px;
      font-size:13px;line-height:1.6;color:var(--text);max-width:85%;
    }
    .ai-typing { display:flex;gap:4px;padding:8px 14px;align-items:center; }
    .ai-typing span { width:7px;height:7px;background:var(--muted);border-radius:50%;animation:aiDot 1.2s infinite; }
    .ai-typing span:nth-child(2){animation-delay:.2s}
    .ai-typing span:nth-child(3){animation-delay:.4s}
    @keyframes aiDot { 0%,60%,100%{opacity:.2;transform:scale(.8)} 30%{opacity:1;transform:scale(1)} }
    #ai-quick-btns { display:flex;gap:6px;padding:8px 12px;flex-wrap:wrap;border-top:1px solid var(--border); }
    #ai-quick-btns button {
      background:rgba(255,255,255,0.05);border:1px solid var(--border);
      color:var(--text);padding:4px 10px;border-radius:20px;font-size:11px;cursor:pointer;
      transition:background .15s;
    }
    #ai-quick-btns button:hover { background:rgba(245,200,66,0.15);border-color:rgba(245,200,66,0.3); }
    #ai-chat-input-row {
      display:flex;gap:8px;padding:12px;border-top:1px solid var(--border);
      background:rgba(0,0,0,0.1);align-items:flex-end;
    }
    #ai-chat-input {
      flex:1;background:rgba(255,255,255,0.05);border:1px solid var(--border);
      color:var(--text);padding:8px 12px;border-radius:10px;font-size:13px;
      resize:none;outline:none;font-family:inherit;line-height:1.5;min-height:36px;
    }
    #ai-chat-input:focus { border-color:rgba(245,200,66,0.5); }
    #ai-send-btn {
      width:36px;height:36px;background:linear-gradient(135deg,var(--gold),var(--amber));
      border:none;border-radius:8px;cursor:pointer;font-size:14px;
      display:flex;align-items:center;justify-content:center;flex-shrink:0;
      transition:opacity .2s;
    }
    #ai-send-btn:disabled { opacity:0.4;cursor:not-allowed; }
  `;
  document.head.appendChild(style);
  document.body.appendChild(widget);
}

function toggleAIChat() {
  AI_CHAT_OPEN = !AI_CHAT_OPEN;
  const panel = document.getElementById('ai-chat-panel');
  const unread = document.getElementById('ai-unread');
  panel.classList.toggle('open', AI_CHAT_OPEN);
  if (AI_CHAT_OPEN) {
    unread.style.display = 'none';
    setTimeout(() => document.getElementById('ai-chat-input')?.focus(), 100);
  }
}

function clearAIChat() {
  AI_CHAT_HISTORY = [];
  document.getElementById('ai-chat-messages').innerHTML = `
    <div class="ai-msg ai-msg-bot">
      <div class="ai-msg-content">Chat limpiado. ¿En qué te puedo ayudar?</div>
    </div>`;
}

function aiQuick(text) {
  document.getElementById('ai-chat-input').value = text;
  sendAIMessage();
}

function addAIMessage(text, role='bot') {
  const msgs = document.getElementById('ai-chat-messages');
  const div = document.createElement('div');
  div.className = `ai-msg ai-msg-${role}`;
  // Convert **bold** markdown
  const html = text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  div.innerHTML = `<div class="ai-msg-content">${html}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function showTyping() {
  const msgs = document.getElementById('ai-chat-messages');
  const div = document.createElement('div');
  div.className = 'ai-msg ai-msg-bot';
  div.id = 'ai-typing-indicator';
  div.innerHTML = `<div class="ai-msg-content ai-typing"><span></span><span></span><span></span></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}
function hideTyping() {
  document.getElementById('ai-typing-indicator')?.remove();
}

async function sendAIMessage() {
  const input = document.getElementById('ai-chat-input');
  const btn   = document.getElementById('ai-send-btn');
  const text  = input.value.trim();
  if (!text) return;

  // Add user message
  addAIMessage(text, 'user');
  AI_CHAT_HISTORY.push({ role:'user', content: text });
  input.value = '';
  input.style.height = 'auto';
  btn.disabled = true;

  // Show typing
  showTyping();

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.3,
        max_tokens: 800,
        messages: [
          { role: 'system', content: AI_SYSTEM_PROMPT },
          ...AI_CHAT_HISTORY.slice(-10) // last 10 messages for context
        ]
      })
    });

    const data   = await res.json();
    const reply  = data.choices?.[0]?.message?.content || 'Error al obtener respuesta.';

    hideTyping();
    addAIMessage(reply, 'bot');
    AI_CHAT_HISTORY.push({ role:'assistant', content: reply });

  } catch(e) {
    hideTyping();
    addAIMessage('❌ Error conectando con GPT-4o. Verifica tu conexión.', 'bot');
  }

  btn.disabled = false;
  input.focus();
}

// ── Auto-init on load ──
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initAIChat, 500);
});
