import { IDB } from '../utils/idb';
import { generateStoryItemTemplate } from '../templates';

export default class BookmarkPage {
  async render() {
    return `
        <section class="bookmark-wrapper">
            <h2>Bookmark Cerita</h2>
            <p class="bookmark-description">
            Cerita-cerita favoritmu ada di sini. Simpan, lihat kembali, dan kelola sesukamu.
            </p>
            <div id="bookmark-list" class="bookmark-grid"></div>
        </section>
    `;
    }

  async afterRender() {
    const stories = await IDB.getAllStories();
    const container = document.getElementById('bookmark-list');

    if (!stories.length) {
      container.innerHTML = '<p>Tidak ada bookmark.</p>';
      return;
    }

    container.innerHTML = stories.map(story => {
    return `
        <div class="bookmark-item">
        ${generateStoryItemTemplate(story)}
        <div style="padding: 0 1rem 1rem; text-align: center;">
            <button class="btn delete-bookmark-button" data-id="${story.id}">Hapus</button>
        </div>
        </div>
    `;
    }).join('');

    document.querySelectorAll('.delete-bookmark-button').forEach(button => {
      button.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        await IDB.deleteStory(id);
        alert('Bookmark dihapus.');
        this.afterRender();
      });
    });
  }
}
