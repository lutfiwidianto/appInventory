from flask import Flask, request, redirect, render_template, Blueprint, jsonify, make_response
import jwt
from .utils import format_indo_date
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY

wh_globalstock_bp = Blueprint("wh_globalstock_bp", __name__)
wh_globalstock_bp.secret_key = SECRET_KEY

@wh_globalstock_bp.errorhandler(Exception)
def handle_error(error):
    response = jsonify({'error': str(error)})
    response.status_code = 500
    return response

@wh_globalstock_bp.route("/globalstock")
def globalstock():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_globalstock_bp.secret_key, algorithms="HS256")
            html_content = render_template("controlpagehtml/wh_globalstock.html", username=data["sub"], level_user=data["level_user"], menu='deptwh', submenu='globalstock', titlePage='WH Global Stock')
            response = make_response(html_content)
            response.headers["Content-Length"] = str(len(html_content))
            return response
        except Exception:
            return redirect("/login")
    return redirect("/login")

@wh_globalstock_bp.route("/globalstocktrial")
def globalstocktrial():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_globalstock_bp.secret_key, algorithms="HS256")
            return render_template("controlpagehtml/wh_globalstock_trial.html", username=data["sub"], level_user=data["level_user"], menu='deptit', submenu='globalstocktrial', titlePage='Mutasi Barang')
        except Exception:
            return redirect("/login")
    return redirect("/login")

@wh_globalstock_bp.route('/api/globalstock/public', methods=['GET'])
def get_globalstock_public():
    kodeBarang = request.args.get("kodeBarang")
    query = """
        SELECT sb.KodeBarang, mb.NamaBarangIndo, sb.TanggalSaldoAwal, sb.JumlahSaldoAwal AS Saldo_Awal,
               COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = sb.KodeBarang), 0) AS QTY_IN,
               COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = sb.KodeBarang), 0) AS QTY_OUT,
               (sb.JumlahSaldoAwal + 
                COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = sb.KodeBarang), 0) + 
                COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = sb.KodeBarang), 0) + 
                COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_barang_adjustment WHERE KodeBarang = sb.KodeBarang), 0)) AS Saldo_Akhir,
               mb.SatuanIndo AS Satuan, mb.Racking, mb.KategoriBarang, mb.GlClass
        FROM dbo.wh_stock_barang sb
        LEFT JOIN dbo.wh_master_barang mb ON sb.KodeBarang = mb.KodeBarang
        WHERE sb.TanggalSaldoAwal <= GETDATE()
    """
    if kodeBarang:
        query += " AND sb.KodeBarang = %s"
    with get_db_cursor() as cursor:
        if kodeBarang: cursor.execute(query, (kodeBarang,))
        else: cursor.execute(query)
        rows = cursor.fetchall()
        
    data = []
    for row in rows:
        data.append({
            "kodeBarang": row[0], "namaBarang": row[1], "tanggalSaldoAwal": format_indo_date(row[2]),
            "saldoAwal": '{:.1f}'.format(float(row[3])) if float(row[3])%1!=0 else '{:.0f}'.format(float(row[3])),
            "qtyIn": '{:.1f}'.format(float(row[4])) if float(row[4])%1!=0 else '{:.0f}'.format(float(row[4])),
            "qtyOut": '{:.1f}'.format(float(row[5])) if float(row[5])%1!=0 else '{:.0f}'.format(float(row[5])),
            "saldoAkhir": '{:.1f}'.format(float(row[6])) if float(row[6])%1!=0 else '{:.0f}'.format(float(row[6])),
            "satuan": row[7], "racking": row[8], "kategoriBarang": row[9], "glCLass": row[10]
        })
    return jsonify(data)

