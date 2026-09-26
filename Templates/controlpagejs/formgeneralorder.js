// Mengambil nilai dari elemen input
const namaLengkap = document.getElementById('namalengkap').value;
const userName = document.getElementById("username").value;
const levelUser = document.querySelector('#leveluser').value;
// RBAC: baca permissions dari context processor (aman jika elemen tidak ada)
const _permEl = document.getElementById('user-permissions-data');
const userPermissions = _permEl ? JSON.parse(_permEl.textContent) : [];
const canViewPricing = userPermissions.includes('WH_VIEW_PRICING') || levelUser == '1' || levelUser == '3';
// Setup Form Tambah data
let formTambah = $('#form-tambah-data');

let tanggalpengajuanTambah = formTambah.find('#tanggalpengajuanTambah');
let idnumberTambah = formTambah.find('#idnumberTambah');
let namabarangTambah = formTambah.find('#namabarangTambah');
let spesifikasiTambah = formTambah.find('#spesifikasiTambah');
let qtyTambah = formTambah.find('#qtyTambah');
let unitTambah = formTambah.find('#unitTambah');
let namarequestTambah = formTambah.find('#namarequestTambah');
let deptTambah = formTambah.find('#deptTambah');
let kriteriaTambah = formTambah.find('#kriteriaTambah');
let kodebudgetTambah = formTambah.find('#kodebudgetTambah');
let statusTambah = formTambah.find('#statusTambah');
let kategoriTambah = formTambah.find('#kategoriTambah');
let detailkategoriTambah = formTambah.find('#detailkategoriTambah');
let toTambah = formTambah.find('#toTambah');
let statussc1Tambah = formTambah.find('#statussc1Tambah');
let priceTambah = formTambah.find('#priceTambah');
let suplierTambah = formTambah.find('#suplierTambah');
// Add event listeners.
tanggalpengajuanTambah.on('input', validatetanggalpengajuanTambah);
namabarangTambah.on('input', validatenamabarangTambah);
spesifikasiTambah.on('input', validatespesifikasiTambah);
qtyTambah.on('input', validateqtyTambah);
unitTambah.on('input', validateunitTambah);
kodebudgetTambah.on('input', validatekodebudgetTambah);
namarequestTambah.on('input', validatenamarequestTambah);
deptTambah.on('input', validatedeptTambah);
kriteriaTambah.on('input', validatekriteriaTambah);
statusTambah.on('input', validatestatusTambah);
kategoriTambah.on('input', validatekategoriTambah);
detailkategoriTambah.on('input', validatedetailkategoriTambah);
toTambah.on('input', validatetoTambah);

function validatetanggalpengajuanTambah() {

	const tanggalpengajuan = $("#tanggalpengajuanTambah");
	const inv0 = $(".inv-tanggalpengajuanTambah-0");
	const valid = $(".valid-feedback.tanggalpengajuanTambah");

	let tanggalpengajuanValue = tanggalpengajuan.val();

	if (!tanggalpengajuanValue) {
		inv0.hide();
		valid.hide();
		tanggalpengajuan.removeClass("is-valid");
		tanggalpengajuan.next(".valid-feedback").hide();
		tanggalpengajuan.addClass("is-invalid");
		inv0.show();
		tanggalpengajuan.focus();
		return false;
	} else {
		inv0.hide();
		valid.hide();
		tanggalpengajuan.removeClass("is-invalid");
		tanggalpengajuan.addClass("is-valid");
		valid.show();
		return true;
	}
}

function validatenamabarangTambah() {
	const namabarang = $("#namabarangTambah");
	const inv0 = $(".inv-namabarangTambah-0");
	const valid = $(".valid-feedback.namabarangTambah");

	let namabarangValue = namabarang.val();

	if (!namabarangValue) {
		inv0.hide();
		valid.hide();
		namabarang.removeClass("is-valid");
		namabarang.next(".valid-feedback").hide();
		namabarang.addClass("is-invalid");
		inv0.show();
		namabarang.focus();
		return false;
	} else {
		inv0.hide();
		valid.hide();
		namabarang.removeClass("is-invalid");
		namabarang.addClass("is-valid");
		valid.show();
		return true;
	}
}

