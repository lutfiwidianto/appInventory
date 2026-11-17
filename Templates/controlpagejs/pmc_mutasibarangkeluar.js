const namaLengkap = document.getElementById('namalengkap').value.trim();
const userName = document.getElementById("username");
const levelUser = document.querySelector('#leveluser').value;
// RBAC: baca permissions dari context processor
const _permEl = document.getElementById('user-permissions-data');
const userPermissions = _permEl ? JSON.parse(_permEl.textContent) : [];
let format = 'DD/MM/YYYY';
let today = new Date();
let firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

// Tanggal Keluar Barang (Tambah Data)
$('#tanggalkeluarbarangDiv').datetimepicker({
  format: format,
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
  keepInvalid: true,
  widgetPositioning: {
    horizontal: 'left',
    vertical: 'bottom'
  }
});

// Filter Tanggal Utama
$("#tanggalAwalDiv, #tanggalAkhirDiv").datetimepicker({
  format: format,
  icons: {
    time: "fas fa-clock",
    date: "fas fa-calendar-alt",
    up: "fas fa-chevron-up",
    down: "fas fa-chevron-down",
    previous: "fas fa-chevron-left",
    next: "fas fa-chevron-right",
    today: "fas fa-calendar-day",
    clear: "fas fa-trash",
    close: "fas fa-times",
  },
  widgetPositioning: {
    horizontal: 'left',
    vertical: 'bottom'
  }
});

// Bulk Invoice Datepicker
$("#startDateDiv, #endDateDiv").datetimepicker({
  format: format,
  icons: {
    time: "fas fa-clock",
    date: "fas fa-calendar-alt",
    up: "fas fa-chevron-up",
    down: "fas fa-chevron-down",
    previous: "fas fa-chevron-left",
    next: "fas fa-chevron-right",
    today: "fas fa-calendar-day",
    clear: "fas fa-trash",
    close: "fas fa-times",
  },
  widgetPositioning: {
    horizontal: 'left',
    vertical: 'bottom'
  }
});

// Handle date changes for filtering
$("#tanggalAwalDiv, #tanggalAkhirDiv").on("change.datetimepicker", function () {
  if ($('#tab-table1-tab').hasClass('active')) {
    loadDataNonFasilitas()
  } else if ($('#tab-table2-tab').hasClass('active')) {
    loadDataFasilitas();
  }
});

$('#tanggalkeluarbarangDiv').on('change.datetimepicker', function (e) {
  let date = moment(e.date).format(format);
  $('input[name="tanggaldatangbarangTambah"]').val(date);
});

// Removed unused handler for .input-group-append click

