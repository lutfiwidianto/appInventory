const namaLengkap = document.getElementById('namalengkap').value.trim();
const userName = document.getElementById("username");
const levelUser = document.querySelector('#leveluser').value;
let format = 'DD/MM/YYYY';
let today = new Date();
let firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
$('#tanggalkeluarbarangDiv').datetimepicker({
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
  keepInvalid: false,
  minDate: moment().subtract(1, 'months').startOf('month'), // Tanggal minimal mulai dari awal bulan kemarin
  maxDate: moment().endOf('month'), // Tanggal maksimal sampai akhir bulan ini
});

$('#tanggalkeluarbarangDiv').on('change.datetimepicker', function (e) {
  let selectedDate = e.date;
  let today = moment();
  let firstDayOfLastMonth = moment().subtract(1, 'months').startOf('month');
  let lastDayOfThisMonth = moment().endOf('month');

  if (selectedDate.isBefore(firstDayOfLastMonth) || selectedDate.isAfter(lastDayOfThisMonth)) {
    $(this).datetimepicker('date', null);
    alert('Silakan pilih tanggal pada bulan ini atau bulan kemarin.');
  } else {
    let format = 'YYYY-MM-DD'; // Sesuaikan dengan format yang Anda inginkan
    let date = selectedDate.format(format);
    $('input[name="tanggalkeluarBarang"]').val(date); // Ubah nama input sesuai dengan yang ada di form Anda
  }
});

// Handler untuk mengatur tanggal hari ini ketika tombol pada input-group di-klik
$('#tanggalkeluarbarangDiv .input-group-append').on('click', function () {
  $('#tanggalkeluarbarangDiv').datetimepicker('date', moment());
});