function validatenamarequestTambah() {
	const namarequest = $("#namarequestTambah");
	const inv0 = $(".inv-namarequestTambah-0");
	const valid = $(".valid-feedback.namarequestTambah");

	let namarequestValue = namarequest.val();

	if (!namarequestValue) {
		inv0.hide();
		valid.hide();
		namarequest.removeClass("is-valid");
		namarequest.next(".valid-feedback").hide();
		namarequest.addClass("is-invalid");
		inv0.show();
		namarequest.focus();
		return false;
	} else {
		inv0.hide();
		valid.hide();
		namarequest.removeClass("is-invalid");
		namarequest.addClass("is-valid");
		valid.show();
		return true;
	}
}
function validatekodebudgetTambah() {
	const kodebudget = $("#kodebudgetTambah");
	const inv0 = $(".inv-kodebudgetTambah-0");
	const valid = $(".valid-feedback.kodebudgetTambah");

	let kodebudgetValue = kodebudget.val();

	if (!kodebudgetValue) {
		inv0.hide();
		valid.hide();
		kodebudget.removeClass("is-valid");
		kodebudget.next(".valid-feedback").hide();
		kodebudget.addClass("is-invalid");
		inv0.show();
		kodebudget.focus();
		return false;
	} else {
		inv0.hide();
		valid.hide();
		kodebudget.removeClass("is-invalid");
		kodebudget.addClass("is-valid");
		valid.show();
		return true;
	}
}

function validatespesifikasiTambah() {
	const spesifikasi = $("#spesifikasiTambah");
	const inv0 = $(".inv-spesifikasiTambah-0");
	const valid = $(".valid-feedback.spesifikasiTambah");

	let spesifikasiValue = spesifikasi.val();

	if (!spesifikasiValue) {
		inv0.hide();
		valid.hide();
		spesifikasi.removeClass("is-valid");
		spesifikasi.next(".valid-feedback").hide();
		spesifikasi.addClass("is-invalid");
		inv0.show();
		spesifikasi.focus();
		return false;
	} else {
		inv0.hide();
		valid.hide();
		spesifikasi.removeClass("is-invalid");
		spesifikasi.addClass("is-valid");
		valid.show();
		return true;
	}
}
function validateqtyTambah() {
	const qty = $("#qtyTambah");
	const inv0 = $(".inv-qtyTambah-0");
	const valid = $(".valid-feedback.qtyTambah");

	let qtyValue = qty.val();

	if (!qtyValue) {
		inv0.hide();
		valid.hide();
		qty.removeClass("is-valid");
		qty.next(".valid-feedback").hide();
		qty.addClass("is-invalid");
		inv0.show();
		qty.focus();
		return false;
	} else {
		inv0.hide();
		valid.hide();
		qty.removeClass("is-invalid");
		qty.addClass("is-valid");
		valid.show();
		return true;
	}
}



function validateqtyTambah() {
	const qty = $("#qtyTambah");
	const inv0 = $(".inv-qtyTambah-0");
	const valid = $(".valid-feedback.qtyTambah");

	let qtyValue = qty.val();

	if (!qtyValue) {
		inv0.hide();
		valid.hide();
		qty.removeClass("is-valid");
		qty.next(".valid-feedback").hide();
		qty.addClass("is-invalid");
		inv0.show();
		qty.focus();
		return false;
	} else {
		inv0.hide();
		valid.hide();
		qty.removeClass("is-invalid");
		qty.addClass("is-valid");
		valid.show();
		return true;
	}
}

function validateunitTambah() {
	const unit = $("#unitTambah");
	const inv0 = $(".inv-unitTambah-0");
	const valid = $(".valid-feedback.unitTambah");

	let unitValue = unit.val();

	if (!unitValue) {
		inv0.hide();
		valid.hide();
		unit.removeClass("is-valid");
		unit.next(".valid-feedback").hide();
		unit.addClass("is-invalid");
		inv0.show();
		unit.focus();
		return false;
	} else {
		inv0.hide();
		valid.hide();
		unit.removeClass("is-invalid");
		unit.addClass("is-valid");
		valid.show();
		return true;
	}
}

function validatekriteriaTambah() {
	const kriteria = $("#kriteriaTambah");
	const inv0 = $(".inv-kriteriaTambah-0");
	const valid = $(".valid-feedback.kriteriaTambah");

	let kriteriaValue = kriteria.val();

	if (!kriteriaValue) {
		inv0.hide();
		valid.hide();
		kriteria.removeClass("is-valid");
		kriteria.next(".valid-feedback").hide();
		kriteria.addClass("is-invalid");
		inv0.show();
		kriteria.focus();
		return false;
	} else {
		inv0.hide();
		valid.hide();
		kriteria.removeClass("is-invalid");
		kriteria.addClass("is-valid");
		valid.show();
		return true;
	}
}


function validatedeptTambah() {
	//console.log("Tes Dept");

	const dept = $("#deptTambah");
	const inv0 = $(".inv-deptTambah-0");
	const inv1 = $(".inv-deptTambah-1");
	const valid = $(".valid-feedback.deptTambah");

	let deptValue = dept.val();
	//console.log(deptValue);

	if (!deptValue) {
		inv0.hide();
		inv1.hide();
		valid.hide();
		dept.removeClass("is-valid");
		dept.next(".valid-feedback").hide();
		dept.addClass("is-invalid");
		inv0.show();
		dept.focus()
		return false;
	} else {
		inv0.hide();
		inv1.hide();
		valid.hide();
		dept.removeClass("is-invalid");
		dept.addClass("is-valid");
		valid.show();
		return true;
	}
}

