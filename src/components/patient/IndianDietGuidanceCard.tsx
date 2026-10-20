// src/components/patient/IndianDietGuidanceCard.tsx
import React, { useState } from 'react';
import { useTwinStore } from '../../store/twinStore';
import { 
  Utensils, 
  PlusCircle, 
  MinusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  Heart, 
  Droplet, 
  Coffee, 
  Apple,
  Clock,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

export const IndianDietGuidanceCard: React.FC = () => {
  const { getActivePersona, getFibrosisMetrics, whatIf } = useTwinStore();
  const persona = getActivePersona();
  const metrics = getFibrosisMetrics();

  const [activeTab, setActiveTab] = useState<'all' | 'add' | 'subtract' | 'abstinence' | 'mealPlan'>('all');
  const [isAbstinenceExpanded, setIsAbstinenceExpanded] = useState<boolean>(true);

  // Check if patient has confirmed hepatitis or fatty liver
  const hasConfirmedLiverCondition = 
    persona.hepatitisType.toLowerCase().includes('hep') || 
    persona.hepatitisType.toLowerCase().includes('nash') ||
    persona.hepatitisType.toLowerCase().includes('dili') ||
    metrics.overallRiskLevel !== 'normal';

  // Indian Foods to ADD (+)
  const foodsToAdd = [
    {
      name: 'Haldi (Turmeric) + Kali Mirch (Black Pepper)',
      category: 'Anti-Inflammatory Spice',
      benefit: 'Curcumin combined with piperine suppresses NF-kB hepatic inflammatory pathways and neutralizes free radicals.',
      portion: '1/2 tsp daily in warm milk, dal, or vegetable curry.',
      icon: '🌿'
    },
    {
      name: 'Amla (Indian Gooseberry) & Citrus',
      category: 'Glutathione Enhancer',
      benefit: 'Concentrated natural Vitamin C stimulates endogenous hepatic glutathione synthesis, protecting liver cells during viral or toxic insult.',
      portion: '1 fresh amla or 20ml unsweetened amla juice in morning.',
      icon: '🍏'
    },
    {
      name: 'Methi (Fenugreek) Seeds & Fresh Leaves',
      category: 'Glycemic & Steatosis Defense',
      benefit: 'Rich in 4-hydroxyisoleucine and galactomannan fiber; lowers hepatic triglyceride accumulation and enhances insulin sensitivity.',
      portion: '1 tsp methi seeds soaked overnight in water, or cooked methi saag.',
      icon: '🌱'
    },
    {
      name: 'Desi Green Leafy Vegetables (Palak, Sarson, Drumstick/Moringa)',
      category: 'Detoxification Micronutrients',
      benefit: 'Rich in chlorophyll, folate, and sulforaphane, assisting liver Phase II conjugation and clearing metabolic waste.',
      portion: '1 cup cooked leafy greens 4-5 times a week.',
      icon: '🥬'
    },
    {
      name: 'Sprouted Moong & Chana (Plant Protein)',
      category: 'Lean Hepatic Protein',
      benefit: 'Provides branched-chain amino acids (BCAAs) that maintain serum albumin without creating heavy ammoniagenic waste.',
      portion: '1 bowl steamed sprouts as mid-morning snack or with lunch.',
      icon: '🍲'
    },
    {
      name: 'Fresh Homemade Low-Fat Dahi (Curd) / Buttermilk (Chaas)',
      category: 'Gut-Liver Axis Probiotics',
      benefit: 'Lactobacillus strains restore intestinal microbiome barrier, preventing bacterial translocation and endotoxin leakage into portal vein.',
      portion: '1 glass roasted jeera chaas after lunch (unsalted).',
      icon: '🥛'
    },
    {
      name: 'Indian Millets (Jowar, Bajra, Ragi) & Dalia',
      category: 'Complex Low-Glycemic Carbs',
      benefit: 'Slow-digesting complex carbohydrates replace polished white rice and maida, preventing postprandial glucose spikes and de novo lipogenesis.',
      portion: '2 jowar or multigrain rotis per meal.',
      icon: '🌾'
    },
    {
      name: 'Tender Coconut Water & Boiled Water',
      category: 'Hydration & Electrolytes',
      benefit: 'Natural potassium and safe hydration flush out metabolic toxins without artificial sweeteners or preservatives.',
      portion: '1 fresh coconut water alternate days; minimum 2.5L boiled/RO water daily.',
      icon: '🥥'
    }
  ];

  // Indian Foods to SUBTRACT (−)
  const foodsToSubtract = [
    {
      name: 'Vanaspati Ghee & Dalda (Hydrogenated Trans Fats)',
      category: 'Industrial Trans Fats',
      harm: 'Directly impairs mitochondrial fatty acid oxidation in hepatocytes, rapidly inducing severe Non-Alcoholic Steatohepatitis (NASH).',
      substitute: 'Cook in minimal cold-pressed mustard oil or groundnut oil (<3 tsp/day).',
      icon: '🚫'
    },
    {
      name: 'Deep-Fried Street Snacks (Samosa, Pakora, Kachori, Bhujia, Namkeen)',
      category: 'Fried Street Foods',
      harm: 'High in oxidized lipids, trans fatty acids, and excessive salt that overload liver peroxisomes and aggravate inflammation.',
      substitute: 'Roasted makhana, roasted chana, or steamed dhokla.',
      icon: '🥟'
    },
    {
      name: 'Mithai & Refined Sugars (Gulab Jamun, Jalebi, Barfi, Sweet Lassi)',
      category: 'Concentrated Sugars & Fructose',
      harm: 'High-fructose corn syrup and table sugar are metabolized strictly in the liver, stimulating immediate fat storage and insulin resistance.',
      substitute: 'Fresh whole fruits in moderation (papaya, apple, guava).',
      icon: '🍬'
    },
    {
      name: 'High-Sodium Pickles (Achaar) & Papad',
      category: 'Sodium Preservatives',
      harm: 'Indian pickles contain high salt concentrations that trigger fluid retention, portal hypertension, and ascites in liver fibrosis.',
      substitute: 'Fresh homemade lemon-ginger-chilli garnish without salt.',
      icon: '🧂'
    },
    {
      name: 'Roadside Unboiled Water & Street Ice (Sugarcane Juice, Gola)',
      category: 'Enteric Pathogens',
      harm: 'Major source of fecal-oral Hepatitis A and Hepatitis E outbreaks in India. Can cause acute-on-chronic liver failure in existing patients.',
      substitute: 'Always carry a bottle of boiled or RO-filtered water.',
      icon: '🧊'
    },
    {
      name: 'Reused "Kadai" Frying Oil (Repeatedly Heated Oils)',
      category: 'Toxic Peroxides',
      harm: 'Reheating cooking oil repeatedly produces acrolein, polycyclic aromatic hydrocarbons (PAHs), and toxic aldehydes that destroy liver membranes.',
      substitute: 'Never reuse frying oil at home; avoid commercial roadside eateries.',
      icon: '🍳'
    }
  ];

  // Clinical Abstinence Protocol
  const abstinenceRules = [
    {
      rule: '100% Complete Alcohol Abstinence (Zero Units)',
      clinicalRationale: 'Even minor social drinking (1-2 drinks) multiplies viral replication in Hepatitis B and C, accelerates Metavir fibrosis progression by 400%, and severely risks early cirrhosis.',
      urgency: 'critical',
      badge: 'STRICT ZERO TOLERANCE'
    },
    {
      rule: 'Abstinence from Untested Herbal Powders & Desi Churnas',
      clinicalRationale: 'Unstandardized Ayurvedic or herbal churnas, fat-burners, and heavy metal bhasmas frequently contain lead, arsenic, or hepatotoxic alkaloids causing acute Drug-Induced Liver Injury (DILI).',
      urgency: 'critical',
      badge: 'DILI PREVENTION'
    },
    {
      rule: 'Abstinence from Self-Prescribed Painkillers (NSAIDs)',
      clinicalRationale: 'Drugs like Diclofenac, Ibuprofen (Combiflam/Brufen), and Nimesulide cause severe hepatorenal toxicity. Paracetamol must NEVER exceed 2 grams/day and only with doctor approval.',
      urgency: 'caution',
      badge: 'DRUG SAFETY'
    },
    {
      rule: 'Abstinence from Raw or Undercooked Shellfish & Meat',
      clinicalRationale: 'Raw oysters, clams, and undercooked pork/game meat carry high viral loads of Hepatitis A and zoonotic Hepatitis E Genotype 3/4.',
      urgency: 'caution',
      badge: 'FOOD HYGIENE'
    },
    {
      rule: 'Abstinence from Sharing Personal Hygiene Items',
      clinicalRationale: 'Razors, nail cutters, toothbrushes, and manicure instruments carry micro-blood droplets that transmit Hepatitis B & C to loved ones. Maintain strictly private toiletries.',
      urgency: 'caution',
      badge: 'TRANSMISSION SHIELD'
    }
  ];

  return (
    <div className="bg-card border border-clinical-borderSubtle rounded-sharp p-4 shadow-none space-y-4 font-mono select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-clinical-borderSubtle gap-2">
        <div className="flex items-center gap-2">
          <Utensils className="w-5 h-5 text-accent-secondary" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-wider text-clinical-textPrimary uppercase">
                Culturally-Tailored Indian Dietary & Lifestyle Prescription
              </h2>
              <span className="text-xxs px-2 py-0.5 rounded-sharp bg-teal-50 text-teal-800 border border-teal-200 font-bold">
                ICMR & INASL COMPLIANT
              </span>
            </div>
            <p className="text-xxs text-clinical-textSecondary mt-0.5">
              Personalized for {persona.name} ({persona.hepatitisType}) • Homeostatic Reserve: <span className="font-bold text-teal-700">{metrics.homeostaticReserveIndex}%</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 text-xxs font-mono">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-sharp font-bold transition-colors ${
              activeTab === 'all'
                ? 'bg-ink text-white'
                : 'bg-slate-50 border border-clinical-borderSubtle text-clinical-textSecondary hover:bg-slate-100'
            }`}
          >
            All Guidance
          </button>
          <button
            onClick={() => setActiveTab('abstinence')}
            className={`px-2.5 py-1 rounded-sharp font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'abstinence'
                ? 'bg-status-critical text-white'
                : 'bg-red-50 border border-red-200 text-status-critical hover:bg-red-100'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Strict Abstinence</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-2.5 py-1 rounded-sharp font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'add'
                ? 'bg-status-normal text-white'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <PlusCircle className="w-3 h-3" />
            <span>+ What to Add</span>
          </button>
          <button
            onClick={() => setActiveTab('subtract')}
            className={`px-2.5 py-1 rounded-sharp font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'subtract'
                ? 'bg-status-caution text-white'
                : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <MinusCircle className="w-3 h-3" />
            <span>− What to Subtract</span>
          </button>
          <button
            onClick={() => setActiveTab('mealPlan')}
            className={`px-2.5 py-1 rounded-sharp font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'mealPlan'
                ? 'bg-accent-secondary text-white'
                : 'bg-slate-50 border border-clinical-borderSubtle text-clinical-textSecondary hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Indian Meal Plan</span>
          </button>
        </div>
      </div>

      {/* STRICT CLINICAL ABSTINENCE SECTION (Always prominent if hepatitis/condition confirmed) */}
      {(activeTab === 'all' || activeTab === 'abstinence') && hasConfirmedLiverCondition && (
        <div className="bg-red-50/70 border border-red-300 rounded-sharp p-3.5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-red-200">
            <div className="flex items-center gap-2 text-status-critical font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-status-critical" />
              <span className="uppercase tracking-wider">
                Confirmed Hepatitis / Liver Condition: Mandatory Clinical Abstinence Protocol
              </span>
            </div>
            <button
              onClick={() => setIsAbstinenceExpanded(!isAbstinenceExpanded)}
              className="text-xxs text-status-critical hover:underline flex items-center gap-1 font-bold"
            >
              <span>{isAbstinenceExpanded ? 'Collapse' : 'Expand Rules'}</span>
              {isAbstinenceExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <p className="text-xxs text-slate-700 leading-relaxed">
            Because you have an active liver condition (<span className="font-bold text-clinical-textPrimary">{persona.hepatitisType}</span>), 
            your hepatocytes are already under inflammatory stress. Violating these abstinence rules can trigger severe transaminase flares, 
            rapid viral multiplication, or acute hepatic failure:
          </p>

          {isAbstinenceExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              {abstinenceRules.map((rule, idx) => (
                <div 
                  key={idx}
                  className="p-2.5 bg-white border border-red-200 rounded-sharp flex flex-col justify-between text-xs space-y-1 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-status-critical text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-critical shrink-0" />
                      {rule.rule}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-red-100 text-red-900 border border-red-200 rounded-sharp font-bold shrink-0">
                      {rule.badge}
                    </span>
                  </div>
                  <p className="text-xxs text-slate-600 leading-relaxed">
                    {rule.clinicalRationale}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2-COLUMN VIEW: WHAT TO ADD (+) AND WHAT TO SUBTRACT (−) */}
      {(activeTab === 'all' || activeTab === 'add' || activeTab === 'subtract') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* COLUMN 1: WHAT TO ADD (+) */}
          {(activeTab === 'all' || activeTab === 'add') && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 pb-1.5 border-b border-emerald-200 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>+ What to ADD to Your Indian Diet (Liver Regenerative)</span>
              </div>

              <div className="space-y-2">
                {foodsToAdd.map((food, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 bg-emerald-50/40 border border-emerald-200/80 rounded-sharp hover:border-emerald-400 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{food.icon}</span>
                        <span className="font-bold text-xs text-emerald-950">{food.name}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-sharp bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 shrink-0">
                        {food.category}
                      </span>
                    </div>
                    <p className="text-xxs text-slate-700 mt-1 leading-relaxed">
                      {food.benefit}
                    </p>
                    <div className="mt-1 pt-1 border-t border-emerald-200/50 flex items-center gap-1 text-[10px] text-emerald-900 font-semibold">
                      <span>Serving Suggestion:</span>
                      <span className="font-normal text-slate-600">{food.portion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COLUMN 2: WHAT TO SUBTRACT (−) */}
          {(activeTab === 'all' || activeTab === 'subtract') && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 pb-1.5 border-b border-amber-200 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <MinusCircle className="w-4 h-4 text-amber-600" />
                <span>− What to SUBTRACT from Your Indian Diet (Detrimental Foods)</span>
              </div>

              <div className="space-y-2">
                {foodsToSubtract.map((food, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 bg-amber-50/40 border border-amber-200/80 rounded-sharp hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{food.icon}</span>
                        <span className="font-bold text-xs text-amber-950">{food.name}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-sharp bg-amber-100 text-amber-900 font-semibold border border-amber-200 shrink-0">
                        {food.category}
                      </span>
                    </div>
                    <p className="text-xxs text-slate-700 mt-1 leading-relaxed">
                      {food.harm}
                    </p>
                    <div className="mt-1 pt-1 border-t border-amber-200/50 flex items-center gap-1 text-[10px] text-amber-900 font-semibold">
                      <span>Healthy Indian Alternative:</span>
                      <span className="font-normal text-slate-600">{food.substitute}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* INDIAN MEAL PLAN TAB */}
      {(activeTab === 'all' || activeTab === 'mealPlan') && (
        <div className="p-3 bg-slate-50 border border-clinical-borderSubtle rounded-sharp space-y-2 text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-clinical-borderSubtle">
            <div className="flex items-center gap-1.5 font-bold text-clinical-textPrimary">
              <Clock className="w-4 h-4 text-accent-primary" />
              <span>Recommended Daily Indian Meal Timing for Hepatic Recovery</span>
            </div>
            <span className="text-xxs text-clinical-textMuted font-mono">
              EAT BEFORE 8:00 PM TO ALLOW NIGHTTIME GLYCOGEN RESTING
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xxs font-mono">
            <div className="p-2 bg-white border border-clinical-borderSubtle rounded-sharp">
              <div className="font-bold text-teal-800">Early Morning (6:30 - 7:30 AM)</div>
              <p className="text-slate-600 mt-1">1 glass warm water with methi seed water or amla juice. 4-5 soaked almonds (peeled).</p>
            </div>
            <div className="p-2 bg-white border border-clinical-borderSubtle rounded-sharp">
              <div className="font-bold text-teal-800">Breakfast (8:30 - 9:30 AM)</div>
              <p className="text-slate-600 mt-1">Moong dal chilla with mint-coriander chutney, or vegetable oats dalia with a cup of green tea (no sugar).</p>
            </div>
            <div className="p-2 bg-white border border-clinical-borderSubtle rounded-sharp">
              <div className="font-bold text-teal-800">Lunch (1:00 - 2:00 PM)</div>
              <p className="text-slate-600 mt-1">2 Jowar/Bajra rotis, bowl of palak/sarson sabzi cooked in minimal mustard oil, 1 bowl sprouted moong dal, 1 cup fresh chaas with roasted cumin.</p>
            </div>
            <div className="p-2 bg-white border border-clinical-borderSubtle rounded-sharp">
              <div className="font-bold text-teal-800">Dinner (7:00 - 8:00 PM)</div>
              <p className="text-slate-600 mt-1">Light bottle gourd (lauki) or ridge gourd (turai) sabzi with 1 roti, or vegetable khichdi. Zero heavy fats or curd at night.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
