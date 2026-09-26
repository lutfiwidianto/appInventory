from flask import Flask, request, redirect, render_template, Blueprint, jsonify, url_for, make_response
import jwt
import traceback
from config.database import get_db_cursor 
from config.secretKey import SECRET_KEY
from urllib.parse import quote

wh_masterbarang_bp = Blueprint("wh_masterbarang_bp", __name__)
wh_masterbarang_bp.secret_key = SECRET_KEY

@wh_masterbarang_bp.route('/autocomplete-namabarang/<term>', methods=['GET'])
def autocomplete(term):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_masterbarang_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                query = "SELECT KodeBarang, NamaBarangIndo FROM dbo.wh_master_barang WHERE NamaBarangIndo LIKE %s OR KodeBarang LIKE %s"
                cursor.execute(query, (f"%{term}%", f"%{term}%"))
                rows = cursor.fetchall()
                autocomplete_list = [row[0] + ' | ' + ' ' + row[1] for row in rows]
                return jsonify({"results": autocomplete_list})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_masterbarang_bp.route("/masterbarang")
def masterbarang():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_masterbarang_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                query = "SELECT URAIAN FROM menu_helper WHERE Jenis='GL CLASS' ORDER BY URAIAN ASC;"
                cursor.execute(query)
                query_result = cursor.fetchall()

            html_content = render_template("controlpagehtml/wh_masterbarang.html",
                                           namalengkap=data["nama_lengkap"],
                                           username=data["sub"],
                                           level_user=data["level_user"],
                                           menu='deptwh',
                                           submenu='masterbarang',
                                           titlePage='Master Barang',
                                           select_option=query_result)
            response = make_response(html_content)
            response.headers["Content-Length"] = str(len(html_content))
            return response
        except Exception:
            return redirect("/login")
    return redirect("/login")

@wh_masterbarang_bp.route('/autocomplete-adjnoref', methods=['GET'])
def autocomplete_adjnoref():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_masterbarang_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                query = "SELECT COALESCE( ( SELECT TOP 1 CAST(SUBSTRING(NoRef, LEN(NoRef) - CHARINDEX('/', REVERSE(NoRef)) + 2, LEN(NoRef)) AS INT) + 1 FROM tct_inventory.dbo.wh_barang_adjustment WHERE NoRef LIKE '%%Adj/GTCT/' + RIGHT('00' + CAST(MONTH(GETDATE()) AS VARCHAR(2)), 2) + '%%' ORDER BY id DESC ), 1 ) AS NomorAdj;"
                cursor.execute(query)
                result = cursor.fetchone()
                return jsonify({"jumlahData": result[0] if result else 1})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")
    
@wh_masterbarang_bp.route('/autofillitembarangmasuk/<kode_barang>/<jenis_barang>', methods=['GET'])
def autocompleteitembarangmasuk(kode_barang, jenis_barang):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_masterbarang_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                query = """
                SELECT mb.kodeBarang, mb.NamaBarangIndo, mb.SatuanIndo, mb.KategoriBarang,
                    ISNULL((SELECT CAST(COALESCE(gs.Saldo_Akhir, 0) AS DECIMAL(18, 1)) FROM dbo.V_AllGlobalStock gs WHERE gs.KodeBarang = mb.KodeBarang), 0) AS Saldo_Akhir
                FROM dbo.wh_master_barang mb
                WHERE mb.KodeBarang = %s AND mb.JenisBarang = %s
                """
                cursor.execute(query, (kode_barang, jenis_barang))
                rows = cursor.fetchall()
                results = [{"KodeBarang": r[0], "NamaBarangIndo": r[1], "SatuanIndo": r[2], "KategoriBarang": r[3], "Saldo_Akhir": float(r[4] or 0)} for r in rows]
                return jsonify({"results": results})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_masterbarang_bp.route('/autofillitembarangkeluar/<kode_barang>/<jenis_barang>', methods=['GET'])
def autocompleteitembarangkeluar(kode_barang, jenis_barang):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_masterbarang_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                query = "SELECT v.KodeBarang, v.NamaBarangIndo, v.SatuanIndo, mb.KategoriBarang, v.Saldo_Akhir FROM tct_inventory.dbo.v_stock_saldo v INNER JOIN tct_inventory.dbo.wh_master_barang mb ON v.KodeBarang = mb.KodeBarang WHERE v.KodeBarang = %s AND mb.JenisBarang = %s"
                cursor.execute(query, (kode_barang, jenis_barang))
                rows = cursor.fetchall()
                results = [{"KodeBarang": r[0], "NamaBarangIndo": r[1], "SatuanIndo": r[2], "KategoriBarang": r[3], "Saldo_Akhir": float(r[4] or 0)} for r in rows]
                return jsonify({"results": results})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_masterbarang_bp.route('/autofilliprbarang/<kode_barang>', methods=['GET'])
