from flask import Flask, request, redirect, render_template, Blueprint, jsonify, make_response
import jwt
from .utils import format_indo_date
import datetime
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY

wh_onlinekartustock_w_smart_bp = Blueprint("wh_onlinekartustock_w_smart_bp", __name__)
wh_onlinekartustock_w_smart_bp.secret_key = SECRET_KEY

@wh_onlinekartustock_w_smart_bp.route("/compareonlinekartustock")
def onlinekartustock():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_onlinekartustock_w_smart_bp.secret_key, algorithms="HS256")
            html_content = render_template("controlpagehtml/wh_onlinekartustockwithsmart.html", username=data["sub"], level_user=data["level_user"], menu='deptwh', submenu='onlinekartustockwsmart', titlePage='Compare Online Kartu Stock')
            response = make_response(html_content)
            response.headers["Content-Length"] = str(len(html_content))
            return response
        except Exception:
            return redirect("/login")
    return redirect("/login")

@wh_onlinekartustock_w_smart_bp.route('/api/onlinekartustock', methods=['GET'])
def get_onlinekartustock():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_onlinekartustock_w_smart_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("SELECT * FROM dbo.wh_master_barang ORDER BY ID DESC")            
                rows = cursor.fetchall()
                data = [{"id": r[0], "kodeBarang": r[1], "namabarangIdn": r[2], "namabarangMand": r[3], "satuan":r[4], "kategoriBarang":r[5]} for r in rows]
                return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_onlinekartustock_w_smart_bp.route('/api/onlinekartustock', methods=['POST'])
def post_onlinekartustock():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_onlinekartustock_w_smart_bp.secret_key, algorithms="HS256")
            data_json = request.json
            kodeBarang = data_json.get('kodeBarang')
            tanggalAwal = data_json.get('tanggalAwal')
            tanggalAkhir = data_json.get('tanggalAkhir')

            query = f"""
            SELECT Tanggal, NoRef, KodeBarang, Keterangan, QtyIn, QtyOut,
                   SUM(QtyIn + QtyOut) OVER (ORDER BY Tanggal, NoRef) AS Saldo,
                   (SELECT ISNULL(SatuanIndo, '') FROM dbo.wh_master_barang WHERE KodeBarang = %s) AS Unit,
                   (SELECT ISNULL(KategoriBarang, '') FROM dbo.wh_master_barang WHERE KodeBarang = %s) AS KategoriBarang
            FROM (
                SELECT sb.TanggalSaldoAwal AS Tanggal, CAST('' AS NVARCHAR(255)) AS NoRef, sb.KodeBarang, 'Saldo Awal' AS Keterangan,
                       sb.JumlahSaldoAwal +
                       ISNULL((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = sb.KodeBarang AND TanggalMasukBarang < %s), 0) +
                       ISNULL((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = sb.KodeBarang AND TanggalKeluarBarang < %s), 0) AS QtyIn,
                       0 AS QtyOut
                FROM dbo.wh_stock_barang sb WHERE sb.KodeBarang = %s
                UNION ALL
                SELECT TanggalMasukBarang, CAST(NoBon AS NVARCHAR(255)), KodeBarang, 'Masuk - ' + (SELECT ISNULL(NamaBarangIndo, '') FROM dbo.wh_master_barang WHERE KodeBarang = wh_mutasi_barang_masuk.KodeBarang), SUM(Jumlah), 0
                FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = %s AND TanggalMasukBarang BETWEEN %s AND %s
                GROUP BY TanggalMasukBarang, NoBon, KodeBarang
                UNION ALL
                SELECT TanggalKeluarBarang, CAST(NoBon AS NVARCHAR(255)), KodeBarang, 'Keluar - ' + (SELECT ISNULL(NamaBarangIndo, '') FROM dbo.wh_master_barang WHERE KodeBarang = wh_mutasi_barang_keluar.KodeBarang), 0, SUM(Jumlah)
                FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = %s AND TanggalKeluarBarang BETWEEN %s AND %s
                GROUP BY TanggalKeluarBarang, NoBon, KodeBarang
                UNION ALL
                SELECT TanggalAdjustment, CAST(NoRef AS NVARCHAR(255)), KodeBarang, 'Adjust - ' + (SELECT ISNULL(NamaBarangIndo, '') FROM dbo.wh_master_barang WHERE KodeBarang = wh_barang_adjustment.KodeBarang), CASE WHEN Jumlah < 0 THEN 0 ELSE Jumlah END, CASE WHEN Jumlah >= 0 THEN 0 ELSE Jumlah END
                FROM dbo.wh_barang_adjustment WHERE KodeBarang = %s AND TanggalAdjustment BETWEEN %s AND %s
            ) AS subquery ORDER BY Tanggal, NoRef
            """
            with get_db_cursor() as cursor:
                params = (kodeBarang, kodeBarang, tanggalAwal, tanggalAwal, kodeBarang, kodeBarang, tanggalAwal, tanggalAkhir, kodeBarang, tanggalAwal, tanggalAkhir, kodeBarang, tanggalAwal, tanggalAkhir)
                cursor.execute(query, params)
                rows = cursor.fetchall()
                data = []
                for row in rows:
                    data.append({
                        'tanggal': format_indo_date(row[0]), 'noRef': row[1], 'kodeBarang': row[2], 'keterangan': row[3],
                        'qtyInApp': int(row[4]), 'qtyOutApp': int(row[5]), 'saldoApp': int(row[6]), 'unit': row[7], 'kategoriBarang': row[8]
                    })
                return jsonify({'data': data})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")
    
@wh_onlinekartustock_w_smart_bp.route('/api/datapeminjam/<int:id>', methods=['PUT'])
def put_datapeminjam(id):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_onlinekartustock_w_smart_bp.secret_key, algorithms="HS256")
            data = request.json
            with get_db_cursor() as cursor:
                cursor.execute("UPDATE dbo.it_peminjaman_barang SET [NAMA PEMINJAM]=%s, DEPT=%s, [TANGGAL PINJAM]=%s, [BARANG YANG DIPINJAM]=%s, [TANGGAL KEMBALI]=%s, [BARANG YANG KEMBALI]=%s, [DIPINJAMKAN OLEH]=%s, [DIKEMBALIKAN KE]=%s, STATUS=%s, KETERANGAN=%s WHERE ID=%s",
                (data.get('namaPeminjam'), data.get('dept'), data.get('tanggalPinjam'), data.get('barangyangDipinjam'), data.get('tanggalKembali'), data.get('barangyangKembali'), data.get('dipinjamkanOleh'), data.get('dikembalikanKe'), data.get('status'), data.get('keterangan'), id))
            return jsonify({"status": "Data berhasil diupdate!"})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")
    
@wh_onlinekartustock_w_smart_bp.route('/api/datapeminjam/<int:id>', methods=['DELETE'])
def delete_datapeminjam(id):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_onlinekartustock_w_smart_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("DELETE FROM dbo.it_peminjaman_barang WHERE ID=%s", (id,))
            return jsonify({"message": "Data berhasil dihapus"})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")