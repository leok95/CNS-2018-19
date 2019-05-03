# **Kriptografija i mrežna sigurnost - Lab 6**

## Securing end-2-end communication

U prethodnim vježbama bavili smo se primarno zaštitom povjerljivosti (_confidentiality_) poruka. Povjerljivost generalno ne implicira zaštitu integriteta odnosno cjelovitosti poruka. U praksi je jednako važno ili važnije osigurati integritet poruka; u realnim sustavima narušavanje integriteta poruka često vodi izravno i do narušavanja povjerljivosti istih.

Cilj ove vježbe je u okviru jednostavne _chat_ aplikacije (pisane u [Electron](https://electronjs.org) okviru, primjenom React i Redux tehnologija) osigurati **povjerljivost** i **autentičnost** razmjenjenih poruka. Dakle, student će osigurati:

- autentičnost izvorišta poruka (_**source integrity**_),
- integritet samih poruka (_**data integrity**_),
- zaštitu od _**replay**_ napada.

Navedena zaštita će se implementirati prema principu _**end-2-end**_; drugim riječima, samo krajnji korisnici/entiteti će moći pristupiti sadržaju poruka, koje će biti autenticirane i pravovremene.

### Instalacija i pokretanje Chat@FESB aplikacije

**NAPOMENA:** U okviru vježbi, Chat@FESB Electron aplikaciju pokretat ćemo u tzv. _development modu_. U osnovi, za učitavanje i pokretanje aplikacije koristiti ćemo razvojni server `webpack-dev-server`.

1. Klonirajte/kopirajte ovaj _GitHub_ repozitorij.

2. Instalirajte potrebne module (navedene u `package.json` datoteci). Uđite u direktorij `chat-at-fesb/` i pokrenite instalaciju modula:

   ```Bash
   npm install
   ```

3. Pokrenite _webpack-dev-server_ izvršavanjem sljedeće naredbe u terminalu:

   ```Bash
   npm run client-dev-server
   ```

   Na ovaj način pokrećemo _webpack development server_ koji će posluživati klijentsku aplikaciju. [_Webpack_](https://webpack.js.org) koristi `webpack.config.js` skriptu za konfiguraciju procesa generiranja (eng. _bundling_) klijentske aplikacije. Server zaustavljate s `Ctrl + C`.

   Uvidom u `index.html` datoteku (`chat-at-fesb\app\index.html`) možete vidjeti da se klijentska aplikacija `app.js` uistinu poslužuje s razvojnog servera (_webpack-dev-server_) pokrenutog na lokalnom računalu:

   ```html
   <script src="http://localhost:5000/bundle.js"></script>
   ```

4. Pokrenite Electron aplikaciju tako da u direktoriju `chat-at-fesb/` izvršite sljedeću naredbu:

   ```Bash
   npm run client
   ```

   > **NAPOMENA:** Možete pokrenuti više klijentskih aplikacija odjednom na istom računalu (u drugom terminalu jednostavno izvršite `npm run client`).

5. Pokušajte se povezati s centralnim Chat@FESB serverom koji je pokrenut na _crypto oracle_ računalu. Zatražite od profesora/asistenata IP adresu tog računala. Možete unijeti vlastiti _nickname_; u protivnom će vam biti dodjeljen slučajno generirano ime.

   > **NAPOMENA:** U klijentu nije nužno unositi adresu servera ni broj porta ako se Chat@FESB server (`server.js`) pokreće na lokalnom računalu i sluša na predefiniranom portu. Ako se želite odspojiti od servera ili resetirati aplikaciju dovoljno je napraviti `Ctrl + R`.

6. **ALTERNATIVNO:** Možete pokrenuti vlastitu instancu Chat@FESB servera na lokalnom računalu (npr. za potrebe testiranja) u terminalu izvršite sljedeću naredbu:

   ```Bash
   npm run server
   ```

### Siguran redosljed primjene enkripcijskih i autentikacijskih funkcija

Prilikom zaštite poruke _M_ jedan od velikih izazova je odrediti siguran redosljed primjene enkripcijske funkcije **_c = E<sub>Ke</sub>(M)_** i autentikacijske funkcije **_tag=MAC<sub>Ka</sub>(M)_**. Odabir ispravnog redosljeda/kompozicije kriptografskih funkcija krucijalan je za sigurnost podataka. Postoji nekoliko mogućnosti kompozicije enkripcijskih i autentikacijskih funkcija:

#### **_Encrypt-and-Authenticate (EaA)_**

U ovom slučaju, poruka _M_ štiti se na način da se enkripcijska funkcija _E<sub>Ke</sub>(.)_ i autentikacijska funkcija _MAC<sub>Ka</sub>(.)_ primjenjuju neovisno jedna o drugoj. _Ciphertext_ i autentikacijski tag za poruku _M_ računaju se kako slijedi:

> _<p align="center">c = E<sub>Ke</sub>(M), &nbsp; tag=MAC<sub>Ka</sub>(M)</p>_

#### **_Authenticate-than-Encrypt (AtE)_**

_Ciphertext_ i autentikacijski tag za poruku _M_ računaju se kako slijedi:

> _<p align="center">tag=MAC<sub>Ka</sub>(M), &nbsp; c = E<sub>Ke</sub>(M || tag)</p>_

U ovom slučaju, pošiljatelj najprije izračuna autentikacijski tag za danu poruku (primjeni autentikacijsku funkciju) a zatim enkriptira poruku _M_ zajedno s tagom _tag_.

#### **_Encrypt-than-Authenticate (EtA)_**

_Ciphertext_ i autentikacijski tag za poruku _M_ računaju se kako slijedi:

> _<p align="center">c = E<sub>Ke</sub>(M), &nbsp; tag = MAC<sub>Ka</sub>(c)</p>_

Pošiljatelj najprije enkriptira poruku (primjeni enkripcijsku funkciju), zatim generira autentikacijski tag ali ne za originalnu poruku _M_ već za _ciphertext_ iz prethodnog koraka.

**NAPOMENA:** Dobra sigurnosna praksa nalaže korištenje različitih odnosno međusobno neovisnih simetričnih ključeva u enkripcijskim i autentikacijskim funkcijama (_Ke &ne; Ka_).

Iako se u praksi koriste sve tri kompozicije, **_Encrypt-than-Authenticate (EtA)_** preporučena je kompozicija. _EtA_ kompozicija, ispravno primjenjena, osigurava zaštitu od najjače kategorije napada na kriptografske sustave: **_chosen ciphertext attacks_.** Kod ove kategorije napada napadač priprema _ciphertext_, šalje ga žrtvi, te od žrtve očekuje odgovarajući _plaintext_. Budući da je kod _EtA_ kompozicije integritet _ciphertext_-a zaštićen, a žrtva prije dekripcije primljenog _ciphertext_-a provjerava integritet istog, žrtva će odbaciti neispravan/modificiran _ciphertext_ prije njegove dekripcije. Na ovaj način napadač ne može dobiti odgovarajući _plaintext_. U okviru labova korisit ćemo stoga _Encrypt-than-Authenticate (EtA)_ kompoziciju.

Nekoliko referenci na ovu temu:

- [The Order of Encryption and Authentication for Protecting Communications (Or: How Secure is SSL?)](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.106.5488&rep=rep1&type=pdf)
- [On the (In)Security of IPsec in MAC-then-Encrypt
  Configurations](http://www.isg.rhul.ac.uk/~kp/CCSIPsecfinal.pdf)
- [Padding oracles and the decline of CBC-mode cipher suites](https://blog.cloudflare.com/padding-oracles-and-the-decline-of-cbc-mode-ciphersuites/)
- [Should we MAC-then-encrypt or encrypt-then-MAC?](https://crypto.stackexchange.com/questions/202/should-we-mac-then-encrypt-or-encrypt-then-mac)

#### **_Authenticated encryption modes_**

Osim navedenih kompozicija, postoje enkripcijski modovi koji istovremeno osiguravaju povjerljivost podataka i njihovu autentičnost. Korisnik ne treba sam odlučivati o redosljedu primjene enkripcijskih i autentikacijskih funkcija, već to za njega radi sam enkripcijski mod. Osim toga, korisnik ne treba generirati dva neovisna enkripcijska ključa (_Ke i Ka_), već samo jedan. Poznati primjeri modova iz ove kategorije su:

- **CCM** (_**Counter with CBC-MAC**_)
  - Nalazi primjenu WiFi mrežama (WPA2, WPA3), ZigBee, IPsec, TLS 1.2 i TLS 1.3 (https), ...
- **GCM** (_**Galois/Counter Mode**_)
  - TLS 1.2 i TLS 1.3 (https), IPsec, SSH...

**VAŽNO:** Iako su navedeni enkripcijski modovi naizgled jednostavniji za korištenje, neispravnim generiranjem odgovarajućih inicijalizacijskih vektora odnosno _nonce_ vrijednosti, sigurnost ovih modova ozbiljno je ugrožena.

### Opis zadatka

Implementirati _end-2-end_ zaštitu poruka koje klijenti međusobno razmjenjuju. Pri tome je potrebno osigurati: _povjerljivost_, _autentičnost/integritet_, kao i zaštitu od _replay_ napada. Zaštitu implementirati na dva načina:

1. CBC mode + HMAC u _encrypt-than-authenticate (EtA)_ kompoziciji
2. GCM mode (**ovisno o raspoloživom vremenu i razini entuzijazma**)

### Zadaci u koracima

1. Preduvjet za zaštitu poruka jesu dijeljeni enkripcijski ključevi između klijenata. U Chat@FESB aplikaciji enkripcijski ključevi će se generirati na osnovu dijeljenih šifri. Aplikacija predviđa polja u koje student može unosti šifre. Student će koristiti sporu _password based key derivation function 2 (PBKDF2)_ za generiranje potrebnih simetričnih ključeva iz dijeljene tajne šifre.

   Student treba modificirati datoteku `securityActions.js` (`chat-at-fesb\app\redux\actions`) na način opisan u komentaru u navedenoj datoteci. Ako ste ispravno napravili ovaj korak, aplikacija će generirane ključeve automatski pohranjivati u odgovarajuća polja u _Redux storu_-u. Možete koristite _Developer tools_ prozor u aplikaciji za praćenje logova aplikacije.

2. U ovom koraku student treba implementirati zaštitu povjerljivosti odlaznih poruka. Odlazne poruke procesiraju se u datoteci `handleMsgOut.js` (`chat-at-fesb\app\redux\middleware\serverHandlers`); vidjeti komentare u datoteci.

   Za enkripciju/zaštitu povjerljivosti poruka koristite CBC mod sa slučajno generiranim inicijalizacijskim vektorom. U direktoriju `chat-at-fesb\app\services\security` u datotekama `ciphers.js` i `CryptoProvider.js` konfigurirano je nekoliko enkripcijskih modova, uključujući CBC. Student može koristiti navedene funkcije ako prethodno uveze datoteku `CryptoProvider.js` (`import <path_to_script>`).

   Kao što je vidljivo iz koda (`handleMsgOut.js`) _chat_ poruke imaju sljedeći format:

   ```JavaScript
   msg = {
       type: MsgType.BROADCAST,
       id,
       nickname,
       timestamp: Date.now(),
       content: 'Hello world!'
   }
   ```

   Prilikom zaštite povjerljivosti enkriptirate isključivo polje `content`; zaštita integriteta obuhvaća cijelu poruku (vidi u nastavku).

3. U ovom koraku student implementira zaštitu integriteta odlazne poruke. Za zaštitu integriteta koritite _HMAC_ algoritam ([Node.js Hmac](https://nodejs.org/api/crypto.html#crypto_class_hmac)).

   ```JavaScript
       const hmac = crypto.createHmac(algorithm, key);
   ```

   Primjetite da `createHmac()` zahtjeva dva argumenta: _hash_ algoritam (npr. `sha256`) i tajni ključ. Ključ za potrebe _HMAC_-a generirajte u koraku 1. Npr. generirajte ključ dug 512 bitova i jednu polovicu koristite za enkripciju a drugu za _HMAC_.

   Kad budete računali autentikacijski tag za cijelu poruku (sva polja), poruku možete prethodno serijalizirati kako slijedi:

   ```JavaScript
   const serializedMsg = JSON.stringify(msg);
   hmac.update(serializedMsg);
   const authTag = hmac.digest();
   ```

   Ako koristite `sha256` algoritam u _HMAC_-u, `hmac.digest()` će vam dati autentikacijski tag veličine 256 bitova. Atentikacijski tag može biti kraći, npr. 128 bitova. Stoga od rezultata `hmac.digest()` možete uzeti polovicu (128) generiranih bitova.

   **Ne zaboravite koristiti EtA kompoziciju kriptografskih funkcija.** Potencijalan format zaštićene poruke (CBC + HMAC) prikazan je u nastavku:

   ```JavaScript
   msg = {
       clientID: "3261434470825227",
       nickname: "Alice",
       timestamp: 1593720594459,
       content: "c850fcee1c9c7c3ee9c4fd4a621eda18057cce3f2eb5261e",
       iv: "2a24b323a7dc1c6dc31ab216d576d59f",
       authTag: "d3dc95ec39457edb366c19b4ad926638"
   }
   ```

4. U ovom koraku student treba implementirati provjeru autentičnosti primljenih/dolaznih poruka. Primljene poruke procesiraju se u datoteci `handleMsgIn.js` (`chat-at-fesb\app\redux\middleware\serverHandlers`); vidjeti komentare u datoteci.

   Student treba provjeriti integritet primljene poruke na osnovu:

   - Autentikacijskog taga (`authTag` u gornjem primjeru poruke)
   - Dijeljenog tajnog ključa (za računanje autentikacijskog taga)
   - _Timestamp_-a poruke (zaštita od _replay_ napada)

   **VAŽNO:** Samostalno istražiti kako napraviti **sigurnu** usporedbu lokalno izračunatog autentikacijskog taga s onim koji dolazi u poruci. Nesigurna usporedba otvara prostor za devastirajuće _timing-based_ napade (npr., [Timing attack in Google Keyczar library](https://rdist.root.org/2009/05/28/timing-attack-in-google-keyczar-library/)). Komentirati ovaj aspekt u izdvojenoj datoteci koju ćete spremiti u svoj repozitorij (`timing_attack.txt`).

   Ukoliko provjera autentičnosti nije uspješna, poruku treba odbaciti i taj događaj registrirati, npr., napravite `dispatch` poruke sadržaja `AUTHENTICATION FAILURE`:

   ```JavaScript
   msg.content = 'AUTHENTICATION FAILURE'
   dispatch(serverMsg(msg))
   ```

5. Student je utvrdio da je primljena poruka autentična, te stoga može pristupiti dekripciji _ciphertext_-a iz polja `content`.

6. Zamjeniti CBC + HMAC s AES-GCM _authenticated encryption_ modom.

   **VAŽNO:** GCM mode istovremeno osigurava povjerljivost i autentičnost poruke a pri tome koristi samo jedan tajni ključ. GCM je baziran na CTR enkripcijskom modu čija sigurnost ovisi o ulaznom inicijalizacijskom vekoru odnosno _nonce_-u. Izuzetno je važno za sigurnost ovog moda da se _nonce_ nikada ne ponovi pod istim enkripcijskim ključem. U praksi se stoga preporuča korištenje odgovarajuće sekvencijskog broja kao _nonce_ vrijednosti. GCM prihvaća bilo koju veličinu _nonce_-a, ali ga interno reducira na 96 bitova. Ostatak do veličine AES bloka (128), dakle 32 bita, koristi se kao brojač u CTR modu. Stoga se jednim _nonce_-om možete enkriptirati maksimalno 2<sup>32</sup> AES blokova (ovo naravno nije problem u našem kontekstu s obzirom da su poruke kratke).

   Uprkos preoprukama o korištenju sekvencijskog broja za _nonce_, u okviru ove vježbe **mi ćemo generirati 96 bitni _nonce_ na slučajan način** uz sljedeći važan _**[disclaimer](https://www.imperialviolet.org/2015/05/16/aeads.html)**_:

   _"One option is to generate the nonce at random and consider the probability of duplicates. AES-GCM takes a 96-bit nonce and NIST says that you can only encrypt 2<sup>32</sup> messages under a single key if using random nonces...by the birthday paradox we have roughly a 2<sup>-33</sup> chance of repeating the same nonce and NIST drew the line there. That probability might seem either high or low to you. It's pretty small in absolute terms and, unlike a work factor, an attacker can't spend resources against it, but it's a very long way from the safety margins that we usually use in cryptography."_

   U nastavku je prikazana dekripcijska GCM funkcija iz datoteke `ciphers.js` (`chat-at-fesb\app\services\security`):

   ```JavaScript
   function decrypt_GCM({
       key,
       msgContent,
       inputEncoding='hex',
       outputEncoding='utf8'
   }) {

       // We expect 'hex' input encoding
       const iv_length = 24 // 'hex' (96 bits)
       const tag_length = 32 // 'hex' (128 bits)
       const ciphertext_length = msgContent.length - tag_length

       const iv = Buffer.from(msgContent.slice(0, iv_length), 'hex')
       const ciphertext = msgContent.slice(iv_length, ciphertext_length)
       const tag = Buffer.from(msgContent.slice(ciphertext_length), 'hex')

       const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
       decipher.setAuthTag(tag)
       let plaintext = decipher.update(ciphertext, inputEncoding, outputEncoding)
       plaintext += decipher.final(outputEncoding)

       return plaintext
   }
   ```

   Primjetite da vrijedi: `msgContent = iv || ciphertext || tag`, gdje je `length(iv) = 96 bits` i `length(tag) = 128 bits`.

   Prema dokumentaciji [NodeJS crypto](https://nodejs.org/api/crypto.html#crypto_decipher_setauthtag_buffer): _"... if the cipher text has been tampered with, `decipher.final()` will throw, indicating that the cipher text should be discarded due to failed authentication."_ Dakle, poziv funkcije `decrypt_GCM()` trebate staviti unutar `try...catch` bloka.
