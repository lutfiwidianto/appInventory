from flask import Flask, request, Blueprint, send_file, jsonify, redirect, render_template, make_response
from openpyxl import load_workbook
import subprocess
from io import BytesIO
import jwt
import os
from PyPDF2 import PdfMerger
from config.secretKey import SECRET_KEY
from config.database import get_db_cursor

wh_invoice_bp = Blueprint("wh_invoice_bp", __name__)
wh_invoice_bp.secret_key = SECRET_KEY

@wh_invoice_bp.route('/generate_combinedinvmasuk_pdf', methods=['POST'])
def generate_combinedinvmasuk_pdf():
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_invoice_bp.secret_key, algorithms="HS256")
            req_data = request.json
            start_date = req_data.get('start_date')
            end_date = req_data.get('end_date')

            with get_db_cursor() as cursor:
                query_bon = "SELECT NoBon FROM dbo.[wh_mutasi_barang_masuk] WHERE TanggalmasukBarang BETWEEN %s AND %s GROUP BY NoBon"
                cursor.execute(query_bon, (start_date, end_date))
                nomor_bon_list = [row[0] for row in cursor.fetchall()]

                pdf_merger = PdfMerger()
                template_path = r'D:\appInventory\static\inv-barang\invoice_template_bmasuk.xlsx'

                for nomor_bon in nomor_bon_list:
                    cursor.execute("SELECT id, TANGGAL_MASUK, KODE_BARANG, NAMA_BARANG_INDO, NAMA_BARANG_MAND, NOMOR_BON, QTY_IN, SATUAN, SUPLIER, KATEGORI_BARANG, TANGGAL_INPUT, CATATAN FROM dbo.[V_MutasiBarangMasuk] WHERE NOMOR_BON=%s", (nomor_bon,))
                    rows = cursor.fetchall()
                    if not rows: continue
                    
                    data = [{'TANGGAL_MASUK': r[1], 'KODE_BARANG': r[2], 'NAMA_BARANG_INDO': r[3], 'NAMA_BARANG_MAND': r[4], 'NOMOR_BON': r[5], 'QTY_IN': r[6], 'SATUAN': r[7], 'SUPLIER': r[8], 'KATEGORI_BARANG': r[9], 'TANGGAL_INPUT': r[10], 'CATATAN': r[11]} for r in rows]
                    
                    wb = load_workbook(template_path)
                    ws = wb['BMasuk']
                    for i, item in enumerate(data, start=11):
                        ws[f'B{i}'], ws[f'C{i}'], ws[f'E{i}'], ws[f'F{i}'], ws[f'G{i}'], ws[f'H{i}'], ws[f'J{i}'] = item['KODE_BARANG'], item['NAMA_BARANG_INDO'], item['NAMA_BARANG_MAND'], item['SATUAN'], item['QTY_IN'], item['SUPLIER'], item['TANGGAL_INPUT']
                        if i >= 32: break
                    
                    ws['I7'], ws['I6'], ws['A6'] = ' :   ' + data[0]['TANGGAL_MASUK'].strftime('%d-%m-%Y'), ' :   ' + data[0]['NOMOR_BON'], data[0]['KATEGORI_BARANG']
                    
                    temp_excel = os.path.join(os.path.dirname(template_path), f'temp_{nomor_bon.replace("/", "-")}.xlsx')
                    wb.save(temp_excel)
                    subprocess.run([r'C:\Program Files\LibreOffice\program\scalc.exe', '--headless', '--convert-to', 'pdf', temp_excel, '--outdir', os.path.dirname(template_path)])
                    
                    pdf_path = temp_excel.replace('.xlsx', '.pdf')
                    pdf_merger.append(pdf_path)
                    os.remove(temp_excel)
                    os.remove(pdf_path)

                combined_output = BytesIO()
                pdf_merger.write(combined_output)
                pdf_merger.close()
                combined_output.seek(0)
                return send_file(combined_output, mimetype='application/pdf', as_attachment=False, download_name='bulk_invoice_masuk.pdf')

        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_invoice_bp.route('/inv_masukbarang/<path:nomor_bon>', methods=['GET'])
