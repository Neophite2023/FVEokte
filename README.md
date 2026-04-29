# Analýza FVE - Desktop Aplikácia

Aplikácia na analýzu efektivity fotovoltaickej elektrárne (FVE) a optimalizáciu nákupu/predaja energie.

## Inštalácia na novom PC

Ak chcete spustiť túto aplikáciu na inom počítači, postupujte podľa týchto krokov:

### 1. Príprava prostredia
Uistite sa, že máte nainštalovaný **Python** (verzia 3.8 alebo novšia).
Stiahnuť ho môžete tu: [python.org](https://www.python.org/downloads/)

### 2. Stiahnutie kódu
Otvorte príkazový riadok (CMD alebo PowerShell) a naklonujte tento repozitár:
```bash
git clone https://github.com/Neophite2023/skript-analyza-FVE.git
cd skript-analyza-FVE
```

### 3. Inštalácia závislostí
Odporúčame vytvoriť virtuálne prostredie (voliteľné), alebo nainštalujte knižnice priamo:

```bash
pip install -r requirements.txt
```

### 4. Spustenie aplikácie
Aplikáciu spustíte príkazom:

```bash
python nova_appka_v8.py
```

## O aplikácii
Aplikácia slúži na:
- Sťahovanie denných dát z OKTE a predpovedí počasia/FVE.
- Analýzu optimálnych blokov pre nákup, predaj a nabíjanie batérie.
- Ukladanie výsledkov do lokálnej `voltoia.db` databázy.
- Generovanie PDF reportov pre klientov.

## Poznámka k databáze
Súčasťou repozitára je aj súbor `voltoia.db`, ktorý obsahuje históriu analýz a zoznam klientov. Ak chcete začať s čistou databázou, môžete tento súbor vymazať (aplikácia si pri ďalšom spustení vytvorí nový, prázdny).
