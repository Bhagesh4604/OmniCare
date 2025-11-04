import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Activity, TestTube, Thermometer, CheckCircle, Clock, X, Sparkles, Search } from 'lucide-react';

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

// --- Main Laboratory Module ---

export default function LaboratoryModule() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('tests');
  const [labTests, setLabTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(null);
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(null);
  const [resultText, setResultText] = useState('');

  const [newTest, setNewTest] = useState({
      testNumber: `LAB${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: '',
      testName: '',
      testDate: '',
  });

  useEffect(() => {
    if (activeTab === 'tests') {
        fetchLabTests();
        fetchPatients();
    }
  }, [activeTab]);

  const fetchLabTests = async () => {
    try {
      const response = await fetch(apiUrl('/api/laboratory/tests'));
      setLabTests(await response.json() || []);
    } catch (error) { console.error('Failed to fetch lab tests:', error); }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch(apiUrl('/api/patients'));
      setPatients(await response.json() || []);
    } catch (error) { console.error('Failed to fetch patients:', error); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTest(prevState => ({ ...prevState, [name]: value }));
  };

  const handleAddTest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(apiUrl('/api/laboratory/tests/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest),
      });
      const data = await response.json();
      if (data.success) {
        setShowAddModal(false);
        fetchLabTests();
      } else {
        alert(data.message);
      }
    } catch (error) { alert('Failed to connect to server.'); }
  };

  const handleUpdateStatus = async (test, newStatus) => {
      if (newStatus === 'completed') {
          setShowResultModal(test);
          setResultText(test.result_text || '');
      } else {
          try {
              const response = await fetch(apiUrl(`/api/laboratory/tests/${test.id}`), {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: newStatus }),
              });
              const data = await response.json();
              if (data.success) {
                  fetchLabTests();
              } else {
                  alert(data.message);
              }
          } catch (error) { alert('Failed to connect to server.'); }
      }
  };

  const handleSaveResult = async () => {
      if (!showResultModal) return;
      try {
          const response = await fetch(apiUrl(`/api/laboratory/tests/${showResultModal.id}`), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'completed', result_text: resultText }),
          });
          const data = await response.json();
          if (data.success) {
              setShowResultModal(null);
              fetchLabTests();
          } else {
              alert(data.message);
          }
      } catch (error) { alert('Failed to connect to server.'); }
  };

  const handleDeleteTest = async (testId) => {
      try {
          const response = await fetch(apiUrl(`/api/laboratory/tests/${testId}`), { method: 'DELETE' });
          const data = await response.json();
          if (data.success) {
              fetchLabTests();
          } else {
              alert(data.message);
          }
      } catch (error) { alert('Failed to connect to server.'); }
      setShowDeleteConfirm(null);
  };

  const handleGenerateSummary = async (test) => {
      setIsGenerating(true);
      setGeneratedSummary('');
      const systemPrompt = "You are a helpful medical assistant. Explain what a lab test is for in simple, clear, and reassuring terms for a patient. Avoid technical jargon. Keep the summary to 2-3 sentences.";
      const userQuery = `Explain what a "${test.testName}" test is used for.`;
      
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
          if (!response.ok) throw new Error(`API error: ${response.status}`);
          const result = await response.json();
          const text = result.reply;
          setGeneratedSummary(text || "Could not generate summary.");
      } catch (error) {
          console.error("Gemini API error:", error);
          setGeneratedSummary("Error connecting to AI service.");
      } finally {
          setIsGenerating(false);
      }
  };

  const getStatusPill = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
  const tabs = ['tests', 'results', 'vitals', 'equipment'];

  return (
    <div className={`p-8 font-sans min-h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Laboratory</h1>
            <p className="text-gray-400 mt-2">Manage lab tests, results, and equipment.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
            <Plus size={20} />
            <span>New Test</span>
          </button>
        </div>
      </motion.div>
      
      <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}><StatCard title="Total Tests" value={labTests.length} icon={TestTube} color="text-blue-400"/></motion.div>
          <motion.div variants={itemVariants}><StatCard title="Pending" value={labTests.filter(t => t.status === 'pending').length} icon={Clock} color="text-yellow-400"/></motion.div>
          <motion.div variants={itemVariants}><StatCard title="Completed" value={labTests.filter(t => t.status === 'completed').length} icon={CheckCircle} color="text-green-400"/></motion.div>
          <motion.div variants={itemVariants}><StatCard title="Equipment Active" value="28" icon={Thermometer} color="text-orange-400"/></motion.div>
      </motion.div>

      <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800">
        <div className="p-2 border-b border-gray-800">
            <div className="flex space-x-2 relative">
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2.5 rounded-lg font-semibold transition-colors z-10 ${activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
                <motion.div layoutId="activeLabTab" className="absolute h-full w-1/4 bg-blue-600 rounded-lg" transition={{ type: 'spring', stiffness: 300, damping: 25 }} animate={{ x: `${tabs.indexOf(activeTab) * 100}%` }} />
            </div>
        </div>
        <div className="p-6">
            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {activeTab === 'tests' && (
                     <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead><tr className="border-b border-gray-800"><th className="p-4 text-left text-sm font-semibold text-gray-400">Test #</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Patient</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Test Name</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Date</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Status</th><th className="p-4 text-right text-sm font-semibold text-gray-400">Actions</th></tr></thead>
                           <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                               {labTests.map(test => (
                                   <motion.tr key={test.id} variants={itemVariants} className="border-b border-gray-800 hover:bg-gray-800/50">
                                       <td className="p-4"><span className="font-semibold text-violet-400">{test.testNumber}</span></td>
                                       <td className="p-4 font-medium">{test.patientName || '—'}</td>
                                       <td className="p-4 font-medium">{test.testName}</td>
                                       <td className="p-4 text-sm text-gray-400">{new Date(test.testDate).toLocaleDateString()}</td>
                                       <td className="p-4">
                                           <select value={test.status} onChange={(e) => handleUpdateStatus(test, e.target.value)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border-none outline-none appearance-none transition-colors ${getStatusPill(test.status)} bg-opacity-100`}>
                                               <option value="pending" className="bg-gray-800 text-white">Pending</option>
                                               <option value="completed" className="bg-gray-800 text-white">Completed</option>
                                           </select>
                                       </td>
                                       <td className="p-4">
                                           <div className="flex items-center justify-end space-x-2">
                                               <button onClick={() => {setShowSummaryModal(test); setGeneratedSummary('');}} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" title="Explain with AI"><Sparkles size={18}/></button>
                                               <button onClick={() => setShowDeleteConfirm(test)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full"><Trash2 size={18}/></button>
                                           </div>
                                       </td>
                                   </motion.tr>
                               ))}
                           </motion.tbody>
                        </table>
                        {labTests.length === 0 && <p className="text-center py-12 text-gray-500">No lab tests found.</p>}
                     </div>
                  )}
                  {activeTab !== 'tests' && (<div className="text-center py-20"><Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" /><p className="text-gray-500">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} section is under construction.</p></div>)}
                </motion.div>
            </AnimatePresence>
        </div>
      </div>

       {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddTest}>
            <h2 className="text-2xl font-bold mb-6">Schedule New Lab Test</h2>
            <div className="grid grid-cols-2 gap-4">
                <input name="testNumber" value={newTest.testNumber} className="p-3 bg-gray-800 border-gray-700 rounded-lg" disabled />
                <select name="patientId" onChange={handleInputChange} className="p-3 bg-gray-800 border-gray-700 rounded-lg" required>
                    <option value="">Select Patient</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                </select>
                <input name="testName" onChange={handleInputChange} placeholder="Test Name" className="col-span-2 p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                <input type="date" name="testDate" onChange={handleInputChange} className="col-span-2 p-3 bg-gray-800 border-gray-700 rounded-lg" required />
            </div>
            <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Add Test</button>
            </div>
          </form>
        </Modal>
      )}

      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(null)} width="max-w-md">
            <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
            <p className="text-gray-400 mb-6">Are you sure you want to delete test "{showDeleteConfirm.testName}" for "{showDeleteConfirm.patientName}"?</p>
            <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setShowDeleteConfirm(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                <button type="button" onClick={() => handleDeleteTest(showDeleteConfirm.id)} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Delete</button>
            </div>
        </Modal>
      )}

      {showSummaryModal && (
        <Modal onClose={() => setShowSummaryModal(null)} width="max-w-xl">
             <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">✨ AI Test Explainer</h2>
             <p className="text-gray-400 mb-6">A simplified explanation of the "{showSummaryModal.testName}" test.</p>
             
             {!generatedSummary && !isGenerating && (
                <button onClick={() => handleGenerateSummary(showSummaryModal)} className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                    <Sparkles size={20} /> Generate Explanation
                </button>
             )}

            {isGenerating && <p className="text-center text-gray-400 animate-pulse py-10">AI is generating an explanation...</p>}
            
            {generatedSummary && (
                <div className="space-y-4">
                    <p className="p-4 bg-gray-800 border-gray-700 rounded-lg text-gray-300">{generatedSummary}</p>
                    <div className="flex justify-end gap-4">
                         <button onClick={() => navigator.clipboard.writeText(generatedSummary)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Copy Text</button>
                         <button onClick={() => setShowSummaryModal(null)} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Done</button>
                    </div>
                </div>
            )}
        </Modal>
      )}

      {showResultModal && (
        <Modal onClose={() => setShowResultModal(null)}>
            <h2 className="text-2xl font-bold mb-4">Enter Lab Result</h2>
            <p className="text-gray-400 mb-6">Enter the result for "{showResultModal.testName}" for patient "{showResultModal.patientName}".</p>
            <textarea
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                className="w-full p-4 bg-gray-800 border-gray-700 rounded-lg text-gray-300 h-48 resize-none"
                placeholder="Enter lab result details here..."
            />
            <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setShowResultModal(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                <button type="button" onClick={handleSaveResult} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Save Result</button>
            </div>
        </Modal>
      )}
    </div>
  );
}
