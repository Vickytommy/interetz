/*
Template Name: Minia - Admin & Dashboard Template
Author: Themesbrand
Website: https://themesbrand.com/
Contact: themesbrand@gmail.com
File: Calendar init js
*/

var Draggable = FullCalendar.Draggable;
var calendarEl = document.getElementById('calendar');
var checkbox = document.getElementById('drop-remove');
var businessHoursCheckbox = document.getElementById('businessCalendar');
var weekNumberCalendar = document.getElementById('weekNumberCalendar');

// initialize the external events // -----------------------------------------------------------------
document.getElementById('event-modal');
var modalTitle = document.getElementById('modal-title');
var formEvent = document.getElementById('form-event');
var selectedEvent = null;
var newEventData = null;
var forms = document.getElementsByClassName('needs-validation');
var selectedEvent = null;
var newEventData = null;
var eventObject = null;

/* initialize the calendar */

var date = new Date();
var d = date.getDate();
var m = date.getMonth();
var y = date.getFullYear();
var Draggable = FullCalendar.Draggable;
var externalEventContainerEl = document.getElementById('external-events');

// init dragable
new Draggable(externalEventContainerEl, {
    itemSelector: '.external-event',
    eventData: function (eventEl) {
        return {
            title: eventEl.innerText,
            start: new Date(),
            className: eventEl.getAttribute('data-class')
        };
    }
});

// -----------------------------------------------------------------

var defaultEvents = [{
    title: 'All Day Event',
    start: new Date(y, m, 1),
    className: 'text-white p-1 border-transparent bg-violet-500'
},
{
    title: 'Long Event',
    start: new Date(y, m, d - 5),
    end: new Date(y, m, d - 2),
    className: 'text-white p-1 border-transparent bg-yellow-500'
},
{
    id: 999,
    title: 'Repeating Event',
    start: new Date(y, m, d - 3, 16, 0),
    allDay: false,
    className: 'text-white p-1 border-transparent bg-sky-500'
},
{
    id: 999,
    title: 'Repeating Event',
    start: new Date(y, m, d + 4, 16, 0),
    allDay: false,
    className: 'text-white p-1 border-transparent bg-violet-500'
},
{
    title: 'Meeting',
    start: new Date(y, m, d, 10, 30),
    allDay: false,
    className: 'text-white p-1 border-transparent bg-green-500'
},
{
    title: 'Lunch',
    start: new Date(y, m, d, 12, 0),
    end: new Date(y, m, d, 14, 0),
    allDay: false,
    className: 'text-white p-1 border-transparent bg-red-500'
},
{
    title: 'Birthday Party',
    start: new Date(y, m, d + 1, 19, 0),
    end: new Date(y, m, d + 1, 22, 30),
    allDay: false,
    className: 'text-white p-1 border-transparent bg-green-500'
},
{
    title: 'Click for Google',
    start: new Date(y, m, 28),
    end: new Date(y, m, 29),
    url: 'http://google.com/',
    className: 'text-white p-1 border-transparent bg-zinc-800'
}];

function addNewEvent(info) {
    formEvent.classList.remove("was-validated");
    formEvent.reset();
    selectedEvent = null;
    modalTitle.innerText = 'Add Event';
    newEventData = info;
document.querySelector("#btn-delete-event").classList.add("hidden")

}

function getInitialView() {
    if (window.innerWidth >= 768 && window.innerWidth < 1200) {
        return 'timeGridWeek';
    } else if (window.innerWidth <= 768) {
        return 'listMonth';
    } else {
        return 'dayGridMonth';
    }
}

var calendar = new FullCalendar.Calendar(calendarEl, {
    timeZone: 'local',
    editable: true,
    droppable: true,
    selectable: true,
    longPressDelay: true,
    initialView: getInitialView(),
    themeSystem: 'tailwindcss',
    headerToolbar: {
        left: 'prev,next,today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    }, drop: function (info) {
        // is the "remove after drop" checkbox checked?
        // if (checkbox.checked) {
            // if so, remove the element from the "Draggable Events" list
            // info.draggedEl.parentNode.removeChild(info.draggedEl);
        // }
    },
    // businessHours: getBusinessHours(), // Set initial business hours
    // responsive
    windowResize: function (view) {
        var newView = getInitialView();
        calendar.changeView(newView);
    },
    eventDidMount: function (info) {
        if (info.event.extendedProps.status === 'done') {
            // Change background color of row
            info.el.style.backgroundColor = 'red';
            // Change color of dot marker
            var dotEl = info.el.getElementsByClassName('fc-event-dot')[0];
            if (dotEl) {
                dotEl.style.backgroundColor = 'white';
            }
        }
    },
    eventClick: function (info) {
        document.getElementById("event-modal").classList.remove('hidden');
        formEvent.reset();
        document.getElementById("event-title").value = "";
        selectedEvent = info.event;
        document.getElementById("event-title").value = selectedEvent.title;
        document.getElementById('event-category').value = selectedEvent.classNames[0];
        newEventData = null;
        modalTitle.innerText = 'Edit Event';
        newEventData = null;
document.querySelector("#btn-delete-event").classList.remove("hidden")

    },
    dateClick: function (info) {
        addNewEvent(info);
        document.getElementById("event-modal").classList.remove('hidden');
    },
    events: defaultEvents
});
calendar.render();



/*Add new event*/
// Form to add new event
formEvent.addEventListener('submit', function (ev) {
    ev.preventDefault();

    var updatedTitle = document.getElementById("event-title").value;
    var updatedCategory = document.getElementById('event-category').value;
    // validation
    if (forms[0].checkValidity() === false) {
        forms[0].classList.add('was-validated');
    } else {
        if (selectedEvent) {
            selectedEvent.setProp("title", updatedTitle);
            selectedEvent.setProp("classNames", [updatedCategory]);
        } else {
            var newEvent = {
                title: updatedTitle,
                start: newEventData.date,
                allDay: newEventData.allDay,
                className: updatedCategory
            }
            calendar.addEvent(newEvent);
        }
        document.getElementById("eventModal-close").click();
    }
});

document.getElementById("btn-delete-event").addEventListener("click", function (e) {
    if (selectedEvent) {
        selectedEvent.remove();
        selectedEvent = null;
        document.getElementById("eventModal-close").click();
    }
});
// localization
function changeLocale() {
    var selectedLocale = document.getElementById('localization-category').value;
    calendar.setOption('locale', selectedLocale);
}

var localLang = document.getElementById("localization-category");
localLang.addEventListener("change", function () {
    changeLocale()
});
