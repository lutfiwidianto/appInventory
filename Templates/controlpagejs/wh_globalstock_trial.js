function loadData() {
  $("#example1").DataTable({
    "ajax": {
      "url": "api/globalstocktrial",
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
      { "data": "kategoriBarang" }
    ],
    "responsive": true,
    "autoWidth": false
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