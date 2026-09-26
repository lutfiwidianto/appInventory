from flask import Flask, request, redirect, render_template, Blueprint, jsonify, url_for
import jwt
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY

pmc_form_bp = Blueprint("pmc_form_bp", __name__)
pmc_form_bp.secret_key = SECRET_KEY

@pmc_form_bp.errorhandler(Exception)
def handle_error(error):
    response = jsonify({'error': str(error)})
    response.status_code = 500
    return response

@pmc_form_bp.route("/pmcform")
def pmcform():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, pmc_form_bp.secret_key, algorithms="HS256")
            return render_template("controlpagehtml/pmcform.html", username=data["sub"], level_user=data["level_user"], menu='deptpmc', submenu='pmcform', titlePage='Form PMC')
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")
    
@pmc_form_bp.route("/pmcformulir")
def pmcformulir():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, pmc_form_bp.secret_key, algorithms="HS256")
            return render_template("controlpagehtml/pmcformulir.html", username=data["sub"], level_user=data["level_user"], menu='deptpmc', submenu='pmcformulir', titlePage='Form PMC')
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")

@pmc_form_bp.route("/form_survei_kendaraan")
def form_survei_kendaraan():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, pmc_form_bp.secret_key, algorithms="HS256")
            return render_template("controlpagehtml/form_survei_kendaraan.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], menu='deptpmc', submenu='pmcformulir', titlePage='Form PMC')
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")



@pmc_form_bp.route('/api/datapmcform', methods=['GET'])
def get_datapmcform():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, pmc_form_bp.secret_key, algorithms="HS256")
            try:
                with get_db_cursor() as cursor:
                    cursor.execute("SELECT * FROM dbo.pmc_form ORDER BY ID DESC")            
                    rows = cursor.fetchall()
                    data = []
                    for row in rows:
                        tanggal = row[1].strftime("%d-%m-%Y")
                        data.append({
                        "id": row[0], "tanggalMasuk": tanggal, "noformPmc": row[2], 
                        "namaBarang": row[3], "satuan":row[4],"qty":row[5], "fasilitasNonfasilitas":row[6], 
                        "perizinanBeacukai":row[7], "keterangan":row[8],"pic":row[9],
                        })
                    return jsonify(data)
                print(data)
            except Exception as e:
                print("Error:", e)
                return jsonify({"error": str(e)})
            # return render_template("dashboard.html", username=data["sub"])
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")
    
@pmc_form_bp.route('/api/datapeminjam/<int:id>', methods=['GET'])
def get_datapermintaanit_by_id(id):
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, pmc_form_bp.secret_key, algorithms="HS256")
            try:
                with get_db_cursor() as cursor:
                    cursor.execute("SELECT * FROM dbo.it_peminjaman_barang WHERE ID = %s ORDER BY ID DESC", (id,))            
                    row = cursor.fetchone()
                    if row:
                         # Check if the value of keterangan is empty, replace with one space if true
                        keterangan = row[10] if row[10] else ' '
                        data = {
                            "namaPeminjam": row[1], "dept": row[2], 
                            "tanggalPinjam": row[3], "barangyangDipinjam":row[4], "dipinjamkanOleh":row[5], "tanggalKembali":row[6], 
                            "barangyangKembali":row[7], "dikembalikanKe":row[8],
                            "status":row[9], "keterangan":keterangan,
                        }
                        return jsonify(data)
                    else:
                        return jsonify({"error": "Data not found"})
            except Exception as e:
                print("Error:", e)
                return jsonify({"error": str(e)})
            # return render_template("dashboard.html", username=data["sub"])
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")
    
