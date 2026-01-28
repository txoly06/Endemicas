<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DiseaseCase;
use App\Services\CaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CaseController extends Controller
{
    public function __construct(
        private readonly CaseService $caseService
    ) {}

    /**
     * @OA\Get(
     *      path="/cases",
     *      operationId="getCases",
     *      tags={"Cases"},
     *      summary="List cases",
     *      description="Get a list of disease cases with filters",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="disease_id", in="query", description="Filter by disease ID", required=false, @OA\Schema(type="integer")),
     *      @OA\Parameter(name="province", in="query", description="Filter by province", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="status", in="query", description="Filter by status", required=false, @OA\Schema(type="string", enum={"suspected","confirmed","recovered","deceased"})),
     *      @OA\Parameter(name="start_date", in="query", description="Filter by diagnosis date start (YYYY-MM-DD)", required=false, @OA\Schema(type="string", format="date")),
     *      @OA\Parameter(name="end_date", in="query", description="Filter by diagnosis date end (YYYY-MM-DD)", required=false, @OA\Schema(type="string", format="date")),
     *      @OA\Parameter(name="search", in="query", description="Search by patient name or code", required=false, @OA\Schema(type="string")),
     *      @OA\Parameter(name="page", in="query", description="Page number", required=false, @OA\Schema(type="integer")),
     *      @OA\Parameter(name="per_page", in="query", description="Items per page", required=false, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="List of cases",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *              @OA\Property(property="current_page", type="integer"),
     *              @OA\Property(property="total", type="integer")
     *          )
     *      )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $cases = $this->caseService->getFilteredCases(
            $request->only(['disease_id', 'province', 'status', 'start_date', 'end_date', 'search']),
            (int) $request->get('per_page', 15)
        );

        return response()->json($cases);
    }

    /**
     * @OA\Post(
     *      path="/cases",
     *      operationId="createCase",
     *      tags={"Cases"},
     *      summary="Create new case",
     *      description="Register a new disease case",
     *      security={{"bearerAuth":{}}},
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              required={"disease_id","patient_name","patient_dob","patient_gender","symptoms_reported","symptom_onset_date","diagnosis_date","province","municipality"},
     *              @OA\Property(property="disease_id", type="integer", example=1),
     *              @OA\Property(property="patient_name", type="string", example="Jane Doe"),
     *              @OA\Property(property="patient_dob", type="string", format="date", example="1990-01-01"),
     *              @OA\Property(property="patient_id_number", type="string", example="001234567LA001"),
     *              @OA\Property(property="patient_gender", type="string", enum={"M","F","O"}, example="F"),
     *              @OA\Property(property="symptoms_reported", type="string", example="Fever, cough"),
     *              @OA\Property(property="symptom_onset_date", type="string", format="date", example="2026-01-20"),
     *              @OA\Property(property="diagnosis_date", type="string", format="date", example="2026-01-25"),
     *              @OA\Property(property="status", type="string", enum={"suspected","confirmed","recovered","deceased"}, example="suspected"),
     *              @OA\Property(property="province", type="string", example="Luanda"),
     *              @OA\Property(property="municipality", type="string", example="Viana"),
     *              @OA\Property(property="commune", type="string", example="Zango"),
     *              @OA\Property(property="latitude", type="number", format="float", example=-8.8383),
     *              @OA\Property(property="longitude", type="number", format="float", example=13.2344),
     *              @OA\Property(property="notes", type="string", example="Patient recently traveled")
     *          )
     *      ),
     *      @OA\Response(
     *          response=201,
     *          description="Case registered successfully",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Case registered successfully"),
     *              @OA\Property(property="case", type="object")
     *          )
     *      ),
     *      @OA\Response(response=422, description="Validation error")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'disease_id' => ['required', 'exists:diseases,id'],
            'patient_name' => ['required', 'string', 'max:255'],
            'patient_dob' => ['required', 'date'],
            'patient_id_number' => ['nullable', 'string', 'max:50'],
            'patient_gender' => ['required', 'in:M,F,O'],
            'symptoms_reported' => ['required', 'string'],
            'symptom_onset_date' => ['required', 'date'],
            'diagnosis_date' => ['required', 'date'],
            'status' => ['sometimes', 'in:suspected,confirmed,recovered,deceased'],
            'province' => ['required', 'string', 'max:100'],
            'municipality' => ['required', 'string', 'max:100'],
            'commune' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'notes' => ['nullable', 'string'],
        ]);

        $case = $this->caseService->createCase($validated, $request->user());

        return response()->json([
            'message' => 'Case registered successfully',
            'case' => $case,
        ], 201);
    }

    /**
     * @OA\Get(
     *      path="/cases/{id}",
     *      operationId="getCase",
     *      tags={"Cases"},
     *      summary="Get case details",
     *      description="Get comprehensive details of a specific case",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="id", in="path", description="Case ID", required=true, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Case details",
     *          @OA\JsonContent(
     *              @OA\Property(property="id", type="integer"),
     *              @OA\Property(property="patient_code", type="string"),
     *              @OA\Property(property="masked_id_number", type="string"),
     *              @OA\Property(property="qr_data", type="string"),
     *              @OA\Property(property="histories", type="array", @OA\Items(type="object"))
     *          )
     *      ),
     *      @OA\Response(response=404, description="Case not found")
     * )
     */
    public function show(DiseaseCase $case): JsonResponse
    {
        $caseData = $this->caseService->getCaseWithDetails($case);

        return response()->json($caseData);
    }

    /**
     * @OA\Put(
     *      path="/cases/{id}",
     *      operationId="updateCase",
     *      tags={"Cases"},
     *      summary="Update case",
     *      description="Update an existing case",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="id", in="path", description="Case ID", required=true, @OA\Schema(type="integer")),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              @OA\Property(property="status", type="string", enum={"suspected","confirmed","recovered","deceased"}),
     *              @OA\Property(property="status_notes", type="string"),
     *              @OA\Property(property="patient_name", type="string"),
     *              @OA\Property(property="province", type="string")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Case updated successfully",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Case updated successfully"),
     *              @OA\Property(property="case", type="object")
     *          )
     *      ),
     *      @OA\Response(response=404, description="Case not found"),
     *      @OA\Response(response=422, description="Validation error")
     * )
     */
    public function update(Request $request, DiseaseCase $case): JsonResponse
    {
        $validated = $request->validate([
            'disease_id' => ['sometimes', 'exists:diseases,id'],
            'patient_name' => ['sometimes', 'string', 'max:255'],
            'patient_dob' => ['sometimes', 'date'],
            'patient_id_number' => ['nullable', 'string', 'max:50'],
            'patient_gender' => ['sometimes', 'in:M,F,O'],
            'symptoms_reported' => ['sometimes', 'string'],
            'symptom_onset_date' => ['sometimes', 'date'],
            'diagnosis_date' => ['sometimes', 'date'],
            'status' => ['sometimes', 'in:suspected,confirmed,recovered,deceased'],
            'province' => ['sometimes', 'string', 'max:100'],
            'municipality' => ['sometimes', 'string', 'max:100'],
            'commune' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'notes' => ['nullable', 'string'],
            'status_notes' => ['nullable', 'string'],
        ]);

        $case = $this->caseService->updateCase($case, $validated, $request->user());

        return response()->json([
            'message' => 'Case updated successfully',
            'case' => $case,
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/cases/{id}",
     *      operationId="deleteCase",
     *      tags={"Cases"},
     *      summary="Delete case",
     *      description="Soft delete a case",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="id", in="path", description="Case ID", required=true, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Case deleted successfully",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Case deleted successfully")
     *          )
     *      ),
     *      @OA\Response(response=404, description="Case not found")
     * )
     */
    public function destroy(Request $request, DiseaseCase $case): JsonResponse
    {
        $this->caseService->deleteCase($case, $request->user());

        return response()->json([
            'message' => 'Case deleted successfully',
        ]);
    }

    /**
     * @OA\Get(
     *      path="/cases/{id}/history",
     *      operationId="getCaseHistory",
     *      tags={"Cases"},
     *      summary="Get case history",
     *      description="Get status change history of a case",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="id", in="path", description="Case ID", required=true, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Case history",
     *          @OA\JsonContent(type="array", @OA\Items(type="object"))
     *      ),
     *      @OA\Response(response=404, description="Case not found")
     * )
     */
    public function history(DiseaseCase $case): JsonResponse
    {
        $histories = $case->histories()->with('user:id,name')->latest()->get();

        return response()->json($histories);
    }
}
