# Functioneel Ontwerp: Intelligent Boekhoud- & Ordersysteem

Dit document beschrijft de kernfunctionaliteiten van het platform, gebaseerd op de 6 pilaren van de administratieve flow (P1 t/m P6).

---

## 1. Dashboard & Core Overview
**Visuele Stijl:** Modulair Apple-stijl dashboard met "Glassmorphism" effecten (semi-transparante kaarten).

### 1.1 Journal Overview
Visueel overzicht van de actuele status per dagboek. Elke kaart fungeert als een 'Glassmorphism' widget met de volgende data:

* **Verkoop (Customer Invoices):**
    * Totaal openstaand bedrag (Debiteuren saldo).
    * Aantal vervallen facturen (over tijd).
    * Laatst gegenereerde factuurnummer voor snelle referentie.
* **Inkoop (Vendor Bills):**
    * Totaal te betalen bedrag aan leveranciers (Crediteuren saldo).
    * Aantal facturen in goedkeuringsfase (Pending Approval).
    * Alerts voor vervaldata die binnen 3 dagen verlopen.
* **Bank:**
    * Actueel gesynchroniseerd saldo van de gekoppelde bankrekening(en).
    * Aantal banktransacties dat nog gekoppeld (reconciled) moet worden aan facturen.
    * Datum en tijdstip van de laatste succesvolle bank-import.
* **Kas (Cash):**
    * Actueel saldo van de fysieke kas voor kleine dagelijkse uitgaven en bonnetjes.
* **Diverse Verrichtingen:**
    * Overzicht van de laatste 5 handmatige boekingen (correcties, loonjournaalposten, afschrijvingen).

### 1.2 To-Do List (Intelligente Action Feed)
Een gestapelde lijst van acties en triggers, visueel vergelijkbaar met iOS-notificaties:

* **Matching Alerts (Pilaar 5 ↔ Pilaar 1):**
    * Directe waarschuwingen bij prijsverschillen of afwijkende aantallen tussen de uitgaande bestelling (P5) en de ontvangen factuur (P1).
* **Order-to-Invoice (Pilaar 2 ↔ Pilaar 4):**
    * Meldingen van binnengekomen orders via Peppol/Mail die klaarstaan om met één klik omgezet te worden naar een verkoopfactuur.
* **Approval Tasks:**
    * Takenlijst voor de beheerder of fiscalist om inkomende facturen te fiatteren voor betaling.
* **AI Suggestions:**
    * Automatische koppelvoorstellen tussen bankmutaties en openstaande facturen, inclusief een 'Confidence Score' (bijv. 98% match).
* **Payment Reminders (Geld krijgen - Debet):**
    * Acties voor vervallen verkoopfacturen: suggesties voor het versturen van herinneringen of aanmaningen.
    * Status-updates van lopende incassotrajecten.
* **Payment Reminders (Geld betalen - Credit):**
    * Geautomatiseerd betaaladvies op basis van liquiditeit.
    * Alerts voor 'Skonto': herinneringen om facturen snel te betalen voor extra betalingskorting.

---

## 2. Customers and Sales (Debiteuren)

### 2.1 Sales & Order Flow (Pilaar 2 & 4)
* **Quotations (Offertes):** * Opstellen van offertes met productregels, kortingen en btw-berekeningen.
    * Digitaal ondertekenen (e-signature) met automatische statuswijziging naar 'Goedgekeurd'.
    * Revisiebeheer: Historie bijhouden van verschillende offerteversies.
* **Revisiebeheer & Versies:** Elke wijziging aan een offerte creëert een nieuw versienummer (v1, v2, ...). De historie blijft bewaard voor juridische bewijslast bij latere facturatie-discussies.
    * **Status-transitie:** Automatische workflow van 'Concept' naar 'Verzonden', naar 'Getekend' (na e-signature) of 'Vervallen'.
* **Incoming Orders (Pilaar 2):** * Centraal dashboard voor bestellingen uit 3 kanalen: Peppol (UBL/XML), E-mail (AI-extractie van PDF) en het Platform (API).
    * **AI-Check:** Automatische validatie of de bestelde producten en prijzen overeenkomen met de actuele stamgegevens/offertes.
* **Invoicing (Pilaar 4):** * Omzetten van goedgekeurde orders naar facturen (één-op-één of verzamelfacturatie).
    * Ondersteuning voor deeltrajecten: Facturatie bij bestelling (vooruitbetaling) of na levering.
    * Directe verzending via het Peppol-netwerk of e-mail met een beveiligde betaallink.
