import React, { useRef, useState } from 'react';
import Window from '../os/Window';
import useInitialWindowSize from '../../hooks/useInitialWindowSize';

export interface ShowcaseExplorerProps extends WindowAppProps {}

type RelationKey =
    | 'Friend'
    | 'Best Friend'
    | 'Family'
    | 'Date'
    | 'Coworker'
    | 'Boss'
    | 'Client'
    | 'Other';

type ClosenessKey =
    | 'Stranger'
    | 'Acquaintance'
    | 'Friend'
    | 'Close Friend'
    | 'Best Friend'
    | 'Family';

type EventKey =
    | 'Coffee'
    | 'Lunch'
    | 'Dinner'
    | 'Movie'
    | 'Birthday'
    | 'Party'
    | 'Meeting'
    | 'Trip'
    | 'Interview'
    | 'Other';

type ImportanceKey = 'Casual' | 'Planned' | 'Important' | 'Very Important';
type NoticeKey =
    | '15 minutes'
    | '1 hour'
    | 'Today'
    | 'Tomorrow'
    | 'A few days'
    | 'A week';
type ToneKey = 'Casual' | 'Professional' | 'Formal' | 'Very apologetic';

interface InputState {
    relationship: RelationKey | '';
    relationshipCustom: string;
    closeness: ClosenessKey | '';
    event: EventKey | '';
    eventCustom: string;
    importance: ImportanceKey | '';
    notice: NoticeKey | '';
    tone: ToneKey | '';
    previousExcuses: string[];
    previousExcuseInput: string;
    additionalContext: string;
}

/**
 * Each template represents one "category" of excuse (illness, workload, etc).
 * `variants` holds multiple phrasings so repeat use of the same category
 * doesn't produce identical text every time. Variants can contain
 * {{event}} and {{relationship}} tokens which get filled in from the form.
 */
interface ExcuseTemplate {
    id: string;
    category: string;
    variants: string[];
    relationshipSuitability: string[];
    eventSuitability: string[];
    noticeSuitability: string[];
    importanceSuitability: string[];
    toneSuitability: string[];
    baseConfidence: number;
    explanation: string;
    keywords: string[]; // used to detect this category inside previous excuses / context
}

interface Recommendation {
    id: string;
    category: string;
    text: string;
    explanation: string;
    score: number;
}

const initialForm: InputState = {
    relationship: '',
    relationshipCustom: '',
    closeness: '',
    event: '',
    eventCustom: '',
    importance: '',
    notice: '',
    tone: '',
    previousExcuses: [],
    previousExcuseInput: '',
    additionalContext: '',
};

const ALL_RELATIONSHIPS: RelationKey[] = ['Friend', 'Best Friend', 'Family', 'Date', 'Coworker', 'Boss', 'Client'];
const ALL_EVENTS: EventKey[] = ['Coffee', 'Lunch', 'Dinner', 'Movie', 'Birthday', 'Party', 'Meeting', 'Trip', 'Interview'];
const ALL_IMPORTANCE: ImportanceKey[] = ['Casual', 'Planned', 'Important', 'Very Important'];
const ALL_NOTICE: NoticeKey[] = ['15 minutes', '1 hour', 'Today', 'Tomorrow', 'A few days', 'A week'];
const ALL_TONE: ToneKey[] = ['Casual', 'Professional', 'Formal', 'Very apologetic'];

const excuseTemplates: ExcuseTemplate[] = [
    {
        id: 'unexpected-issue',
        category: 'logistics',
        variants: [
            "Something unexpected just came up and I need to deal with it right away.",
            "I've hit an unexpected snag and have to sort it out before I can make {{event}}.",
        ],
        relationshipSuitability: ALL_RELATIONSHIPS,
        eventSuitability: ALL_EVENTS,
        noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow'],
        importanceSuitability: ALL_IMPORTANCE,
        toneSuitability: ALL_TONE,
        baseConfidence: 0.86,
        explanation: 'A flexible, believable catch-all for short-notice cancellations.',
        keywords: ['unexpected', 'issue', 'snag'],
    },
    {
        id: 'family-emergency',
        category: 'family',
        variants: [
            "A family matter came up that needs my attention right away.",
            "Something's going on with my family that I need to handle today.",
        ],
        relationshipSuitability: ALL_RELATIONSHIPS,
        eventSuitability: ['Lunch', 'Dinner', 'Movie', 'Party', 'Birthday', 'Trip', 'Meeting'],
        noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow', 'A few days'],
        importanceSuitability: ['Planned', 'Important', 'Very Important'],
        toneSuitability: ['Professional', 'Formal', 'Very apologetic'],
        baseConfidence: 0.85,
        explanation: 'Reads as serious and non-negotiable — best when you want few follow-up questions.',
        keywords: ['family', 'emergency', 'relative'],
    },
    {
        id: 'workload',
        category: 'workload',
        variants: [
            "I've got a heavier workload than expected and need to stay heads-down tonight.",
            "Work piled up more than I planned for, so I need to skip {{event}} this time.",
        ],
        relationshipSuitability: ['Coworker', 'Boss', 'Friend', 'Best Friend', 'Family', 'Client'],
        eventSuitability: ALL_EVENTS,
        noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow'],
        importanceSuitability: ['Casual', 'Planned', 'Important'],
        toneSuitability: ['Casual', 'Professional', 'Formal'],
        baseConfidence: 0.82,
        explanation: 'Practical and low-drama — plausible for coworkers and casual plans alike.',
        keywords: ['work', 'busy', 'workload', 'deadline'],
    },
    {
        id: 'health',
        category: 'illness',
        variants: [
            "I'm not feeling well and don't want to risk showing up under the weather.",
            "I've come down with something and need to rest instead of making it to {{event}}.",
        ],
        relationshipSuitability: ALL_RELATIONSHIPS,
        eventSuitability: ALL_EVENTS,
        noticeSuitability: ALL_NOTICE,
        importanceSuitability: ALL_IMPORTANCE,
        toneSuitability: ALL_TONE,
        baseConfidence: 0.84,
        explanation: 'Universally accepted and rarely questioned, but overuse makes it less credible.',
        keywords: ['sick', 'ill', 'flu', 'unwell', 'cold', 'fever'],
    },
    {
        id: 'prior-commitment',
        category: 'commitment',
        variants: [
            "I already have a prior commitment I need to keep and can't reschedule.",
            "Turns out I double-booked myself — I have to honor the other commitment first.",
        ],
        relationshipSuitability: ALL_RELATIONSHIPS,
        eventSuitability: ALL_EVENTS,
        noticeSuitability: ['1 hour', 'Today', 'Tomorrow', 'A few days', 'A week'],
        importanceSuitability: ALL_IMPORTANCE,
        toneSuitability: ['Casual', 'Professional', 'Formal'],
        baseConfidence: 0.78,
        explanation: 'Steady and non-emotional — works best with more advance notice.',
        keywords: ['commitment', 'booked', 'schedule'],
    },
    {
        id: 'travel-delay',
        category: 'travel',
        variants: [
            "I'm dealing with a travel delay and need to keep my day flexible.",
            "My travel plans got thrown off, so I can't lock in {{event}} right now.",
        ],
        relationshipSuitability: ALL_RELATIONSHIPS,
        eventSuitability: ['Coffee', 'Lunch', 'Dinner', 'Meeting', 'Trip', 'Interview'],
        noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow'],
        importanceSuitability: ['Planned', 'Important', 'Very Important'],
        toneSuitability: ['Professional', 'Formal', 'Very apologetic'],
        baseConfidence: 0.8,
        explanation: "Useful when timing is tight and there's a plausible professional angle.",
        keywords: ['travel', 'delay', 'flight', 'traffic', 'transit'],
    },
    {
        id: 'personal-space',
        category: 'personal-space',
        variants: [
            "I need a little personal space tonight and will have to sit this one out.",
            "I'm running low on social energy and need a quiet night instead of {{event}}.",
        ],
        relationshipSuitability: ['Friend', 'Best Friend', 'Family', 'Date'],
        eventSuitability: ['Coffee', 'Lunch', 'Dinner', 'Movie', 'Party', 'Birthday'],
        noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow', 'A few days'],
        importanceSuitability: ['Casual', 'Planned'],
        toneSuitability: ['Casual', 'Formal', 'Very apologetic'],
        baseConfidence: 0.72,
        explanation: 'A gentle, honest boundary — best reserved for close relationships.',
        keywords: ['space', 'alone', 'energy', 'introvert', 'tired'],
    },
    {
        id: 'client-issue',
        category: 'professional-urgent',
        variants: [
            "A client issue needs my immediate attention, so I have to keep the evening free.",
            "Something urgent came up on the client side and I need to stay on it.",
        ],
        relationshipSuitability: ['Boss', 'Client', 'Coworker', 'Friend'],
        eventSuitability: ['Meeting', 'Dinner', 'Lunch', 'Coffee', 'Interview'],
        noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow'],
        importanceSuitability: ['Important', 'Very Important', 'Planned'],
        toneSuitability: ['Professional', 'Formal', 'Very apologetic'],
        baseConfidence: 0.87,
        explanation: 'Strong for professional contexts where urgency and credibility matter most.',
        keywords: ['client', 'professional', 'deadline', 'urgent'],
    },
    {
        id: 'tech-failure',
        category: 'technology',
        variants: [
            "I'm dealing with a tech problem — my {{event}} plans got derailed by it.",
            "Something broke on my end (internet/car/etc.) and I need to get it sorted first.",
        ],
        relationshipSuitability: ALL_RELATIONSHIPS,
        eventSuitability: ALL_EVENTS,
        noticeSuitability: ['15 minutes', '1 hour', 'Today'],
        importanceSuitability: ['Casual', 'Planned', 'Important'],
        toneSuitability: ['Casual', 'Professional'],
        baseConfidence: 0.74,
        explanation: 'Casual and specific — best for informal plans with low stakes if questioned.',
        keywords: ['car', 'internet', 'phone', 'broke', 'technical'],
    },
    {
        id: 'weather',
        category: 'weather',
        variants: [
            "The weather's turned bad enough that getting to {{event}} isn't safe right now.",
            "Conditions outside are rough and I'd rather not risk the trip over.",
        ],
        relationshipSuitability: ALL_RELATIONSHIPS,
        eventSuitability: ALL_EVENTS,
        noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow'],
        importanceSuitability: ['Casual', 'Planned', 'Important'],
        toneSuitability: ['Casual', 'Professional', 'Formal'],
        baseConfidence: 0.7,
        explanation: 'Only credible if weather is plausible for your area — easy to verify, so use sparingly.',
        keywords: ['weather', 'storm', 'snow', 'rain', 'roads'],
    },
    {
        id: 'financial',
        category: 'financial',
        variants: [
            "Some unexpected expenses came up and I need to hold off on plans that cost money right now.",
            "I'm tightening my budget this week, so I'll need to skip {{event}}.",
        ],
        relationshipSuitability: ['Friend', 'Best Friend', 'Family', 'Date'],
        eventSuitability: ['Dinner', 'Party', 'Trip', 'Movie'],
        noticeSuitability: ['Today', 'Tomorrow', 'A few days', 'A week'],
        importanceSuitability: ['Casual', 'Planned'],
        toneSuitability: ['Casual', 'Formal'],
        baseConfidence: 0.68,
        explanation: 'Honest and relatable for close relationships, less suited to formal settings.',
        keywords: ['money', 'budget', 'expensive', 'financial'],
    },
    {
        id: 'scheduling-conflict',
        category: 'scheduling',
        variants: [
            "My schedule just shifted and it's now conflicting with {{relationship}} plans I made earlier.",
            "Something on my calendar moved and now it overlaps — I need to reschedule.",
        ],
        relationshipSuitability: ALL_RELATIONSHIPS,
        eventSuitability: ALL_EVENTS,
        noticeSuitability: ['1 hour', 'Today', 'Tomorrow', 'A few days', 'A week'],
        importanceSuitability: ALL_IMPORTANCE,
        toneSuitability: ['Professional', 'Formal'],
        baseConfidence: 0.77,
        explanation: 'Neutral and administrative — good when you want to avoid an emotional reason.',
        keywords: ['schedule', 'conflict', 'calendar', 'overlap'],
    },
];

