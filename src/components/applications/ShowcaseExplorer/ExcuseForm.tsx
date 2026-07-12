import React from 'react';
import { InputState } from './types';
import { styles } from './styles';
import {
    relationshipOptions,
    closenessOptions,
    eventOptions,
    importanceOptions,
    noticeOptions,
    toneOptions,
} from './constants';

export interface ExcuseFormProps {
    form: InputState;
    handleChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
        field: keyof InputState,
    ) => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    handlePreviousExcuses: () => void;
    removePreviousExcuse: (value: string) => void;
}

export const ExcuseForm: React.FC<ExcuseFormProps> = ({
    form,
    handleChange,
    handleSubmit,
    handlePreviousExcuses,
    removePreviousExcuse,
}) => {
    return (
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
    );
};
