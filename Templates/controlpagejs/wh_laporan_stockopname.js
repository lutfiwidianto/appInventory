$(document).ready(function () {
  // Hancurkan DataTable yang sudah ada jika ada
  var table = $("#example1").DataTable();
  if ($.fn.DataTable.isDataTable("#example1")) {
    table.destroy();
  }

  // Hancurkan elemen tbody untuk menghapus baris yang ada
  $('#example1 tbody').empty();

  // Inisialisasi datetimepicker
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

  function getFormattedDate(id) {
    return moment($(id).val(), format).format('YYYY-MM-DD');
  }

  var table = $('#example1').DataTable({
    ajax: {
      url: '/lap_stockopname_range/' + getFormattedDate('#tanggalAwal') + '/' + getFormattedDate('#tanggalAkhir'),
      dataSrc: 'data',
    },
    columns: [
      { data: 'KODE_BARANG' },
      {
        data: "NAMA_BARANG_INDO",
        className: "wrap-content", // Tambahkan class untuk menargetkan kolom ini dengan CSS
        width: "1000px",
      },
      { data: 'SALDO_AWAL' },
      { data: 'QTYIN' },
      { data: 'QTYOUT' },
      { data: 'SALDO_AKHIR' },
      { data: 'SATUAN' },
      { data: 'LOKASI' },
      { data: 'KATEGORI_BARANG' },
      { data: 'JENIS_BARANG' },
      { data: 'CLASS' }
    ],
    paging: true, // Aktifkan paging
    pageLength: 15, // Jumlah item per halaman
    serverSide: true, // Aktifkan pengelolaan paging di sisi server
    processing: true, // Aktifkan indikator pemrosesan saat permintaan AJAX sedang berlangsung
    searching: true, // Aktifkan pencarian
    pagingType: 'full_numbers'
  });

  // Set width for the length menu and its options
  $(".dataTables_length").find('select').addClass('custom-select');
  $(".dataTables_length").find('select').css("width", "50px"); // Sesuaikan lebar sesuai kebutuhan

  // Mendeteksi perubahan tanggal dan memperbarui data tabel
  $('#tanggalAwalDiv, #tanggalAkhirDiv').on('change.datetimepicker', function () {
    table.ajax.url('/lap_stockopname_range/' + getFormattedDate('#tanggalAwal') + '/' + getFormattedDate('#tanggalAkhir')).load();
  });

  // Event handler untuk saat tabel dimuat ulang (saat halaman berubah)
  table.on('draw.dt', function () {
    // Di sini Anda dapat mengakses informasi tentang halaman yang sedang aktif
    var pageInfo = table.page.info();
    console.log('Halaman saat ini:', pageInfo.page);
    console.log('Jumlah halaman total:', pageInfo.pages);
  });

  // Menambahkan click handler untuk tombol "Download Excel"
  $('#downloadExcel').on('click', function () {
    // Mendapatkan nilai tanggal awal dan tanggal akhir dari input
    var tanggalAwal = getFormattedDate('#tanggalAwal');
    var tanggalAkhir = getFormattedDate('#tanggalAkhir');

    // Membuat URL untuk mengunduh Excel
    var downloadUrl = '/download_stockopname_excel/' + tanggalAwal + '/' + tanggalAkhir;

    // Mengarahkan ke URL untuk mengunduh Excel
    window.location.href = downloadUrl;
  });
});