from flask import Flask, request, redirect, render_template, Blueprint, jsonify, make_response
import jwt
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY
from .utils import format_indo_date, format_dmy
from datetime import datetime
from werkzeug.utils import secure_filename
import os
import mysql.connector

wh_receivebarang_bp = Blueprint("wh_receivebarang_bp", __name__)
wh_receivebarang_bp.secret_key = SECRET_KEY

@wh_receivebarang_bp.route('/tambah_dokumen', methods=['POST'])
def post_dokumen():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_receivebarang_bp.secret_key, algorithms="HS256")
            idEdit = request.form.get("idEdit")
            namaDokumen = request.form.get("namaDokumen")
            nomorAju = request.form.get("nomorAju")

            dokInvoice = request.files.get("dokInvoice")
            dokSuratjalan = request.files.get("dokSuratJalan")
            dokPackinglist = request.files.get("dokPackingList")
            dokBc = request.files.get("dokBc")
            dokSPPB = request.files.get("dokSPPB")

            folder = 'static/dokumen'

            with get_db_cursor() as cursor:
                cursor.execute("""
                    SELECT DokInvoice, DokSuratJalan, DokPackingList, DokBc, DokSppb
                    FROM dbo.wh_receive_barang
                    WHERE Id = %s
                """, (idEdit,))
                existing_data = cursor.fetchone()

                existing_invoice_url = existing_data[0] if existing_data else None
                existing_surat_jalan_url = existing_data[1] if existing_data else None
                existing_packing_list_url = existing_data[2] if existing_data else None
                existing_bc_url = existing_data[3] if existing_data else None
                existing_sppb_url = existing_data[4] if existing_data else None

                file_path_invoice = save_uploaded_file(dokInvoice, folder, dokInvoice.filename, namaDokumen, "INVOICE") if dokInvoice else existing_invoice_url
                file_path_surat_jalan = save_uploaded_file(dokSuratjalan, folder, dokSuratjalan.filename, namaDokumen, "SURAT JALAN") if dokSuratjalan else existing_surat_jalan_url
                file_path_packing_list = save_uploaded_file(dokPackinglist, folder, dokPackinglist.filename, namaDokumen, "PACKING LIST") if dokPackinglist else existing_packing_list_url
                file_path_bc = save_uploaded_file(dokBc, folder, dokBc.filename, namaDokumen, "BC") if dokBc else existing_bc_url
                file_path_sppb = save_uploaded_file(dokSPPB, folder, dokSPPB.filename, namaDokumen, "SPPB") if dokSPPB else existing_sppb_url

                status = 'READY' if dokSPPB else 'PENDING'
                
                if dokSPPB and nomorAju:
                    cursor.execute("UPDATE dbo.wh_receive_barang SET NomorAju = %s WHERE Id = %s", (nomorAju, idEdit))

                cursor.execute("""
                    UPDATE dbo.wh_receive_barang 
                    SET Status = %s, DokInvoice = %s, DokSuratJalan = %s, DokPackingList = %s, DokBc = %s, DokSppb = %s
                    WHERE Id = %s
                """, (status, file_path_invoice, file_path_surat_jalan, file_path_packing_list, file_path_bc, file_path_sppb, idEdit))

            return 'Data berhasil ditambahkan'
        except Exception as e:
            print(f"Error: {e}")
            return redirect("/login")
    return redirect("/login")

def save_uploaded_file(file, folder, filename, namaDokumen, jenisDokumen):
    if file:
        filename = secure_filename(filename)
        file_extension = os.path.splitext(filename)[1]
        new_filename = f"{namaDokumen}_{jenisDokumen}{file_extension}"
        file_path = os.path.join(folder, new_filename)
        if not os.path.exists(folder):
            os.makedirs(folder)
        file.save(file_path)
        file_url = request.host_url + os.path.join('static', 'dokumen', new_filename).replace('\\', '/')
        return file_url
    return None

