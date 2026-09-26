from flask import Flask, request, redirect, render_template, Blueprint, jsonify, url_for, make_response
import jwt
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY
from .utils import format_indo_date, format_indo_datetime, format_dmy, parse_date
import datetime

wh_pmcmutasibarangkeluar_bp = Blueprint("wh_pmcmutasibarangkeluar_bp", __name__)
wh_pmcmutasibarangkeluar_bp.config = {
    "MAX_CONTENT_LENGTH": 100 * 1024 * 1024  # 100 megabytes
}
wh_pmcmutasibarangkeluar_bp.secret_key = SECRET_KEY

@wh_pmcmutasibarangkeluar_bp.errorhandler(Exception)
def handle_error(error):
    response = jsonify({'error': str(error)})
    response.status_code = 500
    return response

@wh_pmcmutasibarangkeluar_bp.route("/pmcmutasibarangkeluar")
def pmcmutasibarangkeluar():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_pmcmutasibarangkeluar_bp.secret_key, algorithms="HS256")

            # Render the template and get the HTML content
            html_content = render_template("controlpagehtml/pmc_mutasibarangkeluar.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], menu='deptpmc', submenu='inputmutasi', titlePage='Mutasi Barang')

            # Calculate the content length
            content_length = len(html_content)

            # Create a response with the rendered template and set Content-Length header
            response = make_response(html_content)
            response.headers["Content-Length"] = str(content_length)

            return response

        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")
    

@wh_pmcmutasibarangkeluar_bp.route('/api/pmc/datamutasibarangkeluarnonfasilitas/<path:tgl_awal>/<path:tgl_akhir>', methods=['GET'])
def get_pmcdatamutasibarangkeluarnonfasilitas(tgl_awal, tgl_akhir):
    
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_pmcmutasibarangkeluar_bp.secret_key, algorithms="HS256")
            try:
                tgl_awal_dt = parse_date(tgl_awal)
                tgl_akhir_dt = parse_date(tgl_akhir)
                
                print(f"DEBUG PMC NON-FASILITAS: raw_awal={tgl_awal}, raw_akhir={tgl_akhir}, parsed_awal={tgl_awal_dt}, parsed_akhir={tgl_akhir_dt}")

                # Ensure we pass ISO strings for absolute reliability with SQL Server
                tgl_awal_val = tgl_awal_dt.strftime('%Y-%m-%d') if isinstance(tgl_awal_dt, datetime.datetime) else tgl_awal_dt
                tgl_akhir_val = tgl_akhir_dt.strftime('%Y-%m-%d') if isinstance(tgl_akhir_dt, datetime.datetime) else tgl_akhir_dt

                # Query data dari database
                query_nonfasilitas = """
                SELECT 
                    mbk.id,
                    mbk.TanggalKeluarBarang AS TANGGAL_KELUAR, 
                    mbk.KodeBarang AS KODE_BARANG, 
                    mb.NamaBarangIndo AS NAMA_BARANG,
                    mbk.Jumlah AS QTY_OUT, 
                    mb.SatuanIndo AS SATUAN,
                    mb.KategoriBarang AS KATEGORI,
                    mbk.NoBon AS NOMOR_BON, 
                    mbk.PicGudang AS PIC_GUDANG,
                    mbk.PenerimaBarang AS PENERIMA_BARANG,
                    mbk.Departemen AS DEPARTEMEN,
                    mbk.UserInput,
                    mbk.TglInputUser
                FROM dbo.wh_mutasi_barang_keluar mbk
                LEFT JOIN dbo.wh_master_barang mb ON mb.KodeBarang = mbk.KodeBarang
                WHERE mb.KategoriBarang = 'NON FASILITAS' 
                AND mbk.TanggalKeluarBarang BETWEEN CAST(%s AS DATE) AND CAST(%s AS DATE);
                """
                with get_db_cursor() as cursor:
                    cursor.execute(query_nonfasilitas, (tgl_awal_val, tgl_akhir_val))            
                    rows = cursor.fetchall()
                    data = []
                    for row in rows:
                        tglinput = row[12]
                        userinput = row[11]
                        proper_userinput = userinput.title() if userinput else "Unknown"
                        tglinput_text = format_indo_datetime(tglinput)
                        nomorBon = f"{row[7]}\n{tglinput_text} by : {proper_userinput}"

                        data.append({
                            "id": row[0],
                            "tanggalKeluar": format_dmy(row[1]),
                            "kodeBarang": row[2],
                            "namaBarang": row[3],
                            "qtyOut": int(row[4]) if row[4] is not None else 0,
                            "satuan": row[5],
                            "kategori": row[6],
                            "nomorBon": nomorBon,
                            "picGudang": row[8],
                            "penerimaBarang": row[9],
                            "departemen": row[10]
                        })
                    return jsonify(data)
            except Exception as e:
                print("Error:", e)
                return jsonify({"error": str(e)})
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")

