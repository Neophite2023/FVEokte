import pytest
import sys
import os
import tempfile
from pathlib import Path
from unittest.mock import MagicMock
import pandas as pd
import datetime

# Pridanie koreňového adresára do sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import database_manager
from config import STLPEC_CAS, STLPEC_CIEN, STLPEC_FVE_KWH

@pytest.fixture
def mock_db():
    """Vytvorí dočasnú databázu pre testy (súbor)."""
    # Vytvoríme dočasný súbor
    fd, temp_path = tempfile.mkstemp(suffix='.db')
    os.close(fd) # Zatvoríme file descriptor, stačí nám cesta
    
    # Uložíme pôvodnú cestu
    original_db_file = database_manager.DB_FILE
    
    # Nastavíme cestu k dočasnej DB
    database_manager.DB_FILE = Path(temp_path)
    
    # Inicializácia DB (vytvorí tabuľky)
    database_manager.init_db()
    
    yield
    
    # Upratovanie
    database_manager.DB_FILE = original_db_file
    if os.path.exists(temp_path):
        os.remove(temp_path)

@pytest.fixture
def mock_geopy(mocker):
    """Mock pre geopy."""
    mock_location = MagicMock()
    mock_location.latitude = 48.1486
    mock_location.longitude = 17.1077
    mock_location.address = "Bratislava, Slovensko"
    
    mock_geolocator = MagicMock()
    mock_geolocator.geocode.return_value = mock_location
    
    # Patch geocode volania
    # Skúsime patchnúť priamo `geocode` atribút v module nova_appka_v8
    # Pozor: nova_appka_v8 robí `from geopy ... import RateLimiter` a potom `geocode = RateLimiter(...)`
    mocker.patch('nova_appka_v8.geocode', side_effect=lambda query, **kwargs: mock_location)
    
    return mock_location

@pytest.fixture
def mock_okte_api(mocker):
    """Mock pre OKTE API."""
    dates = pd.date_range(start='2024-01-01', periods=96, freq='15min')
    data = {
        STLPEC_CAS: [f"{d.strftime('%H:%M')} - {(d + datetime.timedelta(minutes=15)).strftime('%H:%M')}" for d in dates],
        STLPEC_CIEN: [50.0 + i for i in range(96)], 
    }
    df_okte = pd.DataFrame(data)
    mocker.patch('nova_appka_v8.ziskaj_okte_data', return_value=df_okte)
    return df_okte

@pytest.fixture
def mock_weather_api(mocker):
    """Mock pre FVE predpoveď."""
    fve_data = {i: 50 for i in range(96)}
    skore = "priemerné"
    mocker.patch('nova_appka_v8.ziskaj_predpoved_fve', return_value=(fve_data, skore))
    return fve_data
