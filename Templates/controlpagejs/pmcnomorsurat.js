
$(function () {
    // Set the format for date and time
    var format = 'MM/DD/YYYY HH:mm:ss';

    // Tanggal Tambah
    $('#tanggalTambahDiv').datetimepicker({
        format: 'DD-MM-YYYY',
        icons: {
            time: 'fas fa-clock', date: 'fas fa-calendar-alt', up: 'fas fa-chevron-up', down: 'fas fa-chevron-down',
            previous: 'fas fa-chevron-left', next: 'fas fa-chevron-right', today: 'fas fa-calendar-day',
            clear: 'fas fa-trash', close: 'fas fa-times'
        },
        keepInvalid: true,
        widgetPositioning: {
            horizontal: 'left',
            vertical: 'bottom'
        }
    });

    // Tanggal Edit
    $('#tanggalEditDiv').datetimepicker({
        format: 'DD-MM-YYYY',
        icons: {
            time: 'fas fa-clock', date: 'fas fa-calendar-alt', up: 'fas fa-chevron-up', down: 'fas fa-chevron-down',
            previous: 'fas fa-chevron-left', next: 'fas fa-chevron-right', today: 'fas fa-calendar-day',
            clear: 'fas fa-trash', close: 'fas fa-times'
        },
        keepInvalid: true,
        widgetPositioning: {
            horizontal: 'left',
            vertical: 'bottom'
        }
    });

    // Filter Tanggal Utama
    $('#startDateDiv, #endDateDiv').datetimepicker({
        format: 'DD-MM-YYYY',
        icons: {
            time: 'fas fa-clock', date: 'fas fa-calendar-alt', up: 'fas fa-chevron-up', down: 'fas fa-chevron-down',
            previous: 'fas fa-chevron-left', next: 'fas fa-chevron-right', today: 'fas fa-calendar-day',
            clear: 'fas fa-trash', close: 'fas fa-times'
        },
        widgetPositioning: {
            horizontal: 'left',
            vertical: 'bottom'
        }
    });
});

function refreshData() {
    loadData();
}

function showModalAlert(targetId, message, type = 'success') {
    const container = $(`#alert-container-${targetId}`);
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';

    const alertHtml = `
		<div class="alert ${alertClass} d-flex align-items-center mb-3 modal-alert-item" style="display: none; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: none; border-radius: 12px; border-left: 4px solid ${type === 'success' ? '#28a745' : '#dc3545'};">
			<i class="${icon} mr-2"></i>
			<span class="flex-grow-1">${message}</span>
			<button type="button" class="close ml-2" data-dismiss="alert" aria-label="Close">
				<span aria-hidden="true">&times;</span>
			</button>
		</div>
	`;

    const $alert = $(alertHtml);
    container.html($alert);
    $alert.slideDown(300);

    if (type === 'success') {
        setTimeout(() => {
            $alert.slideUp(300, function () {
                $(this).remove();
                if (targetId === 'tambah') $('#formModal').modal('hide');
                if (targetId === 'edit') $('#editModal').modal('hide');
            });
        }, 1500);
    }
}

// Get the form tambah data.
let formTambah = $('#form-tambah-data');

// Get the inputs.
let tanggalTambah = formTambah.find('#tanggalTambah');
let nomorSuratTambah = formTambah.find('#nomorSuratTambah');
let namaDokumenTambah = formTambah.find('#namaDokumenTambah');
let keperluanTambah = formTambah.find('#keperluanTambah');

function validateFormTambah() {
    let isValid = true;
    if (!tanggalTambah.val()) { $('.inv-tanggalTambah-0').show(); isValid = false; } else { $('.inv-tanggalTambah-0').hide(); }
    if (!nomorSuratTambah.val()) { $('.inv-nomorSuratTambah-0').show(); isValid = false; } else { $('.inv-nomorSuratTambah-0').hide(); }
    if (!namaDokumenTambah.val()) { $('.inv-namaDokumenTambah-0').show(); isValid = false; } else { $('.inv-namaDokumenTambah-0').hide(); }
    if (!keperluanTambah.val()) { $('.inv-keperluanTambah-0').show(); isValid = false; } else { $('.inv-keperluanTambah-0').hide(); }
    return isValid;
}


