// if (!UseDebug) {
Vue.config.devtools = false;
Vue.config.debug = false;
Vue.config.silent = true;
// }

Vue.config.ignoredElements = ['app'];

var app = new Vue({
  el: '#app',
  data: {
    // app data
    appDataVersion: '0.0.001',
    newVersionAvailable: false,

    visualStateShowNofication: false,
    visualStateShowModal: false,
    // DOM reference
    documentCssRoot: document.querySelector(':root'),
  },

  methods: {
    HandleUpdateAppButtonClick() {
      note('HandleUpdateAppButtonClick() called');
      this.newVersionAvailable = false;
      if (this.serviceWorker !== '') {
        window.location.reload(true);
      }
    },

    HandleServiceWorkerRegistration() {
      note('HandleServiceWorkerRegistration() called');
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('./sw.js')
          .then((reg) => {
            log('Service worker registered with scope:', reg.scope);
          })
          .catch((error) => {
            error('Service worker registration failed:', error);
          });
      }
      if (navigator.serviceWorker !== undefined) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data === 'updateAvailable') {
            if (this.serviceWorker !== '') {
              this.serviceWorker.postMessage({ action: 'skipWaiting' });
            }
          }
        });
      }
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.newVersionAvailable = true;
      });
    },
  },

  mounted() {
    announce('App Initialized');
    // this.HandleServiceWorkerRegistration();
  },

  computed: {},
});
