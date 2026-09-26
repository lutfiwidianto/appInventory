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

  function exportToExcel() {
    // Mendapatkan data dari tabel atau sumber data Anda
    var table = document.getElementById("example1");
    var rows = table.getElementsByTagName("tr");

    // Membuat array dua dimensi untuk menyimpan data
    var data = [];

    // Mendapatkan judul kolom (header)
    var headerRow = table.getElementsByTagName("thead")[0].getElementsByTagName("tr")[0];
    var headerCols = headerRow.getElementsByTagName("th");
    var headerData = [];
    for (var k = 0; k < headerCols.length; k++) {
      headerData.push(headerCols[k].innerText);
    }
    data.push(headerData);

    // Mendapatkan data baris
    for (var i = 1; i < rows.length; i++) {
      var rowData = [];
      var cols = rows[i].getElementsByTagName("td");
      for (var j = 0; j < cols.length; j++) {
        rowData.push(cols[j].innerText);
      }
      data.push(rowData);
    }

    // Membuat worksheet
    var ws = XLSX.utils.aoa_to_sheet(data);

    // Membuat workbook dan menyimpannya ke file Excel
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "kartu stock.xls");
  }


  // Tambahkan fungsi untuk menangani klik tombol Excel
  $("#btnExcel").click(function () {
    exportToExcel();
  });

  $('#namaBarang').on('input change keyup paste', function () {
    var input = $(this).val();
    if (input.length > 0) {
      $.ajax({
        url: '/autocomplete-namabarang/' + input,
        data: { term: input },
        dataType: 'json',
        success: function (data) {
          console.log(data); // Cetak respons JSON ke konsol
          if (data.results && data.results.length > 0) {
            var results = data.results;
            var dropdownMenu = $('#autocomplete-results');
            dropdownMenu.empty();
            for (var i = 0; i < results.length; i++) {
              var listItem = $('<a>').addClass('dropdown-item').text(results[i]);
              dropdownMenu.append(listItem);
            }
            dropdownMenu.addClass('show');
          } else {
            $('#autocomplete-results').removeClass('show');
          }
        },
        error: function (xhr, status, error) {
          console.log(error); // Cetak pesan error ke konsol
        }
      });
    } else {
      $('#autocomplete-results').removeClass('show');
    }
  });

  $(document).on('mousedown', '#autocomplete-results .dropdown-item', function (e) {
    e.preventDefault(); // Mencegah input kehilangan fokus terlalu cepat
    // Menangani klik pada opsi dropdown
    var selectedItem = $(this).text();
    var parts = selectedItem.split(' | ');
    var kodeBarang = parts[0];
    var namaBarang = parts[1];
    // Mengisi nilai input namaBarang dan kodeBarang dengan nilai yang dipilih
    $('#namaBarang').val(namaBarang);
    $('#kodeBarang').val(kodeBarang);
    // Menyembunyikan menu dropdown setelah memilih opsi
    $('#autocomplete-results').removeClass('show');
  });

  // Inisialisasi DataTable dengan opsi awal kosong
  var table = $('#example1').DataTable({
    // Opsi lain yang mungkin Anda butuhkan
    searching: false, // Menghilangkan fitur pencarian
    ordering: false, // Menghilangkan fitur pengurutan
    lengthChange: false, // Menghilangkan fitur perubahan panjang halaman
    info: false, // Menghilangkan teks "Showing 0 to 0 of 0 entries"
    paging: false, // Menghilangkan tampilan filter halaman (preview dan next)
    //scrollY: '200px', // Menentukan tinggi scroll vertikal
    autoWidth: true
  });
  // Menyembunyikan pesan "No data available in table" setelah tabel diinisialisasi
  $('#example1').on('draw.dt', function () {
    if (table.data().count() === 0) {
      $('.dataTables_empty').hide();
    }
  });

  // Kemudian, jalankan inisialisasi DataTable Anda
  table.draw();

  // Mengatur lebar kolom pada DataTable
  $('#example1').DataTable().columns.adjust().draw();

  const format = 'DD-MM-YYYY';

  $('#tanggalAwalDiv, #tanggalAkhirDiv').datetimepicker({
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
    keepInvalid: false,
    widgetPositioning: {
      horizontal: 'left',
      vertical: 'bottom'
    }
  });

  // Set default dates
  $('#tanggalAwalDiv').datetimepicker('date', moment().startOf('month'));
  $('#tanggalAkhirDiv').datetimepicker('date', moment().endOf('month'));

});

