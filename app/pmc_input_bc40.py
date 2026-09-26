from flask import Flask, request, redirect, render_template, Blueprint, jsonify, url_for
import jwt
import mysql.connector
import datetime
from config.database import create_connection
from config.secretKey import SECRET_KEY


pmc_bc40_bp = Blueprint("pmc_bc40_bp", __name__)
pmc_bc40_bp.secret_key = SECRET_KEY

from contextlib import contextmanager

def get_mysql_connection():
    conn = mysql.connector.connect(
        host='192.17.17.201',
        database='tpbdb',
        user='tungcia',
        password='@#%&!itTCT5613288'
    )
    return conn

@contextmanager
def get_mysql_cursor():
    conn = get_mysql_connection()
    cursor = conn.cursor()
    try:
        yield cursor
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

@pmc_bc40_bp.errorhandler(Exception)
def handle_error(error):
    response = jsonify({'error': str(error)})
    response.status_code = 500
    return response

@pmc_bc40_bp.route("/input_bc40")
def input_bc40():
    # Check if the user has a valid token
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, pmc_bc40_bp.secret_key, algorithms="HS256")
            return render_template("controlpagehtml/pmc_input_bc40.html", username=data["sub"], level_user=data["level_user"], menu='deptpmc', submenu='draft', titlePage='Form PMC')
        except jwt.exceptions.DecodeError:
            return redirect("/login")
        except jwt.exceptions.ExpiredSignatureError:
            return redirect("/login")
    else:
        return redirect("/login")

@pmc_bc40_bp.route('/GetDataFromReferensiPemasok', methods=['POST'])
def get_data_from_referensi_pemasok():
    # Ambil nilai dari request dengan key 'searchValue'
    search_value = request.json.get('searchValue')

    with get_mysql_cursor() as cursor:
        # Query yang ingin Anda jalankan dengan parameter pencarian
        sql_query = "SELECT `ID`, `ALAMAT`, `KODE_ID`, `KODE_NEGARA`, `NAMA`, `NPWP` " \
                    "FROM `tpbdb`.`referensi_pemasok` " \
                    "WHERE `NAMA` LIKE %s OR `NPWP` LIKE %s " \
                    "LIMIT 0, 1000"

        # Jalankan query dengan parameterisasi yang benar
        cursor.execute(sql_query, (f"%{search_value}%", f"%{search_value}%"))

        # Baca hasil query jika ada
        data = cursor.fetchall()

        if data:
            result = {
                "NPWP": data[0][5],
                "NAMA": data[0][4],
                "ALAMAT": data[0][1]
            }
            return jsonify(result), 200
        else:
            return jsonify({"message": "Tidak ada data supplier"}), 404

@pmc_bc40_bp.route('/GetKodeKemasan', methods=['POST'])
def get_kode_kemasan():
    # Ambil data uraian dari request
    uraian_values = request.json.get('uraianValues')
    result = {}

    with get_mysql_cursor() as cursor:
        for uraian_value in uraian_values:
            sql_query = "SELECT KODE_KEMASAN FROM referensi_kemasan WHERE uraian_kemasan = %s"
            cursor.execute(sql_query, (uraian_value,))
            kode_kemasan = cursor.fetchone()

            if kode_kemasan:
                result[uraian_value] = kode_kemasan[0]
            else:
                result[uraian_value] = None

    return jsonify(result), 200

@pmc_bc40_bp.route('/GetKodeDokumen', methods=['POST'])
def get_kode_dokumen():
    uraian_values = request.json.get('uraianValues')
    result = {}

    with get_mysql_cursor() as cursor:
        for uraian_value in uraian_values:
            sql_query = "SELECT KODE_DOKUMEN FROM referensi_dokumen WHERE uraian_dokumen = %s"
            cursor.execute(sql_query, (uraian_value,))
            kode_dokumen = cursor.fetchone()

            if kode_dokumen:
                result[uraian_value] = kode_dokumen[0]
            else:
                result[uraian_value] = None

    return jsonify(result), 200

@pmc_bc40_bp.route('/CreateDokAju40', methods=['POST'])
def create_dokaju40_to_database():
    try:
        with get_mysql_cursor() as cursor_mysql:
            # Dapatkan ID_baru dari hasil query
            cursor_mysql.execute("SELECT (ID + 1) AS ID FROM TPB_HEADER WHERE KODE_DOKUMEN_PABEAN = '40' ORDER BY ID DESC LIMIT 1;")
            result = cursor_mysql.fetchone()
            ID_baru = result[0] if result else 1

            # Dapatkan NOMOR_AJU_baru dari hasil query
            cursor_mysql.execute("SELECT CONCAT(LEFT(NOMOR_AJU, 12), DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(CAST(RIGHT(NOMOR_AJU, 6) AS UNSIGNED) + 1, 6, '0')) AS NEW_NOMOR_AJU FROM TPB_HEADER WHERE KODE_DOKUMEN_PABEAN = '40' ORDER BY RIGHT(NOMOR_AJU, 6) DESC LIMIT 1;")
            result = cursor_mysql.fetchone()
            if not result:
                return jsonify({'message': 'Nomor Aju Gagal dibuat.'}), 500
            
            NOMOR_AJU_baru = result[0]

            # Dapatkan tanggal_baru dalam format yang diinginkan
            tanggal_baru = datetime.datetime.now().strftime('%Y-%m-%d 00:00:00')

            # Query SQL untuk memasukkan data
            sql = "INSERT INTO `tpbdb`.`tpb_header` (" + \
                "`ID`, `ALAMAT_PENGUSAHA`, `BRUTO`, `HARGA_PENYERAHAN`, `ID_MODUL`, `ID_PENGUSAHA`, `JABATAN_TTD`, " + \
                "`KODE_DOKUMEN_PABEAN`, `KODE_ID_PENGUSAHA`, `KODE_JENIS_TPB`, `KODE_KANTOR`, `KODE_STATUS`, `KODE_TUJUAN_PENGIRIMAN`, " + \
                "`KOTA_TTD`, `NAMA_PENGUSAHA`, `NAMA_TTD`, `NETTO`, `NOMOR_AJU`, `NOMOR_IJIN_TPB`, `TANGGAL_TTD`, `VERSI_MODUL`, `VOLUME` " + \
                ") VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"

            params = (
                ID_baru,
                'JALAN KRATON INDUSTRI RAYA KAWASAN INDUSTRI PIER, NO. 18, CURAHDUKUH, KRATON, KAB. PASURUAN, JAWA TIMUR, 67151',
                0.0000, 0.00, '29938', '830962346624000', 'KUASA DIREKSI', '40', '1', '1', '071300', '00', '5',
                'PASURUAN', 'TUNG CIA TECHNOLOGY INDONESIA', 'HERIN DIKA PRATIWI', 0.0000,
                NOMOR_AJU_baru, '2263/WBC.11/2021', tanggal_baru, '3.1.11', 0.0000
            )

            cursor_mysql.execute(sql, params)

            return jsonify({'message': 'Data berhasil dimasukkan ke dalam database.', 'nomor_aju_baru': NOMOR_AJU_baru})
    
    except Exception as e:
        print('Terjadi kesalahan saat memasukkan data:', str(e))
        return jsonify({'message': 'Terjadi kesalahan saat memasukkan data.', 'error': str(e)}), 500





