<?php

namespace App\Http\Controllers;

use App\Models\ResumeBlock;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ResumeController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();

        if ($user->resumeBlocks()->count() === 0) {
            $this->createDefaultBlocks($user);
        }

        return Inertia::render('Dashboard', [
            'blocks' => $this->localizedBlocks($user->resumeBlocks()->get()),
            'publicUrl' => route('resume.public'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'blocks' => ['required', 'array'],
            'blocks.*.id' => ['nullable', 'integer'],
            'blocks.*.type' => ['required', 'string', 'in:summary,skills,experience,projects,education,custom'],
            'blocks.*.title' => ['required', 'string', 'max:120'],
            'blocks.*.title_en' => ['required', 'string', 'max:120'],
            'blocks.*.title_ru' => ['required', 'string', 'max:120'],
            'blocks.*.content' => ['required', 'array'],
            'blocks.*.content_en' => ['required', 'array'],
            'blocks.*.content_ru' => ['required', 'array'],
            'blocks.*.is_visible' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($request, $validated) {
            $existingIds = $request->user()->resumeBlocks()->pluck('id')->all();
            $keptIds = collect($validated['blocks'])->pluck('id')->filter()->all();

            ResumeBlock::query()
                ->whereIn('id', array_diff($existingIds, $keptIds))
                ->delete();

            foreach ($validated['blocks'] as $position => $block) {
                ResumeBlock::query()->updateOrCreate(
                    [
                        'id' => $block['id'] ?? null,
                        'user_id' => $request->user()->id,
                    ],
                    [
                        'user_id' => $request->user()->id,
                        'type' => $block['type'],
                        'title' => $block['title_en'],
                        'title_en' => $block['title_en'],
                        'title_ru' => $block['title_ru'],
                        'content' => $block['content_en'],
                        'content_en' => $block['content_en'],
                        'content_ru' => $block['content_ru'],
                        'position' => $position,
                        'is_visible' => $block['is_visible'],
                    ],
                );
            }
        });

        return back()->with('status', 'resume-saved');
    }

    public function show(): Response
    {
        $user = User::query()->whereHas('resumeBlocks')->oldest()->first();

        return Inertia::render('PublicResume', [
            'blocks' => $user
                ? $this->localizedBlocks($user->resumeBlocks()->where('is_visible', true)->get())
                : [],
        ]);
    }

    private function localizedBlocks($blocks)
    {
        return $blocks->map(fn (ResumeBlock $block): array => [
            'id' => $block->id,
            'type' => $block->type,
            'title' => $block->title,
            'title_en' => $block->title_en ?? $block->title,
            'title_ru' => $block->title_ru ?? $block->title,
            'content' => $block->content,
            'content_en' => $block->content_en ?? $block->content,
            'content_ru' => $block->content_ru ?? $block->content,
            'position' => $block->position,
            'is_visible' => $block->is_visible,
        ]);
    }

    private function createDefaultBlocks(User $user): void
    {
        $blocks = [
            [
                'type' => 'summary',
                'title' => 'Summary',
                'title_en' => 'Summary',
                'title_ru' => 'О себе',
                'content' => [
                    'text' => 'Senior frontend-heavy fullstack engineer with 4+ years of commercial experience building production SPA/SSR products, API-driven dashboards, CRM systems, e-commerce automation, sports analytics platforms, and legacy migration initiatives.',
                ],
                'content_en' => [
                    'text' => 'Senior frontend-heavy fullstack engineer with 4+ years of commercial experience building production SPA/SSR products, API-driven dashboards, CRM systems, e-commerce automation, sports analytics platforms, and legacy migration initiatives.',
                ],
                'content_ru' => [
                    'text' => 'Senior frontend-heavy fullstack engineer с 4+ годами коммерческого опыта в разработке production SPA/SSR продуктов, API-driven dashboards, CRM-систем, e-commerce automation, sports analytics platforms и legacy migration initiatives.',
                ],
            ],
            [
                'type' => 'skills',
                'title' => 'Skills',
                'title_en' => 'Skills',
                'title_ru' => 'Навыки',
                'content' => [
                    'items' => [
                        ['label' => 'Frontend', 'value' => 'React, Vue.js, TypeScript, TailwindCSS'],
                        ['label' => 'State & Data', 'value' => 'Zustand, Pinia, TanStack Query'],
                        ['label' => 'Backend', 'value' => 'Express.js, FastAPI, PHP, Laravel'],
                        ['label' => 'Databases', 'value' => 'PostgreSQL, Supabase, MySQL, Redis, SQLite'],
                    ],
                ],
                'content_en' => [
                    'items' => [
                        ['label' => 'Frontend', 'value' => 'React, Vue.js, TypeScript, TailwindCSS'],
                        ['label' => 'State & Data', 'value' => 'Zustand, Pinia, TanStack Query'],
                        ['label' => 'Backend', 'value' => 'Express.js, FastAPI, PHP, Laravel'],
                        ['label' => 'Databases', 'value' => 'PostgreSQL, Supabase, MySQL, Redis, SQLite'],
                    ],
                ],
                'content_ru' => [
                    'items' => [
                        ['label' => 'Frontend', 'value' => 'React, Vue.js, TypeScript, TailwindCSS'],
                        ['label' => 'State & Data', 'value' => 'Zustand, Pinia, TanStack Query'],
                        ['label' => 'Backend', 'value' => 'Express.js, FastAPI, PHP, Laravel'],
                        ['label' => 'Databases', 'value' => 'PostgreSQL, Supabase, MySQL, Redis, SQLite'],
                    ],
                ],
            ],
            [
                'type' => 'experience',
                'title' => 'Experience',
                'title_en' => 'Experience',
                'title_ru' => 'Опыт',
                'content' => [
                    'items' => [
                        [
                            'heading' => 'NBA Analytics Platform - Fullstack Engineer',
                            'meta' => 'Mar 2026 - Present',
                            'bullets' => [
                                'Built a fullstack NBA analytics platform with live games, standings, playoff brackets, box scores, player/team pages, news, profiles, favorites, and discussions.',
                                'Developed a Vue + TypeScript + Vite frontend with reusable composables and route-level views for stats, game details, team analytics, playoffs, and public profiles.',
                                'Designed the data layer around an Express API gateway and FastAPI service using nba_api, normalizing NBA responses into stable UI models.',
                                'Implemented multi-layer caching, Supabase/PostgreSQL social features, RLS-backed admin workflows, and Docker Compose setup for the full local stack.',
                            ],
                        ],
                        [
                            'heading' => 'Digital Key Management Platform to Plati.ru - Fullstack Engineer',
                            'meta' => 'Apr 2026 - May 2026',
                            'bullets' => [
                                'Built an internal order-management dashboard for Plati.ru digital goods operations, covering orders, products, buyers, finances, profiles, and ru/en workflows.',
                                'Developed a React + TypeScript + Vite frontend with route-level pages, reusable components, custom business hooks, and a typed Supabase REST/Auth service layer.',
                                'Implemented order and catalog workflows with inline editing, drafts, filtering, sorting, pagination, status handling, stock validation, and TanStack Query cache updates.',
                                'Modeled Supabase/PostgreSQL auth/RLS data and added buyer/finance analytics, product history charts, D3 relationship graphs, and Dockerized deployment.',
                            ],
                        ],
                        [
                            'heading' => 'Gazprom Product Development Projects - Frontend / Fullstack Developer',
                            'meta' => '2025 - 2026',
                            'bullets' => [
                                'Developed Vue-based internal products for Gazprom, including a voluntary medical insurance system for doctors, meeting-room booking tools, and department-specific web portals.',
                                'Built interfaces with Vue + TypeScript + Vite, reusable components, and composable business logic for form-heavy workflows, schedules, status screens, and role-oriented dashboards.',
                                'Designed frontend data flows around REST APIs, query caching, validation, loading/error states, and PostgreSQL/MySQL-backed operational services.',
                                'Improved booking, request, profile, and approval flows while supporting Docker-based local environments and legacy modules across several products.',
                            ],
                        ],
                        [
                            'heading' => 'Indian Trado Commercial Web & CRM Products - Frontend / Fullstack Developer',
                            'meta' => '2024 - 2025',
                            'bullets' => [
                                'Developed commercial e-commerce and CRM products for Trado, covering orders, product catalogs, customer records, inventory views, and operational reporting.',
                                'Built production React + TypeScript + Vite modules with reusable UI components and form-heavy workflows for sales and fulfillment teams.',
                                'Implemented order and catalog flows with filtering, sorting, pagination, status handling, validation, editable tables, and normalized REST API data.',
                                'Added analytics views for customers, products, revenue, stock, and repeat purchases while contributing PHP backend functionality and Docker setup support.',
                            ],
                        ],
                        [
                            'heading' => 'Pride Group - Frontend / Fullstack Developer',
                            'meta' => 'Jul 2021 - Jul 2024',
                            'bullets' => [
                                'Built and maintained real-estate web products and CRM-connected workflows across React frontend modules and PHP CMS backends.',
                                'Developed catalog interfaces for large residential-complex and housing datasets, supporting more than 70,000 real-estate objects with search, filters, sorting, and detail pages.',
                                'Integrated website and internal workflows with Bitrix24 and optimized data-heavy catalog rendering.',
                                'Implemented reusable React components and modernized PHP/Drupal/Bitrix/MySQL modules without disrupting CRM integrations.',
                            ],
                        ],
                    ],
                ],
            ],
            [
                'type' => 'projects',
                'title' => 'Selected Projects',
                'title_en' => 'Selected Projects',
                'title_ru' => 'Избранные проекты',
                'content' => [
                    'items' => [
                        ['label' => 'NBA Analytics Platform', 'value' => 'Vue sports analytics product with Express + FastAPI data services, Supabase/PostgreSQL social features, cached statistics, and Dockerized deployment.'],
                        ['label' => 'Digital Key Management Platform', 'value' => 'React order and inventory dashboard with auth/RLS, buyer and finance analytics, product history, and D3 relationship graphs.'],
                    ],
                ],
            ],
            [
                'type' => 'education',
                'title' => 'Education',
                'title_en' => 'Education',
                'title_ru' => 'Образование',
                'content' => [
                    'text' => 'St. Petersburg, Admiral S.O. Makarov State University of Maritime and River Fleet, Applied Informatics (2020-2024)',
                ],
            ],
        ];

        foreach ($blocks as $position => $block) {
            $user->resumeBlocks()->create([
                ...$block,
                'title_en' => $block['title_en'] ?? $block['title'],
                'title_ru' => $block['title_ru'] ?? $block['title'],
                'content_en' => $block['content_en'] ?? $block['content'],
                'content_ru' => $block['content_ru'] ?? $block['content'],
                'position' => $position,
                'is_visible' => true,
            ]);
        }
    }
}
