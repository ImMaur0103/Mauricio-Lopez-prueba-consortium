$("body > *")
    .stop()
    .delay(100)
    .animate({ opacity: 1 }, 300);
$("body").removeClass("show-spinner");
$("main").addClass("default-transition");
$(".sub-menu").addClass("default-transition");
$(".main-menu").addClass("default-transition");
$(".theme-colors").addClass("default-transition");


/* 03.05. Menu */
var menuClickCount = 0;
var allMenuClassNames = "menu-default menu-hidden sub-hidden main-hidden menu-sub-hidden main-show-temporary sub-show-temporary menu-mobile";
function setMenuClassNames(clickIndex, calledFromResize, link) {
    menuClickCount = clickIndex;
    var container = $("#app-container");
    if (container.length == 0) {
        return;
    }

    var link = link || getActiveMainMenuLink();

    //menu-default no subpage
    if (
        $(".sub-menu ul[data-link='" + link + "']").length == 0 &&
        (menuClickCount == 2 || calledFromResize)
    ) {
        if ($(window).outerWidth() >= menuHiddenBreakpoint) {
            if (isClassIncludedApp("menu-default")) {
                if (calledFromResize) {
                    // $("#app-container").attr(
                    //   "class",
                    //   "menu-default menu-sub-hidden sub-hidden"
                    // );
                    $("#app-container").removeClass(allMenuClassNames);
                    $("#app-container").addClass("menu-default menu-sub-hidden sub-hidden");
                    menuClickCount = 1;
                } else {
                    // $("#app-container").attr(
                    //   "class",
                    //   "menu-default main-hidden menu-sub-hidden sub-hidden"
                    // );
                    $("#app-container").removeClass(allMenuClassNames);
                    $("#app-container").addClass("menu-default main-hidden menu-sub-hidden sub-hidden");

                    menuClickCount = 0;
                }
                resizeCarousel();
                return;
            }
        }
    }

    //menu-sub-hidden no subpage
    if (
        $(".sub-menu ul[data-link='" + link + "']").length == 0 &&
        (menuClickCount == 1 || calledFromResize)
    ) {
        if ($(window).outerWidth() >= menuHiddenBreakpoint) {
            if (isClassIncludedApp("menu-sub-hidden")) {
                if (calledFromResize) {
                    // $("#app-container").attr("class", "menu-sub-hidden sub-hidden");
                    $("#app-container").removeClass(allMenuClassNames);
                    $("#app-container").addClass("menu-sub-hidden sub-hidden");
                    menuClickCount = 0;
                } else {
                    // $("#app-container").attr(
                    //   "class",
                    //   "menu-sub-hidden main-hidden sub-hidden"
                    // );
                    $("#app-container").removeClass(allMenuClassNames);
                    $("#app-container").addClass("menu-sub-hidden main-hidden sub-hidden");
                    menuClickCount = -1;
                }
                resizeCarousel();
                return;
            }
        }
    }

    //menu-sub-hidden no subpage
    if (
        $(".sub-menu ul[data-link='" + link + "']").length == 0 &&
        (menuClickCount == 1 || calledFromResize)
    ) {
        if ($(window).outerWidth() >= menuHiddenBreakpoint) {
            if (isClassIncludedApp("menu-hidden")) {
                if (calledFromResize) {
                    // $("#app-container").attr(
                    //   "class",
                    //   "menu-hidden main-hidden sub-hidden"
                    // );
                    $("#app-container").removeClass(allMenuClassNames);
                    $("#app-container").addClass("menu-hidden main-hidden sub-hidden");

                    menuClickCount = 0;
                } else {
                    // $("#app-container").attr(
                    //   "class",
                    //   "menu-hidden main-show-temporary"
                    // );
                    $("#app-container").removeClass(allMenuClassNames);
                    $("#app-container").addClass("menu-hidden main-show-temporary");

                    menuClickCount = 3;
                }
                resizeCarousel();
                return;
            }
        }
    }

    if (clickIndex % 4 == 0) {
        if (
            isClassIncludedApp("menu-default") &&
            isClassIncludedApp("menu-sub-hidden")
        ) {
            nextClasses = "menu-default menu-sub-hidden";
        } else if (isClassIncludedApp("menu-default")) {
            nextClasses = "menu-default";
        } else if (isClassIncludedApp("menu-sub-hidden")) {
            nextClasses = "menu-sub-hidden";
        } else if (isClassIncludedApp("menu-hidden")) {
            nextClasses = "menu-hidden";
        }
        menuClickCount = 0;
    } else if (clickIndex % 4 == 1) {
        if (
            isClassIncludedApp("menu-default") &&
            isClassIncludedApp("menu-sub-hidden")
        ) {
            nextClasses = "menu-default menu-sub-hidden main-hidden sub-hidden";
        } else if (isClassIncludedApp("menu-default")) {
            nextClasses = "menu-default sub-hidden";
        } else if (isClassIncludedApp("menu-sub-hidden")) {
            nextClasses = "menu-sub-hidden main-hidden sub-hidden";
        } else if (isClassIncludedApp("menu-hidden")) {
            nextClasses = "menu-hidden main-show-temporary";
        }
    } else if (clickIndex % 4 == 2) {
        if (
            isClassIncludedApp("menu-default") &&
            isClassIncludedApp("menu-sub-hidden")
        ) {
            nextClasses = "menu-default menu-sub-hidden sub-hidden";
        } else if (isClassIncludedApp("menu-default")) {
            nextClasses = "menu-default main-hidden sub-hidden";
        } else if (isClassIncludedApp("menu-sub-hidden")) {
            nextClasses = "menu-sub-hidden sub-hidden";
        } else if (isClassIncludedApp("menu-hidden")) {
            nextClasses = "menu-hidden main-show-temporary sub-show-temporary";
        }
    } else if (clickIndex % 4 == 3) {
        if (
            isClassIncludedApp("menu-default") &&
            isClassIncludedApp("menu-sub-hidden")
        ) {
            nextClasses = "menu-default menu-sub-hidden sub-show-temporary";
        } else if (isClassIncludedApp("menu-default")) {
            nextClasses = "menu-default sub-hidden";
        } else if (isClassIncludedApp("menu-sub-hidden")) {
            nextClasses = "menu-sub-hidden sub-show-temporary";
        } else if (isClassIncludedApp("menu-hidden")) {
            nextClasses = "menu-hidden main-show-temporary";
        }
    }
    if (isClassIncludedApp("menu-mobile")) {
        nextClasses += " menu-mobile";
    }
    // container.attr("class", nextClasses);
    container.removeClass(allMenuClassNames);
    container.addClass(nextClasses);
    resizeCarousel();
}
$(".menu-button").on("click", function (event) {
    event.preventDefault();
    setMenuClassNames(++menuClickCount);
});

