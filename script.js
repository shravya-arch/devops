document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('risk-form');
    const emptyState = document.getElementById('empty-state');
    const resultContent = document.getElementById('result-content');
    const riskTextDisplay = document.getElementById('risk-text');
    const riskDescription = document.getElementById('risk-description');
    const totalScoreDisplay = document.getElementById('total-score');
    const riskMeter = document.getElementById('risk-meter');
    const resultContainer = document.getElementById('result-container');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get values
        const projectSize = parseInt(document.getElementById('project-size').value);
        const teamExperience = parseInt(document.getElementById('team-experience').value);
        const deadlinePressure = parseInt(document.getElementById('deadline-pressure').value);
        const complexity = parseInt(document.getElementById('complexity').value);

        // Validate that all fields are selected
        if (!projectSize || !teamExperience || !deadlinePressure || !complexity) {
            alert('Please select all options before analyzing.');
            return;
        }

        // Calculate total score (Min: 4, Max: 12)
        const totalScore = projectSize + teamExperience + deadlinePressure + complexity;

        // Determine risk level based on rules
        let riskLevel = '';
        let riskClass = '';
        let bgClass = '';
        
        if (totalScore >= 4 && totalScore <= 6) {
            riskLevel = 'Low';
            riskClass = 'risk-low';
            bgClass = 'bg-risk-low';
        } else if (totalScore >= 7 && totalScore <= 9) {
            riskLevel = 'Medium';
            riskClass = 'risk-medium';
            bgClass = 'bg-risk-medium';
        } else if (totalScore >= 10 && totalScore <= 12) {
            riskLevel = 'High';
            riskClass = 'risk-high';
            bgClass = 'bg-risk-high';
        }

        // Dynamic Text Generation logic
        const factorData = [
            { label: "project size", value: projectSize, valStr: {1: "small size", 2: "moderate size", 3: "large scope"}, improvement: "breaking down the project into smaller phases" },
            { label: "team experience", value: teamExperience, valStr: {1: "strong team expertise", 2: "moderate team experience", 3: "junior team experience"}, improvement: "increasing team expertise" },
            { label: "deadline pressure", value: deadlinePressure, valStr: {1: "flexible deadline", 2: "standard deadline", 3: "strict deadline"}, improvement: "negotiating a more flexible deadline" },
            { label: "technical complexity", value: complexity, valStr: {1: "low complexity", 2: "moderate complexity", 3: "high complexity"}, improvement: "simplifying the technical architecture" }
        ];

        const sortedFactors = [...factorData].sort((a, b) => b.value - a.value);
        
        // Top 2 biggest problems
        const topRisks = sortedFactors.slice(0, 2);
        // Top 2 strongest points
        const strongestPoints = sortedFactors.slice().reverse().slice(0, 2);
        
        let introSentence = "";
        const bestPhrases = strongestPoints.map(f => f.valStr[f.value]).join(" and ");
        const worstPhrases = topRisks.map(f => f.valStr[f.value]).join(" and ");

        if (riskLevel === 'Low') {
            if (topRisks[0].value > 1) {
                introSentence = `${riskLevel} risk due to ${bestPhrases}, but ${topRisks[0].label} could be improved.`;
            } else {
                introSentence = `${riskLevel} risk due to ${bestPhrases}.`;
            }
        } else if (riskLevel === 'Medium') {
            introSentence = `${riskLevel} risk; supported by ${bestPhrases}, but ${topRisks[0].label} requires attention.`;
        } else {
            introSentence = `${riskLevel} risk, driven primarily by ${worstPhrases}.`;
        }

        const topRiskLabels = topRisks.map(f => f.label).join(" and ");
        let middleSentence = "";
        if (topRisks[0].value > 1) {
            middleSentence = `Risk is influenced mainly by ${topRiskLabels}.`;
        } else {
            middleSentence = `All parameters are currently optimal.`;
        }

        const improvementsToMake = topRisks.filter(f => f.value > 1).map(f => f.improvement).join(" and ");
        let suggestionSentence = "";
        if (improvementsToMake) {
            suggestionSentence = `Consider ${improvementsToMake} to further reduce risk.`;
        }

        const descriptionText = `${introSentence} ${middleSentence} ${suggestionSentence}`.trim();

        // Update UI
        emptyState.style.display = 'none';
        resultContent.classList.remove('hidden');
        
        // Remove previous classes
        riskTextDisplay.className = '';
        resultContainer.className = 'result-container glass-panel';
        
        // Add new classes
        riskTextDisplay.classList.add(riskClass);
        resultContainer.classList.add(bgClass);
        
        // Update content
        riskTextDisplay.textContent = riskLevel;
        riskDescription.textContent = descriptionText;
        totalScoreDisplay.textContent = `${totalScore} / 12`;
        totalScoreDisplay.className = `score-badge ${riskClass}`;

        // Calculate meter percentage (Score ranges from 4 to 12. 4 is 0%, 12 is 100%)
        const percentage = ((totalScore - 4) / (12 - 4)) * 100;
        
        // Update meter variables
        riskMeter.style.setProperty('--fill-percentage', `${percentage}%`);
        
        // Get the computed color for the meter
        let meterColor;
        if (riskLevel === 'Low') meterColor = 'var(--risk-low)';
        else if (riskLevel === 'Medium') meterColor = 'var(--risk-medium)';
        else if (riskLevel === 'High') meterColor = 'var(--risk-high)';
        
        riskMeter.style.setProperty('--meter-color', meterColor);
    });
});
