import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Search } from 'lucide-react';

const Messages = () => {
  const { messages, students, classes, sendMessage } = useContext(AppContext);
  
  const [recipientInput, setRecipientInput] = useState('');
  const [selectedTarget, setSelectedTarget] = useState(null); // { type: 'student'|'batch'|'manual', name: '...', target: '...' }
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('SMS');

  // Filter suggestions based on input
  const cleanInput = recipientInput.trim().toLowerCase();
  const studentSuggestions = cleanInput === '' ? [] : students.filter(s => s.name.toLowerCase().includes(cleanInput));
  const batchSuggestions = cleanInput === '' ? [] : classes.filter(c => c.name.toLowerCase().includes(cleanInput));
  const hasSuggestions = studentSuggestions.length > 0 || batchSuggestions.length > 0;

  const handleSelectStudent = (student) => {
    setSelectedTarget({
      type: 'student',
      name: student.name,
      target: student.parentPhone
    });
    setRecipientInput(`${student.name} (${student.parentPhone})`);
    setShowSuggestions(false);
  };

  const handleSelectBatch = (cls) => {
    setSelectedTarget({
      type: 'batch',
      name: cls.name,
      target: cls.name
    });
    setRecipientInput(`Batch: ${cls.name}`);
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setRecipientInput(val);
    setSelectedTarget(null); // Reset selected target if they edit the input
    setShowSuggestions(true);
  };

  const handleManualSend = (e) => {
    e.preventDefault();
    if (!recipientInput.trim() || !content) return;

    let target = selectedTarget;
    
    // If they typed a raw number without clicking suggestions
    if (!target) {
      const cleanPhone = recipientInput.replace(/\D/g, '');
      if (cleanPhone.length >= 10) {
        target = {
          type: 'manual',
          name: 'Manual Number',
          target: cleanPhone
        };
      } else {
        alert('Please select a student/batch from suggestions or type a valid 10-digit phone number.');
        return;
      }
    }

    // Dispatch message
    if (target.type === 'student' || target.type === 'manual') {
      if (target.target) {
        sendMessage(target.target, channel, content);
      }
    } else if (target.type === 'batch') {
      const batchStudents = students.filter(s => s.class === target.target);
      if (batchStudents.length === 0) {
        alert('No students found in this batch.');
        return;
      }
      batchStudents.forEach(student => {
        if (student.parentPhone) {
          sendMessage(student.parentPhone, channel, content);
        }
      });
    }

    // Reset fields
    setRecipientInput('');
    setSelectedTarget(null);
    setContent('');
  };

  return (
    <>
      <Sidebar />
      <main className="main-content">
        <Header />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          <div className="prof-card">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', marginTop: 0 }}>Compose Message</h2>
            <form onSubmit={handleManualSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ position: 'relative' }}>
                <label className="prof-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Recipient</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Type student name, batch name, or phone number..." 
                    value={recipientInput}
                    onChange={handleInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    required
                    className="prof-input"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && recipientInput && hasSuggestions && (
                  <div className="prof-card" style={{
                    position: 'absolute',
                    top: '105%',
                    left: 0,
                    right: 0,
                    maxHeight: '250px',
                    overflowY: 'auto',
                    zIndex: 100,
                    background: 'var(--bg-card)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-glass)',
                    borderRadius: '12px',
                    padding: '0.5rem'
                  }}>
                    {batchSuggestions.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.4rem 0.6rem' }}>Batches</div>
                        {batchSuggestions.map(cls => (
                          <div 
                            key={cls.id} 
                            className="search-item" 
                            style={{ padding: '0.5rem 0.6rem', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem' }}
                            onClick={() => handleSelectBatch(cls)}
                          >
                            <strong>Batch: {cls.name}</strong>
                          </div>
                        ))}
                      </div>
                    )}

                    {studentSuggestions.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.4rem 0.6rem' }}>Students</div>
                        {studentSuggestions.map(s => (
                          <div 
                            key={s.id} 
                            className="search-item" 
                            style={{ padding: '0.5rem 0.6rem', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}
                            onClick={() => handleSelectStudent(s)}
                          >
                            <strong>{s.name}</strong>
                            <span style={{ color: 'var(--text-muted)' }}>{s.parentPhone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="prof-label">Messaging Service</label>
                <select 
                  value={channel} 
                  onChange={e => setChannel(e.target.value)}
                  className="prof-input"
                  required
                >
                  <option value="SMS">Cellular SMS (Twilio/TextBelt)</option>
                  <option value="Auto-WhatsApp">Auto-WhatsApp Robot</option>
                </select>
              </div>

              <div>
                <label className="prof-label">Message Content</label>
                <textarea 
                  placeholder="Type your message here..." 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows="5"
                  className="prof-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="prof-btn" style={{ alignSelf: 'flex-start' }}>Send Message</button>
            </form>
          </div>

          <div className="prof-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '600px' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', marginTop: 0 }}>Message Logs</h2>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
              {messages.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No messages sent yet.</p>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} style={{ 
                    padding: '1rem', background: 'var(--bg-main)', 
                    border: '1px solid var(--border-color)', borderRadius: '8px',
                    borderLeft: '4px solid var(--primary)'
                  }}>
                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>To: {msg.recipient}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{msg.date}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>{msg.content}</p>
                    
                    <div className="flex-between" style={{ marginTop: '0.8rem' }}>
                      <div style={{ fontSize: '0.8rem', color: msg.status === 'Failed' ? 'var(--danger)' : 'var(--success)', fontWeight: 500 }}>
                        Status: {msg.status}
                        {msg.previewUrl && (
                          <a href={msg.previewUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '10px', color: 'var(--primary)', textDecoration: 'underline' }}>
                            View Delivered Message
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Messages;
