import {
  generateLoaderAbsoluteTemplate,
  generateStoryItemTemplate,
  generateStoryListEmptyTemplate,
  generateStoryListErrorTemplate,
} from '../../templates';
import HomePresenter from './home-presenter';
import * as StoryAPI from '../../data/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// konfig marker icon kalau diperlukan bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

export default class HomePage {
  #presenter = null;
  #stories = [];

  async render() {
    document.getElementById('main-content')?.classList.add('home-page');
    return `
      <section class="home-page">
        <div class="stories-list__map__container">
          <div id="map" class="stories-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container">
        <h1 class="section-title">Daftar Story</h1>
        <p class="story-list-description">
          Temukan berbagai cerita menarik dari para pengguna yang telah berbagi pengalaman mereka di berbagai lokasi.
        </p>
        <div class="stories-list__container">
          <div id="stories-list"></div>
          <div id="stories-list-loading-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAPI,
    });
    await this.#presenter.initialGalleryAndMap();
  }

  populateStoriesList(message, stories) {
    this.#stories = stories;
    this.hideLoading();

    if (stories.length <= 0) {
      this.populateStoriesListEmpty();
      return;
    }

    const html = stories.map(story =>
      generateStoryItemTemplate({
        id: story.id,
        photoUrl: story.photoUrl,
        description: story.description,
        name: story.name,
        createdAt: story.createdAt,
        lat: story.lat,
        lon: story.lon,
      })
    ).join('');

    document.getElementById('stories-list').innerHTML = `
      <div class="stories-list">${html}</div>
    `;
  }

  populateStoriesListEmpty() {
    this.hideLoading();
    document.getElementById('stories-list').innerHTML =
      generateStoryListEmptyTemplate();
  }

  populateStoriesListError(message) {
    this.hideLoading();
    document.getElementById('stories-list').innerHTML =
      generateStoryListErrorTemplate(message);
  }

  showMapLoading() {
    const loader = document.getElementById('map-loading-container');
    loader.innerHTML = generateLoaderAbsoluteTemplate();
    loader.style.display = 'flex';      // tampilkan overlay
  }
  
  hideMapLoading() {
    const loader = document.getElementById('map-loading-container');
    loader.style.display = 'none';      // sembunyikan overlay
    loader.innerHTML = '';
  }
  
  showLoading() {
    document.getElementById('stories-list-loading-container').innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById('stories-list-loading-container').innerHTML = '';
  }

  initialMap(stories) {
    this.hideMapLoading();

    const map = L.map('map').setView(
      stories.length > 0
        ? [stories[0].lat, stories[0].lon]
        : [-6.200000, 106.816666],
      5
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    stories.forEach((story) => {
      if (story.lat != null && story.lon != null) {
        L.marker([story.lat, story.lon])
          .addTo(map)
          .bindPopup(`<strong>${story.name}</strong><br>${story.description}`);
      }
    });
  }
}
