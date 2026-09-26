var format = "DD-MM-YYYY";
let today = new Date();
let firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

$(function () {

  // Tanggal pengajuan tambah
  $("#tanggalinputbarangTambahDiv").datetimepicker({
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
    keepInvalid: true,
    widgetPositioning: {
      horizontal: 'left',
      vertical: 'bottom'
    }
  });

  $("#tanggalinputbarangTambahDiv").on("change.datetimepicker", function (e) {
    var date = moment(e.date).format(format);
    $('input[name="tanggalinputbarangTambah"]').val(date);
  });

  // Removed unused click handler for input-group-append

  // Tanggal Tambah di Modal
  $("#tanggalmasukbarangTambahDiv").datetimepicker({
    format: format,
    useCurrent: false,
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

  $("#tanggalmasukbarangTambahDiv").on("change.datetimepicker", function (e) {
    var date = moment(e.date).format(format);
    $('input[name="tanggalmasukbarangTambah"]').val(date);
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

  $("#tanggalAwalDiv, #tanggalAkhirDiv").on("change.datetimepicker", function () {
    loadData();
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

  // Tanggal Adjust

  $("#tanggalmasukbarangAdjustDiv").datetimepicker({
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
    keepInvalid: true, // Added option to keep invalid input
    widgetPositioning: {
      horizontal: 'left',
      vertical: 'bottom'
    }
  });

  // When the DateTimePicker is closed, set the date and time value
  $("#tanggalmasukbarangAdjustDiv").on("change.datetimepicker", function (e) {
    var date = moment(e.date).format(format);
    $('input[name="tanggalpengajuanTambah"]').val(date);
  });


  // Removed unused click handler for input-group-append

  // Tambahkan CSS custom untuk horizontal scroll dan border merah
  $("<style>")
    .prop("type", "text/css")
    .html("\
    #itemContainer2 { overflow-x: auto; white-space: nowrap; padding-bottom: 15px; border: 1px solid #ddd; border-radius: 5px; padding: 10px; margin-bottom: 20px; }\
    .item-row { display: flex !important; flex-wrap: nowrap !important; align-items: flex-start; gap: 10px; margin-bottom: 10px; }\
    .item-row > div { flex: 0 0 auto !important; }\
    .is-invalid-custom { border: 2px solid #dc3545 !important; }\
    .input-group.is-invalid-custom { border: 2px solid #dc3545 !important; border-radius: 5px; }\
    .is-invalid-custom:focus { box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important; }\
    .bootstrap-datetimepicker-widget { z-index: 9999 !important; }\
    .modal-content, .modal-body { overflow: visible !important; }\
    ")
    .appendTo("head");

});

function refreshData() {
  clearData();
  loadData();
}

function clearData() {
  //$('#example1').DataTable().clear().draw();
  $("#example1").DataTable().clear().destroy();
}

function downloadExcel() {
  var table = $("#example1").DataTable();
  var data = table.rows().data().toArray();

  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  XLSX.writeFile(wb, "Data mutasi masuk.xlsx");
}

function downloadExcel1() {
  var table = $("#example1").DataTable();
  var data = table.rows({ filter: "applied" }).data().toArray(); // Ambil data yang difilter

  var jsonData = data.map((item) => ({
    id: item.id,
    tanggalMasuk: item.tanggalMasuk,
    kodeBarang: item.kodeBarang,
    namaBarang: item.namaBarang,
    nomorBon: item.nomorBon,
    qtyIn: item.qtyIn,
    satuan: item.satuan,
    suplier: item.suplier,
    kategoriBarang: item.kategoriBarang,
  }));

  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.json_to_sheet(jsonData);
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  XLSX.writeFile(wb, "Data mutasi masuk.xlsx");
}

function loadData() {
  // Hancurkan DataTable yang sudah ada jika ada
  if ($.fn.DataTable.isDataTable("#example1")) {
    $("#example1").DataTable().destroy();
  }

  $("#example1").DataTable({
    ajax: {
      url: (function () {
        let start = moment($("#tanggalAwal").val(), format);
        let end = moment($("#tanggalAkhir").val(), format);
        let startStr = start.isValid() ? start.format("YYYY-MM-DD") : moment(firstDayOfMonth).format("YYYY-MM-DD");
        let endStr = end.isValid() ? end.format("YYYY-MM-DD") : moment(lastDayOfMonth).format("YYYY-MM-DD");
        return "api/datamutasibarangmasuk/" + startStr + "/" + endStr;
      })(),
      dataSrc: "",
      error: function (xhr, error, thrown) {
        console.log(xhr);
        console.log(error);
        console.log(thrown);
      },
    },
    columns: [
      { data: "id", visible: true },
      { data: "tanggalMasuk" },
      { data: "kodeBarang" },
      { data: "namaBarang" },
      {
        data: "nomorBon",
        render: function (data, type, row) {
          if (!data) return "";
          // Mengganti semua \n menjadi <br> agar Created/Edited tampil berurutan
          return data.replace(/\n/g, "<br>");
        },
      },
      { data: "qtyIn" },
      { data: "satuan" },
      { data: "suplier" },
      { data: "kategoriBarang" },
      {
        data: null,
        render: function (data, type, row) {
          var cleanNoBon = row.nomorBon.split('\n')[0];
          // Tombol history hanya tampil jika ada riwayat 'Edited'
          var historyButton = row.nomorBon.includes('Edited')
            ? '<button type="button" class="btn btn-secondary btn-xs btn-history" data-nomor_bon="' + cleanNoBon + '"><i class="fas fa-history"></i> History</button>'
            : '';

          return (
            '<div class="btn-group">' +
            '<button type="button" class="btn btn-info btn-xs btn-detail" data-nomor_bon="' +
            cleanNoBon +
            '"><i class="fas fa-info-circle"></i> Detail</button>' +
            historyButton +
            '</div>'
          );
        },
      },
    ],
    order: [[0, "desc"]],
    responsive: true,
    autoWidth: false,
  });
}

$("#formModal").on("shown.bs.modal", function () {
  // Paksa ubah teks tombol Submit untuk menghindari cache HTML
  $(this).find('button[type="submit"]').html('<i class="fab fa-telegram"></i> Submit');

  // Autofill Tanggal Input Barang dengan data Today (bisa diubah oleh user)
  var todayDate = moment().format(format);
  $('#tanggalinputbarangTambah').val(todayDate).prop('readonly', false);
  // Pastikan ikon kalender muncul dan datepicker aktif
  $('#tanggalinputbarangTambahDiv .input-group-append').show();
  $('#tanggalinputbarangTambahDiv').datetimepicker('enable');
  $('#tanggalinputbarangTambahDiv').datetimepicker('date', moment());

  /* SETTING NOMOR BON SAAT MODAL MUNCUL */

  // Mendapatkan bulan dan tahun saat ini
  var currentDate = new Date();
  var currentMonth = currentDate.getMonth() + 1; // Penambahan 1 karena indeks bulan dimulai dari 0
  var currentYear = currentDate.getFullYear();

  // Mengubah bulan menjadi format dua digit (misalnya: 01, 02, 03, dst.)
  var formattedMonth = ("0" + currentMonth).slice(-2);

  // Menghasilkan nomor bon dengan format "In/GTCT/MM/YYYY/"
  var nomorBon = "In/GTCT/LOK/" + formattedMonth + "/" + currentYear + "/";

  // Mengisi nilai nomorBon pada elemen input yang sesuai
  document.getElementById("depannomorBon").value = nomorBon;

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

      // Menghasilkan nomor bon dengan format "In/GTCT/MM/YYYY/"
      var nomorBon = "In/GTCT/LOK/" + formattedMonth + "/" + currentYear + "/";

      // Mengisi nilai nomorBon pada elemen input yang sesuai
      document.getElementById("depannomorBon").value = nomorBon;
    } else if (selectedValue === "IMPOR") {
      /* SETTING NOMOR BON SAAT MODAL MUNCUL */

      // Mendapatkan bulan dan tahun saat ini
      var currentDate = new Date();
      var currentMonth = currentDate.getMonth() + 1; // Penambahan 1 karena indeks bulan dimulai dari 0
      var currentYear = currentDate.getFullYear();

      // Mengubah bulan menjadi format dua digit (misalnya: 01, 02, 03, dst.)
      var formattedMonth = ("0" + currentMonth).slice(-2);

      // Menghasilkan nomor bon dengan format "In/GTCT/MM/YYYY/"
      var nomorBon = "In/GTCT/IMP/" + formattedMonth + "/" + currentYear + "/";

      // Mengisi nilai nomorBon pada elemen input yang sesuai
      document.getElementById("depannomorBon").value = nomorBon;
    } else {
      /* SETTING NOMOR BON SAAT MODAL MUNCUL */

      // Mendapatkan bulan dan tahun saat ini
      var currentDate = new Date();
      var currentMonth = currentDate.getMonth() + 1; // Penambahan 1 karena indeks bulan dimulai dari 0
      var currentYear = currentDate.getFullYear();

      // Mengubah bulan menjadi format dua digit (misalnya: 01, 02, 03, dst.)
      var formattedMonth = ("0" + currentMonth).slice(-2);

      // Menghasilkan nomor bon dengan format "In/GTCT/MM/YYYY/"
      var nomorBon = "In/GTCT/" + formattedMonth + "/" + currentYear + "/";

      // Mengisi nilai nomorBon pada elemen input yang sesuai
      document.getElementById("depannomorBon").value = nomorBon;
    }
  }

  ///////

  /* MUNCULKAN ROW KOLOM SATU BARIS SAAT MODAL TAMPIL HANYA JIKA KOSONG */
  var itemContainer = document.getElementById("itemContainer2");

  if (itemContainer.children.length === 0) {

    // Membuat elemen baru untuk item
    var itemRow = document.createElement("div");
    itemRow.classList.add("item-row");

    // Generate unique ID for the row
    var uniqueId = Date.now();

    // Kolom 1
    var kolom1 = document.createElement("div");
    kolom1.classList.add("col-md-2");
    var formGroup1 = document.createElement("div");
    formGroup1.classList.add("form-group");
    var label1 = document.createElement("label");
    label1.setAttribute("for", "kodeBarang");
    label1.textContent = "Kode Barang :";
    var input1 = document.createElement("input");
    input1.type = "text";
    input1.classList.add("form-control", "kodeBarang");
    input1.id = "kodeBarang-" + uniqueId; // Penanda unik pada ID
    input1.name = "kodeBarang-" + uniqueId; // Penanda unik pada nama
    input1.placeholder = "Input Kode Barang";
    input1.required = true;
    input1.autocomplete = "off";

    input1.addEventListener("input", function () {
      this.value = this.value.replace(/\s+/g, '').toUpperCase();
    });

    formGroup1.appendChild(label1);
    formGroup1.appendChild(input1);
    kolom1.appendChild(formGroup1);

    // Kolom 2
    var kolom2 = document.createElement("div");
    kolom2.classList.add("col-md-3");
    var formGroup2 = document.createElement("div");
    formGroup2.classList.add("form-group");
    var label2 = document.createElement("label");
    label2.setAttribute("for", "namaBarang");
    label2.textContent = "Nama Barang IDN :";
    var input2 = document.createElement("input");
    input2.type = "text";
    input2.classList.add("form-control", "namaBarang");
    input2.id = "namaBarang-" + uniqueId; // Penanda unik pada ID
    input2.name = "namaBarang-" + uniqueId; // Penanda unik pada nama
    input2.placeholder = "";
    input2.required = true;
    input2.disabled = true;

    formGroup2.appendChild(label2);
    formGroup2.appendChild(input2);
    kolom2.appendChild(formGroup2);

    // Kolom 3
    var kolom3 = document.createElement("div");
    kolom3.classList.add("col-md-1");
    var formGroup3 = document.createElement("div");
    formGroup3.classList.add("form-group");
    var label3 = document.createElement("label");
    label3.setAttribute("for", "saldo");
    label3.textContent = "Saldo :";
    var input3 = document.createElement("input");
    input3.type = "text";
    input3.classList.add("form-control", "saldo");
    input3.id = "saldo-" + uniqueId; // Penanda unik pada ID;
    input3.name = "saldo-" + uniqueId; // Penanda unik pada nama;
    input3.placeholder = "";
    input3.required = true;
    input3.autocomplete = "off";
    input3.disabled = true;

    formGroup3.appendChild(label3);
    formGroup3.appendChild(input3);
    kolom3.appendChild(formGroup3);

    // Kolom 4
    var kolom4 = document.createElement("div");
    kolom4.classList.add("col-md-1");
    var formGroup4 = document.createElement("div");
    formGroup4.classList.add("form-group");
    var label4 = document.createElement("label");
    label4.setAttribute("for", "qtyIn");
    label4.textContent = "QTY In:";
    var input4 = document.createElement("input");
    input4.type = "text";
    input4.classList.add("form-control", "qtyIn");
    input4.id = "qtyIn-" + uniqueId; // Penanda unik pada ID;
    input4.name = "qtyIn-" + uniqueId; // Penanda unik pada nama;
    input4.placeholder = "Input QTY";
    input4.required = true;
    input4.autocomplete = "off";

    formGroup4.appendChild(label4);
    formGroup4.appendChild(input4);
    kolom4.appendChild(formGroup4);

    // Kolom 5
    var kolom5 = document.createElement("div");
    kolom5.classList.add("col-md-1");
    var formGroup5 = document.createElement("div");
    formGroup5.classList.add("form-group");
    var label5 = document.createElement("label");
    label5.setAttribute("for", "satuan");
    label5.textContent = "Satuan :";
    var input5 = document.createElement("input");
    input5.type = "text";
    input5.classList.add("form-control", "satuan");
    input5.id = "satuan-" + uniqueId; // Penanda unik pada ID;
    input5.name = "satuan-" + uniqueId; // Penanda unik pada nama;
    input5.placeholder = "";
    input5.required = true;
    input5.disabled = true;
    formGroup5.appendChild(label5);
    formGroup5.appendChild(input5);
    kolom5.appendChild(formGroup5);

    // Kolom 6
    var kolom6 = document.createElement("div");
    kolom6.classList.add("col-md-2");
    var formGroup6 = document.createElement("div");
    formGroup6.classList.add("form-group");
    var label6 = document.createElement("label");
    label6.setAttribute("for", "namaSuplier");
    label6.textContent = "Nama Suplier :";
    var input6 = document.createElement("input");
    input6.type = "text";
    input6.classList.add("form-control", "namaSuplier");
    input6.name = "";
    input6.id = "namaSuplier-" + uniqueId; // Penanda unik pada ID;
    input6.name = "namaSuplier-" + uniqueId; // Penanda unik pada nama;
    input6.placeholder = "Input Supplier";
    input6.required = true;
    input6.autocomplete = "off";

    input6.addEventListener("input", function () {
      this.value = this.value.toUpperCase();
    });

    formGroup6.appendChild(label6);
    formGroup6.appendChild(input6);
    kolom6.appendChild(formGroup6);

    // Kolom 7
    var kolom7 = document.createElement("div");
    kolom7.classList.add("col-md-2");
    var formGroup7 = document.createElement("div");
    formGroup7.classList.add("form-group");
    var label7 = document.createElement("label");
    label7.setAttribute("for", "kategoriBarang");
    label7.textContent = "Kategori Barang :";
    var input7 = document.createElement("input");
    input7.type = "text";
    input7.classList.add("form-control", "kategoriBarang");
    input7.name = "";
    input7.id = "kategoriBarang-" + uniqueId; // Penanda unik pada ID;
    input7.name = "kategoriBarang-" + uniqueId; // Penanda unik pada nama;
    input7.placeholder = "";
    input7.required = true;
    input7.disabled = true;

    formGroup7.appendChild(label7);
    formGroup7.appendChild(input7);
    kolom7.appendChild(formGroup7);

    // Kolom 8
    var kolom8 = document.createElement("div");
    kolom8.classList.add("col-md-5");
    var formGroup8 = document.createElement("div");
    formGroup8.classList.add("form-group");
    var label8 = document.createElement("label");
    label8.setAttribute("for", "catatanBarang");
    label8.textContent = "Catatan Barang :";
    var input8 = document.createElement("input");
    input8.type = "text";
    input8.classList.add("form-control", "catatanBarang");
    input8.id = "catatanBarang-" + uniqueId; // Penanda unik pada ID;
    input8.name = "catatanBarang-" + uniqueId; // Penanda unik pada nama;
    input8.placeholder = "Input Catatan";
    input8.required = true;

    input8.addEventListener("input", function () {
      this.value = this.value.toUpperCase();
    });

    formGroup8.appendChild(label8);
    formGroup8.appendChild(input8);
    kolom8.appendChild(formGroup8);

    // Kolom 9 (Tombol Hapus)
    var kolom9 = document.createElement("div");
    kolom9.classList.add("col-md-1");
    var btnHapus = document.createElement("button");
    btnHapus.type = "button";
    btnHapus.classList.add("btn", "btn-danger");
    btnHapus.style.marginTop = "30px";
    btnHapus.innerHTML = '<i class="fas fa-trash"></i>';
    btnHapus.addEventListener("click", function () {
      itemRow.remove();
      divider.remove();
    });
    kolom9.appendChild(btnHapus);

    // Menambahkan kolom ke dalam row item
    itemRow.appendChild(kolom1);
    itemRow.appendChild(kolom2);
    itemRow.appendChild(kolom3);
    itemRow.appendChild(kolom4);
    itemRow.appendChild(kolom5);
    itemRow.appendChild(kolom6);
    itemRow.appendChild(kolom7);
    itemRow.appendChild(kolom8);
    itemRow.appendChild(kolom9);

    // Menambahkan garis horizontal (divider) sebelum row item
    var divider = document.createElement("hr");
    divider.style.border = "none";
    divider.style.height = "2px";
    divider.style.backgroundColor = "#000";
    divider.style.margin = "10px 0";
    itemContainer.appendChild(divider);

    // Menambahkan row item ke dalam container
    itemContainer.appendChild(itemRow);

    // Fungsi untuk mengubah warna dan gaya tulisan secara periodik
    function changeColorAndStyle(namaBarangInput) {
      var colorIndex = 0;
      var colors = ["red", "blue", "green"]; // Daftar warna yang akan digunakan

      function updateColorAndStyle() {
        namaBarangInput.style.color = colors[colorIndex];
        namaBarangInput.style.fontWeight = "bold";
        colorIndex = (colorIndex + 1) % colors.length;
      }

      var intervalId = setInterval(updateColorAndStyle, 500);

      // Mengembalikan intervalId agar bisa dihentikan nanti
      return intervalId;
    }

    // Variabel untuk menyimpan intervalId dari changeColorAndStyle
    var myIntervalId;

    // Melakukan logika autofill berdasarkan ID unik dari baris
    function autofillLogic(event) {
      var targetInput = event.target;
      var jenisbarangSelected = document.getElementById("jenisbarangtambahMasuk");
      //console.log(jenisbarangSelected.value);
      //debugger

      // Hentikan semua interval jika sedang berjalan
      if (myIntervalId) {
        clearInterval(myIntervalId);
      }

      var row = targetInput.closest(".item-row"); // Mendapatkan elemen baris terdekat

      // Mendapatkan elemen-elemen terkait dalam baris saat ini
      var kodeBarangInput = row.querySelector(".kodeBarang");
      var namaBarangInput = row.querySelector(".namaBarang");
      var saldoInput = row.querySelector(".saldo");
      var satuanInput = row.querySelector(".satuan");
      var kategoriInput = row.querySelector(".kategoriBarang");
      console.log(kodeBarangInput.value);
      console.log(jenisbarangSelected.value);
      // Mengirim permintaan ke server untuk mendapatkan data autofill
      if (kodeBarangInput.value !== "") {
        fetch(
          "/autofillitembarangmasuk/" +
          kodeBarangInput.value +
          "/" +
          jenisbarangSelected.value
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.results.length > 0) {
              // Mengisi nilai input dengan hasil dari server
              namaBarangInput.style.removeProperty("color");
              namaBarangInput.value = data.results[0].NamaBarangIndo;
              saldoInput.value = data.results[0].Saldo_Akhir;
              satuanInput.value = data.results[0].SatuanIndo;
              kategoriInput.value = data.results[0].KategoriBarang;

              // Mencetak hasil data.results ke konsol
              console.log("Hasil autofill:", data.results);
            } else {
              namaBarangInput.value = "TIDAK DITEMUKAN";
              // Simpan intervalId yang dikembalikan oleh changeColorAndStyle
              myIntervalId = changeColorAndStyle(namaBarangInput);

              saldoInput.value = "";
              satuanInput.value = "";
              kategoriInput.value = "";
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            console.error("Response:", response);
            // Menangani kesalahan jika terjadi
          });
      } else {
        namaBarangInput.value = "";
        saldoInput.value = "";
        satuanInput.value = "";
        kategoriInput.value = "";
      }
    }

    // kode asli
    // Menghubungkan fungsi autofillLogic dengan kolom pertama
    //var kodeBarangInput = itemRow.querySelector('.kodeBarang');
    //kodeBarangInput.addEventListener("input", autofillLogic);
    //kodeBarangInput.addEventListener("change", autofillLogic);

    // Menghubungkan fungsi autofillLogic dengan kolom pertama
    var kodeBarangInput = itemRow.querySelector(".kodeBarang");
    kodeBarangInput.addEventListener("input", function (event) {
      event.target.value = event.target.value.replace(/\s+/g, '').toUpperCase();
      autofillLogic(event);
    });
    kodeBarangInput.addEventListener("change", function (event) {
      event.target.value = event.target.value.replace(/\s+/g, '').toUpperCase();
      autofillLogic(event);
    });
  }
});

function formatDate(rawDate) {
  const date = new Date(rawDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
}

$(document).ready(function () {
  let today = new Date();
  let firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  let lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Function to reload the page after a certain delay
  function reloadPage() {
    setTimeout(function () {
      window.location.reload();
    }, 2000); // Reload after 5 seconds
  }

  // Listen for window errors
  window.addEventListener("error", function (event) {
    var errorMessage = event.error.message;
    if (errorMessage && errorMessage.includes("CONTENT_LENGTH_MISMATCH")) {
      // Call the reloadPage function if error message contains the keyword
      reloadPage();
    }
  });

  // Mengisi nilai default tanggal awal dan tanggal akhir
  document.getElementById("tanggalAwal").value = formatDate(firstDayOfMonth);
  document.getElementById("tanggalAkhir").value = formatDate(lastDayOfMonth);

  loadData();
  //$('#nomorBon').inputmask();
  $("#btnRefresh").on("click", function () {
    clearData();
    loadData();
  });
});

document
  .getElementById("form-tambah-data")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const namalengkapEl = document.getElementById("namalengkap");
    const namaLengkap = namalengkapEl ? namalengkapEl.value.trim() : "";
    var dataArray = [];

    // Ambil input utama
    var tanggalInputBarangEl = document.getElementById("tanggalinputbarangTambah");
    var tanggalInputBarang = tanggalInputBarangEl ? tanggalInputBarangEl.value : "";

    var kodeBarangEl = document.querySelector(".kodeBarang");
    var kodeBarang = kodeBarangEl ? kodeBarangEl.value : "";

    var depannomorBonEl = document.getElementById("depannomorBon");
    var depannomorBon = depannomorBonEl ? depannomorBonEl.value : "";

    var nomorBonEl = document.getElementById("nomorBon");
    var nomorBon = nomorBonEl ? nomorBonEl.value : "";

    var tanggalMasukBarangEl = document.getElementById("tanggalmasukbarangTambah");
    var tanggalMasukBarang = tanggalMasukBarangEl ? tanggalMasukBarangEl.value : "";

    var qtyInEl = document.querySelector(".qtyIn");
    var qtyIn = qtyInEl ? qtyInEl.value : "";

    var namaSuplierEl = document.querySelector(".namaSuplier");
    var namaSuplier = namaSuplierEl ? namaSuplierEl.value : "";

    var catatanBarangEl = document.querySelector(".catatanBarang");
    var catatanBarang = catatanBarangEl ? catatanBarangEl.value : "";

    // === Validasi input utama ===
    var isValid = true;
    var fieldsToValidate = [
      { id: "namalengkap", value: namaLengkap },
      { id: "tanggalinputbarangTambah", value: tanggalInputBarang },
      { selector: ".kodeBarang", value: kodeBarang, isFirst: true },
      { id: "depannomorBon", value: depannomorBon },
      { id: "nomorBon", value: nomorBon },
      { id: "tanggalmasukbarangTambah", value: tanggalMasukBarang },
      { selector: ".qtyIn", value: qtyIn, isFirst: true },
      { selector: ".namaSuplier", value: namaSuplier, isFirst: true }
    ];

    fieldsToValidate.forEach(function (field) {
      var el;
      if (field.id) {
        el = document.getElementById(field.id);
      } else if (field.selector && field.isFirst) {
        el = document.querySelector(field.selector);
      }

      if (el && field.value.trim() === "") {
        const targetEl = (el.classList.contains("datetimepicker-input") && el.closest(".input-group")) ? el.closest(".input-group") : el;
        targetEl.classList.add("is-invalid-custom");

        // Listener untuk hapus tanda merah saat user mulai input
        const remover = function () {
          targetEl.classList.remove("is-invalid-custom");
          el.removeEventListener("input", remover);
          el.removeEventListener("change", remover);
          if (targetEl !== el) {
            targetEl.removeEventListener("input", remover);
            targetEl.removeEventListener("change", remover);
          }
        };
        el.addEventListener("input", remover);
        el.addEventListener("change", remover);

        isValid = false;
      }
    });

    if (!isValid) {
      Swal.fire({
        title: 'Peringatan!',
        text: 'Data tidak boleh ada yang kosong (perhatikan tanda merah)!',
        icon: 'warning'
      });
      return;
    }

    // Ubah koma ke titik untuk desimal
    qtyIn = qtyIn.replace(",", ".");
    if (isNaN(parseFloat(qtyIn))) {
      Swal.fire({
        title: 'Format Salah!',
        text: 'Qty In harus berupa angka (boleh desimal dengan titik)!',
        icon: 'error'
      });
      return;
    }

    // Ambil elemen item tambahan
    var itemRows = document.querySelectorAll("#itemContainer2 .item-row");

    // Jika tidak ada item tambahan → masukkan data utama saja
    if (itemRows.length === 0) {
      dataArray.push({
        tanggalinputbarangTambah: tanggalInputBarang,
        kodeBarang: kodeBarang,
        nomorBon: depannomorBon + nomorBon,
        tanggalmasukbarangTambah: tanggalMasukBarang,
        qtyIn: parseFloat(qtyIn),
        namaSuplier: namaSuplier,
        namaLengkap: namaLengkap,
        catatanBarang: catatanBarang,
      });
    } else {
      // Kalau ada item tambahan
      var allItemsValid = true;
      itemRows.forEach(function (row) {
        var kodeBarangItem = row.querySelector(".kodeBarang").value;
        var qtyInItem = row.querySelector(".qtyIn").value;
        var namaSuplierItem = row.querySelector(".namaSuplier").value;
        var catatanItem = row.querySelector(".catatanBarang").value;

        var rowInputs = row.querySelectorAll("input:not([disabled]), select:not([disabled])");
        rowInputs.forEach(function (input) {
          // Kecualikan catatanBarang dari validasi merah
          if (input.classList.contains("catatanBarang")) {
            return;
          }

          if (input.value.trim() === "") {
            const targetEl = (input.classList.contains("datetimepicker-input") && input.closest(".input-group")) ? input.closest(".input-group") : input;
            targetEl.classList.add("is-invalid-custom");

            const remover = function () {
              targetEl.classList.remove("is-invalid-custom");
              input.removeEventListener("input", remover);
              input.removeEventListener("change", remover);
              if (targetEl !== input) {
                targetEl.removeEventListener("input", remover);
                targetEl.removeEventListener("change", remover);
              }
            };
            input.addEventListener("input", remover);
            input.addEventListener("change", remover);

            allItemsValid = false;
          }
        });

        if (allItemsValid) {
          qtyInItem = qtyInItem.replace(",", ".");
          dataArray.push({
            tanggalinputbarangTambah: tanggalInputBarang,
            kodeBarang: kodeBarangItem,
            nomorBon: depannomorBon + nomorBon,
            tanggalmasukbarangTambah: tanggalMasukBarang,
            qtyIn: parseFloat(qtyInItem),
            namaSuplier: namaSuplierItem,
            namaLengkap: namaLengkap,
            catatanBarang: catatanItem,
          });
        }
      });

      if (!allItemsValid) {
        Swal.fire({
          title: 'Peringatan!',
          text: 'Data tidak boleh ada yang kosong pada item tambahan!',
          icon: 'warning'
        });
        return;
      }
    }

    // Cek data di console
    console.log("=== CEK DATA SEBELUM SUBMIT ===");
    console.log(JSON.stringify(dataArray, null, 2));

    // === Popup Konfirmasi menggunakan SweetAlert2 ===
    Swal.fire({
      title: 'Konfirmasi',
      text: 'Apakah data yang diinput sudah benar dan siap dikirim ke server?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Lanjutkan',
      cancelButtonText: 'Batalkan',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Kirim data ke server
        fetch("/mutasibarangmasuk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataArray),
        })
          .then(async (response) => {
            if (!response.ok) {
              let errorMsg = 'Network response was not ok';
              try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                  errorMsg = errorData.error;
                }
              } catch (e) {
                // Not a JSON error or other issue, keep default
              }
              throw new Error(errorMsg);
            }
            return response.json();
          })
          .then((data) => {
            console.log("✅ Server response:", data);

            // Buat ringkasan data yang diinput
            var summaryHtml = '<div style="text-align: left; max-height: 200px; overflow-y: auto;">';
            summaryHtml += '<table class="table table-sm table-bordered"><thead><tr><th>Kode</th><th>Qty</th></tr></thead><tbody>';
            dataArray.forEach(function (item) {
              summaryHtml += '<tr><td>' + item.kodeBarang + '</td><td>' + item.qtyIn + '</td></tr>';
            });
            summaryHtml += '</tbody></table></div>';

            // Tutup modal form
            $("#formModal").modal("hide");

            // Refresh tabel data tanpa refresh halaman
            refreshData();

            // Tampilkan pesan sukses menggunakan SweetAlert2
            Swal.fire({
              title: 'Berhasil Input!',
              html: 'Data barang masuk berhasil ditambahkan:<br><br>' + summaryHtml,
              icon: 'success',
              confirmButtonText: 'Tutup'
            });

            // Reset input utama
            document.getElementById("form-tambah-data").reset();
            // Reset tanggal ke default jika perlu (formatDate is used in doc ready)
            let today = new Date();
            document.getElementById("tanggalAwal").value = formatDate(new Date(today.getFullYear(), today.getMonth(), 1));
            document.getElementById("tanggalAkhir").value = formatDate(new Date(today.getFullYear(), today.getMonth() + 1, 0));

            // Hapus item tambahan
            var itemContainer = document.getElementById("itemContainer2");
            while (itemContainer.firstChild) {
              itemContainer.removeChild(itemContainer.firstChild);
            }
          })
          .catch((error) => {
            console.error("❌ Error:", error);
            Swal.fire({
              title: 'Kesalahan!',
              text: 'Terjadi kesalahan saat mengirim data ke server: ' + error.message,
              icon: 'error'
            });
          });
      } else {
        Swal.fire({
          title: 'Dibatalkan',
          text: 'Proses dibatalkan.',
          icon: 'info',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  });

document.getElementById("tambahItemBtn").addEventListener("click", function () {
  var itemContainer = document.getElementById("itemContainer2");

  // Membuat elemen baru untuk item
  var itemRow = document.createElement("div");
  itemRow.classList.add("item-row");

  // Generate unique ID for the row
  var uniqueId = Date.now();

  // Kolom 1
  var kolom1 = document.createElement("div");
  kolom1.classList.add("col-md-2");
  var formGroup1 = document.createElement("div");
  formGroup1.classList.add("form-group");
  var label1 = document.createElement("label");
  label1.setAttribute("for", "kodeBarang");
  label1.textContent = "Kode Barang :";
  var input1 = document.createElement("input");
  input1.type = "text";
  input1.classList.add("form-control", "kodeBarang");
  input1.id = "kodeBarang-" + uniqueId; // Penanda unik pada ID
  input1.name = "kodeBarang-" + uniqueId; // Penanda unik pada nama
  input1.placeholder = "Masukkan kode barang";
  input1.required = true;
  input1.autocomplete = "off";

  input1.addEventListener("input", function () {
    this.value = this.value.toUpperCase();
  });

  formGroup1.appendChild(label1);
  formGroup1.appendChild(input1);
  kolom1.appendChild(formGroup1);

  // Kolom 2
  var kolom2 = document.createElement("div");
  kolom2.classList.add("col-md-3");
  var formGroup2 = document.createElement("div");
  formGroup2.classList.add("form-group");
  var label2 = document.createElement("label");
  label2.setAttribute("for", "namaBarang");
  label2.textContent = "Nama Barang IDN :";
  var input2 = document.createElement("input");
  input2.type = "text";
  input2.classList.add("form-control", "namaBarang");
  input2.id = "namaBarang-" + uniqueId; // Penanda unik pada ID
  input2.name = "namaBarang-" + uniqueId; // Penanda unik pada nama
  input2.placeholder = "";
  input2.required = true;
  input2.disabled = true;

  formGroup2.appendChild(label2);
  formGroup2.appendChild(input2);
  kolom2.appendChild(formGroup2);

  // Kolom 3
  var kolom3 = document.createElement("div");
  kolom3.classList.add("col-md-1");
  var formGroup3 = document.createElement("div");
  formGroup3.classList.add("form-group");
  var label3 = document.createElement("label");
  label3.setAttribute("for", "saldo");
  label3.textContent = "Saldo :";
  var input3 = document.createElement("input");
  input3.type = "text";
  input3.classList.add("form-control", "saldo");
  input3.id = "saldo-" + uniqueId; // Penanda unik pada ID;
  input3.name = "saldo-" + uniqueId; // Penanda unik pada nama;
  input3.placeholder = "";
  input3.required = true;
  input3.autocomplete = "off";
  input3.disabled = true;

  formGroup3.appendChild(label3);
  formGroup3.appendChild(input3);
  kolom3.appendChild(formGroup3);

  // Kolom 4
  var kolom4 = document.createElement("div");
  kolom4.classList.add("col-md-1");
  var formGroup4 = document.createElement("div");
  formGroup4.classList.add("form-group");
  var label4 = document.createElement("label");
  label4.setAttribute("for", "qtyIn");
  label4.textContent = "QTY In:";
  var input4 = document.createElement("input");
  input4.type = "text";
  input4.classList.add("form-control", "qtyIn");
  input4.id = "qtyIn-" + uniqueId; // Penanda unik pada ID;
  input4.name = "qtyIn-" + uniqueId; // Penanda unik pada nama;
  input4.placeholder = "";
  input4.required = true;
  input4.autocomplete = "off";

  formGroup4.appendChild(label4);
  formGroup4.appendChild(input4);
  kolom4.appendChild(formGroup4);

  // Kolom 5
  var kolom5 = document.createElement("div");
  kolom5.classList.add("col-md-1");
  var formGroup5 = document.createElement("div");
  formGroup5.classList.add("form-group");
  var label5 = document.createElement("label");
  label5.setAttribute("for", "satuan");
  label5.textContent = "Satuan :";
  var input5 = document.createElement("input");
  input5.type = "text";
  input5.classList.add("form-control", "satuan");
  input5.id = "satuan-" + uniqueId; // Penanda unik pada ID;
  input5.name = "satuan-" + uniqueId; // Penanda unik pada nama;
  input5.placeholder = "";
  input5.required = true;
  input5.disabled = true;
  formGroup5.appendChild(label5);
  formGroup5.appendChild(input5);
  kolom5.appendChild(formGroup5);

  // Kolom 6
  var kolom6 = document.createElement("div");
  kolom6.classList.add("col-md-2");
  var formGroup6 = document.createElement("div");
  formGroup6.classList.add("form-group");
  var label6 = document.createElement("label");
  label6.setAttribute("for", "namaSuplier");
  label6.textContent = "Nama Suplier :";
  var input6 = document.createElement("input");
  input6.type = "text";
  input6.classList.add("form-control", "namaSuplier");
  input6.name = "";
  input6.id = "namaSuplier-" + uniqueId; // Penanda unik pada ID;
  input6.name = "namaSuplier-" + uniqueId; // Penanda unik pada nama;
  input6.placeholder = "";
  input6.required = true;
  input6.autocomplete = "off";

  input6.addEventListener("input", function () {
    this.value = this.value.toUpperCase();
  });

  formGroup6.appendChild(label6);
  formGroup6.appendChild(input6);
  kolom6.appendChild(formGroup6);

  // Kolom 7
  var kolom7 = document.createElement("div");
  kolom7.classList.add("col-md-2");
  var formGroup7 = document.createElement("div");
  formGroup7.classList.add("form-group");
  var label7 = document.createElement("label");
  label7.setAttribute("for", "kategoriBarang");
  label7.textContent = "Kategori Barang :";
  var input7 = document.createElement("input");
  input7.type = "text";
  input7.classList.add("form-control", "kategoriBarang");
  input7.name = "";
  input7.id = "kategoriBarang-" + uniqueId; // Penanda unik pada ID;
  input7.name = "kategoriBarang-" + uniqueId; // Penanda unik pada nama;
  input7.placeholder = "";
  input7.required = true;
  input7.disabled = true;

  formGroup7.appendChild(label7);
  formGroup7.appendChild(input7);
  kolom7.appendChild(formGroup7);

  // Kolom 8
  var kolom8 = document.createElement("div");
  kolom8.classList.add("col-md-5");
  var formGroup8 = document.createElement("div");
  formGroup8.classList.add("form-group");
  var label8 = document.createElement("label");
  label8.setAttribute("for", "catatanBarang");
  label8.textContent = "Catatan Barang :";
  var input8 = document.createElement("input");
  input8.type = "text";
  input8.classList.add("form-control", "catatanBarang");
  input8.name = "";
  input8.id = "catatanBarang-" + uniqueId; // Penanda unik pada ID;
  input8.name = "catatanBarang-" + uniqueId; // Penanda unik pada nama;
  input8.placeholder = "";
  input8.required = true;

  input8.addEventListener("input", function () {
    this.value = this.value.toUpperCase();
  });

  formGroup8.appendChild(label8);
  formGroup8.appendChild(input8);
  kolom8.appendChild(formGroup8);

  // Kolom 9 (Tombol Hapus)
  var kolom9 = document.createElement("div");
  kolom9.classList.add("col-md-1");
  var btnHapus = document.createElement("button");
  btnHapus.type = "button";
  btnHapus.classList.add("btn", "btn-danger");
  btnHapus.style.marginTop = "30px";
  btnHapus.innerHTML = '<i class="fas fa-trash"></i>';
  btnHapus.addEventListener("click", function () {
    itemRow.remove();
    divider.remove();
  });
  kolom9.appendChild(btnHapus);

  // Menambahkan kolom ke dalam row item
  itemRow.appendChild(kolom1);
  itemRow.appendChild(kolom2);
  itemRow.appendChild(kolom3);
  itemRow.appendChild(kolom4);
  itemRow.appendChild(kolom5);
  itemRow.appendChild(kolom6);
  itemRow.appendChild(kolom7);
  itemRow.appendChild(kolom8);
  itemRow.appendChild(kolom9);

  // Menambahkan garis horizontal (divider) sebelum row item
  var divider = document.createElement("hr");
  divider.style.border = "none";
  divider.style.height = "2px";
  divider.style.backgroundColor = "#000";
  divider.style.margin = "10px 0";
  itemContainer.appendChild(divider);

  // Menambahkan row item ke dalam container
  itemContainer.appendChild(itemRow);

  // Melakukan logika autofill berdasarkan ID unik dari baris
  function autofillLogic(event) {
    var targetInput = event.target;
    var row = targetInput.closest(".item-row"); // Mendapatkan elemen baris terdekat

    // Mendapatkan elemen-elemen terkait dalam baris saat ini
    var kodeBarangInput = row.querySelector(".kodeBarang");
    var namaBarangInput = row.querySelector(".namaBarang");
    var saldoInput = row.querySelector(".saldo");
    var satuanInput = row.querySelector(".satuan");
    var kategoriInput = row.querySelector(".kategoriBarang");

    // Mengirim permintaan ke server untuk mendapatkan data autofill
    if (kodeBarangInput.value !== "") {
      var jenisbarangSelected = document.getElementById("jenisbarangtambahMasuk");
      fetch("/autofillitembarangmasuk/" + kodeBarangInput.value + "/" + jenisbarangSelected.value)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          if (data.results && data.results.length > 0) {
            // Mengisi nilai input dengan hasil dari server
            namaBarangInput.value = data.results[0].NamaBarangIndo;
            saldoInput.value = data.results[0].Saldo_Akhir;
            satuanInput.value = data.results[0].SatuanIndo;
            kategoriInput.value = data.results[0].KategoriBarang;

            // Mencetak hasil data.results ke konsol
            console.log(data.results);
          } else {
            namaBarangInput.value = "";
            saldoInput.value = "";
            satuanInput.value = "";
            kategoriInput.value = "";
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          // Menangani kesalahan jika terjadi
        });
    } else {
      namaBarangInput.value = "";
      saldoInput.value = "";
      satuanInput.value = "";
      kategoriInput.value = "";
    }
  }

  // Menghubungkan fungsi autofillLogic dengan kolom pertama
  var kodeBarangInput = itemRow.querySelector(".kodeBarang");
  kodeBarangInput.addEventListener("input", autofillLogic);
  kodeBarangInput.addEventListener("change", autofillLogic);
});

document
  .getElementById("hapusItemBtn")
  .addEventListener("click", function (event) {
    // Mengosongkan nilai input item tambahan
    var itemContainer = document.getElementById("itemContainer2");
    var rows = itemContainer.getElementsByClassName("item-row");

    // Mengosongkan value setiap kolom pada setiap row
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var inputs = row.getElementsByTagName("input");
      for (var j = 0; j < inputs.length; j++) {
        inputs[j].value = "";
      }
    }
    //Hapus row hasil tambah item
    var itemContainer = document.getElementById("itemContainer2");
    while (itemContainer.firstChild) {
      itemContainer.removeChild(itemContainer.firstChild);
    }
  });

$("#formModalAdjust").on("shown.bs.modal", function () {
  /* SETTING NOMOR BON SAAT MODAL MUNCUL */

  // Mendapatkan bulan dan tahun saat ini
  var currentDate = new Date();
  var currentMonth = currentDate.getMonth() + 1; // Penambahan 1 karena indeks bulan dimulai dari 0
  var currentYear = currentDate.getFullYear();

  // Mengubah bulan menjadi format dua digit (misalnya: 01, 02, 03, dst.)
  var formattedMonth = ("0" + currentMonth).slice(-2);

  // Menghasilkan nomor bon dengan format "In/GTCT/MM/YYYY/"
  var nomorRef = "Adj/GTCT/" + formattedMonth + "/" + currentYear + "/";

  // Mengambil jumlah data NoBon dari server menggunakan AJAX
  $.ajax({
    url: "/autocomplete-adjnoref",
    method: "GET",
    success: function (response) {
      var jumlahData = response.jumlahData;

      // Menghasilkan format nomor berikutnya (misalnya: 00001, 00002, 00003, dst.)
      var formattedNumber = ("00000" + jumlahData).slice(-5);

      // Mengisi nilai nomorbonAdjust pada elemen input yang sesuai
      document.getElementById("depannomorbonAdjust").value =
        nomorRef + formattedNumber;
    },
    error: function (error) {
      console.log(error);
    },
  });
});

/* Auto fill manual
// Melakukan logika autofill berdasarkan ID unik dari baris
function autofillLogic(event) {
  var targetInput = event.target;
  var row = targetInput.closest('.item-row'); // Mendapatkan elemen baris terdekat

  // Mendapatkan elemen-elemen terkait dalam baris saat ini
  var kodeBarangInput = row.querySelector('.kodeBarang');
  var namaBarangInput = row.querySelector('.namaBarang');

  // Implementasikan logika autofill di sini
  // Misalnya, memeriksa nilai kodeBarangInput dan mengisi nilai namaBarangInput jika diperlukan
  // Implementasikan logika autofill di sini
  if (kodeBarangInput.value === '1234') {
    namaBarangInput.value = 'Nama Barang 1234';
  } else if (kodeBarangInput.value === '1122') {
    namaBarangInput.value = 'Nama Barang 1122';
  } else {
    namaBarangInput.value = '';
  }
} */
var counter = 1; // Variabel global untuk menghitung jumlah item yang ditambahkan

// Fungsi untuk menambahkan item baru
function tambahItemAdj() {
  // Langkah 1: Dapatkan elemen <div class="container-fluid">
  var container = document.getElementById("containerfluid");

  // Langkah 2: Simpan kode HTML yang ingin dimasukkan dalam variabel htmlCode
  var htmlCode = `
    <div id="itemContainer${counter}" class="scrolling-wrapper row flex-row flex-nowrap mt-4 pb-4 pt-2" style="overflow: auto; display: flex;">
      <!-- Elemen HTML untuk item pertama -->
      <div class="col-3 item-row">
        <label>Kode Barang :</label>
        <input type="text" class="form-control kodebarangAdj" id="kodebarangAdj-${counter}" name="kodebarangAdj-${counter}" placeholder="Masukkan kode barang" required autocomplete="off">
      </div>

      <div class="col-4 item-row">
        <label>Nama Barang IDN :</label>
        <input type="text" class="form-control namabarangAdj" id="namabarangAdj-${counter}" name="namabarangAdj-${counter}" placeholder="" required disabled>
      </div>

      <div class="col-2 item-row">
        <label>Saldo :</label>
        <input type="text" class="form-control saldoAdj" id="saldoAdj-${counter}" name="saldoAdj-${counter}" placeholder="" required autocomplete="off" disabled>
      </div>

      <div class="col-2 item-row">
        <label>QTY Adj:</label>
        <input type="text" class="form-control qtyInAdj" id="qtyInAdj-${counter}" name="qtyInAdj-${counter}" placeholder="" required autocomplete="off">
      </div>

      <div class="col-1 item-row">
        <label>Satuan :</label>
        <input type="text" class="form-control satuan" id="satuan-${counter}" name="satuan-${counter}" placeholder="" required disabled>
      </div>

      <div class="col-2 item-row">
        <label>Saldo Hasil Adj :</label>
        <input type="text" class="form-control saldoakhirAdj"  id="saldoakhirAdj-${counter}" name="saldoakhirAdj-${counter}" placeholder="" required autocomplete="off" disabled>
      </div>
      
      <div class="col-2 item-row">
        <label>Kategori Barang :</label>
        <input type="text" class="form-control kategoribarangAdj" id="kategoribarangAdj-${counter}" name="kategoribarangAdj-${counter}" placeholder="" required disabled>
      </div>
      <div class="col-1 item-row">
      <button class="hapus-item btn btn-danger" onclick="hapusItem('itemContainer${counter}')" style="cursor: pointer; margin-top: 30px;">
          <i class="fas fa-times"></i> Hapus Baris
        </button>
      </div>

</div>

    </div>
  `;

  // Langkah 3: Masukkan kode HTML ke dalam elemen <div class="container-fluid">
  container.insertAdjacentHTML("beforeend", htmlCode);

  // Ambil input kode barang yang baru ditambahkan
  var kodeBarangInput = document.getElementById(`kodebarangAdj-${counter}`);
  var qtyAdjInput = document.getElementById(`qtyInAdj-${counter}`);

  qtyAdjInput.addEventListener(
    "input",
    (function (counter) {
      return function (event) {
        var qtyAdjValue = parseFloat(event.target.value); // Ambil nilai qtyAdj yang diinput

        // Dapatkan elemen input saldoAdj dan saldoakhirAdj
        var saldoInput = document.querySelector(
          `#itemContainer${counter} .saldoAdj`
        );
        var saldoAkhirInput = document.querySelector(
          `#itemContainer${counter} .saldoakhirAdj`
        );

        if (saldoInput && saldoAkhirInput) {
          // Jika elemen input ditemukan, lakukan perhitungan dan atur nilai saldoakhirAdj
          var saldoValue = parseFloat(saldoInput.value);
          var saldoAkhirValue = qtyAdjValue + saldoValue;
          saldoAkhirInput.value = Math.round(saldoAkhirValue); // Menampilkan nilai dengan 2 desimal
        }
      };
    })(counter)
  );

  kodeBarangInput.addEventListener(
    "input",
    (function (counter) {
      return function (event) {
        //this.value = this.value.toUpperCase();
        autofillLogic(event, counter);
      };
    })(counter)
  );

  counter++; // Tingkatkan counter setelah item ditambahkan
}

// Fungsi untuk logika autofill
function autofillLogic(event, counter) {
  var kodeBarang = event.target.value; // Ambil nilai kode barang yang diinput

  // Lakukan request ke API dengan menggunakan kodeBarang
  fetch(`/autofillbarangadjust/${kodeBarang}`)
    .then((response) => response.json())
    .then((data) => {
      // Periksa apakah data berhasil ditemukan
      if (data.results.length > 0) {
        var barang = data.results[0]; // Ambil data barang pertama

        // Dapatkan elemen input nama barang yang sesuai dengan counter container
        var namaBarangInput = document.querySelector(
          `#itemContainer${counter} .namabarangAdj`
        );

        if (namaBarangInput) {
          // Jika elemen input nama barang ditemukan, atur nilai value dan name
          namaBarangInput.value = barang.NamaBarangIndo;
          namaBarangInput.name = `namabarangAdj-${counter}`;
        } else {
          console.error("Elemen input nama barang tidak ditemukan");
        }

        // Tambahan: Isi elemen input lainnya berdasarkan data API yang diperoleh
        var saldoInput = document.querySelector(
          `#itemContainer${counter} .saldoAdj`
        );
        var satuanInput = document.querySelector(
          `#itemContainer${counter} .satuan`
        );
        var saldoAkhirInput = document.querySelector(
          `#itemContainer${counter} .saldoakhirAdj`
        );
        var kategoriInput = document.querySelector(
          `#itemContainer${counter} .kategoribarangAdj`
        );

        if (saldoInput) {
          saldoInput.value = barang.Saldo_Akhir;
        }

        if (satuanInput) {
          satuanInput.value = barang.SatuanIndo;
        }

        if (saldoAkhirInput) {
          saldoAkhirInput.value = ""; // Atur nilai saldo akhir sesuai kebutuhan
        }

        if (kategoriInput) {
          kategoriInput.value = barang.KategoriBarang;
        }
      } else {
        console.error("Data barang tidak ditemukan");
      }
    })
    .catch((error) => {
      console.error(
        "Terjadi kesalahan pada saat mengambil data dari API",
        error
      );
    });
}

var tambahItemBtn = document.getElementById("tambahItemBtnAdjust");
tambahItemBtn.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent default button behavior
  tambahItemAdj();
});

