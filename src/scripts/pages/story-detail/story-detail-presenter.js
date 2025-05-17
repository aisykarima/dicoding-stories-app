export default class StoryDetailPresenter {
    #view;
    #model;
    #storyId;
  
    constructor({ view, model, storyId }) {
      this.#view = view;
      this.#model = model;
      this.#storyId = storyId;
    }
  
    async showStoryDetail() {
      this.#view.showLoading();
      try {
        const response = await this.#model.getStoryById(this.#storyId);
        if (response.error || !response.story) {
          this.#view.showError(response.message || 'Failed to load story');
          return;
        }
  
        this.#view.showStoryDetail(response.story);
      } catch (error) {
        this.#view.showError(error.message || 'An error occurred');
      } finally {
        this.#view.hideLoading();
      }
    }

    async notifyMe() {
      alert('[DEBUG] notifyMe dipanggil!');

      try {
        const registration = await navigator.serviceWorker.ready;

        // Simulasi push notification secara manual
        await registration.showNotification('Simulasi Notifikasi', {
          body: 'Ini simulasi notifikasi dari tombol Try Notify Me.',
          icon: '/icon.png',
        });

        return true;
      } catch (error) {
        alert(`[DEBUG] Error di notifyMe: ${error.message}`);
        return false;
      }
    }

}
  