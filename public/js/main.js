import { setUpLinearInterpolation } from './linearinterpolation.js';
import { setUpNormalDepth } from './normaldepth.js';
import { setUpWhiteboard } from './whiteboard.js';
import { setUpMannings } from './mannings.js';

const htmlElements = {
    'home.html': NaN,
    'mannings.html': setUpMannings,
    'linearinterpolation.html': setUpLinearInterpolation,
    'normaldepth.html': setUpNormalDepth,
    'whiteboard.html': setUpWhiteboard,
};

function ready(readyListener) {
    if (document.readyState !== "loading") {
        readyListener();
    } else {
        document.addEventListener("DOMContentLoaded", readyListener);
    }
}

ready(function () {
    const loadPage = function (page) {
        fetch(page)
            .then(response => response.text())
            .then(data => {
                document.getElementById('mainscreen-div').innerHTML = data;
                if (htmlElements[page]) {
                    htmlElements[page]();
                }
            })
            .catch(error => console.error('Error loading page:', error));
    };

    const handleHashChange = function () {
        const page = location.hash.substring(1);
        if (page) {
            loadPage(page);
        } else {
            loadPage('home.html'); // Default page
        }
    };

    window.addEventListener('hashchange', handleHashChange);

    document.querySelectorAll('.nav-item').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            location.hash = page;
        });
    });

    // Load the initial page based on the current hash
    handleHashChange();
});

