var options = {
    model: true,
    title: '',
    resizeable: false,
    width: 500, buttons: []
}
function getExtraOptions(extraOptions) {
    return Object.assign(options, extraOptions);
}

function closeDialog(dialog) {
    $(dialog).dialog("close").remove();
}

function cancelBtn(dialog) {
    return { text: 'ביטול', class: 'btn btn-danger', click: () => closeDialog(dialog) };
}

function actionBtn(computer_or_class, callback) {
    var btn = {
        text: 'צור',
        class: 'btn btn-success',
        click: callback,
    };
    if (computer_or_class) {
        btn.text = 'ערוך';
        btn.class = 'btn btn-warning';
    }
    return btn;

}
function deleteBtn(callback) {
    return {
        text: 'מחק',
        class: 'btn btn-success',
        click: callback,
    };
}

function isEmptyOrSpaces(str) {
    return str === null || String(str).match(/^ *$/) !== null;
}

function deleteDialog(name, callback) {
    var dialog = $(`<div dir='rtl' class="container-fluid text-right">אתה בטוח שאתה רוצה למחוק את ${name}?</div>`);
    dialog.dialog(getExtraOptions({
        title: 'מחק',
        buttons: [
            deleteBtn(() => {
                callback();
                closeDialog(dialog);
            }),
            cancelBtn(dialog),
        ]
    }));
}
function computerDialog(computer, callback) {
    var dialog = $('<div class="container-fluid"></div>');

    // name
    var formError1 = $('<div class="form-group has-error"></div>');
    formError1.appendTo(dialog);

    var computerName = $(`<input id="computerName" value="${computer ? computer.name : ''}" class="form-control m-0 text-right" name="computerName" placeholder="הכנס שם מחשב" type="text">`);
    var computerNameError = $('<small id="computerNameError" class="text-danger text-right m-0 invisible">אתה חייב להכניס שם מחשב!</small>');

    computerName.appendTo(formError1);
    computerNameError.appendTo(formError1);

    // ip
    var formError2 = $('<div class="form-group has-error"></div>');
    formError2.appendTo(dialog);

    var ip_container = $('<div class="form-control m-0 d-flex justify-content-center"></div>');
    ip_container.appendTo(formError2);

    var computerIp = $('<div id="computerIp" class="m-auto" dir="ltr"></div>');
    var ip_input = computerIp.ipInput();
    ip_input.setIp(computer ? computer.ip : '');
    var ip_title = $('<h3 class="m-auto" dir="ltr">IP:</h2>');
    var computerIpError = $('<small id="computerIpError" class="text-danger text-right m-0 invisible">אתה חייב להכניס כתובת ip!</small ></div>')

    computerIp.appendTo(ip_container);
    ip_title.appendTo(ip_container);

    computerIpError.appendTo(formError2);

    // subnetMask
    var formError3 = $('<div class="form-group has-error"></div>');
    formError3.appendTo(dialog);

    var sm_container = $('<div class="form-control m-0 d-flex justify-content-center"></div>');
    sm_container.appendTo(formError3);

    var computerSubnetMusk = $('<div id="computerSubnetMusk" class="m-auto" dir="ltr"></div>');
    var sm_input = computerSubnetMusk.ipInput();
    sm_input.setIp(computer ? computer.subnetMask : '');
    var sm_title = $('<h3 class="m-auto" dir="ltr">SubnetMask:</h2>');
    var computerSMError = $('<small id="computerSMError" class="text-danger text-right m-0 invisible">אתה חייב להכניס כתובת subnet mask!</small ></div>')

    computerSubnetMusk.appendTo(sm_container);
    sm_title.appendTo(sm_container);

    computerSMError.appendTo(formError3);

    //mac
    var macBtn = $('<button id="macBtn" class="btn btn-primary mb-2 float-right">שלוף כתובת mac!</button>');
    macBtn.appendTo(dialog)
    macBtn.on('click', async (e) => {
        e.preventDefault();
        var ip = ip_input.getIp();

        if (ip) {
            var res = await $.ajax({ url: `/computer/getMac`, type: 'POST', processData: false, data: JSON.stringify({ ip }), contentType: 'application/json' });
            computerMac.val(res.msg);
            Toast('הבקשה בוצעה')
        } else {
            Toast('IP הכנס קודם כתובת');
        }
    })

    var formError4 = $('<div class="form-group has-error"></div>');
    formError4.appendTo(dialog);

    var computerMac = $(`<input id="computerMac" class="form-control m-0 text-right" name="compMac" placeholder="הכנס כתובת mac" value="${computer ? computer.mac : ''}" type="text">`);
    var computerMacError = $('<small id="computerMacErrorText" class="text-danger m-0 invisible text-right" >אתה חייב להכניס כתובת mac!</small>');

    computerMac.appendTo(formError4);
    computerMacError.appendTo(formError4);

    // owner
    var formError5 = $('<div class="form-group has-error"></div>');
    formError5.appendTo(dialog);

    var computerOwner = $(`<input id="computerOwner" class="form-control m-0 text-right" name="compOwner" placeholder="הכנס מספר עמדה או בעלים של מחשב" value="${computer ? computer.owner : ''}" type="text">`);
    var computerOwnerError = $('<small id="computerOwnerError" class="text-danger m-0 invisible text-right">אתה חייב להכניס מספר עמדה או בעלים של המחשב!</small>');

    computerOwner.appendTo(formError5);
    computerOwnerError.appendTo(formError5);

    dialog.dialog(getExtraOptions({
        title: computer ? 'ערוך מחשב' : 'צור מחשב חדש',
        buttons: [
            actionBtn(computer, () => {
                var nameIsRed = computerName.hasClass('is-invalid'),
                    nameIsEmpty = isEmptyOrSpaces(computerName.val());

                var ipIsRed = computerIp.hasClass('is-invalid'),
                    ipIsEmpty = (computerIp.getIp() === undefined);

                var smIsRed = computerSubnetMusk.hasClass('is-invalid'),
                    smIsEmpty = (computerSubnetMusk.getIp() === undefined);

                var macIsRed = computerMac.hasClass('is-invalid'),
                    macIsEmpty = isEmptyOrSpaces(computerMac.val());

                var ownerIsRed = computerOwner.hasClass('is-invalid'),
                    ownerIsEmpty = isEmptyOrSpaces(computerOwner.val());

                if (nameIsEmpty && !nameIsRed || !nameIsEmpty && nameIsRed) {
                    computerName.toggleClass('is-invalid');
                    computerNameError.toggleClass('invisible');
                }
                if (ipIsEmpty && !ipIsRed || !ipIsEmpty && ipIsRed) {
                    computerIp.toggleClass('is-invalid');
                    computerIpError.toggleClass('invisible');
                }
                if (smIsEmpty && !smIsRed || !smIsEmpty && smIsRed) {
                    console.log(computerSMError);
                    computerSubnetMusk.toggleClass('is-invalid');
                    computerSMError.toggleClass('invisible');
                }
                if (macIsEmpty && !macIsRed || !macIsEmpty && macIsRed) {
                    computerMac.toggleClass('is-invalid');
                    computerMacError.toggleClass('invisible');
                }
                if (ownerIsEmpty && !ownerIsRed || !ownerIsEmpty && ownerIsRed) {
                    computerOwner.toggleClass('is-invalid');
                    computerOwnerError.toggleClass('invisible');
                }
                if (!nameIsEmpty && !ipIsEmpty && !macIsEmpty && !ownerIsEmpty) {
                    callback({
                        name: computerName.val(),
                        ip: ip_input.getIp(),
                        subnetMask: sm_input.getIp(),
                        mac: computerMac.val(),
                        owner: computerOwner.val(),
                    });
                    closeDialog(dialog);
                }
            }),
            cancelBtn(dialog),
        ]
    }));
}