function validatekodebudgetTambah() {
	const kodebudget = $("#kodebudgetTambah");
	const inv0 = $(".inv-kodebudgetTambah-0");
	const valid = $(".valid-feedback.kodebudgetTambah");

	let kodebudgetValue = kodebudget.val();

	if (!kodebudgetValue) {
		inv0.hide();
		valid.hide();
		kodebudget.removeClass("is-valid");
		kodebudget.next(".valid-feedback").hide();
		kodebudget.addClass("is-invalid");
		inv0.show();
		kodebudget.focus();
		return false;
	} else {
		inv0.hide();
		valid.hide();
		kodebudget.removeClass("is-invalid");
		kodebudget.addClass("is-valid");
		valid.show();
		return true;
	}
}

function validatestatusTambah() {
	const status = $("#statusTambah");
	const inv0 = $(".inv-statusTambah-0");
	const valid = $(".valid-feedback.statusTambah");

	let statusValue = status.val();

	if (!statusValue) {
		inv0.hide();
		valid.hide();
		status.removeClass("is-valid");
		status.next(".valid-feedback").hide();
		status.addClass("is-invalid");
		inv0.show();
		status.focus();
		return false;
	} else {
		inv0.hide();
		valid.hide();
		status.removeClass("is-invalid");
		status.addClass("is-valid");
		valid.show();
		return true;
	}
}


function validatekategoriTambah() {
	//console.log("Tes kategori");
	const kategori = $("#kategoriTambah");
	const inv0 = $(".inv-kategoriTambah-0");
	const valid = $(".valid-feedback.kategoriTambah");

	let kategoriValue = kategori.val();
	//console.log(kateGoriValue);

	if (!kategoriValue) {
		inv0.hide();
		valid.hide();
		kategori.removeClass("is-valid");
		kategori.next(".valid-feedback").hide();
		kategori.addClass("is-invalid");
		inv0.show();
		kategori.focus()
		return false;
	} else {
		inv0.hide();
		valid.hide();
		kategori.removeClass("is-invalid");
		kategori.next(".inv-kategori-0").hide();
		kategori.addClass("is-valid");
		valid.show();
		return true;
	}
}

function validatetoTambah() {
	//console.log("Tes to");
	const to = $("#toTambah");
	const inv0 = $(".inv-toTambah-0");
	const valid = $(".valid-feedback.toTambah");

	let toValue = to.val();
	//console.log(toValue);

	if (!toValue) {
		inv0.hide();
		valid.hide();
		to.removeClass("is-valid");
		to.next(".valid-feedback").hide();
		to.addClass("is-invalid");
		inv0.show();
		to.focus()
		return false;
	} else {
		inv0.hide();
		valid.hide();
		to.removeClass("is-invalid");
		to.next(".inv-to-0").hide();
		to.addClass("is-valid");
		valid.show();
		return true;
	}
}

const kategori = $("#kategoriTambah");
const detailkategori = $("#detailkategoriTambah");
const inv0 = $(".inv-detailkategoriTambah-0");
const valid = $(".valid-feedback.detailkategoriTambah");

kategori.change(function () {
	if (kategori.val() === 'URGENT') {
		$("#keteranganUrgent").show();
		detailkategori.attr('required', true);
		detailkategori.on('input', validatedetailkategoriTambah);
		detailkategori.focus();
	} else {
		$("#keteranganUrgent").hide();
		detailkategori.attr('required', false);
		detailkategori.off('input', validatedetailkategoriTambah);
	}
});



function validatedetailkategoriTambah() {
	if (detailkategori.val() === '') {
		inv0.show();
		valid.hide();
		detailkategori.removeClass("is-valid");
		detailkategori.addClass("is-invalid");
		detailkategori.focus();
		return true;
	} else {
		inv0.hide();
		valid.show();
		detailkategori.removeClass("is-invalid");
		detailkategori.addClass("is-valid");
		return true;
	}
}


// Add a submit event listener to the form

