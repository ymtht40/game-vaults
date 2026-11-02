// Variable Mapping: t -> sendServerEvent, G -> sendServerEvent, f -> serverEvents, e -> eventName, a -> payload

// NOTE: module id: 185161
export async function sendServerEvent(eventName, payload = {}) {
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, ...payload })
    });
    if (!response.ok) {
      console.warn(`[Events] Failed to send event ${eventName}:`, response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.warn(`[Events] Error sending event ${eventName}:`, error.message);
    return false;
  }
}

export const serverEvents = {
  animationCopied: (animationId, animationTitle, category, platform) =>
    sendServerEvent('animation_copied', {
      animation_id: animationId,
      animation_title: animationTitle,
      category,
      platform
    }),
  animationSaved: (animationId, animationTitle, category) =>
    sendServerEvent('animation_saved', {
      animation_id: animationId,
      animation_title: animationTitle,
      category
    }),
  userActive: () => sendServerEvent('user_active', {})
};

