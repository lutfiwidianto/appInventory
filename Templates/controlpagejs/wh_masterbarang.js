// RBAC: baca permissions dari context processor
const _permEl = document.getElementById('user-permissions-data');
const userPermissions = _permEl ? JSON.parse(_permEl.textContent) : [];
const _lvUser = document.querySelector('#leveluser') ? document.querySelector('#leveluser').value : '0';
// Tier edit master barang
const canEditMasterFull    = userPermissions.includes('WH_MASTER_EDIT_FULL')    || _lvUser === '1' || _lvUser === '11';
const canEditMasterPartial = userPermissions.includes('WH_MASTER_EDIT_PARTIAL') || _lvUser === '12';
const canEditMasterAny     = canEditMasterFull || canEditMasterPartial;

function performRackingSearch() {
  var searchValueRacking = document.getElementById("searchInputRacking").value;
  console.log("Melakukan pencarian racking: " + searchValueRacking);

  // Hancurkan DataTable yang sudah ada jika ada
  var table = $("#example1").DataTable();
  if ($.fn.DataTable.isDataTable("#example1")) {
    table.destroy();
  }

  // Hancurkan elemen tbody untuk menghapus baris yang ada
  $("#example1 tbody").empty();

  $.ajax({
    url: "/api/datamasterbarangracking",
    type: "GET",
    data: { racking: searchValueRacking },
    success: function (data) {
      // Tampilkan hasil respons JSON ke konsol
      console.log("Hasil pencarian racking:");
      console.log(data);

      // Inisialisasi DataTable dengan data baru
      $("#example1").DataTable({
        data: data,
        columns: [
          {
            data: null,
            class: "align-center",
            orderable: false,
            searchable: false,
            render: function (data, type, row, meta) {
              return meta.row + meta.settings._iDisplayStart + 1;
            },
          },
          { data: "id", visible: false },
          { data: "kodeBarang" },
          { data: "namabarangIdn" },
          { data: "namabarangMand" },
          { data: "satuan" },
          { data: "rak" },
          { data: "kategoriBarang" },
          { data: "jenisBarang" },
          { data: "Class" },
          {
            data: null,
            render: function (data, type, row) {
              return (
                '<td text-align: center;">' +
                '<button type="button" class="btn btn-warning btn-edit" data-toggle="modal" data-id="' +
                row.id +
                '"><i class="fas fa-edit fa-xs"></i> Edit</button>'
              );
            },
          },
        ],
        scrollX: true,
        order: [[1, "desc"]],
        // ... pengaturan lainnya ...
      });
    },
    error: function (xhr, error, thrown) {
      console.log(xhr);
      console.log(error);
      console.log(thrown);
    },
  });

  // Setelah selesai, Anda bisa mereset nilai input teks pencarian racking jika diperlukan.
  // document.getElementById("searchInputRacking").value = "";
}

// Tambahkan event listener untuk tombol pencarian racking
document.getElementById("searchButtonRacking").addEventListener("click", performRackingSearch);

function refreshData() {
  clearData();
  loadData();
}

function showAlert() {
  $("#myModal").modal({
    backdrop: false,
    keyboard: true,
  });
  setTimeout(function () {
    $("#myModal").modal("hide");
  }, 5000);
}

function clearData() {
  //$('#example1').DataTable().clear().draw();
  $("#example1").DataTable().clear().destroy();
}

