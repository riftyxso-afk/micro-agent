import os
os.chdir(r"/var/folders/2l/4mjmv8jd6458p1jjnfs87djr0000gn/T/docgen_xon_5dfm")

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

c = canvas.Canvas("Laporan_Keuangan.pdf", pagesize=A4)
c.setFont("Helvetica-Bold", 24)
c.drawString(200, 750, "Laporan Keuangan")
c.save()
