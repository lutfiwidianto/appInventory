function loadData() {
	$("#example1").DataTable({
		"ajax": {
			"url": "/api/dataallprbarang",
			"dataSrc": "",
			"error": function (xhr, error, thrown) {
				console.log(xhr);
				console.log(error);
				console.log(thrown);
			}
		},
		"columns": [
			{ "data": "id", visible: false },
			{ "data": "nomorPr" },
			{ "data": "tanggalPr" },
			{ "data": "kodeBarang" },
			{ "data": "namaBarang" },
			{ "data": "deskripsiBarang", visible: false },
			{ "data": "qtyPr" },
			{ "data": "qtyTerima" },
			{ "data": "qtySisa" },
			{ "data": "satuan" },
			{ "data": "status" },
			{ "data": "deadLine" },
			{ "data": "keterangan" },
			{ "data": "userInput", visible: false },
			{
				"data": null,
				"render": function (data, type, row) {
					return '<td style="text-align: center;">' +
						'<button type="button" class="btn btn-info btn-detail" data-toggle="modal" data-nomor_pr="' + row.nomorPr + '"><i class="fas fa-info-circle fa-xs"></i> Detail</button>' +
						'</td>';
				}
			}

			/*
			,
			{
				"data": null,
				"render": function (data, type, row) {
					return '<td style="text-align: center;">' +
						'<button type="button" class="btn btn-warning btn-edit" data-toggle="modal" data-id="' + row.id + '"><i class="fas fa-edit fa-xs"></i></button>' +
						'<button type="button" class="btn btn-danger btn-delete" data-toggle="modal" data-id="' + row.id + '" data-nomor_asset="' + row.kodeBarang + '" data-login_nama="' + row.namaBarang + '"><i class="fas fa-trash-alt fa-xs"></i></button>' +
						'</td>';
				}
			}
			*/
		],
		"order": [
			[0, "desc"]
		],
		"responsive": true,
		"autoWidth": false
	});
}

