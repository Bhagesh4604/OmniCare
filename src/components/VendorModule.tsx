import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Eye, Edit2, Trash2, Search, Building, User, X, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useTheme } from '../context/ThemeContext';

// In a real app, these would be in separate files
import apiUrl from '../config/api';
// interface Vendor { id: string; vendorName: string; contactPerson: string; email: string; phone: string; address: string; vendorType: string; status: string; }

const StatCard = ({ title, value, icon: Icon }) => {
    const { theme } = useTheme();
    return (
        <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-[#1C1C1E] border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
                <Icon className="w-5 h-5 text-gray-500" />
            </div>
            <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
    );
};

const Modal = ({ children, onClose }) => (
    <AnimatePresence>
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                className="bg-[#1C1C1E] rounded-2xl p-8 w-full max-w-lg border border-gray-700 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </motion.div>
        </motion.div>
    </AnimatePresence>
);

export default function VendorModule() {
  const { theme } = useTheme();
  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newVendor, setNewVendor] = useState({
      vendorName: '', contactPerson: '', email: '', phone: '', address: '', vendorType: '', status: 'active'
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
        const response = await fetch(apiUrl('/api/vendors'));
        const data = await response.json();
        setVendors(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Failed to fetch vendors:", error);
        setVendors([]);
    }
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'new') {
        setNewVendor(prev => ({ ...prev, [name]: value }));
    } else if (selectedVendor) {
        setSelectedVendor(prev => (prev ? { ...prev, [name]: value } : prev));
    }
  };

  const handleAddVendor = async (e) => {
      e.preventDefault();
      try {
          const response = await fetch(apiUrl('/api/vendors/add'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newVendor),
          });
          const data = await response.json();
          if (data.success) {
              setShowModal(null);
              fetchVendors();
          } else {
              alert(data.message); // Or use a more elegant notification system
          }
      } catch (error) {
          alert('Failed to connect to server.');
      }
  };

  const handleUpdateVendor = async (e) => {
      e.preventDefault();
      if (!selectedVendor) return;
      try {
          const response = await fetch(apiUrl(`/api/vendors/${selectedVendor.id}`), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(selectedVendor)
          });
          const data = await response.json();
          if (data.success) {
              setShowModal(null);
              fetchVendors();
          } else {
              alert(data.message);
          }
      } catch (error) { console.error('Failed to connect to server', error); alert('Failed to connect to server'); }
  };

  const handleDeleteVendor = async (vendorId) => {
    try {
        const response = await fetch(apiUrl(`/api/vendors/${vendorId}`), { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            fetchVendors();
        } else {
            alert(data.message);
        }
    } catch (error) { console.error('Failed to connect to server', error); alert('Failed to connect to server'); }
    setShowDeleteConfirm(null);
  };

  const openModal = (type, vendor = null) => {
      setShowModal(type);
      if (vendor) setSelectedVendor(JSON.parse(JSON.stringify(vendor)));
      if (type === 'add') {
          setNewVendor({ vendorName: '', contactPerson: '', email: '', phone: '', address: '', vendorType: '', status: 'active' });
      }
  };
  
  const filteredVendors = useMemo(() => 
    vendors.filter(v =>
        Object.values(v).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    ), [vendors, searchTerm]);

  const getStatusPill = (status) => {
    return status === 'active' 
      ? 'bg-green-500/20 text-green-300' 
      : 'bg-red-500/20 text-red-300';
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className={`p-8 font-sans min-h-full ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">Vendor Management</h1>
            <p className="text-gray-400 mt-2">Manage suppliers and service providers.</p>
          </div>
          <button onClick={() => openModal('add')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-full transition-colors flex items-center gap-2">
            <Plus size={20} />
            <span>Add Vendor</span>
          </button>
        </div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}><StatCard title="Total Vendors" value={vendors.length} icon={Building} /></motion.div>
        <motion.div variants={itemVariants}><StatCard title="Active Vendors" value={vendors.filter(v => v.status === 'active').length} icon={User} /></motion.div>
        <motion.div variants={itemVariants}><StatCard title="Vendor Types" value={new Set(vendors.map(v => v.vendorType)).size} icon={Package} /></motion.div>
      </motion.div>

        <div className="bg-[#1C1C1E] rounded-2xl border border-gray-800 p-6">
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by name, contact, type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-800">
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Vendor Name</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Contact</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Type</th>
                            <th className="text-left p-4 text-sm font-semibold text-gray-400">Status</th>
                            <th className="text-right p-4 text-sm font-semibold text-gray-400">Actions</th>
                        </tr>
                    </thead>
                     <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                        {filteredVendors.map((vendor) => (
                            <motion.tr key={vendor.id} variants={itemVariants} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                <td className="p-4 font-semibold">{vendor.vendorName}</td>
                                <td className="p-4 text-sm text-gray-300">
                                    <div>{vendor.contactPerson}</div>
                                    <div className="text-gray-500">{vendor.email}</div>
                                </td>
                                <td className="p-4 text-gray-400">{vendor.vendorType}</td>
                                <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusPill(vendor.status)}`}>{vendor.status.toUpperCase()}</span></td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button onClick={() => openModal('details', vendor)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><Eye size={18}/></button>
                                        <button onClick={() => openModal('edit', vendor)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"><Edit2 size={18}/></button>
                                        <button onClick={() => setShowDeleteConfirm(vendor)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full"><Trash2 size={18}/></button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </motion.tbody>
                </table>
                 {filteredVendors.length === 0 && <p className="text-center py-12 text-gray-500">No vendors found.</p>}
            </div>
        </div>

      {showModal && (
          <Modal onClose={() => setShowModal(null)}>
                {showModal === 'add' && (
                    <form onSubmit={handleAddVendor}>
                        <h2 className="text-2xl font-bold mb-6 text-white">Add New Vendor</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <input name="vendorName" onChange={(e) => handleInputChange(e, 'new')} placeholder="Vendor Name" className="col-span-2 p-3 bg-gray-800 border-gray-700 rounded-lg text-white" required />
                            <input name="contactPerson" onChange={(e) => handleInputChange(e, 'new')} placeholder="Contact Person" className="p-3 bg-gray-800 border-gray-700 rounded-lg text-white" />
                            <input type="email" name="email" onChange={(e) => handleInputChange(e, 'new')} placeholder="Email" className="p-3 bg-gray-800 border-gray-700 rounded-lg text-white" />
                            <input name="phone" onChange={(e) => handleInputChange(e, 'new')} placeholder="Phone" className="p-3 bg-gray-800 border-gray-700 rounded-lg text-white" />
                            <input name="vendorType" onChange={(e) => handleInputChange(e, 'new')} placeholder="Vendor Type (e.g., Supplies)" className="col-span-2 p-3 bg-gray-800 border-gray-700 rounded-lg text-white" />
                        </div>
                        <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-800">
                            <button type="button" onClick={() => setShowModal(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Add Vendor</button>
                        </div>
                    </form>
                )}
                {showModal === 'edit' && selectedVendor && (
                     <form onSubmit={handleUpdateVendor}>
                        <h2 className="text-2xl font-bold mb-6 text-white">Edit Vendor</h2>
                        <div className="grid grid-cols-2 gap-4">
                           <input name="vendorName" value={selectedVendor.vendorName} onChange={(e) => handleInputChange(e, 'edit')} className="col-span-2 p-3 bg-gray-800 border-gray-700 rounded-lg text-white" required />
                           <input name="contactPerson" value={selectedVendor.contactPerson} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg text-white" />
                           <input name="email" value={selectedVendor.email} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg text-white" />
                           <input name="phone" value={selectedVendor.phone} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg text-white" />
                           <input name="vendorType" value={selectedVendor.vendorType} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg text-white" />
                           <select name="status" value={selectedVendor.status} onChange={(e) => handleInputChange(e, 'edit')} className="p-3 bg-gray-800 border-gray-700 rounded-lg text-white">
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                           </select>
                        </div>
                        <div className="flex justify-end gap-4 pt-6 mt-4 border-t border-gray-800">
                            <button type="button" onClick={() => setShowModal(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Save Changes</button>
                        </div>
                    </form>
                )}
                {showModal === 'details' && selectedVendor && (
                     <div>
                        <div className="flex justify-between items-start">
                             <h2 className="text-2xl font-bold mb-6 text-white">{selectedVendor.vendorName}</h2>
                             <button onClick={() => setShowModal(null)} className="-mt-2 -mr-2 p-2 rounded-full hover:bg-gray-700"><X size={20}/></button>
                        </div>
                        <div className="space-y-3 text-gray-300">
                           <p><strong>Contact:</strong> {selectedVendor.contactPerson || 'N/A'}</p>
                           <p><strong>Email:</strong> {selectedVendor.email || 'N/A'}</p>
                           <p><strong>Phone:</strong> {selectedVendor.phone || 'N/A'}</p>
                           <p><strong>Type:</strong> {selectedVendor.vendorType || 'N/A'}</p>
                           <p><strong>Status:</strong> <span className={`font-semibold ${selectedVendor.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{selectedVendor.status.toUpperCase()}</span></p>
                        </div>
                    </div>
                )}
          </Modal>
      )}

      {showDeleteConfirm && (
          <Modal onClose={() => setShowDeleteConfirm(null)}>
              <h2 className="text-2xl font-bold mb-4 text-white">Confirm Deletion</h2>
              <p className="text-gray-400 mb-6">Are you sure you want to delete vendor "{showDeleteConfirm.vendorName}"? This action cannot be undone.</p>
               <div className="flex justify-end gap-4">
                  <button type="button" onClick={() => setShowDeleteConfirm(null)} className="px-6 py-2 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600">Cancel</button>
                  <button type="button" onClick={() => handleDeleteVendor(showDeleteConfirm.id)} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Delete</button>
              </div>
          </Modal>
      )}
    </div>
  );
}

