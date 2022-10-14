<template>
  <v-app>
    <v-main>
      <div id="title">
        <span class="title f">F</span>
        <span class="title e">E</span>
        <span class="title n">N</span>
        <span class="title c">C</span>
        <span class="title e">E</span>
        <span class="title r">R</span>
      </div>

      <template v-if="configured">
        <v-card id="fences" width="400">
          <v-card-title>Fences</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="(fence, i) in fences" :title="fence.name" @click="doSelectDrawing(fence.id)">
                <template v-slot:append>
                  <v-icon icon="mdi-circle-edit-outline" @click="doOpenRename(i, fence.name)"/>
                  <v-icon icon="mdi-close" @click="doDelete(i)"/>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-btn block :disabled="fences.length === 0" @click="exportModal.open = true">Export</v-btn>
          </v-card-actions>
        </v-card>

        <v-dialog width="400" content-class="search-dialog"
                  v-model="searchModal.open">
          <v-card>
            <v-card-title class="d-flex">
              <h5>Search</h5>
              <v-spacer></v-spacer>
              <v-btn size="small" variant="plain" icon @click="searchModal.open = false">
                <v-icon icon="mdi-close"/>
              </v-btn>
            </v-card-title>
            <v-divider/>
            <v-card-text>
              <v-text-field
                  label="Search"
                  v-model="searchModal.q"
              />
              <v-list v-if="searchModal.items.length">
                <v-list-item v-for="(item, i) in searchModal.items"
                             :key="`item-${item.osm_id}`"
                             :title="item.display_name"
                             :subtitle="item.type"
                             @click="doDraw(i)"></v-list-item>
              </v-list>
              <v-progress-circular v-if="searchModal.loading"
                                   indeterminate
                                   color="primary"
              ></v-progress-circular>
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" block @click="doSearch">Search</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog width="400" content-class="rename-dialog"
                  v-model="renameModal.open">
          <v-card>
            <v-card-title class="d-flex">
              <h5>Rename</h5>
              <v-spacer></v-spacer>
              <v-btn size="small" variant="plain" icon @click="renameModal.open = false">
                <v-icon icon="mdi-close"/>
              </v-btn>
            </v-card-title>
            <v-divider/>
            <v-card-text>
              <v-text-field
                  label="New name"
                  v-model="renameModal.name"
              />
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" block @click="doRename">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog width="400" content-class="export-dialog"
                  v-model="exportModal.open">
          <v-card>
            <v-card-title class="d-flex">
              <h5>Export</h5>
              <v-spacer></v-spacer>
              <v-btn size="small" variant="plain" icon @click="exportModal.open = false">
                <v-icon icon="mdi-close"/>
              </v-btn>
            </v-card-title>
            <v-divider/>
            <v-card-text>
              <v-text-field
                  label="Filename"
                  v-model="exportModal.filename"
                  suffix=".json"
              />
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" block @click="doExport">Download</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

      </template>

      <div id="map"/>

      <v-dialog width="400" content-class="settings-dialog"
                v-model="setupModal.open">
        <v-card>
          <v-card-title class="d-flex">
            <h5>Settings</h5>
            <v-spacer></v-spacer>
            <v-btn size="small" variant="plain" icon @click="setupModal.open = false">
              <v-icon icon="mdi-close"/>
            </v-btn>
          </v-card-title>
          <v-divider/>
          <v-card-text>
            <v-form v-model="setupModal.formValid" lazy-validation ref="settingsForm">
              <v-text-field
                  label="Mapbox token"
                  hint="Get one here https://account.mapbox.com"
                  :persistent-hint="true"
                  v-model="setupModal.mapboxToken"
                  required
                  :rules="[v => !!v || 'A token is required']"
              />

              <v-combobox
                  class="mt-5"
                  label="Mapbox style"
                  hint="Get or create one here https://studio.mapbox.com"
                  :persistent-hint="true"
                  v-model="setupModal.mapboxStyle"
                  required
                  :rules="[v => !!v || 'A style is required']"
                  :items="['mapbox://styles/edwinluijten/cjztygmjy058k1cqfofn4h3rs', 'mapbox://styles/edwinluijten/cl986x23a002i14qucfp6jbjo', 'mapbox://styles/mapbox/light-v10', 'mapbox://styles/mapbox/dark-v10']"
              />

              <v-text-field
                  class="mt-5"
                  label="Email"
                  hint="When making a lot of requests, consider adding your email as per https://nominatim.org/release-docs/develop/api/Search under section: Other"
                  :persistent-hint="true"
                  v-model="setupModal.email"
              />
            </v-form>

          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" block @click="doSaveSettings">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog width="400" content-class="faq-modal"
                v-model="faqModal.open">
        <v-card>
          <v-card-title class="d-flex">
            <h5>FAQ</h5>
            <v-spacer></v-spacer>
            <v-btn size="small" variant="plain" icon @click="faqModal.open = false">
              <v-icon icon="mdi-close"/>
            </v-btn>
          </v-card-title>
          <v-divider/>
          <v-card-text>
            <h4>How to select multiple features?</h4>
            <p>SHIFT + CLICK<br/></p>

          </v-card-text>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<style lang="scss">
