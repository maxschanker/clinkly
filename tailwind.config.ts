import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'playfair': ['Playfair Display', 'serif'],
				'dancing': ['Dancing Script', 'cursive'],
				'arial': ['Arial', 'sans-serif'],
				'inter': ['Inter', 'system-ui', 'sans-serif'],
				'space': ['"Space Grotesk"', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sparkle: {
					'1': 'hsl(var(--sparkle-1))',
					'2': 'hsl(var(--sparkle-2))',
					'3': 'hsl(var(--sparkle-3))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'3xl': '2rem'
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)', 
				'gradient-background': 'var(--gradient-background)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-sunset': 'var(--gradient-sunset)'
			},
			backgroundColor: {
				'soft-peach': 'var(--bg-soft-peach)',
				'warm-cream': 'var(--bg-warm-cream)',
				'golden-mist': 'var(--bg-golden-mist)',
				'coral-blush': 'var(--bg-coral-blush)',
				'sunset-glow': 'var(--bg-sunset-glow)'
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)',
				'warm': 'var(--shadow-warm)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'sparkle': {
					'0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
					'50%': { opacity: '1', transform: 'scale(1.2)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'heart-beat': {
					'0%, 100%': { transform: 'scale(1)' },
					'25%': { transform: 'scale(1.1)' },
					'50%': { transform: 'scale(1.05)' },
					'75%': { transform: 'scale(1.15)' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						opacity: '0.8',
						transform: 'scale(1)',
						filter: 'brightness(1)'
					},
					'50%': { 
						opacity: '1',
						transform: 'scale(1.05)',
						filter: 'brightness(1.2)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'sparkle': 'sparkle 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
				'heart-beat': 'heart-beat 1.5s ease-in-out infinite',
				'wiggle': 'wiggle 1s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
