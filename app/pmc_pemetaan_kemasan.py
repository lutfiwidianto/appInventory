from flask import Blueprint, request, jsonify, render_template, redirect, send_file
import pymysql
import os
import io
import datetime
import jwt
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from config.secretKey import SECRET_KEY

pmc_pemetaankemasan_bp = Blueprint('pmc_pemetaankemasan_bp', __name__)
pmc_pemetaankemasan_bp.secret_key = SECRET_KEY

def get_mysql_connection():
    """Koneksi ke MySQL smartone_tungcia di PC 192.17.17.49"""
    return pymysql.connect(
        host=os.getenv('MYSQL_HOST', '192.17.17.49'),
        port=int(os.getenv('MYSQL_PORT', 3306)),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', 'lutfigaul'),
        database=os.getenv('MYSQL_DB', 'smartone_tungcia'),
        connect_timeout=10,
        cursorclass=pymysql.cursors.DictCursor
    )

def get_current_user():
    token = request.cookies.get("token") or request.cookies.get("access_token")
    if token:
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            return data.get("sub") or data.get("username")
        except:
            return None
    return None

def parse_date_sql(d_str):
    if not d_str:
        return None
    for fmt in ('%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y'):
        try:
            return datetime.datetime.strptime(d_str.strip(), fmt).strftime('%Y-%m-%d')
        except:
            pass
    return None

@pmc_pemetaankemasan_bp.route('/pmcpemetaankemasan')
def pmc_pemetaankemasan():
    user = get_current_user()
    if not user:
        return redirect("/login")
    
    # Ambil list kemasan untuk dropdown (Master Kategori Pengemas 66 items)
    packaging_list = []
    try:
        conn = get_mysql_connection()
        with conn.cursor() as cur:
            cur.execute("""
                SELECT DISTINCT 
                    b.id_sub_barang,
                    b.kode_barang, 
                    b.nama_barang
                FROM m_sub_barang b
                WHERE b.deleted_at IS NULL
                  AND (
                      b.id_kategori = 98
                      OR b.id_sub_barang IN (SELECT DISTINCT id_sub_barang FROM t_production_detail WHERE deleted_at IS NULL)
                      AND (
                          b.kode_barang LIKE 'TTC.BBL%' 
                          OR b.kode_barang LIKE 'DDD.TCL%' 
                          OR b.kode_barang LIKE 'DDD.TCI%' 
                          OR b.kode_barang LIKE 'TTC.LLL%'
                          OR b.nama_barang LIKE '%BAG%'
                          OR b.nama_barang LIKE '%JUMBO%'
                          OR b.nama_barang LIKE '%KEMASAN%'
                          OR b.nama_barang LIKE '%KARUNG%'
                      )
                  )
                ORDER BY b.kode_barang ASC
            """)
            packaging_list = cur.fetchall() or []
        conn.close()
    except Exception as e:
        print(f"Error fetching packaging list: {e}")

    return render_template(
        'controlpagehtml/pmc_pemetaan_kemasan.html',
        titlePage='Pemetaan Kemasan FG',
        username=user,
        menu='deptpmc',
        submenu='pemetaankemasan',
        packaging_list=packaging_list
    )

