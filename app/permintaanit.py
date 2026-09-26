from flask import Flask, request, redirect, render_template, Blueprint, jsonify
import jwt
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY

permintIt_bp = Blueprint("permintIt_bp", __name__)
permintIt_bp.secret_key = SECRET_KEY

@permintIt_bp.errorhandler(Exception)
def handle_error(error):
    response = jsonify({'error': str(error)})
    response.status_code = 500
    return response


@permintIt_bp.route('/api/datapermintaanit', methods=['GET'])
def get_datapermintaanit():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, permintIt_bp.secret_key, algorithms="HS256")
            try:
                with get_db_cursor() as cursor:
                    # Query data dari database
                    cursor.execute("SELECT * FROM dbo.it_permintaan_perbaikan ORDER BY ID DESC")            
                    rows = cursor.fetchall()
                    data = []
                    for row in rows:
                        data.append({
                        "id": row[0], "tanggal": row[1], "dept": row[2], 
                        "nomorAsset": row[3], "namaSarana":row[4], "kerusakan":row[5], 
                        "kategori":row[6], "jenisTindakan":row[7], "tanggalPerbaikan":row[8],
                        "tanggalSelesai":row[9], "levelKerusakan":row[10], "penyebab":row[11],
                        "tindakan":row[12], "saran":row[13], "pemohon":row[14], "petugasPerbaikan":row[15],
                        "hasilPerbaikan":row[16], "verifikasiUser":row[17], "loginNama":row[18].strip(), "loginId":row[19].strip(), "status":row[20],
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

@permintIt_bp.route('/api/datapermintaanit/<int:id>', methods=['GET'])
def get_datapermintaanit_by_id(id):
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, permintIt_bp.secret_key, algorithms="HS256")
            try:
                with get_db_cursor() as cursor:
                    # Query data dari database
                    cursor.execute("SELECT * FROM dbo.it_permintaan_perbaikan WHERE ID = %s ORDER BY ID DESC", (id,))
                    row = cursor.fetchone()
                    if row:
                        data = {
                            "tanggal": row[1], "dept": row[2],
                            "nomorAsset": row[3], "namaSarana": row[4], "kerusakan": row[5],
                            "kategori": row[6], "jenisTindakan": row[7], "tanggalPerbaikan": row[8],
                            "tanggalSelesai": row[9], "levelKerusakan": row[10], "penyebab": row[11],
                            "tindakan": row[12], "saran": row[13], "pemohon": row[14], "petugasPerbaikan": row[15],
                            "hasilPerbaikan": row[16], "verifikasiUser": row[17], "status": row[20],
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


@permintIt_bp.route('/api/datapermintaanit', methods=['POST'])
def add_datapermintaanit():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, permintIt_bp.secret_key, algorithms="HS256")
            try:
                # Ambil data dari request
                data_json = request.json

                # Buat dictionary data dengan nilai default None
                data = {
                    'tanggal': data_json.get('tanggal'),
                    'dept': data_json.get('dept'),
                    'nomor_asset': data_json.get('nomorAsset'),
                    'nama_sarana': data_json.get('namaSarana'),
                    'kerusakan': data_json.get('kerusakan'),
                    'kategori': data_json.get('kategori'),
                    'jenis_tindakan': data_json.get('jenisTindakan'),
                    'tanggal_perbaikan': data_json.get('tanggalPerbaikan'),
                    'tanggal_selesai': data_json.get('tanggalSelesai'),
                    'level_kerusakan': data_json.get('levelKerusakan'),
                    'penyebab': data_json.get('penyebab'),
                    'tindakan': data_json.get('tindakan'),
                    'saran': data_json.get('saran'),
                    'pemohon': data_json.get('pemohon'),
                    'petugas_perbaikan': data_json.get('petugasPerbaikan'),
                    'hasil_perbaikan': data_json.get('hasilPerbaikan'),
                    'verifikasi_user': data_json.get('verifikasiUser'),
                    'login_nama': data_json.get('loginNama'),
                    'login_user': data_json.get('loginUser'),
                    'status': data_json.get('status')
                }

                # Masukkan data ke database dengan dictionary data
                with get_db_cursor() as cursor:
                    cursor.execute("INSERT INTO dbo.it_permintaan_perbaikan (TANGGAL, DEPT, [NOMOR ASET], [NAMA SARANA], KERUSAKAN, KATEGORI, [JENIS TINDAKAN], [TANGGAL PERBAIKAN], [TANGGAL SELESAI], [LEVEL KERUSAKAN], PENYEBAB, TINDAKAN, SARAN, PEMOHON, [PETUGAS PERBAIKAN], [HASIL PERBAIKAN], [VERIFIKASI USER], [LOGIN NAMA], [LOGIN ID], STATUS) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                                    (data.get('tanggal'), data.get('dept'), data.get('nomor_asset'), data.get('nama_sarana'), data.get('kerusakan'), data.get('kategori'), data.get('jenis_tindakan'), data.get('tanggal_perbaikan'), data.get('tanggal_selesai'), data.get('level_kerusakan'), data.get('penyebab'), data.get('tindakan'), data.get('saran'), data.get('pemohon'), data.get('petugas_perbaikan'), data.get('hasil_perbaikan'), data.get('verifikasi_user'), data.get('login_nama'), data.get('login_user'), data.get('status')))

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

@permintIt_bp.route('/api/datapermintaanit/<int:id>', methods=['PUT'])
def edit_datapermintaanit(id):
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, permintIt_bp.secret_key, algorithms="HS256")
            try:
                # Update data di database
                request_data = request.get_json()
                with get_db_cursor() as cursor:
                    cursor.execute("""
                            UPDATE dbo.it_permintaan_perbaikan
                            SET TANGGAL = %s, DEPT = %s, [NOMOR ASET] = %s, [NAMA SARANA] = %s, KERUSAKAN = %s,
                                KATEGORI = %s, [JENIS TINDAKAN] = %s, [TANGGAL PERBAIKAN] = %s, [TANGGAL SELESAI] = %s,
                                [LEVEL KERUSAKAN] = %s, PENYEBAB = %s, TINDAKAN = %s, SARAN = %s, PEMOHON = %s,
                                [PETUGAS PERBAIKAN] = %s, [HASIL PERBAIKAN] = %s, [VERIFIKASI USER] = %s, STATUS = %s
                            WHERE ID = %s
                        """, (
                            request_data["tanggal"], request_data["dept"], request_data["nomorAsset"], request_data["namaSarana"], request_data["kerusakan"],
                            request_data["kategori"], request_data["jenisTindakan"], request_data["tanggalPerbaikan"], request_data["tanggalSelesai"],
                            request_data["levelKerusakan"], request_data["penyebab"], request_data["tindakan"], request_data["saran"], request_data["pemohon"],
                            request_data["petugasPerbaikan"], request_data["hasilPerbaikan"], request_data["verifikasiUser"], request_data["status"], id
                        ))

                return jsonify({"message": "Data berhasil diupdate"})
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

@permintIt_bp.route('/api/datapermintaanit/<int:id>', methods=['DELETE'])
def delete_datapermintaanit(id):
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, permintIt_bp.secret_key, algorithms="HS256")
            try:
                with get_db_cursor() as cursor:
                    # Hapus data dari database
                    cursor.execute("""
                        DELETE FROM dbo.it_permintaan_perbaikan WHERE id = %s
                    """, (id,))
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

@permintIt_bp.route("/permintaanit")
def permintaanit():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, permintIt_bp.secret_key, algorithms="HS256")
            return render_template("controlpagehtml/permintaan-it.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], menu='deptit', submenu='it', titlePage='Req IT')
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")
