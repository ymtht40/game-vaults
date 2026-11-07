// Variable Mapping: I -> getVisibleSliderImages, e -> container

// NOTE: module id: 8545
export function getVisibleSliderImages(container) {
  return [...(container?.querySelectorAll('.circular_slider_image') || [])].filter((image) => {
    const bounds = image.getBoundingClientRect();
    return (
      bounds.right > 0 &&
      bounds.left < window.innerWidth &&
      bounds.bottom > 0 &&
      bounds.top < window.innerHeight
    );
  });
}