// Menambahkan event listener pada tombol "Filter Data"
var btnSubmit = document.getElementById("btnSubmit");
btnSubmit.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent the default form submission.

  // Hancurkan inisialisasi DataTable yang ada
  $('#example1').DataTable().destroy();

  const format = 'DD-MM-YYYY';
  let tanggalAwalRaw = document.getElementById('tanggalAwal').value;
  let tanggalAkhirRaw = document.getElementById('tanggalAkhir').value;

  let tanggalAwal = moment(tanggalAwalRaw, format).format('YYYY-MM-DD');
  let tanggalAkhir = moment(tanggalAkhirRaw, format).format('YYYY-MM-DD');
  let kodeBarang = document.getElementById('kodeBarang').value;

  // Validasi kodeBarang tidak boleh kosong
  if (kodeBarang.trim() === "") {
    // Get the error alert element by its ID
    const errorAlert = document.getElementById('errorAlert');

    // Set the new message content
    const newMessage = "Kode barang tidak boleh kosong.";

    // Update the inner text of the error alert
    errorAlert.innerText = newMessage;

    // Show the error alert
    errorAlert.classList.remove('d-none');

    // Hide the error alert after 6 seconds
    setTimeout(function () {
      errorAlert.classList.add('d-none');
    }, 6000);

    return;
  }

  // Validasi tanggal akhir harus minimal 1 hari setelah tanggal awal
  let startDate = new Date(tanggalAwal);
  let endDate = new Date(tanggalAkhir);
  endDate.setDate(endDate.getDate() + 1); // Tambah 1 hari ke tanggal akhir

  if (endDate <= startDate) {
    // Get the error alert element by its ID
    const errorAlert = document.getElementById('errorAlert');

    // Set the new message content
    const newMessage = "Rentang tanggal tidak valid. Silakan periksa kembali.";

    // Update the inner text of the error alert
    errorAlert.innerText = newMessage;

    // Show the error alert
    errorAlert.classList.remove('d-none');

    // Hide the error alert after 6 seconds
    setTimeout(function () {
      errorAlert.classList.add('d-none');
    }, 6000);

    return;
  }

  let formData = {
    'kodeBarang': kodeBarang || ' ',
    'tanggalAwal': tanggalAwal || ' ',
    'tanggalAkhir': tanggalAkhir || ' ',
  };

  $.ajax({
    type: 'POST',
    url: '/api/onlinekartustock',
    contentType: 'application/json',
    data: JSON.stringify(formData),
    success: function (response) {
      // Menampilkan data di konsol sebelum dimasukkan ke dalam tabel
      console.log(response.data);

      // Menampilkan query di konsol dengan pemformatan rapi
      console.log(JSON.stringify(response.query, null, 2));

      // Mengganti nilai '0.0' atau '0' dengan string kosong untuk qtyIn dan qtyOut
      response.data.forEach(function (item) {
        item.qtyIn = item.qtyIn === '0.0' || item.qtyIn === '0' ? '' : item.qtyIn;
        item.qtyOut = item.qtyOut === '0.0' || item.qtyOut === '0' ? '' : item.qtyOut;
      });

      // Hancurkan inisialisasi DataTable yang ada
      $('#example1').DataTable().destroy();

      // Mengganti tanggal pada baris pertama dengan tanggalAwal
      // response[0].tanggal = tanggalAwal;  

      // Mengubah tanggalAwal menjadi objek Date
      var tanggalAwalObj = new Date(tanggalAwal);

      // Mengurangi satu hari dari tanggalAwal
      tanggalAwalObj.setDate(tanggalAwalObj.getDate() - 1);

      // Membuat objek Intl.DateTimeFormat untuk memformat tanggalAwalBaru
      var formatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      // Memformat tanggalAwalBaru sesuai dengan format yang diinginkan
      var tanggalAwalFormatted = formatter.format(tanggalAwalObj);

      // Mengganti tanggal pada baris pertama dengan tanggalAwal yang sudah diformat
      response.data[0].tanggal = tanggalAwalFormatted;

      // Tampilkan < tabel dan tfoot>
      // table.style.display = "table";
      $('#example1 tfoot').css('display', 'table-footer-group');

      // Inisialisasi DataTables dan konfigurasi kolom
      $("#example1").DataTable({
        // Opsi lain yang mungkin Anda butuhkan
        data: response.data,
        columns: [
          {
            data: null,
            class: "align-center",
            orderable: false,
            searchable: false,
            render: function (data, type, row, meta) {
              return meta.row + meta.settings._iDisplayStart + 1;
            }
          },
          { data: "tanggal" },
          { data: "noRef" },
          { data: "kodeBarang" },
          { data: "keterangan" },
          {
            data: "qtyIn",
            render: function (data, type, row) {
              // Mengganti nilai 0.0 atau 0 dengan string kosong
              return data === 0.0 || data === 0 ? '' : data;
            },
          },
          {
            data: "qtyOut",
            render: function (data, type, row) {
              // Mengganti nilai 0.0 atau 0 dengan string kosong
              return data === 0.0 || data === 0 ? '' : data;
            },
          },
          {
            data: "saldo",
            render: function (data, type, row) {
              return data;
            },
          },
          { data: "unit" },
          { data: "kategoriBarang" }
        ],
        createdRow: function (row, data, dataIndex) {
          // Menggunakan kode warna CSS untuk menetapkan warna latar belakang ke kolom tertentu
          var qtyInValue = data.qtyIn;
          var qtyOutValue = data.qtyOut;
          var saldoValue = data.saldo;

          // Kolom qtyIn
          if (qtyInValue !== null && qtyInValue !== '' && parseFloat(qtyInValue) !== 0) {
            $(row).find('td:eq(5)').css('background-color', 'lightgreen');
          }

          // Kolom qtyOut
          if (qtyOutValue !== null && qtyOutValue !== '' && parseFloat(qtyOutValue) !== 0) {
            $(row).find('td:eq(6)').css('background-color', 'lightcoral');
          }

          // Kolom saldo
          if (saldoValue !== null && saldoValue !== '' && parseFloat(saldoValue) !== 0) {
            $(row).find('td:eq(7)').css('background-color', 'lightblue');
          }
        },
        searching: false, // Menghilangkan fitur pencarian
        ordering: false, // Menghilangkan fitur pengurutan
        lengthChange: false, // Menghilangkan fitur perubahan panjang halaman
        info: false, // Menghilangkan teks "Showing 0 to 0 of 0 entries"
        paging: false, // Menghilangkan tampilan filter halaman (preview dan next)
        // "footerCallback" function
        "footerCallback": function (row, data, start, end, display) {
          var api = this.api();

          // Menghitung total Qty In
          var totalQtyIn = api
            .column(5, { page: 'current' })
            .data()
            .reduce(function (a, b) {
              var numB = parseFloat(b); // Parse sebagai angka
              return !isNaN(numB) ? a + numB : a; // Hanya tambahkan jika dapat di-parse sebagai angka
            }, 0);

          // Menghitung total Qty Out
          var totalQtyOut = api.column(6, { page: 'current' }).data().reduce(function (a, b) {
            var numB = parseFloat(b); // Parse sebagai angka
            return !isNaN(numB) ? a + numB : a; // Hanya tambahkan jika dapat di-parse sebagai angka
          }, 0);

          // Menghitung total Saldo
          var totalSaldo = totalQtyIn + totalQtyOut

          // Menampilkan total pada footer
          $(api.column(5).footer()).html(totalQtyIn.toFixed(1));
          $(api.column(6).footer()).html(totalQtyOut.toFixed(1));
          $(api.column(7, { page: 'current' }).footer()).html(totalSaldo.toFixed(1));
        },

      });
    },
    error: function (error) {
      console.log(error);
      // Inisialisasi DataTable dengan opsi awal kosong
      var table = $('#example1').DataTable({
        // Opsi lain yang mungkin Anda butuhkan
        searching: false, // Menghilangkan fitur pencarian
        ordering: false, // Menghilangkan fitur pengurutan
        lengthChange: false, // Menghilangkan fitur perubahan panjang halaman
        info: false, // Menghilangkan teks "Showing 0 to 0 of 0 entries"
        paging: false, // Menghilangkan tampilan filter halaman (preview dan next)
        //scrollY: '200px', // Menentukan tinggi scroll vertikal
        autoWidth: true
      });

      // Mengatur lebar kolom pada DataTable
      $('#example1').DataTable().columns.Keluarust().draw();
    }
  });
});



