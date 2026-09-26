function loadData() {
  $("#example1").DataTable({
    "dom": "<'row'<'col-sm'l><'col-sm-auto ml-auto'B><'col-sm'f>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
    "ajax": {
      "url": "api/globalstock",
      "dataSrc": "",
      "error": function (xhr, error, thrown) {
        console.log(xhr);
        console.log(error);
        console.log(thrown);
      }
    },
    "columns": [
      { "data": "kodeBarang" },
      {
        "data": "namaBarang",
        "render": function (data) {
          return "<div style='white-space: nowrap;'>" + data + "</div>";
        }
      },
      { "data": "tanggalSaldoAwal" },
      { "data": "saldoAwal" },
      { "data": "qtyIn" },
      { "data": "qtyOut" },
      { "data": "saldoAkhir" },
      { "data": "satuan" },
      { "data": "racking" },
      { "data": "kategoriBarang" }
    ],
    "responsive": true,
    "autoWidth": false,
    /*
    "dom": "<'row'<'col-sm'l><'col-sm'B><'col-sm'f>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
    */
    "buttons": [
      {
        extend: 'colvis',
        text: 'Change Columns',
        //columns: ':gt(2)' // Menghilangkan kolom (TGL SALDO AWAL) dari pilihan
      },
      {
        extend: 'excel',
        text: '<i class="fas fa-file-excel"></i>&nbsp Excel',
        title: 'Data Global Stock',
        exportOptions: {
          columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], // export only these columns
          customize: function (doc) {
            doc.pageOrientation = 'landscape';
          }
        }
      }
    ]
  });
}

$(document).ready(function () {
  loadData()
  /*
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
    */


});