const relationshipOptions: RelationKey[] = [
    'Friend',
    'Best Friend',
    'Family',
    'Date',
    'Coworker',
    'Boss',
    'Client',
    'Other',
];

const closenessOptions: ClosenessKey[] = [
    'Stranger',
    'Acquaintance',
    'Friend',
    'Close Friend',
    'Best Friend',
    'Family',
];

const eventOptions: EventKey[] = [
    'Coffee',
    'Lunch',
    'Dinner',
    'Movie',
    'Birthday',
    'Party',
    'Meeting',
    'Trip',
    'Interview',
    'Other',
];

const importanceOptions: ImportanceKey[] = ['Casual', 'Planned', 'Important', 'Very Important'];
const noticeOptions: NoticeKey[] = ['15 minutes', '1 hour', 'Today', 'Tomorrow', 'A few days', 'A week'];
const toneOptions: ToneKey[] = ['Casual', 'Professional', 'Formal', 'Very apologetic'];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** Fills {{event}} / {{relationship}} tokens into a variant using the form's actual values. */
const personalize = (text: string, state: InputState): string => {
    const eventLabel =
        state.event === 'Other' && state.eventCustom.trim()
            ? state.eventCustom.trim()
            : (state.event || 'our plans').toLowerCase();
    const relationshipLabel =
        state.relationship === 'Other' && state.relationshipCustom.trim()
            ? state.relationshipCustom.trim()
            : (state.relationship || 'you').toLowerCase();

    return text.replace(/\{\{event\}\}/g, eventLabel).replace(/\{\{relationship\}\}/g, relationshipLabel);
};

/** Counts how strongly a category shows up in text the user already typed (previous excuses / context). */
const categoryUsageScore = (text: string, template: ExcuseTemplate): number => {
    if (!text) return 0;
    const lower = text.toLowerCase();
    return template.keywords.reduce((count, keyword) => (lower.includes(keyword) ? count + 1 : count), 0);
};

/**
 * Weighted scoring: each matching field contributes a fixed weight so the
 * total is easy to reason about, then previous-excuse overlap is subtracted
 * so categories you've leaned on already drop down the list. A small jitter
 * keeps repeated submissions with identical inputs from feeling static.
 */
const scoreTemplate = (template: ExcuseTemplate, state: InputState): number => {
    let score = template.baseConfidence * 0.18;

    if (state.relationship) {
        if (template.relationshipSuitability.includes(state.relationship)) {
            score += 0.2;
        } else if (state.relationship === 'Other' && state.relationshipCustom) {
            score += 0.05;
        }
    }

    if (state.event) {
        if (template.eventSuitability.includes(state.event)) {
            score += 0.16;
        } else if (state.event === 'Other' && state.eventCustom) {
            score += 0.05;
        }
    }

    if (state.importance && template.importanceSuitability.includes(state.importance)) {
        score += 0.13;
    }

    if (state.notice && template.noticeSuitability.includes(state.notice)) {
        score += 0.13;
    }

    if (state.tone && template.toneSuitability.includes(state.tone)) {
        score += 0.1;
    }

    if (state.closeness) {
        score += ['Close Friend', 'Best Friend', 'Family'].includes(state.closeness) ? 0.05 : 0.02;
    }

    const previousText = state.previousExcuses.join(' ');
    const previousOverlap = categoryUsageScore(previousText, template);
    score -= Math.min(0.4, previousOverlap * 0.16);

    const contextOverlap = categoryUsageScore(state.additionalContext, template);
    score += Math.min(0.06, contextOverlap * 0.03);

    // Small deterministic-ish jitter so ties don't always resolve the same way.
    score += (Math.random() - 0.5) * 0.02;

    return clamp(score, 0.2, 0.99);
};

/**
 * Greedy diversity selection (a simplified MMR): after scoring, pick the
 * best remaining candidate but apply a growing penalty to categories
 * already represented in the results, so the top picks aren't all the
 * same flavor of excuse.
 */
