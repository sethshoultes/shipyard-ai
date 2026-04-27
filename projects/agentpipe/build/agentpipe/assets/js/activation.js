(function() {
	'use strict';
	document.addEventListener('DOMContentLoaded', function() {
		var btn = document.getElementById('agentpipe-copy-btn');
		var urlEl = document.getElementById('agentpipe-mcp-url');
		if (!btn || !urlEl) return;
		btn.addEventListener('click', function() {
			var text = urlEl.textContent.replace(/^POST\s+/, '');
			navigator.clipboard.writeText(text).then(function() {
				btn.textContent = 'Copied!';
				setTimeout(function() {
					btn.textContent = 'Copy URL';
				}, 2000);
			}).catch(function() {
				btn.textContent = 'Failed';
				setTimeout(function() {
					btn.textContent = 'Copy URL';
				}, 2000);
			});
		});
	});
})();