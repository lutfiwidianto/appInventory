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

    // Fungsi untuk menangani input pada input field dengan ID "cariNPWPsup"
    $("#cariNPWPsup").on("input", function () {
        // Dapatkan nilai dari kolom input dengan ID "cariNPWPsup"
        const searchValue = $(this).val();
        console.log(searchValue);

        // Lakukan permintaan AJAX POST ke route Flask
        $.ajax({
            type: "POST",
            url: "/GetDataFromReferensiPemasok",
            contentType: "application/json",
            data: JSON.stringify({ "searchValue": searchValue }),
            success: function (response) {
                // Tangani respon berhasil di sini
                // Asumsikan Anda ingin menampilkan hasil dalam HTML, perbarui elemen yang sesuai
                $("#resultNPWP").val(response.NPWP);
                $("#resultNAMA").val(response.NAMA);
                $("#resultALAMAT").val(response.ALAMAT);
            },
            error: function (error) {
                // Tangani respon error di sini
                // Anda dapat menampilkan pesan error atau melakukan tindakan lainnya
                console.log("Error:", error.responseText);
            }
        });
    });


    // Fungsi untuk menangani perubahan pilihan pada elemen dengan class "jenis-kemasan"
    $(".jenis-kemasan").on("change", function () {
        // Dapatkan nomor baris (td) yang berisi elemen yang dipilih
        const rowNumber = $(this).closest("tr").index() + 1;

        // Dapatkan nilai jenis kemasan yang dipilih
        const selectedValue = $(this).val();

        if (selectedValue === "") {
            // Jika jenis kemasan dipilih kosong, maka kosongkan nomor seri dan kode jenis kemasan
            $("#no-seri" + rowNumber).empty();
            $("#kodeKemasan" + rowNumber).val("");
        } else {
            // Lakukan permintaan AJAX POST ke route Flask
            $.ajax({
                type: "POST",
                url: "/GetKodeKemasan",
                contentType: "application/json",
                data: JSON.stringify({ "uraianValues": [selectedValue] }),
                success: function (response) {
                    // Tangani respon berhasil di sini
                    // Asumsikan Anda ingin menampilkan hasil dalam HTML, perbarui elemen yang sesuai
                    const kodeKemasanInput = $("#kodeKemasan" + rowNumber);
                    kodeKemasanInput.val(response[selectedValue]);

                    // Cetak hasil ke konsol
                    console.log("Row " + rowNumber + ", Jenis Kemasan: " + selectedValue + ", Kode Kemasan: " + response[selectedValue]);

                    // Perbarui nomor seri berdasarkan nomor baris
                    const noSeriCell = $("#no-seri" + rowNumber);
                    noSeriCell.text(rowNumber);
                },
                error: function (error) {
                    // Tangani respon error di sini
                    // Anda dapat menampilkan pesan error atau melakukan tindakan lainnya
                    console.log("Error:", error.responseText);
                }
            });
        }
    });

    // Fungsi untuk mengosongkan nomor dan kode jenis kemasan jika jenis kemasan dipilih kosong lagi
    $(".jenis-kemasan").on("focus", function () {
        const rowNumber = $(this).closest("tr").index() + 1;
        const selectedValue = $(this).val();
        if (selectedValue === "") {
            // Kosongkan nomor seri dan kode jenis kemasan jika jenis kemasan dipilih kosong
            $("#no-seri" + rowNumber).empty();
            $("#kodeKemasan" + rowNumber).val("");
        }
    });
    // Fungsi untuk menangani perubahan pilihan pada elemen dengan class "jenis-dokumen"
    $(".jenis-dokumen").on("change", function () {
        // Dapatkan nomor baris (tr) yang berisi elemen yang dipilih
        const rowNumber = $(this).closest("tr").index() + 1;

        // Dapatkan nilai jenis dokumen yang dipilih
        const selectedValue = $(this).val();

        // Dapatkan kode dokumen sebelum perubahan jenis dokumen
        const kodeDokumenSebelumnya = $("#kode-dokumen" + rowNumber).val();

        if (selectedValue === "") {
            // Jika jenis dokumen dipilih kosong, maka kosongkan kode dokumen dan nomor seri dokumen
            $("#kode-dokumen" + rowNumber).val("");
            $("#no-seridok" + rowNumber).empty();
        } else {
            // Lakukan permintaan AJAX POST ke route Flask
            $.ajax({
                type: "POST",
                url: "/GetKodeDokumen",
                contentType: "application/json",
                data: JSON.stringify({ "uraianValues": [selectedValue] }),
                success: function (response) {
                    // Tangani respon berhasil di sini
                    // Asumsikan Anda ingin menampilkan hasil dalam HTML, perbarui elemen yang sesuai
                    const kodeDokumenInput = $("#kode-dokumen" + rowNumber);
                    kodeDokumenInput.val(response[selectedValue]);

                    // Cetak hasil ke konsol
                    console.log("Row " + rowNumber + ", Jenis Dokumen: " + selectedValue + ", Kode Dokumen: " + response[selectedValue]);

                    // Perbarui nomor seri berdasarkan nomor baris, tetapi hanya jika kode dokumen telah berubah
                    if (kodeDokumenInput.val() !== kodeDokumenSebelumnya) {
                        const noSeriCell = $("#no-seridok" + rowNumber);
                        noSeriCell.text(rowNumber);
                    }
                },
                error: function (error) {
                    // Tangani respon error di sini
                    // Anda dapat menampilkan pesan error atau melakukan tindakan lainnya
                    console.log("Error:", error.responseText);
                }
            });
        }
    });

    // Fungsi untuk mengosongkan kode dokumen jika jenis dokumen dipilih kosong lagi
    $(".jenis-dokumen").on("focus", function () {
        const rowNumber = $(this).closest("tr").index() + 1;
        const selectedValue = $(this).val();
        if (selectedValue === "") {
            // Kosongkan kode dokumen dan nomor seri dokumen jika jenis dokumen dipilih kosong
            $("#kode-dokumen" + rowNumber).val("");
            $("#no-seridok" + rowNumber).empty();
        }
    });


});

