export type TempleLanguage = 'si' | 'en'

export type Bilingual = { si: string; en: string }

export type Temple = {
    /** The register code a temple office gives out, e.g. SMB-VIH-0042. */
    code: string
    name: Bilingual
    village: Bilingual
    district: Bilingual
    postalCode: string
}

export const TEMPLES: Temple[] = [
    {
        code: 'GNG-VIH-0001',
        name: {si: 'ගංගාරාම විහාරය', en: 'Gangaramaya Viharaya'},
        village: {si: 'හුණුපිටිය', en: 'Hunupitiya'},
        district: {si: 'කොළඹ', en: 'Colombo'},
        postalCode: '00200',
    },
    {
        code: 'BOD-VIH-0002',
        name: {si: 'ශ්‍රී මහා බෝධි විහාරය', en: 'Sri Maha Bodhi Viharaya'},
        village: {si: 'කොළඹ 07', en: 'Colombo 07'},
        district: {si: 'කොළඹ', en: 'Colombo'},
        postalCode: '00700',
    },
    {
        code: 'KLN-VIH-0003',
        name: {si: 'කැළණිය රජ මහා විහාරය', en: 'Kelaniya Raja Maha Viharaya'},
        village: {si: 'කැළණිය', en: 'Kelaniya'},
        district: {si: 'ගම්පහ', en: 'Gampaha'},
        postalCode: '11600',
    },
    {
        code: 'SMB-VIH-0042',
        name: {si: 'ශ්‍රී සම්බෝධි මහා විහාරය', en: 'Sri Sambodhi Maha Viharaya'},
        village: {si: 'කදොල්කැලේ', en: 'Kadolkele'},
        district: {si: 'ගම්පහ', en: 'Gampaha'},
        postalCode: '11500',
    },
    {
        code: 'ASG-VIH-0005',
        name: {si: 'අස්ගිරි මහා විහාරය', en: 'Asgiri Maha Viharaya'},
        village: {si: 'අස්ගිරිය', en: 'Asgiriya'},
        district: {si: 'මහනුවර', en: 'Kandy'},
        postalCode: '20000',
    },
    {
        code: 'DLD-VIH-0006',
        name: {si: 'ශ්‍රී දළදා මාළිගාව', en: 'Sri Dalada Maligawa'},
        village: {si: 'මහනුවර', en: 'Kandy'},
        district: {si: 'මහනුවර', en: 'Kandy'},
        postalCode: '20000',
    },
    {
        code: 'KLT-VIH-0007',
        name: {si: 'කළුතර චෛත්‍ය රජ මහා විහාරය', en: 'Kalutara Chaithya Raja Maha Viharaya'},
        village: {si: 'කළුතර', en: 'Kalutara'},
        district: {si: 'කළුතර', en: 'Kalutara'},
        postalCode: '12000',
    },
    {
        code: 'UNW-VIH-0008',
        name: {si: 'උණවටුන ශ්‍රී සුමංගල විහාරය', en: 'Unawatuna Sri Sumangala Viharaya'},
        village: {si: 'උණවටුන', en: 'Unawatuna'},
        district: {si: 'ගාල්ල', en: 'Galle'},
        postalCode: '80600',
    },
    {
        code: 'DEV-VIH-0009',
        name: {si: 'දෙවිනුවර ශ්‍රී විජයසුන්දරාරාමය', en: 'Devinuwara Sri Vijayasundararama'},
        village: {si: 'දෙවිනුවර', en: 'Devinuwara'},
        district: {si: 'මාතර', en: 'Matara'},
        postalCode: '81180',
    },
    {
        code: 'MIH-VIH-0010',
        name: {si: 'මිහින්තලා රජ මහා විහාරය', en: 'Mihintale Raja Maha Viharaya'},
        village: {si: 'මිහින්තලය', en: 'Mihintale'},
        district: {si: 'අනුරාධපුර', en: 'Anuradhapura'},
        postalCode: '50300',
    },
    {
        code: 'MED-VIH-0011',
        name: {si: 'මැදිරිගිරිය රජ මහා විහාරය', en: 'Medirigiriya Raja Maha Viharaya'},
        village: {si: 'මැදිරිගිරිය', en: 'Medirigiriya'},
        district: {si: 'පොළොන්නරුව', en: 'Polonnaruwa'},
        postalCode: '51500',
    },
    {
        code: 'RDG-VIH-0012',
        name: {si: 'රිදීගම රජ මහා විහාරය', en: 'Ridigama Raja Maha Viharaya'},
        village: {si: 'රිදීගම', en: 'Ridigama'},
        district: {si: 'කුරුණෑගල', en: 'Kurunegala'},
        postalCode: '60700',
    },
    {
        code: 'EMB-VIH-0013',
        name: {si: 'ඇඹිලිපිටිය ශ්‍රී සම්බුද්ධ විහාරය', en: 'Embilipitiya Sri Sambuddha Viharaya'},
        village: {si: 'ඇඹිලිපිටිය', en: 'Embilipitiya'},
        district: {si: 'රත්නපුර', en: 'Ratnapura'},
        postalCode: '70200',
    },
    {
        code: 'MHI-VIH-0014',
        name: {si: 'මහියංගන රජ මහා විහාරය', en: 'Mahiyangana Raja Maha Viharaya'},
        village: {si: 'මහියංගනය', en: 'Mahiyanganaya'},
        district: {si: 'බදුල්ල', en: 'Badulla'},
        postalCode: '90700',
    },
    {
        code: 'NAW-VIH-0015',
        name: {si: 'නාවල පුරාණ විහාරය', en: 'Nawala Purana Viharaya'},
        village: {si: 'නාවල', en: 'Nawala'},
        district: {si: 'කොළඹ', en: 'Colombo'},
        postalCode: '00560',
    },
]

