import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs")
os.makedirs(OUTPUT_DIR, exist_ok=True)
PPTX_PATH = os.path.join(OUTPUT_DIR, "HepaTwin_Hackathon_Pitch_v3.pptx")

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

c_dark_bg    = RGBColor(11, 19, 43)
c_light_bg   = RGBColor(244, 248, 247)
c_white      = RGBColor(255, 255, 255)
c_card_bg    = RGBColor(255, 255, 255)
c_dark_text  = RGBColor(15, 23, 42)
c_muted_text = RGBColor(71, 85, 105)
c_primary    = RGBColor(0, 109, 119)
c_orange     = RGBColor(227, 100, 20)
c_green      = RGBColor(0, 135, 60)
c_amber      = RGBColor(217, 119, 6)
c_red        = RGBColor(200, 16, 46)
c_subtle_brd = RGBColor(226, 232, 240)

def add_header(slide, title, subtitle, dark=False, num=1):
    tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(11.733), Inches(1.3))
    tf = tb.text_frame
    tf.word_wrap = True
    p0 = tf.paragraphs[0]
    p0.text = title
    p0.font.name = "Arial"
    p0.font.size = Pt(28)
    p0.font.bold = True
    p0.font.color.rgb = c_white if dark else c_dark_text
    if subtitle:
        p1 = tf.add_paragraph()
        p1.text = subtitle
        p1.font.name = "Arial"
        p1.font.size = Pt(13)
        p1.font.color.rgb = RGBColor(203, 213, 225) if dark else c_muted_text
        p1.space_before = Pt(6)
    fb = slide.shapes.add_textbox(Inches(0.8), Inches(6.8), Inches(11.733), Inches(0.4))
    fp = fb.text_frame.paragraphs[0]
    fp.text = "HepaTwin | Happiest Health Digital Twin Challenge 2026"
    fp.font.name = "Arial"
    fp.font.size = Pt(9)
    fp.font.color.rgb = RGBColor(148, 163, 184)
    snb = slide.shapes.add_textbox(Inches(12.0), Inches(6.8), Inches(0.8), Inches(0.4))
    snp = snb.text_frame.paragraphs[0]
    snp.text = str(num)
    snp.font.name = "Arial"
    snp.font.size = Pt(9)
    snp.alignment = PP_ALIGN.RIGHT
    snp.font.color.rgb = RGBColor(148, 163, 184)

# Slide 1: Title
s1 = prs.slides.add_slide(blank_layout)
bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg1.fill.solid()
bg1.fill.fore_color.rgb = c_dark_bg
bg1.line.fill.background()
t1 = s1.shapes.add_textbox(Inches(0.8), Inches(1.2), Inches(6.8), Inches(4.8))
tf1 = t1.text_frame
tf1.word_wrap = True
p = tf1.paragraphs[0]
p.text = "HepaTwin"
p.font.name = "Arial"
p.font.size = Pt(46)
p.font.bold = True
p.font.color.rgb = c_white
p = tf1.add_paragraph()
p.text = "Automated liver-fibrosis screening and triage for primary care in India"
p.font.name = "Arial"
p.font.size = Pt(20)
p.font.bold = True
p.font.color.rgb = c_orange
p.space_before = Pt(14)
p = tf1.add_paragraph()
p.text = "From a routine CBC + LFT to a referral decision in seconds."
p.font.name = "Arial"
p.font.size = Pt(13)
p.font.color.rgb = RGBColor(226, 232, 240)
p.space_before = Pt(14)
badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.6), Inches(2.8), Inches(0.55))
badge.fill.solid()
badge.fill.fore_color.rgb = c_orange
badge.line.fill.background()
bp = badge.text_frame.paragraphs[0]
bp.text = "LIVE hepatwin.vercel.app"
bp.font.name = "Arial"
bp.font.size = Pt(11)
bp.font.bold = True
bp.font.color.rgb = c_white
bp.alignment = PP_ALIGN.CENTER
tinf = s1.shapes.add_textbox(Inches(0.8), Inches(5.3), Inches(5.0), Inches(0.8))
tinf_p = tinf.text_frame.paragraphs[0]
tinf_p.text = "Team pr3650882 | Graphic Era (Deemed to be University), Dehradun"
tinf_p.font.name = "Arial"
tinf_p.font.size = Pt(11)
tinf_p.font.color.rgb = RGBColor(148, 163, 184)
for idx, (st, sc, col, y) in enumerate([
    ("NORMAL / LOW RISK (F0-F1)", "FIB-4: 0.74, APRI: 0.28, Platelets: 235k", c_green, Inches(1.8)),
    ("CRITICAL / ADVANCED FIBROSIS HAZARD (F3-F4)", "FIB-4: 3.77, APRI: 2.33, Platelets: 118k", c_red, Inches(3.6))
]):
    card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.5), y, Inches(5.0), Inches(1.5))
    card.fill.solid()
    card.fill.fore_color.rgb = RGBColor(15, 23, 42)
    card.line.color.rgb = col
    card.line.width = Pt(1.5)
    ctf = card.text_frame
    ctf.word_wrap = True
    ctf.paragraphs[0].text = st
    ctf.paragraphs[0].font.name = "Arial"
    ctf.paragraphs[0].font.size = Pt(10)
    ctf.paragraphs[0].font.bold = True
    ctf.paragraphs[0].font.color.rgb = col
    cp1 = ctf.add_paragraph()
    cp1.text = sc
    cp1.font.name = "Arial"
    cp1.font.size = Pt(9.5)
    cp1.font.color.rgb = c_white
    cp1.space_before = Pt(4)
    cp2 = ctf.add_paragraph()
    cp2.text = "AST, ALT, Platelets, TBIL evaluated against ICMR cutoffs."
    cp2.font.name = "Arial"
    cp2.font.size = Pt(8.5)
    cp2.font.color.rgb = RGBColor(148, 163, 184)
    cp2.space_before = Pt(3)
