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

  $('#myTable').DataTable({
    lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]], // set page lengths
    pageLength: 10, // default page length
    pagingType: "full_numbers", // set pagination type
    searching: true, // enable search box
    ordering: true // enable sorting
  });
  // Ketika tombol delete di klik
  $('table').on('click', '.fas.fa-trash-alt', function () {
    // Ambil data dari baris tabel terkait
    var row = $(this).closest('tr');
    var user_id = row.find('a[data-user-id]').data('user-id');
    var nama = row.find('td:eq(1)').text();
    var username = row.find('td:eq(2)').text();

    // Tampilkan pesan konfirmasi di dalam modal
    var message = "Anda akan menghapus data dengan detail berikut:<br>" +
      "<b>User_Id:</b> " + user_id + "<br>" +
      "<b>Nama:</b> " + nama + "<br>" +
      "<b>Username:</b> " + username + "<br><br>" +
      "Apakah Anda yakin?";
    $('#deleteModal .modal-body').html(message);

    // Tampilkan modal
    $('#deleteModal').modal('show');

    // Ketika tombol hapus di klik dalam modal konfirmasi
    $('.btn-confirm-delete').click(function () {
      // Kirim permintaan penghapusan melalui AJAX
      $.ajax({
        url: '/delete_user/' + user_id,
        type: 'POST',
        success: function (data) {
          // Tutup modal
          $('#deleteModal').modal('hide');

          // Tampilkan pesan sukses atau gagal
          if (data.status == 'success') {
            alert("Data berhasil dihapus!");
          } else {
            alert("Gagal menghapus data!");
          }

          // Reload halaman
          location.reload();

          let successMessage = "Data user berhasil dihapus !";
          let modal = document.getElementById("myModal");
          let modalBody = modal.querySelector(".modal-content .alert");
          let alert = modal.querySelector(".alert");

          // ubah pesan pada modal
          modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${successMessage}`;

          // tambah class yang sesuai dengan jenis pesan
          alert.classList.add("alert-danger");
          // atur warna latar belakang sesuai dengan jenis pesan
          // alert.style.backgroundColor = "#d4edda"; // warna hijau yang sama dengan .alert-success di Bootstrap

          showAlert();
        },
        error: function (jqXHR, textStatus, errorThrown) {
          // Tutup modal
          $('#deleteModal').modal('hide');

          // Reload halaman
          location.reload();


        }
      });
    });

    return false; // Mencegah default action dari tombol delete
  });


});