@wh_pmcmutasibarangkeluar_bp.route('/api/pmc/datamutasibarangkeluarfasilitas/<path:tgl_awal>/<path:tgl_akhir>', methods=['GET'])
def get_pmcdatamutasibarangkeluarfasilitas(tgl_awal, tgl_akhir):
    
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_pmcmutasibarangkeluar_bp.secret_key, algorithms="HS256")
            try:
                tgl_awal_dt = parse_date(tgl_awal)
                tgl_akhir_dt = parse_date(tgl_akhir)

                # Ensure we pass ISO strings for absolute reliability with SQL Server
                tgl_awal_val = tgl_awal_dt.strftime('%Y-%m-%d') if isinstance(tgl_awal_dt, datetime.datetime) else tgl_awal_dt
                tgl_akhir_val = tgl_akhir_dt.strftime('%Y-%m-%d') if isinstance(tgl_akhir_dt, datetime.datetime) else tgl_akhir_dt

                # Query data dari database
                query_fasilitas = """
                SELECT 
                    mbk.id,
                    mbk.TanggalKeluarBarang AS TANGGAL_KELUAR, 
                    mbk.KodeBarang AS KODE_BARANG, 
                    mb.NamaBarangIndo AS NAMA_BARANG,
                    mbk.Jumlah AS QTY_OUT, 
                    mb.SatuanIndo AS SATUAN,
                    mb.KategoriBarang AS KATEGORI,
                    mbk.NoBon AS NOMOR_BON, 
                    mbk.PicGudang AS PIC_GUDANG,
                    mbk.PenerimaBarang AS PENERIMA_BARANG,
                    mbk.Departemen AS DEPARTEMEN,
                    mb.GlClass,
                    CASE 
                        WHEN mbk.Inputed = 1 THEN 'Inputed'
                        WHEN mbk.Inputed = 0 THEN 'On Process'
                        WHEN mbk.Inputed IS NULL THEN 'On Process'
                    END AS INPUTED,
                    mbk.UserInput,
                    mbk.TglInputUser,
                    mbk.UserUpdate
                FROM dbo.wh_mutasi_barang_keluar mbk
                LEFT JOIN dbo.wh_master_barang mb ON mb.KodeBarang = mbk.KodeBarang
                WHERE mb.KategoriBarang = 'FASILITAS'
                AND mbk.TanggalKeluarBarang BETWEEN CAST(%s AS DATE) AND CAST(%s AS DATE)
                AND mbk.KodeBarang NOT IN (
                    'PPP.TCE.01.000001', 'PPP.TCE.01.000002', 'AAA.TCL.01.000002', 'AAA.TCL.01.000003',
                    'BBC.TCL.00.000002', 'AAA.TCL.01.000001', 'BBB.TCI.00.000001', 'WIP.TCT.01.000001',
                    'BBB.TCI.00.000004', 'WIP.TCT.01.000001', 'BBB.TCI.00.000004', 'WIP.TCT.02.000003',
                    'PPP.TCE.01.000001', 'PPP.TCE.01.000002', 'AAA.TCL.01.000004', 'BBB.TCL.00.000010',
                    'BBB.TCL.00.000009', 'TTC.BBL.OD.000001', 'DDD.TCI.01.000018', 'WIP.TCT.02.000001',
                    'WIP.TCT.02.000002', 'DDD.TCI.01.000026', 'DDD.TCI.01.000009', 'DDD.TCI.01.000007',
                    'CCC.TCL.00.000069', 'DDD.TCI.01.000021', 'DDD.TCI.01.000038', 'DDD.TCI.01.000020',
                    'DDD.TCI.01.000019', 'BBB.TCL.00.000010', 'TTC.OOL.KU.000005', 'DDD.TCI.01.000027',
                    'DDD.TCI.01.000028', 'DDD.TCI.01.000023', 'DDD.TCI.01.000024', 'TTC.LLL.OD.000003',
                    'DDD.TCI.01.000033', 'DDD.TCI.01.000008', 'DDD.TCI.01.000032', 'DDD.TCI.01.000037',
                    'DDD.TCI.01.000030', 'DDD.TCI.01.000034', 'TTC.NNL.OL.000004'
                )
                ORDER BY TANGGAL_KELUAR;
                """
                with get_db_cursor() as cursor:
                    cursor.execute(query_fasilitas, (tgl_awal_val, tgl_akhir_val))            
                    rows = cursor.fetchall()
                    data = []
                    for row in rows:
                        tglinput = row[14]
                        userinput = row[13]
                        proper_userinput = userinput.title() if userinput else "Unknown"
                        tglinput_text = format_indo_datetime(tglinput)
                        nomorBon = f"{row[7]}\n{tglinput_text} by : {proper_userinput}"

                        last_part = row[7].split('/')[-1] if row[7] else ""
                        notesmartone = f"{row[10]} | {last_part}" 
                        status = f"{row[12]} by : {row[15]}" if row[15] else f"{row[12]}"

                        data.append({
                            "id": row[0],
                            "tanggalKeluar": format_dmy(row[1]),
                            "kodeBarang": row[2],
                            "namaBarang": row[3],
                            "qtyOut": int(row[4]) if row[4] is not None else 0,
                            "satuan": row[5],
                            "kategori": row[6],
                            "nomorBon": nomorBon,
                            "picGudang": row[8],
                            "penerimaBarang": row[9],
                            "departemen": row[10],
                            "GlClass": row[11],
                            "inputed": status,
                            "notesmartone" : notesmartone
                        })

                    return jsonify(data)

            except Exception as e:
                print("Error:", e)
                return jsonify({"error": str(e)})
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")