add_header(s1, "", "", True, 1)

# Slide 2: Missed where patients first appear
s2 = prs.slides.add_slide(blank_layout)
bg2 = s2.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg2.fill.solid()
bg2.fill.fore_color.rgb = c_light_bg
bg2.line.fill.background()
add_header(s2, "Missed where patients first appear", "Fibrosis is silent, and the first doctor rarely has a way to flag it", False, 2)
for i, (stat, desc, col) in enumerate([
    ("50M+", "Indians live with chronic hepatitis B or C", c_primary),
    ("1 in 3", "urban adults has fatty liver disease (NAFLD)", c_primary),
    ("Silent", "no pain until cirrhosis: ascites, varices, encephalopathy", c_primary),
    ("Routine labs", "CBC and LFT are already ordered, but fibrosis risk is rarely calculated", c_red),
    ("Access gap", "elastography and hepatology are concentrated in metro centres", c_red),
    ("No triage", "Tier-2/3 clinics lack a simple rule for who needs referral", c_red),
]):
    x = Inches(0.8 + (i % 3) * 4.0)
    y = Inches(2.2 + (i // 3) * 1.9)
    card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.7), Inches(1.6))
    card.fill.solid()
    card.fill.fore_color.rgb = c_card_bg
    card.line.color.rgb = c_subtle_brd
    card.line.width = Pt(1)
    ctf = card.text_frame
    ctf.word_wrap = True
    ctf.paragraphs[0].text = stat
    ctf.paragraphs[0].font.name = "Arial"
    ctf.paragraphs[0].font.size = Pt(22)
    ctf.paragraphs[0].font.bold = True
    ctf.paragraphs[0].font.color.rgb = col
    cp1 = ctf.add_paragraph()
    cp1.text = desc
    cp1.font.name = "Arial"
    cp1.font.size = Pt(11)
    cp1.font.color.rgb = c_muted_text
    cp1.space_before = Pt(4)
tb2 = s2.shapes.add_textbox(Inches(0.8), Inches(6.0), Inches(11.733), Inches(0.5))
tb2.text_frame.paragraphs[0].text = "The gap is not data. It is a cheap, automatic way to act on data already in the report."
tb2.text_frame.paragraphs[0].font.name = "Arial"
tb2.text_frame.paragraphs[0].font.size = Pt(12)
tb2.text_frame.paragraphs[0].font.bold = True
tb2.text_frame.paragraphs[0].font.color.rgb = c_dark_text

