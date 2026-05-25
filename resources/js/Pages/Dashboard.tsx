import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    ExperienceItem,
    KeyValueItem,
    ResumeBlock,
    ResumeBlockType,
    ResumeLanguage,
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
    Image,
    Languages,
    Plus,
    Save,
    Trash2,
    Upload,
    X,
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

const languages: Array<{ value: ResumeLanguage; label: string; hint: string }> = [
    { value: 'en', label: 'EN', hint: 'English version' },
    { value: 'ru', label: 'RU', hint: 'Russian version' },
];

const emptyBlock = (): ResumeBlock => ({
    id: null,
    type: 'custom',
    title: 'New block',
    title_en: 'New block',
    title_ru: 'Новый блок',
    content: { text: '' },
    content_en: { text: '' },
    content_ru: { text: '' },
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
    logo_url: '',
    images: [],
    website_url: '',
});

const titleKey = (language: ResumeLanguage) =>
    language === 'en' ? 'title_en' : 'title_ru';

const contentKey = (language: ResumeLanguage) =>
    language === 'en' ? 'content_en' : 'content_ru';

const blockTitle = (block: ResumeBlock, language: ResumeLanguage) =>
    block[titleKey(language)] || block.title;

const blockContent = (block: ResumeBlock, language: ResumeLanguage) =>
    block[contentKey(language)] ?? block.content;

type DashboardProps = {
    blocks: ResumeBlock[];
    publicUrl: string;
};

