import {
    ResumeBlock,
    ExperienceItem,
    KeyValueItem,
    ResumeLanguage,
} from '@/types/resume';
import { Head } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import { useEffect, useState } from 'react';

type PublicResumeProps = {
    blocks: ResumeBlock[];
};

const isExperienceItem = (
    item: KeyValueItem | ExperienceItem,
): item is ExperienceItem => 'heading' in item;

const languages: Array<{ value: ResumeLanguage; label: string }> = [
    { value: 'en', label: 'EN' },
    { value: 'ru', label: 'RU' },
];

const titleKey = (language: ResumeLanguage) =>
    language === 'en' ? 'title_en' : 'title_ru';

const contentKey = (language: ResumeLanguage) =>
    language === 'en' ? 'content_en' : 'content_ru';

const blockTitle = (block: ResumeBlock, language: ResumeLanguage) =>
    block[titleKey(language)] || block.title;

const blockContent = (block: ResumeBlock, language: ResumeLanguage) =>
    block[contentKey(language)] ?? block.content;

function LanguageBadge({
    language,
    onChange,
}: {
    language: ResumeLanguage;
    onChange: (language: ResumeLanguage) => void;
}) {
    return (
        <div className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white/90 p-1 shadow-sm">
            <Languages className="ml-2 h-4 w-4 text-zinc-500" />
            {languages.map((item) => (
                <button
                    aria-pressed={language === item.value}
                    className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${
                        language === item.value
                            ? 'bg-zinc-950 text-white shadow-sm'
                            : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950'
                    }`}
                    key={item.value}
                    onClick={() => onChange(item.value)}
                    type="button"
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
}

function BlockContent({
    block,
    language,
}: {
    block: ResumeBlock;
    language: ResumeLanguage;
}) {
    const content = blockContent(block, language);

    return (
        <div className="space-y-3">
            {content.text && (
                <p className="whitespace-pre-line text-[15px] leading-7 text-zinc-800">
                    {content.text}
                </p>
            )}

            {content.items?.map((item, index) =>
                isExperienceItem(item) ? (
                    <article key={index} className="border-l-2 border-zinc-300 pl-4">
                        <h3 className="font-semibold text-zinc-950">
                            {item.heading}
                        </h3>
                        <p className="text-sm text-zinc-500">{item.meta}</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-7 text-zinc-800">
                            {item.bullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                            ))}
                        </ul>
                    </article>
                ) : (
                    <div
                        key={index}
                        className="grid gap-1 border-b border-zinc-200 pb-2 sm:grid-cols-[180px_minmax(0,1fr)]"
                    >
                        <strong className="text-zinc-950">{item.label}</strong>
                        <span className="text-zinc-800">{item.value}</span>
                    </div>
                ),
            )}
        </div>
    );
}

export default function PublicResume({ blocks }: PublicResumeProps) {
    const [language, setLanguage] = useState<ResumeLanguage>('en');

    useEffect(() => {
        const storedLanguage = window.localStorage.getItem('resume-language');

        if (storedLanguage === 'en' || storedLanguage === 'ru') {
            setLanguage(storedLanguage);
        }
    }, []);

    const changeLanguage = (nextLanguage: ResumeLanguage) => {
        setLanguage(nextLanguage);
        window.localStorage.setItem('resume-language', nextLanguage);
    };

    return (
        <main className="min-h-screen bg-zinc-100 px-5 py-8 text-zinc-950">
            <Head title="Mark Andreev" />

            <div className="mx-auto max-w-4xl">
                <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-zinc-300 pb-5">
                    <div>
                        <h1 className="text-4xl font-bold tracking-normal">
                            Mark Andreev
                        </h1>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm">
                            <a href="mailto:mark230602@gmail.com">
                                mark230602@gmail.com
                            </a>
                            <a href="https://t.me/Smaffe">Telegram</a>
                            <a href="https://github.com/SmaffeBaby">GitHub</a>
                        </div>
                    </div>
                    <LanguageBadge
                        language={language}
                        onChange={changeLanguage}
                    />
                </header>

                {blocks.length === 0 ? (
                    <section className="rounded-md border border-zinc-300 bg-white p-6">
                        <h2 className="text-xl font-semibold">
                            {language === 'en'
                                ? 'Resume is empty'
                                : 'Резюме пока пустое'}
                        </h2>
                        <p className="mt-2 text-zinc-600">
                            {language === 'en'
                                ? 'Sign in and add the first blocks to publish the CV.'
                                : 'Войдите в dashboard и добавьте первые блоки, чтобы опубликовать CV.'}
                        </p>
                    </section>
                ) : (
                    <div className="space-y-8">
                        {blocks.map((block, index) => (
                            <section
                                key={block.id ?? index}
                                className="border-b border-zinc-300 pb-7"
                            >
                                <h2 className="mb-3 text-2xl font-bold">
                                    {index + 1}.{' '}
                                    {blockTitle(block, language)}
                                </h2>
                                <BlockContent
                                    block={block}
                                    language={language}
                                />
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