// Fungsi untuk menghapus item
function hapusItem(containerId) {
  var container = document.getElementById(containerId);
  container.remove();
}

document
  .getElementById("form-adjust-data")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const namaLengkap = document.getElementById("namalengkap").value.trim();
    const userName = document.getElementById("username");
    const levelUser = document.querySelector("#leveluser");
    var formData = []; // Array untuk menyimpan data dari setiap kolom input

    // Loop melalui setiap counter
    var tanggalAdjust = document.getElementById(`tanggalmasukbarangAdjust`);
    var depannomorbonAdjust = document.getElementById(`depannomorbonAdjust`);

    // Validasi tanggalmasukbarangAdjust tidak null / kosong
    if (!tanggalAdjust.value) {
      alert("Tanggal Adjustment tidak boleh kosong.");
      return;
    }

    for (var i = 1; i <= counter; i++) {
      var kodebarang = document.getElementById(`kodebarangAdj-${i}`);
      var namabarang = document.getElementById(`namabarangAdj-${i}`);
      var saldo = document.getElementById(`saldoAdj-${i}`);
      var qtyInAdj = document.getElementById(`qtyInAdj-${i}`);
      var satuan = document.getElementById(`satuan-${i}`);
      var saldoakhirAdj = document.getElementById(`saldoakhirAdj-${i}`);
      var kategoribarangAdj = document.getElementById(`kategoribarangAdj-${i}`);

      if (
        kodebarang &&
        namabarang &&
        saldo &&
        qtyInAdj &&
        satuan &&
        saldoakhirAdj &&
        kategoribarangAdj
      ) {
        var data = {
          tanggalAdj: tanggalAdjust.value,
          norefAdj: depannomorbonAdjust.value,
          kodebarangAdj: kodebarang.value,
          namabarangAdj: namabarang.value,
          saldoAdj: saldo.value,
          qtyAdj: qtyInAdj.value,
          satuanAdj: satuan.value,
          saldoakhirAdj: saldoakhirAdj.value,
          kategoribarangAdj: kategoribarangAdj.value,
          namaLengkap: namaLengkap,
        };

        formData.push(data);
      }
    }

    // Menggunakan objek JSON formData dengan data yang diambil
    //console.log(formData);
    //console.log(namaLengkap);

    // Mengirimkan data ke server Flask
    Swal.fire({
      title: 'Konfirmasi Adjustment',
      text: 'Apakah Anda yakin ingin menyimpan data adjustment ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Simpan!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch("/adjustment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
          .then(function (response) {
            if (response.ok) {
              return response.json();
            }
            throw new Error("Error in network response.");
          })
          .then(function (data) {
            if (data.query) {
              console.log("Query:", data.query.query);
              console.log("Values:", data.query.values);
            }

            console.log(data); // Menampilkan respon dari server Flask

            // Lakukan tindakan lain setelah data berhasil dikirim
            $("#formModalAdjust").modal("hide");

            refreshData();

            Swal.fire({
              title: 'Berhasil!',
              text: 'Data adjustment berhasil disimpan.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });

            // Mengosongkan nilai input utama setelah sukses
            document.getElementById("form-adjust-data").reset();
            // Counter reset or item removal if needed
            var container = document.getElementById("containerfluid");
            container.innerHTML = '';
            counter = 1;
          })
          .catch(function (error) {
            console.error("Error:", error);
            Swal.fire({
              title: 'Kesalahan!',
              text: 'Gagal memproses data adjustment: ' + error.message,
              icon: 'error'
            });
          });
      }
    });
  });

