from flask import Flask, request, redirect, render_template, Blueprint, jsonify, make_response
import jwt
from .utils import format_indo_date, format_dmy
import datetime
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY

wh_onlinekartustock_bp = Blueprint("wh_onlinekartustock_bp", __name__)
wh_onlinekartustock_bp.secret_key = SECRET_KEY

@wh_onlinekartustock_bp.route("/onlinekartustock")
def onlinekartustock():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_onlinekartustock_bp.secret_key, algorithms="HS256")
            html_content = render_template("controlpagehtml/wh_onlinekartustock.html", username=data["sub"], level_user=data["level_user"], menu='deptwh', submenu='onlinekartustock', titlePage='Online Kartu Stock')
            response = make_response(html_content)
            response.headers["Content-Length"] = str(len(html_content))
            return response
        except Exception:
            return redirect("/login")
    return redirect("/login")

@wh_onlinekartustock_bp.route('/api/onlinekartustock', methods=['GET'])
def get_onlinekartustock():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_onlinekartustock_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("SELECT * FROM dbo.wh_master_barang ORDER BY ID DESC")            
                rows = cursor.fetchall()
                data = [{"id": r[0], "kodeBarang": r[1], "namabarangIdn": r[2], "namabarangMand": r[3], "satuan":r[4], "kategoriBarang":r[5]} for r in rows]
                return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")
        
