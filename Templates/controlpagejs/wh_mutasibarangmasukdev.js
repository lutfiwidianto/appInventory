$(function () {
  var format = 'DD/MM/YYYY';

  // Tanggal pengajuan tambah
  $('#tanggaldatangbarangTambahDiv').datetimepicker({
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
    keepInvalid: true
  });

  $('#tanggaldatangbarangTambahDiv').on('change.datetimepicker', function (e) {
    var date = moment(e.date).format(format);
    $('input[name="tanggaldatangbarangTambah"]').val(date);
  });

  $('#tanggaldatangbarangTambahDiv .input-group-append').on('click', function () {
    $('#tanggaldatangbarangTambahDiv').datetimepicker('date', moment());
  });

  // Tanggal
  $('#tanggalmasukbarangTambahDiv').datetimepicker({
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

  $('#tanggalmasukbarangTambahDiv').on('change.datetimepicker', function (e) {
    var date = moment(e.date).format(format);
    $('input[name="tanggalmasukbarangTambah"]').val(date);
  });



  // Tanggal Adjust

  $('#tanggalmasukbarangAdjustDiv').datetimepicker({
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
    keepInvalid: true // Added option to keep invalid input

  });

  // When the DateTimePicker is closed, set the date and time value
  $('#tanggalmasukbarangAdjustDiv').on('change.datetimepicker', function (e) {
    var date = moment(e.date).format(format);
    $('input[name="tanggalpengajuanTambah"]').val(date);
  });

  // Disable input field on calendar icon click
  $('#tanggalmasukbarangAdjustDiv .input-group-append').on('click', function () {
    $('#tanggalmasukbarangAdjustDiv').datetimepicker('date', moment()); // Set to today's date
    $('input[name="tanggalmasukbarangAdjust"]').prop('readonly', true); // Disable input field
  });

});

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
      "url": "api/datamutasibarangmasukdev",
      "dataSrc": "",
      "error": function (xhr, error, thrown) {
        console.log(xhr);
        console.log(error);
        console.log(thrown);
      }
    },
    "columns": [
      { "data": "id", visible: true },
      { "data": "tanggalMasuk" },
      { "data": "kodeBarang" },
      { "data": "namaBarang" },
      { "data": "nomorBon" },
      { "data": "qtyIn" },
      { "data": "satuan" },
      { "data": "suplier" },
      { "data": "kategoriBarang" },
      {
        "data": null,
        "render": function (data, type, row) {
          return '<td text-align: center;">' +
            '<button type="button" class="btn btn-warning btn-edit" data-toggle="modal" data-id="' + row.id + '"><i class="fas fa-edit fa-xs"></i></button>' +
            '<button type="button" class="btn btn-danger btn-delete" data-toggle="modal" data-id="' +
            row.id + '" data-nomor_asset="' + row.kodeBarang + '" data-login_nama="' + row.namaBarang + '"><i class="fas fa-trash-alt fa-xs"></i></button>' +
            '</td>';
        }
      }
    ],
    "order": [
      [0, "desc"]
    ],
    "responsive": true,
    "autoWidth": false
  });
}

