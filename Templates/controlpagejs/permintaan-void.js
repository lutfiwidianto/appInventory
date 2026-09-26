// Menghilangkan elemen alert setelah 5 detik
// RBAC: baca permissions dari context processor
const _permEl = document.getElementById('user-permissions-data');
const userPermissions = _permEl ? JSON.parse(_permEl.textContent) : [];
const _lvUser = document.querySelector('#leveluser') ? document.querySelector('#leveluser').value : '0';
const canManageIT = userPermissions.includes('IT_MANAGE') || _lvUser == '1';

setTimeout(function() {
	document.getElementById('myAlert').style.opacity = '0';
	setTimeout(function() {
		document.getElementById('myAlert').style.display = 'none';
	}, 1000);
}, 10000);

function refreshData(){
	clearData();
	loadData();
}

function showAlert() {
	$('#myModal').modal({
		backdrop: false,
		keyboard: true
	  });
	  setTimeout(function() {
		$('#myModal').modal('hide');
	  }, 5000);
			
  }
  

// Get the form tambah data.
let formTambah = $('#form-tambah-data');
    
// Get the inputs.
let nomorDokumenTambah = formTambah.find('#nomordokumen');
let tipeDokumenTambah = formTambah.find('#tipedokumen');
let kateGoriTambah = formTambah.find('#kategori');
let namaTambah = formTambah.find('#nama');
let deptTambah = formTambah.find('#dept');
let st4tusTambah = formTambah.find('#status');
let alasanVoidTambah = formTambah.find('#alasan-void');

// Add event listeners.
nomorDokumenTambah.on('input', validateNomorDokumenTambah);
tipeDokumenTambah.on('input', validateTipeDokumenTambah);
kateGoriTambah.on('input', validateKategoriTambah);
namaTambah.on('input', validateNamaTambah);
deptTambah.on('input', validateDeptTambah);
st4tusTambah.on('input', validateStatusTambah);
alasanVoidTambah.on('input', validateAlasanVoidTambah);

function validateNomorDokumenTambah() {
	const nomorDokumen = $("#nomordokumen");
	const inv0 = $(".inv-nomordokumen-0");
	const inv1 = $(".inv-nomordokumen-1");
	const inv2 = $(".inv-nomordokumen-2");
	const valid = $(".valid-feedback.nomordokumen");
	
	let nomorDokumenValue = nomorDokumen.val().trim();
	
	if (!nomorDokumenValue) {
	  inv0.hide();
	  inv1.hide();
	  inv2.hide();
	  valid.hide();
	  nomorDokumen.removeClass("is-valid");
	  nomorDokumen.next(".valid-feedback").hide();
	  nomorDokumen.addClass("is-invalid");
	  inv0.show();
	  return false;
	} else if (/[^0-9]/.test(nomorDokumenValue)) {
	  inv0.hide();
	  inv1.hide();
	  inv2.hide();
	  valid.hide();
	  nomorDokumen.removeClass("is-valid");
	  nomorDokumen.next(".valid-feedback").hide();
	  nomorDokumen.addClass("is-invalid");
	  inv1.show();
	  return false;
	} else if (nomorDokumenValue.length !== 9) {
	  inv0.hide();
	  inv1.hide();
	  inv2.hide();
	  valid.hide();
	  nomorDokumen.removeClass("is-valid");
	  nomorDokumen.next(".valid-feedback").hide();
	  nomorDokumen.addClass("is-invalid");
	  inv2.show();
	  return false;
	} else {
	  inv0.hide();
	  inv1.hide();
	  inv2.hide();
	  nomorDokumen.removeClass("is-invalid");
	  nomorDokumen.next(".inv-nomordokumen-1").hide();
	  nomorDokumen.next(".inv-nomordokumen-2").hide();
	  nomorDokumen.addClass("is-valid");
	  valid.show();
	  return true;
	}
  }
  