.v-main {
  background-color: #333;
}

#title {
  position: absolute;
  z-index: 999;
  left: 70px;
  top: 10px;
  color: #FF00F0;
  font-size: 2em;
  margin: 0;

  padding: 0 15px 0 0;
  border-bottom: 1px solid #ffff00;
  border-right: 1px solid #42f5f2;

  .title {
    margin-right: 5px;
  }
}

#map {
  width: 100%;
  height: 100vh;
}

#fences {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 999;
}

.mapboxgl-ctrl-top-left {
  top: 10px;
  left: 10px;
}

.mapboxgl-ctrl-group {
  border-radius: 0;

  button:first-child, button:last-child {
    border-radius: 0 !important;
  }
}

.mapboxgl-ctrl-group button.active {
  background-color: rgba(0, 0, 0, .2);
}

.mapboxgl-ctrl-icon {
  padding: 5px;
}

</style>

<script setup lang="ts">
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { onMounted, Ref, ref, watch } from 'vue';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

import { EditorControl } from './mapbox/editor-control';
import { Fence } from './types/fence';
import { SearchModal } from './types/search-modal';
import { RenameModal } from './types/rename-modal';
import { Settings } from './types/settings';
import { SetupModal } from './types/setup-modal';
import { useGeolocation } from './composables/use-geolocation';
import { SimpleModal } from './types/simple-modal';
import { DownloadModal } from './types/download-modal';

const {pos} = useGeolocation();

const SETTINGS_KEY = 'fencer';
const settings: Ref<Settings> = ref(JSON.parse(window.localStorage.getItem(SETTINGS_KEY)) ?? {
  mapboxStyle: 'mapbox://styles/edwinluijten/cjztygmjy058k1cqfofn4h3rs',
  mapboxToken: null,
  email: null,
  introduced: false,
});

const settingsForm = ref(null);
const configured = ref(false);

const map: Ref<mapboxgl.Map | null> = ref(null);
const draw: Ref<MapboxDraw | null> = ref(null);
const allowedTypes = new Set(['administrative']);
const fences: Ref<Fence[]> = ref([]);

const setupModal: Ref<SetupModal> = ref({
  open: false,
  formValid: false,
  mapboxToken: settings.value?.mapboxToken ?? null,
  mapboxStyle: settings.value?.mapboxStyle ?? '',
  email: settings.value?.email ?? null,
  rules: [
    v => !!v || 'Required'
  ],
});

const searchModal: Ref<SearchModal> = ref({
  open: false,
  loading: false,
  q: null,
  items: [],
});

const renameModal: Ref<RenameModal> = ref({
  open: false,
  idx: -1,
  name: '',
});

const faqModal: Ref<SimpleModal> = ref({
  open: false,
});

const exportModal: Ref<DownloadModal> = ref({
  open: false,
  filename: 'export',
});

watch(settings, async (n: Settings, o: Settings) => {
  console.log('settings changed', o, n);
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(n));
  if (n.mapboxToken || n.mapboxToken?.length > 0) {
    configured.value = true;
  }
}, {deep: true});

watch(configured, async (n) => {
  if (n) setupMap();
});

watch(pos, async (n) => {
  map.value?.flyTo({
    center: n,
    zoom: 10,
  });
});

watch(setupModal, async (n) => {
  if (!n.open) {
    const {valid,} = await settingsForm.value.validate();
    if (valid) configured.value = true;
  }
});

watch(faqModal, async (n) => {
  if (!n.open) {
    if (!settings.value.introduced) {
      settings.value.introduced = true;
    }
  }
}, {deep: true});

