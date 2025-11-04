import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, DollarSign, Users, Clock, X, Sparkles, Mail } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

// In a real app, these would be in separate files
import apiUrl from '../config/api';

// --- Reusable Components ---

const Modal = ({ children, onClose, width = "max-w-lg" }) => (
    <AnimatePresence>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 font-sans"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                className={`bg-[#1C1C1E] rounded-2xl p-8 w-full ${width} border border-gray-700 shadow-2xl text-white`}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </motion.div>
        </motion.div>
    </AnimatePresence>
);

const StatCard = ({ title, value, icon: Icon, color }) => {
    const { theme } = useTheme();
    return (
        <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#1C1C1E] border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
    );
};

// --- Main Payroll Module ---

export default function PayrollModule() {
  const { theme } = useTheme();
  const [payrolls, setPayrolls] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showNotifyModal, setShowNotifyModal] = useState(null);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [newPayroll, setNewPayroll] = useState({ employeeId: '', payPeriodStart: '', payPeriodEnd: '' });

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const res = await fetch(apiUrl('/api/payroll'));
      const data = await res.json();
      setPayrolls(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Failed to fetch payrolls:", e); }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(apiUrl('/api/employees'));
      setEmployees(await response.json());
    } catch (error) { console.error('Failed to fetch employees:', error); }
  };
  
  const handleGenerateEmail = async (payrollRecord) => {
      setIsGenerating(true);
      setGeneratedEmail('');

      const systemPrompt = "You are an HR assistant for a hospital named 'Shree Medicare'. Your tone is professional, friendly, and concise.";
      const userQuery = `Draft an email to an employee named ${payrollRecord.firstName} ${payrollRecord.lastName} notifying them that their salary of $${Number(payrollRecord.basicSalary).toLocaleString()} for the pay period ${new Date(payrollRecord.payPeriodStart).toLocaleDateString()} to ${new Date(payrollRecord.payPeriodEnd).toLocaleDateString()} has been processed. Mention that the amount will be reflected in their bank account shortly. Keep it brief.`;
      
      try {
          const response = await fetch(apiUrl('/api/ai/ask'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  messages: [
                      { role: 'system', content: systemPrompt },
                      { role: 'user', content: userQuery }
                  ]
              }),
          });

          if (!response.ok) {
              throw new Error(`API call failed with status: ${response.status}`);
          }
          
          const result = await response.json();
          const text = result.reply;
          setGeneratedEmail(text || "Sorry, I couldn't generate an email draft at this time.");

      } catch (error) {
          console.error("Gemini API error:", error);
          setGeneratedEmail("Error: Could not connect to the AI service. Please check the server configuration.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPayroll(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPayroll = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(apiUrl('/api/payroll/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayroll),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        fetchPayrolls();
      } else {
        alert(data.message);
      }
    } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };
  
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(apiUrl(`/api/payroll/${id}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
            fetchPayrolls();
        } else {
            alert(data.message);
        }
    } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
  };

  const handleDeletePayroll = async (id) => {
    try {
        const res = await fetch(apiUrl(`/api/payroll/${id}`), { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            fetchPayrolls();
        } else {
            alert(data.message);
        }
    } catch (error) { console.error('Failed to connect to server.', error); alert('Failed to connect to server.'); }
    setShowDeleteConfirm(null);
  };

  const getStatusPill = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-300';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const totalPending = useMemo(() => 
    payrolls.filter(p => p.status === 'pending')
             .reduce((sum, p) => sum + Number(p.basicSalary), 0), 
    [payrolls]
  );

  return (
    <div className={`p-8 font-sans min-h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Payroll Management</h1>
            <p className="text-gray-400 mt-2">Manage employee salaries and payment history.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
            <Plus size={20} />
            <span>Generate Payroll</span>
          </button>
        </div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}><StatCard title="Total Payroll Records" value={payrolls.length} icon={Users} color="text-blue-400" /></motion.div>
        <motion.div variants={itemVariants}><StatCard title="Pending Payments" value={`$${totalPending.toLocaleString()}`} icon={Clock} color="text-yellow-400" /></motion.div>
        <motion.div variants={itemVariants}><StatCard title="Employees on Payroll" value={employees.length} icon={DollarSign} color="text-green-400" /></motion.div>
      </motion.div>

      <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Payroll History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Employee</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Pay Period</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Salary</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
              {payrolls.map(p => (
                <motion.tr key={p.id} variants={itemVariants} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 font-semibold">{p.firstName} {p.lastName}</td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(p.payPeriodStart).toLocaleDateString()} - {new Date(p.payPeriodEnd).toLocaleDateString()}</td>
                  <td className="p-4 font-semibold text-lg">${Number(p.basicSalary).toLocaleString()}</td>
                  <td className="p-4">
                    <select value={p.status} onChange={(e) => handleUpdateStatus(p.id, e.target.value)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border-none outline-none appearance-none transition-colors ${getStatusPill(p.status)} bg-opacity-100`}>
                      <option value="pending" className="bg-gray-800 text-white">Pending</option>
                      <option value="paid" className="bg-gray-800 text-white">Paid</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setShowNotifyModal(p); setGeneratedEmail(''); }} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" title="Notify Employee">
                        <Mail size={18} />
                      </button>
                      <button onClick={() => setShowDeleteConfirm(p)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full" title="Delete Record">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
          {payrolls.length === 0 && <p className="text-center py-12 text-gray-500">No payroll records found.</p>}
        </div>
      </div>

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddPayroll}>
            <h2 className="text-2xl font-bold mb-6 text-white">Generate New Payroll</h2>
            <div className="grid grid-cols-1 gap-4">
              <select name="employeeId" onChange={handleInputChange} className="col-span-2 p-3 bg-gray-800 border-gray-700 rounded-lg text-white" required>
                <option value="">Select Employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-400">Pay Period Start</label>
                    <input name="payPeriodStart" type="date" onChange={handleInputChange} className="w-full mt-1 p-3 bg-gray-800 border-gray-700 rounded-lg text-white" required />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-400">Pay Period End</label>
                    <input name="payPeriodEnd" type="date" onChange={handleInputChange} className="w-full mt-1 p-3 bg-gray-800 border-gray-700 rounded-lg text-white" required />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Generate</button>
            </div>
          </form>
        </Modal>
      )}

      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(null)}>
            <h2 className="text-2xl font-bold mb-4 text-white">Confirm Deletion</h2>
            <p className="text-gray-400 mb-6">Are you sure you want to delete the payroll record for "{showDeleteConfirm.firstName} {showDeleteConfirm.lastName}"? This cannot be undone.</p>
            <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setShowDeleteConfirm(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                <button type="button" onClick={() => handleDeletePayroll(showDeleteConfirm.id)} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Delete</button>
            </div>
        </Modal>
      )}
      
      {showNotifyModal && (
        <Modal onClose={() => setShowNotifyModal(null)} width="max-w-2xl">
             <h2 className="text-2xl font-bold mb-2 text-white flex items-center gap-2">✨ AI Email Assistant</h2>
             <p className="text-gray-400 mb-6">Draft a payment notification for {showNotifyModal.firstName}.</p>
             
             {!generatedEmail && !isGenerating && (
                <button onClick={() => handleGenerateEmail(showNotifyModal)} className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Sparkles size={20} /> Generate Draft Email
                </button>
             )}

            {isGenerating && <p className="text-center text-gray-400 animate-pulse py-10">Generating email draft...</p>}
            
            {generatedEmail && (
                <div className="space-y-4">
                    <textarea 
                        value={generatedEmail} 
                        onChange={(e) => setGeneratedEmail(e.target.value)}
                        className="w-full p-4 bg-gray-800 border-gray-700 rounded-lg text-gray-300 h-64 resize-none"
                    />
                    <div className="flex justify-end gap-4">
                         <button onClick={() => navigator.clipboard.writeText(generatedEmail)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Copy Text</button>
                         <button onClick={() => setShowNotifyModal(null)} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Done</button>
                    </div>
                </div>
            )}
        </Modal>
      )}
    </div>
  );
}