function validateTipeDokumenTambah(){
	const tipeDokumen = $("#tipedokumen");
	const inv0 = $(".inv-tipedokumen-0");
	const inv1 = $(".inv-tipedokumen-1");
	const valid = $(".valid-feedback.tipedokumen");
	
	let tipeDokumenValue = tipeDokumen.val().trim().toUpperCase();
	//console.log(tipeDokumenValue);

	if (!tipeDokumenValue) {
	  inv0.hide();
	  inv1.hide();
	  valid.hide();
	  tipeDokumen.removeClass("is-valid");
	  tipeDokumen.next(".valid-feedback").hide();
	  tipeDokumen.addClass("is-invalid");
	  inv0.show();
	  return false;
	} else if (tipeDokumenValue.length !== 2) {
	  inv0.hide();
	  inv1.hide();
	  valid.hide();
	  tipeDokumen.removeClass("is-valid");
	  tipeDokumen.next(".valid-feedback").hide();
	  tipeDokumen.addClass("is-invalid");
	  inv1.show();
	  inv0.hide();
	  return false;
	} else {
	  inv0.hide();
	  inv1.hide();
	  tipeDokumen.removeClass("is-invalid");
	  tipeDokumen.next(".inv-nomordokumen-0").hide();
	  tipeDokumen.next(".inv-nomordokumen-1").hide();
	  tipeDokumen.addClass("is-valid");
	  valid.show();
	  return true;
	}
}

function validateKategoriTambah(){
	//console.log("Tes kategori");
	const kateGori = $("#kategori");
	const inv0 = $(".inv-kategori-0");
	const valid = $(".valid-feedback.kategori");
	
	let kateGoriValue = kateGori.val();
	//console.log(kateGoriValue);
	
	if (!kateGoriValue) {
	  inv0.hide();
	  valid.hide();
	  kateGori.removeClass("is-valid");
	  kateGori.next(".valid-feedback").hide();
	  kateGori.addClass("is-invalid");
	  inv0.show();
	  return false;
	} else {
	  inv0.hide();
	  valid.hide();
	  kateGori.removeClass("is-invalid");
	  kateGori.next(".inv-kategori-0").hide();
	  kateGori.addClass("is-valid");
	  valid.show();
	  return true;
	} 
}

function validateNamaTambah(){
	console.log("Tes nama");

	const nama = $("#nama");
	const inv0 = $(".inv-nama-0");
	const valid = $(".valid-feedback.nama");
	
	let namaValue = nama.val();
	console.log(namaValue);
	
	if (!namaValue) {
	  inv0.hide();
	  valid.hide();
	  nama.removeClass("is-valid");
	  nama.next(".valid-feedback").hide();
	  nama.addClass("is-invalid");
	  inv0.show();
	  return false;
	} else {
	  inv0.hide();
	  valid.hide();
	  nama.removeClass("is-invalid");
	  nama.next(".inv-nama-0").hide();
	  nama.addClass("is-valid");
	  valid.show();
	  return true;
	} 
}


