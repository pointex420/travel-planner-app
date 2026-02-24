import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TripView from '../views/TripView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/trip', component: TripView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})