@pmc_form_bp.route('/api/datapeminjam', methods=['POST'])
def post_datapeminjam():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, pmc_form_bp.secret_key, algorithms="HS256")
            try:
                # Ambil data dari request
                data_json = request.json

                # Buat dictionary data dengan nilai default None
                data = {
                    'nama_peminjam': data_json.get('namaPeminjam'),
                    'dept': data_json.get('dept'),
                    'tanggal_pinjam': data_json.get('tanggalPinjam'),
                    'barang_yang_dipinjam': data_json.get('barangyangDipinjam'),
                    'tanggal_kembali': data_json.get('tanggalKembali'),
                    'barang_yang_kembali': data_json.get('barangyangKembali'),
                    'dipinjamkan_oleh': data_json.get('dipinjamkanOleh'),
                    'dikembalikan_ke': data_json.get('dikembalikanKe'),
                    'status': data_json.get('status', None),
                    'keterangan': data_json.get('keterangan', None),
                }

                # Masukkan data ke database dengan dictionary data
                with get_db_cursor() as cursor:
                    cursor.execute("INSERT INTO dbo.it_peminjaman_barang ([NAMA PEMINJAM], DEPT, [TANGGAL PINJAM], [BARANG YANG DIPINJAM], [TANGGAL KEMBALI], [BARANG YANG KEMBALI], [DIPINJAMKAN OLEH], [DIKEMBALIKAN KE], STATUS, KETERANGAN) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                    (data.get('nama_peminjam'), data.get('dept'), data.get('tanggal_pinjam'), data.get('barang_yang_dipinjam'), data.get('tanggal_kembali'), data.get('barang_yang_kembali'), data.get('dipinjamkan_oleh'), data.get('dikembalikan_ke'), data.get('status'), data.get('keterangan')))
                
                # Kirimkan respons yang berhasil
                return jsonify({"status": "Data berhasil ditambahkan!"})

            except Exception as e:
                print("Error? ", e)
                return jsonify({"error": str(e)})

            # return render_template("dashboard.html", username=data["sub"])
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")
    
@pmc_form_bp.route('/api/datapeminjam/<int:id>', methods=['PUT'])
def put_datapeminjam(id):
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, pmc_form_bp.secret_key, algorithms="HS256")
            try:
                # Ambil data dari request
                data_json = request.json

                # Buat dictionary data dengan nilai default None
                data = {
                    'nama_peminjam': data_json.get('namaPeminjam'),
                    'dept': data_json.get('dept'),
                    'tanggal_pinjam': data_json.get('tanggalPinjam'),
                    'barang_yang_dipinjam': data_json.get('barangyangDipinjam'),
                    'tanggal_kembali': data_json.get('tanggalKembali'),
                    'barang_yang_kembali': data_json.get('barangyangKembali'),
                    'dipinjamkan_oleh': data_json.get('dipinjamkanOleh'),
                    'dikembalikan_ke': data_json.get('dikembalikanKe'),
                    'status': data_json.get('status', None),
                    'keterangan': data_json.get('keterangan', None),
                }

                # Update data di database dengan dictionary data
                with get_db_cursor() as cursor:
                    cursor.execute("UPDATE dbo.it_peminjaman_barang SET [NAMA PEMINJAM]=%s, DEPT=%s, [TANGGAL PINJAM]=%s, [BARANG YANG DIPINJAM]=%s, [TANGGAL KEMBALI]=%s, [BARANG YANG KEMBALI]=%s, [DIPINJAMKAN OLEH]=%s, [DIKEMBALIKAN KE]=%s, STATUS=%s, KETERANGAN=%s WHERE ID=%s",
                    (data.get('nama_peminjam'), data.get('dept'), data.get('tanggal_pinjam'), data.get('barang_yang_dipinjam'), data.get('tanggal_kembali'), data.get('barang_yang_kembali'), data.get('dipinjamkan_oleh'), data.get('dikembalikan_ke'), data.get('status'), data.get('keterangan'), id))
                
                # Kirimkan respons yang berhasil
                return jsonify({"status": "Data berhasil diupdate!"})

            except Exception as e:
                print("Error? ", e)
                return jsonify({"error": str(e)})

            # return render_template("dashboard.html", username=data["sub"])
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")
    
@pmc_form_bp.route('/api/datapeminjam/<int:id>', methods=['DELETE'])
def delete_datapeminjam(id):
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, pmc_form_bp.secret_key, algorithms="HS256")
            try:
                with get_db_cursor() as cursor:
                    # Hapus data dari database berdasarkan ID
                    cursor.execute("DELETE FROM dbo.it_peminjaman_barang WHERE ID=%s", (id,))
                return jsonify({"message": "Data berhasil dihapus"})
            except Exception as e:
                print("Error:", e)
                return jsonify({"error": str(e)})
            # return render_template("dashboard.html", username=data["sub"])
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")