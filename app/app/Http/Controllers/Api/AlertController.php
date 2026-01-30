<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Services\AlertService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use OpenApi\Annotations as OA;

class AlertController extends Controller
{
    public function __construct(
        private readonly AlertService $alertService
    ) {}

    /**
     * @OA\Get(
     *      path="/alerts",
     *      operationId="getAlerts",
     *      tags={"Alerts"},
     *      summary="List alerts",
     *      description="Get a list of system alerts with filters",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="active", in="query", description="Filter by active status", required=false, @OA\Schema(type="boolean")),
     *      @OA\Parameter(name="severity", in="query", description="Filter by severity", required=false, @OA\Schema(type="string", enum={"low","medium","high","critical"})),
     *      @OA\Parameter(name="disease_id", in="query", description="Filter by disease ID", required=false, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="List of alerts",
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
    | LISTAR ALERTAS (FILTROS)
    |--------------------------------------------------------------------------
    | Retorna uma lista paginada de alertas.
    | Permite filtrar por status (ativo/inativo), gravidade ou doença específica.
    */
    public function index(Request $request): JsonResponse
    {
        // Debugging 403
        \Illuminate\Support\Facades\Log::info("Index hitting");
        
        $alerts = $this->alertService->getFilteredAlerts(
            [
                'active' => $request->has('active') ? $request->boolean('active') : null,
                'severity' => $request->get('severity'),
                'disease_id' => $request->get('disease_id'),
            ],
            (int) $request->get('per_page', 15)
        );

        return response()->json($alerts);
    }

    /*
    |--------------------------------------------------------------------------
    | CRIAR NOVO ALERTA (ADMIN)
    |--------------------------------------------------------------------------
    | Cria um alerta para notificar o público ou profissionais.
    | Exige título, mensagem, gravidade e área afetada.
    */
    public function store(Request $request): JsonResponse
    {
        // 1. Validar dados do alerta
        $validated = $request->validate([
            'disease_id' => ['nullable', 'exists:diseases,id'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'severity' => ['required', 'in:low,medium,high,critical'],
            'affected_area' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        // 2. Persistir alerta
        $alert = $this->alertService->createAlert($validated, $request->user());

        return response()->json([
            'message' => 'Alert created successfully',
            'alert' => $alert,
        ], 201);
    }

    /**
     * @OA\Get(
     *      path="/alerts/{id}",
     *      operationId="getAlert",
     *      tags={"Alerts"},
     *      summary="Get alert details",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="id", in="path", description="Alert ID", required=true, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Alert details",
     *          @OA\JsonContent(
     *              @OA\Property(property="id", type="integer"),
     *              @OA\Property(property="title", type="string"),
     *              @OA\Property(property="message", type="string"),
     *              @OA\Property(property="disease", type="object")
     *          )
     *      ),
     *      @OA\Response(response=404, description="Alert not found")
     * )
     */
    public function show(Alert $alert): JsonResponse
    {
        return response()->json($alert->load(['disease', 'creator:id,name']));
    }

    /**
     * @OA\Put(
     *      path="/alerts/{id}",
     *      operationId="updateAlert",
     *      tags={"Alerts"},
     *      summary="Update alert",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="id", in="path", description="Alert ID", required=true, @OA\Schema(type="integer")),
     *      @OA\RequestBody(
     *          required=true,
     *          @OA\JsonContent(
     *              @OA\Property(property="title", type="string"),
     *              @OA\Property(property="message", type="string"),
     *              @OA\Property(property="severity", type="string", enum={"low","medium","high","critical"})
     *          )
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Alert updated successfully",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Alert updated successfully"),
     *              @OA\Property(property="alert", type="object")
     *          )
     *      ),
     *      @OA\Response(response=404, description="Alert not found")
     * )
     */
    public function update(Request $request, Alert $alert): JsonResponse
    {
        $validated = $request->validate([
            'disease_id' => ['nullable', 'exists:diseases,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'message' => ['sometimes', 'string'],
            'severity' => ['sometimes', 'in:low,medium,high,critical'],
            'affected_area' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $alert = $this->alertService->updateAlert($alert, $validated, $request->user());

        return response()->json([
            'message' => 'Alert updated successfully',
            'alert' => $alert,
        ]);
    }

    /**
     * @OA\Delete(
     *      path="/alerts/{id}",
     *      operationId="deleteAlert",
     *      tags={"Alerts"},
     *      summary="Delete alert",
     *      security={{"bearerAuth":{}}},
     *      @OA\Parameter(name="id", in="path", description="Alert ID", required=true, @OA\Schema(type="integer")),
     *      @OA\Response(
     *          response=200,
     *          description="Alert deleted successfully",
     *          @OA\JsonContent(
     *              @OA\Property(property="message", type="string", example="Alert deleted successfully")
     *          )
     *      ),
     *      @OA\Response(response=404, description="Alert not found")
     * )
     */
    public function destroy(Request $request, Alert $alert): JsonResponse
    {
        $this->alertService->deleteAlert($alert, $request->user());

        return response()->json([
            'message' => 'Alert deleted successfully',
        ]);
    }

    /**
     * @OA\Get(
     *      path="/public/alerts",
     *      operationId="getActiveAlerts",
     *      tags={"Alerts", "Public"},
     *      summary="List active alerts (Public)",
     *      description="Get list of active alerts ordered by severity for public display",
     *      @OA\Response(
     *          response=200,
     *          description="List of active alerts",
     *          @OA\JsonContent(type="array", @OA\Items(type="object"))
     *      )
     * )
     */
    public function active(): JsonResponse
    {
        $alerts = $this->alertService->getActiveAlerts();

        return response()->json($alerts);
    }
}
