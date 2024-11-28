import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LobbyView from '../views/LobbyView.vue';
import HostView from '../views/HostView.vue';
import Cookies from 'js-cookie'; // Import js-cookie to handle cookies

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: LobbyView,
    },
    {
      path: '/host',
      name: 'host',
      component: HostView,
    },
  ],
});

// Navigation guard to check if playerID exists in the cookie before navigating
router.beforeEach((to, from, next) => {
  // Check if the destination is not the lobby and if playerID exists in the cookie
  const playerID = Cookies.get('playerID');
  const serverURL = Cookies.get('serverURL')

  fetch(serverURL + "status")
  .then(response => {
    if (response.ok) {
      // The server is online and returned a successful response
      if ((!playerID || !serverURL) && to.name !== 'lobby') {
        // If playerID doesn't exist and it's not the lobby page, redirect to the lobby
        next({ name: 'lobby' });
      } else {
        // Otherwise, proceed with navigation
        next();
      }
    } else {
      // The server responded with an error (e.g., 404, 500)
      // Clear all cookies
      const allCookies = Cookies.get();
      for (let cookie in allCookies) {
        Cookies.remove(cookie);
      }
      next({ name: 'lobby' });
    }
  })
  .catch(error => {
    // If there is an error in the fetch (e.g., network issues)
    Cookies.remove('playerID');
    Cookies.remove('serverURL');
    next({ name: 'lobby' });
  });


});

export default router;
