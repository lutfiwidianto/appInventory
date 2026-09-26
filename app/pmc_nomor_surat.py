from flask import Blueprint, request, jsonify, current_app, send_from_directory
from config.database import get_db_cursor
import os
import datetime
import jwt
from werkzeug.utils import secure_filename
from app.helper import helper_bp  # For secret key

pmc_nomorsurat_bp = Blueprint('pmc_nomorsurat_bp', __name__)

UPLOAD_FOLDER = 'd:/appInventory/uploads/pmc_surat'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def get_current_user():
    token = request.cookies.get("token")
    if token:
        try:
            data = jwt.decode(token, helper_bp.secret_key, algorithms="HS256")
            return data["sub"]
        except:
            return None
    return None

@pmc_nomorsurat_bp.route('/pmcnomorsurat')
def pmcnomorsurat():
    # Helper to render page, assuming similar to other routes
    from flask import render_template
    user = get_current_user()
    if not user:
        return "Unauthorized", 401
    return render_template('controlpagehtml/pmcnomorsurat.html', titlePage='Nomor Surat', username=user)

@pmc_nomorsurat_bp.route('/api/datanomorsurat', methods=['GET'])
def get_data_nomorsurat():
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')

    query = """
        SELECT Id, Tanggal, NoSurat, NamaDokumen, Keperluan, NamaFile, CreatedBy, UpdatedBy, 
        CONVERT(VARCHAR(23), CreatedAt, 121) as CreatedAt, 
        CONVERT(VARCHAR(23), UpdatedAt, 121) as UpdatedAt,
        FileUpdatedBy,
        CONVERT(VARCHAR(23), FileUpdatedAt, 121) as FileUpdatedAt,
        Status
        FROM tct_inventory.dbo.pmc_no_surat
    """
    params = []

    if start_date and end_date:
        query += " WHERE Tanggal BETWEEN %s AND %s"
        params.extend([start_date, end_date])
    
    query += " ORDER BY Id DESC"

    with get_db_cursor() as cursor:
        cursor.execute(query, tuple(params))
        results = []
        for row in cursor.fetchall():
            # Helper to safely format date for the Tanggal column
            def format_date_simple(d):
                if isinstance(d, (datetime.date, datetime.datetime)):
                    return d.strftime('%Y-%m-%d')
                return str(d) if d else ""

            results.append({
                'id': row[0],
                'tanggal': format_date_simple(row[1]),
                'noSurat': row[2] if row[2] else "",
                'namaDokumen': row[3] if row[3] else "",
                'keperluan': row[4] if row[4] else "",
                'namaFile': row[5] if row[5] else None,
                'createdBy': row[6] if row[6] else "-",
                'updatedBy': row[7],
                'createdAt': str(row[8]) if row[8] else "",
                'updatedAt': str(row[9]) if row[9] else "",
                'fileUpdatedBy': row[10],
                'fileUpdatedAt': str(row[11]) if row[11] else "",
                'status': row[12] if row[12] else 'Aktif'
            })
    return jsonify(results)

@pmc_nomorsurat_bp.route('/api/surat', methods=['POST'])
def add_surat():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        tanggal = request.form.get('tanggal') # Format expected: DD-MM-YYYY
        no_surat = request.form.get('noSurat')
        nama_dokumen = request.form.get('namaDokumen')
        keperluan = request.form.get('keperluan')
        file = request.files.get('file')

        # Simple validation
        if not all([tanggal, no_surat, nama_dokumen, keperluan]):
            return jsonify({'error': 'Semua field wajib diisi'}), 400

        # Convert date format for SQL (YYYY-MM-DD)
        tanggal_db = datetime.datetime.strptime(tanggal, '%d-%m-%Y').strftime('%Y-%m-%d')

        filename = None
        if file:
            ext = os.path.splitext(file.filename)[1]
            safe_nama_dokumen = secure_filename(nama_dokumen)
            timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"{safe_nama_dokumen}_{timestamp}{ext}"
            file.save(os.path.join(UPLOAD_FOLDER, filename))

        query = """
            INSERT INTO tct_inventory.dbo.pmc_no_surat (Tanggal, NoSurat, NamaDokumen, Keperluan, NamaFile, CreatedBy, CreatedAt)
            VALUES (%s, %s, %s, %s, %s, %s, GETDATE())
        """
        params = (tanggal_db, no_surat, nama_dokumen, keperluan, filename, user)
        
        with get_db_cursor() as cursor:
            cursor.execute(query, params)
        
        return jsonify({'message': 'Data added successfully'}), 201

    except Exception as e:
        print(f"Error in add_surat: {e}")
        return jsonify({'error': str(e)}), 500

