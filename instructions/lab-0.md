# **Git basics - Lab 0** <!-- omit in toc -->

U nastavku je dan taksativan popis _git_ naredbi koje će vam biti korisne tijekom rada s lokalnim Git repozitorijem.

> Ukoliko uočite grešku ili problem s nekom naredbom molimo da nam javite.

- [Cloning a remote repository](#cloning-a-remote-repository)
- [Listing and changing branches](#listing-and-changing-branches)
- [Staging or adding a directory/file to a local repository](#staging-or-adding-a-directoryfile-to-a-local-repository)
- [Checking the status (listing files yet to be staged or committed)](#checking-the-status-listing-files-yet-to-be-staged-or-committed)
- [Committing changes (locally)](#committing-changes-locally)
- [Pushing/sending changes to the remote repository](#pushingsending-changes-to-the-remote-repository)
- [Checking commit history](#checking-commit-history)

## Cloning a remote repository

```bash
# Clone repository of Mario Cagalj (mario_cagalj)
$ git clone http://10.0.1.134/2019/mario_cagalj
```

> VAŽNO: Primjetite da koristimo fiksnu IP adresu `10.0.1.134` (IP adresa Git server), kao i prefiks `2019` (studentski repozitoriji grupirani su u projekt/grupu `2019`).

## Listing and changing branches

```bash
# List local branches
$ git branch
* master
```

U kloniranom repozitoriju inicijalno je aktivan `master branch`:

```bash
~/mario_cagalj (master)
```

Studenti međutim rješenja labova spremaju u grane (_branch_) koje imenujemo kako slijedi: `vjezba01, vjezba02, ...`. U nastavku pokazujemo kako aktivirati odgovarajuću granu.

```bash
# List all branches (including remote ones)
$ git branch -a
* master
  remotes/origin/HEAD -> origin/master
  remotes/origin/master
  remotes/origin/vjezba01
```

```bash
# Activate/checkout a given branch (e.g., vjezba01)
$ git checkout vjezba01
~/mario_cagalj (vjezba01)
$
```

U ovom trenutku student može raditi modifikacije u danoj grani i kasnije spremati promjene (korištenjem naredbi, `git add`, `git commit -m`, `git push`).

> **VAŽNO:** Grane `vjezba01, vjezba02, ...` u `remote` repozitoriju (na Git server) bit će otključane ogranično vrijeme. Nakon isteka vremena predviđenog za rješavanje zadatka student neće moći biti u mogućnosti raditi izmjene u istim.

## Staging or adding a directory/file to a local repository

```bash
# Add a new directory ('testing') to branch 'vjezba01'
~/mario_cagalj (vjezba01)
$ mkdir testing
$ git add testing
```

```bash
# Add a script 'script.js'
~/mario_cagalj (vjezba01)
$ cd testing
~/mario_cagalj/testing (vjezba01)
# Once you've created a file 'script.js' in this folder
$ git add script.js
```

Alternatively, you can stage/add multiple files/folders at once:

```bash
~/mario_cagalj (vjezba01)
$ git add *
```

## Checking the status (listing files yet to be staged or committed)

```bash
~/mario_cagalj (vjezba01)
$ git status
```

## Committing changes (locally)

```bash
# Committing changes in branch 'vjezba01'
~/mario_cagalj (vjezba01)
$ git commit -m "Commit message"
```

U slučaju da ste nakon zadnjeg _commit_-a napravili manju izmjenu na nekoj datoteci i ne želite kreairati novi _commit_ već tu malu promjenu kombinirati s prethodnim _commit_-om možete koristiti `--amend` opciju:

```bash
~/mario_cagalj (vjezba01)
$ git commit --amend
```

Ako ujedno želite promjeniti i _commit_ poruku zadnjeg _commit_-a:

```bash
~/mario_cagalj (vjezba01)
$ git commit --amend -m "Updated commit message"
```

## Pushing/sending changes to the remote repository

Za slanje/pohranu izmjena napravljenih u lokalnom repozitoriju u _remote_ repozitorij:

```bash
~/mario_cagalj (vjezba01)
$ git push
# Checking the current status
$ git status
```

## Checking commit history

```bash
~/mario_cagalj (vjezba01)
$ git log
```
