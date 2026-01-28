<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add indexes for common query patterns
        Schema::table('cases', function (Blueprint $table) {
            $table->index('province');
            $table->index('status');
            $table->index('diagnosis_date');
            $table->index(['province', 'status']);
            $table->index(['disease_id', 'status']);
        });

        Schema::table('alerts', function (Blueprint $table) {
            $table->index(['is_active', 'expires_at']);
            $table->index('severity');
        });

        Schema::table('educational_contents', function (Blueprint $table) {
            $table->index('is_published');
            $table->index('type');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::table('cases', function (Blueprint $table) {
            $table->dropIndex(['province']);
            $table->dropIndex(['status']);
            $table->dropIndex(['diagnosis_date']);
            $table->dropIndex(['province', 'status']);
            $table->dropIndex(['disease_id', 'status']);
        });

        Schema::table('alerts', function (Blueprint $table) {
            $table->dropIndex(['is_active', 'expires_at']);
            $table->dropIndex(['severity']);
        });

        Schema::table('educational_contents', function (Blueprint $table) {
            $table->dropIndex(['is_published']);
            $table->dropIndex(['type']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
        });
    }
};
