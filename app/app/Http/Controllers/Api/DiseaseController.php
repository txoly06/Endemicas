<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Disease;
use App\Services\DiseaseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

class DiseaseController extends Controller
{
    public function __construct(
        private readonly DiseaseService $diseaseService
    ) {}

    /**
     * @OA\Get(
     *      path="/diseases",
     *      operationId="getDiseases",
     *      tags={"Diseases"},
     *      summary="List diseases",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="active", in="query", description="Filter by active status", required=false, @OA\Schema(type="boolean")),
     *      @OA\Parameter(name="search", in="query", description="Search by name or code", required=false, @OA\Schema(type="string")),
     *      @OA\Response(
     *          response=200,
     *          description="List of diseases",
     *          @OA\JsonContent(
     *              @OA\Property(property="data", type="array", @OA\Items(type="object")),
     *              @OA\Property(property="current_page", type="integer"),
     *              @OA\Property(property="total", type="integer")
     *          )
     *      )
     * )
     */
    /*
    |--------------------------------------------------------------------------
    | LISTAR DOENÇAS
    |--------------------------------------------------------------------------
    | Retorna todas as doenças registadas.
    | Usado para preencher 'selects' ou listas de gestão.
    */
    public function index(Request $request): JsonResponse
    {
        $diseases = $this->diseaseService->getFilteredDiseases(
            [
                'active' => $request->has('active') ? $request->boolean('active') : null,
                'search' => $request->get('search'),
            ],
            (int) $request->get('per_page', 15)
        );

        return response()->json($diseases);
    }

    /*
    |--------------------------------------------------------------------------
    | REGISTAR NOVA DOENÇA (ADMIN)
    |--------------------------------------------------------------------------
    | Armazena uma nova doença no sistema.
    | Código deve ser único (ex: 'MAL' para Malária).
    */
    public function store(Request $request): JsonResponse
    {
        // 1. Validar campos
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:diseases'],
            'description' => ['nullable', 'string'],
            'symptoms' => ['nullable', 'string'],
            'prevention' => ['nullable', 'string'],
            'treatment' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        // 2. Criar
        $disease = $this->diseaseService->createDisease($validated, $request->user());

        return response()->json([
            'message' => 'Disease created successfully',
            'disease' => $disease,
        ], 201);
    }

    /**
     * @OA\Get(
     *      path="/diseases/{id}",
     *      operationId="getDisease",
     *      tags={"Diseases"},
     *      summary="Get disease details",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="id", in="path", description="Disease ID", required=true, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Disease details",
     *          @OA\JsonContent(
     *              @OA\Property(property="id", type="integer"),
     *              @OA\Property(property="name", type="string"),
     *              @OA\Property(property="code", type="string"),
     *              @OA\Property(property="description", type="string")
     *          )
     *      ),
     *      @OA\Response(response=404, description="Disease not found")
     * )
     */
    public function show(Disease $disease): JsonResponse
    {
        $disease = $this->diseaseService->getDiseaseWithCases($disease);

        return response()->json($disease);
    }

    /**
     * @OA\Put(
     *      path="/diseases/{id}",
     *      operationId="updateDisease",
     *      tags={"Diseases"},
     *      summary="Update disease",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="id", in="path", description="Disease ID", required=true, @OA\Schema(type="integer")),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              @OA\Property(property="name", type="string"),
     *              @OA\Property(property="code", type="string"),
     *              @OA\Property(property="description", type="string"),
     *              @OA\Property(property="is_active", type="boolean")
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Disease updated successfully",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Disease updated successfully"),
     *              @OA\Property(property="disease", type="object")
     *          )
     *      ),
     *      @OA\Response(response=404, description="Disease not found")
     * )
     */
    public function update(Request $request, Disease $disease): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:50', 'unique:diseases,code,' . $disease->id],
            'description' => ['nullable', 'string'],
            'symptoms' => ['nullable', 'string'],
            'prevention' => ['nullable', 'string'],
            'treatment' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $disease = $this->diseaseService->updateDisease($disease, $validated, $request->user());

        return response()->json([
            'message' => 'Disease updated successfully',
            'disease' => $disease,
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/diseases/{id}",
     *      operationId="deleteDisease",
     *      tags={"Diseases"},
     *      summary="Delete disease",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="id", in="path", description="Disease ID", required=true, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Disease deleted successfully",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Disease deleted successfully")
     *          )
     *      ),
     *      @OA\Response(response=404, description="Disease not found")
     * )
     */
    public function destroy(Request $request, Disease $disease): JsonResponse
    {
        $this->diseaseService->deleteDisease($disease, $request->user());

        return response()->json([
            'message' => 'Disease deleted successfully',
        ]);
    }
}