function validateDeptTambah(){
	//console.log("Tes Dept");

	const dept = $("#dept");
	const inv0 = $(".inv-dept-0");
	const inv1 = $(".inv-dept-1");
	const valid = $(".valid-feedback.dept");
	
	let deptValue = dept.val().trim().toUpperCase();
	console.log(deptValue);
	
	if (!deptValue) {
	  inv0.hide();
	  inv1.hide();
	  valid.hide();
	  dept.removeClass("is-valid");
	  dept.next(".valid-feedback").hide();
	  dept.addClass("is-invalid");
	  inv0.show();
	  return false;
	} else if (deptValue.length > 3) {
		inv0.hide();
		inv1.hide();
		valid.hide();
		dept.removeClass("is-valid");
		dept.next(".valid-feedback.dept").hide();
		dept.addClass("is-invalid");
		inv1.show();
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

function validateStatusTambah(){
	//console.log("Tes status");
	const st4tus = $("#status");
	const inv0 = $(".inv-status-0");
	const valid = $(".valid-feedback.status");
	
	let statusValue = st4tus.val();
	//console.log(kateGoriValue);
	
	if (!statusValue) {
	  inv0.hide();
	  valid.hide();
	  st4tus.removeClass("is-valid");
	  st4tus.next(".valid-feedback").hide();
	  st4tus.addClass("is-invalid");
	  inv0.show();
	  return false;
	} else {
	  inv0.hide();
	  valid.hide();
	  st4tus.removeClass("is-invalid");
	  st4tus.next(".inv-status-0").hide();
	  st4tus.addClass("is-valid");
	  valid.show();
	  return true;
	} 
}

function validateAlasanVoidTambah(){
	//console.log("tes alasan void");
	const alasanVoid = $("#alasan-void");
	const inv0 = $(".inv-alasanvoid-0");
	const valid = $(".valid-feedback.alasanvoid");
	
	let alasanVoidValue = alasanVoid.val();
	//console.log(kateGoriValue);
	
	if (!alasanVoidValue) {
	  inv0.hide();
	  valid.hide();
	  alasanVoid.removeClass("is-valid");
	  alasanVoid.next(".valid-feedback").hide();
	  alasanVoid.addClass("is-invalid");
	  inv0.show();
	  return false;
	} else {
	  inv0.hide();
	  valid.hide();
	  alasanVoid.removeClass("is-invalid");
	  alasanVoid.next(".inv-alasanvoid-0").hide();
	  alasanVoid.addClass("is-valid");
	  valid.show();
	  return true;
	} 
}

// Add event listener ketika tombol submite disimpan 

formTambah.submit(function(event) {
    
	event.preventDefault(); // Prevent the default form submission.

    // Validate the inputs.
    if (validateNomorDokumenTambah() && validateTipeDokumenTambah() && validateKategoriTambah() && validateNamaTambah() && validateDeptTambah() && validateStatusTambah() && validateAlasanVoidTambah()) {
        // Get the form data.
        let formData = {
            'nomor_dokumen': nomorDokumenTambah.val(),
            'tipe_dokumen': tipeDokumenTambah.val(),
            'kategori': kateGoriTambah.val(),
            'alasan_void': alasanVoidTambah.val(),
            'nama': namaTambah.val(),
            'dept': deptTambah.val(),
            'status': st4tusTambah.val()
        };

        // Send the data to the server.
        $.ajax({
            type: 'POST',
            url: '/api/datavoid',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                		
				$('#formModal').modal('hide');

				refreshData()

				$('#myModal').find('.alert-success').html('<i class="fas fa-check-circle mr-2"></i> Dokumen : ' + nomorDokumenTambah.val() + ' berhasil dibuat!');
				
				showAlert();

				// hapus sisa validasi valid dan invalid sebelumnya
				$('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
				
				// Reset input values in the form
				nomorDokumenTambah.val('');
				tipeDokumenTambah.val('');
				kateGoriTambah.val('');
				alasanVoidTambah.val('');
				namaTambah.val('');
				deptTambah.val('');
				st4tusTambah.val('');
            },
            error: function(response) {
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
			"url": "/api/datavoid",
			"dataSrc": "",
			"error": function(xhr, error, thrown) {
				console.log(xhr);
				console.log(error);
				console.log(thrown);
			}
		},
		"columns": [{
				data: 'void_id', visible: false,
			},
			{
				data: 'nomor_dokumen'
			},
			{
				data: 'tipe_dokumen'
			},
			{
				data: 'kategori'
			},
			{
				data: 'alasan_void'
			},
			{
				data: 'nama'
			},
			{
				data: 'dept'
			},
			{
				data: 'status'
			},
			{
				data: 'tanggal_update'
			},
			{
				"data": null,
				"render": function(data, type, row) {
					return '<td text-align: center;">' +
						'<button type="button" class="btn btn-warning btn-edit" data-toggle="modal" data-void_id="' + row.void_id + '"><i class="fas fa-edit fa-xs"></i></button>' +
						'<button type="button" class="btn btn-danger btn-delete" data-toggle="modal" data-void_id="' +
						row.void_id + '" data-nomor_dokumen="' + row.nomor_dokumen + '"><i class="fas fa-trash-alt fa-xs"></i></button>' +
						'</td>';
				}
			}

		],
		"order": [
			[0, "desc"]
		],
		
		lengthMenu: [
			[10, 25, 50, -1],
			[10, 25, 50, "All"]
		],
		pageLength: 10,
		// "dom": 'Bfrtip',
		dom:"<'row'<'col-sm'l><'col-sm'B><'col-sm'f>>" +
			"<'row'<'col-sm-12'tr>>" +
			"<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
		buttons: [{
			extend: 'copy',
			text: '<i class="fas fa-copy"></i> &nbsp Copy',
			title: 'Data Permintaan Void',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8] // export only these columns
			}
		}, {
			extend: 'csv',
			text: '<i class="fas fa-file-csv"></i>&nbsp CSV',
			title: 'Data Permintaan Void',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8] // export only these columns
			}
		}, {
			extend: 'excel',
			text: '<i class="fas fa-file-excel"></i>&nbsp Excel',
			title: 'Data Permintaan Void',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8] // export only these columns
			}
		}, {
			extend: 'pdf',
			text: '<i class="fas fa-file-pdf"></i>&nbsp Pdf',
			title: 'Data Permintaan Void',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8] // export only these columns
			}
		}, {
			extend: 'print',
			text: '<i class="fas fa-print"></i>&nbsp Print',
			title: 'Data Permintaan Void',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8], // print only these columns
				// title: 'Cetak Data Table Void' // custom title for print button
			}
		}],

		"responsive": true,
		"rowCallback": function(row, data, index) {
			if (data.status == "Pending") {
				$(row).css('background-color', '#dd9295');
			}
		},
		"initComplete": function(settings, json) {
			// Hitung jumlah row dengan status "Pending"
			let count = 0;
			this.api().rows().every(function() {
				let data = this.data();
				if (data.status === 'Pending') {
					count++;
				}
			});
			
			// Hide the button if count is zero
			if (count === 0) {
				$('#btnPending').hide();
			} else {
				$('#btnPending').show();
				$('#btnPending').html('PENDING ' + count + '');
			}
		}
	});

}


