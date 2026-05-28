import { useState, useEffect, useRef, useCallback } from "react";

const EMOJI_LIST = ["👍","❤️","😂","😮","😢","🔥","🎉","👏","💯","🤔"];

const STICKERS = ["🥳","🤣","😍","🥺","😎","🤯","👻","🤖","🦄","🐱","🍕","🎮"];

const initialContacts = [
  { id: 1, name: "Алёна Морозова", avatar: "А", color: "#e84393", status: "online", lastSeen: "онлайн", unread: 3, muted: false, pinned: true, typing: false },
  { id: 2, name: "Дима Волков", avatar: "Д", color: "#2196f3", status: "online", lastSeen: "онлайн", unread: 0, muted: false, pinned: true, typing: true },
  { id: 3, name: "Группа: Работа 🚀", avatar: "Р", color: "#ff9800", status: "group", lastSeen: "3 участника", unread: 12, muted: true, pinned: false, typing: false },
  { id: 4, name: "Катя Смирнова", avatar: "К", color: "#9c27b0", status: "away", lastSeen: "был(а) 5 мин назад", unread: 0, muted: false, pinned: false, typing: false },
  { id: 5, name: "Артём Новиков", avatar: "А", color: "#00bcd4", status: "offline", lastSeen: "был 2 часа назад", unread: 1, muted: false, pinned: false, typing: false },
  { id: 6, name: "Канал: Tech News", avatar: "T", color: "#607d8b", status: "channel", lastSeen: "канал", unread: 47, muted: false, pinned: false, typing: false },
  { id: 7, name: "Лена Козлова", avatar: "Л", color: "#f44336", status: "offline", lastSeen: "была вчера", unread: 0, muted: false, pinned: false, typing: false },
  { id: 8, name: "Степан Петров", avatar: "С", color: "#4caf50", status: "online", lastSeen: "онлайн", unread: 0, muted: false, pinned: false, typing: false },
];

const initialMessages = {
  1: [
    { id: 1, from: "them", text: "Привет! Как дела?", time: "10:20", reactions: {}, read: true, type: "text", replyTo: null, forwarded: false },
    { id: 2, from: "me", text: "Отлично! Работаю над новым проектом 🚀", time: "10:21", reactions: { "👍": ["Алёна"] }, read: true, type: "text", replyTo: null, forwarded: false },
    { id: 3, from: "them", text: "Звучит круто! Расскажи подробнее", time: "10:22", reactions: {}, read: true, type: "text", replyTo: null, forwarded: false },
    { id: 4, from: "me", text: "Делаю мессенджер на React 😄", time: "10:23", reactions: { "😂": ["Алёна"], "❤️": ["Алёна"] }, read: true, type: "text", replyTo: null, forwarded: false },
    { id: 5, from: "them", text: "Ого! Это же очень сложно!", time: "10:24", reactions: {}, read: false, type: "text", replyTo: null, forwarded: false },
  ],
  2: [
    { id: 1, from: "them", text: "Встреча в 15:00 не забудь!", time: "09:15", reactions: {}, read: true, type: "text", replyTo: null, forwarded: false },
    { id: 2, from: "me", text: "Буду, не переживай 👌", time: "09:16", reactions: {}, read: true, type: "text", replyTo: null, forwarded: false },
  ],
  3: [
    { id: 1, from: "other", name: "Алёна", text: "Дедлайн сегодня в 18:00!", time: "08:00", reactions: { "😮": ["Дима", "Катя"] }, read: true, type: "text", replyTo: null, forwarded: false },
    { id: 2, from: "other", name: "Дима", text: "Я почти закончил свою часть", time: "08:05", reactions: {}, read: true, type: "text", replyTo: null, forwarded: false },
    { id: 3, from: "me", text: "Отлично, я тоже скоро буду готов", time: "08:10", reactions: {}, read: true, type: "text", replyTo: null, forwarded: false },
  ],
  4: [], 5: [], 6: [
    { id: 1, from: "channel", text: "🔥 React 20 released! New concurrent features...", time: "11:00", reactions: { "🔥": ["a","b","c"] }, read: true, type: "text", replyTo: null, forwarded: false },
  ], 7: [], 8: [],
};