def inv_masukbarang(nomor_bon):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_invoice_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("SELECT id, TANGGAL_MASUK, KODE_BARANG, NAMA_BARANG_INDO, NAMA_BARANG_MAND, NOMOR_BON, QTY_IN, SATUAN, SUPLIER, KATEGORI_BARANG, TANGGAL_INPUT, CATATAN FROM dbo.[V_MutasiBarangMasuk] WHERE NOMOR_BON=%s", (nomor_bon,))
                rows = cursor.fetchall()
                if not rows: return "Data not found", 404
                data = [{'TANGGAL_MASUK': r[1], 'KODE_BARANG': r[2], 'NAMA_BARANG_INDO': r[3], 'NAMA_BARANG_MAND': r[4], 'NOMOR_BON': r[5], 'QTY_IN': r[6], 'SATUAN': r[7], 'SUPLIER': r[8], 'KATEGORI_BARANG': r[9], 'TANGGAL_INPUT': r[10], 'CATATAN': r[11]} for r in rows]

            template_path = r'D:\appInventory\static\inv-barang\invoice_template_bmasuk.xlsx'
            wb = load_workbook(template_path)
            ws = wb['BMasuk']
            for i, item in enumerate(data, start=11):
                ws[f'B{i}'], ws[f'C{i}'], ws[f'E{i}'], ws[f'F{i}'], ws[f'G{i}'], ws[f'H{i}'], ws[f'J{i}'] = item['KODE_BARANG'], item['NAMA_BARANG_INDO'], item['NAMA_BARANG_MAND'], item['SATUAN'], item['QTY_IN'], item['SUPLIER'], item['TANGGAL_INPUT']
                if i >= 32: break
            ws['I7'], ws['I6'], ws['A6'] = ' :   ' + data[0]['TANGGAL_MASUK'].strftime('%d-%m-%Y'), ' :   ' + data[0]['NOMOR_BON'], data[0]['KATEGORI_BARANG']
            
            temp_excel = os.path.join(os.path.dirname(template_path), 'temp_single_masuk.xlsx')
            wb.save(temp_excel)
            subprocess.run([r'C:\Program Files\LibreOffice\program\scalc.exe', '--headless', '--convert-to', 'pdf', temp_excel, '--outdir', os.path.dirname(template_path)])
            pdf_path = temp_excel.replace('.xlsx', '.pdf')
            
            response = send_file(pdf_path, mimetype='application/pdf')
            os.remove(temp_excel)
            # We can't remove pdf_path here because send_file might still need it, but we can use a cleanup later or just leave it since it's a fixed name
            return response
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_invoice_bp.route('/generate_combinedinvkeluar_pdf', methods=['POST'])
def generate_combinedinvkeluar_pdf():
    # Similar logic for Keluar
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_invoice_bp.secret_key, algorithms="HS256")
            req_data = request.json
            with get_db_cursor() as cursor:
                cursor.execute("SELECT NoBon FROM dbo.[wh_mutasi_barang_keluar] WHERE TanggalKeluarBarang BETWEEN %s AND %s GROUP BY NoBon", (req_data.get('start_date'), req_data.get('end_date')))
                nomor_bon_list = [row[0] for row in cursor.fetchall()]
                pdf_merger = PdfMerger()
                template_path = r'D:\appInventory\static\inv-barang\invoice_template_bkeluar.xlsx'
                for nomor_bon in nomor_bon_list:
                    cursor.execute("SELECT KODE_BARANG, NAMA_BARANG_INDO, NAMA_BARANG_MAND, SATUAN, QTY_OUT * -1, PENERIMA_BARANG, TANGGAL_KELUAR, NOMOR_BON, DEPARTEMEN, CATATAN FROM dbo.V_MutasiBarangKeluar WHERE nomor_bon=%s", (nomor_bon,))
                    rows = cursor.fetchall()
                    if not rows: continue
                    data = [{'KODE_BARANG': r[0], 'NAMA_BARANG_INDO': r[1], 'NAMA_BARANG_MAND': r[2], 'SATUAN': r[3], 'QTY_OUT': r[4], 'PENERIMA_BARANG': r[5], 'TANGGAL_KELUAR': r[6], 'NOMOR_BON': r[7], 'DEPARTEMEN': r[8], 'CATATAN': r[9]} for r in rows]
                    wb = load_workbook(template_path)
                    ws = wb['BKeluar']
                    for i, item in enumerate(data, start=13):
                        ws[f'B{i}'], ws[f'C{i}'], ws[f'D{i}'], ws[f'E{i}'], ws[f'F{i}'], ws[f'G{i}'] = item['KODE_BARANG'], item['NAMA_BARANG_INDO'], item['NAMA_BARANG_MAND'], item['SATUAN'], item['QTY_OUT'], item['PENERIMA_BARANG']
                        if i >= 41: break
                    ws['F8'], ws['F9'], ws['C8'], ws['C9'], ws['A28'] = ' :   ' + data[0]['NOMOR_BON'], ' :   ' + data[0]['TANGGAL_KELUAR'].strftime('%d-%m-%Y'), ' :   GUDANG', ' :   ' + data[0]['DEPARTEMEN'], ' :   ' + data[0]['CATATAN']
                    temp_excel = os.path.join(os.path.dirname(template_path), f'temp_{nomor_bon.replace("/", "-")}.xlsx')
                    wb.save(temp_excel)
                    subprocess.run([r'C:\Program Files\LibreOffice\program\scalc.exe', '--headless', '--convert-to', 'pdf', temp_excel, '--outdir', os.path.dirname(template_path)])
                    pdf_path = temp_excel.replace('.xlsx', '.pdf')
                    pdf_merger.append(pdf_path)
                    os.remove(temp_excel)
                    os.remove(pdf_path)
                combined_output = BytesIO()
                pdf_merger.write(combined_output)
                pdf_merger.close()
                combined_output.seek(0)
                return send_file(combined_output, mimetype='application/pdf', download_name='bulk_invoice_keluar.pdf')
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_invoice_bp.route('/inv_ambilbarang/<path:nomor_bon>', methods=['GET'])
def inv_nobonkeluar(nomor_bon):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_invoice_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("SELECT KODE_BARANG, NAMA_BARANG_INDO, NAMA_BARANG_MAND, SATUAN, QTY_OUT * -1, PENERIMA_BARANG, TANGGAL_KELUAR, NOMOR_BON, DEPARTEMEN, CATATAN FROM dbo.V_MutasiBarangKeluar WHERE nomor_bon=%s", (nomor_bon,))
                rows = cursor.fetchall()
                if not rows: return "Data not found", 404
                data = [{'KODE_BARANG': r[0], 'NAMA_BARANG_INDO': r[1], 'NAMA_BARANG_MAND': r[2], 'SATUAN': r[3], 'QTY_OUT': r[4], 'PENERIMA_BARANG': r[5], 'TANGGAL_KELUAR': r[6], 'NOMOR_BON': r[7], 'DEPARTEMEN': r[8], 'CATATAN': r[9]} for r in rows]
            template_path = r'D:\appInventory\static\inv-barang\invoice_template_bkeluar.xlsx'
            wb = load_workbook(template_path)
            ws = wb['BKeluar']
            for i, item in enumerate(data, start=13):
                ws[f'B{i}'], ws[f'C{i}'], ws[f'D{i}'], ws[f'E{i}'], ws[f'F{i}'], ws[f'G{i}'] = item['KODE_BARANG'], item['NAMA_BARANG_INDO'], item['NAMA_BARANG_MAND'], item['SATUAN'], item['QTY_OUT'], item['PENERIMA_BARANG']
                if i >= 41: break
            ws['F8'], ws['F9'], ws['C8'], ws['C9'], ws['A28'] = ' :   ' + data[0]['NOMOR_BON'], ' :   ' + data[0]['TANGGAL_KELUAR'].strftime('%d-%m-%Y'), ' :   GUDANG', ' :   ' + data[0]['DEPARTEMEN'], ' Catatan 备注 : ' + data[0]['CATATAN']
            temp_excel = os.path.join(os.path.dirname(template_path), 'temp_single_keluar.xlsx')
            wb.save(temp_excel)
            subprocess.run([r'C:\Program Files\LibreOffice\program\scalc.exe', '--headless', '--convert-to', 'pdf', temp_excel, '--outdir', os.path.dirname(template_path)])
            return send_file(temp_excel.replace('.xlsx', '.pdf'), mimetype='application/pdf')
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_invoice_bp.route("/inv_ambil_barang")
def inv_ambil_barang_page():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_invoice_bp.secret_key, algorithms="HS256")
            return render_template("controlpagehtml/wh_inv_pengambilan_barang.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], menu='deptwh', submenu='receive_barang', titlePage='INV Barang Keluar')
        except Exception: return redirect("/login")
    return redirect("/login")

@wh_invoice_bp.route('/inv_ambil_barang/<path:nomor_bon>', methods=['GET'])
def inv_nobon_keluar_detail(nomor_bon):
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_invoice_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cleaned_bon = nomor_bon.strip()
                cursor.execute("SELECT id, KODE_BARANG, NAMA_BARANG_INDO, NAMA_BARANG_MAND, SATUAN, QTY_OUT * -1, PENERIMA_BARANG, TANGGAL_KELUAR, NOMOR_BON, DEPARTEMEN, CATATAN, KEGUNAAN FROM dbo.V_MutasiBarangKeluar WHERE nomor_bon = %s", (cleaned_bon,))
                rows = cursor.fetchall()
                if not rows:
                    cursor.execute("SELECT id, KODE_BARANG, NAMA_BARANG_INDO, NAMA_BARANG_MAND, SATUAN, QTY_OUT * -1, PENERIMA_BARANG, TANGGAL_KELUAR, NOMOR_BON, DEPARTEMEN, CATATAN, KEGUNAAN FROM dbo.V_MutasiBarangKeluar WHERE nomor_bon LIKE %s", (f"%{cleaned_bon}%",))
                    rows = cursor.fetchall()
                if not rows: return "Data tidak ditemukan", 404
                result = [{'id': r[0], 'KODE_BARANG': r[1], 'NAMA_BARANG_INDO': r[2], 'NAMA_BARANG_MAND': r[3], 'SATUAN': r[4], 'QTY_OUT': int(r[5]), 'PENERIMA_BARANG': r[6], 'TANGGAL_KELUAR': r[7].strftime('%d-%m-%Y') if r[7] else '', 'NOMOR_BON': r[8], 'DEPARTEMEN': r[9], 'CATATAN': r[10], 'KEGUNAAN': r[11]} for r in rows]
                
                is_inputed = False
                cursor.execute("SELECT mbk.Inputed FROM dbo.wh_mutasi_barang_keluar mbk JOIN dbo.wh_master_barang mb ON mbk.KodeBarang = mb.KodeBarang WHERE mbk.NoBon = %s AND mb.KategoriBarang = 'FASILITAS'", (result[0]['NOMOR_BON'],))
                for row in cursor.fetchall():
                    if row[0] == 1 or str(row[0]).strip() == '1':
                        is_inputed = True
                        break
                return render_template("controlpagehtml/wh_inv_pengambilan_barang.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], menu='deptwh', submenu='mutasibarangkeluar', titlePage='Barang Keluar', data=result, nomor_bon=result[0]['NOMOR_BON'], tanggal=result[0]['TANGGAL_KELUAR'], catatan=result[0]['CATATAN'], kegunaan=result[0]['KEGUNAAN'], is_inputed=is_inputed)
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_invoice_bp.route("/inv_masuk_barang")
def inv_masuk_barang_page():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_invoice_bp.secret_key, algorithms="HS256")
            return render_template("controlpagehtml/wh_inv_pemasukan_barang.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], menu='deptwh', submenu='mutasibarangmasuk', titlePage='INV Barang Masuk')
        except Exception: return redirect("/login")
    return redirect("/login")

@wh_invoice_bp.route('/inv_barangmasuk/<path:nomor_bon>', methods=['GET'])
def inv_barangmasuk_detail(nomor_bon):
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_invoice_bp.secret_key, algorithms="HS256")
            with get_db_cursor() as cursor:
                cursor.execute("SELECT id, TANGGAL_MASUK, KODE_BARANG, NAMA_BARANG_INDO, NAMA_BARANG_MAND, NOMOR_BON, QTY_IN, SATUAN, SUPLIER, KATEGORI_BARANG, TANGGAL_INPUT, CATATAN FROM dbo.[V_MutasiBarangMasuk] WHERE NOMOR_BON=%s", (nomor_bon,))
                rows = cursor.fetchall()
                result = [{'id': r[0], 'TANGGAL_MASUK': r[1].strftime('%d/%m/%Y') if r[1] else '', 'KODE_BARANG': r[2], 'NAMA_BARANG_INDO': r[3], 'NAMA_BARANG_MAND': r[4], 'NOMOR_BON': r[5], 'QTY_IN': int(r[6]) if r[6] else 0, 'SATUAN': r[7], 'SUPLIER': r[8], 'KATEGORI_BARANG': r[9], 'TANGGAL_INPUT': r[10].strftime('%d/%m/%Y') if r[10] else '', 'CATATAN': r[11]} for r in rows]
                return render_template("controlpagehtml/wh_inv_pemasukan_barang.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], menu='deptwh', submenu='mutasibarangmasuk', titlePage='INV Barang Masuk', data=result, nomor_bon=nomor_bon, tanggal=result[0]['TANGGAL_MASUK'] if result else '', suplier=result[0]['SUPLIER'] if result else '', kategori=result[0]['KATEGORI_BARANG'] if result else '', catatan=result[0]['CATATAN'] if result else '')
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")