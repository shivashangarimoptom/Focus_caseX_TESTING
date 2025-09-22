document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('optometryCaseForm');
    if (!form) {
        console.warn('No form found with ID "optometryCaseForm" on this page. Script may not function as expected.');
        return;
    }

    const clearFormButton = document.getElementById('clearForm');
    const caseTypeElement = form.querySelector('input[name="caseType"]');
    const currentCaseType = caseTypeElement ? caseTypeElement.value : 'general';

    /**
     * Sets up conditional display/enablement for form elements.
     * @param {string} triggerInputId The ID of the input element (radio, checkbox, select) that triggers the condition.
     * @param {string|string[]} triggerValues The value(s) of the triggerInput that activate the target. For checkboxes, any checked state activates.
     * @param {string} targetSelector The CSS selector for the element(s) to be affected (can be a textarea, input, or a .conditional-group div).
     * @param {string} [actionType='display'] 'display' to toggle display:none, 'disabled' to toggle disabled attribute on target(s).
     * @param {string} [defaultValue=''] Default value for textareas/inputs when disabled/hidden.
     */
    function setupConditionalToggle(triggerInputId, triggerValues, targetSelector, actionType = 'display', defaultValue = '') {
        const triggerInput = document.getElementById(triggerInputId);
        const targets = document.querySelectorAll(targetSelector);

        if (!triggerInput || targets.length === 0) {
            // console.warn(`Conditional Toggle setup failed: Missing elements for trigger ID "${triggerInputId}" or target selector "${targetSelector}"`);
            return;
        }

        const valuesToActivate = Array.isArray(triggerValues) ? triggerValues : [triggerValues];

        const applyToggleState = () => {
            let activate = false;

            if (triggerInput.type === 'checkbox') {
                activate = triggerInput.checked;
            } else if (triggerInput.type === 'radio') {
                activate = triggerInput.checked && valuesToActivate.includes(triggerInput.value);
            } else if (triggerInput.tagName === 'SELECT') {
                activate = valuesToActivate.includes(triggerInput.value);
            }

            targets.forEach(target => {
                if (actionType === 'display') {
                    target.style.display = activate ? 'block' : 'none';
                    // Update ARIA expanded state
                    if (triggerInput.hasAttribute('aria-controls') && triggerInput.getAttribute('aria-controls').includes(target.id)) {
                        target.setAttribute('aria-expanded', activate);
                    }

                    if (!activate) {
                        // If hiding, also clear and disable any inputs within the hidden group
                        // Exclude hidden inputs from being cleared/disabled
                        target.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(input => {
                            input.value = defaultValue;
                            input.disabled = true;
                            if (input.type === 'checkbox' || input.type === 'radio') {
                                input.checked = false;
                            } else if (input.tagName === 'SELECT') {
                                // Reset select to its first option (assuming the first option is a placeholder/default)
                                input.selectedIndex = 0;
                            }
                        });
                    } else {
                        // Enable inputs when visible
                        target.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(input => {
                            input.disabled = false;
                        });
                    }
                } else if (actionType === 'disabled') {
                    // This 'disabled' actionType directly controls the 'disabled' attribute on the target itself
                    if (activate) {
                        target.disabled = false;
                    } else {
                        target.value = defaultValue;
                        target.disabled = true;
                        if (target.type === 'checkbox' || target.type === 'radio') {
                            target.checked = false;
                        } else if (target.tagName === 'SELECT') {
                             target.selectedIndex = 0;
                        }
                    }
                }
            });
        };

        triggerInput.addEventListener('change', applyToggleState);

        // For radio buttons, also listen to other radios in the same group to update state
        if (triggerInput.type === 'radio') {
            document.querySelectorAll(`input[type="radio"][name="${triggerInput.name}"]`).forEach(radio => {
                radio.addEventListener('change', applyToggleState);
            });
        }

        // Apply initial state
        applyToggleState();
    }


    // --- Data-driven setup for all conditional toggles ---
    const conditionalRules = [
        // General Case
        { triggerId: 'spectaclesYes', triggerValues: 'Yes', targetSelector: '#currentSpectacleRx_group', actionType: 'display' },
        { triggerId: 'contactLensYes', triggerValues: 'Yes', targetSelector: '#currentContactLensRx_group', actionType: 'display' },
        { triggerId: 'ocularROS_notwnl', triggerValues: 'Not WNL', targetSelector: '#ocularROS_details', actionType: 'display' },
        { triggerId: 'systemicROS_notwnl', triggerValues: 'Not WNL', targetSelector: '#systemicROS_details', actionType: 'display' },
        { triggerId: 'pupils', triggerValues: 'Other', targetSelector: '#pupils_details', actionType: 'display' },
        { triggerId: 'eoms', triggerValues: 'Other', targetSelector: '#eoms_details', actionType: 'display' },
        { triggerId: 'stereopsis', triggerValues: ['Present', 'Absent'], targetSelector: '#stereopsis_details', actionType: 'display' },
        { triggerId: 'colorVision', triggerValues: ['Other', 'Red-Green Deficiency', 'Blue-Yellow Deficiency', 'Acquired Deficiency'], targetSelector: '#colorVision_details', actionType: 'display' },
        { triggerId: 'amslerGridOD', triggerValues: ['Metamorphopsia', 'Scotoma', 'Distortion'], targetSelector: '#amslerGridOD_details', actionType: 'display' },
        { triggerId: 'amslerGridOS', triggerValues: ['Metamorphopsia', 'Scotoma', 'Distortion'], targetSelector: '#amslerGridOS_details', actionType: 'display' },
        { triggerId: 'lensOD_status', triggerValues: 'other', targetSelector: '#lensOD_details', actionType: 'display' },
        { triggerId: 'lensOS_status', triggerValues: 'other', targetSelector: '#lensOS_details', actionType: 'display' },
        { triggerId: 'gonioscopyPerformedOD_yes', triggerValues: 'Yes', targetSelector: '#gonioscopyOD', actionType: 'display' },
        { triggerId: 'gonioscopyPerformedOS_yes', triggerValues: 'Yes', targetSelector: '#gonioscopyOS', actionType: 'display' },
        { triggerId: 'opticDiscOD_status', triggerValues: 'Other', targetSelector: '#opticDiscOD', actionType: 'display' },
        { triggerId: 'opticDiscOS_status', triggerValues: 'Other', targetSelector: '#opticDiscOS', actionType: 'display' },
        { triggerId: 'maculaOD_status', triggerValues: 'Other', targetSelector: '#maculaOD', actionType: 'display' },
        { triggerId: 'maculaOS_status', triggerValues: 'Other', targetSelector: '#maculaOS', actionType: 'display' },
        { triggerId: 'peripheryOD_status', triggerValues: 'Other', targetSelector: '#peripheryOD', actionType: 'display' },
        { triggerId: 'peripheryOS_status', triggerValues: 'Other', targetSelector: '#peripheryOS', actionType: 'display' },
        { triggerId: 'peripheralLesionOD', triggerValues: 'Other', targetSelector: '#peripheralLesionOD_details', actionType: 'display' },
        { triggerId: 'peripheralLesionOS', triggerValues: 'Other', targetSelector: '#peripheralLesionOS_details', actionType: 'display' },

        // Certificate Purpose Case
        { triggerId: 'certificateType', triggerValues: 'Other', targetSelector: '#certificateType_other', actionType: 'display' },
        { triggerId: 'colorVisionCertificate', triggerValues: ['Other', 'Red-Green Deficiency', 'Blue-Yellow Deficiency', 'Acquired Deficiency'], targetSelector: '#colorVisionCertificate_details', actionType: 'display' },

        // Emergency Case
        { triggerId: 'natureOfInjuryOnset', triggerValues: 'Other', targetSelector: '#natureOfInjuryOnset_other', actionType: 'display' },
        { triggerId: 'externalExam_statusOD', triggerValues: 'Other', targetSelector: '#externalExamOD', actionType: 'display' },
        { triggerId: 'externalExam_statusOS', triggerValues: 'Other', targetSelector: '#externalExamOS', actionType: 'display' },
        { triggerId: 'pupilsEmergency', triggerValues: 'Other', targetSelector: '#pupilsEmergency_details', actionType: 'display' },
        { triggerId: 'eomsEmergency', triggerValues: 'Other', targetSelector: '#eomsEmergency_details', actionType: 'display' },
        { triggerId: 'cornealFindingOD', triggerValues: 'Other', targetSelector: '#cornealFindingOD_details', actionType: 'display' },
        { triggerId: 'cornealFindingOS', triggerValues: 'Other', targetSelector: '#cornealFindingOS_details', actionType: 'display' },
        { triggerId: 'infiltratesUlcersODYes', triggerValues: 'Yes', targetSelector: '#infiltratesUlcersOD_details', actionType: 'display' },
        { triggerId: 'infiltratesUlcersOSYes', triggerValues: 'Yes', targetSelector: '#infiltratesUlcersOS_details', actionType: 'display' },
        { triggerId: 'cornealNVODYes', triggerValues: 'Yes', targetSelector: '#cornealNVOD_details', actionType: 'display' },
        { triggerId: 'cornealNVOSYes', triggerValues: 'Yes', targetSelector: '#cornealNVOS_details', actionType: 'display' },
        { triggerId: 'referralMadeYes', triggerValues: 'Yes', targetSelector: '#referralDetails', actionType: 'display' },

        // Follow-up Case
        { triggerId: 'pupilsFollowup', triggerValues: 'Other', targetSelector: '#pupilsFollowup_details', actionType: 'display' },
        { triggerId: 'eomsFollowup', triggerValues: 'Other', targetSelector: '#eomsFollowup_details', actionType: 'display' },
        { triggerId: 'treatmentSideEffectsYes', triggerValues: 'Yes', targetSelector: '#treatmentSideEffects_details', actionType: 'display' },
        // For 'WNL' status, the textarea should be hidden, for 'Not WNL', it should be shown
        { triggerId: 'slitLampFollowup_notwnl', triggerValues: 'Not WNL', targetSelector: 'textarea[name="slitLampFollowup"]', actionType: 'display' },
        { triggerId: 'posteriorSegmentFollowup_notwnl', triggerValues: 'Not WNL', targetSelector: 'textarea[name="posteriorSegmentFollowup"]', actionType: 'display' },


        // Contact Lens Case
        { triggerId: 'stainingOD_yes', triggerValues: 'Yes', targetSelector: '#stainingOD_details', actionType: 'display' },
        { triggerId: 'stainingOS_yes', triggerValues: 'Yes', targetSelector: '#stainingOS_details', actionType: 'display' },
        { triggerId: 'conjunctivalFindings', triggerValues: 'Other', targetSelector: '#conjunctivalFindings_details', actionType: 'display' },

        // Orthoptics Case
        { triggerId: 'previousVTY_yes', triggerValues: 'Yes', targetSelector: '#previousVTY_details', actionType: 'display' },
        { triggerId: 'strabismusSurgicalHistoryYes', triggerValues: 'Yes', targetSelector: '#strabismusSurgicalHistory_details', actionType: 'display' },
        { triggerId: 'headachesYes', triggerValues: 'Yes', targetSelector: '#headaches_details', actionType: 'display' },
        { triggerId: 'amblyopiaYes', triggerValues: 'Yes', targetSelector: '#amblyopia_conditional_group', actionType: 'display' },
        { triggerId: 'strabismusYes', triggerValues: 'Yes', targetSelector: '#strabismus_conditional_group', actionType: 'display' },
        { triggerId: 'suppressionPresentYes', triggerValues: 'Yes', targetSelector: '#suppression', actionType: 'display' },
        { triggerId: 'correspondence', triggerValues: 'Other', targetSelector: '#correspondence_details', actionType: 'display' },
        { triggerId: 'vtComplianceNo', triggerValues: 'No', targetSelector: '#vtCompliance_reason', actionType: 'display' },

        // Low Vision Case
        { triggerId: 'vaChartUsed', triggerValues: 'Other', targetSelector: '#vaChartUsed_other', actionType: 'display' },
        { triggerId: 'visualFieldType', triggerValues: 'Other', targetSelector: '#visualFieldType_other', actionType: 'display' },
        { triggerId: 'contrastSensitivityChart', triggerValues: 'Other', targetSelector: '#contrastSensitivityChart_other', actionType: 'display' },
        { triggerId: 'mobilityImpairmentYes', triggerValues: 'Yes', targetSelector: '#mobility_details_group', actionType: 'display' },
        { triggerId: 'aidsDispensedYes', triggerValues: 'Yes', targetSelector: '#aidsDispensedList', actionType: 'display' },
        { triggerId: 'referralOMYes', triggerValues: 'Yes', targetSelector: '#referralOM_details', actionType: 'display' },
        { triggerId: 'referralOTYes', triggerValues: 'Yes', targetSelector: '#referralOT_details', actionType: 'display' },
        { triggerId: 'referralSSYes', triggerValues: 'Yes', targetSelector: '#referralSS_details', actionType: 'display' },

        // Surgical Co-management Case
        { triggerId: 'typeOfSurgery', triggerValues: 'Other', targetSelector: '#surgeryDetails', actionType: 'display' },
        { triggerId: 'postOpComplicationsYes', triggerValues: 'Yes', targetSelector: '#postOpComplicationsList', actionType: 'display' },
        { triggerId: 'postOpVisitType', triggerValues: ['Day 1', 'Week 1', 'Month 1', 'Month 3', 'Month 6', 'Annual'], targetSelector: '#postOpVisitDate', actionType: 'display' }, // Enable visit date for specific types
        
        // Pediatric Optometry Case
        { triggerId: 'developmentalMilestonesStatus', triggerValues: 'Delayed', targetSelector: '#developmentalMilestones_details', actionType: 'display' },
        { triggerId: 'strabismusHistoryYes', triggerValues: 'Yes', targetSelector: '#strabismusHistory_details', actionType: 'display' },
        { triggerId: 'amblyopiaHistoryYes', triggerValues: 'Yes', targetSelector: '#amblyopiaHistory_details', actionType: 'display' },
        { triggerId: 'glassesToleranceStatus', triggerValues: ['Poor', 'Fair'], targetSelector: '#glassesTolerance_details', actionType: 'display' },
        { triggerId: 'amblyopiaTreatment', triggerValues: 'Patching', targetSelector: '#patchingHours', actionType: 'display' },
        { triggerId: 'strabismusManagement', triggerValues: 'Surgery Referral', targetSelector: '#surgeryReferralDetails', actionType: 'display' },

        // Ocular Surface Disease (OSD) Specialty Case
        { triggerId: 'lidMarginAssessment_OD', triggerValues: 'Other', targetSelector: '#lidMarginAssessmentOD_details', actionType: 'display' },
        { triggerId: 'lidMarginAssessment_OS', triggerValues: 'Other', targetSelector: '#lidMarginAssessmentOS_details', actionType: 'display' },
        { triggerId: 'inflammaDry_OD', triggerValues: ['Positive', 'Negative'], targetSelector: '#inflammaDryOD_value', actionType: 'display' },
        { triggerId: 'inflammaDry_OS', triggerValues: ['Positive', 'Negative'], targetSelector: '#inflammaDryOS_value', actionType: 'display' },
        { triggerId: 'punctalPlugsYes', triggerValues: 'Yes', targetSelector: '#punctalPlugsDetails', actionType: 'display' },
        { triggerId: 'thermalPulsationYes', triggerValues: 'Yes', targetSelector: '#thermalPulsationDetails', actionType: 'display' },
        { triggerId: 'iplTreatmentYes', triggerValues: 'Yes', targetSelector: '#iplTreatmentDetails', actionType: 'display' },
        { triggerId: 'scleralLensesConsideredYes', triggerValues: 'Yes', targetSelector: '#scleralLensesDetails', actionType: 'display' },
        { triggerId: 'cornealStainingOD_status', triggerValues: 'Not WNL', targetSelector: '#cornealStainingOD_details', actionType: 'display' },
        { triggerId: 'cornealStainingOS_status', triggerValues: 'Not WNL', targetSelector: '#cornealStainingOS_details', actionType: 'display' },
        { triggerId: 'conjunctivalStainingOD_status', triggerValues: 'Not WNL', targetSelector: '#conjunctivalStainingOD_details', actionType: 'display' },
        { triggerId: 'conjunctivalStainingOS_status', triggerValues: 'Not WNL', targetSelector: '#conjunctivalStainingOS_details', actionType: 'display' },

        // Myopia Management Case
        { triggerId: 'currentManagementMethod', triggerValues: 'Atropine', targetSelector: '#atropineConcentration_group', actionType: 'display' },
        { triggerId: 'currentManagementMethod', triggerValues: 'Orthokeratology', targetSelector: '#orthoKLensParameters_group', actionType: 'display' },
        { triggerId: 'currentManagementMethod', triggerValues: 'Multifocal Soft Contact Lenses', targetSelector: '#mfclLensParameters_group', actionType: 'display' },
        { triggerId: 'currentManagementMethod', triggerValues: ['DIMS/HAL Spectacles', 'Single Vision Spectacles', 'Bifocal Spectacles'], targetSelector: '#spectacleLensType_group', actionType: 'display' },

        // Neuro-Optometry & Vision Rehabilitation Case
        { triggerId: 'typeOfInjuryCondition', triggerValues: 'Other', targetSelector: '#injuryDetails', actionType: 'display' },
        { triggerId: 'previousNeuroRehabYes', triggerValues: 'Yes', targetSelector: '#previousNeuroRehab_details', actionType: 'display' },
        { triggerId: 'visualFieldLossYes', triggerValues: 'Yes', targetSelector: '#visualFieldLoss_details', actionType: 'display' },
        { triggerId: 'oculomotorDysfunctionYes', triggerValues: 'Yes', targetSelector: '#oculomotorDysfunction_details', actionType: 'display' },
        { triggerId: 'perceptualDeficitsYes', triggerValues: 'Yes', targetSelector: '#perceptualDeficits_details', actionType: 'display' },
        { triggerId: 'balanceIssuesYes', triggerValues: 'Yes', targetSelector: '#balanceIssues_details', actionType: 'display' },
        { triggerId: 'referralOTYes', triggerValues: 'Yes', targetSelector: '#referralOT_details', actionType: 'display' },
        { triggerId: 'referralPTYes', triggerValues: 'Yes', targetSelector: '#referralPT_details', actionType: 'display' },
        { triggerId: 'referralSpeechYes', triggerValues: 'Yes', targetSelector: '#referralSpeech_details', actionType: 'display' },
    ];

    conditionalRules.forEach(rule => {
        setupConditionalToggle(rule.triggerId, rule.triggerValues, rule.targetSelector, rule.actionType, rule.defaultValue);
    });


    // --- Function to calculate age from Date of Birth ---
    function calculateAge() {
        const dobInput = document.getElementById('dateOfBirth');
        const ageInput = document.getElementById('patientAge'); // patientAge is present in General, Myopia, Pediatric cases

        if (!dobInput || !ageInput) return;

        dobInput.addEventListener('change', () => {
            const dob = new Date(dobInput.value);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            if (!isNaN(age) && age >= 0) {
                ageInput.value = age;
            } else {
                ageInput.value = '';
            }
        });

        // Trigger on load if DOB is already set (e.g., from local storage)
        if (dobInput.value) {
            dobInput.dispatchEvent(new Event('change'));
        }
    }
    calculateAge(); // Call age calculation on page load


    // --- Function to gather all form data ---
    function collectFormData() {
        const formData = {};
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Only collect data from inputs that have a name and are not disabled,
            // and are not hidden by conditional logic.
            const isVisible = input.closest('.conditional-group') ? (input.closest('.conditional-group').style.display !== 'none') : true;

            if (input.name && !input.disabled && isVisible) {
                if (input.type === 'checkbox') {
                    formData[input.name] = input.checked;
                } else if (input.type === 'radio') {
                    if (input.checked) {
                        formData[input.name] = input.value;
                    }
                } else if (input.tagName === 'SELECT') {
                    formData[input.name] = input.options[input.selectedIndex].value;
                } else {
                    formData[input.name] = input.value;
                }
            }
        });
        return formData;
    }

    // --- Form Submission Handler ---
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission (page reload)

        // Basic browser validation check for required fields
        if (!form.checkValidity()) {
            alert('Please fill out all required fields (marked with *).');
            return;
        }

        const caseData = collectFormData();
        console.log(`Submitting ${currentCaseType.replace(/([A-Z])/g, ' $1').trim()} Case Data:`, caseData);

        // In a real application, you would send this data to a server:
        /*
        fetch('/api/save-case', { // Adjust endpoint as needed
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(caseData),
        })
        .then(response => response.json())
        .then(data => {
            alert('Case saved successfully!');
            console.log('Server response:', data);
            form.reset(); // Clear form after successful submission
            localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`); // Clear saved draft
        })
        .catch(error => {
            console.error('Error saving case:', error);
            alert('Failed to save case. Please try again.');
        });
        */

        alert(`Case (${currentCaseType.replace(/([A-Z])/g, ' $1').trim()}) saved successfully! (Data logged to console)`);
        form.reset(); // Clear form after successful submission
        localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`); // Clear saved draft for this specific case type

        // Re-apply conditional states after reset, to hide previously shown conditional inputs
        document.querySelectorAll('input[type="checkbox"], input[type="radio"], select').forEach(input => {
            input.dispatchEvent(new Event('change'));
        });
    });

    // --- Clear Form Handler ---
    if (clearFormButton) {
        clearFormButton.addEventListener('click', () => {
            form.reset(); // Resets all form fields to their initial state

            // Re-apply conditional states after reset
            document.querySelectorAll('input[type="checkbox"], input[type="radio"], select').forEach(input => {
                input.dispatchEvent(new Event('change'));
            });
            localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`); // Clear saved draft for this specific case type
            alert('Form cleared!');
        });
    }

    // --- Local Storage for saving draft (with debouncing) ---
    const localStorageKey = `focusCaseXDraft_${currentCaseType}`;
    let saveTimer;

    form.addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            const caseData = collectFormData();
            localStorage.setItem(localStorageKey, JSON.stringify(caseData));
            // console.log('Draft saved automatically to local storage.');
        }, 800); // Save after 800ms of no input
    });

    // Load data from Local Storage on page load
    const savedDraft = localStorage.getItem(localStorageKey);
    if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        for (const key in draftData) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = draftData[key];
                } else if (input.type === 'radio') {
                    const radioButtons = form.querySelectorAll(`input[type="radio"][name="${key}"]`);
                    radioButtons.forEach(radio => {
                        if (radio.value === draftData[key]) {
                            radio.checked = true;
                        }
                    });
                } else {
                    input.value = draftData[key];
                }
            }
        }
        // After loading, trigger change events for all relevant inputs to apply their state
        document.querySelectorAll('input[type="checkbox"], input[type="radio"], select').forEach(input => {
            input.dispatchEvent(new Event('change'));
        });
        alert(`Loaded saved draft for ${currentCaseType.replace(/([A-Z])/g, ' $1').trim()} case from previous session.`);
    }
});