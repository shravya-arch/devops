document.addEventListener('DOMContentLoaded', () => {
    const formSectionsContainer = document.getElementById('form-sections-container');
    const form = document.getElementById('comprehensive-risk-form');
    const resetBtn = document.getElementById('reset-btn');
    const exportBtn = document.getElementById('export-btn');
    const analyzeBtn = document.getElementById('analyze-btn');
    
    const emptyState = document.getElementById('empty-state');
    const resultContent = document.getElementById('result-content');
    const riskTextDisplay = document.getElementById('risk-text');
    const riskDescription = document.getElementById('risk-description');
    const recommendationsList = document.getElementById('recommendations-list');
    const riskMeter = document.getElementById('risk-meter');
    const resultContainer = document.getElementById('result-container');
    const factorBreakdown = document.getElementById('factor-breakdown');
    const loadingOverlay = document.getElementById('loading-overlay');
    
    const presetButtons = document.querySelectorAll('.preset-btn');
    let riskChartInstance = null;
    let currentMode = null;
    let currentConfig = null;

    // Define the dynamic configurations for each mode
    const modeConfigs = {
        startup: {
            project: {
                title: "Startup Execution", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", color: "#f59e0b",
                fields: [
                    { id: "runway", label: "Financial Runway (Budget)", weight: 1.5, options: [{val: 1, text: "12+ Months"}, {val: 2, text: "6-12 Months"}, {val: 3, text: "< 6 Months"}], imp: "securing bridge funding or cutting burn rate" },
                    { id: "timeline", label: "Time to Market", weight: 1.5, options: [{val: 1, text: "Flexible (>6 mo)"}, {val: 2, text: "Standard (3-6 mo)"}, {val: 3, text: "Aggressive (1-2 mo)"}], imp: "scoping down the MVP features" },
                    { id: "team", label: "Core Team Dynamics", weight: 1.2, options: [{val: 1, text: "Experienced Founders"}, {val: 2, text: "Mixed Experience"}, {val: 3, text: "First-time Founders"}], imp: "bringing on experienced advisors or fractional CTOs" }
                ]
            },
            technical: {
                title: "MVP Technology", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", color: "#10b981",
                fields: [
                    { id: "complexity", label: "Stack Complexity", weight: 1.5, options: [{val: 1, text: "Simple No-Code / SaaS"}, {val: 2, text: "Standard Web Framework"}, {val: 3, text: "Complex Custom AI/ML Stack"}], imp: "using managed services instead of building from scratch" },
                    { id: "scalability", label: "Day 1 Scalability Needs", weight: 1.0, options: [{val: 1, text: "1-100 Users"}, {val: 2, text: "1,000s of Users"}, {val: 3, text: "Viral Scale Expected"}], imp: "focusing on getting the first user before over-engineering scale" }
                ]
            },
            business: {
                title: "Market Risk", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", color: "#6366f1",
                fields: [
                    { id: "marketValidation", label: "Market Validation", weight: 1.5, options: [{val: 1, text: "Paying Customers Exist"}, {val: 2, text: "Strong Waitlist/Interest"}, {val: 3, text: "Unvalidated Idea"}], imp: "talking to users and launching a landing page immediately" },
                    { id: "competition", label: "Competitive Landscape", weight: 1.2, options: [{val: 1, text: "Niche/Blue Ocean"}, {val: 2, text: "Fragmented Market"}, {val: 3, text: "Dominated by Giants"}], imp: "finding a specific underserved niche to dominate first" }
                ]
            }
        },
        enterprise: {
            project: {
                title: "Enterprise Delivery", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", color: "#f59e0b",
                fields: [
                    { id: "budget", label: "Capital Allocation", weight: 1.2, options: [{val: 1, text: "$1M+ Secured"}, {val: 2, text: "Requires Phased Approvals"}, {val: 3, text: "Strict/Tight Budget"}], imp: "establishing strict financial governance" },
                    { id: "timeline", label: "Project Timeline", weight: 1.0, options: [{val: 1, text: "2+ Years (Phased)"}, {val: 2, text: "1 Year"}, {val: 3, text: "< 6 Months (Rushed)"}], imp: "implementing strict change management processes" },
                    { id: "stakeholders", label: "Stakeholder Alignment", weight: 1.5, options: [{val: 1, text: "Fully Aligned Board"}, {val: 2, text: "Some Departmental Friction"}, {val: 3, text: "Highly Political / Siloed"}], imp: "creating a cross-functional steering committee" }
                ]
            },
            technical: {
                title: "Enterprise Architecture", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", color: "#10b981",
                fields: [
                    { id: "legacy", label: "Legacy Migration Level", weight: 1.5, options: [{val: 1, text: "Standalone System"}, {val: 2, text: "Partial API Integration"}, {val: 3, text: "Full Mainframe Replacement"}], imp: "adopting the Strangler Fig pattern for migration" },
                    { id: "vendor", label: "Vendor Lock-in", weight: 1.2, options: [{val: 1, text: "Open Source / Portable"}, {val: 2, text: "Hybrid Cloud"}, {val: 3, text: "Deep Single-Vendor Reliance"}], imp: "containerizing workloads to maintain portability" },
                    { id: "quality", label: "CI/CD & Testing", weight: 1.2, options: [{val: 1, text: "Fully Automated E2E"}, {val: 2, text: "Partial Automation"}, {val: 3, text: "Manual Deployments"}], imp: "investing heavily in DevOps automation" }
                ]
            },
            security: {
                title: "Security & Compliance", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", color: "#ef4444",
                fields: [
                    { id: "compliance", label: "Regulatory Compliance", weight: 1.5, options: [{val: 1, text: "Internal Policies Only"}, {val: 2, text: "Standard Industry (ISO)"}, {val: 3, text: "Strict (HIPAA, FedRAMP, SOC2)"}], imp: "involving legal and compliance teams before writing code" },
                    { id: "data", label: "Data Sensitivity Level", weight: 1.5, options: [{val: 1, text: "Public/Anonymized"}, {val: 2, text: "Internal Corporate Data"}, {val: 3, text: "Mission-Critical PII/Financial"}], imp: "implementing zero-trust architecture and strict access controls" }
                ]
            }
        },
        student: {
            project: {
                title: "Academic Project", icon: "M12 14l9-5-9-5-9 5 9 5z", color: "#f59e0b",
                fields: [
                    { id: "deadline", label: "Grading Deadline", weight: 1.5, options: [{val: 1, text: "End of Semester"}, {val: 2, text: "Next Month"}, {val: 3, text: "Next Week"}], imp: "descoping complex features to ensure something runnable is submitted" },
                    { id: "team", label: "Group Coordination", weight: 1.2, options: [{val: 1, text: "Solo Project"}, {val: 2, text: "Active Partners"}, {val: 3, text: "Unresponsive Partners"}], imp: "establishing clear GitHub workflows and task assignments early" }
                ]
            },
            technical: {
                title: "Learning Curve", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4", color: "#10b981",
                fields: [
                    { id: "familiarity", label: "Tech Stack Familiarity", weight: 1.5, options: [{val: 1, text: "Used it previously"}, {val: 2, text: "Followed a tutorial"}, {val: 3, text: "Completely new language/tool"}], imp: "building a tiny 'Hello World' prototype before the main app" },
                    { id: "mentorship", label: "Access to Help", weight: 1.0, options: [{val: 1, text: "TA / Professor readily available"}, {val: 2, text: "Online Forums only"}, {val: 3, text: "Obscure tech (No help)"}], imp: "switching to a more popular framework with better documentation" }
                ]
            }
        }
    };

    function renderForm(mode) {
        currentMode = mode;
        currentConfig = modeConfigs[mode];
        
        let htmlContent = '';
        for (const [catKey, category] of Object.entries(currentConfig)) {
            htmlContent += `
            <fieldset class="form-section">
                <legend>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${category.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="${category.icon}"></path>
                    </svg>
                    ${category.title}
                </legend>
                <div class="section-grid">
            `;
            
            category.fields.forEach(field => {
                let optionsHtml = `<option value="" disabled selected>Select option</option>`;
                field.options.forEach(opt => {
                    optionsHtml += `<option value="${opt.val}">${opt.text}</option>`;
                });

                htmlContent += `
                <div class="form-group" title="${field.label}">
                    <label for="${field.id}">${field.label}</label>
                    <div class="custom-select-wrapper">
                        <select id="${field.id}" required data-category="${catKey}" data-weight="${field.weight}" data-label="${field.label}" data-imp="${field.imp}">
                            ${optionsHtml}
                        </select>
                    </div>
                </div>`;
            });
            
            htmlContent += `</div></fieldset>`;
        }
        formSectionsContainer.innerHTML = htmlContent;
        analyzeBtn.style.display = 'flex'; // Show the button once a mode is selected
        
        // Hide result content if previously shown
        resultContent.classList.add('hidden');
        emptyState.style.display = 'block';
    }

    // Initialize with empty state message
    formSectionsContainer.innerHTML = `
        <div class="empty-state" style="margin: 2rem 0;">
            <p>Please select a Project Profile above to load the appropriate risk assessment.</p>
        </div>
    `;
    analyzeBtn.style.display = 'none';

    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderForm(btn.dataset.preset);
        });
    });

    resetBtn.addEventListener('click', () => {
        if(currentMode) {
            form.reset();
        }
        resultContent.classList.add('hidden');
        emptyState.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    exportBtn.addEventListener('click', () => {
        window.print();
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if(!currentMode) return;

        loadingOverlay.classList.remove('hidden');
        setTimeout(() => {
            analyzeRisk();
            loadingOverlay.classList.add('hidden');
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1200);
    });

    function analyzeRisk() {
        const selects = document.querySelectorAll('select[required]');
        let totalWeightedScore = 0;
        let maxPossibleWeightedScore = 0;
        
        // Initialize dynamic category trackers based on current config
        const categoryScores = {};
        const categoryMax = {};
        for (const catKey of Object.keys(currentConfig)) {
            categoryScores[catKey] = 0;
            categoryMax[catKey] = 0;
        }
        
        const highRiskFactors = [];
        const rawValues = {};

        selects.forEach(select => {
            const val = parseInt(select.value);
            const weight = parseFloat(select.dataset.weight);
            const cat = select.dataset.category;
            const label = select.dataset.label;
            const imp = select.dataset.imp;
            const id = select.id;
            
            rawValues[id] = val;

            const weightedVal = val * weight;
            const maxWeightedVal = 3 * weight;

            totalWeightedScore += weightedVal;
            maxPossibleWeightedScore += maxWeightedVal;
            
            if(categoryScores[cat] !== undefined) {
                categoryScores[cat] += weightedVal;
                categoryMax[cat] += maxWeightedVal;
            }

            if (val === 3) {
                highRiskFactors.push({ label, imp, cat });
            }
        });

        const overallPercentage = totalWeightedScore / maxPossibleWeightedScore;
        let riskLevel = 'Low';
        let riskClass = 'risk-low';
        let bgClass = 'bg-risk-low';

        if (overallPercentage >= 0.70) {
            riskLevel = 'High';
            riskClass = 'risk-high';
            bgClass = 'bg-risk-high';
        } else if (overallPercentage >= 0.45) {
            riskLevel = 'Medium';
            riskClass = 'risk-medium';
            bgClass = 'bg-risk-medium';
        }

        // Conditional Rules specific to mode
        let triggeredRules = [];
        
        if (currentMode === 'startup') {
            if (rawValues.runway === 3 && rawValues.marketValidation === 3) {
                riskLevel = 'High'; riskClass = 'risk-high'; bgClass = 'bg-risk-high';
                triggeredRules.push("Short runway combined with an unvalidated idea forces a Critical Risk classification.");
            }
        } else if (currentMode === 'enterprise') {
            if (rawValues.legacy === 3 && rawValues.compliance === 3) {
                riskLevel = 'High'; riskClass = 'risk-high'; bgClass = 'bg-risk-high';
                triggeredRules.push("Heavy legacy migration combined with strict compliance forces a High Risk classification.");
            }
        } else if (currentMode === 'student') {
            if (rawValues.deadline === 3 && rawValues.familiarity === 3) {
                riskLevel = 'High'; riskClass = 'risk-high'; bgClass = 'bg-risk-high';
                triggeredRules.push("Using completely new technology with a deadline next week is extremely high risk.");
            }
        }

        // Build Explanation
        let explanationText = "";
        if (triggeredRules.length > 0) {
            explanationText = triggeredRules.join(" ");
        } else {
            if (riskLevel === 'Low') {
                explanationText = `For a ${currentMode} profile, the parameters are within safe thresholds.`;
            } else if (riskLevel === 'Medium') {
                explanationText = `This ${currentMode} project carries moderate risk. Attention is required in specific areas.`;
            } else {
                explanationText = `Critical risk factors have been identified for this ${currentMode} project. Immediate mitigation is needed.`;
            }
        }

        if (highRiskFactors.length > 0) {
            explanationText += ` Primary drivers are ${highRiskFactors.slice(0,2).map(f => `<strong>${f.label}</strong>`).join(" and ")}.`;
        }

        // Build Category Data for Chart and UI
        const catData = [];
        const catLabels = [];
        factorBreakdown.innerHTML = '';
        
        for (const [catKey, category] of Object.entries(currentConfig)) {
            const percent = categoryMax[catKey] > 0 ? (categoryScores[catKey] / categoryMax[catKey]) : 0;
            let catLvl = 'Low'; let catColor = '#10b981';
            if(percent >= 0.7) { catLvl = 'High'; catColor = '#ef4444'; }
            else if(percent >= 0.45) { catLvl = 'Medium'; catColor = '#f59e0b'; }
            
            catData.push(percent * 100);
            catLabels.push(category.title);

            factorBreakdown.innerHTML += `
                <div class="factor-card" style="border-top: 3px solid ${catColor}">
                    <div class="factor-icon" style="color: ${catColor}; background: ${catColor}20">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="${category.icon}"></path>
                        </svg>
                    </div>
                    <div>
                        <h4>${category.title}</h4>
                        <div class="factor-level" style="color: ${catColor}; font-weight: 600;">${catLvl}</div>
                    </div>
                </div>
            `;
        }

        // Render Recommendations
        recommendationsList.innerHTML = '';
        if (highRiskFactors.length === 0) {
            recommendationsList.innerHTML = '<li><span class="rec-icon">👍</span> Maintain current project hygiene and standard monitoring practices.</li>';
        } else {
            const uniqueImps = [...new Set(highRiskFactors.map(f => f.imp))];
            uniqueImps.forEach(imp => {
                recommendationsList.innerHTML += `<li><span class="rec-icon">💡</span> We highly recommend ${imp}.</li>`;
            });
        }

        // Update UI Core
        emptyState.style.display = 'none';
        resultContent.classList.remove('hidden');
        
        resultContainer.className = 'result-container glass-panel';
        resultContainer.classList.add(bgClass);
        
        riskTextDisplay.className = riskClass;
        riskTextDisplay.textContent = riskLevel;
        riskDescription.innerHTML = explanationText;

        // Meter update
        let meterColor;
        if (riskLevel === 'Low') meterColor = 'var(--risk-low)';
        else if (riskLevel === 'Medium') meterColor = 'var(--risk-medium)';
        else if (riskLevel === 'High') meterColor = 'var(--risk-high)';
        
        const displayPercent = Math.max(10, overallPercentage * 100);
        riskMeter.style.setProperty('--fill-percentage', `${displayPercent}%`);
        riskMeter.style.setProperty('--meter-color', meterColor);

        // Chart.js Update
        const ctx = document.getElementById('riskChart').getContext('2d');
        if (riskChartInstance) {
            riskChartInstance.destroy();
        }
        
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = "'Outfit', sans-serif";

        riskChartInstance = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: catLabels,
                datasets: [{
                    label: 'Risk Percentage',
                    data: catData,
                    backgroundColor: [
                        'rgba(245, 158, 11, 0.5)',  // Yellow
                        'rgba(16, 185, 129, 0.5)',  // Green
                        'rgba(99, 102, 241, 0.5)',  // Indigo
                        'rgba(239, 68, 68, 0.5)'    // Red
                    ],
                    borderColor: [
                        '#f59e0b',
                        '#10b981',
                        '#6366f1',
                        '#ef4444'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: { display: false },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${context.raw.toFixed(1)}% Risk`;
                            }
                        }
                    }
                }
            }
        });
    }
});
