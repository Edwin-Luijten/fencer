// Styles
import '@mdi/font/css/materialdesignicons.css'
import '../style.scss';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// Vuetify
import { createVuetify } from 'vuetify'

export default createVuetify(
    {
        components,
        directives,
    }
)
