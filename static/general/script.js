var fullscreenBtn = document.querySelector('[data-widget="fullscreenlayar"]');
fullscreenBtn.addEventListener('click', function () {
  var element = document.querySelector("body");
  var isFullscreen = document.webkitFullscreenElement || document.msFullscreenElement || document.fullscreenElement;

  // tambahkan konfirmasi sebelum memasuki mode fullscreen
  if (isFullscreen) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  } else {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

});

// mengecek apakah mode fullscreen diaktifkan ketika halaman dimuat ulang
document.addEventListener('DOMContentLoaded', function () {
  var isFullscreenEnabled = localStorage.getItem('isFullscreenEnabled') === 'true';
  if (isFullscreenEnabled) {
    var element = document.querySelector("body");
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }
});

// tambahkan event listener pada event fullscreenchange
document.addEventListener('fullscreenchange', function () {
  var isFullscreen = document.webkitFullscreenElement || document.msFullscreenElement || document.fullscreenElement;
  if (!isFullscreen) {
    localStorage.setItem('isFullscreenEnabled', false);
  }
});

document.addEventListener('DOMContentLoaded', function () {

  const theme = localStorage.getItem('theme');
  if (theme === 'dark-mode') {
    checkbox.checked = true;
    document.body.classList.add('dark-mode');

  } else {
    checkbox.checked = false;
    document.body.classList.remove('dark-mode');

  }
});

//dilarang klik kanan
//document.addEventListener('contextmenu', event => event.preventDefault());

const checkbox = document.getElementById('checkbox');
checkbox.addEventListener('change', function () {
  if (this.checked) {
    localStorage.setItem('theme', 'dark-mode');
    document.body.classList.add('dark-mode');
    sendTheme('dark-mode');
  } else {
    localStorage.setItem('theme', 'light-mode');
    document.body.classList.remove('dark-mode');
    sendTheme('light-mode');
  }
});

function sendTheme(theme) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/set-theme');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(`theme=${theme}`);
}

// Fungsi untuk menambahkan waktu diam saat ada modal yang aktif
function pauseTimer() {
  // Cek apakah ada modal yang aktif
  if ($('.modal.show').length) {
    // Jika ada modal yang aktif, hentikan timer
    clearInterval(idleInterval);
    clearInterval(timeInterval);
  } else {
    // Jika tidak ada modal yang aktif, lanjutkan timer
    idleTime++;
    if (idleTime > 179) {
      // Arahkan ke halaman logout
      window.location.href = "/api/logout";
    }
  }
}

// Fungsi yang akan dieksekusi saat halaman sudah siap (ready)
$(document).ready(function () {

  checkLog()

  // Variabel untuk menyimpan waktu diam (idle)
  var idleTime = 0;
  // Variabel untuk menyimpan detik
  var seconds = 300; // 60 detik x 5 menit

  // Fungsi untuk mereset waktu diam dan detik
  function resetIdleTime() {
    idleTime = 0;
    seconds = 300; // Reset ke 5 menit lagi setelah aktivitas terdeteksi
  }

  // Fungsi untuk menambahkan waktu diam
  function incrementIdleTime() {
    idleTime++;
    if (idleTime > 299) {
      // Arahkan ke halaman logout setelah 5 menit idle
      window.location.href = "/api/logout";
    }
  }

  // Fungsi untuk menampilkan waktu hitungan mundur
  function displayTime() {
    // Mengurangi detik setiap 1 detik
    seconds--;

    // Mengubah format menit dan detik
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    if (remainingSeconds < 10) {
      remainingSeconds = "0" + remainingSeconds;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }

    // Menampilkan waktu hitungan mundur pada tag HTML dengan ID "timer"
    document.getElementById("timer").innerHTML = "00:" + minutes + ":" + remainingSeconds;

    // Jika hitungan mundur sampai 0, maka akan redirect ke halaman logout
    if (seconds === 0) {
      window.location.href = "/api/logout";
    }
  }

  // Mengatur interval untuk menambahkan waktu diam setiap 1 detik
  var idleInterval = setInterval(incrementIdleTime, 1000);
  // Mengatur interval untuk menampilkan waktu hitungan mundur
  var timeInterval = setInterval(displayTime, 1000);

  // Mereset waktu diam saat ada aktivitas mouse, keyboard, atau klik
  $(this).on("mousemove click keypress", function () {
    resetIdleTime();
  });

});


// Lakukan logout ketika kode log tidak sama dengan 10 char

const userIcon = document.querySelector('#user-icon');
let username = document.getElementById("username").value;

// Mencetak nilai username ke konsol
// console.log(username);

// Fungsi untuk memeriksa panjang karakter Log
function checkLog() {
  const data = {
    username: username,
    id: 'user-icon'
  };

  fetch('/log-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(data => {
      if ('cek_log' in data) {
        const cekLog = data.cek_log; // Mendapatkan nilai cek_log dari data respons
        // console.log(cekLog); // Menampilkan nilai cek_log di konsol

        // Cek panjang nilai cek_log
        if (cekLog.length !== 20) {
          // Jika panjangnya tidak sama dengan 20, arahkan pengguna ke alamat /api/logout
          window.location.href = '/api/logout';
        }
      } else if ('error' in data) {
        // Terdapat error pada server, tampilkan error message di konsol
        console.error(data.error);
      }
    })
    .catch(error => console.error(error));
}