@pmc_nomorsurat_bp.route('/api/surat/<int:id>', methods=['PUT'])
def edit_surat(id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        tanggal = request.form.get('tanggal')
        no_surat = request.form.get('noSurat')
        nama_dokumen = request.form.get('namaDokumen')
        keperluan = request.form.get('keperluan')
        status = request.form.get('status') or 'Aktif'
        file = request.files.get('file')

        # Convert date format for SQL (YYYY-MM-DD)
        tanggal_db = datetime.datetime.strptime(tanggal, '%d-%m-%Y').strftime('%Y-%m-%d')

        with get_db_cursor() as cursor:
            # Get current record info
            cursor.execute("SELECT NamaFile, CreatedBy, UpdatedBy FROM tct_inventory.dbo.pmc_no_surat WHERE Id=%s", (id,))
            old_row = cursor.fetchone()
            if not old_row:
                return jsonify({'error': 'Data tidak ditemukan'}), 404

            created_by = old_row[1]
            if user != created_by and user != 'lutfi':
                return jsonify({'error': 'Akses ditolak: Hanya pembuat dokumen atau user lutfi yang dapat mengedit'}), 403

            current_filename = old_row[0] if old_row and old_row[0] else None

            if file:
                # If there's a new file upload
                if current_filename:
                    # CASE: REPLACEMENT (File already exists, this is a REVISION)
                    # Archive old file to history table (Task 4)
                    cursor.execute("""
                        INSERT INTO tct_inventory.dbo.pmc_surat_history (SuratId, NamaFile, ArchivedBy, ArchivedAt)
                        VALUES (%s, %s, %s, GETDATE())
                    """, (id, current_filename, user))
                    
                    # Mark as "File Diedit" (Task 2)
                    file_update_sql = ", FileUpdatedBy=%s, FileUpdatedAt=GETDATE()"
                    file_update_params = [user]
                else:
                    # CASE: FIRST TIME UPLOAD (Booking was empty, now user adds file)
                    # This is considered a normal "Update" of the record, not "File Diedit" yet
                    file_update_sql = ""
                    file_update_params = []
                
                # Save new file
                ext = os.path.splitext(file.filename)[1].lower()
                safe_nama_dokumen = secure_filename(nama_dokumen)
                timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
                filename = f"{safe_nama_dokumen}_{timestamp}{ext}"
                file.save(os.path.join(UPLOAD_FOLDER, filename))
                
                query = f"""
                    UPDATE tct_inventory.dbo.pmc_no_surat 
                    SET Tanggal=%s, NoSurat=%s, NamaDokumen=%s, Keperluan=%s, Status=%s, NamaFile=%s, UpdatedBy=%s, UpdatedAt=GETDATE() {file_update_sql}
                    WHERE Id=%s
                """
                cursor.execute(query, tuple([tanggal_db, no_surat.strip(), nama_dokumen, keperluan, status, filename, user] + file_update_params + [id]))
            else:
                # Text-only update
                query = """
                    UPDATE tct_inventory.dbo.pmc_no_surat 
                    SET Tanggal=%s, NoSurat=%s, NamaDokumen=%s, Keperluan=%s, Status=%s, UpdatedBy=%s, UpdatedAt=GETDATE()
                    WHERE Id=%s
                """
                cursor.execute(query, (tanggal_db, no_surat.strip(), nama_dokumen, keperluan, status, user, id))
        
        return jsonify({'message': 'Data updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pmc_nomorsurat_bp.route('/api/surat/<int:id>/history', methods=['GET'])
def get_surat_history(id):
    try:
        with get_db_cursor() as cursor:
            cursor.execute("""
                SELECT Id, NamaFile, ArchivedBy, CONVERT(VARCHAR(19), ArchivedAt, 120) as ArchivedAt 
                FROM tct_inventory.dbo.pmc_surat_history 
                WHERE SuratId=%s 
                ORDER BY ArchivedAt DESC
            """, (id,))
            
            results = []
            for row in cursor.fetchall():
                 # Helper to safely format date
                def format_datetime(d):
                    if isinstance(d, (datetime.date, datetime.datetime)):
                        return d.strftime('%Y-%m-%d %H:%M:%S')
                    return d

                results.append({
                    'id': row[0],
                    'namaFile': row[1],
                    'archivedBy': row[2],
                    'archivedAt': format_datetime(row[3])
                })
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pmc_nomorsurat_bp.route('/api/check_nosurat', methods=['GET'])
def check_nosurat():
    no_surat = request.args.get('noSurat')
    exclude_id = request.args.get('excludeId')
    
    if not no_surat:
        return jsonify({'available': True})

    query = "SELECT COUNT(*) FROM tct_inventory.dbo.pmc_no_surat WHERE NoSurat = %s"
    params = [no_surat]

    if exclude_id and exclude_id != 'undefined':
        query += " AND Id != %s"
        params.append(exclude_id)

    with get_db_cursor() as cursor:
        cursor.execute(query, tuple(params))
        count = cursor.fetchone()[0]
        return jsonify({'available': count == 0})

@pmc_nomorsurat_bp.route('/api/surat/<int:id>', methods=['DELETE'])
def delete_surat(id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    if user != 'lutfi':
        return jsonify({'error': 'Akses ditolak: Hanya user lutfi yang dapat menghapus dokumen'}), 403

    try:
        with get_db_cursor() as cursor:
            # 1. Get and delete history files
            cursor.execute("SELECT NamaFile FROM tct_inventory.dbo.pmc_surat_history WHERE SuratId=%s", (id,))
            history_rows = cursor.fetchall()
            for row in history_rows:
                if row[0]:
                    file_path = os.path.join(UPLOAD_FOLDER, row[0])
                    if os.path.exists(file_path):
                        try:
                            os.remove(file_path)
                        except OSError as e:
                            print(f"Error checking/deleting history file {file_path}: {e}")

            # 2. Delete history records from DB
            cursor.execute("DELETE FROM tct_inventory.dbo.pmc_surat_history WHERE SuratId=%s", (id,))

            # 3. Get and delete main file
            cursor.execute("SELECT NamaFile FROM tct_inventory.dbo.pmc_no_surat WHERE Id=%s", (id,))
            row = cursor.fetchone()
            if row and row[0]:
                file_path = os.path.join(UPLOAD_FOLDER, row[0])
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except OSError as e:
                        print(f"Error checking/deleting main file {file_path}: {e}")
            
            # 4. Delete main record from DB
            cursor.execute("DELETE FROM tct_inventory.dbo.pmc_no_surat WHERE Id=%s", (id,))
            
        return jsonify({'message': 'Data and files deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@pmc_nomorsurat_bp.route('/api/surat/<int:id>/status', methods=['PATCH'])
def toggle_status_surat(id):
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        with get_db_cursor() as cursor:
            # Ambil data pembuat dan status saat ini
            cursor.execute(
                "SELECT CreatedBy, Status FROM tct_inventory.dbo.pmc_no_surat WHERE Id=%s", (id,)
            )
            row = cursor.fetchone()
            if not row:
                return jsonify({'error': 'Data tidak ditemukan'}), 404

            created_by = row[0]
            current_status = row[1] if row[1] else 'Aktif'

            # Hanya pembuat atau lutfi yang boleh ubah status
            if user != created_by and user != 'lutfi':
                return jsonify({'error': 'Akses ditolak: Hanya pembuat dokumen atau user lutfi yang dapat mengubah status'}), 403

            # Toggle status
            new_status = 'Tidak Jadi Dipakai' if current_status == 'Aktif' else 'Aktif'

            cursor.execute(
                "UPDATE tct_inventory.dbo.pmc_no_surat SET Status=%s, UpdatedBy=%s, UpdatedAt=GETDATE() WHERE Id=%s",
                (new_status, user, id)
            )

        return jsonify({'message': 'Status berhasil diubah', 'newStatus': new_status}), 200

    except Exception as e:
        print(f"Error in toggle_status_surat: {e}")
        return jsonify({'error': str(e)}), 500

@pmc_nomorsurat_bp.route('/api/debug_surat', methods=['GET'])
def debug_surat():
    no_surat = request.args.get('noSurat')
    with get_db_cursor() as cursor:
        cursor.execute("SELECT Id, NoSurat, NamaFile, FileUpdatedBy, FileUpdatedAt FROM tct_inventory.dbo.pmc_no_surat WHERE NoSurat = %s", (no_surat,))
        row = cursor.fetchone()
        if row:
            return jsonify({
                'id': row[0],
                'noSurat': row[1],
                'namaFile': row[2],
                'fileUpdatedBy': row[3],
                'fileUpdatedAt': str(row[4]) if row[4] else None,
                'namaFile_type': str(type(row[2]))
            })
        return jsonify({'error': 'Not found'})

# Route to serve uploaded files
@pmc_nomorsurat_bp.route('/uploads/pmc_surat/<filename>')
def uploaded_file(filename):
    from flask import make_response
    response = make_response(send_from_directory(UPLOAD_FOLDER, filename))
    # Explicitly set content-disposition to inline to try and force browser view
    response.headers['Content-Disposition'] = 'inline; filename=%s' % filename
    # Also ensure Content-Type is correct for PDF if possible, though send_from_directory usually handles it.
    return response