# Slide 3: Built for primary care, Tier-2/3 clinics
s3 = prs.slides.add_slide(blank_layout)
bg3 = s3.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg3.fill.solid()
bg3.fill.fore_color.rgb = c_light_bg
bg3.line.fill.background()
add_header(s3, "Built for primary care, Tier-2/3 clinics", "One engine, three people who benefit", False, 3)
for i, (btext, role, desc, col) in enumerate([
    ("GP", "Primary care physician", "Enter four values from a routine report. Get a risk tier and the next step in seconds.", c_primary),
    ("Lab", "Clinic or diagnostic lab", "Auto-flag fibrosis risk on every CBC + LFT report, with no new equipment.", c_orange),
    ("Hep", "Referral hepatologist", "Receives prioritised, explained referrals instead of undifferentiated ones.", c_primary),
]):
    x = Inches(0.8 + i * 4.0)
    y = Inches(2.2)
    card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.7), Inches(3.5))
    card.fill.solid()
    card.fill.fore_color.rgb = c_card_bg
    card.line.color.rgb = c_subtle_brd
    card.line.width = Pt(1)
    circ = s3.shapes.add_shape(MSO_SHAPE.OVAL, x + Inches(0.3), y + Inches(0.3), Inches(0.7), Inches(0.7))
    circ.fill.solid()
    circ.fill.fore_color.rgb = col
    circ.line.fill.background()
    cp = circ.text_frame.paragraphs[0]
    cp.text = btext
    cp.font.name = "Arial"
    cp.font.size = Pt(12)
    cp.font.bold = True
    cp.font.color.rgb = c_white
    cp.alignment = PP_ALIGN.CENTER
    tb = s3.shapes.add_textbox(x + Inches(0.3), y + Inches(1.2), Inches(3.1), Inches(2.0))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.paragraphs[0].text = role
    tf.paragraphs[0].font.name = "Arial"
    tf.paragraphs[0].font.size = Pt(15)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = c_dark_text
    p1 = tf.add_paragraph()
    p1.text = desc
    p1.font.name = "Arial"
    p1.font.size = Pt(11)
    p1.font.color.rgb = c_muted_text
    p1.space_before = Pt(8)
tb3 = s3.shapes.add_textbox(Inches(0.8), Inches(6.0), Inches(11.733), Inches(0.5))
tb3.text_frame.paragraphs[0].text = "Automated screening and triage. Decision support, never a diagnosis."
tb3.text_frame.paragraphs[0].font.name = "Arial"
tb3.text_frame.paragraphs[0].font.size = Pt(12)
tb3.text_frame.paragraphs[0].font.bold = True
tb3.text_frame.paragraphs[0].font.color.rgb = c_dark_text

# Slide 4: Four routine values in, a decision out
s4 = prs.slides.add_slide(blank_layout)
bg4 = s4.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg4.fill.solid()
bg4.fill.fore_color.rgb = c_light_bg
bg4.line.fill.background()
add_header(s4, "Four routine values in, a decision out", "Validated, published scores first. Machine learning is a labelled second opinion", False, 4)
for i, (title_step, desc) in enumerate([
    ("1 Inputs", "Age, AST, ALT, platelets from a standard CBC + LFT. Optional: albumin, BMI, diabetes."),
    ("2 Validated scores", "FIB-4 and APRI, with formulas visible. NAFLD Fibrosis Score when extra inputs exist."),
    ("3 Triage", "Low, indeterminate or high tier with a plain-language next step.")
]):
    x = Inches(0.8 + i * 4.0)
    card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.2), Inches(3.7), Inches(2.0))
    card.fill.solid()
    card.fill.fore_color.rgb = c_card_bg
    card.line.color.rgb = c_subtle_brd
    card.line.width = Pt(1)
    ctf = card.text_frame
    ctf.word_wrap = True
    ctf.paragraphs[0].text = title_step
    ctf.paragraphs[0].font.name = "Arial"
    ctf.paragraphs[0].font.size = Pt(16)
    ctf.paragraphs[0].font.bold = True
    ctf.paragraphs[0].font.color.rgb = c_primary
    p1 = ctf.add_paragraph()
    p1.text = desc
    p1.font.name = "Arial"
    p1.font.size = Pt(11)
    p1.font.color.rgb = c_muted_text
    p1.space_before = Pt(6)
fb4 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(4.6), Inches(11.733), Inches(1.3))
fb4.fill.solid()
fb4.fill.fore_color.rgb = RGBColor(15, 23, 42)
fb4.line.fill.background()
ftf4 = fb4.text_frame
ftf4.word_wrap = True
ftf4.paragraphs[0].text = "FIB-4 = (Age x AST) / (Platelets x sqrt(ALT))"
ftf4.paragraphs[0].font.name = "Arial"
ftf4.paragraphs[0].font.size = Pt(13)
ftf4.paragraphs[0].font.bold = True
ftf4.paragraphs[0].font.color.rgb = c_orange
p1 = ftf4.add_paragraph()
p1.text = "APRI = (AST / upper limit of normal) / Platelets x 100"
p1.font.name = "Arial"
p1.font.size = Pt(13)
p1.font.bold = True
p1.font.color.rgb = c_orange
p1.space_before = Pt(4)
p2 = ftf4.add_paragraph()
p2.text = "Platelets in 10^9/L. Published, widely used formulas: no black box in the first step."
p2.font.name = "Arial"
p2.font.size = Pt(10)
p2.font.color.rgb = RGBColor(148, 163, 184)
p2.space_before = Pt(4)

