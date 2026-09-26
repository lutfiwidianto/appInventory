from flask import Flask, request, redirect, render_template, Blueprint, jsonify, make_response
import jwt
from config.database import get_db_cursor
from config.secretKey import SECRET_KEY
from io import BytesIO
from openpyxl import Workbook
from openpyxl.styles import PatternFill
import pandas as pd

wh_laporan_bp = Blueprint("wh_laporan_bp", __name__)
wh_laporan_bp.secret_key = SECRET_KEY

@wh_laporan_bp.errorhandler(Exception)
def handle_error(error):
    response = jsonify({'error': str(error)})
    response.status_code = 500
    return response

@wh_laporan_bp.route('/download_stockopname_excel/<path:tgl_awal>/<path:tgl_akhir>', methods=['GET'])
def download_stockopname_excel(tgl_awal, tgl_akhir):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_laporan_bp.secret_key, algorithms="HS256")
            query = """
                DECLARE @TanggalAwal DATE = %s;
                DECLARE @TanggalAkhir DATE = %s;

                SELECT mb.Id, mb.KodeBarang, mb.NamaBarangIndo,
                (sb.JumlahSaldoAwal + 
                 COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = sb.KodeBarang AND TanggalMasukBarang < @TanggalAwal), 0) + 
                 COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = sb.KodeBarang AND TanggalKeluarBarang < @TanggalAwal), 0) + 
                 COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_barang_adjustment WHERE KodeBarang = sb.KodeBarang AND TanggalAdjustment < @TanggalAwal), 0)) AS Saldo_Awal, 
                COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = sb.KodeBarang AND TanggalMasukBarang BETWEEN @TanggalAwal AND @TanggalAkhir), 0) AS QTY_IN,
                COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = sb.KodeBarang AND TanggalKeluarBarang BETWEEN @TanggalAwal AND @TanggalAkhir), 0) AS QTY_OUT,
                (sb.JumlahSaldoAwal + 
                 COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = sb.KodeBarang AND TanggalMasukBarang <= @TanggalAkhir), 0) + 
                 COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = sb.KodeBarang AND TanggalKeluarBarang <= @TanggalAkhir), 0) + 
                 COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_barang_adjustment WHERE KodeBarang = sb.KodeBarang), 0)) AS Saldo_Akhir, 
                mb.SatuanIndo, mb.Racking, mb.KategoriBarang, mb.JenisBarang, mb.GlCLass 
                FROM dbo.[wh_master_barang] AS mb 
                LEFT JOIN dbo.wh_stock_barang sb ON sb.KodeBarang = mb.KodeBarang
                ORDER BY mb.KodeBarang ASC;
            """
            with get_db_cursor() as cursor:
                cursor.execute(query, (tgl_awal, tgl_akhir))
                rows = cursor.fetchall()

            df = pd.DataFrame(rows, columns=['Id', 'KodeBarang', 'NamaBarangIndo', 'Saldo_Awal', 'Qty_In', 'Qty_Out', 'Saldo_Akhir', 'SatuanIndo', 'Racking', 'KategoriBarang', 'JenisBarang', 'GlCLass'])
            df['Saldo_Awal'] = df['Saldo_Awal'].apply(lambda x: int(x) if not pd.isna(x) else 0)
            df['Qty_In'] = df['Qty_In'].apply(lambda x: int(x) if not pd.isna(x) else 0)
            df['Qty_Out'] = df['Qty_Out'].apply(lambda x: int(x) if not pd.isna(x) else 0)
            df['Saldo_Akhir'] = df['Saldo_Akhir'].apply(lambda x: int(x) if not pd.isna(x) else 0)

            workbook = Workbook()
            sheet = workbook.active
            header = ['Id', 'KodeBarang', 'NamaBarangIndo', 'Saldo_Awal', 'Qty_In', 'Qty_Out', 'Saldo_Akhir', 'SatuanIndo', 'Racking', 'KategoriBarang', 'JenisBarang', 'GlCLass', 'Real Stock', 'Adjustment']
            sheet.append(header)

            fill = PatternFill(start_color="C6EFCE", end_color="C6EFCE", fill_type="solid")
            for cell in sheet[1]: cell.fill = fill

            for index, row in df.iterrows():
                sheet.append(row.tolist())

            for row_number in range(2, len(df) + 2):
                sheet[f'N{row_number}'] = f'=IF(ISBLANK(M{row_number}), 0, M{row_number}-G{row_number})'

            output = BytesIO()
            workbook.save(output)
            excel_data = output.getvalue()

            response = make_response(excel_data)
            response.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            response.headers['Content-Disposition'] = f'attachment; filename=laporan_stockopname_{tgl_awal}_{tgl_akhir}.xlsx'
            return response
        except Exception as e:
            return jsonify({"error": str(e)})
    return redirect("/login")

