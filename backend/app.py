import os
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import io

app = Flask(__name__)
CORS(app)

# Font configuration
# Nirmala UI is a common Windows font that supports Devanagari
MARATHI_FONT_PATH = r"C:\Windows\Fonts\Nirmala.ttf"
PDF_FONT = 'Helvetica'
if os.path.exists(MARATHI_FONT_PATH):
    try:
        pdfmetrics.registerFont(TTFont('Nirmala', MARATHI_FONT_PATH))
        PDF_FONT = 'Nirmala'
    except Exception as e:
        print(f"Error registering font: {e}")

def get_taal_header():
    """Returns the structure for the 16-beat taal header as requested."""
    row1_beats = [str(i) for i in range(1, 9)]
    row1_notes = ["धा", "धिन्", "धिन्", "धा", "धा", "धिन्", "धिन्", "धा"]
    row1_markers = ["x", "", "", "", "2", "", "", ""]
    
    row2_beats = [str(i) for i in range(9, 17)]
    row2_notes = ["धा", "तिन्", "तिन्", "ता", "ता", "धिन्", "धिन्", "धा"]
    row2_markers = ["0", "", "", "", "3", "", "", ""] # Added common markers for 9 and 13
    
    return {
        "part1": [row1_beats, row1_notes, row1_markers],
        "part2": [row2_beats, row2_notes, row2_markers]
    }

def add_taal_header_docx(doc, taal_config):
    beats = taal_config.get('beats', 16)
    bols = taal_config.get('bols', [])
    markers = taal_config.get('markers', [])
    
    # Create beat numbers row
    beat_nums = [str(i+1) for i in range(beats)]
    
    def add_table_part(data_rows):
        table = doc.add_table(rows=len(data_rows), cols=beats)
        table.style = 'Table Grid'
        for r_idx, row_data in enumerate(data_rows):
            for c_idx, val in enumerate(row_data):
                if c_idx < beats:
                    cell = table.cell(r_idx, c_idx)
                    cell.text = str(val)
                    for p in cell.paragraphs:
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER

    add_table_part([beat_nums, bols, markers])
    doc.add_paragraph()

def create_docx(data):
    doc = Document()
    title = data.get('title', 'Marathi Music Notation')
    doc.add_heading(title, 0)

    taal_config = data.get('taal_config', {})
    beats = taal_config.get('beats', 16)

    # Add the mandatory taal header
    add_taal_header_docx(doc, taal_config)

    for row in data.get('rows', []):
        if row['type'] == 'header':
            p = doc.add_paragraph()
            run = p.add_run(row['content'])
            run.bold = True
            run.font.size = Pt(14)
        elif row['type'] == 'notation':
            table = doc.add_table(rows=1, cols=beats)
            table.style = 'Table Grid'
            cells = row.get('cells', [''] * beats)
            for i in range(beats):
                cell = table.cell(0, i)
                cell.text = cells[i]
                for p in cell.paragraphs:
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    file_stream = io.BytesIO()
    doc.save(file_stream)
    file_stream.seek(0)
    return file_stream

def create_pdf(data):
    file_stream = io.BytesIO()
    doc = SimpleDocTemplate(file_stream, pagesize=A4)
    styles = getSampleStyleSheet()
    
    marathi_style = ParagraphStyle(
        'MarathiStyle',
        parent=styles['Normal'],
        fontName=PDF_FONT,
        fontSize=10,
        alignment=1 
    )
    
    elements = []
    title = data.get('title', 'Marathi Music Notation')
    elements.append(Paragraph(title, styles['Title']))
    elements.append(Spacer(1, 12))

    taal_config = data.get('taal_config', {})
    beats = taal_config.get('beats', 16)
    bols = taal_config.get('bols', [])
    markers = taal_config.get('markers', [])
    beat_nums = [str(i+1) for i in range(beats)]

    # Taal Header
    header_table_data = [beat_nums, bols, markers]
    col_width = (A4[0] - 80) / beats
    t = Table(header_table_data, colWidths=[col_width]*beats)
    t.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('FONTNAME', (0, 0), (-1, -1), PDF_FONT),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.whitesmoke),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 12))

    for row in data.get('rows', []):
        if row['type'] == 'header':
            elements.append(Paragraph(f"<b>{row['content']}</b>", marathi_style))
            elements.append(Spacer(1, 6))
        elif row['type'] == 'notation':
            cells = row.get('cells', [''] * beats)
            table_data = [cells]
            t = Table(table_data, colWidths=[col_width]*beats)
            t.setStyle(TableStyle([
                ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                ('FONTNAME', (0, 0), (-1, -1), PDF_FONT),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
            ]))
            elements.append(t)
            elements.append(Spacer(1, 6))

    doc.build(elements)
    file_stream.seek(0)
    return file_stream

def create_txt(data):
    output = []
    output.append(data.get('title', 'Marathi Music Notation'))
    output.append("=" * 40)
    
    taal_config = data.get('taal_config', {})
    beats = taal_config.get('beats', 16)
    bols = taal_config.get('bols', [])
    markers = taal_config.get('markers', [])
    beat_nums = [str(i+1) for i in range(beats)]

    output.append("\t".join(beat_nums))
    output.append("\t".join(bols))
    output.append("\t".join(markers))
    output.append("-" * 40)
    
    for row in data.get('rows', []):
        if row['type'] == 'header':
            output.append(f"\n[{row['content']}]")
        elif row['type'] == 'notation':
            cells = row.get('cells', [''] * beats)
            line = " | ".join(cells)
            output.append(f"| {line} |")
    
    return "\n".join(output)

@app.route('/api/export/docx', methods=['POST'])
def export_docx():
    data = request.json
    file_stream = create_docx(data)
    return send_file(file_stream, as_attachment=True, download_name='notation.docx', mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document')

@app.route('/api/export/pdf', methods=['POST'])
def export_pdf():
    data = request.json
    file_stream = create_pdf(data)
    return send_file(file_stream, as_attachment=True, download_name='notation.pdf', mimetype='application/pdf')

@app.route('/api/export/txt', methods=['POST'])
def export_txt():
    data = request.json
    content = create_txt(data)
    file_stream = io.BytesIO(content.encode('utf-8'))
    return send_file(file_stream, as_attachment=True, download_name='notation.txt', mimetype='text/plain')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