* **Credit Notes:** * Formele verwerking van retourzendingen of prijsfouten. 
    * Volledige koppeling aan de originele factuur voor een zuivere audit-trail (fiscale vereiste).

### 2.2 Payment Reminders & Dunning (Opvolging Geld Ontvangen)
* **Vervallen Facturen (Aging Report):** * Real-time lijst gesorteerd op ouderdom (30, 60, 90+ dagen).
    * **Kredietwaardigheid-alert:** Waarschuwing als een klant een nieuwe order plaatst terwijl er nog kritiek vervallen facturen openstaan.
* **Automatisch Opvolgtraject (Dunning Workflow):** * Configureerbare stappen: 
        1. Vriendelijke herinnering (Soft Reminder).
        2. Eerste aanmaning (Dunning Level 1).
        3. Laatste ingebrekestelling met aankondiging van incasso.
    * **Fiscale Logica:** Automatische berekening van wettelijke rente en administratieve incassokosten per stap.
* **Dispuutbeheer & "Pauze"-knop:** * Mogelijkheid om een factuur op 'In Dispuut' te zetten (bijv. bij een klacht over levering). 
    * Dit bevriest de automatische herinneringen en haalt de factuur uit de actieve incassolijst.
* **Intelligent Interaction Log (Het CRM-geheugen):** * Elke interactie (automatische mail, handmatige notitie van een telefoontje, of een chatbericht uit de Customer Portal) wordt gelogd op de tijdlijn van de partner én de specifieke factuur.
    * Dit logboek is onwijzigbaar (Audit-trail) zodat er nooit discussie ontstaat over "wie wat wanneer" heeft toegezegd.
* **Communicatie-logboek:** * Onwijzigbare tijdlijn per factuur: wanneer is de mail verzonden, wanneer is deze geopend, en welke acties zijn ondernomen?

### 2.3 Customer Portal (Self-Service)
* **Klant-omgeving:** * Beveiligde login voor klanten om hun volledige historie (orders, leveringen, facturen) in te zien.
    * Downloadmogelijkheid voor facturen in PDF en UBL-formaat.
* **Directe Betaling:** * Integratie met Payment Service Providers (Mollie/Stripe/PayPal) voor directe afhandeling via Bancontact, Credit Card of iDEAL.
    * Na betaling wordt de status in de boekhouding (Pilaar 4) direct bijgewerkt naar 'Betaald'.
* **Interactie:** * Mogelijkheid voor de klant om vanuit een factuur direct een vraag te stellen of een dispuut te melden, wat een trigger schiet naar het Dashboard (To-Do lijst).

---

## 3. Vendors and Purchases (Crediteuren)

### 3.1 Purchase Flow & Digitization (Pilaar 1, 3 & 5)
* **Purchase Orders (Pilaar 5):**
    * Aanmaken van uitgaande bestellingen naar leveranciers (bijv. Dell, Staples).
    * Verzending via het Peppol-netwerk (UBL) of automatisch gegenereerde e-mail naar de leverancier.
    * Koppeling aan budgetten: Waarschuwing als een bestelling het afdelingsbudget overschrijdt.
* **Goods Receipt (Ontvangstregistratie & Voorraad-trigger):**
    * Het digitaal 'afvinken' van binnengekomen goederen tegen de openstaande bestelling (Pilaar 5).
    * **Manco-registratie:** Vastleggen van beschadigingen of ontbrekende items (bijv. 10 besteld, 8 geleverd). 
    * **Status-blokkade:** Een ontvangstregistratie die afwijkt van de bestelling triggert direct een "Matching Alert" op het dashboard, waardoor de latere inkoopfactuur (Pilaar 1) niet automatisch betaald kan worden zonder menselijke check.
* **Bill Digitization (Pilaar 1):**
    * **Multi-channel import:** Automatisch ophalen van facturen uit e-mailbijlagen, Peppol-hub of handmatige upload.
    * **Wettelijk Digitaal Archief:** * Elke geüploade of ontvangen factuur (P1/P4) krijgt een unieke 'Hash' (digitale vingerafdruk) om de onwijzigbaarheid te garanderen.
        * Voldoe aan de fiscale bewaarplicht (7-10 jaar) door documenten in een doorzoekbaar, beveiligd archief op te slaan, direct gekoppeld aan de boekingsregel.
    * **OCR & AI Extraction:** Automatische herkenning van leverancier, IBAN, BTW-nummer, factuurdatum en alle individuele regels (prijzen/aantallen).
    * Archivering: Elke gedigitaliseerde factuur wordt onwijzigbaar opgeslagen (fiscale bewaarplicht).
