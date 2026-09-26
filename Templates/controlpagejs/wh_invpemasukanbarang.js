$(document).ready(function () {
  var nomorRef; // Variabel untuk menyimpan nomor bon yang akan dihapus
  const levelUser = document.querySelector('#leveluser').value;
  // RBAC: baca permissions dari context processor
  const _permEl = document.getElementById('user-permissions-data');
  const userPermissions = _permEl ? JSON.parse(_permEl.textContent) : [];

  // Sembunyikan tombol deleteBon jika tidak punya izin WH_DELETE_BON
  if (!userPermissions.includes('WH_DELETE_BON') && levelUser !== '1') {
    document.getElementById("deleteBon").style.display = "none";
  }

  // Variabel untuk menyimpan nomor bon asli sebelum diedit
  var originalNoBon = $('#nomor-bon-text').text().trim();

  // Mode Edit Toggle
  $('#editBon').on('click', function () {
    $(this).hide();
    $('#saveBon').show();
    $('.action-column').show();

    // Toggle fields
    $('#nomor-bon-text, #tanggal-text, #catatan-text, .qty-text, .kode-text, .suplier-text, .tgl-masuk-text').hide();
    $('#nomor-bon-input, #tanggal-input, #catatan-input, .qty-input, .kode-input, .suplier-input, .tgl-masuk-input').attr('style', 'display: inline-block !important');
  });

  // Hapus Item Individual
  $(document).on('click', '.btn-delete-item', function () {
    var itemId = $(this).data('id');
    var row = $(this).closest('tr');
    var itemName = row.find('td:eq(2)').text().trim();

    Swal.fire({
      title: 'Hapus Item?',
      text: `Apakah Anda yakin ingin menghapus item '${itemName}'?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          type: 'DELETE',
          url: '/api/deleteitemmasuk/' + itemId,
          success: function (response) {
            row.remove();
            Swal.fire('Terhapus!', 'Item berhasil dihapus.', 'success');
          },
          error: function (err) {
            Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus item.', 'error');
          }
        });
      }
    });
  });

  // Save Changes
  $('#saveBon').on('click', function () {
    var newNoBon = $('#nomor-bon-input').val().trim();
    var newTanggal = $('#tanggal-input').val().trim();
    var newCatatan = $('#catatan-input').val();

    Swal.fire({
      title: 'Simpan Perubahan?',
      text: "Data bon dan seluruh item akan diperbarui.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Simpan!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        // Tampilkan loading
        Swal.fire({
          title: 'Memproses...',
          text: 'Mohon tunggu sebentar',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // 1. Update BON Info
        $.ajax({
          type: 'PUT',
          url: '/api/updatebonmasuk',
          contentType: 'application/json',
          data: JSON.stringify({
            old_no_bon: originalNoBon,
            new_no_bon: newNoBon,
            new_tanggal: newTanggal,
            new_catatan: newCatatan
          }),
          success: function () {
            // 2. Update Quantities and Details
            var itemUpdates = [];
            $('.qty-input').each(function () {
              var row = $(this).closest('tr');
              var id = $(this).data('id');
              var qty = $(this).val();
              var kode = row.find('.kode-input').val();
              var suplier = row.find('.suplier-input').val();
              var tanggal = row.find('.tgl-masuk-input').val();

              if (id && qty) {
                itemUpdates.push($.ajax({
                  type: 'PUT',
                  url: '/api/updateitemmasuk',
                  contentType: 'application/json',
                  data: JSON.stringify({
                    id: id,
                    qty: qty,
                    kode: kode,
                    suplier: suplier,
                    tanggal: tanggal
                  })
                }));
              }
            });

            $.when.apply($, itemUpdates).then(function () {
              Swal.fire({
                title: 'Berhasil!',
                html: `Perubahan pada bon <b>${newNoBon}</b> telah disimpan.`,
                icon: 'success',
                confirmButtonText: 'OK'
              }).then(() => {
                window.location.href = "/inv_barangmasuk/" + newNoBon;
              });
            }).fail(function (xhr, status, error) {
              Swal.fire('Peringatan!', 'Data Bon tersimpan, namun beberapa item mungkin gagal diperbarui.', 'warning');
            });
          },
          error: function (xhr, status, error) {
            Swal.fire('Gagal!', 'Gagal memperbarui data BON.', 'error');
          }
        });
      }
    });
  });

  // Event listener untuk tombol hapus (Full BON)
  $('#deleteBon').on('click', function () {
    nomorRef = $('#nomor-bon-text').text().trim();
    if (nomorRef === "") {
      nomorRef = $('#nomor-bon-input').val();
    }

    Swal.fire({
      title: 'Hapus Seluruh Bon?',
      text: `Seluruh data untuk bon '${nomorRef}' akan dihapus permanen!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus Semua!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          type: 'DELETE',
          url: '/api/deletebonmasuk',
          contentType: 'application/json',
          data: JSON.stringify({ no_bon: nomorRef }),
          success: function (response) {
            if (response.status === "Data berhasil dihapus!") {
              Swal.fire('Terhapus!', 'Nomor bon telah dihapus dari sistem.', 'success').then(() => {
                window.location.href = "/mutasibarangmasuk";
              });
            } else {
              Swal.fire('Gagal!', 'Penghapusan gagal di sisi server.', 'error');
            }
          },
          error: function (error) {
            Swal.fire('Gagal!', 'Terjadi kesalahan sistem saat menghapus bon.', 'error');
          }
        });
      }
    });
  });

  $("#cetakPdfJ").click(function () {
    var nomorBon = $("#nomor-bon-text").is(':visible') ? $("#nomor-bon-text").text().trim() : $("#nomor-bon-input").val();
    console.log(nomorBon);
    window.open("/inv_masukbarang/" + nomorBon, "_blank");
  });
});