$('#formModal').on('shown.bs.modal', function () {

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


  /* MUNCULKAN ROW KOLOM SATU BARIS SAAT MODAL TAMPIL */

  var itemContainer = document.getElementById("itemContainer2");

  // Membuat elemen baru untuk item
  var itemRow = document.createElement("div");
  itemRow.classList.add("row", "item-row");

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
  kolom5.classList.add("col");
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

  // Menambahkan kolom ke dalam row item
  itemRow.appendChild(kolom1);
  itemRow.appendChild(kolom2);
  itemRow.appendChild(kolom3);
  itemRow.appendChild(kolom4);
  itemRow.appendChild(kolom5);
  itemRow.appendChild(kolom6);
  itemRow.appendChild(kolom7);

  // Menambahkan row item ke dalam container
  itemContainer.appendChild(itemRow);


  // Melakukan logika autofill berdasarkan ID unik dari baris
  function autofillLogic(event) {
    var targetInput = event.target;
    var row = targetInput.closest('.item-row'); // Mendapatkan elemen baris terdekat

    // Mendapatkan elemen-elemen terkait dalam baris saat ini
    var kodeBarangInput = row.querySelector('.kodeBarang');
    var namaBarangInput = row.querySelector('.namaBarang');
    var saldoInput = row.querySelector('.saldo');
    var satuanInput = row.querySelector('.satuan');
    var kategoriInput = row.querySelector('.kategoriBarang');

    // Mengirim permintaan ke server untuk mendapatkan data autofill
    if (kodeBarangInput.value !== '') {
      fetch('/autofillbarangmasuk/' + kodeBarangInput.value)
        .then(response => response.json())
        .then(data => {
          if (data.results.length > 0) {
            // Mengisi nilai input dengan hasil dari server
            namaBarangInput.value = data.results[0].NamaBarangIndo;
            saldoInput.value = data.results[0].Saldo_Akhir;
            satuanInput.value = data.results[0].SatuanIndo;
            kategoriInput.value = data.results[0].KategoriBarang;

            // Mencetak hasil data.results ke konsol
            console.log(data.results);
          } else {
            namaBarangInput.value = '';
            saldoInput.value = '';
            satuanInput.value = '';
            kategoriInput.value = '';
          }
        })
        .catch(error => {
          console.error('Error:', error);
          // Menangani kesalahan jika terjadi
        });
    } else {
      namaBarangInput.value = '';
      saldoInput.value = '';
      satuanInput.value = '';
      kategoriInput.value = '';
    }
  }

  // Menghubungkan fungsi autofillLogic dengan kolom pertama
  var kodeBarangInput = itemRow.querySelector('.kodeBarang');
  kodeBarangInput.addEventListener("input", autofillLogic);
  kodeBarangInput.addEventListener("change", autofillLogic);
});




$(document).ready(function () {
  loadData();
  //$('#nomorBon').inputmask();
  $('#btnRefresh').on('click', function () {
    clearData();
    loadData();

  });

});



// Mendapatkan data saat tombol "Submit" ditekan
document.getElementById("form-tambah-data").addEventListener("submit", function (event) {
  event.preventDefault();

  // Membuat array untuk menampung data
  var dataArray = [];

  // Mengambil nilai dari input utama
  var tanggalDatangBarang = document.getElementById("tanggaldatangbarangTambah").value;
  var kodeBarang = document.querySelector(".kodeBarang").value;
  var depannomorBon = document.getElementById("depannomorBon").value;
  var nomorBon = document.getElementById("nomorBon").value;
  var tanggalMasukBarang = document.getElementById("tanggalmasukbarangTambah").value;
  var qtyIn = document.querySelector(".qtyIn").value;
  var namaSuplier = document.querySelector(".namaSuplier").value;

  // Membuat objek data utama
  var dataUtama = {
    "tanggaldatangbarangTambah": tanggalDatangBarang,
    "kodeBarang": kodeBarang,
    "nomorBon": depannomorBon + nomorBon,
    "tanggalmasukbarangTambah": tanggalMasukBarang,
    "qtyIn": parseInt(qtyIn),
    "namaSuplier": namaSuplier
  };

  // Menambahkan objek data utama ke dalam array
  // dataArray.push(dataUtama); 

  // Mengambil elemen-elemen item tambahan
  var itemRows = document.querySelectorAll(".item-row");
  itemRows.forEach(function (row) {
    var kodeBarang = row.querySelector(".kodeBarang").value;
    var qtyIn = row.querySelector(".qtyIn").value;
    var namaSuplier = row.querySelector(".namaSuplier").value;

    // Membuat objek data tambahan
    var dataItem = {
      "tanggaldatangbarangTambah": tanggalDatangBarang,
      "kodeBarang": kodeBarang,
      "nomorBon": depannomorBon + nomorBon,
      "tanggalmasukbarangTambah": tanggalMasukBarang,
      "qtyIn": parseInt(qtyIn),
      "namaSuplier": namaSuplier
    };

    // Menambahkan objek data tambahan ke dalam array
    dataArray.push(dataItem);
  });

  // Menampilkan hasil array JSON di konsol
  console.log(JSON.stringify(dataArray));
  //debugger;
  // Mengirim data ke server menggunakan metode POST
  fetch("/mutasibarangmasuk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(dataArray)
  })
    .then(response => response.json())
    .then(data => {
      // Menangani respons dari server
      console.log(data);

      // Lakukan tindakan lain setelah data berhasil dikirim
      $('#formModal').modal('hide');

      refreshData()

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
      // Mengosongkan nilai input utama
      document.getElementById("tanggaldatangbarangTambah").value = "";
      document.getElementById("tanggalmasukbarangTambah").value = "";
      document.getElementById("nomorBon").value = "";
      document.querySelector(".kodeBarang").value = "";
      document.querySelector(".qtyIn").value = "";
      document.querySelector(".namaSuplier").value = "";

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


    })
    .catch(error => {
      console.error('Error:', error);
      // Menangani kesalahan jika terjadi
    });
});


