import { createApp } from 'vue';
import App from './App.vue';
import { loadFonts } from './plugins/webfontloader';
import createVuetify from './plugins/vuetify';

loadFonts();

createApp(App)
    .use(createVuetify)
    .mount('#app');
