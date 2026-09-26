
function loadData() {
	let table = $("#example1").DataTable({
		"ajax": {
			"responsive": true,
			"scrollX": true, // Enable horizontal scrolling
			"url": "/api/dataallrcbarang",
			"dataSrc": "",
			"error": function (xhr, error, thrown) {
				console.log(xhr);
				console.log(error);
				console.log(thrown);
			}
		},
		"columns": [
			{ "data": "id", visible: true },
			{ "data": "nomorPr" },
			{ "data": "tanggalReceive" },
			{ "data": "noBpb" },
			{ "data": "kodeBarang" },
			{ "data": "namaBarang" },
			{ "data": "qtyTerima" },
			{ "data": "satuan" },
			{ "data": "supplier" },
			{ "data": "keterangan" },
			{ "data": "kategoriBarang" },
			// Render logo PNG untuk kolom 'dokInvoice'
			{
				"data": "dokInvoice",
				"render": function (data, type, row) {
					if (type === "display" && data !== null && data !== "") {
						// Tampilkan logo PNG sebagai pengganti tautan PDF
						return '<a href="' + data + '" target="_blank">' +
							'<img src="/static/img/logo_pdf.png" alt="PDF Logo" style="width: 50px; height: 50px; display: block; margin: 0 auto;" />' +
							'</a>';
					} else {
						// Jika data kosong, tampilkan teks kosong atau sesuaikan dengan kebutuhan Anda
						return data;
					}
				}
			},
			{
				"data": "dokSuratJalan",
				"render": function (data, type, row) {
					if (type === "display" && data !== null && data !== "") {
						return '<a href="' + data + '" target="_blank">' +
							'<img src="/static/img/logo_pdf.png" alt="PDF Logo" style="width: 50px; height: 50px; display: block; margin: 0 auto;" />' +
							'</a>';
					} else {
						return data;
					}
				}
			},
			{
				"data": "dokPackingList",
				"render": function (data, type, row) {
					if (type === "display" && data !== null && data !== "") {
						return '<a href="' + data + '" target="_blank">' +
							'<img src="/static/img/logo_pdf.png" alt="PDF Logo" style="width: 50px; height: 50px; display: block; margin: 0 auto;" />' +
							'</a>';
					} else {
						return data;
					}
				}
			},
			{
				"data": "dokBc",
				"render": function (data, type, row) {
					if (type === "display" && data !== null && data !== "") {
						return '<a href="' + data + '" target="_blank">' +
							'<img src="/static/img/logo_pdf.png" alt="PDF Logo" style="width: 50px; height: 50px; display: block; margin: 0 auto;" />' +
							'</a>';
					} else {
						return data;
					}
				}
			},
			{
				"data": "dokSppb",
				"render": function (data, type, row) {
					if (type === "display" && data !== null && data !== "") {
						return '<a href="' + data + '" target="_blank">' +
							'<img src="/static/img/logo_pdf.png" alt="PDF Logo" style="width: 50px; height: 50px; display: block; margin: 0 auto;" />' +
							'</a>';
					} else {
						return data;
					}
				}
			},
			{ "data": "nomorDaftar" },
			{ "data": "status" },

			{
				"data": null,
				"render": function (data, type, row) {
					return '<td style="text-align: center;">' +
						'<button type="button" class="btn btn-warning btn-edit" data-toggle="modal" data-id="' + row.id + '"><i class="fas fa-edit fa-xs"></i></button>' +
						'</td>';
				}
			}
		],

		"order": [
			[0, "desc"]
		],

		"rowCallback": function (row, data, index) {
			// Mengubah warna background baris jika dokInvoice kosong
			if (data.dokInvoice === null || data.dokInvoice === "") {
				$(row).css("background-color", "#dd9295");
			}
		},

		"initComplete": function () {
			// Menghitung jumlah baris yang dokInvoice-nya kosong
			let countPending = 0;
			let countDikerjakan = 0;

			this.api().rows().every(function () {
				let data = this.data();
				if (data.dokInvoice === null || data.dokInvoice === "") {
					countPending++;
				}
				/*if (data.status === 'Dikerjakan') {
					countDikerjakan++;
				} */
			});

			// Memunculkan jumlahnya di button jika countPending > 0, jika tidak, sembunyikan tombol
			if (countPending > 0) {
				$("#btnMasihDipinjam").text(countPending + " Receiving Barang Menunggu Dokumen Dari Purchasing").show();
			} else {
				$("#btnMasihDipinjam").hide();
			}
		}

	});
}

