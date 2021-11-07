const classId = sessionStorage.getItem('classId'),
    className = sessionStorage.getItem('className');

const heb_status = {
    'offline': 'מנותק',
    'online': 'מחובר',
}

async function deleteUserProfilesFromComputer() {
    var row = getSelectedRow(table);
    if (row) {
        var computer = await $.ajax({ url: `/computer/one/${row.attr('id')}`, type: 'GET' });
        userProfileDeleteDiaolog(computer);
    } else {
        Toast('!בחר קודם מחשב')
    }
}
function getComputerList() {
    if (classId && className) {
        document.title = className;
        return new Promise((resolve, reject) => {
            $.ajax({ url: `/computer/list/${classId}`, type: "GET" })
                .done(data => data.success ?
                    resolve(data.computers) :
                    reject(data.msg))
        });
    } else {
        return new Promise(r => r([]));
    }
}
function getSelectedRow(table) {
    var selected_rows = table.fnGetNodes().filter(row => $(row).hasClass('selected'));
    if (selected_rows.length === 0) return undefined;
    return $(selected_rows[0]);
}

socket.on('createComputer', computer => {
    table.fnAddData([
        computer.model,
        computer.monitor_model,
        computer.os,
        computer.serialNumber,
        computer.name,
        computer.ip,
        computer.mac,
        computer.free_space,
        computer.owner,
        heb_status[computer.status],
        computer._id
    ]);
    updateListeners();
});
socket.on('updateComputer', new_computer => {
    table.fnUpdate([
        new_computer.model ? new_computer.model : '',
        new_computer.monitor_model ? new_computer.monitor_model : '',
        new_computer.os ? new_computer.os : '',
        new_computer.serialNumber ? new_computer.serialNumber : '',
        new_computer.name,
        new_computer.ip,
        new_computer.mac,
        new_computer.free_space ? new_computer.free_space : '',
        new_computer.owner,
        heb_status[new_computer.status],
        new_computer._id
    ], table.find(`#${new_computer._id}`));

    var row = $($($(table.find(`#${new_computer._id}`)).children()[9])[0]);

    row.removeClass();
    row.addClass(heb_status[new_computer.status] === 'מנותק' ? 'text-danger' : 'text-success');

    updateListeners();

});

socket.on('deleteComputer', computerId => {
    table.fnDeleteRow((`#${computerId}`));
    updateListeners();
});

function initButtons(table) {
    if (!$("#EditContainer").length) {
        var $EditContainer = $('<div id="EditContainer" dir="rtl" class="container-fluid dataTables_info" style="padding:0px;">' +
            `${classId !== '0' ? '<button id="createNewBtn" class="btn btn-success" type = "submit">צור</button>' : ''}` +
            `${classId !== '0' ? '<button id="editBtn" class="btn btn-warning mr-1" type="submit">ערוך</button>' : ''}` +
            '<button id="deleteBtn" class="btn btn-danger mr-1" type="submit">מחק</button>' +
            '<button id="wakeBtn" class="btn btn-info mr-1" type="submit">הדלק</button>' +
            '<button id="shutdownBtn" class="btn btn-danger mr-1" type="submit">כיבוי</button>' +
            '</div>');
        $EditContainer.appendTo($('#table_wrapper'));

        $('#createNewBtn').on('click', () => computerDialog(undefined, async (computer) => {
            computer.classId = classId;
            var res = await $.ajax({
                url: "/computer/new",
                data: JSON.stringify(computer),
                type: 'POST',
                processData: false,
                dataType: 'JSON',
                contentType: 'application/json'
            });
            if (res.success) {
                Toast('מחשב נוסף בהצלחה')
                socket.emit('createComputer', res.computer);
            } else {
                Toast(res.msg);
            }
        }));
        $('#editBtn').on('click', async () => {
            var row = getSelectedRow(table);
            if (row) {
                var computer = await $.ajax({ url: `/computer/one/${row.attr('id')}`, type: 'GET' });
                computerDialog(computer, async new_computer => {
                    new_computer.classId = classId;
                    var res = await $.ajax({ url: `/computer/update/${row.attr('id')}`, type: 'POST', processData: false, data: JSON.stringify(new_computer), contentType: 'application/json' });
                    if (res.success) {
                        Toast('המחשב עודכן בהצלחה');
                        socket.emit('updateComputer', res.computer);
                    } else {
                        Toast(res.msg);
                    }
                });
            } else {
                Toast('!בחר קודם את המחשב שאתה רוצה לעדכן')
            }
        });
        $('#deleteBtn').on('click', async () => {
            var row = getSelectedRow(table);
            if (row) {
                var computer = await $.ajax({ url: `/computer/one/${row.attr('id')}`, type: 'GET' });
                deleteDialog(computer.name, async () => {
                    var res = (await $.ajax({ url: `/computer/${row.attr('id')}`, type: 'DELETE' }));
                    if (res.success) {
                        Toast('המחשב נמחק בהצלחה');
                        socket.emit('deleteComputer', row.attr('id'));
                    } else {
                        Toast(res.msg);
                    }
                });
            } else {
                Toast('!בחר קודם את המחשב שאתה רוצה למחוק');
            }
        });
        $('#wakeBtn').on('click', async () => {
            var row = getSelectedRow(table);
            if (row) {
                var res = await $.ajax({ url: `/computer/wol/${row.attr('id')}`, type: 'GET' });
                Toast(res.msg);
            }
            else {
                Toast('!בחר קודם את המחשב שאתה רוצה להדליק')
            }
        });
        $('#shutdownBtn').on('click', async () => {
            var row = getSelectedRow(table);
            if (row) {
                var res = await $.ajax({ url: `/computer/shutdown/${row.attr('id')}`, type: 'GET' });
                Toast(res.success ? 'הבקשה נשלחה מחכה לתגובת המחשב' : 'Access is denied (shutdown)');
            }
            else {
                Toast('!בחר קודם את המחשב שאתה רוצה לכבות')
            }
        });
    }
}
function updateListeners() {
    // remove all before listeners
    $('#table tbody tr').off();
    // create new listeners
    $('#table tbody tr').on('click', function () {
        const row = $(this);
        if (row.hasClass('selected')) {
            row.toggleClass('selected');
        } else {
            $(table.fnGetNodes()).each(function () {
                $(this).removeClass('selected');
            });
            row.toggleClass('selected');
        }
    });
}


async function updateTable(table) {
    (await getComputerList())
        .forEach(computer => {
            table.fnAddData([
                computer.model,
                computer.monitor_model,
                computer.os,
                computer.serialNumber,
                computer.name,
                computer.ip,
                computer.mac,
                computer.free_space,
                computer.owner,
                heb_status[computer.status],
                computer._id
            ]);
        });
    updateListeners();
}


var table = (function initTable() {
    var table = $('#table').dataTable({
        fnCreatedRow: function (nRow, aData, iDataIndex) {
            $(nRow).attr('id', `${aData[10]}`);
            $($(nRow).children()[9]).addClass(aData[9] === 'מנותק' ? 'text-danger' : 'text-success')
        },
    });
    $('#searchText').on('keyup', function () { table.fnFilter(this.value) });
    $('#searchForm').submit(() => false);
    $('#table_filter').hide();
    updateTable(table);

    initButtons(table);
    return table;
})();
