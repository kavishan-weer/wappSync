"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function DashboardAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const page = document.querySelector("[data-dashboard-page]");
    const animatedItems = page
      ? Array.from(page.querySelectorAll("[data-dashboard-animate]"))
      : [];

    function clearAnimationStyles() {
      animatedItems.forEach((item) => {
        if (item instanceof HTMLElement) {
          item.style.removeProperty("opacity");
          item.style.removeProperty("visibility");
          item.style.removeProperty("transform");
        }
      });
    }

    if (reduceMotion.matches || animatedItems.length === 0) {
      clearAnimationStyles();
      return;
    }

    let cancelled = false;
    let cleanup = () => {};

    async function runAnimations() {
      const { gsap } = await import("gsap");

      if (cancelled) {
        clearAnimationStyles();
        return;
      }

      const context = gsap.context(() => {
        gsap.killTweensOf(animatedItems);
        gsap.set(animatedItems, { clearProps: "all" });

        gsap.from(animatedItems, {
          opacity: 0,
          y: 14,
          duration: 0.42,
          ease: "power2.out",
          stagger: 0.035,
          clearProps: "opacity,visibility,transform",
        });
      }, page ?? undefined);

      cleanup = () => {
        context.revert();
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
      clearAnimationStyles();
    };
  }, [pathname]);

  return null;
}
