function redirectToAllComputers() {
    sessionStorage.setItem('classId', '0');
    sessionStorage.setItem('className', 'כל המחשבים');
    window.location.href = "computers.html";
}
function getClassesList() {
    return new Promise((resolve, reject) => {
        $.ajax({ url: "/class/list", type: "GET" })
            .done(data => data.success ?
                resolve(data.classes) :
                reject(data.msg))
    });
}
function getSelectedRow(table) {
    var selected_rows = table.fnGetNodes().filter(row => $(row).hasClass('selected'));
    if (selected_rows.length === 0) return undefined;
    return $(selected_rows[0]);
}

socket.on('createClass', _class => {
    table.fnAddData([
        _class.name,
        _class.description,
        _class._id
    ]);
    updateListeners();
});

socket.on('updateClass', new_class => {
    table.fnUpdate(
        [
            new_class.name,
            new_class.description,
            new_class._id
        ],
        table.find(`#${new_class._id}`));
    updateListeners();
});

socket.on('deleteClass', class_id => {
    table.fnDeleteRow((`#${class_id}`));
    updateListeners();
});

function initButtons(table) {
    if (!$("#EditContainer").length) {

        var $EditContainer = $('<div id="EditContainer" dir="rtl" class="container-fluid dataTables_info" style="padding:0px;">' +
            '<button id="createNewBtn" class="btn btn-success" type = "submit">צור</button>' +
            '<button id="editBtn" class="btn btn-warning mr-1" type="submit">ערוך</button>' +
            '<button id="deleteBtn" class="btn btn-danger mr-1" type="submit">מחק</button>' +
            '<button id="wakeAllBtn" class="btn btn-info mr-1" type="submit">הדלק כיתה</button>' +
            '<button id="shutdownBtn" class="btn btn-danger mr-1" type="submit">כיבוי כללי</button>' +
            '</div>');
        $EditContainer.appendTo($('#table_wrapper'));
        $('#createNewBtn').on('click', () => classDialog(undefined, async (_class) => {
            var res = await $.ajax({
                url: "/class/new",
                data: JSON.stringify(_class),
                type: 'POST',
                processData: false,
                dataType: 'JSON',
                contentType: 'application/json'
            });
            if (res.success) {
                Toast('כיתה הוספה בהצלחה')
                socket.emit('createClass', res._class);
            } else {
                Toast(res.msg);
            }
        }));
        $('#editBtn').on('click', async () => {
            var row = getSelectedRow(table);
            if (row) {
                var selected_class = await $.ajax({ url: `/class/one/${row.attr('id')}`, type: 'GET' });
                classDialog(selected_class, async (new_class) => {
                    var res = await $.ajax({ url: `/class/update/${new_class._id}`, type: 'POST', processData: false, data: JSON.stringify(new_class), contentType: 'application/json' });
                    if (res.success) {
                        Toast('הכיתה עודכנה בהצלחה');
                        socket.emit('updateClass', new_class);
                    } else {
                        Toast(res.msg);
                    }
                });
            } else {
                Toast('!בחר קודם את הכיתה שאתה רוצה לעדכן');
            }
        });
        $('#deleteBtn').on('click', async () => {
            var row = getSelectedRow(table);
            if (row) {
                var _class = await $.ajax({ url: `/class/one/${row.attr('id')}`, type: 'GET' });
                deleteDialog(_class.name, async () => {
                    var res = (await $.ajax({ url: `/class/${_class._id}`, type: 'DELETE' }));
                    if (res.success) {
                        Toast('הכיתה נמחקה בהצלחה');
                        socket.emit('deleteClass', _class._id);
                    } else {
                        Toast(res.msg);
                    }
                });
            } else {
                Toast('!בחר קודם את הכיתה שאתה רוצה למחוק');
            }
        })
        $('#wakeAllBtn').on('click', async () => {
            var row = getSelectedRow(table);
            if (row) {
                var res = await $.ajax({ url: `/class/wol/${row.attr('id')}`, type: 'GET' });
                Toast(res.msg);
            } else {
                Toast('!בחר קודם את הכיתה שאתה רוצה להדליק');
            }
        });
        $('#shutdownBtn').on('click', async () => {
            var row = getSelectedRow(table);
            if (row) {
                var res = await $.ajax({ url: `/class/shutdown/${row.attr('id')}`, type: 'GET' });
                Toast(res.msg);
            } else {
                Toast('!בחר קודם את הכיתה שאתה רוצה לכבות');
            }
        });
    }
}

async function updateListeners() {
    // remove all before listeners
    $('#table tbody tr').off();
    // create new listeners
    $('#table tbody tr').on('click', async function () {
        const row = $(this);
        if (row.hasClass('selected')) {
            var _class = await $.ajax({
                url: `/class/one/${row.attr('id')}`,
                type: 'GET',
            });
            sessionStorage.setItem('classId', _class._id);
            sessionStorage.setItem('className', _class.name);
            window.location.href = "computers.html";
        } else {
            $(table.fnGetNodes()).each(function () {
                $(this).removeClass('selected');
            });
            $(this).toggleClass('selected');
        }
    });
}
async function updateTable(table) {
    (await getClassesList())
        .forEach(_class => {
            table.fnAddData([_class.name, _class.description, _class._id])
        });
    updateListeners();
}

var table = (function initTable() {
    var table = $('#table').dataTable({
        fnCreatedRow: function (nRow, aData, iDataIndex) {
            $(nRow).attr('id', `${aData[2]}`);
        },
    });
    $('#searchText').on('keyup', function () { table.fnFilter(this.value) });
    $('#searchForm').submit(() => false);
    $('#table_filter').hide();
    updateTable(table);

    initButtons(table);
    return table;
})();