# Slide 5: Three tiers, three clear next steps
s5 = prs.slides.add_slide(blank_layout)
bg5 = s5.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg5.fill.solid()
bg5.fill.fore_color.rgb = c_light_bg
bg5.line.fill.background()
add_header(s5, "Three tiers, three clear next steps", "Published FIB-4 thresholds drive the tier. Local protocol always governs", False, 5)
for i, (btier, thresh, act, col) in enumerate([
    ("LOW", "FIB-4 below 1.3", "Manage in clinic. Lifestyle and metabolic counselling, periodic repeat labs.", c_green),
    ("INDETERMINATE", "FIB-4 1.3 to 2.67", "Second-line test: elastography or ELF at the nearest centre. Recheck labs.", c_amber),
    ("HIGH", "FIB-4 above 2.67", "Refer to hepatology. Consider elastography and variceal screening.", c_red),
]):
    x = Inches(0.8 + i * 4.0)
    card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.2), Inches(3.7), Inches(3.2))
    card.fill.solid()
    card.fill.fore_color.rgb = c_card_bg
    card.line.color.rgb = c_subtle_brd
    card.line.width = Pt(1)
    pill = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x + Inches(0.3), Inches(2.5), Inches(3.1), Inches(0.4))
    pill.fill.solid()
    pill.fill.fore_color.rgb = col
    pill.line.fill.background()
    pill.text_frame.paragraphs[0].text = btier
    pill.text_frame.paragraphs[0].font.name = "Arial"
    pill.text_frame.paragraphs[0].font.size = Pt(10)
    pill.text_frame.paragraphs[0].font.bold = True
    pill.text_frame.paragraphs[0].font.color.rgb = c_white
    pill.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    tb = s5.shapes.add_textbox(x + Inches(0.3), Inches(3.1), Inches(3.1), Inches(2.0))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.paragraphs[0].text = thresh
    tf.paragraphs[0].font.name = "Arial"
    tf.paragraphs[0].font.size = Pt(16)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = c_dark_text
    p1 = tf.add_paragraph()
    p1.text = act
    p1.font.name = "Arial"
    p1.font.size = Pt(11)
    p1.font.color.rgb = c_muted_text
    p1.space_before = Pt(8)
tb5 = s5.shapes.add_textbox(Inches(0.8), Inches(5.8), Inches(11.733), Inches(0.5))
tb5.text_frame.paragraphs[0].text = "Age 65 and over uses the lower 2.0 cutoff. APRI is shown alongside for concordance."
tb5.text_frame.paragraphs[0].font.name = "Arial"
tb5.text_frame.paragraphs[0].font.size = Pt(11.5)
tb5.text_frame.paragraphs[0].font.color.rgb = c_muted_text

# Slide 6: What the primary care doctor sees
s6 = prs.slides.add_slide(blank_layout)
bg6 = s6.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg6.fill.solid()
bg6.fill.fore_color.rgb = c_light_bg
bg6.line.fill.background()
add_header(s6, "What the primary care doctor sees", "One screen: tier, reason, recommended action, and the labs behind it", False, 6)
t_box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.2), Inches(7.2), Inches(3.8))
t_box.fill.solid()
t_box.fill.fore_color.rgb = c_card_bg
t_box.line.color.rgb = c_subtle_brd
t_box.line.width = Pt(1)
ttf = t_box.text_frame
ttf.word_wrap = True
ttf.paragraphs[0].text = "LIVE CLINICAL WORKSTATION SCREEN"
ttf.paragraphs[0].font.name = "Arial"
ttf.paragraphs[0].font.size = Pt(11)
ttf.paragraphs[0].font.bold = True
ttf.paragraphs[0].font.color.rgb = c_primary
for ptext, col in [
    ("• Patient 1: Vikram Malhotra (45M) - AST 110, ALT 124, PLT 118 -> FIB-4 3.77 [HIGH RISK F3-F4]", c_red),
    ("  Action: Urgent elastography referral, upper endoscopy for variceal screening.", c_muted_text),
    ("• Patient 2: Aakash Deshmukh (34M) - AST 31, ALT 36, PLT 235 -> FIB-4 0.74 [NORMAL F0]", c_green),
    ("  Action: Stable suppression, continue annual ultrasound surveillance.", c_muted_text),
    ("• Interactive: Dynamic Couinaud Liver Anatomy, TreeSHAP feature importance, What-If simulator.", c_dark_text),
]:
    p = ttf.add_paragraph()
    p.text = ptext
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.color.rgb = col
    p.space_before = Pt(4)
