import RegisterPresenter from './register-presenter';
import * as StoryAPI from '../../../data/api';

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="auth-container">
        <div class="auth-card">
          <h1 class="auth-title">Register</h1>
          <form id="registerForm" class="auth-form">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input type="text" id="name" name="name" placeholder="Your full name" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" placeholder="user@example.com" required>
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
              <button type="submit" class="btn btn-primary">Register</button>
            </div>
            <div class="auth-footer">
              Already have an account? <a href="#/login">Login</a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      api: StoryAPI,
    });

    document
      .getElementById('registerForm')
      .addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        this.#presenter.register({ name, email, password });
      });
  }

  showLoading() {
    document.getElementById('submitContainer').innerHTML = `
      <button class="btn btn-primary" disabled>
        <i class="fas fa-spinner fa-spin"></i> Processing...
      </button>
    `;
  }

  hideLoading() {
    document.getElementById('submitContainer').innerHTML = `
      <button type="submit" class="btn btn-primary">Register</button>
    `;
  }

  showError(message) {
    const form = document.getElementById('registerForm');
    if (!form.querySelector('.auth-error')) {
      const errorEl = document.createElement('div');
      errorEl.className = 'auth-error';
      errorEl.textContent = message;
      form.insertBefore(errorEl, form.querySelector('.form-submit'));
    }
  }

  redirectToLogin() {
    window.location.hash = '/login';
  }
}