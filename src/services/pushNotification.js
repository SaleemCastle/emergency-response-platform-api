const { Expo } = require('expo-server-sdk');

const expo = new Expo();

async function 
sendPushNotifications(
  tokens,
  emergency
) {
  const messages = [];

  // Filter out invalid tokens and create messages
  tokens.forEach((pushToken) => {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.warn(`Invalid Expo push token: ${pushToken}`);
      return;
    }

    messages.push({
      to: pushToken,
      sound: 'default',
      title: 'Emergency Alert',
      body: `New ${emergency.type.toLowerCase()} emergency reported nearby`,
      data: { emergencyId: emergency.id },
      priority: 'high',
    });
  });

  if (messages.length === 0) {
    return;
  }

  // Chunk the messages to avoid rate limiting
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  // Send the chunks
  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error('Error sending push notification chunk:', error);
    }
  }

  // Optional: Handle receipts
  const receiptIds = tickets
    .filter((ticket) => ticket.id)
    .map((ticket) => ticket.id);

  if (receiptIds.length > 0) {
    const receiptChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    
    for (const chunk of receiptChunks) {
      try {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        
        for (const [id, receipt] of Object.entries(receipts)) {
          if (receipt.status === 'error') {
            console.error(
              `Push notification receipt error:`,
              receipt.message,
              receipt.details
            );
          }
        }
      } catch (error) {
        console.error('Error checking push notification receipts:', error);
      }
    }
  }
} 

module.exports = { sendPushNotifications }; 