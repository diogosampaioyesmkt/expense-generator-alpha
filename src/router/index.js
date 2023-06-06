import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from "@/services/auth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/home' },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/HomeView')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView')
    },
    {
      path: '/validate',
      name: 'validate',
      component: () => import('@/views/ValidationView.vue')
    },
    {
      path: '/estimates',
      name: 'estimates',
      component: () => import('@/components/Estimates.vue')
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  const { loggedUser } = useAuth();
  await loggedUser.value; // Wait for the loggedUser promise to resolve

  if (to.name !== 'login' && !loggedUser.value) {
    next('/login'); // Redirect to the login page if not logged in
  } else {
    next(); // Continue navigation
  }
});

export default router;