* **Human-in-the-loop Interface:** Een split-screen weergave waarbij de gebruiker de originele PDF links ziet en de door AI herkende velden rechts, om correcties door te voeren voordat de boeking definitief wordt.


### 3.2 Control, Approval & Payment (Pilaar 3)
* **Three-Way Matching (De Ultieme Controle):**
    * Geautomatiseerde vergelijking tussen de **Inkooporder (P5)**, de **Ontvangstbevestiging** en de **Inkomende Factuur (P1)**.
    * **Afwijkingsbeheer:** Bij een prijsverschil (factuur is duurder dan order) of aantalverschil (meer gefactureerd dan ontvangen) wordt de factuur automatisch geblokkeerd voor betaling en op de To-Do lijst gezet.
* **Approval Workflow (Fiattering):**
    * Configureerbare goedkeuringspaden (bijv. facturen boven €500 moeten door de manager worden goedgekeurd).
    * Digitale 'stempel' op de factuur: Wie heeft wanneer toestemming gegeven voor betaling?
* **Payment Reminders & Strategie (Betalingsbeheer):**
    * **Betaaltermijnen:** Interactieve lijst van alle goedgekeurde facturen, gesorteerd op uiterste betaaldatum om boetes te vermijden.
    * **Skonto-alerts (Kortingsoptimalisatie):** Automatische herkenning van betalingskortingen (bijv. 2% korting bij betaling binnen 8 dagen). Het systeem berekent of dit rendabel is op basis van de huidige cashflow.
* **Online Payments & SEPA:**
    * Genereren van SEPA-betaalbestanden (PAIN.001 XML) voor directe upload in de bankomgeving.
    * Directe bankkoppeling: Betalingen direct vanuit de interface uitvoeren via de bank-API.
    * Automatische statuswijziging van de factuur naar 'In betaling' na export.
    * **Interim Betaalstatus:** * Zodra een factuur is opgenomen in een SEPA-export (PAIN-bestand), krijgt deze de status 'In Betaling'. 
        * Dit voorkomt dubbele betalingen en geeft de ondernemer op het dashboard een accuraat beeld van de *beschikbare* cashflow (Saldo minus geplande betalingen).

---

## 4. Accounting (De Boekhouding)

### 4.1 Het Grootboek & MAR (Pilaar 4)
* **Double-Entry Bookkeeping:** * Elke transactie (verkoop, inkoop, bank) wordt automatisch dubbel geboekt (Debet/Credit) volgens de regels van het dubbel boekhouden.
    * Real-time bijwerking van de proef- en saldibalans bij elke actie.
* **Minimum Algemeen Rekeningstelsel (MAR):** * Volledige integratie van het Belgisch rekeningstelsel (Klasse 1 t/m 7).
    * Mogelijkheid om subrekeningen aan te maken voor specifieke kostenplaatsen (bijv. 610000: Huur kantoor Gent vs. Antwerpen).
* **Manuele Boekingen (Diverse Verrichtingen):** * Interface voor de fiscalist om complexe posten handmatig te boeken, zoals loonjournaalposten, eindejaars-correcties of overlopende rekeningen.

### 4.2 Bank Reconciliation (Pilaar 3)
* **Automatisch Afpunten (Reconciliatie):** * Importeren van bankafschriften via CODA of directe bank-API (P3).
    * **Slimme Matching (AI):** Het systeem herkent automatisch factuurnummers, bedragen en namen van leveranciers/klanten in de bankmededeling.
* **Tinder-stijl Matching Interface:** * Visueel overzicht waarbij de banktransactie links staat en de voorgestelde openstaande factuur rechts. Eén klik op 'Match' boekt de factuur als betaald en koppelt het bankuittreksel.
* **Restposten Beheer:** * Directe afhandeling van kleine verschillen (bijv. bankkosten of afrondingsverschillen) naar een specifieke grootboekrekening.

### 4.3 Asset Management & Afschrijvingen
* **Investeringsregister:** * Automatische herkenning van activa bij inkoop (bijv. een laptop boven €1.000).
    * Genereren van een afschrijvingstabel per investering (Lineair of Degressief).
* **Automatische Boekingen:** * Het systeem boekt maandelijks of jaarlijks automatisch de afschrijvingskosten (630-rekening) tegenover de waardevermindering van het activum (2-rekening).
    * Visualisatie van de huidige boekwaarde vs. de aanschafwaarde.

### 4.4 Voorraadwaarde & Stock Valuation (Pilaar 5)
* **Real-time Voorraadmutatie:** * Bij de registratie van binnengekomen goederen (Goods Receipt) wordt de voorraadwaarde op de balans automatisch verhoogd (Rekening 3-serie).
    * Bij verkoop (Pilaar 4) wordt de voorraad afgeboekt en de kostprijs van de verkopen (60-rekening) geregistreerd.
