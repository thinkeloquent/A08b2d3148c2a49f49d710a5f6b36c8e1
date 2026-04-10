// Demo App JavaScript
(function() {
    'use strict';

    // Display initial state if available
    if (window.INITIAL_STATE) {
        const stateEl = document.getElementById('initial-state');
        if (stateEl) {
            stateEl.innerHTML = '<strong>Initial State:</strong><br>' +
                '<pre>' + JSON.stringify(window.INITIAL_STATE, null, 2) + '</pre>';
        }
        console.log('Initial State:', window.INITIAL_STATE);
    }

    // Simple SPA navigation handler
    document.addEventListener('click', function(e) {
        if (e.target.tagName === 'A' && e.target.href.startsWith(window.location.origin)) {
            // Let the browser handle navigation - SPA routing is handled server-side
            console.log('Navigating to:', e.target.href);
        }
    });

    console.log('Demo App initialized');
})();
