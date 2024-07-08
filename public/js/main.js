import {setUpLinearInterpolation} from './linearinterpolation.js';
import {setUpNormalDepth} from './normaldepth.js';
import {setUpWhiteboard} from './whiteboard.js';
import {setUpMannings} from './mannings.js';

const htmlElements = {
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
                htmlElements[page]();
            })
            .catch(error => console.error('Error loading page:', error));
    };

    document.querySelectorAll('.nav-item').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            loadPage(page);
        });
    });

    // Load the default page
    loadPage('mannings.html');
});