* **Inventarisatie-module:** * Mogelijkheid voor de fiscalist om aan het einde van het boekjaar de voorraadwaarde te corrigeren (voorraadverschillen/waardevermindering) voor een correcte winstberekening.

### 4.5 Controle & Veiligheid (Audit Trail)
* **Period Lockdown (Fiscaal Slot):** * De mogelijkheid om boekhoudperiodes (maand/kwartaal) volledig te 'locken' na de BTW-aangifte of jaarlijkse afsluiting. 
    * Niemand (ook de ondernemer niet) kan daarna nog wijzigingen aanbrengen in die periode, wat de betrouwbaarheid voor de fiscus garandeert.
* **Onwijzigbaar Audit Log:** * Elke mutatie in het systeem wordt gelogd: Wie heeft welk bedrag op welke rekening gewijzigd en wanneer? 
    * Cruciaal voor de anti-fraude controle en voor de gemoedsrust van de fiscalist tijdens een externe audit.
* **BTW-Vakken Validatie:** * Continu-controle of elke geboekte factuur aan het juiste BTW-vak op de aangifte is gekoppeld, om fouten bij de aangifte te voorkomen.

---

## 5. Reporting and Fiscaliteit (De Output)

### 5.1 BTW & Fiscale Compliance
* **Automatische BTW-aangifte (Intervat):**
    * **Vak-mapping:** Elke transactie wordt automatisch toegewezen aan de correcte Belgische BTW-vakken (bijv. Vak 00, 01, 02, 03 voor omzet; Vak 81, 82, 83 voor inkoop; Vak 54, 59 voor verschuldigde/aftrekbare belasting).
    * **Preview-modus:** Een visuele weergave van het officiële aangifteformulier zodat de fiscalist de cijfers kan valideren vóór verzending.
    * **XML-Export:** Directe generatie van het .xml bestand voor indiening via het Intervat-portaal.
* **Intracommunautaire Lijst (IC-Lijst):**
    * Automatische verzameling van alle verkopen aan klanten in andere EU-lidstaten (Vak 44/46).
    * Validatie van BTW-nummers via de VIES-databank om foutieve IC-opgaves te voorkomen.
* **BTW-Validatie & Reconciliation:**
    * Een controle-rapport dat de geboekte BTW vergelijkt met de theoretische BTW op basis van de omzet.
    * Signalering van afwijkingen (bijv. manuele boekingen op een BTW-rekening zonder BTW-code).

### 5.2 Financiële Rapporten (Management Info)
* **Resultatenrekening (P&L / Win-en-Verlies):**
    * **Dynamische tijdlijnen:** Inzicht in omzet en kosten per maand, kwartaal of jaar.
    * **Drill-down functionaliteit:** Klik op een kostencategorie (bijv. '61: Huur') om direct alle onderliggende inkoopfacturen (P1) te zien.
    * **Marge-analyse:** Automatische berekening van de bruto- en nettowinstmarge.
* **De Balans (Activa & Passiva):**
    * Real-time weergave van de bezittingen (machines, voorraad, bank) tegenover de schulden en het eigen vermogen.
    * Vergelijking met het voorgaande boekjaar (Beginbalans vs. Actuele Balans).
* **Aging Reports (Ouderdomsanalyse):**
    * Gedetailleerd overzicht van openstaande posten gesegmenteerd op 0-30, 31-60, 61-90 en 90+ dagen.
    * **Fiscale voorziening:** Automatisch voorstel voor waardevermindering op dubieuze debiteuren voor de eindejaarsafsluiting.

### 5.3 Planning, Prognoses & EBITDA
* **Budget Management:**
    * Invoeren van jaarbudgetten per grootboekrekening of kostenplaats.
    * **Variance Analysis:** Rapportage die het verschil tussen 'Budget' en 'Actuals' toont, inclusief procentuele afwijking.
* **Cashflow Forecast (Liquiditeitsprognose):**
    * Een intelligente voorspelling van het banksaldo voor de komende 3 tot 6 maanden.
    * **Data-bronnen:** Gebaseerd op de vervaldata van openstaande facturen (P1/P4), binnengekomen orders (P2) en geplande uitgaande bestellingen (P5).
* **EBITDA & Ratio Rapportage:**
    * Berekening van het operationele resultaat (Earnings Before Interest, Taxes, Depreciation, and Amortization).
    * **Kengetallen:** Automatische weergave van de Current Ratio en Solvabiliteit, cruciaal voor bankrapportages en kredietwaardigheid.