formTambah.submit(function (event) {
    event.preventDefault();

    if (validateFormTambah()) {
        let formData = new FormData();
        // Reverted to raw DD-MM-YYYY as expected by backend
        formData.append('tanggal', tanggalTambah.val());
        formData.append('noSurat', nomorSuratTambah.val().trim());
        formData.append('namaDokumen', namaDokumenTambah.val());
        formData.append('keperluan', keperluanTambah.val());

        let fileInput = $('#fileTambah')[0].files[0];
        if (fileInput) formData.append('file', fileInput);

        $.ajax({
            type: 'POST',
            url: '/api/surat',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                refreshData();
                showModalAlert('tambah', 'Nomor surat berhasil dipesan (booked)!');
                formTambah[0].reset();
                $('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
                $('#check-nosurat-tambah').hide().empty();
            },
            error: function (response) {
                showModalAlert('tambah', "Gagal: " + (response.responseJSON ? response.responseJSON.error : 'Terjadi kesalahan'), 'danger');
            }
        });
    }
});

var tabel = null;

function loadData() {
    let rawStartDate = $('#startDate').val();
    let rawEndDate = $('#endDate').val();
    
    // Convert visually displayed DD-MM-YYYY to backend's YYYY-MM-DD expectation
    let startDate = rawStartDate ? moment(rawStartDate, 'DD-MM-YYYY').format('YYYY-MM-DD') : '';
    let endDate = rawEndDate ? moment(rawEndDate, 'DD-MM-YYYY').format('YYYY-MM-DD') : '';

    if (tabel !== null) {
        tabel.destroy();
    }

    tabel = $('#example1').DataTable({
        "ajax": {
            "url": "/api/datanomorsurat",
            "dataSrc": function (json) {
                updateFiltersAndNotifications(json);
                return json;
            },
            "data": function (d) {
                d.startDate = startDate;
                d.endDate = endDate;
            },
            "error": function (xhr, error, thrown) { console.log(xhr); }
        },
        "columns": [
            {
                "data": null,
                "class": "align-center",
                "orderable": false,
                "searchable": false,
                "render": function (data, type, row, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            },
            { "data": "id", visible: false },
            {
                "data": "tanggal",
                "render": function (data) {
                    return data ? moment(data).format('DD-MM-YYYY') : '';
                }
            },
            { "data": "noSurat" },
            {
                "data": "namaDokumen",
                "render": function (data, type, row) {
                    let content = '<span style="white-space: normal; word-break: break-word; font-weight: 500;">' + data + '</span><br>';
                    content += '<small class="text-muted" style="font-size: 0.85em; display: inline-block; margin-top: 4px;">';

                    // Gabungkan Dibuat dan Update dalam satu baris (Task 1)
                    let tglBuat = row.createdAt ? moment(row.createdAt).format('DD MMM YYYY HH:mm') : '-';
                    content += '<i class="fas fa-user-edit"></i> Dibuat: <b>' + (row.createdBy || '-') + '</b> (' + tglBuat + ')';

                    if (row.updatedAt && row.updatedBy) {
                        let tglUpdate = moment(row.updatedAt).format('DD MMM YYYY HH:mm');
                        content += ' - Update (<b>' + tglUpdate + '</b>)';
                    }

                    // Label khusus File Diedit (Task 2)
                    if (row.fileUpdatedAt && row.fileUpdatedBy) {
                        let tglFileUpdate = moment(row.fileUpdatedAt).format('DD MMM YYYY HH:mm');
                        content += '<br><i class="fas fa-file-signature text-info"></i> File Diedit: <b>' + (row.fileUpdatedBy || '-') + '</b> (' + tglFileUpdate + ')';
                    }

                    content += '</small>';
                    return content;
                }
            },
            { "data": "keperluan" },
            {
                "data": "namaFile",
                "render": function (data, type, row) {
                    let buttons = '';
                    if (data) {
                        buttons += '<a href="/uploads/pmc_surat/' + data + '" target="_blank" class="btn btn-xs btn-info mr-1" title="Lihat"><i class="fas fa-eye"></i> Lihat</a>';
                    } else {
                        buttons += '<span class="text-muted text-xs mr-2">No File</span>';
                    }

                    // Only show History button if File has been replaced (fileUpdatedAt exists)
                    if (row.fileUpdatedAt) {
                        buttons += '<button type="button" class="btn btn-xs btn-secondary btn-history" data-id="' + row.id + '" title="Riwayat"><i class="fas fa-history"></i></button>';
                    }

                    return buttons;
                }
            },
            {
                // Kolom STATUS
                "data": "status",
                "render": function (data, type, row) {
                    let statusVal = data || 'Aktif';
                    let badge = '';
                    if (statusVal === 'Tidak Jadi Dipakai') {
                        badge = '<span class="badge badge-danger py-1 px-2" style="font-size:0.8em; border-radius:8px;"><i class="fas fa-ban mr-1"></i>Tidak Jadi Dipakai</span>';
                    } else {
                        badge = '<span class="badge badge-success py-1 px-2" style="font-size:0.8em; border-radius:8px;"><i class="fas fa-check-circle mr-1"></i>Aktif</span>';
                    }
                    return badge;
                }
            },
            {
                "data": null,
                "render": function (data, type, row) {
                    let buttons = '<td style="text-align: center;">';
                    
                    // Hanya tampilkan tombol edit jika user saat ini adalah pembuat dokumen atau user 'lutfi'
                    if (typeof currentUsername !== 'undefined' && (currentUsername === row.createdBy || currentUsername === 'lutfi')) {
                        buttons += '<button type="button" class="btn btn-warning btn-edit" data-id="' + row.id + '"><i class="fas fa-edit fa-xs"></i></button>';
                    }

                    // Hanya tampilkan tombol delete untuk user 'lutfi' (Task 6)
                    if (typeof currentUsername !== 'undefined' && currentUsername === 'lutfi') {
                        buttons += ' <button type="button" class="btn btn-danger btn-delete" data-id="' + row.id + '"><i class="fas fa-trash-alt fa-xs"></i></button>';
                    }

                    buttons += '</td>';
                    return buttons;
                }
            }
        ],
        scrollX: true,
        order: [[1, "desc"]],
        lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "All"]],
        pageLength: 10,
        dom: "<'row'<'col-sm'l><'col-sm'B><'col-sm'f>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        buttons: [
            { extend: 'copy', text: '<i class="fas fa-copy"></i> &nbsp Copy' },
            { extend: 'csv', text: '<i class="fas fa-file-csv"></i>&nbsp CSV' },
            { extend: 'excel', text: '<i class="fas fa-file-excel"></i>&nbsp Excel' },
            { extend: 'pdfHtml5', text: '<i class="fas fa-file-pdf"></i>&nbsp Pdf' },
            { extend: 'print', text: '<i class="fas fa-print"></i>&nbsp Print' }
        ]
    });
}


