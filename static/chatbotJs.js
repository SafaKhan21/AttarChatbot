$(document).ready(function () {
    // Initialize Flatpickr
    flatpickr("#calendarInput", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        onClose: function (selectedDates, dateStr, instance) {
            // Check if a date was selected
            if (dateStr) {
                // Get current value of the message box
                const currentText = $("#text").val();
                // Append the selected date and time to the current message text
                $("#text").val(currentText + (currentText ? " " : "") + dateStr);
            }
            $("#calendarInput").hide(); // Hide the calendar after selection
        }
    });

    // Toggle calendar picker visibility
    $("#calendar-btn").on("click", function () {
        $("#calendarInput").toggle();
    });

    // Hide calendar when clicking outside
    $(document).mouseup(function(e) {
        var container = $("#calendarInput");
        if (!container.is(e.target) && container.has(e.target).length === 0) {
            $("#calendarInput").hide();
        }
    });
});
