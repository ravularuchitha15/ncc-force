const { messaging, isFirebaseReady } = require('../config/firebase');

/**
 * Send FCM notification to a single device token
 * @param {String} token - Recipient FCM device token
 * @param {Object} payload - Notification payload { title, body, data }
 */
const sendToDevice = async (token, { title, body, data = {} }) => {
  if (!isFirebaseReady() || !messaging) {
    return {
      success: false,
      message: 'FCM is not initialized. Notification was skipped.'
    };
  }

  if (!token) {
    throw new Error('Device token is required to send notification');
  }

  const message = {
    token,
    notification: {
      title,
      body
    },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)])
    )
  };

  try {
    const response = await messaging.send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error(`[FCM] Error sending message to token ${token.slice(0, 10)}...:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send FCM notification to multiple device tokens (multicast)
 * @param {Array<String>} tokens - Array of device tokens
 * @param {Object} payload - Notification payload { title, body, data }
 */
const sendToDevices = async (tokens = [], { title, body, data = {} }) => {
  if (!isFirebaseReady() || !messaging) {
    return {
      success: false,
      message: 'FCM is not initialized. Notification was skipped.'
    };
  }

  const validTokens = tokens.filter(Boolean);
  if (validTokens.length === 0) {
    return { success: false, message: 'No valid device tokens provided' };
  }

  const message = {
    tokens: validTokens,
    notification: {
      title,
      body
    },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)])
    )
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    console.error('[FCM] Multicast error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send FCM notification to a topic (e.g., 'announcements', 'camps')
 * @param {String} topic - Topic name
 * @param {Object} payload - Notification payload { title, body, data }
 */
const sendToTopic = async (topic, { title, body, data = {} }) => {
  if (!isFirebaseReady() || !messaging) {
    return {
      success: false,
      message: 'FCM is not initialized. Topic notification was skipped.'
    };
  }

  const message = {
    topic,
    notification: {
      title,
      body
    },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)])
    )
  };

  try {
    const response = await messaging.send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error(`[FCM] Topic notification error for topic ${topic}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendToDevice,
  sendToDevices,
  sendToTopic
};
