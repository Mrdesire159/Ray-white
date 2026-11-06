import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';

const photos = [
  { image: 'lakeside-cabin', title: 'Lakeside cabin', detail: 'A-frame architecture · Waterside setting', price: 285, alt: 'Modern A-frame holiday house beside a peaceful lake' },
  { image: 'forest-cottage', title: 'Forest cottage', detail: 'Timber veranda · Garden surroundings', price: 245, alt: 'Timber holiday cottage with a covered veranda and lush garden' },
  { image: 'waterfront-terrace', title: 'Waterfront hideaway', detail: 'Outdoor living · Water views', price: 325, alt: 'Holiday home terrace with outdoor chairs overlooking the water' },
  { image: 'rainforest-bath', title: 'Rainforest retreat', detail: 'Open-air bath · A leafy outlook', price: 295, alt: 'Freestanding bathtub on a sheltered home deck overlooking rainforest' },
  { image: 'country-retreat', title: 'Country house escape', detail: 'Rural cabin · Room to unwind', price: 265, alt: 'Country holiday cabin and outdoor gathering space beside a lake' },
];

export function AirbnbPhotoRoll() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [interacting, setInteracting] = useState(false);

  function goTo(index: number) {
    const node = track.current;
    if (!node) return;
    const target = (index + photos.length) % photos.length;
    const card = node.children[target] as HTMLElement;
    node.scrollTo({ left: card.offsetLeft - node.offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  useEffect(() => {
    if (!playing || interacting) return;
    const timer = window.setInterval(() => { if (!document.hidden) goTo(active + 1); }, 4500);
    return () => window.clearInterval(timer);
  }, [active, playing, interacting]);

  return (
    <section aria-label="Holiday home inspiration gallery" aria-roledescription="carousel" className="airbnb-photo-roll max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-5 mb-6">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-500 mb-3">The holiday home edit</p>
          <h2 className="text-3xl sm:text-4xl text-neutral-900 font-serif">Find your kind of escape.</h2>
          <p className="text-sm text-neutral-600 mt-3">Explore our latest home inspiration, from forest cottages to waterside cabins.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pause photo rotation' : 'Play photo rotation'} className="airbnb-roll-control">{playing ? <Pause size={17} /> : <Play size={17} />}</button>
          <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous home photo" className="airbnb-roll-control"><ArrowLeft size={19} /></button>
          <button type="button" onClick={() => goTo(active + 1)} aria-label="Next home photo" className="airbnb-roll-control"><ArrowRight size={19} /></button>
        </div>
      </div>
      <div ref={track} className="airbnb-roll-track" onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setInteracting(false); }} onTouchStart={() => setPlaying(false)} onScroll={() => {
        const node = track.current;
        if (!node) return;
        const cards = Array.from(node.children) as HTMLElement[];
        const nearest = cards.reduce((best, card, index) => Math.abs(card.offsetLeft - node.offsetLeft - node.scrollLeft) < Math.abs(cards[best].offsetLeft - node.offsetLeft - node.scrollLeft) ? index : best, 0);
        setActive(nearest);
      }}>
        {photos.map((photo, index) => (
          <article key={photo.image} aria-label={`${index + 1} of ${photos.length}: ${photo.title}`} aria-roledescription="slide" className="airbnb-roll-card">
            <img src={`/assets/airbnb/${photo.image}.jpeg`} alt={photo.alt} loading={index > 1 ? 'lazy' : 'eager'} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/10 to-transparent" />
            <span className="absolute top-4 left-4 rounded-full bg-neutral-950/70 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Home inspiration</span>
            <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white">
              <p className="text-xs text-neutral-200 mb-2">{photo.detail}</p>
              <h3 className="text-2xl font-serif mb-4">{photo.title}</h3>
              <div className="inline-flex flex-wrap items-baseline gap-x-2 rounded-xl bg-[#FFD200] px-3 py-2 text-neutral-950">
                <span className="text-xl font-black">${photo.price}</span><span className="text-xs font-bold">AUD / night</span>
                <span className="w-full text-[10px] uppercase tracking-wider font-semibold">Suggested rate</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
        <p className="text-xs text-neutral-500">Indicative prices for inspiration. Confirm availability, rates and fees before booking.</p>
        <div className="flex gap-1" aria-label="Choose gallery photo">
          {photos.map((photo, index) => <button key={photo.image} type="button" onClick={() => goTo(index)} aria-label={`Show ${photo.title}`} aria-current={active === index ? 'true' : undefined} className="p-2"><span className={`block h-1.5 rounded-full ${active === index ? 'w-7 bg-neutral-900' : 'w-2 bg-neutral-300'}`} /></button>)}
        </div>
      </div>
    </section>
  );
}
