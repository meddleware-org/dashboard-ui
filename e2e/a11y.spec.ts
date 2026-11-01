// The shared accessibility sweep over every route and every embedded tool, disconnected and connected, in every colour mode × season at WCAG
// 2.2 AA and AAA, then reflow (the sidebar becomes a drawer at 320 px), text size, forced colours, reduced motion and the keyboard.
import { defineA11ySuite } from '@meddleware/frontend-config/a11y'
import { tool, treasury } from './open.js'

defineA11ySuite(
  {
    treasury,
    walrus: tool('Walrus Storage'),
    sealed: tool('Sealed Storage'),
    'access gate': tool('Access Gate'),
    'token issuance': tool('Token Issuance'),
    'walrus (connected)': tool('Walrus Storage', true),
    'access gate (connected)': tool('Access Gate', true),
  },
  { aaa: 'gate' },
)
