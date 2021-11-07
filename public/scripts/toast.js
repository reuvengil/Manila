function Toast(text) {
    var snackbar = $(`<div class="snackbar">${text}</div>`);
    snackbar.appendTo($(document.body));
    snackbar.addClass('show');
    setTimeout(function () {
        snackbar.toggleClass('show');
        snackbar.remove();
    }, 2800)
}