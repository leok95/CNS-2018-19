# **Kriptografija i mrežna sigurnost**

## FESB, Računarstvo, 2018/19

U okviru laboratorijskih vježbi student će se upoznati s praktičnim aspektima postupka zaštite podataka na mreži primjenom kriptografskih mehanizama. Student će imati priliku naučiti kako primjenjivati kriptografske mehanizme i protokole u praksi, odnosno naučiti kako razmišljati kao kriptografer.

Laboratorijske vježbe su praktičnog tipa (_hands-on_). Vježbe su djelomično inspirirane modelom _capture the flag_, gdje student prikuplja kredit rješavanjem odgovarajućih kriptografskih izazova (_challenge_). U okviru vježbi student treba otkriti način na koji može otključati/dekriptirati svoj _challenge_ (kratak tekst koji uključuje [Chuck Norrisa](http://www.nochucknorris.com)). Student će dobiti pristup personaliziranom virtualnom serveru (REST API aplikacija pisana u [Express](https://expressjs.com) _framework_-u i koja se izvodi u odgovarajućem [Docker](https://www.docker.com) _container_-u). U interakciji sa osobnim serverom student će rješavati dane kriptografske izazove.

U ovom GitHub repozitoriju profesor će objavljivati upute, dijelove koda, konfiguracijske skripte, i druge sugestije vezane uz predmet a sa svrhom povećanja produktivnosti studenta tijekom rada na laboratorijskim vježbama.

> VAŽNO: **Rješenja s labova (uključujući i odgovarajuće izvorne kodove) student će spremati na lokalni Git server**. U okviru laba, za ove potrebe, koristimo _open source_ sustav za upravljanje projektima [GitLab](https://about.gitlab.com).
>
> Za studente koji nemaju prethodnog iskustva s Git-om profesori će osigurati odgovarajuću potporu/pomoć.

## Uputstva

> VAŽNO: U GitHub repozitoriju se nalazi skripta `cryptor.js` koju možete koristiti za jednostavnu enkripciju/dekripciju u raznim modovima. **Skripta podržava i `aes-256-cbc` mod koji je korišten za enkripciju izazova/šala koje student treba dekriptirati.**.
>
> U skripti je prikazan primjer enkripcije i dekripcije u `aes-256-cbc` modu. Skripta se nalazi u direktoriju [crypto-oracle/crypto_modules](/crypto-oracle/crypto_modules). Pokrećete je u terminalu kako slijedi: `node cryptor.js`.

- [Lab 0 - Git basics](/instructions/lab-0.md)
- [Lab 1 - ARP spoofing](/instructions/lab-1.md)
- [Lab 2 - ECB mode vulnerabilities](/instructions/lab-2.md)
- [Lab 3 - CBC mode and predictable initialization vectors (IV)](/instructions/lab-3.md)
- [Lab 4 - CTR mode and repeated IVs/counter](/instructions/lab-4.md)
- [Lab 5 - Asymmetric crypto: RSA signatures and DH key exchange](/instructions/lab-5.md)
- [Lab 6 - Securing end-2-end communication](/instructions/lab-6.md)
- [Lab 7 - Certificate authorities (CAs) and TLS protocol](/instructions/lab-7.md)
- Lab 8 - SSH tunneling
- [**Running the REST server (_crypto oracle_) locally**](/instructions/intro.md)
