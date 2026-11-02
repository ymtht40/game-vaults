// Variable Mapping: t -> eventQueue, r -> flushIntervalId, n -> flushDeadline, o -> pendingSuperProperties, a -> flushQueue, i -> scheduleFlush, u -> captureEvent, s -> analytics, H -> analytics, U -> analytics, x -> trackRetention


let eventQueue = [];
let flushIntervalId = null;
let flushDeadline = 0;
let pendingSuperProperties = null;

const flushQueue = () => {
  const posthog = window.posthog;
  if (!posthog || typeof posthog.capture !== 'function') {
    if (Date.now() > flushDeadline) {
      eventQueue = [];
      pendingSuperProperties = null;
      clearInterval(flushIntervalId);
      flushIntervalId = null;
    }
    return;
  }

  if (pendingSuperProperties && typeof posthog.register === 'function') {
    try {
      posthog.register(pendingSuperProperties);
    } catch (error) {}
  }
  pendingSuperProperties = null;

  const queuedEvents = eventQueue;
  eventQueue = [];
  clearInterval(flushIntervalId);
  flushIntervalId = null;

  for (const { eventName, properties, options, at } of queuedEvents) {
    try {
      posthog.capture(eventName, properties, {
        ...(options || {}),
        timestamp: at,
      });
    } catch (error) {}
  }
};

const scheduleFlush = () => {
  if (!flushIntervalId) {
    flushDeadline = Date.now() + 20000;
    flushIntervalId = setInterval(flushQueue, 200);
  }
};

const captureEvent = (eventName, properties = {}, options) => {
  const posthog = window.posthog;
  if (posthog && typeof posthog.capture === 'function') {
    if (eventQueue.length || pendingSuperProperties) {
      flushQueue();
    }
    try {
      posthog.capture(eventName, properties, options);
    } catch (error) {}
    return;
  }

  if (eventQueue.length < 30) {
    eventQueue.push({
      eventName,
      properties,
      options,
      at: new Date(),
    });
    scheduleFlush();
  }
};

const identifyUser = (userId, traits = {}) => {
  const posthog = window.posthog;
  if (posthog && typeof posthog.identify === 'function') {
    try {
      posthog.identify(userId, traits);
    } catch (error) {}
  }
};

const registerSuperProperties = (properties) => {
  const posthog = window.posthog;
  if (
    posthog &&
    typeof posthog.capture === 'function' &&
    typeof posthog.register === 'function'
  ) {
    try {
      posthog.register(properties);
    } catch (error) {}
    return;
  }

  pendingSuperProperties = {
    ...(pendingSuperProperties || {}),
    ...properties,
  };
  scheduleFlush();
};

