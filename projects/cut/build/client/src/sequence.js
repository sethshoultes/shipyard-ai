/**
 * sequence.js — Cut (Changelog Theatre)
 *
 * The curated cinematic timeline.
 * Orchestrates version reveals, transitions, and narration cues.
 */

(function (global) {
  'use strict';

  const DEFAULT_OPTIONS = {
    versionDuration: 5000,
    transitionDuration: 800,
    autoAdvance: true,
    onVersionStart: null,
    onVersionEnd: null,
    onComplete: null,
    onError: null,
  };

  /**
   * Create a sequence controller.
   *
   * @param {HTMLElement} container — root DOM node
   * @param {Array}       data      — parsed changelog entries
   * @param {Object}      options
   */
  function createSequence(container, data, options) {
    if (!container || !data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Sequence requires a valid container and non-empty data array.');
    }

    const opts = Object.assign({}, DEFAULT_OPTIONS, options);
    let currentIndex = -1;
    let isPlaying = false;
    let timerId = null;
    let narrationEnabled = false;

    function clearTimers() {
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
    }

    function invoke(name, ...args) {
      if (typeof opts[name] === 'function') {
        try {
          opts[name](...args);
        } catch (e) {
          // Dignified silence for callback errors
        }
      }
    }

    function stepTo(index) {
      if (index < 0 || index >= data.length) {
        return false;
      }

      currentIndex = index;
      const entry = data[index];

      invoke('onVersionStart', entry, index);

      // Render the version using the renderer
      if (global.CutRenderer && typeof global.CutRenderer.renderVersion === 'function') {
        global.CutRenderer.renderVersion(container, entry, {
          transitionDuration: opts.transitionDuration,
        });
      }

      // Fire narration cue if enabled
      if (narrationEnabled && global.CutNarrator && typeof global.CutNarrator.speak === 'function') {
        const text = buildNarrationText(entry);
        global.CutNarrator.speak(text);
      }

      return true;
    }

    function buildNarrationText(entry) {
      if (!entry) return '';
      const parts = [];
      if (entry.version) parts.push('Version ' + entry.version.replace(/=/g, '').trim());
      if (entry.date) parts.push(', released ' + entry.date);
      if (entry.bullets && entry.bullets.length) {
        parts.push('. ' + entry.bullets.length + (entry.bullets.length === 1 ? ' change: ' : ' changes: '));
        parts.push(entry.bullets.join('. '));
      }
      return parts.join('');
    }

    function advance() {
      if (!isPlaying) return;

      invoke('onVersionEnd', data[currentIndex], currentIndex);

      if (currentIndex + 1 < data.length) {
        stepTo(currentIndex + 1);
        if (opts.autoAdvance) {
          timerId = setTimeout(advance, opts.versionDuration);
        }
      } else {
        isPlaying = false;
        invoke('onComplete', data);
      }
    }

    function play() {
      if (isPlaying) return;
      isPlaying = true;
      if (currentIndex === -1) {
        stepTo(0);
      }
      if (opts.autoAdvance) {
        timerId = setTimeout(advance, opts.versionDuration);
      }
    }

    function pause() {
      isPlaying = false;
      clearTimers();
    }

    function stop() {
      pause();
      currentIndex = -1;
      container.innerHTML = '';
    }

    function next() {
      if (currentIndex + 1 < data.length) {
        clearTimers();
        stepTo(currentIndex + 1);
        if (isPlaying && opts.autoAdvance) {
          timerId = setTimeout(advance, opts.versionDuration);
        }
      }
    }

    function prev() {
      if (currentIndex > 0) {
        clearTimers();
        stepTo(currentIndex - 1);
        if (isPlaying && opts.autoAdvance) {
          timerId = setTimeout(advance, opts.versionDuration);
        }
      }
    }

    function enableNarration(enabled) {
      narrationEnabled = !!enabled;
    }

    return {
      play: play,
      pause: pause,
      stop: stop,
      next: next,
      prev: prev,
      enableNarration: enableNarration,
      getCurrentIndex: function () { return currentIndex; },
      getIsPlaying: function () { return isPlaying; },
    };
  }

  // Expose
  global.CutSequence = {
    create: createSequence,
  };

})(window);
