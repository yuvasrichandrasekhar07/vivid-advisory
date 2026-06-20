import React, { useState, useRef, useEffect } from 'react';

const FAQ_TREE = {
  'How do I list land?': 'Register as an Aggregator → Complete KYC → Click "List Land" in your dashboard → Fill survey details → Upload documents → Submit for verification.',
  'How does survey verification work?': 'We cross-check your survey number against Karnataka\'s Bhoomi portal and CDP data to validate ownership, zone classification, and encumbrances automatically.',
  'What is the success fee?': 'Vivid Advisory charges a 2% success fee on the total agreed transaction value, payable only on deal completion. No upfront cost.',
  'How do I search for land?': 'Use the Search page to filter by district, area size, budget, land use type, CDP zone, and more. You can also post a Requirement and get auto-matched.',
  'What documents are needed?': '1. Title Deed  2. Encumbrance Certificate (EC)  3. RTC/Pahani extract  4. Survey sketch  5. Mutation extract  6. Due Diligence report from an empanelled legal firm.',
  'What is a discrepancy ticket?': 'If submitted data doesn\'t match government records, a ticket is auto-raised. A field executive is assigned to verify on-ground. The listing is held until resolved.',
  'Who is an IPC Consultant?': 'An IPC (Industrial Property Consultant) helps buyers find the right land and connects aggregators with buyers and investors. They earn a commission on successful deals.',
  'Can I invest partially?': 'Yes! Register as an Investor, browse available co-investment opportunities, and connect with aggregators for partial ownership deals.',
  'How do I navigate the website?': 'Use the top navigation: Browse Land to search, News for updates, Services for rate cards, Guidelines for DOs & DON\'Ts. After login, your Dashboard has role-specific tools.',
};

const QUICK_REPLIES = [
  'How do I list land?',
  'How does survey verification work?',
  'What is the success fee?',
  'What documents are needed?',
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! 👋 Welcome to Vivid Advisory. I\'m here to help you navigate our land marketplace. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    setMessages(prev => [...prev, { from: 'user', text: msg }]);

    setTimeout(() => {
      const key = Object.keys(FAQ_TREE).find(k => k.toLowerCase().includes(msg.toLowerCase().slice(0, 15)) || msg.toLowerCase().includes(k.toLowerCase().split(' ').slice(0, 3).join(' ')));
      const reply = key ? FAQ_TREE[key] : 'I\'m not sure about that specific question. Please contact our support team or browse our Guidelines & Rate Cards pages for more info. You can also call us at 1800-XXX-XXXX.';
      setMessages(prev => [...prev, { from: 'bot', text: reply }]);
    }, 600);
  };

  return (
    <div className="chatbot-widget">
      {open && (
        <div className="chatbot-panel fade-in">
          <div className="chatbot-header">
            <div style={{ width: 32, height: 32, background: '#C9A227', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#0D2E5E', fontSize: '0.9rem' }}>V</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Vivid Help Desk</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.7 }}>● Online • Typically replies instantly</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.from}`}>{m.text}</div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-quick-replies">
            {QUICK_REPLIES.map(qr => (
              <button key={qr} className="chat-qr-btn" onClick={() => handleSend(qr)}>{qr}</button>
            ))}
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
            />
            <button className="chatbot-send" onClick={() => handleSend()}>➤</button>
          </div>
        </div>
      )}
      <button className="chatbot-btn" onClick={() => setOpen(!open)} title="Help Desk">
        {open ? '×' : '💬'}
      </button>
    </div>
  );
}
