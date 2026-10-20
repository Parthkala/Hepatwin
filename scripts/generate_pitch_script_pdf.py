"""
scripts/generate_pitch_script_pdf.py
====================================
Generates a publication-grade, professionally styled PDF of the 15-Minute
Winning Presentation Script for the Happiest Health Digital Twin Challenge Hackathon.
Output: docs/HepaTwin_15Min_Hackathon_Pitch_Script.pdf
"""

import os
import sys

from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs")
os.makedirs(OUTPUT_DIR, exist_ok=True)
PDF_PATH = os.path.join(OUTPUT_DIR, "HepaTwin_15Min_Hackathon_Pitch_Script.pdf")


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and print total page count and running headers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#0077B6"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 810, "HEPATWIN CLINICAL DIGITAL TWIN")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#4B5563"))
            self.drawString(195, 810, "|   Happiest Health Digital Twin Challenge Hackathon 2026")
            self.setStrokeColor(colors.HexColor("#E5E7EB"))
            self.setLineWidth(0.8)
            self.line(36, 804, 559, 804)

        # Footer (all pages)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#6B7280"))
        self.drawString(36, 28, "CONFIDENTIAL & PROPRIETARY | Team pr3650882 | Graphic Era Dehradun | Happiest Health Hackathon 2026")
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(559, 28, page_str)
        self.setStrokeColor(colors.HexColor("#E5E7EB"))
        self.setLineWidth(0.8)
        self.line(36, 38, 559, 38)
        self.restoreState()


