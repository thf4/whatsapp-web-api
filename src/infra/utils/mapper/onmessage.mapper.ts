export const mapWppConnectToCallback = (data: any): any => {
  return {
    isStatusReply: false,
    chatId: data.chatId,
    userId: data.sender.id,
    connectedPhone: data.from.split('@')[0],
    waitingMessage: false,
    isEdit: data.isEdit || false,
    isGroup: data.isGroupMsg,
    isNewsletter: false,
    phone: data.from.split('@')[0],
    fromMe: data.fromMe,
    viewed: data.viewed,
    isAvatar: data.isAvatar,
    isNewMsg: data.isNewMsg,
    audio: {
      audioUrl: data.deprecatedMms3Url || data.clientUrl,
      mimetype: data.mimetype,
      size: data.size,
      mediaKey: data.mediaKey
    },
    momment: data.timestamp,
    status: "RECEIVED",
    chatName: data.notifyName || data.sender.pushname,
    senderPhoto: data.sender.profilePicThumbObj?.eurl || null,
    senderName: data.sender.pushname,
    photo: data.sender.profilePicThumbObj?.eurl || null,
    broadcast: false,
    participantLid: null,
    messageExpirationSeconds: 0,
    forwarded: data.isForwarded,
    type: data.event,
    fromApi: false,
    isMe: data.sender.isMe,
    isUser: data.isUser,
    text: {
      message: data.body
    }
  };
}
