import {
    ResumeBlock,
    ExperienceItem,
    KeyValueItem,
    ResumeLanguage,
} from '@/types/resume';
import { Head } from '@inertiajs/react';
import {
    Building2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Languages,
    Mail,
    X,
} from 'lucide-react';
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

function TelegramLogo({ className }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            fill="currentColor"
            viewBox="0 0 24 24"
        >
            <path d="M21.8 4.4 18.5 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L5.9 13.5 1 12c-1.1-.3-1.1-1.1.2-1.6L20.3 3c.9-.3 1.7.2 1.5 1.4Z" />
        </svg>
    );
}

function GithubLogo({ className }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            fill="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                clipRule="evenodd"
                d="M12 .5A11.5 11.5 0 0 0 8.4 22.9c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 .1.6 2.9 3.3 2 .1-.8.4-1.4.7-1.7-2.6-.3-5.4-1.3-5.4-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.6.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0C17 4.6 18 4.9 18 4.9c.6 1.5.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.4 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z"
                fillRule="evenodd"
            />
        </svg>
    );
}

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

function ExperienceGallery({ item }: { item: ExperienceItem }) {
    const images = item.images?.filter(Boolean) ?? [];
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    if (images.length === 0) {
        return null;
    }

    const showImage = (index: number) => {
        if (images.length === 0) {
            return;
        }

        setActiveIndex((index + images.length) % images.length);
    };

    return (
        <div className="mt-4">
            <div className="relative overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
                <button
                    aria-label={`Open image ${activeIndex + 1} full screen`}
                    className="block h-56 w-full bg-zinc-100 sm:h-72"
                    onClick={() => setIsPreviewOpen(true)}
                    type="button"
                >
                    <img
                        alt={`${item.heading} image ${activeIndex + 1}`}
                        className="h-full w-full object-contain"
                        loading="lazy"
                        src={images[activeIndex]}
                    />
                </button>

                {images.length > 1 && (
                    <>
                        <button
                            aria-label="Previous image"
                            className="absolute left-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-800 shadow-sm transition hover:bg-white"
                            onClick={() => showImage(activeIndex - 1)}
                            type="button"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            aria-label="Next image"
                            className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-800 shadow-sm transition hover:bg-white"
                            onClick={() => showImage(activeIndex + 1)}
                            type="button"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {images.map((image, index) => (
                        <button
                            aria-label={`Show image ${index + 1}`}
                            aria-pressed={activeIndex === index}
                            className={`h-16 w-20 shrink-0 overflow-hidden rounded-md border transition sm:h-20 sm:w-28 ${
                                activeIndex === index
                                    ? 'border-zinc-950 ring-2 ring-zinc-950/15'
                                    : 'border-zinc-200 opacity-75 hover:opacity-100'
                            }`}
                            key={`${image}-${index}`}
                            onClick={() => showImage(index)}
                            type="button"
                        >
                            <img
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                                src={image}
                            />
                        </button>
                    ))}
                </div>
            )}

            {isPreviewOpen && (
                <div
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/95 p-3 pb-24 sm:p-6 sm:pb-28"
                    role="dialog"
                >
                    <button
                        aria-label="Close full screen image"
                        className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-5 sm:top-5"
                        onClick={() => setIsPreviewOpen(false)}
                        type="button"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {images.length > 1 && (
                        <button
                            aria-label="Previous image"
                            className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-5"
                            onClick={() => showImage(activeIndex - 1)}
                            type="button"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    )}

                    <img
                        alt={`${item.heading} image ${activeIndex + 1}`}
                        className="max-h-[86vh] max-w-full object-contain"
                        src={images[activeIndex]}
                    />

                    {images.length > 1 && (
                        <div className="absolute bottom-3 left-0 right-0 px-3 sm:bottom-5 sm:px-6">
                            <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto rounded-md bg-white/10 p-2 backdrop-blur">
                                {images.map((image, index) => (
                                    <button
                                        aria-label={`Show full screen image ${index + 1}`}
                                        aria-pressed={activeIndex === index}
                                        className={`h-16 w-20 shrink-0 overflow-hidden rounded-md border transition sm:h-20 sm:w-28 ${
                                            activeIndex === index
                                                ? 'border-white ring-2 ring-white/40'
                                                : 'border-white/20 opacity-70 hover:opacity-100'
                                        }`}
                                        key={`preview-${image}-${index}`}
                                        onClick={() => showImage(index)}
                                        type="button"
                                    >
                                        <img
                                            alt=""
                                            className="h-full w-full object-cover"
                                            src={image}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {images.length > 1 && (
                        <button
                            aria-label="Next image"
                            className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-5"
                            onClick={() => showImage(activeIndex + 1)}
                            type="button"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function ExperienceArticle({ item }: { item: ExperienceItem }) {
    const [isOpen, setIsOpen] = useState(true);
    const websiteUrl = item.website_url?.trim();

    return (
        <article className="relative pl-14">
            <div className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-md ring-1 ring-zinc-200">
                {item.logo_url ? (
                    <img
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        src={item.logo_url}
                    />
                ) : (
                    <Building2 className="h-5 w-5 text-zinc-500" />
                )}
            </div>

            <div className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
                <button
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-3 text-left"
                    onClick={() => setIsOpen((current) => !current)}
                    type="button"
                >
                    <span>
                        <span className="block font-semibold text-zinc-950">
                            {item.heading}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                            <span>{item.meta}</span>
                            {websiteUrl && (
                                <a
                                    aria-label={`${item.heading} website`}
                                    className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
                                    href={websiteUrl}
                                    onClick={(event) => event.stopPropagation()}
                                    rel="noreferrer"
                                    target="_blank"
                                >
                                    Website
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                            )}
                        </span>
                    </span>
                    <ChevronDown
                        className={`mt-1 h-5 w-5 shrink-0 text-zinc-500 transition ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </button>

                {isOpen && (
                    <div>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px] leading-7 text-zinc-800">
                            {item.bullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                            ))}
                        </ul>
                        <ExperienceGallery item={item} />
                    </div>
                )}
            </div>
        </article>
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
                    <ExperienceArticle item={item} key={index} />
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
                            <a
                                aria-label="Email"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-sm transition hover:border-zinc-950 hover:text-zinc-950"
                                href="mailto:mark230602@gmail.com"
                            >
                                <Mail className="h-5 w-5" />
                            </a>
                            <a
                                aria-label="Telegram"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-sm transition hover:border-zinc-950 hover:text-zinc-950"
                                href="https://t.me/Smaffe"
                            >
                                <TelegramLogo className="h-5 w-5" />
                            </a>
                            <a
                                aria-label="GitHub"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 shadow-sm transition hover:border-zinc-950 hover:text-zinc-950"
                                href="https://github.com/SmaffeBaby"
                            >
                                <GithubLogo className="h-5 w-5" />
                            </a>
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
