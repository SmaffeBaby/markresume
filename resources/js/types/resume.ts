export type ResumeBlockType =
    | 'summary'
    | 'skills'
    | 'experience'
    | 'projects'
    | 'education'
    | 'custom';

export type KeyValueItem = {
    label: string;
    value: string;
};

export type ExperienceItem = {
    heading: string;
    meta: string;
    bullets: string[];
};

export type ResumeBlockContent = {
    text?: string;
    items?: Array<KeyValueItem | ExperienceItem>;
};

export type ResumeLanguage = 'en' | 'ru';

export type ResumeBlock = {
    id: number | null;
    type: ResumeBlockType;
    title: string;
    title_en: string;
    title_ru: string;
    content: ResumeBlockContent;
    content_en: ResumeBlockContent;
    content_ru: ResumeBlockContent;
    position: number;
    is_visible: boolean;
};
