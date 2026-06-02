// Support Center Alpine Component
export default () => ({
    activeQueue: 'all',
    selectedConvoId: null,
    conversations: [],
    newMessage: '',
    isGeneratingDraft: false,
    isTyping: false,
    isAnalyzing: false,
    showEmoji: false,

    init() {
        // 1. Hydrate all conversations from server-rendered JSON
        const dataEl = document.getElementById('all-tickets-data');
        if (dataEl) {
            try {
                this.conversations = JSON.parse(dataEl.textContent);
            } catch (e) {
                console.error('Failed to parse ticket data:', e);
                this.conversations = [];
            }
        }

        // 2. Read active ticket ID from hidden input (set by Blade)
        const activeIdEl = document.getElementById('active-ticket-id');
        if (activeIdEl && activeIdEl.value) {
            this.selectedConvoId = parseInt(activeIdEl.value, 10);
        }

        // 3. Initial message hydration is allowed (server render). After this, updates come only via WebSocket.
        if (this.selectedConvoId) {
            const msgEl = document.getElementById('initial-messages-data');
            if (msgEl) {
                try {
                    const msgs = JSON.parse(msgEl.textContent);
                    const convo = this.conversations.find(c => c.id === this.selectedConvoId);
                    if (convo) {
                        convo.messages = msgs;
                    }
                } catch (e) {
                    console.error('Failed to parse message data:', e);
                }
            }
        }

        // Realtime updates ONLY via native WebSocket (Go is the single source of realtime)
        this.connectWebSocket();
        this.$nextTick(() => this.scrollToBottom());
    },



    get currentConvo() {
        return this.conversations.find(c => c.id === this.selectedConvoId) || null;
    },

    get filteredConversations() {
        if (this.activeQueue === 'all') return this.conversations;
        return this.conversations.filter(c => c.queue === this.activeQueue);
    },

    selectConvo(id) {
        this.selectedConvoId = id;
    },

    // WebSocket realtime updates
    connectWebSocket() {
        if (this._ws) return;

        // Strict: connect ONLY to Go WS
        // Strict: connect ONLY to Go WS
        const userId = (window.currentUserId ?? '0');
        const wsUrl = `ws://127.0.0.1:8080/ws?userId=${encodeURIComponent(String(userId))}`;



        this.isTyping = false;

        try {
            this._ws = new WebSocket(wsUrl);

            this._ws.onopen = () => {
                // Subscribe to support channel
                this._ws.send(JSON.stringify({ action: 'subscribe', channels: ['support'] }));
            };

            this._ws.onmessage = (evt) => {
                try {
                    const msg = JSON.parse(evt.data);

                    // Expected shape from Go: { event_type, timestamp, data }
                    const eventType = msg.event_type || msg.eventType;
                    const data = msg.data || {};

                    // Support message creation
                    if (eventType === 'support.message.created') {
                        const payload = data.message || data.payload || data;

                        const ticketPk = payload.ticket_id || payload.support_ticket_id || this.selectedConvoId;
                        const convo = this.conversations.find(c => String(c.id) === String(ticketPk));

                        if (!convo) return;

                        // Normalize message
                        const role = payload.role || 'system';
                        const content = payload.content || payload.message || '';

                        convo.messages.push({
                            role: role,
                            content: content,
                            type: payload.type || 'text',
                            time: payload.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            options: payload.options || null,
                            confidence: payload.ai_confidence || payload.confidence,
                            file_url: payload.file_url,
                            preview: payload.preview,
                        });

                        this.scrollToBottom();
                        this.isTyping = false;
                    }

                    // Support file upload events
                    if (eventType === 'support.file.uploaded' || eventType === 'support.file.created') {
                        const payload = data.file || data.payload || data;
                        const ticketPk = data.ticket_id || data.payload?.ticket_id || this.selectedConvoId;
                        const convo = this.conversations.find(c => String(c.id) === String(ticketPk));

                        if (!convo) return;

                        const fileName = payload.file_name || payload.name || payload.file?.name || 'attachment';
                        const fileMime = payload.file_mime || payload.mime || payload.file?.mime;
                        const fileUrl = payload.file_url || (payload.file?.content_base64 ? `data:${fileMime};base64,${payload.file.content_base64}` : null);

                        convo.messages.push({
                            role: 'file',
                            content: fileName,
                            type: 'file',
                            time: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            file_url: fileUrl,
                            preview: fileUrl,
                            mime: fileMime,
                        });

                        this.scrollToBottom();
                        this.isTyping = false;
                    }
                } catch (e) {
                    console.error('WS parse error', e);
                }
            };

            this._ws.onerror = () => {
                this.isTyping = false;
                window.showToast?.('Realtime connection error', 'error');
            };

            this._ws.onclose = () => {
                this.isTyping = false;
                // no polling, but allow reconnect
                setTimeout(() => {
                    this._ws = null;
                    this.connectWebSocket();
                }, 2500);
            };
        } catch (e) {
            console.error('WS init failed', e);
        }
    },



    // ─── Send text message ───────────────────────────────────────────
    async sendMessage() {
        if (!this.newMessage.trim() || !this.selectedConvoId) return;
        this.isTyping = true;


        const messageText = this.newMessage;
        this.newMessage = '';
        this.showEmoji = false;

        // Optimistically add message to UI
        const optimisticMsg = {
            role: 'admin',
            content: messageText,
            type: 'text',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        if (this.currentConvo) {
            this.currentConvo.messages.push(optimisticMsg);
            this.scrollToBottom();
        }

        try {
            const response = await fetch('/admin/support/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    message: messageText,
                    ticket_id: this.selectedConvoId
                })
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Send failed:', response.status, text);
                window.showToast('Failed to send message', 'error');
                this.isTyping = false;
                return;
            }


            const data = await response.json();
            this.isTyping = false;
            if (!data.success) {
                window.showToast('Failed to send message', 'error');
                return;
            }


        // Realtime AI response comes only from WS broadcast (no polling / no fake local AI render).


        } catch (error) {
            console.error('Error sending message:', error);
            window.showToast('Network error', 'error');
            this.isTyping = false;
        }
    },

    // ─── Upload file / image ─────────────────────────────────────────
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file || !this.selectedConvoId) {
            window.showToast('Please select a conversation first', 'warning');
            return;
        }

        // Reset input so the same file can be selected again
        event.target.value = '';

        const formData = new FormData();
        formData.append('file', file);
        formData.append('ticket_id', this.selectedConvoId);

        try {
            const response = await fetch('/admin/support/upload', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json'
                },
                body: formData
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Upload failed:', response.status, text);
                window.showToast('Upload failed (server error)', 'error');
                return;
            }

            const data = await response.json();
            if (data.success) {
                if (this.currentConvo) {
                    const msg = data.message;
                    if (msg.file_type && msg.file_type.startsWith('image/')) {
                        msg.preview = msg.file_url;
                    }
                    this.currentConvo.messages.push(msg);
                }
                this.scrollToBottom();
                window.showToast('File uploaded successfully', 'success');
            } else {
                window.showToast('Upload failed', 'error');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            window.showToast('Upload error', 'error');
        }
    },

    // ─── Handle option button click (system / admin) ─────────────────
    handleOptionClick(opt) {
        window.showToast?.('Option selection handled by AI workflow', 'info');

        if (!this.currentConvo) return;

        // Remove options after selection
        this.currentConvo.messages.forEach(m => { if (m.options) m.options = null; });

        const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Echo user's choice
        this.currentConvo.messages.push({
            role: 'user',
            content: opt.label,
            type: 'text',
            time: now()
        });
        this.scrollToBottom();

        this.isTyping = true;

        if (opt.action === 'system') {
            setTimeout(() => {
                this.isTyping = false;
                if (!this.currentConvo) return;
                this.currentConvo.messages.push({
                    role: 'system',
                    content: 'You have chosen to chat with the system. Please describe your issue in detail, and I will do my best to assist you automatically.',
                    type: 'text',
                    time: now()
                });
                this.scrollToBottom();
            }, 1000);
        } else if (opt.action === 'admin') {
            setTimeout(() => {
                this.isTyping = false;
                if (!this.currentConvo) return;
                this.currentConvo.messages.push({
                    role: 'system',
                    content: 'Connecting you to an available administrator...',
                    type: 'text',
                    time: now()
                });
                this.scrollToBottom();
                // Auto-assign admin
                setTimeout(() => this.assignRandomAdmin(), 1500);
            }, 1000);
        }
    },

    // ─── Assign random admin from 5 pool ─────────────────────────────
    async assignRandomAdmin() {
        if (!this.selectedConvoId) return;

        const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        try {
            const response = await fetch('/admin/support/assign-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                window.showToast('Failed to assign admin', 'error');
                return;
            }

            const data = await response.json();

            if (data.success && this.currentConvo) {
                this.currentConvo.status = 'Assigned';
                this.currentConvo.messages.push({
                    role: 'system',
                    content: data.message,
                    type: 'text',
                    time: now()
                });
                this.scrollToBottom();

                // Admin greeting after 1s
                setTimeout(() => {
                    if (this.currentConvo) {
                        this.currentConvo.messages.push({
                            role: 'admin',
                            content: `Hello, I am ${data.admin.name}. How can I assist you today?`,
                            type: 'text',
                            time: now()
                        });
                        this.scrollToBottom();
                    }
                }, 1000);

                window.showToast(`Admin ${data.admin.name} assigned`, 'success');
            }
        } catch (error) {
            console.error('Error assigning admin:', error);
            window.showToast('Failed to assign admin', 'error');
        }
    },

    // ─── OCR Analysis ────────────────────────────────────────────────
    async analyzeOCR() {
        if (!this.selectedConvoId) return;
        this.isAnalyzing = true;

        try {
            const response = await fetch('/admin/support/analyze-ocr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ description: 'Analyze legal discrepancies' })
            });

            const data = await response.json();
            this.isAnalyzing = false;
            window.showToast('OCR Analysis complete', 'info');

            if (this.currentConvo) {
                this.currentConvo.messages.push({
                    role: 'ai_report',
                    content: data.message || 'Analysis complete.',
                    confidence: 92,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            }
            this.scrollToBottom();
        } catch (error) {
            this.isAnalyzing = false;
            window.showToast('Analysis error', 'error');
        }
    },

    // ─── AI Draft ────────────────────────────────────────────────────
    generateDraft() {
        this.generateAIDraft();
    },

    async generateAIDraft() {
        this.isGeneratingDraft = true;
        try {
            const response = await fetch('/admin/support/draft', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ ticket_id: this.selectedConvoId })
            });
            const data = await response.json();
            if (this.currentConvo) {
                this.currentConvo.aiDraft = data.draft;
            }
            this.isGeneratingDraft = false;
        } catch (error) {
            this.isGeneratingDraft = false;
        }
    },

    applyDraft() {
        if (this.currentConvo && this.currentConvo.aiDraft) {
            this.newMessage = this.currentConvo.aiDraft;
        }
    },

    scrollToBottom() {
        this.$nextTick(() => {
            const container = document.getElementById('chat-history-container');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        });
    }
});
