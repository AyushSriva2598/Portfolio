import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ABOUT_DATA, ASSETS } from "../../data/spidermanData";

gsap.registerPlugin(ScrollTrigger);

export const About = () => {
  const sectionRef = useRef(null);
  const profileContainerRef = useRef(null);
  const webLeftRef = useRef(null);
  const webRightRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const pillsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ScrollTrigger entry sequence
      gsap
        .timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom center",
            toggleActions: "play none none reverse",
          },
        })
        .fromTo(
          [webLeftRef.current, webRightRef.current],
          { y: -600, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.8, ease: "elastic.out(0.8, 0.4)", stagger: 0.3 }
        )
        .fromTo(
          badgeRef.current,
          { x: -50, opacity: 0, clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" },
          {
            x: 0,
            opacity: 1,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
            duration: 0.8,
            ease: "power3.out",
          },
          "-=1.4"
        )
        .fromTo(
          titleRef.current,
          { y: 50, opacity: 0, clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" },
          {
            y: 0,
            opacity: 1,
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
            duration: 0.8,
            ease: "power3.out",
          },
          "-=1.0"
        )
        .fromTo(
          profileContainerRef.current,
          { y: -800, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.8, ease: "elastic.out(0.7, 0.4)" },
          "-=0.8"
        )
        .fromTo(
          textRef.current?.children || [],
          { y: 40, opacity: 0, rotationX: -45 },
          { y: 0, opacity: 1, rotationX: 0, duration: 1, stagger: 0.15, ease: "back.out(1.2)" },
          "-=1.2"
        )
        .fromTo(
          pillsRef.current?.children || [],
          { scale: 0.5, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)" },
          "-=0.8"
        );

      // Pendulum swinging portrait oscillation
      gsap.to(profileContainerRef.current, {
        rotation: 2.5,
        transformOrigin: "top center",
        yoyo: true,
        repeat: -1,
        duration: 3.2,
        ease: "sine.inOut",
        delay: 2,
      });

      // Ambient rotating background web ornaments
      gsap.to(".bg-web-left", {
        rotation: 360,
        transformOrigin: "center center",
        repeat: -1,
        duration: 70,
        ease: "linear",
      });
      gsap.to(".bg-web-right", {
        rotation: -360,
        transformOrigin: "center center",
        repeat: -1,
        duration: 90,
        ease: "linear",
      });

      // Frame breathing glow
      gsap.to(".glow-frame", {
        boxShadow: "0px 15px 35px rgba(163,21,21,0.25)",
        yoyo: true,
        repeat: -1,
        duration: 2,
        ease: "sine.inOut",
      });

      // Tech pills floating bob
      gsap.to(".tech-pill", {
        y: -4,
        yoyo: true,
        repeat: -1,
        duration: 1.5,
        ease: "sine.inOut",
        stagger: { each: 0.2, from: "random" },
        delay: 1.5,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative w-full min-h-screen bg-gray-50 text-gray-900 py-24 flex items-center justify-center overflow-hidden"
    >
      {/* Hanging Web Left */}
      <div
        ref={webLeftRef}
        className="absolute top-[-50px] left-[-5%] md:left-[2%] flex flex-col items-center pointer-events-none z-0"
      >
        <div className="w-[1px] h-[250px] md:h-[350px] bg-gradient-to-b from-transparent to-gray-300" />
        <img
          src={ASSETS.webImg}
          alt="Hanging Web Left"
          className="bg-web-left w-64 h-64 md:w-96 md:h-96 object-contain -mt-12 opacity-[0.12] mix-blend-multiply"
        />
      </div>

      {/* Hanging Web Right */}
      <div
        ref={webRightRef}
        className="absolute top-[-50px] right-[-5%] md:right-[2%] flex flex-col items-center pointer-events-none z-0"
      >
        <div className="w-[1px] h-[200px] md:h-[300px] bg-gradient-to-b from-transparent to-gray-300" />
        <img
          src={ASSETS.webImg}
          alt="Hanging Web Right"
          className="bg-web-right w-56 h-56 md:w-80 md:h-80 object-contain -mt-10 opacity-[0.12] mix-blend-multiply"
        />
      </div>

      <div className="container mx-auto px-6 md:px-12 lg:px-24 flex flex-col-reverse lg:flex-row items-center lg:items-start gap-12 lg:gap-20 z-10 relative">
        {/* Left Column: Biography & Tech Stack */}
        <div className="flex-1 flex flex-col gap-6 mt-10 lg:mt-0 relative z-20">
          <div className="overflow-hidden">
            <span
              ref={badgeRef}
              className="inline-flex items-center gap-2 text-[#a31515] font-comic tracking-[0.2em] text-sm uppercase"
            >
              <img
                src={ASSETS.spiderIcon}
                alt="Spider"
                className="w-5 h-5 object-contain drop-shadow-sm"
              />
              {ABOUT_DATA.badge}
            </span>
          </div>

          <div className="overflow-hidden py-2">
            <h2
              ref={titleRef}
              className="text-comic-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none"
            >
              {ABOUT_DATA.title}
            </h2>
          </div>

          <div
            ref={textRef}
            className="flex flex-col gap-5 text-gray-900 font-comic-narrative text-base sm:text-lg md:text-xl leading-relaxed max-w-xl mt-2 border-l-4 border-[#a31515] pl-4 sm:pl-5 bg-white/70 backdrop-blur-sm py-4 pr-4 rounded-r-2xl shadow-sm"
            style={{ perspective: "1000px" }}
          >
            {ABOUT_DATA.paragraphs.map((p, idx) => (
              <p key={idx} className="origin-bottom">
                “{p}”
              </p>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="font-comic text-sm uppercase tracking-widest text-[#a31515] mb-4 font-bold border-b border-[#a31515]/30 pb-2 inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#a31515]" />
              Primary Tech Arsenal
            </h3>
            <div ref={pillsRef} className="flex flex-wrap gap-3">
              {ABOUT_DATA.techStack.map((tech, idx) => (
                <div
                  key={idx}
                  className="tech-pill px-4 sm:px-5 py-2 sm:py-2.5 border border-[#a31515]/30 bg-white text-[#a31515] rounded-xl font-comic text-sm sm:text-base tracking-wider hover:bg-[#a31515] hover:text-white hover:border-[#a31515] shadow-sm hover:shadow-[0_8px_20px_rgba(163,21,21,0.3)] transition-all duration-300 cursor-default select-none"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Hanging pendulum swinging portrait */}
        <div className="flex-1 relative flex justify-center items-start min-h-[420px] md:min-h-[550px] w-full pt-0">
          <div
            ref={profileContainerRef}
            className="flex flex-col items-center z-30 group"
          >
            <div className="w-[2px] h-[150px] md:h-[320px] bg-gradient-to-b from-transparent via-[#a31515]/60 to-[#a31515]" />
            <div className="glow-frame relative w-56 h-56 md:w-[320px] md:h-[320px] rounded-full border-[6px] border-[#a31515] p-2 bg-white shadow-2xl transition-transform duration-500 group-hover:scale-105">
              <img
                src={ASSETS.profileImg}
                alt={ABOUT_DATA.title}
                className="w-full h-full object-cover rounded-full grayscale hover:grayscale-0 transition-all duration-700 select-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