document.getElementById('form-invoiceKeluar-data').addEventListener('submit', function (event) {
  event.preventDefault();

  // Tampilkan indikator loading
  document.getElementById('loading-indicator').classList.remove('d-none');

  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if (startDate && endDate) {
    const requestData = {
      start_date: startDate,
      end_date: endDate
    };

    fetch('/generate_combinedinvkeluar_pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
      .then(response => response.blob())
      .then(blob => {
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(pdfBlob);

        // Sembunyikan indikator loading
        document.getElementById('loading-indicator').classList.add('d-none');

        window.open(pdfUrl);
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('loading-indicator').classList.add('d-none');
      });
  } else {
    alert('Harap pilih tanggal awal dan akhir.');
    document.getElementById('loading-indicator').classList.add('d-none');
  }

  // Reset nilai input tanggal setelah pengiriman formulir
  $("#startDateDiv, #endDateDiv").datetimepicker("clear");
});


function formatDate(rawDate) {
  const date = new Date(rawDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function loadDataNonFasilitas() {
  // Hancurkan DataTable yang sudah ada jika ada
  if ($.fn.DataTable.isDataTable("#example1")) {
    $("#example1").DataTable().destroy();
  }

  $("#example1").DataTable({
    "ajax": {
      "url": (function () {
        let start = moment($("#tanggalAwal").val(), format);
        let end = moment($("#tanggalAkhir").val(), format);
        let startStr = start.isValid() ? start.format("YYYY-MM-DD") : moment(firstDayOfMonth).format("YYYY-MM-DD");
        let endStr = end.isValid() ? end.format("YYYY-MM-DD") : moment(lastDayOfMonth).format("YYYY-MM-DD");
        return "api/pmc/datamutasibarangkeluarnonfasilitas/" + startStr + "/" + endStr;
      })(),
      "dataSrc": "",
      "error": function (xhr, error, thrown) {
        console.log(xhr);
        console.log(error);
        console.log(thrown);
      }
    },
    "columns": [
      { "data": "id", visible: true },
      { "data": "tanggalKeluar" },
      { "data": "kodeBarang" },
      { "data": "namaBarang" },
      { "data": "qtyOut" },
      { "data": "satuan" },
      { "data": "kategori" },
      {
        "data": "nomorBon",
        "render": function (data, type, row) {
          var parts = data.split("\n");
          var nomorBon = parts[0];
          var authorInfo = parts[1];
          var nomorBonWithStyle = '<span style="font-weight: bold;">' + nomorBon + '</span>';
          var authorInfoWithStyle = '<span style="font-size: 15px; font-style: italic;">' + authorInfo + '</span>';
          return nomorBonWithStyle + "<br>" + authorInfoWithStyle;
        }
      },
      { "data": "picGudang" },
      { "data": "penerimaBarang" },
      { "data": "departemen" },
      {
        "data": null,
        "render": function (data, type, row) {
          return '<td text-align: center;">' +
            /*
            // Tombol Edit (dinonaktifkan dan diberi komentar)
            '<button type="button" class="btn btn-warning btn-edit" data-toggle="modal" data-id="' + row.id + '" disabled><i class="fas fa-edit fa-xs"></i></button>' +
            // Tombol Delete (dinonaktifkan dan diberi komentar)
            '<button type="button" class="btn btn-danger btn-delete" data-toggle="modal" data-id="' +
            row.id + '" data-nomor_asset="' + row.kodeBarang + '" data-login_nama="' + row.namaBarang + '" disabled><i class="fas fa-trash-alt fa-xs"></i></button>' +
            */
            // Tombol Detail
            '<button type="button" class="btn btn-info btn-detail" data-toggle="modal" data-nomor_bon="' + row.nomorBon + '"><i class="fas fa-info-circle fa-xs"></i> Detail</button>' +
            '</td>';
        }
      }
    ],
    "order": [
      [0, "desc"]
    ],
    "responsive": true,
    "autoWidth": false,
    "language": { // Mengatur teks pada fitur pencarian
      "search": "Cari : ", // Atur teks untuk input pencarian
    }
  });
}

function loadDataFasilitas() {
  // Hancurkan DataTable yang sudah ada jika ada
  if ($.fn.DataTable.isDataTable("#example2")) {
    $("#example2").DataTable().destroy();
  }

  $.fn.dataTable.ext.order['custom-order'] = function (settings, col) {
    return this.api().column(col, { order: 'dom' }).nodes().map(function (node, i) {
      var num = $(node).text().match(/\d+/); // Ekstrak angka dari teks
      return num ? parseInt(num[0]) : 0; // Konversi teks angka ke integer, atau 0 jika tidak ada angka
    });
  };


  $("#example2").DataTable({
    "ajax": {
      "url": (function () {
        let start = moment($("#tanggalAwal").val(), format);
        let end = moment($("#tanggalAkhir").val(), format);
        let startStr = start.isValid() ? start.format("YYYY-MM-DD") : moment(firstDayOfMonth).format("YYYY-MM-DD");
        let endStr = end.isValid() ? end.format("YYYY-MM-DD") : moment(lastDayOfMonth).format("YYYY-MM-DD");
        return "api/pmc/datamutasibarangkeluarfasilitas/" + startStr + "/" + endStr;
      })(),
      "dataSrc": "",
      "error": function (xhr, error, thrown) {
        console.log(xhr);
        console.log(error);
        console.log(thrown);
      }
    },
    "columns": [
      { "data": "id", visible: false },
      { "data": "tanggalKeluar" },
      { "data": "kodeBarang" },
      { "data": "namaBarang" },
      { "data": "qtyOut" },
      { "data": "satuan" },
      { "data": "kategori", visible: false },
      {
        "data": "nomorBon", visible: false,
        "render": function (data, type, row) {
          var parts = data.split("\n");
          var nomorBon = parts[0];
          var authorInfo = parts[1];
          var nomorBonWithStyle = '<span style="font-weight: bold;">' + nomorBon + '</span>';
          var authorInfoWithStyle = '<span style="font-size: 15px; font-style: italic;">' + authorInfo + '</span>';
          return nomorBonWithStyle + "<br>" + authorInfoWithStyle;
        }
      },
      { "data": "picGudang", visible: false },
      { "data": "penerimaBarang" },
      { "data": "departemen", visible: false },
      { "data": "GlClass", visible: false },
      { "data": "notesmartone" },
      /*
      {
        "data": null,
        "render": function (data, type, row) {
          return row.departemen + ' | ' + row.nomorBon; // Menggabungkan departemen dan nomorBon
        }
      },
      */
      {
        "data": "inputed"
      },
      {
        "data": null,
        "render": function (data, type, row) {
          var isInputed = row.inputed.includes("Inputed");
          var isChecked = isInputed ? 'checked' : '';

          return '<td style="white-space: nowrap; text-align: center;">' +
            // Tombol Detail
            '<button type="button" class="btn btn-info btn-detail" data-toggle="modal" data-nomor_bon="' + row.nomorBon + '"><i class="fas fa-info-circle fa-xs"></i> Detail</button>' +
            // Tombol Switch
            '<span style="margin: 0 2px;"></span>' +
            // Custom-styled checkbox with data attributes
            '<label class="theme-switch" for="checkbox-' + row.id + '">' +
            '  <input type="checkbox" class="toggle-theme" id="checkbox-' + row.id + '" data-nomor_bon="' + row.nomorBon + '" data-kategori="' + row.kategori + '" ' + isChecked + ' />' +
            '  <span class="slider"></span>' +
            '</label>' +
            '</td>';
        }
      }

    ],
    "order": [
      [1, 'desc'],
      [7, 'custom-order']
    ],
    "responsive": true,
    "autoWidth": false,
    "responsive": true,
    "autoWidth": false,
    "dom": "<'row'<'col-sm'l><'col-sm'B><'col-sm'f>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
    "lengthMenu": [[10, 25, 50, 100, 250, -1], [10, 25, 50, 100, 250, "ALL"]],
    "pageLength": 100,
    "buttons": [
      {
        extend: 'colvis',
        text: '<span style="width: 120px; display:inline-block;">ATUR VIEW KOLOM</span>',

        // columns: ':gt(2)' // Menghilangkan kolom (TGL SALDO AWAL) dari pilihan
      },
      {
        extend: 'excel',
        text: '<i class="fas fa-file-excel"></i>&nbsp EXCEL',
        title: 'Data Mutasi Keluar',
        exportOptions: {
          columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], // export only these columns
          customize: function (doc) {
            doc.pageOrientation = 'landscape';
          }
        }
      }
    ],
    "language": { // Mengatur teks pada fitur pencarian 
      "search": "Cari : ", // Atur teks untuk input pencarian
    },
    "rowCallback": function (row, data, index) {
      let theme = localStorage.getItem('theme');

      if (data.inputed.includes("Inputed")) {
        if (theme === 'dark-mode') {
          console.log('Tema saat ini adalah Dark Mode.');
          $(row).css('background-color', '#333030');
        } else {
          console.log('Tema saat ini bukan Dark Mode.');
          $(row).css('background-color', '#d9ead3');
        }
      }

      if (data.status == "On Process") {
        $(row).css('background-color', '');
      }
    }
  });


  // Ganti Metode Ketika Ada Update Baru jalankan fungsi ini
  function updateData() {
    $.ajax({
      url: (function () {
        let start = moment($("#tanggalAwal").val(), format);
        let end = moment($("#tanggalAkhir").val(), format);
        let startStr = start.isValid() ? start.format("YYYY-MM-DD") : moment(firstDayOfMonth).format("YYYY-MM-DD");
        let endStr = end.isValid() ? end.format("YYYY-MM-DD") : moment(lastDayOfMonth).format("YYYY-MM-DD");
        return "api/pmc/datamutasibarangkeluarfasilitas/" + startStr + "/" + endStr;
      })(),
      method: "GET",
      success: function (data) {
        // Assuming the returned data is an array of objects
        $("#example2").DataTable().clear().rows.add(data).draw();
      },
      error: function (xhr, error, thrown) {
        console.log(xhr);
        console.log(error);
        console.log(thrown);
      }
    });
  }

  // Event listener for the toggle-theme class (assuming this class is associated with the switch)
  $(document).on('change', '.toggle-theme', function () {
    updateData();
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

  // Mengisi nilai default tanggal awal dan tanggal akhir (setelah inisialisasi datepicker)
  $("#tanggalAwalDiv").datetimepicker("date", moment(firstDayOfMonth));
  $("#tanggalAkhirDiv").datetimepicker("date", moment(lastDayOfMonth));

  // Aktifkan tab NON FASILITAS saat halaman di-reload
  $('#tab-table2-tab').tab('show');
  console.log('Tab FASILITAS aktif.');
  loadDataFasilitas();

  // Sembunyikan pesan alert
  let pesanAlert = document.getElementById('pesanAlert');
  pesanAlert.style.display = 'none';


  // Inisialisasi Select2 pada elemen dropdown
  $('#departmentKeluar').select2({
    theme: 'bootstrap4',
    dropdownParent: $('#departmentKeluar').parent(), // Parent dari <select>
    dropdownPosition: 'above', // Atur posisi dropdown di atas elemen select
  });

  $('#btnRefresh').on('click', function () {
    loadDataFasilitas();
    loadDataNonFasilitas();
  });

  // Tangani peristiwa klik pada tab NON FASILITAS
  $('#tab-table1-tab').on('click', function () {
    console.log('Tab NON FASILITAS diklik.');
    loadDataNonFasilitas()
  });

  // Tangani peristiwa klik pada tab FASILITAS
  $('#tab-table2-tab').on('click', function () {
    console.log('Tab FASILITAS diklik.');
    loadDataFasilitas()
  });


  // Pengecekan tab aktif saat tombol tertentu diklik (contoh)
  $('#cekTabAktif').on('click', function () {
    if ($('#tab-table1-tab').hasClass('active')) {
      console.log('Tab NON FASILITAS sedang aktif.');
    } else if ($('#tab-table2-tab').hasClass('active')) {
      console.log('Tab FASILITAS sedang aktif.');
    } else {
      console.log('Tidak ada tab yang aktif.');
    }
  });
});

let counter = 1; // letiabel global untuk menghitung jumlah item yang ditambahkan
let formData = [];

// Fungsi untuk menambahkan item baru
function tambahItemKeluar() {
  // Langkah 1: Dapatkan elemen <div class="container-fluid">
  let container = document.getElementById("containerfluid");

  // Langkah 2: Simpan kode HTML yang ingin dimasukkan dalam letiabel htmlCode
  let htmlCode = `
  <!-- kode lama -->
  <!-- <div id="itemContainer${counter}" class="scrolling-wrapper row flex-row flex-nowrap mt-4 pb-4 pt-2" style="overflow: auto; display: flex;"> -->
  <div id="itemContainer${counter}" class="row flex-row flex-nowrap mt-4 pb-4 pt-2" style="display: flex;">
  <div class="col-3 item-row">
    <label>Kode Barang :</label>
    <input type="text" class="form-control kodebarangKeluar" id="kodebarangKeluar-${counter}" name="kodebarangKeluar-${counter}" placeholder="Masukkan kode barang" required autocomplete="off">

  </div>

  <div class="col-4 item-row">
    <label>Nama Barang IDN :</label>
    <input type="text" class="form-control namabarangKeluar" id="namabarangKeluar-${counter}" name="namabarangKeluar-${counter}" placeholder="" required disabled>
  </div>

  <div class="col-2 item-row">
    <label>Kategori Barang :</label>
    <input type="text" class="form-control ketegoribarangKeluar" id="ketegoribarangKeluar-${counter}" name="ketegoribarangKeluar-${counter}" placeholder="" required autocomplete="off" disabled>
  </div>

  <!--
  <div class="col-2  item-row">
    <label>Asal Barang :</label>
    <select id="asalbarangKeluar-${counter}" name="asalbarangKeluar-${counter}"" class="form-control" style="width: 100%;">
      <option selected disabled value=""></option>
      <option>IMPOR</option>
      <option>LOKAL</option>
    </select>  
  </div> 
  -->
  <div class="col-2 item-row">
    <label>Saldo :</label>
    <input type="text" class="form-control saldoKeluar" id="saldoKeluar-${counter}" name="saldoKeluar-${counter}" placeholder="" required autocomplete="off" disabled>
  </div>

  <div class="col-2 item-row">
    <label>QTY Out:</label>
    <input type="text" class="form-control qtyoutKeluar" id="qtyoutKeluar-${counter}" name="qtyoutKeluar-${counter}" placeholder="" required autocomplete="off">
  </div>

  <div class="col-1 item-row">
    <label>Satuan :</label>
    <input type="text" class="form-control satuan" id="satuan-${counter}" name="satuan-${counter}" placeholder="" required disabled>
  </div>
  <!--
  <div class="col-3 item-row">
    <label>PIC Gudang :</label>
    <select id="picgudangKeluar-${counter}" name="picgudangKeluar-${counter}" class="form-control" style="width: 100%;">
      <option selected disabled value=""></option>
      <option>M. MAULANA</option>
      <option>M. SOLAHUDDIN</option>
      <option>MASFUL BAHRI</option>
      <option>ILHAM</option>
    </select>
  </div>
  -->
  <div class="col-3 item-row">
     <label>Penerima Barang :</label>
     <input type="text" class="form-control penerimabarangKeluar" id="penerimabarangKeluar-${counter}" name="penerimabarangKeluar-${counter}" placeholder="" autocomplete="off" required>
   </div>
  <!--
   <div class="col-4 item-row" style="position: relative;">
     <label>Departmen :</label>
     <select id="departmentKeluar-${counter}" name="departmentKeluar-${counter}" class="form-control select2" style="width: 100%;">
     <option selected disabled value=""></option>
     <option>LAS</option>
    <option>BANGUNAN</option>
    <option>LISTRIK</option>
    <option>PRODUKSI - MEKANIK</option>
    <option>PRODUKSI - HIDROGEN</option>
    <option>PRODUKSI - BOILER</option>
    <option>PRODUKSI - DMG/GMS</option>
    <option>PRODUKSI - GLISERIN 甘油车间</option>
    <option>PRODUKSI - PACKAGING</option>
    <option>GENERAL</option>
    <option>GENERAL - HRD</option>
    <option>GENERAL - IT</option>
    <option>GENERAL - GUDANG</option>
    <option>GENERAL - HSE</option>
    <option>GENERAL - K3</option>
    <option>GENERAL - PMC</option>
    <option>GENERAL - ACCOUNTING</option>
    <option>GENERAL - PURCHASING</option>
    <option>GENERAL - LABORATORIUM</option>
   </select>
     </div>
    -->
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
  let kodeBarangKeluar = document.getElementById(`kodebarangKeluar-${counter}`);
  let penerimaBarangKeluar = document.getElementById(`penerimabarangKeluar-${counter}`);

  /* Inisialisasi Select2 setelah elemen dropdown ditambahkan ke DOM
  departmentKeluar.select2({
    theme: 'bootstrap4',
    dropdownParent: departmentKeluar.parent(), // Gunakan parent dari <select> sebagai dropdownParent
    dropdownPosition: 'above', // Atur posisi dropdown di atas elemen select
  });
  */


  kodeBarangKeluar.addEventListener("input", (function (counter) {
    return function (event) {
      let jenisBarang = document.querySelector(`#jenisbarangKeluar`).value;
      this.value = this.value.trim().toUpperCase();
      autofillLogic(event, counter, jenisBarang);
    };
  })(counter));


  penerimaBarangKeluar.addEventListener("input", function () {
    this.value = this.value.toUpperCase();
  });


  counter++; // Tingkatkan counter setelah item ditambahkan
}