formTambah.submit(function (event) {
	event.preventDefault();
	if (validatetanggalpengajuanTambah() && validatenamabarangTambah() && validatespesifikasiTambah() && validateqtyTambah() && validateqtyTambah && validateunitTambah() && validatenamarequestTambah() && validatedeptTambah() && validatekriteriaTambah() && validatekodebudgetTambah() && validatestatusTambah() && validatekategoriTambah() && validatedetailkategoriTambah() && validatetoTambah()) {

		// Lakukan tindakan pengiriman data
		console.log("tes");

		let formData = {
			'tanggalpengajuanTambah': $('#tanggalpengajuanTambah').val() || ' ',
			'idnumberTambah': $('#idnumberTambah').val() || ' ',
			'namabarangTambah': $('#namabarangTambah').val() || ' ',
			'spesifikasiTambah': $('#spesifikasiTambah').val() || ' ',
			'qtyTambah': $('#qtyTambah').val() || ' ',
			'unitTambah': $('#unitTambah').val() || ' ',
			'namarequestTambah': $('#namarequestTambah').val() || ' ',
			'deptTambah': $('#deptTambah').val() || ' ',
			'kriteriaTambah': $('#kriteriaTambah').val() || ' ',
			'kodebudgetTambah': $('#kodebudgetTambah').val() || ' ',
			'statusTambah': $('#statusTambah').val() || ' ',
			'kategoriTambah': $('#kategoriTambah').val() || ' ',
			'detailkategoriTambah': $('#detailkategoriTambah').val() || ' ',
			'toTambah': $('#toTambah').val() || ' ',
			'statussc1Tambah': $('#statussc1Tambah').val() || ' ',
			'currencyTambah': $('#currencyTambah').val() || ' ',
			'priceTambah': $('#priceTambah').val() || ' ',
			'suplierTambah': $('#suplierTambah').val() || ' '
		};
		console.log(formData);

		$.ajax({
			type: 'POST',
			url: '/api/datageneralorder',
			contentType: 'application/json',
			data: JSON.stringify(formData),
			success: function (response) {
				console.log(response); // tambahkan baris ini untuk mencetak respons
				$('#formModal').modal('hide');

				refreshData()

			},
			error: function (response) {
				// Handle the error response.
				console.log(response);
			}
		});

	}
});


function showAlert() {
	$('#myModal').modal({
		backdrop: false,
		keyboard: true
	});
	setTimeout(function () {
		$('#myModal').modal('hide');
	}, 5000);

}


$(function () {
	// Set the format for date and time
	var format = 'MM/DD/YYYY';

	// Tanggal pengajuan tambah
	$('#tanggalpengajuanTambahDiv').datetimepicker({
		format: format,
		buttons: {
			showToday: true,
			showClear: true,
			showClose: true
		},
		icons: {
			time: 'fas fa-clock',
			date: 'fas fa-calendar-alt',
			up: 'fas fa-chevron-up',
			down: 'fas fa-chevron-down',
			previous: 'fas fa-chevron-left',
			next: 'fas fa-chevron-right',
			today: 'fas fa-calendar-day',
			clear: 'fas fa-trash',
			close: 'fas fa-times'
		},
		keepInvalid: true // Added option to keep invalid input

	});

	// When the DateTimePicker is closed, set the date and time value
	$('#tanggalpengajuanTambahDiv').on('change.datetimepicker', function (e) {
		var date = moment(e.date).format(format);
		$('input[name="tanggalpengajuanTambah"]').val(date);
	});

	// Disable input field on calendar icon click
	$('#tanggalpengajuanTambahDiv .input-group-append').on('click', function () {
		$('#tanggalpengajuanTambahDiv').datetimepicker('date', moment()); // Set to today's date
		$('input[name="tanggalpengajuanTambah"]').prop('readonly', true); // Disable input field
	});
});

function refreshData() {
	clearData();
	loadData();
}


function clearData() {
	//$('#example1').DataTable().clear().draw();
	$('#example1').DataTable().clear().destroy();
}

