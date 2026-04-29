import sys
import sqlite3
from pathlib import Path

# Určenie základného adresára (funguje pre .py aj .exe)
if getattr(sys, 'frozen', False):
    BASE_DIR = Path(sys.executable).parent
else:
    BASE_DIR = Path(__file__).parent

# Absolútna cesta k DB súboru
DB_FILE = BASE_DIR / 'voltoia.db'

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Inicializuje databázovú schému."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Tabuľka klientov
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS clients (
            id TEXT PRIMARY KEY,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            city TEXT NOT NULL,
            battery_capacity_kwh REAL NOT NULL,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Tabuľka denných výsledkov
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT NOT NULL,
            date DATE NOT NULL,
            block_1_buy TEXT,
            price_buy_1 REAL,
            block_2_sell TEXT,
            price_sell_1 REAL,
            block_3_buy TEXT,
            price_buy_2 REAL,
            block_4_sell TEXT,
            price_sell_2 REAL,
            total_profit REAL,
            fve_prediction_text TEXT,
            zero_price_intervals TEXT,
            raw_data_json TEXT,
            hourly_data_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients (id),
            UNIQUE(client_id, date)
        )
    ''')
    
    # Migrácia pre existujúcu databázu (ak stĺpec chýba)
    try:
        cursor.execute("ALTER TABLE daily_results ADD COLUMN hourly_data_json TEXT")
    except sqlite3.OperationalError:
        pass # Stĺpec už existuje

    conn.commit()
    conn.close()
    print(f"[OK] Databaza '{DB_FILE}' bola inicializovana.")

def add_client(id, first_name, last_name, city, battery_capacity_kwh, status='active'):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT OR REPLACE INTO clients (id, first_name, last_name, city, battery_capacity_kwh, status) VALUES (?, ?, ?, ?, ?, ?)",
            (id, first_name, last_name, city, battery_capacity_kwh, status)
        )
        conn.commit()
        return True
    except Exception as e:
        print(f"[CHYBA] Pridanie klienta zlyhalo: {e}")
        return False
    finally:
        conn.close()

def save_daily_result(client_id, date, data_dict, hourly_data_json=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT OR REPLACE INTO daily_results 
            (client_id, date, block_1_buy, price_buy_1, block_2_sell, price_sell_1, 
             block_3_buy, price_buy_2, block_4_sell, price_sell_2, total_profit, 
             fve_prediction_text, zero_price_intervals, hourly_data_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            client_id, date, 
            data_dict.get('blok 1 (00-06) - Nákup'), data_dict.get('cena nákup 1 (€)'),
            data_dict.get('blok 2 (06-12) - Predaj'), data_dict.get('cena predaj 1 (€)'),
            data_dict.get('blok 3 (12-18) - Nabíjanie'), data_dict.get('cena nákup 2 (€)'),
            data_dict.get('blok 4 (18-24) - Predaj'), data_dict.get('cena predaj 2 (€)'),
            data_dict.get('celkový zisk (€)'),
            data_dict.get('predpoved vykonu FVE (text)'),
            data_dict.get('časové pásmo ≤ 0 €'),
            hourly_data_json
        ))
        conn.commit()
        return True
    except Exception as e:
        print(f"[CHYBA] Ulozenie vysledku zlyhalo: {e}")
        return False
    finally:
        conn.close()

def get_available_dates(client_id):
    """Vráti zoznam dátumov, pre ktoré existujú výsledky pre daného klienta."""
    conn = get_db_connection()
    try:
        rows = conn.execute("SELECT date FROM daily_results WHERE client_id=? ORDER BY date DESC", (client_id,)).fetchall()
        return [row['date'] for row in rows]
    except Exception as e:
        print(f"[CHYBA] get_available_dates: {e}")
        return []
    finally:
        conn.close()

def get_daily_detail(client_id, date):
    """Vráti hourly_data_json a sumárne výsledky pre daného klienta a dátum."""
    conn = get_db_connection()
    try:
        row = conn.execute("SELECT * FROM daily_results WHERE client_id=? AND date=?", (client_id, date)).fetchone()
        if row:
            return dict(row)
        return None
    except Exception as e:
        print(f"[CHYBA] get_daily_detail: {e}")
        return None
    finally:
        conn.close()

def delete_client_permanently(client_identifier):
    """Navždy vymaže konkrétneho klienta a jeho výsledky z databázy."""
    client_id = client_identifier.split('_')[0]
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # 1. Vymažeme výsledky pre tohto klienta
        cursor.execute("DELETE FROM daily_results WHERE client_id=?", (client_id,))
        
        # 2. Vymažeme samotného klienta
        cursor.execute("DELETE FROM clients WHERE id=?", (client_id,))
        
        conn.commit()
        return True
    except Exception as e:
        print(f"[CHYBA] Trvalé vymazanie klienta '{client_identifier}' zlyhalo: {e}")
        return False
    finally:
        conn.close()

def get_all_results_for_client(client_id):
    """Vráti všetky výsledky pre daného klienta zoradené podľa dátumu."""
    conn = get_db_connection()
    try:
        rows = conn.execute("SELECT * FROM daily_results WHERE client_id=? ORDER BY date ASC", (client_id,)).fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        print(f"[CHYBA] get_all_results_for_client: {e}")
        return []
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
