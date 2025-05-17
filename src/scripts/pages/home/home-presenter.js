export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initialGalleryAndMap() {
    try {
      // tampilkan loader untuk map & list
      this.#view.showMapLoading();
      this.#view.showLoading();

      // ambil data stories
      const result = await this.#model.getAllStories({ location: 1 });
      if (result.error) {
        throw new Error(result.message);
      }

      const stories = result.listStory || [];
      this.#view.populateStoriesList(null, stories);

      // inisialisasi peta dengan markers
      this.#view.initialMap(stories);
    } catch (error) {
      this.#view.populateStoriesListError(error.message);
      this.#view.hideMapLoading();
    }
  }
}