let tambahItemBtn = document.getElementById("tambahItemBtnKeluar");
tambahItemBtn.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent default button behavior
  tambahItemKeluar();
});

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


document.getElementById("form-Keluar-data").addEventListener("submit", function (event) {
  event.preventDefault();

  let formData = []; // Array untuk menyimpan data dari setiap kolom input

  // Loop melalui setiap counter

  let tanggalKeluar = document.getElementById(`tanggalkeluarBarang`);
  let depanNomorbon = document.getElementById(`depannomorbonKeluar`);
  let isiNomorbon = document.getElementById(`isinomorbonKeluar`);
  let isiCatatan = document.getElementById(`catatanBonkeluar`);
  let picGudang = document.getElementById(`picgudangKeluar`);
  let departMent = document.getElementById(`departmentKeluar`);

  // Validasi tanggalmasukbarangAdjust tidak null / kosong
  if (!tanggalKeluar.value) {
    let pesanAlert = document.getElementById('pesanAlert');
    //pesanAlert.querySelector('strong').innerText = 'Pesan!';
    pesanAlert.querySelector('strong').innerText = 'Tanggal Keluar tidak boleh kosong.';
    pesanAlert.style.display = 'block';
    setTimeout(function () {
      pesanAlert.style.display = 'none';
    }, 7000); // Display the message for 7 seconds (7000 milliseconds)
    return;
  }

  for (let i = 1; i <= counter; i++) {
    let kodebarang = document.getElementById(`kodebarangKeluar-${i}`);
    let namabarang = document.getElementById(`namabarangKeluar-${i}`);
    let saldo = document.getElementById(`saldoKeluar-${i}`);
    let qtyOut = document.getElementById(`qtyoutKeluar-${i}`);
    let satuan = document.getElementById(`satuan-${i}`);
    //let saldoakhirAdj = document.getElementById(`saldoakhirAdj-${i}`);
    //let picGudang = document.getElementById(`picgudangKeluar-${i}`);
    let penerimaBarang = document.getElementById(`penerimabarangKeluar-${i}`);
    //let departMent = document.getElementById(`departmentKeluar-${i}`);
    //let asalbarangKeluar = document.getElementById(`asalbarangKeluar-${i}`);
    let asalbarangKeluar = document.getElementById(`jenisbarangKeluar`);



    let formattedTanggalKeluar = moment(tanggalKeluar.value, format).format("YYYY-MM-DD");
    let data = {
      tanggalKeluar: formattedTanggalKeluar,
      norefKeluar: depanNomorbon.value + isiNomorbon.value,
      isiCatatan: isiCatatan.value,
      kodebarangKeluar: kodebarang.value,
      namabarangKeluar: namabarang.value,
      saldoKeluar: saldo.value,
      qtyOut: "-" + qtyOut.value,
      satuanKeluar: satuan.value,
      picgudangKeluar: picGudang.value,
      penerimabarangKeluar: penerimaBarang.value,
      departmentKeluar: departMent.value,
      asalbarangKeluar: asalbarangKeluar.value,
      namaLengkap: namaLengkap
    };

    if (parseInt(data.saldoKeluar) < parseInt(data.qtyOut)) {
      let pesanAlert = document.getElementById('pesanAlert');
      //pesanAlert.querySelector('strong').innerText = 'Pesan!';
      pesanAlert.querySelector('strong').innerText = 'Sisa saldo tidak mencukupi.';
      pesanAlert.style.display = 'block';
      setTimeout(function () {
        pesanAlert.style.display = 'none';
      }, 7000); // Display the message for 7 seconds (7000 milliseconds)
      return;
    }

    if (!kodebarang.value) {
      let pesanAlert = document.getElementById('pesanAlert');
      //pesanAlert.querySelector('strong').innerText = 'Pesan!';
      pesanAlert.querySelector('strong').innerText = 'Kode Barang harus diisi.';
      pesanAlert.style.display = 'block';
      setTimeout(function () {
        pesanAlert.style.display = 'none';
      }, 7000); // Mengatur waktu tampilan pesan selama 7 detik (7000 milidetik)
      return;
    }

    if (!asalbarangKeluar.value) {
      let pesanAlert = document.getElementById('pesanAlert');
      //pesanAlert.querySelector('strong').innerText = 'Pesan!';
      pesanAlert.querySelector('strong').innerText = 'Asal Barang harus diisi.';
      pesanAlert.style.display = 'block';
      setTimeout(function () {
        pesanAlert.style.display = 'none';
      }, 7000); // Mengatur waktu tampilan pesan selama 7 detik (7000 milidetik)
      return;
    }

    if (!qtyOut.value) {
      let pesanAlert = document.getElementById('pesanAlert');
      //pesanAlert.querySelector('strong').innerText = 'Pesan!';
      pesanAlert.querySelector('strong').innerText = 'Qty Out harus diisi.';
      pesanAlert.style.display = 'block';
      setTimeout(function () {
        pesanAlert.style.display = 'none';
      }, 7000); // Mengatur waktu tampilan pesan selama 7 detik (7000 milidetik)
      return;
    }

    if (!picGudang.value) {
      let pesanAlert = document.getElementById('pesanAlert');
      //pesanAlert.querySelector('strong').innerText = 'Pesan!';
      pesanAlert.querySelector('strong').innerText = 'PIC Gudang harus diisi.';
      pesanAlert.style.display = 'block';
      setTimeout(function () {
        pesanAlert.style.display = 'none';
      }, 7000); // Mengatur waktu tampilan pesan selama 7 detik (7000 milidetik)
      return;
    }

    if (!penerimaBarang.value) {
      let pesanAlert = document.getElementById('pesanAlert');
      //pesanAlert.querySelector('strong').innerText = 'Pesan!';
      pesanAlert.querySelector('strong').innerText = 'Penerima Barang harus diisi.';
      pesanAlert.style.display = 'block';
      setTimeout(function () {
        pesanAlert.style.display = 'none';
      }, 7000); // Mengatur waktu tampilan pesan selama 7 detik (7000 milidetik)
      return;
    }

    if (!departMent.value) {
      let pesanAlert = document.getElementById('pesanAlert');
      //pesanAlert.querySelector('strong').innerText = 'Pesan!';
      pesanAlert.querySelector('strong').innerText = 'Departemen harus diisi.';
      pesanAlert.style.display = 'block';
      setTimeout(function () {
        pesanAlert.style.display = 'none';
      }, 7000); // Mengatur waktu tampilan pesan selama 7 detik (7000 milidetik)
      return;
    }


    formData.push(data);
  }

  // Menggunakan objek JSON formData dengan data yang diambil
  console.log(formData);

  // Mengirim permintaan POST ke server menggunakan fetch
  fetch('/api/datamutasibarangkeluar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);

      // Ganti baris ini jika Anda tidak menggunakan jQuery
      $('#formModal').modal('hide');

      if ($('#tab-table1-tab').hasClass('active')) {
        console.log('Tab NON FASILITAS sedang aktif.');
        loadDataNonFasilitas()
      } else if ($('#tab-table2-tab').hasClass('active')) {
        console.log('Tab FASILITAS sedang aktif.');
        loadDataFasilitas();
      } else {
        console.log('Tidak ada tab yang aktif.');
      }

      let successMessage = "Data mutasi keluar berhasil ditambahkan!";
      let modal = document.getElementById("myModal");
      let modalBody = modal.querySelector(".modal-content .alert");
      let alert = modal.querySelector(".alert");

      // ubah pesan pada modal
      modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${successMessage}`;

      // tambah class yang sesuai dengan jenis pesan
      alert.classList.add("alert-success");

      showAlert();

      hapusvaluecontainer1Form()
      hapusFormTambahItem();

    })
    .catch(error => {
      console.error('Error:', error);
      // Tangani kesalahan yang terjadi
    });

});

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
  loadDataNonFasilitas();
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
      let nomorBon = "Out/GTCT/LOK/" + formattedMonth + "/" + currentYear + "/";

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

$(document).on('change', '.toggle-theme', function () {
  // Hanya izinkan tindakan ini jika pengguna memiliki izin PMC_DELETE
  if (userPermissions.includes('PMC_DELETE') || levelUser === '1' || levelUser === '2') {
    let userName = document.getElementById("username").value;
    // Lakukan perubahan checkbox seperti yang Anda inginkan
    let id = this.id.replace('checkbox-', ''); // Menghilangkan "checkbox-" dari id
    let nomorBon = $(this).data('nomor_bon');
    // Membagi nomorBon menjadi dua bagian berdasarkan karakter '\n'
    let parts = nomorBon.split('\n');
    let nomorRef = parts[0];


    let kategori = $(this).data('kategori');
    let nilai_nonactive = 1;
    let nilai_active = 0;
    // Mengambil data dari Local Storage
    let theme = localStorage.getItem('theme');
    console.log(theme);


    // Simpan referensi ke baris (row) yang sesuai dengan checkbox yang diubah
    let row = $(this).closest('tr');

    // Create an object with the data to send
    let postData = {
      id: id,
      no_bon: nomorRef,
      kategori: kategori
    };

    if (this.checked) {
      postData.nilai = nilai_nonactive;
      postData.username = userName;
      if (theme === 'dark-mode') {
        console.log('Tema saat ini adalah Dark Mode.');
        row.css('background-color', '#333030');
      } else {
        console.log('Tema saat ini bukan Dark Mode.');
        row.css('background-color', '#d9ead3');
      }
    } else {
      postData.nilai = nilai_active;
      postData.username = null;
      row.css('background-color', '');
    }

    // Log the JSON data before sending the request
    console.log('Data to send:', postData);

    // Send an AJAX POST request to your Flask route
    $.ajax({
      type: 'POST',
      url: '/api/inputtosmartone', // Update with your Flask route URL
      data: JSON.stringify([postData]), // Mengubah objek menjadi array karena server Anda mengharapkan array
      contentType: 'application/json',
      success: function (response) {
        console.log('Server response:', response);
        // Display a success message if the update was successful
        if (response.status === "Data berhasil diupdate!") {
          // Ubah warna latar belakang baris (row) yang sesuai
          console.log("Data berhasil diupdate!");
        } else {
          //alert("Gagal mengupdate data.");
          console.log("Data gagal diupdate!");
        }
        // Perform any other actions you want here
      },
      error: function (error) {
        console.error('Error:', error);
        alert("Terjadi kesalahan saat mengupdate data.");
      }
    });
  } else {
    // Pengguna tidak memiliki izin, mungkin tampilkan pesan kesalahan atau lakukan tindakan lain
    alert("Anda tidak memiliki izin untuk melakukan tindakan ini.");
  }
});



