


$(function () {
	// Set the format for date and time
	var format = 'MM/DD/YYYY HH:mm:ss';

	// Tanggal Pinjam tambah
	$('#tanggalpinjamTambahDiv').datetimepicker({
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
	$('#tanggalpinjamTambahDiv').on('change.datetimepicker', function (e) {
		var date = moment(e.date).format(format);
		$('input[name="tanggalpinjamTambah"]').val(date);
	});

	// Disable input field on calendar icon click
	$('#tanggalpinjamTambahDiv .input-group-append').on('click', function () {
		$('#tanggalpinjamTambahDiv').datetimepicker('date', moment()); // Set to today's date
		$('input[name="tanggalpinjamTambahDiv"]').prop('readonly', true); // Disable input field
	});

	// Tanggal Kembali tambah
	$('#tanggalkembaliTambahDiv').datetimepicker({
		format: format,
		useCurrent: true,
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
	});

	// Event listener ketika tanggal berubah
	$('#tanggalkembaliTambahDiv').on('change.datetimepicker', function (e) {
		var date = moment(e.date).format(format);
		$('input[name="tanggalkembaliTambah"]').val(date);
	});


	// Tanggal Pinjam edit disable
	$('#tanggalpinjamEditDiv').datetimepicker({
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


	// Disable input field on calendar icon click tanggap pinjamEdit
	$('#tanggalpinjamEditDiv .input-group-append').on('click', function () {
		$('input[name="tanggalpinjamEditDiv"]').prop('readonly', true); // Disable input field
	});

	// Tanggal Kembali tambah
	$('#tanggalkembaliEditDiv').datetimepicker({
		format: format,
		useCurrent: true,
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
	});

	// Event listener ketika tanggal berubah
	$('#tanggalkembaliEditDiv').on('change.datetimepicker', function (e) {
		var date = moment(e.date).format(format);
		$('input[name="tanggalkembaliEdit"]').val(date);
	});
});


function refreshData() {
	clearData();
	loadData();
}

// RBAC: baca permissions dari context processor
const _permEl = document.getElementById('user-permissions-data');
const userPermissions = _permEl ? JSON.parse(_permEl.textContent) : [];
const _lvUser = document.querySelector('#leveluser') ? document.querySelector('#leveluser').value : '0';
const canManageIT = userPermissions.includes('IT_MANAGE') || _lvUser == '1';

function showAlert() {
	$('#myModal').modal({
		backdrop: false,
		keyboard: true
	});
	setTimeout(function () {
		$('#myModal').modal('hide');
	}, 5000);

}


// Get the form tambah data.
let formTambah = $('#form-tambah-data');

// Get the inputs.
let namapeminjamTambah = formTambah.find('#namapeminjamTambah');
let deptTambah = formTambah.find('#deptTambah');
let tanggalpinjamTambah = formTambah.find('#tanggalpinjamTambah');
let barangyangdipinjamTambah = formTambah.find('#barangyangdipinjamTambah');
let dipinjamkanolehTambah = formTambah.find('#dipinjamkanolehTambah');
let tanggalkembaliTambah = formTambah.find('#tanggalkembaliTambah');
let barangyangkembaliTambah = formTambah.find('#barangyangkembaliTambah');
let dikembalikankeTambah = formTambah.find('#dikembalikankeTambah');
let statusTambah = formTambah.find('#statusTambah');
let keteranganTambah = formTambah.find('#keteranganTambah');

// Add event listeners. 
namapeminjamTambah.on('input', validatenamapeminjamTambah);
deptTambah.on('input', validatedeptTambah);
tanggalpinjamTambah.on('input', validatetanggalpinjamTambah);
barangyangdipinjamTambah.on('input', validatebarangyangdipinjamTambah);
dipinjamkanolehTambah.on('input', validatedipinjamkanolehTambah);
tanggalkembaliTambah.on('input', validatetanggalkembaliTambah);

function validatenamapeminjamTambah() {

	const namapeminjam = $("#namapeminjamTambah");
	const inv0 = $(".inv-namapeminjamTambah-0");
	const valid = $(".valid-feedback.namapeminjamTambah");

	let namapeminjamValue = namapeminjam.val().trim();


	if (!namapeminjamValue) {
		inv0.hide();
		valid.hide();
		namapeminjam.removeClass("is-valid");
		namapeminjam.next(".valid-feedback").hide();
		namapeminjam.addClass("is-invalid");
		inv0.show();
		namapeminjam.focus();
		return false;
	} else {
		inv0.hide();
		valid.hide();
		namapeminjam.removeClass("is-invalid");
		namapeminjam.addClass("is-valid");
		valid.show();
		return true;
	}
}

function validatetanggalpinjamTambah() {

	const tanggalpinjam = $("#tanggalpinjamTambah");
	const inv0 = $(".inv-tanggalpinjamTambah-0");
	const inv1 = $(".inv-tanggalpinjamTambah-1");
	const valid = $(".valid-feedback.tanggalpinjamTambah");

	let tanggalpinjamValue = tanggalpinjam.val();

	// regex untuk format MM/DD/YYYY HH:mm:ss
	let regex = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/;

	if (!tanggalpinjamValue) {
		inv0.hide();
		inv1.hide();
		valid.hide();
		tanggalpinjam.removeClass("is-valid");
		tanggalpinjam.next(".valid-feedback").hide();
		tanggalpinjam.addClass("is-invalid");
		inv0.show();
		tanggalpinjam.focus();
		return false;
	} else if (!regex.test(tanggalpinjamValue)) {
		inv0.hide();
		inv1.hide();
		valid.hide();
		tanggalpinjam.removeClass("is-valid");
		tanggalpinjam.next(".valid-feedback").hide();
		tanggalpinjam.addClass("is-invalid");
		inv1.show();
		tanggalpinjam.focus();
		return false;
	} else {
		inv0.hide();
		inv1.hide();
		valid.hide();
		tanggalpinjam.removeClass("is-invalid");
		tanggalpinjam.addClass("is-valid");
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

	let deptValue = dept.val().trim().toUpperCase();
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
	} else if (deptValue.length > 5) {
		inv0.hide();
		inv1.hide();
		valid.hide();
		dept.removeClass("is-valid");
		dept.next(".valid-feedback.dept").hide();
		dept.addClass("is-invalid");
		inv1.show();
		dept.focus();
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

function validatebarangyangdipinjamTambah() {

	const barangyangdipinjam = $("#barangyangdipinjamTambah");
	const inv0 = $(".inv-barangyangdipinjamTambah-0");
	const valid = $(".valid-feedback.barangyangdipinjamTambah");

	let barangyangdipinjamValue = barangyangdipinjam.val().trim();


	if (!barangyangdipinjamValue) {
		inv0.hide();
		valid.hide();
		barangyangdipinjam.removeClass("is-valid");
		barangyangdipinjam.next(".valid-feedback").hide();
		barangyangdipinjam.addClass("is-invalid");
		inv0.show();
		barangyangdipinjam.focus();
		return false;
	} else {
		inv0.hide();
		valid.hide();
		barangyangdipinjam.removeClass("is-invalid");
		barangyangdipinjam.addClass("is-valid");
		valid.show();
		return true;
	}
}

function validatedipinjamkanolehTambah() {
	//console.log("Tes kategori");
	const dipinjamkanoleh = $("#dipinjamkanolehTambah");
	const inv0 = $(".inv-dipinjamkanolehTambah-0");
	const valid = $(".valid-feedback.dipinjamkanolehTambah");

	let dipinjamkanolehValue = dipinjamkanoleh.val();
	//console.log(kateGoriValue);

	if (!dipinjamkanolehValue) {
		inv0.hide();
		valid.hide();
		dipinjamkanoleh.removeClass("is-valid");
		dipinjamkanoleh.next(".valid-feedback").hide();
		dipinjamkanoleh.addClass("is-invalid");
		inv0.show();
		dipinjamkanoleh.focus()
		return false;
	} else {
		inv0.hide();
		valid.hide();
		dipinjamkanoleh.removeClass("is-invalid");
		dipinjamkanoleh.next(".inv-kategori-0").hide();
		dipinjamkanoleh.addClass("is-valid");
		valid.show();
		return true;
	}
}

function validatetanggalkembaliTambah() {

	const tanggalkembali = $("#tanggalkembaliTambah");
	const inv0 = $(".inv-tanggalkembaliTambah-0");
	const inv1 = $(".inv-tanggalkembaliTambah-1");
	const valid = $(".valid-feedback.tanggalkembaliTambah");

	let tanggalkembaliValue = tanggalkembali.val();

	// regex untuk format MM/DD/YYYY HH:mm:ss
	let regex = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/;

	if (!tanggalkembaliValue) {
		inv0.hide();
		inv1.hide();
		valid.hide();
		tanggalkembali.removeClass("is-valid");
		tanggalkembali.next(".valid-feedback").hide();
		tanggalkembali.addClass("is-invalid");
		inv0.show();
		tanggalkembali.focus();
		return false;
	} else if (!regex.test(tanggalkembaliValue)) {
		inv0.hide();
		inv1.hide();
		valid.hide();
		tanggalkembali.removeClass("is-valid");
		tanggalkembali.next(".valid-feedback").hide();
		tanggalkembali.addClass("is-invalid");
		inv1.show();
		tanggalkembali.focus();
		return false;
	} else {
		inv0.hide();
		inv1.hide();
		valid.hide();
		tanggalkembali.removeClass("is-invalid");
		tanggalkembali.addClass("is-valid");
		valid.show();
		return true;
	}
}
// Add event listener ketika tombol submite disimpan 

formTambah.submit(function (event) {

	event.preventDefault(); // Prevent the default form submission.
	// console.log("SUBMITE DITEKAN")
	// Mengambil nilai dari elemen input
	const namaLengkap = document.getElementById('namalengkap').value;
	const userName = document.getElementById("username").value;
	const levelUser = document.querySelector('#leveluser').value;

	// Validate the inputs.
	if (validatenamapeminjamTambah() && validatedeptTambah() && validatetanggalpinjamTambah() && validatebarangyangdipinjamTambah() && validatedipinjamkanolehTambah()) {
		// Get the form data.
		let formData = {
			'namaPeminjam': namapeminjamTambah.val() || ' ', // check if the value is empty or null, replace with a space if true
			'dept': deptTambah.val() || ' ',
			'tanggalPinjam': tanggalpinjamTambah.val() || ' ',
			'barangyangDipinjam': barangyangdipinjamTambah.val() || ' ',
			'tanggalKembali': tanggalkembaliTambah.val() || ' ',
			'barangyangKembali': barangyangkembaliTambah.val() || ' ',
			'dipinjamkanOleh': dipinjamkanolehTambah.val() || ' ',
			'dikembalikanKe': dikembalikankeTambah.val() || ' ',
			'status': statusTambah.val() || ' ',
			'keterangan': keteranganTambah.val() || ' ',
		};


		// Send the data to the server.
		$.ajax({
			type: 'POST',
			url: '/api/datapeminjam',
			contentType: 'application/json',
			data: JSON.stringify(formData),
			success: function (response) {

				$('#formModal').modal('hide');

				refreshData()

				let successMessage = "Data berhasil dibuat!";
				let modal = document.getElementById("myModal");
				let modalBody = modal.querySelector(".modal-content .alert");
				let alert = modal.querySelector(".alert");

				// ubah pesan pada modal
				modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${successMessage}`;

				// tambah class yang sesuai dengan jenis pesan
				alert.classList.add("alert-success");
				// atur warna latar belakang sesuai dengan jenis pesan
				// alert.style.backgroundColor = "#d4edda"; // warna hijau yang sama dengan .alert-success di Bootstrap

				showAlert();

				// hapus sisa validasi valid dan invalid sebelumnya
				$('.is-valid, .is-invalid').removeClass('is-valid is-invalid');

				// Reset input values in the form
				namapeminjamTambah.val('');
				deptTambah.val('');
				tanggalpinjamTambah.val('');
				barangyangdipinjamTambah.val('');
				tanggalkembaliTambah.val('');
				barangyangkembaliTambah.val('');
				dipinjamkanolehTambah.val('');
				dikembalikankeTambah.val('');
				statusTambah.val('');
				keteranganTambah.val('');

				let formData = {
					'namaPeminjam': namapeminjamTambah.val() || ' ',
					'dept': deptTambah.val() || ' ',
					'tanggal_pinjam': tanggalpinjamTambah.val() || ' ',
					'barang_yang_dipinjam': barangyangdipinjamTambah.val() || ' ',
					'tanggal_kembali': tanggalkembaliTambah.val() || ' ',
					'barang_yang_kembali': barangyangkembaliTambah.val() || ' ',
					'dipinjamkan_oleh': dipinjamkanolehTambah.val() || ' ',
					'dikembalikan_ke': dikembalikankeTambah.val() || ' ',
					'status': statusTambah.val() || ' ',
					'keterangan': keteranganTambah.val() || ' ',
				};

			},
			error: function (response) {
				// Handle the error response.
				console.log(response);
			}
		});

	}
});

function clearData() {
	//$('#example1').DataTable().clear().draw();
	$('#example1').DataTable().clear().destroy();
}

function loadData() {
	$("#example1").DataTable({
		"ajax": {
			"url": "/api/datapeminjam",
			"dataSrc": "",
			"error": function (xhr, error, thrown) {
				console.log(xhr);
				console.log(error);
				console.log(thrown);
			}
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
			{ "data": "namaPeminjam" },
			{ "data": "dept" },
			{ "data": "tanggalPinjam" },
			{ "data": "barangyangDipinjam" },
			{ "data": "dipinjamkanOleh" },
			{ "data": "tanggalKembali" },
			{ "data": "barangyangKembali" },
			{ "data": "dikembalikanKe" },
			{ "data": "status" },
			{ "data": "keterangan" },
			{
				"data": null,
				"render": function (data, type, row) {
					return '<td text-align: center;">' +
						'<button type="button" class="btn btn-warning btn-edit" data-toggle="modal" data-id="' + row.id + '"><i class="fas fa-edit fa-xs"></i></button>' +
						'<button type="button" class="btn btn-danger btn-delete" data-toggle="modal" data-id="' +
						row.id + '"><i class="fas fa-trash-alt fa-xs"></i></button>' +
						'</td>';
				}
			}
		],
		scrollX: true,
		order: [
			[1, "desc"]
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
		buttons: [{
			extend: 'copy',
			text: '<i class="fas fa-copy"></i> &nbsp Copy',
			title: 'General Order',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14], // export only these columns
				customize: function (doc) {
					doc.pageOrientation = 'landscape';
				}
			}
		}, {
			extend: 'csv',
			text: '<i class="fas fa-file-csv"></i>&nbsp CSV',
			title: 'General Order',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14], // export only these columns
				customize: function (doc) {
					doc.pageOrientation = 'landscape';
				}
			}
		}, {
			extend: 'excel',
			text: '<i class="fas fa-file-excel"></i>&nbsp Excel',
			title: 'General Order',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14], // export only these columns
				customize: function (doc) {
					doc.pageOrientation = 'landscape';
				}
			}
		}, {
			extend: 'pdfHtml5',
			text: '<i class="fas fa-file-pdf"></i>&nbsp Pdf',
			title: 'General Order',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14], // export only these columns
				customize: function (doc) {
					doc.pageOrientation = 'landscape';
				}
			}
		}, {
			extend: 'print',
			text: '<i class="fas fa-print"></i>&nbsp Print',
			title: 'General Order',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14], // export only these columns
				customize: function (doc) {
					doc.pageOrientation = 'landscape';
				}
			}
		}],

		//"responsive": true,
		"rowCallback": function (row, data, index) {
			if (data.status == "Masih Dipinjam") {
				$(row).css('background-color', '#dd9295');
			}
		},
		"initComplete": function (settings, json) {
			// Hitung jumlah row dengan status "Pending"
			//let countPending = 0;
			let countMasihDipinjam = 0;

			this.api().rows().every(function () {
				let data = this.data();
				if (data.status === 'Masih Dipinjam') {
					countMasihDipinjam++;
				}
			});

			// Hide the btnDikerjakan if count is zero
			if (countMasihDipinjam === 0) {
				$('#btnMasihDipinjam').hide();
			} else {
				$('#btnMasihDipinjam').show();
				$('#btnMasihDipinjam').html('MASIH DIPINJAM ' + countMasihDipinjam + '');
			}
		}
	});

}


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

	$('#btnRefresh').on('click', function () {
		clearData();
		loadData();

	});

	//Hapus jika ada validasi form tambah data modal yang tersisa dari sebelumnya
	$('#formModal').on('show.bs.modal', function () {
		const levelUser = document.querySelector('#leveluser').value;
		let nomorId = $(this).data('id');
		let nomorAsset = $(this).data('nomor_asset');
		let loginNama = $(this).data('login_nama');

		// console.log(nomorId);
		// Panggil fungsi untuk menghapus data
		if (canManageIT) {
			tanggalkembaliTambah.prop('disabled', false);
			barangyangkembaliTambah.prop('disabled', false);
			dikembalikankeTambah.prop('disabled', false);
			statusTambah.prop('disabled', false);
			keteranganTambah.prop('disabled', false);

		} else {
			tanggalkembaliTambah.prop('disabled', true);
			barangyangkembaliTambah.prop('disabled', true);
			dikembalikankeTambah.prop('disabled', true);
			statusTambah.prop('disabled', true);
			keteranganTambah.prop('disabled', true);


		}


		$('.form-control').removeClass('is-valid');
	});


	$('#formModalEdit').on('show.bs.modal', function () {
		//console.log('Form modal edit muncul');
		// hapus sisa validasi valid dan invalid sebelumnya
		$('.is-valid, .is-invalid').removeClass('is-valid is-invalid');

	});



	// Add event listener to capitalize input on keyup.
	deptTambah.on('keyup', function () {
		let currentValue = $(this).val();
		$(this).val(currentValue.toUpperCase());
	});


	function capitalizeWords(string) {
		return string.replace(/\b\w/g, l => l.toUpperCase());
	}

	namapeminjamTambah.on('keyup', function () {
		let currentValue = $(this).val();
		$(this).val(capitalizeWords(currentValue));
	});

});




/* PEMBUKA CONTROL FORM EDIT */

$(document).on('click', '.btn-edit', function () {
	//console.log('Tombol Edit di klik');

	let idPrimarykey = $(this).data('id');
	$('#idEdit').val(idPrimarykey); // menyimpan nilai Id pada elemen form yang tersembunyi

	// Mendapatkan data original dan menyimpannya di dalam elemen tersembunyi
	$.get('/api/datapeminjam/' + idPrimarykey, function (data) {
		$('#namapeminjamEdit').val(data.namaPeminjam);
		$('#deptEdit').val(data.dept.trim());
		$('#tanggalpinjamEdit').val(data.tanggalPinjam);
		$('#barangyangdipinjamEdit').val(data.barangyangDipinjam);
		$('#dipinjamkanolehEdit').val(data.dipinjamkanOleh.trim());
		$('#tanggalkembaliEdit').val(data.tanggalKembali);
		$('#barangyangkembaliEdit').val(data.barangyangKembali);
		$('#dikembalikankeEdit').val(data.dikembalikanKe);
		$('#statusEdit').val(data.status);
		$('#keteranganEdit').val(data.keterangan);

		// Simpan data original di dalam elemen tersembunyi
		$('#originalData').val(JSON.stringify(data));

		// show the modal form
		$('#editModal').modal('show');

		// Set input tanggal pengajuan menjadi hanya baca saja
		$('input[name="tanggalpinjamEdit"]').prop('readonly', true).attr('disabled', true);
	});

	// hapus sisa validasi valid dan invalid sebelumnya
	$('.is-valid, .is-invalid').removeClass('is-valid is-invalid');

});


let formEdit = $('#form-Edit-data');

// Get the inputs.
let originalData = formEdit.find('#originalData');
let idEdit = formEdit.find('.idEdit');
let namapeminjamEdit = formEdit.find('#namapeminjamEdit');
let deptEdit = formEdit.find('#deptEdit');
let tanggalpinjamEdit = formEdit.find('#tanggalpinjamEdit');
let barangyangdipinjamEdit = formEdit.find('#barangyangdipinjamEdit');
let dipinjamkanolehEdit = formEdit.find('#dipinjamkanolehEdit');
let tanggalkembaliEdit = formEdit.find('#tanggalkembaliEdit');
let barangyangKembaliEdit = formEdit.find('#barangyangkembaliEdit');
let dikembalikankeEdit = formEdit.find('#dikembalikankeEdit');
let statusEdit = formEdit.find('#statusEdit');
let keteranganEdit = formEdit.find('#keteranganEdit');


// Ketika tombol "Simpan Perubahan" ditekan
formEdit.submit(function (event) {
	event.preventDefault();

	console.log("submit");

	// Ambil nilai level user
	let levelUser = $("#leveluser").val();

	console.log("level user = " + levelUser);

	if (canManageIT) {

		// Mengambil nilai dari elemen input
		const namaLengkap = document.getElementById('namalengkap').value;
		const userName = document.getElementById("username").value;
		const levelUser = document.querySelector('#leveluser').value;

		// Get the form data.
		let formData = {
			'namaPeminjam': namapeminjamEdit.val() || ' ',
			'dept': deptEdit.val() || ' ',
			'tanggalPinjam': tanggalpinjamEdit.val() || ' ',
			'barangyangDipinjam': barangyangdipinjamEdit.val() || ' ',
			'dipinjamkanOleh': dipinjamkanolehEdit.val() || ' ',
			'tanggalKembali': tanggalkembaliEdit.val() || ' ',
			'barangyangKembali': barangyangKembaliEdit.val() || ' ',
			'dikembalikanKe': dikembalikankeEdit.val() || ' ',
			'status': statusEdit.val() || ' ',
			'keterangan': keteranganEdit.val() || ' '
		};


		// Mendapatkan data original dari elemen tersembunyi
		let originalData = JSON.parse($('#originalData').val());

		// console.log(originalData);
		// console.log(formData);
		// debugger;

		// Menyimpan nilai status di variable sendiri
		//let statusOld = originalData.status;

		let isFormDataEqual = true;

		Object.keys(formData).forEach(function (key) {
			if (formData[key] !== originalData[key]) {
				isFormDataEqual = false;
				console.log("Properti " + key + " tidak sama.");
			}
		});

		// debugger;
		if (isFormDataEqual) {
			//console.log("Form data sama dengan original data");

			let successMessage = "Tidak ada perubahan yang dilakukan!";
			let modal = document.getElementById("myModal");
			let modalBody = modal.querySelector(".modal-content .alert");
			let alert = modal.querySelector(".alert");

			// ubah pesan pada modal
			modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${successMessage}`;

			// tambah class yang sesuai dengan jenis pesan
			alert.classList.add("alert-warning");
			// atur warna latar belakang sesuai dengan jenis pesan
			// alert.style.backgroundColor = "#d4edda"; // warna hijau yang sama dengan .alert-success di Bootstrap

			showAlert();

			return;
		} else {
			//console.log("Form data tidak sama dengan original data");

			// Tambah properti tgl_update

			// formData.tgl_update = moment().format('MMM D YYYY h:mmA');

			// lakukan AJAX
			let id = $('#idEdit').val();
			console.log('id = ' + id)
			// debugger;

			$.ajax({
				url: '/api/datapeminjam/' + id,
				method: 'PUT',
				contentType: 'application/json',
				data: JSON.stringify(formData),
				success: function (response) {
					// hapus sisa validasi valid sebelumnya
					$('.is-valid').removeClass("is-valid");

					// Tutup modal form
					$('#editModal').modal('hide');

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
					// atur warna latar belakang sesuai dengan jenis pesan
					// alert.style.backgroundColor = "#d4edda"; // warna hijau yang sama dengan .alert-success di Bootstrap
					showAlert();

					// Reset input values in the form

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
		$('#deniedModal .modal-body').html('User anda tidak diizinkan untuk melakukan edit data peminjaman');
		$('#deniedModal').modal('show');
	}

});


// Fungsi untuk menghapus data
function deleteData(nomorId) {
	// Tampilkan modal "Delete" dan nomor dokumen yang akan dihapus
	$('#deleteModal .modal-body').html('Apakah Anda yakin ingin menghapus </b>?<br><br><b>Mohon cek kembali sebelum melanjutkan !</b>');
	// Tampilkan modal "Delete"
	$('#deleteModal').modal('show');

	// Ketika tombol "Hapus" diklik pada modal "Delete"
	$('.btn-confirm-delete').on('click', function () {
		// Kirim permintaan DELETE ke API
		$.ajax({
			type: 'DELETE',
			url: '/api/datapeminjam/' + nomorId,
			success: function (response) {
				// Tampilkan pesan sukses di console log
				//console.log(response.status);
				// Refresh halaman
				clearData();
				loadData();
				$("#deleteModal").modal("hide");

				let successMessage = "Item data peminjaman berhasil dihapus !";
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

	// console.log(nomorId);
	// Panggil fungsi untuk menghapus data
	if (canManageIT) {
		deleteData(nomorId);
	} else {
		// Tampilkan modal "Denied Delete" 
		document.getElementById("deniedModalLabel").innerHTML = "Hapus Data";
		$('#deniedModal .modal-body').html('User anda tidak diizinkan untuk menghapus data ini');
		$('#deniedModal').modal('show');
	}

}); 