for i, (head, sub) in enumerate([
    ("Tier and action", "Plain-language next step in the same panel"),
    ("Labs in context", "Each value against its reference range and baseline"),
    ("Visible formula", "FIB-4 and APRI one hover away")
]):
    box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.3), Inches(2.2 + i * 1.3), Inches(4.2), Inches(1.1))
    box.fill.solid()
    box.fill.fore_color.rgb = c_card_bg
    box.line.color.rgb = c_subtle_brd
    box.line.width = Pt(1)
    btf = box.text_frame
    btf.word_wrap = True
    btf.paragraphs[0].text = head
    btf.paragraphs[0].font.name = "Arial"
    btf.paragraphs[0].font.size = Pt(13)
    btf.paragraphs[0].font.bold = True
    btf.paragraphs[0].font.color.rgb = c_primary
    p = btf.add_paragraph()
    p.text = sub
    p.font.name = "Arial"
    p.font.size = Pt(10)
    p.font.color.rgb = c_muted_text
    p.space_before = Pt(3)

# Slide 7: Explainability from real SHAP values
s7 = prs.slides.add_slide(blank_layout)
bg7 = s7.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg7.fill.solid()
bg7.fill.fore_color.rgb = c_light_bg
bg7.line.fill.background()
add_header(s7, "Explainability from real SHAP values", "Per-patient attributions computed server-side, not hard-coded rules", False, 7)
for i, step in enumerate([
    "Lab values (identifiers masked)", "FastAPI endpoint, Pydantic-validated",
    "Tree-ensemble model", "shap.TreeExplainer", "Top contributing factors in the UI"
]):
    b = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.2 + i * 0.75), Inches(5.2), Inches(0.6))
    b.fill.solid()
    b.fill.fore_color.rgb = c_dark_bg
    b.line.fill.background()
    bp = b.text_frame.paragraphs[0]
    bp.text = step
    bp.font.name = "Arial"
    bp.font.size = Pt(10.5)
    bp.font.bold = True
    bp.font.color.rgb = c_white
    bp.alignment = PP_ALIGN.CENTER
rcard7 = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.5), Inches(2.2), Inches(6.0), Inches(3.6))
rcard7.fill.solid()
rcard7.fill.fore_color.rgb = c_card_bg
rcard7.line.color.rgb = c_subtle_brd
rcard7.line.width = Pt(1)
rtf7 = rcard7.text_frame
rtf7.word_wrap = True
rtf7.paragraphs[0].text = "Why this is credible"
rtf7.paragraphs[0].font.name = "Arial"
rtf7.paragraphs[0].font.size = Pt(16)
rtf7.paragraphs[0].font.bold = True
rtf7.paragraphs[0].font.color.rgb = c_primary
for r in [
    "Transparent first: FIB-4 and APRI are the primary, auditable score",
    "SHAP explains the ML second opinion for each individual patient",
    "Same inputs always give the same attributions",
    "Attributions explain the model, not biology: no causal claims"
]:
    p = rtf7.add_paragraph()
    p.text = "• " + r
    p.font.name = "Arial"
    p.font.size = Pt(10.5)
    p.font.color.rgb = c_muted_text
    p.space_before = Pt(8)

