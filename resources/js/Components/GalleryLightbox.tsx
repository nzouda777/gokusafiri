import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import type { GalleryMediaItem } from '../types';

interface Props {
    items: GalleryMediaItem[];
    index: number;
    onClose: () => void;
    onIndexChange: (index: number) => void;
}

export default function GalleryLightbox({ items, index, onClose, onIndexChange }: Props) {
    const { t } = useLaravelReactI18n();
    const scrollerRef = useRef<HTMLDivElement>(null);
    const isProgrammaticScroll = useRef(false);
    const hasMounted = useRef(false);

    const goTo = useCallback((next: number) => {
        onIndexChange(Math.max(0, Math.min(items.length - 1, next)));
    }, [items.length, onIndexChange]);

    // Lock page scroll while open
    useEffect(() => {
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = original; };
    }, []);

    // Keep the scroller aligned with the active index: instant jump on open,
    // smooth glide on subsequent navigation. Slides are exact multiples of
    // the scroller's width, so the target offset is computed directly
    // instead of via scrollIntoView (which can be nudged off-target by the
    // browser's own scroll-snap resolution and by scroll-behavior: smooth
    // set anywhere upstream  both were causing the wrong slide to end up
    // in view).
    useLayoutEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;

        isProgrammaticScroll.current = true;
        el.scrollTo({
            left: index * el.clientWidth,
            behavior: hasMounted.current ? 'smooth' : 'auto',
        });
        hasMounted.current = true;

        let released = false;
        const release = () => {
            if (released) return;
            released = true;
            isProgrammaticScroll.current = false;
        };

        el.addEventListener('scrollend', release, { once: true });
        const fallback = setTimeout(release, 600);

        return () => {
            el.removeEventListener('scrollend', release);
            clearTimeout(fallback);
        };
    }, [index]);

    // Re-align on viewport resize (orientation change, devtools, etc.)
    useEffect(() => {
        function onResize() {
            const el = scrollerRef.current;
            if (!el) return;
            isProgrammaticScroll.current = true;
            el.scrollTo({ left: index * el.clientWidth, behavior: 'auto' });
            isProgrammaticScroll.current = false;
        }
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [index]);

    // Keyboard navigation
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowRight') goTo(index + 1);
            else if (e.key === 'ArrowLeft') goTo(index - 1);
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [index, goTo, onClose]);

    // Detect manual scroll / swipe and sync the active index
    function handleScroll() {
        if (isProgrammaticScroll.current) return;
        const el = scrollerRef.current;
        if (!el || el.clientWidth === 0) return;
        const closest = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollLeft / el.clientWidth)));
        if (closest !== index) onIndexChange(closest);
    }

    const current = items[index];

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" role="dialog" aria-modal="true">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 shrink-0">
                <span className="text-[13px] text-white/60 tracking-wide">{index + 1} / {items.length}</span>
                <button
                    onClick={onClose}
                    aria-label={t('gallery.close')}
                    className="p-2 text-white/70 hover:text-white transition-colors"
                >
                    <X size={22} />
                </button>
            </div>

            {/* Scroller + arrows */}
            <div className="relative flex-1 min-h-0 flex items-center">
                <button
                    onClick={() => goTo(index - 1)}
                    disabled={index === 0}
                    aria-label={t('gallery.prev')}
                    className="absolute left-3 md:left-6 z-10 size-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-0 flex items-center justify-center text-white transition-all"
                >
                    <ChevronLeft size={22} />
                </button>

                <div
                    ref={scrollerRef}
                    onScroll={handleScroll}
                    className="flex w-full h-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="w-full h-full shrink-0 snap-center flex items-center justify-center px-4 md:px-20"
                        >
                            {item.type === 'video' ? (
                                <video
                                    src={item.url}
                                    controls
                                    playsInline
                                    className="max-w-full max-h-full rounded-[8px]"
                                />
                            ) : (
                                <img
                                    src={item.url}
                                    alt={item.caption ?? ''}
                                    className="max-w-full max-h-full object-contain rounded-[8px]"
                                    draggable={false}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => goTo(index + 1)}
                    disabled={index === items.length - 1}
                    aria-label={t('gallery.next')}
                    className="absolute right-3 md:right-6 z-10 size-11 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-0 flex items-center justify-center text-white transition-all"
                >
                    <ChevronRight size={22} />
                </button>
            </div>

            {/* Caption */}
            <div className="h-[52px] shrink-0 flex items-center justify-center px-6 text-center">
                {current?.caption && (
                    <span className="text-white/70 text-[14px]">{current.caption}</span>
                )}
            </div>
        </div>
    );
}