function loadData() {
	$('#example1').DataTable({
		"ajax": {
			"url": "/api/datageneralorder",
			"dataSrc": "",
			"error": function (xhr, error, thrown) {
				console.log(xhr);
				console.log(error);
				console.log(thrown);
			}
		},
		"columns": [
			{ "data": "id", "visible": false },
			{ "data": "tanggal_pengajuan", "visible": true },
			{ "data": "status_sc1" },
			{ "data": "id_number", "visible": false },
			{ "data": "nama_barang" },
			{ "data": "spesifikasi" },
			{ "data": "qty" },
			{ "data": "unit" },
			{ "data": "dept" },
			{ "data": "code_budget", "visible": false },
			{ "data": "status" },
			{ "data": "kategori" },
			{ "data": "detail_kategori" },
			{ "data": "to" },
			{ "data": "price", "visible": false },
			{ "data": "suplier", "visible": false },
			{ "data": "nama_request", "visible": false },
			{ "data": "kriteria", "visible": false },
			{
				"data": null,
				"render": function (data, type, row) {
					return '<td text-align: center;">' +
						'<button type="button" class="btn btn-success btn-detail" data-toggle="modal" data-id="' + row.id + '"><i class="fas fa-info-circle fa-xs"></i> Detail</button>' + '<button type="button" class="btn btn-warning btn-edit" data-toggle="modal" data-id="' + row.id + '"><i class="fas fa-edit fa-xs"></i> Edit</button>' +
						'<button type="button" class="btn btn-danger btn-delete" data-toggle="modal" data-id="' + row.id + '"><i class="fas fa-trash-alt fa-xs"></i> Delete</button>' +
						'</td>';
				}
			}
		],
		fixedColumns: {
			leftColumns: 13, // kolom ke-14 (STATUS SC1) akan menjadi tetap
			rightColumns: 0
		},
		scrollX: true,
		order: [
			[0, "desc"]
		],

		lengthMenu: [
			[5, 10, 25, 50, -1],
			[5, 10, 25, 50, "All"]
		],
		pageLength: 10,
		// "dom": 'Bfrtip',
		dom: "<'row'<'col-sm'l><'col-sm'B><'col-sm'f>>" +
			"<'row'<'col-sm-12'tr>>" +
			"<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
		buttons: [
			{
				extend: 'copy',
				text: '<i class="fas fa-copy"></i> &nbsp Copy',
				title: 'Data General Order',
				exportOptions: {
					columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
					customize: function (doc) {
						doc.pageOrientation = 'landscape';
					}
				},
				enabled: canViewPricing
			},
			{
				extend: 'excel',
				text: '<i class="fas fa-file-excel"></i>&nbsp Excel',
				title: 'Data General Order',
				exportOptions: {
					columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
					customize: function (doc) {
						doc.pageOrientation = 'landscape';
					}
				},

				enabled: canViewPricing
			},
			{
				extend: 'pdfHtml5',
				text: '<i class="fas fa-file-pdf"></i>&nbsp Pdf',
				title: 'Data General Order',
				exportOptions: {
					columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
					customize: function (doc) {
						doc.pageOrientation = 'landscape';
					}
				},
				enabled: canViewPricing
			}
		],
	});


	// Mendapatkan tombol Export Excel dan Export PDF
	const exportExcelButton = document.querySelector('button.buttons-excel');
	const exportPdfButton = document.querySelector('button.buttons-pdf');
	const exportCopyButton = document.querySelector('button.buttons-copy');

	// Jika user tidak punya izin WH_VIEW_PRICING, tombol export disembunyikan
	if (!canViewPricing) {
		exportExcelButton.style.display = 'none';
		exportPdfButton.style.display = 'none';
		exportCopyButton.style.display = 'none';
	}

}



// get currency select element
var currencySelect = document.getElementById('currencyTambah');

// get currency symbol element
var currencySymbol = document.getElementById("pricespanTambah");

// add event listener to currency select
currencySelect.addEventListener('change', function () {
	// change currency symbol text to selected value
	currencySymbol.innerText = currencySelect.value;

});

$('#formModal').on('shown.bs.modal', function () {
	/*
	   const namaLengkap = document.getElementById('namalengkap').value;
	   const userName = document.getElementById("username").value;
	   const levelUser = document.querySelector('#leveluser').value.trim();
   	
	   console.log(levelUser); 
   */

	if (canViewPricing) {
		// Aktifkan kolom harga
		$("#statussc1Tambah").prop("disabled", false);
		$("#currencyTambah").prop("disabled", false);
		$("#priceTambah").prop("disabled", false);
	} else {
		$("#statussc1Tambah").prop("disabled", true);
		$("#currencyTambah").prop("disabled", true);
		$("#priceTambah").prop("disabled", true);
	}


})

$('#formModalEdit').on('shown.bs.modal', function () {

	const namaLengkap = document.getElementById('namalengkap').value;
	const userName = document.getElementById("username").value;
	const levelUser = document.querySelector('#leveluser').value.trim();

	if (canViewPricing) {
		$("#statussc1Edit").prop("disabled", false);
		$("#nopoEdit").prop("disabled", false);
		$("#currencyEdit").prop("disabled", false);
		$("#priceEdit").prop("disabled", false);

	} else {
		$("#statussc1Edit").prop("disabled", true);
		$("#nopoEdit").prop("disabled", true);
		$("#currencyEdit").prop("disabled", true);
		$("#priceEdit").prop("disabled", true);

	}

	if ($('#kategoriEdit').val() == 'URGENT') {
		$('#detailkategoriEdit').show();
	} else {
		$('#detailkategoriEdit').hide();
	}

})

function changeCurrencySymbol(newSymbol) {
	var currencySymbol = document.getElementById("currency-symbol-edit");
	currencySymbol.innerHTML = newSymbol;
}


