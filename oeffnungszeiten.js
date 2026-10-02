/* ============================================================
   ÖFFNUNGSZEITEN von Creativ Floristik
   Nur diese Datei ändern. Die Seite übernimmt alles automatisch:
   Tabelle, Anhänger im ersten Bild, "Jetzt geöffnet" und Hinweis.
   ============================================================ */
window.OEFFNUNGSZEITEN = {

  /* 1) Die normalen Zeiten. Leere Klammern [] = geschlossen. */
  normal: {
    Montag:     ["8:30-12:30", "14:30-18:30"],
    Dienstag:   ["8:30-12:30", "14:30-18:30"],
    Mittwoch:   ["8:30-12:30"],
    Donnerstag: ["8:30-12:30", "14:30-18:30"],
    Freitag:    ["8:30-12:30", "14:30-18:30"],
    Samstag:    ["8:30-12:30"],
    Sonntag:    []
  },

  /* 2) Ausnahmen: Urlaub, halbtags, Feiertage.
        Datum immer als "JJJJ-MM-TT". Der Hinweis erscheint 14 Tage
        vorher auf der Seite und verschwindet danach von selbst.
        Alte Einträge dürfen stehen bleiben.

        Vorlagen (die zwei Schrägstriche am Zeilenanfang entfernen,
        um einen Eintrag einzuschalten):                              */
  ausnahmen: [

    // Urlaub, komplett geschlossen:
    // { von: "2026-12-25", bis: "2027-01-10",
    //   hinweis: "Wir sind bis zum 10.01.2027 im Urlaub. Danach gelten wieder die gewohnten Öffnungszeiten." },

    // Halbtags geöffnet (gilt an allen Tagen, an denen sonst geöffnet ist):
    // { von: "2027-06-28", bis: "2027-08-06", zeiten: ["8:30-12:30"],
    //   hinweis: "Vom 28.06. bis 06.08. haben wir nur vormittags geöffnet." },

    // Einzelner Tag mit eigenen Zeiten (auch an einem Sonntag möglich):
    // { von: "2027-05-09", bis: "2027-05-09", zeiten: { Sonntag: ["8:00-12:00"] },
    //   hinweis: "Am Muttertag haben wir von 8:00 bis 12:00 Uhr geöffnet." },

  ]
};