function loadData() {
  // Hancurkan DataTable yang sudah ada jika ada
  if ($.fn.DataTable.isDataTable("#example1")) {
    $("#example1").DataTable().destroy();
  }

  $("#example1").DataTable({
    ajax: {
      url: "/api/datamasterbarang",
      dataSrc: "",
      error: function (xhr, error, thrown) {
        console.log(xhr);
        console.log(error);
        console.log(thrown);
      },
    },
    columns: [
      {
        data: null,
        class: "align-center",
        orderable: false,
        searchable: false,
        render: function (data, type, row, meta) {
          return meta.row + meta.settings._iDisplayStart + 1;
        },
      },
      { data: "id", visible: false },
      { data: "kodeBarang" },
      { data: "namabarangIdn" },
      { data: "namabarangMand" },
      { data: "satuan" },
      { data: "rak" },
      { data: "kategoriBarang" },
      { data: "jenisBarang" }, // Perhatikan penggunaan "JenisBarang" sesuai dengan respons JSON
      { data: "Class" },
      {
        data: null,
        render: function (data, type, row) {
          return (
            '<td text-align: center;">' +
            '<button type="button" class="btn btn-warning btn-edit" data-toggle="modal" data-id="' +
            row.id +
            '"><i class="fas fa-edit fa-xs"></i> Edit</button>'
          );
          //'<button type="button" class="btn btn-danger btn-delete" data-toggle="modal" data-id="' +
          //row.id + '"><i class="fas fa-trash-alt fa-xs"></i></button>' +
          //'</td>';
        },
      },
    ],
    scrollX: true,
    order: [[1, "desc"]],

    lengthMenu: [
      [5, 10, 25, 50, -1],
      [5, 10, 25, 50, "All"],
    ],
    pageLength: 10,

    // "dom": 'Bfrtip',
    dom:
      "<'row'<'col-sm'l><'col-sm-auto ml-auto'B><'col-sm'f>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",

    buttons: [
      {
        extend: "excel",
        text: '<i class="fas fa-file-excel"></i>&nbsp Excel',
        title: "MASTER BARANG APP INVENTORY",
        exportOptions: {
          columns: [1, 2, 3, 4, 5, 6, 7, 8, 9], // export only these columns
          customize: function (doc) {
            doc.pageOrientation = "landscape";
          },
        },
      },
    ],
  });
}