/* ----------------------------- Districts ---------------------------- */

/** The 25 districts, in both languages, in the same order. */
export const DISTRICTS: Bilingual[] = [
    {en: 'Ampara', si: 'අම්පාර'},
    {en: 'Anuradhapura', si: 'අනුරාධපුර'},
    {en: 'Badulla', si: 'බදුල්ල'},
    {en: 'Batticaloa', si: 'මඩකලපුව'},
    {en: 'Colombo', si: 'කොළඹ'},
    {en: 'Galle', si: 'ගාල්ල'},
    {en: 'Gampaha', si: 'ගම්පහ'},
    {en: 'Hambantota', si: 'හම්බන්තොට'},
    {en: 'Jaffna', si: 'යාපනය'},
    {en: 'Kalutara', si: 'කළුතර'},
    {en: 'Kandy', si: 'මහනුවර'},
    {en: 'Kegalle', si: 'කෑගල්ල'},
    {en: 'Kilinochchi', si: 'කිලිනොච්චි'},
    {en: 'Kurunegala', si: 'කුරුණෑගල'},
    {en: 'Mannar', si: 'මන්නාරම'},
    {en: 'Matale', si: 'මාතලේ'},
    {en: 'Matara', si: 'මාතර'},
    {en: 'Monaragala', si: 'මොණරාගල'},
    {en: 'Mullaitivu', si: 'මුලතිව්'},
    {en: 'Nuwara Eliya', si: 'නුවරඑළිය'},
    {en: 'Polonnaruwa', si: 'පොළොන්නරුව'},
    {en: 'Puttalam', si: 'පුත්තලම'},
    {en: 'Ratnapura', si: 'රත්නපුර'},
    {en: 'Trincomalee', si: 'ත්‍රිකුණාමලය'},
    {en: 'Vavuniya', si: 'වවුනියාව'},
]

/** District names for the dropdown, in whichever language the form is using. */
export const districtOptions = (language: TempleLanguage): string[] =>
    DISTRICTS.map((district) => district[language])

/* ------------------------------ Lookups ----------------------------- */

const SINHALA = /[\u0D80-\u0DFF]/

/** Anything written in Sinhala script answers "si", everything else "en". */
export const detectLanguage = (value: string): TempleLanguage =>
    SINHALA.test(value) ? 'si' : 'en'

const normalise = (value: string) => value.trim().toLocaleLowerCase()

/** Temple name, village or code — typed in either language. Up to `limit` matches. */
export const suggestTemples = (query: string, limit = 6): Temple[] => {
    const q = normalise(query)
    if (!q) return []

    return TEMPLES.filter((temple) =>
        temple.name.si.includes(query.trim()) ||
        normalise(temple.name.en).includes(q) ||
        normalise(temple.code).includes(q) ||
        temple.village.si.includes(query.trim()) ||
        normalise(temple.village.en).includes(q) ||
        normalise(temple.district.en).includes(q),
    ).slice(0, limit)
}

/** Exact code match, ignoring case and stray spaces — used when the code field is filled in. */
export const findTempleByCode = (code: string): Temple | undefined => {
    const wanted = normalise(code)
    if (!wanted) return undefined
    return TEMPLES.find((temple) => normalise(temple.code) === wanted)
}

/** Exact name match in either language — used when the name field is left. */
export const findTempleByName = (name: string): Temple | undefined => {
    const wanted = normalise(name)
    if (!wanted) return undefined
    return TEMPLES.find((temple) =>
        normalise(temple.name.en) === wanted || temple.name.si.trim() === name.trim())
}

/**
 * Name match narrowed by district, so "temple name + district" can pin down one temple when two
 * share a name. Pass an empty district to skip the narrowing.
 */
/**
 * Resolve a temple from a name, narrowed by a district when one has been chosen.
 *
 * A blank district is no constraint — the name alone is enough, and there is nothing to conflict
 * with. Once a district has been chosen it has to agree: a name that matches a temple in Gampaha
 * must not overwrite a district the user deliberately set to Colombo.
 */
export const findTempleByNameAndDistrict = (name: string, district: string): Temple | undefined => {
    const matches = TEMPLES.filter((temple) =>
        normalise(temple.name.en) === normalise(name) || temple.name.si.trim() === name.trim())
    if (matches.length === 0) return undefined
    if (!district.trim()) return matches[0]

    const wanted = normalise(district)
    return matches.find((temple) =>
        normalise(temple.district.en) === wanted || temple.district.si.trim() === district.trim())
}