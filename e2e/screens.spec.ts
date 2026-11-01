// Screenshots for LOOKING at the app (see @meddleware/frontend-config/shots). Run: npm run shots. The connected states go through the e2e
// build's mock wallet.
import { defineShots } from '@meddleware/frontend-config/shots'
import { tool, treasury } from './open.js'

defineShots({
  treasury,
  walrus: tool('Walrus Storage'),
  sealed: tool('Sealed Storage'),
  accessgate: tool('Access Gate'),
  token: tool('Token Issuance'),
  walrusConnected: tool('Walrus Storage', true),
  accessgateConnected: tool('Access Gate', true),
})
