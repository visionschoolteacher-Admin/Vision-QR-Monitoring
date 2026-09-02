// =========================================================
// QR-MONITORING
// VISION SCHOOL
// APPLICATION FOUNDATION
// =========================================================

"use strict";


// =========================================================
// SUPABASE
// =========================================================

// We will add the Supabase connection in the next step.
// Keeping it out for now lets us test the UI first.

let supabaseClient = null;


// =========================================================
// APPLICATION STATE
// =========================================================

const appState = {
    currentPage: "dashboard",
    students: [],
    attendance: [],
    parents: [],
    scannerRunning: false
};


// =========================================================
// DOM READY
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeNavigation();

        initializeMobileMenu();

        initializeDate();

        initializeModals();

        initializeButtons();

        initializeReports();

        showPage("dashboard");

        console.log(
            "QR Monitoring application started."
        );
    }
);


// =========================================================
// NAVIGATION
// =========================================================

function initializeNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const page =
                        button.dataset.page;

                    showPage(page);

                    const sidebar =
                        document.querySelector(
                            ".sidebar"
                        );

                    sidebar.classList.remove(
                        "open"
                    );
                }
            );
        }
    );
}


function showPage(pageName) {

    const pages =
        document.querySelectorAll(
            ".page"
        );

    pages.forEach(
        page => {
            page.classList.remove(
                "active"
            );
        }
    );


    const selectedPage =
        document.getElementById(
            `page-${pageName}`
        );

    if (selectedPage) {

        selectedPage.classList.add(
            "active"
        );

        appState.currentPage =
            pageName;
    }


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.page ===
                pageName
            );
        }
    );


    const pageTitles = {
        dashboard: "Dashboard",
        students: "Students",
        scanner: "QR Scanner",
        attendance: "Attendance",
        parents: "Parents / Guardians",
        pickup: "Pickup",
        reports: "Reports & Excel"
    };


    const title =
        document.getElementById(
            "pageTitle"
        );

    if (title) {

        title.textContent =
            pageTitles[pageName] ||
            "QR Monitoring";
    }
}


// =========================================================
// MOBILE MENU
// =========================================================

function initializeMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenuButton"
        );

    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    if (!button || !sidebar) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );
        }
    );
}


// =========================================================
// DATE
// =========================================================

function initializeDate() {

    const dateElement =
        document.getElementById(
            "currentDate"
        );

    if (!dateElement) {
        return;
    }

    const now =
        new Date();

    dateElement.textContent =
        now.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
}


// =========================================================
// MODALS
// =========================================================

function initializeModals() {

    document
        .querySelectorAll(
            "[data-close]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const modalId =
                            button.dataset.close;

                        closeModal(
                            modalId
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".modal"
        )
        .forEach(
            modal => {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            modal
                        ) {

                            closeModal(
                                modal.id
                            );
                        }
                    }
                );
            }
        );
}


// =========================================================
// BUTTONS
// =========================================================

function initializeButtons() {

    const addStudentButton =
        document.getElementById(
            "addStudentButton"
        );

    if (addStudentButton) {

        addStudentButton.addEventListener(
            "click",
            () => {

                openStudentModal();
            }
        );
    }


    const refreshDashboard =
        document.getElementById(
            "dashboardRefresh"
        );

    if (refreshDashboard) {

        refreshDashboard.addEventListener(
            "click",
            () => {

                showToast(
                    "Dashboard refresh will be connected to Supabase next."
                );
            }
        );
    }


    const refreshAttendance =
        document.getElementById(
            "attendanceRefresh"
        );

    if (refreshAttendance) {

        refreshAttendance.addEventListener(
            "click",
            () => {

                showToast(
                    "Attendance refresh will be connected to Supabase next."
                );
            }
        );
    }


    const manualScanButton =
        document.getElementById(
            "manualScanButton"
        );

    if (manualScanButton) {

        manualScanButton.addEventListener(
            "click",
            () => {

                const input =
                    document.getElementById(
                        "manualStudentId"
                    );

                const value =
                    input.value.trim();

                if (!value) {

                    showToast(
                        "Enter a student code.",
                        "error"
                    );

                    return;
                }

                showToast(
                    `Student code received: ${value}`
                );
            }
        );
    }


    const startScanner =
        document.getElementById(
            "startScanner"
        );

    if (startScanner) {

        startScanner.addEventListener(
            "click",
            () => {

                showToast(
                    "QR scanner will be connected in the scanner step."
                );
            }
        );
    }


    const stopScanner =
        document.getElementById(
            "stopScanner"
        );

    if (stopScanner) {

        stopScanner.addEventListener(
            "click",
            () => {

                showToast(
                    "Scanner stopped."
                );
            }
        );
    }
}


// =========================================================
// STUDENT MODAL
// =========================================================

function openStudentModal() {

    const modal =
        document.getElementById(
            "studentModal"
        );

    const title =
        document.getElementById(
            "studentModalTitle"
        );

    const form =
        document.getElementById(
            "studentForm"
        );

    if (!modal) {
        return;
    }

    if (title) {
        title.textContent =
            "Add Student";
    }

    if (form) {
        form.reset();
    }

    modal.classList.remove(
        "hidden"
    );
}


function closeModal(modalId) {

    const modal =
        document.getElementById(
            modalId
        );

    if (modal) {

        modal.classList.add(
            "hidden"
        );
    }
}


// =========================================================
// REPORTS
// =========================================================

function initializeReports() {

    const monthly =
        document.getElementById(
            "monthlyReport"
        );

    if (!monthly) {
        return;
    }


    const months = [
        "August",
        "September",
        "October",
        "November",
        "December",
        "January",
        "February",
        "March",
        "April",
        "May"
    ];


    months.forEach(
        month => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                month.toLowerCase();

            option.textContent =
                month;

            monthly.appendChild(
                option
            );
        }
    );
}


// =========================================================
// TOAST
// =========================================================

let toastTimer = null;


function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.dataset.type =
        type;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );
}


// =========================================================
// DEBUG
// =========================================================

window.QRMonitoring = {

    state: appState,

    showPage,

    showToast,

    openStudentModal,

    closeModal

};