function formatTime(date) {
  return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date) {
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Сегодня";
  if (date.toDateString() === yesterday.toDateString()) return "Вчера";
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

export default function Messenger() {
  const [contacts, setContacts] = useState(initialContacts);
  const [messages, setMessages] = useState(initialMessages);
  const [activeChat, setActiveChat] = useState(null);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMsg, setEditingMsg] = useState(null);
  const [forwardMsg, setForwardMsg] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [reactionPicker, setReactionPicker] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [theme, setTheme] = useState("dark");
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [msgSearch, setMsgSearch] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recordIntervalRef = useRef(null);

  const isDark = theme === "dark";

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeChat]);

  useEffect(() => {
    if (recording) {
      recordIntervalRef.current = setInterval(() => setRecordTime(t => t + 1), 1000);
    } else {
      clearInterval(recordIntervalRef.current);
      setRecordTime(0);
    }
    return () => clearInterval(recordIntervalRef.current);
  }, [recording]);

  const showNotif = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  };

  const sendMessage = useCallback(() => {
    if (!inputText.trim() && !editingMsg) return;
    if (!activeChat) return;
    const now = formatTime(new Date());
    if (editingMsg) {
      setMessages(prev => ({
        ...prev,
        [activeChat]: prev[activeChat].map(m => m.id === editingMsg.id ? { ...m, text: inputText, edited: true } : m)
      }));
      setEditingMsg(null);
    } else {
      const newMsg = {
        id: Date.now(), from: "me", text: inputText, time: now,
        reactions: {}, read: false, type: "text",
        replyTo: replyTo ? { id: replyTo.id, text: replyTo.text, from: replyTo.from } : null,
        forwarded: false,
      };
      setMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newMsg] }));
      setContacts(prev => prev.map(c => c.id === activeChat ? { ...c, unread: 0 } : c));
    }
    setInputText("");
    setReplyTo(null);
    inputRef.current?.focus();
  }, [inputText, activeChat, replyTo, editingMsg]);

  const sendSticker = (s) => {
    if (!activeChat) return;
    const newMsg = { id: Date.now(), from: "me", text: s, time: formatTime(new Date()), reactions: {}, read: false, type: "sticker", replyTo: null, forwarded: false };
    setMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newMsg] }));
    setShowStickerPicker(false);
  };

  const sendVoice = () => {
    if (!activeChat) return;
    const duration = recordTime;
    const newMsg = { id: Date.now(), from: "me", text: `🎤 Голосовое сообщение ${duration}с`, time: formatTime(new Date()), reactions: {}, read: false, type: "voice", duration, forwarded: false, replyTo: null };
    setMessages(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), newMsg] }));
    setRecording(false);
    showNotif("Голосовое сообщение отправлено");
  };

  const deleteMessage = (chatId, msgId) => {
    setMessages(prev => ({ ...prev, [chatId]: prev[chatId].filter(m => m.id !== msgId) }));
    setContextMenu(null);
    showNotif("Сообщение удалено");
  };

  const addReaction = (chatId, msgId, emoji) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: prev[chatId].map(m => {
        if (m.id !== msgId) return m;
        const reactions = { ...m.reactions };
        if (!reactions[emoji]) reactions[emoji] = [];
        const idx = reactions[emoji].indexOf("me");
        if (idx > -1) reactions[emoji].splice(idx, 1);
        else reactions[emoji].push("me");
        if (reactions[emoji].length === 0) delete reactions[emoji];
        return { ...m, reactions };
      })
    }));
    setReactionPicker(null);
  };

  const pinMessage = (msg) => { setPinnedMessage(msg); setContextMenu(null); showNotif("Сообщение закреплено"); };
  const toggleMute = (id) => { setContacts(prev => prev.map(c => c.id === id ? { ...c, muted: !c.muted } : c)); setContextMenu(null); };
  const togglePin = (id) => { setContacts(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c)); setContextMenu(null); };
  const clearHistory = (id) => { setMessages(prev => ({ ...prev, [id]: [] })); setContextMenu(null); showNotif("История очищена"); };

  const filtered = contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const pinned = filtered.filter(c => c.pinned);
  const rest = filtered.filter(c => !c.pinned);
  const sorted = [...pinned, ...rest];

  const activeContact = contacts.find(c => c.id === activeChat);
  const chatMessages = (messages[activeChat] || []).filter(m => !msgSearch || m.text.toLowerCase().includes(msgSearch.toLowerCase()));

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${isDark ? "#3a3a4a" : "#ccc"}; border-radius: 2px; }
  `;

  const colors = isDark ? {
    bg: "#0e0e10", sidebar: "#161618", chat: "#111113",
    bubble: "#2a2a35", bubbleMe: "#2b5278", surface: "#1e1e26",
    border: "#2a2a35", text: "#e8e8ec", subtext: "#7a7a8a",
    accent: "#5b9cf6", hover: "#1f1f28", input: "#1e1e28",
    online: "#4caf50", headerBg: "#161618", msgDate: "#4a4a5a",
    reactionBg: "#2a2a40", pin: "#f0b429"
  } : {
    bg: "#f0f2f5", sidebar: "#ffffff", chat: "#efeae2",
    bubble: "#ffffff", bubbleMe: "#dcf8c6", surface: "#ffffff",
    border: "#e0e0e0", text: "#111", subtext: "#666",
    accent: "#2196f3", hover: "#f5f5f5", input: "#f0f2f5",
    online: "#4caf50", headerBg: "#ffffff", msgDate: "#888",
    reactionBg: "#f0f0ff", pin: "#f0b429"
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", height: "100vh", background: colors.bg, color: colors.text, overflow: "hidden", fontFamily: "'Inter', sans-serif" }}>

        {/* SIDEBAR */}
        <div style={{ width: sidebarOpen ? 360 : 0, minWidth: sidebarOpen ? 360 : 0, background: colors.sidebar, display: "flex", flexDirection: "column", borderRight: `1px solid ${colors.border}`, transition: "width 0.3s", overflow: "hidden" }}>
          
          {/* Sidebar Header */}
          <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${colors.border}`, background: colors.headerBg }}>
            <button onClick={() => setShowSettings(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: colors.subtext }}>☰</button>
            <div style={{ flex: 1, position: "relative" }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Поиск" style={{ width: "100%", background: colors.input, border: "none", borderRadius: 20, padding: "8px 16px 8px 36px", color: colors.text, fontSize: 14, outline: "none" }} />
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: colors.subtext, fontSize: 14 }}>🔍</span>
            </div>
            <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>{isDark ? "☀️" : "🌙"}</button>
          </div>

          {/* Contact List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {sorted.map((c, i) => {
              const lastMsg = messages[c.id]?.slice(-1)[0];
              const isActive = activeChat === c.id;
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", padding: "10px 16px", cursor: "pointer", background: isActive ? colors.hover : "transparent", transition: "background 0.15s", gap: 12, position: "relative", borderBottom: i === pinned.length - 1 && pinned.length > 0 && !c.pinned ? `1px solid ${colors.border}` : "none" }}
                  onClick={() => { setActiveChat(c.id); setContacts(prev => prev.map(x => x.id === c.id ? { ...x, unread: 0 } : x)); setSidebarOpen(window.innerWidth > 768 || !sidebarOpen); }}
                  onContextMenu={e => { e.preventDefault(); setContextMenu({ type: "contact", id: c.id, x: e.clientX, y: e.clientY }); }}>
                  
                  {c.pinned && <span style={{ position: "absolute", left: 8, top: 8, fontSize: 10, color: colors.pin }}>📌</span>}
                  
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <div style={{ width: 50, height: 50, borderRadius: "50%", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>{c.avatar}</div>
                    {c.status === "online" && <div style={{ position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: "50%", background: colors.online, border: `2px solid ${colors.sidebar}` }} />}
                    {c.typing && <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", background: colors.accent, borderRadius: 8, padding: "1px 5px", fontSize: 9, color: "#fff", whiteSpace: "nowrap" }}>печатает...</div>}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 15, color: colors.text, display: "flex", alignItems: "center", gap: 4 }}>
                        {c.status === "channel" && "📢 "}
                        {c.name}
                        {c.muted && <span style={{ fontSize: 12, color: colors.subtext }}>🔇</span>}
                      </span>
                      <span style={{ fontSize: 12, color: colors.subtext }}>{lastMsg?.time || ""}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                      <span style={{ fontSize: 13, color: colors.subtext, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                        {c.typing ? <em style={{ color: colors.accent }}>печатает...</em> : (lastMsg?.text?.slice(0, 40) || c.lastSeen)}
                      </span>
                      {c.unread > 0 && <span style={{ background: c.muted ? colors.subtext : colors.accent, color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 12, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{c.unread}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom nav */}
          <div style={{ borderTop: `1px solid ${colors.border}`, padding: "8px 16px", display: "flex", justifyContent: "space-around" }}>
            {[["💬","Чаты"],["📞","Звонки"],["🔖","Каналы"],["👤","Профиль"]].map(([icon, label]) => (
              <button key={label} onClick={() => label === "Профиль" && setShowProfile(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: colors.subtext, fontSize: 11, padding: "4px 8px" }}>
                <span style={{ fontSize: 20 }}>{icon}</span>{label}
              </button>
            ))}
          </div>
        </div>

        {/* CHAT AREA */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: colors.chat, position: "relative", minWidth: 0 }}>
          
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: "10px 16px", background: colors.headerBg, borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: 12, zIndex: 10 }}>
                <button onClick={() => setSidebarOpen(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: colors.subtext, display: window.innerWidth < 768 ? "block" : "none" }}>←</button>
                
                <div onClick={() => setShowProfile(true)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: activeContact?.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: "#fff" }}>{activeContact?.avatar}</div>
                    {activeContact?.status === "online" && <div style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", background: colors.online, border: `2px solid ${colors.headerBg}` }} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{activeContact?.name}</div>
                    <div style={{ fontSize: 12, color: activeContact?.status === "online" ? colors.online : colors.subtext }}>{activeContact?.typing ? "печатает..." : activeContact?.lastSeen}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 4 }}>
                  {[["🔍", () => setShowSearch(v => !v)], ["📞", () => showNotif("Голосовой звонок...")], ["📹", () => showNotif("Видеозвонок...")], ["⋮", () => {}]].map(([icon, fn]) => (
                    <button key={icon} onClick={fn} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: colors.subtext, padding: "6px", borderRadius: "50%", transition: "background 0.2s" }}
                      onMouseEnter={e => e.currentTarget.style.background = colors.hover}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>{icon}</button>
                  ))}
                </div>
              </div>

              {/* Pinned Message */}
              {pinnedMessage && (
                <div style={{ padding: "6px 16px", background: isDark ? "#1a2030" : "#e8f4ff", borderBottom: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <span style={{ color: colors.accent, fontSize: 16 }}>📌</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: colors.accent, fontWeight: 600 }}>Закреплённое сообщение</div>
                    <div style={{ fontSize: 13, color: colors.subtext, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pinnedMessage.text}</div>
                  </div>
                  <button onClick={() => setPinnedMessage(null)} style={{ background: "none", border: "none", cursor: "pointer", color: colors.subtext, fontSize: 16 }}>✕</button>
                </div>
              )}

              {/* Message Search */}
              {showSearch && (
                <div style={{ padding: "8px 16px", background: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
                  <input value={msgSearch} onChange={e => setMsgSearch(e.target.value)} placeholder="Поиск по сообщениям..." autoFocus style={{ width: "100%", background: colors.input, border: "none", borderRadius: 20, padding: "8px 16px", color: colors.text, fontSize: 14, outline: "none" }} />
                </div>
              )}

              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 4 }} onClick={() => { setContextMenu(null); setReactionPicker(null); setShowEmojiPicker(false); setShowStickerPicker(false); setShowAttachMenu(false); }}>
                
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <span style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", padding: "4px 12px", borderRadius: 12, fontSize: 12, color: colors.subtext }}>{formatDate(new Date())}</span>
                </div>

                {chatMessages.map((msg, idx) => {
                  const isMe = msg.from === "me";
                  const prevMsg = chatMessages[idx - 1];
                  const showName = !isMe && msg.from !== "channel" && activeContact?.status === "group" && msg.name && prevMsg?.name !== msg.name;
                  
                  return (
                    <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", marginBottom: 2 }}>
                      
                      {showName && <div style={{ fontSize: 12, color: activeContact?.color, fontWeight: 600, marginLeft: 48, marginBottom: 2 }}>{msg.name}</div>}
                      
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, maxWidth: "70%", flexDirection: isMe ? "row-reverse" : "row" }}
                        onContextMenu={e => { e.preventDefault(); setContextMenu({ type: "message", msg, chatId: activeChat, x: e.clientX, y: e.clientY }); }}>
                        
                        {!isMe && activeContact?.status === "group" && (
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: activeContact?.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0, marginBottom: 4 }}>{activeContact?.avatar[0]}</div>
                        )}
                        
                        <div style={{ position: "relative" }}>
                          <div
                            style={{
                              background: msg.type === "sticker" ? "transparent" : (isMe ? colors.bubbleMe : colors.bubble),
                              borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                              padding: msg.type === "sticker" ? "0" : "8px 12px",
                              boxShadow: msg.type !== "sticker" ? "0 1px 3px rgba(0,0,0,0.15)" : "none",
                              cursor: "pointer",
                              transition: "opacity 0.15s",
                            }}
                            onDoubleClick={() => setReactionPicker({ msgId: msg.id, chatId: activeChat })}
                          >
                            {msg.forwarded && <div style={{ fontSize: 11, color: colors.accent, marginBottom: 4, fontStyle: "italic" }}>⟫ Переслано</div>}
                            
                            {msg.replyTo && (
                              <div style={{ borderLeft: `3px solid ${colors.accent}`, paddingLeft: 8, marginBottom: 6, opacity: 0.8 }}>
                                <div style={{ fontSize: 11, color: colors.accent, fontWeight: 600 }}>{msg.replyTo.from === "me" ? "Вы" : activeContact?.name}</div>
                                <div style={{ fontSize: 12, color: colors.subtext, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{msg.replyTo.text}</div>
                              </div>
                            )}

                            {msg.type === "sticker" ? (
                              <span style={{ fontSize: 56 }}>{msg.text}</span>
                            ) : msg.type === "voice" ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
                                <button style={{ background: colors.accent, border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => showNotif("Воспроизведение...")}>▶</button>
                                <div style={{ flex: 1 }}>
                                  <div style={{ height: 3, background: isDark ? "#3a3a4a" : "#ddd", borderRadius: 2, marginBottom: 4 }}>
                                    <div style={{ width: "0%", height: "100%", background: colors.accent, borderRadius: 2 }} />
                                  </div>
                                  <div style={{ fontSize: 11, color: colors.subtext }}>{msg.duration}с</div>
                                </div>
                                <span style={{ fontSize: 13 }}>🎤</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: 15, color: colors.text, lineHeight: 1.5, wordBreak: "break-word" }}>{msg.text}{msg.edited && <span style={{ fontSize: 10, color: colors.subtext, marginLeft: 6 }}>(ред.)</span>}</span>
                            )}
                            
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: msg.type === "sticker" ? 0 : 4 }}>
                              <span style={{ fontSize: 11, color: colors.subtext }}>{msg.time}</span>
                              {isMe && <span style={{ fontSize: 12, color: msg.read ? colors.accent : colors.subtext }}>{msg.read ? "✓✓" : "✓"}</span>}
                            </div>
                          </div>

                          {/* Reactions */}
                          {Object.keys(msg.reactions).length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4, justifyContent: isMe ? "flex-end" : "flex-start" }}>
                              {Object.entries(msg.reactions).map(([emoji, users]) => (
                                <button key={emoji} onClick={() => addReaction(activeChat, msg.id, emoji)}
                                  style={{ background: users.includes("me") ? (isDark ? "#2b4a7a" : "#cce4ff") : colors.reactionBg, border: `1px solid ${users.includes("me") ? colors.accent : "transparent"}`, borderRadius: 12, padding: "2px 8px", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                                  <span>{emoji}</span><span style={{ fontSize: 11, color: colors.subtext }}>{users.length}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Reaction Picker */}
                          {reactionPicker?.msgId === msg.id && (
                            <div style={{ position: "absolute", bottom: "110%", [isMe ? "right" : "left"]: 0, background: colors.surface, borderRadius: 24, padding: "8px 12px", display: "flex", gap: 6, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", zIndex: 100 }}>
                              {EMOJI_LIST.map(e => (
                                <button key={e} onClick={() => addReaction(activeChat, msg.id, e)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, transition: "transform 0.1s" }}
                                  onMouseEnter={ev => ev.currentTarget.style.transform = "scale(1.4)"}
                                  onMouseLeave={ev => ev.currentTarget.style.transform = "scale(1)"}>{e}</button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply/Edit Bar */}
              {(replyTo || editingMsg) && (
                <div style={{ padding: "8px 16px", background: colors.surface, borderTop: `1px solid ${colors.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 3, height: 36, background: colors.accent, borderRadius: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: colors.accent, fontWeight: 600 }}>{editingMsg ? "✏️ Редактирование" : `↩️ Ответ: ${replyTo?.from === "me" ? "Вы" : activeContact?.name}`}</div>
                    <div style={{ fontSize: 13, color: colors.subtext, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(replyTo || editingMsg)?.text}</div>
                  </div>
                  <button onClick={() => { setReplyTo(null); setEditingMsg(null); setInputText(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: colors.subtext, fontSize: 20 }}>✕</button>
                </div>
              )}

              {/* Input Area */}
              <div style={{ padding: "10px 16px", background: colors.headerBg, borderTop: `1px solid ${colors.border}`, display: "flex", alignItems: "flex-end", gap: 8, position: "relative" }}>
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div style={{ position: "absolute", bottom: "100%", left: 16, background: colors.surface, borderRadius: 16, padding: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.3)", zIndex: 200, display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 6 }}>
                    {["😀","😂","❤️","🔥","👍","🎉","😍","🤔","😎","🥺","🤣","😭","🙏","💪","✨","🎮","🍕","🌙","⭐","🚀","💡","🎵","📱","🌈"].map(e => (
                      <button key={e} onClick={() => { setInputText(t => t + e); setShowEmojiPicker(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, padding: 4 }}>{e}</button>
                    ))}
                  </div>
                )}

                {/* Sticker Picker */}
                {showStickerPicker && (
                  <div style={{ position: "absolute", bottom: "100%", left: 60, background: colors.surface, borderRadius: 16, padding: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.3)", zIndex: 200 }}>
                    <div style={{ fontSize: 12, color: colors.subtext, marginBottom: 8, fontWeight: 600 }}>Стикеры</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                      {STICKERS.map(s => (
                        <button key={s} onClick={() => sendSticker(s)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 40, padding: 6, transition: "transform 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attach Menu */}
                {showAttachMenu && (
                  <div style={{ position: "absolute", bottom: "100%", left: 100, background: colors.surface, borderRadius: 16, padding: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.3)", zIndex: 200, display: "flex", flexDirection: "column", gap: 4, minWidth: 180 }}>
                    {[["📷","Фото/Видео"],["📁","Файл"],["📍","Геолокация"],["👤","Контакт"],["📊","Опрос"]].map(([icon, label]) => (
                      <button key={label} onClick={() => { showNotif(`Прикрепить: ${label}`); setShowAttachMenu(false); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: colors.text, fontSize: 14, padding: "8px 12px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = colors.hover}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}>
                        <span style={{ fontSize: 20 }}>{icon}</span>{label}
                      </button>
                    ))}
                  </div>
                )}

                <button onClick={() => { setShowEmojiPicker(v => !v); setShowStickerPicker(false); setShowAttachMenu(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 24, color: colors.subtext, flexShrink: 0 }}>😊</button>
                <button onClick={() => { setShowStickerPicker(v => !v); setShowEmojiPicker(false); setShowAttachMenu(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: colors.subtext, flexShrink: 0 }}>🎭</button>
                <button onClick={() => { setShowAttachMenu(v => !v); setShowEmojiPicker(false); setShowStickerPicker(false); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: colors.subtext, flexShrink: 0 }}>📎</button>

                <div style={{ flex: 1, background: colors.input, borderRadius: 22, padding: "8px 16px", display: "flex", alignItems: "center" }}>
                  <textarea ref={inputRef} value={inputText} onChange={e => setInputText(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Написать сообщение..." rows={1}
                    style={{ flex: 1, background: "none", border: "none", outline: "none", color: colors.text, fontSize: 15, resize: "none", maxHeight: 120, lineHeight: 1.5, fontFamily: "inherit" }} />
                </div>

                {recording ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#f44336", fontSize: 13 }}>● {Math.floor(recordTime/60).toString().padStart(2,"0")}:{(recordTime%60).toString().padStart(2,"0")}</span>
                    <button onClick={() => setRecording(false)} style={{ background: "#f44336", border: "none", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", fontSize: 16, color: "#fff" }}>✕</button>
                    <button onClick={sendVoice} style={{ background: colors.accent, border: "none", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", fontSize: 16, color: "#fff" }}>✓</button>
                  </div>
                ) : inputText.trim() ? (
                  <button onClick={sendMessage} style={{ background: colors.accent, border: "none", borderRadius: "50%", width: 42, height: 42, cursor: "pointer", fontSize: 18, color: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${colors.accent}66`, transition: "transform 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>➤</button>
                ) : (
                  <button onMouseDown={() => setRecording(true)} style={{ background: isDark ? "#2a2a3a" : "#e0e0e0", border: "none", borderRadius: "50%", width: 42, height: 42, cursor: "pointer", fontSize: 20, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>🎤</button>
                )}
              </div>
            </>
          ) : (
            /* No chat selected */
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: colors.subtext }}>
              <div style={{ fontSize: 80 }}>💬</div>
              <div style={{ fontSize: 22, fontWeight: 600, color: colors.text }}>Добро пожаловать!</div>
              <div style={{ fontSize: 15, textAlign: "center", maxWidth: 300 }}>Выберите чат слева, чтобы начать общение</div>
              {!sidebarOpen && <button onClick={() => setSidebarOpen(true)} style={{ background: colors.accent, border: "none", borderRadius: 20, padding: "10px 24px", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>Открыть чаты</button>}
            </div>
          )}
        </div>

        {/* CONTEXT MENU */}
        {contextMenu && (
          <div style={{ position: "fixed", top: contextMenu.y, left: contextMenu.x, background: colors.surface, borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.35)", zIndex: 1000, minWidth: 200, overflow: "hidden", border: `1px solid ${colors.border}` }}
            onClick={e => e.stopPropagation()}>
            {contextMenu.type === "message" ? [
              ["↩️ Ответить", () => { setReplyTo(contextMenu.msg); setContextMenu(null); }],
              contextMenu.msg.from === "me" && ["✏️ Редактировать", () => { setEditingMsg(contextMenu.msg); setInputText(contextMenu.msg.text); setContextMenu(null); }],
              ["⟫ Переслать", () => { setForwardMsg(contextMenu.msg); setShowForwardModal(true); setContextMenu(null); }],
              ["📌 Закрепить", () => pinMessage(contextMenu.msg)],
              ["📋 Копировать", () => { navigator.clipboard?.writeText(contextMenu.msg.text); showNotif("Скопировано!"); setContextMenu(null); }],
              contextMenu.msg.from === "me" && ["🗑️ Удалить", () => deleteMessage(contextMenu.chatId, contextMenu.msg.id)],
            ].filter(Boolean).map(([label, fn]) => (
              <button key={label} onClick={fn} style={{ display: "block", width: "100%", background: "none", border: "none", cursor: "pointer", padding: "11px 16px", textAlign: "left", color: label.includes("Удалить") ? "#f44336" : colors.text, fontSize: 14, transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = colors.hover}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>{label}</button>
            )) : [
              ["📌 Закрепить/Открепить", () => togglePin(contextMenu.id)],
              ["🔇 Заглушить/Включить", () => toggleMute(contextMenu.id)],
              ["🗑️ Очистить историю", () => clearHistory(contextMenu.id)],
              ["🚫 Удалить чат", () => { setContacts(prev => prev.filter(c => c.id !== contextMenu.id)); if (activeChat === contextMenu.id) setActiveChat(null); setContextMenu(null); }],
            ].map(([label, fn]) => (
              <button key={label} onClick={fn} style={{ display: "block", width: "100%", background: "none", border: "none", cursor: "pointer", padding: "11px 16px", textAlign: "left", color: label.includes("Удалить") ? "#f44336" : colors.text, fontSize: 14, transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = colors.hover}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>{label}</button>
            ))}
          </div>
        )}

        {/* FORWARD MODAL */}
        {showForwardModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowForwardModal(false)}>
            <div style={{ background: colors.surface, borderRadius: 20, padding: 24, minWidth: 320, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Переслать сообщение</div>
              {contacts.map(c => (
                <div key={c.id} onClick={() => {
                  const fwd = { ...forwardMsg, id: Date.now(), from: "me", forwarded: true, time: formatTime(new Date()), reactions: {}, replyTo: null };
                  setMessages(prev => ({ ...prev, [c.id]: [...(prev[c.id] || []), fwd] }));
                  setShowForwardModal(false); showNotif(`Переслано в ${c.name}`);
                }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", cursor: "pointer", borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>{c.avatar}</div>
                  <span style={{ fontSize: 15 }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE MODAL */}
        {showProfile && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowProfile(false)}>
            <div style={{ background: colors.surface, borderRadius: 24, padding: 32, minWidth: 320, textAlign: "center" }} onClick={e => e.stopPropagation()}>
              <div style={{ width: 90, height: 90, borderRadius: "50%", background: activeContact?.color || colors.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700, color: "#fff", margin: "0 auto 16px" }}>{activeContact?.avatar || "👤"}</div>
              <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 4 }}>{activeContact?.name || "Ваш профиль"}</div>
              <div style={{ fontSize: 14, color: activeContact?.status === "online" ? colors.online : colors.subtext, marginBottom: 20 }}>{activeContact?.lastSeen || "онлайн"}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                {[["📞","Звонок"],["✉️","Сообщение"],["🔔","Уведомления"],["⋮","Ещё"]].map(([icon, label]) => (
                  <button key={label} onClick={() => { showNotif(label); setShowProfile(false); }} style={{ background: colors.input, border: "none", borderRadius: 12, padding: "10px 14px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: colors.text, fontSize: 11 }}>
                    <span style={{ fontSize: 22 }}>{icon}</span>{label}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowProfile(false)} style={{ marginTop: 20, background: "none", border: "none", cursor: "pointer", color: colors.subtext, fontSize: 14 }}>Закрыть</button>
            </div>
          </div>
        )}

        {/* SETTINGS MODAL */}
        {showSettings && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowSettings(false)}>
            <div style={{ background: colors.surface, borderRadius: 24, padding: 24, minWidth: 320, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 20 }}>⚙️ Настройки</div>
              {[
                ["🌙 Тема", isDark ? "Тёмная" : "Светлая", () => setTheme(t => t === "dark" ? "light" : "dark")],
                ["🔔 Уведомления", "Включены", () => showNotif("Настройки уведомлений")],
                ["🔒 Конфиденциальность", "", () => showNotif("Настройки приватности")],
                ["💾 Данные и хранилище", "", () => showNotif("Хранилище")],
                ["🎨 Оформление", "", () => showNotif("Оформление чата")],
                ["ℹ️ О приложении", "v1.0.0", () => showNotif("Messenger v1.0.0 — Built with React")],
              ].map(([label, val, fn]) => (
                <div key={label} onClick={fn} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${colors.border}`, cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  <span style={{ fontSize: 15, color: colors.text }}>{label}</span>
                  <span style={{ fontSize: 13, color: colors.subtext }}>{val} ›</span>
                </div>
              ))}
              <button onClick={() => setShowSettings(false)} style={{ marginTop: 16, width: "100%", background: colors.accent, border: "none", borderRadius: 12, padding: "12px", cursor: "pointer", color: "#fff", fontSize: 15, fontWeight: 600 }}>Закрыть</button>
            </div>
          </div>
        )}

        {/* NOTIFICATION TOAST */}
        {notification && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: isDark ? "#2a2a3a" : "#333", color: "#fff", padding: "10px 20px", borderRadius: 20, fontSize: 14, fontWeight: 500, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.3)", animation: "fadeIn 0.3s ease", whiteSpace: "nowrap" }}>
            {notification}
          </div>
        )}

        {/* Click outside to close menus */}
        {(contextMenu || reactionPicker) && (
          <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={() => { setContextMenu(null); setReactionPicker(null); }} />
        )}
      </div>
    </>
  );
}
