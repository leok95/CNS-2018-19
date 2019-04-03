# **Kriptografija i mrežna sigurnost**

## Lokalno pokretanje REST servera (_crypto oracle_)

> Pripremio: **Mateo Fuzul**

U ovom poglavlju nalaze se upute za lokalno pokretanje _crypto oracle_ servera.

1. Prije svega potrebno je klonirati repozitorij sa naredbom `git clone https://github.com/mcagalj/CNS-2018-19.git` te ući u direktorij projekta sa `cd CNS-2018-19/crypto-oracle/`.

2. Unutar projekta nalaze se datoteke pod nazivom `package.json` te `package-lock.json`koje služe za **instalaciju modula** o kojima projekt "ovisi" (_dependency_). Više o samim datotekama na slijedećem [linku (Everything You Wanted To Know About package-lock.json But Were Too Afraid To Ask)](https://medium.com/coinmonks/everything-you-wanted-to-know-about-package-lock-json-b81911aa8ab8).

   Kako bi instalirali te module pokrenite naredbu `npm install`.

3. Nakon što su svi **moduli** instalirani server se pokreće sa naredbom `npm start` (u istom direktoriju u kojem se nalazi i datoteka `package.json`). Serveru se može pristupiti unutar browsera na adresi `localhost:3000`.

4. Svi _crypto challenge_-i koje server koristi (vicevi,_cookie_-iji, tajne riječi i sl.) definirani su u datoteci `.env`.

5. Konfiguracijski parametri za server (npr., port) definirani su u datoteci `config\config.js`. U slučaju da vam je predefinirani port 3000 koji koristi _crypto oracle_ zauzet na lokalnom računalu, u ovoj konfiguracijskoj datoteci možete definirati neki drugi slobodni port (npr. 3001, 8000 i sl.).
