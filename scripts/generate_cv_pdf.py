from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "Nicoline_Andrea_Janka_CV.pdf"
PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 15 * mm
CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN)

BLACK = colors.HexColor("#111111")
BLUE = colors.HexColor("#0000ff")
WHITE = colors.white
LIGHT_BLUE = colors.HexColor("#eeeeff")
MUTED = colors.HexColor("#4b4b4b")


def register_fonts():
    font_dir = Path("C:/Windows/Fonts")
    pdfmetrics.registerFont(TTFont("Portfolio", str(font_dir / "arial.ttf")))
    pdfmetrics.registerFont(TTFont("Portfolio-Bold", str(font_dir / "arialbd.ttf")))
    pdfmetrics.registerFont(TTFont("Portfolio-Italic", str(font_dir / "ariali.ttf")))


register_fonts()

BODY = ParagraphStyle(
    "Body",
    fontName="Portfolio",
    fontSize=9.2,
    leading=12.2,
    textColor=BLACK,
    spaceAfter=0,
)
BODY_SMALL = ParagraphStyle(
    "BodySmall",
    parent=BODY,
    fontSize=8.4,
    leading=10.8,
)
BODY_MUTED = ParagraphStyle(
    "BodyMuted",
    parent=BODY,
    textColor=MUTED,
)
NAME = ParagraphStyle(
    "Name",
    fontName="Portfolio-Bold",
    fontSize=35,
    leading=31,
    textColor=BLACK,
    spaceAfter=0,
)
CV_LABEL = ParagraphStyle(
    "CvLabel",
    fontName="Portfolio-Bold",
    fontSize=10,
    leading=12,
    textColor=BLUE,
    alignment=TA_RIGHT,
)
ROLE = ParagraphStyle(
    "Role",
    fontName="Portfolio-Bold",
    fontSize=10.5,
    leading=13,
    textColor=BLACK,
)
SECTION = ParagraphStyle(
    "Section",
    fontName="Portfolio-Bold",
    fontSize=15,
    leading=18,
    textColor=BLUE,
    spaceAfter=7,
)
DATE = ParagraphStyle(
    "Date",
    fontName="Portfolio-Bold",
    fontSize=8.2,
    leading=10,
    textColor=BLUE,
)
ENTRY_TITLE = ParagraphStyle(
    "EntryTitle",
    fontName="Portfolio-Bold",
    fontSize=10.2,
    leading=12.2,
    textColor=BLACK,
)
CARD_TITLE = ParagraphStyle(
    "CardTitle",
    fontName="Portfolio-Bold",
    fontSize=12,
    leading=13.4,
    textColor=BLACK,
    spaceBefore=11,
    spaceAfter=5,
)
CARD_DATE = ParagraphStyle(
    "CardDate",
    fontName="Portfolio-Bold",
    fontSize=7.8,
    leading=9.4,
    textColor=BLUE,
)
FOOTER = ParagraphStyle(
    "Footer",
    fontName="Portfolio-Bold",
    fontSize=7.2,
    leading=8,
    textColor=BLACK,
)


def para(text, style=BODY):
    return Paragraph(escape(text), style)


def linked_para(label, url, style):
    return Paragraph(
        f'<link href="{escape(url)}" color="#111111">{escape(label)}</link>',
        style,
    )


def section_title(text):
    return KeepTogether(
        [
            Paragraph(escape(text.upper()), SECTION),
            Table([[""]], colWidths=[CONTENT_WIDTH], rowHeights=[2.2], style=TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), BLACK),
            ])),
            Spacer(1, 7),
        ]
    )


def entry_table(entries):
    rows = []
    for period, title, detail in entries:
        rows.append([
            Paragraph(escape(period.upper()), DATE),
            [Paragraph(escape(title), ENTRY_TITLE), Paragraph(escape(detail), BODY_SMALL)],
        ])
    table = Table(rows, colWidths=[34 * mm, CONTENT_WIDTH - (34 * mm)], hAlign="LEFT")
    commands = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]
    commands.extend(("LINEABOVE", (0, index), (-1, index), 0.7, BLACK) for index in range(len(rows)))
    commands.append(("LINEBELOW", (0, len(rows) - 1), (-1, len(rows) - 1), 0.7, BLACK))
    table.setStyle(TableStyle(commands))
    return table


