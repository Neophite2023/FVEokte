# Configuration for Voltoia App

# Import slovníka slovenských miest pre normalizáciu
from slovenske_mesta import SLOVENSKE_MESTA

# --- API Endpoints ---
BASE_DOWNLOAD_URL = "https://isot.okte.sk/api/v1/dam/report/daily"
OPEN_METEO_API_URL = "https://api.open-meteo.com/v1/forecast"

# --- Excel Column Names ---
STLPEC_CIEN = 'Cena SK (EUR/MWh)'
STLPEC_CAS = 'Perióda'
STLPEC_FVE_KWH = 'Predpoved_FVE_kwh'

# --- FVE Prediction Parameters ---
PEAK_POWER_KW = 5.0          # Assumed peak power of the PV installation in kWp
EFFICIENCY_FACTOR = 0.8      # Correction factor for solar radiation to actual production
FVE_SCORE_CLOUD_DIVISOR = 10 # Divisor for cloud cover in FVE score calculation
FVE_SCORE_SOLAR_MULTIPLIER = 2 # Multiplier for solar radiation in FVE score calculation
FVE_SCORE_SOLAR_DIVISOR = 300 # Divisor for solar radiation in FVE score calculation

# --- Battery and Block Trading Parameters ---
KAPACITA_BATERIE_KWH = 10.0  # Default battery capacity (used as fallback if not specified in klient_list.xlsx)
UCINNOST_BATERIE = 0.90      # Example: 90% round-trip efficiency
TRVANIE_BLOKU_HODINY = 3     # Duration of a trading block in hours
POCET_INTERVALOV_V_3H_BLOKU = 12 # Number of 15-minute intervals in a 3-hour block (3 hours * 4 intervals/hour)
POCET_INTERVALOV_V_6H_BLOKU = 24 # Number of 15-minute intervals in a 6-hour block (6 hours * 4 intervals/hour)

# --- Output Table Columns (new structure) ---
STLPCE_TABULKY = [
    "id_klienta", "meno", "priezvisko", "lokalita", "dátum",
    "blok 1 (00-06) - Nákup", "cena nákup 1 (€)",
    "blok 2 (06-12) - Predaj", "cena predaj 1 (€)",
    "blok 3 (12-18) - Nabíjanie", "cena nákup 2 (€)",
    "blok 4 (18-24) - Predaj", "cena predaj 2 (€)",
    "celkový zisk (€)", "predpoved vykonu FVE (text)", "časové pásmo ≤ 0 €"
]

# --- Excel Formatting and Data Limits ---
MAX_DATA_ROW_INDEX = 96      # Max data rows in the daily Excel file (24 hours * 4 intervals)
EXCEL_SUMMARY_START_ROW_OFFSET = 3 # Offset from MAX_DATA_ROW_INDEX for summary data
COST_PER_MWH = 90.0          # Example: 90 EUR/MWh for operational costs

# --- Excel Sheet Names ---
AKTIVNI_SHEET = "aktivni klienti"
NEAKTIVNI_SHEET = "neaktivny klienti"

# --- Output File Prefixes ---
VYSTUPNY_SUBOR_PREFIX = "vysledky_analyzy"

# --- Slovak Months for Naming ---
SLOVENSKE_MESIACE = {
    1: "Januar", 2: "Februar", 3: "Marec", 4: "April", 5: "Maj", 6: "Jun",
    7: "Jul", 8: "August", 9: "September", 10: "Oktober", 11: "November", 12: "December"
}