function formatDate(rawDate) {
  const date = new Date(rawDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
}

function loadDatatable() {
  if ($.fn.DataTable.isDataTable("#bj_keluar")) {
    $("#bj_keluar").DataTable().destroy();
  }

  $("#bj_keluar").DataTable({
    "ajax": {
      "url": "/api/databj_keluar/" +
        moment($("#tanggalAwal").val(), format).format("YYYY-MM-DD") +
        "/" + moment($("#tanggalAkhir").val(), format).format("YYYY-MM-DD"),
      "dataSrc": "",
      "error": function (xhr, error, thrown) {
        console.log("Error:", xhr, error, thrown);
      }
    },
    "columns": [
      { "data": "id", visible: true },
      { "data": "tanggalkeluar" }, // Perbaikan nama dari "tanggalMasuk"
      { "data": "kodeBarang" },
      { "data": "namaBarang" },
      { "data": "nomorBatch" },
      { "data": "grade" },
      {
        "data": null,
        "render": function (data, type, row) {
          return row.jumlah + " " + (row.satuan || ""); // Tambahan untuk mencegah error jika `satuan` kosong
        }
      },
      {
        "data": null,
        "render": function (data, type, row) {
          return row.jumlahKg + " KG"; // Perbaikan nama dari "jumlahKg"
        }
      },
      { "data": "container" }, // Menambahkan kolom container
      { "data": "buyer" }, // Buyer ditampilkan
      { "data": "destination_port" }, // Shipment ditampilkan
      { "data": "noSlipPenerimaan" },
      {
        "data": null,
        "render": function (data, type, row) {
          return `<td style="white-space: nowrap; text-align: center;">
            <button type="button" class="btn btn-info btn-detail" data-toggle="modal" data-nomor_bon="${row.noSlipPenerimaan}">
              <i class="fas fa-info-circle fa-xs"></i> Detail
            </button>
          </td>`;
        }
      }
    ],
    "order": [[1, "desc"]],
    "responsive": true,
    "autoWidth": false,
    "dom": "<'row'<'col-sm'l><'col-sm'B><'col-sm'f>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
    "buttons": [
      {
        extend: 'colvis',
        text: '<span style="width: 120px; display:inline-block;">ATUR VIEW KOLOM</span>'
      },
      {
        extend: 'excel',
        text: '<i class="fas fa-file-excel"></i> Excel',
        title: 'Data Mutasi Keluar Non Fasilitas',
        exportOptions: { columns: ':visible' }
      }
    ],
    "language": {
      "search": "Cari : "
    },
    "initComplete": function (settings, json) {
      console.log("Data Loaded:", json); // Cetak data ke console
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
    let errorMessage = event.error.message;
    if (errorMessage && errorMessage.includes('CONTENT_LENGTH_MISMATCH')) {
      // Call the reloadPage function if error message contains the keyword
      reloadPage();
    }
  });

  // Mengisi nilai default tanggal awal dan tanggal akhir
  document.getElementById('tanggalAwal').value = formatDate(firstDayOfMonth);
  document.getElementById('tanggalAkhir').value = formatDate(lastDayOfMonth);

  loadDatatable();

  // Sembunyikan pesan alert
  let pesanAlert = document.getElementById('pesanAlert');
  pesanAlert.style.display = 'none';

  $('#tanggalAwal, #tanggalAkhir').on('change', function () {
    loadDatatable();
  });

  //$('#nomorBon').inputmask();
  $('#btnRefresh').on('click', function () {
    loadDatatable();
  });


});

let counter = 1; // letiabel global untuk menghitung jumlah item yang ditambahkan
let formData = [];

// Fungsi untuk menambahkan item baru
function tambahItemMasuk() {
  // Langkah 1: Dapatkan elemen <div class="container-fluid">
  let container = document.getElementById("containerfluid");

  // Langkah 2: Simpan kode HTML yang ingin dimasukkan dalam letiabel htmlCode
  let htmlCode = `
  <div id="itemContainer${counter}" class="row flex-row flex-nowrap mt-4 pb-4 pt-2" style="display: flex;">
    <div class="col-2 item-row">
      <label>Kode Barang :</label>
      <input type="text" class="form-control kodebarangMasuk" id="kodebarangMasuk-${counter}" name="kodebarangMasuk-${counter}" placeholder="Masukkan kode barang" required autocomplete="off">
    </div>
    <div class="col-2 item-row">
      <label>Nama Barang :</label>
      <input type="text" class="form-control namabarangMasuk" id="namabarangMasuk-${counter}" name="namabarangMasuk-${counter}" placeholder="" required disabled>
    </div>
    <div class="col-2 item-row">
      <label>Saldo :</label>
      <input type="text" class="form-control saldoMasuk" id="saldoMasuk-${counter}" name="saldoMasuk-${counter}" placeholder="" required autocomplete="off" disabled>
    </div>
    <div class="col-2 item-row">
      <label>Grade :</label>
      <select id="gradeMasuk-${counter}" name="gradeMasuk-${counter}" class="form-control" style="width: 100%;">
          <option selected disabled value=""></option>
          <option value="1">1</option>
          <option value="1-">1-</option>
          <option value="1+">1+</option>
          <option value="1.5">1.5</option>
          <option value="1.5-">1.5-</option>
          <option value="1.5+">1.5+</option>
          <option value="2">2</option>
          <option value="2-">2-</option>
          <option value="2+">2+</option>
          <option value="2.5">2.5</option>
          <option value="2.5-">2.5-</option>
          <option value="2.5+">2.5+</option>
          <option value="3">3</option>
          <option value="3-">3-</option>
          <option value="3+">3+</option>
          <option value="3.5-">3.5-</option>
          <option value="3.5+">3.5+</option>
      </select>  
    </div>
    <div class="col-2 item-row">
      <label>BATCH Number:</label>
      <input type="text" class="form-control batchMasuk" id="batchMasuk-${counter}" name="batchMasuk-${counter}" placeholder="" required autocomplete="off">
    </div>

    <div class="col-2 item-row">
      <label>QTY In:</label>
      <input type="text" class="form-control qtyMasuk" id="qtyMasuk-${counter}" name="qtyMasuk-${counter}" placeholder="" required autocomplete="off">
    </div>

    <div class="col-1 item-row">
      <label>Satuan :</label>
      <input type="text" class="form-control satuanMasuk" id="satuanMasuk-${counter}" name="satuanMasuk-${counter}" placeholder="" required disabled>
    </div>
     <div class="col-1 item-row">
       <button class="hapus-item btn btn-danger" onclick="hapusItem('itemContainer${counter}')" style="cursor: pointer; margin-top: 30px;">
           <i class="fas fa-times"></i> Hapus Baris
       </button>
     </div>
  </div> 
  `;

  // Langkah 3: Masukkan kode HTML ke dalam elemen <div class="container-fluid">
  container.insertAdjacentHTML("beforeend", htmlCode);

  // Ambil input kode barang yang baru ditambahkan
  let kodeBarangMasuk = document.getElementById(`kodebarangMasuk-${counter}`);
  let penerimaBarangMasuk = document.getElementById(`penerimabarangMasuk-${counter}`);

  kodeBarangMasuk.addEventListener("input", (function (counter) {
    return function (event) {
      let jenisBarang = document.querySelector(`#jenisbarangMasuk`).value;
      this.value = this.value.trim().toUpperCase();
      autofillLogic(event, counter, jenisBarang);
    };
  })(counter));

  penerimaBarangMasuk.addEventListener("input", function () {
    this.value = this.value.toUpperCase();
  });

  counter++; // Tingkatkan counter setelah item ditambahkan
}

// Fungsi untuk mengubah warna dan gaya tulisan secara periodik
function changeColorAndStyle(namaBarangInput) {
  let colorIndex = 0;
  let colors = ["red", "blue", "green"]; // Daftar warna yang akan digunakan

  function updateColorAndStyle() {
    namaBarangInput.style.color = colors[colorIndex];
    namaBarangInput.style.fontWeight = "bold";
    colorIndex = (colorIndex + 1) % colors.length;
  }

  let intervalId = setInterval(updateColorAndStyle, 500);

  // Mengembalikan intervalId agar bisa dihentikan nanti
  return intervalId;
}

// letiabel untuk menyimpan intervalId dari changeColorAndStyle
let myIntervalId;

// Fungsi untuk logika autofill
function autofillLogic(event, counter, jenisBarang) {
  let kodeBarang = event.target.value; // Ambil nilai kode barang yang diinput

  // Dapatkan elemen input nama barang yang sesuai dengan counter container
  let namaBarangInput = document.querySelector(`#itemContainer${counter} .namabarangKeluar`);
  let kategoriInput = document.querySelector(`#itemContainer${counter} .ketegoribarangKeluar`);
  let saldoInput = document.querySelector(`#itemContainer${counter} .saldoKeluar`);
  let satuanInput = document.querySelector(`#itemContainer${counter} .satuan`);
  let saldoAkhirInput = document.querySelector(`#itemContainer${counter} .saldoakhirKeluar`);

  // Hentikan semua interval jika sedang berjalan
  if (myIntervalId) {
    clearInterval(myIntervalId);
  }

  // Lakukan request ke API dengan menggunakan kodeBarang
  fetch(`/autofillitembarangkeluar/${kodeBarang}/${jenisBarang}`)
    .then(response => response.json())
    .then(data => {
      // Periksa apakah data berhasil ditemukan
      if (data.results.length > 0) {
        let barang = data.results[0]; // Ambil data barang pertama

        if (namaBarangInput) {
          // Jika elemen input nama barang ditemukan, atur nilai value dan name
          namaBarangInput.style.removeProperty('color');
          namaBarangInput.value = barang.NamaBarangIndo;

          if (kategoriInput) {
            kategoriInput.value = barang.KategoriBarang;
          }
          if (saldoInput) {
            saldoInput.value = barang.Saldo_Akhir;
          }

          if (satuanInput) {
            satuanInput.value = barang.SatuanIndo;
          }

          if (saldoAkhirInput) {
            saldoAkhirInput.value = ""; // Atur nilai saldo akhir sesuai kebutuhan
          }
        }
      } else {
        if (namaBarangInput) {
          namaBarangInput.value = "TIDAK DITEMUKAN";
          // Simpan intervalId yang dikembalikan oleh changeColorAndStyle
          myIntervalId = changeColorAndStyle(namaBarangInput);

          if (kategoriInput) {
            kategoriInput.value = "";
          }
          if (saldoInput) {
            saldoInput.value = "";
          }
          if (satuanInput) {
            satuanInput.value = "";
          }
          if (saldoAkhirInput) {
            saldoAkhirInput.value = "";
          }
        }
      }
    })
    .catch(error => {
      console.error("Terjadi kesalahan pada saat mengambil data dari API", error);
    });
}

// Fungsi untuk menghapus item
function hapusItem(containerId) {
  let container = document.getElementById(containerId);
  container.remove();
}



// Setelah berhasil submit, hapus form hasil tambah item

function hapusvaluecontainer1Form() {
  let formTambahItem = document.getElementById("itemContainer1");

  // Mengosongkan nilai dari setiap input dalam elemen form
  let inputs = formTambahItem.querySelectorAll("input, select");
  inputs.forEach(input => {
    input.value = "";
  });
}

function hapusFormTambahItem() {
  let formTambahItem = document.getElementById("containerfluid");
  formTambahItem.innerHTML = ""; // Menghapus semua elemen form hasil tambah item
}

function refreshData() {
  loadDataFasilitas();
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

$('#formModal').on('shown.bs.modal', function () {
  // Sembunyikan pesan alert
  let pesanAlert = document.getElementById('pesanAlert');
  pesanAlert.style.display = 'none';

  /* SETTING NOMOR BON SAAT MODAL MUNCUL */

  // Mendapatkan bulan dan tahun saat ini
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth() + 1; // Penambahan 1 karena indeks bulan dimulai dari 0
  let currentYear = currentDate.getFullYear();

  // Mengubah bulan menjadi format dua digit (misalnya: 01, 02, 03, dst.)
  let formattedMonth = ("0" + currentMonth).slice(-2);

  // Menghasilkan nomor bon dengan format "In/GTCT/MM/YYYY/"
  let nomorBon = "Out/GTCT/LOK/" + formattedMonth + "/" + currentYear + "/";

  // Mengisi nilai nomorBon pada elemen input yang sesuai
  document.getElementById("depannomorbonKeluar").value = nomorBon;

  let selectElement = document.getElementById("jenisbarangKeluar");
  selectElement.addEventListener("change", autoFillForm);

  //$('.select2').select2();

  function autoFillForm() {
    let selectedValue = document.getElementById("jenisbarangKeluar").value;
    let formField = document.getElementById("otherFormField"); // Replace "otherFormField" with the ID of the field you want to auto-fill

    // Add conditions based on the selected value to determine the autofill value
    if (selectedValue === "LOKAL") {
      /* SETTING NOMOR BON SAAT MODAL MUNCUL */

      // Mendapatkan bulan dan tahun saat ini
      let currentDate = new Date();
      let currentMonth = currentDate.getMonth() + 1; // Penambahan 1 karena indeks bulan dimulai dari 0
      let currentYear = currentDate.getFullYear();

      // Mengubah bulan menjadi format dua digit (misalnya: 01, 02, 03, dst.)
      let formattedMonth = ("0" + currentMonth).slice(-2);

      // Menghasilkan nomor bon dengan format "In/GTCT/MM/YYYY/"
      let nomorBon = "TCT/PP-012/K/DMG/2025" + formattedMonth + "/" + currentYear + "/";

      // Mengisi nilai nomorBon pada elemen input yang sesuai
      document.getElementById("depannomorbonKeluar").value = nomorBon;
    } else if (selectedValue === "IMPOR") {
      /* SETTING NOMOR BON SAAT MODAL MUNCUL */

      // Mendapatkan bulan dan tahun saat ini
      let currentDate = new Date();
      let currentMonth = currentDate.getMonth() + 1; // Penambahan 1 karena indeks bulan dimulai dari 0
      let currentYear = currentDate.getFullYear();

      // Mengubah bulan menjadi format dua digit (misalnya: 01, 02, 03, dst.)
      let formattedMonth = ("0" + currentMonth).slice(-2);

      // Menghasilkan nomor bon dengan format "In/GTCT/MM/YYYY/"
      let nomorBon = "Out/GTCT/IMP/" + formattedMonth + "/" + currentYear + "/";

      // Mengisi nilai nomorBon pada elemen input yang sesuai
      document.getElementById("depannomorbonKeluar").value = nomorBon;
    } else {
      /* SETTING NOMOR BON SAAT MODAL MUNCUL */

      // Mendapatkan bulan dan tahun saat ini
      let currentDate = new Date();
      let currentMonth = currentDate.getMonth() + 1; // Penambahan 1 karena indeks bulan dimulai dari 0
      let currentYear = currentDate.getFullYear();

      // Mengubah bulan menjadi format dua digit (misalnya: 01, 02, 03, dst.)
      let formattedMonth = ("0" + currentMonth).slice(-2);

      // Menghasilkan nomor bon dengan format "In/GTCT/MM/YYYY/"
      let nomorBon = "Out/GTCT/" + formattedMonth + "/" + currentYear + "/";

      // Mengisi nilai nomorBon pada elemen input yang sesuai
      document.getElementById("depannomorbonKeluar").value = nomorBon;
    }
  }
});

$(document).on('click', '.btn-detail', function () {
  let nomorBon = $(this).data('nomor_bon');
  let parts = nomorBon.split('\n');
  let nomorRef = parts[0];
  console.log('Tombol Detail ditekan untuk nomor bon: ' + nomorRef);
  // Lakukan tindakan lain yang Anda inginkan di sini

  // Mengarahkan halaman ke URL /inv_ambil_barang
  window.location.href = "/inv_ambil_barang/" + nomorRef;
});





