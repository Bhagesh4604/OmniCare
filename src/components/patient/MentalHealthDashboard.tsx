import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, MessageCircle, TrendingDown, TrendingUp, AlertCircle, Phone, MessageSquare, Wind, Sparkles, Activity, Calendar, Shield } from 'lucide-react';
import apiUrl from '@/config/api';

const emotions = [
    { name: 'Happy', emoji: '😊', color: 'bg-yellow-500' },
    { name: 'Sad', emoji: '😢', color: 'bg-blue-500' },
    { name: 'Anxious', emoji: '😰', color: 'bg-purple-500' },
    { name: 'Angry', emoji: '😠', color: 'bg-red-500' },
    { name: 'Calm', emoji: '😌', color: 'bg-green-500' },
    { name: 'Energetic', emoji: '⚡', color: 'bg-orange-500' },
];

const activities = [
    { name: 'Exercise', icon: Activity },
    { name: 'Meditation', icon: Brain },
    { name: 'Socializing', icon: MessageCircle },
    { name: 'Work', icon: Calendar },
    { name: 'Sleep', icon: Wind },
];

const MentalHealthDashboard = ({ patientId }: { patientId: number }) => {
    const [moodLevel, setMoodLevel] = useState(5);
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [assessment, setAssessment] = useState<any>(null);
    const [moodHistory, setMoodHistory] = useState<any[]>([]);
    const [showCopingStrategies, setShowCopingStrategies] = useState(false);
    const [copingStrategies, setCopingStrategies] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [breathingActive, setBreathingActive] = useState(false);

    const toggleEmotion = (emotion: string) => {
        setSelectedEmotions(prev =>
            prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
        );
    };

    const toggleActivity = (activity: string) => {
        setSelectedActivities(prev =>
            prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]
        );
    };

    const logMood = async () => {
        try {
            await fetch(apiUrl('/api/mental-health/mood-log'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId,
                    moodLevel,
                    emotions: selectedEmotions,
                    notes,
                    activities: selectedActivities
                })
            });

            // Run AI analysis
            analyzeMentalHealth();

            // Reset form
            setNotes('');
            setSelectedEmotions([]);
            setSelectedActivities([]);
            loadMoodHistory();
        } catch (error) {
            console.error('Error logging mood:', error);
        }
    };

    const analyzeMentalHealth = async () => {
        setLoading(true);
        try {
            const response = await fetch(apiUrl('/api/mental-health/analyze'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId,
                    textInput: notes,
                    activityData: { recentActivities: selectedActivities }
                })
            });
            const data = await response.json();
            if (data.success) {
                setAssessment(data.assessment);
            }
        } catch (error) {
            console.error('Error analyzing mental health:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoodHistory = async () => {
        try {
            const response = await fetch(apiUrl(`/api/mental-health/mood-history/${patientId}?days=30`));
            const data = await response.json();
            if (data.success) {
                setMoodHistory(data.history);
            }
        } catch (error) {
            console.error('Error loading mood history:', error);
        }
    };

    const loadCopingStrategies = async () => {
        try {
            const response = await fetch(apiUrl('/api/mental-health/coping-strategies'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emotion: selectedEmotions[0] || 'anxious',
                    situation: notes || 'general stress'
                })
            });
            const data = await response.json();
            if (data.success) {
                setCopingStrategies(data.strategies);
                setShowCopingStrategies(true);
            }
        } catch (error) {
            console.error('Error loading coping strategies:', error);
        }
    };

    useEffect(() => {
        loadMoodHistory();
    }, [patientId]);

    const getCrisisColor = (level: string) => {
        switch (level) {
            case 'None': case 'Low': return 'from-green-500 to-emerald-600';
            case 'Moderate': return 'from-yellow-500 to-amber-600';
            case 'High': return 'from-orange-500 to-red-600';
            case 'Critical': return 'from-red-600 to-rose-800';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const averageMood = moodHistory.length > 0
        ? (moodHistory.reduce((sum, log) => sum + log.moodLevel, 0) / moodHistory.length).toFixed(1)
        : 5;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                    <Brain className="w-10 h-10" />
                    Mental Wellness Center
                </h1>
                <p className="text-purple-200">
                    AI-powered support for your mental health journey
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Mood Logging */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Mood Slider */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <Heart className="w-6 h-6 text-pink-400" />
                            How are you feeling today?
                        </h2>

                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-6xl">{moodLevel >= 7 ? '😊' : moodLevel >= 4 ? '😐' : '😢'}</span>
                                <div className="text-right">
                                    <p className="text-4xl font-bold text-white">{moodLevel}</p>
                                    <p className="text-sm text-purple-200">/10</p>
                                </div>
                            </div>

                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={moodLevel}
                                onChange={(e) => setMoodLevel(parseInt(e.target.value))}
                                className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-pink-500 [&::-webkit-slider-thumb]:to-purple-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                            />

                            <div className="flex justify-between text-xs text-purple-300 mt-2">
                                <span>Very Low</span>
                                <span>Moderate</span>
                                <span>Very High</span>
                            </div>
                        </div>

                        {/* Emotions */}
                        <div className="mb-6">
                            <p className="text-sm text-purple-200 mb-3">What emotions are you experiencing?</p>
                            <div className="flex flex-wrap gap-3">
                                {emotions.map(emotion => (
                                    <button
                                        key={emotion.name}
                                        onClick={() => toggleEmotion(emotion.name)}
                                        className={`px-4 py-2 rounded-xl transition-all ${selectedEmotions.includes(emotion.name)
                                                ? `${emotion.color} text-white scale-110`
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                            }`}
                                    >
                                        <span className="text-2xl mr-2">{emotion.emoji}</span>
                                        {emotion.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Activities */}
                        <div className="mb-6">
                            <p className="text-sm text-purple-200 mb-3">What activities did you do today?</p>
                            <div className="flex flex-wrap gap-3">
                                {activities.map(activity => {
                                    const Icon = activity.icon;
                                    return (
                                        <button
                                            key={activity.name}
                                            onClick={() => toggleActivity(activity.name)}
                                            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${selectedActivities.includes(activity.name)
                                                    ? 'bg-purple-500 text-white scale-110'
                                                    : 'bg-white/10 text-white hover:bg-white/20'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {activity.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mb-6">
                            <p className="text-sm text-purple-200 mb-3">Any thoughts you'd like to share?</p>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="It's safe to express yourself here..."
                                className="w-full h-24 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <button
                            onClick={logMood}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            Log Mood & Analyze
                        </button>
                    </motion.div>

                    {/* Crisis Assessment */}
                    {assessment && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-gradient-to-br ${getCrisisColor(assessment.crisisLevel)} rounded-3xl p-8 text-white shadow-2xl`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm uppercase tracking-wider opacity-80 mb-1">Mental Wellness Status</p>
                                    <h2 className="text-3xl font-bold">{assessment.crisisLevel}</h2>
                                </div>
                                <Shield className="w-16 h-16 opacity-20" />
                            </div>

                            <p className="mb-4 text-lg">{assessment.supportiveMessage}</p>

                            {assessment.requiresImmediateIntervention && (
                                <div className="bg-white/20 rounded-xl p-4 mb-4">
                                    <p className="font-bold mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" />
                                        Immediate Support Available
                                    </p>
                                    <div className="space-y-2">
                                        <a href="tel:988" className="flex items-center gap-2 hover:underline">
                                            <Phone className="w-4 h-4" />
                                            Call 988 - Suicide & Crisis Lifeline
                                        </a>
                                        <a href="sms:741741&body=HOME" className="flex items-center gap-2 hover:underline">
                                            <MessageSquare className="w-4 h-4" />
                                            Text HOME to 741741 - Crisis Text Line
                                        </a>
                                    </div>
                                </div>
                            )}

                            {assessment.immediateActions?.length > 0 && (
                                <div className="mt-4">
                                    <p className="font-bold mb-2">Recommended Actions:</p>
                                    <ul className="space-y-1">
                                        {assessment.immediateActions.map((action: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span>•</span>
                                                {action}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button
                                onClick={loadCopingStrategies}
                                className="mt-6 w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Get Coping Strategies
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Right Column - History & Insights */}
                <div className="space-y-6">
                    {/* Average Mood */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
                    >
                        <p className="text-sm text-purple-200 mb-2">30-Day Average Mood</p>
                        <div className="flex items-end gap-4">
                            <p className="text-5xl font-bold text-white">{averageMood}</p>
                            <p className="text-2xl text-purple-300 mb-2">/10</p>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            {parseFloat(averageMood) >= 6 ? (
                                <>
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400">Positive trend</span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                    <span className="text-red-400">Needs attention</span>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Mood History */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20"
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Recent Entries</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {moodHistory.slice(0, 10).map((log, index) => (
                                <div key={log.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-2xl">
                                            {log.moodLevel >= 7 ? '😊' : log.moodLevel >= 4 ? '😐' : '😢'}
                                        </span>
                                        <span className="text-xl font-bold text-white">{log.moodLevel}/10</span>
                                    </div>
                                    <p className="text-xs text-purple-300 mb-2">
                                        {new Date(log.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    {log.notes && (
                                        <p className="text-sm text-purple-100 italic">"{log.notes}"</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Breathing Exercise */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-6 text-white"
                    >
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Wind className="w-6 h-6" />
                            Breathing Exercise
                        </h3>
                        <p className="text-sm mb-4 opacity-90">
                            Take a moment to calm your mind with guided breathing
                        </p>
                        <button
                            onClick={() => setBreathingActive(!breathingActive)}
                            className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors"
                        >
                            {breathingActive ? 'Stop' : 'Start'} Exercise
                        </button>
                        {breathingActive && (
                            <div className="mt-4 text-center">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.5, 1],
                                    }}
                                    transition={{
                                        duration: 8,
                                        repeat: Infinity,
                                        times: [0, 0.5, 1]
                                    }}
                                    className="w-24 h-24 mx-auto bg-white/30 rounded-full flex items-center justify-center"
                                >
                                    <Wind className="w-12 h-12" />
                                </motion.div>
                                <motion.p
                                    animate={{
                                        opacity: [1, 0.5, 1],
                                    }}
                                    transition={{
                                        duration: 8,
                                        repeat: Infinity,
                                    }}
                                    className="mt-4 text-lg font-semibold"
                                >
                                    Breathe In... Hold... Breathe Out...
                                </motion.p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Coping Strategies Modal */}
            <AnimatePresence>
                {showCopingStrategies && copingStrategies && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCopingStrategies(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 border border-purple-500/30"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-3xl font-bold text-white">Coping Strategies</h2>
                                <button
                                    onClick={() => setShowCopingStrategies(false)}
                                    className="text-gray-400 hover:text-white transition-colors text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            {copingStrategies.immediateStrategies && (
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-purple-300 mb-3">Try These Right Now</h3>
                                    <div className="space-y-2">
                                        {copingStrategies.immediateStrategies.map((strategy: string, i: number) => (
                                            <div key={i} className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 text-purple-100">
                                                {strategy}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {copingStrategies.breathingExercises && (
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-blue-300 mb-3">Breathing Exercises</h3>
                                    {copingStrategies.breathingExercises.map((exercise: any, i: number) => (
                                        <div key={i} className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-3">
                                            <p className="font-bold text-blue-200 mb-2">{exercise.name}</p>
                                            <ol className="list-decimal list-inside space-y-1 text-blue-100">
                                                {exercise.steps?.map((step: string, j: number) => (
                                                    <li key={j}>{step}</li>
                                                ))}
                                            </ol>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {copingStrategies.encouragingMessage && (
                                <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl p-6 text-center">
                                    <p className="text-white text-lg italic">"{copingStrategies.encouragingMessage}"</p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MentalHealthDashboard;
