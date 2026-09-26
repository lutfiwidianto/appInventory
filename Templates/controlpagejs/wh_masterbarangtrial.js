

function refreshData() {
	clearData();
	loadData();
}

function showAlert() {
	$('#myModal').modal({
		backdrop: false,
		keyboard: true
	});
	setTimeout(function () {
		$('#myModal').modal('hide');
	}, 5000);

}


function clearData() {
	//$('#example1').DataTable().clear().draw();
	$('#example1').DataTable().clear().destroy();
}


function loadData() {
	$("#example1").DataTable({
		"ajax": {
			"url": "/api/datamasterbarangtrial",
			"dataSrc": "",
			"error": function (xhr, error, thrown) {
				console.log(xhr);
				console.log(error);
				console.log(thrown);
			}
		},
		"columns": [
            { data: "no", visible: true },
            { data: "id", visible: true },
            { data: "kodeBarang" },
            { data: "namabarangIdn" },
            { data: "namabarangMand" },
            { data: "satuan" },
            { data: "rak" },
            { data: "kategoriBarang" },
            { data: "Class" },
            {
                data: null,
                render: function (data, type, row) {
                    return '<td style="text-align: center;">' +
                        '<button type="button" class="btn btn-warning btn-edit" data-toggle="modal" data-id="' + row.id + '"><i class="fas fa-edit fa-xs"></i> Edit</button>' +
                        '</td>';
                }
            }
        ],
		"scrollX": true,
		"order": [
			[1, "desc"]
		],
		"pageLength": 10,
		"lengthMenu": [
			[5, 10, 25, 50, -1],
			[5, 10, 25, 50, "All"]
		],
		initComplete: function () {
            var api = this.api();

            api.on('page.dt', function () {
                var pageInfo = api.page.info();
                console.log("Page clicked:", pageInfo.page + 1);
            });

            $('#example1_length select').on('change', function () {
                var selectedLength = parseInt($(this).val(), 10);
                console.log("Page length selected:", selectedLength);
            });
        }
	});

}

