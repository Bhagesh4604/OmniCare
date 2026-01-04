import React from 'react';
import { motion } from 'framer-motion';
import { PhoneMockup } from './KlarityComponents';
import { InfiniteMarquee } from './InfiniteMarquee';

const articles = [
    {
        title: "Why the Mediterranean diet can be a lifechanger",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
        category: "Nutrition"
    },
    {
        title: "Best times to exercise for maximum impact",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
        category: "Fitness"
    },
    {
        title: "Understanding your sleep cycles",
        image: "https://images.unsplash.com/photo-1541781777621-af13943727dd?w=600&q=80",
        category: "Sleep"
    },
    {
        title: "Mental health in the digital age",
        image: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=600&q=80",
        category: "Wellness"
    },
    {
        title: "The science of hydration",
        image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80",
        category: "Health"
    }
];

const ArticleCard = ({ article }: { article: typeof articles[0] }) => (
    <div className="relative w-[280px] h-[180px] rounded-2xl overflow-hidden mx-4 group cursor-pointer shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
        <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider mb-1 block">
                {article.category}
            </span>
            <h4 className="text-white text-sm font-bold leading-tight">
                {article.title}
            </h4>
            <div className="mt-2 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white text-xs">→</span>
            </div>
        </div>
    </div>
);

export const FeatureCarousel = () => {
    return (
        <section id="app" className="py-24 bg-white relative overflow-hidden">

            {/* Centered Heading */}
            <div className="text-center max-w-4xl mx-auto px-6 mb-20 relative z-20">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
                >
                    Providing you the tools to lead a <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
                        healthier lifestyle
                    </span>
                </motion.h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    Empowering you to keep vaccination records safe and receive renewal notifications. Gather, store, and share your data.
                </p>
            </div>

            <div className="relative h-[600px] flex items-center justify-center">

                {/* The Carousel Track - Behind Phone */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col gap-8 opacity-50 hover:opacity-100 transition-opacity duration-500">
                    {/* Not using generic InfiniteMarquee because we need custom content render */}
                    <div className="flex animate-scroll-left w-max">
                        {[...articles, ...articles, ...articles].map((article, idx) => (
                            <ArticleCard key={`${article.title}-${idx}`} article={article} />
                        ))}
                    </div>
                </div>

                {/* Shadow Overlay to fade sides */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-10 pointer-events-none" />

                {/* Central Phone - The Hero */}
                <div className="relative z-20 scale-[0.85] md:scale-110 drop-shadow-2xl origin-center">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[580px] bg-white text-slate-900 rounded-[3rem] shadow-2xl z-20 md:w-[320px]" /> {/* Backdrop blocker */}
                        <PhoneMockup />
                    </motion.div>
                </div>

            </div>

            {/* Style for custom marquee animation if not in global css */}
            <style>{`
        @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
            animation: scroll-left 40s linear infinite;
        }
      `}</style>
        </section>
    );
};
