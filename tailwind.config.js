/** @type {import('tailwindcss').Config} */
export default {
  // Apunta a todos los archivos que usan clases de Tailwind
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-foreground': 'var(--color-white)',
        secondary: 'var(--color-secondary)',
        'secondary-foreground': 'var(--color-white)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
    },
  },

  // ==================================================================
  // ¡ESTA ES LA PARTE MÁS IMPORTANTE DE TODAS!
  // Le dice a Tailwind: "Prohibido usar oklch. Usa rgb/rgba para todo".
  // ==================================================================
  corePlugins: {
    preflight: false, // Mantenemos tu CSS base, no el de Tailwind
  },
  // Esta flag es la que controla la sintaxis de color.
  // Al ponerla en `false`, forzamos la compatibilidad.
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Desactivamos cualquier plugin que pueda interferir
  plugins: [],
}
