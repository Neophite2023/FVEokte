import pytest
from nova_appka_v8 import skore_na_text, extrahuj_interval_minuty, normalizuj_mesto

def test_skore_na_text():
    """Testuje prevod číselného skóre na textové hodnotenie."""
    assert skore_na_text(None) == "N/A"
    assert skore_na_text(10) == "veľmi slabé"
    assert skore_na_text(20) == "veľmi slabé"
    assert skore_na_text(30) == "slabé"
    assert skore_na_text(40) == "slabé"
    assert skore_na_text(50) == "priemerné"
    assert skore_na_text(60) == "priemerné"
    assert skore_na_text(70) == "dobré"
    assert skore_na_text(80) == "dobré"
    assert skore_na_text(90) == "výborné"
    assert skore_na_text(100) == "výborné"

def test_extrahuj_interval_minuty():
    """Testuje parsovanie časového intervalu zo stringu."""
    # Štandardný prípad
    start, end = extrahuj_interval_minuty("10:00 - 10:15")
    assert start == 10 * 60
    assert end == 10 * 60 + 15
    
    # Prechod cez polnoc (koniec dňa)
    start, end = extrahuj_interval_minuty("23:45 - 00:00")
    assert start == 23 * 60 + 45
    assert end == 24 * 60
    
    # Neplatný vstup
    assert extrahuj_interval_minuty(None) == (None, None)
    assert extrahuj_interval_minuty("invalid") == (None, None)

def test_normalizuj_mesto_unit():
    """Unit test pre normalizáciu mesta (izolovaný)."""
    # Testujeme priamu zhodu (lowercase)
    # Poznámka: Predpokladáme, že slovenske_mesta.py obsahuje mapovanie
    assert normalizuj_mesto("bratislava") == "Bratislava"
    
    # Testujeme odstránenie diakritiky
    assert normalizuj_mesto("šala") == "Šaľa"  # vstup "šala" -> bez diakritiky "sala" -> mapa "Šaľa"
    assert normalizuj_mesto("košice") == "Košice"
    
    # Testujeme fallback (Title Case) pre neznáme mesto
    assert normalizuj_mesto("nezname mesto") == "Nezname Mesto"
    
    # Prázdny vstup
    assert normalizuj_mesto("") == ""
    assert normalizuj_mesto(None) is None