const selectDiverseTopN = (
    scored: { template: ExcuseTemplate; score: number }[],
    n: number,
): { template: ExcuseTemplate; score: number }[] => {
    const pool = [...scored];
    const picked: { template: ExcuseTemplate; score: number }[] = [];
    const categoryCounts: Record<string, number> = {};

    while (picked.length < n && pool.length > 0) {
        let bestIndex = 0;
        let bestAdjusted = -Infinity;

        pool.forEach((candidate, index) => {
            const penalty = (categoryCounts[candidate.template.category] || 0) * 0.18;
            const adjusted = candidate.score - penalty;
            if (adjusted > bestAdjusted) {
                bestAdjusted = adjusted;
                bestIndex = index;
            }
        });

        const [chosen] = pool.splice(bestIndex, 1);
        picked.push(chosen);
        categoryCounts[chosen.template.category] = (categoryCounts[chosen.template.category] || 0) + 1;
    }

    return picked;
};

/** Picks the variant least similar to anything the user already typed as a previous excuse. */
const pickVariant = (template: ExcuseTemplate, state: InputState): string => {
    const previousLower = state.previousExcuses.join(' | ').toLowerCase();
    const unused = template.variants.find((variant) => {
        const bare = variant.replace(/\{\{event\}\}|\{\{relationship\}\}/g, '').toLowerCase().slice(0, 20);
        return !previousLower.includes(bare);
    });
    return unused ?? template.variants[Math.floor(Math.random() * template.variants.length)];
};

const rankExcuses = (state: InputState): Recommendation[] => {
    const scored = excuseTemplates.map((template) => ({
        template,
        score: scoreTemplate(template, state),
    }));

    scored.sort((left, right) => right.score - left.score);

    const diversePicks = selectDiverseTopN(scored, 5);

    return diversePicks.map(({ template, score }) => ({
        id: template.id,
        category: template.category,
        text: personalize(pickVariant(template, state), state),
        explanation: template.explanation,
        score,
    }));
};

