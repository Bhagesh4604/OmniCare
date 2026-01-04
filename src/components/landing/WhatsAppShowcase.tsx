import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MessageCircle, Check, Clock, FileText, Lock, Phone, Video, MoreVertical, ArrowLeft, Shield } from 'lucide-react';

// --- SHARED COMPONENTS ---

const ChatMessage = ({ text, time, isUser, bg = "bg-white" }: { text: React.ReactNode, time: string, isUser: boolean, bg?: string }) => (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-3 group`}>
        <div
            className={`max-w-[85%] p-2 px-3 rounded-lg shadow-sm text-sm relative ${bg} ${isUser ? 'rounded-tr-none bg-[#dcf8c6] text-slate-800' : 'rounded-tl-none text-slate-800'}`}
        >
            {text}
            <div className="flex items-center justify-end gap-1 mt-1 select-none">
                <span className="text-[10px] text-slate-500 leading-none">{time}</span>
                {isUser && (
                    <span className="text-blue-500">
                        <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                )}
            </div>
        </div>
    </div>
);

// --- WINDOW COMPONENTS (Unchanged Content) ---

const BookingWindow = () => (
    <div className="flex flex-col h-full bg-[#E5DDD5]">
        <div className="bg-[#075E54] p-3 flex items-center gap-3 text-white shrink-0">
            <ArrowLeft className="w-5 h-5 lg:hidden" />
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center relative">
                <span className="text-teal-700 font-bold">DR</span>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-[#075E54]"></div>
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">Dr. Sharma (Cardiologist)</h3>
                <p className="text-[11px] text-white/80 truncate">Online</p>
            </div>
            <div className="flex gap-4 text-white/90">
                <Video className="w-5 h-5" />
                <Phone className="w-5 h-5" />
                <MoreVertical className="w-5 h-5" />
            </div>
        </div>
        <div className="flex-1 bg-[#E5DDD5] p-4 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.06] bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/WhatsApp_logo.svg/2048px-WhatsApp_logo.svg.png')] bg-contain" />
            <div className="z-10 flex flex-col gap-2">
                <div className="flex justify-center mb-4"><span className="bg-[#E1F3FB] text-slate-600 text-[10px] px-2 py-1 rounded shadow-sm">Today</span></div>
                <ChatMessage isUser={true} text="Hi doctor, can I book a slot for tomorrow?" time="10:30 AM" />
                <ChatMessage isUser={false} text="Hello! 👋 I have two slots available tomorrow:" time="10:31 AM" />
                <div className="bg-white p-2 rounded-lg shadow-sm w-[85%] self-start mb-3 border-l-4 border-teal-500">
                    <p className="text-xs text-slate-500 font-medium mb-2">Select Time Slot</p>
                    <div className="grid gap-2">
                        <button className="flex items-center justify-between p-2 rounded bg-teal-50 border border-teal-100 hover:bg-teal-100 transition-colors">
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-teal-600" /><span className="text-xs font-semibold text-teal-800">10:00 AM</span></div>
                            <span className="text-[10px] bg-teal-200 text-teal-800 px-1.5 py-0.5 rounded">Available</span>
                        </button>
                        <button className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 opacity-60">
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-500" /><span className="text-xs font-semibold text-slate-700">02:30 PM</span></div>
                            <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">Booked</span>
                        </button>
                    </div>
                </div>
                <ChatMessage isUser={true} text="10:00 AM works perfectly. Thanks!" time="10:32 AM" />
                <div className="flex justify-center my-2"><span className="bg-[#E1F3FB] text-slate-600 text-[10px] px-2 py-1 rounded shadow-sm">Booking Confirmed</span></div>
            </div>
        </div>
        <div className="p-2 bg-[#F0F0F0] flex gap-2 items-center shrink-0">
            <div className="flex-1 h-9 bg-white rounded-full px-4 text-xs flex items-center text-slate-400">Message...</div>
            <div className="w-9 h-9 bg-[#00A884] rounded-full flex items-center justify-center text-white"><MessageCircle className="w-4 h-4" /></div>
        </div>
    </div>
);

const ReportWindow = () => (
    <div className="flex flex-col h-full bg-[#E5DDD5]">
        <div className="bg-[#075E54] p-3 flex items-center gap-3 text-white shrink-0">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">LAB</div>
            <div className="flex-1 min-w-0"><h3 className="font-medium text-sm">Pathology Lab</h3><p className="text-[11px] text-white/80">Business Account</p></div>
            <MoreVertical className="w-5 h-5" />
        </div>
        <div className="flex-1 p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.06] bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/WhatsApp_logo.svg/2048px-WhatsApp_logo.svg.png')] bg-contain" />
            <div className="z-10 flex flex-col gap-2">
                <ChatMessage isUser={true} text="Are my blood test results ready?" time="09:15 AM" />
                <ChatMessage isUser={false} text="Yes, your report has been generated." time="09:16 AM" />
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-3 shadow-sm max-w-[85%] self-start cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-red-100 text-red-500 rounded-lg flex items-center justify-center shrink-0"><FileText className="w-5 h-5" /></div>
                    <div><p className="text-xs font-bold text-slate-800 line-clamp-1">CBC_Blood_Test_Final.pdf</p><p className="text-[10px] text-slate-500">PDF • 1.2 MB • 09:16 AM</p></div>
                </div>
                <div className="bg-[#FFEECD] text-[#5C4D06] text-[10px] p-2 rounded text-center self-center shadow-sm flex gap-1 mt-2 max-w-[90%]">
                    <Lock className="w-3 h-3 shrink-0 mt-0.5" />
                    <span className="text-left">Your report is password protected. Use your DOB (DDMMYYYY) to open.</span>
                </div>
            </div>
        </div>
        <div className="p-2 bg-[#F0F0F0] flex gap-2 items-center shrink-0">
            <div className="flex-1 h-9 bg-white rounded-full px-4 text-xs flex items-center text-slate-400">Message...</div>
            <div className="w-9 h-9 bg-[#00A884] rounded-full flex items-center justify-center text-white"><MessageCircle className="w-4 h-4" /></div>
        </div>
    </div>
);

const SupportWindow = () => (
    <div className="flex flex-col h-full bg-[#E5DDD5]">
        <div className="bg-[#075E54] p-3 flex items-center gap-3 text-white shrink-0">
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold"><Shield className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0"><h3 className="font-medium text-sm">Emergency AI</h3><p className="text-[11px] text-white/80">Automated System</p></div>
        </div>
        <div className="flex-1 p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.06] bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/WhatsApp_logo.svg/2048px-WhatsApp_logo.svg.png')] bg-contain" />
            <div className="z-10 flex flex-col gap-2">
                <div className="self-center bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow mb-2">Critical Alert</div>
                <ChatMessage isUser={true} text="My heart rate is 140 bpm resting." time="11:42 PM" />
                <ChatMessage isUser={false} text="⚠️ ALERT: Tachycardia detected." time="11:42 PM" />
                <ChatMessage isUser={false} text="Please sit down and remain calm. I am alerting the nearest ambulance unit." time="11:42 PM" />
                <div className="bg-white p-3 rounded-lg shadow-sm border border-l-4 border-l-red-500 max-w-[90%] self-start">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-800">Ambulance Dispatched</span>
                        <span className="px-1.5 py-0.5 ml-2 bg-red-100 text-red-600 rounded text-[10px] font-bold animate-pulse">LIVE</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">Unit A-42 is en route to your location.</p>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-red-500 w-[60%]"></div></div>
                    <p className="text-[10px] text-slate-400 mt-1 text-right">ETA: 4 mins</p>
                </div>
            </div>
        </div>
        <div className="p-2 bg-[#F0F0F0] flex gap-2 items-center shrink-0">
            <div className="flex-1 h-9 bg-white rounded-full px-4 text-xs flex items-center text-slate-400">Message...</div>
            <div className="w-9 h-9 bg-[#00A884] rounded-full flex items-center justify-center text-white"><MessageCircle className="w-4 h-4" /></div>
        </div>
    </div>
);

export const WhatsAppShowcase = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll progress mapped to the VIEWPORT intersection
    // "start end": When top of section hits bottom of viewport (Starts entering)
    // "center center": When center of section hits center of viewport (Fully visible)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "center center"]
    });

    // --- SCROLL LINKED TRANSFORMATIONS ---

    // Header Animation
    const titleOpacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [0, 0, 1]);
    const titleY = useTransform(scrollYProgress, [0, 0.5], [50, 0]);

    // Window 1: Booking (Left)
    // 0 -> 1 progress: Moves from center (hidden) to left (visible)
    const x1 = useTransform(scrollYProgress, [0.4, 1], ["20%", "-60%"]);
    const rotate1 = useTransform(scrollYProgress, [0.4, 1], [0, -12]);
    const scale1 = useTransform(scrollYProgress, [0.4, 1], [0.8, 0.9]);
    const opacity1 = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);

    // Window 3: Reports (Right)
    // 0 -> 1 progress: Moves from center (hidden) to right (visible)
    const x3 = useTransform(scrollYProgress, [0.4, 1], ["-20%", "60%"]);
    const rotate3 = useTransform(scrollYProgress, [0.4, 1], [0, 12]);
    const scale3 = useTransform(scrollYProgress, [0.4, 1], [0.8, 0.9]);
    const opacity3 = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);

    // Window 2: Support (Center)
    // 0 -> 1 progress: Pops up from bottom
    const y2 = useTransform(scrollYProgress, [0.4, 1], ["20%", "-5%"]);
    const scale2 = useTransform(scrollYProgress, [0.4, 1], [0.8, 1.1]);
    const opacity2 = useTransform(scrollYProgress, [0.1, 0.4], [0, 1]);


    return (
        <section ref={containerRef} className="bg-[#111B21] relative min-h-screen flex flex-col items-center justify-center py-24 overflow-hidden z-10">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-[#00A884] opacity-[0.08] blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-[#25d366] opacity-[0.05] blur-[150px] rounded-full" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-7xl mx-auto px-4">

                {/* Header */}
                <motion.div
                    style={{ opacity: titleOpacity, y: titleY }}
                    className="text-center mb-16 md:mb-24 relative z-30"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A884]/10 rounded-full text-[#00A884] font-bold text-sm mb-6 border border-[#00A884]/20 backdrop-blur-sm">
                        <MessageCircle className="w-4 h-4" /> WhatsApp Integration
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                        Power of a Hospital <br />
                        <span className="text-[#25D366]">In Your Chat</span>
                    </h2>
                </motion.div>

                {/* Cards Container */}
                <div className="relative w-full max-w-[1000px] h-[450px] md:h-[600px] flex items-center justify-center perspective-[2000px]">

                    {/* Window 1: Booking (Left) */}
                    <motion.div
                        style={{ x: x1, rotate: rotate1, scale: scale1, opacity: opacity1 }}
                        className="absolute w-[280px] md:w-[350px] h-[400px] md:h-[550px] shadow-2xl rounded-2xl overflow-hidden border-[6px] border-[#1f2c34] bg-[#0b141a] z-10 origin-bottom-right"
                    >
                        <BookingWindow />
                    </motion.div>

                    {/* Window 3: Reports (Right) */}
                    <motion.div
                        style={{ x: x3, rotate: rotate3, scale: scale3, opacity: opacity3 }}
                        className="absolute w-[280px] md:w-[350px] h-[400px] md:h-[550px] shadow-2xl rounded-2xl overflow-hidden border-[6px] border-[#1f2c34] bg-[#0b141a] z-10 origin-bottom-left"
                    >
                        <ReportWindow />
                    </motion.div>

                    {/* Window 2: Support (Center) */}
                    <motion.div
                        style={{ y: y2, scale: scale2, opacity: opacity2 }}
                        className="absolute w-[300px] md:w-[380px] h-[450px] md:h-[600px] shadow-[0_0_50px_rgba(37,211,102,0.3)] rounded-3xl overflow-hidden border-[8px] border-[#1f2c34] bg-[#0b141a] z-20"
                    >
                        <SupportWindow />
                    </motion.div>

                </div>
            </div>

            {/* Bottom Gradient for smooth transition */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#111B21] to-transparent pointer-events-none" />
        </section>
    );
};
