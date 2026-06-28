import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Messages = () => {
  const { messages, students, classes, sendMessage } = useContext(AppContext);
  
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [content, setContent] = useState('');
  const [channel, setChannel] = useState('SMS');

  // Filter students based on selected batch
  const displayStudents = selectedBatch 
    ? students.filter(s => s.class === selectedBatch)
    : students;

  const handleBatchChange = (e) => {
    const batchName = e.target.value;
    setSelectedBatch(batchName);
    setSelectedStudentId('');
    setPhoneInput(''); // Reset phone when batch changes
  };

  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudentId(studentId);
    
    if (studentId) {
      const student = students.find(s => s.id === parseInt(studentId));
      if (student && student.parentPhone) {
        setPhoneInput(student.parentPhone);
      } else {
        setPhoneInput('');
      }
    } else {
      setPhoneInput('');
    }
  };

  const handleManualSend = (e) => {
    e.preventDefault();
    if (!content) return;

    // Determine targets
    if (selectedStudentId) {
      // Individual student selected: send to whatever is in the phone input box (allows manual override)
      if (!phoneInput.trim()) {
        alert('Please enter a phone number.');
        return;
      }
      sendMessage(phoneInput, channel, content);
    } else if (selectedBatch && !selectedStudentId) {
      // Batch selected but no specific student: send to all students in that batch
      const batchStudents = students.filter(s => s.class === selectedBatch);
      if (batchStudents.length === 0) {
        alert('No students found in this batch.');
        return;
      }
      batchStudents.forEach(student => {
        if (student.parentPhone) {
          sendMessage(student.parentPhone, channel, content);
        }
      });
    } else {
      // No batch, no student: send to whatever manual phone number they typed in
      if (!phoneInput.trim()) {
        alert('Please enter a phone number.');
        return;
      }
      sendMessage(phoneInput, channel, content);
    }

    // Reset fields
    setSelectedBatch('');
    setSelectedStudentId('');
    setPhoneInput('');
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
            <form onSubmit={handleManualSend} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              <div>
                <label className="prof-label" style={{ marginBottom: '0.4rem', display: 'block' }}>1. Select Batch (Optional)</label>
                <select 
                  value={selectedBatch} 
                  onChange={handleBatchChange}
                  className="prof-input"
                >
                  <option value="">-- All Batches (or type manual number) --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.grade})</option>
                  ))}
                </select>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                  Leave student blank if you want to message the entire batch.
                </small>
              </div>

              <div>
                <label className="prof-label" style={{ marginBottom: '0.4rem', display: 'block' }}>2. Select Student (Optional)</label>
                <select 
                  value={selectedStudentId} 
                  onChange={handleStudentChange}
                  className="prof-input"
                >
                  <option value="">-- Select Student (or send to whole batch) --</option>
                  {displayStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.class || 'No Class'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="prof-label" style={{ marginBottom: '0.4rem', display: 'block' }}>3. Phone Number</label>
                <input 
                  type="text" 
                  placeholder="Parent phone number (fetched automatically, or type here)" 
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  className="prof-input"
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                  You can edit or type a manual phone number here directly.
                </small>
              </div>

              <div>
                <label className="prof-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Messaging Service</label>
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
                <label className="prof-label" style={{ marginBottom: '0.4rem', display: 'block' }}>Message Content</label>
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

          <div className="prof-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '650px' }}>
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