$(document).ready(function () {
    // Set default dates using datetimepicker setter
    $('#startDateDiv').datetimepicker('date', moment().startOf('year'));
    $('#endDateDiv').datetimepicker('date', moment());

    loadData();

    $('#btnRefresh').on('click', function () { refreshData(); });
    $('#btnFilter').on('click', function () { loadData(); });

    // Handle client-side status and creator filtering without reloading from API
    $('#statusFilter, #pembuatFilter').on('change', function () {
        if (tabel) {
            tabel.draw();
        }
    });

    $('#formModal').on('show.bs.modal', function () {
        $('.form-control').removeClass('is-valid is-invalid');
        $('#alert-container-tambah').empty();
    });

    $('#editModal').on('show.bs.modal', function () {
        $('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
        $('#alert-container-edit').empty();
    });
});


$(document).on('click', '.btn-history', function () {
    let id = $(this).data('id');
    $.get('/api/surat/' + id + '/history', function (data) {
        let tbody = $('#tableHistory tbody');
        tbody.empty();
        if (data.length === 0) {
            tbody.append('<tr><td colspan="5" class="text-center">Belum ada riwayat perubahan file.</td></tr>');
        } else {
            data.forEach((row, index) => {
                tbody.append(`
					<tr>
						<td>${index + 1}</td>
						<td>${row.namaFile}</td>
						<td>${row.archivedBy || '-'}</td>
						<td>${moment(row.archivedAt).format('DD MMM YYYY HH:mm')}</td>
						<td><a href="/uploads/pmc_surat/${row.namaFile}" target="_blank" class="btn btn-sm btn-primary">Lihat</a></td>
					</tr>
				`);
            });
        }
        $('#historyModal').modal('show');
    });
});


$(document).on('click', '.btn-edit', function () {
    let id = $(this).data('id');
    let tr = $(this).closest('tr');
    let row = tabel.row(tr).data();

    if (!row) {
        if (tr.hasClass('child')) {
            tr = tr.prev();
            row = tabel.row(tr).data();
        }
    }

    $('#idEdit').val(row.id);
    let formattedDate = row.tanggal ? moment(row.tanggal).format('DD-MM-YYYY') : '';
    $('#tanggalEdit').val(formattedDate);
    $('#nomorSuratEdit').val(row.noSurat);
    $('#namaDokumenEdit').val(row.namaDokumen);
    $('#keperluanEdit').val(row.keperluan);
    $('#statusEdit').val(row.status || 'Aktif');
    $('#editModal').modal('show');
    $('#check-nosurat-edit').hide().empty();
});


let formEdit = $('#form-Edit-data');
let tanggalEdit = formEdit.find('#tanggalEdit');
let nomorSuratEdit = formEdit.find('#nomorSuratEdit');
let namaDokumenEdit = formEdit.find('#namaDokumenEdit');
let keperluanEdit = formEdit.find('#keperluanEdit');

function validateFormEdit() {
    let isValid = true;
    if (!tanggalEdit.val()) { $('.inv-tanggalEdit-0').show(); isValid = false; } else { $('.inv-tanggalEdit-0').hide(); }
    if (!nomorSuratEdit.val()) { $('.inv-nomorSuratEdit-0').show(); isValid = false; } else { $('.inv-nomorSuratEdit-0').hide(); }
    if (!namaDokumenEdit.val()) { $('.inv-namaDokumenEdit-0').show(); isValid = false; } else { $('.inv-namaDokumenEdit-0').hide(); }
    if (!keperluanEdit.val()) { $('.inv-keperluanEdit-0').show(); isValid = false; } else { $('.inv-keperluanEdit-0').hide(); }
    return isValid;
}

formEdit.submit(function (event) {
    event.preventDefault();

    if (validateFormEdit()) {
        let id = $('#idEdit').val();
        let formData = new FormData();
        // Reverted to raw DD-MM-YYYY as expected by backend
        formData.append('tanggal', tanggalEdit.val());
        formData.append('noSurat', nomorSuratEdit.val().trim());
        formData.append('namaDokumen', namaDokumenEdit.val());
        formData.append('keperluan', keperluanEdit.val());
        formData.append('status', $('#statusEdit').val());

        let fileInput = $('#fileEdit')[0].files[0];
        if (fileInput) formData.append('file', fileInput);

        $.ajax({
            type: 'PUT',
            url: '/api/surat/' + id,
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                refreshData();
                showModalAlert('edit', 'Data nomor surat berhasil diupdate!');
            },
            error: function (response) {
                showModalAlert('edit', "Gagal: " + (response.responseJSON ? response.responseJSON.error : 'Terjadi kesalahan'), 'danger');
            }
        });
    }
});


