const namaLengkap = document.getElementById('namalengkap').value.trim();
const userName = document.getElementById("username").value;
const levelUser = document.querySelector('#leveluser').value;
// RBAC: baca permissions dari context processor
const _permEl = document.getElementById('user-permissions-data');
const userPermissions = _permEl ? JSON.parse(_permEl.textContent) : [];
const canManageIT = userPermissions.includes('IT_MANAGE') || levelUser == '1';

// Get references to the specific input fields you want to disable/enable
var tglpengajuanInput = document.getElementById("tanggalpengajuanTambah");
var tglperbaikanInput = document.getElementById("tanggalperbaikanTambah");
var tglselesaiInput = document.getElementById("tanggalselesaiTambah");
var deptInput = document.getElementById("deptTambah");
var nomorAssetInput = document.getElementById("nomorassetTambah");
var namasaranaInput = document.getElementById("namasaranaTambah");
var kerusakanInput = document.getElementById("kerusakanTambah");
var kategoriInput = document.getElementById("kategoriTambah");
var tanggalPerbaikanInput = document.getElementById("tanggalperbaikanTambah");
var tanggalSelesaiInput = document.getElementById("tanggalselesaiTambah");
var jenisTindakanInput = document.getElementById("jenistindakanTambah");
var levelKerusakanInput = document.getElementById("levelkerusakanTambah");
var statusInput = document.getElementById("statusTambah");
var penyebabInput = document.getElementById("penyebabTambah");
var tindakanInput = document.getElementById("tindakanTambah");
var saranInput = document.getElementById("saranTambah");
var pemohonInput = document.getElementById("pemohonTambah");
var petugasPerbaikanInput = document.getElementById("petugasperbaikanTambah");
var hasilPerbaikanInput = document.getElementById("hasilperbaikanTambah");
var verifikasiUserInput = document.getElementById("verifikasiuserTambah");

