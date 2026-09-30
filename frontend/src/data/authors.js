const COMMONS = "https://commons.wikimedia.org/wiki/File:";

// Author portraits from Wikimedia Commons (free licences), keyed by the author name returned by the API.
export const AUTHORS = {
  "Marco Aurelio": {
    image: "marco-aurelio",
    credit: { author: "Marie-Lan Nguyen", license: "CC BY 2.5", source: `${COMMONS}Marcus_Aurelius_Louvre_MR561_n02.jpg` },
  },
  Seneca: {
    image: "seneca",
    credit: { author: "Calidius", license: "CC BY-SA 3.0", source: `${COMMONS}Duble_herma_of_Socrates_and_Seneca_Antikensammlung_Berlin_07.jpg` },
  },
  Epitteto: {
    image: "epitteto",
    credit: { author: "Theodoor Galle", license: "Pubblico dominio", source: `${COMMONS}Epictetus_from_L._Annaei_Senecae_philosophi_Opera,_1605,_title_page_detail.png` },
  },
  Platone: {
    image: "platone",
    credit: { author: "Marie-Lan Nguyen", license: "CC BY 2.5", source: `${COMMONS}Plato_Silanion_Musei_Capitolini_MC1377.jpg` },
  },
  Epicuro: {
    image: "epicuro",
    credit: { author: "Marie-Lan Nguyen", license: "Pubblico dominio", source: `${COMMONS}Epicurus_Massimo_Inv197306.jpg` },
  },
  "Immanuel Kant": {
    image: "kant",
    credit: { author: "Johann Gottlieb Becker", license: "Pubblico dominio", source: `${COMMONS}Immanuel_Kant_-_Gemaelde_2.jpg` },
  },
  "Arthur Schopenhauer": {
    image: "schopenhauer",
    credit: { author: "Johann Schäfer", license: "Pubblico dominio", source: `${COMMONS}Arthur_Schopenhauer_by_J_Schäfer,_1859b.jpg` },
  },
  "Friedrich Nietzsche": {
    image: "nietzsche",
    credit: { author: "Friedrich Hermann Hartmann", license: "Pubblico dominio", source: `${COMMONS}Nietzsche187a.jpg` },
  },
  "Søren Kierkegaard": {
    image: "kierkegaard",
    credit: { author: "Biblioteca Reale di Danimarca", license: "Pubblico dominio", source: `${COMMONS}Søren_Kierkegaard_(1813-1855)_-_(cropped).jpg` },
  },
  "Albert Camus": {
    image: "camus",
    credit: { author: "United Press International", license: "Pubblico dominio", source: `${COMMONS}Albert_Camus,_gagnant_de_prix_Nobel,_portrait_en_buste,_posé_au_bureau,_faisant_face_à_gauche,_cigarette_de_tabagisme.jpg` },
  },
  "Viktor E. Frankl": {
    image: "frankl",
    credit: { author: "Prof. Dr. Franz Vesely", license: "CC BY-SA 3.0 DE", source: `${COMMONS}Viktor_Frankl2.jpg` },
  },
  "Carl Gustav Jung": {
    image: "jung",
    credit: { author: "ETH-Bibliothek Zürich", license: "Public Domain Mark", source: `${COMMONS}ETH-BIB-Jung,_Carl_Gustav_(1875-1961)-Portrait-Portr_14163_(cropped).tif` },
  },
  "Sigmund Freud": {
    image: "freud",
    credit: { author: "Max Halberstadt", license: "Pubblico dominio", source: `${COMMONS}Sigmund_Freud,_by_Max_Halberstadt_(cropped).jpg` },
  },
  "Daniel Kahneman": {
    image: "kahneman",
    credit: { author: "nrkbeta", license: "CC BY-SA 2.0", source: `${COMMONS}Daniel_Kahneman_(3283955327)_(cropped).jpg` },
  },
  "Erich Fromm": {
    image: "fromm",
    credit: { author: "Müller-May", license: "CC BY-SA 3.0 DE", source: `${COMMONS}Erich_Fromm_1974_(cropped)2.jpg` },
  },
};

export const authorPortrait = (name) => {
  const entry = AUTHORS[name];
  return entry ? `${import.meta.env.BASE_URL}images/authors/${entry.image}.webp` : null;
};