# Slide 8: Trends from the patient's own labs
s8 = prs.slides.add_slide(blank_layout)
bg8 = s8.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg8.fill.solid()
bg8.fill.fore_color.rgb = c_light_bg
bg8.line.fill.background()
add_header(s8, "Trends from the patient's own labs", "Serial FIB-4 from dated lab panels, not hand-set drift sliders", False, 8)
lcard8 = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.2), Inches(6.0), Inches(3.8))
lcard8.fill.solid()
lcard8.fill.fore_color.rgb = c_card_bg
lcard8.line.color.rgb = c_subtle_brd
lcard8.line.width = Pt(1)
ltf8 = lcard8.text_frame
ltf8.word_wrap = True
ltf8.paragraphs[0].text = "SERIAL LONGITUDINAL TRAJECTORY"
ltf8.paragraphs[0].font.name = "Arial"
ltf8.paragraphs[0].font.size = Pt(12)
ltf8.paragraphs[0].font.bold = True
ltf8.paragraphs[0].font.color.rgb = c_primary
for pt, col in [
    ("Visit 1 (Baseline - 12m ago):", c_dark_text),
    ("AST 78 U/L, ALT 92 U/L, Platelets 142 x 10^9/L -> FIB-4 = 2.58 (Indeterminate Zone)", c_amber),
    ("Visit 2 (Current - Month 0):", c_dark_text),
    ("AST 110 U/L, ALT 124 U/L, Platelets 118 x 10^9/L -> FIB-4 = 3.77 (Breached 2.67 Cutoff)", c_red)
]:
    p = ltf8.add_paragraph()
    p.text = pt
    p.font.name = "Arial"
    p.font.size = Pt(9.5)
    p.font.color.rgb = col
    p.space_before = Pt(6)
rcard8 = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.2), Inches(2.2), Inches(5.3), Inches(3.8))
rcard8.fill.solid()
rcard8.fill.fore_color.rgb = c_card_bg
rcard8.line.color.rgb = c_subtle_brd
rcard8.line.width = Pt(1)
rtf8 = rcard8.text_frame
rtf8.word_wrap = True
rtf8.paragraphs[0].text = "From the app's own data"
rtf8.paragraphs[0].font.name = "Arial"
rtf8.paragraphs[0].font.size = Pt(16)
rtf8.paragraphs[0].font.bold = True
rtf8.paragraphs[0].font.color.rgb = c_primary
for n in [
    "Baseline AST 78, ALT 92, platelets 142: FIB-4 2.58",
    "Current AST 110, ALT 124, platelets 118: FIB-4 3.77",
    "Crosses the 2.67 high-risk cutoff: escalate immediately to hepatology",
    "Next: fit validated progression models on real serial cohorts"
]:
    p = rtf8.add_paragraph()
    p.text = "• " + n
    p.font.name = "Arial"
    p.font.size = Pt(11)
    p.font.color.rgb = c_muted_text
    p.space_before = Pt(8)

# Slide 9: Validation: how we earn trust
s9 = prs.slides.add_slide(blank_layout)
bg9 = s9.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg9.fill.solid()
bg9.fill.fore_color.rgb = c_light_bg
bg9.line.fill.background()
add_header(s9, "Validation: how we earn trust", "We make no accuracy claim today. Here is the plan that would justify one", False, 9)
for i, (num, tp, desc) in enumerate([
    ("1", "Reference standard", "Transient elastography (FibroScan) and biopsy where available, on real patients."),
    ("2", "What we report", "Sensitivity, specificity, PPV and NPV at the referral thresholds, plus calibration, against FIB-4 alone."),
    ("3", "Where we test", "Retrospective Indian clinic and lab data first, then a prospective pilot across more than one site.")
]):
    x = Inches(0.8 + i * 4.0)
    card = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.2), Inches(3.7), Inches(2.8))
    card.fill.solid()
    card.fill.fore_color.rgb = c_card_bg
    card.line.color.rgb = c_subtle_brd
    card.line.width = Pt(1)
    circ = s9.shapes.add_shape(MSO_SHAPE.OVAL, x + Inches(0.3), Inches(2.5), Inches(0.6), Inches(0.6))
    circ.fill.solid()
    circ.fill.fore_color.rgb = c_primary
    circ.line.fill.background()
    circ.text_frame.paragraphs[0].text = num
    circ.text_frame.paragraphs[0].font.name = "Arial"
    circ.text_frame.paragraphs[0].font.size = Pt(12)
    circ.text_frame.paragraphs[0].font.bold = True
    circ.text_frame.paragraphs[0].font.color.rgb = c_white
    circ.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER
    tb = s9.shapes.add_textbox(x + Inches(0.3), Inches(3.3), Inches(3.1), Inches(1.5))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.paragraphs[0].text = tp
    tf.paragraphs[0].font.name = "Arial"
    tf.paragraphs[0].font.size = Pt(15)
    tf.paragraphs[0].font.bold = True
    tf.paragraphs[0].font.color.rgb = c_dark_text
    p1 = tf.add_paragraph()
    p1.text = desc
    p1.font.name = "Arial"
    p1.font.size = Pt(10.5)
    p1.font.color.rgb = c_muted_text
    p1.space_before = Pt(6)