function addRow() {
    var table = document.getElementById("example1").getElementsByTagName('tbody')[0];
    var newRow = table.insertRow(table.rows.length);
    var rowNumber = table.rows.length;

    var cols = [
        "<input type='text' class='form-control' name='no" + rowNumber + "' id='no" + rowNumber + "'>",
        "<input type='text' class='form-control' name='kode_barang" + rowNumber + "' id='kode_barang" + rowNumber + "'>",
        "<input type='text' class='form-control' name='uraian" + rowNumber + "' id='uraian" + rowNumber + "'>",
        "<input type='text' class='form-control' name='berat_satuan" + rowNumber + "' id='berat_satuan" + rowNumber + "'>",
        "<input type='text' class='form-control' name='input_jumlah" + rowNumber + "' id='input_jumlah" + rowNumber + "'>",
        "<input type='text' class='form-control' name='input_total_harga" + rowNumber + "' id='input_total_harga" + rowNumber + "'>",
        "<input type='text' class='form-control' name='berat_totalperitem" + rowNumber + "' id='berat_total" + rowNumber + "'>",
        "<input type='text' class='form-control' name='kode_satuan" + rowNumber + "' id='kode_satuan" + rowNumber + "'>"
    ];

    for (var i = 0; i < cols.length; i++) {
        var cell = newRow.insertCell(i);
        cell.innerHTML = cols[i];
    }
}

function populateTable() {
    for (var i = 0; i < 3; i++) {
        addRow();
    }
}

var addButton = document.getElementById("addRowBtn");
addButton.addEventListener("click", addRow);

window.addEventListener("load", populateTable);


function collectData() {
    var table = document.getElementById("example1").getElementsByTagName('tbody')[0];
    var rows = table.getElementsByTagName('tr');

    var data = [];

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var inputs = row.getElementsByTagName('input');

        var rowData = {
            no: inputs[0].value,
            kode_barang: inputs[1].value,
            uraian: inputs[2].value,
            berat_satuan: inputs[3].value,
            input_jumlah: inputs[4].value,
            input_total_harga: inputs[5].value,
            berat_totalperitem: inputs[6].value,
            kode_satuan: inputs[7].value
        };

        data.push(rowData);
    }

    return data;
}


var formData = collectData();
var jsonData = JSON.stringify(formData);

// Sekarang jsonData siap untuk dikirim ke server



// Buat Dokumen Aju Dulu
document.getElementById('insertButton').addEventListener('click', createDokAju);

function createDokAju() {
    const nomorAju = document.getElementById('nomorAju').value;
    const data = { nomor_aju: nomorAju };

    fetch('/CreateDokAju40', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            document.getElementById('resultMessage').textContent = result.message;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('resultMessage').textContent = 'Terjadi kesalahan saat memasukkan data.';
        });
}