export default function Dashboard({ blocks, publicUrl }: DashboardProps) {
    const { flash } = usePage().props as unknown as {
        flash?: { status?: string };
    };
    const [items, setItems] = useState<ResumeBlock[]>(
        blocks.map((block, position) => ({
            ...block,
            title_en: block.title_en ?? block.title,
            title_ru: block.title_ru ?? block.title,
            content_en: block.content_en ?? block.content,
            content_ru: block.content_ru ?? block.content,
            position,
        })),
    );
    const [activeLanguage, setActiveLanguage] =
        useState<ResumeLanguage>('en');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [uploadingKey, setUploadingKey] = useState<string | null>(null);

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

    const updateLocalizedTitle = (index: number, title: string) => {
        const key = titleKey(activeLanguage);

        setItems((current) =>
            current.map((block, blockIndex) =>
                blockIndex === index
                    ? { ...block, [key]: title, title: block.title_en }
                    : block,
            ),
        );
    };

    const updateLocalizedContent = (
        index: number,
        content: ResumeBlock['content'],
    ) => {
        const key = contentKey(activeLanguage);

        setItems((current) =>
            current.map((block, blockIndex) =>
                blockIndex === index
                    ? { ...block, [key]: content, content: block.content_en }
                    : block,
            ),
        );
    };

    const updateText = (index: number, text: string) => {
        setItems((current) =>
            current.map((block, blockIndex) =>
                blockIndex === index
                    ? {
                          ...block,
                          [contentKey(activeLanguage)]: {
                              ...blockContent(block, activeLanguage),
                              text,
                          },
                      }
                    : block,
            ),
        );
    };

    const updateItems = (
        index: number,
        nextItems: Array<KeyValueItem | ExperienceItem>,
    ) => {
        updateLocalizedContent(index, {
            ...blockContent(items[index], activeLanguage),
            items: nextItems,
        });
    };

    const keyValueItems = (block: ResumeBlock): KeyValueItem[] =>
        (blockContent(block, activeLanguage).items ?? []).filter(
            (item): item is KeyValueItem => !isExperienceItem(item),
        );

    const experienceItems = (block: ResumeBlock): ExperienceItem[] =>
        (blockContent(block, activeLanguage).items ?? []).filter(
            isExperienceItem,
        );

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

    const uploadResumeAsset = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('asset', file);

        const response = await window.axios.post<{ url: string }>(
            route('resume.assets.store'),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        );

        return response.data.url;
    };

    const uploadExperienceLogo = async (
        blockIndex: number,
        itemIndex: number,
        files: FileList | null,
    ) => {
        const file = files?.[0];

        if (!file) {
            return;
        }

        const key = `logo-${blockIndex}-${itemIndex}`;
        setUploadingKey(key);

        try {
            const url = await uploadResumeAsset(file);
            updateExperienceItem(blockIndex, itemIndex, { logo_url: url });
        } finally {
            setUploadingKey(null);
        }
    };

    const uploadExperienceImages = async (
        blockIndex: number,
        itemIndex: number,
        files: FileList | null,
    ) => {
        const selectedFiles = Array.from(files ?? []);

        if (selectedFiles.length === 0) {
            return;
        }

        const key = `images-${blockIndex}-${itemIndex}`;
        setUploadingKey(key);

        try {
            const urls = await Promise.all(selectedFiles.map(uploadResumeAsset));
            const currentItems = experienceItems(items[blockIndex]);
            const currentImages = currentItems[itemIndex]?.images ?? [];

            updateExperienceItem(blockIndex, itemIndex, {
                images: [...currentImages, ...urls],
            });
        } finally {
            setUploadingKey(null);
        }
    };

    const removeExperienceImage = (
        blockIndex: number,
        itemIndex: number,
        imageIndex: number,
    ) => {
        const currentItems = experienceItems(items[blockIndex]);
        const currentImages = currentItems[itemIndex]?.images ?? [];

        updateExperienceItem(blockIndex, itemIndex, {
            images: currentImages.filter((_, index) => index !== imageIndex),
        });
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
                    title: block.title_en,
                    content: block.content_en,
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
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white p-1">
                            <Languages className="ml-2 h-4 w-4 text-gray-500" />
                            {languages.map((language) => (
                                <button
                                    aria-pressed={
                                        activeLanguage === language.value
                                    }
                                    className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
                                        activeLanguage === language.value
                                            ? 'bg-gray-900 text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                    key={language.value}
                                    onClick={() =>
                                        setActiveLanguage(language.value)
                                    }
                                    title={language.hint}
                                    type="button"
                                >
                                    {language.label}
                                </button>
                            ))}
                        </div>
                        <a
                            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100"
                            href={publicUrl}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Public view
                        </a>
                        <Button onClick={save} className='text-green-500'>
                            <Save className="mr-2 h-4 w-4 text-green-500" />
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
                            Editing{' '}
                            <span className="font-semibold text-gray-900">
                                {activeLanguage.toUpperCase()}
                            </span>{' '}
                            content. Switch language to edit the second public
                            version.
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
                                                    <Label>
                                                        Title{' '}
                                                        {activeLanguage.toUpperCase()}
                                                    </Label>
                                                    <TextInput
                                                        className="mt-1"
                                                        value={blockTitle(
                                                            block,
                                                            activeLanguage,
                                                        )}
                                                        onChange={(event) =>
                                                            updateLocalizedTitle(
                                                                index,
                                                                event.target
                                                                    .value,
                                                            )
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
                                        <Label>
                                            Content{' '}
                                            {activeLanguage.toUpperCase()}
                                        </Label>
                                        <Textarea
                                            className="mt-1 font-mono text-sm"
                                            rows={
                                                block.type === 'experience'
                                                    ? 3
                                                    : 5
                                            }
                                            value={
                                                blockContent(
                                                    block,
                                                    activeLanguage,
                                                ).text ?? ''
                                            }
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

                                                        <TextInput
                                                            value={
                                                                item.website_url ??
                                                                ''
                                                            }
                                                            placeholder="Website URL"
                                                            type="url"
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateExperienceItem(
                                                                    index,
                                                                    itemIndex,
                                                                    {
                                                                        website_url:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    },
                                                                )
                                                            }
                                                        />

                                                        <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
                                                            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                                                                <Label>
                                                                    Company logo
                                                                </Label>
                                                                <div className="mt-3 flex items-center gap-3">
                                                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white">
                                                                        {item.logo_url ? (
                                                                            <img
                                                                                alt=""
                                                                                className="h-full w-full object-cover"
                                                                                src={
                                                                                    item.logo_url
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            <Image className="h-5 w-5 text-gray-400" />
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
                                                                            <Upload className="mr-2 h-4 w-4" />
                                                                            {uploadingKey ===
                                                                            `logo-${index}-${itemIndex}`
                                                                                ? 'Uploading'
                                                                                : 'Upload'}
                                                                            <input
                                                                                accept="image/*"
                                                                                className="sr-only"
                                                                                type="file"
                                                                                onChange={(
                                                                                    event,
                                                                                ) =>
                                                                                    uploadExperienceLogo(
                                                                                        index,
                                                                                        itemIndex,
                                                                                        event
                                                                                            .target
                                                                                            .files,
                                                                                    )
                                                                                }
                                                                            />
                                                                        </label>
                                                                        {item.logo_url && (
                                                                            <Button
                                                                                color="light"
                                                                                size="xs"
                                                                                className="mt-2"
                                                                                onClick={() =>
                                                                                    updateExperienceItem(
                                                                                        index,
                                                                                        itemIndex,
                                                                                        {
                                                                                            logo_url:
                                                                                                '',
                                                                                        },
                                                                                    )
                                                                                }
                                                                            >
                                                                                <X className="mr-1 h-4 w-4" />
                                                                                Remove
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                                    <Label>
                                                                        Gallery
                                                                    </Label>
                                                                    <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100">
                                                                        <Upload className="mr-2 h-4 w-4" />
                                                                        {uploadingKey ===
                                                                        `images-${index}-${itemIndex}`
                                                                            ? 'Uploading'
                                                                            : 'Add images'}
                                                                        <input
                                                                            accept="image/*"
                                                                            className="sr-only"
                                                                            multiple
                                                                            type="file"
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                uploadExperienceImages(
                                                                                    index,
                                                                                    itemIndex,
                                                                                    event
                                                                                        .target
                                                                                        .files,
                                                                                )
                                                                            }
                                                                        />
                                                                    </label>
                                                                </div>

                                                                {(item.images
                                                                    ?.length ??
                                                                    0) > 0 && (
                                                                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                                                                        {item.images?.map(
                                                                            (
                                                                                image,
                                                                                imageIndex,
                                                                            ) => (
                                                                                <div
                                                                                    className="group relative overflow-hidden rounded-md border border-gray-200 bg-white"
                                                                                    key={`${image}-${imageIndex}`}
                                                                                >
                                                                                    <img
                                                                                        alt=""
                                                                                        className="h-20 w-full object-cover"
                                                                                        src={
                                                                                            image
                                                                                        }
                                                                                    />
                                                                                    <button
                                                                                        aria-label="Remove image"
                                                                                        className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm hover:bg-white"
                                                                                        onClick={() =>
                                                                                            removeExperienceImage(
                                                                                                index,
                                                                                                itemIndex,
                                                                                                imageIndex,
                                                                                            )
                                                                                        }
                                                                                        type="button"
                                                                                    >
                                                                                        <X className="h-4 w-4" />
                                                                                    </button>
                                                                                </div>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
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
                            <Button className="w-full text-red-600" onClick={addBlock}>
                                <Plus className="mr-2 h-4 w-4 text-red-600" />
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
                                            {index + 1}.{' '}
                                            {blockTitle(
                                                block,
                                                activeLanguage,
                                            )}
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