const ShowcaseExplorer: React.FC<ShowcaseExplorerProps> = (props) => {
    const { initWidth, initHeight } = useInitialWindowSize({ margin: 100 });
    const [form, setForm] = useState<InputState>(initialForm);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [showAll, setShowAll] = useState(false);
    const clickAudioContextRef = useRef<AudioContext | null>(null);

    const playClickSound = () => {
        if (typeof window === 'undefined') {
            return;
        }

        const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) {
            return;
        }

        if (!clickAudioContextRef.current) {
            clickAudioContextRef.current = new AudioContextClass();
        }

        const audioContext = clickAudioContextRef.current;
        if (audioContext.state === 'suspended') {
            void audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(760, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(560, audioContext.currentTime + 0.06);
        gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.004);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.11);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.11);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const ranked = rankExcuses(form);
        setRecommendations(ranked);
        setShowAll(false);
    };

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
        field: keyof InputState,
    ) => {
        const value = event.target.value;
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handlePreviousExcuses = () => {
        const trimmed = form.previousExcuseInput.trim();
        if (!trimmed) {
            return;
        }

        const values = trimmed
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

        setForm((current) => ({
            ...current,
            previousExcuses: [...current.previousExcuses, ...values],
            previousExcuseInput: '',
        }));
    };

    const removePreviousExcuse = (value: string) => {
        setForm((current) => ({
            ...current,
            previousExcuses: current.previousExcuses.filter((item) => item !== value),
        }));
    };

    const copyRecommendation = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // Ignore clipboard failures
        }
    };

    return (
        <Window
            top={24}
            left={56}
            width={initWidth}
            height={initHeight}
            windowTitle="Excuse Assistant"
            windowBarIcon="windowExplorerIcon"
            closeWindow={props.onClose}
            onInteract={props.onInteract}
            minimizeWindow={props.onMinimize}
            bottomLeftText="© Curated excuse recommendations"
        >
            <div style={styles.shell} onMouseDown={playClickSound}>
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>Excuse Recommendation Assistant</h2>
                    </div>
                </div>

                <div style={styles.layout}>
                    <form onSubmit={handleSubmit} style={styles.card}>
                        <div style={styles.grid}>
                            <label style={styles.field}>
                                <span style={styles.label}>Relationship</span>
                                <select
                                    value={form.relationship}
                                    onChange={(event) => handleChange(event, 'relationship')}
                                    style={{ ...styles.input, cursor: 'pointer' }}
                                >
                                    <option value="">Select one</option>
                                    {relationshipOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                {form.relationship === 'Other' ? (
                                    <input
                                        value={form.relationshipCustom}
                                        onChange={(event) => handleChange(event, 'relationshipCustom')}
                                        placeholder="Custom relationship"
                                        style={{ ...styles.input, marginTop: 8 }}
                                    />
                                ) : null}
                            </label>

                            <label style={styles.field}>
                                <span style={styles.label}>Closeness</span>
                                <select
                                    value={form.closeness}
                                    onChange={(event) => handleChange(event, 'closeness')}
                                    style={{ ...styles.input, cursor: 'pointer' }}
                                >
                                    <option value="">Select one</option>
                                    {closenessOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label style={styles.field}>
                                <span style={styles.label}>Event</span>
                                <select
                                    value={form.event}
                                    onChange={(event) => handleChange(event, 'event')}
                                    style={{ ...styles.input, cursor: 'pointer' }}
                                >
                                    <option value="">Select one</option>
                                    {eventOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                {form.event === 'Other' ? (
                                    <input
                                        value={form.eventCustom}
                                        onChange={(event) => handleChange(event, 'eventCustom')}
                                        placeholder="Custom event"
                                        style={{ ...styles.input, marginTop: 8 }}
                                    />
                                ) : null}
                            </label>

                            <label style={styles.field}>
                                <span style={styles.label}>Importance</span>
                                <select
                                    value={form.importance}
                                    onChange={(event) => handleChange(event, 'importance')}
                                    style={{ ...styles.input, cursor: 'pointer' }}
                                >
                                    <option value="">Select one</option>
                                    {importanceOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label style={styles.field}>
                                <span style={styles.label}>Notice</span>
                                <select
                                    value={form.notice}
                                    onChange={(event) => handleChange(event, 'notice')}
                                    style={{ ...styles.input, cursor: 'pointer' }}
                                >
                                    <option value="">Select one</option>
                                    {noticeOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label style={styles.field}>
                                <span style={styles.label}>Tone</span>
                                <select
                                    value={form.tone}
                                    onChange={(event) => handleChange(event, 'tone')}
                                    style={{ ...styles.input, cursor: 'pointer' }}
                                >
                                    <option value="">Select one</option>
                                    {toneOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label style={styles.field}>
                            <span style={styles.label}>Previous excuses (optional)</span>
                            <div style={styles.inlineRow}>
                                <input
                                    value={form.previousExcuseInput}
                                    onChange={(event) => handleChange(event, 'previousExcuseInput')}
                                    placeholder="Type one and press add"
                                    style={{ ...styles.input, flex: 1 }}
                                />
                                <button type="button" onClick={handlePreviousExcuses} style={styles.secondaryButton}>
                                    Add
                                </button>
                            </div>
                            {form.previousExcuses.length > 0 ? (
                                <div style={styles.chipRow}>
                                    {form.previousExcuses.map((item) => (
                                        <span key={item} style={styles.chip}>
                                            {item}
                                            <button
                                                type="button"
                                                onClick={() => removePreviousExcuse(item)}
                                                style={styles.chipButton}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </label>

                        <label style={styles.field}>
                            <span style={styles.label}>Additional context (optional)</span>
                            <textarea
                                value={form.additionalContext}
                                onChange={(event) => handleChange(event, 'additionalContext')}
                                rows={4}
                                placeholder="Describe anything that might influence the recommendation"
                                style={styles.textarea}
                            />
                        </label>

                        <div style={styles.actions}>
                            <button type="submit" style={styles.primaryButton}>
                                Recommend Excuses
                            </button>
                        </div>
                    </form>

                    {recommendations.length > 0 ? (
                        <div style={styles.card}>
                            <div style={styles.resultsHeader}>
                                <h3 style={styles.resultsTitle}>Top recommendations</h3>
                            </div>
                            <div style={styles.resultsList}>
                                {(showAll ? recommendations : recommendations.slice(0, 3)).map((item) => (
                                    <div key={item.id} style={styles.resultCard}>
                                        <div style={styles.resultTopRow}>
                                            <strong
                                                style={styles.resultText}
                                                onClick={() => copyRecommendation(item.text)}
                                            >
                                                {item.text}
                                            </strong>
                                            <span style={styles.scorePill}>{(item.score * 100).toFixed(0)}%</span>
                                        </div>
                                        <div style={styles.mutedText}>{item.explanation}</div>
                                        <div style={styles.categoryTag}>{item.category.replace(/-/g, ' ')}</div>
                                    </div>
                                ))}
                            </div>
                            {recommendations.length > 3 ? (
                                <div style={styles.moreButtonRow}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAll((current) => !current)}
                                        style={styles.linkButton}
                                    >
                                        {showAll ? 'Show fewer' : 'Show more'}
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </Window>
    );
};

const styles: Record<string, React.CSSProperties> = {
    shell: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        gap: 16,
        padding: 20,
        background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)',
        color: '#1f2937',
        overflow: 'auto',
        boxSizing: 'border-box',
        cursor: 'default',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
    },
    eyebrow: {
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.24em',
        color: '#5b6b86',
        marginBottom: 4,
    },
    title: {
        margin: 0,
        textAlign: 'center',
        fontSize: 24,
        color: '#111827',
    },
    badge: {
        padding: '8px 12px',
        borderRadius: 999,
        background: '#dbeafe',
        color: '#1d4ed8',
        fontSize: 12,
        fontWeight: 700,
    },
    layout: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
        gap: 16,
        boxSizing: 'border-box',
    },
    card: {
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        background: 'rgba(255,255,255,0.82)',
        border: '1px solid #dbe4f0',
        borderRadius: 16,
        padding: 16,
        boxShadow: '0 12px 34px rgba(15, 23, 42, 0.08)',
        backdropFilter: 'blur(10px)',
    },
    grid: {
        display: 'grid',
        width: '100%',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 12,
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        marginBottom: 12,
    },
    label: {
        fontWeight: 700,
        fontSize: 14,
        color: '#374151',
        fontFamily: 'MillenniumBold, "Times New Roman", Times, serif',
    },
    input: {
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid #cbd5e1',
        background: '#fff',
        color: '#111827',
        fontFamily: 'Millennium, "Times New Roman", Times, serif',
        fontSize: 15,
        lineHeight: 1.4,
        cursor: 'text',
    },
    textarea: {
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid #cbd5e1',
        background: '#fff',
        minHeight: 96,
        resize: 'vertical',
        color: '#111827',
        fontFamily: 'Millennium, "Times New Roman", Times, serif',
        fontSize: 15,
        lineHeight: 1.4,
        cursor: 'text',
    },
    inlineRow: {
        display: 'flex',
        width: '100%',
        gap: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    chipRow: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        marginTop: 8,
    },
    chip: {
        display: 'inline-flex',
        alignItems: 'center',
        background: '#eff6ff',
        color: '#1d4ed8',
        borderRadius: 999,
        padding: '6px 10px',
        fontSize: 12,
        gap: 6,
    },
    chipButton: {
        border: 'none',
        background: 'transparent',
        color: '#1d4ed8',
        cursor: 'pointer',
        fontSize: 14,
        padding: 0,
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: 6,
    },
    primaryButton: {
        border: 'none',
        borderRadius: 999,
        padding: '10px 14px',
        background: '#2563eb',
        color: '#fff',
        cursor: 'pointer',
        fontWeight: 700,
        fontFamily: 'MillenniumBold, "Times New Roman", Times, serif',
        fontSize: 14,
    },
    secondaryButton: {
        border: '1px solid #cbd5e1',
        borderRadius: 999,
        padding: '8px 12px',
        background: '#fff',
        color: '#111827',
        cursor: 'pointer',
        fontWeight: 600,
        fontFamily: 'Millennium, "Times New Roman", Times, serif',
        fontSize: 14,
    },
    resultsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    resultsTitle: {
        margin: 0,
        fontSize: 16,
        color: '#111827',
    },
    resultsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
    },
    resultCard: {
        width: '100%',
        boxSizing: 'border-box',
        padding: 12,
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    resultTopRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
        width: '100%',
    },
    resultText: {
        flex: 1,
        lineHeight: 1.4,
        cursor: 'pointer',
        userSelect: 'text',
        fontFamily: 'Millennium, "Times New Roman", Times, serif',
        fontSize: 15,
    },
    scorePill: {
        background: '#dcfce7',
        color: '#166534',
        borderRadius: 999,
        padding: '4px 8px',
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
    },
    mutedText: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 1.45,
        fontFamily: 'Millennium, "Times New Roman", Times, serif',
    },
    categoryTag: {
        alignSelf: 'flex-start',
        fontSize: 11,
        textTransform: 'capitalize',
        color: '#5b6b86',
        background: '#f1f5f9',
        borderRadius: 999,
        padding: '3px 8px',
    },
    resultBottomRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        width: '100%',
    },
    moreButtonRow: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginTop: 12,
    },
    linkButton: {
        border: 'none',
        background: 'transparent',
        color: '#2563eb',
        cursor: 'pointer',
        fontWeight: 700,
        padding: 0,
        alignSelf: 'flex-start',
        fontFamily: 'MillenniumBold, "Times New Roman", Times, serif',
        fontSize: 14,
    },
};

export default ShowcaseExplorer;

// import React, { useRef, useState } from 'react';
// import Window from '../os/Window';
// import useInitialWindowSize from '../../hooks/useInitialWindowSize';

// export interface ShowcaseExplorerProps extends WindowAppProps {}

// type RelationKey =
//     | 'Friend'
//     | 'Best Friend'
//     | 'Family'
//     | 'Date'
//     | 'Coworker'
//     | 'Boss'
//     | 'Client'
//     | 'Other';

// type ClosenessKey =
//     | 'Stranger'
//     | 'Acquaintance'
//     | 'Friend'
//     | 'Close Friend'
//     | 'Best Friend'
//     | 'Family';

// type EventKey =
//     | 'Coffee'
//     | 'Lunch'
//     | 'Dinner'
//     | 'Movie'
//     | 'Birthday'
//     | 'Party'
//     | 'Meeting'
//     | 'Trip'
//     | 'Interview'
//     | 'Other';

// type ImportanceKey = 'Casual' | 'Planned' | 'Important' | 'Very Important';
// type NoticeKey =
//     | '15 minutes'
//     | '1 hour'
//     | 'Today'
//     | 'Tomorrow'
//     | 'A few days'
//     | 'A week';
// type ToneKey = 'Casual' | 'Professional' | 'Formal' | 'Very apologetic';

// interface InputState {
//     relationship: RelationKey | '';
//     relationshipCustom: string;
//     closeness: ClosenessKey | '';
//     event: EventKey | '';
//     eventCustom: string;
//     importance: ImportanceKey | '';
//     notice: NoticeKey | '';
//     tone: ToneKey | '';
//     previousExcuses: string[];
//     previousExcuseInput: string;
//     additionalContext: string;
// }

// /**
//  * Each template represents one "category" of excuse (illness, workload, etc).
//  * `variants` holds multiple phrasings so repeat use of the same category
//  * doesn't produce identical text every time. Variants can contain
//  * {{event}} and {{relationship}} tokens which get filled in from the form.
//  */
// interface ExcuseTemplate {
//     id: string;
//     category: string;
//     variants: string[];
//     relationshipSuitability: string[];
//     eventSuitability: string[];
//     noticeSuitability: string[];
//     importanceSuitability: string[];
//     toneSuitability: string[];
//     baseConfidence: number;
//     explanation: string;
//     keywords: string[]; // used to detect this category inside previous excuses / context
// }

// interface Recommendation {
//     id: string;
//     category: string;
//     text: string;
//     explanation: string;
//     score: number;
// }

// const initialForm: InputState = {
//     relationship: '',
//     relationshipCustom: '',
//     closeness: '',
//     event: '',
//     eventCustom: '',
//     importance: '',
//     notice: '',
//     tone: '',
//     previousExcuses: [],
//     previousExcuseInput: '',
//     additionalContext: '',
// };

// const ALL_RELATIONSHIPS: RelationKey[] = ['Friend', 'Best Friend', 'Family', 'Date', 'Coworker', 'Boss', 'Client'];
// const ALL_EVENTS: EventKey[] = ['Coffee', 'Lunch', 'Dinner', 'Movie', 'Birthday', 'Party', 'Meeting', 'Trip', 'Interview'];
// const ALL_IMPORTANCE: ImportanceKey[] = ['Casual', 'Planned', 'Important', 'Very Important'];
// const ALL_NOTICE: NoticeKey[] = ['15 minutes', '1 hour', 'Today', 'Tomorrow', 'A few days', 'A week'];
// const ALL_TONE: ToneKey[] = ['Casual', 'Professional', 'Formal', 'Very apologetic'];

// const excuseTemplates: ExcuseTemplate[] = [
//     {
//         id: 'unexpected-issue',
//         category: 'logistics',
//         variants: [
//             "Something unexpected just came up and I need to deal with it right away.",
//             "I've hit an unexpected snag and have to sort it out before I can make {{event}}.",
//         ],
//         relationshipSuitability: ALL_RELATIONSHIPS,
//         eventSuitability: ALL_EVENTS,
//         noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow'],
//         importanceSuitability: ALL_IMPORTANCE,
//         toneSuitability: ALL_TONE,
//         baseConfidence: 0.86,
//         explanation: 'A flexible, believable catch-all for short-notice cancellations.',
//         keywords: ['unexpected', 'issue', 'snag'],
//     },
//     {
//         id: 'family-emergency',
//         category: 'family',
//         variants: [
//             "A family matter came up that needs my attention right away.",
//             "Something's going on with my family that I need to handle today.",
//         ],
//         relationshipSuitability: ALL_RELATIONSHIPS,
//         eventSuitability: ['Lunch', 'Dinner', 'Movie', 'Party', 'Birthday', 'Trip', 'Meeting'],
//         noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow', 'A few days'],
//         importanceSuitability: ['Planned', 'Important', 'Very Important'],
//         toneSuitability: ['Professional', 'Formal', 'Very apologetic'],
//         baseConfidence: 0.85,
//         explanation: 'Reads as serious and non-negotiable — best when you want few follow-up questions.',
//         keywords: ['family', 'emergency', 'relative'],
//     },
//     {
//         id: 'workload',
//         category: 'workload',
//         variants: [
//             "I've got a heavier workload than expected and need to stay heads-down tonight.",
//             "Work piled up more than I planned for, so I need to skip {{event}} this time.",
//         ],
//         relationshipSuitability: ['Coworker', 'Boss', 'Friend', 'Best Friend', 'Family', 'Client'],
//         eventSuitability: ALL_EVENTS,
//         noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow'],
//         importanceSuitability: ['Casual', 'Planned', 'Important'],
//         toneSuitability: ['Casual', 'Professional', 'Formal'],
//         baseConfidence: 0.82,
//         explanation: 'Practical and low-drama — plausible for coworkers and casual plans alike.',
//         keywords: ['work', 'busy', 'workload', 'deadline'],
//     },
//     {
//         id: 'health',
//         category: 'illness',
//         variants: [
//             "I'm not feeling well and don't want to risk showing up under the weather.",
//             "I've come down with something and need to rest instead of making it to {{event}}.",
//         ],
//         relationshipSuitability: ALL_RELATIONSHIPS,
//         eventSuitability: ALL_EVENTS,
//         noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow', 'A few days'],
//         importanceSuitability: ALL_IMPORTANCE,
//         toneSuitability: ALL_TONE,
//         baseConfidence: 0.84,
//         explanation: 'Universally accepted and rarely questioned, but overuse makes it less credible.',
//         keywords: ['sick', 'ill', 'flu', 'unwell', 'cold', 'fever'],
//     },
//     {
//         id: 'prior-commitment',
//         category: 'commitment',
//         variants: [
//             "I already have a prior commitment I need to keep and can't reschedule.",
//             "Turns out I double-booked myself — I have to honor the other commitment first.",
//         ],
//         relationshipSuitability: ALL_RELATIONSHIPS,
//         eventSuitability: ALL_EVENTS,
//         noticeSuitability: ['1 hour', 'Today', 'Tomorrow', 'A few days', 'A week'],
//         importanceSuitability: ALL_IMPORTANCE,
//         toneSuitability: ['Casual', 'Professional', 'Formal'],
//         baseConfidence: 0.78,
//         explanation: 'Steady and non-emotional — works best with more advance notice.',
//         keywords: ['commitment', 'booked', 'schedule'],
//     },
//     {
//         id: 'travel-delay',
//         category: 'travel',
//         variants: [
//             "I'm dealing with a travel delay and need to keep my day flexible.",
//             "My travel plans got thrown off, so I can't lock in {{event}} right now.",
//         ],
//         relationshipSuitability: ALL_RELATIONSHIPS,
//         eventSuitability: ['Coffee', 'Lunch', 'Dinner', 'Meeting', 'Trip', 'Interview'],
//         noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow'],
//         importanceSuitability: ['Planned', 'Important', 'Very Important'],
//         toneSuitability: ['Professional', 'Formal', 'Very apologetic'],
//         baseConfidence: 0.8,
//         explanation: "Useful when timing is tight and there's a plausible professional angle.",
//         keywords: ['travel', 'delay', 'flight', 'traffic', 'transit'],
//     },
//     {
//         id: 'personal-space',
//         category: 'personal-space',
//         variants: [
//             "I need a little personal space tonight and will have to sit this one out.",
//             "I'm running low on social energy and need a quiet night instead of {{event}}.",
//         ],
//         relationshipSuitability: ['Friend', 'Best Friend', 'Family', 'Date'],
//         eventSuitability: ['Coffee', 'Lunch', 'Dinner', 'Movie', 'Party', 'Birthday'],
//         noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow', 'A few days'],
//         importanceSuitability: ['Casual', 'Planned'],
//         toneSuitability: ['Casual', 'Formal', 'Very apologetic'],
//         baseConfidence: 0.72,
//         explanation: 'A gentle, honest boundary — best reserved for close relationships.',
//         keywords: ['space', 'alone', 'energy', 'introvert', 'tired'],
//     },
//     {
//         id: 'client-issue',
//         category: 'professional-urgent',
//         variants: [
//             "A client issue needs my immediate attention, so I have to keep the evening free.",
//             "Something urgent came up on the client side and I need to stay on it.",
//         ],
//         relationshipSuitability: ['Boss', 'Client', 'Coworker', 'Friend'],
//         eventSuitability: ['Meeting', 'Dinner', 'Lunch', 'Coffee', 'Interview'],
//         noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow'],
//         importanceSuitability: ['Important', 'Very Important', 'Planned'],
//         toneSuitability: ['Professional', 'Formal', 'Very apologetic'],
//         baseConfidence: 0.87,
//         explanation: 'Strong for professional contexts where urgency and credibility matter most.',
//         keywords: ['client', 'professional', 'deadline', 'urgent'],
//     },
//     {
//         id: 'tech-failure',
//         category: 'technology',
//         variants: [
//             "I'm dealing with a tech problem — my {{event}} plans got derailed by it.",
//             "Something broke on my end (internet/car/etc.) and I need to get it sorted first.",
//         ],
//         relationshipSuitability: ALL_RELATIONSHIPS,
//         eventSuitability: ALL_EVENTS,
//         noticeSuitability: ['15 minutes', '1 hour', 'Today'],
//         importanceSuitability: ['Casual', 'Planned', 'Important'],
//         toneSuitability: ['Casual', 'Professional'],
//         baseConfidence: 0.74,
//         explanation: 'Casual and specific — best for informal plans with low stakes if questioned.',
//         keywords: ['car', 'internet', 'phone', 'broke', 'technical'],
//     },
//     {
//         id: 'weather',
//         category: 'weather',
//         variants: [
//             "The weather's turned bad enough that getting to {{event}} isn't safe right now.",
//             "Conditions outside are rough and I'd rather not risk the trip over.",
//         ],
//         relationshipSuitability: ALL_RELATIONSHIPS,
//         eventSuitability: ALL_EVENTS,
//         noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow'],
//         importanceSuitability: ['Casual', 'Planned', 'Important'],
//         toneSuitability: ['Casual', 'Professional', 'Formal'],
//         baseConfidence: 0.7,
//         explanation: 'Only credible if weather is plausible for your area — easy to verify, so use sparingly.',
//         keywords: ['weather', 'storm', 'snow', 'rain', 'roads'],
//     },
//     {
//         id: 'financial',
//         category: 'financial',
//         variants: [
//             "Some unexpected expenses came up and I need to hold off on plans that cost money right now.",
//             "I'm tightening my budget this week, so I'll need to skip {{event}}.",
//         ],
//         relationshipSuitability: ['Friend', 'Best Friend', 'Family', 'Date'],
//         eventSuitability: ['Dinner', 'Party', 'Trip', 'Movie'],
//         noticeSuitability: ['Today', 'Tomorrow', 'A few days', 'A week'],
//         importanceSuitability: ['Casual', 'Planned'],
//         toneSuitability: ['Casual', 'Formal'],
//         baseConfidence: 0.68,
//         explanation: 'Honest and relatable for close relationships, less suited to formal settings.',
//         keywords: ['money', 'budget', 'expensive', 'financial'],
//     },
//     {
//         id: 'scheduling-conflict',
//         category: 'scheduling',
//         variants: [
//             "My schedule just shifted and it's now conflicting with {{relationship}} plans I made earlier.",
//             "Something on my calendar moved and now it overlaps — I need to reschedule.",
//         ],
//         relationshipSuitability: ALL_RELATIONSHIPS,
//         eventSuitability: ALL_EVENTS,
//         noticeSuitability: ['1 hour', 'Today', 'Tomorrow', 'A few days', 'A week'],
//         importanceSuitability: ALL_IMPORTANCE,
//         toneSuitability: ['Professional', 'Formal'],
//         baseConfidence: 0.77,
//         explanation: 'Neutral and administrative — good when you want to avoid an emotional reason.',
//         keywords: ['schedule', 'conflict', 'calendar', 'overlap'],
//     },
// ];

// const relationshipOptions: RelationKey[] = [
//     'Friend',
//     'Best Friend',
//     'Family',
//     'Date',
//     'Coworker',
//     'Boss',
//     'Client',
//     'Other',
// ];

// const closenessOptions: ClosenessKey[] = [
//     'Stranger',
//     'Acquaintance',
//     'Friend',
//     'Close Friend',
//     'Best Friend',
//     'Family',
// ];

// const eventOptions: EventKey[] = [
//     'Coffee',
//     'Lunch',
//     'Dinner',
//     'Movie',
//     'Birthday',
//     'Party',
//     'Meeting',
//     'Trip',
//     'Interview',
//     'Other',
// ];

// const importanceOptions: ImportanceKey[] = ['Casual', 'Planned', 'Important', 'Very Important'];
// const noticeOptions: NoticeKey[] = ['15 minutes', '1 hour', 'Today', 'Tomorrow', 'A few days', 'A week'];
// const toneOptions: ToneKey[] = ['Casual', 'Professional', 'Formal', 'Very apologetic'];

// const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

// /** Fills {{event}} / {{relationship}} tokens into a variant using the form's actual values. */
// const personalize = (text: string, state: InputState): string => {
//     const eventLabel =
//         state.event === 'Other' && state.eventCustom.trim()
//             ? state.eventCustom.trim()
//             : (state.event || 'our plans').toLowerCase();
//     const relationshipLabel =
//         state.relationship === 'Other' && state.relationshipCustom.trim()
//             ? state.relationshipCustom.trim()
//             : (state.relationship || 'you').toLowerCase();

//     return text.replace(/\{\{event\}\}/g, eventLabel).replace(/\{\{relationship\}\}/g, relationshipLabel);
// };

// /** Counts how strongly a category shows up in text the user already typed (previous excuses / context). */
// const categoryUsageScore = (text: string, template: ExcuseTemplate): number => {
//     if (!text) return 0;
//     const lower = text.toLowerCase();
//     return template.keywords.reduce((count, keyword) => (lower.includes(keyword) ? count + 1 : count), 0);
// };

// /**
//  * Weighted scoring: each matching field contributes a fixed weight so the
//  * total is easy to reason about, then previous-excuse overlap is subtracted
//  * so categories you've leaned on already drop down the list. A small jitter
//  * keeps repeated submissions with identical inputs from feeling static.
//  */
// const scoreTemplate = (template: ExcuseTemplate, state: InputState): number => {
//     let score = template.baseConfidence * 0.18;

//     if (state.relationship) {
//         if (template.relationshipSuitability.includes(state.relationship)) {
//             score += 0.2;
//         } else if (state.relationship === 'Other' && state.relationshipCustom) {
//             score += 0.05;
//         }
//     }

//     if (state.event) {
//         if (template.eventSuitability.includes(state.event)) {
//             score += 0.16;
//         } else if (state.event === 'Other' && state.eventCustom) {
//             score += 0.05;
//         }
//     }

//     if (state.importance && template.importanceSuitability.includes(state.importance)) {
//         score += 0.13;
//     }

//     if (state.notice && template.noticeSuitability.includes(state.notice)) {
//         score += 0.13;
//     }

//     if (state.tone && template.toneSuitability.includes(state.tone)) {
//         score += 0.1;
//     }

//     if (state.closeness) {
//         score += ['Close Friend', 'Best Friend', 'Family'].includes(state.closeness) ? 0.05 : 0.02;
//     }

//     const previousText = state.previousExcuses.join(' ');
//     const previousOverlap = categoryUsageScore(previousText, template);
//     score -= Math.min(0.4, previousOverlap * 0.16);

//     const contextOverlap = categoryUsageScore(state.additionalContext, template);
//     score += Math.min(0.06, contextOverlap * 0.03);

//     // Small deterministic-ish jitter so ties don't always resolve the same way.
//     score += (Math.random() - 0.5) * 0.02;

//     return clamp(score, 0.2, 0.99);
// };

// /**
//  * Greedy diversity selection (a simplified MMR): after scoring, pick the
//  * best remaining candidate but apply a growing penalty to categories
//  * already represented in the results, so the top picks aren't all the
//  * same flavor of excuse.
//  */
// const selectDiverseTopN = (
//     scored: { template: ExcuseTemplate; score: number }[],
//     n: number,
// ): { template: ExcuseTemplate; score: number }[] => {
//     const pool = [...scored];
//     const picked: { template: ExcuseTemplate; score: number }[] = [];
//     const categoryCounts: Record<string, number> = {};

//     while (picked.length < n && pool.length > 0) {
//         let bestIndex = 0;
//         let bestAdjusted = -Infinity;

//         pool.forEach((candidate, index) => {
//             const penalty = (categoryCounts[candidate.template.category] || 0) * 0.18;
//             const adjusted = candidate.score - penalty;
//             if (adjusted > bestAdjusted) {
//                 bestAdjusted = adjusted;
//                 bestIndex = index;
//             }
//         });

//         const [chosen] = pool.splice(bestIndex, 1);
//         picked.push(chosen);
//         categoryCounts[chosen.template.category] = (categoryCounts[chosen.template.category] || 0) + 1;
//     }

//     return picked;
// };

// /** Picks the variant least similar to anything the user already typed as a previous excuse. */
// const pickVariant = (template: ExcuseTemplate, state: InputState): string => {
//     const previousLower = state.previousExcuses.join(' | ').toLowerCase();
//     const unused = template.variants.find((variant) => {
//         const bare = variant.replace(/\{\{event\}\}|\{\{relationship\}\}/g, '').toLowerCase().slice(0, 20);
//         return !previousLower.includes(bare);
//     });
//     return unused ?? template.variants[Math.floor(Math.random() * template.variants.length)];
// };

// const rankExcuses = (state: InputState): Recommendation[] => {
//     const scored = excuseTemplates.map((template) => ({
//         template,
//         score: scoreTemplate(template, state),
//     }));

//     scored.sort((left, right) => right.score - left.score);

//     const diversePicks = selectDiverseTopN(scored, 5);

//     return diversePicks.map(({ template, score }) => ({
//         id: template.id,
//         category: template.category,
//         text: personalize(pickVariant(template, state), state),
//         explanation: template.explanation,
//         score,
//     }));
// };

// const ShowcaseExplorer: React.FC<ShowcaseExplorerProps> = (props) => {
//     const { initWidth, initHeight } = useInitialWindowSize({ margin: 100 });
//     const [form, setForm] = useState<InputState>(initialForm);
//     const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
//     const [showAll, setShowAll] = useState(false);
//     const clickAudioContextRef = useRef<AudioContext | null>(null);

//     const playClickSound = () => {
//         if (typeof window === 'undefined') {
//             return;
//         }

//         const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
//         if (!AudioContextClass) {
//             return;
//         }

//         if (!clickAudioContextRef.current) {
//             clickAudioContextRef.current = new AudioContextClass();
//         }

//         const audioContext = clickAudioContextRef.current;
//         if (audioContext.state === 'suspended') {
//             void audioContext.resume();
//         }

//         const oscillator = audioContext.createOscillator();
//         const gainNode = audioContext.createGain();
//         oscillator.type = 'square';
//         oscillator.frequency.setValueAtTime(760, audioContext.currentTime);
//         oscillator.frequency.exponentialRampToValueAtTime(560, audioContext.currentTime + 0.06);
//         gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
//         gainNode.gain.exponentialRampToValueAtTime(0.05, audioContext.currentTime + 0.004);
//         gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.11);
//         oscillator.connect(gainNode);
//         gainNode.connect(audioContext.destination);
//         oscillator.start();
//         oscillator.stop(audioContext.currentTime + 0.11);
//     };

//     const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
//         event.preventDefault();
//         const ranked = rankExcuses(form);
//         setRecommendations(ranked);
//         setShowAll(false);
//     };

//     const handleChange = (
//         event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
//         field: keyof InputState,
//     ) => {
//         const value = event.target.value;
//         setForm((current) => ({ ...current, [field]: value }));
//     };

//     const handlePreviousExcuses = () => {
//         const trimmed = form.previousExcuseInput.trim();
//         if (!trimmed) {
//             return;
//         }

//         const values = trimmed
//             .split(',')
//             .map((item) => item.trim())
//             .filter(Boolean);

//         setForm((current) => ({
//             ...current,
//             previousExcuses: [...current.previousExcuses, ...values],
//             previousExcuseInput: '',
//         }));
//     };

//     const removePreviousExcuse = (value: string) => {
//         setForm((current) => ({
//             ...current,
//             previousExcuses: current.previousExcuses.filter((item) => item !== value),
//         }));
//     };

//     const copyRecommendation = async (text: string) => {
//         try {
//             await navigator.clipboard.writeText(text);
//         } catch {
//             // Ignore clipboard failures
//         }
//     };

//     return (
//         <Window
//             top={24}
//             left={56}
//             width={initWidth}
//             height={initHeight}
//             windowTitle="Excuse Assistant"
//             windowBarIcon="windowExplorerIcon"
//             closeWindow={props.onClose}
//             onInteract={props.onInteract}
//             minimizeWindow={props.onMinimize}
//             bottomLeftText="© Curated excuse recommendations"
//         >
//             <div style={styles.shell} onMouseDown={playClickSound}>
//                 <div style={styles.header}>
//                     <div>
//                         <h2 style={styles.title}>Excuse Recommendation Assistant</h2>
//                     </div>
//                 </div>

//                 <div style={styles.layout}>
//                     <form onSubmit={handleSubmit} style={styles.card}>
//                         <div style={styles.grid}>
//                             <label style={styles.field}>
//                                 <span style={styles.label}>Relationship</span>
//                                 <select
//                                     value={form.relationship}
//                                     onChange={(event) => handleChange(event, 'relationship')}
//                                     style={{ ...styles.input, cursor: 'pointer' }}
//                                 >
//                                     <option value="">Select one</option>
//                                     {relationshipOptions.map((option) => (
//                                         <option key={option} value={option}>
//                                             {option}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {form.relationship === 'Other' ? (
//                                     <input
//                                         value={form.relationshipCustom}
//                                         onChange={(event) => handleChange(event, 'relationshipCustom')}
//                                         placeholder="Custom relationship"
//                                         style={{ ...styles.input, marginTop: 8 }}
//                                     />
//                                 ) : null}
//                             </label>

//                             <label style={styles.field}>
//                                 <span style={styles.label}>Closeness</span>
//                                 <select
//                                     value={form.closeness}
//                                     onChange={(event) => handleChange(event, 'closeness')}
//                                     style={{ ...styles.input, cursor: 'pointer' }}
//                                 >
//                                     <option value="">Select one</option>
//                                     {closenessOptions.map((option) => (
//                                         <option key={option} value={option}>
//                                             {option}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </label>

//                             <label style={styles.field}>
//                                 <span style={styles.label}>Event</span>
//                                 <select
//                                     value={form.event}
//                                     onChange={(event) => handleChange(event, 'event')}
//                                     style={{ ...styles.input, cursor: 'pointer' }}
//                                 >
//                                     <option value="">Select one</option>
//                                     {eventOptions.map((option) => (
//                                         <option key={option} value={option}>
//                                             {option}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 {form.event === 'Other' ? (
//                                     <input
//                                         value={form.eventCustom}
//                                         onChange={(event) => handleChange(event, 'eventCustom')}
//                                         placeholder="Custom event"
//                                         style={{ ...styles.input, marginTop: 8 }}
//                                     />
//                                 ) : null}
//                             </label>

//                             <label style={styles.field}>
//                                 <span style={styles.label}>Importance</span>
//                                 <select
//                                     value={form.importance}
//                                     onChange={(event) => handleChange(event, 'importance')}
//                                     style={{ ...styles.input, cursor: 'pointer' }}
//                                 >
//                                     <option value="">Select one</option>
//                                     {importanceOptions.map((option) => (
//                                         <option key={option} value={option}>
//                                             {option}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </label>

//                             <label style={styles.field}>
//                                 <span style={styles.label}>Notice</span>
//                                 <select
//                                     value={form.notice}
//                                     onChange={(event) => handleChange(event, 'notice')}
//                                     style={{ ...styles.input, cursor: 'pointer' }}
//                                 >
//                                     <option value="">Select one</option>
//                                     {noticeOptions.map((option) => (
//                                         <option key={option} value={option}>
//                                             {option}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </label>

//                             <label style={styles.field}>
//                                 <span style={styles.label}>Tone</span>
//                                 <select
//                                     value={form.tone}
//                                     onChange={(event) => handleChange(event, 'tone')}
//                                     style={{ ...styles.input, cursor: 'pointer' }}
//                                 >
//                                     <option value="">Select one</option>
//                                     {toneOptions.map((option) => (
//                                         <option key={option} value={option}>
//                                             {option}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </label>
//                         </div>

//                         <label style={styles.field}>
//                             <span style={styles.label}>Previous excuses (optional)</span>
//                             <div style={styles.inlineRow}>
//                                 <input
//                                     value={form.previousExcuseInput}
//                                     onChange={(event) => handleChange(event, 'previousExcuseInput')}
//                                     placeholder="Type one and press add"
//                                     style={{ ...styles.input, flex: 1 }}
//                                 />
//                                 <button type="button" onClick={handlePreviousExcuses} style={styles.secondaryButton}>
//                                     Add
//                                 </button>
//                             </div>
//                             {form.previousExcuses.length > 0 ? (
//                                 <div style={styles.chipRow}>
//                                     {form.previousExcuses.map((item) => (
//                                         <span key={item} style={styles.chip}>
//                                             {item}
//                                             <button
//                                                 type="button"
//                                                 onClick={() => removePreviousExcuse(item)}
//                                                 style={styles.chipButton}
//                                             >
//                                                 ×
//                                             </button>
//                                         </span>
//                                     ))}
//                                 </div>
//                             ) : null}
//                         </label>

//                         <label style={styles.field}>
//                             <span style={styles.label}>Additional context (optional)</span>
//                             <textarea
//                                 value={form.additionalContext}
//                                 onChange={(event) => handleChange(event, 'additionalContext')}
//                                 rows={4}
//                                 placeholder="Describe anything that might influence the recommendation"
//                                 style={styles.textarea}
//                             />
//                         </label>

//                         <div style={styles.actions}>
//                             <button type="submit" style={styles.primaryButton}>
//                                 Recommend Excuses
//                             </button>
//                         </div>
//                     </form>

//                     {recommendations.length > 0 ? (
//                         <div style={styles.card}>
//                             <div style={styles.resultsHeader}>
//                                 <h3 style={styles.resultsTitle}>Top recommendations</h3>
//                             </div>
//                             <div style={styles.resultsList}>
//                                 {(showAll ? recommendations : recommendations.slice(0, 3)).map((item) => (
//                                     <div key={item.id} style={styles.resultCard}>
//                                         <div style={styles.resultTopRow}>
//                                             <strong
//                                                 style={styles.resultText}
//                                                 onClick={() => copyRecommendation(item.text)}
//                                             >
//                                                 {item.text}
//                                             </strong>
//                                             <span style={styles.scorePill}>{(item.score * 100).toFixed(0)}%</span>
//                                         </div>
//                                         <div style={styles.mutedText}>{item.explanation}</div>
//                                         <div style={styles.categoryTag}>{item.category.replace(/-/g, ' ')}</div>
//                                     </div>
//                                 ))}
//                             </div>
//                             {recommendations.length > 3 ? (
//                                 <div style={styles.moreButtonRow}>
//                                     <button
//                                         type="button"
//                                         onClick={() => setShowAll((current) => !current)}
//                                         style={styles.linkButton}
//                                     >
//                                         {showAll ? 'Show fewer' : 'Show more'}
//                                     </button>
//                                 </div>
//                             ) : null}
//                         </div>
//                     ) : null}
//                 </div>
//             </div>
//         </Window>
//     );
// };

// const styles: Record<string, React.CSSProperties> = {
//     shell: {
//         display: 'flex',
//         flexDirection: 'column',
//         width: '100%',
//         maxWidth: '100%',
//         height: '100%',
//         gap: 16,
//         padding: 20,
//         background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)',
//         color: '#1f2937',
//         overflow: 'auto',
//         boxSizing: 'border-box',
//         cursor: 'default',
//     },
//     header: {
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         gap: 12,
//         flexWrap: 'wrap',
//     },
//     eyebrow: {
//         fontSize: 11,
//         textTransform: 'uppercase',
//         letterSpacing: '0.24em',
//         color: '#5b6b86',
//         marginBottom: 4,
//     },
//     title: {
//         margin: 0,
//         textAlign: 'center',
//         fontSize: 24,
//         color: '#111827',
//     },
//     badge: {
//         padding: '8px 12px',
//         borderRadius: 999,
//         background: '#dbeafe',
//         color: '#1d4ed8',
//         fontSize: 12,
//         fontWeight: 700,
//     },
//     layout: {
//         display: 'flex',
//         flexDirection: 'column',
//         width: '100%',
//         maxWidth: '100%',
//         gap: 16,
//         boxSizing: 'border-box',
//     },
//     card: {
//         width: '100%',
//         maxWidth: '100%',
//         boxSizing: 'border-box',
//         background: 'rgba(255,255,255,0.82)',
//         border: '1px solid #dbe4f0',
//         borderRadius: 16,
//         padding: 16,
//         boxShadow: '0 12px 34px rgba(15, 23, 42, 0.08)',
//         backdropFilter: 'blur(10px)',
//     },
//     grid: {
//         display: 'grid',
//         width: '100%',
//         gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
//         gap: 12,
//     },
//     field: {
//         display: 'flex',
//         flexDirection: 'column',
//         gap: 6,
//         marginBottom: 12,
//     },
//     label: {
//         fontWeight: 700,
//         fontSize: 14,
//         color: '#374151',
//         fontFamily: 'MillenniumBold, "Times New Roman", Times, serif',
//     },
//     input: {
//         padding: '10px 12px',
//         borderRadius: 10,
//         border: '1px solid #cbd5e1',
//         background: '#fff',
//         color: '#111827',
//         fontFamily: 'Millennium, "Times New Roman", Times, serif',
//         fontSize: 15,
//         lineHeight: 1.4,
//         cursor: 'text',
//     },
//     textarea: {
//         padding: '10px 12px',
//         borderRadius: 10,
//         border: '1px solid #cbd5e1',
//         background: '#fff',
//         minHeight: 96,
//         resize: 'vertical',
//         color: '#111827',
//         fontFamily: 'Millennium, "Times New Roman", Times, serif',
//         fontSize: 15,
//         lineHeight: 1.4,
//         cursor: 'text',
//     },
//     inlineRow: {
//         display: 'flex',
//         width: '100%',
//         gap: 8,
//         alignItems: 'center',
//         flexWrap: 'wrap',
//     },
//     chipRow: {
//         display: 'flex',
//         gap: 8,
//         flexWrap: 'wrap',
//         marginTop: 8,
//     },
//     chip: {
//         display: 'inline-flex',
//         alignItems: 'center',
//         background: '#eff6ff',
//         color: '#1d4ed8',
//         borderRadius: 999,
//         padding: '6px 10px',
//         fontSize: 12,
//         gap: 6,
//     },
//     chipButton: {
//         border: 'none',
//         background: 'transparent',
//         color: '#1d4ed8',
//         cursor: 'pointer',
//         fontSize: 14,
//         padding: 0,
//     },
//     actions: {
//         display: 'flex',
//         justifyContent: 'flex-start',
//         marginTop: 6,
//     },
//     primaryButton: {
//         border: 'none',
//         borderRadius: 999,
//         padding: '10px 14px',
//         background: '#2563eb',
//         color: '#fff',
//         cursor: 'pointer',
//         fontWeight: 700,
//         fontFamily: 'MillenniumBold, "Times New Roman", Times, serif',
//         fontSize: 14,
//     },
//     secondaryButton: {
//         border: '1px solid #cbd5e1',
//         borderRadius: 999,
//         padding: '8px 12px',
//         background: '#fff',
//         color: '#111827',
//         cursor: 'pointer',
//         fontWeight: 600,
//         fontFamily: 'Millennium, "Times New Roman", Times, serif',
//         fontSize: 14,
//     },
//     resultsHeader: {
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 16,
//     },
//     resultsTitle: {
//         margin: 0,
//         fontSize: 16,
//         color: '#111827',
//     },
//     resultsList: {
//         display: 'flex',
//         flexDirection: 'column',
//         gap: 12,
//         width: '100%',
//     },
//     resultCard: {
//         width: '100%',
//         boxSizing: 'border-box',
//         padding: 12,
//         borderRadius: 12,
//         border: '1px solid #e2e8f0',
//         background: '#fff',
//         display: 'flex',
//         flexDirection: 'column',
//         gap: 8,
//     },
//     resultTopRow: {
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'flex-start',
//         gap: 8,
//         width: '100%',
//     },
//     resultText: {
//         flex: 1,
//         lineHeight: 1.4,
//         cursor: 'pointer',
//         userSelect: 'text',
//         fontFamily: 'Millennium, "Times New Roman", Times, serif',
//         fontSize: 15,
//     },
//     scorePill: {
//         background: '#dcfce7',
//         color: '#166534',
//         borderRadius: 999,
//         padding: '4px 8px',
//         fontSize: 11,
//         fontWeight: 700,
//         whiteSpace: 'nowrap',
//     },
//     mutedText: {
//         fontSize: 13,
//         color: '#475569',
//         lineHeight: 1.45,
//         fontFamily: 'Millennium, "Times New Roman", Times, serif',
//     },
//     categoryTag: {
//         alignSelf: 'flex-start',
//         fontSize: 11,
//         textTransform: 'capitalize',
//         color: '#5b6b86',
//         background: '#f1f5f9',
//         borderRadius: 999,
//         padding: '3px 8px',
//     },
//     resultBottomRow: {
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         gap: 8,
//         flexWrap: 'wrap',
//         width: '100%',
//     },
//     moreButtonRow: {
//         display: 'flex',
//         justifyContent: 'flex-start',
//         marginTop: 12,
//     },
//     linkButton: {
//         border: 'none',
//         background: 'transparent',
//         color: '#2563eb',
//         cursor: 'pointer',
//         fontWeight: 700,
//         padding: 0,
//         alignSelf: 'flex-start',
//         fontFamily: 'MillenniumBold, "Times New Roman", Times, serif',
//         fontSize: 14,
//     },
// };

// export default ShowcaseExplorer;
