function updateUserCount() {
	$.get('/api/user-count', function (data) {
		if (data && data.count_userlogin !== undefined) {
			var el = document.getElementById('user-countlogin');
			if (el) {
				var h3 = el.querySelector('h3');
				if (h3) h3.innerHTML = data.count_userlogin;
			}
		}
	});
}

// Update user count setiap 30 detik secara ringan tanpa WebSocket/long-polling
setInterval(updateUserCount, 30000);


function showlistuserOnline() {
	var tableBody = $('#user-table tbody');
	tableBody.empty(); // Bersihkan isi tabel sebelumnya

	// Ambil data dari server dan tambahkan ke tabel
	$.get('/user-list', function (data) {
		data.forEach(function (user) {
			var row = $('<tr>');
			row.append($('<td>').text(user.nama));
			row.append($('<td>').text(user.username));
			row.append($('<td>').html(user.status));
			row.append($('<td>').html('<a href="#" class="btn btn-success btn-sm reset-login" data-userid="' + user.userid + '"><i class="fas fa-sync"></i> Reset Login</a>'));
			tableBody.append(row);
		});
	});
}
// Jalankan ketika modal di-show
$('#user-list-modal').on('show.bs.modal', function (event) {
	var tableBody = $('#user-table tbody');
	tableBody.empty(); // Bersihkan isi tabel sebelumnya

	showlistuserOnline()
});

// Jalankan ketika tombol reset-login di-klik di dalam modal
$('#user-table').on('click', '.reset-login', function () {
	const levelUser = document.querySelector('#leveluser').value;
	// RBAC: baca permissions dari context processor
	const _permEl = document.getElementById('user-permissions-data');
	const userPermissions = _permEl ? JSON.parse(_permEl.textContent) : [];
	var userId = $(this).data('userid');

	if (userPermissions.includes('USER_CRUD') || levelUser == '1') {

		// Tampilkan modal "Denied Delete" 
		document.getElementById("deniedModalLabel").innerHTML = "Reset Login";
		$('#deniedModal .modal-body').html('Jika anda melanjutkan ini, pengguna akan otomatis terlogout dari aplikasi !');

		$('#user-list-modal').modal('hide');
		$('#deniedModal').modal('show');

		// Menambahkan event listener ke tombol "Iya"
		document.getElementById('confirmBtn').addEventListener('click', function () {
			// Tindakan yang ingin dilakukan ketika tombol "Iya" ditekan
			console.log('Anda memilih "Iya"');
			// Jalankan aksi jika memilih "Iya"
			$.post('/reset-login', { 'user_id': userId }, function (response) {
				console.log(response);
				$('#user-list-modal').modal('show');
			});
		});

	} else {
		// console.log("User Anda Tidak Diizinkan Mereset User")

		let successMessage = "Reset Gagal !! User anda tidak diizinkan untuk mereset user !";
		let modal = document.getElementById("myModal");
		let modalBody = modal.querySelector(".modal-content .alert");
		let alert = modal.querySelector(".alert");

		// ubah pesan pada modal
		modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${successMessage}`;

		// tambah class yang sesuai dengan jenis pesan
		alert.classList.add("alert-danger");

		showAlert();
	}
});

function showAlert() {
	$('#myModal').modal({
		backdrop: false,
		keyboard: true
	});
	setTimeout(function () {
		$('#myModal').modal('hide');
	}, 5000);

}

function goToPermintaanIT() {
	window.location.href = window.location.origin + "/permintaanit";
}

function goToPeminjamanbarang() {
	window.location.href = window.location.origin + "/peminjamanbarang";
}