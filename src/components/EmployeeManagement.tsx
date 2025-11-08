import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Eye, Edit2, Trash2, X, Users, UserCog, Stethoscope, Sparkles, CheckCircle, Mail } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

// In a real app, these would be in separate files
import apiUrl from '../config/api';

// --- Reusable Components ---

const Modal = ({ children, onClose, width = "max-w-2xl" }) => (
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

// --- Main Employee Management Module ---

export default function EmployeeManagement() {
    const { theme } = useTheme();
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modal, setModal] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showWelcomeEmail, setShowWelcomeEmail] = useState(null);
    const [passwordChange, setPasswordChange] = useState(null);
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    
    const [newEmployee, setNewEmployee] = useState({
        employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: '', lastName: '', email: '', password: '', phone: '', departmentId: '', position: '', role: 'staff', hireDate: '', salary: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [employeesRes, departmentsRes] = await Promise.all([
                    fetch(apiUrl('/api/employees')),
                    fetch(apiUrl('/api/employees/departments'))
                ]);
                setEmployees(await employeesRes.json() || []);
                setDepartments(await departmentsRes.json() || []);
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            }
        };
        fetchData();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch(apiUrl('/api/employees'));
            setEmployees(await response.json() || []);
        } catch (error) { console.error('Failed to fetch employees:', error); }
    };

    const handleInputChange = (e, formType) => {
        const { name, value } = e.target;
        if (formType === 'new') {
            setNewEmployee(prevState => ({ ...prevState, [name]: value }));
        } else if (selectedEmployee) {
            setSelectedEmployee(prevState => (prevState ? { ...prevState, [name]: value } : null));
        }
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        if (!newEmployee.password) {
            alert("Password is required for new employees.");
            return;
        }
        try {
            const response = await fetch(apiUrl('/api/employees/add'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEmployee),
            });
            const data = await response.json();
            if (data.success) {
                setModal(null);
                fetchEmployees();
                setShowWelcomeEmail(newEmployee); // Trigger Gemini Welcome Email modal
            } else { alert(data.message); }
        } catch (error) { alert('Failed to connect to the server.'); }
    };

    const handleUpdateEmployee = async (e) => {
        e.preventDefault();
        if (!selectedEmployee) return;
        try {
            const response = await fetch(apiUrl(`/api/employees/${selectedEmployee.id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedEmployee),
            });
            const data = await response.json();
            if (data.success) {
                setModal(null);
                fetchEmployees();
            } else { alert(data.message); }
        } catch (error) { alert('Failed to connect to server.'); }
    };

    const handleDeleteEmployee = async (employeeId) => {
        try {
            const response = await fetch(apiUrl(`/api/employees/${employeeId}`), { method: 'DELETE' });
            if ((await response.json()).success) {
                fetchEmployees();
            }
        } catch (error) { alert('Failed to connect to server.'); }
        setShowDeleteConfirm(null);
    };

    const handlePasswordDataChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prevState => ({ ...prevState, [name]: value }));
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("New passwords do not match.");
            return;
        }
        if (!selectedEmployee) return;

        try {
            const response = await fetch(apiUrl(`/api/employees/change-password/${selectedEmployee.id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordData),
            });
            const data = await response.json();
            if (data.success) {
                setModal(null);
                fetchEmployees();
                alert('Password updated successfully!');
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Failed to connect to the server.');
        }
    };

    const handleResetPassword = async (newPassword) => {
        if (!selectedEmployee) return;

        try {
            const response = await fetch(apiUrl(`/api/employees/reset-password/${selectedEmployee.id}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword }),
            });
            const data = await response.json();
            if (data.success) {
                setModal(null);
                alert('Password has been reset successfully!');
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Failed to connect to the server.');
        }
    };
    
    const handleGenerateEmail = async (employee) => {
        setIsGenerating(true);
        setGeneratedEmail('');
        const deptName = departments.find(d => d.id == employee.departmentId)?.name || 'their new';
        const systemPrompt = "You are an HR Manager for 'Shree Medicare Hospital'. Your tone is professional, welcoming, and informative.";
        const userQuery = `Draft a welcome/onboarding email for a new employee named ${employee.firstName} ${employee.lastName} who is joining as a ${employee.position} in the ${deptName} department. Their start date is ${new Date(employee.hireDate).toLocaleDateString()}. Include some brief welcome text, a note about what to expect on their first day (like meeting the team), and who their point of contact is.`;

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
            setGeneratedEmail(text || "Could not generate email draft.");
        } catch (error) {
            console.error("Gemini API error:", error);
            setGeneratedEmail("Error connecting to AI service.");
        } finally {
            setIsGenerating(false);
        }
    };


    const openModal = (type, employee = null) => {
        setModal(type);
        if (employee) setSelectedEmployee(JSON.parse(JSON.stringify(employee)));
        if (type === 'add') {
            setNewEmployee({
                employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
                firstName: '', lastName: '', email: '', password: '', phone: '', departmentId: '', position: '', role: 'staff', hireDate: '', salary: '',
            });
        }
    };

    const filteredEmployees = useMemo(() => employees.filter(e =>
        `${e.firstName} ${e.lastName} ${e.employeeId}`.toLowerCase().includes(searchTerm.toLowerCase())
    ), [employees, searchTerm]);
    
    const getStatusPill = (status) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-300';
            case 'inactive': return 'bg-red-500/20 text-red-300';
            case 'on_leave': return 'bg-yellow-500/20 text-yellow-300';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    return (
        <div className={`p-8 font-sans min-h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>

            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                 <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">Employee Management</h1>
                        <p className="text-gray-400 mt-2">Manage all staff members and their roles.</p>
                    </div>
                    <button onClick={() => openModal('add')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
                        <Plus size={20} />
                        <span>Add Employee</span>
                    </button>
                </div>
            </motion.div>
            
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={itemVariants}><StatCard title="Total Staff" value={employees.length} icon={Users} color="text-blue-400"/></motion.div>
                <motion.div variants={itemVariants}><StatCard title="Doctors" value={employees.filter(e => e.role === 'doctor').length} icon={Stethoscope} color="text-green-400"/></motion.div>
                <motion.div variants={itemVariants}><StatCard title="Departments" value={departments.length} icon={UserCog} color="text-cyan-400"/></motion.div>
            </motion.div>

            <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 p-6">
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input type="text" placeholder="Search by name or employee ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr className="border-b border-gray-800"><th className="p-4 text-left text-sm font-semibold text-gray-400">Name</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Department</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Role</th><th className="p-4 text-left text-sm font-semibold text-gray-400">Status</th><th className="p-4 text-right text-sm font-semibold text-gray-400">Actions</th></tr></thead>
                        <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                            {filteredEmployees.map((emp) => (
                                <motion.tr key={emp.id} variants={itemVariants} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="p-4"><div className="font-semibold">{emp.firstName} {emp.lastName}</div><div className="text-sm text-gray-400">{emp.email}</div></td>
                                    <td className="p-4 text-gray-400">{emp.departmentName}</td>
                                    <td className="p-4 capitalize text-gray-300">{emp.role}</td>
                                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusPill(emp.status)}`}>{emp.status.replace('_', ' ').toUpperCase()}</span></td>
                                    <td className="p-4"><div className="flex items-center justify-end space-x-2"><button onClick={() => openModal('details', emp)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><Eye size={18}/></button><button onClick={() => openModal('edit', emp)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><Edit2 size={18}/></button><button onClick={() => openModal('password', emp)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><UserCog size={18}/></button><button onClick={() => setShowDeleteConfirm(emp)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full"><Trash2 size={18}/></button></div></td>
                                </motion.tr>
                            ))}
                        </motion.tbody>
                    </table>
                     {filteredEmployees.length === 0 && <p className="text-center py-12 text-gray-500">No employees found.</p>}
                </div>
            </div>

            {modal && (
                <Modal onClose={() => setModal(null)} width={modal === 'details' ? 'max-w-lg' : 'max-w-2xl'}>
                    {modal === 'add' && (
                         <form onSubmit={handleAddEmployee}>
                            <h2 className="text-2xl font-bold mb-6">Add New Employee</h2>
                            <div className="grid grid-cols-2 gap-4">
                               <input name="firstName" onChange={(e) => handleInputChange(e, 'new')} placeholder="First Name" className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                               <input name="lastName" onChange={(e) => handleInputChange(e, 'new')} placeholder="Last Name" className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                               <input type="email" name="email" onChange={(e) => handleInputChange(e, 'new')} placeholder="Email" className="p-3 bg-gray-800 border-gray-700 rounded-lg col-span-2" required />
                               <input type="password" name="password" onChange={(e) => handleInputChange(e, 'new')} placeholder="Password" className="p-3 bg-gray-800 border-gray-700 rounded-lg col-span-2" required />
                               <select name="departmentId" onChange={(e) => handleInputChange(e, 'new')} className="p-3 bg-gray-800 border-gray-700 rounded-lg" required><option value="">Select Department</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
                               <input name="position" onChange={(e) => handleInputChange(e, 'new')} placeholder="Position" className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                               <input type="date" name="hireDate" onChange={(e) => handleInputChange(e, 'new')} className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                               <select name="role" value={newEmployee.role} onChange={(e) => handleInputChange(e, 'new')} className="p-3 bg-gray-800 border-gray-700 rounded-lg" required><option value="staff">Staff</option><option value="doctor">Doctor</option><option value="admin">Admin</option></select>
                               <input name="phone" onChange={(e) => handleInputChange(e, 'new')} placeholder="Phone" className="p-3 bg-gray-800 border-gray-700 rounded-lg" />
                               <input type="number" name="salary" step="0.01" onChange={(e) => handleInputChange(e, 'new')} placeholder="Salary" className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                            </div>
                            <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-800">
                               <button type="button" onClick={() => setModal(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                               <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Add Employee</button>
                           </div>
                        </form>
                    )}
                    {modal === 'edit' && selectedEmployee && (
                         <form onSubmit={handleUpdateEmployee}>
                            <h2 className="text-2xl font-bold mb-6">Edit Employee</h2>
                             <div className="grid grid-cols-2 gap-4">
                                <input name="firstName" value={selectedEmployee.firstName} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg"/>
                                <input name="lastName" value={selectedEmployee.lastName} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg"/>
                                <input name="position" value={selectedEmployee.position} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg"/>
                                <select name="status" value={selectedEmployee.status} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg">
                                    <option value="active">Active</option><option value="inactive">Inactive</option><option value="on_leave">On Leave</option>
                                </select>
                             </div>
                             <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-800">
                                <button type="button" onClick={() => setModal(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Save Changes</button>
                            </div>
                        </form>
                    )}
                    {modal === 'password' && selectedEmployee && (
                        <form onSubmit={handlePasswordChange}>
                            <h2 className="text-2xl font-bold mb-6">Change Password for {selectedEmployee.firstName}</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <input type="password" name="oldPassword" onChange={handlePasswordDataChange} placeholder="Old Password" value={passwordData.oldPassword} className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                                <input type="password" name="newPassword" onChange={handlePasswordDataChange} placeholder="New Password" value={passwordData.newPassword} className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                                <input type="password" name="confirmPassword" onChange={handlePasswordDataChange} placeholder="Confirm New Password" value={passwordData.confirmPassword} className="p-3 bg-gray-800 border-gray-700 rounded-lg" required />
                            </div>
                            <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-800">
                                <button type="button" onClick={() => setModal(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Update Password</button>
                            </div>
                        </form>
                    )}
                    {modal === 'details' && selectedEmployee && (
                         <div>
                            <div className="flex justify-between items-start">
                                 <h2 className="text-2xl font-bold mb-6">{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
                                 <button onClick={() => setModal(null)} className="-mt-2 -mr-2 p-2 rounded-full hover:bg-gray-700"><X size={20}/></button>
                            </div>
                            <div className="space-y-3 text-gray-300">
                               <p><strong>Position:</strong> {selectedEmployee.position}</p>
                               <p><strong>Department:</strong> {selectedEmployee.departmentName}</p>
                               <p><strong>Email:</strong> {selectedEmployee.email}</p>
                               <p><strong>Status:</strong> <span className="font-semibold capitalize">{selectedEmployee.status.replace('_', ' ')}</span></p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-800">
                                <button onClick={() => {
                                    const newPassword = prompt('Enter new password for the employee:');
                                    if (newPassword) {
                                        handleResetPassword(newPassword);
                                    }
                                }} className="w-full py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
                                    Reset Password
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            )}

            {showDeleteConfirm && (
                <Modal onClose={() => setShowDeleteConfirm(null)} width="max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
                    <p className="text-gray-400 mb-6">Are you sure you want to delete employee "{showDeleteConfirm.firstName} {showDeleteConfirm.lastName}"?</p>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={() => setShowDeleteConfirm(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                        <button type="button" onClick={() => handleDeleteEmployee(showDeleteConfirm.id)} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Delete</button>
                    </div>
                </Modal>
            )}

             {showWelcomeEmail && (
                <Modal onClose={() => setShowWelcomeEmail(null)} width="max-w-2xl">
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><CheckCircle className="text-green-400"/> Employee Added Successfully!</h2>
                    <p className="text-gray-400 mb-6">Use the AI assistant to generate a welcome email for {showWelcomeEmail.firstName}.</p>
                    {!generatedEmail && !isGenerating && (
                        <button onClick={() => handleGenerateEmail(showWelcomeEmail)} className="w-full py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                            <Sparkles size={20} /> Generate Onboarding Email
                        </button>
                    )}
                    {isGenerating && <p className="text-center text-gray-400 animate-pulse py-10">AI is drafting an email...</p>}
                    {generatedEmail && (
                        <div className="space-y-4">
                            <textarea value={generatedEmail} onChange={(e) => setGeneratedEmail(e.target.value)} className="w-full p-4 bg-gray-800 border-gray-700 rounded-lg text-gray-300 h-72 resize-none"/>
                            <div className="flex justify-end gap-4">
                                <button onClick={() => navigator.clipboard.writeText(generatedEmail)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Copy Text</button>
                                <button onClick={() => setShowWelcomeEmail(null)} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Done</button>
                            </div>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
}