@pmc_pemetaankemasan_bp.route('/api/datapemetaankemasan', methods=['GET'])
def get_data_pemetaan():
    kode_kemasan = request.args.get('kode_kemasan', '').strip() or None
    start_date = request.args.get('startDate', '').strip() or request.args.get('start_date', '').strip() or None
    end_date = request.args.get('endDate', '').strip() or request.args.get('end_date', '').strip() or None
    search = request.args.get('search', '').strip() or None

    try:
        conn = get_mysql_connection()
        with conn.cursor() as cur:
            where_clauses = [
                "pd.deleted_at IS NULL",
                "pr.deleted_at IS NULL",
                "p.deleted_at IS NULL",
                "b_res.kode_barang NOT LIKE '%%.KGM'"
            ]
            params = []

            if kode_kemasan:
                where_clauses.append("b_mat.kode_barang = %s")
                params.append(kode_kemasan)
            else:
                where_clauses.append("""(
                    b_mat.kode_barang LIKE 'TTC.BBL%%' 
                    OR b_mat.kode_barang LIKE 'DDD.TCL%%' 
                    OR b_mat.kode_barang LIKE 'DDD.TCI%%' 
                    OR b_mat.kode_barang LIKE 'TTC.LLL%%'
                    OR b_mat.nama_barang LIKE '%%BAG%%'
                    OR b_mat.nama_barang LIKE '%%JUMBO%%'
                    OR b_mat.nama_barang LIKE '%%KEMASAN%%'
                    OR b_mat.nama_barang LIKE '%%KARUNG%%'
                )""")

            s_date = parse_date_sql(start_date)
            e_date = parse_date_sql(end_date)
            if s_date:
                where_clauses.append("p.tanggal_mutasi >= %s")
                params.append(s_date)
            if e_date:
                where_clauses.append("p.tanggal_mutasi <= %s")
                params.append(e_date)

            if search:
                where_clauses.append("""(
                    b_mat.kode_barang LIKE %s 
                    OR b_mat.nama_barang LIKE %s 
                    OR b_res.kode_barang LIKE %s 
                    OR b_res.nama_barang LIKE %s 
                    OR b_res.external_code LIKE %s
                )""")
                term = f"%{search}%"
                params.extend([term, term, term, term, term])

            where_str = " AND ".join(where_clauses)

            query = f"""
                SELECT 
                    b_mat.kode_barang   AS material_kode,
                    b_mat.nama_barang   AS material_nama,
                    b_res.kode_barang   AS result_kode,
                    b_res.nama_barang   AS result_nama,
                    COALESCE(NULLIF(b_res.external_code, ''), '-') AS result_ext_code,
                    COUNT(DISTINCT p.id_production) AS total_transaksi,
                    MIN(p.tanggal_mutasi)           AS tgl_awal,
                    MAX(p.tanggal_mutasi)           AS tgl_akhir
                FROM t_production_detail pd
                JOIN m_sub_barang b_mat ON pd.id_sub_barang = b_mat.id_sub_barang
                JOIN t_production p ON pd.id_production = p.id_production
                JOIN t_production_result pr ON p.id_production = pr.id_production
                JOIN m_sub_barang b_res ON pr.id_sub_barang = b_res.id_sub_barang
                WHERE {where_str}
                GROUP BY b_mat.id_sub_barang, b_mat.kode_barang, b_mat.nama_barang, 
                         b_res.id_sub_barang, b_res.kode_barang, b_res.nama_barang, b_res.external_code
                ORDER BY b_mat.kode_barang ASC, total_transaksi DESC, b_res.kode_barang ASC
            """
            cur.execute(query, params)
            rows = cur.fetchall() or []
            for r in rows:
                r['tgl_awal_str'] = r['tgl_awal'].strftime('%d-%m-%Y') if r.get('tgl_awal') else '-'
                r['tgl_akhir_str'] = r['tgl_akhir'].strftime('%d-%m-%Y') if r.get('tgl_akhir') else '-'
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pmc_pemetaankemasan_bp.route('/api/datapemetaankemasandetail', methods=['GET'])
def get_data_pemetaan_detail():
    kode_kemasan = request.args.get('kode_kemasan', '').strip() or None
    start_date = request.args.get('startDate', '').strip() or request.args.get('start_date', '').strip() or None
    end_date = request.args.get('endDate', '').strip() or request.args.get('end_date', '').strip() or None
    search = request.args.get('search', '').strip() or None



    try:
        conn = get_mysql_connection()
        with conn.cursor() as cur:
            where_clauses = [
                "pd.deleted_at IS NULL",
                "pr.deleted_at IS NULL",
                "p.deleted_at IS NULL",
                "b_res.kode_barang NOT LIKE '%%.KGM'"
            ]
            params = []

            if kode_kemasan:
                where_clauses.append("b_mat.kode_barang = %s")
                params.append(kode_kemasan)
            else:
                where_clauses.append("""(
                    b_mat.kode_barang LIKE 'TTC.BBL%%' 
                    OR b_mat.kode_barang LIKE 'DDD.TCL%%' 
                    OR b_mat.kode_barang LIKE 'DDD.TCI%%' 
                    OR b_mat.kode_barang LIKE 'TTC.LLL%%'
                    OR b_mat.nama_barang LIKE '%%BAG%%'
                    OR b_mat.nama_barang LIKE '%%JUMBO%%'
                    OR b_mat.nama_barang LIKE '%%KEMASAN%%'
                    OR b_mat.nama_barang LIKE '%%KARUNG%%'
                )""")

            s_date = parse_date_sql(start_date)
            e_date = parse_date_sql(end_date)
            if s_date:
                where_clauses.append("p.tanggal_mutasi >= %s")
                params.append(s_date)
            if e_date:
                where_clauses.append("p.tanggal_mutasi <= %s")
                params.append(e_date)

            if search:
                where_clauses.append("""(
                    p.kode_mutasi LIKE %s
                    OR b_mat.kode_barang LIKE %s 
                    OR b_mat.nama_barang LIKE %s 
                    OR b_res.kode_barang LIKE %s 
                    OR b_res.nama_barang LIKE %s 
                    OR b_res.external_code LIKE %s
                )""")
                term = f"%{search}%"
                params.extend([term, term, term, term, term, term])

            where_str = " AND ".join(where_clauses)

            query = f"""
                SELECT 
                    p.id_production,
                    p.kode_mutasi           AS kode_produksi,
                    p.tanggal_mutasi        AS tanggal_produksi,
                    b_mat.kode_barang       AS material_kode,
                    b_mat.nama_barang       AS material_nama,
                    pd.qty_detail           AS qty_material,
                    COALESCE(s_mat.uraian_satuan_barang, s_mat_sub.uraian_satuan_barang, 'PCS') AS satuan_material,
                    b_res.kode_barang       AS result_kode,
                    b_res.nama_barang       AS result_nama,
                    COALESCE(NULLIF(b_res.external_code, ''), '-') AS result_ext_code,
                    pr.qty_result           AS qty_result,
                    COALESCE(s_res.uraian_satuan_barang, s_res_sub.uraian_satuan_barang, '-') AS satuan_result
                FROM t_production_detail pd
                JOIN m_sub_barang b_mat ON pd.id_sub_barang = b_mat.id_sub_barang
                LEFT JOIN bcref_satuan_barang s_mat ON pd.id_satuan = s_mat.id
                LEFT JOIN bcref_satuan_barang s_mat_sub ON b_mat.id_satuan_terkecil = s_mat_sub.id
                JOIN t_production p ON pd.id_production = p.id_production
                JOIN t_production_result pr ON p.id_production = pr.id_production
                JOIN m_sub_barang b_res ON pr.id_sub_barang = b_res.id_sub_barang
                LEFT JOIN bcref_satuan_barang s_res ON pr.id_satuan = s_res.id
                LEFT JOIN bcref_satuan_barang s_res_sub ON b_res.id_satuan_terkecil = s_res_sub.id
                WHERE {where_str}
                ORDER BY b_mat.kode_barang ASC, p.tanggal_mutasi DESC, p.id_production DESC
                LIMIT 2000
            """
            cur.execute(query, params)
            rows = cur.fetchall() or []
            for r in rows:
                r['tanggal_produksi_str'] = r['tanggal_produksi'].strftime('%d-%m-%Y') if r.get('tanggal_produksi') else '-'
                r['qty_material'] = float(r['qty_material']) if r.get('qty_material') else 0.0
                r['qty_result'] = float(r['qty_result']) if r.get('qty_result') else 0.0
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pmc_pemetaankemasan_bp.route('/api/exportpemetaankemasan', methods=['GET'])
def export_excel():
    kode_kemasan = request.args.get('kode_kemasan', '').strip() or None
    start_date = request.args.get('startDate', '').strip() or request.args.get('start_date', '').strip() or None
    end_date = request.args.get('endDate', '').strip() or request.args.get('end_date', '').strip() or None

    try:
        conn = get_mysql_connection()
        with conn.cursor() as cur:
            # Query summary
            where_clauses = [
                "pd.deleted_at IS NULL", "pr.deleted_at IS NULL", "p.deleted_at IS NULL", "b_res.kode_barang NOT LIKE '%%.KGM'"
            ]
            params = []
            if kode_kemasan:
                where_clauses.append("b_mat.kode_barang = %s")
                params.append(kode_kemasan)
            s_date = parse_date_sql(start_date)
            e_date = parse_date_sql(end_date)
            if s_date:
                where_clauses.append("p.tanggal_mutasi >= %s")
                params.append(s_date)
            if e_date:
                where_clauses.append("p.tanggal_mutasi <= %s")
                params.append(e_date)

            where_str = " AND ".join(where_clauses)
            q_sum = f"""
                SELECT 
                    b_mat.kode_barang   AS material_kode,
                    b_mat.nama_barang   AS material_nama,
                    b_res.kode_barang   AS result_kode,
                    b_res.nama_barang   AS result_nama,
                    COALESCE(NULLIF(b_res.external_code, ''), '-') AS result_ext_code,
                    COUNT(DISTINCT p.id_production) AS total_transaksi,
                    MIN(p.tanggal_mutasi)           AS tgl_awal,
                    MAX(p.tanggal_mutasi)           AS tgl_akhir
                FROM t_production_detail pd
                JOIN m_sub_barang b_mat ON pd.id_sub_barang = b_mat.id_sub_barang
                JOIN t_production p ON pd.id_production = p.id_production
                JOIN t_production_result pr ON p.id_production = pr.id_production
                JOIN m_sub_barang b_res ON pr.id_sub_barang = b_res.id_sub_barang
                WHERE {where_str}
                GROUP BY b_mat.id_sub_barang, b_mat.kode_barang, b_mat.nama_barang, 
                         b_res.id_sub_barang, b_res.kode_barang, b_res.nama_barang, b_res.external_code
                ORDER BY b_mat.kode_barang ASC, total_transaksi DESC
            """
            cur.execute(q_sum, params)
            summary_rows = cur.fetchall() or []

            # Query detail
            q_dt = f"""
                SELECT 
                    p.id_production,
                    p.kode_mutasi           AS kode_produksi,
                    p.tanggal_mutasi        AS tanggal_produksi,
                    b_mat.kode_barang       AS material_kode,
                    b_mat.nama_barang       AS material_nama,
                    pd.qty_detail           AS qty_material,
                    b_res.kode_barang       AS result_kode,
                    b_res.nama_barang       AS result_nama,
                    COALESCE(NULLIF(b_res.external_code, ''), '-') AS result_ext_code,
                    pr.qty_result           AS qty_result,
                    s_res.uraian_satuan_barang AS satuan_result
                FROM t_production_detail pd
                JOIN m_sub_barang b_mat ON pd.id_sub_barang = b_mat.id_sub_barang
                JOIN t_production p ON pd.id_production = p.id_production
                JOIN t_production_result pr ON p.id_production = pr.id_production
                JOIN m_sub_barang b_res ON pr.id_sub_barang = b_res.id_sub_barang
                LEFT JOIN bcref_satuan_barang s_res ON pr.id_satuan = s_res.id
                WHERE {where_str}
                ORDER BY b_mat.kode_barang ASC, p.tanggal_mutasi DESC
            """
            cur.execute(q_dt, params)
            detail_rows = cur.fetchall() or []
        conn.close()

        wb = openpyxl.Workbook()
        font_title = Font(name='Segoe UI', size=14, bold=True, color='1F497D')
        font_subtitle = Font(name='Segoe UI', size=10, italic=True, color='595959')
        font_header = Font(name='Segoe UI', size=10, bold=True, color='FFFFFF')
        font_body = Font(name='Segoe UI', size=10, color='000000')

        fill_header = PatternFill(start_color='1F497D', end_color='1F497D', fill_type='solid')
        fill_zebra = PatternFill(start_color='F9FAFB', end_color='F9FAFB', fill_type='solid')
        fill_white = PatternFill(start_color='FFFFFF', end_color='FFFFFF', fill_type='solid')

        border_thin = Side(border_style='thin', color='D9D9D9')
        box_border = Border(left=border_thin, right=border_thin, top=border_thin, bottom=border_thin)

        align_center = Alignment(horizontal='center', vertical='center')
        align_left = Alignment(horizontal='left', vertical='center')
        align_right = Alignment(horizontal='right', vertical='center')

        # Sheet 1: Summary
        ws1 = wb.active
        ws1.title = "Rekapitulasi Pemetaan"
        ws1.views.sheetView[0].showGridLines = True
        ws1['A1'] = "REKAPITULASI PEMETAAN KEMASAN KE HASIL PRODUK JADI"
        ws1['A1'].font = font_title
        ws1['A2'] = f"Filter: {kode_kemasan or 'Semua Kemasan'}"
        ws1['A2'].font = font_subtitle

        headers1 = ["No", "Kode Kemasan", "Nama Kemasan (Material)", "Kode Produk Jadi", "Nama Produk Jadi (Result)", "External Code", "Total Transaksi", "Tgl Awal", "Tgl Akhir"]
        for c_idx, h in enumerate(headers1, 1):
            cell = ws1.cell(row=4, column=c_idx, value=h)
            cell.font = font_header
            cell.fill = fill_header
            cell.alignment = align_center
            cell.border = box_border

        for idx, r in enumerate(summary_rows, 1):
            fill = fill_white if idx % 2 == 0 else fill_zebra
            ws1.cell(row=idx+4, column=1, value=idx).alignment = align_center
            ws1.cell(row=idx+4, column=2, value=r['material_kode']).alignment = align_left
            ws1.cell(row=idx+4, column=3, value=r['material_nama']).alignment = align_left
            ws1.cell(row=idx+4, column=4, value=r['result_kode']).alignment = align_left
            ws1.cell(row=idx+4, column=5, value=r['result_nama']).alignment = align_left
            ws1.cell(row=idx+4, column=6, value=r['result_ext_code']).alignment = align_left
            ws1.cell(row=idx+4, column=7, value=r['total_transaksi']).alignment = align_right
            ws1.cell(row=idx+4, column=8, value=str(r['tgl_awal']) if r.get('tgl_awal') else '-').alignment = align_center
            ws1.cell(row=idx+4, column=9, value=str(r['tgl_akhir']) if r.get('tgl_akhir') else '-').alignment = align_center

            for c in range(1, 10):
                cell = ws1.cell(row=idx+4, column=c)
                cell.font = font_body
                cell.border = box_border
                cell.fill = fill

        for col in ws1.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            ws1.column_dimensions[get_column_letter(col[0].column)].width = max(max_len + 4, 12)

        # Sheet 2: Detail
        ws2 = wb.create_sheet(title="Detail Transaksi")
        ws2.views.sheetView[0].showGridLines = True
        ws2['A1'] = "DETAIL TRANSAKSI RIWAYAT PRODUKSI KEMASAN"
        ws2['A1'].font = font_title

        headers2 = ["No", "ID Produksi", "No Mutasi", "Tgl Produksi", "Kode Kemasan", "Nama Kemasan", "Qty Kemasan", "Kode Produk Jadi", "Nama Produk Jadi", "External Code", "Qty Hasil", "Satuan"]
        for c_idx, h in enumerate(headers2, 1):
            cell = ws2.cell(row=4, column=c_idx, value=h)
            cell.font = font_header
            cell.fill = fill_header
            cell.alignment = align_center
            cell.border = box_border

        for idx, d in enumerate(detail_rows, 1):
            fill = fill_white if idx % 2 == 0 else fill_zebra
            ws2.cell(row=idx+4, column=1, value=idx).alignment = align_center
            ws2.cell(row=idx+4, column=2, value=d['id_production']).alignment = align_center
            ws2.cell(row=idx+4, column=3, value=d['kode_produksi']).alignment = align_left
            ws2.cell(row=idx+4, column=4, value=str(d['tanggal_produksi']) if d.get('tanggal_produksi') else '-').alignment = align_center
            ws2.cell(row=idx+4, column=5, value=d['material_kode']).alignment = align_left
            ws2.cell(row=idx+4, column=6, value=d['material_nama']).alignment = align_left
            ws2.cell(row=idx+4, column=7, value=float(d['qty_material']) if d.get('qty_material') else 0.0).alignment = align_right
            ws2.cell(row=idx+4, column=8, value=d['result_kode']).alignment = align_left
            ws2.cell(row=idx+4, column=9, value=d['result_nama']).alignment = align_left
            ws2.cell(row=idx+4, column=10, value=d['result_ext_code']).alignment = align_left
            ws2.cell(row=idx+4, column=11, value=float(d['qty_result']) if d.get('qty_result') else 0.0).alignment = align_right
            ws2.cell(row=idx+4, column=12, value=d['satuan_result'] or '').alignment = align_center

            for c in range(1, 13):
                cell = ws2.cell(row=idx+4, column=c)
                cell.font = font_body
                cell.border = box_border
                cell.fill = fill

        for col in ws2.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            ws2.column_dimensions[get_column_letter(col[0].column)].width = max(max_len + 4, 12)

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        filename = f"Pemetaan_Kemasan_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        return send_file(output, as_attachment=True, download_name=filename, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

    except Exception as e:
        return jsonify({'error': str(e)}), 500
