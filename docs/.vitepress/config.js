export default {
  title: 'LogoHub',
  description: 'Open-source brand logo repository for developers',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { property: 'og:title', content: 'LogoHub - Open-source Logo Repository' }],
    ['meta', { property: 'og:description', content: 'High-quality SVG logos for your next project' }],
  ],

  themeConfig: {
    nav: [
      { text: 'Logos', link: '/logos' },
      { text: 'API', link: '/api' },
      { text: 'Packages', link: '/packages' },
      { text: 'Guide', link: '/guide' },
      { text: 'GitHub', link: 'https://github.com/saeedreza/logohub' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Usage', link: '/guide/usage' },
            { text: 'API Reference', link: '/guide/api' }
          ]
        },
        {
          text: 'Packages',
          items: [
            { text: 'Core', link: '/guide/core' },
            { text: 'React', link: '/guide/react' },
            { text: 'Vue', link: '/guide/vue' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/saeedreza/logohub' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 LogoHub Contributors'
    }
  },

  vite: {
    server: {
      fs: {
        allow: ['..']
      }
    }
  }
} 