function classDialog(_class, callback) {
    var dialog = $('<div class="container-fluid"></div>');

    var formError1 = $('<div class="form-group has-error"></div>');
    formError1.appendTo(dialog);

    var className = $(`<input id="className" value="${_class ? _class.name : ''}" class="form-control m-0 text-right" name="className" placeholder="הכנס שם כיתה" type="text">`);
    var classNameError = $('<small id="classNameError" class="text-danger text-right m-0 invisible">אתה חייב להכניס שם כיתה!</small>');

    className.appendTo(formError1);
    classNameError.appendTo(formError1);

    var formError2 = $('<div class="form-group has-error"></div>');
    formError2.appendTo(dialog);

    var classDescription = $(`<input id="classDesc" value="${_class ? _class.description : ''}" class="form-control m-0 text-right" name="classDesc" placeholder="הכנס תיאור כיתה" type="text">`)
    var classDescriptionError = $('<small id="classDescError" class="text-danger m-0 invisible text-right">אתה חייב להכניס תיאור כיתה!</small>');
    classDescription.appendTo(formError2);
    classDescriptionError.appendTo(formError2);

    dialog.dialog(getExtraOptions({
        title: _class ? 'ערוך כיתה' : 'צור כיתה חדשה',
        buttons: [
            actionBtn(_class, () => {
                var nameIsRed = className.hasClass('is-invalid'),
                    nameIsEmpty = isEmptyOrSpaces(className.val());
                var descIsRed = classDescription.hasClass('is-invalid'),
                    descIsEmpty = isEmptyOrSpaces(classDescription.val());

                if (nameIsEmpty && !nameIsRed || !nameIsEmpty && nameIsRed) {
                    className.toggleClass('is-invalid');
                    classNameError.toggleClass('invisible');
                }
                if (descIsEmpty && !descIsRed || !descIsEmpty && descIsRed) {
                    classDescription.toggleClass('is-invalid');
                    classDescriptionError.toggleClass('invisible');
                }
                if (!nameIsEmpty && !descIsEmpty) {
                    callback({
                        _id: _class ? _class._id : undefined,
                        name: className.val(),
                        description: classDescription.val(),
                    });
                    closeDialog(dialog);
                }
            }),
            cancelBtn(dialog),
        ]
    }));
}
function userProfileDeleteDiaolog(computer) {
    var dialog = $('<div id="dialogUsers"></div>');
    var outputLabel = $('<label id="output"></label>');
    outputLabel.appendTo(dialog);
    dialog.dialog(getExtraOptions({
        title: `פלט ${computer.name}`,
        buttons: [
            {
                text: 'סגור', class: 'btn btn-danger', click: () => {
                    dialog.dialog("close");
                }
            }]
    }))
    outputLabel.empty();
    socket.emit('deleteUsersProfiles', computer._id);
    socket.on('deleteUsersProfiles', out => {
        if (out.id === computer._id) {
            if (isEmptyOrSpaces(out.data)) return;
            outputLabel.append(out.data + '<br/>');
        }
    })
}