def card(period, title, detail, url=None):
    title_para = linked_para(title, url, CARD_TITLE) if url else para(title, CARD_TITLE)
    return [para(period.upper(), CARD_DATE), title_para, para(detail, BODY_SMALL)]


def draw_page(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(BLACK)
    canvas.setLineWidth(0.7)
    canvas.line(MARGIN, 10.5 * mm, PAGE_WIDTH - MARGIN, 10.5 * mm)
    canvas.setFont("Portfolio-Bold", 7.2)
    canvas.setFillColor(BLACK)
    canvas.drawString(MARGIN, 6.8 * mm, "NICOLINE ANDREA JANKA  |  CURRICULUM VITAE")
    canvas.drawRightString(PAGE_WIDTH - MARGIN, 6.8 * mm, f"{doc.page:02d}")
    canvas.restoreState()


def build_pdf():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=MARGIN,
        leftMargin=MARGIN,
        topMargin=13 * mm,
        bottomMargin=17 * mm,
        title="Curriculum Vitae - Nicoline Andrea Janka",
        author="Nicoline Andrea Janka",
        subject="Curriculum Vitae",
    )

    story = []

    header = Table(
        [[
            Paragraph("NICOLINE<br/>ANDREA JANKA", NAME),
            Paragraph("CURRICULUM<br/>VITAE", CV_LABEL),
        ]],
        colWidths=[CONTENT_WIDTH * 0.73, CONTENT_WIDTH * 0.27],
    )
    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.extend([header, Spacer(1, 8), para("Musician | Sound Designer | Artist | Performer", ROLE), Spacer(1, 10)])

    contact = Table(
        [[
            [linked_para("nicolineandrea@gmail.com", "mailto:nicolineandrea@gmail.com", BODY), linked_para("+41 78 823 39 47", "tel:+41788233947", BODY)],
            [para("Address upon request", BODY), para("Switzerland | Obersaxen GR", BODY)],
            [para("Born 8 March 1999", BODY), para("Updated: September 2026", BODY)],
        ]],
        colWidths=[CONTENT_WIDTH / 3] * 3,
    )
    contact.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1.6, BLACK),
        ("INNERGRID", (0, 0), (-1, -1), 1.0, BLACK),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.extend([contact, Spacer(1, 17), section_title("Current Activities")])

    current_cards = [
        card(
            "Since spring 2025",
            "Bandcontest Sprungfeder",
            "Co-managing director; project management; artist and venue coordination; sponsorship and finance; communications, press and social media",
            "https://www.sprungfeder.li/",
        ),
        card(
            "Since 2024 | Self-employed",
            "Instrumentor",
            "Vocal coaching; computer music and music production; music theory; introduction to coding and creative programming",
            "https://www.instrumentor.ch/de/nicoline-andrea-janka",
        ),
        card(
            "Since summer 2023",
            "WERFT - Das Probehaus",
            "Operations management; organisation and coordination of rehearsal operations; invoicing; newsletter and website",
            "https://www.probehaus-werft.ch/",
        ),
        card(
            "Since 2021",
            "HSLU Music Education",
            "Social media manager for Instagram",
            "https://www.instagram.com/hslu_musikpaedagogik/",
        ),
    ]
    cards = Table(
        [[current_cards[0], current_cards[1]], [current_cards[2], current_cards[3]]],
        colWidths=[(CONTENT_WIDTH - 7) / 2] * 2,
        rowHeights=[56 * mm, 47 * mm],
        hAlign="LEFT",
    )
    cards.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1.8, BLACK),
        ("INNERGRID", (0, 0), (-1, -1), 1.8, BLACK),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.extend([cards, Spacer(1, 16), section_title("Education")])
    education = [
        ("2025-2027", "Master in Music and Digital Creation", "Lucerne University of Applied Sciences and Arts - Music; studying with Emilio Guim, Nadir Vassena, Martin Vogel and others"),
        ("2020-2023", "Bachelor of Arts in Music and Movement", "Lucerne University of Applied Sciences and Arts - Music; major in jazz vocals under Pascal Galeone"),
        ("2018-2020", "Semi-Professional and Pre-College Program", "Swiss Jazz School Bern; major in jazz vocals under Virginia Beatrice"),
        ("2014-2018", "Academic High School (Gymnasium)", "Kloster Disentis; focus on music, with vocals as the main subject under Christina Köb"),
        ("2004-2014", "Kindergarten, Primary and Secondary School", "Rueun"),
    ]
    story.append(entry_table(education))

    story.append(PageBreak())
    story.append(section_title("Professional Experience"))
    former_part_one = [
        ("2024-2025", "Migros Culture Percentage", "Member of the Sparx selection committee"),
        ("2023-2025", "Musikschule Kriens", "Music and Movement; parent-child singing; lunchtime music"),
        ("2022-2025", "Lia Rumantscha Bern", "Parent-child singing"),
        ("2022-2025", "Lila Queerfestival Zurich", "Finance and crowdfunding"),
        ("2022-2023", "Musikschule Wiggertal-Hürntal", "Music and Movement; Orff xylophone"),
    ]
    former_part_two = [
        ("2021-2025", "Various substitute teaching positions in Music and Movement", "Schule Nebikon; Musikschule Rottal; Volksschule Ruswil; Musikschule Region Malters"),
        ("2021-2023", "Lucerne Symphony Orchestra", "Music education assistant"),
        ("2021-2023", "Sentitreff Lucerne", "Open singing group leader"),
        ("2019-2020", "HITZBERGER Bern / Genossenschaft Migros Zürich", "Production and sales team member"),
        ("2018-2019", "Hotelrestaurant Sagibeiz Murg / azibene AG", "Service staff"),
        ("2013-2017", "Spielgruppe Schnaus", "Childcare assistant"),
    ]
    story.extend([entry_table(former_part_one + former_part_two), Spacer(1, 16), section_title("Languages")])

    languages = Table(
        [[para("Romansh", ENTRY_TITLE), para("Native language", BODY)],
         [para("German", ENTRY_TITLE), para("Native language", BODY)],
         [para("English", ENTRY_TITLE), para("Fluent | B2", BODY)],
         [para("French", ENTRY_TITLE), para("Basic knowledge", BODY)]],
        colWidths=[CONTENT_WIDTH * 0.42, CONTENT_WIDTH * 0.58],
    )
    language_style = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    language_style.extend(("LINEABOVE", (0, index), (-1, index), 0.7, BLACK) for index in range(4))
    language_style.append(("LINEBELOW", (0, 3), (-1, 3), 0.7, BLACK))
    languages.setStyle(TableStyle(language_style))
    story.extend([languages, Spacer(1, 18)])

    final_info = Table(
        [[
            [para("REFERENCES", CARD_DATE), Spacer(1, 5), para("Available upon request", ENTRY_TITLE)],
            [para("CONTACT", CARD_DATE), Spacer(1, 5), linked_para("nicolineandrea@gmail.com", "mailto:nicolineandrea@gmail.com", ENTRY_TITLE), linked_para("+41 78 823 39 47", "tel:+41788233947", BODY)],
        ]],
        colWidths=[CONTENT_WIDTH / 2] * 2,
    )
    final_info.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1.6, BLACK),
        ("INNERGRID", (0, 0), (-1, -1), 1.0, BLACK),
        ("BACKGROUND", (0, 0), (0, 0), LIGHT_BLUE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    story.append(final_info)

    doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)
    print(OUTPUT)


if __name__ == "__main__":
    build_pdf()