@wh_receivebarang_bp.route("/receive_barang")
def receive_barang():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_receivebarang_bp.secret_key, algorithms="HS256")
            html_content = render_template("controlpagehtml/wh_receive_barang.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], menu='deptpr', submenu='receive_barang', titlePage='Receive Barang')
            response = make_response(html_content)
            response.headers["Content-Length"] = str(len(html_content))
            return response
        except Exception:
            return redirect("/login")
    return redirect("/login")

def get_nomor_daftar_from_mysql(nomor_aju):
    if not nomor_aju: return None
    try:
        connection_mysql = mysql.connector.connect(
            host='192.17.17.201',
            user='tungcia',
            password='@#%&!itTCT5613288',
            database='tpbdb'
        )
        cursor_mysql = connection_mysql.cursor()
        query = "SELECT NOMOR_DAFTAR FROM TPB_HEADER WHERE NOMOR_AJU = %s"
        cursor_mysql.execute(query, (nomor_aju,))
        result = cursor_mysql.fetchone()
        cursor_mysql.close()
        connection_mysql.close()
        return result[0] if result else None
    except Exception as e:
        print(f"MySQL Error: {e}")
        return None

@wh_receivebarang_bp.route('/api/dataallrcbarang', methods=['GET'])
def get_dataallrcbarang():
    token = request.cookies.get("token")
    if token:
        try:
            data_token = jwt.decode(token, wh_receivebarang_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("SELECT rb.Id, rb.NomorPr, rb.TanggalReceive, rb.NoBpb, rb.KodeBarang, mb.NamaBarangIndo, rb.QtyTerima, mb.SatuanIndo, rb.Supplier, rb.Keterangan, rb.DokInvoice, rb.DokSuratJalan, rb.DokPackingList, rb.DokBc, rb.DokSppb, rb.Status, rb.UserInput, rb.NomorAju, mb.KategoriBarang FROM dbo.wh_receive_barang rb LEFT JOIN dbo.wh_master_barang mb ON mb.KodeBarang = rb.KodeBarang ORDER BY rb.Id DESC")
                rows = cursor.fetchall()
                data = []
                for row in rows:
                    nomor_daftar = get_nomor_daftar_from_mysql(row[17])
                    data.append({
                        "id": row[0], "nomorPr": row[1], "tanggalReceive": format_dmy(row[2]) if row[2] else "",
                        "noBpb": row[3], "kodeBarang": row[4], "namaBarang": row[5], "qtyTerima": row[6],
                        "satuan": row[7], "supplier": row[8], "keterangan": row[9], "dokInvoice": row[10],
                        "dokSuratJalan": row[11], "dokPackingList": row[12], "dokBc": row[13], "dokSppb": row[14],
                        "status": row[15], "userInput": row[16], "nomorDaftar": nomor_daftar, "kategoriBarang": row[18]
                    })
                return jsonify(data)
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_receivebarang_bp.route('/api/dataallrcbarang/<int:id>', methods=['GET'])
def get_datarcbarang(id):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_receivebarang_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("SELECT rb.Id, rb.NomorPr, rb.TanggalReceive, rb.NoBpb, rb.KodeBarang, mb.NamaBarangIndo, rb.QtyTerima, mb.SatuanIndo, rb.Supplier, rb.Keterangan, rb.DokInvoice, rb.DokSuratJalan, rb.DokPackingList, rb.DokBc, rb.DokSppb, rb.Status, rb.UserInput FROM dbo.wh_receive_barang rb LEFT JOIN dbo.wh_master_barang mb ON mb.KodeBarang = rb.KodeBarang WHERE rb.Id = %s", (id,))
                rows = cursor.fetchall()
                data = []
                for row in rows:
                    data.append({
                        "id": row[0], "nomorPr": row[1], "tanggalReceive": format_dmy(row[2]) if row[2] else "",
                        "noBpb": row[3], "kodeBarang": row[4], "namaBarang": row[5], "qtyTerima": row[6],
                        "satuan": row[7], "supplier": row[8], "keterangan": row[9], "dokInvoice": row[10],
                        "dokSuratJalan": row[11], "dokPackingList": row[12], "dokBc": row[13], "dokSppb": row[14],
                        "status": row[15], "userInput": row[16]
                    })
                return jsonify(data)
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_receivebarang_bp.route('/api/dokrcbarang/<int:id>', methods=['GET'])
def get_dokrcbarang(id):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_receivebarang_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("SELECT RIGHT(rb.NomorPr, 4) + '-' + REPLACE(rb.NoBpb, '/', '.') + '-' + rb.KodeBarang + '-' + rb.Supplier AS NamaDokumen, rb.DokInvoice, rb.DokSuratJalan, rb.DokPackingList, rb.DokBc, rb.DokSppb FROM dbo.wh_receive_barang rb WHERE rb.Id = %s", (id,))
                row = cursor.fetchone()
                if row:
                    return jsonify({"namaDokumen": row[0], "dokInvoice": row[1], "dokSuratJalan": row[2], "dokPackingList": row[3], "dokBc": row[4], "dokSppb": row[5]})
                return jsonify({})
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_receivebarang_bp.route('/proses_tambah_data_rc', methods=['POST'])
def post_proses_tambah_data_rc():
    token = request.cookies.get("token")
    if token:
        try:
            data_token = jwt.decode(token, wh_receivebarang_bp.secret_key, algorithms="HS256")
            json_data = request.get_json()
            with get_db_cursor() as cursor:
                # Ambil MAX(Id) sekali saja sebelum loop
                cursor.execute("SELECT COALESCE(MAX(Id), 0) FROM dbo.wh_receive_barang WITH (UPDLOCK, HOLDLOCK)")
                current_max_id = cursor.fetchone()[0]

                for rc_data in json_data:
                    current_max_id += 1
                    # Parse date string robustly
                    def parse_date(date_str):
                        if not date_str:
                            return datetime.now()
                        for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y", "%d/%m/%Y", "%Y/%m/%d"):
                            try:
                                return datetime.strptime(date_str, fmt)
                            except ValueError:
                                continue
                        return datetime.now()

                    tgl_rc = parse_date(rc_data.get('tanggalReceive'))

                    cursor.execute("INSERT INTO dbo.wh_receive_barang (Id, TanggalReceive, NoBpb, KodeBarang, QtyTerima, Supplier, Status, NomorPr, Keterangan, UserInput) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                                (current_max_id, tgl_rc, rc_data['noReceive'], rc_data['kodeBarang'], rc_data['qtyTerima'], rc_data['supplier'], "PENDING", rc_data['noPr'], rc_data['keterangan'], data_token['nama_lengkap']))
                    
                    cursor.execute("UPDATE dbo.wh_pr_barang SET STATUS = %s WHERE NomorPr = %s AND KodeBarang = %s",
                                (rc_data['status'], rc_data['noPr'], rc_data['kodeBarang']))
            return jsonify({"status": "Data berhasil ditambahkan!"})
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"error": str(e)}), 500
    return redirect("/login")