$(document).on("click", "#cetakPdfJ", function () {
  var nomorBon = $("#nomor-bon-text").is(':visible') ? $("#nomor-bon-text").text().trim() : $("#nomor-bon-input").val();
  console.log(nomorBon);
  window.open("/inv_masukbarang/" + nomorBon, "_blank");
});

// Event listener untuk tombol History Audit
$(document).on('click', '.btn-history', function () {
  const noBon = $(this).data('nomor_bon');
  $('#historyModalLabel').html('<i class="fas fa-history mr-2"></i>Riwayat Audit Bon: <b>' + noBon + '</b>');
  $('#history-tbody').empty();
  $('#history-loading').removeClass('d-none');
  $('#historyModal').modal('show');

  $.ajax({
    url: '/api/gethistorymasuk/' + encodeURIComponent(noBon),
    method: 'GET',
    success: function (data) {
      $('#history-loading').addClass('d-none');
      if (data && data.length > 0) {
        data.forEach(item => {
          let actionBadge = '';
          if (item.action === 'Created') actionBadge = '<span class="badge badge-success">Created</span>';
          else if (item.action === 'Edited') actionBadge = '<span class="badge badge-warning">Edited</span>';
          else actionBadge = `<span class="badge badge-info">${item.action}</span>`;

          $('#history-tbody').append(`
              <tr>
                <td class="small">${item.time}</td>
                <td class="text-center">${actionBadge}</td>
                <td class="small"><b>${item.user}</b></td>
                <td class="small" style="white-space: pre-wrap;">${item.details}</td>
              </tr>
            `);
        });
      } else {
        $('#history-tbody').append('<tr><td colspan="4" class="text-center text-muted py-3">Belum ada riwayat perubahan yang tercatat.</td></tr>');
      }
    },
    error: function () {
      $('#history-loading').addClass('d-none');
      $('#history-tbody').append('<tr><td colspan="4" class="text-center text-danger py-3">Gagal memuat data riwayat.</td></tr>');
    }
  });
});

$(document).on("click", ".btn-detail", function () {
  var nomorBon = $(this).data("nomor_bon");
  let parts = nomorBon.split("\n");
  let nomorRef = parts[0];
  console.log("Tombol Detail ditekan untuk nomor bon: " + nomorBon);
  // Lakukan tindakan lain yang Anda inginkan di sini

  // Mengarahkan halaman ke URL /inv_ambil_barang
  window.location.href = "/inv_barangmasuk/" + nomorRef;
});