bn9 = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.4), Inches(11.733), Inches(0.8))
bn9.fill.solid()
bn9.fill.fore_color.rgb = RGBColor(15, 23, 42)
bn9.line.fill.background()
bn9.text_frame.paragraphs[0].text = "Today's demo runs on a synthetic cohort to show the workflow. It is not clinical evidence."
bn9.text_frame.paragraphs[0].font.name = "Arial"
bn9.text_frame.paragraphs[0].font.size = Pt(11)
bn9.text_frame.paragraphs[0].font.color.rgb = c_white
bn9.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

# Slide 10: Privacy and interoperability by design
s10 = prs.slides.add_slide(blank_layout)
bg10 = s10.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg10.fill.solid()
bg10.fill.fore_color.rgb = c_light_bg
bg10.line.fill.background()
add_header(s10, "Privacy and interoperability by design", "Built to fit into real clinics and national health infrastructure", False, 10)
l10 = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.2), Inches(5.6), Inches(3.8))
l10.fill.solid()
l10.fill.fore_color.rgb = c_card_bg
l10.line.color.rgb = c_subtle_brd
l10.line.width = Pt(1)
ltf10 = l10.text_frame
ltf10.word_wrap = True
ltf10.paragraphs[0].text = "Role-based sign-in & Identity Gateway"
ltf10.paragraphs[0].font.name = "Arial"
ltf10.paragraphs[0].font.size = Pt(14)
ltf10.paragraphs[0].font.bold = True
ltf10.paragraphs[0].font.color.rgb = c_primary
for t, col in [
    ("Clinician Workstation Mode: Access full triage, Couinaud segmentation, and prescription matrix.", c_muted_text),
    ("Patient Portal Mode: Patient awareness guide, destigmatization center, Indian diet recommendations.", c_muted_text)
]:
    p = ltf10.add_paragraph()
    p.text = t
    p.font.name = "Arial"
    p.font.size = Pt(10)
    p.font.color.rgb = col
    p.space_before = Pt(8)
for i, (head, desc) in enumerate([
    ("DPDP 2023", "Client-side masking turns names and IDs into hashes before transmission."),
    ("ABDM and FHIR R4", "ABHA IDs, FHIR fields and consent artifacts ready for national scale."),
    ("Engineering checks", "Vitest 11 of 11 passing, strict TypeScript with 0 compilation errors.")
]):
    box = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.2 + i * 1.3), Inches(5.7), Inches(1.1))
    box.fill.solid()
    box.fill.fore_color.rgb = c_card_bg
    box.line.color.rgb = c_subtle_brd
    box.line.width = Pt(1)
    btf = box.text_frame
    btf.word_wrap = True
    btf.paragraphs[0].text = head
    btf.paragraphs[0].font.name = "Arial"
    btf.paragraphs[0].font.size = Pt(13)
    btf.paragraphs[0].font.bold = True
    btf.paragraphs[0].font.color.rgb = c_primary
    p = btf.add_paragraph()
    p.text = desc
    p.font.name = "Arial"
    p.font.size = Pt(10)
    p.font.color.rgb = c_muted_text
    p.space_before = Pt(3)

# Slide 11: Pilot plan and what we will measure
s11 = prs.slides.add_slide(blank_layout)
bg11 = s11.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg11.fill.solid()
bg11.fill.fore_color.rgb = c_light_bg
bg11.line.fill.background()
add_header(s11, "Pilot plan and what we will measure", "Targets to measure in Tier-2/3 clinics, not claims we are making today", False, 11)
for i, (ph_name, ph_desc, col) in enumerate([
    ("Phase 1", "Retrospective validation on real labelled data", c_primary),
    ("Phase 2", "Shadow-mode pilot: flag risk, doctors decide as usual", c_dark_bg),
    ("Phase 3", "Live triage in clinics and diagnostic labs", c_primary)
]):
    pcard = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + i * 4.0), Inches(2.1), Inches(3.7), Inches(1.2))
    pcard.fill.solid()
    pcard.fill.fore_color.rgb = col
    pcard.line.fill.background()
    ptf = pcard.text_frame
    ptf.word_wrap = True
    ptf.paragraphs[0].text = ph_name
    ptf.paragraphs[0].font.name = "Arial"
    ptf.paragraphs[0].font.size = Pt(13)
    ptf.paragraphs[0].font.bold = True
    ptf.paragraphs[0].font.color.rgb = c_orange
    p1 = ptf.add_paragraph()
    p1.text = ph_desc
    p1.font.name = "Arial"
    p1.font.size = Pt(9.5)
    p1.font.color.rgb = c_white
    p1.space_before = Pt(2)
