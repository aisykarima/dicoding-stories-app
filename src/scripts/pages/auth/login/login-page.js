import LoginPresenter from './login-presenter';
import * as StoryAPI from '../../../data/api';
import * as AuthUtils from '../../../utils/auth';

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="auth-container">
        <div class="auth-card">
          <h1 class="auth-title">Login</h1>
          <form id="loginForm" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="user@example.com"
                required
              >
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Min. 8 characters"
                minlength="8"
                required
              >
            </div>
            <div id="submitContainer" class="form-submit">
              <button type="submit" class="btn">Login</button>
            </div>
            <div class="auth-footer">
              Don't have an account? <a href="#/register">Register</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Sesuaikan key argumen: model & authModel
    this.#presenter = new LoginPresenter({
      view: this,
      api: StoryAPI,
      auth: AuthUtils,
    });    
    
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      this.showLoading();
      this.#presenter.login({ email, password });
    });
  }

  showLoading() {
    document.getElementById('submitContainer').innerHTML = `
      <button class="btn" disabled>
        <i class="fas fa-spinner fa-spin"></i> Processing...
      </button>
    `;
  }

  hideLoading() {
    document.getElementById('submitContainer').innerHTML = `
      <button type="submit" class="btn">Login</button>
    `;
  }

  showError(message) {
    const form = document.getElementById('loginForm');
    if (!form.querySelector('.auth-error')) {
      const errorEl = document.createElement('div');
      errorEl.className = 'auth-error';
      errorEl.textContent = message;
      form.insertBefore(errorEl, form.querySelector('.form-submit'));
    }
  }

  loginFailed(message) {
    this.hideLoading();
    this.showError(message);
  }

  loginSuccessfully(message, data) {
    // Simpan token dan redirect
    this.hideLoading();
    alert(message);
    this.redirectToHome();
  }

  redirectToHome() {
    window.location.hash = '/';
  }
}