// get currency select element
let currencyeditSelect = document.getElementById('currencyEdit');

// get currency symbol element
let currencyeditSymbol = document.getElementById("currency-symbol-edit");

// add event listener to currency select
currencyeditSelect.addEventListener('change', function () {
	// change currency symbol text to selected value
	currencyeditSymbol.innerText = currencyeditSelect.value;

});

$(document).ready(function () {
	// Function to reload the page after a certain delay
	function reloadPage() {
		setTimeout(function () {
			window.location.reload();
		}, 2000); // Reload after 5 seconds
	}

	// Listen for window errors
	window.addEventListener('error', function (event) {
		var errorMessage = event.error.message;
		if (errorMessage && errorMessage.includes('CONTENT_LENGTH_MISMATCH')) {
			// Call the reloadPage function if error message contains the keyword
			reloadPage();
		}
	});


	loadData();

	// Plugin select2 untuk dropdown pada form tambah data
	$('.select2bs4').select2({
		dropdownParent: $('#formModal') // Menyesuaikan dengan id modal Anda
	});

	// Plugin select2 untuk dropdown pada form edit data
	$('.select2bs4-edit').select2({
		dropdownParent: $('#formModalEdit') // Menyesuaikan dengan id modal Anda
	});



	/*	$('#kategoriEdit').on('change', function() {
			if ($(this).val() == 'URGENT') {
			  $('#keteranganUrgentEdit').show();
			} else {
			  $('#keteranganUrgentEdit').hide();
			}
		  });
	*/
	$('#btnRefresh').on('click', function () {
		clearData();
		loadData();
	});

	idnumberTambah.on('keyup', function () {
		let currentValue = $(this).val();
		$(this).val(currentValue.toUpperCase());
	});
	namabarangTambah.on('keyup', function () {
		let currentValue = $(this).val();
		$(this).val(currentValue.toUpperCase());
	});
	spesifikasiTambah.on('keyup', function () {
		let currentValue = $(this).val();
		$(this).val(currentValue.toUpperCase());
	});
	qtyTambah.on('keyup', function () {
		let currentValue = $(this).val();
		$(this).val(currentValue.toUpperCase());
	});
	unitTambah.on('keyup', function () {
		let currentValue = $(this).val();
		$(this).val(currentValue.toUpperCase());
	});
	namarequestTambah.on('keyup', function () {
		let currentValue = $(this).val();
		$(this).val(currentValue.toUpperCase());
	});

	kodebudgetTambah.on('keyup', function () {
		let currentValue = $(this).val();
		$(this).val(currentValue.toUpperCase());
	});
	detailkategoriTambah.on('keyup', function () {
		let currentValue = $(this).val();
		$(this).val(currentValue.toUpperCase());
	});
	priceTambah.on('keyup', function () {
		let currentValue = $(this).val();
		$(this).val(currentValue.toUpperCase());
	});
	suplierTambah.on('keyup', function () {
		let currentValue = $(this).val();
		$(this).val(currentValue.toUpperCase());
	});

});

// AKSES EDIT

