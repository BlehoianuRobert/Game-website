# Automation Strategy

## Priority features to test

Cele trei fluxuri selectate reprezintă coloana vertebrală a platformei. Dacă oricare dintre ele cedează, întreg produsul devine inutilizabil.

### 1. Autentificare — Prioritate CRITICĂ (Securitate)
Autentificarea este **poarta de intrare** în platformă. Fără ea, niciun alt endpoint nu poate fi accesat în mod legitimate. Am ales-o ca prioritate #1 din două motive tehnice solide:

- **Suprafața de atac maximă:** un sistem de autentificare slab expune toate celelalte resurse (profiluri, scoruri, inventare). Un token JWT furat sau un endpoint `/login` care nu validează corect parola pot compromite mii de conturi simultan.
- **Dependența în cascadă:** toate celelalte teste (Gifts, Leaderboard) depind de un token valid. Dacă autentificarea cedează, testele aval eșuează și cu motive false. Testând-o primul, izolăm cu precizie sursa erorilor.

Testăm atât **happy path** (login reușit → token generat) cât și **negative path** (acces fără token → 401 Unauthorized), pentru că un API care returnează 200 la orice cerere neautentificată este mai periculos decât unul indisponibil.

### 2. Ciclul de viață al cadourilor (Gifts) — Prioritate CRITICĂ (Logică de business)
Fluxul de cadouri (`PENDING → ACCEPTED / REJECTED`) este cel mai complex **state machine** din platformă. Alegem să-l testăm prioritar din motive de complexitate a logicii:

- **Tranziții de stare ireversibile:** odată ce un cadou este `ACCEPTED`, resursele (itemele) se transferă între jucători. O eroare în acest flux produce inconsistențe în inventar care nu pot fi remediate automat — afectează direct experiența utilizatorului și integritatea datelor.
- **Concurență potențială:** mai mulți jucători pot interacționa cu același cadou simultan. Testând fluxul complet (trimitere → acceptare), validăm că serverul gestionează corect fiecare tranziție.

### 3. Recalcularea dinamică a clasamentului (Leaderboard) — Prioritate CRITICĂ (Engagement)
Leaderboard-ul este motorul de **engagement** al platformei — jucătorii revin pentru el. Este critic din perspectivă de produs:

- **Corectitudinea algoritmului de ranking:** un clasament greșit erodează încrederea utilizatorilor mai rapid decât orice altă eroare. Dacă un jucător cu 10.000 de puncte apare pe locul 3 în spatele unuia cu 8.000, aceasta nu este o eroare UI, este o eroare de logică de business.
- **Consistența după update de scor:** testăm că după ce un jucător trimite un scor nou, clasamentul reflectă imediat noua poziție — adică nu există cache neexpirată sau race condition între `POST /scores` și `GET /leaderboard`.

---

## Test types

### End-to-End (E2E) Testing
Testele E2E simulează **fluxul complet al unui utilizator real** — de la cererea HTTP inițială până la validarea răspunsului final. Nu testăm unitar o funcție izolată, ci întregul lanț: autentificare → acțiune → validarea efectului secundar.

**De ce E2E pentru acest proiect:** platforma noastră este un sistem distribuit (API + CMS + DB). Erorile critice nu apar în componente izolate, ci **în interacțiunea dintre ele**. Un test E2E prinde erorile de integrare pe care unit testele le ignoră — de exemplu, un endpoint care returnează 200 dar nu persistă datele în baza de date.

### Negative Testing
Testele negative verifică **comportamentul sistemului la input invalid sau acces neautorizat**. Contrar intuiției, un sistem care eșuează elegant (returnează 401, 403, 422 cu mesaj clar) este mai sigur și mai robust decât unul care acceptă orice.

**De ce Negative Testing este obligatoriu la securitate:** OWASP Top 10 include în mod constant "Broken Authentication" și "Broken Access Control" în primele poziții. Un test care verifică că `/players/me/progress` returnează 401 fără token nu este opțional — este minimul de securitate acceptabil pentru o platformă cu mii de utilizatori.

---

## Tools

| Tool | Versiune | Rol |
|------|----------|-----|
| `pytest` | 9.1.0 | Test runner principal — colectare, execuție, raportare |
| `requests` | 2.34.2 | HTTP client — efectuează apelurile reale către API |
| `responses` | ≥0.25 | Mocking library — interceptează și simulează răspunsurile HTTP în Faza 1 |
| Python | 3.13 | Runtime |

---

## How tests are run

```bash
# Activare mediu virtual (prima dată)
cd qa
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # Linux/Mac

# Instalare dependențe
pip install -r requirements.txt

# Rulare toate testele (Faza 1 — mock)
pytest qa/tests/test_faza1_mock.py -v

# Rulare cu raport detaliat
pytest qa/tests/test_faza1_mock.py -v --tb=short

# Rulare test specific
pytest qa/tests/test_faza1_mock.py::test_auth_flow -v
```

---

## Test evolution

### Faza 1 — Mock (starea actuală)
Colegul API Engineer abia a început implementarea, deci API-ul real nu este disponibil. Am folosit librăria `responses` pentru a **intercepta apelurile HTTP** și a returna date simulate, fără ca testul să știe că serverul nu există.

Mecanismul tehnic: decoratorul `@responses.activate` înlocuiește temporar stratul de transport al librăriei `requests`. Orice apel `requests.get(url)` este capturat înainte să ajungă la rețea și primește răspunsul pe care noi l-am definit cu `responses.add(...)`. Testul rulează complet offline, izolat, repetabil.

```python
@responses.activate
def test_login_success():
    responses.add(
        responses.POST,
        "http://localhost:3000/auth/login",
        json={"token": "jwt_mock_token"},
        status=200
    )
    # Testul rulează fără server real
```

### Faza 2 — API real (tranziția)
Când API-ul este funcțional, tranziția la testele reale necesită **o singură modificare**: eliminarea decoratorului `@responses.activate` și a blocurilor `responses.add(...)` din fiecare test. Structura testului, assertion-urile și logica de validare **rămân identice** — aceasta este intenția arhitecturală.

```python
# Faza 1 (mock)       →    Faza 2 (real)
@responses.activate        # <-- se elimină decoratorul
def test_login_success():
    responses.add(...)      # <-- se elimină mock-ul
    res = requests.post(...)  # <-- rămâne identic
    assert res.status_code == 200  # <-- rămâne identic
```

Această abordare garantează că testele validate în Faza 1 nu sunt rescrise, ci **promovate** — reduce riscul de regresie la zero în momentul integrării cu API-ul real.

---

## What I learned

<!-- Write in your own words. The questions below are just examples, not a required format:
- How did the collaboration feel, working with people you just met?
- When you were stuck, who helped and how?
- Were there moments of disagreement? How did you decide?
- Did someone take on a leadership role naturally? What did that look like?
- What didn't you know before that you know now?
-->