document.getElementById("tambahItemBtn").addEventListener("click", function () {
  var itemContainer = document.getElementById("itemContainer2");

  // Membuat elemen baru untuk item
  var itemRow = document.createElement("div");
  itemRow.classList.add("row", "item-row");

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
  kolom5.classList.add("col");
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

  // Menambahkan kolom ke dalam row item
  itemRow.appendChild(kolom1);
  itemRow.appendChild(kolom2);
  itemRow.appendChild(kolom3);
  itemRow.appendChild(kolom4);
  itemRow.appendChild(kolom5);
  itemRow.appendChild(kolom6);
  itemRow.appendChild(kolom7);

  // Menambahkan row item ke dalam container
  itemContainer.appendChild(itemRow);

  // Melakukan logika autofill berdasarkan ID unik dari baris
  function autofillLogic(event) {
    var targetInput = event.target;
    var row = targetInput.closest('.item-row'); // Mendapatkan elemen baris terdekat

    // Mendapatkan elemen-elemen terkait dalam baris saat ini
    var kodeBarangInput = row.querySelector('.kodeBarang');
    var namaBarangInput = row.querySelector('.namaBarang');
    var saldoInput = row.querySelector('.saldo');
    var satuanInput = row.querySelector('.satuan');
    var kategoriInput = row.querySelector('.kategoriBarang');

    // Mengirim permintaan ke server untuk mendapatkan data autofill
    if (kodeBarangInput.value !== '') {
      fetch('/autofillbarangmasuk/' + kodeBarangInput.value)
        .then(response => response.json())
        .then(data => {
          if (data.results.length > 0) {
            // Mengisi nilai input dengan hasil dari server
            namaBarangInput.value = data.results[0].NamaBarangIndo;
            saldoInput.value = data.results[0].Saldo_Akhir;
            satuanInput.value = data.results[0].SatuanIndo;
            kategoriInput.value = data.results[0].KategoriBarang;

            // Mencetak hasil data.results ke konsol
            console.log(data.results);
          } else {
            namaBarangInput.value = '';
            saldoInput.value = '';
            satuanInput.value = '';
            kategoriInput.value = '';
          }
        })
        .catch(error => {
          console.error('Error:', error);
          // Menangani kesalahan jika terjadi
        });
    } else {
      namaBarangInput.value = '';
      saldoInput.value = '';
      satuanInput.value = '';
      kategoriInput.value = '';
    }
  }

  // Menghubungkan fungsi autofillLogic dengan kolom pertama
  var kodeBarangInput = itemRow.querySelector('.kodeBarang');
  kodeBarangInput.addEventListener("input", autofillLogic);
  kodeBarangInput.addEventListener("change", autofillLogic);

});




