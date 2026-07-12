import { InputState, ExcuseTemplate, Recommendation } from './types';
import { excuseTemplates } from './constants';

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/** Fills {{event}} / {{relationship}} tokens into a variant using the form's actual values. */
export const personalize = (text: string, state: InputState): string => {
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
export const categoryUsageScore = (text: string, template: ExcuseTemplate): number => {
    if (!text) return 0;
    const lower = text.toLowerCase();
    return template.keywords.reduce((count, keyword) => {
        const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
        return pattern.test(lower) ? count + 1 : count;
    }, 0);
};

/**
 * Weighted scoring with Hard Vetoes and Specificity Bonuses.
 * If a template is fundamentally incompatible with the context, it returns 0.
 * The more narrow/specific a template is, the higher its bonus.
 */
export const scoreTemplate = (template: ExcuseTemplate, state: InputState): number => {
    let score = template.baseConfidence * 0.18;

    // Hard Veto: Relationship
    if (state.relationship && state.relationship !== 'Other') {
        if (!template.relationshipSuitability.includes(state.relationship as any)) {
            return 0; // Hard Veto
        }
        // Specificity Bonus: The fewer relationships this template applies to, the higher the bonus
        const specificity = 1 - (template.relationshipSuitability.length / 8); 
        score += 0.05 + (0.25 * specificity); 
    } else if (state.relationship === 'Other' && state.relationshipCustom) {
        score += 0.05;
    }

    // Hard Veto: Event
    if (state.event && state.event !== 'Other') {
        if (!template.eventSuitability.includes(state.event as any)) {
            return 0; // Hard Veto
        }
        const specificity = 1 - (template.eventSuitability.length / 9); 
        score += 0.05 + (0.2 * specificity);
    } else if (state.event === 'Other' && state.eventCustom) {
        score += 0.05;
    }

    // Hard Veto: Importance
    if (state.importance) {
        if (!template.importanceSuitability.includes(state.importance as any)) {
            return 0;
        }
        const specificity = 1 - (template.importanceSuitability.length / 4);
        score += 0.05 + (0.15 * specificity);
    }

    // Hard Veto: Notice
    if (state.notice) {
        if (!template.noticeSuitability.includes(state.notice as any)) {
            return 0;
        }
        const specificity = 1 - (template.noticeSuitability.length / 6);
        score += 0.05 + (0.15 * specificity);
    }

    // Tone: Not a hard veto, but a bonus for matching
    if (state.tone) {
        if (template.toneSuitability.includes(state.tone as any)) {
            const specificity = 1 - (template.toneSuitability.length / 4);
            score += 0.05 + (0.1 * specificity);
        } else {
            // Soft penalty for wrong tone
            score -= 0.1;
        }
    }

    if (state.closeness) {
        score += ['Close Friend', 'Best Friend', 'Family'].includes(state.closeness) ? 0.05 : 0.02;
    }

    const previousText = state.previousExcuses.join(' ');
    const previousOverlap = categoryUsageScore(previousText, template);
    score -= Math.min(0.4, previousOverlap * 0.16);

    const contextOverlap = categoryUsageScore(state.additionalContext, template);
    score += Math.min(0.06, contextOverlap * 0.03);

    return clamp(score, 0, 0.99);
};

/**
 * Greedy diversity selection (a simplified MMR): after scoring, pick the
 * best remaining candidate but apply a growing penalty to categories
 * already represented in the results, so the top picks aren't all the
 * same flavor of excuse.
 */
export const selectDiverseTopN = (
    scored: { template: ExcuseTemplate; score: number }[],
    n: number,
): { template: ExcuseTemplate; score: number }[] => {
    // Filter out vetoed items (score === 0)
    const pool = scored.filter(s => s.score > 0);
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

/** Picks the variant sequentially using variantHistory state to cycle through options. */
export const pickVariant = (
    template: ExcuseTemplate,
    lastVariantIndex: number | undefined,
): string => {
    if (template.variants.length <= 1) return template.variants[0];
    const nextIndex = lastVariantIndex === undefined
        ? 0
        : (lastVariantIndex + 1) % template.variants.length;
    return template.variants[nextIndex];
};

export const rankExcuses = (state: InputState, variantHistory: Record<string, number>): Recommendation[] => {
    const scored = excuseTemplates.map((template) => ({
        template,
        score: scoreTemplate(template, state),
    }));

    scored.sort((left, right) => right.score - left.score);

    const diversePicks = selectDiverseTopN(scored, 5);

    return diversePicks.map(({ template, score }) => {
        const lastIndex = variantHistory[template.id];
        const text = pickVariant(template, lastIndex);
        
        // Update history for next time
        variantHistory[template.id] = lastIndex === undefined ? 0 : (lastIndex + 1) % template.variants.length;

        return {
            id: template.id,
            category: template.category,
            text: personalize(text, state),
            explanation: template.explanation,
            score,
        };
    });
};