@wh_globalstock_bp.route('/api/globalstock', methods=['GET'])
def get_globalstock():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_globalstock_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                query = """
                SELECT sb.KodeBarang, mb.NamaBarangIndo, sb.TanggalSaldoAwal, sb.JumlahSaldoAwal AS Saldo_Awal,
                       COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = sb.KodeBarang), 0) AS QTY_IN,
                       COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = sb.KodeBarang), 0) AS QTY_OUT,
                       (sb.JumlahSaldoAwal + 
                        COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = sb.KodeBarang), 0) + 
                        COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = sb.KodeBarang), 0) + 
                        COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_barang_adjustment WHERE KodeBarang = sb.KodeBarang), 0)) AS Saldo_Akhir,
                       mb.SatuanIndo AS Satuan, mb.Racking, mb.KategoriBarang, mb.GlClass
                FROM dbo.wh_stock_barang sb
                LEFT JOIN dbo.wh_master_barang mb ON sb.KodeBarang = mb.KodeBarang
                WHERE sb.TanggalSaldoAwal <= GETDATE()
                """
                cursor.execute(query)
                rows = cursor.fetchall()
            data = []
            for row in rows:
                data.append({
                    "kodeBarang": row[0], "namaBarang": row[1], "tanggalSaldoAwal": format_indo_date(row[2]),
                    "saldoAwal": '{:.1f}'.format(float(row[3])) if float(row[3])%1!=0 else '{:.0f}'.format(float(row[3])),
                    "qtyIn": '{:.1f}'.format(float(row[4])) if float(row[4])%1!=0 else '{:.0f}'.format(float(row[4])),
                    "qtyOut": '{:.1f}'.format(float(row[5])) if float(row[5])%1!=0 else '{:.0f}'.format(float(row[5])),
                    "saldoAkhir": '{:.1f}'.format(float(row[6])) if float(row[6])%1!=0 else '{:.0f}'.format(float(row[6])),
                    "satuan": row[7], "racking": row[8], "kategoriBarang": row[9], "glCLass": row[10]
                })
            return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_globalstock_bp.route('/api/globalstockspearpart/<kode_barang>', methods=['GET'])
def get_globalstockspearpart(kode_barang):
    try:
        with get_db_cursor() as cursor:
            query = """
            SELECT sb.KodeBarang, mb.NamaBarangIndo, sb.TanggalSaldoAwal, sb.JumlahSaldoAwal AS Saldo_Awal,
                   COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = sb.KodeBarang), 0) AS QTY_IN,
                   COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = sb.KodeBarang), 0) AS QTY_OUT,
                   (sb.JumlahSaldoAwal + 
                    COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = sb.KodeBarang), 0) + 
                    COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = sb.KodeBarang), 0) + 
                    COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_barang_adjustment WHERE KodeBarang = sb.KodeBarang), 0)) AS Saldo_Akhir,
                   mb.SatuanIndo AS Satuan, mb.Racking, mb.KategoriBarang, mb.GlClass
            FROM dbo.wh_stock_barang sb
            LEFT JOIN dbo.wh_master_barang mb ON sb.KodeBarang = mb.KodeBarang
            WHERE sb.TanggalSaldoAwal <= GETDATE() and mb.GlClass = 'MESIN & SPARE PART' and sb.KodeBarang = %s
            """
            cursor.execute(query, (kode_barang,))
            rows = cursor.fetchall()
        data = [{"kodeBarang": r[0], "namaBarang": r[1], "tanggalSaldoAwal": r[2].strftime("%d %B %Y"), "saldoAwal": f'{r[3]:.1f}', "qtyIn": f'{r[4]:.1f}', "qtyOut": f'{r[5]:.1f}', "saldoAkhir": f'{r[6]:.0f}', "satuan": r[7], "racking": r[8], "kategoriBarang": r[9], "glCLass": r[10]} for r in rows]
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)})

@wh_globalstock_bp.route('/api/stockspearpart', methods=['GET'])
def get_stockspearpart():
    try:
        with get_db_cursor() as cursor:
            query = """
            SELECT sb.KodeBarang, mb.NamaBarangIndo, sb.TanggalSaldoAwal, sb.JumlahSaldoAwal AS Saldo_Awal,
                   COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = sb.KodeBarang), 0) AS QTY_IN,
                   COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = sb.KodeBarang), 0) AS QTY_OUT,
                   (sb.JumlahSaldoAwal + 
                    COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = sb.KodeBarang), 0) + 
                    COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = sb.KodeBarang), 0) + 
                    COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_barang_adjustment WHERE KodeBarang = sb.KodeBarang), 0)) AS Saldo_Akhir,
                   mb.SatuanIndo AS Satuan, mb.Racking, mb.KategoriBarang, mb.GlClass
            FROM dbo.wh_stock_barang sb
            LEFT JOIN dbo.wh_master_barang mb ON sb.KodeBarang = mb.KodeBarang
            WHERE sb.TanggalSaldoAwal <= GETDATE() and mb.GlClass = 'MESIN & SPARE PART'
            """
            cursor.execute(query)
            rows = cursor.fetchall()
        data = [{"kodeBarang": r[0], "namaBarang": r[1], "tanggalSaldoAwal": r[2].strftime("%d %B %Y"), "saldoAwal": f'{r[3]:.1f}', "qtyIn": f'{r[4]:.1f}', "qtyOut": f'{r[5]:.1f}', "saldoAkhir": f'{r[6]:.0f}', "satuan": r[7], "racking": r[8], "kategoriBarang": r[9], "glCLass": r[10]} for r in rows]
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)})