document.getElementById("hapusItemBtn").addEventListener("click", function (event) {
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


$('#formModalAdjust').on('shown.bs.modal', function () {

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
      document.getElementById("depannomorbonAdjust").value = nomorRef + formattedNumber;
    },
    error: function (error) {
      console.log(error);
    }
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

  qtyAdjInput.addEventListener("input", (function (counter) {
    return function (event) {
      var qtyAdjValue = parseFloat(event.target.value); // Ambil nilai qtyAdj yang diinput

      // Dapatkan elemen input saldoAdj dan saldoakhirAdj
      var saldoInput = document.querySelector(`#itemContainer${counter} .saldoAdj`);
      var saldoAkhirInput = document.querySelector(`#itemContainer${counter} .saldoakhirAdj`);

      if (saldoInput && saldoAkhirInput) {
        // Jika elemen input ditemukan, lakukan perhitungan dan atur nilai saldoakhirAdj
        var saldoValue = parseFloat(saldoInput.value);
        var saldoAkhirValue = qtyAdjValue + saldoValue;
        saldoAkhirInput.value = Math.round(saldoAkhirValue); // Menampilkan nilai dengan 2 desimal
      }
    };
  })(counter));

  kodeBarangInput.addEventListener("input", (function (counter) {
    return function (event) {
      autofillLogic(event, counter);
    };
  })(counter));



  counter++; // Tingkatkan counter setelah item ditambahkan
}

// Fungsi untuk logika autofill
// Fungsi untuk logika autofill
function autofillLogic(event, counter) {
  var kodeBarang = event.target.value; // Ambil nilai kode barang yang diinput

  // Lakukan request ke API dengan menggunakan kodeBarang
  fetch(`http://192.17.17.17/autofillbarangmasuk/${kodeBarang}`)
    .then(response => response.json())
    .then(data => {
      // Periksa apakah data berhasil ditemukan
      if (data.results.length > 0) {
        var barang = data.results[0]; // Ambil data barang pertama

        // Dapatkan elemen input nama barang yang sesuai dengan counter container
        var namaBarangInput = document.querySelector(`#itemContainer${counter} .namabarangAdj`);

        if (namaBarangInput) {
          // Jika elemen input nama barang ditemukan, atur nilai value dan name
          namaBarangInput.value = barang.NamaBarangIndo;
          namaBarangInput.name = `namabarangAdj-${counter}`;
        } else {
          console.error("Elemen input nama barang tidak ditemukan");
        }

        // Tambahan: Isi elemen input lainnya berdasarkan data API yang diperoleh
        var saldoInput = document.querySelector(`#itemContainer${counter} .saldoAdj`);
        var satuanInput = document.querySelector(`#itemContainer${counter} .satuan`);
        var saldoAkhirInput = document.querySelector(`#itemContainer${counter} .saldoakhirAdj`);
        var kategoriInput = document.querySelector(`#itemContainer${counter} .kategoribarangAdj`);

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
    .catch(error => {
      console.error("Terjadi kesalahan pada saat mengambil data dari API", error);
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



document.getElementById("form-adjust-data").addEventListener("submit", function (event) {
  event.preventDefault();

  var formData = []; // Array untuk menyimpan data dari setiap kolom input

  // Loop melalui setiap counter
  var tanggalmasukbarangAdjust = document.getElementById(`tanggalmasukbarangAdjust`);
  var depannomorbonAdjust = document.getElementById(`depannomorbonAdjust`);

  // Validasi tanggalmasukbarangAdjust tidak null / kosong
  if (!tanggalmasukbarangAdjust.value) {
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

    // Validasi kodebarang tidak null / kosong
    if (!kodebarang.value) {
      alert(`Kode Barang tidak boleh kosong.`);
      return;
    }

    // Validasi qtyInAdj tidak null / kosong
    if (!qtyInAdj.value) {
      alert(`Qty Adjusment tidak boleh kosong.`);
      return;
    }

    if (kodebarang && namabarang && saldo && qtyInAdj && satuan && saldoakhirAdj && kategoribarangAdj) {
      var data = {
        tanggalAdj: tanggalmasukbarangAdjust.value,
        norefAdj: depannomorbonAdjust.value,
        kodebarangAdj: kodebarang.value,
        namabarangAdj: namabarang.value,
        saldoAdj: saldo.value,
        qtyinAdj: qtyInAdj.value,
        satuanAdj: satuan.value,
        saldoakhirAdj: saldoakhirAdj.value,
        kategoribarangAdj: kategoribarangAdj.value
      };

      formData.push(data);
    }
  }

  // Menggunakan objek JSON formData dengan data yang diambil
  console.log(formData);

  // Mengirimkan data ke server Flask
  fetch('/adjustment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Error in network response.');
    })
    .then(function (data) {
      console.log(data); // Menampilkan respon dari server Flask

      // Lakukan tindakan lain setelah data berhasil dikirim
      $('#formModalAdjust').modal('hide');

      refreshData()

      let successMessage = "Adjustment data berhasil dilakukan!";
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
      // Mengosongkan nilai input utama
      depannomorbonAdjust.value = "";
      kodebarang.value = "";
      namabarang.value = "";
      saldo.value = "";
      qtyInAdj.value = "";
      satuan.value = "";
      saldoakhirAdj.value = "";
      kategoribarangAdj.value = "";

    })
    .catch(function (error) {
      console.log(error); // Menampilkan pesan error jika terjadi kesalahan
    });
});



