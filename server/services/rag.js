// RAG vector system has been decommissioned in favor of direct bounded chat.
// Re-exporting from chat.js for backwards compatibility.
const chatService = require('./chat');

module.exports = {
  queryRAG: chatService.generateChatResponse,
  generateChatResponse: chatService.generateChatResponse
};
