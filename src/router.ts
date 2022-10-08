import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import about from './demos/About.vue';
import more from './demos/More.vue';
import basic from './demos/basic/Index.vue';
import advanced from './demos/advanced/Index.vue';
import dynamic from './demos/dynamic/Index.vue';
import weighted from './demos/weighted/Index.vue';
import interactive from './demos/interactive/Index.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'About',
    component: about,
  },
  {
    path: '/basic',
    name: 'Basic Demo',
    component: basic,
  },
  {
    path: '/advanced',
    name: 'Advanced Demo',
    component: advanced,
  },
  {
    path: '/dynamic',
    name: 'In-code Library Creation',
    component: dynamic,
  },
  {
    path: '/weighted',
    name: 'Weighted Selection Sets',
    component: weighted,
  },
  {
    path: '/interactive',
    name: 'User-generated Content',
    component: interactive,
  },
  {
    path: '/more',
    name: 'More Examples',
    component: more,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

export default router;
