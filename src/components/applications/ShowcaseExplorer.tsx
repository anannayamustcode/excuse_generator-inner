import React, { useState } from 'react';
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

interface ExcuseTemplate {
    id: string;
    text: string;
    category: string;
    relationshipSuitability: string[];
    eventSuitability: string[];
    noticeSuitability: string[];
    importanceSuitability: string[];
    toneSuitability: string[];
    confidence: number;
    explanation: string;
    avoidKeywords: string[];
}

interface Recommendation extends ExcuseTemplate {
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

const excuseTemplates: ExcuseTemplate[] = [
    {
        id: 'unexpected-issue',
        text: 'I had an unexpected issue come up and need to handle it immediately.',
        category: 'logistics',
        relationshipSuitability: ['Friend', 'Best Friend', 'Family', 'Coworker', 'Boss', 'Client', 'Date'],
        eventSuitability: ['Coffee', 'Lunch', 'Dinner', 'Meeting', 'Movie', 'Birthday', 'Party'],
        noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow'],
        importanceSuitability: ['Casual', 'Planned', 'Important', 'Very Important'],
        toneSuitability: ['Casual', 'Professional', 'Formal', 'Very apologetic'],
        confidence: 0.92,
        explanation: 'Best for last-minute cancellations with a straightforward, believable reason.',
        avoidKeywords: ['illness', 'sick', 'flu'],
    },
    {
        id: 'family-emergency',
        text: 'A family matter came up that needs my attention right away.',
        category: 'family',
        relationshipSuitability: ['Family', 'Best Friend', 'Friend', 'Coworker', 'Boss', 'Client', 'Date'],
        eventSuitability: ['Lunch', 'Dinner', 'Movie', 'Party', 'Birthday', 'Trip', 'Meeting'],
        noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow', 'A few days'],
        importanceSuitability: ['Planned', 'Important', 'Very Important'],
        toneSuitability: ['Professional', 'Formal', 'Very apologetic'],
        confidence: 0.88,
        explanation: 'Works well when the relationship is close and you want a reason that feels serious.',
        avoidKeywords: ['family'],
    },
    {
        id: 'workload',
        text: 'I have a heavier workload than expected and need to stay focused tonight.',
        category: 'workload',
        relationshipSuitability: ['Coworker', 'Boss', 'Friend', 'Best Friend', 'Family'],
        eventSuitability: ['Coffee', 'Lunch', 'Dinner', 'Meeting', 'Movie', 'Party', 'Birthday'],
        noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow'],
        importanceSuitability: ['Casual', 'Planned', 'Important'],
        toneSuitability: ['Casual', 'Professional', 'Formal'],
        confidence: 0.84,
        explanation: 'A practical, low-drama excuse that suits casual to important plans.',
        avoidKeywords: ['busy', 'work'],
    },
    {
        id: 'health',
        text: 'I am not feeling well and do not want to risk showing up under the weather.',
        category: 'illness',
        relationshipSuitability: ['Friend', 'Best Friend', 'Family', 'Date', 'Coworker', 'Boss'],
        eventSuitability: ['Coffee', 'Lunch', 'Dinner', 'Movie', 'Birthday', 'Party', 'Meeting'],
        noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow', 'A few days'],
        importanceSuitability: ['Casual', 'Planned', 'Important', 'Very Important'],
        toneSuitability: ['Casual', 'Professional', 'Formal', 'Very apologetic'],
        confidence: 0.87,
        explanation: 'A reliable option when you want to sound respectful without overexplaining.',
        avoidKeywords: ['sick', 'flu', 'illness'],
    },
    {
        id: 'prior-commitment',
        text: 'I already have a prior commitment that I need to keep and cannot reschedule.',
        category: 'commitment',
        relationshipSuitability: ['Friend', 'Best Friend', 'Family', 'Coworker', 'Boss', 'Client', 'Date'],
        eventSuitability: ['Coffee', 'Lunch', 'Dinner', 'Movie', 'Party', 'Birthday', 'Meeting', 'Trip'],
        noticeSuitability: ['1 hour', 'Today', 'Tomorrow', 'A few days', 'A week'],
        importanceSuitability: ['Casual', 'Planned', 'Important', 'Very Important'],
        toneSuitability: ['Casual', 'Professional', 'Formal'],
        confidence: 0.79,
        explanation: 'Helpful for plans that were arranged earlier and need a steady, non-emotional explanation.',
        avoidKeywords: ['commitment'],
    },
    {
        id: 'travel-delay',
        text: 'I am dealing with a travel delay and need to keep the day flexible.',
        category: 'travel',
        relationshipSuitability: ['Friend', 'Best Friend', 'Family', 'Coworker', 'Boss', 'Client', 'Date'],
        eventSuitability: ['Coffee', 'Lunch', 'Dinner', 'Meeting', 'Trip', 'Interview'],
        noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow'],
        importanceSuitability: ['Planned', 'Important', 'Very Important'],
        toneSuitability: ['Professional', 'Formal', 'Very apologetic'],
        confidence: 0.83,
        explanation: 'Useful when timing is tight and the plan has a practical or professional angle.',
        avoidKeywords: ['travel', 'delay'],
    },
    {
        id: 'personal-block',
        text: 'I need a little personal space tonight and will have to sit this one out.',
        category: 'personal',
        relationshipSuitability: ['Friend', 'Best Friend', 'Family', 'Date'],
        eventSuitability: ['Coffee', 'Lunch', 'Dinner', 'Movie', 'Party', 'Birthday'],
        noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow', 'A few days'],
        importanceSuitability: ['Casual', 'Planned'],
        toneSuitability: ['Casual', 'Formal', 'Very apologetic'],
        confidence: 0.76,
        explanation: 'A softer excuse that can work for close relationships where a gentle boundary is enough.',
        avoidKeywords: ['space', 'personal'],
    },
    {
        id: 'client-issue',
        text: 'A client issue needs my immediate attention, so I need to keep the evening free.',
        category: 'professional',
        relationshipSuitability: ['Boss', 'Client', 'Coworker', 'Friend'],
        eventSuitability: ['Meeting', 'Dinner', 'Lunch', 'Coffee', 'Interview'],
        noticeSuitability: ['15 minutes', '1 hour', 'Today', 'Tomorrow'],
        importanceSuitability: ['Important', 'Very Important', 'Planned'],
        toneSuitability: ['Professional', 'Formal', 'Very apologetic'],
        confidence: 0.9,
        explanation: 'Strong for professional contexts where urgency and credibility matter.',
        avoidKeywords: ['client', 'professional'],
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

const rankExcuses = (state: InputState): Recommendation[] => {
    const normalizedPrevious = state.previousExcuses.join(' ').toLowerCase();
    const contextText = `${state.additionalContext} ${state.relationshipCustom} ${state.eventCustom}`.toLowerCase();

    const scored = excuseTemplates
        .map((template) => {
            let score = template.confidence;

            if (state.relationship) {
                if (template.relationshipSuitability.includes(state.relationship)) {
                    score += 0.12;
                } else if (state.relationship === 'Other' && state.relationshipCustom) {
                    score += 0.04;
                }
            }

            if (state.event) {
                if (template.eventSuitability.includes(state.event)) {
                    score += 0.1;
                } else if (state.event === 'Other' && state.eventCustom) {
                    score += 0.04;
                }
            }

            if (state.importance && template.importanceSuitability.includes(state.importance)) {
                score += 0.08;
            }

            if (state.notice && template.noticeSuitability.includes(state.notice)) {
                score += 0.08;
            }

            if (state.tone && template.toneSuitability.includes(state.tone)) {
                score += 0.07;
            }

            if (state.closeness) {
                const closenessBoost = ['Close Friend', 'Best Friend', 'Family'].includes(state.closeness)
                    ? 0.04
                    : 0.02;
                score += closenessBoost;
            }

            if (normalizedPrevious) {
                const repeats = template.avoidKeywords.some((keyword) => normalizedPrevious.includes(keyword));
                if (repeats) {
                    score -= 0.12;
                }
            }

            if (contextText) {
                const contextBoost = template.avoidKeywords.some((keyword) => contextText.includes(keyword));
                if (contextBoost) {
                    score -= 0.03;
                }
            }

            return { ...template, score: Math.max(0.25, Math.min(0.99, score)) };
        })
        .sort((left, right) => right.score - left.score)
        .slice(0, 5);

    return scored;
};

const ShowcaseExplorer: React.FC<ShowcaseExplorerProps> = (props) => {
    const { initWidth, initHeight } = useInitialWindowSize({ margin: 100 });
    const [form, setForm] = useState<InputState>(initialForm);
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [showAll, setShowAll] = useState(false);

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
            <div style={styles.shell}>
                <div style={styles.header}>
                    <div>
                        {/* <div style={styles.eyebrow}>My Showcase</div> */}
                        <h2 style={styles.title}>Excuse Recommendation Assistant</h2>
                    </div>
                    <div style={styles.badge}>Ranked • 5 picks</div>
                </div>

                <div style={styles.layout}>
                    <form onSubmit={handleSubmit} style={styles.card}>
                        <div style={styles.grid}>
                            <label style={styles.field}>
                                <span style={styles.label}>Relationship</span>
                                <select
                                    value={form.relationship}
                                    onChange={(event) => handleChange(event, 'relationship')}
                                    style={styles.input}
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
                                    style={styles.input}
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
                                    style={styles.input}
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
                                    style={styles.input}
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
                                    style={styles.input}
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
                                    style={styles.input}
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
        textAlign:'center',
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
        fontSize: 13,
        color: '#374151',
    },
    input: {
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid #cbd5e1',
        background: '#fff',
        color: '#111827',
    },
    textarea: {
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid #cbd5e1',
        background: '#fff',
        minHeight: 96,
        resize: 'vertical',
        color: '#111827',
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
    },
    secondaryButton: {
        border: '1px solid #cbd5e1',
        borderRadius: 999,
        padding: '8px 12px',
        background: '#fff',
        color: '#111827',
        cursor: 'pointer',
        fontWeight: 600,
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
    },
};

export default ShowcaseExplorer;
