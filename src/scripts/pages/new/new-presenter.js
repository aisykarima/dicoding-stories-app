export default class NewPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async postNewStory(data) {
    try {
      const result = await this.#model.storeNewStory(data);
      if (result.error === false) {
        this.#view.storeSuccessfully('Story berhasil dibuat!');
      } else {
        this.#view.storeFailed('Gagal membuat story, coba lagi.');
      }
    } catch (error) {
      this.#view.storeFailed('Terjadi kesalahan, coba lagi.');
      console.error('Error posting new story:', error);
    }
  }   
}
