import Vue from 'vue';
import router from '@/router';
import '@/store';
import '@/elements';
import '@/util/http';
import App from './App.vue';

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
