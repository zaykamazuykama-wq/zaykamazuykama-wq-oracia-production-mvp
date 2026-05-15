export type ContentVariant = {
  name: string;
  signals: string[];
  core: string[];
  relationship: string[];
  work: string[];
  shadow: string[];
  gift: string[];
};

export const ARCHETYPE_BANK: ContentVariant[] = [
  {
    name: 'The Stargazer',
    signals: ['pattern recognition', 'wide-angle thinking', 'quiet optimism'],
    core: [
      'You tend to orient through distance first. Space gives you perspective; perspective gives you language; language gives you a way to move without forcing certainty.',
      'Your strongest insights often arrive when you stop trying to make the immediate room approve of them. You need enough altitude to see the whole map.',
      'The practical invitation is to bring one distant insight back into a visible next step.'
    ],
    relationship: [
      'In contact with others, you may need room before response. This is not coldness; it is how your system translates feeling into clear language.',
      'Name your processing rhythm directly. People close to you should not have to guess whether you are reflecting, avoiding, or silently concluding.'
    ],
    work: [
      'You are useful in work that needs synthesis, positioning, narrative, research, strategy, or long-range sensemaking.',
      'Your risk is staying in concept too long. A small artifact protects the insight from remaining only atmospheric.'
    ],
    shadow: [
      'The shadow pattern is elegant distance: living so far above ordinary facts that maintenance starts to feel beneath you.',
      'When pressure rises, ask for evidence, not more symbolism.'
    ],
    gift: [
      'The gift is orientation. You help yourself and others see a larger pattern without being swallowed by the present moment.'
    ]
  },
  {
    name: 'The Silent Weaver',
    signals: ['subtle influence', 'relational intelligence', 'patient craft'],
    core: [
      'Your pattern works through threads rather than force. You notice connections before other people name them, then quietly alter the room by adjusting one strand at a time.',
      'You may underestimate how much architecture you create because your work often looks like support, timing, or taste.',
      'The practical invitation is to let your contribution become visible before resentment becomes the only witness.'
    ],
    relationship: [
      'You often sense relational weather early. Use that perception to ask cleaner questions, not to carry every unspoken tension alone.',
      'A direct request may feel less graceful than adaptation, but it usually creates less distortion.'
    ],
    work: [
      'You are useful in systems that require continuity: operations, design, care, editing, coordination, product thinking, and culture building.',
      'Your risk is becoming essential while remaining under-credited. Document the work. Define the boundary.'
    ],
    shadow: [
      'The shadow pattern is hidden over-functioning: doing too much, saying too little, then calling the resulting fatigue maturity.',
      'When pressure rises, ask what would happen if your labor became visible.'
    ],
    gift: [
      'The gift is coherence. You make scattered parts become usable without needing to dominate the surface.'
    ]
  },
  {
    name: 'The Flame Carrier',
    signals: ['conviction', 'initiation', 'emotional heat'],
    core: [
      'Your symbolic field is built around ignition. When a direction feels true, your system wants motion, evidence, friction, and a visible line between before and after.',
      'You are not here to wait until every observer is comfortable. You are here to learn which fires are worth feeding.',
      'The practical invitation is to separate urgency from truth. Some true things can still move slowly.'
    ],
    relationship: [
      'Your warmth can be clarifying, but intensity is not the same as intimacy. Let people meet the real request beneath the heat.',
      'Use direct language early. It prevents small disappointments from becoming dramatic evidence.'
    ],
    work: [
      'You are useful where initiation matters: launches, sales, creative direction, leadership moments, performance, crisis response, and new ventures.',
      'Your risk is burning through the boring middle. Build a cooling system before the spark becomes the whole plan.'
    ],
    shadow: [
      'The shadow pattern is sacred impatience: treating delay as rejection and intensity as proof.',
      'When pressure rises, reduce the decision to the next honest action.'
    ],
    gift: [
      'The gift is activation. You move stale energy and remind people that choice is a physical event, not only an idea.'
    ]
  },
  {
    name: 'The Obsidian Mirror',
    signals: ['truth sensitivity', 'boundary detection', 'depth'],
    core: [
      'You read what is unsaid quickly. The pattern here is not pessimism; it is a low tolerance for performance that does not match substance.',
      'You may be drawn to depth because shallow explanations feel physically expensive.',
      'The practical invitation is to let discernment create contact, not only protection.'
    ],
    relationship: [
      'In relationships, you may notice contradiction before tenderness. That perception can be valuable, but it should not become a courtroom.',
      'Say what you see as a question first when safety allows. Curiosity keeps truth from becoming a weapon.'
    ],
    work: [
      'You are useful in analysis, editing, risk detection, therapy-adjacent reflection, investigation, strategy, research, and high-integrity craft.',
      'Your risk is rejecting imperfect rooms before discovering whether they can repair.'
    ],
    shadow: [
      'The shadow pattern is armored accuracy: being right in a way that leaves no path back to warmth.',
      'When pressure rises, ask whether you want truth, distance, or punishment.'
    ],
    gift: [
      'The gift is purification. You help false structures reveal themselves so better ones can be built.'
    ]
  },
  {
    name: 'The Sun Singer',
    signals: ['expressive warmth', 'creative visibility', 'restorative presence'],
    core: [
      'Your field brightens when expression has a place to land. You are not only trying to be seen; you are trying to make the room more alive through what you reveal.',
      'You may carry an instinct for tone, image, rhythm, hospitality, or emotional color.',
      'The practical invitation is to build a life where expression is practiced, not begged for.'
    ],
    relationship: [
      'You often bring warmth first. Make sure the warmth is chosen, not used to earn safety.',
      'Ask for the kind of attention you need instead of performing until someone guesses correctly.'
    ],
    work: [
      'You are useful in creative work, brand, teaching, performance, community, facilitation, storytelling, and spaces that need human charge.',
      'Your risk is confusing applause with nourishment. Metrics can inform you, but they should not parent you.'
    ],
    shadow: [
      'The shadow pattern is visibility hunger: treating silence as failure and attention as proof of worth.',
      'When pressure rises, return to the craft before returning to the crowd.'
    ],
    gift: [
      'The gift is restoration. You make expression feel possible again.'
    ]
  }
];

