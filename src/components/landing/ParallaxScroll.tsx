import { useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // Assuming you have a utils file, if not I'll standardise without it or check.

export const ParallaxScroll = ({
    images,
    className,
}: {
    images: string[];
    className?: string;
}) => {
    // const gridRef = useRef<any>(null); // Removed unused ref
    const { scrollYProgress } = useScroll(); // Defaults to window scroll which is safer here

    // For window based parallax in a normal section, we hook into window scroll or specific section ref
    // Let's make it simpler: Just use window scroll for the specific section this is placed in? 
    // Actually, standard parallax works best when the whole page is the scroller.

    // Revised approach: The component takes `useScroll` context from parent or creates its own ref for the section.
    // Let's use a standard implementation that expects to be in a long scrollable page.

    const { scrollY } = useScroll(); // Global scroll

    const translateFirst = useTransform(scrollY, [0, 1000], [0, -200]);
    const translateSecond = useTransform(scrollY, [0, 1000], [0, 200]);
    const translateThird = useTransform(scrollY, [0, 1000], [0, -200]);

    const third = Math.ceil(images.length / 3);
    const firstPart = images.slice(0, third);
    const secondPart = images.slice(third, 2 * third);
    const thirdPart = images.slice(2 * third);

    return (
        <div
            className={cn("h-[40rem] items-start overflow-y-auto w-full", className)}
        // We essentially want this container to be 'overflow-hidden' visually but let the inner divs move?
        // Actually usually these are just 'divs' in a grid.
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start max-w-7xl mx-auto gap-10 px-10">
                <div className="grid gap-10">
                    {firstPart.map((el, idx) => (
                        <motion.div
                            style={{ y: translateFirst }} // Apply parallax y
                            key={"grid-1" + idx}
                        >
                            <img
                                src={el}
                                className="h-80 w-full object-cover rounded-lg gap-10 !m-0 !p-0 shadow-lg border border-slate-100"
                                alt="thumbnail"
                            />
                        </motion.div>
                    ))}
                </div>
                <div className="grid gap-10">
                    {secondPart.map((el, idx) => (
                        <motion.div style={{ y: translateSecond }} key={"grid-2" + idx}>
                            <img
                                src={el}
                                className="h-80 w-full object-cover rounded-lg gap-10 !m-0 !p-0 shadow-lg border border-slate-100"
                                alt="thumbnail"
                            />
                        </motion.div>
                    ))}
                </div>
                <div className="grid gap-10">
                    {thirdPart.map((el, idx) => (
                        <motion.div style={{ y: translateThird }} key={"grid-3" + idx}>
                            <img
                                src={el}
                                className="h-80 w-full object-cover rounded-lg gap-10 !m-0 !p-0 shadow-lg border border-slate-100"
                                alt="thumbnail"
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
