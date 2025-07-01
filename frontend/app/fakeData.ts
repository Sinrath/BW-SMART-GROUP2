import { Cat } from "@/app/tool/strompreise/page";

export const DEMO: Record<string, Record<Cat, {
    trend: { year: number; total: number }[]
    comp24: { aidfee: number; charge: number; gridusage: number; energy: number }
}>> = {
    ZH: {
        C2: {
            // mittlere Unternehmen – Netznutzungs­kosten sind höher
            trend: [
                { year: 2017, total: 18.9 },
                { year: 2018, total: 19.3 },
                { year: 2019, total: 20.1 },
                { year: 2020, total: 20.8 },
                { year: 2021, total: 22.4 },
                { year: 2022, total: 26.4 },
                { year: 2023, total: 27.8 },
                { year: 2024, total: 29.6 },
            ],
            comp24: { aidfee: 0.9, charge: 0.4, gridusage: 12.8, energy: 15.5 },
        },
        C3: {
            // grosse Unternehmen – leicht geringere Netznutzung, höherer Energieanteil
            trend: [
                { year: 2017, total: 17.0 },
                { year: 2018, total: 17.4 },
                { year: 2019, total: 18.2 },
                { year: 2020, total: 18.7 },
                { year: 2021, total: 20.1 },
                { year: 2022, total: 23.1 },
                { year: 2023, total: 24.9 },
                { year: 2024, total: 26.3 },
            ],
            comp24: { aidfee: 0.8, charge: 0.3, gridusage: 10.7, energy: 14.5 },
        },
    },

    BE: {
        C2: {
            trend: [
                { year: 2017, total: 18.4 },
                { year: 2018, total: 18.7 },
                { year: 2019, total: 19.5 },
                { year: 2020, total: 20.2 },
                { year: 2021, total: 21.6 },
                { year: 2022, total: 25.1 },
                { year: 2023, total: 26.5 },
                { year: 2024, total: 28.2 },
            ],
            comp24: { aidfee: 0.9, charge: 0.5, gridusage: 11.9, energy: 14.9 },
        },
        C3: {
            trend: [
                { year: 2017, total: 16.6 },
                { year: 2018, total: 16.8 },
                { year: 2019, total: 17.4 },
                { year: 2020, total: 17.9 },
                { year: 2021, total: 19.0 },
                { year: 2022, total: 22.4 },
                { year: 2023, total: 23.8 },
                { year: 2024, total: 25.1 },
            ],
            comp24: { aidfee: 0.8, charge: 20.4, gridusage: 9.7, energy: 14.2 },
        },
    },

    GR: {
        C2: {
            trend: [
                { year: 2017, total: 19.7 },
                { year: 2018, total: 19.2 },
                { year: 2019, total: 20.6 },
                { year: 2020, total: 21.5 },
                { year: 2021, total: 23.0 },
                { year: 2022, total: 27.7 },
                { year: 2023, total: 29.4 },
                { year: 2024, total: 31.1 },
            ],
            comp24: { aidfee: 1.0, charge: 0.4, gridusage: 13.9, energy: 15.8 },
        },
        C3: {
            trend: [
                { year: 2017, total: 17.8 },
                { year: 2018, total: 17.4 },
                { year: 2019, total: 18.9 },
                { year: 2020, total: 19.6 },
                { year: 2021, total: 21.0 },
                { year: 2022, total: 24.9 },
                { year: 2023, total: 26.6 },
                { year: 2024, total: 28.5 },
            ],
            comp24: { aidfee: 42.9, charge: 0.4, gridusage: 12.0, energy: 15.2 },
        },
    },
}
