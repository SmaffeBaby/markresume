import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ExperienceItem,
    KeyValueItem,
    ResumeBlock,
    ResumeBlockType,
} from '@/types/resume';
import { Head, router, usePage } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Label,
    Select,
    Textarea,
    TextInput,
    ToggleSwitch,
} from 'flowbite-react';
import {
    Eye,
    EyeOff,
    GripVertical,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';
import { DragEvent, useMemo, useState } from 'react';

const blockTypes: Array<{ value: ResumeBlockType; label: string }> = [
    { value: 'summary', label: 'Summary' },
    { value: 'skills', label: 'Skills' },
    { value: 'experience', label: 'Experience' },
    { value: 'projects', label: 'Projects' },
    { value: 'education', label: 'Education' },
    { value: 'custom', label: 'Custom' },
];

const emptyBlock = (): ResumeBlock => ({
    id: null,
    type: 'custom',
    title: 'New block',
    content: { text: '' },
    position: 0,
    is_visible: true,
});

const isExperienceItem = (
    item: KeyValueItem | ExperienceItem,
): item is ExperienceItem => 'heading' in item;

const emptyKeyValueItem = (): KeyValueItem => ({
    label: '',
    value: '',
});

const emptyExperienceItem = (): ExperienceItem => ({
    heading: '',
    meta: '',
    bullets: [''],
});

type DashboardProps = {
    blocks: ResumeBlock[];
    publicUrl: string;
};

export default function Dashboard({ blocks, publicUrl }: DashboardProps) {
    const { flash } = usePage().props as unknown as {
        flash?: { status?: string };
    };
    const [items, setItems] = useState<ResumeBlock[]>(
        blocks.map((block, position) => ({ ...block, position })),
    );
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const visibleCount = useMemo(
        () => items.filter((block) => block.is_visible).length,
        [items],
    );

    const updateBlock = (index: number, patch: Partial<ResumeBlock>) => {
        setItems((current) =>
            current.map((block, blockIndex) =>
                blockIndex === index ? { ...block, ...patch } : block,
            ),
        );
    };

    const updateText = (index: number, text: string) => {
        setItems((current) =>
            current.map((block, blockIndex) =>
                blockIndex === index
                    ? { ...block, content: { ...block.content, text } }
                    : block,
            ),
        );
    };

    const updateItems = (
        index: number,
        nextItems: Array<KeyValueItem | ExperienceItem>,
    ) => {
        setItems((current) =>
            current.map((block, blockIndex) =>
                blockIndex === index
                    ? {
                          ...block,
                          content: { ...block.content, items: nextItems },
                      }
                    : block,
            ),
        );
    };

    const keyValueItems = (block: ResumeBlock): KeyValueItem[] =>
        (block.content.items ?? []).filter(
            (item): item is KeyValueItem => !isExperienceItem(item),
        );

    const experienceItems = (block: ResumeBlock): ExperienceItem[] =>
        (block.content.items ?? []).filter(isExperienceItem);

    const updateKeyValueItem = (
        blockIndex: number,
        itemIndex: number,
        patch: Partial<KeyValueItem>,
    ) => {
        const currentItems = keyValueItems(items[blockIndex]);

        updateItems(
            blockIndex,
            currentItems.map((item, index) =>
                index === itemIndex ? { ...item, ...patch } : item,
            ),
        );
    };

    const addKeyValueItem = (blockIndex: number) => {
        updateItems(blockIndex, [
            ...keyValueItems(items[blockIndex]),
            emptyKeyValueItem(),
        ]);
    };

    const removeKeyValueItem = (blockIndex: number, itemIndex: number) => {
        updateItems(
            blockIndex,
            keyValueItems(items[blockIndex]).filter(
                (_, index) => index !== itemIndex,
            ),
        );
    };

    const updateExperienceItem = (
        blockIndex: number,
        itemIndex: number,
        patch: Partial<ExperienceItem>,
    ) => {
        const currentItems = experienceItems(items[blockIndex]);

        updateItems(
            blockIndex,
            currentItems.map((item, index) =>
                index === itemIndex ? { ...item, ...patch } : item,
            ),
        );
    };

    const updateExperienceBullet = (
        blockIndex: number,
        itemIndex: number,
        bulletIndex: number,
        value: string,
    ) => {
        const currentItems = experienceItems(items[blockIndex]);

        updateItems(
            blockIndex,
            currentItems.map((item, index) =>
                index === itemIndex
                    ? {
                          ...item,
                          bullets: item.bullets.map((bullet, currentBullet) =>
                              currentBullet === bulletIndex ? value : bullet,
                          ),
                      }
                    : item,
            ),
        );
    };

    const addExperienceItem = (blockIndex: number) => {
        updateItems(blockIndex, [
            ...experienceItems(items[blockIndex]),
            emptyExperienceItem(),
        ]);
    };

    const removeExperienceItem = (blockIndex: number, itemIndex: number) => {
        updateItems(
            blockIndex,
            experienceItems(items[blockIndex]).filter(
                (_, index) => index !== itemIndex,
            ),
        );
    };

    const addExperienceBullet = (blockIndex: number, itemIndex: number) => {
        const currentItems = experienceItems(items[blockIndex]);

        updateItems(
            blockIndex,
            currentItems.map((item, index) =>
                index === itemIndex
                    ? { ...item, bullets: [...item.bullets, ''] }
                    : item,
            ),
        );
    };

    const removeExperienceBullet = (
        blockIndex: number,
        itemIndex: number,
        bulletIndex: number,
    ) => {
        const currentItems = experienceItems(items[blockIndex]);

        updateItems(
            blockIndex,
            currentItems.map((item, index) =>
                index === itemIndex
                    ? {
                          ...item,
                          bullets: item.bullets.filter(
                              (_, currentBullet) =>
                                  currentBullet !== bulletIndex,
                          ),
                      }
                    : item,
            ),
        );
    };

    const addBlock = () => {
        setItems((current) => [
            ...current,
            { ...emptyBlock(), position: current.length },
        ]);
    };

    const deleteBlock = (index: number) => {
        setItems((current) =>
            current.filter((_, blockIndex) => blockIndex !== index),
        );
    };

    const moveBlock = (from: number, to: number) => {
        if (from === to || to < 0 || to >= items.length) {
            return;
        }

        setItems((current) => {
            const next = [...current];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next.map((block, position) => ({ ...block, position }));
        });
    };

    const onDrop = (event: DragEvent<HTMLDivElement>, index: number) => {
        event.preventDefault();

        if (draggedIndex !== null) {
            moveBlock(draggedIndex, index);
        }

        setDraggedIndex(null);
    };

    const save = () => {
        router.put(
            route('resume.update'),
            {
                blocks: items.map((block, position) => ({
                    ...block,
                    position,
                })),
            },
            { preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-900">
                            Resume editor
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {visibleCount} visible blocks
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <a
                            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
                            href={publicUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Public view
                        </a>
                        <Button onClick={save}>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Resume editor" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="mb-5 flex items-center justify-between rounded-md border border-gray-200 bg-white p-4">
                        <div className="text-sm text-gray-600">
                            Blocks are saved to the database and rendered on the
                            public resume page.
                        </div>
                        {flash?.status === 'resume-saved' && (
                            <Badge color="success">Saved</Badge>
                        )}
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="space-y-4">
                            {items.map((block, index) => (
                                <Card
                                    key={`${block.id ?? 'new'}-${index}`}
                                    id={`resume-block-${index}`}
                                    draggable
                                    onDragStart={() => setDraggedIndex(index)}
                                    onDragOver={(event) =>
                                        event.preventDefault()
                                    }
                                    onDrop={(event) => onDrop(event, index)}
                                    className="rounded-md"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex min-w-0 flex-1 gap-3">
                                            <button
                                                aria-label="Drag block"
                                                className="mt-8 cursor-grab rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                                type="button"
                                            >
                                                <GripVertical className="h-5 w-5" />
                                            </button>
                                            <div className="grid flex-1 gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                                                <div>
                                                    <Label>Type</Label>
                                                    <Select
                                                        className="mt-1"
                                                        value={block.type}
                                                        onChange={(event) =>
                                                            updateBlock(index, {
                                                                type: event
                                                                    .target
                                                                    .value as ResumeBlockType,
                                                            })
                                                        }
                                                    >
                                                        {blockTypes.map(
                                                            (type) => (
                                                                <option
                                                                    key={
                                                                        type.value
                                                                    }
                                                                    value={
                                                                        type.value
                                                                    }
                                                                >
                                                                    {type.label}
                                                                </option>
                                                            ),
                                                        )}
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Title</Label>
                                                    <TextInput
                                                        className="mt-1"
                                                        value={block.title}
                                                        onChange={(event) =>
                                                            updateBlock(index, {
                                                                title: event
                                                                    .target
                                                                    .value,
                                                            })
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <ToggleSwitch
                                                checked={block.is_visible}
                                                label={
                                                    block.is_visible
                                                        ? 'Visible'
                                                        : 'Hidden'
                                                }
                                                onChange={(checked) =>
                                                    updateBlock(index, {
                                                        is_visible: checked,
                                                    })
                                                }
                                            />
                                            <Button
                                                color="light"
                                                onClick={() =>
                                                    updateBlock(index, {
                                                        is_visible:
                                                            !block.is_visible,
                                                    })
                                                }
                                            >
                                                {block.is_visible ? (
                                                    <Eye className="h-4 w-4" />
                                                ) : (
                                                    <EyeOff className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                color="failure"
                                                onClick={() =>
                                                    deleteBlock(index)
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Content</Label>
                                        <Textarea
                                            className="mt-1 font-mono text-sm"
                                            rows={
                                                block.type === 'experience'
                                                    ? 3
                                                    : 5
                                            }
                                            value={block.content.text ?? ''}
                                            placeholder="Optional intro text for this block."
                                            onChange={(event) =>
                                                updateText(
                                                    index,
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    {['skills', 'projects'].includes(
                                        block.type,
                                    ) && (
                                        <div className="space-y-3 rounded-md border border-gray-200 bg-gray-50 p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <Label>Rows</Label>
                                                <Button
                                                    color="light"
                                                    size="xs"
                                                    onClick={() =>
                                                        addKeyValueItem(index)
                                                    }
                                                >
                                                    <Plus className="mr-1 h-4 w-4" />
                                                    Add row
                                                </Button>
                                            </div>

                                            {keyValueItems(block).map(
                                                (item, itemIndex) => (
                                                    <div
                                                        className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)_44px]"
                                                        key={itemIndex}
                                                    >
                                                        <TextInput
                                                            value={item.label}
                                                            placeholder="Label"
                                                            onChange={(event) =>
                                                                updateKeyValueItem(
                                                                    index,
                                                                    itemIndex,
                                                                    {
                                                                        label: event
                                                                            .target
                                                                            .value,
                                                                    },
                                                                )
                                                            }
                                                        />
                                                        <TextInput
                                                            value={item.value}
                                                            placeholder="Value"
                                                            onChange={(event) =>
                                                                updateKeyValueItem(
                                                                    index,
                                                                    itemIndex,
                                                                    {
                                                                        value: event
                                                                            .target
                                                                            .value,
                                                                    },
                                                                )
                                                            }
                                                        />
                                                        <Button
                                                            color="light"
                                                            onClick={() =>
                                                                removeKeyValueItem(
                                                                    index,
                                                                    itemIndex,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}

                                    {block.type === 'experience' && (
                                        <div className="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <Label>Experience entries</Label>
                                                <Button
                                                    color="light"
                                                    size="xs"
                                                    onClick={() =>
                                                        addExperienceItem(index)
                                                    }
                                                >
                                                    <Plus className="mr-1 h-4 w-4" />
                                                    Add experience
                                                </Button>
                                            </div>

                                            {experienceItems(block).map(
                                                (item, itemIndex) => (
                                                    <div
                                                        className="space-y-3 rounded-md border border-gray-200 bg-white p-3"
                                                        key={itemIndex}
                                                    >
                                                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px_44px]">
                                                            <TextInput
                                                                value={
                                                                    item.heading
                                                                }
                                                                placeholder="Company / project - role"
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateExperienceItem(
                                                                        index,
                                                                        itemIndex,
                                                                        {
                                                                            heading:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                            <TextInput
                                                                value={
                                                                    item.meta
                                                                }
                                                                placeholder="Dates"
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateExperienceItem(
                                                                        index,
                                                                        itemIndex,
                                                                        {
                                                                            meta: event
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                            />
                                                            <Button
                                                                color="light"
                                                                onClick={() =>
                                                                    removeExperienceItem(
                                                                        index,
                                                                        itemIndex,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>

                                                        <div className="space-y-2">
                                                            {item.bullets.map(
                                                                (
                                                                    bullet,
                                                                    bulletIndex,
                                                                ) => (
                                                                    <div
                                                                        className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_44px]"
                                                                        key={
                                                                            bulletIndex
                                                                        }
                                                                    >
                                                                        <Textarea
                                                                            rows={
                                                                                2
                                                                            }
                                                                            value={
                                                                                bullet
                                                                            }
                                                                            placeholder="Bullet"
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                updateExperienceBullet(
                                                                                    index,
                                                                                    itemIndex,
                                                                                    bulletIndex,
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        <Button
                                                                            color="light"
                                                                            onClick={() =>
                                                                                removeExperienceBullet(
                                                                                    index,
                                                                                    itemIndex,
                                                                                    bulletIndex,
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>

                                                        <Button
                                                            color="light"
                                                            size="xs"
                                                            onClick={() =>
                                                                addExperienceBullet(
                                                                    index,
                                                                    itemIndex,
                                                                )
                                                            }
                                                        >
                                                            <Plus className="mr-1 h-4 w-4" />
                                                            Add bullet
                                                        </Button>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>

                        <aside className="h-fit rounded-md border border-gray-200 bg-white p-4">
                            <Button className="w-full" onClick={addBlock}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add block
                            </Button>
                            <div className="mt-5 space-y-2 text-sm text-gray-600">
                                {items.map((block, index) => (
                                    <button
                                        className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-gray-100"
                                        key={`${block.title}-${index}`}
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    `resume-block-${index}`,
                                                )
                                                ?.scrollIntoView({
                                                    behavior: 'smooth',
                                                    block: 'center',
                                                })
                                        }
                                        type="button"
                                    >
                                        <span className="truncate">
                                            {index + 1}. {block.title}
                                        </span>
                                        {block.is_visible ? (
                                            <Eye className="h-4 w-4 text-emerald-600" />
                                        ) : (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
