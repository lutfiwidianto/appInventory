from flask import Blueprint, request, jsonify, render_template, redirect, send_file
import pymysql
import os
import io
import datetime
from decimal import Decimal
import jwt
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from config.secretKey import SECRET_KEY

pmc_produksitanpapengemas_bp = Blueprint('pmc_produksitanpapengemas_bp', __name__)
pmc_produksitanpapengemas_bp.secret_key = SECRET_KEY

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
            return data.get("sub") or data.get("username") or data.get("nama_lengkap")
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

@pmc_produksitanpapengemas_bp.route('/pmc_produksi_tanpa_pengemas')
@pmc_produksitanpapengemas_bp.route('/pmcproduksitanpapengemas')
def pmc_produksi_tanpa_pengemas():
    user = get_current_user()
    if not user:
        return redirect("/login")
    
    # Ambil list produk result tanpa pengemas untuk dropdown filter
    product_list = []
    category_list = []
    try:
        conn = get_mysql_connection()
        with conn.cursor() as cur:
            # Query produk
            cur.execute("""
                SELECT DISTINCT 
                    b.id_sub_barang,
                    b.kode_barang, 
                    b.nama_barang
                FROM m_sub_barang b
                WHERE b.deleted_at IS NULL
                  AND b.id_sub_barang IN (
                      SELECT DISTINCT pr.id_sub_barang 
                      FROM t_production_result pr
                      JOIN t_production p ON pr.id_production = p.id_production
                      WHERE pr.deleted_at IS NULL AND p.deleted_at IS NULL
                        AND p.id_production NOT IN (
                            SELECT DISTINCT pd_k.id_production
                            FROM t_production_detail pd_k
                            JOIN m_sub_barang b_k ON pd_k.id_sub_barang = b_k.id_sub_barang
                            WHERE pd_k.deleted_at IS NULL
                              AND (
                                  b_k.id_kategori = 98
                                  OR b_k.kode_barang LIKE 'TTC.BBL%' 
                                  OR b_k.kode_barang LIKE 'DDD.TCL%' 
                                  OR b_k.kode_barang LIKE 'DDD.TCI%' 
                                  OR b_k.kode_barang LIKE 'TTC.LLL%'
                                  OR b_k.nama_barang LIKE '%BAG%'
                                  OR b_k.nama_barang LIKE '%JUMBO%'
                                  OR b_k.nama_barang LIKE '%KEMASAN%'
                                  OR b_k.nama_barang LIKE '%KARUNG%'
                              )
                        )
                  )
                ORDER BY b.kode_barang ASC
            """)
            product_list = cur.fetchall() or []

            # Query kategori
            cur.execute("""
                SELECT DISTINCT k.id_kategori, k.nama_kategori
                FROM m_kategori k
                JOIN m_sub_barang b ON k.id_kategori = b.id_kategori
                WHERE k.deleted_at IS NULL AND b.deleted_at IS NULL
                ORDER BY k.nama_kategori ASC
            """)
            category_list = cur.fetchall() or []
        conn.close()
    except Exception as e:
        print(f"Error fetching product/category list: {e}")

    return render_template(
        'controlpagehtml/pmc_produksi_tanpa_pengemas.html',
        titlePage='Produksi Tanpa Pengemas',
        username=user,
        menu='deptpmc',
        submenu='produksitanpapengemas',
        product_list=product_list,
        category_list=category_list
    )

