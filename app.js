console.log("app.js chargé");


let verses = [];
let glyphs = [];
let currentVerse = null;
let currentGlyphVerse = null;
let lastAyah = null;


function generateVerseEnd(numero) {
    const numbers = String(numero).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
    //return `\u06DD${numbers}`;
    //return `${numbers}\u06DD`;
    return `﴿${numbers}﴾`;
    //return `۝١`;
    //return `<span class="verset-medaillon">${numero}</span>`;
}

function getSelectedValues(selectId) {

    const select =
        document.getElementById(selectId);

    return Array
        .from(select.selectedOptions)
        .map(option => Number(option.value));
}

function pickVerse() {

    answer.style.display = "none";
    reference.style.display = "none";

    if (verses.length === 0) {
        preview.textContent =
            "لم يتم تحميل البيانات";
        return;
    }

    const selectedSurahs =
        getSelectedValues("surahSelect");

    const selectedHizbs =
        getSelectedValues("hizbSelect");

    let pool = verses;

    if (
        selectedSurahs.length > 0 ||
        selectedHizbs.length > 0
    ) {

        pool = verses.filter(
            verse =>

                selectedSurahs.includes(
                    verse.surah
                )

                ||

                selectedHizbs.includes(
                    Math.floor(
                        (verse.hizbQuarter -1) / 4
                    ) + 1
                )

        );
    }

    if (pool.length === 0) {
        preview.textContent = "لا توجد آيات";
        answer.textContent = "";
        reference.textContent = "";
        return;
    }

    do {

        let random = Math.random();
        console.log("random: " + random);
        const currentVerseIndex =
            Math.floor(random * pool.length);
        console.log("intervalle: [0, " + (pool.length-1) + "]");
        console.log("index: " + currentVerseIndex);
            
        currentVerse = pool[currentVerseIndex];
        console.log("ayah: " + currentVerse.number);
    
    } while (
        pool.length > 1 &&
        currentVerse === lastAyah
    );
    
    lastAyah = currentVerse;

    currentGlyphVerse = glyphs.filter(
            glyphVerse => (currentVerse.surah === glyphVerse.surah && currentVerse.number === glyphVerse.number)
        )[0];

    const wordCount = Number(
        document.getElementById("wordCount").value
    );

    const firstWords =
        currentGlyphVerse.text
            .split(" ")
            .slice(0, wordCount)
            .join(" ");

    preview.innerHTML = `<span class="page-${currentGlyphVerse.page}">${firstWords} ...</span>`;
    answer.textContent = "";
    reference.textContent = "";
}

fetch("data/quran.json")
  .then(response => response.json())
  .then(data => {
    verses = data;
    console.log("Versets chargés :", verses.length);
  })
  .catch(error => {
    console.error(error);
  });

fetch("data/quran-glyphs.json")
  .then(response => response.json())
  .then(data => {
    glyphs = data;
    console.log("Glyphes chargés :", glyphs.length);
  })
  .catch(error => {
    console.error(error);
  });

const generateBtn =
  document.getElementById("generateBtn");

const showAyahBtn =
  document.getElementById("showAyahBtn");

const showToNextRubBtn = 
  document.getElementById("showToNextRubBtn");

const preview =
  document.getElementById("preview");

const answer =
  document.getElementById("answer");

generateBtn.addEventListener(
  "click",
  pickVerse
);

const reference =
  document.getElementById("reference");

showAyahBtn.addEventListener("click", () => {

  answer.style.display = "block";
  reference.style.display = "block";
  
  if (!currentVerse) {
    return;
  }

  answer.innerHTML = `<span class="page-${currentGlyphVerse.page}">${currentGlyphVerse.text}</span>`;
  reference.textContent =
    "سورة " +
    currentVerse.surahName +
    " - الحزب " +
    (Math.floor((currentVerse.hizbQuarter-1)/4)+1) +
    " - الآية " +
    currentVerse.number;

});

showToNextQuarterBtn.addEventListener("click", () => {

    answer.style.display = "block";
    reference.style.display = "block";

    if (!currentVerse) {
      return;
    }
    
    let quarterPool = verses;
    let glyphPool = glyphs;

    quarterPool = verses.filter(
        verse => verse.hizbQuarter === currentVerse.hizbQuarter+1
    );

    lastAyah = quarterPool[0];
    
    quarterPool = verses.filter(
        verse => (verse.surah*1000+verse.number) <= (lastAyah.surah*1000+lastAyah.number) && (verse.surah*1000+verse.number >= currentVerse.surah*1000+currentVerse.number)
    );
    glyphPool = glyphs.filter(
        glyph => (glyph.surah*1000+glyph.number) <= (quarterPool[quarterPool.length-1].surah*1000+quarterPool[quarterPool.length-1].number) && (glyph.surah*1000+glyph.number >= currentVerse.surah*1000+currentVerse.number)
         ||
        glyph.key==="1:1" // Basmalah
    );
    
    
    answer.innerHTML = "";
    for (let verseIndex = 0; verseIndex < quarterPool.length; verseIndex++) {
        if (verseIndex > 0 && quarterPool[verseIndex].surah != quarterPool[verseIndex-1].surah) {
            answer.innerHTML += `<br/><br/><span style="font-family: 'QCF2BSML'">L 321 M</span><br/><br/>`;
        }
        answer.innerHTML += ` <span class="page-${glyphPool[(verseIndex+1)].page}">${glyphPool[(verseIndex+1)].text}</span>`;
    }


    if (currentVerse.surahName == quarterPool[quarterPool.length-1].surahName)
        reference.textContent =
        "سورة " +
        currentVerse.surahName +
        " من الآية " +
        currentVerse.number + 
        " إلى الآية " +
        quarterPool[quarterPool.length-1].number;
    else
        reference.textContent =
        " من سورة " +
        currentVerse.surahName +
        " - الآية " +
        currentVerse.number + 
        " إلى سورة " +
        quarterPool[quarterPool.length-1].surahName +
        " - الآية " +
        quarterPool[quarterPool.length-1].number;
  
  });

document
    .getElementById("nextBtn")
    .addEventListener(
        "click",
        pickVerse
    );

const themeToggle =
    document.getElementById("themeToggle");

function updateThemeButton() {

    if (!themeToggle) return;

    const dark =
        document.documentElement.dataset.theme === "dark";

    themeToggle.textContent =
        dark ? "☀️" : "🌙";
}

updateThemeButton();

themeToggle?.addEventListener("click", () => {

    const current =
        document.documentElement.dataset.theme;

    const next =
        current === "dark"
            ? "light"
            : "dark";

    document.documentElement.dataset.theme =
        next;

    localStorage.setItem(
        "theme",
        next
    );

    updateThemeButton();

});