// =========================================================
// QR-MONITORING
// VISION SCHOOL
// STEP 3 — SUPABASE CONNECTION
// =========================================================

"use strict";


// =========================================================
// SUPABASE CONFIGURATION
// =========================================================

// IMPORTANT:
// Put your NEW QR-monitoring Supabase project details here.
//
// Use the Publishable key.
// DO NOT use the service-role/secret key.

const SUPABASE_URL =
    "https://sb_publishable_mYL351QM96B6ouODCL8Q9A_df0xTnpM";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_xxxxxxxxxxxxxxxxx";


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
// START APPLICATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        initializeNavigation();

        initializeMobileMenu();

        initializeDate();

        initializeModals();

        initializeButtons();

        initializeReports();

        showPage("dashboard");

        await initializeSupabase();

    }
);


// =========================================================
// INITIALIZE SUPABASE
// =========================================================

async function initializeSupabase() {

    const connectionDot =
        document.getElementById(
            "connectionDot"
        );

    const connectionText =
        document.getElementById(
            "connectionText"
        );


    try {

        if (
            !SUPABASE_URL ||
            SUPABASE_URL ===
                "YOUR_SUPABASE_PROJECT_URL"
        ) {

            throw new Error(
                "Supabase URL has not been configured."
            );

        }


        if (
            !SUPABASE_PUBLISHABLE_KEY ||
            SUPABASE_PUBLISHABLE_KEY ===
                "YOUR_SUPABASE_PUBLISHABLE_KEY"
        ) {

            throw new Error(
                "Supabase publishable key has not been configured."
            );

        }


        if (
            typeof window.supabase ===
            "undefined"
        ) {

            throw new Error(
                "Supabase library failed to load."
            );

        }


        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );


        // Test the connection.

        const {
            error
        } =
            await supabaseClient
                .from("students")
                .select("id")
                .limit(1);


        if (error) {

            throw error;

        }


        setConnectionStatus(
            true,
            "Connected"
        );


        console.log(
            "Supabase connection successful."
        );


        // Load initial data.

        await loadStudents();

        await loadTodayAttendance();


    } catch (error) {

        console.error(
            "Supabase connection failed:",
            error
        );


        setConnectionStatus(
            false,
            "Connection failed"
        );


        showToast(
            "Supabase connection failed.",
            "error"
        );

    }

}


// =========================================================
// CONNECTION STATUS
// =========================================================

function setConnectionStatus(
    connected,
    text
) {

    const dot =
        document.getElementById(
            "connectionDot"
        );

    const label =
        document.getElementById(
            "connectionText"
        );


    if (!dot || !label) {
        return;
    }


    dot.classList.remove(
        "online",
        "offline"
    );


    dot.classList.add(
        connected
            ? "online"
            : "offline"
    );


    label.textContent =
        text;

}


// =========================================================
// LOAD STUDENTS
// =========================================================

async function loadStudents() {

    if (!supabaseClient) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("students")
                .select(
                    "id,student_code,name,level,created_at"
                )
                .order(
                    "name",
                    {
                        ascending: true
                    }
                );


        if (error) {
            throw error;
        }


        appState.students =
            data || [];


        renderStudents();

        updateDashboard();


        console.log(
            "Students loaded:",
            appState.students.length
        );


    } catch (error) {

        console.error(
            "Failed to load students:",
            error
        );


        showToast(
            "Unable to load students.",
            "error"
        );

    }

}


// =========================================================
// LOAD TODAY'S ATTENDANCE
// =========================================================

async function loadTodayAttendance() {

    if (!supabaseClient) {
        return;
    }


    const today =
        getTodayDate();


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("attendance")
                .select(
                    "id,student_id,student_name,date,time_in,time_out,pickup_person,pickup_relationship,pickup_phone,pickup_option,approver,notes,created_at"
                )
                .eq(
                    "date",
                    today
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {
            throw error;
        }


        appState.attendance =
            data || [];


        renderAttendance();

        updateDashboard();


        console.log(
            "Today's attendance loaded:",
            appState.attendance.length
        );


    } catch (error) {

        console.error(
            "Failed to load attendance:",
            error
        );


        showToast(
            "Unable to load attendance.",
            "error"
        );

    }

}


// =========================================================
// TODAY'S DATE
// =========================================================

function getTodayDate() {

    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: "Asia/Vientiane"
        }
    ).format(
        new Date()
    );

}


// =========================================================
// RENDER STUDENTS
// =========================================================

