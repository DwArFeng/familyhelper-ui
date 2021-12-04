import Vue from 'vue';
import store from './store';
import '@/vim';
import router from '@/router';
import '@/elements';
import App from './App.vue';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