---

## 6. Configuration & Personalization & Governance (Het Fundament)

### 6.1 Dashboard Control Centre (Apple-Style Modulariteit)
* **Widget-gebaseerd Dashboard:** * Elke grafiek, lijst of saldo-overzicht is een losse 'Smart Widget'.
    * Keuze uit een bibliotheek van widgets: BTW-schuld, Cashflow-prognose, To-Do notificaties, Bank-saldi.
* **Apple-stijl Drag-and-Drop Editor:** * **Jiggle Mode:** Na het lang indrukken van een kaart gaan widgets zachtjes wiebelen (zoals op iOS) om de layout aan te passen.
    * **Resizing:** Widgets kunnen verschillende formaten aannemen (S, M, L) om prioriteit aan te geven.
* **Module Toggle (App Store vibe):** * Functionaliteiten zoals 'Inventory' (Pilaar 3) of 'Quotations' (Pilaar 2) kunnen met één schakelaar aan- of uitgezet worden. 
    * Indien uitgeschakeld, verdwijnen de bijbehorende menu-items en database-triggers om de UI clean te houden.
* **Role-Based Personalized Views:** * Mogelijkheid om dashboards op te slaan per rol. 
    * *Voorbeeld:* De fiscalist ziet bij inloggen direct de BTW-status en Audit Logs, de zaakvoerder ziet de Cashflow en Openstaande Orders.

### 6.2 Financiële Inrichting & Tax Engine
* **Chart of Accounts (MAR) Beheer:** * Volledige vrijheid om het Belgisch rekeningstelsel aan te passen.
    * Koppeling van rekeningen aan de officiële jaarrekening-schema's (NBB).
* **Tax Engine & Vak-Mapping:** * Beheer van BTW-codes (bijv. 21% Belga, 6% Voeding, Vrijgesteld art. 44).
    * Elke BTW-code is hard gekoppeld aan de vakken op de BTW-aangifte (Vak 01, 54, etc.) voor 100% accurate rapportage.
* **Currency & Localization:** * Instellen van de basisvaluta (EUR) met automatische wisselkoers-updates voor facturen in vreemde valuta (USD, GBP).
    * Meertalige document-templates: Facturen automatisch in de taal van de partner (NL, FR, EN, DU).

### 6.3 Partner & System Management
* **Smart Partner Register (CRM/SRM):** * Centraal beheer van alle klanten en leveranciers.
    * **Peppol-Check:** Automatische validatie op basis van BTW-nummer of KBO-nummer of de partner via het Peppol-netwerk kan ontvangen.
    * Voorkeursinstellingen per partner: standaard betaaltermijn, automatische korting (Skonto), en standaard tegenrekening.
* **User Permissions & Security:** * Granulair beheer: Wie mag alleen 'kijken' (Read-only), wie mag 'valideren' (Approval), en wie mag 'boeken' (Full Accounting).
    * Tweestapsverificatie (2FA) verplicht voor alle accounts met toegang tot bankdata (Pilaar 3).
* **Multi-Tenancy (Intercompany):** * **Entity Switcher:** Snel wisselen tussen verschillende juridische entiteiten (bijv. ALPHA BV naar BETA Holding) via een zijpaneel, zonder opnieuw in te loggen.
    * Ondersteuning voor inter-company facturatie: Een verkoop in entiteit A creëert automatisch een inkoopvoorstel in entiteit B.
* **API & Integratie Hub:** * Beheer van externe koppelingen: Banken (P3/Ponto/Codabox), Webshops (Shopify/WooCommerce), en fiscale software (Silverfin/Caseware).
* **Audit-Log Visualisatie:** Een tijdlijn per document die toont: "Geüpload door AI" -> "Goedgekeurd door Jan" -> "Betaald via KBC". Dit is cruciaal voor de gemoedsrust van de accountant.

---

## 8. Future Roadmap: Intelligent Production (MRP)

* **Bill of Materials (Stuklijsten):** Definiëren van 'recepten' voor producten (bijv. 1 Tafel = 1 Blad + 4 Poten + 8 Schroeven).
* **Work Orders (Productieorders):** Plannen van productie-runs waarbij grondstoffen automatisch worden gereserveerd in Pilaar 5.
* **Costing & Value Added:** Automatische herberekening van de voorraadwaarde op de balans (Pilaar 4) wanneer grondstoffen worden omgezet in afgewerkte producten.
* **Smart Replenishment:** AI-voorspelling die op basis van de productieplanning aangeeft wanneer nieuwe grondstoffen via Pilaar 1 besteld moeten worden.