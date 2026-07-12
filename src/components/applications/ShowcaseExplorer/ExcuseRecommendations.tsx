import React from 'react';
import { Recommendation } from './types';
import { styles } from './styles';

export interface ExcuseRecommendationsProps {
    recommendations: Recommendation[];
    showAll: boolean;
    setShowAll: React.Dispatch<React.SetStateAction<boolean>>;
    copyRecommendation: (text: string) => void;
}

export const ExcuseRecommendations: React.FC<ExcuseRecommendationsProps> = ({
    recommendations,
    showAll,
    setShowAll,
    copyRecommendation,
}) => {
    if (recommendations.length === 0) return null;

    return (
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
    );
};