$(document).ready(function() {
	loadData();

	$('#btnRefresh').on('click', function() {
		clearData();
		loadData();

	});

	//Hapus jika ada validasi form tambah data modal yang tersisa dari sebelumnya
	$('#formModal').on('show.bs.modal', function () {
		console.log('Form modal tambah muncul');
		$('.form-control').removeClass('is-valid');
	  });
	  

	$('#formModalEdit').on('show.bs.modal', function() {
		console.log('Form modal edit muncul');
		// hapus sisa validasi valid dan invalid sebelumnya
		$('.is-valid, .is-invalid').removeClass('is-valid is-invalid');

	});

	// Get the form.
	let formTambah = $('#form-tambah-data');

	// Get the inputs.
	let tipeDokumen = formTambah.find('#tipedokumen');

	// Add event listener to capitalize input on keyup.
	tipeDokumen.on('keyup', function() {
		let currentValue = $(this).val();
		$(this).val(currentValue.toUpperCase());
	  });

	  // Get the inputs.
	let nama = formTambah.find('#nama');

	// Add event listener to capitalize input on keyup.
	nama.on('keyup', function() {
		let currentValue = $(this).val();
		$(this).val(currentValue.toLowerCase().replace(/\b\w/g, function(l){ return l.toUpperCase(); }));
	  });


	  	// Get the inputs.
	let dept = formTambah.find('#dept');

	// Add event listener to capitalize input on keyup.
	dept.on('keyup', function() {
		let currentValue = $(this).val();
		$(this).val(currentValue.toUpperCase());
	  });

});




/* PEMBUKA CONTROL FORM EDIT */


// Get the form tambah data.
let formEdit = $('#form-Edit-data');
    