document.getElementById("form-tambah-data").addEventListener("submit", function (event) {
  event.preventDefault(); // Menghentikan pengiriman form bawaan

  // Reset semua pesan error dan styling sebelumnya
  document
    .querySelectorAll(
      ".inv-kodeBarangTambah1, .inv-kodeBarangTambah2, .inv-namaBarangIndoTambah1, .inv-satuanIndoTambah1, .inv-kategoriBarangTambah1"
    )
    .forEach((el) => {
      el.style.display = "none";
    });

  document.querySelectorAll("#kodeBarang, #namaBarangIndo, #satuanIndo, #kategoriBarang").forEach((input) => {
    input.style.outline = "";
  });

  const namaLengkap = document.getElementById("namalengkap").value.trim();
  let levelUser = $("#leveluser").val();

  // Mengambil nilai input dari form
  let kodeBarang = document.getElementById("kodeBarang").value;
  let namaBarangIndo = document.getElementById("namaBarangIndo").value;
  let namaBarangMand = document.getElementById("namaBarangMand").value;
  let satuanIndo = document.getElementById("satuanIndo").value;
  let satuanMand = document.getElementById("satuanMand").value;
  let racking = document.getElementById("racking").value;
  let kategoriBarang = document.getElementById("kategoriBarang").value;
  let jenisBarang = document.getElementById("jenisBarang").value;
  let classBarang = document.getElementById("klasifikasi").value;

  // ============================================
  // PERBAIKAN: MEMBERSIHKAN SPASI DI KODE BARANG
  // ============================================

  // 1. Hilangkan spasi di awal, akhir, dan ganti spasi ganda di tengah
  kodeBarang = kodeBarang
    .trim() // Hilangkan spasi di awal dan akhir
    .replace(/\s+/g, " ") // Ganti multiple spasi dengan satu spasi
    .replace(/^\s+|\s+$/g, ""); // Pastikan tidak ada spasi di awal/akhir lagi

  // 2. Opsional: Hilangkan SEMUA spasi (jika kode barang tidak boleh ada spasi sama sekali)
  // kodeBarang = kodeBarang.replace(/\s+/g, '');

  // 3. Update nilai di input form (agar user melihat perubahan)
  document.getElementById("kodeBarang").value = kodeBarang;

  // 4. Juga bersihkan field lainnya yang mungkin perlu
  namaBarangIndo = namaBarangIndo.trim();
  namaBarangMand = namaBarangMand.trim();
  satuanIndo = satuanIndo.trim();
  satuanMand = satuanMand.trim();
  racking = racking.trim();
  kategoriBarang = kategoriBarang.trim();
  jenisBarang = jenisBarang.trim();
  classBarang = classBarang.trim();

  // Mendapatkan tanggal saat ini
  let createdDate = new Date();

  // Validasi kodeBarang harus diisi (setelah dibersihkan)
  if (kodeBarang === "") {
    let invKodeBarang1 = document.querySelector(".inv-kodeBarangTambah1");
    invKodeBarang1.style.display = "block";

    // Fokus ke form kode barang
    let kodeBarangInput = document.getElementById("kodeBarang");
    kodeBarangInput.style.outline = "1px solid red";
    kodeBarangInput.focus();
    return; // Menghentikan eksekusi jika kodeBarang kosong
  }

  // Validasi nama barang harus diisi
  if (namaBarangIndo === "") {
    let invnamaBarangIndo1 = document.querySelector(".inv-namaBarangIndoTambah1");
    invnamaBarangIndo1.style.display = "block";

    // Fokus ke form nama barang
    let namaBarangIndoInput = document.getElementById("namaBarangIndo");
    namaBarangIndoInput.style.outline = "1px solid red";
    namaBarangIndoInput.focus();
    return; // Menghentikan eksekusi jika nama barang kosong
  }

  // Validasi satuan harus diisi
  if (satuanIndo === "") {
    let invsatuanIndo1 = document.querySelector(".inv-satuanIndoTambah1");
    invsatuanIndo1.style.display = "block";

    // Fokus ke form satuan
    let satuanIndoInput = document.getElementById("satuanIndo");
    satuanIndoInput.style.outline = "1px solid red";
    satuanIndoInput.focus();
    return; // Menghentikan eksekusi jika satuan kosong
  }

  // Validasi kategoriBarang harus diisi
  if (kategoriBarang === "") {
    let invkategoriBarang1 = document.querySelector(".inv-kategoriBarangTambah1");
    invkategoriBarang1.style.display = "block";

    // Fokus ke form kode barang
    let kategoriBarangInput = document.getElementById("kategoriBarang");
    kategoriBarangInput.style.outline = "1px solid red";
    kategoriBarangInput.focus();
    return; // Menghentikan eksekusi jika kategoriBarang kosong
  }

  // Membuat objek data yang akan dikirim ke server
  let data = {
    kodeBarang: kodeBarang,
    namaBarangIndo: namaBarangIndo,
    namaBarangMand: namaBarangMand,
    satuanIndo: satuanIndo,
    satuanMand: satuanMand,
    racking: racking,
    kategoriBarang: kategoriBarang,
    jenisBarang: jenisBarang,
    TanggalCreated: createdDate,
    userInput: namaLengkap,
    classBarang: classBarang,
  };

  if (canEditMasterAny) {
    // Mengirim permintaan POST ke server
    fetch("/api/datamasterbarang", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async function (response) {
        const responseData = await response.json();

        // Cek apakah response error (400, 500, dll)
        if (!response.ok) {
          // Throw error agar masuk ke .catch()
          throw new Error(responseData.message || "Terjadi kesalahan pada server");
        }

        return responseData;
      })
      .then(function (responseData) {
        console.log("Sukses:", responseData); // Menampilkan respons dari server

        // Lakukan tindakan setelah data berhasil dikirim
        $("#formModal").modal("hide");
        refreshData();

        let successMessage = "Barang berhasil ditambahkan!";
        let modal = document.getElementById("myModal");
        let modalBody = modal.querySelector(".modal-content .alert");
        let alert = modal.querySelector(".alert");

        // ubah pesan pada modal
        modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${successMessage}`;

        // tambah class yang sesuai dengan jenis pesan
        alert.classList.add("alert-success");
        alert.classList.remove("alert-danger");

        // Tampilkan alert
        showAlert();

        // Mengosongkan nilai input setelah pengiriman berhasil
        document.getElementById("kodeBarang").value = "";
        document.getElementById("namaBarangIndo").value = "";
        document.getElementById("namaBarangMand").value = "";
        document.getElementById("satuanIndo").value = "";
        document.getElementById("satuanMand").value = "";
        document.getElementById("racking").value = "";
        document.getElementById("kategoriBarang").value = "";
        document.getElementById("jenisBarang").value = "";
        document.getElementById("klasifikasi").value = "";
      })
      .catch(function (error) {
        console.log("Error:", error);

        // Handle error khusus "kode barang sudah ada"
        if (error.message.includes("Kode barang sudah ada") || error.message.includes("sudah terdaftar")) {
          // Tampilkan pesan error bahwa kode barang sudah ada
          let invKodeBarang2 = document.querySelector(".inv-kodeBarangTambah2");
          invKodeBarang2.style.display = "block";
          invKodeBarang2.textContent = "Kode barang sudah ada";

          // Sembunyikan pesan validasi sebelumnya
          let invKodeBarang1 = document.querySelector(".inv-kodeBarangTambah1");
          invKodeBarang1.style.display = "none";

          // Fokus ke form kode barang
          let kodeBarangInput = document.getElementById("kodeBarang");
          kodeBarangInput.style.outline = "1px solid red";
          kodeBarangInput.focus();
        } else {
          // Tampilkan error lainnya
          let modal = document.getElementById("myModal");
          let modalBody = modal.querySelector(".modal-content .alert");
          let alert = modal.querySelector(".alert");

          modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${error.message}`;
          alert.classList.add("alert-danger");
          alert.classList.remove("alert-success");

          showAlert();
        }
      });
  } else {
    // Jika user tidak memiliki level yang sesuai
    let modal = document.getElementById("myModal");
    let modalBody = modal.querySelector(".modal-content .alert");
    let alert = modal.querySelector(".alert");

    modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> Anda tidak memiliki izin untuk menambah data`;
    alert.classList.add("alert-danger");
    alert.classList.remove("alert-success");

    showAlert();
  }
});

$(document).ready(function () {
  // Function to reload the page after a certain delay
  function reloadPage() {
    setTimeout(function () {
      window.location.reload();
    }, 2000); // Reload after 5 seconds
  }

  window.addEventListener("error", function (event) {
    var errorMessage = event.message;
    if (errorMessage && errorMessage.includes("net::ERR_CONTENT_LENGTH_MISMATCH")) {
      console.error("Error: Ada error mismacth hehe");
      reloadPage();
    }
  });

  loadData();
  $("#btnRefresh").on("click", function () {
    clearData();
    loadData();
  });

  //Hapus jika ada validasi form tambah data modal yang tersisa dari sebelumnya
  $("#formModal").on("show.bs.modal", function () {
    let levelUser = document.querySelector("#leveluser").value;

    // Panggil fungsi untuk menghapus data
    if (canEditMasterAny) {
    } else {
      let successMessage = "User anda tidak diizinkan menambah item baru!";
      let modal = document.getElementById("myModal");
      let modalBody = modal.querySelector(".modal-content .alert");
      let alert = modal.querySelector(".alert");

      // ubah pesan pada modal
      modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${successMessage}`;

      // tambah class yang sesuai dengan jenis pesan
      alert.classList.add("alert-warning");
      // atur warna latar belakang sesuai dengan jenis pesan
      // alert.style.backgroundColor = "#d4edda"; // warna hijau yang sama dengan .alert-success di Bootstrap

      showAlert();
    }

    $(".form-control").removeClass("is-valid");
  });

  $("#formModalEdit").on("show.bs.modal", function () {
    //console.log('Form modal edit muncul');
    // hapus sisa validasi valid dan invalid sebelumnya
    $(".is-valid, .is-invalid").removeClass("is-valid is-invalid");
  });

  // Add event listener to capitalize input on keyup.

  let kodeBarangInput = document.getElementById("kodeBarang");
  kodeBarangInput.addEventListener("keyup", function () {
    this.value = this.value.toUpperCase();
  });

  let namaBarangIndo = document.getElementById("namaBarangIndo");
  namaBarangIndo.addEventListener("keyup", function () {
    this.value = this.value.toUpperCase();
  });

  let namaBarangMand = document.getElementById("namaBarangMand");
  namaBarangMand.addEventListener("keyup", function () {
    this.value = this.value.toUpperCase();
  });

  let satuanIndo = document.getElementById("satuanIndo");
  satuanIndo.addEventListener("keyup", function () {
    this.value = this.value.toUpperCase();
  });

  let satuanMand = document.getElementById("satuanMand");
  satuanMand.addEventListener("keyup", function () {
    this.value = this.value.toUpperCase();
  });

  let racking = document.getElementById("racking");
  racking.addEventListener("keyup", function () {
    this.value = this.value.toUpperCase();
  });

  let kategoriBarang = document.getElementById("kategoriBarang");
  kategoriBarang.addEventListener("keyup", function () {
    this.value = this.value.toUpperCase();
  });
});

