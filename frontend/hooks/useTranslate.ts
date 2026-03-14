import { useLanguage } from "@/context/LanguageContext";
import { TRANSLATIONS, TranslationKey } from "@/lib/translations";

export function useTranslate() {
    const { language } = useLanguage();

    const t = (key: TranslationKey): string => {
        const langDict = TRANSLATIONS[language] || TRANSLATIONS["English (US)"];
        return langDict[key as keyof typeof langDict] || key;
    };

    return { t, language };
}