// Get the inputs.
let nomorDokumenEdit = formEdit.find('#editnomordokumen');
let tipeDokumenEdit = formEdit.find('#edittipedokumen');
let kateGoriEdit = formEdit.find('#editkategori');
let namaEdit = formEdit.find('#editnama');
let deptEdit = formEdit.find('#editdept');
let st4tusEdit = formEdit.find('#editstatus');
let alasanVoidEdit = formEdit.find('#editalasan-void');

// Add event listeners.
nomorDokumenEdit.on('input', validateNomorDokumenEdit);
tipeDokumenEdit.on('input', validateTipeDokumenEdit);
kateGoriEdit.on('input', validateKategoriEdit);
namaEdit.on('input', validateNamaEdit);
deptEdit.on('input', validateDeptEdit);
st4tusEdit.on('input', validateStatusEdit);
alasanVoidEdit.on('input', validateAlasanVoidEdit);

function validateNomorDokumenEdit() {
	const nomorDokumenEdit = $("#editnomordokumen");
	const inv0 = $(".inv-nomordokumen-0");
	const inv1 = $(".inv-nomordokumen-1");
	const inv2 = $(".inv-nomordokumen-2");
	const valid = $(".valid-feedback.editnomordokumen");
	
	let nomorDokumenEditValue = nomorDokumenEdit.val().trim();
	
	if (!nomorDokumenEditValue) {
	  inv0.hide();
	  inv1.hide();
	  inv2.hide();
	  valid.hide();
	  nomorDokumenEdit.removeClass("is-valid");
	  nomorDokumenEdit.next(".valid-feedback").hide();
	  nomorDokumenEdit.addClass("is-invalid");
	  inv0.show();
	  return false;
	} else if (/[^0-9]/.test(nomorDokumenEditValue)) {
	  inv0.hide();
	  inv1.hide();
	  inv2.hide();
	  valid.hide();
	  nomorDokumenEdit.removeClass("is-valid");
	  nomorDokumenEdit.next(".valid-feedback").hide();
	  nomorDokumenEdit.addClass("is-invalid");
	  inv1.show();
	  inv2.hide();
	  return false;
	} else if (nomorDokumenEditValue.length !== 9) {
	  inv0.hide();
	  inv1.hide();
	  inv2.hide();
	  valid.hide();
	  nomorDokumenEdit.removeClass("is-valid");
	  nomorDokumenEdit.next(".valid-feedback").hide();
	  nomorDokumenEdit.addClass("is-invalid");
	  inv2.show();
	  inv1.hide();
	  return false;
	} else {
	  inv0.hide();
	  inv1.hide();
	  inv2.hide();
	  nomorDokumenEdit.removeClass("is-invalid");
	  nomorDokumenEdit.next(".inv-nomordokumen-1").hide();
	  nomorDokumenEdit.next(".inv-nomordokumen-2").hide();
	  nomorDokumenEdit.addClass("is-valid");
	  valid.show();
	  return true;
	}
  }
  
function validateTipeDokumenEdit(){
	const tipeDokumenEdit = $("#edittipedokumen");
	const inv0 = $(".inv-tipedokumen-0");
	const inv1 = $(".inv-tipedokumen-1");
	const valid = $(".valid-feedback.edittipedokumen");
	
	let tipeDokumenEditValue = tipeDokumenEdit.val().trim().toUpperCase();
	//console.log(tipeDokumenValue);

	if (!tipeDokumenEditValue) {
	  inv0.hide();
	  inv1.hide();
	  valid.hide();
	  tipeDokumenEdit.removeClass("is-valid");
	  tipeDokumenEdit.next(".valid-feedback").hide();
	  tipeDokumenEdit.addClass("is-invalid");
	  inv0.show();
	  return false;
	} else if (tipeDokumenEditValue.length !== 2) {
	  inv0.hide();
	  inv1.hide();
	  valid.hide();
	  tipeDokumenEdit.removeClass("is-valid");
	  tipeDokumenEdit.next(".valid-feedback").hide();
	  tipeDokumenEdit.addClass("is-invalid");
	  inv1.show();
	  inv0.hide();
	  return false;
	} else {
	  inv0.hide();
	  inv1.hide();
	  tipeDokumenEdit.removeClass("is-invalid");
	  tipeDokumenEdit.next(".inv-nomordokumen-0").hide();
	  tipeDokumenEdit.next(".inv-nomordokumen-1").hide();
	  tipeDokumenEdit.addClass("is-valid");
	  valid.show();
	  return true;
	}
}

