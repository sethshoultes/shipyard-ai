(function() {
	'use strict';

	var config = window.sousConfig || {};
	var endpoint = config.endpoint || '';
	var businessName = config.businessName || 'Your Business';
	var welcomeText = config.welcomeText || 'Welcome to ' + businessName;

	var widget = document.createElement('div');
	widget.id = 'sous-widget';
	widget.className = 'sous-widget';

	var bubble = document.createElement('div');
	bubble.className = 'sous-widget__bubble';
	bubble.setAttribute('role', 'button');
	bubble.setAttribute('aria-label', 'Open chat');
	bubble.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28"><path fill="currentColor" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
	widget.appendChild(bubble);

	var panel = document.createElement('div');
	panel.className = 'sous-widget__panel';
	panel.setAttribute('role', 'dialog');
	panel.setAttribute('aria-hidden', 'true');

	var header = document.createElement('div');
	header.className = 'sous-widget__header';
	header.innerHTML = '<span class="sous-widget__title">' + escapeHtml(businessName) + '</span>' +
		'<button class="sous-widget__close" aria-label="Close chat">&times;</button>';
	panel.appendChild(header);

	var messages = document.createElement('div');
	messages.className = 'sous-widget__messages';
	panel.appendChild(messages);

	var typing = document.createElement('div');
	typing.className = 'sous-widget__typing';
	typing.innerHTML = '<span></span><span></span><span></span>';
	typing.style.display = 'none';
	panel.appendChild(typing);

	var inputWrap = document.createElement('div');
	inputWrap.className = 'sous-widget__input-wrap';
	var hint = document.createElement('div');
	hint.className = 'sous-widget__hint';
	hint.textContent = 'Ask a question and press Enter';
	inputWrap.appendChild(hint);

	var input = document.createElement('input');
	input.type = 'text';
	input.className = 'sous-widget__input';
	inputWrap.appendChild(input);
	panel.appendChild(inputWrap);
	widget.appendChild(panel);

	document.body.appendChild(widget);

	var isOpen = false;

	function escapeHtml(text) {
		var div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	function addMessage(text, sender) {
		var msg = document.createElement('div');
		msg.className = 'sous-widget__message sous-widget__message--' + sender;
		msg.innerHTML = '<p>' + escapeHtml(text) + '</p>';
		messages.appendChild(msg);
		messages.scrollTop = messages.scrollHeight;
	}

	function showTyping() {
		typing.style.display = 'block';
		messages.scrollTop = messages.scrollHeight;
	}

	function hideTyping() {
		typing.style.display = 'none';
	}

	function togglePanel() {
		isOpen = !isOpen;
		if (isOpen) {
			panel.classList.add('sous-widget__panel--open');
			panel.setAttribute('aria-hidden', 'false');
			input.focus();
			if (messages.childElementCount === 0) {
				addMessage(welcomeText, 'ai');
				addMessage('Your AI assistant is here to help. Ask me anything about ' + escapeHtml(businessName) + '.', 'ai');
			}
		} else {
			panel.classList.remove('sous-widget__panel--open');
			panel.setAttribute('aria-hidden', 'true');
		}
	}

	function sendMessage() {
		var text = input.value.trim();
		if (!text) return;
		addMessage(text, 'user');
		input.value = '';
		showTyping();
		fetch(endpoint, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ question: text, business_name: businessName })
		})
		.then(function(res) { return res.json(); })
		.then(function(data) {
			hideTyping();
			if (data.answer) {
				addMessage(data.answer, 'ai');
			} else {
				addMessage('I am not sure about that, but I am learning every day.', 'ai');
			}
		})
		.catch(function() {
			hideTyping();
			addMessage('Something went wrong. Please try again in a moment.', 'ai');
		});
	}

	bubble.addEventListener('click', togglePanel);
	header.querySelector('.sous-widget__close').addEventListener('click', function(e) {
		e.stopPropagation();
		togglePanel();
	});
	input.addEventListener('keydown', function(e) {
		if (e.key === 'Enter') {
			sendMessage();
		}
	});

	if (window.innerWidth < 480) {
		widget.classList.add('sous-widget--mobile');
	}
})();
