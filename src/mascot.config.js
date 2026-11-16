/**
 * Chọn linh vật tại đây, không cần chỉnh scene.js.
 * Có 3 linh vật 3D dựng sẵn: penguin, bunny, bear.
 * showPicker=false để khách chỉ thấy linh vật đã chọn.
 */
export const MASCOT_CONFIG = {
  selected: 'penguin',
  showPicker: true,
  arrivalDuration: 2.8,
};

// Metadata hiển thị trên giao diện, không chứa mã Three.js.
export const MASCOT_PRESETS = {
  penguin: {
    label: 'Pingu',
    kind: 'Chim cánh cụt',
    emoji: '🐧',
    greeting: 'Pingu',
  },
  bunny: {
    label: 'Mochi',
    kind: 'Thỏ bông',
    emoji: '🐰',
    greeting: 'Mochi',
  },
  bear: {
    label: 'Bơ',
    kind: 'Gấu nâu',
    emoji: '🐻',
    greeting: 'Bơ',
  },
};

export const getMascotId = (id) => Object.hasOwn(MASCOT_PRESETS, id) ? id : 'penguin';
