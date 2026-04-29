import pytest
import datetime
import database_manager
from nova_appka_v8 import process_client_analysis, normalizuj_mesto

def tes_normalizuj_mesto():
    assert normalizuj_mesto("bratislava") == "Bratislava"
    assert normalizuj_mesto("kosice") == "Košice"
    assert normalizuj_mesto("zilina") == "Žilina"
    assert normalizuj_mesto("sala") == "Šaľa"
    assert normalizuj_mesto("UnknownCity") == "Unknowncity" # Alebo Title Case ak je fallback

def test_full_analysis_process(mock_db, mock_geopy, mock_okte_api, mock_weather_api):
    """
    End-to-End test pre funkciu process_client_analysis.
    Overuje, či sa dáta správne stiahnu (mock), spracujú a uložia do DB.
    """
    
    # Príprava testovacích dát
    mesto = "Bratislava"
    klient_adresar = "CLIENT_001_Test_User"
    meno = "Test"
    priezvisko = "User"
    bateria = 10.0 # kWh
    
    # Dummy logovacia funkcia
    logs = []
    def log_func(message):
        logs.append(message)
        print(message) 

    # Dummy temp info log (pre progress bar atď, ak je použitý)
    def temp_log(msg):
        pass

    # Pridáme klienta do DB (aj keď process_client_analysis to nerobí, len číta ID z názvu adresára, 
    # ale database_manager.save_daily_result kontroluje FK ak je zapnutý, 
    # v sqlite defaultne nebýva zapnutý FK constraint bez PRAGMA, ale pre istotu)
    database_manager.add_client("CLIENT", "Test", "User", "Bratislava", 10.0)

    # Spustenie analýzy
    # process_client_analysis(mesto, klient_adresar_nazov, meno, priezvisko, battery_capacity_kwh, log_func, temp_info_log, target_date=None)
    target_date = datetime.date(2024, 1, 1)
    
    result = process_client_analysis(
        mesto=mesto,
        klient_adresar_nazov="CLIENT_001", # ID_Meno
        meno=meno,
        priezvisko=priezvisko,
        battery_capacity_kwh=bateria,
        log_func=log_func,
        temp_info_log=temp_log,
        target_date=target_date
    )
    
    # Overenie úspešnosti
    assert result is True, "Funkcia process_client_analysis by mala vrátiť True"
    
    # Overenie logov - či prebehli kľúčové kroky
    log_text = "\n".join(logs)
    assert "Získavam súradnice" in log_text
    assert "Sťahujem dáta z OKTE" in log_text
    assert "Analýza dokončená" in log_text
    assert "Ukladám výsledky do databázy" in log_text
    
    # Overenie v databáze
    conn = database_manager.get_db_connection()
    cursor = conn.cursor()
    
    # Skontrolujeme či existuje záznam v daily_results
    # ID klienta sa parsuje z nazvu adresara (CLIENT_001 -> CLIENT)
    # V kode: klient_id = klient_adresar_nazov.split('_')[0] -> "CLIENT"
    
    cursor.execute("SELECT * FROM daily_results WHERE client_id = ?", ("CLIENT",))
    row = cursor.fetchone()
    
    assert row is not None, "Výsledok analýzy by mal byť uložený v DB"
    assert row['client_id'] == "CLIENT"
    assert row['fve_prediction_text'] == "priemerné" # Z mocku
    assert row['total_profit'] is not None
    
    conn.close()