function validateKategoriEdit(){
	//console.log("Tes kategori");
	const kateGoriEdit = $("#editkategori");
	const inv0 = $(".inv-kategori-0");
	const valid = $(".valid-feedback.kategori");
	
	let kateGoriEditValue = kateGoriEdit.val();
	//console.log(kateGoriValue);
	
	if (!kateGoriEditValue) {
	  inv0.hide();
	  valid.hide();
	  kateGoriEdit.removeClass("is-valid");
	  kateGoriEdit.next(".valid-feedback").hide();
	  kateGoriEdit.addClass("is-invalid");
	  inv0.show();
	  return false;
	} else {
	  inv0.hide();
	  valid.hide();
	  kateGoriEdit.removeClass("is-invalid");
	  kateGoriEdit.next(".inv-kategori-0").hide();
	  kateGoriEdit.addClass("is-valid");
	  valid.show();
	  return true;
	} 
}

function validateNamaEdit(){
	//console.log("Tes nama");

	const namaEdit = $("#editnama");
	const inv0 = $(".inv-nama-0");
	const valid = $(".valid-feedback.editnama");
	
	let namaEditValue = namaEdit.val();
	//console.log(namaEditValue);
	
	if (!namaEditValue) {
	  inv0.hide();
	  valid.hide();
	  namaEdit.removeClass("is-valid");
	  namaEdit.next(".valid-feedback").hide();
	  namaEdit.addClass("is-invalid");
	  inv0.show();
	  return false;
	} else {
	  inv0.hide();
	  valid.hide();
	  namaEdit.removeClass("is-invalid");
	  namaEdit.next(".inv-nama-0").hide();
	  namaEdit.addClass("is-valid");
	  valid.show();
	  return true;
	} 
}


function validateDeptEdit(){
	//console.log("Tes Dept");

	const deptEdit = $("#editdept");
	const inv0 = $(".inv-dept-0");
	const inv1 = $(".inv-dept-1");
	const valid = $(".valid-feedback.editdept");
	
	let deptEditValue = deptEdit.val().trim().toUpperCase();

	
	if (!deptEditValue) {
	  inv0.hide();
	  inv1.hide();
	  valid.hide();
	  deptEdit.removeClass("is-valid");
	  deptEdit.next(".valid-feedback").hide();
	  deptEdit.addClass("is-invalid");
	  inv0.show();
	  return false;
	} else if (deptEditValue.length > 3) {
		inv0.hide();
		inv1.hide();
		valid.hide();
		deptEdit.removeClass("is-valid");
		deptEdit.next(".valid-feedback.dept").hide();
		deptEdit.addClass("is-invalid");
		inv1.show();
		return false;
	} else {
	  inv0.hide();
	  inv1.hide();
	  valid.hide();
	  deptEdit.removeClass("is-invalid");
	  deptEdit.addClass("is-valid");
	  valid.show();
	  return true;
	} 
}

function validateStatusEdit(){
	//console.log("Tes status");
	const st4tusEdit = $("#editstatus");
	const inv0 = $(".inv-status-0");
	const valid = $(".valid-feedback.editstatus");
	
	let statusEditValue = st4tusEdit.val();
	//console.log(kateGoriValue);
	
	if (!statusEditValue) {
	  inv0.hide();
	  valid.hide();
	  st4tusEdit.removeClass("is-valid");
	  st4tusEdit.next(".valid-feedback").hide();
	  st4tusEdit.addClass("is-invalid");
	  inv0.show();
	  return false;
	} else {
	  inv0.hide();
	  valid.hide();
	  st4tusEdit.next(".inv-status-0").hide();
	  st4tusEdit.addClass("is-valid");
	  st4tusEdit.show();
	  return true;
	} 
}

