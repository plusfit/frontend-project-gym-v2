/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik'],
        poppins: ['Rubik']
      },
      colors: {
        primary: {
          300: '#61D1E2',
          400: '#009FB7',
          500: '#025E6C'
        },
        secondary: {
          100: '#F3EDFA',
          200: '#D3C3E5',
          300: '#9F84BD',
          400: '#360A66'
        },
        neutral: {
          50: '#FFFFFF',
          100: '#FCFCFD',
          200: '#F8FAFC',
          300: '#EEF2F6',
          400: '#E3E8EF',
          500: '#CDD5DF',
          600: '#9AA4B2',
          700: '#697586',
          800: '#4B5565',
          900: '#364152',
          1000: '#202939',
          1100: '#121926'
        },
        success: {
          50: '#F2FFFA',
          100: '#00A05A',
          200: '#007341',
          300: '#004C2B'
        },
        warning: {
          50: '#FFF7E5',
          100: '#D9A136',
          200: '#8C6823',
          300: '#665229'
        },
        error: {
          50: '#FFE5E5',
          100: '#D93636',
          200: '#A62929',
          300: '#662929'
        },
        info: {
          50: '#E5EEFF',
          100: '#366CD9',
          200: '#264D99',
          300: '#293D66'
        }
      },
      fontSize: {
        'display-xl': [
          '56px',
          {
            lineHeight: '60px',
            letterSpacing: '0px',
            fontWeight: '700'
          }
        ],
        'display-lg': [
          '48px',
          {
            lineHeight: '52px',
            letterSpacing: '0px',
            fontWeight: '700'
          }
        ],
        'display-md': [
          '40px',
          {
            lineHeight: '44px',
            letterSpacing: '0px',
            fontWeight: '700'
          }
        ],
        'display-sm': [
          '32px',
          {
            lineHeight: '36px',
            letterSpacing: '0px',
            fontWeight: '700'
          }
        ],
        'display-xs': [
          '24px',
          {
            lineHeight: '28px',
            letterSpacing: '0px',
            fontWeight: '700'
          }
        ],
        'body-xxl': [
          '18px',
          {
            lineHeight: '22px',
            letterSpacing: '0px',
            fontWeight: '700'
          }
        ],
        'body-xl': [
          '16px',
          {
            lineHeight: '20px',
            letterSpacing: '0px',
            fontWeight: '700'
          }
        ],
        'body-lg': [
          '16px',
          {
            lineHeight: '20px',
            letterSpacing: '0px',
            fontWeight: '500'
          }
        ],
        'body-md': [
          '16px',
          {
            lineHeight: '20px',
            letterSpacing: '0px',
            fontWeight: '400'
          }
        ],
        'body-sm': [
          '14px',
          {
            lineHeight: '18px',
            letterSpacing: '0px',
            fontWeight: '400'
          }
        ],
        'body-xs': [
          '12px',
          {
            lineHeight: '16px',
            letterSpacing: '0px',
            fontWeight: '600'
          }
        ],
        'button-lg': [
          '20px',
          {
            lineHeight: '32px',
            letterSpacing: '0px',
            fontWeight: '700'
          }
        ],
        'button-md': [
          '16px',
          {
            lineHeight: '24px',
            letterSpacing: '0px',
            fontWeight: '700'
          }
        ],
        'link-lg': [
          '16px',
          {
            lineHeight: '20px',
            letterSpacing: '0px',
            fontWeight: '500'
          }
        ]
      },
      borderRadius: {
        none: '0',
        xs: '0.125rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '1rem',
        xl: '1.25rem',
        xxl: '1.50rem'
      },
      boxShadow: {
        100: '0 2px 2px 0 rgba(112, 144, 176, 0.1)',
        200: '0 6px 6px 0 rgba(112, 144, 176, 0.1)',
        300: '0 12px 12px 0 rgba(0, 0, 0, 0.1)',
        400: '0 24px 24px 0 rgba(0, 0, 0, 0.1)',
        'button-100': '0px 2px 2px 0px rgba(112,144,176,0.1), 0px 0px 0px 4px rgba(216,225,240,1)',
        'button-200': '0px 2px 2px 0px rgba(112,144,176,0.1), 0px 0px 0px 4px rgba(247,247,248,1)',
        'button-300': '0px 2px 2px 0px rgba(112,144,176,0.1), 0px 0px 0px 4px rgba(161,229,186,1)',
        'button-400': '0px 2px 2px 0px rgba(112,144,176,0.1), 0px 0px 0px 4px rgba(255,229,229,1)',
        input: '0px 2px 2px 0px rgba(112,144,176,0.1), 0px 0px 0px 2px rgba(216, 225, 240, 1)',
        'input-error': '0px 2px 2px 0px rgba(112,144,176,0.1), 0px 0px 0px 4px rgba(255, 229, 229, 0.1)'
      }
    }
  },
  plugins: []
};