// NOTE: module id: 943348
export const analytics = {
  identify: (userId, traits = {}) => {
    identifyUser(userId, {
      ...traits,
      identified_at: new Date().toISOString(),
    });
  },

  reset: () => {
    const posthog = window.posthog;
    if (posthog && typeof posthog.reset === 'function') {
      try {
        posthog.reset();
      } catch (error) {}
    }
  },

  animation: {
    viewed: (animationId, animationName, category, tags = []) => {
      captureEvent('animation_viewed', {
        animation_id: animationId,
        animation_name: animationName,
        category,
        tags,
        timestamp: new Date().toISOString(),
      });
    },
    copied: (animationId, animationName, platform, category) => {
      captureEvent('animation_copied', {
        animation_id: animationId,
        animation_name: animationName,
        platform,
        category,
        timestamp: new Date().toISOString(),
      });
    },
    saved: (animationId, animationName, category) => {
      captureEvent('animation_saved', {
        animation_id: animationId,
        animation_name: animationName,
        category,
        timestamp: new Date().toISOString(),
      });
    },
    unsaved: (animationId, animationName, category) => {
      captureEvent('animation_unsaved', {
        animation_id: animationId,
        animation_name: animationName,
        category,
        timestamp: new Date().toISOString(),
      });
    },
  },

  features: {
    voted: (featureId, featureTitle, voteAction, featureCategory) => {
      captureEvent('feature_voted', {
        feature_id: featureId,
        feature_title: featureTitle,
        vote_action: voteAction,
        feature_category: featureCategory,
        timestamp: new Date().toISOString(),
      });
    },
    submitted: (featureId, featureTitle, featureCategory) => {
      captureEvent('feature_submitted', {
        feature_id: featureId,
        feature_title: featureTitle,
        feature_category: featureCategory,
        timestamp: new Date().toISOString(),
      });
    },
  },

  search: {
    performed: (query, resultsCount, filters = {}) => {
      captureEvent('search_performed', {
        query,
        results_count: resultsCount,
        filters,
        timestamp: new Date().toISOString(),
      });
    },
    filtered: (filters, resultsCount) => {
      captureEvent('filters_applied', {
        filters,
        results_count: resultsCount,
        timestamp: new Date().toISOString(),
      });
    },
  },

  askAi: {
    clicked: (platform) => {
      captureEvent('ask_ai_clicked', {
        platform,
        timestamp: new Date().toISOString(),
      });
    },
  },

  user: {
    signedIn: (method = 'email') => {
      captureEvent('user_signed_in', {
        method,
        timestamp: new Date().toISOString(),
      });
    },
    signedOut: () => {
      captureEvent('user_signed_out', {
        timestamp: new Date().toISOString(),
      });
    },
    profileUpdated: (updatedFields = []) => {
      captureEvent('profile_updated', {
        updated_fields: updatedFields,
        timestamp: new Date().toISOString(),
      });
    },
    themeChanged: (theme) => {
      captureEvent('theme_changed', {
        theme,
        timestamp: new Date().toISOString(),
      });
    },
  },

  activation: {
    onboardingCompleted: (totalTimeMs, stepsCompleted) => {
      captureEvent('onboarding_completed', {
        total_time_ms: totalTimeMs,
        steps_completed: stepsCompleted,
        timestamp: new Date().toISOString(),
      });
    },
  },

  revenue: {
    checkoutStarted: (plan, price, billingCycle, extraProperties = {}) => {
      captureEvent('checkout_started', {
        plan,
        price,
        billing_cycle: billingCycle,
        ...extraProperties,
        timestamp: new Date().toISOString(),
      });
    },
    checkoutAbandoned: (reason = 'user_canceled') => {
      captureEvent('checkout_abandoned', {
        reason,
        timestamp: new Date().toISOString(),
      });
    },
  },

  feature: {
    codeViewerOpened: (animationId, platform) => {
      captureEvent('code_viewer_opened', {
        animation_id: animationId,
        platform,
        timestamp: new Date().toISOString(),
      });
    },
    supportContacted: (method) => {
      captureEvent('support_contacted', {
        method,
        timestamp: new Date().toISOString(),
      });
    },
  },

  error: {
    occurred: (errorType, errorMessage, context = {}) => {
      captureEvent('error_occurred', {
        error_type: errorType,
        error_message: errorMessage,
        context,
        timestamp: new Date().toISOString(),
      });
    },
    exception: (error, context = {}) => {
      const posthog = window.posthog;
      if (posthog && typeof posthog.captureException === 'function') {
        try {
          posthog.captureException(error, {
            $exception_level: 'error',
            $exception_type: error?.name || 'Error',
            $exception_message: error?.message || String(error),
            ...context,
          });
        } catch (err) {}
      }
      captureEvent('error_occurred', {
        error_type: error?.name || 'Error',
        error_message: error?.message || String(error),
        context,
        timestamp: new Date().toISOString(),
      });
    },
  },

  register: (properties) => registerSuperProperties(properties),

  track: (eventName, properties = {}, options) => {
    captureEvent(
      eventName,
      {
        ...properties,
        timestamp: new Date().toISOString(),
      },
      options
    );
  },

  isFeatureEnabled: (flagKey) => {
    const posthog = window.posthog;
    if (posthog && typeof posthog.isFeatureEnabled === 'function') {
      try {
        return posthog.isFeatureEnabled(flagKey);
      } catch (error) {}
    }
    return false;
  },

  getFeatureFlag: (flagKey) => {
    const posthog = window.posthog;
    if (posthog && typeof posthog.getFeatureFlag === 'function') {
      try {
        return posthog.getFeatureFlag(flagKey);
      } catch (error) {}
    }
    return null;
  },
};

export const trackRetention = (userId, signupDate) => {
  const daysSinceSignup = Math.floor(
    (new Date() - new Date(signupDate)) / 86400000
  );

  if (daysSinceSignup === 7) {
    analytics.track('week_1_retention', {
      user_id: userId,
      days_since_signup: daysSinceSignup,
    });
  } else if (daysSinceSignup === 14) {
    analytics.track('week_2_retention', {
      user_id: userId,
      days_since_signup: daysSinceSignup,
    });
  } else if (daysSinceSignup === 30) {
    analytics.track('month_1_retention', {
      user_id: userId,
      days_since_signup: daysSinceSignup,
    });
  }
};