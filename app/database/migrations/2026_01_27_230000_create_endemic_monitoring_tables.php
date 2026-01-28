<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add role to users table
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'health_professional', 'public'])->default('public')->after('email');
            $table->string('phone')->nullable()->after('role');
            $table->string('institution')->nullable()->after('phone');
        });

        // Diseases table
        Schema::create('diseases', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique(); // ICD code
            $table->text('description')->nullable();
            $table->text('symptoms')->nullable();
            $table->text('prevention')->nullable();
            $table->text('treatment')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Cases table
        Schema::create('cases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('disease_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // registered by
            $table->string('patient_code')->unique(); // generated unique code
            $table->string('patient_name');
            $table->date('patient_dob');
            $table->string('patient_id_number')->nullable(); // BI - will be masked
            $table->enum('patient_gender', ['M', 'F', 'O']);
            $table->text('symptoms_reported');
            $table->date('symptom_onset_date');
            $table->date('diagnosis_date');
            $table->enum('status', ['suspected', 'confirmed', 'recovered', 'deceased'])->default('suspected');
            $table->string('province');
            $table->string('municipality');
            $table->string('commune')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Alerts table
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('disease_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title');
            $table->text('message');
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->string('affected_area')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Educational content table
        Schema::create('educational_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('disease_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content');
            $table->enum('type', ['article', 'faq', 'guide', 'video'])->default('article');
            $table->string('image_url')->nullable();
            $table->boolean('is_published')->default(false);
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // Case history for tracking status changes
        Schema::create('case_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('case_id')->constrained('cases')->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('previous_status')->nullable();
            $table->string('new_status');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('case_histories');
        Schema::dropIfExists('educational_contents');
        Schema::dropIfExists('alerts');
        Schema::dropIfExists('cases');
        Schema::dropIfExists('diseases');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'institution']);
        });
    }
};