export const RHYTHM_BANK = [
  { name: 'Builder Flame', text: 'You gain momentum through visible progress. Small completed loops regulate you better than vague inspiration.' },
  { name: 'Focused Guide', text: 'Your energy sharpens when the field is clear: fewer inputs, cleaner expectations, and enough authority to refuse noise.' },
  { name: 'Dynamic Catalyst', text: 'Your best work often begins with contrast. You need a real problem, not a decorative task.' },
  { name: 'Mirror Field', text: 'Your rhythm is environmentally sensitive. The people, pace, and tone around you affect output more than you may admit.' },
  { name: 'Deep Current', text: 'Your rhythm moves below the surface before it becomes visible. Protect incubation, then commit to a clear delivery point.' },
  { name: 'Solar Sprint', text: 'Your output often arrives in bright bursts. The key is recovery by design, not recovery after collapse.' }
];

export function lifePathMeaning(lifePath: number): string {
  const bank: Record<number, string> = {
    1: 'The reflective theme is self-direction: choosing one clear move before asking the whole world for permission.',
    2: 'The reflective theme is attunement: noticing where peacekeeping becomes self-erasure.',
    3: 'The reflective theme is expression: letting the first draft exist before demanding elegance.',
    4: 'The reflective theme is structure: building containers strong enough to protect your attention.',
    5: 'The reflective theme is movement: distinguishing real freedom from avoidance with better branding.',
    6: 'The reflective theme is responsibility: caring deeply without becoming the entire support system.',
    7: 'The reflective theme is inquiry: using solitude for clarity, not disappearance.',
    8: 'The reflective theme is power: handling ambition without outsourcing your ethics.',
    9: 'The reflective theme is completion: releasing identities that were useful but are no longer accurate.',
    11: 'The reflective theme is heightened perception: grounding sensitivity into repeatable practice.',
    22: 'The reflective theme is large-scale building: translating vision into humble operational steps.'
  };
  return bank[lifePath] || 'The reflective theme is integration: turning insight into one ordinary, repeatable behavior.';
}