$(function () {
	// Set the format for date and time
	var format = 'MM/DD/YYYY';

	// Tanggal Pr tambah
	$('#tanggalprbarangDiv').datetimepicker({
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
	$('#tanggalprbarangDiv').on('change.datetimepicker', function (e) {
		var date = moment(e.date).format(format);
		$('input[name="tanggalprbarang"]').val(date);
	});

	// Disable input field on calendar icon click
	$('#tanggalprbarangDiv .input-group-append').on('click', function () {
		$('#tanggalprbarangDiv').datetimepicker('date', moment()); // Set to today's date
		$('input[name="tanggalprbarang"]').prop('readonly', true); // Disable input field
	});
});

function clearData() {
	//$('#example1').DataTable().clear().draw();
	$('#example1').DataTable().clear().destroy();
}

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

var counter = 1; // Variabel global untuk menghitung jumlah item yang ditambahkan

// Fungsi untuk menambahkan item baru
function tambahItemPR() {

	// Langkah 1: Dapatkan elemen <div class="container-fluid">
	var container = document.getElementById("containerfluid");

	// Langkah 2: Simpan kode HTML yang ingin dimasukkan dalam variabel htmlCode
	var htmlCode = `
	<div id="itemContainer${counter}" class="row flex-row flex-nowrap mt-4 pb-4 pt-2" style="display: flex;">
	<div class="col-3 item-row">
	  <label>KODE BARANG :</label>
	  <input type="text" class="form-control kode-barang" id="kode-barang-${counter}" name="kode-barang-${counter}" placeholder="Masukkan Kode Barang" required autocomplete="off">
	</div>
	<div class="col-3 item-row">
	  <label>NAMA BARANG :</label>
	  <input type="text" class="form-control nama-barang" id="nama-barang-${counter}" name="nama-barang-${counter}" placeholder="" required autocomplete="off" disabled>
	</div>
	<div class="col-3 item-row">
	  <label>DESKRIPSI BARANG :</label>
	  <input type="text" class="form-control deskripsi-barang" id="deskripsi-barang-${counter}" name="deskripsi-barang-${counter}" placeholder="Masukkan Deskripsi Barang" required autocomplete="off">
	</div>
	<div class="col-2 item-row">
	  <label>QTY PR :</label>
	  <input type="text" class="form-control qty-pr" id="qty-pr-${counter}" name="qty-pr-${counter}" placeholder="Masukkan Qty PR" required autocomplete="off">
	</div>
	<div class="col-1 item-row">
	  <label>SATUAN :</label>
	  <input type="text" class="form-control satuan" id="satuan-${counter}" name="satuan-${counter}" placeholder="" required autocomplete="off" disabled>
	</div>
	<div class="col-2 item-row">
	  <label>STATUS :</label>
	<select id="status-${counter}" name="status-${counter}" class="form-control" style="width: 100%;">
	  <option selected disabled value="Pending">Pending</option>
	</select>
	</div>
	<div class="col-3 item-row">
	  <label>DEADLINE :</label>
	  <textarea class="form-control deadline" id="deadline-${counter}" name="deadline-${counter}" placeholder="Masukkan Deadline" required autocomplete="off"></textarea>
	</div>
	<div class="col-3 item-row">
	  <label>KETERANGAN :</label>
	  <textarea class="form-control keterangan" id="keterangan-${counter}" name="keterangan-${counter}" placeholder="Masukkan Keterangan" required autocomplete="off"></textarea>
	</div>
	<div class="col-1 item-row">
	  <br>
	  <button class="hapus-item btn btn-danger" onclick="hapusItem('itemContainer${counter}')" style="cursor: pointer;">
	  <i class="fas fa-times"></i> Hapus Baris
	  </button>
	</div>
	</div>
	`;

	// Langkah 3: Masukkan kode HTML ke dalam elemen <div class="container-fluid">
	container.insertAdjacentHTML("beforeend", htmlCode);

	// Ambil input kode barang yang baru ditambahkan
	var kodeBarang = document.getElementById(`kode-barang-${counter}`);
	var deskripsiBarang = document.getElementById(`deskripsi-barang-${counter}`);
	var keterangan = document.getElementById(`keterangan-${counter}`);

	kodeBarang.addEventListener("input", (function (counter) {
		return function (event) {
			this.value = this.value.toUpperCase();
			if (this.value !== "") {
				autofillLogic(event, counter);
			}
		};
	})(counter));

	deskripsiBarang.addEventListener("input", function () {
		this.value = this.value.toUpperCase();
	});

	keterangan.addEventListener("input", function () {
		this.value = this.value.toUpperCase();
	});

	counter++; // Tingkatkan counter setelah item ditambahkan

	// Fungsi untuk logika autofill
	function autofillLogic(event, counter) {
		var kodeBarangInput = event.target.value; // Ambil nilai kode barang yang diinput
		// Dapatkan elemen input nama barang dan satuan yang sesuai dengan counter container
		var namaBarang = document.querySelector(`#itemContainer${counter} .nama-barang`);
		var satuan = document.querySelector(`#itemContainer${counter} .satuan`);

		// Lakukan request ke API dengan menggunakan kodeBarang
		fetch(`/autofilliprbarang/${kodeBarangInput}`)
			.then(response => response.json())
			.then(data => {
				// Periksa apakah data berhasil ditemukan
				if (data.results.length > 0) {
					// Ambil data nama barang pertama
					//console.log(data.results[0]);
					//console.log(data.results[0].NamaBarangIndo);
					//console.log(data.results[0].SatuanIndo);

					// Jika elemen input nama barang dan satuan ditemukan, atur nilai value
					namaBarang.value = data.results[0].NamaBarangIndo;
					satuan.value = data.results[0].SatuanIndo;
				} else {
					/////

					//console.log("TIDAK DITEMUKAN");
					namaBarang.value = "TIDAK DITEMUKAN";
					satuan.value = "";

					// Ganti warna dan gaya tulisan "TIDAK DITEMUKAN" secara berulang
					var colorIndex = 0;
					var colors = ["red", "blue", "green"]; // Daftar warna yang akan digunakan

					// Fungsi untuk mengubah warna dan gaya tulisan secara periodik
					function changeColorAndStyle() {
						namaBarang.style.color = colors[colorIndex];
						namaBarang.style.fontWeight = "bold";
						colorIndex = (colorIndex + 1) % colors.length;
					}

					// Set interval untuk mengubah warna dan gaya setiap 500 milidetik
					var intervalId = setInterval(changeColorAndStyle, 500);

					// Set timeout untuk menghentikan pergantian warna dan gaya setelah 5 detik
					setTimeout(function () {
						clearInterval(intervalId);
						namaBarang.style.color = ""; // Mengembalikan warna tulisan ke default
						namaBarang.style.fontWeight = ""; // Mengembalikan gaya tulisan ke default
					}, 5000);

					/////
				}
			})
			.catch(error => {
				console.error("Terjadi kesalahan pada saat mengambil data dari API", error);
			});

	}

}


var tambahItemBtn = document.getElementById("tambahItemBtnPr");
tambahItemBtn.addEventListener("click", function (event) {
	event.preventDefault(); // Mencegah perilaku default tombol tambahItemBtnPr
	tambahItemPR();
});


function hapusItem(containerId) {
	var container = document.getElementById(containerId);
	container.remove();
	event.preventDefault(); // Mencegah perilaku default tombol hapus-item
}

function collectFormData() {
	var tanggalpr = document.getElementById('tanggalprbarang').value;
	var nomordepanpr = document.getElementById('depannomorprKeluar').value;
	var nomorpr = document.getElementById('isinomorprKeluar').value;

	var items = document.querySelectorAll('[id^="itemContainer"]'); // Ambil semua elemen dengan id yang dimulai dengan "itemContainer"
	var formData = []; // Array untuk menyimpan data formulir
	var isDataValid = true; // Flag untuk menandakan validitas data

	// Lakukan validasi pada tanggalPR
	if (tanggalpr.trim() === "") {
		isDataValid = false;
		// Tampilkan pesan error pada elemen tanggalPR yang tidak valid
		document.getElementById('tanggalprbarang').classList.add('is-invalid');
	} else {
		// Hapus pesan error jika tanggalPR valid
		document.getElementById('tanggalprbarang').classList.remove('is-invalid');
	}

	// Lakukan validasi pada noPR
	if (nomorpr.trim() === "") {
		isDataValid = false;
		// Tampilkan pesan error pada elemen noPR yang tidak valid
		document.getElementById('isinomorprKeluar').classList.add('is-invalid');
	} else if (!Number.isInteger(Number(nomorpr))) {
		isDataValid = false;
		// Tampilkan pesan error pada elemen noPR yang tidak valid
		document.getElementById('isinomorprKeluar').classList.add('is-invalid');
	} else {
		// Hapus pesan error jika noPR valid
		document.getElementById('isinomorprKeluar').classList.remove('is-invalid');
	}

	// Iterasi melalui setiap elemen item
	items.forEach(function (item) {
		var kodeBarang = item.querySelector('.kode-barang').value;
		var namaBarang = item.querySelector('.nama-barang').value;
		var deskripsiBarang = item.querySelector('.deskripsi-barang').value;
		var qtyPr = item.querySelector('.qty-pr').value;
		var satuan = item.querySelector('.satuan').value;
		var status = item.querySelector('[id^="status"]').value;
		var keterangan = item.querySelector('.keterangan').value;
		var deadline = item.querySelector('.deadline').value;

		// Buat objek dengan data formulir dan tambahkan ke array formData
		formData.push({
			tanggalPR: tanggalpr,
			noPR: nomordepanpr + nomorpr,
			kodeBarang: kodeBarang,
			namaBarang: namaBarang,
			deskripsiBarang: deskripsiBarang,
			qtyPR: qtyPr,
			satuan: satuan,
			status: status,
			keterangan: keterangan,
			deadline: deadline

		});

		// Lakukan validasi pada kodeBarang
		if (kodeBarang.trim() === "") {
			isDataValid = false;
			// Tampilkan pesan error pada elemen kodeBarang yang tidak valid
			item.querySelector('.kode-barang').classList.add('is-invalid');
		} else {
			// Hapus pesan error jika kodeBarang valid
			item.querySelector('.kode-barang').classList.remove('is-invalid');
		}

		// Lakukan validasi pada namaBarang
		if (namaBarang === "TIDAK DITEMUKAN") {
			isDataValid = false;
			// Tampilkan pesan error pada elemen namaBarang yang tidak valid
			item.querySelector('.nama-barang').classList.add('is-invalid');
		} else {
			// Hapus pesan error jika namaBarang valid
			item.querySelector('.nama-barang').classList.remove('is-invalid');
		}

		// Lakukan validasi pada qtyPR Agar berupa angka
		if (isNaN(qtyPr)) {
			isDataValid = false;
			// Tampilkan pesan error pada elemen qtyPR yang tidak valid
			item.querySelector('.qty-pr').classList.add('is-invalid');
		} else {
			// Hapus pesan error jika qtyPR valid
			item.querySelector('.qty-pr').classList.remove('is-invalid');
		}
	});

	// Cek validitas data sebelum mengirim permintaan POST
	if (!isDataValid) {
		console.error("Data tidak valid. Silakan periksa kembali.");
		var pesanAlert = document.getElementById("pesanAlert");

		if (pesanAlert) {
			// Hapus elemen pesan alert jika sudah ada dalam DOM
			pesanAlert.remove();
		}

		// Buat kembali elemen pesan alert
		pesanAlert = document.createElement("div");
		pesanAlert.id = "pesanAlert";
		pesanAlert.className = "alert alert-danger alert-dismissible fade show";
		pesanAlert.role = "alert";
		pesanAlert.style.width = "400px";
		pesanAlert.style.display = "block";
		pesanAlert.innerHTML = `
		<strong>Data tidak valid. Silakan periksa kembali.</strong>
		<button type="button" class="close" data-dismiss="alert" aria-label="Close">
			<span aria-hidden="true">&times;</span>
		</button>
		`;

		// Sisipkan elemen pesan alert ke dalam DOM
		var container = document.getElementById("pesanContainer");
		if (container) {
			container.appendChild(pesanAlert);
		} else {
			console.error("Elemen container tidak ditemukan dalam DOM.");
		}

		// Menampilkan kembali pesan alert setelah dihapus
		pesanAlert.style.display = "block";

		// Mengubah tampilan pesan alert menjadi "none" setelah 3 detik
		setTimeout(function () {
			pesanAlert.style.display = "none";
		}, 2500);

		return;
	}

	// Cetak data formulir ke konsol dalam format JSON
	console.log(JSON.stringify(formData, null, 2));

	// Kirim data formulir sebagai permintaan POST ke endpoint
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/proses_tambah_data_pr");
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onreadystatechange = function () {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				console.log("Data berhasil ditambahkan");
				$('#formModal').modal('hide');
				refreshData();

				// Mengosongkan nilai input form
				document.getElementById('tanggalprbarang').value = '';
				document.getElementById('depannomorprKeluar').value = '';
				document.getElementById('isinomorprKeluar').value = '';
				items.forEach(function (item) {
					item.querySelector('.kode-barang').value = '';
					item.querySelector('.nama-barang').value = '';
					item.querySelector('.deskripsi-barang').value = '';
					item.querySelector('.qty-pr').value = '';
					item.querySelector('.satuan').value = '';
					item.querySelector('[id^="status"]').value = '';
					item.querySelector('.keterangan').value = '';
					item.querySelector('.deadline').value = '';
				});

				let successMessage = "Data PR berhasil dibuat!";
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


			} else {
				console.error("Terjadi kesalahan saat menambahkan data");
			}
		}
	};

	xhr.send(JSON.stringify(formData));
}

var submitBtn = document.getElementById("submitBtn");
submitBtn.addEventListener("click", function (event) {
	event.preventDefault(); // Mencegah perilaku default tombol submit
	collectFormData();
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
	$('#btnRefresh').on('click', function () {
		clearData();
		loadData();
	});

	// Hapus jika ada validasi form tambah data modal yang tersisa dari sebelumnya
	$('#formModal').on('show.bs.modal', function () {
		const levelUser = $('#leveluser').val();
		document.getElementById("pesanAlert").style.display = "none";
		document.getElementById("depannomorprKeluar").value = "TCTI/PR/";

		// Cek apakah item sudah ada atau belum
		var itemExist = document.getElementById(`itemContainer${counter - 1}`);
		if (!itemExist) {
			tambahItemPR();
		}

		if (levelUser == '1') {

		} else {

		}
	});
});




