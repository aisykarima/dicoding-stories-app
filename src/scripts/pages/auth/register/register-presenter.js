export default class RegisterPresenter {
  #view;
  #api;

  constructor({ view, api }) {
    this.#view = view;
    this.#api = api;
  }

  async register({ name, email, password }) {
    // Tampilkan loading di tombol
    this.#view.showLoading();
    try {
      // Panggil API register
      const result = await this.#api.getRegistered({ name, email, password });

      if (!result.ok || result.error) {
        // Gagal register
        this.#view.showError(result.message || 'Registrasi gagal');
        return;
      }

      // Berhasil register: redirect ke login
      alert(result.message); // Contoh notifikasi sukses
      this.#view.redirectToLogin();
    } catch (err) {
      console.error('RegisterPresenter.register error:', err);
      this.#view.showError(err.message || 'Terjadi kesalahan');
    } finally {
      this.#view.hideLoading();
    }
  }
}
