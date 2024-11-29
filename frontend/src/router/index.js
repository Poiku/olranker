import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LobbyView from '../views/LobbyView.vue';
import HostView from '../views/HostView.vue';
import ResultView from '@/views/ResultView.vue';
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
    {
      path: '/result',
      name: 'result',
      component: ResultView,
    },
  ],
});

// Navigation guard to check if playerID exists in the cookie before navigating
router.beforeEach((to, from, next) => {
  // Check if the destination is not the lobby and if playerID exists in the cookie
  const playerID = Cookies.get('playerID');
  const serverURL = Cookies.get('serverURL');
  
  if(to.name == "lobby"){
    clearCookies();
    next();
  }
  else if (!playerID || !serverURL) {
    // If playerID or serverURL is missing, redirect to lobby
    next({ name: 'lobby' });
  } else {
    // If serverURL is present, try fetching the server status
    fetch(serverURL + "status")
      .then(response => {
        if (response.ok) {
          // Server is online, proceed to the next page
          next();
        } else {
          // Server returned an error, clear cookies and go to lobby
          clearCookies();
          next({ name: 'lobby' });
        }
      })
      .catch(error => {
        // Fetch failed (e.g., network error), clear cookies and go to lobby
        clearCookies();
        next({ name: 'lobby' });
      });
  }
  
  function clearCookies() {
    const allCookies = Cookies.get();
    for (let cookie in allCookies) {
      Cookies.remove(cookie);
    }
  }
  
  



});

export default router;
