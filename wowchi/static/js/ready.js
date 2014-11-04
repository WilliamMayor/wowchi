$(document).ready(function() {
    $('#queue').waypoint('sticky');
    $('#exploring').waypoint('sticky');
    ko.applyBindings(wowchi);
    wowchi.load_from_storage();
    message.init();
});