/* PEMBUKA CONTROL FORM EDIT */

$(document).on("click", ".btn-edit", function () {
  // Ambil nilai level user
  let levelUser = $("#leveluser").val();
  let idPrimarykey = $(this).data("id");
  $("#idEdit").val(idPrimarykey); // menyimpan nilai Id pada elemen form yang tersembunyi
  console.log(idPrimarykey);
  // Mendapatkan data original dan menyimpannya di dalam elemen tersembunyi
  $.get("/api/datamasterbarang/" + idPrimarykey, function (data) {
    // console.log(data); // Menampilkan data di konsol
    $("#idEdit").val(data.id);
    $("#kodebarangEdit").val(data.kodeBarang);
    $("#namabarangindoEdit").val(data.namaBarangIndo);
    $("#namabarangmandEdit").val(data.namaBarangMand);
    $("#satuanindoEdit").val(data.satuanIndo);
    $("#satuanmandEdit").val(data.satuanMand);
    $("#rackingEdit").val(data.racking);
    $("#kategoribarangEdit").val(data.kategoriBarang);
    $("#jenisBarangEdit").val(data.jenisBarang);
    $("#klasifikasiEdit").val(data.classBarang);

    // Simpan data original di dalam elemen tersembunyi
    $("#originalData").val(JSON.stringify(data));

    // show the modal form
    $("#editModal").modal("show");

    // Level 1 SuperAdmin
    // Level 11 SPV Gudang
    // Level 12 Admin Gudang
    // Level 13 Operator Gudang
    // Level 13 Operator Gudang

    if (canEditMasterFull) {
      // Diizinkan untuk melakukan edit
      var inputElements = document.getElementsByClassName("form-control");

      for (var i = 0; i < inputElements.length; i++) {
        inputElements[i].readOnly = false;
      }

      var selectKategoriBarang = document.getElementById("kategoribarangEdit");
      var selectJenisBarang = document.getElementById("jenisBarangEdit");

      selectKategoriBarang.disabled = false;
      selectJenisBarang.disabled = false;
    } else if (canEditMasterPartial) {
      // Tambahkan kondisi atau perintah yang sesuai untuk level ini
      var inputElements = document.getElementsByClassName("form-control");

      // Meloopingi semua elemen input dan mengubah atribut "readonly" menjadi "true"
      for (var i = 0; i < inputElements.length; i++) {
        inputElements[i].readOnly = true;
      }

      // Mendapatkan elemen select dengan id "kategoribarangEdit" dan "jenisBarangEdit"
      var selectKategoriBarang = document.getElementById("kategoribarangEdit");
      var selectJenisBarang = document.getElementById("jenisBarangEdit");

      // Mengubah atribut "disabled" pada elemen select menjadi "true"
      selectKategoriBarang.disabled = true;
      selectJenisBarang.disabled = false;

      // Mengubah atribut "readonly" dan "disabled" pada elemen input dengan nama "rackingEdit" menjadi "false"
      $('input[name="rackingEdit"]').prop("readonly", false).attr("disabled", false);
    } else {
      // Tidak diizinkan untuk melakukan edit untuk level selain yang terdaftar di atas
      var inputElements = document.getElementsByClassName("form-control");

      for (var i = 0; i < inputElements.length; i++) {
        inputElements[i].readOnly = true;
      }

      var selectKategoriBarang = document.getElementById("kategoribarangEdit");
      var selectJenisBarang = document.getElementById("jenisBarangEdit");

      selectKategoriBarang.disabled = true;
      selectJenisBarang.disabled = true;
    }
  });
});

