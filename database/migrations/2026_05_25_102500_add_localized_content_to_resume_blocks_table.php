<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('resume_blocks', function (Blueprint $table) {
            $table->string('title_en')->nullable();
            $table->string('title_ru')->nullable();
            $table->json('content_en')->nullable();
            $table->json('content_ru')->nullable();
        });

        DB::table('resume_blocks')
            ->orderBy('id')
            ->each(function (object $block): void {
                DB::table('resume_blocks')
                    ->where('id', $block->id)
                    ->update([
                        'title_en' => $block->title,
                        'title_ru' => $block->title,
                        'content_en' => $block->content,
                        'content_ru' => $block->content,
                    ]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resume_blocks', function (Blueprint $table) {
            $table->dropColumn([
                'title_en',
                'title_ru',
                'content_en',
                'content_ru',
            ]);
        });
    }
};
