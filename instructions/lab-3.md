# **Kriptografija i mrežna sigurnost - Lab 3**

## CBC mode and predictable IVs

_Cipher Block Chaining (CBC)_ **probabilistički** je način enkripcije poruka primjenom blok šifri (npr., AES). Blok šifre rade s blokovima fiksne duljine (npr., AES koristi 128 bitne blokove). Poruke dulje od nominalne duljine bloka zadane šifre enkriptiramo na način da poruku podijelimo/razbijemo na više blokova prije enkripcije.

Kod CBC enkripcijskog moda _plantext_ blokovi se ulančavaju (eng. _chaining_) kako je prikazano na slici u nastavku; prisjetite se, u ECB modu pojedini blokovi enkriptiraju se neovisno.

<p align="center">
<img src="../img/cbc.PNG" alt="CBC encryption" width="450px" height="auto"/>
<br><br>
<em>Enkripcija u CBC modu</em>
</p>

Uz pretpostavku da se primjenjena blok šifra (npr. AES) ponaša kao **pseudo-random permutacija**, ulančavanjem se postiže _nasumičnost/randomizacija_ šifriranog _plaintext_-a. Uloga _inicijalizacijskog vektora (IV)_ je randomizacija prvog bloka _plaintext_-a. CBC enkripcijski mod osigurava povjerljivost poruka uz određene pretpostavke. Formalno govoreći, CBC mod zadovoljava svojstvo _Indistinguishability under Chosen Plaintext Attack (IND-CPA)_ - napadač ne može razlikovati koja od dvije poruke, po napadačevom izboru, je enkriptirana na osnovu _ciphertext_-a u igri koju smo opisali u okviru predavanja.

Važna pretpostavka za sigurnost CBC moda je **nepredvidivost/nasumičnost inicijalizacijskog vektora**. U nastavku je slikovito prikazana prednost CBC u odnosu na ECB mod; identična slika karakterizirana visokim stupnjem redudancije enkripritana je u ECB i CBC modu (primjenom AES blok šifre).

<p align="center">
<img src="../img/tux.png" alt="ECB vs CBC" width="400px" height="auto"/>
<br>
<em>ECB vs CBC</em>
</p>

### Predictable IV implies insecure CBC

U ovoj vježi pokazat ćemo _ranjivost CBC enkripcijskog moda u slučaju kad nije ispunjena pretpostavka o nepredvidivosti/nasumičnosti inicijalizacijskog vektora (IV)_.

**VAŽNO: Za razliku od prethodne dvije vježbe u okviru ove student treba otkriti odgovarajuću tajnu riječ koja je odabrana nasumično iz javno dostupne liste _wordlist.txt_; student ne dekriptira vic o Chuck Norris-u.**

Kao i kod ECB moda, student će implementirati _chosen-plaintext attack (CPA)_, odnosno slati odgovarajuće _plaintext_-ove _crypto oracle_-u koji će iste enkriptirati u CBC modu i potom vraćati odgovarajući _ciphertext_ natrag studentu. _Crypto oracle_ pri navedenoj enkripciji **bira IV na predvidiv način (ne nasumično)**. Student stoga može predvidjeti IV pod kojim će njen/njegov _plaintext_ biti enkriptiran. Ranjivost opisanog postupka enkripcije proizlazi iz činjnice da student može predvidjeti prvi blok koji se enkriptira, tj., P<sub>1</sub>⊕IV.

Koristeći ovu činjenicu, kao i činjenicu da je enkripcijski algoritam deterministička funkcija, tj., isti _plaintext_ blok rezultirat će istim _ciphertext_ blokom, student može _relativno jednostavno_ testirati potencijalne riječi iz javnog rječnika _wordlist.txt_ slanjem istih _crypto oracle_-u, te usporediti dobivene odgovore s _challenge ciphertext_-om koji _oracle_ također vraća na upit (`GET cbc/iv/challenge`).

### Opis REST API-ja

U ovoj vježbi student će slati sljedeće HTTP zahtjeve svom _crypto oracle_-u:

```Bash
POST /cbc/iv HTTP/1.1
plaintext = 'moj plaintext'
```

U Node.js-u, primjenom modula `axios` navedeni zahtjev možete napraviti kako slijedi:

```js
// Recall, you have to wrap this into a function marked as 'async'
const response = await axios.post("http://10.0.15.x/cbc/iv", {
  plaintext: "plaintext"
});
```

_Crypto oracle_ (vaš REST server) uzima vaš _plaintext_, dodaje _padding_ prema PKCS#7 standardu (vidjeti primjere u nastavku), te enkriptira `plaintext + padding` u CBC modu tajnim 256 bitnim ključem (`aes-256-cbc`) i vraća vam odgovarajući _ciphertext_ zajedno s odgovarajućim inicijalizacijskim vektorom (IV).

```js
{
    "iv":"1a2c3c2a9658864a6545174945f59583",
    "ciphertext":"896633eee8bbfbed8447d9b49ce5b595"
}
```

