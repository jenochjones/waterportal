import {linearInterpolation} from './linearinterpolation.js';

const htmlElements = {
    'linearinterpolation.html': {'linear-interp-result': linearInterpolation},
    'normaldepth.html': {}
};

function ready(readyListener) {
    if (document.readyState !== "loading") {
        readyListener();
    } else {
        document.addEventListener("DOMContentLoaded", readyListener);
    }
};

ready(function () {
    let loadPage = function (page) {
        fetch(page)
            .then(response => response.text())
            .then(data => {
                document.getElementById('mainscreen-div').innerHTML = data;
            })
            .catch(error => console.error('Error loading page:', error)
        );
        debugger
        Object.keys(htmlElements[page]).map(htmlElement => {
            debugger
            document.getElementById(htmlElement).addEventListener(htmlElements[page][htmlElement]);
        });
    }

    document.querySelectorAll('.nav-item').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            let page = this.getAttribute('data-page');
            loadPage(page);
        });
    });

    // Load the default page
    loadPage('normaldepth.html');
});