"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function LandingAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animatedItems = Array.from(
      document.querySelectorAll<HTMLElement>("[data-animate]"),
    );
    const counters = Array.from(
      document.querySelectorAll<HTMLElement>("[data-count]"),
    );

    function resetCounters() {
      counters.forEach((counter) => {
        counter.textContent = counter.dataset.count ?? counter.textContent;
      });
    }

    function clearAnimationStyles() {
      animatedItems.forEach((item) => {
        item.style.removeProperty("opacity");
        item.style.removeProperty("visibility");
        item.style.removeProperty("transform");
      });

      const heroChildren = Array.from(
        document.querySelectorAll<HTMLElement>("[data-animate='hero-copy'] > *"),
      );
      const floatingChildren = Array.from(
        document.querySelectorAll<HTMLElement>("[data-animate='hero-visual'] > div"),
      );

      [...heroChildren, ...floatingChildren].forEach((item) => {
        item.style.removeProperty("opacity");
        item.style.removeProperty("visibility");
        item.style.removeProperty("transform");
      });
    }

    if (reduceMotion.matches) {
      resetCounters();
      clearAnimationStyles();
      return;
    }

    let cancelled = false;
    let cleanup = () => {};

    async function runAnimations() {
      const [{ gsap }, ScrollTriggerModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      const ScrollTrigger = ScrollTriggerModule.ScrollTrigger;

      if (cancelled) {
        resetCounters();
        clearAnimationStyles();
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const heroCopyItems = Array.from(
        document.querySelectorAll<HTMLElement>("[data-animate='hero-copy'] > *"),
      );
      const heroVisual = document.querySelector<HTMLElement>(
        "[data-animate='hero-visual']",
      );
      const heroFloatItems = heroVisual
        ? Array.from(heroVisual.querySelectorAll<HTMLElement>(":scope > div"))
        : [];
      const sectionItems = Array.from(
        document.querySelectorAll<HTMLElement>("[data-animate='section']"),
      );
      const cardItems = Array.from(
        document.querySelectorAll<HTMLElement>("[data-animate='card']"),
      );
      const showcase = document.querySelector<HTMLElement>(
        "[data-animate='showcase']",
      );

      const context = gsap.context(() => {
        gsap.killTweensOf([
          ...animatedItems,
          ...heroCopyItems,
          ...heroFloatItems,
          ...counters,
        ]);
        gsap.set([...animatedItems, ...heroCopyItems, ...heroFloatItems], {
          clearProps: "all",
        });

        gsap.from(heroCopyItems, {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          clearProps: "opacity,visibility,transform",
        });

        if (heroVisual) {
          gsap.from(heroVisual, {
            opacity: 0,
            y: 34,
            scale: 0.96,
            duration: 1,
            delay: 0.1,
            ease: "power3.out",
            clearProps: "opacity,visibility,transform",
          });
        }

        gsap.to(heroFloatItems, {
          y: (index) => [10, -12, 8][index] ?? 0,
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.16,
        });

        sectionItems.forEach((item) => {
          gsap.from(item, {
            opacity: 0,
            y: 28,
            duration: 0.72,
            ease: "power3.out",
            clearProps: "opacity,visibility,transform",
            scrollTrigger: {
              trigger: item,
              start: "top 82%",
              once: true,
            },
          });
        });

        cardItems.forEach((item) => {
          gsap.from(item, {
            opacity: 0,
            y: 22,
            duration: 0.56,
            ease: "power3.out",
            clearProps: "opacity,visibility,transform",
            scrollTrigger: {
              trigger: item,
              start: "top 88%",
              once: true,
            },
          });
        });

        if (showcase) {
          gsap.from(showcase, {
            opacity: 0,
            y: 36,
            scale: 0.98,
            duration: 0.82,
            ease: "power3.out",
            clearProps: "opacity,visibility,transform",
            scrollTrigger: {
              trigger: showcase,
              start: "top 78%",
              once: true,
            },
          });
        }

        counters.forEach((counter) => {
          const target = Number(counter.dataset.count ?? 0);
          const value = { current: 0 };

          gsap.to(value, {
            current: target,
            duration: 1.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: counter,
              start: "top 90%",
              once: true,
            },
            onUpdate: () => {
              counter.textContent = Math.round(value.current).toString();
            },
          });
        });
      });

      cleanup = () => {
        context.revert();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        resetCounters();
        clearAnimationStyles();
      };
    }

    const frame = window.requestAnimationFrame(() => {
      runAnimations();
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      cleanup();
      resetCounters();
      clearAnimationStyles();
    };
  }, [pathname]);

  return null;
}
