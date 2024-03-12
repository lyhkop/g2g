import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { Quasar, event } from "quasar";
// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";
// Import Quasar css
import "quasar/dist/quasar.css";
import App from "./App.vue";
import { createEditor, useEngineStore } from "./stores";

const editor = createEditor();

const app = createApp(App);

app.use(ElementPlus);
app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
});

const pinia = createPinia();
app.use(pinia);
const engineStore = useEngineStore();

editor.addEventListener("selected:changed", (event: THREE.Event) => {
  const entityId = event.id;
  engineStore.setSelectedEntityId(entityId);
});

editor.addEventListener("scene:update", (event: THREE.Event) => {
  engineStore.updateSceneTree();
});

app.mount("#app");
