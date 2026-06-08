import "./style.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import notificationPlugin from "./plugins/notification";
import "./services/setupInterceptors";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(notificationPlugin);

app.mount("#app");