document.getElementById('form-tambah-data').addEventListener('submit', function (event) {
	event.preventDefault(); // Menghentikan pengiriman form bawaan

	const namaLengkap = document.getElementById('namalengkap').value.trim();
	let levelUser = $("#leveluser").val();

	// Mengambil nilai input dari form
	let kodeBarang = document.getElementById('kodeBarang').value;
	let namaBarangIndo = document.getElementById('namaBarangIndo').value;
	let namaBarangMand = document.getElementById('namaBarangMand').value;
	let satuanIndo = document.getElementById('satuanIndo').value;
	let satuanMand = document.getElementById('satuanMand').value;
	let racking = document.getElementById('racking').value;
	let kategoriBarang = document.getElementById('kategoriBarang').value;
	let jenisBarang = document.getElementById('jenisBarang').value;
	let classBarang = document.getElementById('klasifikasi').value;

	// Mendapatkan tanggal saat ini
	let createdDate = new Date();

	// Validasi kodeBarang harus diisi
	if (kodeBarang.trim() === '') {
		let invKodeBarang1 = document.querySelector('.inv-kodeBarangTambah1');
		invKodeBarang1.style.display = 'block';

		// Sembunyikan pesan validasi sebelumnya
		let invKodeBarang2 = document.querySelector('.inv-kodeBarangTambah2');
		invKodeBarang2.style.display = 'none';

		// Fokus ke form kode barang
		let kodeBarangInput = document.getElementById('kodeBarang');
		kodeBarangInput.style.outline = '1px solid red';
		kodeBarangInput.focus();
		return; // Menghentikan eksekusi jika kodeBarang kosong
	}

	// Validasi nama barang harus diisi
	if (namaBarangIndo.trim() === '') {
		let invnamaBarangIndo1 = document.querySelector('.inv-namaBarangIndoTambah1');
		invnamaBarangIndo1.style.display = 'block';

		// Fokus ke form nama barang
		let namaBarangIndoInput = document.getElementById('namaBarangIndo');
		namaBarangIndoInput.style.outline = '1px solid red';
		namaBarangIndoInput.focus();
		return; // Menghentikan eksekusi jika nama barang kosong
	}

	// Validasi satuan harus diisi
	if (satuanIndo.trim() === '') {
		let invsatuanIndo1 = document.querySelector('.inv-satuanIndoTambah1');
		invsatuanIndo1.style.display = 'block';

		// Fokus ke form satuan
		let satuanIndoInput = document.getElementById('satuanIndo');
		satuanIndoInput.style.outline = '1px solid red';
		satuanIndoInput.focus();
		return; // Menghentikan eksekusi jika satuan kosong
	}

	// Validasi kategoriBarang harus diisi
	if (kategoriBarang.trim() === '') {
		let invkategoriBarang1 = document.querySelector('.inv-kategoriBarangTambah1');
		invkategoriBarang1.style.display = 'block';

		// Fokus ke form kode barang
		let kategoriBarangInput = document.getElementById('kategoriBarang');
		kategoriBarangInput.style.outline = '1px solid red';
		kategoriBarangInput.focus();
		return; // Menghentikan eksekusi jika kategoriBarang kosong
	}

	// Membuat objek data yang akan dikirim ke server
	let data = {
		kodeBarang: kodeBarang,
		namaBarangIndo: namaBarangIndo,
		namaBarangMand: namaBarangMand,
		satuanIndo: satuanIndo,
		satuanMand: satuanMand,
		racking: racking,
		kategoriBarang: kategoriBarang,
		jenisBarang: jenisBarang,
		TanggalCreated: createdDate,
		userInput: namaLengkap,
		classBarang: classBarang,
	};

	if (levelUser === '1' || levelUser === '11' || levelUser === '12') {
		
		// Mengirim permintaan POST ke server hanya jika kode barang belum ada
		fetch('/api/datamasterbarang', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(function (response) {
				return response.json();
			})
			.then(function (responseData) {
				console.log(responseData); // Menampilkan respons dari server
				// Lakukan tindakan sesuai respons dari server
				if (responseData.message === 'Kode barang sudah ada') {
					// Tampilkan pesan error bahwa kode barang sudah ada
					let invKodeBarang2 = document.querySelector('.inv-kodeBarangTambah2');
					invKodeBarang2.style.display = 'block';

					// Sembunyikan pesan validasi sebelumnya
					let invKodeBarang1 = document.querySelector('.inv-kodeBarangTambah1');
					invKodeBarang1.style.display = 'none';

					// Fokus ke form kode barang
					let kodeBarangInput = document.getElementById('kodeBarang');
					kodeBarangInput.style.outline = '1px solid red';
					kodeBarangInput.focus();
				} else {
					// Lakukan tindakan lain setelah data berhasil dikirim
					$('#formModal').modal('hide');
					refreshData();

					let successMessage = "Barang masuk berhasil ditambahkan!";
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

					// Mengosongkan nilai input setelah pengiriman berhasil
					document.getElementById('kodeBarang').value = '';
					document.getElementById('namaBarangIndo').value = '';
					document.getElementById('namaBarangMand').value = '';
					document.getElementById('satuanIndo').value = '';
					document.getElementById('satuanMand').value = '';
					document.getElementById('racking').value = '';
					document.getElementById('kategoriBarang').value = '';
				}
			})
			.catch(function (error) {
				console.log('Error:', error);
				// Lakukan tindakan jika terjadi kesalahan
			});

	} else {
	}

});



$(document).ready(function () {

	// Function to reload the page after a certain delay
	function reloadPage() {
		setTimeout(function () {
			window.location.reload();
		}, 2000); // Reload after 5 seconds
	}

	window.addEventListener('error', function(event) {
        var errorMessage = event.message;
        if (errorMessage && errorMessage.includes('net::ERR_CONTENT_LENGTH_MISMATCH')) {
            console.error('Error: Ada error mismacth hehe');
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

		
		let levelUser = document.querySelector('#leveluser').value;

		// Panggil fungsi untuk menghapus data
		if (levelUser == '1' || levelUser == '11' || levelUser == '12') {


		} else {

			let successMessage = "User anda tidak diizinkan menambah item baru!";
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

		}


		$('.form-control').removeClass('is-valid');
	});


	$('#formModalEdit').on('show.bs.modal', function () {
		//console.log('Form modal edit muncul');
		// hapus sisa validasi valid dan invalid sebelumnya
		$('.is-valid, .is-invalid').removeClass('is-valid is-invalid');

	});



	// Add event listener to capitalize input on keyup.

	let kodeBarangInput = document.getElementById('kodeBarang');
	kodeBarangInput.addEventListener('keyup', function () {
		this.value = this.value.toUpperCase();
	});

	let namaBarangIndo = document.getElementById('namaBarangIndo');
	namaBarangIndo.addEventListener('keyup', function () {
		this.value = this.value.toUpperCase();
	});

	let namaBarangMand = document.getElementById('namaBarangMand');
	namaBarangMand.addEventListener('keyup', function () {
		this.value = this.value.toUpperCase();
	});

	let satuanIndo = document.getElementById('satuanIndo');
	satuanIndo.addEventListener('keyup', function () {
		this.value = this.value.toUpperCase();
	});

	let satuanMand = document.getElementById('satuanMand');
	satuanMand.addEventListener('keyup', function () {
		this.value = this.value.toUpperCase();
	});

	let racking = document.getElementById('racking');
	racking.addEventListener('keyup', function () {
		this.value = this.value.toUpperCase();
	});

	let kategoriBarang = document.getElementById('kategoriBarang');
	kategoriBarang.addEventListener('keyup', function () {
		this.value = this.value.toUpperCase();
	});


});

/* PEMBUKA CONTROL FORM EDIT */

$(document).on('click', '.btn-edit', function () {
	// Ambil nilai level user
	let levelUser = $("#leveluser").val();
	let idPrimarykey = $(this).data('id');
	$('#idEdit').val(idPrimarykey); // menyimpan nilai Id pada elemen form yang tersembunyi
	console.log(idPrimarykey);
	// Mendapatkan data original dan menyimpannya di dalam elemen tersembunyi
	$.get('/api/datamasterbarang/' + idPrimarykey, function (data) {
		// console.log(data); // Menampilkan data di konsol
		$('#idEdit').val(data.id);
		$('#kodebarangEdit').val(data.kodeBarang);
		$('#namabarangindoEdit').val(data.namaBarangIndo);
		$('#namabarangmandEdit').val(data.namaBarangMand);
		$('#satuanindoEdit').val(data.satuanIndo);
		$('#satuanmandEdit').val(data.satuanMand);
		$('#rackingEdit').val(data.racking);
		$('#kategoribarangEdit').val(data.kategoriBarang);
		$('#jenisBarangEdit').val(data.jenisBarang);
		$('#klasifikasiEdit').val(data.classBarang);

		// Simpan data original di dalam elemen tersembunyi
		$('#originalData').val(JSON.stringify(data));

		// show the modal form
		$('#editModal').modal('show');

		// Level 1 SuperAdmin
		// Level 11 SPV Gudang
		// Level 12 Admin Gudang
		// Level 13 Operator Gudang
		// Level 13 Operator Gudang


		if (levelUser === '1' || levelUser === '11') {
			// Diizinkan untuk melakukan edit
			var inputElements = document.getElementsByClassName('form-control');

			for (var i = 0; i < inputElements.length; i++) {
				inputElements[i].readOnly = false;
			}

			var selectKategoriBarang = document.getElementById('kategoribarangEdit');
			var selectJenisBarang = document.getElementById('jenisBarangEdit');

			selectKategoriBarang.disabled = false;
			selectJenisBarang.disabled = false;

		} else if (levelUser === '12') {
			// Tambahkan kondisi atau perintah yang sesuai untuk level ini
			var inputElements = document.getElementsByClassName('form-control');

			// Meloopingi semua elemen input dan mengubah atribut "readonly" menjadi "true"
			for (var i = 0; i < inputElements.length; i++) {
				inputElements[i].readOnly = true;
			}

			// Mendapatkan elemen select dengan id "kategoribarangEdit" dan "jenisBarangEdit"
			var selectKategoriBarang = document.getElementById('kategoribarangEdit');
			var selectJenisBarang = document.getElementById('jenisBarangEdit');

			// Mengubah atribut "disabled" pada elemen select menjadi "true"
			selectKategoriBarang.disabled = true;
			selectJenisBarang.disabled = true;

			// Mengubah atribut "readonly" dan "disabled" pada elemen input dengan nama "rackingEdit" menjadi "false"
			$('input[name="rackingEdit"]').prop('readonly', false).attr('disabled', false);

		} else {
			// Tidak diizinkan untuk melakukan edit untuk level selain yang terdaftar di atas
			var inputElements = document.getElementsByClassName('form-control');

			for (var i = 0; i < inputElements.length; i++) {
				inputElements[i].readOnly = true;
			}

			var selectKategoriBarang = document.getElementById('kategoribarangEdit');
			var selectJenisBarang = document.getElementById('jenisBarangEdit');

			selectKategoriBarang.disabled = true;
			selectJenisBarang.disabled = true;
		}

	});

});


let formEdit = $('#form-Edit-data');


// Ketika tombol "Simpan Perubahan" ditekan
formEdit.submit(function (event) {
	event.preventDefault();

	// Ambil nilai level user
	let levelUser = $("#leveluser").val();

	if (levelUser === '1' || levelUser === '11' || levelUser === '12') {

		// Mengambil nilai dari elemen input
		const namaLengkap = document.getElementById('namalengkap').value;
		const userName = document.getElementById("username").value;
		const levelUser = document.querySelector('#leveluser').value;

		// Mengambil nilai dari elemen input
		let idEdit = formEdit.find('.idEdit').val();
		let kodebarangEdit = formEdit.find('#kodebarangEdit').val();
		let namabarangindoEdit = formEdit.find('#namabarangindoEdit').val();
		let namabarangmandEdit = formEdit.find('#namabarangmandEdit').val();
		let satuanindoEdit = formEdit.find('#satuanindoEdit').val();
		let satuanmandEdit = formEdit.find('#satuanmandEdit').val();
		let rackingEdit = formEdit.find('#rackingEdit').val();
		let kategoribarangEdit = formEdit.find('#kategoribarangEdit').val();
		let jenisbarangEdit = formEdit.find('#jenisBarangEdit').val();
		let classbarangEdit = formEdit.find('#klasifikasiEdit').val();


		// Get the form data.
		let formData = {
			'kodeBarang': kodebarangEdit || '',
			'namaBarangIndo': namabarangindoEdit || '',
			'namaBarangMand': namabarangmandEdit || '',
			'satuanIndo': satuanindoEdit || '',
			'satuanMand': satuanmandEdit || '',
			'racking': rackingEdit || '',
			'kategoriBarang': kategoribarangEdit || '',
			'jenisBarang': jenisbarangEdit || '',
			'classBarang': classbarangEdit || '',
		};

		// Mendapatkan data original dari elemen tersembunyi
		let originalData = JSON.parse($('#originalData').val());

		// console.log(originalData);
		console.log(formData);
		console.log(originalData);

		// Menyimpan nilai status di variabel sendiri
		// let statusOld = originalData.status;

		let isFormDataEqual = true;

		Object.keys(formData).forEach(function (key) {
			if (formData[key] !== originalData[key]) {
				isFormDataEqual = false;
				console.log("Properti " + key + " tidak sama.");
			}
		});

		// debugger;
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
			console.log("Form data tidak sama dengan original data");

			// lakukan AJAX
			let id = $('#idEdit').val();
			console.log('id = ' + id)
			// debugger;

			$.ajax({
				url: '/api/datamasterbarang/' + id,
				method: 'PUT',
				contentType: 'application/json',
				data: JSON.stringify(formData),
				success: function (response) {
					// hapus sisa validasi valid sebelumnya
					$('.is-valid').removeClass("is-valid");

					// Tutup modal form
					$('#editModal').modal('hide');

					let successMessage = "Perubahan berhasil dilakukan, silahkan cek data anda!";
					let modal = document.getElementById("myModal");
					let modalBody = modal.querySelector(".modal-content .alert");
					let alert = modal.querySelector(".alert");

					// ubah pesan pada modal
					modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${successMessage}`;

					// tambah class yang sesuai dengan jenis pesan
					alert.classList.add("alert-warning");
					// atur warna latar belakang sesuai dengan jenis pesan
					alert.style.backgroundColor = "#d4edda"; // warna hijau yang sama dengan .alert-success di Bootstrap

					showAlert();

					// Refresh data
					refreshData()



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

