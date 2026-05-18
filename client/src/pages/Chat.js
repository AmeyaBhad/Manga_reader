import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, Hash } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';

const ROOMS = [
  { id: 'general', label: 'general', desc: 'General chat' },
  { id: 'manga-talk', label: 'manga-talk', desc: 'Discuss manga' },
  { id: 'recommendations', label: 'recommendations', desc: 'Recommend manga' },
  { id: 'spoilers', label: 'spoilers', desc: 'Spoiler discussion' },
  { id: 'off-topic', label: 'off-topic', desc: 'Random talk' },
];

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const s = io('http://localhost:5000', { transports: ['websocket'] });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;
    setMessages([]);
    socket.emit('join-room', { room, username: user?.username || 'Guest' });
    socket.on('chat-history', (history) => setMessages(history));
    socket.on('new-message', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('user-joined', ({ username }) => setMessages(prev => [...prev, { id: Date.now(), system: true, message: `${username} joined`, createdAt: new Date().toISOString() }]));
    socket.on('user-left', ({ username }) => setMessages(prev => [...prev, { id: Date.now(), system: true, message: `${username} left`, createdAt: new Date().toISOString() }]));
    return () => { socket.off('chat-history'); socket.off('new-message'); socket.off('user-joined'); socket.off('user-left'); };
  }, [socket, room]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket || !isAuthenticated) return;
    socket.emit('send-message', { room, message: input.trim(), userId: user?.id });
    setInput('');
  };

  const timeStr = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <h1 className="page-title">Community Chat</h1>
      <div className="chat-layout">
        <div className="chat-rooms">
          <div style={{ padding: '12px 16px', fontSize: '0.7rem', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Channels</div>
          {ROOMS.map(r => (
            <div key={r.id} className={`chat-room-item ${room === r.id ? 'active' : ''}`}
              onClick={() => setRoom(r.id)} title={r.desc} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <Hash size={14} /> {r.label}
            </div>
          ))}
        </div>

        <div className="chat-main">
          <div className="chat-header">
            <Hash size={16} /> {room}
            {!isAuthenticated && (
              <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text3)' }}>
                <Link to="/login" style={{ color: 'var(--accent2)' }}>Login</Link> to chat
              </span>
            )}
          </div>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '24px' }}>No messages yet. Say hello!</div>
            )}
            {messages.map(msg => msg.system ? (
              <div key={msg.id} style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '0.78rem' }}>— {msg.message} —</div>
            ) : (
              <div key={msg.id} className="chat-msg">
                <div className="chat-msg-avatar">{(msg.username || '?')[0].toUpperCase()}</div>
                <div className="chat-msg-content">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                    <span className="chat-msg-name">{msg.username}</span>
                    <span className="chat-msg-time">{timeStr(msg.createdAt)}</span>
                  </div>
                  <div className="chat-msg-text">{msg.message}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={send} className="chat-input-bar">
            <input className="chat-input"
              placeholder={isAuthenticated ? `Message #${room}...` : 'Login to chat...'}
              value={input} onChange={e => setInput(e.target.value)} disabled={!isAuthenticated} />
            <button type="submit" className="btn-blue"
              style={{ padding: '9px 14px', borderRadius: '4px', display:'flex', alignItems:'center' }}
              disabled={!isAuthenticated}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
