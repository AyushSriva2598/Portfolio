import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { HERO_DATA, ASSETS } from "../../data/spidermanData";

export const Hero = () => {
  const containerRef = useRef(null);
  const taglineRef = useRef(null);
  const headlineRef = useRef(null);
  const ctaRef = useRef(null);
  const websRef = useRef(null);

  const marquee1Ref = useRef(null);
  const marquee2Ref = useRef(null);
  const tween1 = useRef(null);
  const tween2 = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro timeline
      gsap
        .timeline({ defaults: { ease: "back.out(1.7)" } })
        .fromTo(
          websRef.current?.children || [],
          { opacity: 0, scale: 0.5 },
          { opacity: 0.5, scale: 1, duration: 2, stagger: 0.4, ease: "power3.out" }
        )
        .fromTo(
          taglineRef.current,
          { x: -100, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.2 },
          "-=1.5"
        )
        .fromTo(
          headlineRef.current,
          { x: -150, opacity: 0, skewX: -15 },
          { x: 0, opacity: 1, skewX: 0, duration: 1.2 },
          "-=1.0"
        )
        .fromTo(
          ctaRef.current?.children || [],
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "back.out(2)" },
          "-=0.8"
        );

      // Web ambient rotations
      if (websRef.current?.children) {
        gsap.to(websRef.current.children, {
          rotation: 360,
          duration: 120,
          repeat: -1,
          ease: "linear",
        });
        gsap.to(websRef.current.children, {
          scale: 1.1,
          duration: 4,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      }

      // Marquee continuous loops
      if (marquee1Ref.current && marquee2Ref.current) {
        tween1.current = gsap.to(marquee1Ref.current, {
          x: "-50%",
          repeat: -1,
          duration: 16,
          ease: "none",
        });
        gsap.set(marquee2Ref.current, { x: "-50%" });
        tween2.current = gsap.to(marquee2Ref.current, {
          x: "0%",
          repeat: -1,
          duration: 20,
          ease: "none",
        });
      }

      // Kinetic marquee slight text float
      gsap.to(".marquee-text", {
        y: -4,
        yoyo: true,
        repeat: -1,
        duration: 0.8,
        ease: "sine.inOut",
        stagger: 0.1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleMarqueeEnter = () => {
    if (tween1.current && tween2.current) {
      gsap.to([tween1.current, tween2.current], {
        timeScale: 0.15,
        duration: 0.8,
        ease: "power2.out",
      });
    }
  };

  const handleMarqueeLeave = () => {
    if (tween1.current && tween2.current) {
      gsap.to([tween1.current, tween2.current], {
        timeScale: 1,
        duration: 0.8,
        ease: "power2.out",
      });
    }
  };

  const renderMarqueeContent = (items) => (
    <>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center h-full shrink-0">
          {items.map((item, idx) => (
            <React.Fragment key={`${i}-${idx}`}>
              <span className="marquee-text mx-3 sm:mx-4 md:mx-6 font-comic text-base sm:text-lg md:text-xl lg:text-2xl uppercase italic tracking-widest whitespace-nowrap shrink-0 drop-shadow-sm">
                {item}
              </span>
              <img
                src={idx % 2 === 0 ? ASSETS.spiderIcon : ASSETS.webImg}
                alt="Separator"
                className="mx-3 sm:mx-4 md:mx-6 h-5 sm:h-6 md:h-8 lg:h-10 w-auto object-contain shrink-0 drop-shadow-md"
              />
            </React.Fragment>
          ))}
        </div>
      ))}
    </>
  );

  return (
    <main className="w-full flex flex-col bg-white overflow-hidden">
      {/* Hero Section — Clean Spider-Man Background */}
      <section
        ref={containerRef}
        className="relative w-full h-screen overflow-hidden flex items-center justify-center select-none"
      >
        {/* Single Background Image — Spider-Man Mask (no face reveal) */}
        <img
          src={ASSETS.topMaskImg}
          alt="Spider-Man Hero"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-10"
        />

        {/* Corner Web Overlays */}
        <div
          ref={websRef}
          className="absolute inset-0 pointer-events-none z-[25] overflow-hidden"
        >
          <img
            src={ASSETS.webImg}
            alt="Spider Web Top"
            className="absolute top-0 left-0 w-44 h-44 sm:w-64 sm:h-64 md:w-[400px] md:h-[400px] object-contain opacity-40 sm:opacity-50 -translate-x-1/4 -translate-y-1/4 mix-blend-multiply"
          />
          <img
            src={ASSETS.webImg}
            alt="Spider Web Bottom"
            className="absolute bottom-0 right-0 w-52 h-52 sm:w-72 sm:h-72 md:w-[500px] md:h-[500px] object-contain opacity-40 sm:opacity-50 translate-x-1/4 translate-y-1/4 mix-blend-multiply"
          />
        </div>

        {/* Hero Title & Information */}
        <div className="absolute top-1/2 -translate-y-1/2 left-6 md:left-12 lg:left-24 z-30 flex flex-col gap-4 pointer-events-none drop-shadow-md max-w-xl w-full">
          <div
            ref={taglineRef}
            className="flex items-center gap-2 opacity-0"
          >
            <span className="w-6 sm:w-8 h-[2px] bg-red-600" />
            <span className="text-[#a31515] font-comic tracking-[0.2em] text-xs sm:text-sm uppercase font-bold">
              {HERO_DATA.tagline}
            </span>
          </div>

          <h1
            ref={headlineRef}
            className="text-comic-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] tracking-tight opacity-0 select-none"
          >
            {HERO_DATA.quoteHeadingLine1}
            <br />
            {HERO_DATA.quoteHeadingLine2}
          </h1>

          <p className="font-comic-narrative text-gray-900 text-sm sm:text-base md:text-lg leading-relaxed max-w-lg select-text bg-white/40 backdrop-blur-[2px] rounded-lg p-1">
            {HERO_DATA.narrativeContext}
          </p>

          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-gray-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
            <span>{HERO_DATA.firstName} {HERO_DATA.lastName} • {HERO_DATA.role}</span>
          </div>

          <div
            ref={ctaRef}
            className="flex flex-wrap items-center gap-4 mt-2 pointer-events-auto"
          >
            <a
              href="#projects"
              className="relative overflow-hidden bg-[#a31515] hover:bg-[#7a0f0f] text-white px-8 py-3.5 rounded-lg font-comic tracking-wider text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(163,21,21,0.4)] cursor-pointer uppercase border border-[#a31515]"
            >
              Explore Missions
            </a>
            <a
              href="#contact"
              className="flex items-center gap-2 text-white bg-gray-900 hover:bg-black px-6 py-3.5 rounded-lg font-comic tracking-wider text-base transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.2)] uppercase group"
            >
              <img
                src={ASSETS.spiderIcon}
                alt="Spider"
                className="w-4 h-4 object-contain filter invert transition-transform group-hover:scale-110"
              />
              Get In Touch
            </a>
          </div>
        </div>
      </section>

      {/* Kinetic Crossed Marquees */}
      <section
        className="relative w-full h-[20vh] md:h-[28vh] bg-white overflow-hidden flex items-center justify-center z-30 py-8"
        onMouseEnter={handleMarqueeEnter}
        onMouseLeave={handleMarqueeLeave}
      >
        {/* Top Marquee (Red bar, skewed +4deg) */}
        <div className="absolute w-[115vw] h-12 md:h-16 lg:h-20 bg-[#a31515] text-white border-y-[3px] border-black rotate-[4deg] -translate-y-4 md:-translate-y-6 shadow-[0_10px_20px_rgba(0,0,0,0.4)] z-20 flex items-center overflow-hidden scale-105">
          <div ref={marquee1Ref} className="flex items-center h-full w-max">
            {renderMarqueeContent(HERO_DATA.marqueeItems)}
          </div>
        </div>

        {/* Bottom Marquee (Dark bar, skewed -4deg) */}
        <div className="absolute w-[115vw] h-12 md:h-16 lg:h-20 bg-[#111111] text-[#ef4444] border-y-[3px] border-[#a31515] rotate-[-4deg] translate-y-4 md:translate-y-6 shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-10 flex items-center overflow-hidden scale-105">
          <div ref={marquee2Ref} className="flex items-center h-full w-max">
            {renderMarqueeContent(HERO_DATA.marqueeItems)}
          </div>
        </div>
      </section>
    </main>
  );
};
