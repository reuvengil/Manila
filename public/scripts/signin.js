String.prototype.isEmpty = function () {
    return (this.length === 0 || !this.trim());
}
$('#login').click(async function (e) {
    e.preventDefault();
    var name = $('#name').val();
    var password = $('#password').val();
    if (name.isEmpty()) {
        Toast('enter user name!')
        return;
    }
    if (password.isEmpty()) {
        Toast('enter password!')
        return;
    }
    var user = { name, password };
    try {
        //get Token
        var resulte = await $.ajax("/auth/", {
            data: JSON.stringify(user),
            type: 'POST',
            processData: false,
            dataType: 'JSON',
            contentType: 'application/json'
        });
        if (resulte.seccess) {
            Cookie.set('token', resulte.token);
            location.href = '/pages';
            return;
        } else {
            Toast(resulte.message);
        }
    } catch (err) {
        console.log(err.responseJSON.message)
        return;
    }
});