$(function () {
	// Set the format for date and time
	var format = 'DD-MM-YYYY';

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

function showCustomAlert() {
	// Show the custom alert
	$('#fileUploadAlert').show();
}

function closeCustomAlert() {
	// Hide the custom alert when the close button is clicked
	$('#fileUploadAlert').hide();
}

var counter = 1; // Variabel global untuk menghitung jumlah item yang ditambahkan

// Fungsi untuk menambahkan item baru
function tambahItemRC() {

	// Langkah 1: Dapatkan elemen <div class="container-fluid">
	var container = document.getElementById("containerfluid");

	// Langkah 2: Simpan kode HTML yang ingin dimasukkan dalam variabel htmlCode
	var htmlCode = `
	<div id="itemContainer${counter}" class="row flex-row flex-nowrap mt-4 pb-4 pt-2" style="display: flex;">
	
	<div class="col-2 item-row">
	  <label>NO PR :</label>
	  <div class="d-flex">
		<input type="text" class="form-control col-4 dp-no-pr" id="dp-no-pr-${counter}" name="dp-no-pr-${counter}" value="TCTI/PR/" placeholder="" required autocomplete="off" disabled>
		<input type="text" class="form-control col no-pr" id="no-pr-${counter}" name="no-pr-${counter}" placeholder="Masukkan Nomor PR" required autocomplete="off">
	</div>
	</div>
	
	<div class="col-3 item-row">
	  <label>KODE BARANG :</label>
	  <input type="text" class="form-control kode-barang" id="kode-barang-${counter}" name="kode-barang-${counter}" placeholder="Masukkan Kode Barang" required autocomplete="off">
	</div>
	<div class="col-3 item-row">
	  <label>NAMA BARANG :</label>
	  <input type="text" class="form-control nama-barang" id="nama-barang-${counter}" name="nama-barang-${counter}" placeholder="" required autocomplete="off" disabled>
	</div>
	<div class="col-2 item-row">
	  <label>QTY PR / OUTSTANDING :</label>
	  <input type="text" class="form-control qty-pr" id="qty-pr-${counter}" name="qty-pr-${counter}" placeholder="" required autocomplete="off" disabled>
	</div>
	<div class="col-2 item-row">
	  <label>QTY TERIMA :</label>
	  <input type="text" class="form-control qty-terima" id="qty-terima-${counter}" name="qty-terima-${counter}" placeholder="Masukkan Qty Terima" required autocomplete="off">
	</div>
	<div class="col-2 item-row">
	  <label>QTY SISA :</label>
	  <input type="text" class="form-control qty-sisa" id="qty-sisa-${counter}" name="qty-sisa-${counter}" placeholder="" required autocomplete="off" disabled>
	</div>
	<div class="col-1 item-row">
	  <label>SATUAN :</label>
	  <input type="text" class="form-control satuan" id="satuan-${counter}" name="satuan-${counter}" placeholder="" required autocomplete="off" disabled>
	</div>
	<div class="col-3 item-row">
	  <label>SUPPLIER :</label>
	  <input type="text" class="form-control supplier" id="supplier-${counter}" name="supplier-${counter}" placeholder="" required autocomplete="off">
	</div>
	<div class="col-2 item-row">
	  <label>STATUS :</label>
	<select id="status-${counter}" name="status-${counter}" class="form-control status" style="width: 100%;" disabled>
	  <option value="">-- Pilih Status --</option>
	  <option value="OUTSTANDING">OUTSTANDING</option>
	  <option value="CLOSED">CLOSED</option>
	</select>
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
	var depanNoPr = document.getElementById(`dp-no-pr-${counter}`);
	var noPr = document.getElementById(`no-pr-${counter}`);
	var kodeBarang = document.getElementById(`kode-barang-${counter}`);
	var supplier = document.getElementById(`supplier-${counter}`);
	var keterangan = document.getElementById(`keterangan-${counter}`);

	kodeBarang.addEventListener("input", (function (counter) {
		return function (event) {
			this.value = this.value.toUpperCase();
			if (this.value !== "") {
				autofillLogic(event, counter, noPr, depanNoPr); // Menambahkan noPr dan depanNoPr sebagai argumen
			}
		};
	})(counter, noPr, depanNoPr));

	supplier.addEventListener("input", function () {
		this.value = this.value.toUpperCase();
	});

	keterangan.addEventListener("input", function () {
		this.value = this.value.toUpperCase();
	});

	counter++; // Tingkatkan counter setelah item ditambahkan

	// Fungsi untuk logika autofill
	function autofillLogic(event, counter, noPr, depanNoPr) {
		var nomorPrInput = depanNoPr.value + noPr.value; // Ambil nilai nomor pr yang diinput
		var kodeBarangInput = event.target.value; // Ambil nilai kode barang yang diinput
		var jenisBarang = document.getElementById('jenisbarangtambahMasuk').value;

		console.log(nomorPrInput);
		//console.log(kodeBarangInput);
		// Dapatkan elemen input nama barang dan satuan yang sesuai dengan counter container
		var namaBarang = document.querySelector(`#itemContainer${counter} .nama-barang`);

		var qtyPr = document.querySelector(`#itemContainer${counter} .qty-pr`);
		var qtyTerima = document.querySelector(`#itemContainer${counter} .qty-terima`);
		var qtySisa = document.querySelector(`#itemContainer${counter} .qty-sisa`);
		var satuan = document.querySelector(`#itemContainer${counter} .satuan`);
		var status = document.querySelector(`#itemContainer${counter} .status`);

		// Lakukan request ke API dengan menggunakan kodeBarang
		fetch(`/autofillircbarang/${kodeBarangInput}/${nomorPrInput}/${jenisBarang}`)
			.then(response => response.json())
			.then(data => {
				// Cetak query ke konsol
				console.log("Query:", data.query);

				// Periksa apakah data berhasil ditemukan
				if (data.results.length > 0) {
					// Ambil data nama barang pertama
					//console.log(data.results[0]);
					console.log(data.results[0].NamaBarangIndo);
					console.log(data.results[0].SatuanIndo);
					console.log(data.results[0].QtySisa);

					// Jika elemen input nama barang dan satuan ditemukan, atur nilai value
					namaBarang.value = data.results[0].NamaBarangIndo;
					qtyPr.value = data.results[0].QtySisa;
					satuan.value = data.results[0].SatuanIndo;

					// Event listener untuk input qtyTerima
					qtyTerima.addEventListener("input", function () {
						var qtyTerimaValue = parseFloat(qtyTerima.value); // Ambil nilai qtyTerima sebagai angka

						if (!isNaN(qtyTerimaValue)) {
							var qtyPrValue = parseFloat(qtyPr.value); // Ambil nilai qtyPr sebagai angka

							if (qtyTerimaValue <= qtyPrValue) {
								var qtySisaValue = qtyPrValue - qtyTerimaValue; // Hitung qtySisa

								qtySisa.value = qtySisaValue; // Set nilai qtySisa pada input

								// Logika tambahan setelah menghitung qtySisa
								if (qtySisaValue === 0) {
									status.value = "CLOSED";
								} else {
									status.value = "OUTSTANDING";
								}
							} else {
								// Jika input qtyTerima lebih besar dari qtyPr, Anda dapat menangani kasus ini di sini
								// Contoh: Tampilkan pesan error atau lakukan tindakan lain

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
								pesanAlert.style.width = "800px";
								pesanAlert.style.display = "block";
								pesanAlert.innerHTML = `
								<strong>Data tidak valid. qtyTerima lebih besar dari qtyPr / sia outstanding.</strong>
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
								}, 5000);

								return;
							}
						} else {
							// Jika input qtyTerima tidak valid (bukan angka), Anda dapat menangani kasus ini di sini
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
							pesanAlert.style.width = "800px";
							pesanAlert.style.display = "block";
							pesanAlert.innerHTML = `
								<strong>Data tidak valid. qtyTerima tidak valid (bukan angka).</strong>
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
							}, 5000);

							return;
						}
					});

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
	tambahItemRC();
});


function hapusItem(containerId) {
	var container = document.getElementById(containerId);
	container.remove();
	event.preventDefault(); // Mencegah perilaku default tombol hapus-item
}


function collectFormData(event) {
	var tanggalrc = document.getElementById('tanggalrcbarang').value;
	var nomordepanrc = document.getElementById('depannomorrcMasuk').value;
	var nomorrc = document.getElementById('isinomorrcMasuk').value;
	var items = document.querySelectorAll('[id^="itemContainer"]');
	var formData = [];
	var isDataValid = true; // Flag untuk menandakan validitas data

	// Lakukan validasi pada tanggalRC
	if (tanggalrc.trim() === "") {
		isDataValid = false;
		// Tampilkan pesan error pada elemen tanggalRC yang tidak valid
		document.getElementById('tanggalrcbarang').classList.add('is-invalid');
	} else {
		// Hapus pesan error jika tanggalRC valid
		document.getElementById('tanggalrcbarang').classList.remove('is-invalid');
	}

	// Lakukan validasi pada noRC
	if (nomorrc.trim() === "") {
		isDataValid = false;
		// Tampilkan pesan error pada elemen noRC yang tidak valid
		document.getElementById('isinomorrcMasuk').classList.add('is-invalid');
	} else if (!Number.isInteger(Number(nomorrc))) {
		isDataValid = false;
		// Tampilkan pesan error pada elemen noRC yang tidak valid
		document.getElementById('isinomorrcMasuk').classList.add('is-invalid');
	} else {
		// Hapus pesan error jika noRC valid
		document.getElementById('isinomorrcMasuk').classList.remove('is-invalid');
	}

	items.forEach(function (item) {
		var noPr = item.querySelector('.dp-no-pr').value + item.querySelector('.no-pr').value;
		var noPrInput = item.querySelector('.no-pr').value;
		var kodeBarang = item.querySelector('.kode-barang').value;
		var namaBarang = item.querySelector('.nama-barang').value;
		var qtyPr = item.querySelector('.qty-pr').value;
		var qtyTerima = item.querySelector('.qty-terima').value;
		var qtySisa = item.querySelector('.qty-sisa').value;
		var satuan = item.querySelector('.satuan').value;
		var supplier = item.querySelector('.supplier').value;
		var status = item.querySelector('.status').value;
		var keterangan = item.querySelector('.keterangan').value;

		var itemData = {
			tanggalReceive: tanggalrc,
			noReceive: nomordepanrc + nomorrc,
			noPr: noPr,
			kodeBarang: kodeBarang,
			namaBarang: namaBarang,
			qtyPr: qtyPr,
			qtyTerima: qtyTerima,
			qtySisa: qtySisa,
			satuan: satuan,
			supplier: supplier,
			status: status,
			keterangan: keterangan
		};

		formData.push(itemData);

		// Lakukan validasi pada noPr
		if (noPrInput.trim() === "") {
			isDataValid = false;
			// Tampilkan pesan error pada elemen kodeBarang yang tidak valid
			item.querySelector('.no-pr').classList.add('is-invalid');
		} else {
			// Hapus pesan error jika kodeBarang valid
			item.querySelector('.no-pr').classList.remove('is-invalid');
		}

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

		// Lakukan validasi pada qtyTerima Harus ada isi dan berupa angka
		if (qtyTerima.trim() === '' || isNaN(qtyTerima)) {
			isDataValid = false;
			// Tampilkan pesan error pada elemen qtyTerima yang tidak valid
			item.querySelector('.qty-terima').classList.add('is-invalid');
		} else {
			// Hapus pesan error jika qtyTerima valid
			item.querySelector('.qty-terima').classList.remove('is-invalid');
		}

		// Lakukan validasi pada supplier agar tidak boleh kosong
		if (supplier.trim() === '') {
			isDataValid = false;
			// Tampilkan pesan error pada elemen supplier yang tidak valid
			item.querySelector('.supplier').classList.add('is-invalid');
		} else {
			// Hapus pesan error jika supplier valid
			item.querySelector('.supplier').classList.remove('is-invalid');
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
	xhr.open("POST", "/proses_tambah_data_rc");
	xhr.setRequestHeader("Content-Type", "application/json");

	xhr.onreadystatechange = function () {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				console.log("Data berhasil ditambahkan");
				$('#formModal').modal('hide');
				refreshData();

				// Mengosongkan nilai input form
				document.getElementById('tanggalrcbarang').value = '';
				document.getElementById('isinomorrcMasu').value = '';

				var items = document.getElementsByClassName('pr-data');
				for (var i = 0; i < items.length; i++) {
					items[i].querySelector('.noPr').value = '';
					items[i].querySelector('.kodeBarang').value = '';
					items[i].querySelector('.namaBarang').value = '';
					items[i].querySelector('.qtyPr').value = '';
					items[i].querySelector('.qtyTerima').value = '';
					items[i].querySelector('.qtySisa').value = '';
					items[i].querySelector('.satuan').value = '';
					items[i].querySelector('.supplier').value = '';
					items[i].querySelector('.status').value = '';
					items[i].querySelector('.keterangan').value = '';
				}

				let successMessage = "Data berhasil ditambahkan!";
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

var submitButton = document.getElementById("submitButton");
submitButton.addEventListener("click", function (event) {
	event.preventDefault(); // Mencegah perilaku default tombol submitButton
	collectFormData(event); // Melewatkan parameter event ke fungsi collectFormData
});

function previewImage(event, imgId) {
	var image = document.getElementById(imgId);
	var previewText = image.parentNode.querySelector('.preview-text');

	if (event.target.files.length > 0) {
		image.src = URL.createObjectURL(event.target.files[0]);
		image.style.display = "block";
		previewText.style.display = "none";
	} else {
		image.src = "#";
		image.style.display = "none";
		previewText.style.display = "block";
	}
}

function previewPdf(event, canvasId) {
	const file = event.target.files[0];

	if (!file) return;

	const fileReader = new FileReader();

	fileReader.onload = function () {
		const typedarray = new Uint8Array(this.result);
		const loadingTask = pdfjsLib.getDocument({ data: typedarray });

		loadingTask.promise.then(function (pdf) {
			// Ambil halaman pertama dari PDF untuk thumbnail
			pdf.getPage(1).then(function (page) {
				const viewport = page.getViewport({ scale: 0.2 }); // Sesuaikan skala sesuai kebutuhan
				const canvas = document.getElementById(canvasId);
				const context = canvas.getContext("2d");

				canvas.width = viewport.width;
				canvas.height = viewport.height;

				const renderContext = {
					canvasContext: context,
					viewport: viewport,
				};

				page.render(renderContext).promise.then(function () {
					console.log("Thumbnail PDF berhasil ditampilkan!");
				});
			});
		});
	};

	fileReader.readAsArrayBuffer(file);
}

// Fungsi untuk mengosongkan tampilan preview PDF pada sebuah canvas
function resetPreviewPdf(canvasId) {
	const canvas = document.getElementById(canvasId);
	const context = canvas.getContext('2d');

	// Set ukuran canvas kembali ke ukuran awal (0 x 0)
	canvas.width = 0;
	canvas.height = 0;

	// Kosongkan isi canvas dengan warna putih
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function resetAllCanvas(canvasIds) {
	canvasIds.forEach(canvasId => {
		const canvas = document.getElementById(canvasId);
		const context = canvas.getContext('2d');

		// Set ukuran canvas kembali ke ukuran awal (0 x 0)
		canvas.width = 0;
		canvas.height = 0;

		// Kosongkan isi canvas dengan warna putih
		context.clearRect(0, 0, canvas.width, canvas.height);
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

	// Hapus jika ada validasi form tambah data modal yang tersisa dari sebelumnya
	$('#formModal').on('show.bs.modal', function () {
		const levelUser = $('#leveluser').val();

		document.getElementById("pesanAlert").style.display = "none";

		/* SETTING NOMOR BON SAAT MODAL MUNCUL */

		// Mendapatkan bulan dan tahun saat ini
		var currentDate = new Date();
		var currentMonth = currentDate.getMonth() + 1; // Penambahan 1 karena indeks bulan dimulai dari 0
		var currentYear = currentDate.getFullYear();

		// Mengubah bulan menjadi format dua digit (misalnya: 01, 02, 03, dst.)
		var formattedMonth = ("0" + currentMonth).slice(-2);

		// Menghasilkan nomor bon dengan format "In/PTCT/MM/YYYY/"
		var nomorBon = "In/PTCT/LOK/" + formattedMonth + "/" + currentYear + "/";

		// Mengisi nilai nomorBon pada elemen input yang sesuai
		document.getElementById("depannomorrcMasuk").value = nomorBon;

		////////

		var selectElement = document.getElementById("jenisbarangtambahMasuk");
		selectElement.addEventListener("change", autoFillForm);


		function autoFillForm() {
			var selectedValue = document.getElementById("jenisbarangtambahMasuk").value;


			// Add conditions based on the selected value to determine the autofill value
			if (selectedValue === "LOKAL") {
				/* SETTING NOMOR BON SAAT MODAL MUNCUL */

				// Mendapatkan bulan dan tahun saat ini
				var currentDate = new Date();
				var currentMonth = currentDate.getMonth() + 1; // Penambahan 1 karena indeks bulan dimulai dari 0
				var currentYear = currentDate.getFullYear();

				// Mengubah bulan menjadi format dua digit (misalnya: 01, 02, 03, dst.)
				var formattedMonth = ("0" + currentMonth).slice(-2);

				// Menghasilkan nomor bon dengan format "In/PTCT/MM/YYYY/"
				var nomorBon = "In/PTCT/LOK/" + formattedMonth + "/" + currentYear + "/";

				// Mengisi nilai nomorBon pada elemen input yang sesuai
				document.getElementById("depannomorrcMasuk").value = nomorBon;
			} else if (selectedValue === "IMPOR") {

				/* SETTING NOMOR BON SAAT MODAL MUNCUL */

				// Mendapatkan bulan dan tahun saat ini
				var currentDate = new Date();
				var currentMonth = currentDate.getMonth() + 1; // Penambahan 1 karena indeks bulan dimulai dari 0
				var currentYear = currentDate.getFullYear();

				// Mengubah bulan menjadi format dua digit (misalnya: 01, 02, 03, dst.)
				var formattedMonth = ("0" + currentMonth).slice(-2);

				// Menghasilkan nomor bon dengan format "In/PTCT/MM/YYYY/"
				var nomorBon = "In/PTCT/IMP/" + formattedMonth + "/" + currentYear + "/";

				// Mengisi nilai nomorBon pada elemen input yang sesuai
				document.getElementById("depannomorrcMasuk").value = nomorBon;
			} else {
				/* SETTING NOMOR BON SAAT MODAL MUNCUL */

				// Mendapatkan bulan dan tahun saat ini
				var currentDate = new Date();
				var currentMonth = currentDate.getMonth() + 1; // Penambahan 1 karena indeks bulan dimulai dari 0
				var currentYear = currentDate.getFullYear();

				// Mengubah bulan menjadi format dua digit (misalnya: 01, 02, 03, dst.)
				var formattedMonth = ("0" + currentMonth).slice(-2);

				// Menghasilkan nomor bon dengan format "In/PTCT/MM/YYYY/"
				var nomorBon = "In/PTCT/" + formattedMonth + "/" + currentYear + "/";

				// Mengisi nilai nomorBon pada elemen input yang sesuai
				document.getElementById("depannomorrcMasuk").value = nomorBon;
			}
		}
	});

	$("#form-edit-data").submit(function (event) {
		event.preventDefault(); // Prevent the default form submission

		// Buat objek FormData untuk setiap input file
		var formData = new FormData();

		// Tambahkan file ke objek FormData (pastikan nama input sesuai dengan nama dari request.files di Flask)
		var dokInvoiceFile = $('#dokInvoice')[0].files[0];
		var dokSuratjalanFile = $('#dokSuratJalan')[0].files[0];
		var dokPackinglistFile = $('#dokPackingList')[0].files[0];
		var dokBcFile = $('#dokBc')[0].files[0];
		var dokSPPBFile = $('#dokSppb')[0].files[0];

		// Tambahkan validasi jika tidak ada satu pun file yang dipilih
		if (!dokInvoiceFile && !dokSuratjalanFile && !dokPackinglistFile && !dokBcFile && !dokSPPBFile) {
			// Show the alert message
			console.log("muncul alert");
			showCustomAlert();

			// Set timeout to hide the alert after 3 seconds
			setTimeout(function () {
				closeCustomAlert();
			}, 3000); // 3000 milliseconds = 3 seconds

			return; // Abort the form submission
		} else {
			// Hide the alert message if files are selected
			closeCustomAlert()
		}

		if (dokInvoiceFile) {
			formData.append('dokInvoice', dokInvoiceFile);
		}
		if (dokSuratjalanFile) {
			formData.append('dokSuratJalan', dokSuratjalanFile);
		}
		if (dokPackinglistFile) {
			formData.append('dokPackingList', dokPackinglistFile);
		}
		if (dokBcFile) {
			formData.append('dokBc', dokBcFile);
		}
		if (dokSPPBFile) {
			formData.append('dokSPPB', dokSPPBFile);
		}

		// Tambahkan data lain yang ingin Anda kirim bersamaan dengan file
		formData.append('idEdit', $('#idEdit').val());
		formData.append('namaDokumen', $('#namaDokumen').val());
		formData.append('nomorAju', $('#nomorAju').val());

		// Validate the NomorAju input field if it's visible
		if ($("#formNomorAju").is(":visible")) {
			let nomorAjuValue = $('#nomorAju').val();
			if (!nomorAjuValue.trim()) {
				// Set focus to the NomorAju input field
				$('#nomorAju').focus();

				// Show a custom validation message near the input field
				$('#nomorAju').addClass('is-invalid');
				$('#nomorAju').siblings('.invalid-feedback').text('Please enter Nomor Aju.');

				return; // Abort the form submission
			}
		}

		// Kirim AJAX request ke endpoint Flask
		$.ajax({
			url: "/tambah_dokumen",
			type: "POST",
			data: formData,
			contentType: false,
			processData: false,
			success: function (response) {
				$('#editModal').modal('hide');

				refreshData()

				let successMessage = "Dokumen berhasil ditambahkan!";
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

				// Kosongkan value input file setelah berhasil meng-upload
				$('#dokInvoice').val('');
				$('#dokSuratJalan').val('');
				$('#dokPackingList').val('');
				$('#dokBc').val('');
				$('#dokSppb').val('');

				// Reset tampilan preview PDF
				resetPreviewPdf('thumbnailInvoiceCanvas');
				resetPreviewPdf('thumbnailSuratJalanCanvas');
				resetPreviewPdf('thumbnailPackingListCanvas');
				resetPreviewPdf('thumbnailBcCanvas');
				resetPreviewPdf('thumbnailSppbCanvas');

				$('#formNomorAju').hide();
			},
			error: function (xhr, status, error) {
				// Handle the error response
				console.error(xhr.responseText);
				alert("Error occurred during form submission.");
			},
		});
	});

});

/* PEMBUKA CONTROL FORM EDIT */

$(document).on('click', '.btn-edit', function () {
	let idPrimarykey = $(this).data('id');
	const canvasIds = ['thumbnailInvoiceCanvas', 'thumbnailSuratJalanCanvas', 'thumbnailPackingListCanvas', 'thumbnailBcCanvas', 'thumbnailSppbCanvas'];
	console.log(idPrimarykey); // Menampilkan nilai idPrimarykey pada konsol

	$('#idEdit').val(idPrimarykey); // Menyimpan nilai Id pada elemen form yang tersembunyi

	resetAllCanvas(canvasIds);

	// Mendapatkan data original dan menyimpannya di dalam elemen tersembunyi
	$.get('/api/dokrcbarang/' + idPrimarykey, function (data) {
		console.log(data); // Menampilkan hasil dari GET API pada konsol

		// Mengambil nilai variabel dari data
		let namaDokumen = data[0].namaDokumen;
		let dokInvoice = data[0].dokInvoice;
		let dokSuratJalan = data[0].dokSuratJalan;
		let dokPackingList = data[0].dokPackingList;
		let dokBc = data[0].dokBc;
		let dokSppb = data[0].dokSppb;

		// Fungsi untuk mengatur status "enable" pada input berdasarkan nilai variabel
		function setEnableInput(inputId, isEnabled) {
			$('#' + inputId).prop('disabled', !isEnabled);
		}

		// Mengatur status "enable" input dokInvoice
		setEnableInput('dokInvoice', dokInvoice === null || dokInvoice === "");

		// Mengatur status "enable" input dokSuratJalan
		setEnableInput('dokSuratJalan', dokSuratJalan === null || dokSuratJalan === "");

		// Mengatur status "enable" input dokPackingList
		setEnableInput('dokPackingList', dokPackingList === null || dokPackingList === "");

		// Mengatur status "enable" input dokBc
		setEnableInput('dokBc', dokBc === null || dokBc === "");

		// Mengatur status "enable" input dokSppb
		setEnableInput('dokSppb', dokSppb === null || dokSppb === "");

		// Hide the div if dok is not null or not empty
		if (dokInvoice !== null && dokInvoice !== "") {
			$('#btn-upload-dok-invoice').hide();
			$('#txt-upload-dok-invoice').show();
		} else {
			$('#btn-upload-dok-invoice').show();
			$('#txt-upload-dok-invoice').hide();
		}

		if (dokSuratJalan !== null && dokSuratJalan !== "") {
			$('#btn-upload-dok-suratjalan').hide();
			$('#txt-upload-dok-suratjalan').show();
		} else {
			$('#btn-upload-dok-suratjalan').show();
			$('#txt-upload-dok-suratjalan').hide();
		}

		if (dokPackingList !== null && dokPackingList !== "") {
			$('#btn-upload-dok-packinglist').hide();
			$('#txt-upload-dok-packinglist').show();
		} else {
			$('#btn-upload-dok-packinglist').show();
			$('#txt-upload-dok-packinglist').hide();
		}

		if (dokBc !== null && dokBc !== "") {
			$('#btn-upload-dok-bc').hide();
			$('#txt-upload-dok-bc').show();
		} else {
			$('#btn-upload-dok-bc').show();
			$('#txt-upload-dok-bc').hide();
		}

		if (dokSppb !== null && dokSppb !== "") {
			$('#btn-upload-dok-sppb').hide();
			$('#txt-upload-dok-sppb').show();
		} else {
			$('#btn-upload-dok-sppb').show();
			$('#txt-upload-dok-sppb').hide();
		}

		$('#namaDokumen').val(namaDokumen);
		$('#editModal').modal('show');
	});
});

// Tambahkan event listener pada input file dokSppb
$('#dokSppb').on('change', function () {
	// Ambil nilai dokSppb dari input file
	let dokSppb = $(this).val();

	// Tampilkan input nomorAju jika dokSppb sudah diinput
	if (dokSppb !== null && dokSppb !== "") {
		$('#formNomorAju').show();
	} else {
		$('#formNomorAju').hide();
	}
});

// Tambahkan event listener pada input "nomorAju"
$('#nomorAju').on('input', function () {
	// Dapatkan nilai input
	let inputValue = $(this).val();

	// Hapus semua karakter kecuali angka 0-9
	let cleanedValue = inputValue.replace(/[^0-9]/g, '');

	// Update nilai input dengan nilai yang sudah dibersihkan
	$(this).val(cleanedValue);
});