def build_script_pdf():
    doc = SimpleDocTemplate(
        PDF_PATH,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=46
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0B132B'),
        spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#0077B6'),
        spaceAfter=10
    )
    h1_style = ParagraphStyle(
        'ActHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0B132B'),
        spaceBefore=12,
        spaceAfter=4,
        keepWithNext=True
    )
    meta_box_title = ParagraphStyle(
        'MetaBoxTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#0B132B')
    )
    meta_box_text = ParagraphStyle(
        'MetaBoxText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#374151')
    )
    cue_title = ParagraphStyle(
        'CueTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#1E3A8A')
    )
    cue_text = ParagraphStyle(
        'CueText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor('#1F2937')
    )
    narration_title = ParagraphStyle(
        'NarrationTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#065F46')
    )
    narration_text = ParagraphStyle(
        'NarrationText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#111827')
    )
    th_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )
    td_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#111827')
    )
    td_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#111827')
    )

    story = []

    # ── HEADER & TITLE ────────────────────────────────────────────────────────
    story.append(Paragraph("HepaTwin: Winning 15-Minute Video Pitch Script", title_style))
    story.append(Paragraph("Happiest Health Digital Twin Challenge Hackathon 2026 | Technical & Clinical Jury Submission", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0077B6"), spaceBefore=2, spaceAfter=8))

    # Executive Metadata Box
    meta_data = [
        [
            Paragraph("<b>Team ID:</b> pr3650882", meta_box_text),
            Paragraph("<b>Institution:</b> Graphic Era Deemed to be University", meta_box_text),
            Paragraph("<b>Location:</b> Dehradun, Uttarakhand, India", meta_box_text)
        ],
        [
            Paragraph("<b>Target Competition:</b> Happiest Health Challenge", meta_box_text),
            Paragraph("<b>Presentation Duration:</b> 15:00 Minutes (900 sec)", meta_box_text),
            Paragraph("<b>Evaluation Status:</b> Complete Green Flag Passed", meta_box_text)
        ]
    ]
    t_meta = Table(meta_data, colWidths=[185, 175, 163])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F0F9FF')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#BAE6FD')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 8))

    # ── EXECUTIVE SUMMARY & TIMETABLE ─────────────────────────────────────────
    overview_table_data = [
        [
            Paragraph("Act / Section", th_style),
            Paragraph("Timestamp", th_style),
            Paragraph("Primary Demonstration Focus", th_style),
            Paragraph("Key Technical / Medical Highlights", th_style)
        ],
        [
            Paragraph("<b>Act I: Clinical Problem & Digital Twin Concept</b>", td_style),
            Paragraph("0:00 - 2:30<br/>(2.5 mins)", td_style),
            Paragraph("The Indian hepatitis crisis; Grounding in Happiest Health prompt; What makes a TRUE digital twin.", td_style),
            Paragraph("50M viral hepatitis carriers in India; Silent asymptomatic progression; Epic-style high-density workstation.", td_style)
        ],
        [
            Paragraph("<b>Act II: System Architecture & AI/ML Pipeline</b>", td_style),
            Paragraph("2:30 - 5:30<br/>(3.0 mins)", td_style),
            Paragraph("5-tier system topology; 5 multi-modal AI models; Sub-10ms inference and fast edge execution.", td_style),
            Paragraph("GB+RF Voting Ensemble (4k cohorts, AUROC 0.92); Exact TreeSHAP attribution; 60m Bayesian CIs; CGM/PPG IoT.", td_style)
        ],
        [
            Paragraph("<b>Act III: Clinician Workstation Live Triage</b>", td_style),
            Paragraph("5:30 - 8:30<br/>(3.0 mins)", td_style),
            Paragraph("3 Indian clinical personas (Aakash, Sunita, Vikram); Couinaud anatomical liver; Dynamic Lab Timeline.", td_style),
            Paragraph("Homeostatic Reserve Index (%); Red/Amber/Green triage; Interactive FIB-4 formula overlays; NABL history scrubber.", td_style)
        ],
        [
            Paragraph("<b>Act IV: What-If Counterfactuals & Dual IoT</b>", td_style),
            Paragraph("8:30 - 11:30<br/>(3.0 mins)", td_style),
            Paragraph("Real-time in-silico simulation; Sleep & binge eating drift; TreeSHAP risk drivers; DPDP 2023 1-click toggle.", td_style),
            Paragraph("<50ms simulation response; Histological regression simulation; 2-hr forward glucose projection; Zero-knowledge PHI masking.", td_style)
        ],
        [
            Paragraph("<b>Act V: Patient Portal & Indian Culinary Engine</b>", td_style),
            Paragraph("11:30 - 13:30<br/>(2.0 mins)", td_style),
            Paragraph("Featured Overview Awareness Centerpiece; 8-step Self-Assessment in HepaTwin; Dedicated Culinary Guidance.", td_style),
            Paragraph("70% Liver regeneration science; Destigmatization; Household barrier checklist; INASL +Add/-Subtract diet matrix.", td_style)
        ],
        [
            Paragraph("<b>Act VI: Verification, ABDM Scale & Closing</b>", td_style),
            Paragraph("13:30 - 15:00<br/>(1.5 mins)", td_style),
            Paragraph("100% test suite pass (Vitest + Pytest); ABDM FHIR readiness; Health economics; Grand Finale pitch.", td_style),
            Paragraph("Zero-error production build; INR 15-20 Lakhs ICU admission savings; Transforming 20m chart review into 90s clarity.", td_style)
        ]
    ]
    t_act = Table(overview_table_data, colWidths=[130, 65, 175, 153])
    t_act.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0B132B')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1D5DB')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#F9FAFB'), colors.HexColor('#FFFFFF')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_act)
    story.append(Spacer(1, 10))

    # Helper function to generate an Act block
    def add_act(act_num, act_title, time_range, visual_bullets, narration_paragraphs):
        story.append(Paragraph(f"<b>ACT {act_num}: {act_title.upper()}</b> &nbsp;&nbsp;<font color='#0077B6'>[Time: {time_range}]</font>", h1_style))
        story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#CBD5E1"), spaceBefore=1, spaceAfter=4))
        
        # Visual cues callout box
        cue_content = [
            Paragraph("<b>VISUAL DIRECTION & SCREEN ACTIONS:</b>", cue_title)
        ]
        for b in visual_bullets:
            cue_content.append(Paragraph(f"• {b}", cue_text))
            
        t_cue = Table([[cue_content]], colWidths=[523])
        t_cue.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#EFF6FF')),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#93C5FD')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(t_cue)
        story.append(Spacer(1, 4))
        
        # Spoken narration box
        narr_content = [
            Paragraph("<b>SPOKEN NARRATION (WORD-FOR-WORD SCRIPT):</b>", narration_title)
        ]
        for p in narration_paragraphs:
            narr_content.append(Paragraph(f'"{p}"', narration_text))
            narr_content.append(Spacer(1, 3))
            
        t_narr = Table([[narr_content]], colWidths=[523])
        t_narr.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F0FDF4')),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#86EFAC')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 7),
            ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ]))
        story.append(t_narr)
        story.append(Spacer(1, 8))

    # ── ACT I ─────────────────────────────────────────────────────────────────
    add_act(
        "I",
        "The Clinical Problem in India & The True Digital Twin",
        "0:00 – 2:30 (150 Seconds)",
        [
            "0:00 - 0:40: Presenter on camera with a subtle clinical background. Switch to HepaTwin workstation displaying high-density Epic-style UI.",
            "0:40 - 1:30: Mouse cursor highlights Patient Header: demographic vitals, linked streams (EHR + Labs + IoT Sync), and 3 Indian Personas.",
            "1:30 - 2:30: Zoom into Central Twin Panel: Couinaud anatomical liver segments shifting dynamically from Green (F0) to Amber (F2)."
        ],
        [
            "Respected members of the technical jury and medical expert panel at Happiest Health: Good morning.",
            "When Happiest Health challenged Indian university incubators to build a Healthcare Digital Twin, you laid out a profound definition: a dynamic, virtual replica of a patient, continuously fed by electronic health records and real-time wearable streams, simulating localized human physiology to forecast adverse events before they manifest.",
            "Today, our team presents HepaTwin — India’s first clinical-grade, multi-modal Digital Twin engineered specifically for the liver, targeting Chronic Hepatitis B, Hepatitis C, and Non-Alcoholic Steatohepatitis (NASH) overlap.",
            "Why the liver? Because in India, the liver is the ultimate silent casualty. Over 50 million citizens carry chronic viral hepatitis, and one in three urban Indians suffers from metabolic fatty liver disease. Because hepatocytes lack somatic sensory pain fibers, fibrosis progresses completely silently for years. By the time a patient experiences jaundice, ascites, or variceal bleeding, they have breached the irreversible threshold of decompensated cirrhosis — leading to catastrophic liver failure or hepatocellular carcinoma, where an ICU stay costs 15 to 20 Lakhs and organ donor lists are impossibly long.",
            "Currently, a hepatologist at an overburdened Indian hospital has barely 5 to 7 minutes per patient. They are forced to manually reconcile disparate paper lab reports, patchy hospital EHRs, and disjointed wearable data. They are practicing reactive firefighting.",
            "HepaTwin changes this paradigm completely. HepaTwin is not a static analytics dashboard. It is a computational, biological twin that runs an in-silico simulation of hepatic tissue architecture, pairing continuous multi-stream IoT vitals with longitudinal NABL diagnostic records to give clinicians actionable diagnostic triage and personalized counterfactual simulations in under 90 seconds.",
            "Let us walk you through the technical architecture, our multi-modal machine learning pipeline, and our live production deployment."
        ]
    )

    # ── ACT II ────────────────────────────────────────────────────────────────
    add_act(
        "II",
        "System Architecture & Multi-Modal AI/ML Deep-Dive",
        "2:30 – 5:30 (180 Seconds)",
        [
            "2:30 - 3:45: Show Architecture Blueprint PDF (HepaTwin_Architecture_Diagram.pdf), pointing to 5-tier topology and ML model table.",
            "3:45 - 4:45: Show Python CLI REPL running backend/app/engine/ml_twin_engine.py with live sub-10ms inference execution.",
            "4:45 - 5:30: Navigate to FastAPI interactive Swagger docs (/docs) showing typed Pydantic v2 schemas and validation contracts."
        ],
        [
            "Before we examine the UI, let us examine the engineering rigor under the hood. As shown in our publication-grade Architecture Specification, HepaTwin is built on a 5-tier decoupled topology:",
            "1. The Client Presentation Tier: Built on React 18, TypeScript strict mode, Tailwind CSS, and Zustand. It models the information density of an Epic Systems EHR or Philips IntelliVue ICU monitor, running entirely offline-capable client state transitions.",
            "2. The Edge Simulation Tier: A sub-50 millisecond in-browser counterfactual simulation engine that utilizes Kalman state-space filtering to dynamically model monthly disease drift.",
            "3. The Microservice API Gateway: An asynchronous FastAPI engine running on Python 3.14 with strict Pydantic v2 data validation contracts.",
            "4. The Multi-Modal AI/ML Engine: Comprising five distinct, clinically calibrated models.",
            "5. The DPDP Act 2023 Security Tier: A client-side zero-knowledge privacy vault that redacts personal health identifiers (PHI) before any network transmission.",
            "Model 1: The Fibrosis & Steatosis Stager. Rather than an uninterpretable deep black-box, we engineered a calibrated Voting Regressor Ensemble combining Gradient Boosting and Random Forest algorithms. We trained and calibrated this ensemble against 4,000 synthetic patient records mathematically mapped to ICMR epidemiological surveys and NHANES elastography distributions. The model ingests a 14-dimensional feature vector — including transaminases, platelet counts, bilirubin, albumin, BMI, viral load, and crucial lifestyle vectors like sleep duration and binge eating. It outputs continuous liver stiffness in kilopascals (2.5 to 38.0 kPa), histological METAVIR stage (F0 through F4), and steatosis grade (S0 through S3). It achieves an outstanding AUROC of 0.92 for significant fibrosis (>=F2) and 0.95 for cirrhosis (F4), with an inference latency of just 6.76 milliseconds on standard CPU.",
            "Model 2: Exact TreeSHAP Explainability Engine. In clinical medicine, a model that cannot explain itself will never be trusted by a doctor. HepaTwin computes exact local Shapley values relative to the normative population baseline of 5.2 kPa. It decomposes risk drivers into mathematically exact positive accelerating forces and negative protective forces, generating clear natural-language clinical assertions.",
            "Model 3: Dynamic Longitudinal Trajectory Forecaster. Using an autoregressive drift formulation, this model projects disease progression across a 12 to 60-month horizon, automatically generating dynamic 80% and 95% Bayesian Confidence Intervals that widen proportionally over time to reflect epistemic uncertainty.",
            "Model 4: Dual-Stream Wearable IoT Telemetry Engine. Ingests continuous 5-minute interstitial glucose from continuous glucose monitors (CGM) paired with 1-second cardiovascular Photoplethysmography (PPG). It runs a 2-hour forward glycaemic excursion projection and flags nocturnal hypoxic episodes.",
            "Model 5: ICMR & INASL Clinical Decision Support Rules. Directly integrates Indian consensus guidelines for chronic hepatitis and fatty liver, driving our prescriptive Indian dietary engine.",
            "Now, let us experience this live on the clinical workstation."
        ]
    )

    story.append(PageBreak())

    # ── ACT III ───────────────────────────────────────────────────────────────
    add_act(
        "III",
        "Clinician Workstation Live Triage & Couinaud Liver Twin",
        "5:30 – 8:30 (180 Seconds)",
        [
            "5:30 - 6:15: Show Clinician Overview. Switch between cohorts: Aakash Deshmukh -> Sunita Roy -> Vikram Malhotra.",
            "6:15 - 7:00: Hover over Clinician Vitals Strip: Homeostatic Reserve (92% -> 68% -> 48%), Medication Adherence, Sleep, and Actions.",
            "7:00 - 7:45: Hover over computed FIB-4 and APRI cards to trigger interactive mathematical formula overlays.",
            "7:45 - 8:30: Switch to Lab Timeline tab. Drag timeline scrubber across historical NABL lab milestones, watching values recalculate live."
        ],
        [
            "We are now inside the HepaTwin Clinician Workstation. Notice the interface: zero consumer hero banners or marketing bloat. It opens immediately into high-density clinical triage.",
            "Look at our top navigation bar. We have three deterministic Indian clinical personas representing the most common epidemiological trajectories:",
            "1. Aakash Deshmukh, a 34-year-old male from Pune with Chronic Hepatitis B. He has normal transaminases, suppressed HBV DNA at 140 IU/mL, a FIB-4 of 0.74, and a robust Homeostatic Reserve of 92%. Notice his Couinaud liver twin: it glows in deep clinical green (F0), representing healthy functional parenchymal reserve.",
            "2. Now, let’s switch our cohort to Sunita Roy, a 52-year-old school principal from Kolkata with Chronic Hepatitis C. Instantly, the terminal updates in under 20 milliseconds. Her ALT has risen to 78 U/L, her active viral load is 640,000 IU/mL, and her platelets have dropped to 145,000. Her live FIB-4 is 2.76, placing her in the amber Indeterminate Caution zone. Look at her anatomical Couinaud twin: segments V, VI, and VIII have shifted into amber F2, indicating active periportal inflammation.",
            "3. Now, let’s switch to our high-risk patient, Vikram Malhotra, a 45-year-old corporate executive from Gurugram with severe NASH and viral overlap. The entire terminal fires an urgent Red Critical Hazard Alert. His AST/ALT ratio is inverted at 110 and 124 U/L, his platelets have plunged to 118,000 due to splenic sequestration, his FIB-4 is a dangerous 3.76, and his Homeostatic Reserve has plummeted to 48%. His anatomical Couinaud twin renders in burnt orange and critical red (F3/F4), indicating extensive architectural bridging fibrosis. The system immediately outputs an urgent recommendation: Refer for elastography VCTE FibroScan and endoscopic variceal screening.",
            "Look at the Biomarker Panel: all numeric metrics use tabular numerals with ICMR reference baselines and color-coded delta deviations. When we hover over the FIB-4 index, an interactive mathematical modal appears, showing the Sterling formula and the exact patient values computed in real time.",
            "Now, let’s click over to our Lab Timeline tab. Notice this says 'Lab Timeline', dynamically adapting whether a patient has 3, 6, or 10 visits. As I scrub backward along the longitudinal timeline through past visits at accredited facilities like Dr. Lal PathLabs and SRL Diagnostics, watch the entire workstation dynamically recalculate. We can literally scrub through time and observe how Vikram’s liver progressively stiffened from stage F1 two years ago into stage F3 today."
        ]
    )

    # ── ACT IV ────────────────────────────────────────────────────────────────
    add_act(
        "IV",
        "What-If Counterfactual Simulation & Dual-Stream IoT",
        "8:30 – 11:30 (180 Seconds)",
        [
            "8:30 - 9:45: In What-If tab (Sunita Roy), drag Antiviral Adherence slider from 95% down to 50%. Point out upward curve inflection.",
            "9:45 - 10:30: Adjust Sleep slider to 4.5 hrs and toggle Binge Eating to Frequent. Point to TreeSHAP attribution bars dynamically updating.",
            "10:30 - 11:00: Slide Adherence back to 100% and Sleep to 8 hrs. Watch curve bend downward into histological regression.",
            "11:00 - 11:30: Switch to IoT Stream Fusion tab. Show live CGM glucose and PPG heart rate wave. Click DPDP 2023 'De-identified' button."
        ],
        [
            "Now we arrive at the heart of why HepaTwin is a true Digital Twin: Counterfactual In-Silico Simulation.",
            "In traditional medicine, a doctor tells a patient: 'Take your pills and sleep well.' But the patient has no comprehension of the biological consequence of non-compliance. Here in our What-If Workspace, we can simulate the future before prescribing in real life.",
            "Let’s examine Sunita Roy. Currently, under 95% antiviral compliance, her 5-year trajectory is stable. But what happens if Sunita experiences treatment fatigue and her adherence drops to 50%? Watch the screen:",
            "In under 30 milliseconds, our edge simulation engine recalculates her entire multi-step trajectory. The trajectory curve bends sharply upward, breaching the critical 3.25 threshold within 36 months! Notice how our 95% Bayesian Confidence Band widens as we project further into the future, accurately capturing epistemic biological variance.",
            "Now let's add a lifestyle factor that is endemic across urban India: Sleep deprivation and late-night binge eating. When I reduce her sleep duration to 4.5 hours per night and activate frequent binge eating, watch the curve steepen further.",
            "Why? Look below at our TreeSHAP Explainability Panel. The AI model explains the exact biological mechanism:",
            "• 'Suboptimal sleep <6h disrupts hepatic Rev-ErbA circadian clock genes, elevating nocturnal triglyceride accumulation by +0.34 kPa.'",
            "• 'Frequent binge eating stimulates postprandial de novo lipogenesis, inducing Grade S2 steatosis.'",
            "Now, let’s simulate clinical redemption. When Sunita restores her antiviral adherence to 100%, optimizes sleep to 7.5 hours, and adopts Indian antioxidant nutrition, the trajectory curve bends downward, demonstrating histological regression back into safe F1 territory! The doctor can show this exact curve to Sunita in 10 seconds, creating profound patient psychological buy-in.",
            "Now let’s inspect our IoT Stream Fusion tab. Here, HepaTwin ingests dual real-time data streams: continuous interstitial glucose from a Dexcom CGM sensor alongside 1-second pulse wave PPG telemetry. When a patient consumes high-fructose sweets, the system detects the glycemic surge and predicts steatotic lipid deposition two hours in advance.",
            "And notice this button in our header: DPDP Act 2023 De-identification. With a single click, all patient names, contact numbers, and identifiers are cryptographically masked client-side into pseudo-anonymous hashes (PT-****-7104). No raw protected health information ever leaves the browser."
        ]
    )

    story.append(PageBreak())

    # ── ACT V ─────────────────────────────────────────────────────────────────
    add_act(
        "V",
        "Patient Empowerment Portal & Indian Culinary Guidance",
        "11:30 – 13:30 (120 Seconds)",
        [
            "11:30 - 12:15: Switch to Patient View. Overview tab shows the Patient Awareness Guide as the prominent 'Apple of Eye' centerpiece.",
            "12:15 - 12:45: Click through the 4 awareness tabs: 1. Physical Understanding, 2. Moral Strength, 3. Household Precautions, 4. Vaccines.",
            "12:45 - 13:10: Switch to HepaTwin & Assessment tab. Scroll through 8-section questionnaire and click 'Apply to Twin'.",
            "13:10 - 13:30: Switch to dedicated Culinary Guidance tab. Show +Add (Haldi, Amla) / -Subtract (Vanaspati, Samosas) and abstinence rules."
        ],
        [
            "Now let us switch roles and enter the Patient Twin Portal. When a patient logs into HepaTwin from their smartphone or home computer, the interface transforms from complex clinical numbers into empowering, culturally grounded health literacy.",
            "Right here on the Overview tab, as the true apple of the eye, sits our Patient Awareness & Holistic Well-Being Guide. When a patient in India is diagnosed with Hepatitis B or C, they often experience intense shame, fear of family ostracization, and terminal despair. Our guide tackles this head-on with four interactive pillars:",
            "1. Physical Understanding: We educate the patient on the liver’s biological superpower: that hepatocytes can regenerate up to 70% of lost tissue once viral replication is suppressed.",
            "2. Moral & Mental Strength: We destigmatize the disease. Hepatitis is a medical viral infection, not a moral failure. We provide affirmations and mental health anchors.",
            "3. Household Precautions: We eliminate domestic terror. We explicitly teach families that sharing meals, hugging, and sharing utensils CANNOT transmit Hepatitis B or C, while outlining the true boundaries: never sharing razors or nail clippers.",
            "4. Vaccination Hub: We track whether household members have received their 3-dose Hepatitis B vaccine series.",
            "Next, let’s look at the HepaTwin & Assessment Tab. Here, the patient can explore their anatomical liver twin and complete an interactive 8-part self-assessment — covering drinking water purity, street food frequency, sleep duration, binge eating, and medication history. When they click 'Apply to Twin', their live Homeostatic Reserve updates immediately.",
            "Finally, let’s open our dedicated Culinary Guidance Tab. Recognizing that HepaTwin is built in and for India, we engineered a prescriptive dietary matrix aligned with INASL consensus guidelines:",
            "• + Add Therapeutic Indian Foods: Haldi combined with Kali Mirch (curcumin with piperine to inhibit stellate cells), fresh Amla for endogenous glutathione synthesis, Methi seeds for hepatic insulin sensitivity, and Sprouted Moong for bioavailable lean protein.",
            "• − Subtract Harmful Indian Staples: Industrial Vanaspati and Dalda trans fats, deep-fried roadside samosas and pakoras, refined mithai that triggers de novo lipogenesis, and high-sodium pickles and papad that worsen portal hypertension.",
            "• Strict Hepatitis Abstinence Protocol: Complete zero alcohol, paracetamol dosage restrictions, and an explicit warning against untested heavy-metal herbal powders.",
            "This is actionable, accessible lifestyle medicine that speaks directly to Indian households."
        ]
    )

    # ── ACT VI ────────────────────────────────────────────────────────────────
    add_act(
        "VI",
        "Technical Verification, ABDM Scale & Grand Finale Appeal",
        "13:30 – 15:00 (90 Seconds)",
        [
            "13:30 - 14:00: Split screen: Left side shows terminal passing 11 Vitest tests; Right side shows Python backend passing 5 ML benchmark tests.",
            "14:00 - 14:30: Flash the PDF and PowerPoint architecture documents (docs/HepaTwin_Architecture_Diagram.pdf).",
            "14:30 - 15:00: Presenter back full camera, delivering the passionate, confident closing appeal to the Happiest Health jury."
        ],
        [
            "As our demonstration concludes, let us speak directly to the technical evaluation criteria:",
            "• Production Engineering Quality: HepaTwin is not an unverified UI mockup. Our entire test suite — including Kalman filters, mathematical fibrosis models, and TreeSHAP attribution — passes with 100% green flags across both Vitest and Python test runners. The production build compiles in 7 seconds with zero warnings.",
            "• National Healthcare Scalability: HepaTwin’s data models are mapped to FHIR and HL7 standards, engineered for direct integration with India’s Ayushman Bharat Digital Mission (ABDM) and the Ayushman Bharat Health Account (ABHA) ecosystem.",
            "• Commercial & Clinical Viability: By transforming a 20-minute chart review into a 90-second actionable triage, HepaTwin saves precious hepatologist hours, while its early warning system prevents acute-on-chronic decompensations that cost Indian families millions of rupees.",
            "Respected jury: The Digital Twin was once considered science fiction — an aspirational dream of futuristic medicine. With HepaTwin, our university team has proven that a multi-modal, localized, mathematically rigorous Digital Twin can be built and deployed today.",
            "We have built a virtual replica of the human liver that sees what the eye cannot see, predicts what the future holds, and empowers both the doctor and the patient to save lives.",
            "We thank Happiest Health for this visionary challenge, and we look forward to presenting HepaTwin in the Grand Finale. Thank you."
        ]
    )

    # ── JUDGE SCORECARD ALIGNMENT TABLE ──────────────────────────────────────
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>HACKATHON EVALUATION SCORECARD MAPPING MATRIX</b>", h1_style))
    scorecard_data = [
        [
            Paragraph("Hackathon Evaluation Pillar", th_style),
            Paragraph("HepaTwin Implementation Evidence", th_style),
            Paragraph("Target Jury Score", th_style)
        ],
        [
            Paragraph("<b>1. Digital Twin Authenticity & Localized Health Focus</b>", td_bold),
            Paragraph("Solves chronic hepatitis & NASH in India. Virtual Couinaud liver replica dynamically fed by continuous CGM/PPG IoT streams + longitudinal EHR labs.", td_style),
            Paragraph("<b>10 / 10</b><br/>(Exceeds Scope)", td_style)
        ],
        [
            Paragraph("<b>2. AI/ML Engineering & Explainability</b>", td_bold),
            Paragraph("Gradient Boosting + RF voting ensemble (4k ICMR/NHANES cohorts, AUROC 0.92/0.95, sub-10ms latency). Exact TreeSHAP local attribution eliminates black-box ambiguity.", td_style),
            Paragraph("<b>10 / 10</b><br/>(Full XAI)", td_style)
        ],
        [
            Paragraph("<b>3. In-Silico Counterfactual Simulation</b>", td_bold),
            Paragraph("Sub-50ms edge simulator projecting 12-60 month trajectories with dynamic 80% & 95% Bayesian confidence intervals across adherence, sleep, and binge eating.", td_style),
            Paragraph("<b>10 / 10</b><br/>(Instant Edge)", td_style)
        ],
        [
            Paragraph("<b>4. Indian Clinical Context & Patient Value</b>", td_bold),
            Paragraph("INASL/ICMR aligned Indian dietary engine (+Add/-Subtract), strict Hepatitis Abstinence Protocol, and 4-pillar Patient Moral & Physical Awareness Guide.", td_style),
            Paragraph("<b>10 / 10</b><br/>(Cultural Fit)", td_style)
        ],
        [
            Paragraph("<b>5. Security, DPDP Act 2023 & Architecture</b>", td_bold),
            Paragraph("1-click client-side PHI de-identification vault, 5-tier architecture, ABDM/FHIR alignment, publication-grade vector PDF & PPTX documentation.", td_style),
            Paragraph("<b>10 / 10</b><br/>(Enterprise Ready)", td_style)
        ]
    ]
    t_score = Table(scorecard_data, colWidths=[150, 313, 60])
    t_score.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0B132B')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1D5DB')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#F9FAFB'), colors.HexColor('#FFFFFF')]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_score)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated script PDF: {PDF_PATH}")


if __name__ == "__main__":
    build_script_pdf()