Cilj ove vježbe je otkriti tajnu riječ koja vam je nasumično dodjeljena iz rječnika _wordlist.txt_. Rječnik je javan; možete ga dohvatiti kako slijedi:

```Bash
GET /wordlist.txt HTTP/1.1
```

Osim rječnika, za uspješno rješavanje ovog izazova trebate i odgovarajući _challenge ciphertext_ koji _oracle_ također vraća na upit:

```Bash
# Request
GET /cbc/iv/challenge HTTP/1.1

# Response
{
    "iv":"4a77dd877da00ac6f4f92ceb35e57578",
    "ciphertext":"40c92970bf1ebc8e12b1c450d8c5367b"
}
```

Ovaj _ciphertext_ (_challenge_) i IV rezultat su enkripcije tajne riječi u CBC modu.

### Kratki savjeti

1. Koristite _primitivna_ sredstva poput olovke i papira te pokušajte sebi skicirati ovaj problem. Napišite matematički izraz za enkripciju u CBC modu.

2. Uvjerite sebe da možete predvidjeti buduće IV. Pogledajte kako je implementirana enkripcija u CBC modu u _crypto oracle_-u (skripta [cbc.controller.js](/crypto-oracle/controllers/cbc.controller.js)). Posebnu pažnju stavite na logiku generiranja inicijalizacijskog vektora (komentirajte s profesorima); što ih čini predvidljivim?

3. Riječi iz rječnika _wordlist.txt_ kraće su od 16 byte-a. Kao takve, _crypto oracle_ dodaje odgovarajući _padding_ neposredno prije njihove enkripcije. _Padding_ je opisan u PKCS#7 standardu:

   ```Bash
   # plaintext size: 1 byte
   plaintext: 00
   w/padding: 00:0f:0f:0f:0f:0f:0f:0f:0f:0f:0f:0f:0f:0f:0f:0f

   # plaintext size: 2 byte
   plaintext: 00:01
   w/padding: 00:01:0e:0e:0e:0e:0e:0e:0e:0e:0e:0e:0e:0e:0e:0e

   # plaintext size: 10 byte
   plaintext: 00:01:02:03:04:05:06:07:08:09
   w/padding: 00:01:02:03:04:05:06:07:08:09:06:06:06:06:06:06

   # plaintext size: 13 byte
   plaintext: 00:01:02:03:04:05:06:07:08:09:0a:0b:0c
   w/padding: 00:01:02:03:04:05:06:07:08:09:0a:0b:0c:03:03:03
   ```

4. **VAŽNO:** Za uspješno rješavanje ove vježbe trebate nekakav mehanizam za manipuliranje binarnim podacima (npr., trebate zbrojiti dva 128-bitna vektora po modulu 2 - `xor` operacija). Također, trebate mehanizam za konverziju stringova u heksadecimalnu reprezentaciju. Node.js definira klasu [Buffer](https://nodejs.org/api/buffer.html) koja vam pojednostavljuje rad s binarnim nizovima podataka, kao i konverziju podataka iz jednog formata u drugi. U nastavku je dano nekoliko primjera:

   ```js
   Buffer.from("Hello world!")
   <Buffer 48 65 6c 6c 6f 20 77 6f 72 6c 64 21>

   Buffer.from("Hello world!").toString('hex')
   '48656c6c6f20776f726c6421'

   Buffer.from("00")
   <Buffer 30 30>

   Buffer.from("00", "hex")
   <Buffer 00>

   Buffer.from("1a2c3c2a9658864a6545174945f59583", "hex")
   <Buffer 1a 2c 3c 2a 96 58 86 4a 65 45 17 49 45 f5 95 83>
   ```

   ```js
   //============================================
   // XOR-ing two 128-bit binary vectors
   //============================================
   const buffer1 = Buffer.from("00000000000000000000000000000001", "hex")
   <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 01>

   const buffer2 = Buffer.from("00000000000000000000000000000010", "hex")
   <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 10>

   // this buffer (of size 16 bytes) will hold the result
   bufferResult = Buffer.alloc(16)
   <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00>

   const number11 = buffer1.readUInt32BE(0);  // 1st  4 bytes
   const number12 = buffer1.readUInt32BE(4);  // next 4 bytes
   const number13 = buffer1.readUInt32BE(8);  // next 4 bytes
   const number14 = buffer1.readUInt32BE(12); // last 4 bytes

   const number21 = buffer2.readUInt32BE(0);  // 1st  4 bytes
   const number22 = buffer2.readUInt32BE(4);  // next 4 bytes
   const number23 = buffer2.readUInt32BE(8);  // next 4 bytes
   const number24 = buffer2.readUInt32BE(12); // last 4 bytes

   bufferResult.writeUInt32BE(number11 ^ number21, 0);  // 1st  4 bytes
   bufferResult.writeUInt32BE(number12 ^ number22, 4);  // next 4 bytes
   bufferResult.writeUInt32BE(number13 ^ number23, 8);  // next 4 bytes
   bufferResult.writeUInt32BE(number14 ^ number24, 12); // last 4 bytes

   // print bufferResult
   <Buffer 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 11>
   ```