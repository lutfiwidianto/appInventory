from flask import Flask, request, redirect, render_template, Blueprint, jsonify, url_for, make_response
import jwt
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY
from .utils import format_indo_date
from datetime import datetime

wh_allprbarang_bp = Blueprint("wh_allprbarang_bp", __name__)
wh_allprbarang_bp.secret_key = SECRET_KEY

@wh_allprbarang_bp.errorhandler(Exception)
def handle_error(error):
    response = jsonify({'error': str(error)})
    response.status_code = 500
    return response

@wh_allprbarang_bp.route('/proses_tambah_data_pr', methods=['POST'])
def post_proses_tambah_data_pr():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_allprbarang_bp.secret_key, algorithms="HS256")
            json_data = request.get_json()
            with get_db_cursor() as cursor:
                # Ambil MAX(Id) sekali saja sebelum loop
                cursor.execute("SELECT COALESCE(MAX(Id), 0) FROM tct_inventory.dbo.wh_pr_barang WITH (UPDLOCK, HOLDLOCK)")
                current_max_id = cursor.fetchone()[0]

                for pr_data in json_data:
                    current_max_id += 1
                    # Parse and format date
                    try:
                        tanggalPR_obj = datetime.strptime(pr_data['tanggalPR'], '%m/%d/%Y')
                        tanggalPR_formatted = tanggalPR_obj.strftime('%Y-%m-%d')
                    except Exception:
                        tanggalPR_formatted = datetime.now().strftime('%Y-%m-%d')

                    cursor.execute("INSERT INTO dbo.wh_pr_barang (Id, NomorPr, TanggalPr, KodeBarang, DeskripsiBarang, QtyPr, Status, Keterangan, UserInput, DeadLine) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                                    (current_max_id, pr_data['noPR'], tanggalPR_formatted, pr_data['kodeBarang'], pr_data['deskripsiBarang'], pr_data['qtyPR'], pr_data['status'], pr_data['keterangan'], data['nama_lengkap'], pr_data['deadline']))
            return jsonify({"status": "Data berhasil ditambahkan!"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return redirect("/login")

@wh_allprbarang_bp.route("/allprbarang")
def allprbarang():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_allprbarang_bp.secret_key, algorithms="HS256")
            return render_template("controlpagehtml/wh_allprbarang.html", username=data["sub"], level_user=data["level_user"], menu='deptpr', submenu='allprbarang', titlePage='All PR Barang')
        except Exception: return redirect("/login")
    return redirect("/login")

@wh_allprbarang_bp.route('/api/dataallprbarang', methods=['GET'])
def get_dataallprbarang():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_allprbarang_bp.secret_key, algorithms="HS256")
            query = """
                SELECT pr.Id, pr.NomorPr, pr.TanggalPr, pr.KodeBarang, 
                       ISNULL(mb.NamaBarangIndo, 'TIDAK DIKETAHUI (Belum Masuk Master Barang)') AS NamaBarang, 
                       pr.DeskripsiBarang, pr.QtyPr, rb.QtyTerima, (pr.QtyPr - rb.QtyTerima) AS QtySisa, 
                       mb.SatuanIndo, pr.Status, pr.Keterangan, pr.UserInput, pr.DeadLine 
                FROM dbo.wh_pr_barang pr 
                LEFT JOIN dbo.wh_master_barang mb ON mb.KodeBarang = pr.KodeBarang 
                LEFT JOIN dbo.wh_receive_barang rb ON rb.KodeBarang = pr.KodeBarang AND rb.NomorPr = pr.NomorPr
            """
            with get_db_cursor() as cursor:
                cursor.execute(query)
                rows = cursor.fetchall()
            data = [{"id": r[0], "nomorPr": r[1], "tanggalPr": format_indo_date(r[2]) if r[2] else "-", "kodeBarang": r[3], "namaBarang": r[4], "deskripsiBarang": r[5], "qtyPr": r[6], "qtyTerima": r[7], "qtySisa": r[8], "satuan": r[9], "status": r[10], "keterangan": r[11], "userInput": r[12], "deadLine": r[13]} for r in rows]
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")