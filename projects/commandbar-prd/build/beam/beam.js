/** Beam Command Palette — vanilla JS, no dependencies */
(function() {
	var beamOverlay = null;
	var beamModal = null;
	var beamInput = null;
	var beamResults = null;
	var beamStyle = null;
	var selectedIndex = -1;
	var visibleItems = [];
	var prevFocus = null;
	var keyListener = null;

	var GROUP_ORDER = ['content', 'users', 'actions', 'admin'];
	var GROUP_LABELS = { content: 'Content', users: 'Users', actions: 'Actions', admin: 'Admin' };

	function ensureStyles() {
		if (beamStyle) return;
		// Inject inline <style> tag
		beamStyle = document.createElement('style');
		beamStyle.textContent =
			'#beam-overlay{' +
				'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:999999;' +
				'opacity:0;transition:opacity 200ms ease;' +
			'}' +
			'#beam-overlay.beam-open{opacity:1}' +
			'#beam-modal{' +
				'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);' +
				'max-width:640px;width:100%;background:#1e1e1e;border-radius:12px;' +
				'box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);' +
			'}' +
			'#beam-input{' +
				'width:100%;background:transparent;color:#fff;border:none;font-size:16px;' +
				'padding:16px 20px;outline:none;box-sizing:border-box;' +
			'}' +
			'#beam-results{' +
				'max-height:400px;overflow-y:auto;' +
			'}' +
			'.beam-group-header{' +
				'text-transform:uppercase;color:#888;font-size:11px;padding:8px 20px;' +
			'}' +
			'.beam-row{' +
				'padding:10px 20px;color:#fff;display:flex;justify-content:space-between;' +
				'cursor:pointer;align-items:center;' +
			'}' +
			'.beam-row.beam-selected{background:#375a7f}' +
			'.beam-empty{' +
				'text-align:center;color:#888;padding:20px;' +
			'}' +
			'.beam-type{color:#888;font-size:12px;text-transform:uppercase;margin-left:8px;flex-shrink:0}';
		document.head.appendChild(beamStyle);
	}

	function buildModal() {
		ensureStyles();
		beamOverlay = document.createElement('div');
		beamOverlay.id = 'beam-overlay';

		beamModal = document.createElement('div');
		beamModal.id = 'beam-modal';
		beamModal.setAttribute('role', 'dialog');
		beamModal.setAttribute('aria-modal', 'true');
		beamModal.setAttribute('aria-label', 'Beam command palette');

		beamInput = document.createElement('input');
		beamInput.id = 'beam-input';
		beamInput.type = 'text';
		beamInput.placeholder = 'Search…';
		beamInput.setAttribute('autocomplete', 'off');
		beamInput.setAttribute('aria-label', 'Search commands');

		beamResults = document.createElement('div');
		beamResults.id = 'beam-results';
		beamResults.setAttribute('aria-live', 'polite');

		beamModal.appendChild(beamInput);
		beamModal.appendChild(beamResults);
		beamOverlay.appendChild(beamModal);

		beamOverlay.addEventListener('click', function(e) {
			if (e.target === beamOverlay) closeModal();
		});
	}

	function openModal() {
		if (!beamOverlay) buildModal();
		prevFocus = document.activeElement;
		document.body.appendChild(beamOverlay);
		requestAnimationFrame(function() {
			beamOverlay.classList.add('beam-open');
		});
		beamInput.value = '';
		beamInput.focus();
		renderResults('');
		keyListener = function(e) { onKeyDown(e); };
		document.addEventListener('keydown', keyListener);
	}

	function closeModal() {
		if (!beamOverlay) return;
		beamOverlay.classList.remove('beam-open');
		if (keyListener) document.removeEventListener('keydown', keyListener);
		setTimeout(function() {
			if (beamOverlay && beamOverlay.parentNode) {
				beamOverlay.parentNode.removeChild(beamOverlay);
			}
			beamOverlay = null;
			beamModal = null;
			beamInput = null;
			beamResults = null;
			visibleItems = [];
			selectedIndex = -1;
		}, 200);
		if (prevFocus && prevFocus.focus) prevFocus.focus();
	}

	function getFocusable() {
		var nodes = beamModal.querySelectorAll('input, [tabindex]:not([tabindex="-1"])');
		return Array.prototype.slice.call(nodes);
	}

	function updateSelection() {
		var rows = beamResults.querySelectorAll('.beam-row');
		rows.forEach(function(row, idx) {
			row.classList.toggle('beam-selected', idx === selectedIndex);
		});
		if (rows[selectedIndex]) rows[selectedIndex].scrollIntoView({ block: 'nearest' });
	}

	function onResultClick(item) {
		if (item.newTab) {
			window.open(item.url, '_blank');
		} else {
			window.location.href = item.url;
		}
	}

	function renderResults(query) {
		var q = (query || '').toLowerCase().trim();
		var all = (typeof beamIndex !== 'undefined' && beamIndex.items) ? beamIndex.items : [];
		var filtered = q ? all.filter(function(it) {
			return it.title.toLowerCase().includes(q);
		}) : all;

		var groups = {};
		filtered.forEach(function(it) {
			var t = it.type || 'content';
			if (!groups[t]) groups[t] = [];
			if (groups[t].length < 5) groups[t].push(it);
		});

		beamResults.innerHTML = '';
		visibleItems = [];
		var hasAny = false;

		GROUP_ORDER.forEach(function(type) {
			if (!groups[type] || !groups[type].length) return;
			hasAny = true;
			var header = document.createElement('div');
			header.className = 'beam-group-header';
			header.textContent = GROUP_LABELS[type] || type;
			beamResults.appendChild(header);
			groups[type].forEach(function(it) {
				visibleItems.push(it);
				var row = document.createElement('div');
				row.className = 'beam-row';
				row.setAttribute('role', 'option');
				var label = document.createElement('span');
				label.textContent = it.title;
				var badge = document.createElement('span');
				badge.className = 'beam-type';
				badge.textContent = GROUP_LABELS[type] || type;
				row.appendChild(label);
				row.appendChild(badge);
				row.addEventListener('click', function() { onResultClick(it); });
				beamResults.appendChild(row);
			});
		});

		if (!hasAny) {
			var empty = document.createElement('div');
			empty.className = 'beam-empty';
			empty.textContent = 'No results';
			beamResults.appendChild(empty);
		}

		selectedIndex = hasAny ? 0 : -1;
		updateSelection();
	}

	function onKeyDown(e) {
		var tag = (e.target.tagName || '').toLowerCase();
		var editable = e.target.isContentEditable;

		if (!beamOverlay || !beamOverlay.parentNode) {
			// Global hotkey
			if (e.key === 'k' && (e.metaKey || e.ctrlKey) && tag !== 'input' && tag !== 'textarea' && !editable) {
				e.preventDefault();
				openModal();
			}
			return;
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			closeModal();
			return;
		}

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (visibleItems.length) {
				selectedIndex = (selectedIndex + 1) % visibleItems.length;
				updateSelection();
			}
			return;
		}

		if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (visibleItems.length) {
				selectedIndex = (selectedIndex - 1 + visibleItems.length) % visibleItems.length;
				updateSelection();
			}
			return;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			if (selectedIndex >= 0 && visibleItems[selectedIndex]) {
				onResultClick(visibleItems[selectedIndex]);
			}
			return;
		}

		if (e.key === 'Tab') {
			e.preventDefault();
			var focusable = getFocusable();
			if (!focusable.length) return;
			var current = document.activeElement;
			var idx = focusable.indexOf(current);
			var next;
			if (e.shiftKey) {
				next = idx <= 0 ? focusable[focusable.length - 1] : focusable[idx - 1];
			} else {
				next = idx === focusable.length - 1 ? focusable[0] : focusable[idx + 1];
			}
			next.focus();
			return;
		}
	}

	document.addEventListener('keydown', onKeyDown);
})();
