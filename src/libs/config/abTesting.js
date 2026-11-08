'use client'; // sessionStorage သုံးထားတဲ့အတွက် Client-side မှာပဲ အလုပ်လုပ်ပါမယ်

// NOTE: module id: 499046

// Variable Mapping:
// t -> EXPERIMENT_VARIANTS
// r -> EXPERIMENT_STORAGE_KEY (Export: H)
// y -> isExperimentsEnabled (Export: y)
// _ -> getValidExperiments (Export: _)
// W -> getStoredExperiments (Export: W)

const EXPERIMENT_VARIANTS = {
  hero: ['grid', 'slider'],
  headline: ['award', 'client']
};

export const EXPERIMENT_STORAGE_KEY = 'anm_exp'; // Original Export: H

export const isExperimentsEnabled = false; // Original Export: y

// Original Export: _
// Analytics (PostHog) ဆီပို့ဖို့အတွက် သတ်မှတ်ထားတဲ့ Variant တွေနဲ့ ကိုက်ညီမှုရှိမရှိ စစ်ပြီး exp_ prefix တပ်ပေးတဲ့ function
export function getValidExperiments(experimentsObj, isEnabled = false) {
  const result = {};

  if (!isEnabled || !experimentsObj || typeof experimentsObj !== 'object') {
    return result;
  }

  for (const [key, allowedValues] of Object.entries(EXPERIMENT_VARIANTS)) {
    if (allowedValues.includes(experimentsObj[key])) {
      result[`exp_${key}`] = experimentsObj[key];
    }
  }

  return result;
}

// Original Export: W
// Browser ရဲ့ Session Storage ထဲကနေ လက်ရှိ User ကျနေတဲ့ Experiment Group ကို ပြန်ယူတဲ့ function
export function getStoredExperiments() {
  try {
    const storedValue = window.sessionStorage.getItem(EXPERIMENT_STORAGE_KEY);
    return JSON.parse(storedValue) || null;
  } catch {
    return null;
  }
}

