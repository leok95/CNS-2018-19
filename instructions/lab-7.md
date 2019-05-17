# **Kriptografija i mrežna sigurnost - Lab 7**

## Certificate Authorities (CAs) and TLS protocol

U okviru vježbe student će implementirati kontrolu pristupa za jednostavnu web aplikaciju primjenom TLS protokola. Cilj vježbe je ostvariti siguran kanal između klijentske aplikacije i odgovarajućeg web servera. Student pri tome treba realizirati autentikaciju korisnika putem zaporki i putem klijentskih certifikata. Autentikacija servera također će se realizirati na osnovu digitalnog certifikata.

Autentikacija zasnovana na digitalnim certifikatima zahtjeva generiranje i održavanje više tipova certifikata (u formatu x509v3): _**certificate authority (CA) root**_ certifikat (_CA cert_), certifikat za web server, te klijentski certifikat. CA certifikat može bit samo-potpisan (_self-signed_), dok serverski i klijentski certifikat potpisuje (izdaje) CA.

Za potrebe pokretanja vlastitog _certificate authority (CA)_ entiteta student može koristiti izvrstan alat za upravljanje asimetričnim ključevima i certifikatima [XCA](http://xca.hohnstaedt.de/xca). Alternativno, možete koristiti OpenSSL - [OpenSSL Certificate Authority](https://jamielinux.com/docs/openssl-certificate-authority).

**NAPOMEA:** Za potrebe ove vježbe, web aplikacija, web server i TLS/https server implementirani su u Node.js-u. U produkciji, web server i TLS/https server obično se konfiguriraju na tzv. _reverse proxy_ serverima (Nginx, Apache, IIS), dok se Node.js koristi za implementaciju aplikacijske logike.

### Uputstva za instalaciju i pokretanje web aplikacije

Web aplikacija za potrebe ove vježbe pisana je u popularnom Node.js okviru za razvoj web aplikacija - [Express.js](https://expressjs.com). Također je korištena popularna NoSQL baza - [MongoDB](https://www.mongodb.com/what-is-mongodb). U okviru web aplikacije MongoDB koristi se za pohranu korisničkih računa (korisnička imena, zaporke).

**VAŽNO:** Za uspješno pokretanje web aplikacije molimo pažljivo slijedite sve korake u nastavku. U slučaju bilo kakvih poteškoća/nedoumica kontaktirajte nekog od profesora.

#### Instalacija i konfiguracija MongoDB

1. Instalirajte MongoDB (_Comunity Server_ verziju). Molimo prethodno provjerite je li na vašem računalu MongoDB možda već instalirana.

2. Pokrenite MongoDB server s osnovnom/zadanom postavkom kontrole pristupa - osnovna postavka zapravo znači potpuno otvoren pristup bazi:

    ```Bash
    mongod
    ```

    ili

    ```Bash
    mongod --port 27017 --dbpath /data/db
    ```

    `--dbpath` označava direktorij u kojem će MongoDB server pohranjivati podatke. `dbpath` mora postojati prije pokretanja baze; kreirajte ga ukoliko ne postoji.

3. Povežite se s pokrenutom instancom `mongod` korištenjem `mongo` komandnog prozora (`mongo` _shell_).

    ```Bash
    mongo --port 27017
    ```

    `mongo` i `mongod` nalaze se u instalacijskom direktoriju MongoDB (npr., za Windows OS u `C:\Program Files\MongoDB\Server\3.6\bin`). Za popis osnovnih komandi `mongo` _shell_-a ukucajte `help`; detaljniji popis komandi možete naći u dokumentu [MongoDB shell cheat sheet](https://dhodgin.files.wordpress.com/2016/11/mongo-shell-cheat-sheet-v3-4.pdf).

4. Kreirajte administratora baze. U `mongo` _shell_-u upišite sljedeće (_**obavezno prilagodite korisničko ime i zaporku**_):

    ```Bash
    use admin
    db.createUser({
        user: "username",
        pwd: "password",
        roles: [
            { role: "userAdminAnyDatabase", db: "admin" },
            { role: "dbAdminAnyDatabase", db: "admin" },
            { role: "readWriteAnyDatabase", db: "admin" }
        ]
    })
    ```

    Za ispis svih dodanih korisnika možete koristiti `mongo` _shell_ naredbu `show users`.

5. Ponovo pokrenite MongoDB server ali ovaj put _**s uključenom kontrolom pristupa**_ (`--auth`):

    ```Bash
    mongod --auth
    ```

    ili

    ```Bash
    mongod --auth --port 27017 --dbpath /data/db
    ```

    Ukoliko želite, možete testirati kontrolu pristupa na način da se povežete s `mongod` instancom iz `mongo` _shell_-a i pokušate izvšiti neku komandu nad bazom (npr. `show dbs`, `show users`).

6. Povežite se na `mongod` instancu kao administrator.

    ```Bash
    mongo --port 27017 -u "username" -p "password" --authenticationDatabase "admin"
    ```

7. Kreirajte novu bazu podataka naziva `lab7-group[oznaka grupe]`. Npr., za prvu grupu - `lab7-group1`:

    ```Bash
    use lab7-group1
    ```

    **NAPOMENA**: Naredbom `show dbs` možete izlistati postojeće baze, ali samo one koje imaju barem jedan upisan podatak.

8. Kreirajte novog korisnika (npr., `lab7User`) s `read/write` pravima na novoj bazi `lab7-group[oznaka grupe]`. Npr., za prvu grupu - `lab7-group1` (_**obavezno prilagodite korisničko ime i zaporku**_):

    ```Bash
    use lab7-group1
    db.createUser({
        user: "lab7User",
        pwd: "password",
        roles: [
            { role: "readWrite", db: "lab7-group1" }
        ]
    })
    ```

    Za provjeru dodanog korisnika izvršite naredbu `show users`.

9. Napravite mali test na način da se autenticirate kao novi korisnik na bazu `lab7-group[oznaka grupe]`. Npr., za prvu grupu - `lab7-group1`

    ```Bash
    mongo --port 27017 -u "lab7User" -p "password" --authenticationDatabase "lab7-group1"
    ```

#### Popunjavanje MongoDB korisničkim računima

U ovoj fazi vježbe vaš zadatak je popuniti kreiranu bazu podataka korisnicima koji će imati prava pristupa web aplikaciji. Za ovu svrhu pripremljena je jednostavna NodeJS skripta koju trebate pokrenuti iz komandnog prozora. Skripta će automatski popuniti bazu s listom predefiniranih korisnika. Prethodno pokretanju navedene skripte trebate proširiti listu korisnika svojim korisničkim računom (vidjeti upute u nastavku).

1. Klonirajte/preuzmite `express-web-app` s GitHub repozitorija.

2. U komandnom prozoru otvorite direktorij `express-web-app\utils\db`. U direktoriju se nalaze dvije skripte:
    1. `dummy.data.js` - sadrži predefinirane korisnike (korisnička imena, zaporke, info).
    2. `populate.db.js` - povezuje se na specificiranu bazu i puni je korisnicima iz prethodne skripte.

3. U editoru otvorite `dummy.data.js` i proširite popis korisnika tako da dodate sebe (svoje ime, odgovarajuće korisničko ime i zaporku, ...) kao jednog od korisnika.

4. Osigurajte da je `mongod --auth` instanca pokrenuta. U komandnom prozoru izvršite skriptu `populate.db.js`.

    Npr., ako ste pri konfiguraciji MongoDB kreirali bazu `lab7-group1` s `read/write` korisnikom `lab7User` (i zaporkom `password`), izvršavate:

    ```Bash
    # Usage: node populate.db.js mongodb://username:password@database_url
    node populate.db.js mongodb://lab7User:password@localhost/lab7-group1
    ```

#### Pokretanje i testiranje web aplikacije

1. U direktoriju `express-web-app` izvršite `npm install`.

2. Web aplikacija koristi skriptu `config.js` (iz direktorija `express-web-app`) za podešavanje raznih konfiguracijskih opcija. Otvorite ovu skriptu u editoru i prilagodite konfiguracijske informacije vezane za spajanje na MongoDB (_property_ `MONGODB`); koristite identične parametre kao i prilikom dodavanja korisničkih računa.

3. Konačno, pokrenite web aplikaciju tako da izvršite `npm run watch`. Pokrenite preglednik i pokušajte se logirati u web aplikaciju s vašim korisničkim računom.

#### Aplikacije za upravljanje certifikatima - XCA

1. Preuzmite aplikaciju [XCA](https://hohnstaedt.de/xca) i instalirajte je na lokalnom računalu.

**VAŽNO:** Ostatak uputa potrebnih za kreiranje odgovarajućih certifikata, prilagodbu web aplikacije za autentikaciju korisnika putem certifikata ćete dobiti na samim vježbama.