$(document).on('click', '.btn-edit', function () {
	let idPrimarykey = $(this).data('id');
	$('#idEdit').val(idPrimarykey); // menyimpan nilai Id pada elemen form yang tersembunyi


	// Mendapatkan data original dan menyimpannya di dalam elemen tersembunyi
	$.get('/api/datageneralorder/' + idPrimarykey, function (data) {
		$('#tanggalpengajuanEdit').val(data.tanggal_pengajuan);
		$('#idnumberEdit').val(data.id_number);
		$('#namabarangEdit').val(data.nama_barang);
		$('#spesifikasiEdit ').val(data.spesifikasi);
		$('#qtyEdit').val(data.qty);
		$('#unitEdit').val(data.unit);
		$('#namarequestEdit').val(data.nama_request);
		$('#deptEdit').val(data.dept);
		$('#kriteriaEdit').val(data.kriteria);
		$('#kodebudgetEdit').val(data.code_budget);
		$('#statusEdit').val(data.status);
		$('#kategoriEdit').val(data.kategori);
		$('#detailkategoriEdit').val(data.detail_kategori);
		$('#toEdit').val(data.to);
		$('#statussc1Edit').val(data.status_sc1);
		$('#nopoEdit').val(data.no_po);
		$('#currencyEdit').val(data.currency);
		changeCurrencySymbol(data.currency);
		$('#priceEdit').val(data.price);
		$('#suplierEdit').val(data.suplier);

		// Simpan data original di dalam elemen tersembunyi
		$('#originalData').val(JSON.stringify(data));

		// show the modal form
		$('#formModalEdit').modal('show');

		// Set input tanggal pengajuan menjadi hanya baca saja
		$('input[name="tanggalpengajuanEdit"]').prop('readonly', true).attr('disabled', true);
	});

	$('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
});


let formEdit = $('#form-Edit-data');

// Get the inputs.
let tanggalpengajuanEdit = formEdit.find('#tanggalpengajuanEdit');
let idnumberEdit = formEdit.find('#idnumberEdit');
let namabarangEdit = formEdit.find('#namabarangEdit');
let spesifikasiEdit = formEdit.find('#spesifikasiEdit');
let qtyEdit = formEdit.find('#qtyEdit');
let unitEdit = formEdit.find('#unitEdit');
let namarequestEdit = formEdit.find('#namarequestEdit');
let deptEdit = formEdit.find('#deptEdit');
let kriteriaEdit = formEdit.find('#kriteriaEdit');
let kodebudgetEdit = formEdit.find('#kodebudgetEdit');
let statusEdit = formEdit.find('#statusEdit');
let kategoriEdit = formEdit.find('#kategoriEdit');
let detailkategoriEdit = formEdit.find('#detailkategoriEdit');
let toEdit = formEdit.find('#toEdit');
let statussc1Edit = formEdit.find('#statussc1Edit');
let nopoEdit = formEdit.find('#nopoEdit');
let currencyEdit = formEdit.find('#currencyEdit');
let priceEdit = formEdit.find('#priceEdit');
let suplierEdit = formEdit.find('#suplierEdit');


// Ketika tombol "Simpan Perubahan" ditekan
formEdit.submit(function (event) {
	event.preventDefault();

	// Ambil nilai level user
	let levelUser = $("#leveluser").val();

	if (canViewPricing) {

		// Mengambil nilai dari elemen input
		const namaLengkap = document.getElementById('namalengkap').value;
		const userName = document.getElementById("username").value;
		const levelUser = document.querySelector('#leveluser').value;

		// Get the form data.
		let formData = {
			'tanggal_pengajuan': tanggalpengajuanEdit.val() || '',
			'id_number': idnumberEdit.val() || '',
			'nama_barang': namabarangEdit.val() || '',
			'spesifikasi': spesifikasiEdit.val() || '',
			'qty': qtyEdit.val() || '',
			'unit': unitEdit.val() || '',
			'nama_request': namarequestEdit.val() || '',
			'dept': deptEdit.val() || '',
			'kriteria': kriteriaEdit.val() || '',
			'code_budget': kodebudgetEdit.val() || '',
			'status': statusEdit.val() || '',
			'kategori': kategoriEdit.val() || '',
			'detail_kategori': detailkategoriEdit.val() || '',
			'to': toEdit.val() || '',
			'status_sc1': statussc1Edit.val() || '',
			'no_po': nopoEdit.val() || '',
			'currency': currencyEdit.val() || '',
			'price': priceEdit.val() || '',
			'suplier': suplierEdit.val() || '',
		};


		// Mendapatkan data original dari elemen tersembunyi
		let originalData = JSON.parse($('#originalData').val());

		// console.log(originalData);
		// console.log(formData);

		let isFormDataEqual = true;

		Object.keys(formData).forEach(function (key) {
			if (formData[key] !== originalData[key]) {
				isFormDataEqual = false;
				console.log("Properti " + key + " tidak sama.");
			}
		});

		if (isFormDataEqual) {
			// console.log("Form data sama dengan original data");

			let successMessage = "Tidak ada perubahan yang dilakukan!";
			let modal = document.getElementById("myModal");
			let modalBody = modal.querySelector(".modal-content .alert");
			let alert = modal.querySelector(".alert");

			// ubah pesan pada modal
			modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${successMessage}`;


			alert.classList.add("alert-warning");

			showAlert();

			return;
		} else {

			let id = $('#idEdit').val();
			console.log(id);
			$.ajax({
				url: '/api/datageneralorder/' + id,
				method: 'PUT',
				contentType: 'application/json',
				data: JSON.stringify(formData),
				success: function (response) {
					console.log(response);
					// hapus sisa validasi valid sebelumnya
					$('.is-valid').removeClass("is-valid");

					// Tutup modal form
					$('#formModalEdit').modal('hide');

					// Refresh data
					refreshData()

					let successMessage = "Dokumen berhasil diperbarui !";
					let modal = document.getElementById("myModal");
					let modalBody = modal.querySelector(".modal-content .alert");
					let alert = modal.querySelector(".alert");

					// ubah pesan pada modal
					modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${successMessage}`;

					// tambah class yang sesuai dengan jenis pesan
					alert.classList.add("alert-success");
					showAlert();

					// Reset input values in the form
					tanggalpengajuanEdit.val('');
					idnumberEdit.val('');
					namabarangEdit.val('');
					spesifikasiEdit.val('');
					qtyEdit.val('');
					unitEdit.val('');
					deptEdit.val('');
					kodebudgetEdit.val('');
					statusEdit.val('');
					kategoriEdit.val('');
					detailkategoriEdit.val('');
					toEdit.val('');
					statussc1Edit.val('');
					nopoEdit.val('');
					currencyEdit.val('');
					priceEdit.val('');
					suplierEdit.val('');

				},
				error: function (error) {
					// Tampilkan pesan gagal
					alert(error.responseJSON.status + '\n' + error.responseJSON.error);
				}
			});

		}

	} else {
		// Tampilkan modal "Denied" 
		document.getElementById("deniedModalLabel").innerHTML = "Edit Data";
		$('#deniedModal .modal-body').html('User anda tidak diizinkan untuk melakukan edit data');
		$('#deniedModal').modal('show');
	}


});

