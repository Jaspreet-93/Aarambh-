import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import { Sun, Moon, IndianRupee, FileText, Download, Calendar, Award } from 'lucide-react';
import { exportToPDF } from '../utils/exportUtils';

const StudentDashboard = () => {
  const { loggedInUser, theme, setTheme, fees, assignments, submissions, library, recordFeePayment } = useContext(AppContext);
  
  if (!loggedInUser) return null;

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const monthsOrder = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const myFeesList = fees.filter(f => f.studentId === loggedInUser.id);
  const sortedFees = [...myFeesList].sort((a, b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));

  const totalAssigned = myFeesList.reduce((sum, f) => sum + f.total, 0);
  const totalPaid = myFeesList.reduce((sum, f) => sum + f.paid, 0);
  const totalPending = totalAssigned - totalPaid;

  const mySubmissions = submissions.filter(s => s.studentId === loggedInUser.id);
  const myAssignments = assignments.filter(a => a.subject === loggedInUser.class);
  const myLibrary = library.filter(l => l.subject === loggedInUser.class);
  
  const handleDownloadReport = () => {
    const rows = myAssignments.map(a => {
      const sub = mySubmissions.find(s => s.assignmentId === a.id);
      return [a.title, a.subject, sub?.grade || 'Not Graded'];
    });
    exportToPDF('My Report Card', 'report_card', rows, ['Assignment', 'Subject', 'Grade']);
  };

  const handleDownloadReceipt = (fee) => {
    const rows = [
      ['Student Name', loggedInUser.name],
      ['Admission No.', loggedInUser.admission_number || 'N/A'],
      ['Class/Batch', loggedInUser.class],
      ['Month Paid', fee.month],
      ['Total Fee', `Rs. ${fee.total}`],
      ['Amount Paid', `Rs. ${fee.paid}`],
      ['Payment Mode', fee.paymentMode || 'Online Mock Gateway'],
      ['Payment Date', fee.paymentDate || new Date().toLocaleDateString()]
    ];
    exportToPDF(`Fee_Receipt_${fee.month}_${loggedInUser.name}`, `Fee Payment Receipt`, rows, ['Receipt Item', 'Details']);
  };

  const handleMockPay = async (fee) => {
    const amount = fee.total - fee.paid;
    // Simulate a secure payment loading state
    const confirmPay = window.confirm(`Simulate payment of Rs. ${amount} for the month of ${fee.month}?`);
    if (confirmPay) {
      await recordFeePayment(loggedInUser.id, amount, 'Online Mock Gateway', new Date().toLocaleDateString(), fee.month);
      alert(`Payment of Rs. ${amount} for ${fee.month} received successfully!`);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <header className="flex-between" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Welcome, {loggedInUser.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{loggedInUser.class} Portal</p>
          </div>
          <div className="flex-center gap-3">
            <div onClick={toggleTheme} style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', background: 'var(--secondary)' }}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
          
          <div className="prof-card">
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }} className="flex-center gap-1">
                <IndianRupee size={18} /> My Monthly Fees & Receipts (Jan to Dec)
              </h2>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Total Assigned:</span> <strong>Rs. {totalAssigned}</strong></div>
                <div><span style={{ color: 'var(--success)' }}>Total Paid:</span> <strong>Rs. {totalPaid}</strong></div>
                <div><span style={{ color: 'var(--danger)' }}>Total Pending:</span> <strong>Rs. {totalPending}</strong></div>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="prof-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Due Date</th>
                    <th>Total Fee</th>
                    <th>Paid</th>
                    <th>Status</th>
                    <th>Payment Details</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFees.map(fee => (
                    <tr key={fee.id}>
                      <td style={{ fontWeight: 600 }}>{fee.month}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{fee.dueDate}</td>
                      <td>Rs. {fee.total}</td>
                      <td>Rs. {fee.paid}</td>
                      <td>
                        <span className={`badge badge-${fee.status === 'Paid' ? 'success' : 'danger'}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {fee.paymentMode ? `${fee.paymentMode} (${fee.paymentDate})` : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {fee.status !== 'Paid' ? (
                          <button onClick={() => handleMockPay(fee)} className="prof-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
                            Pay Month
                          </button>
                        ) : (
                          <button onClick={() => handleDownloadReceipt(fee)} className="prof-btn prof-btn-secondary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>
                            Receipt PDF
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {sortedFees.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No monthly fees mapped.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          
          {/* Read-Only Academic Tests & Grades */}
          <div className="prof-card">
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }} className="flex-center gap-1">
                <Award size={18} /> My Tests & Academic Grades
              </h2>
              <button onClick={handleDownloadReport} className="prof-btn prof-btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}>
                <Download size={12} style={{ marginRight: '4px' }}/> Report PDF
              </button>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', marginTop: 0 }}>
              * Official grades and test scores are updated by the admin and teachers. (Read-only view)
            </p>

            <table className="prof-table">
              <thead>
                <tr>
                  <th>Test / Exam Name</th>
                  <th>Date</th>
                  <th>Marks</th>
                  <th style={{ textAlign: 'right' }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 500 }}>Algebra Unit Test</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>June 10, 2026</td>
                  <td>45 / 50</td>
                  <td style={{ textAlign: 'right' }}><span className="badge badge-success">A</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 500 }}>Newtonian Mechanics Exam</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>June 18, 2026</td>
                  <td>92 / 100</td>
                  <td style={{ textAlign: 'right' }}><span className="badge badge-success">A+</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 500 }}>English Literature Quiz</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>June 22, 2026</td>
                  <td>80 / 100</td>
                  <td style={{ textAlign: 'right' }}><span className="badge badge-warning">B</span></td>
                </tr>
                {myAssignments.slice(0, 3).map(a => {
                  const sub = mySubmissions.find(s => s.assignmentId === a.id);
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500 }}>{a.title}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{a.dueDate}</td>
                      <td>—</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="badge badge-success">{sub?.grade || 'Graded'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Read-Only Attendance History */}
          <div className="prof-card">
            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }} className="flex-center gap-1">
                <Calendar size={18} /> My Attendance Logs
              </h2>
              <span className="badge badge-success" style={{ padding: '0.3rem 0.6rem' }}>96.2% Present</span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', marginTop: 0 }}>
              * Daily attendance logs marked by your class teachers. (Read-only view)
            </p>

            <table className="prof-table">
              <thead>
                <tr>
                  <th>Session Date</th>
                  <th>Day</th>
                  <th style={{ textAlign: 'right' }}>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>June 28, 2026</td>
                  <td>Sunday (Holiday)</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontStyle: 'italic' }}>Closed</td>
                </tr>
                <tr>
                  <td>June 27, 2026</td>
                  <td>Saturday</td>
                  <td style={{ textAlign: 'right' }}><span className="badge badge-success">Present</span></td>
                </tr>
                <tr>
                  <td>June 26, 2026</td>
                  <td>Friday</td>
                  <td style={{ textAlign: 'right' }}><span className="badge badge-success">Present</span></td>
                </tr>
                <tr>
                  <td>June 25, 2026</td>
                  <td>Thursday</td>
                  <td style={{ textAlign: 'right' }}><span className="badge badge-success">Present</span></td>
                </tr>
                <tr>
                  <td>June 24, 2026</td>
                  <td>Wednesday</td>
                  <td style={{ textAlign: 'right' }}><span className="badge badge-danger" style={{ background: 'var(--danger)', color: 'white' }}>Absent</span></td>
                </tr>
                <tr>
                  <td>June 23, 2026</td>
                  <td>Tuesday</td>
                  <td style={{ textAlign: 'right' }}><span className="badge badge-success">Present</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Study Materials */}
          <div className="prof-card" style={{ gridColumn: 'span 2' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, marginBottom: '1.5rem' }}>Study Materials & E-Books</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {myLibrary.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No study materials uploaded for your batch yet.</p>
              )}
              {myLibrary.map(item => (
                <a href={item.link} key={item.id} className="flex-between" style={{ textDecoration: 'none', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-main)' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>{item.title}</span>
                  <span className="badge badge-warning">{item.type}</span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
