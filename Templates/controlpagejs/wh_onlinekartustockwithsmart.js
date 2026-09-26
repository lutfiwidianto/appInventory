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
    e.preventDefault();
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

  // Mengatur lebar kolom pada DataTable
  $('#example1').DataTable().columns.adjust().draw();

});

// Menambahkan event listener pada tombol "Filter Data"
var btnSubmit = document.getElementById("btnSubmit");
btnSubmit.addEventListener("click", function (event) {
  event.preventDefault(); // Prevent the default form submission.

  // Hancurkan inisialisasi DataTable yang ada
  $('#example1').DataTable().destroy();

  let kodeBarang = document.getElementById('kodeBarang').value;
  let tanggalAwal = document.getElementById('tanggalAwal').value;
  let tanggalAkhir = document.getElementById('tanggalAkhir').value;

  let partsAwal = tanggalAwal.split("-");
  let formattedTanggalAwal = partsAwal[1] + "/" + partsAwal[2] + "/" + partsAwal[0];

  let partsAkhir = tanggalAkhir.split("-");
  let formattedTanggalAkhir = partsAkhir[1] + "/" + partsAkhir[2] + "/" + partsAkhir[0];

  console.log(formattedTanggalAwal);
  console.log(formattedTanggalAkhir);

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
          { data: "qtyInApp" },
          { data: "qtyInApp" },
          { data: "qtyOutApp" },
          { data: "qtyOutApp" },
          { data: "saldoApp" },
          { data: "saldoApp" },
          { data: "unit" },
          { data: "kategoriBarang" }
        ],

        searching: false, // Menghilangkan fitur pencarian
        ordering: false, // Menghilangkan fitur pengurutan
        lengthChange: false, // Menghilangkan fitur perubahan panjang halaman
        info: false, // Menghilangkan teks "Showing 0 to 0 of 0 entries"
        paging: false, // Menghilangkan tampilan filter halaman (preview dan next)
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