// Fungsi untuk menghapus data
function deleteData(nomorId) {
	// Tampilkan modal "Delete" dan nomor dokumen yang akan dihapus
	$('#deleteModal .modal-body').html('Apakah Anda yakin ingin menghapus data ini?<br><br><b>Mohon cek kembali sebelum melanjutkan !</b>');
	// Tampilkan modal "Delete"
	$('#deleteModal').modal('show');

	// Ketika tombol "Hapus" diklik pada modal "Delete"
	$('.btn-confirm-delete').on('click', function () {
		// Kirim permintaan DELETE ke API
		$.ajax({
			type: 'DELETE',
			url: '/api/datageneralorder/' + nomorId,
			success: function (response) {
				// Tampilkan pesan sukses di console log
				//console.log(response.status);
				// Refresh halaman
				clearData();
				loadData();
				$("#deleteModal").modal("hide");

				let successMessage = "Laporan dengan Nomor Asset = " + nomorAsset + " berhasil dihapus !";
				let modal = document.getElementById("myModal");
				let modalBody = modal.querySelector(".modal-content .alert");
				let alert = modal.querySelector(".alert");

				// ubah pesan pada modal
				modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${successMessage}`;

				// tambah class yang sesuai dengan jenis pesan
				alert.classList.add("alert-danger");
				// atur warna latar belakang sesuai dengan jenis pesan
				// alert.style.backgroundColor = "#d4edda"; // warna hijau yang sama dengan .alert-success di Bootstrap

				showAlert();
			},
			error: function (error) {
				// Tampilkan pesan gagal di console log
				console.log(error.responseJSON.status);
			}
		});
	});
}



$(document).on('click', '.btn-delete', function () {
	//console.log('Tombol Delete diklik');
	const levelUser = document.querySelector('#leveluser').value;
	let nomorId = $(this).data('id');

	// Panggil fungsi untuk menghapus data
	if ((levelUser == '1' || levelUser == '3')) {
		deleteData(nomorId);
	} else {
		// Tampilkan modal "Denied Delete" 
		document.getElementById("deniedModalLabel").innerHTML = "Hapus Data";
		$('#deniedModal .modal-body').html('User anda tidak diizinkan untuk menghapus data ini');
		$('#deniedModal').modal('show');
	}

});
function getGeneralOrderData(id) {
	$.ajax({
		type: "GET",
		url: "/api/datageneralorder/" + id,
		success: function (response) {
			// Populate the table cells with the received values
			$("#detail_tanggalpengajuan").text(response.tanggal_pengajuan);
			$("#detail_idnumber").text(response.id_number);
			$("#detail_namabarang").text(response.nama_barang);
			$("#detail_spesifikasi").text(response.spesifikasi);
			$("#detail_qty").text(response.qty);
			$("#detail_unit").text(response.unit);
			$("#detail_namarequest").text(response.nama_request);
			$("#detail_dept").text(response.dept);
			$("#detail_kriteria").text(response.kriteria);
			$("#detail_kodebudget").text(response.code_budget);
			$("#detail_status").text(response.status);
			$("#detail_kategori").text(response.kategori);
			$("#detail_to").text(response.to);
			$("#detail_statussc1").text(response.status_sc1);
			$("#detail_nopo").text(response.no_po);
			$("#detail_currency").text(response.currency);
			$("#detail_price").text(response.price);
			$("#detail_suplier").text(response.suplier);

			$('#detailTable').modal('show');
		},
		error: function (xhr) {
			console.log(xhr.responseText);
		}
	});
}
$(document).on('click', '.btn-detail', function () {
	//console.log('Tombol Delete diklik');
	const levelUser = document.querySelector('#leveluser').value;
	let nomorId = $(this).data('id');

	getGeneralOrderData(nomorId);

}); 