@wh_laporan_bp.route("/lap_stockopname")
def lap_stockopname():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, wh_laporan_bp.secret_key, algorithms="HS256")
            html_content = render_template("controlpagehtml/wh_laporan_stockopname.html", namalengkap=data["nama_lengkap"], username=data["sub"], level_user=data["level_user"], menu='deptwh', submenu='stockopname', titlePage='WH Stock Opname')
            response = make_response(html_content)
            response.headers["Content-Length"] = str(len(html_content))
            return response
        except Exception:
            return redirect("/login")
    return redirect("/login")

@wh_laporan_bp.route('/lap_stockopname_range/<path:tgl_awal>/<path:tgl_akhir>', methods=['GET'])
def lap_stockopname_range(tgl_awal, tgl_akhir):
    token = request.cookies.get("token")
    if token:
        try:
            jwt.decode(token, wh_laporan_bp.secret_key, algorithms="HS256")
            start = int(request.args.get('start', 0))
            length = int(request.args.get('length', 15))
            search_value = request.args.get('search[value]', '').strip()
            print("LOG ARGS:", dict(request.args))

            with get_db_cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM dbo.[wh_master_barang]")
                total_data = cursor.fetchone()[0]

                if search_value:
                    cursor.execute(
                        "SELECT COUNT(*) FROM dbo.[wh_master_barang] WHERE KodeBarang LIKE %s OR NamaBarangIndo LIKE %s OR KategoriBarang LIKE %s OR JenisBarang LIKE %s",
                        (f"%{search_value}%", f"%{search_value}%", f"%{search_value}%", f"%{search_value}%")
                    )
                    records_filtered = cursor.fetchone()[0]

                    query = """
                        DECLARE @TanggalAwal DATE = %s;
                        DECLARE @TanggalAkhir DATE = %s;
                        
                        WITH FilteredBarang AS (
                            SELECT mb.Id, mb.KodeBarang, mb.NamaBarangIndo, mb.SatuanIndo, mb.Racking, mb.KategoriBarang, mb.JenisBarang, mb.GlClass
                            FROM dbo.[wh_master_barang] AS mb
                            WHERE mb.KodeBarang LIKE %s OR mb.NamaBarangIndo LIKE %s OR mb.KategoriBarang LIKE %s OR mb.JenisBarang LIKE %s
                            ORDER BY mb.KodeBarang ASC
                            OFFSET %s ROWS FETCH NEXT %s ROWS ONLY
                        )
                        SELECT fb.Id, fb.KodeBarang, fb.NamaBarangIndo,
                        (sb.JumlahSaldoAwal + 
                         COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = fb.KodeBarang AND TanggalMasukBarang < @TanggalAwal), 0) + 
                         COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = fb.KodeBarang AND TanggalKeluarBarang < @TanggalAwal), 0) + 
                         COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_barang_adjustment WHERE KodeBarang = fb.KodeBarang AND TanggalAdjustment < @TanggalAwal), 0)) AS Saldo_Awal, 
                        COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = fb.KodeBarang AND TanggalMasukBarang BETWEEN @TanggalAwal AND @TanggalAkhir), 0) AS QTY_IN,
                        COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = fb.KodeBarang AND TanggalKeluarBarang BETWEEN @TanggalAwal AND @TanggalAkhir), 0) AS QTY_OUT,
                        (sb.JumlahSaldoAwal + 
                         COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = fb.KodeBarang AND TanggalMasukBarang <= @TanggalAkhir), 0) + 
                         COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = fb.KodeBarang AND TanggalKeluarBarang <= @TanggalAkhir), 0) + 
                         COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_barang_adjustment WHERE KodeBarang = fb.KodeBarang), 0)) AS Saldo_Akhir, 
                        fb.SatuanIndo, fb.Racking, fb.KategoriBarang, fb.JenisBarang, fb.GlClass 
                        FROM FilteredBarang fb
                        LEFT JOIN dbo.wh_stock_barang sb ON sb.KodeBarang = fb.KodeBarang
                        ORDER BY fb.KodeBarang ASC;
                    """
                    cursor.execute(query, (tgl_awal, tgl_akhir, f"%{search_value}%", f"%{search_value}%", f"%{search_value}%", f"%{search_value}%", start, length))
                else:
                    records_filtered = total_data
                    query = """
                        DECLARE @TanggalAwal DATE = %s;
                        DECLARE @TanggalAkhir DATE = %s;
                        
                        WITH FilteredBarang AS (
                            SELECT mb.Id, mb.KodeBarang, mb.NamaBarangIndo, mb.SatuanIndo, mb.Racking, mb.KategoriBarang, mb.JenisBarang, mb.GlClass
                            FROM dbo.[wh_master_barang] AS mb
                            ORDER BY mb.KodeBarang ASC
                            OFFSET %s ROWS FETCH NEXT %s ROWS ONLY
                        )
                        SELECT fb.Id, fb.KodeBarang, fb.NamaBarangIndo,
                        (sb.JumlahSaldoAwal + 
                         COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = fb.KodeBarang AND TanggalMasukBarang < @TanggalAwal), 0) + 
                         COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = fb.KodeBarang AND TanggalKeluarBarang < @TanggalAwal), 0) + 
                         COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_barang_adjustment WHERE KodeBarang = fb.KodeBarang AND TanggalAdjustment < @TanggalAwal), 0)) AS Saldo_Awal, 
                        COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = fb.KodeBarang AND TanggalMasukBarang BETWEEN @TanggalAwal AND @TanggalAkhir), 0) AS QTY_IN,
                        COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = fb.KodeBarang AND TanggalKeluarBarang BETWEEN @TanggalAwal AND @TanggalAkhir), 0) AS QTY_OUT,
                        (sb.JumlahSaldoAwal + 
                         COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_masuk WHERE KodeBarang = fb.KodeBarang AND TanggalMasukBarang <= @TanggalAkhir), 0) + 
                         COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_mutasi_barang_keluar WHERE KodeBarang = fb.KodeBarang AND TanggalKeluarBarang <= @TanggalAkhir), 0) + 
                         COALESCE((SELECT SUM(Jumlah) FROM dbo.wh_barang_adjustment WHERE KodeBarang = fb.KodeBarang), 0)) AS Saldo_Akhir, 
                        fb.SatuanIndo, fb.Racking, fb.KategoriBarang, fb.JenisBarang, fb.GlClass 
                        FROM FilteredBarang fb
                        LEFT JOIN dbo.wh_stock_barang sb ON sb.KodeBarang = fb.KodeBarang
                        ORDER BY fb.KodeBarang ASC;
                    """
                    cursor.execute(query, (tgl_awal, tgl_akhir, start, length))
                rows = cursor.fetchall()

            result = []
            for row in rows:
                result.append({
                    'KODE_BARANG': row[1], 'NAMA_BARANG_INDO': row[2],
                    'SALDO_AWAL': '{:.1f}'.format(float(row[3])) if float(row[3]) % 1 != 0 else '{:.0f}'.format(float(row[3])),
                    'QTYIN': '{:.1f}'.format(float(row[4])) if float(row[4]) % 1 != 0 else '{:.0f}'.format(float(row[4])),
                    'QTYOUT': '{:.1f}'.format(float(row[5])) if float(row[5]) % 1 != 0 else '{:.0f}'.format(float(row[5])),
                    'SALDO_AKHIR': '{:.1f}'.format(float(row[6])) if float(row[6]) % 1 != 0 else '{:.0f}'.format(float(row[6])),
                    'SATUAN': row[7], 'LOKASI': row[8], 'KATEGORI_BARANG': row[9], 'JENIS_BARANG': row[10], 'CLASS': row[11]
                })

            return jsonify({'draw': int(request.args.get('draw', 1)), 'recordsTotal': total_data, 'recordsFiltered': records_filtered, 'data': result})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({"error": str(e)})
    return redirect("/login")
