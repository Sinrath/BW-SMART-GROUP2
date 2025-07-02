import { Cat } from "@/app/types/categories"

/* ─── Strompreis-Daten  (Rp./kWh) ───────────────────────── */
export const DEMO: Record<string, Record<Cat, {
    trend: { year:number; total:number }[]
    comp24: { aidfee:number; charge:number; gridusage:number; energy:number }
}>> = {
    /* Zürich bleibt moderat steigend - nur leichte Anpassung */
    ZH: {
        C2: { trend: [
                { year:2017,total: 19.0 },
                { year:2018,total: 19.4 },
                { year:2019,total: 20.3 },
                { year:2020,total: 21.2 },
                { year:2021,total: 23.5 },
                { year:2022,total: 27.8 },
                { year:2023,total: 31.6 },
                { year:2024,total: 35.2 },
            ], comp24:{ aidfee:1.0, charge:0.5, gridusage:13.4, energy:20.3 } },

        C3: { trend: [
                { year:2017,total: 17.2 },
                { year:2018,total: 17.6 },
                { year:2019,total: 18.5 },
                { year:2020,total: 19.3 },
                { year:2021,total: 21.4 },
                { year:2022,total: 25.5 },
                { year:2023,total: 29.7 },
                { year:2024,total: 33.1 },
            ], comp24:{ aidfee:0.9, charge:0.4, gridusage:11.2, energy:20.6 } },
    },

    /* Bern jetzt mit „polynomialem“ Schub – steiler Anstieg */
    BE: {
        C2: { trend: [
                { year:2017,total: 18.4 },
                { year:2018,total: 18.8 },
                { year:2019,total: 19.6 },
                { year:2020,total: 21.0 },
                { year:2021,total: 26.0 },
                { year:2022,total: 32.5 },
                { year:2023,total: 38.9 },
                { year:2024,total: 43.5 },
            ], comp24:{ aidfee:1.1, charge:0.6, gridusage:13.0, energy:28.8 } },

        C3: { trend: [
                { year:2017,total: 16.6 },
                { year:2018,total: 17.0 },
                { year:2019,total: 17.9 },
                { year:2020,total: 19.0 },
                { year:2021,total: 24.5 },
                { year:2022,total: 31.0 },
                { year:2023,total: 37.8 },
                { year:2024,total: 42.2 },
            ], comp24:{ aidfee:1.0, charge:0.5, gridusage:10.8, energy:29.9 } },
    },

    /* Graubünden ebenfalls stärker steigend */
    GR: {
        C2: { trend: [
                { year:2017,total: 19.7 },
                { year:2018,total: 20.1 },
                { year:2019,total: 21.4 },
                { year:2020,total: 22.9 },
                { year:2021,total: 28.8 },
                { year:2022,total: 35.7 },
                { year:2023,total: 41.9 },
                { year:2024,total: 47.3 },
            ], comp24:{ aidfee:1.2, charge:0.5, gridusage:14.6, energy:31.0 } },

        C3: { trend: [
                { year:2017,total: 17.8 },
                { year:2018,total: 18.2 },
                { year:2019,total: 19.4 },
                { year:2020,total: 20.9 },
                { year:2021,total: 26.3 },
                { year:2022,total: 33.1 },
                { year:2023,total: 39.5 },
                { year:2024,total: 44.8 },
            ], comp24:{ aidfee:1.0, charge:0.4, gridusage:12.7, energy:30.7 } },
    },
}

/* --- LED Basis ------------------------------------------------- */
export const BASE = { price: 20, watt: 18 }   // 18 W – höherer Verbrauch

/* --- Smart-Lampen --------------------------------------------- */
export const LAMPS = {
    nomus:  { label: "Nomus 50 %",   price: 200, watt:  7  },
    econ:   { label: "EcoSmart 40 %",price: 150, watt:  8.4},
    budget: { label: "Budget 30 %",  price:  80, watt:  9  }, // Break-Even ≈ 3 J.
}

/* Alle 26 Kantone (für Popover) */
export const CANTON_LIST = [
    "AG","AI","AR","BE","BL","BS","FR","GE","GL","GR","JU","LU","NE","NW","OW",
    "SG","SH","SO","SZ","TG","TI","UR","VD","VS","ZG","ZH",
]