@wh_onlinekartustock_bp.route('/api/onlinekartustock', methods=['POST'])
def post_onlinekartustock():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_onlinekartustock_bp.secret_key, algorithms="HS256")
            data_json = request.json
            kodeBarang = data_json.get('kodeBarang')
            tanggalAwal = data_json.get('tanggalAwal')
            tanggalAkhir = data_json.get('tanggalAkhir')

            query = f"""
            DECLARE @kodeBarang NVARCHAR(255) = %s
            DECLARE @tanggalAwal DATETIME = %s
            DECLARE @tanggalAkhir DATETIME = %s

            SELECT Tanggal, NoRef, KodeBarang, Keterangan, QtyIn, QtyOut,
                   SUM(QtyIn + QtyOut) OVER (ORDER BY Tanggal, NoRef) AS Saldo,
                   (SELECT ISNULL(SatuanIndo, '') FROM dbo.wh_master_barang WHERE KodeBarang = @kodeBarang) AS Unit,
                   (SELECT ISNULL(KategoriBarang, '') FROM dbo.wh_master_barang WHERE KodeBarang = @kodeBarang) AS KategoriBarang
            FROM (
                SELECT sb.TanggalSaldoAwal AS Tanggal, CAST('' AS NVARCHAR(255)) AS NoRef, sb.KodeBarang, 'Saldo Awal' AS Keterangan,
                       sb.JumlahSaldoAwal +
                       ISNULL((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = sb.KodeBarang AND TanggalMasukBarang < @tanggalAwal), 0) +
                       ISNULL((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = sb.KodeBarang AND TanggalKeluarBarang < @tanggalAwal), 0) +
                       ISNULL((SELECT SUM(CASE WHEN Jumlah >= 0 THEN Jumlah ELSE 0 END) FROM dbo.wh_barang_adjustment WHERE KodeBarang = sb.KodeBarang AND TanggalAdjustment < @tanggalAwal), 0) +
                       ISNULL((SELECT SUM(CASE WHEN Jumlah < 0 THEN Jumlah ELSE 0 END) FROM dbo.wh_barang_adjustment WHERE KodeBarang = sb.KodeBarang AND TanggalAdjustment < @tanggalAwal), 0) AS QtyIn,
                       0 AS QtyOut
                FROM dbo.wh_stock_barang sb WHERE sb.KodeBarang = @kodeBarang
                UNION ALL
                SELECT TanggalMasukBarang, CAST(LTRIM(RTRIM(NoBon)) AS NVARCHAR(255)), KodeBarang, 'Masuk - ' + (SELECT ISNULL(NamaBarangIndo, '') FROM dbo.wh_master_barang WHERE KodeBarang = wh_mutasi_barang_masuk.KodeBarang), SUM(Jumlah), 0
                FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = @kodeBarang AND TanggalMasukBarang BETWEEN @tanggalAwal AND @tanggalAkhir
                GROUP BY TanggalMasukBarang, LTRIM(RTRIM(NoBon)), KodeBarang
                UNION ALL
                SELECT TanggalKeluarBarang, CAST(LTRIM(RTRIM(NoBon)) AS NVARCHAR(255)), KodeBarang, 'Keluar - ' + (SELECT ISNULL(NamaBarangIndo, '') FROM dbo.wh_master_barang WHERE KodeBarang = wh_mutasi_barang_keluar.KodeBarang), 0, SUM(Jumlah)
                FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = @kodeBarang AND TanggalKeluarBarang BETWEEN @tanggalAwal AND @tanggalAkhir
                GROUP BY TanggalKeluarBarang, LTRIM(RTRIM(NoBon)), KodeBarang
                UNION ALL
                SELECT TanggalAdjustment, CAST(NoRef AS NVARCHAR(255)), KodeBarang, CASE WHEN Jumlah = 0 THEN 'Adjust Return - ' ELSE 'Adjustment - ' END + (SELECT ISNULL(NamaBarangIndo, '') FROM dbo.wh_master_barang WHERE KodeBarang = wh_barang_adjustment.KodeBarang), CASE WHEN Jumlah < 0 THEN 0 ELSE Jumlah END, CASE WHEN Jumlah >= 0 THEN 0 ELSE Jumlah END
                FROM dbo.wh_barang_adjustment WHERE KodeBarang = @kodeBarang AND TanggalAdjustment BETWEEN @tanggalAwal AND @tanggalAkhir
            ) AS subquery ORDER BY Tanggal, NoRef
            """
            with get_db_cursor() as cursor:
                cursor.execute(query, (kodeBarang, tanggalAwal, tanggalAkhir))
                rows = cursor.fetchall()
                data = []
                for row in rows:
                    data.append({
                        'tanggal': format_dmy(row[0]), 'noRef': row[1], 'kodeBarang': row[2], 'keterangan': row[3],
                        'qtyIn': '{:.1f}'.format(float(row[4])) if float(row[4]) % 1 != 0 else '{:.0f}'.format(float(row[4])),
                        'qtyOut': '{:.1f}'.format(float(row[5])) if float(row[5]) % 1 != 0 else '{:.0f}'.format(float(row[5])),
                        'saldo': '{:.1f}'.format(float(row[6])) if float(row[6]) % 1 != 0 else '{:.0f}'.format(float(row[6])),
                        'unit': row[7], 'kategoriBarang': row[8]
                    })
                return jsonify({'data': data})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")
    
