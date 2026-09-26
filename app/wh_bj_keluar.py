from flask import Flask, request, redirect, render_template, Blueprint, jsonify, url_for, make_response
import jwt
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY
from .utils import format_indo_date, format_dmy
from datetime import datetime

wh_bj_keluar_bp = Blueprint("wh_bj_keluar_bp", __name__)
wh_bj_keluar_bp.secret_key = SECRET_KEY

@wh_bj_keluar_bp.errorhandler(Exception)
def handle_error(error):
    response = jsonify({'error': str(error)})
    response.status_code = 500
    return response

@wh_bj_keluar_bp.route("/mutasibjkeluar")
def mutasibjkeluar():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_bj_keluar_bp.secret_key, algorithms="HS256")
            html_content = render_template("controlpagehtml/wh_bj_keluar.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], menu='deptwhbj', submenu='mutasibjkeluar', titlePage='Barang Jadi keluar')
            response = make_response(html_content)
            response.headers["Content-Length"] = str(len(html_content))
            return response
        except Exception: return redirect("/login")
    return redirect("/login")

@wh_bj_keluar_bp.route('/api/databj_keluar/<path:tgl_awal>/<path:tgl_akhir>', methods=['GET'])
def get_datamutasibarangjadikeluar(tgl_awal, tgl_akhir):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_bj_keluar_bp.secret_key, algorithms="HS256")
            query = """
                SELECT a.no, a.tgl_rusak AS tgl_transaksi, a.kode_barang, b.NamaBarangIndo, a.nomor_batch, a.grade, a.jumlah, 
                       NULL AS container, NULL AS destination_port, NULL AS buyer, b.SatuanIndo, a.no_slip, 
                       CASE WHEN a.kode_barang IN ('PPP.TCE.02.000013', 'PPP.TCE.02.000003', 'PPP.TCE.02.000007', 'PPP.TCE.02.000004') THEN a.jumlah * 25 ELSE 0 END AS hitungKG,
                       a.keterangan
                FROM tct_inventory.dbo.wh_bj_rusak AS a
                JOIN tct_inventory.dbo.wh_master_barang AS b ON a.kode_barang = b.KodeBarang
                WHERE a.tgl_rusak BETWEEN %s AND %s
                UNION ALL
                SELECT a.no, a.tgl_keluar AS tgl_transaksi, a.kode_barang, b.NamaBarangIndo, a.nomor_batch, a.grade, a.jumlah, 
                       a.container, a.destination_port, a.buyer, b.SatuanIndo, a.no_slip, 
                       CASE WHEN a.kode_barang IN ('PPP.TCE.02.000013', 'PPP.TCE.02.000003', 'PPP.TCE.02.000007') THEN a.jumlah * 25 ELSE 0 END AS hitungKG,
                       NULL AS keterangan
                FROM tct_inventory.dbo.wh_bj_keluar AS a
                JOIN tct_inventory.dbo.wh_master_barang AS b ON a.kode_barang = b.KodeBarang
                WHERE a.tgl_keluar BETWEEN %s AND %s
                ORDER BY tgl_transaksi;
            """
            # Robust date parsing
            def parse_date(date_str):
                if not date_str:
                    return None
                date_str = date_str.strip()
                for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y', '%Y/%m/%d'):
                    try:
                        return datetime.strptime(date_str, fmt)
                    except ValueError:
                        continue
                return date_str # Fallback

            tgl_awal_dt = parse_date(tgl_awal)
            tgl_akhir_dt = parse_date(tgl_akhir)

            with get_db_cursor() as cursor:
                cursor.execute(query, (tgl_awal_dt, tgl_akhir_dt, tgl_awal_dt, tgl_akhir_dt))
                rows = cursor.fetchall()
            data = [{"id": r[0], "tanggalkeluar": format_dmy(r[1]), "kodeBarang": r[2], "namaBarang": r[3], "nomorBatch": r[4], "grade": r[5], "jumlah": int(r[6]), "container": r[7], "destination_port": r[8], "buyer": r[9], "satuan": r[10], "noSlipPenerimaan": r[11], "jumlahKg": r[12]} for r in rows]
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return jsonify({"error": "Unauthorized"}), 401

@wh_bj_keluar_bp.route('/api/databjkeluar', methods=['POST'])
def post_databjkeluar():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_bj_keluar_bp.secret_key, algorithms="HS256")
            json_data = request.get_json()
            with get_db_cursor() as cursor:
                for data in json_data:
                    # Robust date parsing
                    def parse_date_post(date_str):
                        if not date_str:
                            return datetime.now()
                        date_str = date_str.strip()
                        for fmt in ('%d-%m-%Y', '%d/%m/%Y', '%Y-%m-%d', '%Y/%m/%d'):
                            try:
                                return datetime.strptime(date_str, fmt)
                            except ValueError:
                                continue
                        return datetime.now()

                    tgl_keluar = parse_date_post(data['tanggalKeluar'])

                    query = "INSERT INTO tct_inventory.dbo.wh_bj_keluar ([no], tgl_keluar, kode_barang, nomor_batch, grade, jumlah, kemasan, no_slip) VALUES(0, %s, %s, %s, %s, %s, %s, %s)"
                    cursor.execute(query, (tgl_keluar, data['kodebarangKeluar'], data['nomorBatchKeluar'], data['gradeKeluar'], data['qtyOut'], data['kemasanKeluar'], data['noSlipPenerimaanKeluar']))
            return jsonify({"status": "Data berhasil ditambahkan!"})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_bj_keluar_bp.route('/api/deletebonkeluar', methods=['DELETE'])
def delete_bon_keluar():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_bj_keluar_bp.secret_key, algorithms="HS256")
            json_data = request.get_json()
            no_bon = json_data['no_bon']
            with get_db_cursor() as cursor:
                cursor.execute("DELETE FROM tct_inventory.dbo.[wh_mutasi_history] WHERE LTRIM(RTRIM(NoBon)) = LTRIM(RTRIM(%s))", (no_bon,))
                cursor.execute("DELETE FROM tct_inventory.dbo.[wh_mutasi_barang_keluar] WHERE NoBon = %s", (no_bon,))
            return jsonify({"status": "Data berhasil dihapus!"})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")
