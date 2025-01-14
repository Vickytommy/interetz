/*
Template Name: Judia - Admin & Dashboard Template
Author: Themesbrand
Version: 1.0.0
Website: https://Themesbrand.com/
Contact: Themesbrand@gmail.com
File: Layout Js File
*/

(function () {

    'use strict';

    if (sessionStorage.getItem('defaultAttribute')) {

        var attributesValue = document.documentElement.attributes;
        var CurrentLayoutAttributes = {};
        for (var i = 0; i < attributesValue.length; i++) {
            var attribute = attributesValue[i];
            if (attribute.nodeName && attribute.nodeName != "undefined") {
                var nodeKey = attribute.nodeName;
                CurrentLayoutAttributes[nodeKey] = attribute.nodeValue;
            }
        }
        if (JSON.stringify(CurrentLayoutAttributes) !== sessionStorage.getItem('defaultAttribute')) {
        } else {
            var isLayoutAttributes = {
                "dir": sessionStorage.getItem("dir"),
                'data-mode': sessionStorage.getItem('data-mode'),
                'data-layout': sessionStorage.getItem('data-layout'),
                'data-sidebar': sessionStorage.getItem('data-sidebar'),
                "data-topbar": sessionStorage.getItem("data-topbar"),
                "data-sidebar-size": sessionStorage.getItem("data-sidebar-size"),
            };

            for (var x in isLayoutAttributes) {
                if (isLayoutAttributes[x] && isLayoutAttributes[x]) {
                    document.documentElement.setAttribute(x, isLayoutAttributes[x]);
                }
            }
        }
    }

    function handleScroll() {
        // Get the current scroll position
        var scrollPosition = window.scrollY;
        if (scrollPosition > 0)
            document.getElementById("page-topbar").classList.add("topbar-shadow");
    }

    // Attach the handleScroll function to the 'onscroll' event of the window
    if(document.getElementById("page-topbar"))
        window.onscroll = handleScroll

})();