// use this to decode a token and get the user's information out of it
import decode from 'jwt-decode';

// create a new class to instantiate for a user
class AuthService {
  // get user data
  getProfile(user) {
    let profile = user ? user : decode(this.getToken());
    return profile;
  }

  // check if user's logged in
  loggedIn() {
    // Checks if there is a saved token and it's still valid
    const token = this.getToken();
    let storedUser = localStorage.getItem(`user`) ? JSON.parse(localStorage.getItem(`user`)) || null : null;
    let userIsLoggedIn = storedUser != null || (!!token && !this.isTokenExpired(token));
    return userIsLoggedIn; // handwaiving here
  }

  // check if token is expired
  isTokenExpired(token) {
    try {
      const decoded = decode(token);
      if (decoded.exp < Date.now() / 1000) {
        return true;
      } else return false;
    } catch (err) {
      return false;
    }
  }

  getToken() {
    // Retrieves the user token from localStorage
    return localStorage.getItem(`id_token`);
  }

  login(idToken) {
    // Saves user token to localStorage
    if (Object.keys(idToken).length > 0) {
      localStorage.setItem(`id_token`, idToken);
    } else {
      localStorage.setItem(`id_token`, idToken);
    }
    window.location.assign(`/`);
  }

  logout() {
    // Clear user token and profile data from localStorage
    localStorage.removeItem(`saved_books`);
    localStorage.removeItem(`id_token`);
    localStorage.removeItem(`user`);
    // this will reload the page and reset the state of the application
    window.location.assign(`/`);
  }
}

export default new AuthService();