let formEdit = $("#form-Edit-data");

// Ketika tombol "Simpan Perubahan" ditekan
formEdit.submit(function (event) {
  event.preventDefault();

  // Ambil nilai level user
  let levelUser = $("#leveluser").val();

  if (canEditMasterAny) {
    // Mengambil nilai dari elemen input
    const namaLengkap = document.getElementById("namalengkap").value;
    const userName = document.getElementById("username").value;
    const levelUser = document.querySelector("#leveluser").value;

    // Mengambil nilai dari elemen input
    let idEdit = formEdit.find(".idEdit").val();
    let kodebarangEdit = formEdit.find("#kodebarangEdit").val();
    let namabarangindoEdit = formEdit.find("#namabarangindoEdit").val();
    let namabarangmandEdit = formEdit.find("#namabarangmandEdit").val();
    let satuanindoEdit = formEdit.find("#satuanindoEdit").val();
    let satuanmandEdit = formEdit.find("#satuanmandEdit").val();
    let rackingEdit = formEdit.find("#rackingEdit").val();
    let kategoribarangEdit = formEdit.find("#kategoribarangEdit").val();
    let jenisbarangEdit = formEdit.find("#jenisBarangEdit").val();
    let classbarangEdit = formEdit.find("#klasifikasiEdit").val();

    // Get the form data.
    let formData = {
      kodeBarang: kodebarangEdit || "",
      namaBarangIndo: namabarangindoEdit || "",
      namaBarangMand: namabarangmandEdit || "",
      satuanIndo: satuanindoEdit || "",
      satuanMand: satuanmandEdit || "",
      racking: rackingEdit || "",
      kategoriBarang: kategoribarangEdit || "",
      jenisBarang: jenisbarangEdit || "",
      classBarang: classbarangEdit || "",
    };

    // Mendapatkan data original dari elemen tersembunyi
    let originalData = JSON.parse($("#originalData").val());

    // console.log(originalData);
    console.log(formData);
    console.log(originalData);

    // Menyimpan nilai status di variabel sendiri
    // let statusOld = originalData.status;

    let isFormDataEqual = true;

    Object.keys(formData).forEach(function (key) {
      if (formData[key] !== originalData[key]) {
        isFormDataEqual = false;
        console.log("Properti " + key + " tidak sama.");
      }
    });

    // debugger;
    if (isFormDataEqual) {
      console.log("Form data sama dengan original data");

      let successMessage = "Tidak ada perubahan yang dilakukan!";
      let modal = document.getElementById("myModal");
      let modalBody = modal.querySelector(".modal-content .alert");
      let alert = modal.querySelector(".alert");

      // ubah pesan pada modal
      modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${successMessage}`;

      // tambah class yang sesuai dengan jenis pesan
      alert.classList.add("alert-warning");
      // atur warna latar belakang sesuai dengan jenis pesan
      // alert.style.backgroundColor = "#d4edda"; // warna hijau yang sama dengan .alert-success di Bootstrap

      showAlert();

      return;
    } else {
      console.log("Form data tidak sama dengan original data");

      // lakukan AJAX
      let id = $("#idEdit").val();
      console.log("id = " + id);
      // debugger;

      $.ajax({
        url: "/api/datamasterbarang/" + id,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function (response) {
          // hapus sisa validasi valid sebelumnya
          $(".is-valid").removeClass("is-valid");

          // Tutup modal form
          $("#editModal").modal("hide");

          let successMessage = "Perubahan berhasil dilakukan, silahkan cek data anda!";
          let modal = document.getElementById("myModal");
          let modalBody = modal.querySelector(".modal-content .alert");
          let alert = modal.querySelector(".alert");

          // ubah pesan pada modal
          modalBody.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i> ${successMessage}`;

          // tambah class yang sesuai dengan jenis pesan
          alert.classList.add("alert-warning");
          // atur warna latar belakang sesuai dengan jenis pesan
          alert.style.backgroundColor = "#d4edda"; // warna hijau yang sama dengan .alert-success di Bootstrap

          showAlert();

          // Refresh data
          refreshData();
        },
        error: function (error) {
          // Tampilkan pesan gagal
          alert(error.responseJSON.status + "\n" + error.responseJSON.error);
        },
      });
    }
  } else {
    // Tampilkan modal "Denied"
    document.getElementById("deniedModalLabel").innerHTML = "Edit Data";
    $("#deniedModal .modal-body").html("User anda tidak diizinkan untuk melakukan edit data peminjaman");
    $("#deniedModal").modal("show");
  }
});
