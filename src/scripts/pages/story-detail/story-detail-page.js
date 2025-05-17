import { generateStoryDetailTemplate, generateLoaderAbsoluteTemplate } from '../../templates';
import { parseActivePathname } from '../../routes/url-parser';
import StoryDetailPresenter from './story-detail-presenter';
import * as StoryAPI from '../../data/api';
import L from 'leaflet';
import { IDB } from '../../utils/idb';

export default class StoryDetailPage {
  #presenter = null;

  async render() {
    return `
      <section class="container">
        <div id="story-detail-container">
          <div id="story-detail"></div>
          <div id="loading-container"></div>
          <div id="notify-feedback" class="snackbar" hidden>Notifikasi berhasil dikirim!</div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const { id } = parseActivePathname();
    this.#presenter = new StoryDetailPresenter({
      view: this,
      model: StoryAPI,
      storyId: id,
    });
    await this.#presenter.showStoryDetail();
  }

  showLoading() {
    document.getElementById('loading-container').innerHTML = generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById('loading-container').innerHTML = '';
  }

  showStoryDetail(story) {
    document.getElementById('story-detail').innerHTML = generateStoryDetailTemplate(story);

    if (story.lat !== undefined && story.lon !== undefined) {
      setTimeout(() => {
        this.initMap(story.lat, story.lon);
      }, 0);
    }

    const button = document.getElementById('notify-story-button');
    const feedback = document.getElementById('notify-feedback');
    const bookmarkBtn = document.getElementById('bookmark-story-button');

    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', async () => {
        try {
          await IDB.saveStory(story);
          alert('Cerita berhasil disimpan ke bookmark!');
        } catch (err) {
          alert('Gagal menyimpan bookmark: ' + err.message);
        }
      });
    }

    if (button && feedback) {
      button.addEventListener('click', async () => {
      alert('Tombol diklik'); // <== Tambahkan ini dulu
      button.disabled = true;
      button.textContent = 'Mengirim...';

      try {
        const success = await this.#presenter.notifyMe?.();
        alert('notifyMe dijalankan'); // <== Tambahkan ini juga

        if (success) {
          alert('Notifikasi berhasil dikirim!'); // <== Tambahkan ini juga
          feedback.hidden = false;
          feedback.classList.add('show');

          setTimeout(() => {
            feedback.classList.remove('show');
            feedback.hidden = true;
          }, 3000);

          button.textContent = 'Berhasil Dikirim!';
        } else {
          alert('Gagal kirim notifikasi'); // <== Tambahkan ini juga
          button.textContent = 'Gagal Kirim';
        }
      } catch (error) {
        alert(`Error saat kirim notifikasi: ${error.message}`);
        button.textContent = 'Error';
      } finally {
        setTimeout(() => {
          button.textContent = 'Dapatkan Notifikasi';
          button.disabled = false;
        }, 3000);
      }
    });
    }
  }

  async initMap(lat, lon) {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    mapContainer.style.height = '300px';

    const map = L.map(mapContainer).setView([lat, lon], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const markerIcon = L.icon({
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });

    try {
      const locationName = await reverseGeocode(lat, lon);

      L.marker([lat, lon], { icon: markerIcon })
        .addTo(map)
        .bindPopup(`Lokasi: ${locationName}`)
        .openPopup();
    } catch (error) {
      L.marker([lat, lon], { icon: markerIcon })
        .addTo(map)
        .bindPopup('Lokasi tidak dikenal')
        .openPopup();
    }
  }

  showError(message) {
    document.getElementById('story-detail').innerHTML = `
      <div class="error-message">${message || 'Failed to load story'}</div>
    `;
  }
}

async function reverseGeocode(lat, lon) {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
  if (!response.ok) throw new Error('Gagal mendapatkan nama lokasi');

  const data = await response.json();
  return data.display_name || 'Lokasi tidak dikenal';
}
