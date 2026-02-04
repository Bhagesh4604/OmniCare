
const smartContracts = {
    // Knowledge Base of Drug Interactions (Mocked for Demo)
    interactions: {
        'Warfarin': ['Aspirin', 'Ibuprofen', 'Naproxen'],
        'Aspirin': ['Warfarin', 'Heparin'],
        'Lisinopril': ['Potassium', 'Spironolactone'],
        'Simvastatin': ['Amlodipine', 'Grapefruit'],
        'Metformin': ['Furosemide'],
        'Nitroglycerin': ['Sildenafil', 'Tadalafil'],
        'Sildenafil': ['Nitroglycerin', 'Isosorbide Mononitrate']
    },

    // "Smart Contract" Execution
    checkInteractions: (newDrug, patientHistory) => {
        return new Promise((resolve, reject) => {
            try {
                console.log(`🔗 Smart Contract Invoked: Checking ${newDrug} against history...`);

                const alerts = [];
                const safeHistory = Array.isArray(patientHistory) ? patientHistory : [];

                // 1. Standardize Input
                const drugName = newDrug.trim();

                // 2. Lookup Known Interactions
                const dangerousCombos = smartContracts.interactions[drugName] || [];

                // 3. Scan Patient's Ledger/History
                safeHistory.forEach(record => {
                    // Check if patient is currently taking a conflicting drug
                    // Assumes record has { medicationName, status: 'Active' }
                    if (record.status === 'Active' && dangerousCombos.includes(record.medicationName)) {
                        alerts.push({
                            severity: 'HIGH',
                            alert: `CRITICAL INTERACTION DETECTED: ${drugName} + ${record.medicationName}`,
                            recommendation: `Do not prescribe ${drugName}. Patient is currently on ${record.medicationName}. Risk of severe bleeding or adverse reaction.`
                        });
                    }
                });

                // 4. Return "Contract Result"
                const passed = alerts.length === 0;
                resolve({
                    passed,
                    timestamp: new Date().toISOString(),
                    contractId: `SC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    alerts
                });

            } catch (error) {
                console.error("Smart Contract Error:", error);
                reject(error);
            }
        });
    }
};

module.exports = smartContracts;