$(".menu-button-mobile").on("click", function (event) {
    event.preventDefault();
    $("#app-container")
        .removeClass("sub-show-temporary")
        .toggleClass("main-show-temporary");
    return false;
});

$(".main-menu").on("click", "a", function (event) {
    event.preventDefault();

    var link = $(this)
        .attr("href")
        .replace("#", "");

    if ($(".sub-menu ul[data-link='" + link + "']").length == 0) {
        window.location.href = link;
        return;
    }

    showSubMenu($(this).attr("href"));
    var container = $("#app-container");
    if (!$("#app-container").hasClass("menu-mobile")) {
        if (
            $("#app-container").hasClass("menu-sub-hidden") &&
            (menuClickCount == 2 || menuClickCount == 0)
        ) {
            setMenuClassNames(3, false, link);
        } else if (
            $("#app-container").hasClass("menu-hidden") &&
            (menuClickCount == 1 || menuClickCount == 3)
        ) {
            setMenuClassNames(2, false, link);
        } else if (
            $("#app-container").hasClass("menu-default") &&
            !$("#app-container").hasClass("menu-sub-hidden") &&
            (menuClickCount == 1 || menuClickCount == 3)
        ) {
            setMenuClassNames(0, false, link);
        }
    } else {
        $("#app-container").addClass("sub-show-temporary");
    }
    return false;
});

$(document).on("click", function (event) {
    if (
        !(
            $(event.target)
                .parents()
                .hasClass("menu-button") ||
            $(event.target).hasClass("menu-button") ||
            $(event.target)
                .parents()
                .hasClass("sidebar") ||
            $(event.target).hasClass("sidebar")
        )
    ) {
        if (
            $("#app-container").hasClass("menu-sub-hidden") &&
            menuClickCount == 3
        ) {
            var link = getActiveMainMenuLink();

            if (link == lastActiveSubmenu) {
                setMenuClassNames(2);
            } else {
                setMenuClassNames(0);
            }
        } else if (
            $("#app-container").hasClass("menu-hidden") ||
            $("#app-container").hasClass("menu-mobile")
        ) {
            setMenuClassNames(0);
        }
    }
});

function getActiveMainMenuLink() {
    var dataLink = $(".main-menu ul li.active a").attr("href");
    return dataLink.replace("#", "");
}

function isClassIncludedApp(className) {
    var container = $("#app-container");
    var currentClasses = container
        .attr("class")
        .split(" ")
        .filter(x => x != "");
    return currentClasses.includes(className);
}

var lastActiveSubmenu = "";
function showSubMenu(dataLink) {
    if ($(".main-menu").length == 0) {
        return;
    }

    var link = dataLink.replace("#", "");
    if ($(".sub-menu ul[data-link='" + link + "']").length == 0) {
        $("#app-container").removeClass("sub-show-temporary");

        if ($("#app-container").length == 0) {
            return;
        }

        if (
            isClassIncludedApp("menu-sub-hidden") ||
            isClassIncludedApp("menu-hidden")
        ) {
            menuClickCount = 0;
        } else {
            menuClickCount = 1;
        }
        $("#app-container").addClass("sub-hidden");
        noTransition();
        return;
    }
    if (link == lastActiveSubmenu) {
        return;
    }
    $(".sub-menu ul").fadeOut(0);
    $(".sub-menu ul[data-link='" + link + "']").slideDown(100);

    $(".sub-menu .scroll").scrollTop(0);
    lastActiveSubmenu = link;
}

function noTransition() {
    $(".sub-menu").addClass("no-transition");
    $("main").addClass("no-transition");
    setTimeout(function () {
        $(".sub-menu").removeClass("no-transition");
        $("main").removeClass("no-transition");
    }, 350);
}

showSubMenu($(".main-menu ul li.active a").attr("href"));

function resizeCarousel() {
    setTimeout(function () {
        var event = document.createEvent("HTMLEvents");
        event.initEvent("resize", false, false);
        window.dispatchEvent(event);
    }, 350);
}

/* 03.06. App Menu */
$(".app-menu-button").on("click", function () {
    event.preventDefault();
    if ($(".app-menu").hasClass("shown")) {
        $(".app-menu").removeClass("shown");
    } else {
        $(".app-menu").addClass("shown");
    }
});

$(document).on("click", function (event) {
    if (
        !(
            $(event.target)
                .parents()
                .hasClass("app-menu") ||
            $(event.target)
                .parents()
                .hasClass("app-menu-button") ||
            $(event.target).hasClass("app-menu-button") ||
            $(event.target).hasClass("app-menu")
        )
    ) {
        if ($(".app-menu").hasClass("shown")) {
            $(".app-menu").removeClass("shown");
        }
    }
});