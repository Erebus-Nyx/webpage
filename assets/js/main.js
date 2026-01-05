// Animate the status content on page load
document.addEventListener('DOMContentLoaded', () => {
    const statusContent = document.querySelector('.status-content');
    
    // Fade in and out animation for 5 seconds, repeating infinitely
    const fadeAnimation = new CSSAnimation();
    fadeAnimation.set({
        selector: '.status-content',
        properties: ['opacity', 'transform'],
        startValues: [0, 'scale(1)'],
        endValues: [1, 'scale(1.2)'],
        animationDuration: 5,
        animationDelay: 0,
        iterationCount: 'infinite'
    });
    
    // Run the animation
    statusContent.classList.add('animate');
});

// CSS animation class for animation control
class CSSAnimation {
    constructor() {
        this.animation = '';
        
        // Animation settings
        this.duration = '';
        this.delay = '';
        this.iteration = '';
        this.values = {};
        
        // Select the element to animate
        this.selector = '';
        
        // Animate properties and their start/end values
        this.properties = [];
    }
    
    set({
        selector,
        properties,
        startValues,
        endValues,
        animationDuration,
        animationDelay,
        iterationCount
    }) {
        this.selector = selector;
        this.properties = properties;
        this.startValues = startValues;
        this.endValues = endValues;
        this.duration = animationDuration;
        this.delay = animationDelay;
        this.iteration = iterationCount;
        
        // Generate the animation CSS property
        let animation = '';
        for (let i = 0; i < properties.length; i++) {
            const prop = properties[i];
            if (!animation) {
                animation += `${this.selector} {\n`;
            }
            
            // Add transform property for scale and opacity changes
            if (i === 0 && typeof startValues === 'string') {
                animation += `  ${startValues};\n`;
            } else if (typeof endValues === 'string') {
                animation += `  ${endValues};\n`;
            }
            
            // Add animation property for properties and animation duration
            if (!animation.endsWith('}')) {
                animation += `\n${i > 0 ? '\t' : ''} 
                        \${this.duration},\n`;
            } else if (typeof startValues === 'string') {
                animation += `  \${startValues}\n`;
            }
            
            // Add animation property for animation delay and iteration
            if (typeof endValues === 'string') {
                animation += `  \${animationDelay},\n`;
            }
            
            // Close the animation CSS block
            if (!animation.endsWith('}')) {
                animation += '\t\t}\n';
            } else if (i < properties.length - 1) {
                animation += '\n\t}\n';
            } else if (typeof startValues === 'string') {
                animation += `  \${startValues}}\n`;
            }
        }
        
        // Generate the animation CSS property
        this.animation = `${animation}`;
    }
}