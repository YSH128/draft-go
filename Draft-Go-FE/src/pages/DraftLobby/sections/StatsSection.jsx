import React from 'react';
import StatsDashboard from '../../../components/ui/StatsDashboard';

export default function StatsSection({
    captains,
    draftPool,
    calculateAverageTier
}) {
    return (
        <StatsDashboard
            captains={captains}
            draftPool={draftPool}
            calculateAverageTier={calculateAverageTier}
        />
    );
}