const doSearch = async () => {
  searchModal.value.loading = true;
  let append = '';
  if (settings.value.email && settings.value.email.length > 0) {
    append += `&email=${settings.value.email}`;
  }

  const resp = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${searchModal.value.q}&polygon_geojson=1&format=jsonv2&limit=5${append}`, {
    method: 'GET',
    headers: {
      'User-Agent': 'Fencer',
    }
  });

  const data = await resp.json();

  searchModal.value.loading = false;
  searchModal.value.items = data.filter(l => allowedTypes.has(l.type));
};

const doDraw = (idx: number) => {
  const item = searchModal.value.items[idx];

  const existingIdx = fences.value.findIndex(f => f.osmId === item.osm_id);
  if (existingIdx === -1) {
    const [id] = draw.value?.add({
      type: 'Feature',
      properties: {
        osmId: item.osm_id,
        name: item.display_name,
      },
      geometry: {
        type: 'Polygon',
        coordinates: item.geojson.coordinates,
      }
    });

    fences.value.push({
      id: id,
      osmId: item.osm_id,
      name: item.display_name,
      coordinates: item.geojson.coordinates[0],
    });

    map.value?.flyTo({
      center: {lat: item.lat, lng: item.lon},
    });
  }
};

const doOpenRename = (idx: number, name: string) => {
  renameModal.value = {
    idx: idx,
    open: true,
    name: name,
  };
};

const doRename = () => {
  fences.value[renameModal.value.idx].name = renameModal.value.name;

  renameModal.value = {
    idx: -1,
    open: false,
    name: '',
  };
};

const doDelete = (idx: number) => {
  const item = fences.value[idx];

  draw.value?.delete(item.id);
  fences.value.splice(idx, 1);
};

const doSelectDrawing = (id: string) => {
  draw.value?.changeMode('simple_select', {featureIds: [id]});
};

const doSaveSettings = async () => {
  await settingsForm.value.validate();

  if (setupModal.value.formValid) {
    settings.value = {
      mapboxToken: setupModal.value.mapboxToken,
      mapboxStyle: setupModal.value.mapboxStyle,
      email: setupModal.value.email,
      introduced: settings.value.introduced,
    };

    setupModal.value.open = false;
    configured.value = true;

    if (!settings.value.introduced) faqModal.value.open = true;
    setupMap();
  }
};

const doExport = async () => {
  const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fences.value));
  const el = document.createElement('a');
  el.setAttribute('href', data);
  el.setAttribute('download', `${exportModal.value.filename.replace(/\.[^/.]+$/, '')}.json`);
  document.body.appendChild(el);
  el.click();
  el.remove();
};

const setupMap = () => {
  if (!settings.value.mapboxToken || settings.value.mapboxToken.length === 0) {
    setupModal.value.open = true;

    return;
  }

  configured.value = true;
  mapboxgl.accessToken = settings.value.mapboxToken as string;

  map.value = new mapboxgl.Map({
    style: settings.value.mapboxStyle,
    container: 'map',
    center: pos.value,
  });

  draw.value = new MapboxDraw({
    displayControlsDefault: false,
    keybindings: false,
    controls: {
      polygon: true,
      trash: true,
      combine_features: true,
      uncombine_features: true,
    },
    defaultMode: 'simple_select',
  });

  map.value?.addControl(draw.value as MapboxDraw, 'top-left');

  map.value?.addControl(new EditorControl({
    settingsCallback: () => {
      configured.value = false;
      setupModal.value.open = true;
    },
    searchCallback: () => {
      searchModal.value.open = !searchModal.value.open;
    },
    faqCallback: () => {
      faqModal.value.open = !faqModal.value.open;
    }
  }), 'top-left');


  map.value?.on('draw.delete', (ev) => {
    ev.features.forEach(feature => {
      const idx = fences.value.findIndex(f => f.id === feature.id);
      fences.value.splice(idx, 1);
      draw.value?.delete([feature.id]);
    });
  });

  map.value?.on('draw.create', (ev) => {
    const feature = ev.features[0];

    if (!feature.properties.osmId) {
      fences.value.push({
        id: feature.id,
        osmId: 0,
        name: `item-${fences.value.length + 1}`,
        coordinates: feature.geometry.coordinates,
      });
    }
  });

  map.value?.on('draw.combine', (ev) => {
    const fencesToDelete = ev.deletedFeatures.map(f => f.id);
    let mergedName = '';

    fencesToDelete.forEach((id) => {
      const idx = fences.value.findIndex(f => f.id === id);
      mergedName += ` ${fences.value[idx].name}`;
      fences.value.splice(idx, 1);
    });

    let coordinates = [];
    ev.createdFeatures.forEach(feature => {
      feature.geometry.coordinates.forEach(c => c.forEach(cc => coordinates = [...coordinates, ...cc]));

      fences.value.push({
        id: feature.id,
        osmId: 0,
        name: `${mergedName.replace(/MERGED/, '')}`,
        coordinates: coordinates,
      });
    });
  });

  map.value?.on('draw.uncombine', (ev) => {
    const fencesToDelete = ev.deletedFeatures.map(f => f.id);

    fencesToDelete.forEach((id) => {
      const idx = fences.value.findIndex(f => f.id === id);
      fences.value.splice(idx, 1);
    });

    ev.createdFeatures.forEach(feature => {
      fences.value.push({
        id: feature.id,
        osmId: feature.properties.osmId,
        name: feature.properties.name,
        coordinates: feature.geometry.coordinates,
      });
    });
  });
};

onMounted(async () => {
  if (!settings.value || !settings.value?.mapboxToken) {
    setupModal.value.open = true;
    return;
  }

  if (settings.value && settings.value?.mapboxToken && !settings.value?.introduced) {
    faqModal.value.open = true;
    return;
  }

  setupMap();
});

</script>
