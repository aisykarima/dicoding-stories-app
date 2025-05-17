export default class LoginPresenter {
  #view;
  #api;
  #auth;

  constructor({ view, api, auth }) {
    this.#view = view;
    this.#api = api;
    this.#auth = auth;
  }

  async login({ email, password }) {
    this.#view.showLoading();
    try {
      const result = await this.#api.getLogin({ email, password });

      if (!result.ok || result.error) {
        this.#view.showError(result.message || 'Login failed');
        return;
      }

      this.#auth.putAccessToken(result.token);

      this.#view.redirectToHome();
    } catch (err) {
      console.error('LoginPresenter login error:', err);
      this.#view.showError(err.message || 'An error occurred');
    }
  }
}