@wh_onlinekartustock_bp.route('/api/spesial/onlinekartustock', methods=['POST'])
def post_onlinekartustockspesial():
    try:
        data_json = request.json
        kodeBarang = data_json.get('kodeBarang')
        tanggalAwal = data_json.get('tanggalAwal')
        tanggalAkhir = data_json.get('tanggalAkhir')

        query = f"""
        DECLARE @kodeBarang NVARCHAR(255) = %s
        DECLARE @tanggalAwal DATETIME = %s
        DECLARE @tanggalAkhir DATETIME = %s

        SELECT Tanggal, NoRef, KodeBarang, Keterangan, QtyIn, QtyOut,
               SUM(QtyIn + QtyOut) OVER (ORDER BY Tanggal, NoRef) AS Saldo,
               (SELECT ISNULL(SatuanIndo, '') FROM dbo.wh_master_barang WHERE KodeBarang = @kodeBarang) AS Unit,
               (SELECT ISNULL(KategoriBarang, '') FROM dbo.wh_master_barang WHERE KodeBarang = @kodeBarang) AS KategoriBarang
        FROM (
            SELECT sb.TanggalSaldoAwal AS Tanggal, CAST('' AS NVARCHAR(255)) AS NoRef, sb.KodeBarang, 'Saldo Awal - ' + (SELECT ISNULL(NamaBarangIndo, '') FROM dbo.wh_master_barang WHERE KodeBarang = sb.KodeBarang) AS Keterangan,
                   sb.JumlahSaldoAwal +
                   ISNULL((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = sb.KodeBarang AND TanggalMasukBarang < @tanggalAwal), 0) +
                   ISNULL((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = sb.KodeBarang AND TanggalKeluarBarang < @tanggalAwal), 0) AS QtyIn,
                   0 AS QtyOut
            FROM dbo.wh_stock_barang sb WHERE sb.KodeBarang = @kodeBarang
            UNION ALL
            SELECT TanggalMasukBarang, CAST(NoBon AS NVARCHAR(255)), KodeBarang, 'Masuk - ' + (SELECT ISNULL(NamaBarangIndo, '') FROM dbo.wh_master_barang WHERE KodeBarang = wh_mutasi_barang_masuk.KodeBarang), SUM(Jumlah), 0
            FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = @kodeBarang AND TanggalMasukBarang BETWEEN @tanggalAwal AND @tanggalAkhir
            GROUP BY TanggalMasukBarang, NoBon, KodeBarang
            UNION ALL
            SELECT TanggalKeluarBarang, CAST(NoBon AS NVARCHAR(255)), KodeBarang, 'Keluar - ' + (SELECT ISNULL(NamaBarangIndo, '') FROM dbo.wh_master_barang WHERE KodeBarang = wh_mutasi_barang_keluar.KodeBarang), 0, SUM(Jumlah)
            FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = @kodeBarang AND TanggalKeluarBarang BETWEEN @tanggalAwal AND @tanggalAkhir
            GROUP BY TanggalKeluarBarang, NoBon, KodeBarang
            UNION ALL
            SELECT TanggalAdjustment, CAST(NoRef AS NVARCHAR(255)), KodeBarang, CASE WHEN Jumlah = 0 THEN 'Adjust Return - ' ELSE 'Adjust Out - ' END + (SELECT ISNULL(NamaBarangIndo, '') FROM dbo.wh_master_barang WHERE KodeBarang = wh_barang_adjustment.KodeBarang), CASE WHEN Jumlah < 0 THEN 0 ELSE Jumlah END, CASE WHEN Jumlah >= 0 THEN 0 ELSE Jumlah END
            FROM dbo.wh_barang_adjustment WHERE KodeBarang = @kodeBarang AND TanggalAdjustment BETWEEN @tanggalAwal AND @tanggalAkhir
        ) AS subquery ORDER BY Tanggal, NoRef
        """
        with get_db_cursor() as cursor:
            cursor.execute(query, (kodeBarang, tanggalAwal, tanggalAkhir))
            rows = cursor.fetchall()
            data = []
            for row in rows:
                data.append({
                    'tanggal': format_dmy(row[0]), 'noRef': row[1], 'kodeBarang': row[2], 'keterangan': row[3],
                    'qtyIn': '{:.1f}'.format(float(row[4])) if float(row[4]) % 1 != 0 else '{:.0f}'.format(float(row[4])),
                    'qtyOut': '{:.1f}'.format(float(row[5])) if float(row[5]) % 1 != 0 else '{:.0f}'.format(float(row[5])),
                    'saldo': '{:.1f}'.format(float(row[6])) if float(row[6]) % 1 != 0 else '{:.0f}'.format(float(row[6])),
                    'unit': row[7], 'kategoriBarang': row[8]
                })
            return jsonify({'data': data})
    except Exception as e:
        return jsonify({"error": str(e)})