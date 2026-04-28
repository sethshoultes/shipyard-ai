/**
 * narrator.js — Cut (Changelog Theatre)
 *
 * Web Speech API wrapper.
 * Curated voice preference list. Calm pacing.
 * Respects browser auto-play policies (triggers on user click).
 * TTS is optional and off-by-default.
 */

(function (global) {
  'use strict';

  const VOICE_PREFERENCES = [
    { lang: 'en-GB', nameIncludes: 'Daniel' },
    { lang: 'en-GB', nameIncludes: 'Samantha' },
    { lang: 'en-US', nameIncludes: 'Alex' },
    { lang: 'en-US', nameIncludes: 'Samantha' },
    { lang: 'en',    nameIncludes: '' },
  ];

  const DEFAULT_RATE = 0.92;
  const DEFAULT_PITCH = 1.0;
  const DEFAULT_VOLUME = 0.9;

  let synth = null;
  let isEnabled = false;
  let hasUserInteraction = false;
  let pendingUtterance = null;

  function init() {
    if ('speechSynthesis' in global) {
      synth = global.speechSynthesis;
    }
  }

  function selectVoice() {
    if (!synth) return null;
    const voices = synth.getVoices();
    if (!voices || voices.length === 0) return null;

    for (let i = 0; i < VOICE_PREFERENCES.length; i++) {
      const pref = VOICE_PREFERENCES[i];
      const match = voices.find(function (v) {
        const langOk = v.lang && v.lang.toLowerCase().startsWith(pref.lang.toLowerCase());
        const nameOk = pref.nameIncludes.length === 0 ||
          (v.name && v.name.indexOf(pref.nameIncludes) !== -1);
        return langOk && nameOk;
      });
      if (match) return match;
    }

    // Fallback: any English voice
    return voices.find(function (v) {
      return v.lang && v.lang.toLowerCase().startsWith('en');
    }) || voices[0] || null;
  }

  function handleUserInteraction() {
    hasUserInteraction = true;
    if (pendingUtterance) {
      speak(pendingUtterance);
      pendingUtterance = null;
    }
  }

  function speak(text) {
    if (!isEnabled || !text) return;
    if (!synth) return;

    if (!hasUserInteraction) {
      // Browsers block speech without user gesture
      pendingUtterance = text;
      return;
    }

    // Cancel any ongoing speech
    try {
      synth.cancel();
    } catch (e) {
      // Dignified silence
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = selectVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'en-US';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = DEFAULT_RATE;
    utterance.pitch = DEFAULT_PITCH;
    utterance.volume = DEFAULT_VOLUME;

    try {
      synth.speak(utterance);
    } catch (e) {
      // Dignified silence
    }
  }

  function enable(enabled) {
    isEnabled = !!enabled;
    if (isEnabled && !synth) {
      init();
    }
  }

  function stop() {
    if (synth) {
      try {
        synth.cancel();
      } catch (e) {
        // Dignified silence
      }
    }
    pendingUtterance = null;
  }

  // Auto-init if speechSynthesis is available
  if ('speechSynthesis' in global) {
    init();
    // Chrome loads voices asynchronously
    if (typeof synth !== 'undefined' && synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = function () {};
    }
  }

  // Listen for user interaction globally once
  function once(fn) {
    let called = false;
    return function () {
      if (called) return;
      called = true;
      fn();
    };
  }

  global.addEventListener('click', once(handleUserInteraction));
  global.addEventListener('keydown', once(handleUserInteraction));

  // Expose
  global.CutNarrator = {
    enable: enable,
    speak: speak,
    stop: stop,
    getEnabled: function () { return isEnabled; },
    getHasUserInteraction: function () { return hasUserInteraction; },
  };

})(window);
