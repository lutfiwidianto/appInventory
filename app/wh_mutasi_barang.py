from flask import Flask, request, redirect, render_template, Blueprint, jsonify, url_for
import jwt
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY

wh_mutasibarang_bp = Blueprint("wh_mutasibarang_bp", __name__)
wh_mutasibarang_bp.secret_key = SECRET_KEY

@wh_mutasibarang_bp.errorhandler(Exception)
def handle_error(error):
    response = jsonify({'error': str(error)})
    response.status_code = 500
    return response

@wh_mutasibarang_bp.route("/mutasibarang")
def mutasibarang():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_mutasibarang_bp.secret_key, algorithms="HS256")
            return render_template("controlpagehtml/wh_mutasibarang.html", username=data["sub"], level_user=data["level_user"], menu='deptwh', submenu='mutasibarang', titlePage='Mutasi Barang')
        except Exception:
            return redirect("/login")
    return redirect("/login")

@wh_mutasibarang_bp.route('/api/datamutasibarang', methods=['GET'])
def get_datamutasibarang():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_mutasibarang_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("SELECT * FROM dbo.wh_mutasi_barang ORDER BY ID DESC")            
                rows = cursor.fetchall()
                data = [{"id": r[0], "kodeBarang": r[1], "asalBarang": r[2], "kategoriBarang": r[3], "tanggalMutasi":r[4], "jumlah":r[5]} for r in rows]
                return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")
    
@wh_mutasibarang_bp.route('/api/datapeminjam/<int:id>', methods=['GET'])
def get_datapermintaanit_by_id(id):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_mutasibarang_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("SELECT * FROM dbo.it_peminjaman_barang WHERE ID = %s", (id,))            
                row = cursor.fetchone()
                if row:
                    data = {
                        "namaPeminjam": row[1], "dept": row[2], "tanggalPinjam": row[3], "barangyangDipinjam":row[4], 
                        "dipinjamkanOleh":row[5], "tanggalKembali":row[6], "barangyangKembali":row[7], 
                        "dikembalikanKe":row[8], "status":row[9], "keterangan": row[10] or ' ',
                    }
                    return jsonify(data)
                return jsonify({"error": "Data not found"})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")
    
@wh_mutasibarang_bp.route('/api/datapeminjam', methods=['POST'])
def post_datapeminjam():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_mutasibarang_bp.secret_key, algorithms="HS256")
            req = request.json
            with get_db_cursor() as cursor:
                cursor.execute("INSERT INTO dbo.it_peminjaman_barang ([NAMA PEMINJAM], DEPT, [TANGGAL PINJAM], [BARANG YANG DIPINJAM], [TANGGAL KEMBALI], [BARANG YANG KEMBALI], [DIPINJAMKAN OLEH], [DIKEMBALIKAN KE], STATUS, KETERANGAN) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (req.get('namaPeminjam'), req.get('dept'), req.get('tanggalPinjam'), req.get('barangyangDipinjam'), req.get('tanggalKembali'), req.get('barangyangKembali'), req.get('dipinjamkanOleh'), req.get('dikembalikanKe'), req.get('status'), req.get('keterangan')))
            return jsonify({"status": "Data berhasil ditambahkan!"})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")
    
@wh_mutasibarang_bp.route('/api/datapeminjam/<int:id>', methods=['PUT'])
def put_datapeminjam(id):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_mutasibarang_bp.secret_key, algorithms="HS256")
            req = request.json
            with get_db_cursor() as cursor:
                cursor.execute("UPDATE dbo.it_peminjaman_barang SET [NAMA PEMINJAM]=%s, DEPT=%s, [TANGGAL PINJAM]=%s, [BARANG YANG DIPINJAM]=%s, [TANGGAL KEMBALI]=%s, [BARANG YANG KEMBALI]=%s, [DIPINJAMKAN OLEH]=%s, [DIKEMBALIKAN KE]=%s, STATUS=%s, KETERANGAN=%s WHERE ID=%s",
                (req.get('namaPeminjam'), req.get('dept'), req.get('tanggalPinjam'), req.get('barangyangDipinjam'), req.get('tanggalKembali'), req.get('barangyangKembali'), req.get('dipinjamkanOleh'), req.get('dikembalikanKe'), req.get('status'), req.get('keterangan'), id))
            return jsonify({"status": "Data berhasil diupdate!"})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")
    
@wh_mutasibarang_bp.route('/api/datapeminjam/<int:id>', methods=['DELETE'])
def delete_datapeminjam(id):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_mutasibarang_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("DELETE FROM dbo.it_peminjaman_barang WHERE ID=%s", (id,))
            return jsonify({"message": "Data berhasil dihapus"})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")