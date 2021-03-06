export default {
  name: 'biphub-discord',
  label: 'Discord',
  description: `Step up your game with a modern voice & text chat app. Crystal clear voice,
  multiple server and channel support, mobile apps, and more.`,
  instructions: 'https://discordapp.com/developers/docs/intro',
  icon: 'icon-discord.png',
  incomingActions: {
    message: {
      type: 'webhook/ws',
      name: 'message',
      description: 'Message event that triggers when there is a new message',
      conditions: {
        matches: {
          name: 'matches',
          required_fields: ['content']
        },
        contains: {
          name: 'contains',
          required_fields: ['content']
        }
      },
      fields: {
        content: { type: 'string', name: 'content' }
      },
      options: {
        channel: { type: 'string', name: 'channel' }
      }
    }
  },
  outgoingActions: [
		{ name: 'createCard' },
		{ name: 'deleteCard' }
  ]
}