def autocompleteprbarang(kode_barang):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_masterbarang_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                query = "SELECT mb.kodeBarang, mb.NamaBarangIndo, mb.SatuanIndo FROM dbo.wh_master_barang mb WHERE mb.KodeBarang = %s"
                cursor.execute(query, (kode_barang,))
                rows = cursor.fetchall()
                results = [{'KodeBarang': r[0], 'NamaBarangIndo': r[1], 'SatuanIndo': r[2]} for r in rows]
                return jsonify({"results": results})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_masterbarang_bp.route('/api/datamasterbarang', methods=['GET'])
def get_datamasterbarang():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_masterbarang_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("SELECT * FROM dbo.wh_master_barang ORDER BY ID DESC")            
                rows = cursor.fetchall()
                data = [{"id": r[0], "kodeBarang": r[1], "namabarangIdn": r[2], "namabarangMand": r[3], "satuan":r[4], "rak":r[6], "kategoriBarang":r[7], "jenisBarang": r[8], "Class":r[11]} for r in rows]
                return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_masterbarang_bp.route('/api/datamasterbarang', methods=['POST'])
def add_datamasterbarang():
    token = request.cookies.get("token")
    if not token: return redirect("/login")
    try:
        jwt.decode(token, wh_masterbarang_bp.secret_key, algorithms="HS256")
        req_data = request.get_json()
        with get_db_cursor() as cursor:
            # Check existence
            cursor.execute("SELECT COUNT(*) FROM dbo.wh_master_barang WHERE KodeBarang = %s", (req_data['kodeBarang'],))
            if cursor.fetchone()[0] > 0:
                return jsonify({"message": "Kode barang sudah ada"}), 400

            cursor.execute("""
                INSERT INTO dbo.wh_master_barang 
                (KodeBarang, NamaBarangIndo, NamabarangMand, SatuanIndo, SatuanMand, Racking, KategoriBarang, JenisBarang, TanggalCreated, UserInput, GlClass) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (req_data['kodeBarang'], req_data['namaBarangIndo'], req_data['namaBarangMand'], req_data['satuanIndo'], req_data['satuanMand'], req_data['racking'], req_data['kategoriBarang'], req_data['jenisBarang'], req_data['TanggalCreated'], req_data['userInput'], req_data['classBarang']))

            cursor.execute("INSERT INTO dbo.wh_stock_barang (KodeBarang, TanggalSaldoAwal, JumlahSaldoAwal, JumlahSaldoAkhir) VALUES (%s, GETDATE(), 0, NULL)", (req_data['kodeBarang'],))
        return jsonify({"message": "Data berhasil ditambahkan"}), 201
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@wh_masterbarang_bp.route('/api/datamasterbarang/<int:id>', methods=['GET'])
def get_datamasterbarangid(id):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_masterbarang_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("SELECT Id, KodeBarang, NamaBarangIndo, NamabarangMand, SatuanIndo, SatuanMand, Racking, KategoriBarang, JenisBarang, GlClass FROM dbo.wh_master_barang WHERE Id = %s", (id,))
                row = cursor.fetchone()
                if row:
                    return jsonify({'id': row[0], 'kodeBarang': row[1], 'namaBarangIndo': row[2], 'namaBarangMand': row[3], 'satuanIndo': row[4], 'satuanMand': row[5], 'racking': row[6] or '', 'kategoriBarang': row[7], 'jenisBarang': row[8], 'classBarang': row[9]})
                return jsonify({"error": "Data not found"})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_masterbarang_bp.route('/api/datamasterbarang/<int:id>', methods=['PUT'])
def update_datamasterbarang(id):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_masterbarang_bp.secret_key, algorithms="HS256")
            req = request.json
            with get_db_cursor() as cursor:
                cursor.execute("SELECT KodeBarang FROM dbo.wh_master_barang WHERE Id = %s", (id,))
                old_kode = cursor.fetchone()
                if not old_kode: return jsonify({"message": "Not found"}), 404
                
                cursor.execute("UPDATE dbo.wh_master_barang SET KodeBarang = %s, NamaBarangIndo = %s, NamabarangMand = %s, SatuanIndo = %s, SatuanMand = %s, Racking = %s, KategoriBarang = %s, JenisBarang = %s, GlClass = %s WHERE Id = %s",
                               (req['kodeBarang'], req['namaBarangIndo'], req['namaBarangMand'], req['satuanIndo'], req['satuanMand'], req['racking'], req['kategoriBarang'], req['jenisBarang'], req['classBarang'], id))
                
                cursor.execute("UPDATE dbo.wh_stock_barang SET KodeBarang = %s WHERE KodeBarang = %s", (req['kodeBarang'], old_kode[0]))
            return jsonify({"message": "Data berhasil diubah"})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")