$(function() {
    // Set the format for date and time
    var format = 'MM/DD/YYYY HH:mm:ss';

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
	$('#tanggalpengajuanTambahDiv').on('change.datetimepicker', function(e) {
		var date = moment(e.date).format(format);
		$('input[name="tanggalpengajuanTambah"]').val(date);
	  });
	
	  // Disable input field on calendar icon click
	  $('#tanggalpengajuanTambahDiv .input-group-append').on('click', function() {
		$('#tanggalpengajuanTambahDiv').datetimepicker('date', moment()); // Set to today's date
		$('input[name="tanggalpengajuanTambah"]').prop('readonly', true); // Disable input field
	  }); 

	 // Tanggal Perbaikan tambah
	 $('#tanggalperbaikanTambah').datetimepicker({
		format: format,
		useCurrent: false,
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
	  $('#tanggalperbaikanTambah').on('change.datetimepicker', function(e) {
		var date = moment(e.date).format(format);
		$('input[name="tanggalperbaikanTambah"]').val(date);
	  });
  
	  // Tanggal Selesai tambah
	  $('#tanggalselesaiTambah').datetimepicker({
		format: format,
		useCurrent: false,
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
        }
	  });
	  $('#tanggalselesaiTambah').on('change.datetimepicker', function(e) {
		var date = moment(e.date).format(format);
		$('input[name="tanggalselesaiTambah"]').val(date);
	  });

	  //---------------------------------------

	  // Tanggal pengajuan edit
	  $('#tanggalpengajuanEditDiv').datetimepicker({
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
	$('#tanggalpengajuanEditDiv').on('change.datetimepicker', function(e) {
		var date = moment(e.date).format(format);
		$('input[name="tanggalpengajuanEdit"]').val(date);
	  }); 
	

	 // Tanggal Perbaikan Edit
	 $('#tanggalperbaikanEdit').datetimepicker({
		format: format,
		useCurrent: false,
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
	  $('#tanggalperbaikanEdit').on('change.datetimepicker', function(e) {
		var date = moment(e.date).format(format);
		$('input[name="tanggalperbaikanEdit"]').val(date);
	  });
  
	  // Tanggal Selesai Edit
	  $('#tanggalselesaiEdit').datetimepicker({
		format: format,
		useCurrent: false,
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
        }
	  });
	  $('#tanggalselesaiEdit').on('change.datetimepicker', function(e) {
		var date = moment(e.date).format(format);
		$('input[name="tanggalselesaiEdit"]').val(date);
	  });
  });

  
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
let tanggalpengajuanTambah = formTambah.find('#tanggalpengajuanTambah');
let deptTambah = formTambah.find('#deptTambah');
let nomorassetTambah= formTambah.find('#nomorassetTambah');
let namasaranaTambah = formTambah.find('#namasaranaTambah');
let kerusakanTambah = formTambah.find('#kerusakanTambah');
let kategoriTambah = formTambah.find('#kategoriTambah');
let tanggalperbaikanTambah = formTambah.find('#tanggalperbaikanTambah');
let tanggalselesaiTambah = formTambah.find('#tanggalselesaiTambah');
let jenistindakanTambah = formTambah.find('#jenistindakanTambah');
let levelkerusakanTambah = formTambah.find('#levelkerusakanTambah');
let statusTambah = formTambah.find('#statusTambah');
let penyebabTambah = formTambah.find('#penyebabTambah');
let tindakanTambah = formTambah.find('#tindakanTambah');
let saranTambah = formTambah.find('#saranTambah');
let pemohonTambah = formTambah.find('#pemohonTambah');
let petugasperbaikanTambah = formTambah.find('#petugasperbaikanTambah');
let hasilperbaikanTambah = formTambah.find('#hasilperbaikanTambah');
let verifikasiuserTambah = formTambah.find('#verifikasiuserTambah');

// Add event listeners.
tanggalpengajuanTambah.on('input', validatetanggalpengajuanTambah);
deptTambah.on('input', validatedeptTambah);
nomorassetTambah.on('input', validatenomorassetTambah);
namasaranaTambah.on('input', validatenamasaranaTambah);
namasaranaTambah.on('input', validatenamasaranaTambah);
kerusakanTambah.on('input', validatekerusakanTambah);
kategoriTambah.on('input', validatekategoriTambah);
pemohonTambah.on('input', validatepemohonTambah);


function validatetanggalpengajuanTambah(){

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


function validatedeptTambah(){
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

function validatenomorassetTambah(){
	console.log("Tes nomor asset");

	const nomorasset = $("#nomorassetTambah");
	const inv0 = $(".inv-nomorassetTambah-0");
	const valid = $(".valid-feedback.nomorassetTambah");
	
	let nomorassetValue = nomorasset.val().trim().toUpperCase();
	console.log(nomorassetValue);
	
	if (!nomorassetValue) {
	  inv0.hide();
	  valid.hide();
	  nomorasset.removeClass("is-valid");
	  nomorasset.next(".valid-feedback").hide();
	  nomorasset.addClass("is-invalid");
	  inv0.show();
	  nomorasset.focus();
	  return false;
	} else {
	  inv0.hide();
	  valid.hide();
	  nomorasset.removeClass("is-invalid");
	  nomorasset.addClass("is-valid");
	  valid.show();
	  return true;
	} 
}

function validatenamasaranaTambah(){
	//console.log("Tes Dept");

	const namasarana = $("#namasaranaTambah");
	const inv0 = $(".inv-namasaranaTambah-0");
	const valid = $(".valid-feedback.namasaranaTambah");
	
	let namasaranaValue = namasarana.val().trim().toUpperCase();
	//console.log(deptValue);
	
	if (!namasaranaValue) {
	  inv0.hide();
	  valid.hide();
	  namasarana.removeClass("is-valid");
	  namasarana.next(".valid-feedback").hide();
	  namasarana.addClass("is-invalid");
	  inv0.show();
	  namasarana.focus()
	  return false;
	} else {
	  inv0.hide();
	  valid.hide();
	  namasarana.removeClass("is-invalid");
	  namasarana.addClass("is-valid");
	  valid.show();
	  return true;
	} 
}

function validatekerusakanTambah(){
	//console.log("Tes Dept");

	const kerusakan = $("#kerusakanTambah");
	const inv0 = $(".inv-kerusakanTambah-0");
	const valid = $(".valid-feedback.kerusakanTambah");
	
	let kerusakanValue = kerusakan.val().trim().toUpperCase();
	//console.log(deptValue);
	
	if (!kerusakanValue) {
	  inv0.hide();
	  valid.hide();
	  kerusakan.removeClass("is-valid");
	  kerusakan.next(".valid-feedback").hide();
	  kerusakan.addClass("is-invalid");
	  inv0.show();
	  kerusakan.focus()
	  return false;
	} else {
	  inv0.hide();
	  valid.hide();
	  kerusakan.removeClass("is-invalid");
	  kerusakan.addClass("is-valid");
	  valid.show();
	  return true;
	} 
}

function validatekategoriTambah(){
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

function validatepemohonTambah(){
	//console.log("Tes Dept");

	const pemohon = $("#pemohonTambah");
	const inv0 = $(".inv-pemohonTambah-0");
	const valid = $(".valid-feedback.pemohonTambah");
	
	let pemohonValue = pemohon.val().trim();
	//console.log(deptValue);
	
	if (!pemohonValue) {
	  inv0.hide();
	  valid.hide();
	  pemohon.removeClass("is-valid");
	  pemohon.next(".valid-feedback").hide();
	  pemohon.addClass("is-invalid");
	  inv0.show();
	  pemohon.focus()
	  return false;
	} else {
	  inv0.hide();
	  valid.hide();
	  pemohon.removeClass("is-invalid");
	  pemohon.addClass("is-valid");
	  valid.show();
	  return true;
	} 
}
// Add event listener ketika tombol submite disimpan 

formTambah.submit(function(event) {
    
	event.preventDefault(); // Prevent the default form submission.

	// Mengambil nilai dari elemen input
	const namaLengkap = document.getElementById('namalengkap').value;
	const userName = document.getElementById("username").value;
	const levelUser = document.querySelector('#leveluser').value;

    // Validate the inputs.
    if (validatetanggalpengajuanTambah() && validatedeptTambah() && validatenomorassetTambah() && validatenamasaranaTambah() && validatekerusakanTambah() && validatekategoriTambah() && validatepemohonTambah()) {
        // Get the form data.
        let formData = {
			'tanggal': tanggalpengajuanTambah.val() || ' ', // check if the value is empty or null, replace with a space if true
			'dept': deptTambah.val() || ' ',
			'nomorAsset': nomorassetTambah.val() || ' ',
			'namaSarana': namasaranaTambah.val() || ' ',
			'kerusakan': kerusakanTambah.val() || ' ',
			'kategori': kategoriTambah.val() || ' ',
			'tanggalPerbaikan': tanggalperbaikanTambah.val() || ' ',
			'tanggalSelesai': tanggalselesaiTambah.val() || ' ',
			'jenisTindakan': jenistindakanTambah.val() || ' ',
			'levelKerusakan': levelkerusakanTambah.val() || ' ',
			'status': statusTambah.val() || ' ',
			'penyebab': penyebabTambah.val() || ' ',
			'tindakan': tindakanTambah.val() || ' ',
			'saran': saranTambah.val() || ' ',
			'pemohon': pemohonTambah.val() || ' ',
			'petugasPerbaikan': petugasperbaikanTambah.val() || ' ',
			'hasilPerbaikan': hasilperbaikanTambah.val() || ' ',
			'verifikasiUser': verifikasiuserTambah.val() || ' ',
			'loginNama': namaLengkap || ' ',
			'loginUser': userName || ' '

		};
		
		  
		 // console.log(formData);
		 // debugger;

        // Send the data to the server.
        $.ajax({
            type: 'POST',
            url: '/api/datapermintaanit',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                		
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
				tanggalpengajuanTambah.val('');
				deptTambah.val('');
				nomorassetTambah.val('');
				namasaranaTambah.val('');
				kategoriTambah.val('');
				tanggalperbaikanTambah.val('');
				tanggalselesaiTambah.val('');
				jenistindakanTambah.val('');
				levelkerusakanTambah.val('');
				statusTambah.val('');
				penyebabTambah.val('');
				tindakanTambah.val('');
				saranTambah.val('');
				pemohonTambah.val('');
				petugasperbaikanTambah.val('');
				hasilperbaikanTambah.val('');
				verifikasiuserTambah.val('');
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
			"url": "api/datapermintaanit",
			"dataSrc": "",
			"error": function(xhr, error, thrown) {
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
				"render": function(data, type, row, meta) {
				  return meta.row + meta.settings._iDisplayStart + 1;
				}
			  },
            { "data": "id" , visible: false}, 
            { "data": "tanggal" },
            { "data": "dept" },
            { "data": "nomorAsset" },
            { "data": "namaSarana" },
            { "data": "kerusakan" },
            { "data": "kategori" },
            { "data": "jenisTindakan" },
            { "data": "tanggalPerbaikan" },
            { "data": "tanggalSelesai" },
            { "data": "levelKerusakan" },
            { "data": "penyebab" },
            { "data": "tindakan" },
            { "data": "saran" },
            { "data": "pemohon" },
            { "data": "petugasPerbaikan" },
            { "data": "hasilPerbaikan" },
            { "data": "verifikasiUser" },
            { "data": "loginNama" },
            { "data": "loginId" },
            { "data": "status" },
            {
				"data": null,
				"render": function(data, type, row) {
					return '<td text-align: center;">' +
						'<button type="button" class="btn btn-warning btn-edit" data-toggle="modal" data-id="' + row.id + '"><i class="fas fa-edit fa-xs"></i></button>' +
						'<button type="button" class="btn btn-danger btn-delete" data-toggle="modal" data-id="' +
						row.id + '" data-nomor_asset="' + row.nomorAsset + '" data-login_nama="' + row.loginNama + '"><i class="fas fa-trash-alt fa-xs"></i></button>' +
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
		pageLength: 5,
		// "dom": 'Bfrtip',
		dom:"<'row'<'col-sm'l><'col-sm'B><'col-sm'f>>" +
			"<'row'<'col-sm-12'tr>>" +
			"<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
		buttons: [{
			extend: 'copy',
			text: '<i class="fas fa-copy"></i> &nbsp Copy',
			title: 'Data Permintaan IT',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], // export only these columns
				customize: function(doc) {
					doc.pageOrientation = 'landscape';
				}
			}
		}, {
			extend: 'csv',
			text: '<i class="fas fa-file-csv"></i>&nbsp CSV',
			title: 'Data Permintaan IT',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], // export only these columns
				customize: function(doc) {
					doc.pageOrientation = 'landscape';
				}
			}
		}, {
			extend: 'excel',
			text: '<i class="fas fa-file-excel"></i>&nbsp Excel',
			title: 'Data Permintaan IT',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], // export only these columns
				customize: function(doc) {
					doc.pageOrientation = 'landscape';
				}
			}
		}, {
			extend: 'pdf',
			text: '<i class="fas fa-file-pdf"></i>&nbsp Pdf',
			title: 'Data Permintaan IT',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], // export only these columns
				customize: function(doc) {
					doc.pageOrientation = 'landscape';
				}
			}
		}, {
			extend: 'print',
			text: '<i class="fas fa-print"></i>&nbsp Print',
			title: 'Data Permintaan IT',
			exportOptions: {
				columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21], // export only these columns
				customize: function(doc) {
					doc.pageOrientation = 'landscape';
				}
			}
		}],

		//"responsive": true,
		"rowCallback": function(row, data, index) {
			if (data.status == "Pending") {
				$(row).css('background-color', '#dd9295');
			}
			if (data.status == "Dikerjakan") {
				$(row).css('background-color', '#e7e55f');
			}
		},
		"initComplete": function(settings, json) {
			// Hitung jumlah row dengan status "Pending"
			let countPending = 0;
			let countDikerjakan = 0;

			this.api().rows().every(function() {
				let data = this.data();
				if (data.status === 'Pending') {
					countPending++;
				}
				if (data.status === 'Dikerjakan') {
					countDikerjakan++;
				}
			});
			
			// Hide the btnPending if count is zero
			if (countPending === 0) {
				$('#btnPending').hide();
			} else {
				$('#btnPending').show();
				$('#btnPending').html('PENDING ' + countPending + '');
			}
			// Hide the btnDikerjakan if count is zero
			if (countDikerjakan === 0) {
				$('#btnDikerjakan').hide();
			} else {
				$('#btnDikerjakan').show();
				$('#btnDikerjakan').html('DIKERJAKAN ' + countDikerjakan + '');
			}
		}
	});

}


$(document).ready(function() {
	// Function to reload the page after a certain delay
    function reloadPage() {
        setTimeout(function() {
            window.location.reload();
        }, 2000); // Reload after 5 seconds
    }

    // Listen for window errors
    window.addEventListener('error', function(event) {
        var errorMessage = event.error.message;
        if (errorMessage && errorMessage.includes('CONTENT_LENGTH_MISMATCH')) {
            // Call the reloadPage function if error message contains the keyword
            reloadPage();
        }
    });

	loadData();

	$('#btnRefresh').on('click', function() {
		clearData();
		loadData();

	});

	//Hapus jika ada validasi form tambah data modal yang tersisa dari sebelumnya
	$('#formModal').on('show.bs.modal', function () {
		//console.log('Form modal tambah muncul');
		$('.form-control').removeClass('is-valid');
		console.log(levelUser);

		if (!canManageIT) {
			// Blok kode ini akan dijalankan jika levelUser tidak sama dengan 1
			// Di dalam blok ini, semua input field yang didefinisikan akan dinonaktifkan
			tglpengajuanInput.disabled = true;
			tglperbaikanInput.disabled = true;
			tglselesaiInput.disabled = true;
			//deptInput.disabled = true;
			//nomorAssetInput.disabled = true;
			//namasaranaInput.disabled = true;
			//kerusakanInput.disabled = true;
			//kategoriInput.disabled = true;
			tanggalPerbaikanInput.disabled = true;
			tanggalSelesaiInput.disabled = true;
			jenisTindakanInput.disabled = true;
			levelKerusakanInput.disabled = true;
			statusInput.disabled = true;
			penyebabInput.disabled = true;
			tindakanInput.disabled = true;
			saranInput.disabled = true;
			pemohonInput.disabled = false;
			petugasPerbaikanInput.disabled = true;
			hasilPerbaikanInput.disabled = true;
		} else {
			// Blok kode ini akan dijalankan jika levelUser sama dengan 1
			// Di dalam blok ini, input field tertentu (seperti pemohonInput) akan diaktifkan,
			// sementara yang lain akan tetap dinonaktifkan
			tglpengajuanInput.disabled = false;
			tglperbaikanInput.disabled = false;
			tglselesaiInput.disabled = false;
			//deptInput.disabled = false;
			//nomorAssetInput.disabled = false;
			//namasaranaInput.disabled = false;
			//kerusakanInput.disabled = false;
			//kategoriInput.disabled = false;
			tanggalPerbaikanInput.disabled = false;
			tanggalSelesaiInput.disabled = false;
			jenisTindakanInput.disabled = false;
			levelKerusakanInput.disabled = false;
			statusInput.disabled = false;
			penyebabInput.disabled = false;
			tindakanInput.disabled = false;
			saranInput.disabled = false;
			pemohonInput.disabled = false;
			petugasPerbaikanInput.disabled = false;
			hasilPerbaikanInput.disabled = false;
		}
		

		
	  });
	  

	$('#formModalEdit').on('show.bs.modal', function() {
		//console.log('Form modal edit muncul');
		// hapus sisa validasi valid dan invalid sebelumnya
		$('.is-valid, .is-invalid').removeClass('is-valid is-invalid');

	});



	// Add event listener to capitalize input on keyup.
	deptTambah.on('keyup', function() {
		let currentValue = $(this).val();
		$(this).val(currentValue.toUpperCase());
	  });

	nomorassetTambah.on('keyup', function() {
	let currentValue = $(this).val();
	$(this).val(currentValue.toUpperCase());
	});
	
	namasaranaTambah.on('keyup', function() {
	let currentValue = $(this).val();
	$(this).val(currentValue.toUpperCase());
	});

	function capitalizeWords(string) {
		return string.replace(/\b\w/g, l => l.toUpperCase());
	  }
	  
	pemohonTambah.on('keyup', function() {
	let currentValue = $(this).val();
	$(this).val(capitalizeWords(currentValue));
	});
	
	petugasperbaikanTambah.on('keyup', function() {
	let currentValue = $(this).val();
	$(this).val(capitalizeWords(currentValue));
	});
	
	verifikasiuserTambah.on('keyup', function() {
	let currentValue = $(this).val();
	$(this).val(capitalizeWords(currentValue));
	});
});




/* PEMBUKA CONTROL FORM EDIT */

$("#example1 tbody td").click(function () {
    var row = $(this).closest("tr");    // Find the row
    var cell1 = row.find("td:nth-child(1)").text(); // Find the first cell's data
    var cell2 = row.find("td:nth-child(2)").text(); // Find the second cell's data
    console.log(cell1 + " " + cell2);
});

$(document).on('click', '.btn-edit', function() {
    let idPrimarykey = $(this).data('id');
    $('#idEdit').val(idPrimarykey); // menyimpan nilai Id pada elemen form yang tersembunyi
	

    // Mendapatkan data original dan menyimpannya di dalam elemen tersembunyi
    $.get('/api/datapermintaanit/' + idPrimarykey, function(data) {
        $('#tanggalpengajuanEdit').val(data.tanggal);
        $('#deptEdit').val(data.dept.trim());
        $('#nomorassetEdit').val(data.nomorAsset.trim());
        $('#namasaranaEdit').val(data.namaSarana.trim());
        $('#kerusakanEdit').val(data.kerusakan.trim());
        $('#kategoriEdit').val(data.kategori.trim());
        $('#tanggalperbaikanEdit').val(data.tanggalPerbaikan);
        $('#tanggalselesaiEdit').val(data.tanggalSelesai);
        $('#jenistindakanEdit').val(data.jenisTindakan);
        $('#levelkerusakanEdit').val(data.levelKerusakan);
        $('#statusEdit').val(data.status.trim());
        $('#penyebabEdit').val(data.penyebab.trim());
        $('#tindakanEdit').val(data.tindakan.trim());
        $('#saranEdit').val(data.saran.trim());
        $('#pemohonEdit').val(data.pemohon.trim());
        $('#petugasperbaikanEdit').val(data.petugasPerbaikan.trim());
        $('#hasilperbaikanEdit').val(data.hasilPerbaikan.trim());
        $('#verifikasiuserEdit').val(data.verifikasiUser.trim());

        // Simpan data original di dalam elemen tersembunyi
        $('#originalData').val(JSON.stringify(data));
        
        // show the modal form
        $('#formModalEdit').modal('show');

		// Set input tanggal pengajuan menjadi hanya baca saja
		$('input[name="tanggalpengajuanEdit"]').prop('readonly', true).attr('disabled', true);
    });

	// hapus sisa validasi valid dan invalid sebelumnya
	$('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
});


let formEdit = $('#form-Edit-data');

// Get the inputs.
let tanggalpengajuanEdit = formEdit.find('#tanggalpengajuanEdit');
let deptEdit = formEdit.find('#deptEdit');
let nomorassetEdit= formEdit.find('#nomorassetEdit');
let namasaranaEdit = formEdit.find('#namasaranaEdit');
let kerusakanEdit = formEdit.find('#kerusakanEdit');
let kategoriEdit = formEdit.find('#kategoriEdit');
let tanggalperbaikanEdit = formEdit.find('#tanggalperbaikanEdit');
let tanggalselesaiEdit = formEdit.find('#tanggalselesaiEdit');
let jenistindakanEdit = formEdit.find('#jenistindakanEdit');
let levelkerusakanEdit = formEdit.find('#levelkerusakanEdit');
let statusEdit = formEdit.find('#statusEdit');
let penyebabEdit = formEdit.find('#penyebabEdit');
let tindakanEdit = formEdit.find('#tindakanEdit');
let saranEdit = formEdit.find('#saranEdit');
let pemohonEdit = formEdit.find('#pemohonEdit');
let petugasperbaikanEdit = formEdit.find('#petugasperbaikanEdit');
let hasilperbaikanEdit = formEdit.find('#hasilperbaikanEdit');
let verifikasiuserEdit = formEdit.find('#verifikasiuserEdit');

// Ketika tombol "Simpan Perubahan" ditekan
formEdit.submit(function(event) { 
	event.preventDefault();

// Ambil nilai level user
let levelUser = $("#leveluser").val();

if (canManageIT) {
	
		// Mengambil nilai dari elemen input
		const namaLengkap = document.getElementById('namalengkap').value;
		const userName = document.getElementById("username").value;
		const levelUser = document.querySelector('#leveluser').value;
	
		// Get the form data.
        let formData = {
			'tanggal': tanggalpengajuanEdit.val() || ' ', // check if the value is empty or null, replace with a space if true
			'dept': deptEdit.val() || ' ',
			'nomorAsset': nomorassetEdit.val() || ' ',
			'namaSarana': namasaranaEdit.val() || ' ',
			'kerusakan': kerusakanEdit.val() || ' ',
			'kategori': kategoriEdit.val() || ' ',
			'tanggalPerbaikan': tanggalperbaikanEdit.val() || ' ',
			'tanggalSelesai': tanggalselesaiEdit.val() || ' ',
			'jenisTindakan': jenistindakanEdit.val() || ' ',
			'levelKerusakan': levelkerusakanEdit.val() || ' ',
			'status': statusEdit.val() || ' ',
			'penyebab': penyebabEdit.val() || ' ',
			'tindakan': tindakanEdit.val() || ' ',
			'saran': saranEdit.val() || ' ',
			'pemohon': pemohonEdit.val() || ' ',
			'petugasPerbaikan': petugasperbaikanEdit.val() || ' ',
			'hasilPerbaikan': hasilperbaikanEdit.val() || ' ',
			'verifikasiUser': verifikasiuserEdit.val() || ' ',
		};
	
		// Mendapatkan data original dari elemen tersembunyi
		let originalData = JSON.parse($('#originalData').val());
	
		//console.log(originalData);
		//console.log(formData);
		//debugger;

		// Menyimpan nilai status di variable sendiri
		//let statusOld = originalData.status;
		
		let isFormDataEqual = true;
	
		Object.keys(formData).forEach(function(key) {
			if (formData[key] !== originalData[key]) {
				isFormDataEqual = false;
				console.log("Properti " + key + " tidak sama.");
			}
		});
	
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
				//console.log('id = ' + id)

				$.ajax({
					url: '/api/datapermintaanit/' + id,
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
			
						// Reset input values in the form
						tanggalpengajuanEdit.val('');
						deptEdit.val('');
						nomorassetEdit.val('');
						namasaranaEdit.val('');
						kategoriEdit.val('');
						tanggalperbaikanEdit.val('');
						tanggalselesaiEdit.val('');
						jenistindakanEdit.val('');
						levelkerusakanEdit.val('');
						statusEdit.val('');
						penyebabEdit.val('');
						tindakanEdit.val('');
						saranEdit.val('');
						pemohonEdit.val('');
						petugasperbaikanEdit.val('');
						hasilperbaikanEdit.val('');
						verifikasiuserEdit.val('');
					},
					error: function(error) {
						// Tampilkan pesan gagal
						alert(error.responseJSON.status + '\n' + error.responseJSON.error);
					}
				});
			
		}

} else {
	// Tampilkan modal "Denied" 
	document.getElementById("deniedModalLabel").innerHTML = "Edit Data";
	$('#deniedModal .modal-body').html('User anda tidak diizinkan untuk melakukan edit data void');
	$('#deniedModal').modal('show');
}
	

});


// Fungsi untuk menghapus data
function deleteData(nomorId, nomorAsset, loginNama) {
	// Tampilkan modal "Delete" dan nomor dokumen yang akan dihapus
	$('#deleteModal .modal-body').html('Apakah Anda yakin ingin menghapus data laporan <b>' + loginNama + '</b>, dengan Nomor Asset berikut : <b>' + nomorAsset + '</b>?<br><br><b>Mohon cek kembali sebelum melanjutkan !</b>');
	// Tampilkan modal "Delete"
	$('#deleteModal').modal('show');

	// Ketika tombol "Hapus" diklik pada modal "Delete"
	$('.btn-confirm-delete').on('click', function() {
		// Kirim permintaan DELETE ke API
		$.ajax({
			type: 'DELETE',
			url: '/api/datapermintaanit/' + nomorId,
			success: function(response) {
				// Tampilkan pesan sukses di console log
				//console.log(response.status);
				// Refresh halaman
				clearData();
				loadData();
				$("#deleteModal").modal("hide");

				let successMessage = "Laporan dengan Nomor Asset = "+ nomorAsset + " berhasil dihapus !";
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
	const levelUser = document.querySelector('#leveluser').value;
	let nomorId = $(this).data('id');
	let nomorAsset = $(this).data('nomor_asset');
	let loginNama = $(this).data('login_nama');

	// console.log(nomorId);
	// Panggil fungsi untuk menghapus data
	if (canManageIT) {
        deleteData(nomorId, nomorAsset, loginNama);
    } else {
		// Tampilkan modal "Denied Delete" 
		document.getElementById("deniedModalLabel").innerHTML = "Hapus Data";
		$('#deniedModal .modal-body').html('User anda tidak diizinkan untuk menghapus data ini');
        $('#deniedModal').modal('show');
    }

}); 