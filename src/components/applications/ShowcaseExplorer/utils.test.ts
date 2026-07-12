import { scoreTemplate, rankExcuses } from './utils';
import { initialForm, excuseTemplates } from './constants';
import { InputState } from './types';

describe('ShowcaseExplorer utils', () => {
    it('should score family emergency highest for family events', () => {
        const state: InputState = {
            ...initialForm,
            relationship: 'Family',
            event: 'Dinner',
            importance: 'Important',
            notice: '1 hour',
            tone: 'Professional',
        };
        const familyTemplate = excuseTemplates.find(t => t.id === 'family-childcare')!;
        const score = scoreTemplate(familyTemplate, state);
        expect(score).toBeGreaterThan(0.4);
    });

    it('should penalize categories used in previous excuses', () => {
        const state: InputState = {
            ...initialForm,
            relationship: 'Coworker',
            event: 'Meeting',
            importance: 'Planned',
            notice: 'Tomorrow',
            tone: 'Professional',
            previousExcuses: ['I have a deadline to meet.'], // "deadline" is a keyword for workload
        };
        const workloadTemplate = excuseTemplates.find(t => t.id === 'work-deadline')!;
        const scoreWithout = scoreTemplate(workloadTemplate, { ...state, previousExcuses: [] });
        const scoreWith = scoreTemplate(workloadTemplate, state);

        expect(scoreWith).toBeLessThan(scoreWithout);
    });

    it('should personalize the excuse variant', () => {
        const state: InputState = {
            ...initialForm,
            relationship: 'Boss',
            event: 'Meeting',
        };
        const variantHistory = {};
        const ranked = rankExcuses(state, variantHistory);
        ranked.forEach(r => {
            expect(r.text).not.toContain('{{event}}');
            expect(r.text).not.toContain('{{relationship}}');
        });
    });

    it('should provide exactly 5 diverse recommendations', () => {
        const state: InputState = { ...initialForm };
        const ranked = rankExcuses(state, {});
        expect(ranked.length).toBe(5);
        const categories = new Set(ranked.map(r => r.category));
        expect(categories.size).toBe(5); // all 5 should be different
    });

    it('should cycle through variants using variantHistory', () => {
        const state: InputState = { ...initialForm };
        const history: Record<string, number> = {};
        
        // First run
        const ranked1 = rankExcuses(state, history);
        
        // Second run
        const ranked2 = rankExcuses(state, history);
        
        // They should have different texts because variants rotate
        // (Assuming the templates have >1 variant, which they do)
        expect(ranked1[0].text).not.toEqual(ranked2[0].text);
    });
});
