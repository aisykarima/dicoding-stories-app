import NewPresenter from './new-presenter';
import { convertBase64ToBlob } from '../../utils';
import * as StoryAPI from '../../data/api';
import { generateLoaderAbsoluteTemplate } from '../../templates';
import Camera from '../../utils/camera';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default class NewPage {
  #presenter;
  #form;
  #camera;
  #isCameraOpen = false;
  #takenDocumentations = [];
  #map;

  constructor() {
    this.#presenter = new NewPresenter({ view: this, model: StoryAPI });
  }

  async render() {
    return `
    <a href="#main-content" class="skip-link">Lewati ke konten utama</a>
      <section>
        <div class="new-story__header">
          <div class="container">
            <h1 class="new-story__header__title">Buat Story Baru</h1>
            <p class="new-story__header__description">
              Silakan lengkapi formulir di bawah untuk membuat story baru.<br>
              Pastikan story yang dibuat adalah valid.
            </p>
          </div>
        </div>
      </section>
      <section class="container">
        <div class="new-form__container">
          <form id="new-form" class="new-form">
            <div class="form-control">
              <label for="description">Apa Ceritamu Hari ini?</label>
              <textarea name="description" id="description" required></textarea>
            </div>
            <div class="form-control">
            </div>
            <div class="form-control">
              <div class="new-form__documentations__container">
                <div class="new-form__documentations__buttons">
                  <button id="documentations-input-button" class="btn btn-outline" type="button">
                    Ambil Gambar
                  </button>
                  <input
                    id="documentations-input"
                    name="documentations"
                    type="file"
                    accept="image/*"
                    multiple
                    hidden="hidden"
                    aria-describedby="documentations-more-info"
                  >
                  <button id="open-documentations-camera-button" class="btn btn-outline" type="button">
                    Buka Kamera
                  </button>
                </div>
                <div id="camera-container" class="new-form__camera__container" style="display: none;">
                  <video id="camera-video" class="new-form__camera__video">
                    Video stream not available.
                  </video>
                  <canvas id="camera-canvas" class="new-form__camera__canvas"></canvas>
                  <div class="new-form__camera__tools">
                    <select id="camera-select"></select>
                    <div class="new-form__camera__tools_buttons">
                      <button id="camera-take-button" class="btn" type="button">
                        Ambil Gambar
                      </button>
                    </div>
                  </div>
                </div>
                <ul id="documentations-taken-list" class="new-form__documentations__outputs"></ul>
              </div>
            </div>
            <div class="form-control">
              <label for="latitude">Latitude</label>
              <input type="text" name="latitude" id="latitude" required />
            </div>
            <div class="form-control">
              <label for="longitude">Longitude</label>
              <input type="text" name="longitude" id="longitude" required />
            </div>
            <div id="new-form-map" style="height: 300px; margin-top: 1rem; border-radius: 8px;"></div>
            <div id="submit-button-container" class="form-control">
              <button class="btn" type="submit">Buat Story</button>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({ view: this, model: StoryAPI });
    this.#setupForm();
    this.#setupDocumentationsInput();
    this.#setupCamera();
    this.showNewFormMap();
  }

  async #setupForm() {
    const submitButton = document.querySelector('button[type="submit"]');
    this.#form = document.getElementById('new-form');

    this.#form.addEventListener('submit', async (event) => {
      event.preventDefault();
      submitButton.disabled = true;

      const data = {
        description: this.#form.elements.namedItem('description').value,
        evidenceImages: this.#takenDocumentations.map((picture) => picture.blob),
        latitude: this.#form.elements.namedItem('latitude').value,
        longitude: this.#form.elements.namedItem('longitude').value,
      };      

      await this.#presenter.postNewStory(data);

      submitButton.disabled = false;
    });
  }

  #setupDocumentationsInput() {
    const input = document.getElementById('documentations-input');
    const inputButton = document.getElementById('documentations-input-button');
  
    inputButton.addEventListener('click', () => {
      input.click();
    });
  
    input.addEventListener('change', async () => {
      const files = input.files;
      if (!files.length) return;
    
      for (const file of files) {
        if (file.size > 1024 * 1024) {
          alert('File terlalu besar. Maksimal 1MB.');
          continue;
        }
        await this.#addTakenPicture(file);
      }
    
      this.#populateTakenPictures();
    });    
  }  

  async #setupCamera() {
    if (!this.#camera) {
      this.#camera = new Camera({
        video: document.getElementById('camera-video'),
        cameraSelect: document.getElementById('camera-select'),
        canvas: document.getElementById('camera-canvas'),
      });
    }

    const openCameraBtn = document.getElementById('open-documentations-camera-button');
    openCameraBtn.addEventListener('click', async () => {
      this.#isCameraOpen = !this.#isCameraOpen;
      const cameraContainer = document.getElementById('camera-container');
      cameraContainer.style.display = this.#isCameraOpen ? 'block' : 'none';
      openCameraBtn.textContent = this.#isCameraOpen ? 'Tutup Kamera' : 'Buka Kamera';

      if (this.#isCameraOpen) {
        try {
          await this.#camera.launch();
        } catch (error) {
          console.error('Camera initialization failed:', error);
          alert('Unable to access the camera. Please check your permissions.');
        }
      }
    });

    document.getElementById('camera-take-button').addEventListener('click', async () => {
      const picture = await this.#camera.takePicture();
      await this.#addTakenPicture(picture);
      this.#populateTakenPictures();
    });
  }

  async #addTakenPicture(image) {
    let blob = image;
    if (typeof image === 'string') {
      blob = await convertBase64ToBlob(image, 'image/png');
    }
  
    const newDocumentation = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
    };
  
    this.#takenDocumentations.push(newDocumentation);  // Simpan gambar yang diambil
  }
  
  async #populateTakenPictures() {
    const html = this.#takenDocumentations.map((picture) => {
      const imageUrl = URL.createObjectURL(picture.blob);
      return `
        <li class="new-form__documentations__outputs-item">
          <button type="button" data-deletepictureid="${picture.id}" class="new-form__documentations__outputs-item__delete-btn">
            <img src="${imageUrl}" alt="Dokumentasi">
          </button>
        </li>
      `;
    }).join('');

    document.getElementById('documentations-taken-list').innerHTML = html;

    document.querySelectorAll('button[data-deletepictureid]').forEach((button) =>
      button.addEventListener('click', (event) => {
        const pictureId = event.currentTarget.dataset.deletepictureid;

        const deleted = this.#removePicture(pictureId);
        if (!deleted) {
          console.log(`Picture with id ${pictureId} was not found`);
        }

        this.#populateTakenPictures();
      }),
    );
  }

  #removePicture(id) {
    const selectedPicture = this.#takenDocumentations.find((picture) => picture.id === id);

    if (!selectedPicture) {
      return null;
    }

    this.#takenDocumentations = this.#takenDocumentations.filter((picture) => picture.id !== selectedPicture.id);
    return selectedPicture;
  }

  async showNewFormMap() {
    const latInput = document.getElementById('latitude');
    const lonInput = document.getElementById('longitude');
    const mapContainer = document.getElementById('new-form-map');

    const defaultLat = -6.200000;
    const defaultLon = 106.816666;

    this.#map = L.map(mapContainer).setView([defaultLat, defaultLon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.#map);

    const marker = L.marker([defaultLat, defaultLon], { draggable: true }).addTo(this.#map);

    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      latInput.value = lat.toFixed(6);
      lonInput.value = lng.toFixed(6);
    });

    if (!latInput.value || !lonInput.value) {
      latInput.value = defaultLat;
      lonInput.value = defaultLon;
    }
  }

  storeFailed(error) {
    console.error('Gagal menyimpan story:', error);
    alert('Story gagal dikirim. Silakan coba lagi.');
  }

  async #showStoryCreatedNotification(description) {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (Notification.permission === 'granted' && subscription) {
      new Notification('Story berhasil dibuat', {
        body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
        icon: 'images/logo.png',
      });
    }
  }

  storeSuccessfully(message) {
    console.log('Story berhasil disimpan:', message);
    alert(message);

    const description = this.#form.elements.namedItem('description')?.value || '';
    this.#showStoryCreatedNotification(description);

    window.location.href = '#/home';
  }
}