@pmc_produksitanpapengemas_bp.route('/api/pmc/dataproduksitanpapengemas', methods=['GET'])
def get_data_tanpa_pengemas_summary():
    kode_produk = request.args.get('kode_produk', '').strip() or None
    id_kategori = request.args.get('id_kategori', '').strip() or None
    start_date = request.args.get('startDate', '').strip() or request.args.get('start_date', '').strip() or None
    end_date = request.args.get('endDate', '').strip() or request.args.get('end_date', '').strip() or None
    search = request.args.get('search', '').strip() or None

    try:
        conn = get_mysql_connection()
        with conn.cursor() as cur:
            where_clauses = [
                "p.deleted_at IS NULL",
                "pr.deleted_at IS NULL",
                "b_res.deleted_at IS NULL",
                """p.id_production NOT IN (
                    SELECT DISTINCT pd_k.id_production
                    FROM t_production_detail pd_k
                    JOIN m_sub_barang b_k ON pd_k.id_sub_barang = b_k.id_sub_barang
                    WHERE pd_k.deleted_at IS NULL
                      AND (
                          b_k.id_kategori = 98
                          OR b_k.kode_barang LIKE 'TTC.BBL%%' 
                          OR b_k.kode_barang LIKE 'DDD.TCL%%' 
                          OR b_k.kode_barang LIKE 'DDD.TCI%%' 
                          OR b_k.kode_barang LIKE 'TTC.LLL%%'
                          OR b_k.nama_barang LIKE '%%BAG%%'
                          OR b_k.nama_barang LIKE '%%JUMBO%%'
                          OR b_k.nama_barang LIKE '%%KEMASAN%%'
                          OR b_k.nama_barang LIKE '%%KARUNG%%'
                      )
                )"""
            ]
            params = []

            if kode_produk:
                where_clauses.append("b_res.kode_barang = %s")
                params.append(kode_produk)

            if id_kategori:
                where_clauses.append("b_res.id_kategori = %s")
                params.append(id_kategori)

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
                    b_res.kode_barang LIKE %s 
                    OR b_res.nama_barang LIKE %s 
                    OR b_res.external_code LIKE %s
                    OR k.nama_kategori LIKE %s
                )""")
                term = f"%{search}%"
                params.extend([term, term, term, term])

            where_str = " AND ".join(where_clauses)

            query = f"""
                SELECT 
                    b_res.kode_barang   AS result_kode,
                    b_res.nama_barang   AS result_nama,
                    COALESCE(NULLIF(b_res.external_code, ''), '-') AS result_ext_code,
                    COALESCE(k.nama_kategori, 'Lainnya') AS kategori_barang,
                    s.uraian_satuan_barang AS satuan_result,
                    COUNT(DISTINCT p.id_production) AS total_transaksi,
                    SUM(pr.qty_result)  AS total_qty_result,
                    MIN(p.tanggal_mutasi) AS tgl_awal,
                    MAX(p.tanggal_mutasi) AS tgl_akhir
                FROM t_production p
                JOIN t_production_result pr ON p.id_production = pr.id_production
                JOIN m_sub_barang b_res ON pr.id_sub_barang = b_res.id_sub_barang
                LEFT JOIN m_kategori k ON b_res.id_kategori = k.id_kategori
                LEFT JOIN bcref_satuan_barang s ON pr.id_satuan = s.id
                WHERE {where_str}
                GROUP BY b_res.id_sub_barang, b_res.kode_barang, b_res.nama_barang, b_res.external_code, k.nama_kategori, s.uraian_satuan_barang
                ORDER BY total_transaksi DESC, b_res.kode_barang ASC
            """
            cur.execute(query, params)
            rows = cur.fetchall() or []
            for r in rows:
                r['tgl_awal_str'] = r['tgl_awal'].strftime('%d-%m-%Y') if r.get('tgl_awal') else '-'
                r['tgl_akhir_str'] = r['tgl_akhir'].strftime('%d-%m-%Y') if r.get('tgl_akhir') else '-'
                r['total_qty_result'] = float(r['total_qty_result']) if r.get('total_qty_result') else 0.0
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pmc_produksitanpapengemas_bp.route('/api/pmc/dataproduksitanpapengemasdetail', methods=['GET'])
def get_data_tanpa_pengemas_detail():
    kode_produk = request.args.get('kode_produk', '').strip() or None
    id_kategori = request.args.get('id_kategori', '').strip() or None
    start_date = request.args.get('startDate', '').strip() or request.args.get('start_date', '').strip() or None
    end_date = request.args.get('endDate', '').strip() or request.args.get('end_date', '').strip() or None
    search = request.args.get('search', '').strip() or None

    try:
        conn = get_mysql_connection()
        with conn.cursor() as cur:
            where_clauses = [
                "p.deleted_at IS NULL",
                "pr.deleted_at IS NULL",
                "b_res.deleted_at IS NULL",
                """p.id_production NOT IN (
                    SELECT DISTINCT pd_k.id_production
                    FROM t_production_detail pd_k
                    JOIN m_sub_barang b_k ON pd_k.id_sub_barang = b_k.id_sub_barang
                    WHERE pd_k.deleted_at IS NULL
                      AND (
                          b_k.id_kategori = 98
                          OR b_k.kode_barang LIKE 'TTC.BBL%%' 
                          OR b_k.kode_barang LIKE 'DDD.TCL%%' 
                          OR b_k.kode_barang LIKE 'DDD.TCI%%' 
                          OR b_k.kode_barang LIKE 'TTC.LLL%%'
                          OR b_k.nama_barang LIKE '%%BAG%%'
                          OR b_k.nama_barang LIKE '%%JUMBO%%'
                          OR b_k.nama_barang LIKE '%%KEMASAN%%'
                          OR b_k.nama_barang LIKE '%%KARUNG%%'
                      )
                )"""
            ]
            params = []

            if kode_produk:
                where_clauses.append("b_res.kode_barang = %s")
                params.append(kode_produk)

            if id_kategori:
                where_clauses.append("b_res.id_kategori = %s")
                params.append(id_kategori)

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
                    OR b_res.kode_barang LIKE %s 
                    OR b_res.nama_barang LIKE %s 
                    OR b_res.external_code LIKE %s
                    OR k.nama_kategori LIKE %s
                )""")
                term = f"%{search}%"
                params.extend([term, term, term, term, term])

            where_str = " AND ".join(where_clauses)

            query = f"""
                SELECT 
                    p.id_production,
                    p.kode_mutasi           AS kode_produksi,
                    p.tanggal_mutasi        AS tanggal_produksi,
                    b_res.kode_barang       AS result_kode,
                    b_res.nama_barang       AS result_nama,
                    COALESCE(NULLIF(b_res.external_code, ''), '-') AS result_ext_code,
                    COALESCE(k.nama_kategori, 'Lainnya') AS kategori_barang,
                    pr.qty_result           AS qty_result,
                    TRIM(TRAILING ';' FROM TRIM(COALESCE(s.uraian_satuan_barang, s_sub.uraian_satuan_barang, '-'))) AS satuan_result,
                    (
                        SELECT GROUP_CONCAT(CONCAT(CONVERT(bm.kode_barang USING utf8mb4), ' = ', FORMAT(pdm.qty_detail, 2), ' ', TRIM(TRAILING ';' FROM TRIM(COALESCE(CONVERT(sm.uraian_satuan_barang USING utf8mb4), CONVERT(sm_sub.uraian_satuan_barang USING utf8mb4), '')))) SEPARATOR ',\n')
                        FROM t_production_detail pdm
                        JOIN m_sub_barang bm ON pdm.id_sub_barang = bm.id_sub_barang
                        LEFT JOIN bcref_satuan_barang sm ON pdm.id_satuan = sm.id
                        LEFT JOIN bcref_satuan_barang sm_sub ON bm.id_satuan_terkecil = sm_sub.id
                        WHERE pdm.id_production = p.id_production AND pdm.deleted_at IS NULL
                    ) AS daftar_material
                FROM t_production p
                JOIN t_production_result pr ON p.id_production = pr.id_production
                JOIN m_sub_barang b_res ON pr.id_sub_barang = b_res.id_sub_barang
                LEFT JOIN m_kategori k ON b_res.id_kategori = k.id_kategori
                LEFT JOIN bcref_satuan_barang s ON pr.id_satuan = s.id
                LEFT JOIN bcref_satuan_barang s_sub ON b_res.id_satuan_terkecil = s_sub.id
                WHERE {where_str}
                ORDER BY p.tanggal_mutasi DESC, p.id_production DESC
                LIMIT 2000
            """
            cur.execute(query, params)
            rows = cur.fetchall() or []
            for r in rows:
                r['tanggal_produksi_str'] = r['tanggal_produksi'].strftime('%d-%m-%Y') if r.get('tanggal_produksi') else '-'
                r['qty_result'] = float(r['qty_result']) if r.get('qty_result') else 0.0
                r['daftar_material'] = r.get('daftar_material') or '-'
        conn.close()
        return jsonify(rows)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pmc_produksitanpapengemas_bp.route('/api/pmc/exportproduksitanpapengemas', methods=['GET'])