for i, (m_title, m_desc) in enumerate([
    ("Coverage", "share of routine CBC + LFT reports with a fibrosis risk computed"),
    ("Referral quality", "share of referred patients who truly need specialist care"),
    ("Avoided referrals", "low-tier patients safely managed in primary care"),
    ("Time to specialist", "days from high-tier flag to hepatology visit")
]):
    mcard = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + (i % 2) * 6.0), Inches(3.7 + (i // 2) * 1.3), Inches(5.7), Inches(1.1))
    mcard.fill.solid()
    mcard.fill.fore_color.rgb = c_card_bg
    mcard.line.color.rgb = c_subtle_brd
    mcard.line.width = Pt(1)
    mtf = mcard.text_frame
    mtf.word_wrap = True
    mtf.paragraphs[0].text = m_title
    mtf.paragraphs[0].font.name = "Arial"
    mtf.paragraphs[0].font.size = Pt(12)
    mtf.paragraphs[0].font.bold = True
    mtf.paragraphs[0].font.color.rgb = c_primary
    p = mtf.add_paragraph()
    p.text = m_desc
    p.font.name = "Arial"
    p.font.size = Pt(10)
    p.font.color.rgb = c_muted_text
    p.space_before = Pt(2)

# Slide 12: Catch fibrosis at the first blood test
s12 = prs.slides.add_slide(blank_layout)
bg12 = s12.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg12.fill.solid()
bg12.fill.fore_color.rgb = c_dark_bg
bg12.line.fill.background()
add_header(s12, "Catch fibrosis at the first blood test", "Low-cost screening and triage for primary care and Tier-2/3 clinics across India.", True, 12)
for i, (c_head, c_sub) in enumerate([
    ("Routine labs", "No new equipment, just CBC + LFT"),
    ("Transparent", "Published formulas plus real SHAP"),
    ("Right referral", "Elastography and hepatology for those who need them")
]):
    cd = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8 + i * 4.0), Inches(2.3), Inches(3.7), Inches(1.8))
    cd.fill.solid()
    cd.fill.fore_color.rgb = RGBColor(15, 23, 42)
    cd.line.color.rgb = c_primary
    cd.line.width = Pt(1.5)
    cdtf = cd.text_frame
    cdtf.word_wrap = True
    cdtf.paragraphs[0].text = c_head
    cdtf.paragraphs[0].font.name = "Arial"
    cdtf.paragraphs[0].font.size = Pt(16)
    cdtf.paragraphs[0].font.bold = True
    cdtf.paragraphs[0].font.color.rgb = c_orange
    p1 = cdtf.add_paragraph()
    p1.text = c_sub
    p1.font.name = "Arial"
    p1.font.size = Pt(11)
    p1.font.color.rgb = c_white
    p1.space_before = Pt(6)
alb = s12.shapes.add_textbox(Inches(0.8), Inches(4.6), Inches(11.733), Inches(1.2))
altf = alb.text_frame
altf.word_wrap = True
altf.paragraphs[0].text = "Try it now: hepatwin.vercel.app"
altf.paragraphs[0].font.name = "Arial"
altf.paragraphs[0].font.size = Pt(20)
altf.paragraphs[0].font.bold = True
altf.paragraphs[0].font.color.rgb = c_white
p = altf.add_paragraph()
p.text = "Code: github.com/Parthkala/Repository1"
p.font.name = "Arial"
p.font.size = Pt(14)
p.font.color.rgb = RGBColor(148, 163, 184)
p.space_before = Pt(4)
discb = s12.shapes.add_textbox(Inches(0.8), Inches(6.0), Inches(11.733), Inches(0.5))
discb.text_frame.paragraphs[0].text = "Decision support for screening and triage. Not an approved medical device. Demo data is synthetic."
discb.text_frame.paragraphs[0].font.name = "Arial"
discb.text_frame.paragraphs[0].font.size = Pt(9.5)
discb.text_frame.paragraphs[0].font.color.rgb = RGBColor(148, 163, 184)

prs.save(PPTX_PATH)
# Also save as HepaTwin_Presentation_Deck.pptx
prs.save(os.path.join(OUTPUT_DIR, "HepaTwin_Presentation_Deck.pptx"))
print("Saved both PPTX files!")
