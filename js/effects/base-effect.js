// ===== BASE EFFECT CLASS =====
class BaseEffect {
    constructor(name, checkboxId) {
        this.name = name;
        this.checkbox = document.getElementById(checkboxId);
        this.isActive = false;
        this.timeouts = [];
        
        if (this.checkbox) {
            this.isActive = this.checkbox.checked;
            this.checkbox.addEventListener('change', (e) => {
                if (this.checkbox.checked) {
                    window.deactivateAllEffects(this.name);
                    this.isActive = true;
                } else {
                    this.isActive = false;
                }
                window.autoSave();
            });
        }
    }
    
    addTimeout(timeoutId) {
        if (timeoutId) this.timeouts.push(timeoutId);
    }
    
    clearAllTimeouts() {
        this.timeouts.forEach(t => clearTimeout(t));
        this.timeouts = [];
    }
    
    trigger() {
        // To be overridden by child classes
        console.log(`${this.name} effect triggered`);
    }
    
    isChecked() {
        return this.checkbox ? this.checkbox.checked : false;
    }
}

// Global function to deactivate effects
window.deactivateAllEffects = function(activeEffectName) {
    const effects = ['Standar', 'Shadow', 'Slider', 'Skating'];
    effects.forEach(effectName => {
        if (effectName !== activeEffectName) {
            const checkbox = document.getElementById(`effect-${effectName.toLowerCase()}`);
            if (checkbox && checkbox.checked) {
                checkbox.checked = false;
                const effect = window[`${effectName}Effect`];
                if (effect) effect.isActive = false;
            }
        }
    });
};
