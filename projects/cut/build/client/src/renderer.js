/**
 * renderer.js — Cut (Changelog Theatre)
 *
 * Animation engine. Hybrid DOM/CSS for typography and layout.
 * Targets 60 fps on mid-range hardware.
 */

(function (global) {
  'use strict';

  /**
   * Render a single changelog version into the container.
   *
   * @param {HTMLElement} container
   * @param {Object}      entry     — { version, date, bullets }
   * @param {Object}      options
   */
  function renderVersion(container, entry, options) {
    options = options || {};
    const transitionDuration = options.transitionDuration || 800;

    if (!container || !entry) return;

    // Preserve container dimensions to prevent layout shift
    const existing = container.querySelector('.cut-version');
    if (existing) {
      existing.classList.add('cut-exiting');
      // Allow CSS transition out
      setTimeout(function () {
        if (existing.parentNode) {
          existing.parentNode.removeChild(existing);
        }
      }, Math.min(transitionDuration, 400));
    }

    const versionEl = document.createElement('div');
    versionEl.className = 'cut-version';

    // Header: version number + date
    const header = document.createElement('header');
    header.className = 'cut-version-header';

    const title = document.createElement('h2');
    title.className = 'cut-h2 cut-animate-fade-up cut-delay-1';
    title.textContent = 'Version ' + String(entry.version || '').replace(/=/g, '').trim();
    header.appendChild(title);

    if (entry.date) {
      const dateMeta = document.createElement('p');
      dateMeta.className = 'cut-body-small cut-date-meta cut-animate-fade-up cut-delay-2';
      dateMeta.textContent = entry.date;
      header.appendChild(dateMeta);
    }

    const rule = document.createElement('hr');
    rule.className = 'cut-rule cut-animate-rule cut-delay-3';
    header.appendChild(rule);

    versionEl.appendChild(header);

    // Body: bullets
    if (entry.bullets && entry.bullets.length) {
      const list = document.createElement('ul');
      list.className = 'cut-bullet-list';

      entry.bullets.forEach(function (bullet, i) {
        const li = document.createElement('li');
        li.className = 'cut-bullet-item cut-animate-fade-up';
        // Stagger bullets starting at delay-4
        const delayClass = 'cut-delay-' + Math.min(i + 4, 8);
        li.classList.add(delayClass);

        const marker = document.createElement('span');
        marker.className = 'cut-bullet-marker';
        marker.setAttribute('aria-hidden', 'true');
        marker.textContent = '\u2014'; // em dash
        li.appendChild(marker);

        const text = document.createElement('span');
        text.className = 'cut-bullet-text';
        text.textContent = bullet;
        li.appendChild(text);

        list.appendChild(li);
      });

      versionEl.appendChild(list);
    } else {
      const empty = document.createElement('p');
      empty.className = 'cut-body-small cut-animate-fade-up cut-delay-4';
      empty.style.opacity = '0.6';
      empty.textContent = 'No changes recorded for this release.';
      versionEl.appendChild(empty);
    }

    // Footer: progress indicator
    const footer = document.createElement('footer');
    footer.className = 'cut-version-footer cut-animate-fade-in cut-delay-5';

    container.appendChild(versionEl);

    // Trigger reflow to ensure animations fire
    void versionEl.offsetWidth;
  }

  /**
   * Render an error state.
   *
   * @param {HTMLElement} container
   * @param {string}      message
   */
  function renderError(container, message) {
    if (!container) return;
    container.innerHTML = '';

    const errorEl = document.createElement('div');
    errorEl.className = 'cut-error cut-animate-scale-in';

    const icon = document.createElement('div');
    icon.className = 'cut-error-icon';
    icon.textContent = '\u2020'; // dagger
    errorEl.appendChild(icon);

    const title = document.createElement('h3');
    title.className = 'cut-h3';
    title.textContent = 'Format Unrecognised';
    errorEl.appendChild(title);

    const body = document.createElement('p');
    body.className = 'cut-body';
    body.textContent = message || 'Your changelog does not match the expected format.';
    errorEl.appendChild(body);

    const example = document.createElement('pre');
    example.className = 'cut-mono cut-example';
    example.textContent = [
      '== Changelog ==',
      '',
      '= 1.0 =',
      '* First release.',
      '',
      '= 1.1 =',
      '* Fixed a bug.',
      '* Added a feature.'
    ].join('\n');
    errorEl.appendChild(example);

    container.appendChild(errorEl);
  }

  // Expose
  global.CutRenderer = {
    renderVersion: renderVersion,
    renderError: renderError,
  };

})(window);