def export_tanpa_pengemas_excel():
    kode_produk = request.args.get('kode_produk', '').strip() or None
    id_kategori = request.args.get('id_kategori', '').strip() or None
    start_date = request.args.get('startDate', '').strip() or request.args.get('start_date', '').strip() or None
    end_date = request.args.get('endDate', '').strip() or request.args.get('end_date', '').strip() or None

    try:
        conn = get_mysql_connection()
        with conn.cursor() as cur:
            where_clauses = [
                "p.deleted_at IS NULL", "pr.deleted_at IS NULL", "b_res.deleted_at IS NULL",
                """p.id_production NOT IN (
                    SELECT DISTINCT pd_k.id_production
                    FROM t_production_detail pd_k
                    JOIN m_sub_barang b_k ON pd_k.id_sub_barang = b_k.id_sub_barang
                    WHERE pd_k.deleted_at IS NULL
                      AND (
                          b_k.id_kategori = 98
                          OR b_k.kode_barang LIKE 'TTC.BBL%%' 
                          OR b_k.kode_barang LIKE 'DDD.TCL%%' 
                          OR b_k.kode_barang LIKE 'DDD.TCI%%' 
                          OR b_k.kode_barang LIKE 'TTC.LLL%%'
                          OR b_k.nama_barang LIKE '%%BAG%%'
                          OR b_k.nama_barang LIKE '%%JUMBO%%'
                          OR b_k.nama_barang LIKE '%%KEMASAN%%'
                          OR b_k.nama_barang LIKE '%%KARUNG%%'
                      )
                )"""
            ]
            params = []
            if kode_produk:
                where_clauses.append("b_res.kode_barang = %s")
                params.append(kode_produk)
            if id_kategori:
                where_clauses.append("b_res.id_kategori = %s")
                params.append(id_kategori)
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
                    b_res.kode_barang   AS result_kode,
                    b_res.nama_barang   AS result_nama,
                    COALESCE(NULLIF(b_res.external_code, ''), '-') AS result_ext_code,
                    COALESCE(k.nama_kategori, 'Lainnya') AS kategori_barang,
                    COALESCE(s.uraian_satuan_barang, s_sub.uraian_satuan_barang, '-') AS satuan_result,
                    COUNT(DISTINCT p.id_production) AS total_transaksi,
                    SUM(pr.qty_result)  AS total_qty_result,
                    MIN(p.tanggal_mutasi) AS tgl_awal,
                    MAX(p.tanggal_mutasi) AS tgl_akhir
                FROM t_production p
                JOIN t_production_result pr ON p.id_production = pr.id_production
                JOIN m_sub_barang b_res ON pr.id_sub_barang = b_res.id_sub_barang
                LEFT JOIN m_kategori k ON b_res.id_kategori = k.id_kategori
                LEFT JOIN bcref_satuan_barang s ON pr.id_satuan = s.id
                LEFT JOIN bcref_satuan_barang s_sub ON b_res.id_satuan_terkecil = s_sub.id
                WHERE {where_str}
                GROUP BY b_res.id_sub_barang, b_res.kode_barang, b_res.nama_barang, b_res.external_code, k.nama_kategori, s.uraian_satuan_barang, s_sub.uraian_satuan_barang
                ORDER BY total_transaksi DESC, b_res.kode_barang ASC
            """
            cur.execute(q_sum, params)
            summary_rows = cur.fetchall() or []

            q_dt = f"""
                SELECT 
                    p.id_production,
                    p.kode_mutasi           AS kode_produksi,
                    p.tanggal_mutasi        AS tanggal_produksi,
                    b_res.kode_barang       AS result_kode,
                    b_res.nama_barang       AS result_nama,
                    COALESCE(NULLIF(b_res.external_code, ''), '-') AS result_ext_code,
                    COALESCE(k.nama_kategori, 'Lainnya') AS kategori_barang,
                    pr.qty_result           AS qty_result,
                    TRIM(TRAILING ';' FROM TRIM(COALESCE(s.uraian_satuan_barang, s_sub.uraian_satuan_barang, '-'))) AS satuan_result,
                    (
                        SELECT GROUP_CONCAT(CONCAT(CONVERT(bm.kode_barang USING utf8mb4), ' = ', FORMAT(pdm.qty_detail, 2), ' ', TRIM(TRAILING ';' FROM TRIM(COALESCE(CONVERT(sm.uraian_satuan_barang USING utf8mb4), CONVERT(sm_sub.uraian_satuan_barang USING utf8mb4), '')))) SEPARATOR ',\n')
                        FROM t_production_detail pdm
                        JOIN m_sub_barang bm ON pdm.id_sub_barang = bm.id_sub_barang
                        LEFT JOIN bcref_satuan_barang sm ON pdm.id_satuan = sm.id
                        LEFT JOIN bcref_satuan_barang sm_sub ON bm.id_satuan_terkecil = sm_sub.id
                        WHERE pdm.id_production = p.id_production AND pdm.deleted_at IS NULL
                    ) AS daftar_material
                FROM t_production p
                JOIN t_production_result pr ON p.id_production = pr.id_production
                JOIN m_sub_barang b_res ON pr.id_sub_barang = b_res.id_sub_barang
                LEFT JOIN m_kategori k ON b_res.id_kategori = k.id_kategori
                LEFT JOIN bcref_satuan_barang s ON pr.id_satuan = s.id
                LEFT JOIN bcref_satuan_barang s_sub ON b_res.id_satuan_terkecil = s_sub.id
                WHERE {where_str}
                ORDER BY p.tanggal_mutasi DESC, p.id_production DESC
                LIMIT 5000
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
        align_wrap_left = Alignment(horizontal='left', vertical='center', wrap_text=True)

        # Sheet 1: Summary
        ws1 = wb.active
        ws1.title = "Rekapitulasi Produk"
        ws1.views.sheetView[0].showGridLines = True
        ws1['A1'] = "LAPORAN REKAPITULASI HASIL PRODUKSI TANPA PENGEMAS"
        ws1['A1'].font = font_title
        ws1['A2'] = f"Filter: {kode_produk or 'Semua Produk'}"
        ws1['A2'].font = font_subtitle

        headers1 = ["No", "Kode Produk (Result)", "Nama Produk / Barang Jadi", "Kode Eksternal", "Kategori Hasil", "Total Transaksi", "Total Qty Result", "Satuan", "Periode Awal", "Periode Akhir"]
        for c_idx, h in enumerate(headers1, 1):
            cell = ws1.cell(row=4, column=c_idx, value=h)
            cell.font = font_header
            cell.fill = fill_header
            cell.alignment = align_center
            cell.border = box_border

        for idx, r in enumerate(summary_rows, 1):
            fill = fill_white if idx % 2 == 0 else fill_zebra
            ws1.cell(row=idx+4, column=1, value=idx).alignment = align_center
            ws1.cell(row=idx+4, column=2, value=r['result_kode']).alignment = align_left
            ws1.cell(row=idx+4, column=3, value=r['result_nama']).alignment = align_left
            ws1.cell(row=idx+4, column=4, value=r['result_ext_code']).alignment = align_left
            ws1.cell(row=idx+4, column=5, value=r['kategori_barang']).alignment = align_center
            ws1.cell(row=idx+4, column=6, value=r['total_transaksi']).alignment = align_right
            ws1.cell(row=idx+4, column=7, value=float(r['total_qty_result']) if r.get('total_qty_result') else 0.0).alignment = align_right
            ws1.cell(row=idx+4, column=8, value=r['satuan_result'] or '').alignment = align_center
            ws1.cell(row=idx+4, column=9, value=str(r['tgl_awal']) if r.get('tgl_awal') else '-').alignment = align_center
            ws1.cell(row=idx+4, column=10, value=str(r['tgl_akhir']) if r.get('tgl_akhir') else '-').alignment = align_center

            for c in range(1, 11):
                cell = ws1.cell(row=idx+4, column=c)
                cell.font = font_body
                cell.border = box_border
                cell.fill = fill

        for col in ws1.columns:
            max_len = 0
            for cell in col:
                val_str = str(cell.value or '')
                lines = val_str.split('\n')
                line_max = max(len(l) for l in lines) if lines else len(val_str)
                if line_max > max_len:
                    max_len = line_max
            ws1.column_dimensions[get_column_letter(col[0].column)].width = min(max(max_len + 4, 12), 60)

        # Sheet 2: Detail
        ws2 = wb.create_sheet(title="Detail Transaksi")
        ws2.views.sheetView[0].showGridLines = True
        ws2['A1'] = "SEMUA TRANSAKSI REALISASI PRODUKSI TANPA KEMASAN"
        ws2['A1'].font = font_title

        headers2 = ["No", "No. Dokumen Produksi", "Tanggal Produksi", "Kode Produk Result", "Nama Produk Result", "Kode Eksternal", "Kategori Hasil", "Qty Result", "Satuan", "Daftar Material Dikonsumsi"]
        for c_idx, h in enumerate(headers2, 1):
            cell = ws2.cell(row=4, column=c_idx, value=h)
            cell.font = font_header
            cell.fill = fill_header
            cell.alignment = align_center
            cell.border = box_border

        for idx, d in enumerate(detail_rows, 1):
            fill = fill_white if idx % 2 == 0 else fill_zebra
            ws2.cell(row=idx+4, column=1, value=idx).alignment = align_center
            ws2.cell(row=idx+4, column=2, value=d['kode_produksi']).alignment = align_left
            ws2.cell(row=idx+4, column=3, value=str(d['tanggal_produksi']) if d.get('tanggal_produksi') else '-').alignment = align_center
            ws2.cell(row=idx+4, column=4, value=d['result_kode']).alignment = align_left
            ws2.cell(row=idx+4, column=5, value=d['result_nama']).alignment = align_left
            ws2.cell(row=idx+4, column=6, value=d['result_ext_code']).alignment = align_left
            ws2.cell(row=idx+4, column=7, value=d['kategori_barang']).alignment = align_center
            ws2.cell(row=idx+4, column=8, value=float(d['qty_result']) if d.get('qty_result') else 0.0).alignment = align_right
            ws2.cell(row=idx+4, column=9, value=d['satuan_result'] or '').alignment = align_center
            ws2.cell(row=idx+4, column=10, value=d['daftar_material'] or '-').alignment = align_wrap_left

            for c in range(1, 11):
                cell = ws2.cell(row=idx+4, column=c)
                cell.font = font_body
                cell.border = box_border
                cell.fill = fill
                if c == 10:
                    cell.alignment = align_wrap_left

        for col in ws2.columns:
            max_len = 0
            for cell in col:
                val_str = str(cell.value or '')
                lines = val_str.split('\n')
                line_max = max(len(l) for l in lines) if lines else len(val_str)
                if line_max > max_len:
                    max_len = line_max
            ws2.column_dimensions[get_column_letter(col[0].column)].width = min(max(max_len + 4, 12), 60)

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        filename = f"Produksi_Tanpa_Pengemas_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        return send_file(output, as_attachment=True, download_name=filename, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

    except Exception as e:
        return jsonify({'error': str(e)}), 500