function renderStudents() {

    const container =
        document.getElementById(
            "studentsTable"
        );


    if (!container) {
        return;
    }


    if (
        appState.students.length ===
        0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                No students found.
            </div>
        `;

        populateLevelFilter();

        return;
    }


    container.innerHTML = `
        <table>

            <thead>
                <tr>
                    <th>Student Code</th>
                    <th>Name</th>
                    <th>Level</th>
                </tr>
            </thead>

            <tbody>

                ${
                    appState.students
                        .map(
                            student => `
                                <tr>

                                    <td>
                                        ${escapeHtml(
                                            student.student_code
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHtml(
                                            student.name
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHtml(
                                            student.level ||
                                            "-"
                                        )}
                                    </td>

                                </tr>
                            `
                        )
                        .join("")
                }

            </tbody>

        </table>
    `;


    populateLevelFilter();

}


// =========================================================
// LEVEL FILTER
// =========================================================

function populateLevelFilter() {

    const select =
        document.getElementById(
            "levelFilter"
        );


    if (!select) {
        return;
    }


    const currentValue =
        select.value;


    const levels =
        [
            ...new Set(
                appState.students
                    .map(
                        student =>
                            student.level
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    select.innerHTML = `
        <option value="">
            All Levels
        </option>
    `;


    levels.forEach(
        level => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                level;

            option.textContent =
                level;

            select.appendChild(
                option
            );

        }
    );


    select.value =
        currentValue;

}


// =========================================================
// RENDER ATTENDANCE
// =========================================================

function renderAttendance() {

    const container =
        document.getElementById(
            "attendanceTable"
        );


    if (!container) {
        return;
    }


    if (
        appState.attendance.length ===
        0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                No attendance records yet.
            </div>
        `;

        return;
    }


    container.innerHTML = `
        <table>

            <thead>
                <tr>
                    <th>Student</th>
                    <th>Time In</th>
                    <th>Time Out</th>
                    <th>Pickup Person</th>
                </tr>
            </thead>

            <tbody>

                ${
                    appState.attendance
                        .map(
                            record => `
                                <tr>

                                    <td>
                                        ${escapeHtml(
                                            record.student_name
                                        )}
                                    </td>

                                    <td>
                                        ${formatTime(
                                            record.time_in
                                        )}
                                    </td>

                                    <td>
                                        ${formatTime(
                                            record.time_out
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHtml(
                                            record.pickup_person ||
                                            "-"
                                        )}
                                    </td>

                                </tr>
                            `
                        )
                        .join("")
                }

            </tbody>

        </table>
    `;

}


// =========================================================
// DASHBOARD
// =========================================================

function updateDashboard() {

    const totalStudents =
        document.getElementById(
            "totalStudents"
        );

    const todayTimeIn =
        document.getElementById(
            "todayTimeIn"
        );

    const todayPickedUp =
        document.getElementById(
            "todayPickedUp"
        );

    const stillAtSchool =
        document.getElementById(
            "stillAtSchool"
        );


    const timeInCount =
        appState.attendance
            .filter(
                record =>
                    Boolean(
                        record.time_in
                    )
            )
            .length;


    const pickedUpCount =
        appState.attendance
            .filter(
                record =>
                    Boolean(
                        record.time_out
                    )
            )
            .length;


    const stillCount =
        Math.max(
            0,
            timeInCount -
            pickedUpCount
        );


    if (totalStudents) {

        totalStudents.textContent =
            appState.students.length;

    }


    if (todayTimeIn) {

        todayTimeIn.textContent =
            timeInCount;

    }


    if (todayPickedUp) {

        todayPickedUp.textContent =
            pickedUpCount;

    }


    if (stillAtSchool) {

        stillAtSchool.textContent =
            stillCount;

    }


    renderDashboardAttendance();

}


// =========================================================
// DASHBOARD ATTENDANCE
// =========================================================

function renderDashboardAttendance() {

    const container =
        document.getElementById(
            "dashboardAttendance"
        );


    if (!container) {
        return;
    }


    const records =
        appState.attendance
            .slice(
                0,
                10
            );


    if (
        records.length ===
        0
    ) {

        container.innerHTML = `
            <div class="empty-state">
                No attendance records yet.
            </div>
        `;

        return;
    }


    container.innerHTML = `
        <div class="table-container">

            <table>

                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Time In</th>
                        <th>Time Out</th>
                    </tr>
                </thead>

                <tbody>

                    ${
                        records
                            .map(
                                record => `
                                    <tr>

                                        <td>
                                            ${escapeHtml(
                                                record.student_name
                                            )}
                                        </td>

                                        <td>
                                            ${formatTime(
                                                record.time_in
                                            )}
                                        </td>

                                        <td>
                                            ${formatTime(
                                                record.time_out
                                            )}
                                        </td>

                                    </tr>
                                `
                            )
                            .join("")
                    }

                </tbody>

            </table>

        </div>
    `;

}


// =========================================================
// FORMAT TIME
// =========================================================

function formatTime(
    value
) {

    if (!value) {
        return "-";
    }


    try {

        return new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone:
                    "Asia/Vientiane",

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                hour12:
                    true
            }
        ).format(
            new Date(value)
        );

    } catch {

        return "-";

    }

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


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

                    showPage(
                        button.dataset.page
                    );


                    document
                        .querySelector(
                            ".sidebar"
                        )
                        ?.classList
                        .remove(
                            "open"
                        );

                }
            );

        }
    );

}


function showPage(
    pageName
) {

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
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


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.page ===
                    pageName
                );

            }
        );


    const titles = {

        dashboard:
            "Dashboard",

        students:
            "Students",

        scanner:
            "QR Scanner",

        attendance:
            "Attendance",

        parents:
            "Parents / Guardians",

        pickup:
            "Pickup",

        reports:
            "Reports & Excel"

    };


    const title =
        document.getElementById(
            "pageTitle"
        );


    if (title) {

        title.textContent =
            titles[pageName] ||
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
// DATE DISPLAY
// =========================================================

function initializeDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (!element) {
        return;
    }


    element.textContent =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone:
                    "Asia/Vientiane",

                weekday:
                    "long",

                year:
                    "numeric",

                month:
                    "long",

                day:
                    "numeric"
            }
        ).format(
            new Date()
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

                        closeModal(
                            button.dataset.close
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
            async () => {

                await loadStudents();

                await loadTodayAttendance();

                showToast(
                    "Dashboard refreshed."
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
            async () => {

                await loadTodayAttendance();

                showToast(
                    "Attendance refreshed."
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

                showToast(
                    "Manual scanning will be connected in the scanner step."
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
                    "QR scanner will be connected later."
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


function closeModal(
    modalId
) {

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

    const select =
        document.getElementById(
            "monthlyReport"
        );


    if (!select) {
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

            select.appendChild(
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

    state:
        appState,

    supabase:
        () =>
            supabaseClient,

    reloadStudents:
        loadStudents,

    reloadAttendance:
        loadTodayAttendance,

    showPage,

    showToast

};
