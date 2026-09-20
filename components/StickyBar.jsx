"use client";

import { useState, useEffect } from "react";

export default function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    // Mostrar el botón cuando el usuario baja 300px o más
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <button
            onClick={scrollToTop}
            aria-label="Volver arriba"
            className="fixed bottom-6 right-6 z-50 p-3 bg-primary-custom hover:bg-[#266360] text-white rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none"
        >
            {/* Icono de flecha hacia arriba */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
        </button>
    );
}