$(document).on('click', '.btn-delete', function () {
    let id = $(this).data('id');
    $('#deleteModal').data('id', id).modal('show');
    $('.modal-body', '#deleteModal').text('Apakah Anda yakin ingin menghapus data ini?');
});

$('.btn-confirm-delete').click(function () {
    let id = $('#deleteModal').data('id');
    $.ajax({
        type: 'DELETE',
        url: '/api/surat/' + id,
        success: function (response) {
            $('#deleteModal').modal('hide');
            refreshData();
        },
        error: function (response) {
            alert("Error: " + response.responseJSON.error);
        }
    });
});

// --- Premium Validation Logic ---

function debounce(func, timeout = 200) { // Reduced to 200ms
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

let pendingCheck = null;

const doCheckNoSurat = debounce((noSurat, targetId, excludeId) => {
    let feedbackDir = $(`#check-nosurat-${targetId}`);
    let saveBtn = targetId === 'tambah' ? $('#form-tambah-data button[type="submit"]') : $('#form-Edit-data button[type="submit"]');

    if (pendingCheck) pendingCheck.abort();

    pendingCheck = $.ajax({
        type: 'GET',
        url: '/api/check_nosurat',
        data: { noSurat: noSurat, excludeId: excludeId },
        success: function (data) {
            if (data.available) {
                feedbackDir.html('<i class="fas fa-check-circle text-success pulse"></i> <span class="text-success font-weight-bold">Tersedia</span>');
                $(`#nomorSurat${targetId.charAt(0).toUpperCase() + targetId.slice(1)}`).removeClass('is-invalid').addClass('is-valid');
                saveBtn.prop('disabled', false);
            } else {
                feedbackDir.html('<i class="fas fa-times-circle text-danger shake"></i> <span class="text-danger font-weight-bold">Sudah terpakai!</span>');
                $(`#nomorSurat${targetId.charAt(0).toUpperCase() + targetId.slice(1)}`).removeClass('is-valid').addClass('is-invalid');
                saveBtn.prop('disabled', true);
            }
            pendingCheck = null;
        }
    });
}, 200);

function checkNoSurat(noSurat, targetId, excludeId) {
    let feedbackDir = $(`#check-nosurat-${targetId}`);
    let saveBtn = targetId === 'tambah' ? $('#form-tambah-data button[type="submit"]') : $('#form-Edit-data button[type="submit"]');

    const cleanNoSurat = noSurat.replace(/\s+/g, '');

    if (!cleanNoSurat) {
        feedbackDir.hide().empty();
        saveBtn.prop('disabled', false);
        if (pendingCheck) { pendingCheck.abort(); pendingCheck = null; }
        return;
    }

    // Show immediate feedback
    feedbackDir.show().html('<i class="fas fa-spinner fa-spin text-primary"></i> <span class="text-muted">Mengecek...</span>');
    saveBtn.prop('disabled', true);

    doCheckNoSurat(cleanNoSurat, targetId, excludeId);
}

$('#nomorSuratTambah').on('input', function () {
    let val = $(this).val();
    // Hilangkan spasi secara otomatis (Task 5)
    if (/\s/.test(val)) {
        val = val.replace(/\s+/g, '');
        $(this).val(val);
    }
    checkNoSurat(val, 'tambah');
});

$('#nomorSuratEdit').on('input', function () {
    let val = $(this).val();
    // Hilangkan spasi secara otomatis (Task 5)
    if (/\s/.test(val)) {
        val = val.replace(/\s+/g, '');
        $(this).val(val);
    }
    checkNoSurat(val, 'edit', $('#idEdit').val());
});

$('<style>')
    .prop('type', 'text/css')
    .html(`
	@keyframes pulse { 0% { opacity: 0.7; } 50% { opacity: 1; } 100% { opacity: 0.7; } }
	.pulse { animation: pulse 1.5s infinite; }
	@keyframes shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-3px); } 40% { transform: translateX(3px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
	.shake { animation: shake 0.3s ease-in-out; }
`)
    .appendTo('head');

// --- Pending Uploads & Filters Logic ---

let pendingUploadsByUser = {};
let totalPendingCount = 0;
let isFirstLoad = true;

function updateFiltersAndNotifications(data) {
    pendingUploadsByUser = {};
    totalPendingCount = 0;
    
    let creators = new Set();
    
    data.forEach(function (row) {
        if (row.createdBy && row.createdBy !== '-') {
            creators.add(row.createdBy);
        }
        
        if (!row.namaFile) {
            totalPendingCount++;
            let creator = row.createdBy || 'Unknown';
            pendingUploadsByUser[creator] = (pendingUploadsByUser[creator] || 0) + 1;
        }
    });
    
    // Update Pembuat filter dropdown
    let pembuatSelect = $('#pembuatFilter');
    let currentSelected = pembuatSelect.val();
    
    pembuatSelect.find('option:not([value="all"])').remove();
    
    Array.from(creators).sort().forEach(function (creator) {
        pembuatSelect.append(new Option(creator, creator));
    });
    
    if (creators.has(currentSelected)) {
        pembuatSelect.val(currentSelected);
    } else {
        pembuatSelect.val('all');
    }
    
    // Update notification banner
    let notificationPanel = $('#notificationPanel');
    if (totalPendingCount > 0) {
        $('#totalPendingCount').text(totalPendingCount);
        notificationPanel.slideDown(300);

        // Auto-open detail modal on first page load if there are pending items
        if (isFirstLoad) {
            isFirstLoad = false;
            // Populate and show modal after a short delay for smooth UX
            setTimeout(function () {
                $('#btnShowPendingDetails').trigger('click');
            }, 600);
        }
    } else {
        notificationPanel.slideUp(300);
        isFirstLoad = false;
    }
}

// Show pending modal detail
$(document).on('click', '#btnShowPendingDetails', function () {
    let tbody = $('#tablePendingDetails tbody');
    tbody.empty();
    
    if (Object.keys(pendingUploadsByUser).length === 0) {
        tbody.append('<tr><td colspan="3" class="text-center text-muted">Semua file sudah terupload!</td></tr>');
    } else {
        let sortedUsers = Object.keys(pendingUploadsByUser).sort(function (a, b) {
            return pendingUploadsByUser[b] - pendingUploadsByUser[a];
        });
        
        sortedUsers.forEach(function (user) {
            let count = pendingUploadsByUser[user];
            tbody.append(`
                <tr>
                    <td class="align-middle font-weight-bold">${user}</td>
                    <td class="align-middle text-center"><span class="badge badge-warning py-2 px-3" style="font-size: 0.9em; border-radius: 20px;">${count} Dokumen</span></td>
                    <td class="align-middle text-center">
                        <button type="button" class="btn btn-sm btn-info btn-view-pending-user" data-user="${user}" title="Filter User">
                            <i class="fas fa-eye"></i> Lihat
                        </button>
                    </td>
                </tr>
            `);
        });
    }
    
    $('#pendingDetailModal').modal('show');
});

// View pending user's documents
$(document).on('click', '.btn-view-pending-user', function () {
    let targetUser = $(this).data('user');
    
    $('#statusFilter').val('not_uploaded');
    $('#pembuatFilter').val(targetUser);
    
    if (tabel) {
        tabel.draw();
    }
    
    $('#pendingDetailModal').modal('hide');
    
    // Smooth scroll to table area
    $('html, body').animate({
        scrollTop: $("#statusFilter").offset().top - 100
    }, 500);
});

// Custom Search/Filter Implementation
$.fn.dataTable.ext.search.push(
    function (settings, data, dataIndex) {
        if (settings.nTable.id !== 'example1') {
            return true;
        }

        let api = $.fn.dataTable.Api(settings);
        let rowData = api.row(dataIndex).data();
        if (!rowData) return true;

        // 1. Status File Filter
        let statusVal = $('#statusFilter').val();
        if (statusVal === 'uploaded') {
            if (!rowData.namaFile) return false;
        } else if (statusVal === 'not_uploaded') {
            if (rowData.namaFile) return false;
        } else if (statusVal === 'tidak_jadi') {
            if ((rowData.status || 'Aktif') !== 'Tidak Jadi Dipakai') return false;
        }

        // 2. Pembuat Filter
        let pembuatVal = $('#pembuatFilter').val();
        if (pembuatVal && pembuatVal !== 'all') {
            if (rowData.createdBy !== pembuatVal) return false;
        }

        return true;
    }
);
