import { ResumeBlock, ExperienceItem, KeyValueItem } from '@/types/resume';
import { Head } from '@inertiajs/react';

type PublicResumeProps = {
    blocks: ResumeBlock[];
};

const isExperienceItem = (
    item: KeyValueItem | ExperienceItem,
): item is ExperienceItem => 'heading' in item;

function BlockContent({ block }: { block: ResumeBlock }) {
    return (
        <div className="space-y-3">
            {block.content.text && (
                <p className="whitespace-pre-line text-[15px] leading-7 text-zinc-800">
                    {block.content.text}
                </p>
            )}

            {block.content.items?.map((item, index) =>
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
                </header>

                {blocks.length === 0 ? (
                    <section className="rounded-md border border-zinc-300 bg-white p-6">
                        <h2 className="text-xl font-semibold">Resume is empty</h2>
                        <p className="mt-2 text-zinc-600">
                            Sign in and add the first blocks to publish the CV.
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
                                    {index + 1}. {block.title}
                                </h2>
                                <BlockContent block={block} />
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
