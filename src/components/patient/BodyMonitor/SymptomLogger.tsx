import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, AlertCircle } from 'lucide-react';

interface SymptomLoggerProps {
    patientId: number;
    preselectedBodyPart?: number | null;
    onClose: () => void;
}

interface BodyPart {
    id: number;
    name: string;
    display_name: string;
    category: string;
}

const SymptomLogger: React.FC<SymptomLoggerProps> = ({
    patientId,
    preselectedBodyPart,
    onClose
}) => {
    const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
    const [formData, setFormData] = useState({
        bodyPartId: preselectedBodyPart || '',
        symptomType: '',
        severity: 'mild' as 'mild' | 'moderate' | 'severe' | 'critical',
        description: '',
        painLevel: 5,
        photo: null as File | null
    });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const apiUrl = (path: string) => {
        // Use env var if set, otherwise use current domain (for Azure) or localhost
        const baseUrl = import.meta.env.VITE_API_BASE_URL ||
            (window.location.hostname === 'localhost' ? 'http://localhost:8086' : window.location.origin);
        return `${baseUrl}${path}`;
    };

    useEffect(() => {
        fetchBodyParts();
    }, []);

    const fetchBodyParts = async () => {
        try {
            const response = await fetch(apiUrl('/api/body-monitor/body-parts'));
            const data = await response.json();

            if (data.success) {
                setBodyParts(data.bodyParts);
            }
        } catch (error) {
            console.error('Error fetching body parts:', error);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, photo: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.bodyPartId || !formData.symptomType) {
            setError('Please select a body part and symptom type');
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('patientId', patientId.toString());
            formDataToSend.append('bodyPartId', formData.bodyPartId.toString());
            formDataToSend.append('symptomType', formData.symptomType);
            formDataToSend.append('severity', formData.severity);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('painLevel', formData.painLevel.toString());

            if (formData.photo) {
                formDataToSend.append('photo', formData.photo);
            }

            const response = await fetch(apiUrl('/api/body-monitor/symptoms'), {
                method: 'POST',
                body: formDataToSend
            });

            const data = await response.json();

            if (data.success) {
                onClose();
            } else {
                setError(data.message || 'Failed to log symptom');
            }
        } catch (error) {
            console.error('Error logging symptom:', error);
            setError('Failed to log symptom. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold text-white">Log Symptom</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-200">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Body Part Selection */}
                    <div>
                        <label className="block text-white font-semibold mb-2">Body Part *</label>
                        <select
                            value={formData.bodyPartId}
                            onChange={(e) => setFormData({ ...formData, bodyPartId: parseInt(e.target.value) })}
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select body part...</option>
                            {bodyParts.map(part => (
                                <option key={part.id} value={part.id}>
                                    {part.display_name} ({part.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Symptom Type */}
                    <div>
                        <label className="block text-white font-semibold mb-2">Symptom Type *</label>
                        <select
                            value={formData.symptomType}
                            onChange={(e) => setFormData({ ...formData, symptomType: e.target.value })}
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select symptom...</option>
                            <option value="Pain">Pain</option>
                            <option value="Swelling">Swelling</option>
                            <option value="Rash">Rash</option>
                            <option value="Numbness">Numbness</option>
                            <option value="Weakness">Weakness</option>
                            <option value="Discomfort">Discomfort</option>
                            <option value="Bleeding">Bleeding</option>
                            <option value="Bruising">Bruising</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Severity */}
                    <div>
                        <label className="block text-white font-semibold mb-2">Severity *</label>
                        <div className="grid grid-cols-4 gap-2">
                            {(['mild', 'moderate', 'severe', 'critical'] as const).map(severity => (
                                <button
                                    key={severity}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, severity })}
                                    className={`py-3 rounded-lg font-semibold transition-all ${formData.severity === severity
                                        ? severity === 'mild'
                                            ? 'bg-green-600 text-white'
                                            : severity === 'moderate'
                                                ? 'bg-blue-600 text-white'
                                                : severity === 'severe'
                                                    ? 'bg-yellow-600 text-white'
                                                    : 'bg-red-600 text-white'
                                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                        }`}
                                >
                                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pain Level */}
                    <div>
                        <label className="block text-white font-semibold mb-2">
                            Pain Level: {formData.painLevel}/10
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={formData.painLevel}
                            onChange={(e) => setFormData({ ...formData, painLevel: parseInt(e.target.value) })}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>Minimal</span>
                            <span>Severe</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-white font-semibold mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            placeholder="Describe your symptom in detail..."
                            className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <label className="block text-white font-semibold mb-2">Photo (Optional)</label>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
                                <Camera className="w-5 h-5" />
                                {photoPreview ? 'Change Photo' : 'Upload Photo'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </label>
                            {photoPreview && (
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="h-20 w-20 object-cover rounded-lg border-2 border-blue-500"
                                />
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-all"
                        >
                            {isSubmitting ? 'Logging...' : 'Log Symptom'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default SymptomLogger;
