import { BACKEND_URL } from '../config.js';

// Simple markdown formatter to convert basic md to HTML safe tags
function formatMarkdown(text) {
    if (!text) return '';
    
    // Convert bold **text**
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert lists
    const lines = html.split('\n');
    let inList = false;
    let listType = null; // 'ul' or 'ol'
    const parsedLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        const isUnordered = trimmed.startsWith('* ') || trimmed.startsWith('- ');
        const isOrdered = /^\d+\.\s/.test(trimmed);

        if (isUnordered || isOrdered) {
            if (!inList) {
                inList = true;
                listType = isUnordered ? 'ul' : 'ol';
                parsedLines.push(`<${listType} class="my-2 list-inside list-decimal">`);
            }
            const content = trimmed.replace(/^(\*|\-|\d+\.)\s+/, '');
            parsedLines.push(`<li class="mb-1">${content}</li>`);
        } else {
            if (inList) {
                parsedLines.push(`</${listType}>`);
                inList = false;
                listType = null;
            }
            parsedLines.push(line);
        }
    }
    
    if (inList) {
        parsedLines.push(`</${listType}>`);
    }

    // Join and replace newlines with line breaks (ignoring inside list tags)
    return parsedLines.join('\n')
        .replace(/([^>])\n([^<])/g, '$1<br>$2')
        .replace(/<br><br>/g, '<br>');
}

export function initChat() {
    const container = document.getElementById('chatbot-container');
    const trigger = document.getElementById('chat-trigger');
    const closeBtn = document.getElementById('close-chat');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    const quickSuggestions = document.querySelectorAll('.quick-suggestion');

    if (!container || !trigger || !closeBtn || !form || !input || !messagesContainer) {
        console.warn('Chatbot DOM elements not found.');
        return;
    }

    const chatHistory = []; // Tracks conversation history
    const MAX_HISTORY = 10; // Cap to prevent large contexts

    // Toggle Chat visibility
    trigger.addEventListener('click', () => {
        container.classList.toggle('active');
        if (container.classList.contains('active')) {
            input.focus();
            scrollToBottom();
        }
    });

    closeBtn.addEventListener('click', () => {
        container.classList.remove('active');
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && container.classList.contains('active')) {
            container.classList.remove('active');
        }
    });

    // Handle Quick suggestions
    quickSuggestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.textContent;
            input.value = question;
            sendMessage(question);
        });
    });

    // Handle form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        
        input.value = '';
        sendMessage(text);
    });

    function scrollToBottom() {
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 50);
    }

    function appendUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message user flex items-start space-x-3 justify-end';
        msgDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-[#a50044] border border-white/10 flex items-center justify-center text-xs text-white shrink-0 font-bold">ME</div>
            <div class="message-bubble p-3 max-w-[80%] text-sm leading-relaxed text-white">
                <p>${text}</p>
            </div>
        `;
        messagesContainer.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendBotMessage(text, sources = []) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-message bot flex items-start space-x-3';
        
        // Render citations if present
        let sourcesHTML = '';
        if (sources && sources.length > 0) {
            sourcesHTML = `<div class="source-citation-container">
                <div class="text-[10px] text-gray-400 uppercase tracking-wider mb-1"><i class="fas fa-search-plus"></i> Sources & References:</div>
                <div class="flex flex-wrap gap-1">`;
            
            sources.forEach(src => {
                const isAnchor = src.url.startsWith('#');
                const target = isAnchor ? '' : 'target="_blank"';
                const classSelector = isAnchor ? 'local-anchor-citation' : '';
                sourcesHTML += `
                    <a href="${src.url}" ${target} class="source-badge ${classSelector} text-[11px]">
                        <i class="${isAnchor ? 'fas fa-link' : 'fas fa-globe'} text-xs"></i> ${src.title}
                    </a>`;
            });
            
            sourcesHTML += `</div></div>`;
        }

        msgDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-[#002855] border border-white/10 flex items-center justify-center text-xs text-white shrink-0 font-bold">BB</div>
            <div class="message-bubble p-3 max-w-[80%] text-sm leading-relaxed text-white border border-white/5">
                <div class="bot-text">${formatMarkdown(text)}</div>
                ${sourcesHTML}
            </div>
        `;
        messagesContainer.appendChild(msgDiv);

        // Bind local anchor click handlers to close chat widget and scroll smoothly
        msgDiv.querySelectorAll('.local-anchor-citation').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                container.classList.remove('active');
                
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        scrollToBottom();
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'chat-typing-indicator';
        indicator.className = 'chat-message bot flex items-start space-x-3';
        indicator.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-[#002855] border border-white/10 flex items-center justify-center text-xs text-white shrink-0 font-bold">BB</div>
            <div class="message-bubble p-3 rounded-2xl rounded-tl-none bg-white/10 text-sm flex items-center space-x-2 border border-white/5">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('chat-typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    async function sendMessage(messageText) {
        appendUserMessage(messageText);
        showTypingIndicator();

        try {
            const response = await fetch(`${BACKEND_URL}/api/rag/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: messageText,
                    history: chatHistory
                })
            });

            removeTypingIndicator();

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || errData?.message || `Server returned status ${response.status}`);
            }

            const data = await response.json();
            appendBotMessage(data.text, data.sources);

            // Add to conversation history (maintaining max capacity limit)
            chatHistory.push({ role: 'user', content: messageText });
            chatHistory.push({ role: 'assistant', content: data.text });
            if (chatHistory.length > MAX_HISTORY * 2) {
                chatHistory.splice(0, 2); // Remove oldest turn
            }

        } catch (error) {
            removeTypingIndicator();
            appendBotMessage(`Apologies, I'm having trouble connecting to my central squad repository right now. Please try again! (Error: ${error.message})`);
        }
    }
}