function validateAlasanVoidEdit(){
	//console.log("tes alasan void");
	const alasanVoidEdit = $("#editalasan-void");
	const inv0 = $(".inv-alasanvoid-0");
	const valid = $(".valid-feedback.editalasanvoid");
	
	let alasanVoidEditValue = alasanVoidEdit.val();
	//console.log(kateGoriValue);
	

	if (!alasanVoidEditValue) {
	  inv0.hide();
	  valid.hide();
	  alasanVoidEdit.removeClass("is-valid");
	  alasanVoidEdit.next(".valid-feedback").hide();
	  alasanVoidEdit.addClass("is-invalid");
	  inv0.show();
	  return false;
	} else {
	  inv0.hide();
	  valid.hide();
	  alasanVoidEdit.removeClass("is-invalid");
	  alasanVoidEdit.next(".inv-alasanvoid-0").hide();
	  alasanVoidEdit.addClass("is-valid");
	  valid.show();
	  return true;
	} 
}

$(document).on('click', '.btn-edit', function() {
	var alertBox = document.getElementById('myAlert');
	alertBox.style.display = 'block';
	alertBox.style.opacity = '1';
	setTimeout(function() {
	  alertBox.style.opacity = '0';
	  setTimeout(function() {
		alertBox.style.display = 'none';
	  }, 1000);
	}, 10000);

    let voidId = $(this).data('void_id');
    $('#editvoidid').val(voidId); // menyimpan nilai voidId pada elemen form yang tersembunyi

	

    // Mendapatkan data original dan menyimpannya di dalam elemen tersembunyi
    $.get('/api/datavoid/' + voidId, function(data) {
        $('#editnomordokumen').val(data[0].nomordokumen);
        $('#edittipedokumen').val(data[0].tipedokumen.trim());
        $('#editkategori').val(data[0].kategori.trim());
        $('#editnama').val(data[0].nama.trim());
        $('#editdept').val(data[0].dept.trim());
        $('#editstatus').val(data[0].status.trim());
        $('#editalasan-void').val(data[0].alasanvoid.trim());

        // Simpan data original di dalam elemen tersembunyi
        $('#originalData').val(JSON.stringify(data[0]));
        
		
        // show the modal form
        $('#formModalEdit').modal('show');
    });

	// hapus sisa validasi valid dan invalid sebelumnya
	$('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
});


// Ketika tombol "Simpan Perubahan" ditekan
formEdit.submit(function(event) { 
	event.preventDefault();

// Ambil nilai level user
let levelUser = $("#leveluser").val();

if (canManageIT) {
	
		// Ambil data dari form
		let voidId = $('#editvoidid').val();
		let nomorDokumenEdit = $('#editnomordokumen');
		let tipeDokumenEdit = $('#edittipedokumen');
		let kateGoriEdit = $('#editkategori');
		let alasanVoidEdit = $('#editalasan-void');
		let namaEdit = $('#editnama');
		let deptEdit = $('#editdept');
		let st4tusEdit = $('#editstatus');
	
		let formData = {
			nomordokumen: nomorDokumenEdit.val(),
			tipedokumen: tipeDokumenEdit.val(),
			kategori: kateGoriEdit.val(),
			alasanvoid: alasanVoidEdit.val(),
			nama: namaEdit.val(),
			dept: deptEdit.val(),
			status: st4tusEdit.val()
		};
	
		// Mendapatkan data original dari elemen tersembunyi
		let originalData = JSON.parse($('#originalData').val());
	
		// Menyimpan nilai status di variable sendiri
		let statusOld = originalData.status;
		//console.log(statusOld);
		//debugger;
		let isFormDataEqual = true;
	
		Object.keys(formData).forEach(function(key) {
			if (formData[key] !== originalData[key]) {
				isFormDataEqual = false;
				console.log("Properti " + key + " tidak sama.");
			}
		});
	
		if (isFormDataEqual) {
			console.log("Form data sama dengan original data");
	
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
			
			formData.tgl_update = moment().format('MMM D YYYY h:mmA');
	
			if (statusOld === 'Success') {
				// tampilkan pesan bahwa dokumen tidak dapat diubah karena karena sebelumnya sudah berhasil / "Success" dirubah
				let errorMessage = "Tidak dapat memperbarui dokumen karena sebelumnya sudah berhasil dirubah";
				let modal = document.getElementById("myModal");
				let modalBody = modal.querySelector(".modal-content .alert");
				let alert = modal.querySelector(".alert");
			
				// ubah pesan pada modal
				modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${errorMessage}`;
			
				// tambah class yang sesuai dengan jenis pesan
				alert.classList.add("alert-danger");
				// atur warna latar belakang sesuai dengan jenis pesan
				// alert.style.backgroundColor = "#f8d7da"; // warna merah yang sama dengan .alert-danger di Bootstrap
				showAlert();
			} else {
				// lakukan AJAX
				$.ajax({
					url: '/api/datavoid/' + voidId,
					method: 'PUT',
					contentType: 'application/json',
					data: JSON.stringify(formData),
					success: function(response) {
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
						// atur warna latar belakang sesuai dengan jenis pesan
						// alert.style.backgroundColor = "#d4edda"; // warna hijau yang sama dengan .alert-success di Bootstrap
						showAlert();
			
						nomorDokumenEdit.val('');
						tipeDokumenEdit.val('');
						kateGoriEdit.val('');
						alasanVoidEdit.val('');
						namaEdit.val('');
						deptEdit.val('');
						st4tusEdit.val('');
					},
					error: function(error) {
						// Tampilkan pesan gagal
						alert(error.responseJSON.status + '\n' + error.responseJSON.error);
					}
				});
			}
			
		}

} else {
	// Tampilkan modal "Denied" 
	document.getElementById("deniedModalLabel").innerHTML = "Edit Data";
	$('#deniedModal .modal-body').html('User anda tidak diizinkan untuk melakukan edit data void');
	$('#deniedModal').modal('show');
}
	

});



/* PENUTUP CONTROL FORM EDIT */



// Fungsi untuk menghapus data
function deleteData(voidId, nomorDokumen) {
	// Tampilkan modal "Delete" dan nomor dokumen yang akan dihapus
    $('#deleteModal .modal-body').html('Apakah Anda yakin ingin menghapus dokumen ' + nomorDokumen + '?');
	// Tampilkan modal "Delete"
	$('#deleteModal').modal('show');

	// Ketika tombol "Hapus" diklik pada modal "Delete"
	$('.btn-confirm-delete').on('click', function() {
		// Kirim permintaan DELETE ke API
		$.ajax({
			type: 'DELETE',
			url: '/api/datavoid/' + voidId,
			success: function(response) {
				// Tampilkan pesan sukses di console log
				//console.log(response.status);
				// Refresh halaman
				clearData();
				loadData();
				$("#deleteModal").modal("hide");

				let successMessage = "Dokumen "+ nomorDokumen + "berhasil dihapus !";
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
			error: function(error) {
				// Tampilkan pesan gagal di console log
				console.log(error.responseJSON.status);
			}
		});
	});
}

$(document).on('click', '.btn-delete', function() {
	//console.log('Tombol Delete diklik');
	let voidId = $(this).data('void_id');
	let nomorDokumen = $(this).data('nomor_dokumen');

	// Ambil nilai level user
	let levelUser = $("#leveluser").val();
	// console.log(levelUser);
	//debugger;
	// Cek nilai level user, jika tidak sama dengan 1 maka tampilkan modal

	if (canManageIT) {
        deleteData(voidId, nomorDokumen);
    } else {
		// Tampilkan modal "Denied Delete" 
		document.getElementById("deniedModalLabel").innerHTML = "Hapus Data";
		$('#deniedModal .modal-body').html('User anda tidak diizinkan untuk menghapus data void');
        $('#deniedModal').modal('show');
    }

}); 