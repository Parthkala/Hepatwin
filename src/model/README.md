# HepaTwin Clinical Mathematical Model & Methodology Documentation

> **LEGAL & REGULATORY DISCLAIMER**  
> **Proof of concept for decision support. Not a medical device.**  
> The algorithms, risk models, and trajectory predictions herein are designed solely for clinical demonstration, educational prototyping, and academic hackathon evaluation. They do not constitute certified diagnostic software and must not be used for primary clinical diagnosis or medical decision making without physician oversight.

---

## 1. Fibrosis Indices Models

### 1.1 FIB-4 (Fibrosis-4 Index)
Published by Sterling et al. (*Hepatology*, 2006) for HCV/HIV coinfection, and subsequently validated across Chronic Hepatitis B (EASL 2017) and MASLD/NAFLD (AASLD 2018).

$$\text{FIB-4} = \frac{\text{Age [years]} \times \text{AST [U/L]}}{\text{Platelet Count } [10^9/\text{L}] \times \sqrt{\text{ALT [U/L]}}}$$

#### Clinical Cutoffs:
- **Low Risk ($\text{FIB-4} < 1.30$ or $< 2.00$ if $\text{Age} \ge 65$):** High negative predictive value ($>90\%$) for ruling out advanced fibrosis (F3-F4).
- **Indeterminate ($1.30 \le \text{FIB-4} \le 3.25$):** Grey-zone requiring secondary confirmation (VCTE / FibroScan or ELF test).
- **High Risk ($\text{FIB-4} > 3.25$):** High positive predictive value for advanced bridging fibrosis or cirrhosis (F3-F4).

---

### 1.2 APRI (AST to Platelet Ratio Index)
Published by Wai et al. (*Hepatology*, 2003).

$$\text{APRI} = \left( \frac{\text{AST} / \text{AST}_{\text{ULN}}}{\text{Platelet Count } [10^9/\text{L}]} \right) \times 100$$

Where $\text{AST}_{\text{ULN}}$ defaults to **40 U/L** per standard clinical laboratory convention.

#### Clinical Cutoffs:
- **Low Risk ($\text{APRI} < 0.50$):** Excludes significant fibrosis (Metavir $\ge \text{F2}$).
- **High Risk ($\text{APRI} > 1.50$):** Strong indicator of significant fibrosis/cirrhosis (Metavir F2-F4).

---

## 2. 12-60 Month Dynamic Trajectory Model

The forward trajectory projects patient-specific fibrosis score evolution over 1 to 5 years:

$$\text{Score}(t) = \text{Score}_0 + \delta_{\text{annual}} \times t$$

Where $\delta_{\text{annual}}$ is the net annual drift derived from the **What-If Clinical Intervention Space**:

$$\delta_{\text{annual}} = \delta_{\text{natural}} + \Delta_{\text{alcohol}} + \Delta_{\text{antiviral}} + \Delta_{\text{BMI}} + \Delta_{\text{exercise}} + \Delta_{\text{diet}}$$

- **Alcohol ($\Delta_{\text{alcohol}}$):** Threshold-dependent non-linear acceleration. $>14$ units/week rapidly accelerates stellate collagen deposition ($+0.04 \times (\text{units}-14) + 0.35$). Complete abstinence grants a $-0.05$ protective drift.
- **Antiviral Adherence ($\Delta_{\text{antiviral}}$):** $\ge 90\%$ sustained adherence applies a $-0.22$ regression drift (consistent with histologic reversal seen in long-term tenofovir/entecavir and DAA trials).
- **Metabolic Stress ($\Delta_{\text{BMI}}$):** $\text{BMI} \ge 30$ compounds steatohepatitis ($+0.035$ per unit over 25).
- **Confidence Intervals (80% & 95%):** Expand over time proportional to $\sigma(t) = \sqrt{t} \times 0.28$, reflecting cumulative clinical uncertainty.

---

## 3. Explainability Model (SHAP-style Feature Attribution)

Feature attributions calculate the signed marginal impact of each factor on the disease drift rate:
- **Positive SHAP (+):** Accelerating disease progression (e.g., active viral replication, alcohol ingestion, obesity).
- **Negative SHAP (-):** Protective factors shielding the liver (e.g., optimal medication compliance, regular physical activity, anti-inflammatory nutrition).
- The top-ranking accelerating factor generates a plain-language summary for the clinician in $<90$ seconds.

---

## 4. DPDP Act 2023 & Clinical De-identification Standard

Under India's Digital Personal Data Protection (DPDP) Act 2023:
- Patient identifiers (Full Name, Contact, National Health ID / ABHA) are masked via a 1-click **Privacy Mode**.
- Synthetic and anonymized datasets are utilized exclusively for the sandbox environment.
