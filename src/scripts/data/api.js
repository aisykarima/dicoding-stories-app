import { getAccessToken } from '../utils/auth';
import { BASE_URL } from '../config';

const ENDPOINTS = {
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  STORIES: `${BASE_URL}/stories`,
  STORIES_GUEST: `${BASE_URL}/stories/guest`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,
};

export async function getRegistered({ name, email, password }) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const json = await response.json();
  return { ...json, ok: response.ok };
}

export async function getLogin({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await response.json();
  return {
    ...json,
    token: json?.loginResult?.token,
    name: json?.loginResult?.name,
    userId: json?.loginResult?.userId,
    ok: response.ok,
  };
}

export async function getAllStories({ location = 0 } = {}) {
  const token = getAccessToken();
  const response = await fetch(`${BASE_URL}/stories?location=${location}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

export async function getStoryById(id) {
  const token = getAccessToken();

  const response = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await response.json();
  return {
    error: json.error ?? true,
    message: json.message ?? 'Unknown error',
    story: json.story,
    ok: response.ok,
  };
}

export async function storeNewStory({ description, evidenceImages, latitude, longitude }) {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append('description', description);
  evidenceImages.forEach((image) => formData.append('photo', image));

  if (latitude) formData.append('lat', parseFloat(latitude));
  if (longitude) formData.append('lon', parseFloat(longitude));

  try {
    const response = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();

    // ✅ Trigger push notification manually
    if (result && result.data && result.data.id) {
      try {
        // Asumsikan backend akan otomatis kirim push saat story berhasil dibuat
        console.log('[INFO] Story created, backend should trigger push notification');
      } catch (triggerErr) {
        console.error('[ERROR] Failed to trigger notification:', triggerErr);
      }
    }

    return result;
  } catch (error) {
    console.error('Error sending story:', error);
    throw new Error('Gagal mengirim story');
  }
}

export async function storeNewStoryGuest({ description, photo, lat, lon }) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat) formData.append('lat', lat);
  if (lon) formData.append('lon', lon);

  const response = await fetch(ENDPOINTS.STORIES_GUEST, {
    method: 'POST',
    body: formData,
  });

  const json = await response.json();
  return { ...json, ok: response.ok };
}

export async function triggerTestNotification(storyId) {
  const token = getAccessToken();

  const response = await fetch(`${BASE_URL}/notifications/story/${storyId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json();
  return {
    ...json,
    ok: response.ok,
  };
}
