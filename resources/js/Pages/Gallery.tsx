import { Head } from '@inertiajs/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { useLaravelReactI18n } from 'laravel-react-i18n';
import AppLayout from '../Components/AppLayout';
import GalleryLightbox from '../Components/GalleryLightbox';
import type { GalleryMediaItem } from '../types';

interface Props {
    items: GalleryMediaItem[];
}

// CSS Grid masonry: track sizing handles column auto-fill, we only need to
// compute each item's row span from its real aspect ratio (or a sane
// fallback for videos, whose dimensions we don't have without ffmpeg).
const ROW_HEIGHT = 8;
const GAP = 16;
const FALLBACK_RATIO = 9 / 16; // height / width

function useMasonrySpans(items: GalleryMediaItem[]) {
    const gridRef = useRef<HTMLDivElement>(null);
    const [colWidth, setColWidth] = useState(0);

    useLayoutEffect(() => {
        const el = gridRef.current;
        if (!el) return;

        function measure() {
            const tracks = getComputedStyle(el as HTMLDivElement).gridTemplateColumns.split(' ');
            const first = parseFloat(tracks[0]);
            if (!Number.isNaN(first)) setColWidth(first);
        }

        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const spans = items.map((item) => {
        const ratio = item.width && item.height ? item.height / item.width : FALLBACK_RATIO;
        const renderedHeight = colWidth * ratio;
        return Math.max(1, Math.ceil((renderedHeight + GAP) / (ROW_HEIGHT + GAP)));
    });

    return { gridRef, spans };
}

export default function Gallery({ items }: Props) {
    const { t } = useLaravelReactI18n();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const { gridRef, spans } = useMasonrySpans(items);

    return (
        <AppLayout>
            <Head title={`${t('gallery.title')}  Gokusafiri`} />

            {/* Hero */}
            <section className="bg-[#fbf8f2] border-b border-[#e4ddd0] py-16 md:py-24">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    <div className="max-w-[600px]">
                        <p className="font-bold text-[#f0a05e] text-[12px] tracking-[2.16px] uppercase mb-4">
                            {t('gallery.eyebrow')}
                        </p>
                        <h1 className="font-display not-italic text-[40px] leading-[48px] md:text-[60px] md:leading-[66px] tracking-[-0.62px] text-[#16241b] mb-5">
                            {t('gallery.title')}
                        </h1>
                        <p className="text-[16px] leading-[26px] text-[#4f5c53] max-w-[480px]">
                            {t('gallery.subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Masonry grid  auto-fill columns, row span computed from real aspect ratio */}
            <section className="bg-[#fbf8f2] py-12 md:py-20">
                <div className="max-w-[1440px] mx-auto px-[100px] max-lg:px-6">
                    {items.length === 0 ? (
                        <p className="text-center text-[#8a968d] text-[15px] py-20">{t('gallery.empty')}</p>
                    ) : (
                        <div
                            ref={gridRef}
                            className="grid gap-4 grid-cols-2 sm:[grid-template-columns:repeat(auto-fill,minmax(220px,1fr))] [grid-auto-rows:8px]"
                        >
                            {items.map((item, i) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveIndex(i)}
                                    style={{ gridRowEnd: `span ${spans[i] ?? 20}` }}
                                    className="group relative block w-full h-full rounded-[18px] overflow-hidden bg-[#e4ddd0]"
                                >
                                    {item.type === 'video' ? (
                                        <video
                                            src={item.url}
                                            muted
                                            playsInline
                                            preload="metadata"
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <img
                                            src={item.thumb_url ?? item.url}
                                            alt={item.caption ?? ''}
                                            loading="lazy"
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )}

                                    {item.type === 'video' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/30 transition-colors">
                                            <PlayCircle size={44} className="text-white drop-shadow-md" strokeWidth={1.5} />
                                        </div>
                                    )}

                                    {item.caption && (
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-[12px] font-medium line-clamp-1 text-left">
                                                {item.caption}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {activeIndex !== null && (
                <GalleryLightbox
                    items={items}
                    index={activeIndex}
                    onClose={() => setActiveIndex(null)}
                    onIndexChange={setActiveIndex}
                />
            )}
        </AppLayout>
    );
}
